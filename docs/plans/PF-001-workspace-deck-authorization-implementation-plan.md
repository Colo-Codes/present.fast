# Implement Authorization Rules for Workspace and Deck Access (PF-001)

## Objective

Implement complete, explicit, and test-covered authorization rules for workspace and deck access across backend APIs and frontend routes.

## Current State (Audit Summary)

### Already Implemented

- Authentication guard exists in Convex (`requireAuth` in `convex/auth.ts`).
- Workspace membership checks exist in backend helpers (`convex/lib/permissions.ts`).
- Presentation queries/mutations already check membership in several flows:
  - `convex/presentations/queries.ts`
  - `convex/presentations/mutations.ts`
- Workspace query is membership-protected:
  - `convex/workspaces/queries.ts`
- Signed-in route protection exists for app routes (proxy/page-level guards).

### Missing or Incomplete

- Deck route authorization is not fully resource-based end-to-end (current presentation page is not a concrete deck-by-id authorized view).
- Public share route is not fully connected to token-backed authorization logic at render time.
- Role model (`owner`, `member`) exists in membership data but is not explicitly applied to read/write policy decisions.
- Tests do not currently prove cross-workspace denial, role write restrictions, or share-token gating behavior.

## Desired Authorization Model

Define and enforce these rules consistently:

1. User must be authenticated for protected workspace/deck routes and mutations.
2. User must be a member of a workspace to read its decks.
3. Write behavior must follow a defined role policy (`owner` only, or `owner` + `member`).
4. Public deck access must only work through valid enabled share tokens.
5. Unauthorized access should follow a single product decision (`404` hide existence or `403` explicit denial).

## Implementation Plan

## Phase 1: Codify Permission Helpers

### Files

- `convex/lib/permissions.ts`

### Changes

- Add explicit helper functions:
  - `assertWorkspaceReadAccess(...)`
  - `assertWorkspaceWriteAccess(...)`
- Optionally keep `assertWorkspaceMembership(...)` as a compatibility wrapper and migrate call sites gradually.
- Ensure helpers return enough membership context (including role) for downstream checks without duplicate queries.

### Outcome

Single source of truth for read/write authorization semantics.

## Phase 2: Enforce Rules in Convex Queries/Mutations

### Files

- `convex/presentations/queries.ts`
- `convex/presentations/mutations.ts`
- `convex/workspaces/queries.ts`

### Changes

- Replace generic membership checks with explicit read/write helpers.
- Ensure all deck read endpoints require workspace read access.
- Ensure all deck write endpoints require workspace write access based on chosen role policy.
- Keep public share query intentionally public, but strictly validate token + enabled flag.

### Outcome

All backend data access for workspace/deck resources is governed by a consistent policy.

## Phase 3: Make Deck Route Resource-Based and Authorized

### Files

- `src/app/presentation/page.tsx` (refactor or replace)
- `src/app/presentation/[presentationId]/page.tsx` (preferred new route)

### Changes

- Move to a deck-specific route keyed by `presentationId`.
- Load deck data via authorized backend query (`getPresentationById` path).
- Render allowed deck content only when authorized.
- For unauthorized or missing deck, return behavior matching product choice (`404` or `403`).

### Outcome

Frontend route access aligns with backend authorization for specific decks.

## Phase 4: Enforce Public Share Token Access in UI Route

### Files

- `src/app/share/[token]/page.tsx`

### Changes

- Resolve token server-side/client-side through `getPublicPresentationByShareToken`.
- Render deck only when:
  - token matches
  - sharing is enabled
  - deck exists
- Return not found when token is invalid or disabled.

### Outcome

Share links behave as explicit public authorization gates.

## Phase 5: UI Wiring and Permission-Aware UX

### Files

- `src/features/presentations/components/presentation-library.tsx`

### Changes

- Ensure list/open/edit/share actions route to authorized endpoints and routes.
- Surface authorization failures with user-friendly errors.
- Hide or disable controls if role policy disallows actions.

### Outcome

UI behavior consistently reflects effective permissions.

## Phase 6: Validation and Test Coverage

### Backend Tests

- Permission helper tests:
  - member read allowed
  - non-member read denied
  - write policy cases (owner/member based on decision)
- Integration tests:
  - cross-workspace read denied
  - cross-workspace write denied
  - public token disabled => denied
  - public token enabled + valid => allowed

### E2E Tests

- Signed-out user blocked from protected deck route.
- Signed-in user blocked from accessing deck outside workspace.
- Valid share token renders deck.
- Invalid/disabled token returns not found.

### Outcome

Authorization behavior is verified at helper, API, and route levels.

## Rollout Notes

- Prefer introducing new helpers first, then migrating call sites in one scoped change set.
- Keep error messages generic to avoid leaking resource existence when using `404` strategy.
- Run project checks after implementation:
  - lint/typecheck/test commands used in repo preflight.

## Questions Requiring Product/Engineering Decision

1. Should deck write access be restricted to `owner` only, or allowed for all `member`s? Restricted to `owner` only.
2. Should canonical deck URL be `presentation/[presentationId]`? Yes, `presentation/[presentationId]`.
3. For unauthorized deck access, should UX return `404` (hide existence) or `403` (explicit denial)? Present a login prompt to the user and a message saying that they are not authorized to access this deck.
4. Should shared decks show live deck updates or a snapshot-like view? Show a snapshot-like view.
5. Is hardening `upsertUserFromClerk` in `convex/users/mutations.ts` included in this scope or out of scope? In scope.

## Implementation Checklist (Execution Ready)

### Policy and Permissions

- [x] Update `convex/lib/permissions.ts` with explicit helpers:
  - [x] Add `assertWorkspaceReadAccess(...)` for `owner` and `member`.
  - [x] Add `assertWorkspaceWriteAccess(...)` for `owner` only.
  - [x] Keep or replace `assertWorkspaceMembership(...)` and migrate all call sites.
- [x] Standardize authorization errors so responses are consistent and non-leaky.

### Backend Authorization Enforcement

- [x] Update `convex/presentations/queries.ts`:
  - [x] Enforce read access in list/get deck queries.
  - [x] Confirm deck-by-id query always checks deck workspace membership.
- [x] Update `convex/presentations/mutations.ts`:
  - [x] Enforce owner-only write access for create/edit/share mutations.
  - [x] Ensure non-owner members are denied with clear error messaging.
- [x] Update `convex/workspaces/queries.ts` to use explicit read helper.
- [x] Harden `convex/users/mutations.ts` (`upsertUserFromClerk`):
  - [x] Restrict callable surface to trusted/internal flow.
  - [x] Ensure identity consistency checks prevent arbitrary upsert.

### Route and UI Authorization

- [x] Create canonical deck route `src/app/presentation/[presentationId]/page.tsx`.
- [x] Migrate or retire `src/app/presentation/page.tsx` so deck access is always resource-based.
- [x] In deck route:
  - [x] Fetch deck through authorized backend query.
  - [x] If user is not authenticated, show login prompt.
  - [x] If authenticated but unauthorized, show explicit "not authorized to access this deck" message.
- [x] Update navigation and links to use `/presentation/[presentationId]`.

### Public Share Snapshot Behavior

- [x] Update `src/app/share/[token]/page.tsx`:
  - [x] Validate token with `getPublicPresentationByShareToken`.
  - [x] Return not-found state for invalid/disabled tokens.
  - [x] Render share view as snapshot-style content (no live-edit/update behavior).
- [x] Ensure snapshot data is stable and not unintentionally coupled to live editing UI controls.

### Presentation Library UX

- [x] Update `src/features/presentations/components/presentation-library.tsx`:
  - [x] Wire open action to `/presentation/[presentationId]`.
  - [x] Gate edit/share actions for non-owner users.
  - [x] Show permission-aware error feedback for denied actions.

### Testing

- [x] Add/extend permission helper tests:
  - [x] owner read/write allowed.
  - [x] member read allowed, write denied.
  - [x] non-member read/write denied.
- [x] Add Convex integration tests:
  - [x] Cross-workspace deck read denied.
  - [x] Cross-workspace deck write denied.
  - [x] Share token disabled => denied.
  - [x] Share token enabled + valid => snapshot payload returned.
- [ ] Add/extend E2E tests:
  - [x] Signed-out user sees login prompt on protected deck route.
  - [x] Signed-in unauthorized user sees explicit unauthorized message.
  - [x] Valid share token renders snapshot view.
  - [x] Invalid/disabled share token returns not-found experience.

### Validation and Release

- [x] Run lint/typecheck/tests and resolve regressions.
- [ ] Manually verify owner/member scenarios with two test accounts.
- [ ] Confirm no regression in existing workspace provisioning and presentation creation flows.
- [x] Document final behavior in docs if route or permission semantics changed.

## Definition of Done

- Authorization helper policy is explicit and centralized.
- Every workspace/deck read/write path enforces the intended policy.
- Deck and share routes are backed by real authorization checks.
- Tests prove authorized and unauthorized paths, including cross-workspace denial.
- No regressions in existing auth and presentation flows.
