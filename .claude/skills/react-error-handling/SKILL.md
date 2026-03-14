---
name: react-error-handling
description: Error handling patterns for present.fast React and Convex code. Use when writing mutations, queries, form validation, or error display in components.
---

# Error Handling Patterns — present.fast

## Convex backend errors

### Mutations — throw on failure

```ts
// convex/presentations/mutations.ts
export const createPresentation = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const { userId, workspaceId } = await ensureUserAndDefaultWorkspace(ctx);
    await assertWorkspaceMembership(ctx, workspaceId, userId);

    if (!args.title.trim()) {
      throw new Error('Title cannot be empty.');
    }

    // ...
  },
});
```

### Queries — return null for not-found

```ts
export const getItemById = query({
  args: { itemId: v.id('myTable') },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) return null;  // Don't throw
    return item;
  },
});
```

### Custom error classes

```ts
// convex/lib/errors.ts
export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
```

Use for permission checks in `assertWorkspaceMembership()`.

## Frontend error handling

### Mutation calls in components

```tsx
'use client';

const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);
const createItem = useMutation(api.items.mutations.createItem);

const handleSubmit = async () => {
  setError(null);
  setIsSubmitting(true);
  try {
    await createItem({ title });
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Something went wrong.');
  } finally {
    setIsSubmitting(false);
  }
};

// Render error
{error && (
  <p className="text-destructive text-sm" role="alert" aria-live="assertive">
    {error}
  </p>
)}
```

### Query loading and empty states

```tsx
const items = useQuery(api.items.queries.listItems);

// Loading
if (items === undefined) {
  return <Skeleton className="h-20 w-full" />;
}

// Empty
if (items.length === 0) {
  return <p className="text-muted-foreground text-sm">No items yet.</p>;
}

// Render items
return items.map(/* ... */);
```

### Server-side auth errors

```tsx
// In server components — redirect, don't throw
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const { userId } = await auth();
if (!userId) redirect('/sign-in');
```

### API route errors

```tsx
import { NextResponse } from 'next/server';

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    // ...
    return NextResponse.json({ success: true });
  } catch (error) {
    logError('API error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
};
```

## Logging

```ts
import { logError, logWarn, logInfo } from '@/lib/logger';

logError('Failed to create presentation', { error, userId });
logWarn('Convex not configured — running without backend');
logInfo('User bootstrapped', { userId });
```

## Key rules

1. **Mutations throw**, queries return `null` — consistent convention
2. **Always handle `undefined`** from `useQuery()` — it means loading
3. **Use `try/finally`** for loading state — ensures reset even on error
4. **Render errors with `role="alert"`** and `aria-live="assertive"` for accessibility
5. **Server components redirect**, they don't render error UI
6. **Log with metadata** — pass structured context, not just strings
7. **Don't swallow errors** — always log or display them
