---
name: SSR routes must be linked with plain anchors, not wouter Link
description: Why in-app links to server-rendered routes (/blog/:slug) must be <a>, and how a duplicate SPA route silently shadows SSR on client-side navigation.
---

Any route that is server-rendered must be linked from React with a plain `<a href="...">`,
never a wouter `<Link>`.

**Why:** the SPA also declares a catch-all route for the same path (e.g. `/blog/:slug` ->
a React article page). A `<Link>` never issues an HTTP request — wouter keeps the SPA
mounted and matches its own route, so the server renderer is bypassed entirely and the
stale React page renders instead. A direct URL load or hard refresh hits Express and looks
correct, which makes the bug appear to be a caching problem. The giveaway is the page
chrome: the SSR page ships its own header/footer markup, so if the React app's global
header (dropdown nav, promo banner, chat widget) is visible on a supposedly SSR page,
client-side routing served it.

**How to apply:** when adding or reviewing links to an SSR route, grep for `<Link` pointing
at that path across listing pages, related-post grids, and admin tables — every entry point
must be a plain anchor. Verify by clicking through from the listing in a real browser, not
by loading the URL directly; only the click path exercises the SPA route. Keep the SSR
route registered before the SPA fallback, and prefer deleting the duplicate SPA route when
a path is fully owned by SSR.
