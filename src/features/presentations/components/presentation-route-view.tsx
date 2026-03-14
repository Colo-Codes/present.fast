'use client';

import { useQuery } from 'convex/react';
import Link from 'next/link';

import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';
import PresentationSnapshot from './presentation-snapshot';

type PresentationRouteViewProps = {
  presentationId: string;
};

const PresentationRouteView = ({ presentationId }: PresentationRouteViewProps) => {
  const accessResult = useQuery(api.presentations.queries.getPresentationRouteAccess as any, {
    presentationId: presentationId as Id<'presentations'>,
  });

  if (accessResult === undefined) {
    return (
      <main className="min-h-screen px-6 py-10 md:px-10">
        <section className="mx-auto w-full max-w-4xl">
          <p className="text-muted-foreground text-sm">Loading presentation...</p>
        </section>
      </main>
    );
  }

  if (accessResult.status === 'unauthenticated') {
    return (
      <main className="min-h-screen px-6 py-10 md:px-10">
        <section className="mx-auto w-full max-w-4xl space-y-3">
          <h1 className="text-2xl font-semibold">Login required</h1>
          <p className="text-muted-foreground text-sm">
            Please sign in to access this presentation.
          </p>
          <Link className="text-primary text-sm underline underline-offset-4" href="/sign-in">
            Go to sign in
          </Link>
        </section>
      </main>
    );
  }

  if (accessResult.status === 'forbidden') {
    return (
      <main className="min-h-screen px-6 py-10 md:px-10">
        <section className="mx-auto w-full max-w-4xl space-y-3">
          <h1 className="text-2xl font-semibold">Not authorized</h1>
          <p className="text-muted-foreground text-sm">
            You are not authorized to access this deck.
          </p>
          <Link className="text-primary text-sm underline underline-offset-4" href="/dashboard">
            Return to dashboard
          </Link>
        </section>
      </main>
    );
  }

  if (accessResult.status === 'not_found') {
    return (
      <main className="min-h-screen px-6 py-10 md:px-10">
        <section className="mx-auto w-full max-w-4xl">
          <h1 className="text-2xl font-semibold">Presentation not found</h1>
        </section>
      </main>
    );
  }

  return (
    <PresentationSnapshot
      title={accessResult.presentation.title}
      markdownContent={accessResult.presentation.markdownContent}
      updatedAt={accessResult.presentation.updatedAt}
      sharedAtLabel={
        accessResult.canWrite
          ? 'You have owner access to this deck.'
          : 'You have read-only access to this deck.'
      }
    />
  );
};

export default PresentationRouteView;
