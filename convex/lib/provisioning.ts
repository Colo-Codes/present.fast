import { requireAuth } from '../auth';
import { UnauthorizedError } from './errors';

type ProvisioningContext = {
  auth: {
    getUserIdentity: () => Promise<{ subject: string; email?: string; name?: string } | null>;
  };
  db: {
    query: (table: 'users' | 'workspaceMembers') => {
      withIndex: (
        index: string,
        callback: (queryBuilder: any) => unknown,
      ) => {
        unique: () => Promise<any>;
      };
    };
    insert: (
      table: 'users' | 'workspaces' | 'workspaceMembers',
      value: Record<string, unknown>,
    ) => Promise<any>;
    patch: (id: any, value: Record<string, unknown>) => Promise<void>;
  };
};

const getWorkspaceSlug = (clerkId: string) => {
  return `ws-${clerkId
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 18)}`;
};

export const ensureUserAndDefaultWorkspace = async (ctx: ProvisioningContext) => {
  const now = Date.now();
  const identity = await requireAuth(ctx);

  const existingUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', (queryBuilder) => queryBuilder.eq('clerkId', identity.clerkId))
    .unique();

  if (!existingUser) {
    const userId = await ctx.db.insert('users', {
      clerkId: identity.clerkId,
      email: identity.email,
      fullName: identity.fullName,
      avatarUrl: undefined,
      createdAt: now,
      updatedAt: now,
    });

    const workspaceId = await ctx.db.insert('workspaces', {
      name: `${identity.fullName ?? 'Personal'} Workspace`,
      slug: getWorkspaceSlug(identity.clerkId),
      createdByUserId: userId,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(userId, {
      defaultWorkspaceId: workspaceId,
      updatedAt: now,
    });

    await ctx.db.insert('workspaceMembers', {
      workspaceId,
      userId,
      role: 'owner',
      createdAt: now,
      updatedAt: now,
    });

    return { userId, workspaceId, clerkId: identity.clerkId };
  }

  const existingWorkspaceId = existingUser.defaultWorkspaceId;
  if (existingWorkspaceId) {
    const membership = await ctx.db
      .query('workspaceMembers')
      .withIndex('by_workspace_user', (queryBuilder) =>
        queryBuilder.eq('workspaceId', existingWorkspaceId).eq('userId', existingUser._id),
      )
      .unique();

    if (!membership) {
      await ctx.db.insert('workspaceMembers', {
        workspaceId: existingWorkspaceId,
        userId: existingUser._id,
        role: 'owner',
        createdAt: now,
        updatedAt: now,
      });
    }

    await ctx.db.patch(existingUser._id, {
      email: identity.email ?? existingUser.email,
      fullName: identity.fullName ?? existingUser.fullName,
      updatedAt: now,
    });

    return {
      userId: existingUser._id,
      workspaceId: existingWorkspaceId,
      clerkId: identity.clerkId,
    };
  }

  const workspaceId = await ctx.db.insert('workspaces', {
    name: `${identity.fullName ?? 'Personal'} Workspace`,
    slug: getWorkspaceSlug(identity.clerkId),
    createdByUserId: existingUser._id,
    createdAt: now,
    updatedAt: now,
  });

  await ctx.db.patch(existingUser._id, {
    defaultWorkspaceId: workspaceId,
    email: identity.email ?? existingUser.email,
    fullName: identity.fullName ?? existingUser.fullName,
    updatedAt: now,
  });

  await ctx.db.insert('workspaceMembers', {
    workspaceId,
    userId: existingUser._id,
    role: 'owner',
    createdAt: now,
    updatedAt: now,
  });

  return { userId: existingUser._id, workspaceId, clerkId: identity.clerkId };
};

export const resolveCurrentUserWorkspaceOrThrow = async (ctx: ProvisioningContext) => {
  const identity = await requireAuth(ctx);

  const existingUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', (queryBuilder) => queryBuilder.eq('clerkId', identity.clerkId))
    .unique();

  if (!existingUser) {
    throw new UnauthorizedError('User profile does not exist. Run bootstrapCurrentUser first.');
  }

  const workspaceId = existingUser.defaultWorkspaceId;
  if (!workspaceId) {
    throw new UnauthorizedError(
      'Default workspace does not exist. Run bootstrapCurrentUser first.',
    );
  }

  const membership = await ctx.db
    .query('workspaceMembers')
    .withIndex('by_workspace_user', (queryBuilder) =>
      queryBuilder.eq('workspaceId', workspaceId).eq('userId', existingUser._id),
    )
    .unique();

  if (!membership) {
    throw new UnauthorizedError('Workspace membership does not exist.');
  }

  return {
    userId: existingUser._id,
    workspaceId,
    clerkId: identity.clerkId,
  };
};
