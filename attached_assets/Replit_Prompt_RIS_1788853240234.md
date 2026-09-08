# Replit Integration Prompt — RIS Ganesh Chaturthi 2026 Blog

Copy everything below into Replit Agent.

---

I have a finished, self-contained HTML blog page: `RIS_Ganesh_Chaturthi_2026.html`. It already contains all copy, CSS, and JavaScript — do NOT rewrite, summarize, shorten, or regenerate any text content inside it. It also ships a set of working interactive features that must survive integration untouched: a reading-progress bar, a live countdown to Ganesh Sthapana/Visarjan, a scrollspy quick-jump nav, flip-card facts, a quiz with reveal/reveal-all, an FAQ accordion, copy-to-clipboard buttons, language tabs (English/Hindi/Marathi) on the Speeches and Essays sections, hover-tilt on cards, a custom cursor (desktop only), small confetti rewards on key interactions, and an in-browser "Create Your Own Ganpati Wish Card" canvas tool near the downloadable-images section. Your job is integration only:

1. **Locate the blog system**: Find how existing blog posts are routed and rendered on this site (e.g. `rainbowinternationalschool.in/blog/independence-day-2026` is the reference pattern — find that page's source/route to see the folder structure, naming convention, and how it's linked from the `/blog` index).

2. **Add this page** as a new blog post at the equivalent URL slug `/blog/ganesh-chaturthi-2026`, following the exact same routing convention as the Independence Day 2026 post (same file location pattern, same way it's registered/linked, same metadata wiring if the site auto-generates sitemap/blog-index entries from a config or CMS list).

3. **Preserve the file's own `<head>`**: it already includes the page `<title>`, meta description, canonical URL, Open Graph tags, and JSON-LD schema (Article, BreadcrumbList, FAQPage). Do not strip or duplicate these — merge only what the site's templating layer requires (e.g. if the site injects a shared `<head>` partial, make sure there's no conflict/duplication with what's already in the file).

4. **Do not touch the main site header/nav/footer** unless the blog template requires wrapping this content in the site's existing blog-page shell (breadcrumb + minimal footer, matching how the Independence Day page is wrapped — not the full site mega-menu).

5. **Image placeholders**: the "Downloadable Ganpati Bappa Images" section currently uses styled placeholder boxes (1080×1080 aspect ratio, labeled by theme/caption). Leave these exactly as they are — I will supply final images later and will handle swapping them in myself (or tell you the exact filenames to drop into an `/images/` or `/assets/` folder if that's how the site serves blog images; ask me before assuming a path).

6. **Verify responsiveness**: test the page at mobile (375px), tablet (768px), and desktop (1440px) widths. All sections (flip-cards, quiz reveal buttons, FAQ accordion, copy-to-clipboard buttons) must remain fully functional and readable at every breakpoint — the page is already built mobile-first, so this should mainly be a verification step, not a rebuild.

7. **Add it to the `/blog` index page** and any sitemap.xml / RSS feed the site auto-generates, exactly the way the Independence Day post is listed there.

8. **Do not add tracking scripts, ads, or third-party embeds** beyond what's already in the file (Google Fonts CDN links only).

9. **Keep it fully crawlable — do not wrap this page's content in client-side rendering.** All body text, the FAQ answers, both hidden language-tab panels, and the JSON-LD schema (Article, BreadcrumbList, FAQPage) are already present in the raw HTML source, not injected by JavaScript — that's intentional, for SEO and for AI answer engines that don't execute JS. If the site's blog template normally hydrates content client-side (React/Next.js, etc.), embed this page's `<body>` content and `<head>` tags as static markup, not as a JS-rendered component, so the text stays visible with JavaScript off. Do not lazy-load or defer any of the visible text sections.

10. **Sanity-check the interactive extras after integration**: the countdown timer should show real live numbers (not stuck on "Calculating…"), the quick-jump pills should highlight as you scroll, clicking a language tab should swap the speech/essay content, and the wish-card tool's "Generate Wish Card" button should produce a live canvas preview with a working "Download Image" link.

If anything about the existing blog routing structure is ambiguous or you can't find a clean pattern to follow, stop and ask me rather than guessing or restructuring the site.
