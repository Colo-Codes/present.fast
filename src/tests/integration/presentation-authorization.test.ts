import { describe, expect, it, vi } from 'vitest';

import {
  getPresentationRouteAccess,
  getPublicPresentationByShareToken,
} from '../../../convex/presentations/queries';

vi.mock('../../../convex/_generated/server', () => ({
  query: (definition: unknown) => definition,
}));

type MockPresentation = {
  _id: string;
  workspaceId: string;
  title: string;
  markdownContent: string;
  updatedAt: number;
  isPublicShareEnabled: boolean;
  shareToken?: string;
};

type MockUser = {
  _id: string;
  clerkId: string;
};

type MockMembership = {
  workspaceId: string;
  userId: string;
  role: 'owner' | 'member';
};

const createQueryContext = ({
  identitySubject,
  user,
  presentationById,
  presentationByToken,
  membership,
}: {
  identitySubject: string | null;
  user: MockUser | null;
  presentationById: MockPresentation | null;
  presentationByToken: MockPresentation | null;
  membership: MockMembership | null;
}) => {
  return {
    auth: {
      getUserIdentity: async () =>
        identitySubject
          ? {
              subject: identitySubject,
            }
          : null,
    },
    db: {
      get: async (id: string) => {
        if (presentationById?._id === id) {
          return presentationById;
        }

        return null;
      },
      query: (table: 'users' | 'workspaceMembers' | 'presentations') => ({
        withIndex: (index: string, indexBuilder?: (queryBuilder: any) => any) => {
          if (table === 'users' && index === 'by_clerk_id') {
            return {
              unique: async () => user,
            };
          }

          if (table === 'workspaceMembers' && index === 'by_workspace_user') {
            const builderValues: Record<string, string> = {};
            indexBuilder?.({
              eq: (field: string, value: string) => {
                builderValues[field] = value;
                return {
                  eq: (nestedField: string, nestedValue: string) => {
                    builderValues[nestedField] = nestedValue;
                    return {};
                  },
                };
              },
            });

            return {
              unique: async () => {
                if (
                  membership &&
                  membership.workspaceId === builderValues.workspaceId &&
                  membership.userId === builderValues.userId
                ) {
                  return membership;
                }

                return null;
              },
            };
          }

          if (table === 'presentations' && index === 'by_share_token') {
            const builderValues: Record<string, string> = {};
            indexBuilder?.({
              eq: (field: string, value: string) => {
                builderValues[field] = value;
                return {};
              },
            });

            return {
              unique: async () =>
                presentationByToken?.shareToken === builderValues.shareToken
                  ? presentationByToken
                  : null,
            };
          }

          return {
            unique: async () => null,
          };
        },
      }),
    },
  };
};

describe('presentation authorization queries', () => {
  it('returns forbidden for signed-in users outside the workspace', async () => {
    const ctx = createQueryContext({
      identitySubject: 'clerk_user_a',
      user: { _id: 'user_a', clerkId: 'clerk_user_a' },
      presentationById: {
        _id: 'presentation_1',
        workspaceId: 'workspace_b',
        title: 'Deck',
        markdownContent: '# Deck',
        updatedAt: 1700000000000,
        isPublicShareEnabled: false,
      },
      presentationByToken: null,
      membership: null,
    });

    const result = await (getPresentationRouteAccess as any).handler(ctx, {
      presentationId: 'presentation_1',
    });

    expect(result).toEqual({ status: 'forbidden' });
  });

  it('returns authorized when user belongs to deck workspace', async () => {
    const ctx = createQueryContext({
      identitySubject: 'clerk_owner',
      user: { _id: 'user_owner', clerkId: 'clerk_owner' },
      presentationById: {
        _id: 'presentation_1',
        workspaceId: 'workspace_1',
        title: 'Deck',
        markdownContent: '# Deck',
        updatedAt: 1700000000000,
        isPublicShareEnabled: false,
      },
      presentationByToken: null,
      membership: {
        workspaceId: 'workspace_1',
        userId: 'user_owner',
        role: 'owner',
      },
    });

    const result = await (getPresentationRouteAccess as any).handler(ctx, {
      presentationId: 'presentation_1',
    });

    expect(result).toEqual(
      expect.objectContaining({
        status: 'authorized',
        canWrite: true,
        viewerRole: 'owner',
        presentation: expect.objectContaining({
          title: 'Deck',
          markdownContent: '# Deck',
        }),
      }),
    );
  });

  it('returns authorized read-only payload for workspace members', async () => {
    const ctx = createQueryContext({
      identitySubject: 'clerk_member',
      user: { _id: 'user_member', clerkId: 'clerk_member' },
      presentationById: {
        _id: 'presentation_1',
        workspaceId: 'workspace_1',
        title: 'Deck',
        markdownContent: '# Deck',
        updatedAt: 1700000000000,
        isPublicShareEnabled: false,
      },
      presentationByToken: null,
      membership: {
        workspaceId: 'workspace_1',
        userId: 'user_member',
        role: 'member',
      },
    });

    const result = await (getPresentationRouteAccess as any).handler(ctx, {
      presentationId: 'presentation_1',
    });

    expect(result).toEqual(
      expect.objectContaining({
        status: 'authorized',
        canWrite: false,
        viewerRole: 'member',
      }),
    );
  });
});

describe('public share token query', () => {
  it('returns null when sharing is disabled', async () => {
    const ctx = createQueryContext({
      identitySubject: null,
      user: null,
      presentationById: null,
      presentationByToken: {
        _id: 'presentation_1',
        workspaceId: 'workspace_1',
        title: 'Private Deck',
        markdownContent: '# Private',
        updatedAt: 1700000000000,
        isPublicShareEnabled: false,
        shareToken: 'token_private',
      },
      membership: null,
    });

    const result = await (getPublicPresentationByShareToken as any).handler(ctx, {
      shareToken: 'token_private',
    });

    expect(result).toBeNull();
  });

  it('returns snapshot payload when sharing is enabled with valid token', async () => {
    const ctx = createQueryContext({
      identitySubject: null,
      user: null,
      presentationById: null,
      presentationByToken: {
        _id: 'presentation_1',
        workspaceId: 'workspace_1',
        title: 'Shared Deck',
        markdownContent: '# Shared',
        updatedAt: 1700000000000,
        isPublicShareEnabled: true,
        shareToken: 'token_public',
      },
      membership: null,
    });

    const result = await (getPublicPresentationByShareToken as any).handler(ctx, {
      shareToken: 'token_public',
    });

    expect(result).toEqual({
      presentationId: 'presentation_1',
      title: 'Shared Deck',
      markdownContent: '# Shared',
      updatedAt: 1700000000000,
      sharedAt: 1700000000000,
    });
  });
});
