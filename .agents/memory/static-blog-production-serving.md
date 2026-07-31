---
name: Static blog production serving
description: How to correctly serve standalone static HTML blog pages in this Express app so they work in both dev and production (Replit autoscale).
---

## The pattern

Standalone static HTML pages (e.g. `blog-pages/<slug>/`) need three things to work correctly in both dev and production:

### 1. Register the static middleware with `redirect: false`
```ts
const blogDir = path.join(process.cwd(), "blog-pages/<slug>");
app.use("/blog/<slug>", express.static(blogDir, { index: "index.html", redirect: false }));
app.get("/blog/<slug>", (_req, res) => res.sendFile(path.join(blogDir, "index.html")));
```

**Why `redirect: false`:** `express.static` by default redirects directory requests to add a trailing slash (`/blog/slug` → `/blog/slug/`). The global trailing-slash stripper in `server/index.ts` then removes it, creating an infinite 301 redirect loop (`ERR_TOO_MANY_REDIRECTS`).

**Why register before `registerSSRRoutes`:** `ssrBlog.ts` has `app.get("/blog/:slug", ...)` which would intercept the route otherwise. Static middleware must be registered first.

### 2. Use `process.cwd()` for the path
```ts
const blogDir = path.join(process.cwd(), "blog-pages/<slug>");
```
**Why:** `__dirname` is not available in ESM dev mode (`tsx`). `path.resolve("./blog-pages/...")` is equivalent but `process.cwd()` is explicit. In both dev and production, `process.cwd()` = project root.

Do NOT use `__dirname` — it throws `ReferenceError: __dirname is not defined` in ESM mode.

### 3. Copy `blog-pages/` into `dist/` during build
In `script/build.ts`:
```ts
import { cp } from "fs/promises";
// after viteBuild():
await cp("blog-pages", "dist/blog-pages", { recursive: true });
```

**Why:** Replit autoscale deployments may run `node dist/index.cjs` in a container that only has the `dist/` build output. Without this copy, the server resolves `process.cwd() + "/blog-pages/"` to `dist/blog-pages/` (CWD = dist/) which doesn't exist unless copied. With the copy, both CWD scenarios work:
- CWD = project root → `<root>/blog-pages/` ✓
- CWD = dist/ → `dist/blog-pages/` ✓ (because we copied it)

## How to apply
Every new standalone static blog page added to `blog-pages/<slug>/` needs all three steps above. See `blog-pages/independence-day-2026/` as the reference implementation.
