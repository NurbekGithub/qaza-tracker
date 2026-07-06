---
name: task-verification
description: Use before finishing/completing a task in this repo. Run lint, typecheck, and fmt:check with bun and fix what you broke. typecheck is strict with noUnusedLocals/noUnusedParameters.
---

# Task verification

Before finishing a task, run:

```sh
bun --bun run lint
bun --bun run typecheck
bun --bun run fmt:check
```

Fix what you broke. Always test types — `typecheck` is strict with
`noUnusedLocals`/`noUnusedParameters`.
