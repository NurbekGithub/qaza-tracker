# AGENTS.md

App for tracking qaza prayers for Muslims. Keep the UI minimal and the UX as simple as possible. Stack: React 19 + TanStack Router (file-based), Tailwind CSS v4, shadcn/ui (base-vega style, backed by `@base-ui/react`), InstantDB for data with offline sync.

## Conventions

- No comments in code unless explicitly requested (per repo style).
- Prefer shadcn/ui components over hand-rolled markup to keep the UI consistent and minimal.
- UI must be mobile-first: design for small screens by default, then enhance for larger viewports.

Detailed guidance lives in `.opencode/skills/` (bun scripts, routing, import paths, styling, InstantDB, task verification) and is surfaced automatically by the agent when relevant.

## Weekly email reports

- Server-side email code lives in `emails/weekly-report/` (self-contained, relative imports only — Vercel `api/` functions do not support tsconfig path mappings like `#/`).
- `api/weekly-report.ts` is the Vercel Function triggered by cron (`0 13 * * 0` = Sundays 13:00 UTC in `vercel.json`, always UTC). Guarded by `CRON_SECRET` bearer auth; accepts `?email=` and `?dry=1` params for manual runs.
- Emails are sent via the Resend HTTP API. Env vars: `RESEND_API_KEY`, `EMAIL_FROM`, `APP_URL`, `INSTANT_APP_ADMIN_TOKEN`, `INSTANT_APP_ID` (falls back to `VITE_INSTANT_APP_ID`).
- Manual testing: `bun run email:test <email>`, `bun run email:test --demo <email>`, `bun run email:preview [email]` (writes `emails/preview.html`, gitignored), `bun run email:send-all [--dry-run]` — entry point `scripts/send-weekly-email.ts`. Add `--lang en|kk` to force a language.
- Users with zero remaining qaza and zero activity in the last 7 days are skipped in bulk runs.
- Emails are localized with catalogs hardcoded in `emails/weekly-report/messages.ts` (not paraglide/`messages/*.json`). The locale comes from the `userPrefs` entity (`ownerId` unique), written by `src/lib/locale-prefs.ts` on language switch.
