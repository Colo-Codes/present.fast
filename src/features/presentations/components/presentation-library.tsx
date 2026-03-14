'use client';

import { useMutation, useQuery } from 'convex/react';
import { ArrowRight, ExternalLink, Loader2, Plus, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { routes } from '@/config/routes';

import { api } from '../../../../convex/_generated/api';

export const PresentationLibrary = () => {
  const router = useRouter();
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const [isCreatingPresentation, setIsCreatingPresentation] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [updatingSharePresentationId, setUpdatingSharePresentationId] = useState<string | null>(
    null,
  );

  if (!convexUrl) {
    return (
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Presentations</CardTitle>
          <CardDescription>
            Convex is not configured yet. Set `NEXT_PUBLIC_CONVEX_URL` to enable persistence.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const presentationResult = useQuery(
    api.presentations.queries.listPresentationsForCurrentWorkspace as any,
  );
  const createPresentation = useMutation(api.presentations.mutations.createPresentation as any);
  const setPresentationShareState = useMutation(
    api.presentations.mutations.setPresentationShareState as any,
  );

  const handleCreatePresentation = async () => {
    setIsCreatingPresentation(true);
    setPermissionError(null);

    try {
      const result = await createPresentation({});
      router.push(routes.presentationById(result.presentationId as string));
    } catch (error) {
      setPermissionError(error instanceof Error ? error.message : 'Unable to create presentation.');
    } finally {
      setIsCreatingPresentation(false);
    }
  };

  const handleToggleShare = async (presentationId: string, isPublicShareEnabled: boolean) => {
    setPermissionError(null);
    setUpdatingSharePresentationId(presentationId);

    try {
      await setPresentationShareState({
        presentationId,
        isPublicShareEnabled: !isPublicShareEnabled,
      });
    } catch (error) {
      setPermissionError(
        error instanceof Error ? error.message : 'Unable to update sharing permissions.',
      );
    } finally {
      setUpdatingSharePresentationId(null);
    }
  };

  const presentations = presentationResult?.presentations ?? [];
  const canWrite = presentationResult?.canWrite ?? false;
  const getShareButtonLabel = (isPublicShareEnabled: boolean, isUpdating: boolean) => {
    if (isUpdating) {
      return 'Updating...';
    }

    if (isPublicShareEnabled) {
      return 'Disable share';
    }

    return 'Enable share';
  };

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle>Presentations</CardTitle>
        <CardDescription>
          Create markdown-powered presentations and manage them from your personal workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {permissionError ? (
          <p className="text-destructive text-sm" role="alert" aria-live="assertive">
            {permissionError}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-muted-foreground text-sm">
            Start with an untitled presentation, then rename and edit from the editor.
          </p>
          <Button
            type="button"
            onClick={handleCreatePresentation}
            disabled={isCreatingPresentation || !canWrite}
          >
            {isCreatingPresentation ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 size-4" />
                Create presentation
              </>
            )}
          </Button>
        </div>
        {!canWrite && presentationResult !== undefined ? (
          <p className="text-muted-foreground text-xs">
            You have read-only access in this workspace. Only owners can create, edit, or share
            presentations.
          </p>
        ) : null}

        <div className="space-y-2">
          {presentationResult === undefined ? (
            <p className="text-muted-foreground text-sm">Loading your presentations...</p>
          ) : presentations.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No presentations yet. Create your first one.
            </p>
          ) : (
            presentations.map((presentation: any) => (
              <div
                key={presentation._id}
                className="border-border bg-card space-y-3 rounded-md border p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{presentation.title}</p>
                    <p className="text-muted-foreground text-xs">
                      Updated {new Date(presentation.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {presentation.isPublicShareEnabled ? 'Public share enabled' : 'Private'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={routes.presentationById(presentation._id as string)}
                      aria-label="Open presentation"
                    >
                      <ArrowRight className="mr-2 size-4" />
                      Open
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={!canWrite || updatingSharePresentationId === presentation._id}
                    onClick={() =>
                      handleToggleShare(
                        presentation._id as string,
                        Boolean(presentation.isPublicShareEnabled),
                      )
                    }
                    aria-label="Toggle public share"
                  >
                    <Share2 className="mr-2 size-4" />
                    {getShareButtonLabel(
                      Boolean(presentation.isPublicShareEnabled),
                      updatingSharePresentationId === presentation._id,
                    )}
                  </Button>
                  {presentation.isPublicShareEnabled && presentation.shareToken ? (
                    <Button asChild size="sm" variant="ghost">
                      <Link
                        href={`/share/${presentation.shareToken}`}
                        aria-label="Open shared presentation snapshot"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="mr-2 size-4" />
                        View shared snapshot
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
