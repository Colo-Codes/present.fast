import { auth } from '@clerk/nextjs/server';
import { FolderOpenDot } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { PresentationLibrary } from '@/features/presentations/components/presentation-library';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your markdown presentations in present.fast.',
};

const DashboardPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <main className="min-h-screen px-6 py-6 md:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">present.fast</p>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
          </div>
          <nav className="flex items-center gap-2" aria-label="Dashboard navigation">
            <Button asChild variant="ghost">
              <Link href="/" aria-label="Go to home page">
                Home
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="#presentation-workspace" aria-label="Go to presentation workspace">
                Presentation workspace
              </Link>
            </Button>
            <ThemeToggle />
          </nav>
        </header>

        <section aria-label="My presentations">
          <Card>
            <CardHeader className="space-y-2">
              <Badge variant="secondary">My Presentations</Badge>
              <CardTitle className="flex items-center gap-2">
                <FolderOpenDot className="text-primary size-5" aria-hidden="true" />
                Your library is ready
              </CardTitle>
              <CardDescription>
                In the next phase this area will list markdown-based presentations you create and
                manage.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <p className="text-muted-foreground text-sm">
                Use the presentation workspace below to create presentations and open authorized
                `/presentation/[presentationId]` routes.
              </p>
            </CardContent>
          </Card>
        </section>

        <section id="presentation-workspace" aria-label="Presentation workspace">
          <PresentationLibrary />
        </section>
      </div>
    </main>
  );
};

export default DashboardPage;
