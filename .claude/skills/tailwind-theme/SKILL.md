---
name: tailwind-theme
description: Tailwind CSS and theming conventions for the present.fast project. Use when modifying styles, theme tokens, CSS variables, or dark mode behavior.
---

# Tailwind CSS & Theme Conventions — present.fast

## Theme system overview

The project uses **Tailwind CSS v4** with a CSS variable-based dark-first theme system:
- Theme tokens defined as CSS variables in `src/styles/tokens.css`
- Dark mode via `class` strategy (`next-themes` with `ThemeProvider`)
- Default theme: `dark`

## Token files

```
src/styles/
├── tokens.css      # CSS variable definitions (light + dark)
├── themes.css      # Theme application rules
├── utilities.css   # Custom utility classes
└── globals.css     # Global styles and imports
```

### Token naming convention

```css
@theme {
  --color-background: hsl(0 0% 100%);
  --color-foreground: hsl(222 47% 11%);
  --color-muted: hsl(210 40% 96%);
  --color-muted-foreground: hsl(215 16% 47%);
  --color-border: hsl(214 32% 91%);
  --color-primary: hsl(222 89% 55%);
  --color-primary-foreground: hsl(210 40% 98%);
  --color-secondary: hsl(...);
  --color-secondary-foreground: hsl(...);
  --color-accent: hsl(...);
  --color-accent-foreground: hsl(...);
  --color-destructive: hsl(...);
  --color-card: hsl(...);
  --color-card-foreground: hsl(...);
  --color-input: hsl(...);
  --color-ring: hsl(...);
}

:root.dark {
  --color-background: hsl(222 47% 11%);
  --color-foreground: hsl(210 40% 98%);
  /* ... dark overrides */
}
```

**Rules:**
- Use HSL color format (no commas): `hsl(222 47% 11%)`
- Always define both light (`@theme`) and dark (`:root.dark`) variants
- Suffix foreground colors with `-foreground` for contrast pairs
- Use semantic names, not color names (e.g., `destructive` not `red`)

## Using theme colors in components

Use Tailwind classes that reference the CSS variables directly:

```tsx
<div className="bg-background text-foreground">
  <p className="text-muted-foreground">Muted text</p>
  <button className="bg-primary text-primary-foreground">Action</button>
  <div className="border-border rounded-lg border">Card</div>
</div>
```

**Never hardcode hex/HSL values in components.** Always use token classes.

## Class merging

Use `cn()` from `@/lib/utils` (wraps `clsx` + `tailwind-merge`):

```tsx
import { cn } from '@/lib/utils';

<div className={cn('base-classes', isActive && 'active-classes', className)} />
```

## CVA variants

Use `class-variance-authority` for component variants:

```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const variants = cva('base-classes', {
  variants: {
    variant: { default: 'bg-primary', outline: 'border-border' },
    size: { sm: 'h-7', default: 'h-8', lg: 'h-9' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});
```

## Dark mode patterns

- Use `dark:` prefix for dark-mode-specific overrides (rare — prefer CSS variables)
- Theme toggle uses `next-themes` `useTheme()` hook
- SSR: render disabled placeholder until `isMounted` to avoid hydration mismatch

```tsx
const [isMounted, setIsMounted] = useState(false);
useEffect(() => setIsMounted(true), []);
if (!isMounted) return <Placeholder />;
```

## Responsive design

Mobile-first approach:

```tsx
<div className="px-4 md:px-6 lg:px-10">
  <h1 className="text-2xl md:text-3xl lg:text-4xl">Title</h1>
</div>
```

Breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px)

## Data-attribute styling

Components use `data-*` attributes for CSS-driven state:

```tsx
<div data-slot="card" data-size={size} className="... data-[size=sm]:gap-3" />
```

Cross-component coordination:

```tsx
// Parent
<div className="group/card" data-size="sm">
  {/* Child responds to parent */}
  <div className="group-data-[size=sm]/card:px-3" />
</div>
```

## Animation

Use Framer Motion for complex animations:

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
/>
```

Use Tailwind `transition-*` and `animate-*` for simple transitions.

## Icons

Use **Lucide React** exclusively:

```tsx
import { Plus, Loader2, Moon, Sun } from 'lucide-react';

<Plus className="size-4" />
<Loader2 className="size-4 animate-spin" />
```

## Formatting

Tailwind class order is enforced by `prettier-plugin-tailwindcss`. Run `yarn format` to auto-sort.
