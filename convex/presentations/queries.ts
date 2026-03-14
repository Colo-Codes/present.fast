import { v } from 'convex/values';

import { query } from '../_generated/server';
import {
  assertWorkspaceReadAccess,
  getUserByClerkIdOrThrow,
  getWorkspaceMembership,
} from '../lib/permissions';
import { resolveCurrentUserWorkspaceOrThrow } from '../lib/provisioning';

export const listPresentationsForCurrentWorkspace = query({
  args: {},
  handler: async (ctx: any) => {
    const { userId, workspaceId } = await resolveCurrentUserWorkspaceOrThrow(ctx);
    const membership = await assertWorkspaceReadAccess(ctx, workspaceId, userId);

    const presentations = await ctx.db
      .query('presentations')
      .withIndex('by_workspace_updated_at', (queryBuilder: any) =>
        queryBuilder.eq('workspaceId', workspaceId),
      )
      .order('desc')
      .collect();

    return {
      presentations,
      viewerRole: membership.role,
      canWrite: membership.role === 'owner',
    };
  },
});

export const getPresentationById = query({
  args: {
    presentationId: v.id('presentations'),
  },
  handler: async (ctx: any, args: any) => {
    const { userId } = await resolveCurrentUserWorkspaceOrThrow(ctx);
    const presentation = await ctx.db.get(args.presentationId);

    if (!presentation) {
      return null;
    }

    await assertWorkspaceReadAccess(ctx, presentation.workspaceId, userId);
    return presentation;
  },
});

export const getPresentationRouteAccess = query({
  args: {
    presentationId: v.id('presentations'),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return { status: 'unauthenticated' as const };
    }

    const user = await getUserByClerkIdOrThrow(ctx, identity.subject);
    const presentation = await ctx.db.get(args.presentationId);

    if (!presentation) {
      return { status: 'not_found' as const };
    }

    const membership = await getWorkspaceMembership(ctx, presentation.workspaceId, user._id);
    if (!membership) {
      return { status: 'forbidden' as const };
    }

    return {
      status: 'authorized' as const,
      canWrite: membership.role === 'owner',
      viewerRole: membership.role,
      presentation,
    };
  },
});

export const getPublicPresentationByShareToken = query({
  args: {
    shareToken: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const presentation = await ctx.db
      .query('presentations')
      .withIndex('by_share_token', (queryBuilder: any) =>
        queryBuilder.eq('shareToken', args.shareToken),
      )
      .unique();

    if (!presentation || !presentation.isPublicShareEnabled) {
      return null;
    }

    return {
      presentationId: presentation._id,
      title: presentation.title,
      markdownContent: presentation.markdownContent,
      updatedAt: presentation.updatedAt,
      sharedAt: presentation.updatedAt,
    };
  },
});
