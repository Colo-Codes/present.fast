import { describe, expect, it } from 'vitest';

import type { UnauthorizedError } from '../../../convex/lib/errors';
import {
  assertWorkspaceReadAccess,
  assertWorkspaceWriteAccess,
  AUTHORIZATION_ERROR_MESSAGES,
  getUserByClerkIdOrThrow,
} from '../../../convex/lib/permissions';

type MockMembership = {
  workspaceId: string;
  userId: string;
  role: 'owner' | 'member';
};

type MockUser = {
  _id: string;
  clerkId: string;
};

const createPermissionsContext = ({
  membership,
  user,
}: {
  membership: MockMembership | null;
  user: MockUser | null;
}) => {
  return {
    db: {
      query: (table: 'users' | 'workspaceMembers') => ({
        withIndex: (index: string) => ({
          unique: async () => {
            if (table === 'users' && index === 'by_clerk_id') {
              return user;
            }

            if (table === 'workspaceMembers' && index === 'by_workspace_user') {
              return membership;
            }

            return null;
          },
        }),
      }),
    },
  };
};

describe('permissions helper authorization policy', () => {
  it('allows owner to read and write', async () => {
    const ctx = createPermissionsContext({
      user: { _id: 'user_1', clerkId: 'clerk_1' },
      membership: {
        workspaceId: 'ws_1',
        userId: 'user_1',
        role: 'owner',
      },
    });

    await expect(assertWorkspaceReadAccess(ctx as any, 'ws_1', 'user_1')).resolves.toEqual(
      expect.objectContaining({ role: 'owner' }),
    );
    await expect(assertWorkspaceWriteAccess(ctx as any, 'ws_1', 'user_1')).resolves.toEqual(
      expect.objectContaining({ role: 'owner' }),
    );
  });

  it('allows member to read but denies write', async () => {
    const ctx = createPermissionsContext({
      user: { _id: 'user_1', clerkId: 'clerk_1' },
      membership: {
        workspaceId: 'ws_1',
        userId: 'user_1',
        role: 'member',
      },
    });

    await expect(assertWorkspaceReadAccess(ctx as any, 'ws_1', 'user_1')).resolves.toEqual(
      expect.objectContaining({ role: 'member' }),
    );
    await expect(assertWorkspaceWriteAccess(ctx as any, 'ws_1', 'user_1')).rejects.toThrowError(
      AUTHORIZATION_ERROR_MESSAGES.writeDenied,
    );
  });

  it('denies non-members for read and write', async () => {
    const ctx = createPermissionsContext({
      user: { _id: 'user_1', clerkId: 'clerk_1' },
      membership: null,
    });

    await expect(assertWorkspaceReadAccess(ctx as any, 'ws_2', 'user_1')).rejects.toThrowError(
      AUTHORIZATION_ERROR_MESSAGES.readDenied,
    );
    await expect(assertWorkspaceWriteAccess(ctx as any, 'ws_2', 'user_1')).rejects.toThrowError(
      AUTHORIZATION_ERROR_MESSAGES.readDenied,
    );
  });

  it('throws when user profile does not exist', async () => {
    const ctx = createPermissionsContext({
      user: null,
      membership: null,
    });

    await expect(getUserByClerkIdOrThrow(ctx as any, 'missing_clerk')).rejects.toEqual(
      expect.objectContaining<Partial<UnauthorizedError>>({
        message: AUTHORIZATION_ERROR_MESSAGES.userMissing,
      }),
    );
  });
});
