import './globals.css';
import '@/styles/tokens.css';
import '@/styles/themes.css';
import '@/styles/utilities.css';

import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';

import { AuthHeader } from '@/components/auth/auth-header';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

import { AppProviders } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });

export const metadata: Metadata = {
  title: {
    default: 'present.fast',
    template: '%s | present.fast',
  },
  description: 'A fast way to build presentations from markdown files.',
};

type RootLayoutProps = {
  children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en" suppressHydrationWarning className={cn(inter.variable, jetbrainsMono.variable)}>
      <body className="bg-background text-foreground antialiased">
        <ClerkProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <AppProviders>
              <AuthHeader />
              {children}
            </AppProviders>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
};

export default RootLayout;
