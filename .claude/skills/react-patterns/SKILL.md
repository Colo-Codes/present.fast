---
name: react-patterns
description: React component conventions for the present.fast project. Use when creating or modifying React components, hooks, context providers, or pages under src/.
---

# React Component Conventions — present.fast

## Project stack

- **Next.js 16** (App Router) with **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS v4** with CSS variables
- **shadcn/ui** (radix-nova style) + Radix UI primitives
- **Convex** for real-time backend
- **Clerk** for authentication
- **Framer Motion** for animations
- **Lucide React** for icons

## Directory structure

```
src/
├── app/                    # Routes, layouts, route handlers (thin files)
│   ├── (app)/              # Protected app routes (group)
│   ├── api/                # API route handlers
│   └── layout.tsx          # Root layout with providers
├── components/             # Shared UI components
│   ├── ui/                 # shadcn/ui primitives (button, card, badge, etc.)
│   ├── auth/               # Auth-specific components
│   ├── layout/             # Layout components
│   └── slides/             # Feature-specific composed components
├── features/               # Business domain modules
│   └── <feature>/
│       ├── components/     # Feature-specific components
│       └── hooks/          # Feature-specific hooks
├── hooks/                  # Shared React hooks
├── lib/                    # Infrastructure & integrations
│   ├── convex/             # Convex client setup
│   ├── env/                # Environment variables (client.ts / server.ts)
│   └── utils.ts            # cn() utility
├── config/                 # App configuration constants (as const)
├── types/                  # TypeScript type definitions
├── utils/                  # Pure utility functions
└── styles/                 # Global CSS & theme tokens
```

## Component patterns

### Server vs client components

- **Server components by default** — only add `'use client'` when the component needs interactivity, hooks, or browser APIs
- Keep route pages (`page.tsx`) as server components when possible
- Use `await auth()` from `@clerk/nextjs/server` for server-side auth checks

### Props and typing

```tsx
type MyComponentProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

const MyComponent = ({ title, description, children }: MyComponentProps) => {
  return <div>{children}</div>;
};

export default MyComponent;
```

- Use inline `type` (not `interface`) for props
- Use `React.ComponentProps<"element">` when extending HTML elements
- Use `VariantProps<typeof variants>` when using CVA

### Client component with Convex

```tsx
'use client';

import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

export const MyFeature = () => {
  const data = useQuery(api.myDomain.queries.listItems);
  const createItem = useMutation(api.myDomain.mutations.createItem);

  if (data === undefined) {
    return <p className="text-muted-foreground text-sm">Loading...</p>;
  }

  return (/* render */);
};
```

## Styling

- Use `cn()` from `@/lib/utils` for all class merging
- Tailwind utility classes only — no custom CSS unless unavoidable
- Use `data-slot` attributes on component roots
- Icons: Lucide React, sized with `size-4`, `size-5`
- Responsive: mobile-first (`sm:`, `md:`, `lg:`)

## Imports

- Use `@/` path alias for all `src/` imports
- Enforce `import type { Foo }` for type-only imports
- Order (enforced by `simple-import-sort`): external → `@/` internal → relative

## File naming

- **Kebab-case**: `auth-header.tsx`, `theme-toggle.tsx`
- **One component per file** (except tightly coupled sub-components like Card slots)
- **Barrel exports**: `index.ts` for feature directories

## Hooks

- Prefix with `use`: `useTheme`, `useAuthFromClerk`
- Return typed objects: `{ theme, setTheme, toggleTheme }`
- Handle SSR: check `typeof window !== 'undefined'`
- Use `useRef` to prevent double-execution in effects

## Error handling

- `useQuery()` returns `undefined` while loading — always handle this state
- Use `try/finally` for mutation loading states
- Use `redirect()` in server components for auth failures
- Log with `logError()` from `@/lib/logger`

## Config

- Constants in `src/config/` with `as const`
- Client env: `NEXT_PUBLIC_*` prefix in `src/lib/env/client.ts`
- Server env: `src/lib/env/server.ts`
