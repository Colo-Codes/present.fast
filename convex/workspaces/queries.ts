import { query } from '../_generated/server';
import { assertWorkspaceReadAccess } from '../lib/permissions';
import { resolveCurrentUserWorkspaceOrThrow } from '../lib/provisioning';

export const getCurrentWorkspace = query({
  args: {},
  handler: async (ctx: any) => {
    const { userId, workspaceId } = await resolveCurrentUserWorkspaceOrThrow(ctx);
    await assertWorkspaceReadAccess(ctx, workspaceId, userId);

    const workspace = await ctx.db.get(workspaceId);
    return workspace;
  },
});
