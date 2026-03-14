import { describe, expect, it, vi } from 'vitest';

import { AUTHORIZATION_ERROR_MESSAGES } from '../../../convex/lib/permissions';
import { updatePresentationMarkdown } from '../../../convex/presentations/mutations';

vi.mock('../../../convex/_generated/server', () => ({
  mutation: (definition: unknown) => definition,
}));

vi.mock('../../../convex/lib/provisioning', () => ({
  ensureUserAndDefaultWorkspace: async () => ({
    userId: 'user_a',
    workspaceId: 'workspace_a',
  }),
}));

type MockMembership = {
  workspaceId: string;
  userId: string;
  role: 'owner' | 'member';
};

const createMutationContext = ({
  presentationWorkspaceId,
  membership,
}: {
  presentationWorkspaceId: string;
  membership: MockMembership | null;
}) => {
  return {
    db: {
      get: async (id: string) => {
        if (id === 'presentation_1') {
          return {
            _id: 'presentation_1',
            workspaceId: presentationWorkspaceId,
            title: 'Deck',
            markdownContent: '# Existing',
            updatedAt: 1700000000000,
          };
        }

        return null;
      },
      patch: async () => undefined,
      query: (table: 'workspaceMembers') => ({
        withIndex: (index: string, indexBuilder?: (queryBuilder: any) => any) => {
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

          return {
            unique: async () => null,
          };
        },
      }),
    },
  };
};

describe('presentation mutation authorization', () => {
  it('denies cross-workspace write attempts', async () => {
    const ctx = createMutationContext({
      presentationWorkspaceId: 'workspace_b',
      membership: null,
    });

    await expect(
      (updatePresentationMarkdown as any).handler(ctx, {
        presentationId: 'presentation_1',
        markdownContent: '# New content',
      }),
    ).rejects.toThrowError(AUTHORIZATION_ERROR_MESSAGES.readDenied);
  });
});
