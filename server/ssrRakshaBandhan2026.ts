import type { Express } from "express";
import { registerCodeOwnedBlogSlug } from "./blogRoutes";

const SLUG = "raksha-bandhan-2026";
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
  <link rel="stylesheet" href="/blog-assets/${SLUG}/raksha-bandhan-2026.css" />
</head>
<body>
  <a class="rb-skip" href="#raksha-content">Skip to article content</a>
  <div class="rb-progress" aria-hidden="true"><span></span></div>
  <div class="rb-topbar"><span>Rainbow International School, Thane</span><span>CBSE K–12</span><span>Passion for Excellence</span></div>
  <nav class="rb-navbar" aria-label="Primary navigation">
    <a class="rb-brand" href="/">
      <img src="/ris-logo.png" alt="Rainbow International School logo" />
      <span>Rainbow International School<small>Passion for Excellence</small></span>
    </a>
    <ul class="rb-navlinks"><li><a href="/">Home</a></li><li><a href="/about-rainbow-international-school">About</a></li><li><a href="/blogs">Blogs</a></li><li><a href="/contact-us">Contact</a></li></ul>
  </nav>
  <main>
    <section class="rb-cinematic" aria-labelledby="raksha-title">
      <div class="rb-scene" aria-hidden="true"></div>
      <div class="rb-static-rakhi" aria-hidden="true"></div>
      <div class="rb-hero">
        <div class="rb-hero-copy">
          <p class="rb-eyebrow">A festive story from RIS</p>
          <h1 id="raksha-title">Raksha Bandhan 2026: The Thread That Binds Us</h1>
          <p class="rb-date-pill">${icon("calendar-days")} Friday · 28 August 2026 · Shravana Purnima</p>
          <p>A thread can be delicate and still hold a promise. This Raksha Bandhan, explore a celebration of care, trust and the everyday ways we stand beside one another.</p>
          <a class="rb-scroll-cue" href="#raksha-content"><i aria-hidden="true"></i> Read the story and student resources</a>
        </div>
      </div>
      <div class="rb-thread" aria-hidden="true"><span></span></div>
      <section class="rb-chapter" aria-labelledby="chapter-one"><div class="rb-chapter-copy"><p class="rb-chapter-num">01 · THE MEANING</p><h2 id="chapter-one">A thread that says, “I am here.”</h2><p>At its heart, a rakhi is an invitation to notice one another. It carries affection, but also attention: the steady kind that listens, helps and stays present when it matters.</p></div></section>
      <section class="rb-chapter" aria-labelledby="chapter-two"><div class="rb-chapter-copy"><p class="rb-chapter-num">02 · THE WORDS</p><h2 id="chapter-two">Raksha is care. Bandhan is a bond.</h2><p>Together, these words express a promise. Protection is not about control; it is about respect, responsibility and the courage to choose kindness in the small moments of daily life.</p></div></section>
      <section class="rb-chapter" aria-labelledby="chapter-three"><div class="rb-chapter-copy"><p class="rb-chapter-num">03 · THE VALUES</p><h2 id="chapter-three">Every classroom can hold the same promise.</h2><p>Friendship, mentorship and care grow through thoughtful actions. A welcoming word, a shared idea or help with a difficult task can make school life feel more connected for everyone.</p></div></section>
      <section class="rb-celebration" aria-labelledby="celebration-title">
        <h2 id="celebration-title" class="rb-sr-only">A celebration moment</h2>
        <div class="rb-celebration-stage">
          <div class="rb-celebration-glow" aria-hidden="true"></div>
          <canvas class="rb-celebration-sparkles" aria-hidden="true"></canvas>
          <p class="rb-celebration-bubble" aria-live="polite"></p>
          <div class="rb-celebration-tilt">
            <div class="rb-celebration-float">
              <picture>
                <source srcset="/blog-assets/${SLUG}/rakhi-kids.webp" type="image/webp" />
                <img src="/blog-assets/${SLUG}/rakhi-kids.png" width="900" height="1125" loading="lazy" decoding="async" alt="Illustration of two Rainbow International School students tying a rakhi on Raksha Bandhan." />
              </picture>
            </div>
          </div>
        </div>
        <p class="rb-celebration-caption">The joy of tying the knot of protection — Raksha Bandhan at the heart of our Rainbow family.</p>
      </section>
      <div class="rb-tie-wrap">
        <section class="rb-tie-card" aria-labelledby="tie-title">
          <div class="rb-tie-copy">
            <p class="rb-eyebrow">An interactive pause</p>
            <h2 id="tie-title">Tie a rakhi of your own</h2>
            <p>Choose a colour, turn the rakhi with your pointer, then tie a thread as a small reminder to lead with care.</p>
            <div class="rb-theme-picker" aria-label="Choose a rakhi colour">
              <button class="rb-theme" type="button" style="--theme:#a82542" data-theme="#a82542" aria-label="Choose crimson rakhi" aria-pressed="true"></button>
              <button class="rb-theme" type="button" style="--theme:#1d5d91" data-theme="#1d5d91" aria-label="Choose blue rakhi" aria-pressed="false"></button>
              <button class="rb-theme" type="button" style="--theme:#5e407e" data-theme="#5e407e" aria-label="Choose violet rakhi" aria-pressed="false"></button>
              <button class="rb-theme" type="button" style="--theme:#277257" data-theme="#277257" aria-label="Choose green rakhi" aria-pressed="false"></button>
            </div>
            <button class="rb-action" type="button">${icon("heart-handshake")} Tie the Thread</button>
            <p class="rb-wish" aria-live="polite">May every thread remind us to care for one another.</p>
          </div>
          <div class="rb-tie-stage" role="img" aria-label="An interactive illustrated rakhi. Drag left or right to rotate it.">
            <div class="rb-tie-fallback" aria-hidden="true"></div>
          </div>
        </section>
      </div>
    </section>
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
  <script defer src="/blog-assets/${SLUG}/raksha-bandhan-2026.js"></script>
</body>
</html>`;
}

export function registerRakshaBandhan2026SSR(app: Express) {
  // Declare this code-owned page so no legacy redirect can ever hijack its URL.
  registerCodeOwnedBlogSlug(SLUG);
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