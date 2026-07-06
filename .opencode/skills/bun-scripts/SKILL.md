---
name: bun-scripts
description: Use when running scripts, installing deps, or mentioning bun/pnpm/npm/lefthook/lint-staged for this project. This project uses bun (pinned exact in bunfig.toml). Run scripts with `bun --bun run <script>`. Lefthook runs a pre-commit hook (oxfmt + oxlint --fix) defined in lefthook.yml.
---

# Scripts & package manager

Package manager is **bun** (`bunfig.toml` pins `exact = true`). Run scripts
with:

```sh
bun --bun run <script>
```

## Pre-commit hook (lefthook)

A **lefthook** pre-commit hook is installed (see `lefthook.yml`). It runs in
parallel on staged files:

- `oxfmt --no-error-on-unmatched-pattern` on all files, re-staging fixes
- `oxlint --fix` on `*.{js,jsx,ts,tsx,mjs,cjs}`, re-staging fixes

Hooks are synced automatically; if `lefthook.yml` changes, run
`bun --bun run lefthook install` to re-sync. The old `lint-staged` config has
been removed — lefthook replaces it.
