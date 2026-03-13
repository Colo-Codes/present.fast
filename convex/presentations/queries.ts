import { v } from 'convex/values';

import { query } from '../_generated/server';
import { assertWorkspaceMembership } from '../lib/permissions';
import { resolveCurrentUserWorkspaceOrThrow } from '../lib/provisioning';

export const listPresentationsForCurrentWorkspace = query({
  args: {},
  handler: async (ctx: any) => {
    const { userId, workspaceId } = await resolveCurrentUserWorkspaceOrThrow(ctx);
    await assertWorkspaceMembership(ctx, workspaceId, userId);

    const presentations = await ctx.db
      .query('presentations')
      .withIndex('by_workspace_updated_at', (queryBuilder: any) =>
        queryBuilder.eq('workspaceId', workspaceId),
      )
      .order('desc')
      .collect();

    return presentations;
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

    await assertWorkspaceMembership(ctx, presentation.workspaceId, userId);
    return presentation;
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

    return presentation;
  },
});
