---
name: Express wildcard req.path bug
description: req.path is always "/" inside app.use("*", handler) — use req.originalUrl instead.
---

When an Express catch-all is registered as `app.use("*", handler)`, Express treats the `*` as a route parameter and strips the matched portion, setting `req.path = "/"` regardless of the actual request URL.

**Why:** Express's `app.use` path-stripping behaviour applies to wildcard routes the same way it does to prefix mounts — the matched segment is removed from `req.path`. Confirmed via debug log: requests to `/blogs` and `/contact-us` both logged `req.path="/"`.

**How to apply:** Any time you need the real request path inside an `app.use("*", ...)` handler, use `req.originalUrl` (and strip query strings manually with `.split("?")[0]` if needed). `req.path` is unreliable here.
