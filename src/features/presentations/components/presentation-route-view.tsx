'use client';

import { useQuery } from 'convex/react';
import Link from 'next/link';

import { routes } from '@/config/routes';

import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';
import PresentationDisplayScaffold from './presentation-display-scaffold';
import PresentationEditor from './presentation-editor';
import PresentationSnapshot from './presentation-snapshot';

type PresentationRouteAccess =
  | { status: 'unauthenticated' }
  | { status: 'forbidden' }
  | { status: 'not_found' }
  | {
      status: 'authorized';
      canWrite: boolean;
      viewerRole: 'owner' | 'member';
      presentation: {
        _id: Id<'presentations'>;
        title: string;
        markdownContent: string;
        updatedAt: number;
      };
    };

type PresentationRouteViewProps = {
  presentationId: string;
  mode: 'edit' | 'display';
};

const PresentationRouteView = ({ presentationId, mode }: PresentationRouteViewProps) => {
  const accessResult = useQuery(api.presentations.queries.getPresentationRouteAccess as any, {
    presentationId: presentationId as Id<'presentations'>,
  }) as PresentationRouteAccess | undefined;

  if (accessResult === undefined) {
    return (
      <main className="min-h-screen px-6 py-10 md:px-10">
        <section className="mx-auto w-full max-w-4xl">
          <p className="text-muted-foreground text-sm">Loading presentation...</p>
        </section>
      </main>
    );
  }

  switch (accessResult.status) {
    case 'unauthenticated':
      return (
        <main className="min-h-screen px-6 py-10 md:px-10">
          <section className="mx-auto w-full max-w-4xl space-y-3">
            <h1 className="text-2xl font-semibold">Login required</h1>
            <p className="text-muted-foreground text-sm">
              Please sign in to access this presentation.
            </p>
            <Link
              className="text-primary text-sm underline underline-offset-4"
              href={routes.signIn}
            >
              Go to sign in
            </Link>
          </section>
        </main>
      );
    case 'forbidden':
      return (
        <main className="min-h-screen px-6 py-10 md:px-10">
          <section className="mx-auto w-full max-w-4xl space-y-3">
            <h1 className="text-2xl font-semibold">Not authorized</h1>
            <p className="text-muted-foreground text-sm">
              You are not authorized to access this presentation.
            </p>
            <Link
              className="text-primary text-sm underline underline-offset-4"
              href={routes.dashboard}
            >
              Return to dashboard
            </Link>
          </section>
        </main>
      );
    case 'not_found':
      return (
        <main className="min-h-screen px-6 py-10 md:px-10">
          <section className="mx-auto w-full max-w-4xl">
            <h1 className="text-2xl font-semibold">Presentation not found</h1>
          </section>
        </main>
      );
    case 'authorized':
      if (accessResult.canWrite) {
        if (mode === 'display') {
          return (
            <PresentationDisplayScaffold
              presentationId={accessResult.presentation._id as string}
              title={accessResult.presentation.title}
              markdownContent={accessResult.presentation.markdownContent}
              updatedAt={accessResult.presentation.updatedAt}
            />
          );
        }

        return (
          <PresentationEditor
            presentation={{
              _id: accessResult.presentation._id as string,
              title: accessResult.presentation.title,
              markdownContent: accessResult.presentation.markdownContent,
              updatedAt: accessResult.presentation.updatedAt,
            }}
          />
        );
      }

      return (
        <PresentationSnapshot
          title={accessResult.presentation.title}
          markdownContent={accessResult.presentation.markdownContent}
          updatedAt={accessResult.presentation.updatedAt}
          sharedAtLabel="You have read-only access to this presentation."
        />
      );
    default: {
      const exhaustiveStatus: never = accessResult;
      return exhaustiveStatus;
    }
  }
};

export default PresentationRouteView;
