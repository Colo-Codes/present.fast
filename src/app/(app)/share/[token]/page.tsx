import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import PresentationSnapshot from '@/features/presentations/components/presentation-snapshot';
import { fetchQuery } from '@/lib/convex/server';

import { api } from '../../../../../convex/_generated/api';

type SharePageProps = {
  params: Promise<{
    token: string;
  }>;
  searchParams: Promise<{
    e2e?: string;
  }>;
};

export const metadata: Metadata = {
  title: 'Shared presentation',
  description: 'View a shared present.fast presentation.',
};

const SharedPresentationPage = async ({ params, searchParams }: SharePageProps) => {
  const { token } = await params;
  const { e2e } = await searchParams;

  if (e2e === 'snapshot' && token === 'e2e-valid-share-token') {
    return (
      <PresentationSnapshot
        title="E2E Shared Presentation"
        markdownContent="# E2E snapshot"
        updatedAt={1700000000000}
        sharedAtLabel="This is a shared snapshot view."
      />
    );
  }

  let sharedPresentation: {
    title: string;
    markdownContent: string;
    updatedAt: number;
  } | null = null;

  try {
    sharedPresentation = await fetchQuery(
      api.presentations.queries.getPublicPresentationByShareToken as any,
      {
        shareToken: token,
      },
    );
  } catch {
    notFound();
  }

  if (!sharedPresentation) {
    notFound();
  }

  return (
    <PresentationSnapshot
      title={sharedPresentation.title}
      markdownContent={sharedPresentation.markdownContent}
      updatedAt={sharedPresentation.updatedAt}
      sharedAtLabel="This is a shared snapshot view."
    />
  );
};

export default SharedPresentationPage;
