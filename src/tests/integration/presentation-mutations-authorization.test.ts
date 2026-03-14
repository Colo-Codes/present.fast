import { describe, expect, it, vi } from 'vitest';

import { AUTHORIZATION_ERROR_MESSAGES } from '../../../convex/lib/permissions';
import {
  createPresentation,
  updatePresentationMarkdown,
} from '../../../convex/presentations/mutations';

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
      insert: async () => 'presentation_created',
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
  it('creates untitled presentation when title is omitted', async () => {
    const insertSpy = vi.fn(async () => 'presentation_created');
    const ctx = {
      db: {
        insert: insertSpy,
        get: async () => null,
        patch: async () => undefined,
        query: () => ({
          withIndex: () => ({
            unique: async () => ({
              workspaceId: 'workspace_a',
              userId: 'user_a',
              role: 'owner',
            }),
          }),
        }),
      },
    };

    const result = await (createPresentation as any).handler(ctx, {});

    expect(result).toEqual({
      presentationId: 'presentation_created',
      workspaceId: 'workspace_a',
    });
    expect(insertSpy).toHaveBeenCalledWith(
      'presentations',
      expect.objectContaining({
        title: 'Untitled presentation',
        markdownContent: '',
      }),
    );
  });

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

  it('rejects empty titles while saving markdown', async () => {
    const ctx = createMutationContext({
      presentationWorkspaceId: 'workspace_a',
      membership: {
        workspaceId: 'workspace_a',
        userId: 'user_a',
        role: 'owner',
      },
    });

    await expect(
      (updatePresentationMarkdown as any).handler(ctx, {
        presentationId: 'presentation_1',
        markdownContent: '# New content',
        title: '   ',
      }),
    ).rejects.toThrowError('Title cannot be empty.');
  });

  it('saves markdown and title for owners', async () => {
    const patchSpy = vi.fn(async () => undefined);
    const ctx = {
      db: {
        get: async (id: string) => {
          if (id === 'presentation_1') {
            return {
              _id: 'presentation_1',
              workspaceId: 'workspace_a',
              title: 'Deck',
              markdownContent: '# Existing',
              updatedAt: 1700000000000,
            };
          }

          return null;
        },
        patch: patchSpy,
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
                    builderValues.workspaceId === 'workspace_a' &&
                    builderValues.userId === 'user_a'
                  ) {
                    return {
                      workspaceId: 'workspace_a',
                      userId: 'user_a',
                      role: 'owner',
                    };
                  }

                  return null;
                },
              };
            }

            return { unique: async () => null };
          },
        }),
      },
    };

    const result = await (updatePresentationMarkdown as any).handler(ctx, {
      presentationId: 'presentation_1',
      markdownContent: '# Saved content',
      title: 'Renamed deck',
    });

    expect(result).toEqual(
      expect.objectContaining({
        presentationId: 'presentation_1',
        title: 'Renamed deck',
      }),
    );
    expect(typeof result.updatedAt).toBe('number');
    expect(patchSpy).toHaveBeenCalledWith('presentation_1', {
      markdownContent: '# Saved content',
      title: 'Renamed deck',
      updatedAt: result.updatedAt,
    });
  });
});
