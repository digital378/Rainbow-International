import type { Express } from "express";
import { isCrawlerUa } from "./crawlerUa";
import { normalizeSchemaHtml, buildOrgNode, buildWebsiteNode } from "@shared/orgSchema";
import {
  HOME_SEO, HOME_HERO, HOME_AWARDS_INTRO, HOME_JOURNEY, HOME_THEATRE, HOME_WHY,
  HOME_ACADEMICS, HOME_PEDAGOGY, HOME_DISCOVER, HOME_NEIGHBOURHOOD,
  HOME_BEYOND, HOME_TESTIMONIALS, HOME_CONTACT, HOME_QUICK_ANSWER,
  HOME_FAQS, HOME_FOOTER_DESCRIPTION, HOME_QUICK_ANSWER_HEADINGS,
} from "@shared/content/home";

function e(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const SSR_HOME_IMAGES = [
  "<img src=\"/images/awards/india-today.webp\" alt=\"India Today Award\" />",
  "<img src=\"/images/awards/nsa-award.webp\" alt=\"National School Awards\" />",
  "<img src=\"/images/awards/wes-mumbai.webp\" alt=\"World Education Summit\" />",
  "<img src=\"/images/awards/economic-times.webp\" alt=\"Economic Times\" />",
  "<img src=\"/images/awards/scoonews.webp\" alt=\"Scoo News\" />",
  "<img src=\"/images/awards/tmc-logo.webp\" alt=\"Thane Municipal Corp\" />",
  "<img src=\"/images/home/academic/pre-primary.jpg\" alt=\"Pre-Primary\" />",
  "<img src=\"/images/home/academic/primary-section.jpg\" alt=\"Primary\" />",
  "<img src=\"/images/home/academic/middle-section.jpg\" alt=\"Middle School\" />",
  "<img src=\"/images/home/academic/secondary.jpg\" alt=\"Secondary\" />",
  "<img src=\"/images/home/academic/senior-secondary.jpg\" alt=\"Senior Secondary\" />",
  "<img src=\"/images/home/discover/awards.jpg\" alt=\"Awards & Accomplishments\" />",
  "<img src=\"/images/home/discover/amenities.jpg\" alt=\"Amenities & Facilities\" />",
  "<img src=\"/images/home/discover/student-achievements.jpg\" alt=\"Student Achievements\" />",
  "<img src=\"/images/home/discover/safety-security.jpg\" alt=\"Safety & Security\" />",
  "<img src=\"/images/home/beyond-classroom-rocket.jpg\" alt=\"Beyond The Classroom at Rainbow International School\" />"
];

function renderHomeMain(): string {
  const link = (item: { label: string; href: string }, className = "") =>
    `<a href="${e(item.href)}" class="${e(className)}">${e(item.label)}</a>`;
  const heading = (title: string, sub: string) =>
    `<h2 class="section-title">${e(title)}</h2><p class="section-sub">${e(sub)}</p>`;
  return `<main role="main"><article>
<section class="hero"><div class="hero-bg"></div><div class="hero-overlay"></div><div class="container"><div class="hero-inner"><div class="hero-text">
  <div class="hero-badge"><span class="hero-badge-dot"></span>${e(HOME_HERO.badge)}</div>
  <h1>${e(HOME_HERO.titleLines[0])}<br/><span class="gold">${e(HOME_HERO.titleLines[1])}</span><br/><span>${e(HOME_HERO.titleLines[2])}</span></h1>
  <p class="hero-sub">${e(HOME_HERO.subLine)}</p><p>${e(HOME_HERO.intro)}</p>
  <div class="hero-stats">${HOME_HERO.trustChips.map(chip => `<div class="hero-stat"><div class="hero-stat-num">${e(chip.num)}</div><div class="hero-stat-label">${e(chip.label)}</div></div>`).join("")}</div>
  <div class="hero-btns">${link(HOME_HERO.buttons[0], "btn-gold")}${link(HOME_HERO.buttons[1], "btn-outline")}</div>
  <div class="hero-quick">${HOME_HERO.quickLinks.map(item => link(item)).join("")}</div>
</div></div></div></section>
<section class="awards-strip">
  <p class="awards-tag">${e(HOME_AWARDS_INTRO.eyebrow)}</p><h2>${e(HOME_AWARDS_INTRO.titleParts[0])}<br/><span>${e(HOME_AWARDS_INTRO.titleParts[1])}</span></h2>
  <p class="awards-desc">${e(HOME_AWARDS_INTRO.paragraph)}</p>
  <div class="awards-logos">${SSR_HOME_IMAGES.slice(0, 6).map(image => `<div>${image}</div>`).join("")}</div>
  ${link(HOME_AWARDS_INTRO.button, "btn-gold")}
</section>
<section class="about-preview" id="admission-journey"><div class="container">
  <p class="section-tag">${e(HOME_JOURNEY.eyebrow)}</p>${heading(HOME_JOURNEY.title, HOME_JOURNEY.sub)}
  ${HOME_JOURNEY.steps.map(step => `<div><p>${e(HOME_JOURNEY.stepLabel)} ${e(step.step)}</p><h3>${e(step.title)}</h3><p>${e(step.desc)}</p></div>`).join("")}
  ${link(HOME_JOURNEY.visit, "btn-gold")}
</div></section>
<section id="rainbow-theatre"><div class="container">
  <p>${e(HOME_THEATRE.eyebrow)}</p><h2>${e(HOME_THEATRE.title)}</h2><p>${e(HOME_THEATRE.sub)}</p>
  ${link(HOME_THEATRE.instagram)}
</div></section>
<section class="about-preview"><div class="container">
  <p class="section-tag">${e(HOME_WHY.eyebrow)}</p>${heading(`${HOME_WHY.title} ${HOME_WHY.titleAccent}`, HOME_WHY.sub)}
  ${HOME_WHY.cards.map(card => `<div><h3>${e(card.title)}</h3><p>${e(card.desc)}</p></div>`).join("")}
  <div class="about-stats">${HOME_WHY.stats.map(stat => `<div><strong>${e(stat.display)}</strong><p>${e(stat.label)}</p></div>`).join("")}</div>
  ${link(HOME_WHY.visit, "btn-gold")}${link(HOME_WHY.learnMore, "btn-outline")}
</div></section>
<section class="academics" id="academics"><div class="container">
  <p class="section-tag">${e(HOME_ACADEMICS.eyebrow)}</p>${heading(`${HOME_ACADEMICS.title} ${HOME_ACADEMICS.titleAccent}`, HOME_ACADEMICS.sub)}
  <div class="programs-grid">${HOME_ACADEMICS.cards.map((card, index) => `<div class="program-card"><div class="program-card-img">${SSR_HOME_IMAGES[6 + index]}</div><div class="program-card-body"><h3>${e(card.label)}</h3><p>${e(card.grade)}</p><p>${e(card.concern)}</p><p>${e(card.advantage)}</p><a href="${e(card.href)}">${e(HOME_ACADEMICS.explore)}</a></div></div>`).join("")}</div>
</div></section>
<section class="pedagogy"><div class="container">
  <p class="section-tag">${e(HOME_PEDAGOGY.eyebrow)}</p>${heading(HOME_PEDAGOGY.title, HOME_PEDAGOGY.sub)}
  ${HOME_PEDAGOGY.tabs.map((tab, index) => `<div><h3>${e(tab.title)}</h3><p>${e(tab.description)}</p>${index === 0 ? `<ul>${tab.points.map(point => `<li>${e(point)}</li>`).join("")}</ul>` : ""}</div>`).join("")}
</div></section>
<section class="discover"><div class="container">
  <p class="section-tag">${e(HOME_DISCOVER.eyebrow)}</p>${heading(HOME_DISCOVER.title, HOME_DISCOVER.sub)}
  <div class="discover-grid">${HOME_DISCOVER.cards.map((card, index) => `<a href="${e(card.href)}" class="discover-card">${SSR_HOME_IMAGES[11 + index]}<div><p>${e(card.tag)}</p><h3>${e(card.title)}</h3><p>${e(card.description)}</p></div></a>`).join("")}</div>
</div></section>
<section class="about-preview" id="neighbourhood"><div class="container">
  <p class="section-tag">${e(HOME_NEIGHBOURHOOD.eyebrow)}</p>${heading(HOME_NEIGHBOURHOOD.title, HOME_NEIGHBOURHOOD.sub)}
  ${HOME_NEIGHBOURHOOD.features.map(feature => `<div><h3>${e(feature.title)}</h3><p>${e(feature.desc)}</p></div>`).join("")}
  <h3>${e(HOME_NEIGHBOURHOOD.areaTitle)}</h3><ul>${HOME_NEIGHBOURHOOD.areas.map(area => `<li>${e(area.name)} — ${e(area.time)} ${e(HOME_NEIGHBOURHOOD.drive)}</li>`).join("")}</ul>
  <p>${e(HOME_NEIGHBOURHOOD.address)}</p>${HOME_NEIGHBOURHOOD.buttons.map(item => link(item, "btn-gold")).join("")}
</div></section>
<section class="beyond"><div class="container"><div class="beyond-inner"><div>
  <p class="section-tag">${e(HOME_BEYOND.eyebrow)}</p><h2 class="section-title">${e(HOME_BEYOND.titleParts.join(" "))}</h2>
  <p>${e(HOME_BEYOND.intro)} <strong>${e(HOME_BEYOND.emphasis)}</strong></p><p>${e(HOME_BEYOND.paragraph)}</p>
  <ul>${HOME_BEYOND.activities.map(activity => `<li>${e(activity)}</li>`).join("")}</ul>
  ${link(HOME_BEYOND.button, "btn-gold")}<p>${e(HOME_BEYOND.badgeLabel)} ${e(HOME_BEYOND.badgeValue)}</p>
</div><div>${SSR_HOME_IMAGES[15]}</div></div></div></section>
<section class="testimonials" id="testimonials"><div class="container">
  <p class="section-tag">${e(HOME_TESTIMONIALS.eyebrow)}</p>${heading(HOME_TESTIMONIALS.title, HOME_TESTIMONIALS.sub)}
  <p>${e(HOME_TESTIMONIALS.rating)} ${e(HOME_TESTIMONIALS.ratingLabel)}</p>
  <div class="testimonials-grid">${HOME_TESTIMONIALS.reviews.slice(0, 3).map(review => `<div class="testimonial-card"><blockquote>${e(review.review)}</blockquote><p>${e(review.initials)}</p><h3>${e(review.name)}</h3></div>`).join("")}</div>
  ${link(HOME_TESTIMONIALS.button, "btn-gold")}
</div></section>
<section class="contact-section" id="contact"><div class="container">
  <h2 class="section-title">${e(HOME_CONTACT.title)}</h2>
  <p>${e(HOME_CONTACT.introBeforeBreak)}<br/>${e(HOME_CONTACT.introBeforePhone)} <a href="${e(HOME_CONTACT.phoneHref)}">${e(HOME_CONTACT.phone)}</a> ${e(HOME_CONTACT.introAfterPhone)}</p>
  <p>${e(HOME_CONTACT.address)}</p><a href="mailto:${e(HOME_CONTACT.email)}">${e(HOME_CONTACT.email)}</a>
</div></section>
<section><div class="container"><h2>${e(HOME_QUICK_ANSWER_HEADINGS.title)}</h2><p>${e(HOME_QUICK_ANSWER)}</p>
  <h3>${e(HOME_QUICK_ANSWER_HEADINGS.faqTitle)}</h3>
  ${HOME_FAQS.map(faq => `<details><summary>${e(faq.q)}</summary><p>${e(faq.a)}</p></details>`).join("")}
</div></section>
</article></main>`;
}

function renderHomeSSR(): string {
  const year = new Date().getFullYear();
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [buildOrgNode(), buildWebsiteNode()],
  }).replace(/</g, "\\u003c");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="google-site-verification" content="jWDe0ilooX5MO3xp-F6nSkapvxY8m9Oyq3gL4_JI0hY" />
<script async src="https://www.googletagmanager.com/gtag/js?id=G-DN4GB6MVJJ"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-DN4GB6MVJJ');gtag('config','AW-18140772845');</script>
<title>${e(HOME_SEO.title)}</title>
<meta name="description" content="${e(HOME_SEO.description)}" />
<meta name="keywords" content="${e(HOME_SEO.keywords)}" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="${e(HOME_SEO.canonical)}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${e(HOME_SEO.ogTitle)}" />
<meta property="og:description" content="${e(HOME_SEO.ogDescription)}" />
<meta property="og:url" content="${e(HOME_SEO.canonical)}" />
<meta property="og:image" content="${e(HOME_SEO.ogImage)}" />
<meta property="og:site_name" content="Rainbow International School" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${e(HOME_SEO.ogTitle)}" />
<meta name="twitter:description" content="${e(HOME_SEO.ogDescription)}" />
<meta name="twitter:image" content="${e(HOME_SEO.ogImage)}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&family=Merriweather:wght@700;900&display=swap" rel="stylesheet" />

<script type="application/ld+json">${schema}</script>



<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Open Sans',sans-serif;color:#1a1a2e;line-height:1.6;background:#fff}
a{color:inherit;text-decoration:none}
img{max-width:100%;display:block}
.container{max-width:1200px;margin:0 auto;padding:0 16px}

/* Progress bar */
#progress-bar{position:fixed;top:0;left:0;height:3px;width:0;z-index:9999;background:linear-gradient(90deg,#ef4444,#f97316,#facc15,#22c55e,#3b82f6,#8b5cf6);transition:width .1s}

/* Top bar */
.topbar{background:#091a4f;color:rgba(255,255,255,.7);font-size:13px;padding:8px 24px;display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.topbar a{color:rgba(255,255,255,.7);display:inline-flex;align-items:center;gap:5px}
.topbar a:hover{color:#fff}
.topbar svg{width:13px;height:13px;flex-shrink:0}

/* Navbar */
.navbar{position:sticky;top:0;z-index:100;background:#fff;box-shadow:0 1px 8px rgba(0,0,0,.06);padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:64px}
.nav-brand{display:flex;align-items:center;gap:10px;font-weight:900;font-size:17px;color:#091a4f}
.nav-brand-logo{height:42px;width:auto}
.nav-links{display:flex;list-style:none;gap:22px}
.nav-links a{font-size:14px;font-weight:600;color:#374151;transition:color .2s}
.nav-links a:hover{color:#0d3b86}
@media(max-width:768px){.nav-links{display:none}}

/* Hero */
.hero{position:relative;min-height:90vh;display:flex;align-items:center;overflow:hidden;background:#091a4f}
.hero-bg{position:absolute;inset:0;z-index:0;background-size:cover;background-position:center top;background-image:url(/images/students/hero-senior-secondary.webp);}
.hero-overlay{position:absolute;inset:0;z-index:1;background:linear-gradient(115deg,rgba(9,26,79,.95) 0%,rgba(13,59,134,.88) 55%,rgba(9,26,79,.65) 100%)}
.hero-inner{position:relative;z-index:2;display:flex;align-items:center;gap:60px;padding:80px 0;flex-wrap:wrap}
.hero-text{flex:1;min-width:320px;color:#fff}
.hero-badge{display:inline-flex;align-items:center;gap:10px;padding:8px 18px;border-radius:9999px;border:1px solid rgba(251,191,36,.3);background:rgba(251,191,36,.1);margin-bottom:20px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#fde68a}
.hero-badge-dot{width:10px;height:10px;border-radius:50%;background:#fbbf24;display:inline-block}
.hero h1{font-family:'Merriweather',serif;font-size:clamp(36px,5vw,64px);font-weight:900;line-height:1.08;margin-bottom:20px}
.hero h1 .gold{color:#fbbf24}
.hero-sub{color:rgba(191,219,254,.9);font-size:clamp(16px,1.8vw,20px);line-height:1.6;margin-bottom:28px;max-width:520px;font-weight:300}
.hero-stats{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:28px}
.hero-stat{padding:12px 20px;border-radius:16px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.07);text-align:center;backdrop-filter:blur(4px)}
.hero-stat-num{font-size:17px;font-weight:900;color:#fde68a;line-height:1}
.hero-stat-label{font-size:11px;color:rgba(191,219,254,.8);margin-top:3px}
.hero-btns{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:28px}
.btn-gold{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:9999px;font-weight:700;font-size:14px;background:#fbbf24;color:#0d3b86;border:none;cursor:pointer;transition:all .3s}
.btn-gold:hover{transform:scale(1.03);box-shadow:0 8px 20px rgba(251,191,36,.3)}
.btn-outline{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:9999px;font-weight:700;font-size:14px;background:transparent;color:#fff;border:2px solid rgba(255,255,255,.3);cursor:pointer;transition:all .3s}
.btn-outline:hover{background:rgba(255,255,255,.1)}
.hero-quick{display:flex;flex-wrap:wrap;gap:8px}
.hero-quick a{padding:6px 14px;border-radius:8px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.8);font-size:12px;font-weight:500;backdrop-filter:blur(4px);transition:all .2s}
.hero-quick a:hover{background:rgba(255,255,255,.2);color:#fff}
.hero-form{width:360px;flex-shrink:0;background:#fff;border-radius:24px;box-shadow:0 20px 50px rgba(0,0,0,.2);overflow:hidden}
.hero-form-header{padding:16px 24px;border-bottom:1px solid #f3f4f6;background:#f8faff;display:flex;align-items:center;gap:12px}
.hero-form-icon{width:40px;height:40px;border-radius:16px;background:#e8f4fb;display:flex;align-items:center;justify-content:center}
.hero-form-icon svg{width:18px;height:18px;color:#0d3b86}
.hero-form-body{padding:20px 24px}
.hero-form input,.hero-form select{width:100%;border:1px solid #e5e7eb;border-radius:12px;padding:12px 16px;font-size:14px;margin-bottom:12px;background:#fff;font-family:inherit;color:#374151}
.hero-form input:focus,.hero-form select:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.1)}
.hero-form button[type="submit"]{width:100%;padding:14px;border:none;border-radius:12px;font-weight:700;color:#fff;font-size:14px;cursor:pointer;background:linear-gradient(135deg,#0d3b86,#1565c0);transition:all .3s;font-family:inherit}
.hero-form button[type="submit"]:hover{opacity:.9;box-shadow:0 4px 16px rgba(13,59,134,.3)}
.hero-form-trust{text-align:center;font-size:11px;color:#9ca3af;margin-top:8px;display:flex;align-items:center;justify-content:center;gap:6px}
.hero-wave{position:absolute;bottom:0;left:0;right:0;pointer-events:none}
@media(max-width:960px){.hero-form{width:100%}.hero-inner{flex-direction:column}}

/* Awards strip */
.awards-strip{padding:60px 0;background:linear-gradient(135deg,#091a4f 0%,#0d3b86 60%,#091a4f 100%);text-align:center}
.awards-strip .awards-tag{color:#fbbf24;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;margin-bottom:16px}
.awards-strip h2{font-family:'Merriweather',serif;font-size:clamp(28px,4vw,42px);font-weight:900;color:#fff;line-height:1.15;margin-bottom:16px}
.awards-strip h2 span{color:#fbbf24}
.awards-strip .awards-desc{color:rgba(191,219,254,.8);font-size:15px;max-width:520px;margin:0 auto 32px;line-height:1.8}
.awards-logos{display:flex;gap:16px;justify-content:center;align-items:center;flex-wrap:wrap;margin-bottom:32px}
.awards-logos div{width:120px;height:80px;background:#fff;border-radius:16px;display:flex;align-items:center;justify-content:center;padding:12px;box-shadow:0 4px 12px rgba(0,0,0,.15)}
.awards-logos img{max-height:100%;max-width:100%;object-fit:contain}
.awards-strip .btn-gold{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:9999px;font-weight:700;font-size:14px;background:#fbbf24;color:#091a4f;border:none;text-decoration:none}

/* Section header helper */
.section-tag{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;padding:8px 16px;border-radius:9999px;margin-bottom:20px}
.section-tag .dot{width:6px;height:6px;border-radius:50%;background:currentColor}
.section-title{font-family:'Merriweather',serif;font-size:clamp(28px,4vw,44px);font-weight:900;line-height:1.15;color:#111;margin-bottom:12px}
.section-sub{font-size:17px;color:#6b7280;max-width:520px}

/* Features */
.features{padding:96px 0;background:#fff}
.features .section-sub{margin:0 auto}
.feature-images{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;align-items:flex-end;margin-top:48px}
.feature-img{border-radius:22px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.08);transition:all .5s}
.feature-img:hover{transform:translateY(-8px);box-shadow:0 12px 32px rgba(0,0,0,.12)}
.feature-img img{width:100%;height:100%;object-fit:cover}

/* About preview */
.about-preview{padding:96px 0;background:#f8faff}
.about-inner{display:flex;gap:64px;align-items:center;flex-wrap:wrap}
.about-text{flex:1;min-width:320px}
.about-text p{color:#4b5563;font-size:15px;line-height:1.8;margin-bottom:16px}
.about-highlights{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:24px 0}
.about-highlight{display:flex;align-items:center;gap:10px;font-size:14px;color:#4b5563}
.about-highlight svg{width:15px;height:15px;color:#0d3b86;flex-shrink:0}
.btn-blue{display:inline-flex;align-items:center;gap:10px;padding:14px 28px;border-radius:9999px;font-weight:700;font-size:14px;background:#0d3b86;color:#fff;border:none;cursor:pointer;transition:all .3s}
.btn-blue:hover{transform:scale(1.03);box-shadow:0 4px 16px rgba(13,59,134,.3)}
.about-stats{display:grid;grid-template-columns:1fr 1fr;gap:16px;flex-shrink:0}
.about-stat{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;width:165px;height:165px;background:#fff;border-radius:24px;border:1px solid #f3f4f6;box-shadow:0 1px 4px rgba(0,0,0,.04)}
.about-stat-num{font-size:28px;font-weight:900;color:#0d3b86;line-height:1}
.about-stat-label{font-size:12px;font-weight:600;color:#6b7280;margin-top:8px}
@media(max-width:768px){.about-stats{grid-template-columns:repeat(4,1fr)}.about-stat{width:auto;height:auto;padding:20px 10px}}

/* Academic programmes */
.academics{padding:96px 0;background:#f8faff}
.programs-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:20px}
.programs-grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;max-width:640px;margin:0 auto 40px}
.program-card{background:#fff;border-radius:24px;overflow:hidden;border:1px solid #f3f4f6;box-shadow:0 1px 4px rgba(0,0,0,.04);transition:all .5s}
.program-card:hover{box-shadow:0 12px 40px rgba(0,0,0,.1);transform:translateY(-8px)}
.program-card-img{height:210px;overflow:hidden}
.program-card-img img{width:100%;height:100%;object-fit:cover;transition:transform .7s}
.program-card:hover .program-card-img img{transform:scale(1.1)}
.program-card-body{padding:24px}
.program-tag{display:inline-block;padding:4px 12px;border-radius:9999px;font-size:11px;font-weight:700;margin-bottom:12px}
.program-card h3{font-weight:900;font-size:20px;color:#111;margin-bottom:8px}
.program-card p{font-size:14px;color:#6b7280;line-height:1.6;margin-bottom:16px}
.program-link{display:inline-flex;align-items:center;gap:6px;font-size:14px;font-weight:700}
@media(max-width:768px){.programs-grid,.programs-grid-2{grid-template-columns:1fr}}

/* Pedagogy */
.pedagogy{padding:96px 0;background:#fff}
.ped-tabs{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-bottom:40px}
.ped-tab{display:flex;align-items:center;gap:8px;padding:10px 20px;border-radius:9999px;font-weight:700;font-size:14px;border:2px solid #e5e7eb;background:#fff;color:#6b7280;cursor:pointer;transition:all .3s}
.ped-tab.active{color:#fff}
.ped-panel{max-width:720px;margin:0 auto;background:#fff;border-radius:24px;padding:32px 48px;border:1px solid #f3f4f6;box-shadow:0 1px 4px rgba(0,0,0,.04)}
.ped-panel h3{font-weight:900;font-size:22px;color:#111;margin-bottom:8px}
.ped-panel>p{font-size:15px;color:#6b7280;margin-bottom:24px;line-height:1.6}
.ped-points{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.ped-point{display:flex;align-items:flex-start;gap:10px;font-size:14px;color:#374151}
.ped-point svg{width:15px;height:15px;flex-shrink:0;margin-top:2px}
@media(max-width:640px){.ped-panel{padding:24px 20px}.ped-points{grid-template-columns:1fr}}

/* Discover */
.discover{padding:96px 0;background:#f8faff}
.discover-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.discover-card{position:relative;border-radius:24px;overflow:hidden;height:360px;cursor:pointer}
.discover-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .7s}
.discover-card:hover img{transform:scale(1.1)}
.discover-card-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.82) 0%,rgba(0,0,0,.1) 60%,transparent 100%)}
.discover-card-tag{position:absolute;top:16px;left:16px;padding:6px 12px;border-radius:9999px;font-size:12px;font-weight:700}
.discover-card-text{position:absolute;bottom:0;left:0;right:0;padding:20px}
.discover-card h3{color:#fff;font-weight:900;font-size:17px;line-height:1.3;margin-bottom:8px}
.discover-card p{color:rgba(255,255,255,.7);font-size:12px;line-height:1.5}
@media(max-width:768px){.discover-grid{grid-template-columns:1fr 1fr}}
@media(max-width:480px){.discover-grid{grid-template-columns:1fr}}

/* Beyond classroom */
.beyond{padding:96px 0;background:#fff}
.beyond-inner{display:flex;gap:64px;align-items:center;flex-wrap:wrap}
.beyond-text{flex:1;min-width:320px}
.beyond-tags{display:flex;flex-wrap:wrap;gap:10px;margin:32px 0}
.beyond-tag{padding:8px 16px;border-radius:9999px;font-size:14px;font-weight:600;background:#eef5ff;color:#0d3b86;border:1.5px solid #c7dbf8}
.beyond-img{flex:1;display:flex;justify-content:center}
.beyond-card{width:320px;height:320px;border-radius:40px;overflow:hidden;background:linear-gradient(145deg,#0a2763,#0d3b86 45%,#1550b8);border:4px solid rgba(255,255,255,.18);box-shadow:0 30px 80px -10px rgba(13,59,134,.45)}
.beyond-card img{width:100%;height:100%;object-fit:contain}

/* Testimonials */
.testimonials{padding:96px 0;background:#f8faff}
.test-header{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:48px}
.test-rating{display:flex;align-items:center;gap:12px;background:#fff;padding:12px 20px;border-radius:16px;border:1px solid #f3f4f6;box-shadow:0 1px 4px rgba(0,0,0,.04)}
.test-rating .stars{display:flex;gap:2px}
.test-rating .stars svg{width:15px;height:15px;fill:#facc15;color:#facc15}
.test-rating .score{font-weight:900;font-size:18px;color:#111}
.test-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.test-card{background:#fff;border-radius:24px;padding:24px;border:1px solid #f3f4f6;box-shadow:0 1px 4px rgba(0,0,0,.04);display:flex;flex-direction:column}
.test-card .quote-icon{width:28px;height:28px;color:#e8f0ff;margin-bottom:12px}
.test-card .review{color:#4b5563;font-size:14px;line-height:1.7;flex-grow:1;font-style:italic;margin-bottom:20px}
.test-card .author{display:flex;align-items:center;gap:12px;border-top:1px solid #f3f4f6;padding-top:16px}
.test-card .avatar{width:44px;height:44px;border-radius:50%;overflow:hidden;border:2px solid #f3f4f6;flex-shrink:0;background:#eef5ff}
.test-card .avatar img{width:100%;height:100%;object-fit:cover}
.test-card .author-name{font-weight:900;font-size:14px;color:#111}
.test-card .author-stars{display:flex;gap:1px}
.test-card .author-stars svg{width:11px;height:11px;fill:#facc15;color:#facc15}
@media(max-width:768px){.test-grid{grid-template-columns:1fr}}

/* Contact strip */
.contact-section{padding:96px 0;background:#fff}
.contact-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:48px}
.contact-card{display:flex;flex-direction:column;align-items:center;text-align:center;padding:28px 16px;border-radius:24px;transition:all .3s}
.contact-card:hover{transform:translateY(-4px);box-shadow:0 8px 24px rgba(0,0,0,.08)}
.contact-icon{width:48px;height:48px;border-radius:50%;background:rgba(13,59,134,.06);display:flex;align-items:center;justify-content:center;margin-bottom:12px}
.contact-icon svg{width:22px;height:22px;fill:none;stroke:#0d3b86;stroke-width:2}
.contact-label{font-weight:700;font-size:14px;color:#0d3b86;margin-bottom:4px}
.contact-val{font-size:13px;color:#6b7280;line-height:1.5}
@media(max-width:768px){.contact-cards{grid-template-columns:1fr 1fr}}

/* Footer */
footer{background:#091a4f;color:#fff;padding:64px 0 0}
.footer-inner{display:grid;grid-template-columns:1.2fr 1fr 1fr 1fr 1fr;gap:32px;max-width:1200px;margin:0 auto;padding:0 16px 48px}
.footer-brand{font-weight:900;font-size:17px;margin-bottom:12px}
.footer-desc{color:rgba(255,255,255,.5);font-size:13px;line-height:1.7;margin-bottom:20px}
.footer-socials{display:flex;gap:10px}
.footer-social-btn{width:40px;height:40px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;transition:all .3s}
.footer-social-btn:hover{border-color:rgba(251,191,36,.6);color:#fbbf24}
.footer-social-btn svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2}
.footer-col-title{font-weight:900;font-size:15px;margin-bottom:20px}
.footer-link{display:flex;align-items:center;gap:6px;color:rgba(255,255,255,.55);font-size:14px;padding:4px 0;transition:color .2s}
.footer-link:hover{color:#fff}
.footer-link .bullet{width:4px;height:4px;border-radius:50%;background:currentColor;opacity:.5;flex-shrink:0}
.footer-contact-item{display:flex;align-items:flex-start;gap:14px;margin-bottom:16px}
.footer-contact-item svg{width:16px;height:16px;flex-shrink:0;margin-top:2px;fill:none;stroke:#fbbf24;stroke-width:2}
.footer-contact-item span,.footer-contact-item a{color:rgba(255,255,255,.6);font-size:14px;line-height:1.5}
.footer-bottom{border-top:1px solid rgba(255,255,255,.1);padding:20px 16px}
.footer-bottom-inner{max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
.footer-bottom span,.footer-bottom a{color:rgba(255,255,255,.35);font-size:13px}
.footer-bottom a:hover{color:rgba(255,255,255,.7)}
@media(max-width:768px){.footer-inner{grid-template-columns:1fr}}

/* Check circle SVG */
.check-svg{width:15px;height:15px;fill:none;stroke:#0d3b86;stroke-width:2;flex-shrink:0}
/* Star SVG */
.star-svg{width:15px;height:15px;fill:#facc15;color:#facc15}
.star-svg-sm{width:11px;height:11px;fill:#facc15;color:#facc15}
</style>
<!-- Meta Pixel Code -->
<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1280590747364170');fbq('track','PageView');</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1280590747364170&ev=PageView&noscript=1"/></noscript>
<!-- End Meta Pixel Code -->
</head>
<body>

<div id="progress-bar"></div>

<header role="banner">
<!-- Top Bar -->
<div class="topbar">
  <a href="tel:+918291568972">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.14 7.74a16 16 0 006.12 6.12l1.12-1.12a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"></path></svg>
    +91 82915 68972
  </a>
  <a href="tel:+918291568972">+91 82915 68972</a>
  <span style="margin-left:auto;display:flex;align-items:center;gap:5px;">
    <svg style="width:13px;height:13px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
    Mon – Sat, 9:00 AM – 6:00 PM
  </span>
</div>

<!-- Navbar -->
<nav class="navbar" role="navigation" aria-label="Main navigation">
  <a class="nav-brand" href="/">
    <img src="/rps-logo.png" alt="Rainbow International School" class="nav-brand-logo" onerror="this.style.display='none'" />
    Rainbow International School
  </a>
  <ul class="nav-links">
    <li><a href="/">Home</a></li>
    <li><a href="/about-rainbow-international-school">About</a></li>
    <li><a href="/pre-primary-school-thane">Academics</a></li>
    <li><a href="/amenities">Amenities</a></li>
    <li><a href="/blogs">Blog</a></li>
    <li><a href="/contact-us">Contact</a></li>
  </ul>
</nav>
</header>

${renderHomeMain()}

<!-- Footer -->
<footer role="contentinfo">
  <div class="footer-inner">
    <div>
      <p class="footer-brand">Rainbow International School</p>
      <p class="footer-desc">${e(HOME_FOOTER_DESCRIPTION)}</p>
      <div class="footer-socials">
        <a href="https://www.facebook.com/RainbowInternationalSchoolThane/" class="footer-social-btn" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg>
        </a>
        <a href="https://www.instagram.com/rainbowinternationalschool/" class="footer-social-btn" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
        </a>
        <a href="https://www.youtube.com/@rainbowinternationalschool" class="footer-social-btn" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.08c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.41z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
        </a>
      </div>
    </div>
    <div>
      <p class="footer-col-title">Quick Links</p>
      <a href="/about-rainbow-international-school" class="footer-link"><span class="bullet"></span>About Rainbow</a>
      <a href="/pre-primary-school-thane" class="footer-link"><span class="bullet"></span>Pre-Primary Section</a>
      <a href="/primary-section" class="footer-link"><span class="bullet"></span>Primary Section</a>
      <a href="/middle-school-section" class="footer-link"><span class="bullet"></span>Middle School</a>
      <a href="/secondary-section" class="footer-link"><span class="bullet"></span>Secondary Section</a>
      <a href="/senior-secondary-section" class="footer-link"><span class="bullet"></span>Senior Secondary</a>
      <a href="/academic-calendar" class="footer-link"><span class="bullet"></span>Academic Calendar</a>
    </div>
    <div>
      <p class="footer-col-title">Explore</p>
      <a href="/awards-achievements" class="footer-link"><span class="bullet"></span>Awards &amp; Achievements</a>
      <a href="/amenities" class="footer-link"><span class="bullet"></span>Amenities &amp; Facilities</a>
      <a href="/student-achievements" class="footer-link"><span class="bullet"></span>Student Achievements</a>
      <a href="/safety-security" class="footer-link"><span class="bullet"></span>Safety &amp; Security</a>
      <a href="/beyond-the-classroom" class="footer-link"><span class="bullet"></span>Beyond The Classroom</a>
      <a href="/extracurriculars" class="footer-link"><span class="bullet"></span>Extracurriculars</a>
      <a href="/photo-gallery" class="footer-link"><span class="bullet"></span>Photo Gallery</a>
      <a href="/blogs" class="footer-link"><span class="bullet"></span>Blogs</a>
      <a href="/cbse-mandatory-public-disclosures" class="footer-link"><span class="bullet"></span>CBSE Disclosures</a>
    </div>
    <div>
      <p class="footer-col-title">Rainbow Preschools</p>
      <a href="https://www.rainbowpreschools.com/playgroup" target="_blank" rel="noopener noreferrer" class="footer-link"><span class="bullet"></span>Playgroup</a>
      <a href="https://www.rainbowpreschools.com/nursery" target="_blank" rel="noopener noreferrer" class="footer-link"><span class="bullet"></span>Nursery</a>
      <a href="https://www.rainbowpreschools.com/kindergarten" target="_blank" rel="noopener noreferrer" class="footer-link"><span class="bullet"></span>Kindergarten</a>
      <a href="https://www.rainbowpreschools.com/preschool-near-me" target="_blank" rel="noopener noreferrer" class="footer-link"><span class="bullet"></span>Our Centres</a>
      <a href="https://www.rainbowpreschools.com/gallery" target="_blank" rel="noopener noreferrer" class="footer-link"><span class="bullet"></span>Gallery</a>
      <a href="https://www.rainbowpreschools.com/play-school-near-me" target="_blank" rel="noopener noreferrer" class="footer-link"><span class="bullet"></span>Playschool in Thane</a>
      <a href="https://www.rainbowpreschools.com/best-preschool-near-me-in-thane" target="_blank" rel="noopener noreferrer" class="footer-link"><span class="bullet"></span>Preschool Near You</a>
      <a href="https://www.rainbowpreschools.com/preschool-admissions" target="_blank" rel="noopener noreferrer" class="footer-link"><span class="bullet"></span>Apply for Admission</a>
      <a href="https://www.rainbowpreschools.com" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(251,191,36,.8)">Visit Website &rarr;</a>
    </div>
    <div>
      <p class="footer-col-title">Get In Touch</p>
      <div class="footer-contact-item">
        <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        <span>Cosmos Arcade, Brahmand Phase 4, Thane, Maharashtra</span>
      </div>
      <div class="footer-contact-item">
        <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.14 7.74a16 16 0 006.12 6.12l1.12-1.12a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"></path></svg>
        <span><a href="tel:+918291568972" style="color:inherit;text-decoration:none;">+91 82915 68972</a><br/><a href="tel:+912269105000" style="color:inherit;text-decoration:none;">(022) 6910 5000</a></span>
      </div>
      <div class="footer-contact-item">
        <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        <a href="mailto:admin@rainbowinternationalschool.in" style="color:rgba(255,255,255,.60);text-decoration:none;">admin@rainbowinternationalschool.in</a>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="footer-bottom-inner">
      <span>&copy; ${year} Rainbow International School &middot; CBSE Affiliation No. 1130661</span>
      <div style="display:flex;gap:24px">
        <a href="/cbse-mandatory-public-disclosures">CBSE Disclosures</a>
        <a href="/privacy-policy-and-cookie-policy">Privacy Policy</a>
      </div>
    </div>
  </div>
</footer>

<script>
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

export function registerHomeSSR(app: Express) {
  app.get("/", (req, res, next) => {
    const ua = req.headers["user-agent"] || "";
    const isBot = isCrawlerUa(ua);

    if (isBot) {
      const html = renderHomeSSR();
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("X-Rendered-By", "Express SSR");
      return res.send(normalizeSchemaHtml(html));
    }

    next();
  });
}
