'use client';

import { useMutation } from 'convex/react';
import { ArrowLeft, ChevronRight, Loader2, MonitorPlay, Save } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { routes } from '@/config/routes';

import { api } from '../../../../convex/_generated/api';

type PresentationEditorProps = {
  presentation: {
    _id: string;
    title: string;
    markdownContent: string;
    updatedAt: number;
  };
};

const formatUpdatedAt = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

const PresentationEditor = ({ presentation }: PresentationEditorProps) => {
  const updatePresentationMarkdown = useMutation(
    api.presentations.mutations.updatePresentationMarkdown as any,
  );

  const [draftTitle, setDraftTitle] = useState(presentation.title);
  const [draftMarkdown, setDraftMarkdown] = useState(presentation.markdownContent);
  const [lastSavedTitle, setLastSavedTitle] = useState(presentation.title);
  const [lastSavedMarkdown, setLastSavedMarkdown] = useState(presentation.markdownContent);
  const [lastSavedAt, setLastSavedAt] = useState(presentation.updatedAt);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveStatusMessage, setSaveStatusMessage] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);

  const isDirty = useMemo(() => {
    return draftTitle !== lastSavedTitle || draftMarkdown !== lastSavedMarkdown;
  }, [draftMarkdown, draftTitle, lastSavedMarkdown, lastSavedTitle]);

  useEffect(() => {
    setDraftTitle(presentation.title);
    setDraftMarkdown(presentation.markdownContent);
    setLastSavedTitle(presentation.title);
    setLastSavedMarkdown(presentation.markdownContent);
    setLastSavedAt(presentation.updatedAt);
    setSaveError(null);
    setSaveStatusMessage(null);
    setTitleError(null);
  }, [presentation._id, presentation.markdownContent, presentation.title, presentation.updatedAt]);

  useEffect(() => {
    if (!isDirty) {
      setDraftTitle(presentation.title);
      setDraftMarkdown(presentation.markdownContent);
      setLastSavedTitle(presentation.title);
      setLastSavedMarkdown(presentation.markdownContent);
      setLastSavedAt(presentation.updatedAt);
    }
  }, [isDirty, presentation.markdownContent, presentation.title, presentation.updatedAt]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  const handleSave = async () => {
    const normalizedTitle = draftTitle.trim();
    if (!normalizedTitle) {
      setTitleError('Title cannot be empty.');
      setSaveStatusMessage(null);
      return;
    }

    setTitleError(null);
    setSaveError(null);
    setSaveStatusMessage(null);
    setIsSaving(true);

    try {
      const result = await updatePresentationMarkdown({
        presentationId: presentation._id,
        markdownContent: draftMarkdown,
        title: normalizedTitle,
      });

      setDraftTitle(result.title);
      setLastSavedTitle(result.title);
      setLastSavedMarkdown(draftMarkdown);
      setLastSavedAt(result.updatedAt);
      setSaveStatusMessage('Saved changes.');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save presentation.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (titleError) {
      setTitleError(null);
    }
    if (saveStatusMessage) {
      setSaveStatusMessage(null);
    }
    setDraftTitle(event.target.value);
  };

  const handleMarkdownChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (saveStatusMessage) {
      setSaveStatusMessage(null);
    }
    setDraftMarkdown(event.target.value);
  };

  return (
    <main className="min-h-screen px-6 py-10 md:px-10">
      <section className="mx-auto w-full max-w-4xl space-y-6" aria-busy={isSaving}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Breadcrumb">
            <ol className="text-muted-foreground flex items-center gap-1 text-sm">
              <li>
                <Link className="hover:text-foreground transition-colors" href={routes.dashboard}>
                  Dashboard
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-4" />
              </li>
              <li className="text-foreground" aria-current="page">
                {draftTitle.trim() || 'Untitled presentation'}
              </li>
            </ol>
          </nav>

          <Button asChild type="button" variant="outline">
            <Link href={routes.dashboard} aria-label="Back to dashboard">
              <ArrowLeft className="mr-2 size-4" />
              Back to dashboard
            </Link>
          </Button>
        </div>

        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">Presentation editor</h1>
          <p className="text-muted-foreground text-sm">
            Last saved {formatUpdatedAt(lastSavedAt)}.
          </p>
        </header>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="presentation-title">
            Title
          </label>
          <input
            id="presentation-title"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            value={draftTitle}
            onChange={handleTitleChange}
            aria-required="true"
            aria-invalid={Boolean(titleError)}
            aria-describedby={titleError ? 'presentation-title-error' : undefined}
            placeholder="Untitled presentation"
          />
          {titleError ? (
            <p
              id="presentation-title-error"
              className="text-destructive text-sm"
              role="alert"
              aria-live="assertive"
            >
              {titleError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="presentation-markdown">
            Markdown content
          </label>
          <Textarea
            id="presentation-markdown"
            value={draftMarkdown}
            onChange={handleMarkdownChange}
            placeholder="Paste or write markdown..."
            className="min-h-[320px] font-mono text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={handleSave} disabled={isSaving || !isDirty}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                Save
              </>
            )}
          </Button>
          <Button asChild type="button" variant="outline">
            <Link href={routes.presentationDisplayById(presentation._id)} aria-label="Display saved slides">
              <MonitorPlay className="mr-2 size-4" />
              Display saved slides
            </Link>
          </Button>
          <p className="text-muted-foreground text-xs" aria-live="polite">
            {isDirty ? 'Unsaved changes.' : 'All changes saved.'}
          </p>
        </div>
        <p className="text-muted-foreground text-xs">Display mode renders the latest saved content.</p>

        {saveStatusMessage ? (
          <p className="text-sm text-emerald-600" aria-live="polite">
            {saveStatusMessage}
          </p>
        ) : null}

        {saveError ? (
          <p className="text-destructive text-sm" role="alert" aria-live="assertive">
            {saveError}
          </p>
        ) : null}
      </section>
    </main>
  );
};

export default PresentationEditor;
