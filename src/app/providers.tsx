'use client';

import { useAuth } from '@clerk/nextjs';
import type { ReactNode } from 'react';

import { AuthBootstrap } from '@/features/auth/components/auth-bootstrap';
import { ConvexProviderWithClerk } from '@/features/auth/components/convex-provider-with-clerk';
import { getConvexClient } from '@/lib/convex/client';

type AppProvidersProps = {
  children: ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps) => {
  const convex = getConvexClient();

  if (!convex) {
    return <>{children}</>;
  }

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <AuthBootstrap />
      {children}
    </ConvexProviderWithClerk>
  );
};
