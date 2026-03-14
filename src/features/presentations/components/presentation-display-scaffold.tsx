'use client';

import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import { SlideDeck } from '@/components/slides/slide-deck';
import { Button } from '@/components/ui/button';
import { routes } from '@/config/routes';
import { parsePresentationMarkdownToSlides } from '@/lib/presentation-markdown-to-slides';

type PresentationDisplayScaffoldProps = {
  presentationId: string;
  title: string;
  markdownContent: string;
  updatedAt: number;
};

const PresentationDisplayScaffold = ({
  presentationId,
  title,
  markdownContent,
  updatedAt,
}: PresentationDisplayScaffoldProps) => {
  const parsedSlides = useMemo(() => {
    try {
      return parsePresentationMarkdownToSlides(markdownContent);
    } catch {
      return null;
    }
  }, [markdownContent]);

  const editorHref = routes.presentationById(presentationId);
  const hasEmptyMarkdown = markdownContent.trim().length === 0;

  if (hasEmptyMarkdown) {
    return (
      <main className="min-h-screen px-6 py-10 md:px-10">
        <section className="mx-auto w-full max-w-4xl space-y-4">
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="text-muted-foreground text-sm">
            Display mode only renders saved slides. This presentation has no saved markdown yet.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild type="button">
              <Link href={editorHref} aria-label="Back to editor">
                <ArrowLeft className="mr-2 size-4" />
                Back to editor
              </Link>
            </Button>
            <Button asChild type="button" variant="outline">
              <Link href={routes.dashboard} aria-label="Back to dashboard">
                <LayoutDashboard className="mr-2 size-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  if (parsedSlides === null) {
    return (
      <main className="min-h-screen px-6 py-10 md:px-10">
        <section className="mx-auto w-full max-w-4xl space-y-4">
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="text-destructive text-sm" role="alert" aria-live="assertive">
            We could not render this saved markdown as slides. Please return to edit mode to update it.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild type="button">
              <Link href={editorHref} aria-label="Back to editor">
                <ArrowLeft className="mr-2 size-4" />
                Back to editor
              </Link>
            </Button>
            <Button asChild type="button" variant="outline">
              <Link href={routes.dashboard} aria-label="Back to dashboard">
                <LayoutDashboard className="mr-2 size-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  if (parsedSlides.length === 0) {
    return (
      <main className="min-h-screen px-6 py-10 md:px-10">
        <section className="mx-auto w-full max-w-4xl space-y-4">
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="text-muted-foreground text-sm">No slides were found in the saved markdown.</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild type="button">
              <Link href={editorHref} aria-label="Back to editor">
                <ArrowLeft className="mr-2 size-4" />
                Back to editor
              </Link>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className="relative">
      <div className="fixed top-4 left-6 z-60 flex items-center gap-2">
        <Button asChild type="button" size="sm" variant="outline">
          <Link href={editorHref} aria-label="Back to editor">
            <ArrowLeft className="mr-2 size-4" />
            Edit saved slides
          </Link>
        </Button>
        <Button asChild type="button" size="sm" variant="outline">
          <Link href={routes.dashboard} aria-label="Go to dashboard">
            <LayoutDashboard className="mr-2 size-4" />
            Dashboard
          </Link>
        </Button>
        <p className="text-muted-foreground bg-background/70 border-border/50 rounded-md border px-3 py-1.5 text-xs">
          Last saved {new Date(updatedAt).toLocaleString()}
        </p>
      </div>
      <SlideDeck slides={parsedSlides} presentationTitle={title} />
    </div>
  );
};

export default PresentationDisplayScaffold;
