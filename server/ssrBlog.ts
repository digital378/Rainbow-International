import type { Express } from "express";
import { blogPosts } from "../client/src/data/blogPosts";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderBlogSSR(slug: string): string | null {
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return null;

  const sectionsHtml = post.sections
    .map((sec) => {
      const listHtml = sec.list
        ? `<ul class="ris-list">${sec.list.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
        : "";
      return `
        ${sec.heading ? `<h2 class="ris-h2">${escapeHtml(sec.heading)}</h2>` : ""}
        <p class="ris-body">${escapeHtml(sec.body).replace(/\n\n/g, '</p><p class="ris-body">')}</p>
        ${listHtml}
      `;
    })
    .join("");

  const internalLinksHtml = post.internalLinks
    .map(
      (link) =>
        `<a class="ris-internal-link" href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`,
    )
    .join("");

  const relatedHtml = post.relatedSlugs
    .slice(0, 3)
    .map((rs) => {
      const related = blogPosts.find((p) => p.slug === rs);
      if (!related) return "";
      return `
        <a class="ris-related-card" href="/blog/${escapeHtml(rs)}">
          <img src="${escapeHtml(related.thumbUrl || "")}" alt="${escapeHtml(related.title)}" onerror="this.style.display='none'" />
          <div class="ris-related-card-body">
            <span class="ris-related-category">${escapeHtml(related.category || "")}</span>
            <p class="ris-related-title">${escapeHtml(related.title)}</p>
          </div>
        </a>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(post.title)} | Rainbow International School</title>
  <meta name="description" content="${escapeHtml(post.excerpt || post.intro.slice(0, 160))}" />
  <meta name="keywords" content="${escapeHtml(post.focusKeyword || post.title)}" />
  <link rel="canonical" href="https://rainbowinternationalschool.in/blog/${escapeHtml(post.slug)}" />
  <meta property="og:title" content="${escapeHtml(post.title)}" />
  <meta property="og:description" content="${escapeHtml(post.intro.slice(0, 160))}" />
  <meta property="og:image" content="${escapeHtml(post.heroUrl || post.thumbUrl || "")}" />
  <meta property="og:url" content="https://rainbowinternationalschool.in/blog/${escapeHtml(post.slug)}" />
  <meta property="og:type" content="article" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&family=Merriweather:wght@400;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Open Sans', sans-serif; background: #f8faff; color: #1a1a2e; line-height: 1.7; }

    /* ── Topbar ── */
    .ris-topbar { background: #091a4f; color: #fff; font-size: 13px; padding: 8px 24px; display: flex; justify-content: space-between; align-items: center; }
    .ris-topbar a { color: #fbbf24; text-decoration: none; }

    /* ── Navbar ── */
    .ris-nav { background: #fff; box-shadow: 0 2px 12px rgba(0,0,0,0.08); padding: 0 24px; display: flex; align-items: center; justify-content: space-between; height: 64px; position: sticky; top: 0; z-index: 100; }
    .ris-nav-brand { font-size: 20px; font-weight: 800; color: #0d3b86; text-decoration: none; display: flex; align-items: center; gap: 8px; }
    .ris-nav-brand span { color: #f97316; }
    .ris-nav-links { display: flex; gap: 28px; list-style: none; }
    .ris-nav-links a { color: #091a4f; text-decoration: none; font-weight: 600; font-size: 14px; }
    .ris-nav-links a:hover { color: #0d3b86; }
    .ris-nav-cta { background: #f97316; color: #fff; padding: 9px 20px; border-radius: 8px; font-weight: 700; font-size: 14px; text-decoration: none; }

    /* ── Hero Banner ── */
    .ris-hero { background: linear-gradient(135deg, #0d3b86 0%, #091a4f 100%); padding: 48px 24px; text-align: center; position: relative; overflow: hidden; }
    .ris-hero::before { content: ''; position: absolute; inset: 0; background: url('${post.heroUrl || post.thumbUrl || ""}') center/cover no-repeat; opacity: 0.18; }
    .ris-hero-inner { position: relative; z-index: 1; max-width: 760px; margin: 0 auto; }
    .ris-hero-cat { display: inline-block; background: #fbbf24; color: #091a4f; font-weight: 700; font-size: 12px; padding: 4px 14px; border-radius: 20px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
    .ris-hero h1 { font-family: 'Merriweather', serif; font-size: clamp(22px, 4vw, 34px); color: #fff; line-height: 1.35; margin-bottom: 16px; }
    .ris-hero-meta { color: rgba(255,255,255,0.75); font-size: 14px; display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
    .ris-hero-meta span { display: flex; align-items: center; gap: 6px; }

    /* ── SSR badge ── */
    .ris-ssr-badge { background: #10b981; color: #fff; font-size: 12px; font-weight: 700; padding: 6px 16px; border-radius: 20px; display: inline-flex; align-items: center; gap: 6px; margin-bottom: 16px; }
    .ris-ssr-badge::before { content: '⚡'; }

    /* ── Layout ── */
    .ris-page { max-width: 1100px; margin: 0 auto; padding: 48px 24px; display: grid; grid-template-columns: 1fr 300px; gap: 40px; }
    @media(max-width: 768px) { .ris-page { grid-template-columns: 1fr; } }

    /* ── Article ── */
    .ris-article { background: #fff; border-radius: 16px; padding: 40px; box-shadow: 0 2px 16px rgba(0,0,0,0.06); }
    .ris-intro { font-size: 17px; color: #374151; line-height: 1.85; margin-bottom: 32px; padding-bottom: 32px; border-bottom: 2px solid #e5e7eb; font-weight: 400; }
    .ris-h2 { font-family: 'Merriweather', serif; font-size: 22px; color: #0d3b86; margin: 32px 0 14px; font-weight: 700; }
    .ris-body { font-size: 15.5px; color: #4b5563; line-height: 1.9; margin-bottom: 18px; }
    .ris-list { margin: 16px 0 24px 24px; }
    .ris-list li { font-size: 15px; color: #4b5563; margin-bottom: 10px; line-height: 1.7; }

    /* ── Internal links ── */
    .ris-internal-links { margin-top: 40px; padding-top: 32px; border-top: 2px solid #e5e7eb; }
    .ris-internal-links-title { font-weight: 700; color: #091a4f; margin-bottom: 14px; font-size: 15px; }
    .ris-internal-link { display: inline-block; background: #eff6ff; color: #0d3b86; border: 1px solid #bfdbfe; border-radius: 8px; padding: 7px 14px; margin: 4px; font-size: 13px; font-weight: 600; text-decoration: none; }
    .ris-internal-link:hover { background: #0d3b86; color: #fff; }

    /* ── Sidebar ── */
    .ris-sidebar { display: flex; flex-direction: column; gap: 24px; }
    .ris-sidebar-box { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 2px 16px rgba(0,0,0,0.06); }
    .ris-sidebar-title { font-weight: 800; color: #091a4f; font-size: 15px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb; }

    /* ── Admissions box ── */
    .ris-admissions { background: linear-gradient(135deg, #0d3b86 0%, #091a4f 100%); color: #fff; border-radius: 16px; padding: 28px; text-align: center; }
    .ris-admissions h3 { font-family: 'Merriweather', serif; font-size: 18px; margin-bottom: 10px; }
    .ris-admissions p { font-size: 13px; color: rgba(255,255,255,0.8); margin-bottom: 18px; line-height: 1.6; }
    .ris-admissions a { display: block; background: #fbbf24; color: #091a4f; font-weight: 800; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-size: 14px; }
    .ris-admissions a:hover { background: #f59e0b; }

    /* ── Related posts ── */
    .ris-related-card { display: flex; gap: 12px; align-items: flex-start; text-decoration: none; margin-bottom: 16px; }
    .ris-related-card img { width: 72px; height: 60px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
    .ris-related-category { font-size: 11px; font-weight: 700; color: #f97316; text-transform: uppercase; letter-spacing: 0.5px; }
    .ris-related-title { font-size: 13px; color: #1a1a2e; font-weight: 600; line-height: 1.4; margin-top: 4px; }
    .ris-related-card:hover .ris-related-title { color: #0d3b86; }

    /* ── SSR explain box ── */
    .ris-ssr-explain { background: #f0fdf4; border: 2px solid #86efac; border-radius: 12px; padding: 20px; }
    .ris-ssr-explain h4 { color: #15803d; font-size: 14px; font-weight: 800; margin-bottom: 8px; }
    .ris-ssr-explain p { color: #166534; font-size: 13px; line-height: 1.6; }

    /* ── Footer ── */
    .ris-footer { background: #091a4f; color: rgba(255,255,255,0.6); text-align: center; padding: 28px 24px; font-size: 13px; margin-top: 40px; }
    .ris-footer a { color: #fbbf24; text-decoration: none; }

    /* ── Breadcrumb ── */
    .ris-breadcrumb { max-width: 1100px; margin: 0 auto; padding: 16px 24px 0; font-size: 13px; color: #9ca3af; }
    .ris-breadcrumb a { color: #0d3b86; text-decoration: none; }
    .ris-breadcrumb span { margin: 0 8px; }
  </style>
</head>
<body>

  <!-- Top Bar -->
  <div class="ris-topbar">
    <span>CBSE Affiliation No. <strong>1130661</strong> &nbsp;|&nbsp; School Code: <strong>30562</strong></span>
    <span><a href="tel:02269105000">(022) 69105000</a> &nbsp;|&nbsp; Mon–Sat 9AM–6PM</span>
  </div>

  <!-- Navbar -->
  <nav class="ris-nav">
    <a class="ris-nav-brand" href="/">Rainbow <span>International</span> School</a>
    <ul class="ris-nav-links">
      <li><a href="/">Home</a></li>
      <li><a href="/about-rainbow-international-school">About</a></li>
      <li><a href="/amenities">Amenities</a></li>
      <li><a href="/blogs">Blog</a></li>
      <li><a href="/contact-us">Contact</a></li>
    </ul>
    <a class="ris-nav-cta" href="/application-form">Apply Now</a>
  </nav>

  <!-- Hero Banner -->
  <div class="ris-hero">
    <div class="ris-hero-inner">
      <div class="ris-ssr-badge">Server-Side Rendered — HTML delivered pre-built</div>
      <div class="ris-hero-cat">${escapeHtml(post.category || "Blog")}</div>
      <h1>${escapeHtml(post.title)}</h1>
      <div class="ris-hero-meta">
        <span>📅 ${escapeHtml(post.date)}</span>
        <span>🕐 ${escapeHtml(String(post.readTime || "5"))} min read</span>
        <span>✏️ Rainbow International School</span>
      </div>
    </div>
  </div>

  <!-- Breadcrumb -->
  <div class="ris-breadcrumb">
    <a href="/">Home</a><span>›</span>
    <a href="/blogs">Blog</a><span>›</span>
    ${escapeHtml(post.title)}
  </div>

  <!-- Main Content -->
  <div class="ris-page">
    <main class="ris-article">
      <p class="ris-intro">${escapeHtml(post.intro)}</p>
      ${sectionsHtml}
      <div class="ris-internal-links">
        <p class="ris-internal-links-title">Explore More at Rainbow International School:</p>
        ${internalLinksHtml}
      </div>
    </main>

    <aside class="ris-sidebar">

      <!-- SSR Explain Box -->
      <div class="ris-ssr-explain">
        <h4>⚡ This page is Server-Side Rendered</h4>
        <p>Right-click &rarr; <strong>View Page Source</strong> — you will see the full article text already in the HTML, before any JavaScript runs. Google crawls it instantly.</p>
      </div>

      <!-- Admissions CTA -->
      <div class="ris-admissions">
        <h3>Admissions Open 2026–27</h3>
        <p>Nursery to Class 12 · Science, Humanities &amp; Commerce · CBSE Affiliated</p>
        <a href="/application-form">Apply for Admission</a>
      </div>

      <!-- Related Posts -->
      <div class="ris-sidebar-box">
        <p class="ris-sidebar-title">Related Articles</p>
        ${relatedHtml}
      </div>

      <!-- Contact Box -->
      <div class="ris-sidebar-box">
        <p class="ris-sidebar-title">Get in Touch</p>
        <p style="font-size:13px;color:#4b5563;margin-bottom:12px;line-height:1.6;">Cosmos Arcade, Brahmand Phase 4, Thane West, Maharashtra</p>
        <a href="tel:02269105000" style="display:block;background:#0d3b86;color:#fff;text-align:center;padding:10px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;margin-bottom:8px;">(022) 69105000</a>
        <a href="https://wa.me/918291568972" style="display:block;background:#25d366;color:#fff;text-align:center;padding:10px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">WhatsApp Us</a>
      </div>

    </aside>
  </div>

  <!-- Footer -->
  <footer class="ris-footer">
    <p>&copy; ${new Date().getFullYear()} Rainbow International School · CBSE Affiliation No. 1130661</p>
    <p style="margin-top:8px;"><a href="/privacy-policy-and-cookie-policy">Privacy Policy</a> &nbsp;|&nbsp; <a href="/cbse-mandatory-public-disclosures">CBSE Disclosures</a> &nbsp;|&nbsp; <a href="/blogs">Blog</a></p>
  </footer>

</body>
</html>`;
}

export function registerSSRRoutes(app: Express) {
  app.get("/ssr-demo/blog/:slug", (req, res) => {
    const { slug } = req.params;
    const html = renderBlogSSR(slug);
    if (!html) {
      return res.status(404).send("<h1>Blog post not found</h1>");
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("X-Rendered-By", "Express SSR");
    res.send(html);
  });
}
