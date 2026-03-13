import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { SlideDeck } from '@/components/slides/slide-deck';

export const metadata: Metadata = {
  title: 'Presentation',
  description: 'View an interactive present.fast presentation.',
};

const PresentationPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <main>
      <SlideDeck />
    </main>
  );
};

export default PresentationPage;
