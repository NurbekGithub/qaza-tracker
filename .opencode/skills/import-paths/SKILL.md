---
name: import-paths
description: Use when importing modules or adding shadcn components. The codebase imports via the `#/` alias, NOT `@/`. After `bunx shadcn add`, rewrite `@/` imports to `#/`.
---

# Import paths — important gotcha

The codebase imports via the `#/` alias (e.g. `#/components/ui/button`), backed
by `package.json` `"imports"` and `tsconfig.json` `paths`.

**`components.json` (shadcn) declares the `@/` alias instead**, so
`bunx shadcn add <component>` emits files importing from `@/...`.

After adding a shadcn component, rewrite its imports from `@/` to `#/` to match
the rest of the code (or update `components.json` aliases to `#/`).

Both aliases resolve in TS, but the runtime Vite resolution relies on `#/*` via
Node imports — `@/*` only works because `tsconfigPaths` is enabled in
`vite.config.ts`; **prefer `#/`**.
