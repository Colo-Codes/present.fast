Scaffold a new Convex query for "$ARGUMENTS".

## Step 1: Parse the request

Extract from $ARGUMENTS:

- **Domain**: which feature domain owns this query (e.g. presentations, users, workspaces, or a new domain)
- **What it reads**: what data the query returns (e.g. list of items, single item by ID, filtered results)
- **Access control**: whether this is authenticated-only or public (e.g. share-by-token queries are public)

If the description is ambiguous, ask the user to clarify before proceeding.

## Step 2: Study existing patterns

Read these files to match project conventions:

| Pattern                             | Reference file                                                             |
| ----------------------------------- | -------------------------------------------------------------------------- |
| Authenticated list query with index | `convex/presentations/queries.ts` — `listPresentationsForCurrentWorkspace` |
| Authenticated single-item query     | `convex/presentations/queries.ts` — `getPresentationById`                  |
| Public query (no auth)              | `convex/presentations/queries.ts` — `getPublicPresentationByShareToken`    |
| Permission checks                   | `convex/lib/permissions.ts` — `assertWorkspaceMembership`                  |
| Auth + provisioning                 | `convex/lib/provisioning.ts` — `resolveCurrentUserWorkspaceOrThrow`        |
| Schema and indexes                  | `convex/schema.ts`                                                         |

Key conventions:

- Authenticated queries use `resolveCurrentUserWorkspaceOrThrow(ctx)` (read-only, does not auto-create)
- Always call `assertWorkspaceMembership()` after getting user context
- Return `null` for not-found (never throw on missing data)
- Use `.withIndex()` for indexed queries — check `convex/schema.ts` for available indexes
- Use `.unique()` for single-record lookups
- Use `.collect()` for list queries
- Use `.order('desc')` for reverse chronological order
- Public queries skip auth entirely — just query the DB directly

## Step 3: Check if index changes are needed

If the query filters by fields that don't have an index:

1. Read `convex/schema.ts`
2. Suggest adding an index (format: `.index('by_field', ['field'])`)
3. Wait for confirmation before modifying the schema

## Step 4: Show the plan

Before writing any files, present:

```
Domain: convex/<domain>/queries.ts
Function: <functionName>

Args:
  - <argName>: <v.type()>
  - ...

Auth: [resolveCurrentUserWorkspaceOrThrow → assertWorkspaceMembership | none (public)]
Returns: <description of return shape>
Index used: <indexName> on <tableName>

Files to create/modify:
  - convex/<domain>/queries.ts (modify|create)
  - convex/schema.ts (modify — only if new index needed)
```

Wait for the user to confirm before proceeding.

## Step 5: Create the query

Follow the appropriate template:

**Authenticated query:**

```ts
import { v } from 'convex/values';

import { query } from '../_generated/server';
import { assertWorkspaceMembership } from '../lib/permissions';
import { resolveCurrentUserWorkspaceOrThrow } from '../lib/provisioning';

export const myQuery = query({
  args: {},
  handler: async (ctx) => {
    const { userId, workspaceId } = await resolveCurrentUserWorkspaceOrThrow(ctx);
    await assertWorkspaceMembership(ctx, workspaceId, userId);

    return await ctx.db
      .query('tableName')
      .withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
      .order('desc')
      .collect();
  },
});
```

**Public query (no auth):**

```ts
export const getPublicItem = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query('tableName')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .unique();

    if (!item) {
      return null;
    }

    return item;
  },
});
```

If the domain directory doesn't exist yet, create `convex/<domain>/queries.ts`. If a `queries.ts` file already exists, append the new function — do not overwrite existing queries.

## Step 6: Verify

Run `yarn typecheck` to validate all types align. Report any issues found.
