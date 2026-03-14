---
name: clerk-auth
description: Clerk authentication patterns for the present.fast project. Use when implementing auth flows, protecting routes, or integrating Clerk with Convex.
---

# Clerk Authentication Conventions — present.fast

## Architecture overview

```
Clerk (auth UI + JWT) → Convex (JWT validation + user provisioning) → App
```

- **Clerk** handles sign-in/sign-up UI and issues JWTs
- **Convex** validates JWTs via `auth.config.ts` and provides `ctx.auth.getUserIdentity()`
- **User provisioning** auto-creates Convex user + workspace on first auth

## Provider setup

Root layout wraps the app in this order:

```
ClerkProvider → ThemeProvider → AppProviders (ConvexProviderWithClerk)
```

The `AppProviders` component checks if Convex is configured and gracefully degrades if not (keyless-first local development).

## Client-side auth

### Conditional UI with Clerk components

```tsx
'use client';

import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

<Show when="signed-out">
  <SignInButton mode="modal">
    <Button variant="outline">Sign in</Button>
  </SignInButton>
</Show>

<Show when="signed-in">
  <UserButton />
</Show>
```

### Auth state in client components

```tsx
'use client';

import { useConvexAuth } from 'convex/react';

const { isLoading, isAuthenticated } = useConvexAuth();
```

Or for Clerk-specific state:

```tsx
import { useAuth, useUser } from '@clerk/nextjs';

const { isLoaded, isSignedIn, getToken } = useAuth();
const { user } = useUser();
```

### Auth bootstrap pattern

The `AuthBootstrap` component runs after Convex is ready and calls `bootstrapCurrentUser` mutation once:

```tsx
'use client';

import { useConvexAuth, useMutation } from 'convex/react';
import { useEffect, useRef } from 'react';
import { api } from '../../../../convex/_generated/api';

export const AuthBootstrap = () => {
  const hasTriggeredBootstrap = useRef(false);
  const bootstrapCurrentUser = useMutation(api.users.mutations.bootstrapCurrentUser);
  const { isLoading, isAuthenticated } = useConvexAuth();

  useEffect(() => {
    if (isLoading || !isAuthenticated || hasTriggeredBootstrap.current) return;
    hasTriggeredBootstrap.current = true;
    void bootstrapCurrentUser({});
  }, [bootstrapCurrentUser, isLoading, isAuthenticated]);

  return null;
};
```

**Key:** Use `useRef` to prevent double-calls in React strict mode.

## Server-side auth

### Protected pages

```tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const ProtectedPage = async () => {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  return <main>{/* Protected content */}</main>;
};
```

### Auth in API routes

```tsx
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export const GET = async () => {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ...
};
```

## Convex-side auth

### requireAuth helper

```ts
// convex/auth.ts
export const requireAuth = async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  return {
    clerkId: identity.subject,
    email: identity.email,
    fullName: identity.name,
  };
};
```

### In mutations/queries

```ts
// Always call provisioning first
const { userId, workspaceId } = await ensureUserAndDefaultWorkspace(ctx);
await assertWorkspaceMembership(ctx, workspaceId, userId);
```

## Sign-in/sign-up pages

Use Clerk's catch-all route pattern:

```
src/app/sign-in/[[...sign-in]]/page.tsx
src/app/sign-up/[[...sign-up]]/page.tsx
```

```tsx
import { SignIn } from '@clerk/nextjs';

const SignInPage = () => (
  <main className="container-page flex min-h-screen items-center justify-center">
    <SignIn />
  </main>
);
```

## Environment variables

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Client | Clerk public key (optional locally) |
| `CLERK_SECRET_KEY` | Server | Clerk secret key (optional locally) |
| `CLERK_JWT_ISSUER_DOMAIN` | Server | For Convex JWT validation |

## Key rules

- Never expose `CLERK_SECRET_KEY` in client code
- Use `useConvexAuth()` (not `useAuth()`) when checking auth state that gates Convex operations
- Always provision users server-side in Convex, not client-side
- Public routes (like `/share/[token]`) should not require auth — use Convex public queries instead
