Scaffold a new Next.js API route handler for "$ARGUMENTS".

## Step 1: Parse the request

Extract from $ARGUMENTS:

- **Route path**: the API endpoint (e.g. `/api/webhooks/clerk`, `/api/export`, `/api/og`)
- **HTTP methods**: which methods to handle (GET, POST, PUT, DELETE)
- **Auth requirement**: public, authenticated (Clerk), or webhook (signature verification)
- **Purpose**: what the endpoint does

If the description is ambiguous, ask the user to clarify before proceeding.

## Step 2: Study existing patterns

Read these files to match project conventions:

| Pattern                              | Reference file                |
| ------------------------------------ | ----------------------------- |
| Simple GET endpoint                  | `src/app/api/health/route.ts` |
| Root layout (for middleware context) | `src/app/layout.tsx`          |
| Server env access                    | `src/lib/env/server.ts`       |

Key conventions:

- Route handlers live in `src/app/api/<path>/route.ts`
- Export named functions: `GET`, `POST`, `PUT`, `DELETE` (not default exports)
- Use `NextResponse.json()` for JSON responses
- Use `NextRequest` type for the request parameter
- Access headers with `request.headers.get('key')`
- Access query params with `new URL(request.url).searchParams`
- Access body with `await request.json()` for POST/PUT
- Use server-only env vars from `src/lib/env/server.ts`
- Use `const` for handler functions

## Step 3: Show the plan

Before writing any files, present:

```
Route: /api/<path>
File: src/app/api/<path>/route.ts
Methods: [GET | POST | PUT | DELETE]
Auth: [public | Clerk auth | webhook signature]

Response shape:
  { field: type, ... }
```

Wait for the user to confirm before proceeding.

## Step 4: Create the route handler

**Public GET endpoint:**

```ts
import { NextResponse } from 'next/server';

const GET = () => {
  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
  });
};

export { GET };
```

**Authenticated endpoint (Clerk):**

```ts
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const POST = async (request: NextRequest) => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Process request...

  return NextResponse.json({ ok: true });
};

export { POST };
```

**Webhook endpoint (signature verification):**

```ts
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

const POST = async (request: NextRequest) => {
  const headerPayload = await headers();
  const signature = headerPayload.get('x-webhook-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  }

  // Verify signature...

  const body = await request.json();

  // Process webhook...

  return NextResponse.json({ ok: true });
};

export { POST };
```

**Dynamic route with params:**

```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

const GET = async (_request: NextRequest, context: RouteContext) => {
  const { id } = await context.params;

  return NextResponse.json({ id });
};

export { GET };
```

## Step 5: Update middleware (if needed)

If the route needs special middleware handling (e.g. excluding from Clerk auth), check `middleware.ts` and suggest changes.

## Step 6: Verify

Run `yarn typecheck` and `yarn lint:check`. Report any issues found.
