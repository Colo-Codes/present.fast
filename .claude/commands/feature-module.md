Scaffold a new feature module for "$ARGUMENTS".

## Step 1: Parse the request

Extract from $ARGUMENTS:

- **Feature name**: the domain name in kebab-case (e.g. `billing`, `analytics`, `notifications`)
- **Scope**: what the feature includes — components, hooks, Convex backend, or all

If the description is ambiguous, ask the user to clarify before proceeding.

## Step 2: Study existing patterns

Read these files to match project conventions:

| Pattern                     | Reference file                                                   |
| --------------------------- | ---------------------------------------------------------------- |
| Feature directory structure | `src/features/presentations/` and `src/features/auth/`           |
| Feature component           | `src/features/presentations/components/presentation-library.tsx` |
| Feature hook                | `src/features/auth/hooks/use-auth-from-clerk.ts`                 |
| Feature types               | `src/features/auth/types.ts`                                     |
| Barrel export               | `src/features/auth/index.ts`                                     |
| Convex domain               | `convex/presentations/` (mutations.ts + queries.ts)              |
| Schema                      | `convex/schema.ts`                                               |

Key conventions:

- Feature directories live at `src/features/<feature-name>/`
- Subdirectories: `components/`, `hooks/` (only create what's needed)
- Each feature has a barrel `index.ts` exporting public API
- Feature components are client components (`'use client'`) when they use hooks or interactivity
- Convex domain directories live at `convex/<feature-name>/` with `mutations.ts` and `queries.ts`
- Types shared across the feature go in `types.ts` at the feature root

## Step 3: Show the plan

Before writing any files, present the plan:

```
Feature: <feature-name>

Frontend:
  src/features/<feature-name>/
  ├── index.ts                  # Barrel exports
  ├── types.ts                  # Feature-specific types
  ├── components/
  │   └── <main-component>.tsx  # Primary feature component
  └── hooks/
      └── use-<hook-name>.ts    # Feature-specific hook (if needed)

Backend (if needed):
  convex/<feature-name>/
  ├── mutations.ts              # Write operations
  └── queries.ts                # Read operations

Schema changes (if needed):
  convex/schema.ts              # New table definition
```

Wait for the user to confirm before proceeding.

## Step 4: Create the files

### Feature types (`types.ts`)

```ts
export type FeatureItem = {
  id: string;
  title: string;
  // ...domain-specific fields
};
```

### Barrel export (`index.ts`)

```ts
export { MainComponent } from './components/main-component';
export type { FeatureItem } from './types';
```

### Main component

Follow the patterns from `src/features/presentations/components/presentation-library.tsx`:

- `'use client'` directive at the top
- Import Convex hooks: `useQuery`, `useMutation` from `convex/react`
- Import API: `api` from `convex/_generated/api`
- Import shadcn/ui components for UI
- Handle loading state (`data === undefined`)
- Handle empty state
- Handle error states with try/finally

### Convex mutations and queries

Follow patterns from `convex/presentations/mutations.ts` and `convex/presentations/queries.ts`:

- Auth via `ensureUserAndDefaultWorkspace` (mutations) or `resolveCurrentUserWorkspaceOrThrow` (queries)
- Permission check via `assertWorkspaceMembership`
- Timestamps: `createdAt` and `updatedAt`

### Schema additions

If a new table is needed, add it to `convex/schema.ts` following existing patterns:

- Use `v.id('tableName')` for foreign keys
- Include `createdAt: v.number()` and `updatedAt: v.number()`
- Add appropriate indexes

## Step 5: Verify

Run `yarn typecheck` and `yarn lint:check` to validate the new module. Report any issues found.
