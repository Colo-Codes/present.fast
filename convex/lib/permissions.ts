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

export const AUTHORIZATION_ERROR_MESSAGES = {
  userMissing: 'User profile does not exist.',
  readDenied: 'You are not authorized to access this workspace.',
  writeDenied: 'Only workspace owners can modify this deck.',
} as const;

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
    throw new UnauthorizedError(AUTHORIZATION_ERROR_MESSAGES.userMissing);
  }

  return user;
};

export const getWorkspaceMembership = async (
  ctx: PermissionContext,
  workspaceId: string,
  userId: string,
) => {
  return ctx.db
    .query('workspaceMembers')
    .withIndex('by_workspace_user', (queryBuilder) =>
      queryBuilder.eq('workspaceId', workspaceId).eq('userId', userId),
    )
    .unique();
};

export const assertWorkspaceReadAccess = async (
  ctx: PermissionContext,
  workspaceId: string,
  userId: string,
) => {
  const membership = await getWorkspaceMembership(ctx, workspaceId, userId);

  if (!membership) {
    throw new UnauthorizedError(AUTHORIZATION_ERROR_MESSAGES.readDenied);
  }

  return membership;
};

export const assertWorkspaceWriteAccess = async (
  ctx: PermissionContext,
  workspaceId: string,
  userId: string,
) => {
  const membership = await assertWorkspaceReadAccess(ctx, workspaceId, userId);

  if (membership.role !== 'owner') {
    throw new UnauthorizedError(AUTHORIZATION_ERROR_MESSAGES.writeDenied);
  }

  return membership;
};

export const assertWorkspaceMembership = assertWorkspaceReadAccess;
