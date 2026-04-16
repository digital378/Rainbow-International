import type { Express } from "express";
import { blogPosts } from "../client/src/data/blogPosts";

function e(str: string | undefined | null): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const CAT_IMAGE: Record<string, string> = {
  "CBSE School": "/blog/cat-school.png",
  "About Rainbow": "/blog/cat-school.png",
  "School Selection": "/blog/cat-school.png",
  "School": "/blog/cat-school.png",
  "Academics": "/blog/cat-education.png",
  "Education": "/blog/cat-education.png",
  "Parenting": "/blog/cat-parenting.png",
  "Student Health": "/blog/cat-health.png",
  "Student Wellbeing": "/blog/cat-health.png",
  "Student Wellness": "/blog/cat-health.png",
  "Sports": "/blog/cat-sports.png",
  "Beyond the Classroom": "/blog/cat-sports.png",
  "Study Skills": "/blog/cat-study.png",
  "Study Tips": "/blog/cat-study.png",
  "Student Development": "/blog/cat-development.png",
  "Student Life": "/blog/cat-development.png",
  "Early Learning": "/blog/cat-early.png",
  "Pre-Primary": "/blog/cat-early.png",
  "Awards": "/blog/cat-awards.png",
  "Events": "/blog/cat-events.png",
  "Admissions": "/blog/cat-school.png",
  "Safety & Security": "/blog/cat-school.png",
  "Student Achievements": "/blog/cat-awards.png",
  "General": "/blog/cat-education.png",
};

function getCatImage(cat: string): string {
  return CAT_IMAGE[cat] || "/blog/cat-education.png";
}

function renderInlineMd(text: string): string {
  return e(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.+?)\]\((https?:\/\/.+?)\)/g, '<a href="$2" class="text-link" target="_blank" rel="noopener">$1</a>');
}

function toISODate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "2025-01-01";
  return d.toISOString().split("T")[0];
}

function renderBlogSSR(slug: string): string | null {
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return null;

  const related = post.relatedSlugs
    .map((s) => blogPosts.find((p) => p.slug === s))
    .filter(Boolean)
    .slice(0, 3);

  const sectionsHtml = post.sections
    .map((sec) => {
      const paras = sec.body
        .split("\n\n")
        .map((para) => `<p class="body-para">${renderInlineMd(para.replace(/\n/g, " "))}</p>`)
        .join("");
      const listHtml =
        sec.list && sec.list.length > 0
          ? `<ul class="body-list">${sec.list.map((item) => `<li><span class="orange-dot"></span>${e(item)}</li>`).join("")}</ul>`
          : "";
      return `<div class="section-block">
        ${sec.heading ? `<h2 class="section-h2">${e(sec.heading)}</h2>` : ""}
        ${paras}
        ${listHtml}
      </div>`;
    })
    .join("");

  const tagsHtml = (post.keywords || "")
    .split(",")
    .map((kw) => `<span class="tag">${e(kw.trim())}</span>`)
    .join("");

  const internalLinksHtml = post.internalLinks
    .map(
      (lnk) => `<li>
        <a href="${e(lnk.href)}" class="internal-link">
          <span class="orange-dot-sm"></span>${e(lnk.label)}
        </a>
      </li>`,
    )
    .join("");

  const relatedHtml = related
    .map((rel) => {
      if (!rel) return "";
      return `<a href="/blog/${e(rel.slug)}" class="related-card">
        <div class="related-body">
          <span class="related-cat">${e(rel.cat)}</span>
          <h3 class="related-title">${e(rel.title)}</h3>
          <p class="related-date">${e(rel.date)}</p>
        </div>
      </a>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="google-site-verification" content="jWDe0ilooX5MO3xp-F6nSkapvxY8m9Oyq3gL4_JI0hY" />
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-DN4GB6MVJJ"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-DN4GB6MVJJ');</script>
  <title>${post.metaTitle.includes('Rainbow International') ? e(post.metaTitle) : `${e(post.metaTitle)} | Rainbow International School`}</title>
  <meta name="description" content="${e(post.metaDescription)}" />
  <meta name="keywords" content="${e(post.keywords)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://rainbowinternationalschool.in/blog/${e(post.slug)}/" />
  <meta property="og:title" content="${e(post.metaTitle)}" />
  <meta property="og:description" content="${e(post.metaDescription)}" />
  <meta property="og:image" content="${e(post.heroUrl || 'https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad.jpg')}" />
  <meta property="og:url" content="https://rainbowinternationalschool.in/blog/${e(post.slug)}/" />
  <meta property="og:type" content="article" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta property="og:locale" content="en_IN" />
  <script type="application/ld+json">
  ${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.metaTitle || post.title,
    "description": post.metaDescription,
    "image": post.heroUrl || "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad.jpg",
    "datePublished": toISODate(post.date),
    "dateModified": toISODate(post.date),
    "author": {
      "@type": "Organization",
      "name": "Rainbow International School",
      "url": "https://rainbowinternationalschool.in"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Rainbow International School",
      "logo": {
        "@type": "ImageObject",
        "url": "https://rainbowinternationalschool.in/wp-content/uploads/2024/01/RIS-Logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://rainbowinternationalschool.in/blog/${post.slug}/`
    },
    "keywords": post.keywords,
    "articleSection": post.cat
  })}
  </script>
  <script type="application/ld+json">
  ${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://rainbowinternationalschool.in/" },
      { "@type": "ListItem", "position": 2, "name": "Blogs", "item": "https://rainbowinternationalschool.in/blogs" },
      { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://rainbowinternationalschool.in/blog/${post.slug}/` }
    ]
  })}
  </script>
  ${post.faqs && post.faqs.length > 0 ? `<script type="application/ld+json">
  ${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": post.faqs.map((faq: { q: string; a: string }) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  })}
  </script>` : ''}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;500;600;700;800;900&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { font-family: 'Poppins', system-ui, sans-serif; background: #fff; color: #1a1a2e; line-height: 1.7; }

    /* ── Scroll progress bar ── */
    #progress-bar { position: fixed; top: 0; left: 0; height: 3px; width: 0%; background: linear-gradient(90deg,#7c3aed,#f97316,#fbbf24,#10b981); z-index: 9999; transition: width 0.1s; }

    /* ── Top bar ── */
    .topbar { background: #091a4f; color: rgba(255,255,255,0.8); font-family: 'Poppins', sans-serif; font-size: 12px; padding: 6px 16px; display: flex; gap: 24px; align-items: center; flex-wrap: wrap; }
    .topbar a { color: rgba(255,255,255,0.8); text-decoration: none; display: flex; align-items: center; gap: 5px; }
    .topbar a:hover { color: #fbbf24; }
    .topbar-icon { width: 13px; height: 13px; }

    /* ── Navbar ── */
    .navbar { background: #fff; box-shadow: 0 1px 8px rgba(0,0,0,0.08); padding: 0 16px; display: flex; align-items: center; justify-content: space-between; height: 64px; position: sticky; top: 0; z-index: 100; }
    .nav-brand { font-family: 'League Spartan', sans-serif; font-size: 18px; font-weight: 900; color: #0d3b86; text-decoration: none; display: flex; align-items: center; gap: 8px; }
    .nav-brand-logo { height: 44px; width: auto; }
    .nav-links { display: flex; gap: 24px; list-style: none; align-items: center; }
    .nav-links a { color: #333; text-decoration: none; font-weight: 500; font-size: 14px; }
    .nav-links a:hover { color: #0d3b86; }
    .nav-cta { background: #f97316; color: #fff !important; padding: 8px 18px; border-radius: 8px; font-weight: 700; font-size: 14px; text-decoration: none; }
    .nav-cta:hover { background: #ea6c0a !important; }
    @media(max-width: 768px) { .nav-links { display: none; } }

    /* ── Hero ── */
    .hero { background: linear-gradient(135deg, #091a4f 0%, #0d3b86 100%); padding: 80px 16px 112px; text-align: center; position: relative; overflow: hidden; min-height: 320px; display: flex; align-items: center; justify-content: center; }
    .hero-bg { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0.10; }
    .hero-inner { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; }
    .hero-cat { display: inline-block; background: #f97316; color: #fff; font-weight: 600; font-size: 11px; padding: 5px 16px; border-radius: 999px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.1em; }
    .hero h1 { font-family: 'League Spartan', sans-serif; font-size: clamp(24px, 4.5vw, 40px); color: #fff; line-height: 1.25; font-weight: 900; margin-bottom: 20px; }
    .hero-meta { color: rgba(255,255,255,0.70); font-size: 14px; display: flex; gap: 16px; justify-content: center; align-items: center; flex-wrap: wrap; }
    .hero-meta-dot { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.30); }

    /* ── Breadcrumb ── */
    .breadcrumb { background: #fff; border-bottom: 1px solid #f3f4f6; }
    .breadcrumb-inner { max-width: 1280px; margin: 0 auto; padding: 12px 16px; font-size: 13px; color: #6b7280; display: flex; align-items: center; gap: 8px; }
    .breadcrumb-inner a { color: #6b7280; text-decoration: none; }
    .breadcrumb-inner a:hover { color: #1d4ed8; }
    .breadcrumb-inner .current { color: #111827; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 260px; }

    /* ── Page layout ── */
    .page-main { background: #fff; flex-grow: 1; }
    .page-container { max-width: 1280px; margin: 0 auto; padding: 48px 16px; display: flex; flex-direction: column; }
    .content-row { display: flex; gap: 48px; }
    @media(max-width: 1023px) { .content-row { flex-direction: column; } }

    /* ── Article ── */
    article { flex-grow: 1; min-width: 0; }
    .intro-para { font-size: 17px; color: #374151; line-height: 1.8; margin-bottom: 32px; font-weight: 500; border-left: 4px solid #0d3b86; padding-left: 20px; }
    .section-block { margin-bottom: 40px; }
    .section-h2 { font-family: 'League Spartan', sans-serif; font-size: clamp(18px, 2.5vw, 24px); font-weight: 900; color: #0d3b86; margin-bottom: 16px; }
    .body-para { color: #374151; line-height: 1.8; margin-bottom: 16px; font-size: 15px; }
    .body-list { margin-top: 12px; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; padding-left: 16px; }
    .body-list li { display: flex; align-items: flex-start; gap: 12px; color: #374151; font-size: 15px; line-height: 1.7; }
    .orange-dot { width: 8px; height: 8px; border-radius: 50%; background: #f97316; flex-shrink: 0; margin-top: 8px; }

    /* ── Conclusion ── */
    .conclusion-box { margin-top: 40px; border-radius: 24px; padding: 32px; background: #f8faff; border: 1px solid #e5eaf5; }
    .conclusion-box h2 { font-family: 'League Spartan', sans-serif; font-size: 20px; font-weight: 900; color: #0d3b86; margin-bottom: 16px; }
    .conclusion-box p { color: #374151; line-height: 1.8; font-size: 15px; margin-bottom: 12px; }
    .text-link { color: #1d4ed8; text-decoration: underline; }
    .text-link:hover { color: #1e3a8a; }
    .backlink-box { margin-top: 24px; border-radius: 16px; padding: 24px; display: flex; align-items: center; gap: 16px; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 1px solid #fbbf24; }
    .backlink-icon { font-size: 24px; flex-shrink: 0; }
    .backlink-box p { color: #1f2937; font-size: 14px; line-height: 1.6; margin: 0; }

    /* ── Tags ── */
    .tags { margin-top: 32px; display: flex; flex-wrap: wrap; gap: 8px; }
    .tag { padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 500; background: #f3f4f6; color: #4b5563; }

    /* ── Bottom nav ── */
    .article-bottom { margin-top: 40px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f3f4f6; padding-top: 24px; flex-wrap: wrap; gap: 12px; }
    .btn-ghost { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #0d3b86; text-decoration: none; }
    .btn-ghost:hover { text-decoration: underline; }
    .btn-primary { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 999px; background: #0d3b86; color: #fff; font-size: 14px; font-weight: 600; text-decoration: none; box-shadow: 0 1px 4px rgba(0,0,0,0.12); }
    .btn-primary:hover { background: #0a2d6b; }

    /* ── Sidebar ── */
    aside { width: 288px; flex-shrink: 0; display: flex; flex-direction: column; gap: 24px; }
    @media(max-width: 1023px) { aside { width: 100%; } }
    .sidebar-box { border-radius: 16px; border: 1px solid #f3f4f6; box-shadow: 0 1px 6px rgba(0,0,0,0.06); padding: 24px; background: #fff; }
    .sidebar-box-title { font-family: 'League Spartan', sans-serif; font-size: 15px; font-weight: 900; color: #0d3b86; margin-bottom: 16px; }
    .internal-link-list { list-style: none; display: flex; flex-direction: column; gap: 4px; }
    .internal-link { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #4b5563; text-decoration: none; padding: 5px 0; border-bottom: 1px solid #f9fafb; }
    .internal-link:hover { color: #1d4ed8; }
    .orange-dot-sm { width: 6px; height: 6px; border-radius: 50%; background: #f97316; flex-shrink: 0; }

    /* ── RPS Sidebar box ── */
    .rps-box { border-radius: 16px; padding: 24px; background: #0d3b86; color: #fff; }
    .rps-logo-wrap { background: #fff; border-radius: 8px; padding: 8px 12px; display: inline-flex; align-items: center; margin-bottom: 12px; }
    .rps-logo { height: 32px; width: auto; }
    .rps-title { font-family: 'League Spartan', sans-serif; font-size: 15px; font-weight: 900; margin-bottom: 8px; }
    .rps-desc { color: rgba(255,255,255,0.80); font-size: 12px; line-height: 1.6; margin-bottom: 16px; }
    .rps-btn { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; padding: 8px 16px; border-radius: 999px; background: #fff; color: #0d3b86; text-decoration: none; }

    /* ── Admissions sidebar box ── */
    .admissions-box { border-radius: 16px; border: 1px solid #f3f4f6; box-shadow: 0 1px 6px rgba(0,0,0,0.06); padding: 24px; background: #fff; text-align: center; }
    .admissions-emoji { font-size: 30px; margin-bottom: 8px; }
    .admissions-title { font-family: 'League Spartan', sans-serif; font-size: 15px; font-weight: 900; color: #0d3b86; margin-bottom: 8px; }
    .admissions-sub { color: #6b7280; font-size: 12px; margin-bottom: 16px; }
    .admissions-btn { display: block; width: 100%; padding: 10px; border-radius: 999px; background: #f97316; color: #fff; font-size: 14px; font-weight: 600; text-decoration: none; text-align: center; }
    .admissions-btn:hover { background: #ea6c0a; }

    /* ── Related posts ── */
    .related-section { margin-top: 64px; border-top: 1px solid #f3f4f6; padding-top: 48px; }
    .related-title { font-family: 'League Spartan', sans-serif; font-size: 26px; font-weight: 900; color: #0d3b86; margin-bottom: 32px; text-align: center; }
    .related-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    @media(max-width: 767px) { .related-grid { grid-template-columns: 1fr; } }
    .related-card { display: block; border-radius: 16px; overflow: hidden; border: 1px solid #f3f4f6; box-shadow: 0 1px 6px rgba(0,0,0,0.06); text-decoration: none; background: #fff; transition: box-shadow 0.2s; }
    .related-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
    .related-body { padding: 20px; }
    .related-cat { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #f97316; }
    .related-title-text { font-size: 14px; font-weight: 700; margin-top: 5px; line-height: 1.4; color: #111827; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .related-card:hover .related-title-text { color: #1d4ed8; }
    .related-date { font-size: 12px; color: #6b7280; margin-top: 5px; }

    /* ── Contact strip (orange bar) ── */
    .contact-strip { background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); }
    .contact-strip-inner { max-width: 1000px; margin: 0 auto; padding: 40px 24px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    @media(max-width: 767px) { .contact-strip-inner { grid-template-columns: repeat(2, 1fr); } }
    .contact-card { border-radius: 16px; padding: 24px 16px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; background: rgba(255,255,255,0.12); text-decoration: none; }
    .contact-card:hover { background: rgba(255,255,255,0.18); }
    .contact-icon { width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .contact-icon svg { width: 20px; height: 20px; stroke: #fff; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .contact-label { font-weight: 800; color: #fff; font-size: 14px; }
    .contact-val { color: rgba(255,255,255,0.90); font-size: 12px; line-height: 1.6; }

    /* ── Footer ── */
    footer { background: #091a4f; color: rgba(255,255,255,0.70); }
    .footer-inner { max-width: 1280px; margin: 0 auto; padding: 48px 16px 32px; display: grid; grid-template-columns: 2fr 1fr 1fr 1.2fr; gap: 40px; }
    @media(max-width: 767px) { .footer-inner { grid-template-columns: 1fr; gap: 24px; } }
    .footer-brand { font-family: 'League Spartan', sans-serif; font-size: 18px; font-weight: 900; color: #fff; margin-bottom: 12px; }
    .footer-desc { font-size: 13px; line-height: 1.7; color: rgba(255,255,255,0.60); margin-bottom: 16px; }
    .footer-socials { display: flex; gap: 10px; }
    .footer-social-btn { width: 34px; height: 34px; border-radius: 8px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; }
    .footer-social-btn svg { width: 16px; height: 16px; stroke: rgba(255,255,255,0.70); fill: none; stroke-width: 2; }
    .footer-col-title { font-family: 'League Spartan', sans-serif; font-size: 14px; font-weight: 900; color: #fff; margin-bottom: 16px; }
    .footer-link-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
    .footer-link-list a { font-size: 13px; color: rgba(255,255,255,0.60); text-decoration: none; }
    .footer-link-list a:hover { color: #fff; }
    .footer-contact-item { display: flex; gap: 10px; margin-bottom: 12px; font-size: 13px; color: rgba(255,255,255,0.60); }
    .footer-contact-item svg { width: 15px; height: 15px; stroke: rgba(255,255,255,0.50); fill: none; stroke-width: 2; flex-shrink: 0; margin-top: 2px; }
    .footer-bottom { border-top: 1px solid rgba(255,255,255,0.08); }
    .footer-bottom-inner { max-width: 1280px; margin: 0 auto; padding: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 12px; color: rgba(255,255,255,0.35); }
    .footer-bottom-inner a { color: rgba(255,255,255,0.35); text-decoration: none; }
    .footer-bottom-inner a:hover { color: rgba(255,255,255,0.70); }

  </style>
  <!-- Meta Pixel Code -->
  <script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1280590747364170');fbq('track','PageView');</script>
  <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1280590747364170&ev=PageView&noscript=1"/></noscript>
  <!-- End Meta Pixel Code -->
</head>
<body>

<div id="progress-bar"></div>

<!-- Top Bar -->
<div class="topbar">
  <a href="tel:02269105000">
    <svg class="topbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.14 7.74a16 16 0 006.12 6.12l1.12-1.12a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"></path></svg>
    (022) 69105000
  </a>
  <a href="tel:+918291568972">+91 82915 68972</a>
  <span style="margin-left:auto;display:flex;align-items:center;gap:5px;">
    <svg class="topbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
    Mon – Sat, 9:00 AM – 6:00 PM
  </span>
</div>

<!-- Navbar -->
<nav class="navbar">
  <a class="nav-brand" href="/">
    <img src="/ris-logo.png" alt="Rainbow International School" class="nav-brand-logo" onerror="this.style.display='none'" />
    Rainbow International School
  </a>
  <ul class="nav-links">
    <li><a href="/">Home</a></li>
    <li><a href="/about-rainbow-international-school">About</a></li>
    <li><a href="/pre-primary-school-thane">Academics</a></li>
    <li><a href="/amenities">Amenities</a></li>
    <li><a href="/blogs">Blog</a></li>
    <li><a href="/contact-us">Contact</a></li>
    <li><a href="/application-form" class="nav-cta">Apply Now</a></li>
  </ul>
</nav>

<!-- Hero -->
<div class="hero">
  <div class="hero-bg" style="background-image: url('${e(post.heroUrl)}');"></div>
  <div class="hero-inner">
    <span class="hero-cat">${e(post.cat)}</span>
    <h1>${e(post.title)}</h1>
    <div class="hero-meta">
      <span>${e(post.date)}</span>
      <span class="hero-meta-dot"></span>
      <span>${e(post.cat)}</span>
    </div>
  </div>
</div>

<!-- Breadcrumb -->
<div class="breadcrumb">
  <div class="breadcrumb-inner">
    <a href="/">Home</a>
    <span>/</span>
    <a href="/blogs">Blogs</a>
    <span>/</span>
    <span class="current">${e(post.title)}</span>
  </div>
</div>

<!-- Main -->
<div class="page-main">
  <div class="page-container">
    <div class="content-row">

      <!-- Article -->
      <article>
        <p class="intro-para">${e(post.intro)}</p>

        ${sectionsHtml}

        <!-- Conclusion -->
        ${(() => {
          const parts = post.conclusion.split(/\n\nRIS_BACKLINK:\s*/);
          const mainText = parts[0] || "";
          const backlink = parts[1] || "";
          const mainHtml = mainText.split("\n\n").map((p: string) => `<p>${renderInlineMd(p.replace(/\n/g, " "))}</p>`).join("");
          const backlinkHtml = backlink ? `<div class="backlink-box"><span class="backlink-icon">🌈</span><p>${renderInlineMd(backlink.trim())}</p></div>` : "";
          return `<div class="conclusion-box"><h2>Conclusion</h2>${mainHtml}</div>${backlinkHtml}`;
        })()}

        <!-- Tags -->
        <div class="tags">${tagsHtml}</div>

        <!-- Bottom nav -->
        <div class="article-bottom">
          <a href="/blogs" class="btn-ghost">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
            All Blogs
          </a>
          <a href="/contact-us" class="btn-primary">
            Apply for Admissions
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </a>
        </div>
      </article>

      <!-- Sidebar -->
      <aside>

        <!-- Explore Rainbow -->
        <div class="sidebar-box">
          <p class="sidebar-box-title">Explore Rainbow</p>
          <ul class="internal-link-list">
            ${internalLinksHtml}
          </ul>
        </div>

        <!-- RPS Box -->
        <div class="rps-box">
          <div class="rps-logo-wrap">
            <img src="/rps-logo.png" alt="Rainbow Preschool International" class="rps-logo" onerror="this.parentElement.style.display='none'" />
          </div>
          <p class="rps-title">Rainbow Preschool International</p>
          <p class="rps-desc">Explore our award-winning preschool chain — the perfect foundation before joining Rainbow International School.</p>
          <a href="https://www.rainbowpreschools.com" target="_blank" rel="noopener noreferrer" class="rps-btn">
            Visit RPS
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
        </div>

        <!-- Admissions CTA -->
        <div class="admissions-box">
          <div class="admissions-emoji">🎓</div>
          <p class="admissions-title">Admissions Open</p>
          <p class="admissions-sub">2026–27 admissions are now open for Nursery to Class 12.</p>
          <a href="/contact-us" class="admissions-btn">Apply Now</a>
        </div>

      </aside>
    </div>

    <!-- Related Posts -->
    ${
      related.length > 0
        ? `<div class="related-section">
        <h2 class="related-title">Related Articles</h2>
        <div class="related-grid">
          ${relatedHtml}
        </div>
      </div>`
        : ""
    }
  </div>

  <!-- Contact Strip -->
  <div class="contact-strip">
    <div class="contact-strip-inner">
      <a href="tel:+918291568972" class="contact-card">
        <div class="contact-icon"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.14 7.74a16 16 0 006.12 6.12l1.12-1.12a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"></path></svg></div>
        <div><p class="contact-label">Call Us</p><p class="contact-val">+91 82915 68972</p></div>
      </a>
      <a href="mailto:admin@rainbowinternationalschool.in" class="contact-card">
        <div class="contact-icon"><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></div>
        <div><p class="contact-label">Email Us</p><p class="contact-val">admin@rainbow<br/>internationalschool.in</p></div>
      </a>
      <div class="contact-card">
        <div class="contact-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
        <div><p class="contact-label">Working Hours</p><p class="contact-val">Monday – Saturday<br/>9:00 AM – 6:00 PM</p></div>
      </div>
      <a href="https://maps.app.goo.gl/mfJjMMkksCkcXzMCA" target="_blank" rel="noopener noreferrer" class="contact-card">
        <div class="contact-icon"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>
        <div><p class="contact-label">Our Address</p><p class="contact-val">Cosmos Arcade, Brahmand Phase 4<br/>Thane, Maharashtra</p></div>
      </a>
    </div>
  </div>
</div>

<!-- Footer -->
<footer>
  <div class="footer-inner">
    <div>
      <p class="footer-brand">Rainbow International School</p>
      <p class="footer-desc">CBSE-affiliated school in Thane, Maharashtra. Nursery to Class 12. Founded April 2009. Affiliation No. 1130661.</p>
      <div class="footer-socials">
        <a href="https://www.facebook.com/RainbowInternationalSchoolThane" class="footer-social-btn" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg>
        </a>
        <a href="https://www.instagram.com/rainbowschoolthane" class="footer-social-btn" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
        </a>
        <a href="https://www.youtube.com/@rainbowinternationalschoolthane" class="footer-social-btn" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
        </a>
      </div>
    </div>
    <div>
      <p class="footer-col-title">Quick Links</p>
      <ul class="footer-link-list">
        <li><a href="/about-rainbow-international-school">About Rainbow</a></li>
        <li><a href="/pre-primary-school-thane">Pre-Primary Section</a></li>
        <li><a href="/primary-section">Primary Section</a></li>
        <li><a href="/middle-school-section">Middle School</a></li>
        <li><a href="/secondary-section">Secondary Section</a></li>
        <li><a href="/senior-secondary-section">Senior Secondary</a></li>
        <li><a href="/academic-calendar">Academic Calendar</a></li>
      </ul>
    </div>
    <div>
      <p class="footer-col-title">Explore</p>
      <ul class="footer-link-list">
        <li><a href="/awards-achievements">Awards & Achievements</a></li>
        <li><a href="/amenities">Amenities & Facilities</a></li>
        <li><a href="/student-achievements">Student Achievements</a></li>
        <li><a href="/safety-security">Safety & Security</a></li>
        <li><a href="/beyond-the-classroom">Beyond The Classroom</a></li>
        <li><a href="/extracurriculars">Extracurriculars</a></li>
        <li><a href="/blogs">Blogs</a></li>
      </ul>
    </div>
    <div>
      <p class="footer-col-title">Contact Us</p>
      <div class="footer-contact-item">
        <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        <span>Cosmos Arcade, Brahmand Phase 4, Thane, Maharashtra</span>
      </div>
      <div class="footer-contact-item">
        <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.14 7.74a16 16 0 006.12 6.12l1.12-1.12a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"></path></svg>
        <span>+91 82915 68972</span>
      </div>
      <div class="footer-contact-item">
        <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        <a href="mailto:info@rainbowinternationalschool.in" style="color:rgba(255,255,255,0.60);text-decoration:none;">info@rainbowinternationalschool.in</a>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="footer-bottom-inner">
      <span>&copy; ${new Date().getFullYear()} Rainbow International School &middot; CBSE Affiliation No. 1130661</span>
      <div style="display:flex;gap:24px;">
        <a href="/cbse-mandatory-public-disclosures">CBSE Disclosures</a>
        <a href="/privacy-policy-and-cookie-policy">Privacy Policy</a>
      </div>
    </div>
  </div>
</footer>

<!-- SSR indicator badge -->
<div class="ssr-badge">⚡ SSR Demo</div>

<script>
  // Scroll progress bar
  window.addEventListener('scroll', function() {
    var el = document.getElementById('progress-bar');
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    el.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
  });
</script>

</body>
</html>`;
}

export function registerSSRRoutes(app: Express) {
  // Production SSR — replaces React blog pages, no demo badge
  app.get("/blog/:slug", (req, res, next) => {
    const { slug } = req.params;
    if (/\.\w+$/.test(slug)) return next();
    const html = renderBlogSSR(slug);
    if (!html) return next();
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("X-Rendered-By", "Express SSR");
    res.send(html);
  });

}
