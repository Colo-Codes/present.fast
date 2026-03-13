'use client';

import { useMutation, useQuery } from 'convex/react';
import { Loader2, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { api } from '../../../../convex/_generated/api';

export const PresentationLibrary = () => {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const [newPresentationTitle, setNewPresentationTitle] = useState('');
  const [isCreatingPresentation, setIsCreatingPresentation] = useState(false);

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

  const presentations = useQuery(
    api.presentations.queries.listPresentationsForCurrentWorkspace as any,
  );
  const createPresentation = useMutation(api.presentations.mutations.createPresentation as any);

  const handleCreatePresentation = async () => {
    const trimmedTitle = newPresentationTitle.trim();
    if (!trimmedTitle) {
      return;
    }

    setIsCreatingPresentation(true);

    try {
      await createPresentation({ title: trimmedTitle });
      setNewPresentationTitle('');
    } finally {
      setIsCreatingPresentation(false);
    }
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
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-10 rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            aria-label="New presentation title"
            placeholder="e.g. My Q2 Product Demo"
            value={newPresentationTitle}
            onChange={(event) => setNewPresentationTitle(event.target.value)}
          />
          <Button
            type="button"
            onClick={handleCreatePresentation}
            disabled={!newPresentationTitle.trim() || isCreatingPresentation}
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

        <div className="space-y-2">
          {presentations === undefined ? (
            <p className="text-muted-foreground text-sm">Loading your presentations...</p>
          ) : presentations.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No presentations yet. Create your first one.
            </p>
          ) : (
            presentations.map((presentation: any) => (
              <div
                key={presentation._id}
                className="border-border bg-card flex items-center justify-between rounded-md border p-3"
              >
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
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
