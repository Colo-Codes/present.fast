import { v } from 'convex/values';

import { mutation } from '../_generated/server';
import { ensureUserAndDefaultWorkspace } from '../lib/provisioning';

export const upsertUserArgs = v.object({
  clerkId: v.string(),
  email: v.optional(v.string()),
  fullName: v.optional(v.string()),
  avatarUrl: v.optional(v.string()),
});

export const bootstrapCurrentUser = mutation({
  args: {},
  handler: async (ctx: any) => {
    const bootstrapResult = await ensureUserAndDefaultWorkspace(ctx);
    return bootstrapResult;
  },
});

export const upsertUserFromClerk = mutation({
  args: upsertUserArgs,
  handler: async (ctx: any, args: any) => {
    const now = Date.now();
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (queryBuilder: any) => queryBuilder.eq('clerkId', args.clerkId))
      .unique();

    if (!existingUser) {
      const userId = await ctx.db.insert('users', {
        clerkId: args.clerkId,
        email: args.email,
        fullName: args.fullName,
        avatarUrl: args.avatarUrl,
        createdAt: now,
        updatedAt: now,
      });

      return { userId, created: true };
    }

    await ctx.db.patch(existingUser._id, {
      email: args.email ?? existingUser.email,
      fullName: args.fullName ?? existingUser.fullName,
      avatarUrl: args.avatarUrl ?? existingUser.avatarUrl,
      updatedAt: now,
    });

    return { userId: existingUser._id, created: false };
  },
});
