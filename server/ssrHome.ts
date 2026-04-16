import type { Express } from "express";

function e(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderHomeSSR(): string {
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="google-site-verification" content="jWDe0ilooX5MO3xp-F6nSkapvxY8m9Oyq3gL4_JI0hY" />
<script async src="https://www.googletagmanager.com/gtag/js?id=G-DN4GB6MVJJ"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-DN4GB6MVJJ');</script>
<title>Best CBSE school in thane near me - Rainbow International</title>
<meta name="description" content="Rainbow International School — best CBSE school in Thane near you. Nursery to Class 12, 3.5-acre campus, 3000+ students. Science, Commerce &amp; Humanities streams. Admissions 2026-27 open." />
<meta name="keywords" content="best CBSE school in Thane near me, CBSE school Thane, Rainbow International School, best school near me Thane, international school Thane, top CBSE school Thane, school admissions Thane 2026, K-12 school near me Thane" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://rainbowinternationalschool.in/" />
<meta property="og:type" content="website" />
<meta property="og:title" content="Best CBSE school in thane near me - Rainbow International" />
<meta property="og:description" content="Rainbow International School is one of the top CBSE K–12 schools in Thane, Maharashtra. World-class education from Nursery to Class 12." />
<meta property="og:url" content="https://rainbowinternationalschool.in/" />
<meta property="og:image" content="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad.jpg" />
<meta property="og:site_name" content="Rainbow International School" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Best CBSE school in thane near me - Rainbow International" />
<meta name="twitter:description" content="Rainbow International School — top CBSE K-12 school in Thane. Nursery to Class 12, 3.5-acre campus, 3000+ students. Admissions 2026-27 open." />
<meta name="twitter:image" content="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad.jpg" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&family=Merriweather:wght@700;900&display=swap" rel="stylesheet" />

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["EducationalOrganization", "School"],
  "name": "Rainbow International School",
  "alternateName": "RIS Thane",
  "url": "https://rainbowinternationalschool.in/",
  "logo": "https://rainbowinternationalschool.in/wp-content/uploads/2024/01/RIS-Logo.png",
  "image": "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad.jpg",
  "description": "Rainbow International School is a CBSE-affiliated K-12 school in Thane, Maharashtra. Founded in 2009, serving 3000+ students from Nursery to Class 12.",
  "foundingDate": "2009-04-01",
  "numberOfStudents": 3000,
  "numberOfEmployees": { "@type": "QuantitativeValue", "value": 200 },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Cosmos Arcade, Brahmand Phase 4",
    "addressLocality": "Thane",
    "addressRegion": "Maharashtra",
    "postalCode": "400607",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 19.2287,
    "longitude": 72.9637
  },
  "telephone": "+918291568972",
  "email": "info@rainbowinternationalschool.in",
  "sameAs": [
    "https://maps.app.goo.gl/mfJjMMkksCkcXzMCA",
    "https://www.facebook.com/RainbowInternationalSchoolThane/",
    "https://www.instagram.com/rainbowinternationalschool/",
    "https://www.youtube.com/@RainbowInternationalSchool"
  ],
  "areaServed": { "@type": "City", "name": "Thane" },
  "priceRange": "$$",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
    "opens": "09:00",
    "closes": "18:00"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "250",
    "bestRating": "5"
  }
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Rainbow International School",
  "url": "https://rainbowinternationalschool.in/"
}
</script>

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
  <a href="tel:02269105000">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.14 7.74a16 16 0 006.12 6.12l1.12-1.12a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"></path></svg>
    (022) 69105000
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

<main role="main">
<article itemscope itemtype="https://schema.org/School">
<meta itemprop="name" content="Rainbow International School" />
<meta itemprop="description" content="One of the top CBSE-affiliated K-12 schools in Thane, Maharashtra. Offering world-class education from Nursery to Class 12." />
<meta itemprop="address" content="Cosmos Arcade, Brahmand Phase 4, Thane, Maharashtra 400607" />
<meta itemprop="telephone" content="+91 82915 68972" />
<meta itemprop="url" content="https://rainbowinternationalschool.in" />
<meta itemprop="foundingDate" content="2009-04" />

<!-- Hero Section -->
<section class="hero">
  <div class="hero-bg"></div>
  <div class="hero-overlay"></div>
  <div class="container">
    <div class="hero-inner">
      <div class="hero-text">
        <div class="hero-badge">
          <span class="hero-badge-dot"></span>
          Admissions Open &middot; Academic Year 2026–27
        </div>
        <h1>Rainbow <span class="gold">International</span><br/>School</h1>
        <p class="hero-sub">Thane's premier CBSE K–12 school — where every child dares to dream, learns with joy, and grows into a lifelong learner.</p>
        <div class="hero-stats">
          <div class="hero-stat"><div class="hero-stat-num">50K+</div><div class="hero-stat-label">Happy Students</div></div>
          <div class="hero-stat"><div class="hero-stat-num">Since 2009</div><div class="hero-stat-label">Established</div></div>
          <div class="hero-stat"><div class="hero-stat-num">3.5 Acres</div><div class="hero-stat-label">Campus</div></div>
          <div class="hero-stat"><div class="hero-stat-num">CBSE #1130661</div><div class="hero-stat-label">Affiliation</div></div>
        </div>
        <div class="hero-btns">
          <a href="#contact" class="btn-gold">Enquire Now &#8250;</a>
          <a href="/about-rainbow-international-school" class="btn-outline">About Us</a>
        </div>
        <div class="hero-quick">
          <a href="/cbse-mandatory-public-disclosures">CBSE Disclosures</a>
          <a href="/pre-primary-school-thane">Pre-Primary</a>
          <a href="/middle-school-section">Middle School</a>
          <a href="/senior-secondary-section">Senior Secondary</a>
          <a href="/career">Career</a>
        </div>
      </div>
      <div class="hero-form">
        <div class="hero-form-header">
          <div class="hero-form-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.14 7.74a16 16 0 006.12 6.12l1.12-1.12a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"></path></svg>
          </div>
          <div>
            <p style="font-weight:900;font-size:14px;color:#111;line-height:1.2">Quick Enquiry</p>
            <p style="font-size:12px;color:#9ca3af">Our counsellor will call you back</p>
          </div>
        </div>
        <div class="hero-form-body">
          <form action="/api/inquiries" method="POST">
            <input type="text" name="parentName" placeholder="Parent Name *" required />
            <input type="tel" name="phone" placeholder="Phone Number *" required />
            <input type="text" name="studentName" placeholder="Child's Name *" required />
            <input type="email" name="email" placeholder="Email Address (optional)" />
            <select name="grade" required>
              <option value="">Select Class *</option>
              <option>Nursery</option><option>Jr. KG</option><option>Sr. KG</option>
              <option>Class I</option><option>Class II</option><option>Class III</option>
              <option>Class IV</option><option>Class V</option><option>Class VI</option>
              <option>Class VII</option><option>Class VIII</option><option>Class IX</option>
              <option>Class X</option><option>Class XI</option><option>Class XII</option>
            </select>
            <button type="submit">Get a Free Callback</button>
            <p class="hero-form-trust">
              <svg style="width:13px;height:13px;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11.5 14.5 16 10"></polyline></svg>
              No spam &middot; One call only &middot; Completely free
            </p>
          </form>
        </div>
      </div>
    </div>
  </div>
  <div class="hero-wave">
    <svg viewBox="0 0 1440 90" preserveAspectRatio="none" style="width:100%;height:90px;display:block" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,55 C240,90 480,20 720,55 C960,90 1200,25 1440,55 L1440,90 L0,90 Z" fill="white" />
    </svg>
  </div>
</section>

<!-- Awards / Welcome Strip -->
<section class="awards-strip">
  <p class="awards-tag">Recognised &amp; Awarded</p>
  <h2>Welcome To Rainbow<br/><span>International School</span></h2>
  <p class="awards-desc">Recognised and awarded by leading education platforms across India, Rainbow International School continues to set benchmarks in academic excellence, holistic development, and preparing students for success in an evolving world.</p>
  <div class="awards-logos">
    <div><img src="/images/awards/india-today.webp" alt="India Today Award" /></div>
    <div><img src="/images/awards/nsa-award.webp" alt="National School Awards" /></div>
    <div><img src="/images/awards/wes-mumbai.webp" alt="World Education Summit" /></div>
    <div><img src="/images/awards/economic-times.webp" alt="Economic Times" /></div>
    <div><img src="/images/awards/scoonews.webp" alt="Scoo News" /></div>
    <div><img src="/images/awards/tmc-logo.webp" alt="Thane Municipal Corp" /></div>
  </div>
  <a href="/awards-achievements" class="btn-gold">View All Awards &rarr;</a>
</section>

<!-- About Preview / Why Choose Us -->
<section class="about-preview">
  <div class="container">
    <div class="about-inner">
      <div class="about-text">
        <span class="section-tag" style="background:#eef5ff;color:#0d3b86"><span class="dot"></span>Why Choose Us</span>
        <h2 class="section-title">Why Parents Trust<br/><span style="color:#0d3b86">Rainbow</span></h2>
        <p>Rainbow International School is a trailblazer in the arena of education with a passion for excellence. We are considered as one of the top CBSE schools in Thane because we emphasize that the child enjoys his learning, dares to dream, and becomes a lifelong learner.</p>
        <p>Our expert educators provide a conducive environment with their multicultural perspectives. Social ethics like empathy, compassion, and respect for others is inculcated in the pedagogy. We provide state-of-the-art facilities, technologies, and infrastructure to optimize teaching and learning outcomes.</p>
        <p>Our educational programs support child's academic, moral, social, and physical development. Our curriculum reflects global, rural, and urban dimensions, thereby preparing our students to face all future challenges. At the preschool level, we follow the theory of <a href="/about-rainbow-international-school" style="color:#0d3b86;font-weight:600;text-decoration:underline">Multiple Intelligence</a> for holistic development.</p>
        <p>We are proud to consistently deliver world-class education and remain the best international school in Thane.</p>
        <div class="about-highlights">
          <div class="about-highlight"><svg class="check-svg" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>CBSE Affiliated (No. 1130661)</div>
          <div class="about-highlight"><svg class="check-svg" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Nursery to Class 12</div>
          <div class="about-highlight"><svg class="check-svg" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Multiple Intelligence methodology</div>
          <div class="about-highlight"><svg class="check-svg" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>3.5-acre green campus in Thane</div>
        </div>
        <a href="/about-rainbow-international-school" class="btn-blue">Learn More About Us &rarr;</a>
      </div>
      <div class="about-stats">
        <div class="about-stat"><div class="about-stat-num">50K+</div><div class="about-stat-label">Happy Students</div></div>
        <div class="about-stat"><div class="about-stat-num">2009</div><div class="about-stat-label">Established</div></div>
        <div class="about-stat"><div class="about-stat-num">3.5 Acres</div><div class="about-stat-label">Campus Area</div></div>
        <div class="about-stat"><div class="about-stat-num">1 Lac+</div><div class="about-stat-label">Lives Impacted</div></div>
      </div>
    </div>
  </div>
</section>

<!-- Academic Programmes -->
<section class="academics" id="academics">
  <div class="container" style="text-align:center">
    <span class="section-tag" style="background:#eef5ff;color:#0d3b86"><span class="dot"></span>Academics</span>
    <h2 class="section-title">Academic Programmes<br/><span style="color:#0d3b86">At A Glance</span></h2>
    <p class="section-sub" style="margin:0 auto 48px">From Nursery to Class 12 — a complete CBSE learning journey under one roof.</p>
  </div>
  <div class="container">
    <div class="programs-grid">
      <a href="/pre-primary-school-thane" class="program-card">
        <div class="program-card-img"><img src="/images/home/academic/pre-primary.jpg" alt="Pre-Primary" /></div>
        <div class="program-card-body">
          <span class="program-tag" style="background:#fff7ed;color:#f97316">Nursery &middot; Jr. KG &middot; Sr. KG</span>
          <h3>Pre-Primary</h3>
          <p>Play-based learning that nurtures curiosity, creativity, and foundational skills in a safe and joyful environment.</p>
          <span class="program-link" style="color:#f97316">Explore &rarr;</span>
        </div>
      </a>
      <a href="/primary-section" class="program-card">
        <div class="program-card-img"><img src="/images/home/academic/primary-section.jpg" alt="Primary" /></div>
        <div class="program-card-body">
          <span class="program-tag" style="background:#eef5ff;color:#0d3b86">Class I – V</span>
          <h3>Primary</h3>
          <p>Building strong literacy, numeracy, and social skills through structured experiential learning.</p>
          <span class="program-link" style="color:#0d3b86">Explore &rarr;</span>
        </div>
      </a>
      <a href="/middle-school-section" class="program-card">
        <div class="program-card-img"><img src="/images/home/academic/middle-section.jpg" alt="Middle School" /></div>
        <div class="program-card-body">
          <span class="program-tag" style="background:#ecfdf5;color:#10b981">Class VI – VIII</span>
          <h3>Middle School</h3>
          <p>Critical thinking, digital literacy, and leadership skills for the evolving modern learner.</p>
          <span class="program-link" style="color:#10b981">Explore &rarr;</span>
        </div>
      </a>
    </div>
    <div class="programs-grid-2">
      <a href="/secondary-section" class="program-card">
        <div class="program-card-img"><img src="/images/home/academic/secondary.jpg" alt="Secondary" /></div>
        <div class="program-card-body">
          <span class="program-tag" style="background:#f5f3ff;color:#8b5cf6">Class IX – X</span>
          <h3>Secondary</h3>
          <p>CBSE board preparation with strong academics and holistic co-curricular engagement.</p>
          <span class="program-link" style="color:#8b5cf6">Explore &rarr;</span>
        </div>
      </a>
      <a href="/senior-secondary-section" class="program-card">
        <div class="program-card-img"><img src="/images/home/academic/senior-secondary.jpg" alt="Senior Secondary" /></div>
        <div class="program-card-body">
          <span class="program-tag" style="background:#fff1f2;color:#ef4444">Class XI – XII</span>
          <h3>Senior Secondary</h3>
          <p>Science, Commerce &amp; Humanities streams to launch your child's next chapter.</p>
          <span class="program-link" style="color:#ef4444">Explore &rarr;</span>
        </div>
      </a>
    </div>
  </div>
</section>

<!-- Pedagogy -->
<section class="pedagogy">
  <div class="container" style="text-align:center">
    <span class="section-tag" style="background:#eef5ff;color:#0d3b86"><span class="dot"></span>Our Methodology</span>
    <h2 class="section-title">Our Pedagogy</h2>
    <p class="section-sub" style="margin:0 auto 48px">Guiding light for achieving milestones in an evolving world.</p>
  </div>
  <div class="ped-panel">
    <h3>Technology in Every Classroom</h3>
    <p>E-learning tools for enhanced learning, memory, and future-readiness.</p>
    <div class="ped-points">
      <div class="ped-point"><svg class="check-svg" viewBox="0 0 24 24" style="stroke:#3b82f6"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Smart boards in every classroom</div>
      <div class="ped-point"><svg class="check-svg" viewBox="0 0 24 24" style="stroke:#3b82f6"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Digital and e-learning resources</div>
      <div class="ped-point"><svg class="check-svg" viewBox="0 0 24 24" style="stroke:#3b82f6"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Technology-aided CBSE curriculum</div>
      <div class="ped-point"><svg class="check-svg" viewBox="0 0 24 24" style="stroke:#3b82f6"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Enhanced memory and retention tools</div>
    </div>
  </div>
</section>

<!-- Discover Rainbow -->
<section class="discover">
  <div class="container" style="text-align:center">
    <span class="section-tag" style="background:#eef5ff;color:#0d3b86"><span class="dot"></span>Life at Rainbow</span>
    <h2 class="section-title">Let's Discover Rainbow!</h2>
    <p class="section-sub" style="margin:0 auto 48px">Committed to educating, strengthening, and nurturing every student — and empowering lifelong learners.</p>
  </div>
  <div class="container">
    <div class="discover-grid">
      <a href="/awards-achievements" class="discover-card">
        <img src="/images/home/discover/awards.jpg" alt="Awards & Accomplishments" />
        <div class="discover-card-overlay"></div>
        <span class="discover-card-tag" style="background:#fef3c7;color:#f59e0b">Recognition</span>
        <div class="discover-card-text"><h3>Awards &amp; Accomplishments</h3><p>Accolades earned for being one of the best and most promising international schools in Thane for over a decade.</p></div>
      </a>
      <a href="/amenities" class="discover-card">
        <img src="/images/home/discover/amenities.jpg" alt="Amenities & Facilities" />
        <div class="discover-card-overlay"></div>
        <span class="discover-card-tag" style="background:#d1fae5;color:#10b981">Campus</span>
        <div class="discover-card-text"><h3>Amenities &amp; Facilities</h3><p>Globally recognised resources and state-of-the-art facilities on our beautiful 3.5-acre campus.</p></div>
      </a>
      <a href="/student-achievements" class="discover-card">
        <img src="/images/home/discover/student-achievements.jpg" alt="Student Achievements" />
        <div class="discover-card-overlay"></div>
        <span class="discover-card-tag" style="background:#ede9fe;color:#8b5cf6">Excellence</span>
        <div class="discover-card-text"><h3>Student Achievements</h3><p>Student accomplishments are acknowledged and honored. Here you can view our best achievers.</p></div>
      </a>
      <a href="/safety-security" class="discover-card">
        <img src="/images/home/discover/safety-security.jpg" alt="Safety & Security" />
        <div class="discover-card-overlay"></div>
        <span class="discover-card-tag" style="background:#dbeafe;color:#0d3b86">Wellbeing</span>
        <div class="discover-card-text"><h3>Safety &amp; Security</h3><p>Student safety and well-being is our top priority, safeguarded through stringent modern security measures.</p></div>
      </a>
    </div>
  </div>
</section>

<!-- Beyond The Classroom -->
<section class="beyond">
  <div class="container">
    <div class="beyond-inner">
      <div class="beyond-text">
        <span class="section-tag" style="background:#fff1f2;color:#dc2626"><span class="dot"></span>Extra Curricular</span>
        <h2 class="section-title">Beyond The<br/><span style="color:#0d3b86">Classroom</span></h2>
        <p style="color:#4b5563;font-size:15px;line-height:1.8;margin-bottom:12px">The real aim of education is not only knowledge but also <strong>ACTION.</strong></p>
        <p style="color:#4b5563;font-size:15px;line-height:1.8;margin-bottom:28px">We provide a rigorous, comprehensive and cohesive learning programme that is designed to meet the social, physical and cultural needs of our entire student community — preparing them for the real world.</p>
        <div class="beyond-tags">
          <span class="beyond-tag">Tours &amp; Visits</span>
          <span class="beyond-tag">Exhibitions</span>
          <span class="beyond-tag">Subject Clubs</span>
          <span class="beyond-tag">Promoting Green</span>
          <span class="beyond-tag">Dignity of Labour</span>
          <span class="beyond-tag">Arts &amp; Culture</span>
        </div>
        <a href="/beyond-the-classroom" class="btn-blue">Know More &rarr;</a>
      </div>
      <div class="beyond-img">
        <div class="beyond-card">
          <img src="/images/home/beyond-classroom-rocket.jpg" alt="Beyond The Classroom at Rainbow International School" />
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Testimonials -->
<section class="testimonials">
  <div class="container">
    <div class="test-header">
      <div>
        <span class="section-tag" style="background:#eef5ff;color:#0d3b86"><span class="dot"></span>Testimonials</span>
        <h2 class="section-title">Parents' Corner</h2>
        <p style="color:#6b7280;font-size:15px">What parents say about us.</p>
      </div>
      <div class="test-rating">
        <div class="stars">
          <svg class="star-svg" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg class="star-svg" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg class="star-svg" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg class="star-svg" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg class="star-svg" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <span class="score">4.8</span>
        <span style="color:#9ca3af;font-size:14px">&middot; Google Reviews</span>
      </div>
    </div>
    <div class="test-grid">
      <div class="test-card">
        <svg class="quote-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
        <p class="review">"It's a great educational establishment to entrust your kids to, with an excellent infrastructure and warm-hearted, friendly and cooperative staff."</p>
        <div class="author">
          <div class="avatar" style="background:#091a4f;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px">MD</div>
          <div><p class="author-name">Mark D'Souza</p><div class="author-stars"><svg class="star-svg-sm" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><svg class="star-svg-sm" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><svg class="star-svg-sm" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><svg class="star-svg-sm" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><svg class="star-svg-sm" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div></div>
        </div>
      </div>
      <div class="test-card">
        <svg class="quote-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
        <p class="review">"Good school, caring teachers, extremely supportive staff who put in a lot of effort. It's always a partnership between institutions and parents to give the best to children."</p>
        <div class="author">
          <div class="avatar" style="background:#0d3b86;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px">MR</div>
          <div><p class="author-name">Mohan Ramaswamy</p><div class="author-stars"><svg class="star-svg-sm" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><svg class="star-svg-sm" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><svg class="star-svg-sm" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><svg class="star-svg-sm" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><svg class="star-svg-sm" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div></div>
        </div>
      </div>
      <div class="test-card">
        <svg class="quote-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
        <p class="review">"I will recommend this school. It gave us so much in terms of values and it is very well organized. Teachers communicate wonderfully and the picnic was beyond expectations!"</p>
        <div class="author">
          <div class="avatar" style="background:#f59e0b;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px">RV</div>
          <div><p class="author-name">Ruchi Verma</p><div class="author-stars"><svg class="star-svg-sm" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><svg class="star-svg-sm" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><svg class="star-svg-sm" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><svg class="star-svg-sm" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><svg class="star-svg-sm" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Contact Section -->
<section class="contact-section" id="contact">
  <div class="container" style="text-align:center">
    <span class="section-tag" style="background:#eef5ff;color:#0d3b86"><span class="dot"></span>Contact Us</span>
    <h2 class="section-title">Get In Touch</h2>
    <p class="section-sub" style="margin:0 auto 48px">Have a question? Reach out and we'll be happy to help.</p>
  </div>
  <div class="container">
    <div class="contact-cards">
      <a href="tel:+918291568972" class="contact-card" style="background:#fff7ed;border-radius:24px">
        <div class="contact-icon"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.14 7.74a16 16 0 006.12 6.12l1.12-1.12a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"></path></svg></div>
        <p class="contact-label">Call Us</p>
        <p class="contact-val">+91 82915 68972</p>
      </a>
      <a href="mailto:admin@rainbowinternationalschool.in" class="contact-card" style="background:#eff6ff;border-radius:24px">
        <div class="contact-icon"><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></div>
        <p class="contact-label">Email Us</p>
        <p class="contact-val">admin@rainbow<br/>internationalschool.in</p>
      </a>
      <div class="contact-card" style="background:#f0fdf4;border-radius:24px">
        <div class="contact-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
        <p class="contact-label">Working Hours</p>
        <p class="contact-val">Monday – Saturday<br/>9:00 AM – 6:00 PM</p>
      </div>
      <a href="https://maps.google.com/?q=Rainbow+International+School+Thane" target="_blank" rel="noopener noreferrer" class="contact-card" style="background:#fef2f2;border-radius:24px">
        <div class="contact-icon"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>
        <p class="contact-label">Our Address</p>
        <p class="contact-val">Cosmos Arcade, Brahmand Phase 4<br/>Thane, Maharashtra</p>
      </a>
    </div>
  </div>
</section>

</article>
</main>

<!-- Footer -->
<footer role="contentinfo">
  <div class="footer-inner">
    <div>
      <p class="footer-brand">Rainbow International School</p>
      <p class="footer-desc">CBSE-affiliated school in Thane, Maharashtra. Nursery to Class 12. Founded April 2009. Affiliation No. 1130661.</p>
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
      <a href="https://www.rainbowpreschools.com/play-school-near-me" target="_blank" rel="noopener noreferrer" class="footer-link"><span class="bullet"></span>Best Playschool in Thane</a>
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
        <span>+91 82915 68972</span>
      </div>
      <div class="footer-contact-item">
        <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        <a href="mailto:info@rainbowinternationalschool.in" style="color:rgba(255,255,255,.60);text-decoration:none;">info@rainbowinternationalschool.in</a>
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
    const ua = (req.headers["user-agent"] || "").toLowerCase();
    const isBot = /googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|facebookexternalhit|twitterbot|linkedinbot|whatsappbot|telegrambot|applebot|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|bytespider|gptbot|claudebot/i.test(ua);

    if (isBot) {
      const html = renderHomeSSR();
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("X-Rendered-By", "Express SSR");
      return res.send(html);
    }

    next();
  });
}
