import { v } from 'convex/values';

import { mutation } from '../_generated/server';
import { assertWorkspaceWriteAccess } from '../lib/permissions';
import { ensureUserAndDefaultWorkspace } from '../lib/provisioning';

const DEFAULT_PRESENTATION_TITLE = 'Untitled presentation';
const DEFAULT_MARKDOWN_CONTENT = '';

const normalizeTitle = (title: string | undefined) => {
  const trimmedTitle = title?.trim();
  if (!trimmedTitle) {
    return DEFAULT_PRESENTATION_TITLE;
  }

  return trimmedTitle;
};

export const createPresentation = mutation({
  args: {
    title: v.optional(v.string()),
    markdownContent: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const { userId, workspaceId } = await ensureUserAndDefaultWorkspace(ctx);
    await assertWorkspaceWriteAccess(ctx, workspaceId, userId);

    const now = Date.now();
    const presentationId = await ctx.db.insert('presentations', {
      workspaceId,
      createdByUserId: userId,
      title: normalizeTitle(args.title),
      markdownContent: args.markdownContent ?? DEFAULT_MARKDOWN_CONTENT,
      isPublicShareEnabled: false,
      shareToken: undefined,
      createdAt: now,
      updatedAt: now,
    });

    return { presentationId, workspaceId };
  },
});

export const updatePresentationMarkdown = mutation({
  args: {
    presentationId: v.id('presentations'),
    markdownContent: v.string(),
    title: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const { userId } = await ensureUserAndDefaultWorkspace(ctx);
    const presentation = await ctx.db.get(args.presentationId);

    if (!presentation) {
      throw new Error('Presentation not found.');
    }

    await assertWorkspaceWriteAccess(ctx, presentation.workspaceId, userId);

    const nextTitle = args.title.trim();
    if (!nextTitle) {
      throw new Error('Title cannot be empty.');
    }

    const updatedAt = Date.now();
    await ctx.db.patch(args.presentationId, {
      markdownContent: args.markdownContent,
      title: nextTitle,
      updatedAt,
    });

    return { presentationId: args.presentationId, updatedAt, title: nextTitle };
  },
});

export const setPresentationShareState = mutation({
  args: {
    presentationId: v.id('presentations'),
    isPublicShareEnabled: v.boolean(),
  },
  handler: async (ctx: any, args: any) => {
    const { userId } = await ensureUserAndDefaultWorkspace(ctx);
    const presentation = await ctx.db.get(args.presentationId);

    if (!presentation) {
      throw new Error('Presentation not found.');
    }

    await assertWorkspaceWriteAccess(ctx, presentation.workspaceId, userId);

    const shareToken = args.isPublicShareEnabled
      ? crypto.randomUUID().replace(/-/g, '')
      : undefined;

    await ctx.db.patch(args.presentationId, {
      isPublicShareEnabled: args.isPublicShareEnabled,
      shareToken,
      updatedAt: Date.now(),
    });

    return { presentationId: args.presentationId, shareToken };
  },
});
