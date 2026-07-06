<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Qaza Tracker app. The following changes were made:

- **`vite.config.ts`** — Added a reverse proxy routing `/ingest` to the EU PostHog ingestion endpoint, so all analytics traffic flows through your own domain (better ad-blocker resilience).
- **`src/routes/__root.tsx`** — Wrapped the root component in `PostHogProvider` (from `@posthog/react`), initialising PostHog with your project token and EU host. Exception capture is enabled.
- **`src/routes/index.tsx`** — Added `usePostHog()` and capture calls in the `openDialog`, `increase`, and `decrease` handlers to track the three core prayer-tracking interactions.
- **`src/components/account-button.tsx`** — Added capture for `account_link_started` (guest clicking "Save data") and `user_signed_out` (authenticated user signing out), plus `posthog.reset()` on sign-out to unlink future events from the session.
- **`src/components/upgrade-account-form.tsx`** — Added capture for `magic_code_requested` (email submitted) and `account_linked` (verification successful), plus `posthog.identify()` on successful link and `posthog.captureException()` in both error paths.

| Event name               | Description                                                  | File                                      |
| ------------------------ | ------------------------------------------------------------ | ----------------------------------------- |
| `prayer_dialog_opened`   | User opens the detail dialog for a specific prayer           | `src/routes/index.tsx`                    |
| `prayer_count_decreased` | User decreases a prayer's qaza count (one qaza prayed)       | `src/routes/index.tsx`                    |
| `prayer_count_increased` | User increases a prayer's qaza count (adding makeup prayers) | `src/routes/index.tsx`                    |
| `account_link_started`   | Guest user clicks "Save data" to begin account linking       | `src/components/account-button.tsx`       |
| `magic_code_requested`   | User submits their email for a magic code                    | `src/components/upgrade-account-form.tsx` |
| `account_linked`         | User successfully verifies the code and links their account  | `src/components/upgrade-account-form.tsx` |
| `user_signed_out`        | Authenticated user signs out                                 | `src/components/account-button.tsx`       |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://eu.posthog.com/project/217589/dashboard/798389)
- [Prayers Completed Over Time](https://eu.posthog.com/project/217589/insights/eevnKoVX)
- [Account Linking Funnel](https://eu.posthog.com/project/217589/insights/DUjgzVpp)
- [Daily Active Practitioners](https://eu.posthog.com/project/217589/insights/tdjpQdFR)
- [Prayers Increased vs Decreased](https://eu.posthog.com/project/217589/insights/ND5MEGhG)
- [Account Linked — Total](https://eu.posthog.com/project/217589/insights/36474rKM)

## Verify before merging

- [ ] Run a full production build (`bun run build`) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `VITE_PUBLIC_POSTHOG_PROJECT_TOKEN` and `VITE_PUBLIC_POSTHOG_HOST` to `.env.example` and any onboarding scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or a bundler plugin) into CI so production stack traces de-minify for error tracking.
- [ ] Confirm the returning-visitor path also calls `identify` — currently `posthog.identify()` is only called on `account_linked`. If a user returns after already linking their account, they will session on an anonymous ID until they sign in again. Consider calling `posthog.identify()` after InstantDB's auth state confirms a non-guest user on app load.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
