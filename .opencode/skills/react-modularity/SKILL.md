---
name: react-modularity
description: Use when creating or editing React components. Keep components modular and small: one component per file, split large components into small manageable pieces, extract reusable UI into separate files. Don't create many components in a single file.
---

# React component modularity

Keep the React codebase modular and easy to navigate.

## One component per file

A `.tsx` file should export a single primary component. The default export
(or named export) is the component the file is named after:

```
src/components/prayer/PrayerCard.tsx        -> exports PrayerCard
src/components/prayer/PrayerCounter.tsx    -> exports PrayerCounter
```

Do NOT declare multiple unrelated components in one file. If a component
needs a helper subcomponent, that subcomponent probably belongs in its own
file.

## Split large components

When a component grows beyond a single clear responsibility (roughly more
than one screen of JSX, or mixing data fetching, layout, and interaction),
split it into smaller pieces:

- Extract presentational pieces into their own files (e.g.
  `PrayerList.tsx`, `PrayerRow.tsx`, `EmptyState.tsx`).
- Extract hooks/data logic into `hooks/` or `lib/` files
  (e.g. `usePrayerCounts.ts`).
- Extract inline subcomponents used by only one parent into a `parts/`
  subfolder next to the parent if they are not reused elsewhere.

## Group by feature, not by type

Prefer feature-based folders over `components/` + `hooks/` + `utils/` at the
top level for feature-specific code:

```
src/features/prayer/
  PrayerCard.tsx
  PrayerCounter.tsx
  hooks/usePrayerCounts.ts
  lib/formatCount.ts
```

Generic, reused-across-the-app UI still lives under `src/components/ui/`
(the shadcn/ui base — see import-paths skill).

## Reuse over duplication

Before creating a new component, check `src/components/ui/` and the relevant
feature folder for something to reuse. Compose small components rather than
copying markup.

## Naming

- One component per file, file name matches the component name (PascalCase).
- Hooks in their own file, prefixed with `use`.
- Keep files small and focused — if a file does two things, it's two files.

## Export style

Declare exports inline at the definition, never with a trailing `export { ... }`
block. Prefer `export function`/`export const` at the point of declaration:

```ts
// ✅ inline export at declaration
export function PrayerButton({ prayer }: PrayerButtonProps) { ... }
export const buttonVariants = cva(...)

// ❌ trailing export block
function PrayerButton({ prayer }: PrayerButtonProps) { ... }
export { PrayerButton };
```

Internal helpers that aren't part of the module's public API stay non-exported.
