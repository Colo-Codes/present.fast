import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Presentation',
  description: 'Redirect to the presentation library.',
};

const PresentationPage = async () => {
  redirect('/dashboard');
};

export default PresentationPage;
