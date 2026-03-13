import { query } from '../_generated/server';
import { assertWorkspaceMembership } from '../lib/permissions';
import { resolveCurrentUserWorkspaceOrThrow } from '../lib/provisioning';

export const getCurrentWorkspace = query({
  args: {},
  handler: async (ctx: any) => {
    const { userId, workspaceId } = await resolveCurrentUserWorkspaceOrThrow(ctx);
    await assertWorkspaceMembership(ctx, workspaceId, userId);

    const workspace = await ctx.db.get(workspaceId);
    return workspace;
  },
});
