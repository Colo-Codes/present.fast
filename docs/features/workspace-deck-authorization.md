# Workspace and Presentation Authorization

## Scope

This document summarizes the authorization behavior for workspace and presentation access after PF-001.

## Authorization Policy

- Workspace read access: `owner` and `member`.
- Workspace/presentation write access: `owner` only.
- Protected presentation route: `/presentation/[presentationId]`.
- Public share route: `/share/[token]` returns snapshot-style, read-only view only.

## Route Behavior

### Protected presentation route

- Signed-out users: see login-required prompt and sign-in path.
- Signed-in users without workspace membership: see explicit unauthorized message.
- Signed-in users with membership: can view presentation snapshot.

### Share route

- Valid token + sharing enabled: snapshot content is rendered.
- Invalid token or disabled sharing: route returns not found.

## Backend Enforcement

- Permission helpers are centralized in `convex/lib/permissions.ts`:
  - `assertWorkspaceReadAccess`
  - `assertWorkspaceWriteAccess`
- Presentation/workspace queries and mutations enforce these rules consistently.
- `upsertUserFromClerk` is hardened as an internal-only mutation with identity consistency checks.

## Testing Coverage

- Unit:
  - permission helper role matrix (`owner`, `member`, non-member)
- Integration:
  - route access authorization states
  - share token enabled/disabled behavior
- E2E:
  - signed-out protected route login prompt
  - signed-in unauthorized user explicit unauthorized message
  - valid share token snapshot render
  - invalid share token not found

## E2E Fixture Notes

- Deterministic E2E fixtures are URL-based so they work with reused local dev servers.
- Fixture URLs:
  - `/presentation/j57d3g0r6phdp2jvga62a74n4h7m7mz?e2e=forbidden`
  - `/share/e2e-valid-share-token?e2e=snapshot`
- This keeps authorization UX coverage stable without external auth seeding.
