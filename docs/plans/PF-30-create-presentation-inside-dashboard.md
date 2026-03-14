# PF-30 Create Presentation Inside Dashboard

## Brief feature understanding

PF-30 introduces an end-to-end authoring flow starting from the dashboard:

- User clicks `Create presentation` in dashboard.
- App creates a new presentation with default title `Untitled presentation`.
- User is redirected to that presentation editor route immediately.
- User pastes markdown as the source of truth for content.
- User explicitly saves markdown changes.
- User can rename the presentation from `Untitled presentation`.

This should reuse existing Convex + Clerk + workspace permission patterns, keep route authorization intact, and add robust loading/error/a11y/test coverage.

## Current-state findings

### Dashboard entry points

- `src/app/(app)/dashboard/page.tsx`
  - Protected by Clerk server auth (`auth()` + `redirect('/sign-in')`).
  - Renders `PresentationLibrary` as the main workspace entry point.
- `src/features/presentations/components/presentation-library.tsx`
  - Already has create/list/share controls.
  - Creation currently requires typing a title first (input + create button).
  - Create mutation does **not** redirect to created presentation route.

### Presentation creation flow

- `convex/presentations/mutations.ts` -> `createPresentation`
  - Accepts required `title` and optional `markdownContent`.
  - Applies write-permission check (`assertWorkspaceWriteAccess`).
  - Defaults markdown to `# New presentation`.
  - Returns `{ presentationId, workspaceId }` (already suitable for redirect).

### Presentation editing/saving flow

- `convex/presentations/mutations.ts` -> `updatePresentationMarkdown`
  - Updates markdown and optionally title in one mutation.
  - Requires write permissions.
- Current UI does **not** expose edit/save workflow.
- `src/app/(app)/presentation/[presentationId]/page.tsx` renders `PresentationRouteView`.
  - `src/features/presentations/components/presentation-route-view.tsx` only shows read-only snapshot states.
  - `src/features/presentations/components/presentation-snapshot.tsx` is read-only rendering.

### Markdown input / source of truth

- Persistent canonical content already exists as `presentations.markdownContent` in `convex/schema.ts`.
- No current editor UI for markdown input.
- Existing static demo slides now live in `src/features/presentations/model/slides.ts`, rendered by `PresentationSlides`, and are not wired to persisted presentation markdown.

### Rename/title updates

- Title exists in schema as `presentations.title`.
- Title can currently be changed only as optional side-effect inside `updatePresentationMarkdown`; no dedicated rename UX.

### Related auth/permissions/provisioning patterns

- `convex/lib/provisioning.ts`: user/workspace provisioning and workspace resolution are already standardized.
- `convex/lib/permissions.ts`: read vs write checks centralized (`assertWorkspaceReadAccess`, `assertWorkspaceWriteAccess`).
- Existing tests validate cross-workspace authorization for queries/mutations.

## Proposed architecture/data flow

### End-to-end UX flow

1. User opens dashboard (`/dashboard`) and sees presentation library card.
2. User clicks `Create presentation`.
3. Frontend triggers `createPresentation` mutation **without requiring title input**.
4. Backend creates presentation with:
   - `title = "Untitled presentation"` (default if not provided),
   - `markdownContent` default starter content,
   - owner workspace linkage and timestamps.
5. Frontend redirects immediately to `/presentation/{presentationId}`.
6. Route loads presentation access via authorized query (`getPresentationRouteAccess`).
7. If `canWrite=true`, render editable authoring view:
   - title input (rename),
   - markdown textarea (paste/edit),
   - `Save` action (explicit persist),
   - feedback states (saving/success/error/unsaved changes).
8. Save action calls mutation to persist markdown and title.
9. List query reactivity updates dashboard library title + updated timestamp automatically.
10. If read-only user (`canWrite=false`), keep snapshot-style read view and disabled editing controls or plain read-only screen.

### Data flow and state model

- **Source of truth**: `presentations.markdownContent` and `presentations.title` in Convex.
- **Client editing state**:
  - `draftTitle`, `draftMarkdown`
  - `lastSavedTitle`, `lastSavedMarkdown`
  - `isDirty = draft !== saved`
  - `isSaving`, `saveError`, `saveSuccessMessage`
- **Save**:
  - manual button-triggered mutation
  - success updates `lastSaved*` + clears dirty state
  - failure keeps draft unchanged and shows accessible error
- **Route access contract** remains union-like status:
  - `unauthenticated`, `forbidden`, `not_found`, `authorized`.
  - In `authorized`, use `canWrite` to branch editor vs snapshot UX.

### Reference strategy (existing analogues)

- **High confidence**
  - Dashboard auth/page shell: `src/app/(app)/dashboard/page.tsx`
  - Workspace permission checks: `convex/lib/permissions.ts`
  - Provisioning entrypoint: `convex/lib/provisioning.ts`
  - Mutation loading/error handling pattern: `presentation-library.tsx`
- **Medium confidence**
  - Route-level authorized union handling: `presentation-route-view.tsx` (extend with editable branch)
  - Snapshot rendering: `presentation-snapshot.tsx` (reuse for read-only path)
- **Low confidence / novel**
  - In-route markdown editor UX (new capability in this codebase)
  - Unsaved/saved affordances and rename editing interaction

## File-by-file implementation plan

### 1) Convex schema

[MODIFY] `convex/schema.ts` (only if needed after validation)
Purpose: Confirm existing fields support PF-30; no structural change expected.
Pattern source: Existing `presentations` table design.
Confidence: High.
Key details:

- Keep current schema unless product adds extra requirements (e.g., `lastEditedByUserId`, title length constraints in schema-level strategy).
- No migration expected for baseline PF-30.

### 2) Convex operations (mutations/queries)

[MODIFY] `convex/presentations/mutations.ts`
Purpose: Support untitled creation, explicit save, and rename semantics.
Pattern source: Existing `createPresentation`, `updatePresentationMarkdown`, permission helpers.
Confidence: High.
Key details:

- Update `createPresentation` args to allow omitted `title`; default to `Untitled presentation` after trim.
- Validate title on write (non-empty after trim; reject whitespace-only rename).
- Keep workspace owner write guard (`assertWorkspaceWriteAccess`).
- Prefer splitting responsibilities:
  - `savePresentationContent` (or keep `updatePresentationMarkdown`) for markdown save (+ optional title if desired),
  - `renamePresentation` mutation dedicated to title updates.
- Ensure `updatedAt` always changes on successful save/rename.
- Return minimal payload for UI (`presentationId`, `updatedAt`, `title`).

[MODIFY] `convex/presentations/queries.ts`
Purpose: Ensure editor route receives everything needed with existing auth states.
Pattern source: `getPresentationRouteAccess`.
Confidence: High.
Key details:

- Reuse current `getPresentationRouteAccess` for editor route.
- Keep status union as canonical gate.
- Ensure returned `presentation` includes current title + markdown content for editor hydration.

### 3) Backend helpers

[MODIFY] `convex/lib/permissions.ts` (optional)
Purpose: Reuse centralized error messages for new rename/save failure paths.
Pattern source: `AUTHORIZATION_ERROR_MESSAGES`.
Confidence: Medium.
Key details:

- If needed, add specific validation constants/messages (not required for authorization logic itself).
- Keep `owner`-only write policy unchanged unless product says members can edit.

### 4) Pages and routes

[MODIFY] `src/app/(app)/presentation/[presentationId]/page.tsx`
Purpose: Keep route auth contract while delegating to upgraded feature view.
Pattern source: Existing page auth handling + `PresentationRouteView`.
Confidence: High.
Key details:

- Preserve current sign-in guidance for unauthenticated access.
- Keep E2E compatibility flags only if still required by tests; otherwise remove technical test-only branch in follow-up cleanup.

[MODIFY] `src/app/(app)/presentation/page.tsx`
Purpose: Preserve redirect behavior (`/presentation` -> `/dashboard`) unless product wants quick-create direct route.
Pattern source: Existing redirect-only page.
Confidence: High.
Key details:

- Optional enhancement (out of PF-30 baseline): convert this route to create-and-redirect endpoint for future quick-create; keep out-of-scope unless requested.

### 5) Feature components

[MODIFY] `src/features/presentations/components/presentation-library.tsx`
Purpose: Dashboard create entrypoint should create untitled presentation and redirect.
Pattern source: Existing create/list/share interactions and loading/error pattern.
Confidence: High.
Key details:

- Replace title-required create form with one-click `Create presentation` CTA (or keep optional advanced input but default path one-click).
- On successful create mutation, route to `/presentation/${presentationId}` using `useRouter`.
- Add in-button loading text and disable repeated clicks while creating.
- Keep read-only behavior:
  - if `!canWrite`, disable create action and show helper text.
- Keep existing presentation list + open/share actions unchanged.

[MODIFY] `src/features/presentations/components/presentation-route-view.tsx`
Purpose: Route-level branching to editor for writers, snapshot for read-only.
Pattern source: Existing status-based branches + snapshot fallback.
Confidence: Medium.
Key details:

- Continue handling `undefined`, `unauthenticated`, `forbidden`, `not_found`.
- For `authorized`:
  - `canWrite=true`: render new editor component.
  - `canWrite=false`: render existing `PresentationSnapshot`.
- Use exhaustive switch on status union to align TS rule.

[CREATE] `src/features/presentations/components/presentation-editor.tsx`
Purpose: New markdown authoring UI for paste/save/rename.
Pattern source: Form and mutation state patterns from `presentation-library.tsx`; snapshot layout from `presentation-snapshot.tsx`.
Confidence: Medium (new capability).
Key details:

- Inputs:
  - Title text input (`aria-label`, validation message, rename semantics).
  - Markdown textarea (source of truth editor).
- Actions:
  - `Save` button persists markdown/title.
  - optional `Reset`/`Discard changes` to last saved values (if product accepts).
- States:
  - loading/hydration from route query payload
  - dirty indicator (`Unsaved changes`)
  - saving indicator (`Saving...`)
  - success message (`Saved`)
  - error alert with `role="alert"` + `aria-live="assertive"`.
- Accessibility:
  - semantic labels + described-by links for errors.
  - keyboard-operable controls.
  - no clickable div controls.
  - `aria-busy` during save.
- Validation:
  - block empty title save/rename.
  - allow empty markdown only if product permits (likely yes).

### 6) Shared components

[CREATE] `src/components/ui/textarea.tsx` (optional but recommended)
Purpose: Reusable textarea primitive consistent with existing `Button/Card` patterns.
Pattern source: existing UI primitive style (`button.tsx`, `card.tsx`).
Confidence: Medium.
Key details:

- Classname merge via `cn`.
- Forward ref support for usability/accessibility.
- Use in editor markdown field.

### 7) Hooks, types, config

[MODIFY] `src/config/routes.ts`
Purpose: Centralize route helpers for dashboard/presentation navigation.
Pattern source: existing route constants.
Confidence: Medium.
Key details:

- Add `dashboard` and helper for `presentationById` route generation (string builder or documented usage pattern).
- Adopt incrementally in modified files.

[CREATE] `src/features/presentations/types/presentation-editor.ts` (optional)
Purpose: Keep editor prop/state typing explicit and reusable.
Pattern source: strict typing conventions.
Confidence: Medium.
Key details:

- define editor payload shape from query result to avoid `any`.

### 8) Styles

[MODIFY] `src/features/presentations/components/presentation-editor.tsx` (inline utility classes only)
Purpose: Layout and responsive editor styles.
Pattern source: current Tailwind usage in dashboard/snapshot.
Confidence: High.
Key details:

- two-column layout optional (editor + preview) can be deferred.
- baseline single-column form + markdown area is sufficient for PF-30.

### 9) Tests

[MODIFY] `src/tests/integration/presentation-mutations-authorization.test.ts`
Purpose: Cover new mutation semantics around save/rename permissions.
Pattern source: existing mocked mutation context style.
Confidence: High.
Key details:

- unauthorized cross-workspace rename/save denied.
- whitespace-only rename rejected.
- successful save updates fields and timestamp.

[MODIFY] `src/tests/integration/presentation-authorization.test.ts`
Purpose: Verify route access payload still supports editor branch and read-only branch.
Pattern source: existing query tests.
Confidence: High.
Key details:

- assert `authorized` response includes required editor data.
- keep forbidden/not-found/public-share assertions green.

[MODIFY] `src/tests/e2e/smoke.spec.ts` (or split into `presentation-authoring.spec.ts`)
Purpose: Add PF-30 e2e flow and key failure cases.
Pattern source: current Playwright smoke style.
Confidence: Medium.
Key details:

- happy path: create untitled -> redirect -> paste markdown -> save -> rename -> verify persisted on reload.
- failures: save denied in read-only workspace; empty title rename validation; save mutation error messaging.
- keep existing auth/share route smoke checks.

## UI states, edge cases, and accessibility planning

### Required UI states

- Dashboard create button:
  - idle, creating, create-error, disabled for read-only.
- Editor:
  - initial loading (query undefined),
  - not found/forbidden/unauthenticated states,
  - editable ready state,
  - dirty-unsaved state,
  - saving state,
  - save success confirmation,
  - save error with retry path.

### Edge cases

- Double-click create causing duplicate presentations -> disable while mutation pending.
- Blank/whitespace-only title on rename -> inline validation + backend rejection.
- Backend unavailable (`NEXT_PUBLIC_CONVEX_URL` missing) -> retain existing graceful fallback card.
- Read-only member opens presentation route -> allowed to view snapshot, cannot edit/save/rename.
- Stale editor data after external update -> baseline: Convex query refresh updates source; if dirty local edits exist, avoid clobbering draft without user decision.
- Navigation away with unsaved changes -> optional beforeunload warning (question for product).

### Accessibility

- Use semantic form controls (`label` + `input`/`textarea`), not clickable containers.
- Error text uses `role="alert"` and `aria-live="assertive"`.
- Save area announces status with `aria-live="polite"`.
- Buttons include descriptive text/labels (especially icon-only controls).
- Maintain keyboard-only usability for all actions.

## Convex auth/permissions/validation/error handling plan

- Continue using:
  - `ensureUserAndDefaultWorkspace()` in mutations,
  - `resolveCurrentUserWorkspaceOrThrow()` for workspace-scoped queries,
  - `assertWorkspaceWriteAccess()` for create/save/rename.
- Validation rules in mutations:
  - title required after trim (except create default fallback to untitled when omitted),
  - optional markdown allowed (or require non-empty only if product requests).
- Error handling:
  - mutations throw `Error` with user-safe messages,
  - client catches and renders accessible error,
  - query not-found remains `null`/status-based (no exception for not found path).

## Test plan

### Unit/integration targets

- `convex/presentations/mutations.ts`
  - create without title defaults to `Untitled presentation`.
  - rename rejects empty/whitespace titles.
  - save updates markdown and updatedAt.
  - non-owner/member denied write operations.
- `convex/presentations/queries.ts`
  - authorized status includes presentation payload,
  - forbidden/not_found/unauthenticated branch integrity,
  - public share remains unaffected.
- Component integration targets (React Testing Library) for editor:
  - shows initial values,
  - dirty state appears after edits,
  - save success/error feedback,
  - controls disabled during save.

### E2E scenarios

- Happy path:
  - signed-in owner from dashboard clicks create,
  - lands on `/presentation/{id}`,
  - sees `Untitled presentation`,
  - pastes markdown,
  - saves successfully,
  - renames title,
  - reload persists both title and markdown.
- Key failures:
  - read-only user cannot create from dashboard.
  - read-only user on presentation route sees non-editable view and no save capability.
  - invalid rename (blank title) shows validation.
  - mutation failure surfaces inline error and does not lose draft.
  - signed-out access still follows existing login-required behavior.

## Risks + open questions

### Risks

- **Route behavior drift**: converting route from snapshot-only to edit-capable may break existing assumptions/tests.
- **State sync complexity**: live Convex updates vs local unsaved draft can cause accidental overwrite if not guarded.
- **Permission UX ambiguity**: read-only behavior on `/presentation/[id]` needs explicit product stance (read-only snapshot vs blocked).
- **E2E stability**: current tests include hard-coded e2e query flags; introducing editor may require resilient selectors and fixtures.

### Open questions (product clarification needed)

1. Should `Create presentation` immediately create without any modal/input (assumed yes), or should title prompt still be optional? Create immediately without any modal/input.
2. Default starter markdown content:
   - blank string,
   - `# Untitled presentation`,
   - richer template? Blank string.
3. Should save be manual-only (this plan) or include autosave/debounce? Include autosave/debounce.
4. Rename UX:
   - inline title input always visible,
   - explicit “Rename” mode/button,
   - save title separately or together with markdown? Inline title input always visible.
5. For read-only members on `/presentation/[id]`, should they:
   - see snapshot read-only (assumed), or
   - get explicit forbidden message? See snapshot read-only.
6. Should we warn before leaving page with unsaved changes? Yes, warn before leaving page with unsaved changes.
7. Any title/markdown max-length constraints required by product/legal? No.

## Step-by-step execution order

1. Confirm product decisions from open questions (especially default markdown and save mode).
2. Update Convex mutation contracts (`create` default untitled, rename/save semantics, validation).
3. Add/adjust integration tests for mutation/query behavior.
4. Update dashboard library create CTA to one-click create + redirect.
5. Implement editor component and plug into `presentation-route-view` authorized writer branch.
6. Preserve read-only snapshot branch for non-writers and existing unauth/forbidden/not-found states.
7. Add UI-level tests and e2e happy/failure scenarios.
8. Run `yarn check:all` and `yarn test:e2e` (or targeted subset) and resolve regressions.
9. Final UX/accessibility pass (keyboard nav, aria-live, error semantics).

## Implementation checklist

- [x] Product clarifications resolved for default markdown, save mode, and read-only route behavior.
- [x] `createPresentation` supports untitled default and returns redirect-ready payload.
- [x] Rename/save mutation behavior and validation finalized (owner-only write preserved).
- [x] Dashboard create button is one-click and redirects to `/presentation/[presentationId]`.
- [x] Editor UI supports paste markdown, explicit save, rename title, and accessible status/error messaging.
- [x] Authorized route uses `canWrite` to branch editor vs read-only snapshot.
- [x] Loading/empty/error/success UI states implemented and verified.
- [x] Integration tests cover create/save/rename permissions + validation.
- [ ] E2E covers happy path and key failure scenarios.
- [ ] Full checks pass (`lint`, `typecheck`, `test`, relevant e2e).

Blocker note: Playwright Chromium crashes with `SIGSEGV` in this environment before tests execute, so e2e verification is incomplete even though lint/typecheck/build/unit+integration checks pass.

## Rollout notes and fallback options

### Rollout

- Ship as one scoped feature branch; avoid unrelated refactors.
- Keep backend changes backward-compatible where possible (e.g., optional title arg on create).
- If editor introduces instability, keep route with feature-flag style fallback to snapshot-only while backend create/rename/save APIs ship first.

### Fallback options

- **Fallback A (minimal):** Ship dashboard one-click untitled creation + redirect first, keep existing snapshot route.
- **Fallback B (backend-first):** Ship mutation contract changes and tests first; enable editor UI in second PR.
- **Fallback C (title flow):** If dedicated rename mutation is deferred, temporarily reuse `updatePresentationMarkdown` with explicit client behavior, then split later.
