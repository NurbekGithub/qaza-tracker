---
name: tailwind-styling
description: Use when styling, theming, or touching Tailwind/CSS. Tailwind v4 via @tailwindcss/vite with no JS config; theme tokens live in src/styles.css.
---

# Styling

Tailwind v4 via `@tailwindcss/vite`. There is **no `tailwind.config.js`**
despite `components.json` referencing one — Tailwind v4 is configured in CSS via
`src/styles.css` (imported once in `src/routes/__root.tsx`).

Add theme tokens there, not in a JS config. shadcn CSS variables live in
`src/styles.css`.
