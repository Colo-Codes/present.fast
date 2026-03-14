---
name: commit-pr
description: Divide all uncommitted branch changes into logical, layered commits following present.fast conventions. Presents a plan for user approval before making any commits.
also_command: true
disable-model-invocation: true
---

# Commit PR Changes

Divide all uncommitted changes on the current branch into logical commits and create them one by one — **only after user approval**.

## Step 1: Discover changes

Run these in parallel:

- `git status` — all untracked and modified files
- `git diff HEAD --stat` — what has changed and how much
- `git log main...HEAD --oneline` — commits already on this branch (avoid duplicating them)
- `git branch --show-current` — extract the ticket number

Extract the ticket number from the branch name (e.g. `feat/PF-042-slide-editor` → `PF-042`). If the branch name contains no ticket number, note this and use `PF-XXX` as a placeholder.

## Step 2: Group changes into logical commits

Analyse the changed files and group them into **cohesive, independent commits**. Each commit should represent one logical unit of work that a reviewer can understand without reading all the others.

Commit in this order so each commit builds on the previous:

| Priority | Group                   | Typical files                                                                                   |
| -------- | ----------------------- | ----------------------------------------------------------------------------------------------- |
| 1        | Convex schema & backend | `convex/schema.ts`, `convex/<domain>/mutations.ts`, `convex/<domain>/queries.ts`, `convex/lib/` |
| 2        | Backend helpers & auth  | `convex/auth.ts`, `convex/lib/permissions.ts`, `convex/lib/provisioning.ts`, `convex/actions/`  |
| 3        | Shared UI components    | `src/components/ui/`, `src/components/layout/`                                                  |
| 4        | Feature components      | `src/features/<feature>/`, `src/components/<feature>/`                                          |
| 5        | Pages & routes          | `src/app/**/page.tsx`, `src/app/**/layout.tsx`, `src/app/api/`                                  |
| 6        | Config & infra          | `src/config/`, `src/lib/`, `src/hooks/`, `src/types/`                                           |
| 7        | Styles & theme          | `src/styles/`, `tailwind.config.ts`                                                             |
| 8        | Tests                   | `src/tests/**/*.test.ts`, `src/tests/**/*.spec.ts`                                              |
| 9        | Docs & tooling          | `docs/`, `.claude/`, `README.md`, config files                                                  |

If all changes belong to a single logical group, use one commit — don't split artificially.

## Step 3: Present the plan

For each proposed commit, show:

```
Proposed commits for PF-XXX (<branch-name>):

  1. <type>(<scope>): PF-XXX <message>
       path/to/file
       path/to/file

  2. <type>(<scope>): PF-XXX <message>
       path/to/file
       ...

<N files total across N commits>
```

## Commit message format

Follow Conventional Commits:

```
<type>(<scope>): PF-XXX <summary>
```

- **type**: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `build`, `ci`, `chore`
- **scope**: `convex`, `ui`, `auth`, `slides`, `api`, `config`, `deps`, `docs`
- **summary**: imperative mood, lowercase, 15-72 chars, no period
- **Co-Authored-By**: always append `Co-Authored-By: Claude <noreply@anthropic.com>` trailer

Example: `feat(slides): PF-042 add slide deck navigation controls`

## Step 4: Execute (after approval)

For each approved commit:

1. `git add <file1> <file2> ...` — stage only the files for this commit
2. Verify staged files match the plan: `git diff --cached --stat`
3. Create the commit with the agreed message and `Co-Authored-By` trailer
4. Verify: `git log --oneline -1`
5. Move to the next commit

If a pre-commit hook fails, **stop immediately** — report the error and do not retry with `--no-verify`.

## Rules

- **Never commit** `.next/`, `node_modules/`, or `.env*` files
- **Never commit** `convex/_generated/` — these are auto-generated
- Each commit must leave the project in a buildable state
- If TypeScript errors exist, report them and stop — do not commit broken code
- Use `git add <specific files>`, never `git add .` or `git add -A`
