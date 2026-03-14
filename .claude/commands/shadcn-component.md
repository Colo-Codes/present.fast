Add and customize a shadcn/ui component for "$ARGUMENTS".

## Step 1: Parse the request

Extract from $ARGUMENTS:

- **Component name**: the shadcn/ui component to add (e.g. dialog, dropdown-menu, tabs, form, toast)
- **Customization**: any project-specific styling or behavior changes needed

If the user wants a custom composed component (not a base shadcn primitive), skip to Step 4.

## Step 2: Check if already installed

Look in `src/components/ui/` to see if the component already exists. If it does, skip the install step and go to customization.

## Step 3: Install the component

Run:

```bash
npx shadcn@latest add <component-name>
```

This installs the component to `src/components/ui/<component-name>.tsx` following the project's `components.json` configuration (radix-nova style, Tailwind CSS variables, Lucide icons).

If the component has dependencies (e.g. `form` needs `react-hook-form` and `zod`), note them and install:

```bash
yarn add <dependency>
```

## Step 4: Study project conventions

Read these files to match existing patterns:

| Pattern             | Reference file                                               |
| ------------------- | ------------------------------------------------------------ |
| shadcn config       | `components.json`                                            |
| Existing components | `src/components/ui/button.tsx`, `src/components/ui/card.tsx` |
| shadcn skill        | `.claude/skills/shadcn-components/SKILL.md`                  |
| Utility function    | `src/lib/utils.ts` — `cn()`                                  |

Key conventions:

- All UI primitives live in `src/components/ui/`
- Use `data-slot="component-name"` on component roots
- Use `cn()` from `@/lib/utils` for class merging
- Use CVA (`class-variance-authority`) for variant-based components
- Use `React.ComponentProps<"element">` for extending HTML elements
- Include `focus-visible` styles on interactive elements
- Use Radix `Slot.Root` for `asChild` polymorphism

## Step 5: Customize (if requested)

If the user wants project-specific customizations:

1. **Theme tokens**: use CSS variables (`bg-primary`, `text-muted-foreground`, etc.) not hardcoded colors
2. **Variants**: add CVA variants following the `Button` pattern
3. **Composition**: build composed components by combining primitives (Card + Badge + Button, etc.)
4. **Accessibility**: ensure proper ARIA attributes, keyboard navigation, and focus management

Place custom composed components in:

- `src/components/` if shared across features
- `src/features/<feature>/components/` if feature-specific

## Step 6: Verify

Run `yarn typecheck` and `yarn lint:check`. Report any issues found.
