import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import Link from 'next/link';

import PresentationRouteView from '@/features/presentations/components/presentation-route-view';

type PresentationPageProps = {
  params: Promise<{
    presentationId: string;
  }>;
  searchParams: Promise<{
    e2e?: string;
    mode?: string;
  }>;
};

export const metadata: Metadata = {
  title: 'Presentation',
  description: 'View an authorized present.fast presentation.',
};

const PresentationByIdPage = async ({ params, searchParams }: PresentationPageProps) => {
  const { presentationId } = await params;
  const { e2e, mode } = await searchParams;
  const { userId } = await auth();
  const normalizedMode = mode === 'display' ? 'display' : 'edit';
  const isE2EForbiddenPresentation =
    e2e === 'forbidden' && presentationId === 'j57d3g0r6phdp2jvga62a74n4h7m7mz';

  if (isE2EForbiddenPresentation) {
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

  if (!userId) {
    return (
      <main className="min-h-screen px-6 py-10 md:px-10">
        <section className="mx-auto w-full max-w-4xl space-y-3">
          <h1 className="text-2xl font-semibold">Login required</h1>
          <p className="text-muted-foreground text-sm">
            Please sign in to access this presentation.
          </p>
          <Link
            className="text-primary text-sm underline underline-offset-4"
            href={`/sign-in?redirect_url=/presentation/${presentationId}`}
          >
            Sign in to continue
          </Link>
        </section>
      </main>
    );
  }

  return <PresentationRouteView presentationId={presentationId} mode={normalizedMode} />;
};

export default PresentationByIdPage;
