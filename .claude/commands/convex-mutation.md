Scaffold a new Convex mutation for "$ARGUMENTS".

## Step 1: Parse the request

Extract from $ARGUMENTS:

- **Domain**: which feature domain owns this mutation (e.g. presentations, users, workspaces, or a new domain)
- **Action**: what the mutation does (e.g. create, update, delete, toggle)
- **Fields**: what data the mutation accepts

If the description is ambiguous, ask the user to clarify before proceeding.

## Step 2: Study existing patterns

Read these files to match project conventions:

| Pattern                                 | Reference file                                                     |
| --------------------------------------- | ------------------------------------------------------------------ |
| Create mutation with auth + permissions | `convex/presentations/mutations.ts` — `createPresentation`         |
| Update mutation with ownership check    | `convex/presentations/mutations.ts` — `updatePresentationMarkdown` |
| Auth + provisioning                     | `convex/lib/provisioning.ts` — `ensureUserAndDefaultWorkspace`     |
| Permission checks                       | `convex/lib/permissions.ts` — `assertWorkspaceMembership`          |
| Schema and validators                   | `convex/schema.ts`                                                 |

Key conventions:

- Always call `ensureUserAndDefaultWorkspace(ctx)` to get `userId` and `workspaceId`
- Always call `assertWorkspaceMembership()` after getting user context
- Always set `updatedAt: Date.now()` on writes
- Always set both `createdAt` and `updatedAt` on inserts
- Use `v.*` validators from `convex/values` for all args
- Use `v.id('tableName')` for document ID args
- Throw plain `Error` for validation failures
- Return IDs for immediate client use
- Use `ctx.db.insert()` for creates, `ctx.db.patch()` for updates, `ctx.db.delete()` for deletes

## Step 3: Check if schema changes are needed

If the mutation operates on a new table or needs new fields on an existing table:

1. Read `convex/schema.ts`
2. Show the user what schema additions are needed
3. Wait for confirmation before modifying the schema

## Step 4: Show the plan

Before writing any files, present:

```
Domain: convex/<domain>/mutations.ts
Function: <functionName>

Args:
  - <argName>: <v.type()>
  - ...

Auth: ensureUserAndDefaultWorkspace → assertWorkspaceMembership
Schema changes: [none | list changes]

Files to create/modify:
  - convex/<domain>/mutations.ts (modify|create)
  - convex/schema.ts (modify — only if new table/fields)
```

Wait for the user to confirm before proceeding.

## Step 5: Create the mutation

Follow this template:

```ts
import { v } from 'convex/values';

import { mutation } from '../_generated/server';
import { assertWorkspaceMembership } from '../lib/permissions';
import { ensureUserAndDefaultWorkspace } from '../lib/provisioning';

export const myMutation = mutation({
  args: {
    // Define args with v.* validators
  },
  handler: async (ctx, args) => {
    const { userId, workspaceId } = await ensureUserAndDefaultWorkspace(ctx);
    await assertWorkspaceMembership(ctx, workspaceId, userId);

    const now = Date.now();
    // Perform the operation

    return {
      /* relevant IDs */
    };
  },
});
```

If the domain directory doesn't exist yet, create `convex/<domain>/mutations.ts`. If a `mutations.ts` file already exists, append the new function — do not overwrite existing mutations.

## Step 6: Verify

Run `yarn typecheck` to validate all types align. Report any issues found.
