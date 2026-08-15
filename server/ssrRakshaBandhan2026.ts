import type { Express } from "express";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

const SLUG = "raksha-bandhan-2026";
const SCENE_FILES = [
  "scene_1.1_1786765935439.webp",
  "scene_1.2_1786765935439.webp",
  "scene_1.3_1786765935438.webp",
  "scene_1.4_1786765935438.webp",
  "scene_1.5_1786765935438.webp",
  "scene_2.1_1786765935437.webp",
  "scene_2.2_1786765935437.webp",
  "scene_2.3_1786765935436.webp",
  "scene_2.4_1786765935436.webp",
  "scene_2.5_1786765935435.webp",
  "scene_3_1786765935440.webp",
  "scene_3.1_1786765935432.webp"
] as const;

/** Short hash of an asset so browsers pick up edits despite long cache lifetimes. */
function assetVersion(fileName: string): string {
  for (const base of ["client/public", "dist/public", "public"]) {
    try {
      const buf = readFileSync(path.resolve(process.cwd(), base, "blog-assets", SLUG, fileName));
      return createHash("sha1").update(buf).digest("hex").slice(0, 10);
    } catch {
      /* try the next candidate directory */
    }
  }
  return "1";
}
const CANONICAL = `https://rainbowinternationalschool.in/blog/${SLUG}`;
const OG_IMAGE = `${CANONICAL.replace(`/blog/${SLUG}`, "")}/blog-assets/${SLUG}/raksha-bandhan-2026-og.svg`;
const DESCRIPTION = "Raksha Bandhan 2026 falls on 28 August. Find speeches, an essay, 10 lines, activities for kids, craft ideas and wishes from Rainbow International School.";

const FAQS = [
  ["When is Raksha Bandhan in 2026?", "Raksha Bandhan in 2026 falls on Friday, 28 August, on Shravana Purnima."],
  ["Why do we celebrate Raksha Bandhan?", "Raksha Bandhan celebrates care, trust and responsibility in relationships. The words raksha and bandhan mean protection and bond."],
  ["What is the story behind Raksha Bandhan?", "Popular traditional legends include Krishna and Draupadi, Yama and Yamuna, and the story of Rani Karnavati and Humayun. These stories are commonly shared to discuss care, loyalty and courage."],
  ["What time should the rakhi be tied?", "Families commonly follow a local panchang for the auspicious tying time. Please confirm the timing with a trusted local source."],
  ["What does Raksha Bandhan mean?", "Raksha means protection and bandhan means bond. Together, the phrase describes a promise of loving care and responsibility."],
  ["How can schools celebrate Raksha Bandhan?", "Schools can hold craft activities, gratitude circles, promise-card writing, storytelling and inclusive discussions about respect, friendship and kindness."]
] as const;

const articleLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Raksha Bandhan 2026: Date, Speech, Essay & Activities for Students",
  description: DESCRIPTION,
  image: OG_IMAGE,
  author: { "@type": "Organization", name: "Rainbow International School", url: "https://rainbowinternationalschool.in" },
  publisher: { "@type": "Organization", name: "Rainbow International School", logo: { "@type": "ImageObject", url: "https://rainbowinternationalschool.in/ris-logo.png" } },
  datePublished: "2026-08-14",
  dateModified: "2026-08-14",
  url: CANONICAL,
  mainEntityOfPage: { "@type": "WebPage", "@id": CANONICAL },
  articleSection: "Learning Beyond the Classroom"
});

const faqLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } }))
});

const breadcrumbLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://rainbowinternationalschool.in/" },
    { "@type": "ListItem", position: 2, name: "Blogs", item: "https://rainbowinternationalschool.in/blogs" },
    { "@type": "ListItem", position: 3, name: "Raksha Bandhan 2026", item: CANONICAL }
  ]
});

const icon = (name: string) => `<i data-lucide="${name}" aria-hidden="true"></i>`;

function renderPage(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Raksha Bandhan 2026: Date, Speech, Essay &amp; Activities for Students | Rainbow International School</title>
  <meta name="description" content="${DESCRIPTION}" />
  <meta name="keywords" content="raksha bandhan 2026, raksha bandhan 2026 date, raksha bandhan speech in english for students, raksha bandhan essay in english, 10 lines on raksha bandhan, raksha bandhan activities for school students, rakhi making ideas for kids" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${CANONICAL}" />
  <meta property="og:title" content="Raksha Bandhan 2026: Date, Speech, Essay &amp; Activities for Students" />
  <meta property="og:description" content="${DESCRIPTION}" />
  <meta property="og:image" content="${OG_IMAGE}" />
  <meta property="og:url" content="${CANONICAL}" />
  <meta property="og:type" content="article" />
  <meta property="og:locale" content="en_IN" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Raksha Bandhan 2026: Date, Speech, Essay &amp; Activities for Students" />
  <meta name="twitter:description" content="${DESCRIPTION}" />
  <meta name="twitter:image" content="${OG_IMAGE}" />
  <script type="application/ld+json">${articleLd}</script>
  <script type="application/ld+json">${faqLd}</script>
  <script type="application/ld+json">${breadcrumbLd}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&amp;family=Poppins:ital,wght@0,400;0,500;0,600;0,700;1,400&amp;display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/blog-assets/${SLUG}/raksha-bandhan-2026.css?v=${assetVersion("raksha-bandhan-2026.css")}" />
</head>
<body>
  <a class="rb-skip" href="#raksha-content">Skip to article content</a>
  <div class="rb-bg-fallback" aria-hidden="true"></div>
  <div class="rb-bg" aria-hidden="true"></div>
  <div class="rb-vignette" aria-hidden="true"></div>
  <div class="rb-progress" aria-hidden="true"><span></span></div>
  <div class="rb-thread-track" aria-hidden="true"><div class="rb-thread-fill"></div><div class="rb-thread-knot"></div></div>
  <div class="rb-topbar"><span>Rainbow International School, Thane</span><span>CBSE K–12</span><span>Passion for Excellence</span></div>
  <nav class="rb-navbar" aria-label="Primary navigation">
    <a class="rb-brand" href="/">
      <img src="/ris-logo.png" alt="Rainbow International School logo" />
      <span>Rainbow International School<small>Passion for Excellence</small></span>
    </a>
    <ul class="rb-navlinks"><li><a href="/">Home</a></li><li><a href="/about-rainbow-international-school">About</a></li><li><a href="/blogs">Blogs</a></li><li><a href="/contact-us">Contact</a></li></ul>
  </nav>
  <main>
    <div class="rb-cine">
      <section class="rb-hero" aria-labelledby="raksha-title">
        <img class="rb-hero-logo" src="/ris-logo.png" alt="" aria-hidden="true" width="140" height="140" />
        <p class="rb-presents">Rainbow International School presents</p>
        <h1 id="raksha-title" class="rb-gold-display">Raksha Bandhan 2026: The Thread That Binds Us</h1>
        <p class="rb-sub">A thread can be delicate and still hold a promise. This Raksha Bandhan, explore a celebration of care, trust and the everyday ways we stand beside one another.</p>
        <p class="rb-date-pill">${icon("calendar-days")} Friday · 28 August 2026 · Shravana Purnima</p>
        <a class="rb-scrollcue" href="#raksha-content"><span>Scroll to begin</span><span class="rb-cue-line" aria-hidden="true"></span></a>
      </section>

      <section class="rb-align-l" aria-labelledby="chapter-one">
        <div class="rb-card">
          <p class="rb-kicker-light">01 · The Meaning</p>
          <h2 id="chapter-one">A thread that says, “I am here.”</h2>
          <p>At its heart, a rakhi is an invitation to notice one another. It carries affection, but also attention: the steady kind that listens, helps and stays present when it matters.</p>
          <p>Every August, the same small ritual repeats in millions of homes — and every year it means something slightly new, shaped by the year the family has just lived through together.</p>
        </div>
      </section>

      <section class="rb-align-r" aria-labelledby="chapter-two">
        <div class="rb-card">
          <p class="rb-kicker-light">02 · The Words</p>
          <h2 id="chapter-two">Raksha is care. Bandhan is a bond.</h2>
          <p>Together, these words express a promise. Protection is not about control; it is about respect, responsibility and the courage to choose kindness in the small moments of daily life.</p>
          <p><em>Raksha</em> asks what we are willing to stand for. <em>Bandhan</em> asks who we are willing to stand with.</p>
        </div>
      </section>

      <section class="rb-align-l" aria-labelledby="chapter-three">
        <div class="rb-card">
          <p class="rb-kicker-light">03 · The Values</p>
          <h2 id="chapter-three">Every classroom can hold the same promise.</h2>
          <p>Friendship, mentorship and care grow through thoughtful actions. A welcoming word, a shared idea or help with a difficult task can make school life feel more connected for everyone.</p>
          <div class="rb-values"><span>Kindness</span><span>Responsibility</span><span>Trust</span><span>Belonging</span></div>
        </div>
      </section>

      <section class="rb-scroll-story" aria-labelledby="scroll-story-title">
        <div class="rb-scroll-story-sticky">
          <div class="rb-scroll-story-copy">
            <p class="rb-kicker-light">A promise in motion</p>
            <h2 id="scroll-story-title" class="rb-gold-display">Every step leads back to care.</h2>
            <p>Walk beside this small story as a brother arrives, kneels, and receives a thread made with love.</p>
          </div>
          <div class="rb-scene-stage" role="img" aria-labelledby="scroll-story-title scroll-story-description">
            <span id="scroll-story-description" class="rb-sr-only">An illustrated scroll story of a Rainbow International School student walking forward, kneeling, and sharing a Raksha Bandhan moment with a classmate.</span>
            <div class="rb-scene-halo" aria-hidden="true"></div>
            <div class="rb-scene-frames" aria-hidden="true">
              ${SCENE_FILES.map((file, index) => `<img class="rb-scene-frame${index === 0 ? " is-current" : ""}" src="/blog-assets/${SLUG}/scene/${file}?v=${assetVersion(`scene/${file}`)}" width="1080" height="1350" decoding="async" ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} alt="" />`).join("")}
            </div>
            <div class="rb-scene-progress" aria-hidden="true"><span></span></div>
          </div>
          <p class="rb-scene-caption" aria-hidden="true"><span>01</span> A thread carries a promise.</p>
        </div>
      </section>

      <section class="rb-celebration" aria-labelledby="celebration-title">
        <p class="rb-kicker-light">From our young artists</p>
        <h2 id="celebration-title" class="rb-gold-display">A celebration drawn by our students</h2>
        <div class="rb-celebration-stage">
          <div class="rb-celebration-glow" aria-hidden="true"></div>
          <p class="rb-wish-bubble" aria-live="polite"></p>
          <div class="rb-celebration-tilt">
            <picture>
              <source srcset="/blog-assets/${SLUG}/rakhi-kids.webp" type="image/webp" />
              <img src="/blog-assets/${SLUG}/rakhi-kids.png" width="900" height="1125" loading="lazy" decoding="async" alt="Illustration of two Rainbow International School students tying a rakhi on Raksha Bandhan." />
            </picture>
            <svg class="rb-celebration-ornament" viewBox="0 0 320 320" role="img" aria-label="Decorative rakhi illustration" xmlns="http://www.w3.org/2000/svg">
              <circle cx="160" cy="160" r="96" fill="none" stroke="#f5b428" stroke-width="14" />
              <circle cx="160" cy="160" r="66" fill="none" stroke="#ff8a3d" stroke-width="5" />
              <circle cx="160" cy="160" r="46" fill="#10174f" />
              <circle cx="160" cy="160" r="22" fill="#ffd977" />
              <path d="M64 160 L4 132 M64 160 L4 188 M256 160 L316 132 M256 160 L316 188" stroke="#e0483e" stroke-width="7" stroke-linecap="round" />
              <g fill="#ffd977">
                <circle cx="160" cy="46" r="8" /><circle cx="160" cy="274" r="8" />
                <circle cx="46" cy="160" r="8" /><circle cx="274" cy="160" r="8" />
                <circle cx="80" cy="80" r="6" /><circle cx="240" cy="240" r="6" />
                <circle cx="240" cy="80" r="6" /><circle cx="80" cy="240" r="6" />
              </g>
            </svg>
          </div>
        </div>
        <p class="rb-celebration-caption">The joy of tying the knot of protection — Raksha Bandhan at the heart of our Rainbow family. <strong>Tap the artwork</strong> to send a wish.</p>
      </section>

      <section class="rb-interactive" aria-labelledby="tie-title">
        <div class="rb-intro">
          <p class="rb-kicker-light">An interactive pause</p>
          <h2 id="tie-title" class="rb-gold-display">Tie a rakhi of your own</h2>
          <p>Choose a colour, drag to turn the rakhi, then tie the thread as a small reminder to lead with care.</p>
        </div>
        <div class="rb-stage" role="img" aria-label="An interactive illustrated rakhi. Drag left or right to rotate it.">
          <div class="rb-stage-fallback" aria-hidden="true">
            <svg viewBox="0 0 460 290" xmlns="http://www.w3.org/2000/svg">
              <path d="M110 120 C70 96 40 96 6 120 M350 120 C390 144 420 144 454 120" fill="none" stroke="#e0483e" stroke-width="6" stroke-linecap="round" />
              <circle cx="60" cy="107" r="7" fill="#ffd977" /><circle cx="30" cy="112" r="6" fill="#f5b428" />
              <circle cx="400" cy="133" r="7" fill="#ffd977" /><circle cx="430" cy="128" r="6" fill="#f5b428" />
              <circle cx="230" cy="120" r="86" fill="none" stroke="#f5b428" stroke-width="15" />
              <circle cx="230" cy="120" r="60" fill="none" stroke="#ff8a3d" stroke-width="5" />
              <circle cx="230" cy="120" r="42" fill="#c0392b" />
              <circle cx="230" cy="120" r="20" fill="#ffd977" />
              <g fill="#ffd977">
                <circle cx="230" cy="18" r="6" /><circle cx="230" cy="222" r="6" />
                <circle cx="128" cy="120" r="6" /><circle cx="332" cy="120" r="6" />
                <circle cx="158" cy="48" r="5" /><circle cx="302" cy="192" r="5" />
                <circle cx="302" cy="48" r="5" /><circle cx="158" cy="192" r="5" />
              </g>
               <g transform="translate(230 206)">
                 <path d="M0 0 C-3 9 -4 13 -3 18" fill="none" stroke="#e0483e" stroke-width="5" stroke-linecap="round" />
                 <circle cy="21" r="6" fill="#ffd977" />
                 <path d="M-18 25 Q0 52 18 25 Q0 16 -18 25Z" fill="#f5b428" stroke="#ff8a3d" stroke-width="3" />
                 <path d="M-13 30 Q0 43 13 30" fill="none" stroke="#c0392b" stroke-width="3" />
                 <circle cy="54" r="6" fill="#ffd977" /><circle cx="-12" cy="48" r="4" fill="#ff8a3d" /><circle cx="12" cy="48" r="4" fill="#ff8a3d" />
               </g>
            </svg>
          </div>
          <div class="rb-wish-pop" aria-live="polite"><span></span></div>
          <p class="rb-stage-hint">Drag to rotate</p>
        </div>
        <div class="rb-swatches" role="group" aria-label="Choose a rakhi colour theme"></div>
        <button class="rb-tie-btn" type="button">${icon("heart-handshake")} Tie the Thread</button>
      </section>

      <section class="rb-parallax" aria-labelledby="parallax-title">
        <div class="rb-px-wrap">
          <div class="rb-px-layer rb-px-stars" data-depth="0.12" aria-hidden="true"></div>
          <div class="rb-px-layer rb-px-moon" data-depth="0.2" aria-hidden="true"></div>
          <div class="rb-px-layer rb-px-clouds" data-depth="0.35" aria-hidden="true"></div>
          <div class="rb-px-layer rb-px-mandala" data-depth="0.5" aria-hidden="true">
            <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g stroke="#f5b428" stroke-width="1">
                <circle cx="200" cy="200" r="180" opacity=".35" />
                <circle cx="200" cy="200" r="150" opacity=".45" />
                <circle cx="200" cy="200" r="110" opacity=".55" />
                <circle cx="200" cy="200" r="60" opacity=".7" />
                <g opacity=".6">
                  <path d="M200 20 L214 90 L200 120 L186 90 Z" /><path d="M200 380 L214 310 L200 280 L186 310 Z" />
                  <path d="M20 200 L90 186 L120 200 L90 214 Z" /><path d="M380 200 L310 186 L280 200 L310 214 Z" />
                  <path d="M73 73 L132 113 L146 146 L113 132 Z" /><path d="M327 327 L268 287 L254 254 L287 268 Z" />
                  <path d="M327 73 L287 132 L254 146 L268 113 Z" /><path d="M73 327 L113 268 L146 254 L132 287 Z" />
                </g>
              </g>
            </svg>
          </div>
          <div class="rb-px-layer rb-px-garland" data-depth="0.65" aria-hidden="true"></div>
          <div class="rb-px-caption">
            <p class="rb-kicker-light">An Evening of Light</p>
            <h2 id="parallax-title" class="rb-gold-display">May every home glow a little brighter</h2>
            <p>This Raksha Bandhan, we wish every family an evening of warmth — of sweets shared, stories retold, and threads tied with love that lasts far beyond the festival.</p>
          </div>
          <div class="rb-px-layer rb-px-diyas" data-depth="0.85" aria-hidden="true">
            ${Array.from({ length: 5 }).map(() => `<svg class="rb-diya" viewBox="0 0 64 72" xmlns="http://www.w3.org/2000/svg"><g class="rb-flame"><ellipse cx="32" cy="18" rx="7" ry="13" fill="#ff8a3d"/><ellipse cx="32" cy="21" rx="4" ry="8" fill="#ffd977"/></g><path d="M8 40 Q32 58 56 40 L52 54 Q32 66 12 54 Z" fill="#7a3b1d"/><path d="M8 40 Q32 52 56 40 Q32 48 8 40Z" fill="#a0522d"/></svg>`).join("")}
          </div>
        </div>
      </section>
    </div>
    <div class="rb-garland" aria-hidden="true"></div>
    <article class="rb-content" id="raksha-content">
      <div class="rb-content-inner">
        <p class="rb-kicker">Student and parent resource</p>
        <h2>When Is Raksha Bandhan 2026? Date &amp; Significance</h2>
        <p class="rb-intro">Raksha Bandhan 2026 falls on <strong>Friday, 28 August</strong>, during Shravana Purnima. It is a day for families to gather, share warm wishes and reflect on the bonds that support us.</p>
        <div class="rb-date-card"><div class="rb-date-card-time">28<small>AUG · FRI</small></div><p><strong>Shravana Purnima</strong><br />The traditional tying window is observed in the morning according to local panchang practice. Families should confirm the timing with a trusted local source.</p></div>
        <p>Rakhi celebrations are often recognised by a thread tied with affection and a promise of support. The festival’s meaning can include siblings, cousins, friends and anyone with whom we share care and respect.</p>
        <div class="rb-callout">A meaningful celebration can be wonderfully simple: share a sincere wish, listen carefully, make a promise you can keep, and appreciate the people who encourage you.</div>

        <h2>The Story of Raksha Bandhan for Kids</h2>
        <p class="rb-intro">Many families share traditional legends on Raksha Bandhan. These stories are told in different ways across generations; they offer friendly starting points for conversations about courage, gratitude and loyalty.</p>
        <div class="rb-legend-grid">
          <section class="rb-legend"><span class="rb-icon">${icon("sparkles")}</span><h3>Krishna &amp; Draupadi</h3><p>In a well-known legend, Draupadi cared for Krishna when he was hurt. Krishna promised to stand by her, showing how a thoughtful act can build a lasting bond.</p></section>
          <section class="rb-legend"><span class="rb-icon">${icon("sun")}</span><h3>Yama &amp; Yamuna</h3><p>Another traditional story tells of Yamuna welcoming her brother Yama with affection. Their reunion became a symbol of the wish for a loved one’s wellbeing.</p></section>
          <section class="rb-legend"><span class="rb-icon">${icon("landmark")}</span><h3>Karnavati &amp; Humayun</h3><p>The legend of Rani Karnavati and Humayun is often retold as a story of seeking support in a difficult moment, and responding with honour.</p></section>
        </div>

        <h2>Raksha Bandhan Speech in English for Students</h2>
        <p>These ready-to-use speeches can be adapted with a personal example or a line of gratitude. Practise slowly, make eye contact and speak in your natural voice.</p>
        <section class="rb-speech"><p class="rb-speech-label">About one minute · Primary students</p><h3>A short Raksha Bandhan speech</h3><p>Good morning respected Principal, teachers and my dear friends. Today I am happy to speak about Raksha Bandhan. This festival is celebrated on the full moon day of Shravana. A rakhi is a simple thread, but it carries a meaningful promise: to care, respect and stand by one another. We often celebrate it with brothers and sisters, but its message reaches friends, cousins and everyone who supports us. Let us use this day to say thank you, share kindly and keep our promises. May the thread of Raksha Bandhan make our relationships stronger. Thank you.</p></section>
        <section class="rb-speech"><p class="rb-speech-label">About two to three minutes · Secondary students</p><h3>A longer Raksha Bandhan speech</h3><p>Good morning respected Principal, teachers and my dear friends. Raksha Bandhan is a festival that turns a small thread into a powerful reminder. Raksha means protection and bandhan means bond. On Shravana Purnima, sisters traditionally tie a rakhi on their brothers’ wrists, and families gather with prayers, sweets and good wishes.

Yet the heart of the festival is larger than one custom. It asks us to care for the people around us and to use our strength with responsibility. In school, this can mean including someone who feels left out, helping a friend understand a lesson, respecting different opinions and speaking up with kindness.

The legends connected with Raksha Bandhan also remind us that trust can grow through compassion and courage. This year, let us make a promise that goes beyond a ribbon: to protect one another’s dignity, to be reliable friends and to create homes and classrooms where everyone feels safe. Thank you.</p></section>

        <h2>Raksha Bandhan Essay &amp; 10 Lines</h2>
        <section class="rb-speech"><p class="rb-speech-label">Essay resource · Approximately 300 words</p><h3>Raksha Bandhan: A Festival of Care</h3><p>Raksha Bandhan is a cherished Indian festival that celebrates affection, trust and responsibility. It is observed on the full moon day of the Hindu month of Shravana. The words raksha and bandhan mean protection and bond. On this day, a rakhi is tied as a sign of loving care. Families often share sweets, prayers and thoughtful gifts.

Although the festival is commonly associated with brothers and sisters, its message is meaningful for cousins, friends and every relationship built on respect. Traditional stories linked with the festival show how compassion and loyalty can create strong bonds.

For students, Raksha Bandhan is a chance to think about the promises we make every day. We can protect one another by being kind, listening carefully, refusing to bully and helping someone who needs support. A rakhi may be made of thread, paper or beads, but the values behind it are lasting. When we act with honesty, gratitude and care, we make the bond of Raksha Bandhan real in our homes, schools and communities.</p></section>
        <h3>10 lines on Raksha Bandhan</h3>
        <ol class="rb-ten-lines">
          <li>Raksha Bandhan is a festival that celebrates care and trust.</li><li>It is celebrated on Shravana Purnima.</li><li>In 2026, Raksha Bandhan falls on Friday, 28 August.</li><li>Raksha means protection and bandhan means bond.</li><li>A rakhi is tied as a sign of affection and responsibility.</li><li>Families share sweets, wishes and time together.</li><li>The festival is loved by brothers, sisters, cousins and friends.</li><li>We can celebrate by making a kind promise to one another.</li><li>Rakhi crafts can be made with paper, thread and beads.</li><li>Raksha Bandhan teaches us to be caring and reliable.</li>
        </ol>

        <h2>Rakhi Making Ideas &amp; Activities for Kids</h2>
        <p>These raksha bandhan activities for school students keep the focus on imagination, gratitude and gentle collaboration. Use recycled materials where possible and keep small beads away from very young children.</p>
        <div class="rb-craft-grid">
          <section class="rb-craft"><span class="rb-icon">${icon("scissors")}</span><h3>Paper quilling rakhi</h3><p>Roll coloured paper strips into small coils, glue them into a flower shape and attach them to a soft thread.</p><ol><li>Cut and curl paper strips.</li><li>Arrange coils on a paper base.</li><li>Secure to ribbon or thread.</li></ol></section>
          <section class="rb-craft"><span class="rb-icon">${icon("gem")}</span><h3>Thread-and-bead rakhi</h3><p>Choose two or three thread colours, add large beads and finish with a comfortable tie.</p><ol><li>Twist the threads together.</li><li>Add beads with adult help.</li><li>Test that the ends are secure.</li></ol></section>
          <section class="rb-craft"><span class="rb-icon">${icon("pen-line")}</span><h3>Promise cards</h3><p>Write one realistic promise that makes life kinder at home or school.</p><ol><li>Fold a small card.</li><li>Write a promise and a thank-you.</li><li>Exchange cards with care.</li></ol></section>
          <section class="rb-craft"><span class="rb-icon">${icon("users-round")}</span><h3>Gratitude circle</h3><p>Invite each person to share one quality they value in someone else.</p><ol><li>Sit in a circle.</li><li>Pass a soft thread.</li><li>Offer a specific, sincere appreciation.</li></ol></section>
          <section class="rb-craft"><span class="rb-icon">${icon("cookie")}</span><h3>Sweets to make together</h3><p>Prepare a simple family snack with adult guidance and share the tasks.</p><ol><li>Choose a no-cook recipe.</li><li>Measure and mix together.</li><li>Serve with a handwritten wish.</li></ol></section>
        </div>

        <h2>Raksha Bandhan Wishes &amp; Messages</h2>
        <p>Use these short Raksha Bandhan wishes for a brother, sister or friend, then add a memory that makes the message your own.</p>
        <div class="rb-wishes">
          <p class="rb-wish-card">May our bond always be full of care, laughter and trust.</p><p class="rb-wish-card">Thank you for being someone I can count on.</p><p class="rb-wish-card">Wishing you a Raksha Bandhan filled with warmth and joy.</p><p class="rb-wish-card">May this thread remind us to stand by one another.</p><p class="rb-wish-card">I am grateful for your encouragement every day.</p><p class="rb-wish-card">Here is to more shared smiles and kind promises.</p><p class="rb-wish-card">May our friendship grow stronger with every season.</p><p class="rb-wish-card">Wishing you confidence, good health and happiness.</p><p class="rb-wish-card">Thank you for making ordinary days brighter.</p><p class="rb-wish-card">May we always choose respect and understanding.</p><p class="rb-wish-card">A small thread, a big promise, a lasting bond.</p><p class="rb-wish-card">Happy Raksha Bandhan to someone truly special.</p>
        </div>

        <section class="rb-download-panel" aria-labelledby="download-title"><div><h2 id="download-title">Take the speech and essay with you</h2><p>Download a clean, printable PDF for practice at home or in class.</p></div><button class="rb-download" type="button">${icon("download")} Download Speech &amp; Essay PDF</button></section>

        <h2>Raksha Bandhan 2026 FAQs</h2>
        <div class="rb-faq">
          ${FAQS.map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join("")}
        </div>
        <section class="rb-closing" id="admissions-note"><p class="rb-kicker">From the RIS family</p><h2>May every thoughtful promise find a place to grow.</h2><p>We wish your family a peaceful, joyful Raksha Bandhan filled with meaningful time together.</p><div class="rb-cta-row"><a class="rb-cta" href="#admissions-note">Explore Our Campus</a><a class="rb-cta secondary" href="#admissions-note">Speak With Our Admissions Team</a><a class="rb-cta secondary" href="#admissions-note">Learn More</a></div><p class="rb-placeholder">Admissions links and contact details: [Insert verified link]</p></section>
      </div>
    </article>
  </main>
  <footer class="rb-footer"><div class="rb-footer-inner"><p class="rb-footer-title">Rainbow International School</p><p>CBSE K–12 · Thane · Passion for Excellence</p><small>All visuals on this page are illustrative artwork created for this festive story; they do not depict real students, staff, or campus facilities.</small></div></footer>
  <script defer src="https://unpkg.com/lucide@0.468.0"></script>
  <script>window.addEventListener("load",function(){if(window.lucide){window.lucide.createIcons();}});</script>
  <script defer src="/blog-assets/${SLUG}/raksha-bandhan-2026.js?v=${assetVersion("raksha-bandhan-2026.js")}"></script>
</body>
</html>`;
}

export function registerRakshaBandhan2026SSR(app: Express) {
  app.get(`/blog/${SLUG}`, (_req, res) => {
    try {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("X-Rendered-By", "Express SSR Custom");
      res.send(renderPage());
    } catch (error) {
      console.error("[ssrRakshaBandhan2026] Error rendering page:", error);
      res.status(500).send("Internal Server Error");
    }
  });
}