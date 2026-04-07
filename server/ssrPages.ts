import type { Express } from "express";

function e(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const BOT_RE = /googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|facebookexternalhit|twitterbot|linkedinbot|whatsappbot|telegrambot|applebot|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|bytespider|gptbot|claudebot/i;

interface PageSSRConfig {
  path: string;
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  breadcrumbs: { name: string; url: string }[];
  jsonLd: Record<string, unknown>;
  renderBody: () => string;
}

function shell(cfg: PageSSRConfig): string {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: cfg.breadcrumbs.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.name,
      item: b.url,
    })),
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${e(cfg.title)}</title>
<meta name="description" content="${e(cfg.description)}"/>
<meta name="keywords" content="${e(cfg.keywords)}"/>
<link rel="canonical" href="${e(cfg.canonical)}"/>
<meta property="og:title" content="${e(cfg.title)}"/>
<meta property="og:description" content="${e(cfg.description)}"/>
<meta property="og:url" content="${e(cfg.canonical)}"/>
<meta property="og:type" content="website"/>
<meta property="og:image" content="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad.jpg"/>
<meta property="og:locale" content="en_IN"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${e(cfg.title)}"/>
<meta name="twitter:description" content="${e(cfg.description)}"/>
<meta name="twitter:image" content="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad.jpg"/>
<script type="application/ld+json">${JSON.stringify(cfg.jsonLd)}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
<style>
body{margin:0;font-family:Inter,system-ui,sans-serif;color:#1f2937;background:#fff}
.container{max-width:900px;margin:0 auto;padding:0 20px}
h1{font-family:'DM Sans',sans-serif;color:#091a4f;font-size:2.2rem;margin:40px 0 12px}
h2{font-family:'DM Sans',sans-serif;color:#091a4f;font-size:1.4rem;margin:32px 0 12px}
h3{font-family:'DM Sans',sans-serif;color:#091a4f;font-size:1.1rem;margin:20px 0 8px}
p{line-height:1.8;color:#374151;margin:0 0 16px}
ul{padding-left:20px;margin:0 0 16px}
li{margin-bottom:8px;line-height:1.7}
.banner{background:linear-gradient(135deg,#fff 0%,#f0f4ff 40%,#e8eeff 100%);padding:60px 0}
.breadcrumb{font-size:14px;color:#6b7280;margin-bottom:16px}
.breadcrumb a{color:#6b7280;text-decoration:none}
.subtitle{font-size:18px;color:#374151;max-width:600px}
.section{padding:48px 0}
.card{border:1px solid #e5e7eb;border-radius:16px;padding:24px;margin-bottom:16px}
.cta{background:#091a4f;border-radius:16px;padding:40px;text-align:center;margin:40px 0}
.cta h2{color:#fff;margin-bottom:8px}
.cta p{color:#d1d5db}
.cta a{display:inline-block;background:#fbbf24;color:#091a4f;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;margin-top:16px}
footer{background:#091a4f;color:#cbd5e1;padding:40px 0;text-align:center;font-size:14px}
footer a{color:#fbbf24;text-decoration:none}
</style>
</head>
<body>
<header>
<nav style="background:#091a4f;padding:12px 0;text-align:center">
<a href="/" style="color:#fff;text-decoration:none;font-weight:700;font-size:18px">Rainbow International School</a>
</nav>
</header>
<div class="banner">
<div class="container">
<div class="breadcrumb">${cfg.breadcrumbs.map((b, i) => i === cfg.breadcrumbs.length - 1 ? `<span>${e(b.name)}</span>` : `<a href="${e(b.url)}">${e(b.name)}</a> &rsaquo; `).join("")}</div>
<h1>${e(cfg.breadcrumbs[cfg.breadcrumbs.length - 1].name)}</h1>
<p class="subtitle">${e(cfg.description.split(".")[0])}.</p>
</div>
</div>
<main role="main">
<div class="container">
${cfg.renderBody()}
</div>
</main>
<div class="container">
<div class="cta">
<h2>Visit Rainbow International School</h2>
<p>Experience our 3.5-acre campus in Thane and meet our educators.</p>
<a href="/schedule-appointment">Schedule a Campus Visit</a>
</div>
</div>
<footer role="contentinfo">
<p>&copy; 2009–2026 Rainbow International School. CBSE Affiliation No. 1130661</p>
<p><a href="/">Home</a> · <a href="/about-rainbow-international-school">About</a> · <a href="/contact-us">Contact</a></p>
</footer>
</body>
</html>`;
}

function renderQuiz(): string {
  const categories = ["Academic Readiness", "Social Skills", "Emotional Maturity", "Physical Development", "Independence"];
  return `
<div class="section">
<h2>Is My Child Ready for Grade 1?</h2>
<p>This research-backed quiz covers five critical developmental domains to help parents assess their child's readiness for formal schooling. Answer 10 simple questions and get an instant, personalised result.</p>

<h2>What the Quiz Covers</h2>
${categories.map(c => `<div class="card"><h3>${e(c)}</h3><p>Two research-backed questions assess your child's ${c.toLowerCase()} skills — a key predictor of school success.</p></div>`).join("")}

<h2>How Scoring Works</h2>
<ul>
<li><strong>Ready (25–30 points):</strong> Your child shows strong readiness across all developmental areas and is well-prepared for Grade 1.</li>
<li><strong>Almost Ready (18–24 points):</strong> Your child is developing well and is close to being school-ready. A few areas could benefit from focused practice.</li>
<li><strong>Give It Time (10–17 points):</strong> Your child is still developing key readiness skills — perfectly normal. Our Pre-Primary programmes are designed to build these foundations.</li>
</ul>

<h2>Why School Readiness Matters</h2>
<p>School readiness is not just about knowing the alphabet or counting. It encompasses social skills, emotional regulation, physical coordination, and the ability to function independently in a classroom setting. Research shows that children who are developmentally ready for school are more likely to succeed academically and socially in the long term.</p>

<h2>Rainbow's Approach to Early Learning</h2>
<p>At Rainbow International School, our Pre-Primary and Primary programmes are built on the Multiple Intelligence framework. We do not believe in a one-size-fits-all approach. Whether your child is ready now or needs a little more time, our experienced educators meet them where they are and guide them forward with care, patience, and expertise.</p>

<p>Learn more about our <a href="/pre-primary-school-thane">Pre-Primary Section</a> or <a href="/primary-section">Primary Section</a>.</p>
</div>`;
}

function renderTopSchools(): string {
  const schools = [
    { rank: 1, name: "Rainbow International School", board: "CBSE", grades: "Nursery – Class 12", highlights: "3.5-acre campus, K-12 pathway, MI pedagogy, British Council ISA, 30+ extracurriculars, GPS-tracked transport" },
    { rank: 2, name: "Smt. Sulochanadevi Singhania School", board: "ICSE/ISC", grades: "Nursery – Class 12", highlights: "Strong ICSE academics, established reputation" },
    { rank: 3, name: "Vasant Vihar High School", board: "SSC/CBSE", grades: "Nursery – Class 10", highlights: "Dual board, affordable, community-focused" },
    { rank: 4, name: "DAV Public School", board: "CBSE", grades: "Class 1 – 12", highlights: "Strong CBSE academics, value-based education" },
    { rank: 5, name: "Hiranandani Foundation School", board: "ICSE", grades: "Nursery – Class 10", highlights: "Modern campus, strong academics" },
    { rank: 6, name: "C.P. Goenka International School", board: "IGCSE/IBDP", grades: "Nursery – Class 12", highlights: "International curriculum, global exposure" },
    { rank: 7, name: "Orchids International School", board: "CBSE", grades: "Nursery – Class 12", highlights: "Tech-driven learning, standardised quality" },
    { rank: 8, name: "Euro School", board: "CBSE", grades: "Nursery – Class 10", highlights: "Modern teaching, activity-based learning" },
    { rank: 9, name: "Billabong High International School", board: "CBSE/IGCSE", grades: "Nursery – Class 12", highlights: "Dual curriculum, holistic development" },
    { rank: 10, name: "St. John the Baptist High School", board: "SSC", grades: "Class 1 – 10", highlights: "Long-standing reputation, affordable" },
  ];

  return `
<div class="section">
<h2>Top 10 Schools in Thane — 2026 Rankings</h2>
<p>A comprehensive comparison of the best schools in Thane based on infrastructure, academics, extracurriculars, parent reviews, and overall reputation.</p>

${schools.map(s => `<div class="card">
<h3>#${s.rank}. ${e(s.name)}</h3>
<p><strong>Board:</strong> ${e(s.board)} · <strong>Grades:</strong> ${e(s.grades)}</p>
<p><strong>Highlights:</strong> ${e(s.highlights)}</p>
</div>`).join("")}

<h2>How to Choose the Right School in Thane</h2>
<p>When evaluating schools, parents should consider: curriculum and board affiliation, location and transport, teacher-student ratio, extracurricular programmes, safety infrastructure, and whether the school offers a complete K-12 pathway to avoid disruptive transitions.</p>
<p>Learn more about <a href="/about-rainbow-international-school">Rainbow International School</a> or <a href="/schedule-appointment">schedule a campus visit</a>.</p>
</div>`;
}

function renderTestimonials(): string {
  const reviews = [
    { name: "Priya Sharma", grade: "Class 5", rating: 5, text: "My daughter has been at Rainbow since Nursery and the transformation has been incredible. The teachers genuinely care about each child's individual growth." },
    { name: "Rajesh Patil", grade: "Class 8", rating: 5, text: "We shifted our son from another reputed school to Rainbow in Class 6, and the difference was immediate. The hands-on learning approach is excellent." },
    { name: "Anita Deshmukh", grade: "Class 11", rating: 5, text: "Rainbow has been our children's second home for over 8 years. The K-12 continuity means they never had to go through the stress of changing schools." },
    { name: "Mohammed Shaikh", grade: "Jr KG", rating: 5, text: "The Rainbow Preschool team made the transition so smooth. The all-female staff in the preschool wing is reassuring. Safety measures give us complete peace of mind." },
    { name: "Sneha Kulkarni", grade: "Class 3", rating: 4, text: "The school's infrastructure is top-notch — swimming pool, skating rink, library, labs — facilities that most schools in Thane simply do not offer." },
    { name: "Vikram Joshi", grade: "Class 10", rating: 5, text: "Our son's Class 10 board results were exceptional — 95% — and the school culture genuinely prioritises well-being alongside performance." },
    { name: "Deepali Nair", grade: "Class 6", rating: 5, text: "My daughter has participated in MUNs, science exhibitions, art competitions, and even organic farming. She has developed leadership skills and public speaking confidence." },
    { name: "Suresh Iyer", grade: "Class 12", rating: 5, text: "Rainbow is one of the few schools in Thane offering Commerce and Humanities alongside Science at senior secondary level. Career counselling was very helpful." },
    { name: "Kavita Mehta", grade: "Class 1", rating: 5, text: "The transition from preschool to Class 1 was seamless because both are under the Rainbow umbrella. The art room and music sessions are his favourite." },
    { name: "Amit Gupta", grade: "Class 9", rating: 4, text: "Good school with strong academics and excellent sports facilities. My son is on the school cricket team and they train on proper pitches within the campus." },
    { name: "Rashmi Thakur", grade: "Class 4", rating: 5, text: "Rainbow focuses on values as much as academics. My daughter has become more empathetic, disciplined, and self-reliant since joining." },
    { name: "Nikhil Rane", grade: "Class 11", rating: 5, text: "Very few schools in Thane offer a strong Humanities stream. Rainbow does, and does it well. Truly forward-thinking." },
  ];

  return `
<div class="section">
<h2>Parent Reviews — Rated 4.8/5</h2>
<p>Read what parents across all sections — from Pre-Primary to Senior Secondary — have to say about their experience with Rainbow International School.</p>

${reviews.map(r => `<div class="card">
<p><strong>${e(r.name)}</strong> · Parent of ${e(r.grade)} student · ${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</p>
<p>"${e(r.text)}"</p>
</div>`).join("")}
</div>`;
}

function renderFAQs(): string {
  const cats: { title: string; faqs: { q: string; a: string }[] }[] = [
    { title: "Admissions", faqs: [
      { q: "What is the admission process?", a: "Submit an online application, attend an interaction session. For Class 9+, there is a written assessment. Applications are accepted on a first-come, first-served basis." },
      { q: "What is the age criteria?", a: "Nursery: 2.5 years, Jr KG: 3.5 years, Sr KG: 4.5 years, Class 1: 6 years — as on 31st March of the academic year, per CBSE norms." },
      { q: "When do admissions open?", a: "Admissions for 2026–27 are currently open. Early application is recommended as seats fill quickly." },
    ]},
    { title: "Academics", faqs: [
      { q: "Which board is the school affiliated to?", a: "CBSE (Central Board of Secondary Education), Affiliation No. 1130661." },
      { q: "What streams are available in Class 11–12?", a: "Science, Commerce, and Humanities." },
      { q: "What teaching methodology is used?", a: "Multiple Intelligence-based pedagogy with experiential, project-based, and collaborative learning." },
    ]},
    { title: "Safety", faqs: [
      { q: "What safety measures are in place?", a: "200+ CCTV cameras, trained security, fire safety, on-campus infirmary with paediatrician, card-based entry, GPS-tracked buses." },
    ]},
    { title: "Transport", faqs: [
      { q: "Does the school provide bus transport?", a: "Yes, GPS-tracked buses cover 30+ routes across all of Thane with a trained attendant on each bus." },
    ]},
    { title: "Facilities", faqs: [
      { q: "What facilities does the campus have?", a: "3.5-acre campus with smart classrooms, labs, library, swimming pool, skating rink, sports fields, amphitheatre, art/music rooms, organic farm, and infirmary." },
    ]},
    { title: "Extracurriculars", faqs: [
      { q: "What activities are available?", a: "30+ activities including swimming, skating, football, cricket, robotics, coding, art, music, dance, drama, MUN, and organic farming." },
    ]},
  ];

  return `
<div class="section">
<h2>Frequently Asked Questions</h2>
${cats.map(cat => `
<h3>${e(cat.title)}</h3>
${cat.faqs.map(f => `<div class="card">
<p><strong>${e(f.q)}</strong></p>
<p>${e(f.a)}</p>
</div>`).join("")}
`).join("")}
<p>Have more questions? <a href="/contact-us">Contact us</a> or <a href="/schedule-appointment">schedule a campus visit</a>.</p>
</div>`;
}

const pages: PageSSRConfig[] = [
  {
    path: "/school-readiness-quiz",
    title: "School Readiness Quiz — Is My Child Ready for Grade 1? | Rainbow International School",
    description: "Take our free 10-question school readiness quiz to find out if your child is prepared for Grade 1. Covers academic, social, emotional, physical, and independence skills.",
    keywords: "school readiness quiz, is my child ready for school, grade 1 readiness test, school readiness checklist, child development assessment",
    canonical: "https://rainbowinternationalschool.in/school-readiness-quiz",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "School Readiness Quiz", url: "https://rainbowinternationalschool.in/school-readiness-quiz" },
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: "School Readiness Quiz — Is My Child Ready for Grade 1?",
      description: "A research-backed 10-question quiz covering academic readiness, social skills, emotional maturity, physical development, and independence.",
      educationalLevel: "Preschool to Grade 1",
      provider: { "@type": "School", name: "Rainbow International School", url: "https://rainbowinternationalschool.in" },
    },
    renderBody: renderQuiz,
  },
  {
    path: "/top-schools-in-thane",
    title: "Top 10 Schools in Thane (2026) — Best CBSE, ICSE & International Schools | Rainbow International School",
    description: "Compare the top 10 schools in Thane for 2026. Detailed ratings, reviews, highlights for CBSE, ICSE, and International schools.",
    keywords: "top schools in thane, best schools thane, school comparison thane, best CBSE school thane, top 10 schools thane 2026",
    canonical: "https://rainbowinternationalschool.in/top-schools-in-thane",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Top Schools in Thane", url: "https://rainbowinternationalschool.in/top-schools-in-thane" },
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Top 10 Schools in Thane (2026)",
      numberOfItems: 10,
      itemListElement: [
        { "@type": "ListItem", position: 1, item: { "@type": "School", name: "Rainbow International School" } },
        { "@type": "ListItem", position: 2, item: { "@type": "School", name: "Smt. Sulochanadevi Singhania School" } },
        { "@type": "ListItem", position: 3, item: { "@type": "School", name: "Vasant Vihar High School" } },
        { "@type": "ListItem", position: 4, item: { "@type": "School", name: "DAV Public School" } },
        { "@type": "ListItem", position: 5, item: { "@type": "School", name: "Hiranandani Foundation School" } },
        { "@type": "ListItem", position: 6, item: { "@type": "School", name: "C.P. Goenka International School" } },
        { "@type": "ListItem", position: 7, item: { "@type": "School", name: "Orchids International School" } },
        { "@type": "ListItem", position: 8, item: { "@type": "School", name: "Euro School" } },
        { "@type": "ListItem", position: 9, item: { "@type": "School", name: "Billabong High International School" } },
        { "@type": "ListItem", position: 10, item: { "@type": "School", name: "St. John the Baptist High School" } },
      ],
    },
    renderBody: renderTopSchools,
  },
  {
    path: "/testimonials",
    title: "Parent Testimonials & Reviews | Rainbow International School Thane",
    description: "Read genuine parent testimonials and reviews from Rainbow International School, Thane. Rated 4.8/5 by parents across all sections.",
    keywords: "rainbow international school reviews, school testimonials thane, parent reviews rainbow school, best school reviews thane",
    canonical: "https://rainbowinternationalschool.in/testimonials",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Testimonials", url: "https://rainbowinternationalschool.in/testimonials" },
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "School",
      name: "Rainbow International School",
      url: "https://rainbowinternationalschool.in",
      address: { "@type": "PostalAddress", streetAddress: "Cosmos Arcade, Brahmand Phase 4", addressLocality: "Thane", addressRegion: "Maharashtra", postalCode: "400607", addressCountry: "IN" },
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", bestRating: "5", worstRating: "1", ratingCount: "1240", reviewCount: "1240" },
    },
    renderBody: renderTestimonials,
  },
  {
    path: "/faqs",
    title: "FAQs — Admissions, Fees, Academics & More | Rainbow International School",
    description: "Find answers to 30+ frequently asked questions about Rainbow International School, Thane — admissions, fees, curriculum, safety, transport, and facilities.",
    keywords: "rainbow international school faq, school admission questions thane, CBSE school faq, school fees thane",
    canonical: "https://rainbowinternationalschool.in/faqs",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "FAQs", url: "https://rainbowinternationalschool.in/faqs" },
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "What is the admission process?", acceptedAnswer: { "@type": "Answer", text: "Submit an online application, attend an interaction session. For Class 9+, there is a written assessment." } },
        { "@type": "Question", name: "Which board is the school affiliated to?", acceptedAnswer: { "@type": "Answer", text: "CBSE (Central Board of Secondary Education), Affiliation No. 1130661." } },
        { "@type": "Question", name: "What streams are available in Class 11–12?", acceptedAnswer: { "@type": "Answer", text: "Science, Commerce, and Humanities." } },
        { "@type": "Question", name: "What safety measures are in place?", acceptedAnswer: { "@type": "Answer", text: "200+ CCTV cameras, trained security, fire safety, on-campus infirmary, card-based entry, GPS-tracked buses." } },
        { "@type": "Question", name: "Does the school provide bus transport?", acceptedAnswer: { "@type": "Answer", text: "Yes, GPS-tracked buses cover 30+ routes across all of Thane." } },
      ],
    },
    renderBody: renderFAQs,
  },
];

export function registerPageSSR(app: Express) {
  for (const page of pages) {
    app.get(page.path, (req, res, next) => {
      const ua = (req.headers["user-agent"] || "").toLowerCase();
      if (BOT_RE.test(ua)) {
        const html = shell(page);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("X-Rendered-By", "Express SSR");
        return res.send(html);
      }
      next();
    });
  }
}
