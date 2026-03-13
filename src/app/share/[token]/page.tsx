import type { Metadata } from 'next';

type SharePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export const metadata: Metadata = {
  title: 'Shared presentation',
  description: 'View a shared present.fast presentation.',
};

const SharedPresentationPage = async ({ params }: SharePageProps) => {
  const { token } = await params;

  return (
    <main className="min-h-screen px-6 py-10 md:px-10">
      <section className="mx-auto w-full max-w-4xl space-y-4">
        <h1 className="text-3xl font-semibold">Shared presentation</h1>
        <p className="text-muted-foreground text-sm">
          Public share route is enabled for tokenized links. Token:
          <span className="text-foreground ml-2 font-mono">{token}</span>
        </p>
      </section>
    </main>
  );
};

export default SharedPresentationPage;
