'use client';

import { useConvexAuth, useMutation } from 'convex/react';
import { useEffect, useRef } from 'react';

import { api } from '../../../../convex/_generated/api';

export const AuthBootstrap = () => {
  const hasTriggeredBootstrap = useRef(false);
  const bootstrapCurrentUser = useMutation(api.users.mutations.bootstrapCurrentUser as any);
  const { isLoading, isAuthenticated } = useConvexAuth();

  useEffect(() => {
    if (isLoading || !isAuthenticated || hasTriggeredBootstrap.current) {
      return;
    }

    hasTriggeredBootstrap.current = true;
    void bootstrapCurrentUser({});
  }, [bootstrapCurrentUser, isLoading, isAuthenticated]);

  return null;
};
