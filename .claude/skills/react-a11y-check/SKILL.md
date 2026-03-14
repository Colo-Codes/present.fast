---
name: react-a11y-check
description: Accessibility conventions for present.fast React components. Use when creating or modifying components that render interactive UI, forms, modals, dynamic content, or error states.
---

# Accessibility Conventions — present.fast

## General rules

- Use **semantic HTML** (`button`, `nav`, `main`, `section`, `article`) over generic `div`/`span`
- Use **Radix UI primitives** for complex interactive components (dialogs, switches, separators) — they handle ARIA automatically
- Use **shadcn/ui components** as the base — they include proper a11y attributes
- Test with keyboard navigation (Tab, Enter, Escape, Arrow keys)

## Forms and inputs

| Rule | Implementation |
|---|---|
| Label association | Every input needs `<label htmlFor="...">`, wrapping `<label>`, or `aria-label` |
| Error linkage | Inputs with errors need `aria-describedby` pointing to error message `id` |
| Invalid state | Failed validation: set `aria-invalid={true}` on input |
| Required fields | Use `aria-required="true"` or `required` attribute |
| Submit buttons | Must have visible text or `aria-label` — not icon-only without label |

```tsx
<div>
  <label htmlFor="title">Title</label>
  <input
    id="title"
    aria-required="true"
    aria-invalid={!!errors.title}
    aria-describedby={errors.title ? 'title-error' : undefined}
  />
  {errors.title && (
    <p id="title-error" className="text-destructive text-sm" role="alert">
      {errors.title}
    </p>
  )}
</div>
```

## Interactive elements

| Rule | Implementation |
|---|---|
| No clickable divs | `onClick` on `div`/`span` needs `role="button"`, `tabIndex={0}`, `onKeyDown` — or use `<button>` |
| Icon-only buttons | Must have `aria-label` or `<span className="sr-only">Label</span>` |
| Close buttons | Use `<span className="sr-only">Close</span>` inside close buttons |
| Links vs buttons | `<a>` without meaningful `href` → use `<button>` instead |

```tsx
// Icon-only button
<button type="button" aria-label="Create new presentation">
  <Plus className="size-4" />
</button>

// Or with sr-only text
<button type="button">
  <Plus className="size-4" />
  <span className="sr-only">Create new presentation</span>
</button>
```

## Dynamic content

| Rule | Implementation |
|---|---|
| Live regions | Async content updates → wrap in `aria-live="polite"` |
| Error announcements | Error messages after submission → `aria-live="assertive"` + `role="alert"` |
| Loading indicators | Use `aria-busy="true"` on container or `role="status"` with label |
| Conditional rendering | Important appearing content should use `aria-live` or focus management |

```tsx
// Loading state
<div aria-busy={isLoading} aria-live="polite">
  {isLoading ? (
    <p className="text-muted-foreground text-sm">Loading...</p>
  ) : (
    <ItemList items={items} />
  )}
</div>

// Error after mutation
<div aria-live="assertive" role="alert">
  {error && <p className="text-destructive text-sm">{error}</p>}
</div>
```

## Headings

- Don't skip heading levels (`h2` → `h4` without `h3`)
- Feature components should not render `<h1>` — the page layout handles that
- Use `<h2>` as the top-level heading within feature components

## Images

- Decorative images: `alt=""` (empty string, not missing)
- Informative images: meaningful `alt` text (not filenames or "image")

## Color and visibility

- Don't communicate state only through color — add text or icons
- Use `sr-only` Tailwind class for screen-reader-only content (not `display: none`)
- Ensure sufficient contrast via theme CSS variables (use `foreground`/`muted-foreground` tokens)

## Theme toggle

The theme toggle component uses:
- `role="switch"` for semantic toggle behavior
- `aria-checked` for current state
- `aria-label="Toggle theme"` for screen readers
- Disabled placeholder during SSR to prevent hydration mismatch

## Radix UI components

When using Radix primitives (Dialog, Popover, Select, etc.), they handle:
- Focus trapping in modals
- Escape key to close
- `aria-expanded`, `aria-controls`, `aria-labelledby` automatically
- Return focus on close

**Don't add redundant ARIA attributes to Radix components** — they manage this internally.

## Testing a11y

During preflight checks, changed `.tsx` components are audited for these rules. Severity:
- **BLOCKER**: Inaccessible content (no keyboard access, no label)
- **WARNING**: Degraded assistive tech experience (missing error linkage, no live region)
- **NOTE**: Improvement opportunity (could add aria-live)
