---
name: nextjs-patterns
description: Next.js App Router conventions for the present.fast project. Use when creating or modifying routes, layouts, pages, API route handlers, or server actions.
---

# Next.js App Router Conventions — present.fast

## Route structure

```
src/app/
├── layout.tsx              # Root layout (ClerkProvider → ThemeProvider → AppProviders)
├── page.tsx                # Landing page
├── providers.tsx           # Client-side provider composition
├── globals.css             # Global style imports
├── (app)/                  # Protected app routes (route group)
│   ├── layout.tsx          # App layout wrapper
│   └── ...
├── dashboard/              # Dashboard page
│   └── page.tsx
├── presentation/           # Presentation editor
├── share/[token]/          # Public share route (dynamic)
│   └── page.tsx
├── sign-in/[[...sign-in]]/ # Clerk sign-in (catch-all)
│   └── page.tsx
├── sign-up/[[...sign-up]]/ # Clerk sign-up (catch-all)
│   └── page.tsx
└── api/                    # API route handlers
    └── health/
        └── route.ts
```

## Page patterns

### Server component page (default)

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page title',
  description: 'Page description.',
};

const MyPage = () => {
  return (
    <main className="min-h-screen px-6 py-6 md:px-10">
      {/* Page content */}
    </main>
  );
};

export default MyPage;
```

### Protected page with server auth

```tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const ProtectedPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return <main>{/* Protected content */}</main>;
};

export default ProtectedPage;
```

### Dynamic route with params (Next.js 15+)

```tsx
type PageProps = {
  params: Promise<{ token: string }>;
};

const DynamicPage = async ({ params }: PageProps) => {
  const { token } = await params;

  return <main>{/* Use token */}</main>;
};

export default DynamicPage;
```

**Important:** In Next.js 15+, `params` is a `Promise` and must be awaited.

## Layout patterns

### Root layout

```tsx
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/theme-provider';
import { AppProviders } from './providers';

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClerkProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <AppProviders>
              {children}
            </AppProviders>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
};
```

Provider nesting order: `ClerkProvider` → `ThemeProvider` → `AppProviders` (Convex)

### Route group layout

```tsx
const AppLayout = ({ children }: { children: ReactNode }) => {
  return <section className="bg-background min-h-screen">{children}</section>;
};

export default AppLayout;
```

Use `(groupName)` directories to group routes without affecting URL paths.

## API route handlers

```tsx
import { NextResponse } from 'next/server';

const GET = () => {
  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
  });
};

export { GET };
```

- Export named functions: `GET`, `POST`, `PUT`, `DELETE`
- Use `NextResponse.json()` for JSON responses
- Use `NextRequest` type for request parameter

## Providers pattern

```tsx
// src/app/providers.tsx
'use client';

import { useAuth } from '@clerk/nextjs';
import { ConvexProviderWithClerk } from '@/features/auth/components/convex-provider-with-clerk';
import { getConvexClient } from '@/lib/convex/client';

export const AppProviders = ({ children }: { children: ReactNode }) => {
  const convex = getConvexClient();

  if (!convex) {
    return <>{children}</>;
  }

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
};
```

- Check if Convex is configured before wrapping
- Gracefully degrade when backend is unavailable

## Key conventions

- **Server components by default** — only use `'use client'` when needed
- **Keep pages thin** — delegate to feature components
- **Metadata** — define `export const metadata` in server component pages
- **Loading states** — use `loading.tsx` for route-level Suspense
- **Error boundaries** — use `error.tsx` for route-level error handling
- **Redirects** — use `redirect()` from `next/navigation` (server-side)
- **Route config** — centralize paths in `src/config/routes.ts`

## Environment variables

- Client: `NEXT_PUBLIC_*` prefix, accessed in `src/lib/env/client.ts`
- Server: no prefix, accessed in `src/lib/env/server.ts`
- Never expose server env vars in client components
