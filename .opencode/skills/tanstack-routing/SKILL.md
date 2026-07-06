---
name: tanstack-routing
description: Use when adding/changing routes or touching src/routes/ or src/routeTree.gen.ts. This is a router-only SPA (no SSR/Start). File-based routing under src/routes/.
---

# Routing

File-based routing under `src/routes/`. `src/routeTree.gen.ts` is **generated**
(readonly — see `.vscode/settings.json`); don't hand-edit.

Add a route by creating a file in `src/routes/`; the TanStack Router Vite
plugin regenerates the tree during `dev`, or run:

```sh
bun --bun run generate-routes
```

The README still references `src/routes/demo/` and server functions/API routes
— those are leftover scaffold docs; this repo is **router-only** SPA (see
`.cta.json` `routerOnly: true`), there is no SSR/Start server runtime.
