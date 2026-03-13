import { UnauthorizedError } from './errors';

type PermissionContext = {
  db: {
    query: (table: 'users' | 'workspaceMembers') => {
      withIndex: (
        index: string,
        callback: (queryBuilder: any) => unknown,
      ) => {
        unique: () => Promise<any>;
      };
    };
  };
};

export const hasMatchingUserAccess = (
  authenticatedClerkId: string,
  targetClerkId: string,
): boolean => {
  return authenticatedClerkId === targetClerkId;
};

export const getUserByClerkIdOrThrow = async (ctx: PermissionContext, clerkId: string) => {
  const user = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', (queryBuilder) => queryBuilder.eq('clerkId', clerkId))
    .unique();

  if (!user) {
    throw new UnauthorizedError('User profile does not exist.');
  }

  return user;
};

export const assertWorkspaceMembership = async (
  ctx: PermissionContext,
  workspaceId: string,
  userId: string,
) => {
  const membership = await ctx.db
    .query('workspaceMembers')
    .withIndex('by_workspace_user', (queryBuilder) =>
      queryBuilder.eq('workspaceId', workspaceId).eq('userId', userId),
    )
    .unique();

  if (!membership) {
    throw new UnauthorizedError('You are not a member of this workspace.');
  }

  return membership;
};
