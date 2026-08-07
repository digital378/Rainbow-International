---
name: SEO metadata consistency across renderers
description: The site has three rendering paths for SEO tags; metadata must be changed in the shared single-source files, never per-renderer.
---

Rule: route SEO metadata and FAQ content each live in one shared module under `shared/` (route SEO map; FAQ data + FAQPage builder). All rendering paths — crawler SSR, server-injected SPA shell, and client hydration — import from there.

**Why:** the three paths previously drifted (bots got a stale 5-question FAQPage while the visible page showed 30; hydration produced duplicate JSON-LD). A code review rejected the divergence.

**How to apply:** when changing a description, canonical, breadcrumb label, or FAQ answer, edit the shared module only — never re-introduce per-path inline copies. Descriptions must stay under 155 chars and never contain "Best", "No. 1" or "World-Class". Server-injected JSON-LD and the client SEO component share a replace-by-@type dedupe contract; preserve it when touching either side.
