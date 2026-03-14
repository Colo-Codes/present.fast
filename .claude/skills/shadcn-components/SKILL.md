---
name: shadcn-components
description: shadcn/ui component patterns for the present.fast project. Use when adding, customizing, or composing shadcn/ui components.
---

# shadcn/ui Component Conventions — present.fast

## Configuration

```json
// components.json
{
  "style": "radix-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

- Style: **radix-nova** (latest Radix UI primitives)
- All components live in `src/components/ui/`
- Adding components: `npx shadcn@latest add <component>`

## Component structure patterns

### Simple wrapper component

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn('rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10', className)}
      {...props}
    />
  );
}
```

### Component with CVA variants

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { cn } from '@/lib/utils';

const buttonVariants = cva('inline-flex items-center justify-center rounded-lg', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground',
      outline: 'border-border bg-background hover:bg-muted',
      ghost: 'hover:bg-muted hover:text-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
      destructive: 'bg-destructive text-white hover:bg-destructive/90',
    },
    size: {
      sm: 'h-7 gap-1 px-2.5',
      default: 'h-8 gap-1.5 px-2.5',
      lg: 'h-9 gap-1.5 px-2.5',
      icon: 'size-8',
    },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button';
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
```

### Composed multi-slot component (Card pattern)

```tsx
function Card({ className, size = 'default', ...props }) {
  return <div data-slot="card" data-size={size} className={cn('...', className)} {...props} />;
}

function CardHeader({ className, ...props }) {
  return <div data-slot="card-header" className={cn('... group-data-[size=sm]/card:px-3', className)} {...props} />;
}

function CardTitle({ className, ...props }) {
  return <div data-slot="card-title" className={cn('...', className)} {...props} />;
}

function CardContent({ className, ...props }) {
  return <div data-slot="card-content" className={cn('...', className)} {...props} />;
}

function CardFooter({ className, ...props }) {
  return <div data-slot="card-footer" className={cn('...', className)} {...props} />;
}
```

### Radix primitive wrapper

```tsx
'use client';

import { Separator as SeparatorPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

function Separator({ className, orientation = 'horizontal', decorative = true, ...props }) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px',
        className,
      )}
      {...props}
    />
  );
}
```

## Key conventions

### data-slot attributes
Every component root gets `data-slot="component-name"`. This enables:
- CSS targeting from parent components
- Layout coordination via `:has()` selectors
- Debugging component trees

### data-variant and data-size
Store variant/size as data attributes so parent components can respond:
```css
.parent:has([data-slot="button"][data-variant="ghost"]) { ... }
```

### Polymorphism with asChild
Use Radix `Slot.Root` for components that need to render as different elements:
```tsx
<Button asChild>
  <a href="/somewhere">Link styled as button</a>
</Button>
```

### State styling with data attributes
Use Radix data attributes instead of conditional classes:
```tsx
className="data-checked:bg-primary data-unchecked:bg-input"
```

### Focus visible
Always include focus-visible styles:
```tsx
className="focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
```

### Icon sizing in components
Use `[&>svg]` selector:
```tsx
className="[&>svg]:pointer-events-none [&>svg]:size-3!"
```

## Available components

Check `src/components/ui/` for currently installed components. Add new ones with:
```bash
npx shadcn@latest add <component-name>
```

Common ones already installed: `button`, `card`, `badge`, `separator`, `switch`, `skeleton`

## Composing custom components

Build feature components by composing shadcn/ui primitives:

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const FeatureCard = ({ title, status }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <Badge variant={status === 'active' ? 'default' : 'secondary'}>{status}</Badge>
    </CardHeader>
    <CardContent>
      <Button>Action</Button>
    </CardContent>
  </Card>
);
```
