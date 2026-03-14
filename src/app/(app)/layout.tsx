import type { ReactNode } from 'react';

import { AuthHeader } from '@/features/auth/components/auth-header';

type AppLayoutProps = {
  children: ReactNode;
};

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <section className="bg-background min-h-screen">
      <AuthHeader />
      {children}
    </section>
  );
};

export default AppLayout;
