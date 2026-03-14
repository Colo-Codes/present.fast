# PF-31 Display a Presentation Saved by the User

## 1) Summary

PF-31 must render a saved presentation as actual slides, not as raw markdown text.

That means the saved `markdownContent` must be translated into `SlideData[]` and rendered through the slide system in `src/components/slides/*` (the same rendering stack used by `SlideContent`, `SlideImage`, `SlideSplit`, `SlideQuote`, etc.).

Scope for this task:

- keep `/presentation/[presentationId]` protected and authorization-aware,
- keep owner default in edit mode,
- add owner display mode that renders parsed slides from saved markdown,
- preserve member/share read-only behavior and existing auth states.

---

## 2) Existing baseline and gap

What already exists:

- deck persistence (`title`, `markdownContent`, `updatedAt`) from PF-30,
- route authorization union in `getPresentationRouteAccess`,
- slide presentation components in `src/components/slides/*`,
- `SlideData` contract in `src/lib/slides.ts`.

What is missing:

- a markdown -> `SlideData[]` transformation path for persisted user content,
- a slide deck component that can render dynamic slide arrays (today `slide-deck.tsx` imports static `slides`),
- owner display mode wired to dynamic slide rendering.

---

## 3) Implementation strategy

Use existing slide components as the rendering engine and add a minimal adapter layer:

1. Parse saved markdown into normalized `SlideData[]`.
2. Feed parsed slides into a dynamic deck renderer (based on current `SlideDeck` behavior).
3. Use that renderer in owner display mode (`?mode=display`) on `/presentation/[presentationId]`.

This avoids inventing a second rendering system and keeps PF-31 aligned with current slide UI/animations.

---

## 4) File plan

[MODIFY] `src/app/presentation/[presentationId]/page.tsx`
Purpose: pass `mode` (`edit` | `display`) into route view.

Key details:

- Parse `searchParams.mode` and normalize unknown values to `edit`.
- Keep login + forbidden e2e handling unchanged.
- Pass normalized mode to `PresentationRouteView`.

[MODIFY] `src/features/presentations/components/presentation-route-view.tsx`
Purpose: owner display branch should render slides from saved markdown.

Key details:

- Extend props with `mode: 'edit' | 'display'`.
- In authorized branch:
  - `canWrite && mode === 'display'` -> render slide display surface using parsed markdown.
  - `canWrite && mode === 'edit'` -> current editor.
  - `!canWrite` -> existing read-only behavior (no regression).
- Keep exhaustive switch handling for status union.

[CREATE] `src/lib/presentation-markdown-to-slides.ts`
Purpose: convert saved presentation markdown into `SlideData[]`.

Key details:

- Export pure function, e.g. `parsePresentationMarkdownToSlides(markdown: string): SlideData[]`.
- Implement a strict, deterministic parser for the markdown format currently produced/expected by the app.
- Start with minimal supported patterns that map reliably to existing slide types:
  - title slide,
  - content slide (paragraphs + bullets),
  - quote slide,
  - split/image slide when markdown includes recognized markers.
- Add safe fallback behavior:
  - never throw on malformed sections,
  - produce at least one valid fallback slide when content exists,
  - return an explicit empty slide set for blank markdown.

[MODIFY] `src/components/slides/slide-deck.tsx`
Purpose: support dynamic slide input instead of only static import from `src/lib/slides`.

Key details:

- Refactor to accept a `slides` prop (`SlideData[]`).
- Preserve keyboard navigation, touch gestures, progress, pointer mode, fullscreen, and animations.
- Keep an optional compatibility path:
  - if no prop is passed, use current static `slides` default.
- Ensure types remain strict and exhaustive for `slide.type` renderer switch.

[CREATE] `src/features/presentations/components/presentation-display-scaffold.tsx`
Purpose: owner display mode wrapper that wires persisted markdown to dynamic deck rendering.

Key details:

- Inputs: `presentationId`, `title`, `markdownContent`, `updatedAt`.
- Parse markdown with `parsePresentationMarkdownToSlides`.
- Render states:
  - empty markdown -> friendly empty-state UI with CTA back to edit,
  - parse produced slides -> render dynamic `SlideDeck`,
  - parse failure fallback (if any defensive branch) -> non-blocking message + back to edit.
- Include mode navigation controls:
  - back to editor (`/presentation/{id}`),
  - dashboard exit.

[MODIFY] `src/features/presentations/components/presentation-editor.tsx`
Purpose: provide explicit navigation to display mode.

Key details:

- Add “Display saved slides” action linking to `/presentation/{id}?mode=display`.
- Keep save flow unchanged.
- Optional helper text: “Display mode renders last saved content.”

[MODIFY] `src/config/routes.ts`
Purpose: avoid string duplication for display route.

Key details:

- Add `presentationDisplayById(presentationId: string)`.

[MODIFY] `src/tests/integration/presentation-authorization.test.ts`
Purpose: protect route payload assumptions used by display mode.

Key details:

- Ensure authorized payload includes `title`, `markdownContent`, `updatedAt`.
- Keep forbidden/member/public-share assertions intact.

[CREATE] `src/tests/unit/presentation-markdown-to-slides.test.ts`
Purpose: validate parser determinism and fallback behavior.

Key details:

- blank markdown -> empty slide set,
- minimal heading/body markdown -> at least one valid slide,
- bullets parsed into `bullets`,
- malformed markdown does not crash and yields safe output,
- slide IDs and types are stable/valid.

[MODIFY] `src/tests/e2e/smoke.spec.ts`
Purpose: smoke-check owner display route with rendered slide UI.

Key details:

- Add signed-in owner path that opens `?mode=display`.
- Assert slide UI markers (deck container/nav/progress or known slide title) render.
- Keep signed-out and share-token smoke coverage unchanged.

---

## 5) Implementation checklist

- [x] Add `mode` query support to `/presentation/[presentationId]`.
- [x] Add owner display branch in `PresentationRouteView`.
- [x] Implement markdown -> `SlideData[]` parser utility.
- [x] Make `SlideDeck` accept dynamic slides.
- [x] Build owner display scaffold that renders parsed slides.
- [x] Add editor action linking to display mode.
- [x] Keep member/share/signed-out branches behaviorally unchanged.
- [x] Add parser unit tests.
- [x] Add/adjust integration + smoke coverage for display mode.

---

## 6) Acceptance criteria

Functional:

- Owner can open `/presentation/{id}?mode=display`.
- The saved markdown is rendered as slides using `src/components/slides/*` rendering stack.
- Display mode shows the latest saved version (not unsaved in-memory editor draft).
- Owner can navigate back to edit mode.

Regression safety:

- Signed-out users still see login-required behavior.
- Unauthorized users still see forbidden behavior.
- Workspace members retain read-only access behavior.
- Public share route behavior remains unchanged.

Quality:

- Parser handles invalid markdown safely without crashing route.
- TypeScript remains strict and switch handling remains exhaustive.

---

## 7) Open decisions (resolve before implementation)

1. **Markdown slide syntax contract**: finalize exact markdown format the parser supports (section delimiter, image/source metadata, quote blocks, etc.). Use the demo slides in src/components/slides/\*.ts as a reference. Using `---` in markdown should indicate a new slide.
2. **Parser placement**: keep parser in `src/lib/` as a pure utility (recommended) vs feature-local. Keep the parser in `src/lib/`.
3. **Display fallback UX**: for unsupported markdown patterns, show fallback content slide vs explicit “unsupported format” notice. Show a fallback content slide.

---

## 8) Suggested implementation order

1. Define and lock markdown -> slide mapping contract.
2. Implement parser utility + unit tests.
3. Refactor `SlideDeck` to accept dynamic slides.
4. Wire owner display scaffold and route mode branch.
5. Add editor navigation action.
6. Run integration/e2e smoke checks and regression pass.

---

## 9) Validation commands

- `yarn test src/tests/unit/presentation-markdown-to-slides.test.ts`
- `yarn test src/tests/integration/presentation-authorization.test.ts`
- `yarn test:e2e --grep "presentation|display|share|unauthorized"`
