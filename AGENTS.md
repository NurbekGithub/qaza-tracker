# AGENTS.md

App for tracking qaza prayers for Muslims. Keep the UI minimal and the UX as simple as possible. Stack: React 19 + TanStack Router (file-based), Tailwind CSS v4, shadcn/ui (base-vega style, backed by `@base-ui/react`), InstantDB for data with offline sync.

## Conventions

- No comments in code unless explicitly requested (per repo style).
- Prefer shadcn/ui components over hand-rolled markup to keep the UI consistent and minimal.
- UI must be mobile-first: design for small screens by default, then enhance for larger viewports.

Detailed guidance lives in `.opencode/skills/` (bun scripts, routing, import paths, styling, InstantDB, task verification) and is surfaced automatically by the agent when relevant.
