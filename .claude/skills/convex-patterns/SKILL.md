---
name: convex-patterns
description: Convex backend conventions for the present.fast project. Use when creating or modifying schema, queries, mutations, actions, or backend helpers under convex/.
---

# Convex Backend Conventions — present.fast

## Directory structure

```
convex/
├── schema.ts               # Data model and indexes
├── auth.ts                 # Auth helpers (requireAuth)
├── auth.config.ts          # Clerk JWT integration config
├── _generated/             # Auto-generated types and API (never edit)
│   ├── api.d.ts
│   └── server.d.ts
├── lib/                    # Shared backend helpers
│   ├── errors.ts           # Custom error classes
│   ├── permissions.ts      # Permission assertions
│   └── provisioning.ts     # User/workspace auto-provisioning
├── users/                  # User domain operations
│   ├── mutations.ts
│   └── queries.ts
├── presentations/          # Presentation domain operations
│   ├── mutations.ts
│   └── queries.ts
├── workspaces/             # Workspace domain operations
│   └── queries.ts
├── actions/                # Server actions (external API calls)
├── crons.ts                # Scheduled jobs
└── http.ts                 # HTTP action handlers
```

## Schema definition

```ts
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const schema = defineSchema({
  myTable: defineTable({
    workspaceId: v.id('workspaces'),
    createdByUserId: v.id('users'),
    title: v.string(),
    isActive: v.boolean(),
    metadata: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_workspace', ['workspaceId'])
    .index('by_workspace_updated_at', ['workspaceId', 'updatedAt']),
});
```

**Rules:**
- Use `v.id('tableName')` for cross-table references
- Use `v.optional()` for nullable fields
- Always include `createdAt` and `updatedAt` as `v.number()` (epoch ms)
- Add indexes for commonly queried fields
- Use composite indexes for multi-field queries

## Mutations

```ts
import { v } from 'convex/values';
import { mutation } from '../_generated/server';
import { assertWorkspaceMembership } from '../lib/permissions';
import { ensureUserAndDefaultWorkspace } from '../lib/provisioning';

export const createItem = mutation({
  args: {
    title: v.string(),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate and get user context
    const { userId, workspaceId } = await ensureUserAndDefaultWorkspace(ctx);

    // 2. Check permissions
    await assertWorkspaceMembership(ctx, workspaceId, userId);

    // 3. Perform operation
    const now = Date.now();
    const itemId = await ctx.db.insert('myTable', {
      workspaceId,
      createdByUserId: userId,
      title: args.title.trim(),
      content: args.content ?? '',
      createdAt: now,
      updatedAt: now,
    });

    return { itemId, workspaceId };
  },
});
```

**Rules:**
- Always call `ensureUserAndDefaultWorkspace()` or `resolveCurrentUserWorkspaceOrThrow()` first
- Always call `assertWorkspaceMembership()` after getting user context
- Always update `updatedAt` on mutations
- Throw plain `Error` for validation failures
- Return IDs for immediate client use

## Queries

```ts
import { v } from 'convex/values';
import { query } from '../_generated/server';
import { assertWorkspaceMembership } from '../lib/permissions';
import { resolveCurrentUserWorkspaceOrThrow } from '../lib/provisioning';

export const listItems = query({
  args: {},
  handler: async (ctx) => {
    const { userId, workspaceId } = await resolveCurrentUserWorkspaceOrThrow(ctx);
    await assertWorkspaceMembership(ctx, workspaceId, userId);

    return await ctx.db
      .query('myTable')
      .withIndex('by_workspace_updated_at', (q) =>
        q.eq('workspaceId', workspaceId),
      )
      .order('desc')
      .collect();
  },
});

export const getItemById = query({
  args: { itemId: v.id('myTable') },
  handler: async (ctx, args) => {
    const { userId } = await resolveCurrentUserWorkspaceOrThrow(ctx);
    const item = await ctx.db.get(args.itemId);

    if (!item) return null;

    await assertWorkspaceMembership(ctx, item.workspaceId, userId);
    return item;
  },
});
```

**Rules:**
- Return `null` for not-found (don't throw)
- Use `.withIndex()` for indexed queries
- Use `.unique()` for single-record queries
- Use `.collect()` for multiple records
- Use `.order('desc')` to sort

## Auth pattern

```ts
// convex/auth.ts
export const requireAuth = async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  return {
    clerkId: identity.subject,
    email: identity.email,
    fullName: identity.name,
  };
};
```

- Map `identity.subject` to `clerkId`
- Always throw on missing identity

## Error handling

```ts
// convex/lib/errors.ts
export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
```

- Create custom Error subclasses for specific failure modes
- Throw with descriptive messages
- Mutations throw errors, queries return null

## Provisioning pattern

The `ensureUserAndDefaultWorkspace()` function auto-creates users and their default workspace on first auth. This is called from mutations. Queries use `resolveCurrentUserWorkspaceOrThrow()` which only reads.

## Domain module organization

Each domain (users, presentations, workspaces) gets its own directory with:
- `mutations.ts` — write operations
- `queries.ts` — read operations

Access from frontend via `api.<domain>.<type>.<functionName>`:
```ts
api.presentations.mutations.createPresentation
api.presentations.queries.listPresentationsForCurrentWorkspace
```

## Testing

Convex functions are tested indirectly through integration and E2E tests. Unit-test pure helpers in `convex/lib/` directly.
