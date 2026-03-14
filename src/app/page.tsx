import { ArrowRight, FileText, LayoutTemplate, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Home',
  description: 'present.fast turns markdown files into polished presentations.',
};

const productFeatures = [
  {
    title: 'Markdown-first authoring',
    description: 'Write slides in markdown and keep your presentation content versioned with Git.',
    icon: FileText,
  },
  {
    title: 'Deck templates',
    description: 'Start from presentation layouts tailored for demos, pitches, and internal docs.',
    icon: LayoutTemplate,
  },
  {
    title: 'Fast publishing flow',
    description: 'Draft, preview, and share presentations from one dashboard experience.',
    icon: Sparkles,
  },
] as const;

const HomePage = () => {
  return (
    <main className="min-h-screen px-6 py-10 md:px-10">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="space-y-4">
          <Badge variant="secondary">SaaS Preview</Badge>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            Build beautiful presentations from markdown files.
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base md:text-lg">
            present.fast helps teams turn markdown into reusable, shareable slide decks with a
            simple product workflow.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg">
              <Link href="/dashboard" aria-label="Open dashboard">
                Open dashboard
                <ArrowRight data-icon="inline-end" className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard" aria-label="View presentation library">
                View presentation library
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {productFeatures.map((feature) => {
            const FeatureIcon = feature.icon;
            return (
              <Card key={feature.title} className="h-full">
                <CardHeader className="space-y-3">
                  <FeatureIcon className="text-primary size-5" aria-hidden="true" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm">
                  {feature.description}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default HomePage;
