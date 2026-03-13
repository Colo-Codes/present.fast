import { v } from 'convex/values';

import { query } from '../_generated/server';
import { requireAuth } from '../auth';

export const listUsersArgs = v.object({
  limit: v.optional(v.number()),
});

export const userByClerkIdArgs = v.object({
  clerkId: v.string(),
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx: any) => {
    const identity = await requireAuth(ctx);

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (queryBuilder: any) => queryBuilder.eq('clerkId', identity.clerkId))
      .unique();

    if (!user) {
      return null;
    }

    return user;
  },
});
