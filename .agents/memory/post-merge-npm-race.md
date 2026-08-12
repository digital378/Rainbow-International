---
name: Post-merge npm temp directories
description: Recovery for npm ENOTEMPTY failures caused by interrupted package replacement during automated post-merge setup.
---

The post-merge dependency install must tolerate npm leaving hidden temporary package directories under `node_modules` after an interrupted replacement.

**Why:** npm can fail with `ENOTEMPTY` when it tries to rename a package directory to a hidden temporary destination that already exists, even though the project dependencies and lockfile are valid.

**How to apply:** Keep post-merge dependency installation idempotent and retry once after removing only top-level hidden npm-style temporary directories (`.*-*`) under `node_modules`; do not remove regular packages or reset the whole dependency tree.