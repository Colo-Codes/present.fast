Scaffold a new Next.js App Router page for "$ARGUMENTS".

## Step 1: Parse the request

Extract from $ARGUMENTS:

- **Route path**: the URL path (e.g. `/settings`, `/workspace/[id]`, `/admin`)
- **Access control**: public, authenticated, or specific role
- **Page type**: static, dynamic (with params), or catch-all

If the description is ambiguous, ask the user to clarify before proceeding.

## Step 2: Study existing patterns

Read these files to match project conventions:

| Pattern                      | Reference file                            |
| ---------------------------- | ----------------------------------------- |
| Static public page           | `src/app/page.tsx`                        |
| Protected page (server auth) | `src/app/dashboard/page.tsx`              |
| Dynamic route with params    | `src/app/share/[token]/page.tsx`          |
| Clerk sign-in catch-all      | `src/app/sign-in/[[...sign-in]]/page.tsx` |
| Route group layout           | `src/app/(app)/layout.tsx`                |
| Root layout with providers   | `src/app/layout.tsx`                      |
| Route config                 | `src/config/routes.ts` (if it exists)     |

Key conventions:

- Pages are server components by default — only add `'use client'` when the page itself needs interactivity
- Keep pages thin — delegate to feature components
- Define `export const metadata: Metadata` for SEO on server component pages
- In Next.js 15+, `params` is a `Promise` and must be awaited
- Protected pages use `await auth()` from `@clerk/nextjs/server` and `redirect('/sign-in')` if no userId
- Use route groups `(groupName)` for shared layouts without affecting URL paths
- Responsive layout: `className="min-h-screen px-6 py-6 md:px-10"`

## Step 3: Show the plan

Before writing any files, present:

```
Route: /path/to/page
File: src/app/path/to/page/page.tsx
Type: [static | dynamic | catch-all]
Auth: [public | protected (server redirect) | protected (client)]

Additional files (if needed):
  - src/app/path/to/page/layout.tsx  (if custom layout needed)
  - src/app/path/to/page/loading.tsx (if Suspense boundary needed)
  - src/app/path/to/page/error.tsx   (if error boundary needed)
```

Wait for the user to confirm before proceeding.

## Step 4: Create the page

**Public static page:**

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description.',
};

const MyPage = () => {
  return <main className="min-h-screen px-6 py-6 md:px-10">{/* Page content */}</main>;
};

export default MyPage;
```

**Protected page (server auth):**

```tsx
import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description.',
};

const ProtectedPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <main className="min-h-screen px-6 py-6 md:px-10">
      {/* Protected content — delegate to feature components */}
    </main>
  );
};

export default ProtectedPage;
```

**Dynamic route with params:**

```tsx
type PageProps = {
  params: Promise<{ slug: string }>;
};

const DynamicPage = async ({ params }: PageProps) => {
  const { slug } = await params;

  return <main className="min-h-screen px-6 py-6 md:px-10">{/* Use slug */}</main>;
};

export default DynamicPage;
```

## Step 5: Wire up navigation (if needed)

If the page should appear in navigation, check and update:

- `src/config/routes.ts` (add route constant)
- Any navigation components that render links

## Step 6: Verify

Run `yarn typecheck` and `yarn lint:check`. Report any issues found.
