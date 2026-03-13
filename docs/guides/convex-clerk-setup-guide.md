# Convex + Clerk Setup Guide (Next.js App Router)

This guide is the practical reference for setting up and debugging Convex + Clerk in this project. It reflects hard-won lessons from real setup issues.

## What this app uses

- Next.js 16 App Router (uses `src/proxy.ts` instead of legacy `middleware.ts`)
- Clerk auth (`@clerk/nextjs` v7+)
- Convex backend auth via Clerk JWT issuer (`convex/react-clerk`)

References:

- [Convex + Clerk (Next.js)](https://docs.convex.dev/auth/clerk#nextjs)
- [Clerk Convex integration](https://clerk.com/docs/guides/development/integrations/databases/convex)
- [Clerk JWT templates](https://clerk.com/docs/backend-requests/jwt-templates)
- [Convex auth debugging](https://docs.convex.dev/auth/debug)

---

## 1) Clerk Dashboard setup (do this first)

Two separate Clerk Dashboard steps are required. Missing either one causes silent auth failures.

### a) Activate the Convex integration

1. Go to [Clerk Dashboard → Convex integration](https://dashboard.clerk.com/apps/setup/convex).
2. Select your instance (Development).
3. Click **Activate Convex integration**.
4. Copy the **Frontend API URL** shown (e.g. `https://wondrous-feline-74.clerk.accounts.dev`).

This adds the `aud: "convex"` claim to your session token. However, **this alone is not enough** — `convex/react-clerk` fetches tokens via `getToken({ template: "convex" })`, which requests a separate JWT template, not the session token.

### b) Create the "convex" JWT template (critical)

1. Go to [Clerk Dashboard → JWT Templates](https://dashboard.clerk.com/~/jwt-templates).
2. Click **New template**.
3. Select the **Convex** preset (or create a blank template).
4. Ensure:
   - **Template name** is exactly `convex` (lowercase).
   - **Claims** include `{ "aud": "convex" }`.
5. Save.

> **Why both steps?** The Convex integration page adds `aud: "convex"` to session tokens. But `convex/react-clerk` calls `getToken({ template: "convex" })`, which looks for a JWT template — a different token mechanism. Without the JWT template, `getToken` returns `null` and `ctx.auth.getUserIdentity()` returns `null` on the Convex backend.

---

## 2) Environment variables

### Local `.env`

```env
CONVEX_DEPLOYMENT=dev:<your-deployment>
NEXT_PUBLIC_CONVEX_URL=https://<your-deployment>.convex.cloud

CLERK_JWT_ISSUER_DOMAIN=https://<your-clerk-frontend-api-domain>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Convex deployment env (required separately)

Local `.env` does **not** configure the Convex cloud deployment. You must set `CLERK_JWT_ISSUER_DOMAIN` in the Convex deployment environment:

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN "https://<your-clerk-frontend-api-domain>"
```

Then sync:

```bash
npx convex dev
```

Verify with:

```bash
npx convex env list
```

---

## 3) Project wiring

### Middleware (`src/proxy.ts`)

Next.js 16 uses `proxy.ts` instead of `middleware.ts`. This file uses `clerkMiddleware()` from `@clerk/nextjs/server`:

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/presentation(.*)', '/app(.*)']);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});
```

### Providers (`src/app/layout.tsx` → `src/app/providers.tsx`)

The provider hierarchy must be: `ClerkProvider` → `ConvexProviderWithClerk` → app content.

- `ClerkProvider` wraps everything in `layout.tsx` (Server Component).
- `ConvexProviderWithClerk` lives in `providers.tsx` (Client Component), using `useAuth` from `@clerk/nextjs`.
- The `ConvexReactClient` is created once via `src/lib/convex/client.ts`.

### Auth-aware components

Use `useConvexAuth()` from `convex/react` — **not** Clerk's `useAuth()` — when checking if the user is authenticated for Convex operations. Clerk's `useAuth()` reports signed-in status before the Convex backend has validated the token.

```ts
// Correct — waits for Convex token validation
const { isLoading, isAuthenticated } = useConvexAuth();

// Wrong for Convex — only checks Clerk session status
const { isLoaded, isSignedIn } = useAuth();
```

### User bootstrap (`AuthBootstrap`)

The `AuthBootstrap` component in `src/features/auth/components/auth-bootstrap.tsx` automatically calls the `bootstrapCurrentUser` mutation once Convex reports `isAuthenticated: true`. This creates the user row and default workspace on first sign-in.

### Convex auth config (`convex/auth.config.ts`)

```ts
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: 'convex',
    },
  ],
};
```

---

## 4) Verification checklist

Run through these after setup:

1. `npx convex dev` runs without red config/module errors.
2. `convex/_generated/api.d.ts` and `convex/_generated/server.d.ts` are present.
3. Convex dashboard matches `CONVEX_DEPLOYMENT` and shows tables (`users`, `workspaces`, `workspaceMembers`, `presentations`).
4. Sign in via Clerk UI → a row appears in the `users` table.
5. Convex logs show no `Unauthorized` errors from `bootstrapCurrentUser`.

### Quick diagnostic if auth is broken

Create a temporary page that calls `getToken({ template: "convex" })` from Clerk's `useAuth()`:

```ts
const { getToken, isSignedIn } = useAuth();
const token = await getToken({ template: 'convex' });
```

- **Token is `null`** → The `convex` JWT template is missing in Clerk Dashboard.
- **Token exists but Convex still returns `null` identity** → `CLERK_JWT_ISSUER_DOMAIN` mismatch between Clerk and Convex deployment. Decode the token at [jwt.io](https://jwt.io) and compare `iss` with the domain in Convex Dashboard → Settings → Authentication.

---

## 5) Common failure modes and fixes

### `getUserIdentity()` returns `null` (most common)

Cause hierarchy (check in order):

1. **Missing JWT template**: The `convex` JWT template does not exist in Clerk Dashboard → JWT Templates. The Convex integration page alone is not enough.
2. **Missing Convex env var**: `CLERK_JWT_ISSUER_DOMAIN` not set in Convex deployment env (local `.env` is not used by Convex cloud).
3. **Domain mismatch**: The JWT `iss` claim doesn't match the domain in `convex/auth.config.ts`.
4. **Using `useAuth()` instead of `useConvexAuth()`**: The mutation fires before Convex has validated the token. Use `useConvexAuth()` to gate Convex operations.

### Error: `CLERK_JWT_ISSUER_DOMAIN` is not set

- Set only in local `.env`, not in Convex deployment env.
- Fix: `npx convex env set CLERK_JWT_ISSUER_DOMAIN "https://..."`.

### Error: file in `convex/actions/` has no `"use node"`

- Any module under `convex/actions/` requires `"use node";` as its first line.
- Fix: Add `"use node";` or move non-action files out of `convex/actions/`.

### Error: invalid Convex module path with hyphen

- Convex module paths cannot contain `-` (e.g. `action-names.ts`).
- Fix: Rename to camelCase or underscores (e.g. `actionNames.ts`).

### Error: `convex/crons.js` must default-export Crons

- Fix: `const crons = cronJobs(); export default crons;`

### Error: missing `http` default export

- Fix: `const http = httpRouter(); export default http;`

### Dashboard shows no tables

- `npx convex dev` failed before schema push, or wrong deployment selected.
- Fix: Resolve push errors, re-run `npx convex dev`, check the matching deployment.

### Queries throwing `Unauthorized` but mutations work (or vice versa)

- Convex queries cannot perform database writes. If provisioning logic (like creating a user row) is called from a query, it will fail silently or throw.
- Fix: Keep all write operations in mutations. Use read-only helpers in queries.

---

## 6) Production notes

- Configure production Clerk issuer domain and keys.
- Configure the same values in production Convex deployment env vars.
- Run `npx convex deploy` (not `dev`).

---

## 7) Do / Don't quick rules

**Do:**

- Use `src/proxy.ts` for Next.js 16 middleware (not `middleware.ts`).
- Use `clerkMiddleware()` from `@clerk/nextjs/server`.
- Use `useConvexAuth()` from `convex/react` to gate authenticated Convex operations.
- Use `Authenticated` / `Unauthenticated` from `convex/react` for conditional UI.
- Create **both** the Convex integration **and** the JWT template in Clerk Dashboard.
- Set `CLERK_JWT_ISSUER_DOMAIN` in the Convex deployment env (not just local `.env`).

**Don't:**

- Use Clerk's `useAuth()` to decide when to call Convex mutations (use `useConvexAuth()`).
- Use `Show when="signed-in"` from Clerk for components that need Convex auth (use `Authenticated`).
- Use `authMiddleware` (deprecated).
- Assume the Convex integration page in Clerk creates the JWT template (it doesn't — it only adds session claims).
- Assume local `.env` configures Convex cloud deployment.
- Perform database writes inside Convex queries (use mutations).
