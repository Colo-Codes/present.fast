Run all code quality checks for this project in sequence and report results. This is a pre-commit / pre-push validation.

1. Run `yarn lint:check` — report any ESLint errors/warnings.
2. Run `yarn typecheck` — report any TypeScript errors.
3. Run `yarn build` — verify the Next.js production build succeeds.

If all three pass, summarise with a single "All checks passed" message.

If any check fails, stop at the first failure, report the errors concisely, and suggest fixes — but do NOT auto-fix without asking.

**Shortcut:** `yarn check:all` runs lint, typecheck, and build in sequence. You may use it instead of running each step individually, but if it fails, re-run the individual commands to isolate which step failed.
