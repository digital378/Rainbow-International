import type { Express } from "express";

function e(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function seoTitle(t: string, appendSiteName: boolean = true): string {
  if (!appendSiteName) return t;
  return t.includes("Rainbow International") ? t : `${t} | Rainbow International School`;
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
  appendSiteName?: boolean;
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
<title>${e(seoTitle(cfg.title, cfg.appendSiteName))}</title>
<meta name="description" content="${e(cfg.description)}"/>
<meta name="keywords" content="${e(cfg.keywords)}"/>
<meta name="robots" content="index, follow"/>
<link rel="canonical" href="${e(cfg.canonical)}"/>
<meta property="og:title" content="${e(seoTitle(cfg.title, cfg.appendSiteName))}"/>
<meta property="og:description" content="${e(cfg.description)}"/>
<meta property="og:url" content="${e(cfg.canonical)}"/>
<meta property="og:type" content="website"/>
<meta property="og:image" content="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad.jpg"/>
<meta property="og:locale" content="en_IN"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${e(seoTitle(cfg.title))}"/>
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
<!-- Meta Pixel Code -->
<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1280590747364170');fbq('track','PageView');</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1280590747364170&ev=PageView&noscript=1"/></noscript>
<!-- End Meta Pixel Code -->
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

function renderAbout(): string {
  return `
<div class="section">
<h2>About Rainbow International School</h2>
<p>Rainbow International School was founded in April 2009 with a vision to provide world-class education rooted in Indian values. Located on a sprawling 3.5-acre campus in Brahmand Phase 4, Thane, we are one of the leading CBSE-affiliated K–12 schools in Maharashtra, serving over 3,000 students from Nursery to Class 12.</p>

<h2>Our Legacy</h2>
<p>Over the past 17 years, Rainbow International School has impacted more than 1 lakh students. We have consistently been recognised as one of the Best Schools in Thane, earning accolades from national education bodies, the British Council (International School Award), Google for Education, and Meta for Education.</p>

<h2>Campus & Infrastructure</h2>
<p>Our 3.5-acre campus features smart classrooms, fully equipped science and computer labs, a 10,000+ book library, a temperature-controlled swimming pool, skating rink, basketball and football courts, a 500-seat amphitheatre, art and music studios, an organic farm, and a dedicated pre-primary wing with all-female staff.</p>

<h2>Academic Excellence</h2>
<p>Affiliated to CBSE (Affiliation No. 1130661), we offer classes from Nursery to Class 12 with three streams in senior secondary: Science, Commerce, and Humanities. Our pedagogy is based on the Multiple Intelligence framework, emphasising experiential, project-based, and collaborative learning.</p>

<h2>Holistic Development</h2>
<p>Beyond academics, we offer 30+ extracurricular activities including swimming, skating, robotics, coding, MUN, art, music, dance, drama, cricket, football, and organic farming. Our students regularly participate in inter-school competitions, science exhibitions, and national-level events.</p>

<h2>Safety & Security</h2>
<p>With 200+ CCTV cameras, card-based entry, trained security personnel, a full-time nurse, visiting paediatrician, equipped ambulance, and GPS-tracked school buses, Rainbow International School is among the safest schools in Thane.</p>

<p>Learn more about our <a href="/ris-vision-mission">Vision & Mission</a>, <a href="/our-philosophy">Philosophy</a>, or <a href="/contact-us">get in touch</a>.</p>
</div>`;
}

function renderPrePrimary(): string {
  return `
<div class="section">
<h2>Pre-Primary Section — Nursery, Jr KG, Sr KG</h2>
<p>The Pre-Primary Section at Rainbow International School provides a nurturing, play-based learning environment for children aged 2.5 to 5 years. Our dedicated pre-primary wing is staffed entirely by female educators, ensuring a safe and comforting atmosphere for young learners.</p>

<h2>Age Criteria</h2>
<ul>
<li><strong>Nursery:</strong> 2.5 years as on 31st March</li>
<li><strong>Jr KG:</strong> 3.5 years as on 31st March</li>
<li><strong>Sr KG:</strong> 4.5 years as on 31st March</li>
</ul>

<h2>Curriculum & Pedagogy</h2>
<p>Our pre-primary curriculum is built on the Multiple Intelligence framework, incorporating thematic learning, sensory play, creative arts, storytelling, and early literacy and numeracy. Every classroom is designed with age-appropriate furniture, learning stations, and colourful, stimulating environments.</p>

<h2>Facilities</h2>
<ul>
<li>Dedicated air-conditioned classrooms</li>
<li>Indoor play area and sandpit</li>
<li>Splash pool for water play</li>
<li>Art, music, and movement rooms</li>
<li>100% female staff and trained caregivers</li>
<li>CCTV-monitored premises</li>
</ul>

<h2>Activities</h2>
<p>Children participate in storytelling, puppet shows, clay modelling, finger painting, dance, music, yoga, and outdoor nature walks. Annual events include Sports Day, Grandparents Day, and festive celebrations.</p>

<p>Explore our <a href="/primary-section">Primary Section</a> or <a href="/admissions">apply for admission</a>.</p>
</div>`;
}

function renderPrimary(): string {
  return `
<div class="section">
<h2>Primary School in Thane for Class 1 to Class 5</h2>
<p>The Primary School at Rainbow International School in Thane is where children build the foundations that shape their entire academic journey. Spanning Class 1 to Class 5, our CBSE-aligned primary programme nurtures strong literacy and numeracy, sparks scientific curiosity, encourages creative expression, and helps young learners develop confidence, kindness and independence. Our Brahmand Phase 4 campus offers dedicated primary classrooms, age-appropriate libraries, science discovery spaces, art studios, music rooms and a generous outdoor play area where Class 1 to Class 5 children move, explore and learn every single day.</p>

<h2>Why Parents Choose Rainbow for the Primary Years</h2>
<p>Parents from Brahmand, Hiranandani Estate, Ghodbunder Road, Manpada, Kavesar and Kolshet choose Rainbow International School because the primary years are not treated as a passive stretch between Pre-Primary and Middle School. They are treated as a defining stage of childhood. Our class teachers stay with the same group of children for an extended period, building the kind of trust that helps a child speak up, ask questions, attempt new things and recover from small setbacks with grace.</p>
<p>Class strength in the primary section is kept reasonable so that every child is known by name, by interest and by learning style. Our primary teachers are CBSE-trained and continue to attend regular professional development workshops on phonics, mental mathematics, language acquisition, child psychology, classroom management and digital pedagogy. The result is a primary school in Thane that feels personal, safe and academically serious at the same time.</p>

<h2>Subjects and Learning Areas — Class 1 to 5</h2>
<p>The Class 1 to Class 5 curriculum at Rainbow International School covers English, Hindi, Marathi, Mathematics, Environmental Science (EVS), Computer Awareness, Art and Craft, Music, Dance, General Knowledge, Value Education and Physical Education. Each subject is delivered through a combination of textbook learning, hands-on activities, audio-visual stories, classroom games and outdoor experiences so that children move, talk, build and reflect — not just listen.</p>
<p>Languages are taught with a balance of phonics, sight words, listening practice and oral expression. Mathematics is grounded in concrete materials, visual models and real-life scenarios before moving to symbolic work. EVS connects classroom learning to the world around the child — family, neighbourhood, transport, food, water, plants, animals and seasons — building a curious, observant mindset.</p>

<h2>Class 1 to Class 5 Learning Journey</h2>

<h3>Class 1 — The First Big Step</h3>
<p>Class 1 is a gentle but important transition from Pre-Primary. Children are introduced to formal reading, writing and number work through phonics-based language learning, sight-word reading, simple journaling, mental maths drills and pattern recognition. The classroom keeps a play-friendly tone with circle time, rhymes and movement breaks so that the school day still feels joyful.</p>

<h3>Class 2 — Building Reading Stamina</h3>
<p>In Class 2, children read longer passages, write short paragraphs and begin understanding place value, basic shapes and EVS topics around the family, neighbourhood and seasons. Group work, library visits and "show and tell" activities build oral confidence in both English and Hindi.</p>

<h3>Class 3 — Curious Investigators</h3>
<p>Class 3 marks the start of structured note-taking, library borrowing, science observation activities and elementary problem-solving in mathematics. Children learn to organise their ideas, follow simple research steps and present what they have learned to peers, building early communication and collaboration skills.</p>

<h3>Class 4 — Independent Learners</h3>
<p>By Class 4, students take on more responsibility for homework planning, project research and self-checking of work. The mathematics curriculum strengthens fractions, decimals, multiplication and division, while EVS expands into geography, civic life, healthy living and the environment around them.</p>

<h3>Class 5 — Ready for Middle School</h3>
<p>Class 5 prepares children for the jump to Middle School. Subjects become more concept-driven, written work becomes more structured, and study skills like time management, reading comprehension and exam preparation are introduced gently. By the end of Class 5, students are confident readers, clear writers and curious thinkers, ready for the wider canvas of Class 6.</p>

<h2>Literacy and Numeracy Development</h2>
<p>Strong literacy is the engine of every other subject. Our primary literacy plan combines phonics, guided reading, library reading, journal writing, oral storytelling, vocabulary games and creative writing prompts. Children read both for skill and for pleasure, choosing books from a primary library curated for their age and interests.</p>
<p>For numeracy, we follow a concrete-pictorial-abstract approach. Concepts begin with physical objects — counters, blocks, coins, measuring cups — move to drawings and diagrams, and then to symbolic notation. Daily mental maths, weekly problem-solving challenges and themed maths weeks make number work joyful rather than stressful, and help children see mathematics as a way of thinking, not just a list of procedures.</p>

<h2>Classroom Experience</h2>
<p>Primary classrooms at Rainbow International School are bright, child-centred spaces. Each classroom has a smart panel for digital lessons, a reading corner with rotating books, a display board where students' work is celebrated, and flexible seating that allows quick movement between individual work, pair work and group work. Wherever possible, learning extends outside the classroom — to the school library, organic farm, art studio, music room or the open-air amphitheatre.</p>

<h2>Assessment and Student Progress</h2>
<p>Assessment in the primary years is continuous, supportive and feedback-rich rather than rank-driven. Teachers use a mix of class observations, oral questioning, short written tasks, group projects and term-end assessments to build a clear picture of each child's progress. Parents receive structured progress reports that describe both academic achievement and social-emotional growth, along with personalised teacher comments and goals for the next term.</p>
<p>Parent-teacher meetings are scheduled at regular intervals and are designed as two-way conversations — not just one-way report sharing. Parents are encouraged to share home observations, learning concerns and aspirations so that the school's plan and the home routine can stay aligned.</p>

<h2>Safe and Supportive Primary Environment</h2>
<p>Safety in the primary years is non-negotiable. Our campus is monitored by 200+ CCTV cameras, with controlled entry and trained security personnel at every gate. The primary wing has its own dedicated washrooms, supervised lunch areas, hygiene routines and trained female attendants on every floor. A full-time school nurse and a visiting paediatrician are available on campus, and an equipped ambulance is on standby for emergencies.</p>
<p>For families using school transport, every bus is GPS-tracked, fitted with CCTV and a speed governor, and accompanied by a trained female attendant. Pick-up and drop are managed with parent verification at every stop, and routes cover the entire Brahmand, Hiranandani Estate, Ghodbunder Road, Manpada, Pokhran Road, Kavesar, Kolshet and Majiwada belt.</p>

<h2>Hyperlocal Primary Admissions in Thane</h2>

<h3>Class 1 admission near Hiranandani Estate</h3>
<p>Hiranandani Estate families often look for a CBSE primary school within a short drive of home. Rainbow International School is approximately five minutes away and is a popular Class 1, Class 2 and Class 3 admission choice for Hiranandani Estate parents who want academic depth and a calm, caring environment for their children.</p>

<h3>Class 1 admission near Ghodbunder Road</h3>
<p>Families along Ghodbunder Road — Patlipada, Waghbil, Owale and the wider GB Road corridor — choose Rainbow for the combination of a CBSE primary curriculum, modern facilities and dedicated bus routes that make the daily commute predictable and safe.</p>

<h3>Class 5 admission near Brahmand Thane</h3>
<p>Brahmand Phase 1 to 4 parents enjoy walking-distance access. Class 5 admission near Brahmand is especially popular because parents want continuity into our Middle School and Secondary sections without having to change schools, friends or routines.</p>

<h3>Primary admissions near Manpada, Kavesar and Kolshet</h3>
<p>Class 1 to Class 5 admissions from Manpada, Kavesar, Kolshet and Pokhran Road are supported by dedicated bus routes and a Saturday-morning campus tour slot for working parents who cannot easily visit on weekdays.</p>

<h2>Frequently Asked Questions about the Primary Section</h2>

<h3>What is the class strength in Primary?</h3>
<p>We keep primary class sections at a reasonable size to ensure every child is known by name, by interest and by learning need. The exact strength for the upcoming academic year is shared at the time of admission.</p>

<h3>Which board does the Primary Section follow?</h3>
<p>The Primary Section follows the CBSE curriculum, with age-appropriate adaptations for Class 1 to Class 5. We also integrate value education, life skills and arts into the weekly timetable so that learning is balanced.</p>

<h3>Are homework loads manageable?</h3>
<p>Yes. Primary homework is designed to reinforce classroom learning without overwhelming children. We follow a balanced homework policy that respects family time, outdoor play and rest.</p>

<h3>Do you support children moving from another board or city?</h3>
<p>Absolutely. Children joining from ICSE, IB or state board schools, or from another city or country, are supported with a short orientation, bridge-learning activities where needed, and a classroom buddy to help them settle in quickly.</p>

<h3>Are there enough activities outside academics?</h3>
<p>Primary students participate in art, music, dance, drama, yoga, swimming, skating, football, cricket, basketball, robotics taster sessions, library reading clubs and seasonal celebrations. There is something for every child to enjoy and try.</p>

<h3>How do parents track progress?</h3>
<p>Parents receive structured progress reports each term, regular notes from class teachers, and dedicated parent-teacher meetings. The school is also responsive to parent queries via the official communication channels.</p>

<h3>How do I apply for a Class 1 to Class 5 seat?</h3>
<p>Call +91 82915 68972 or fill the enquiry form. Our admissions team will book a campus visit and walk you through the application, interaction and confirmation steps.</p>

<h3>What languages are taught in the Primary Section?</h3>
<p>English is the medium of instruction. Hindi and Marathi are taught as additional languages from the early primary years onwards, in line with CBSE guidelines and the Maharashtra state requirement.</p>

<h3>Is there a Saturday class or campus visit option?</h3>
<p>The school follows a weekday timetable. For working parents, campus visits and admission counselling are available on Saturday mornings between 9:30 AM and 1:00 PM by prior appointment.</p>

<h2>Parent Decision Checklist</h2>
<p>Choosing a primary school is a long-term decision. We encourage every family to walk the campus, meet a class teacher, see a working classroom, ask about library and lab access, understand assessment philosophy, check transport routes and discuss any specific concerns about their child. Rainbow International School welcomes detailed conversations because we know that the right fit between the child, the family and the school is what makes the primary years successful.</p>

<p>Ready to explore further? Visit our <a href="/pre-primary-school-thane">Pre-Primary section</a>, our <a href="/middle-school-section">Middle School</a>, or <a href="/admissions">apply for the 2026–27 academic year</a>.</p>
</div>`;
}

function renderMiddleSchool(): string {
  return `
<div class="section">
<h2>Middle School in Thane for Class 6 to Class 8</h2>
<p>The Middle School at Rainbow International School in Thane is where children move from being curious primary learners to confident, self-directed students ready for the academic depth of secondary school. Spanning Class 6, Class 7 and Class 8, our CBSE Middle School in Thane combines a strong subject foundation with structured study skills, age-appropriate technology, sport, the arts and a rich social environment. Located on a 3.5-acre campus in Brahmand Phase 4, the Middle School wing includes science laboratories, computer and robotics rooms, a senior library, an amphitheatre, sports grounds and dedicated discussion zones for project work.</p>

<h2>Why Parents Choose Rainbow for Middle School</h2>
<p>Parents from Brahmand, Hiranandani Estate, Ghodbunder Road, Manpada, Kavesar and Kolshet choose Rainbow International School for Class 6, Class 7 and Class 8 because middle school is treated as a stage in its own right rather than a holding pattern between primary school and the board years. Class teachers and subject teachers work as a coordinated team — sharing observations about each child, planning interventions early, and celebrating growth in academics, character and confidence.</p>
<p>Our middle school faculty is CBSE-trained and continually upskilled in subject mastery, formative assessment, classroom management and student wellbeing. Class strength is kept reasonable so that students get attention, feedback and the chance to participate in every lesson, rather than blending into a large crowd.</p>

<h2>Class 6 to Class 8 Learning Journey</h2>

<h3>Class 6 — Stepping into Middle School</h3>
<p>Class 6 is a transition year. Students adjust to multiple subject teachers, longer class periods, more complex notebooks and more independent homework planning. We support this transition with a structured orientation, a personal organiser, regular study skills sessions and close communication between class teachers and parents in the first term.</p>

<h3>Class 7 — Building Subject Depth</h3>
<p>In Class 7, students go deeper into English literature and language, Hindi, a third language (Sanskrit or French), Mathematics, Science, Social Science and Computer Science. Project work becomes more analytical, with research, citation and presentation expectations. Co-curricular leadership opportunities — class representative roles, house event coordination, club leadership — also begin to open up.</p>

<h3>Class 8 — Preparing for the Board Years</h3>
<p>Class 8 is a stepping stone into the Class 9–10 board years. The curriculum focuses on conceptual clarity, application-based problem solving and careful study habits. Students choose options for senior co-curricular tracks, attend early career-awareness sessions, and learn how to plan their term, balance subjects and prepare effectively for assessments.</p>

<h2>Subject Foundation and Skill Development</h2>
<p>The Class 6 to Class 8 curriculum at Rainbow International School covers English, Hindi, a third language (Sanskrit or French), Mathematics, Science, Social Science, Computer Science, Art and Music, Physical Education and Value Education. Subject teachers integrate inquiry, group work, lab investigations and digital tools so that students learn by doing, not just by memorising. Cross-subject themes — sustainability, technology, citizenship, design thinking — are introduced through projects that pull together skills from multiple disciplines.</p>

<h2>Classroom Learning Approach</h2>
<p>Middle school classrooms at Rainbow are interactive and discussion-friendly. Smart panels are used for visual lessons, simulations and short videos that bring concepts to life. Students take notes, work in pairs or small groups, present findings and answer open-ended questions. Science classes are supported by hands-on lab sessions in our Physics, Chemistry, Biology and Computer labs. Mathematics integrates problem-solving competitions, mental maths challenges and real-world applications.</p>

<h2>Academic Support and Progress Tracking</h2>
<p>Middle school students receive regular formative feedback, periodic assessments, mid-term and term-end examinations. Subject teachers identify gaps early and offer doubt-clearing sessions, supplementary worksheets and targeted revision plans. A coordinated mentor system pairs every student with a faculty mentor who tracks academic progress, attendance, behaviour and wellbeing across the year.</p>
<p>Parents receive detailed progress reports along with personalised comments. Parent-teacher meetings are scheduled at structured intervals, and the school maintains open communication channels for any concern that needs immediate attention.</p>

<h2>Preparing Students for Secondary School</h2>
<p>By the end of Class 8, our students are not just academically prepared for the secondary board years — they are mentally, emotionally and socially ready. They have built study habits, learned to manage their own time, presented in front of audiences, worked in teams, faced failure and tried again, and developed strong relationships with teachers and peers. This middle school experience is what makes the jump to Class 9 and Class 10 board exam preparation feel like a natural next step rather than a sudden shock.</p>

<h2>Beyond the Classroom</h2>
<p>Middle school students take part in Model United Nations, inter-school debates, science and maths exhibitions, robotics and coding clubs, sports tournaments, dance and music performances, art exhibitions, environmental drives and community service initiatives. Leadership opportunities through the student council and house system give them platforms to plan events, run activities and represent the school.</p>

<h2>Hyperlocal Middle School Admissions in Thane</h2>

<h3>Class 6 admission near Hiranandani Estate</h3>
<p>Hiranandani Estate families looking for a CBSE middle school in Thane often choose Rainbow because the campus is just five minutes away and offers continuity from Class 6 right through to Class 12 under one roof.</p>

<h3>Class 7 admission near Ghodbunder Road</h3>
<p>For families along Ghodbunder Road — Patlipada, Waghbil, Owale, Kavesar and Kolshet — Class 6, Class 7 and Class 8 admissions at Rainbow are supported by dedicated bus routes that make the daily commute predictable and safe.</p>

<h3>Class 8 admission near Brahmand Thane</h3>
<p>Brahmand Phase 1 to 4 parents enjoy walking-distance access to the campus. Class 8 admission near Brahmand is particularly popular because families want their children to settle into the school well before the board years begin.</p>

<h3>Middle school admissions near Manpada and Pokhran Road</h3>
<p>Class 6 to Class 8 admissions from Manpada, Pokhran Road and the Majiwada belt are common at Rainbow. Bus routes, Saturday tour slots and a flexible counselling schedule make it easy for working parents to evaluate the school fit.</p>

<h2>Frequently Asked Questions about Middle School</h2>

<h3>Which board does the Middle School follow?</h3>
<p>Class 6 to Class 8 follow the CBSE curriculum with strong emphasis on conceptual learning, language proficiency, mathematics, sciences and social sciences.</p>

<h3>What third language is offered in Class 6 to Class 8?</h3>
<p>Students can typically choose between Sanskrit and French as the third language. The choice is finalised during the admission interaction and at the start of the academic year.</p>

<h3>How is academic progress tracked in middle school?</h3>
<p>Through continuous classroom observations, periodic tests, mid-term and term-end assessments, and structured parent-teacher meetings. Teachers also share informal feedback to parents whenever needed.</p>

<h3>Are middle school students given leadership opportunities?</h3>
<p>Yes. Students take part in the student council, house events, club leadership, MUN, debates, sports captaincy and community service initiatives.</p>

<h3>Is there academic support for students who join from another school?</h3>
<p>Yes. Students transferring from other schools, boards or cities are supported with a short orientation, subject-readiness check and a classroom buddy to help them settle in.</p>

<h3>What sports and activities are available?</h3>
<p>Swimming, skating, football, cricket, basketball, athletics, table tennis, chess, dance, music, drama, art, robotics and a wide range of clubs.</p>

<h3>How do I apply for a Class 6, Class 7 or Class 8 seat?</h3>
<p>Call +91 82915 68972 or fill the enquiry form. Our admissions team will book a campus visit and walk you through the application, interaction and confirmation steps.</p>

<h3>Are there bridge classes for students transferring mid-year?</h3>
<p>Yes. Students joining Class 6, Class 7 or Class 8 mid-year are supported with a short bridge plan in core subjects so that they can catch up with classroom pace without feeling overwhelmed.</p>

<h3>How does the school handle subject doubts and weak areas?</h3>
<p>Subject teachers offer doubt-clearing slots, after-school study clinics and worksheet-based revision for students who need extra support. Mentors monitor progress and coordinate the right level of help.</p>

<h3>Is technology integrated into middle school learning?</h3>
<p>Yes. Smart panels in classrooms, lab software, coding sessions, robotics tasters and curated online resources are part of the regular middle school experience, used as tools to deepen understanding rather than replace teachers.</p>

<h2>Daily Rhythm in the Middle School</h2>
<p>A typical Class 6 to Class 8 day at Rainbow International School begins with morning assembly, a thought for the day and a short physical warm-up. Subject periods are paced to match attention spans, with planned movement breaks, a structured lunch, library or lab slots and dedicated time for sport, music, art or club activities. Homework is planned in coordination across subjects so that no single evening becomes overloaded, and weekend assignments are kept reasonable so families can spend time together.</p>

<h2>Mentor and House System</h2>
<p>Every middle school student is part of a house — a smaller community within the school that competes in academics, sport, arts and service. Houses give students friends across grades, mentors among seniors, and many opportunities to take on responsibility — anything from organising a quiz to coordinating a sports event. Each student also has a faculty mentor who tracks academic progress, attendance, behaviour, friendships and overall wellbeing.</p>

<h2>Transport and Daily Commute</h2>
<p>Middle school students typically use the school bus service. Buses are GPS-tracked, fitted with CCTV and a speed governor, and staffed with a trained female attendant. Routes cover Brahmand Phase 1 to 4, Hiranandani Estate, Manpada, Pokhran Road, Patlipada, Waghbil, Owale, Kavesar, Kolshet, Majiwada and Dhokali, with morning pick-up and afternoon drop coordinated to the school timetable.</p>

<h2>Why Middle School Matters</h2>
<p>The Class 6 to Class 8 years are when a child's relationship with learning, with peers and with their own confidence is shaped for life. A strong middle school experience builds curiosity, resilience and the ability to ask good questions, while a weak one leaves gaps that later board years struggle to fix. Rainbow International School treats these years with the seriousness they deserve, blending academic depth with personal care so that students reach Class 9 ready to take on the board years with confidence and calm.</p>

<h2>Parent Decision Checklist</h2>
<p>If you are choosing a CBSE middle school in Thane for Class 6, Class 7 or Class 8, we encourage you to visit the campus, observe a classroom in session, talk to a subject teacher, ask about study load and homework policy, see the labs and library, check the bus route from your area and discuss any specific learning needs your child may have. Rainbow International School welcomes these detailed conversations because the right fit makes the middle school years deeply rewarding.</p>

<p>Explore our <a href="/primary-section">Primary section</a>, our <a href="/secondary-section">Secondary section</a>, or <a href="/admissions">apply for the 2026–27 academic year</a>.</p>
</div>`;
}

function renderSecondary(): string {
  return `
<div class="section">
<h2>Secondary School in Thane for Class 9 and Class 10</h2>
<p>The Secondary School at Rainbow International School in Thane is designed for serious academic growth without losing the warmth and balance that families value across the rest of our K–12 journey. Class 9 and Class 10 students follow a rigorous CBSE programme that prepares them for the Class 10 board examination, while continuing to enjoy sport, the arts, leadership opportunities and meaningful friendships. Our Brahmand Phase 4 campus offers fully equipped Physics, Chemistry, Biology and Computer laboratories, a senior library, dedicated discussion rooms, a digital classroom infrastructure and quiet study zones for focused work.</p>

<h2>Why Parents Choose Rainbow for Secondary School</h2>
<p>Parents from Brahmand, Hiranandani Estate, Ghodbunder Road, Manpada, Kavesar and Kolshet choose Rainbow International School for Class 9 and Class 10 because they want a CBSE secondary school in Thane that takes academic outcomes seriously without making children anxious. Our subject teachers are experienced board-class educators, and they work alongside academic mentors, counsellors and house mentors so that every student feels supported as the syllabus, study load and stakes increase.</p>
<p>Class strength is managed to ensure that every Class 9 and Class 10 student gets enough teacher attention, feedback on written work and one-on-one doubt-clearing time. The result is a secondary school environment that is structured, calm and quietly ambitious.</p>

<h2>Class 9 and Class 10 Learning Journey</h2>

<h3>Class 9 — Setting the Foundation for Boards</h3>
<p>Class 9 is the year when students build the conceptual depth, study habits and time management that will carry them through the Class 10 board exam. Subject teachers introduce the full board syllabus structure, expected answer formats and the rhythm of unit tests, mid-terms and term-end exams. Students learn to make their own notes, plan revision, attempt past papers and analyse their own mistakes.</p>

<h3>Class 10 — Board Year Focus</h3>
<p>Class 10 is the board year. The academic plan is built around regular practice tests, full-syllabus mock examinations, periodic doubt-clearing sessions, structured revision cycles and personalised feedback. Subject teachers track each student's progress in detail, and the school's pastoral team supports stress management, sleep, screen-time balance and exam-day strategy.</p>

<h2>Board Exam Readiness</h2>
<p>Our CBSE Class 10 board preparation in Thane is more than just a series of tests. It is a year-long plan with clear weekly milestones, formative feedback, exam-style practice and personal mentoring. Students learn how to read questions carefully, structure answers, manage time in the exam hall, and stay composed under pressure. Mock examinations are conducted in conditions that closely mirror the real board environment so that exam day feels familiar rather than overwhelming.</p>

<h2>Subject Focus</h2>
<p>The CBSE Class 9 and Class 10 curriculum at Rainbow includes English, Hindi or other second language as per CBSE options, Mathematics, Science (Physics, Chemistry, Biology), Social Science (History, Geography, Political Science and Economics), Computer Applications or Information Technology and Physical Education. Lab work is given strong emphasis in Class 9 and Class 10 so that scientific concepts are felt, observed and understood — not memorised abstractly.</p>

<h2>Study Discipline and Academic Support</h2>
<p>We help students build study discipline through structured timetables, weekly subject planners, daily revision habits, and quiet on-campus study slots. Teachers offer additional support for students who need extra help, and enrichment for students who want to go deeper in particular subjects. Doubt-clearing sessions, after-school study clinics and one-on-one mentor check-ins are regular fixtures of the secondary school calendar.</p>

<h2>Assessment and Feedback</h2>
<p>Assessment in Class 9 and Class 10 follows the CBSE pattern — periodic tests, mid-term assessments, full-length pre-board examinations and the final board examination in Class 10. Each assessment is followed by detailed feedback, both written and verbal. Parents receive structured progress reports and are invited for parent-teacher meetings where teachers, mentors and counsellors share a complete picture of the child's academic and personal growth.</p>

<h2>Preparing Students for Senior Secondary</h2>
<p>From Class 9 onwards, students attend structured stream-selection sessions to help them think about Class 11 — Science, Commerce or Humanities — based on their aptitude, interests and career direction. Career awareness sessions, alumni interactions, college pathway briefings and one-on-one counselling help students and parents make a confident, informed stream choice rather than a rushed one in the weeks after the Class 10 results are declared.</p>

<h2>Beyond Academics</h2>
<p>Even in the board years, Rainbow students continue with sport, music, drama, dance, art, debate, MUN, robotics and community service. We believe that a strong board year is built on balance — academic focus combined with physical activity, creative expression, social connection and adequate rest. Leadership opportunities through the student council, house captaincy and event coordination help Class 9 and Class 10 students grow into well-rounded young adults.</p>

<h2>Hyperlocal Secondary Admissions in Thane</h2>

<h3>Class 9 admission near Hiranandani Estate</h3>
<p>Hiranandani Estate families looking for a CBSE secondary school in Thane choose Rainbow for the combination of board-year rigour, structured pastoral support and a quick five-minute drive to campus.</p>

<h3>Class 10 admission near Ghodbunder Road</h3>
<p>For Patlipada, Waghbil, Owale, Kavesar and Kolshet families along Ghodbunder Road, Class 10 transfer admissions are evaluated on a case-by-case basis subject to seat availability, CBSE transfer norms and a brief subject-readiness assessment.</p>

<h3>Class 10 admission near Brahmand Thane</h3>
<p>Brahmand Phase 1 to 4 families enjoy walking-distance access to the campus, which means students save commute time during the board year — extra time that can be used for study, revision, sport or rest.</p>

<h3>Secondary admissions near Manpada and Pokhran Road</h3>
<p>Class 9 admissions from Manpada, Pokhran Road and the Majiwada belt are supported by dedicated bus routes and a Saturday-morning campus tour slot for working parents.</p>

<h2>Frequently Asked Questions about Secondary School</h2>

<h3>Which board do Class 9 and Class 10 follow?</h3>
<p>Class 9 and Class 10 follow the CBSE curriculum, with the Class 10 board examination conducted as per CBSE schedule and pattern.</p>

<h3>How is board exam preparation structured?</h3>
<p>Through a year-long plan that includes structured study schedules, periodic tests, full pre-board examinations, doubt-clearing sessions and personalised feedback for every student.</p>

<h3>Do you offer Class 10 transfer admissions?</h3>
<p>Class 10 admissions are considered on a case-by-case basis subject to seat availability, CBSE transfer norms and a short subject-readiness assessment.</p>

<h3>What career and stream guidance is offered in Class 9 and Class 10?</h3>
<p>Students attend structured stream-selection sessions, career awareness workshops and one-on-one counselling so that the Class 11 stream choice — Science, Commerce or Humanities — is well informed.</p>

<h3>How do you handle exam stress and student wellbeing?</h3>
<p>Through pastoral support, mentor check-ins, counsellor sessions, balanced co-curricular activity and a strong focus on sleep, screen time and physical activity.</p>

<h3>What activities are available beyond academics?</h3>
<p>Sport, music, drama, dance, art, debate, MUN, robotics, leadership and community service — even in the board years.</p>

<h3>How do I apply for Class 9 or Class 10?</h3>
<p>Call +91 82915 68972 or use the enquiry form. Our admissions team will arrange a campus visit, the subject-readiness assessment and the next steps.</p>

<h3>How are practicals handled in Class 9 and Class 10?</h3>
<p>Practical sessions in Physics, Chemistry, Biology and Information Technology follow the CBSE-prescribed list of experiments. Students maintain a structured lab record, attempt practical examinations and viva voce, and learn the discipline of careful, accurate, safe lab work.</p>

<h3>Are coaching-style remedial sessions available?</h3>
<p>The school offers in-house remedial and enrichment sessions for students who need extra help or who want to go beyond the syllabus. These are run by Rainbow's own subject teachers, not external coaching providers.</p>

<h3>How does the school communicate with parents in the board year?</h3>
<p>Through structured progress reports after every assessment, parent-teacher meetings at planned intervals, mentor calls or emails when needed, and a clear official channel for any concern. Parents are kept informed of academic progress and wellbeing across the year.</p>

<h2>Daily Rhythm in the Secondary School</h2>
<p>A typical Class 9 or Class 10 day begins with morning assembly, a brief reflection and a short physical activity. Periods are scheduled to balance theory-heavy subjects with lab sessions, language work, sport, music and quiet study. Lunch is supervised, and the afternoon includes co-curricular activities, library hours or extra study slots based on the day. Homework is coordinated across subjects so that no single evening becomes overloaded, and the school encourages a healthy balance of study, rest, sleep and physical activity.</p>

<h2>Mentor and House System</h2>
<p>Every Class 9 and Class 10 student is part of a house and is paired with a faculty mentor. Mentors track academic progress, attendance, friendships and wellbeing, and act as the first point of contact for parents on any non-routine matter. Houses give students leadership opportunities — captaining a sport, leading a debate team, coordinating a community service drive — that build the kind of confidence which transcripts alone cannot capture.</p>

<h2>Transport and Daily Commute</h2>
<p>Secondary students typically use the school bus service. Buses are GPS-tracked, fitted with CCTV and a speed governor, and staffed with a trained female attendant. Routes cover Brahmand Phase 1 to 4, Hiranandani Estate, Manpada, Pokhran Road, Patlipada, Waghbil, Owale, Kavesar, Kolshet, Majiwada and Dhokali, with morning pick-up and afternoon drop carefully coordinated to the school timetable so that students arrive ready and reach home safely.</p>

<h2>Wellbeing in the Board Year</h2>
<p>The Class 10 board year can feel intense for students and families. Rainbow International School puts active effort into wellbeing — a structured study plan, healthy sleep advice, screen-time discipline, regular physical activity, counsellor support and short mindfulness sessions. We work with parents to keep the home environment supportive, and we discourage the unnecessary "always studying" pressure that often does more harm than good.</p>

<h2>Parent Decision Checklist</h2>
<p>If you are choosing a CBSE secondary school in Thane for Class 9 or Class 10, we encourage you to visit the campus, observe a classroom, see the science labs, talk to a subject teacher about board preparation, ask about pre-board strategy, check transport availability from your area and understand how the school supports students who need extra help. Rainbow International School welcomes these detailed conversations because a well-informed family choice is the strongest start to the board years.</p>

<p>Explore our <a href="/middle-school-section">Middle School</a>, our <a href="/senior-secondary-section">Senior Secondary section</a>, or <a href="/admissions">apply for the 2026–27 academic year</a>.</p>
</div>`;
}

function renderSeniorSecondary(): string {
  return `
<div class="section">
<h2>Senior Secondary School in Thane for Class 11 and Class 12</h2>
<p>The Senior Secondary School at Rainbow International School in Thane is where students take ownership of their future. Class 11 and Class 12 are the years when academic depth, board-exam readiness, career direction and personal identity all come together. Our CBSE Senior Secondary programme offers Science, Commerce and Humanities streams with carefully chosen subject combinations, structured board preparation, integrated competitive exam orientation, and dedicated career and college counselling. The Brahmand Phase 4 campus provides advanced Physics, Chemistry, Biology and Computer laboratories, a senior library, smart classrooms, quiet study zones and discussion spaces designed for senior learners.</p>

<h2>Why Students Choose Rainbow for Senior Secondary</h2>
<p>Students and parents from Brahmand, Hiranandani Estate, Ghodbunder Road, Manpada, Kavesar and Kolshet choose Rainbow International School for Class 11 and Class 12 because they want a CBSE senior secondary school in Thane that combines academic seriousness with personal mentoring. Our senior secondary faculty includes experienced subject specialists in Physics, Chemistry, Mathematics, Biology, Accountancy, Business Studies, Economics, English, History, Political Science and other CBSE-prescribed subjects. Each student is paired with a faculty mentor who tracks academic progress, attendance, wellbeing and career direction across the two-year journey.</p>

<h2>Class 11 and Class 12 Learning Journey</h2>

<h3>Class 11 — Building Subject Mastery</h3>
<p>Class 11 is the year when students transition from a wide Class 10 syllabus to a focused stream-based study. The first term is dedicated to building strong concept foundations, study habits, lab discipline and self-driven note-making. Periodic tests, mid-term and term-end examinations help students benchmark their progress, identify weak areas and plan revision.</p>

<h3>Class 12 — Board and Career Year</h3>
<p>Class 12 is the board year and the year of major career decisions. The academic calendar combines completion of the syllabus, multiple rounds of revision, full pre-board examinations, doubt-clearing sessions, board-exam strategy workshops and personalised feedback. Alongside the board preparation, students receive intensive career and higher-education counselling for Indian and international university pathways.</p>

<h2>Stream and Subject Guidance</h2>

<h3>Science Stream</h3>
<p>Subjects include English, Physics, Chemistry, Mathematics or Biology, with options such as Computer Science, Informatics Practices, Physical Education or another elective. The Science stream is designed for students preparing for engineering, medical, design, architecture, pure sciences, data analytics and emerging technology pathways.</p>

<h3>Commerce Stream</h3>
<p>Subjects include English, Accountancy, Business Studies, Economics, with options of Mathematics or Informatics Practices and additional electives such as Physical Education. The Commerce stream supports students aiming for chartered accountancy, finance, banking, business management, economics, law, entrepreneurship and related fields.</p>

<h3>Humanities Stream</h3>
<p>Subjects include English, History, Political Science, Economics or Psychology, with additional options such as Physical Education or Sociology depending on availability. The Humanities stream is ideal for students drawn to law, journalism, design, public policy, civil services, psychology, social sciences, literature and the liberal arts.</p>

<h2>Board Exam Preparation</h2>
<p>Our CBSE Class 12 board preparation in Thane is structured around clear weekly milestones, regular formative assessments, full-syllabus pre-board examinations and structured revision cycles. Students learn how to read complex questions, structure answers within the prescribed word limits, manage time in the examination hall and avoid common board-exam mistakes. Subject teachers offer detailed paper-by-paper feedback so that students can improve quickly between mocks.</p>

<h2>Career and Higher Education Readiness</h2>
<p>Senior secondary students receive structured career counselling, aptitude assessments and pathway guidance for Indian universities, central university admissions through CUET, professional courses, design schools, law schools and international undergraduate options. We orient students to common competitive exams — JEE, NEET, CUET, CLAT, NIFT, NID, NATA and others — and help them plan their preparation alongside the school timetable. College application support, recommendation letters, statement of purpose feedback and interview preparation are part of the Class 12 calendar.</p>

<h2>Student Leadership and Confidence</h2>
<p>Class 11 and Class 12 students lead the school's student council, house events, MUN delegations, inter-school competitions, science exhibitions and community service initiatives. Mentoring junior students, organising events and representing the school in external forums help them build the confidence, communication and leadership skills that universities and employers value.</p>

<h2>Assessment and Academic Tracking</h2>
<p>Senior secondary assessment includes periodic class tests, unit assessments, mid-term examinations, full pre-board examinations, practical assessments and the final CBSE Class 12 board examination. Each assessment is followed by detailed analysis — both subject-wise and skill-wise — and discussed with students and parents. Mentor check-ins ensure that academic, emotional and career-readiness conversations happen continuously, not just at the end of the year.</p>

<h2>Hyperlocal Senior Secondary Admissions in Thane</h2>

<h3>Class 11 admission near Hiranandani Estate</h3>
<p>Hiranandani Estate families seeking a CBSE Class 11 admission in Thane often choose Rainbow for the combination of strong stream options, structured board-year planning, career counselling and a five-minute campus commute.</p>

<h3>Class 12 admission near Ghodbunder Road</h3>
<p>Class 12 admissions for students relocating along Ghodbunder Road — Patlipada, Waghbil, Owale, Kavesar and Kolshet — are considered case-by-case, subject to subject availability and CBSE transfer norms.</p>

<h3>Class 12 admission near Brahmand Thane</h3>
<p>Brahmand Phase 1 to 4 families benefit from walking-distance access to the campus, which is especially valuable in the demanding Class 12 board year when commute time matters.</p>

<h3>Class 11 Science, Commerce and Humanities admissions in Thane</h3>
<p>Stream-specific admissions for Class 11 Science, Class 11 Commerce and Class 11 Humanities open every year after Class 10 board results, with stream-selection counselling offered to all applicants and confirmed students.</p>

<h2>Frequently Asked Questions about Senior Secondary</h2>

<h3>Which streams are offered for Class 11 and Class 12?</h3>
<p>Science, Commerce and Humanities, with CBSE-aligned subject combinations and selected electives.</p>

<h3>How is Class 12 board preparation structured?</h3>
<p>Through a year-long plan with periodic tests, full pre-board examinations, structured revision cycles, doubt-clearing sessions and personalised mentor feedback.</p>

<h3>Do you offer support for JEE, NEET, CUET and other competitive exams?</h3>
<p>The school orients students to competitive exam patterns, integrates concept clarity, exam-style practice and time-management skills into senior secondary teaching, and works alongside students preparing for JEE, NEET, CUET, CLAT and similar examinations.</p>

<h3>What kind of career counselling is offered?</h3>
<p>Aptitude assessments, one-on-one career conversations, university pathway briefings, application support and interview preparation across Indian and international undergraduate routes.</p>

<h3>Are Class 12 transfer admissions available?</h3>
<p>Class 12 admissions are considered on a case-by-case basis subject to CBSE transfer guidelines, subject availability and the student's previous record.</p>

<h3>How is student wellbeing handled in the board year?</h3>
<p>Through dedicated mentors, counsellor support, balanced co-curricular activity and structured advice on sleep, study load, screen time and stress management.</p>

<h3>How do I apply for Class 11 or Class 12?</h3>
<p>Call +91 82915 68972 or fill the enquiry form. Our senior secondary admissions team will arrange a campus visit, stream counselling and the next steps.</p>

<h3>How are practicals handled in Class 11 and Class 12?</h3>
<p>Practicals in Physics, Chemistry, Biology, Computer Science, Informatics Practices and other lab-based subjects follow the CBSE-prescribed format. Students maintain detailed lab records, complete project work, attempt practical examinations and viva voce as per the board pattern.</p>

<h3>What kind of mentor support do senior students receive?</h3>
<p>Each student is paired with a faculty mentor who tracks academic performance, attendance, wellbeing and career direction. Mentors are the first point of contact for parents on any non-routine matter and coordinate doubt-clearing or counselling support when needed.</p>

<h3>Are project work and internships part of the senior secondary experience?</h3>
<p>Project work is integral to the CBSE Class 11 and Class 12 curriculum. Where appropriate, the school encourages students to take up short internships, volunteering opportunities, research projects and community service initiatives that strengthen their college and career readiness.</p>

<h2>Daily Rhythm in the Senior Secondary School</h2>
<p>A typical Class 11 or Class 12 day begins with assembly, reflection and a short physical activity. Periods are scheduled to balance lecture-heavy subjects, lab sessions, focused problem-solving slots and quiet study time. Lunch is supervised, and the afternoon may include doubt-clearing sessions, library research, club work or sport. Homework, project work and revision are coordinated across subjects to keep the load balanced. Students learn to manage their own timetable, prioritise tasks and take ownership of their preparation.</p>

<h2>Career and University Readiness</h2>
<p>Career readiness in Class 11 and Class 12 includes structured guidance for Indian university applications, central university admissions through CUET, professional courses such as engineering, medical, law, design, architecture, chartered accountancy and management, as well as international undergraduate applications. Students receive support with personal essays, statements of purpose, recommendation letters, interview preparation and standardised test orientation. The school maintains an updated awareness of evolving university expectations so that students are guided with current, accurate information.</p>

<h2>Wellbeing in the Senior Secondary Years</h2>
<p>The senior secondary years can feel demanding. Rainbow International School pays active attention to student wellbeing through balanced timetables, mentor check-ins, counsellor support, physical activity and a clear focus on healthy sleep, nutrition and screen-time discipline. We work with parents to keep the home environment supportive and to avoid the kind of unbroken pressure that affects both performance and confidence.</p>

<h2>Transport and Daily Commute</h2>
<p>Senior secondary students typically use the school bus service. Buses are GPS-tracked, fitted with CCTV and a speed governor, and staffed with a trained female attendant. Routes cover Brahmand Phase 1 to 4, Hiranandani Estate, Manpada, Pokhran Road, Patlipada, Waghbil, Owale, Kavesar, Kolshet, Majiwada and Dhokali. Some Class 11 and Class 12 students choose to use family transport in the board year so they can manage personalised study schedules, and the campus parking and pick-up zones support both options safely.</p>

<h2>Why Senior Secondary Matters</h2>
<p>Class 11 and Class 12 are the years that translate a decade of schooling into a future direction. The choices students make about subjects, study habits, mentoring relationships and competitive exam preparation in these two years shape the kind of universities they reach, the careers they build and the confidence they carry into adult life. Rainbow International School treats this stage with the seriousness it deserves, while protecting the warmth, balance and personal mentoring that have defined the rest of the school journey.</p>

<h2>Parent and Student Decision Checklist</h2>
<p>If you are choosing a CBSE senior secondary school in Thane for Class 11 or Class 12, we encourage you to visit the campus, talk to subject teachers in your stream of interest, see the labs, understand the pre-board and board preparation plan, ask about career counselling and university support, and discuss any specific aspirations or concerns. Rainbow International School welcomes these detailed conversations because the right fit between the student, the family and the school makes the senior secondary years truly transformative.</p>

<p>Explore our <a href="/secondary-section">Secondary section</a>, learn more about <a href="/admissions">2026–27 admissions</a>, or call us at <strong>+91 82915 68972</strong>.</p>
</div>`;
}

function renderContact(): string {
  return `
<div class="section">
<h2>Contact Rainbow International School</h2>
<p>We would love to hear from you. Whether you have questions about admissions, want to schedule a campus visit, or need any other information, our team is here to help.</p>

<h2>Contact Details</h2>
<ul>
<li><strong>Address:</strong> Cosmos Arcade, Brahmand Phase 4, Thane, Maharashtra 400607, India</li>
<li><strong>Phone:</strong> +91 82915 68972</li>
<li><strong>Landline:</strong> (022) 69105000</li>
<li><strong>Email:</strong> info@rainbowinternationalschool.in</li>
<li><strong>Working Hours:</strong> Monday – Saturday, 9:00 AM – 6:00 PM</li>
</ul>

<h2>Visit Our Campus</h2>
<p>Rainbow International School is located on a 3.5-acre campus in Brahmand Phase 4, Thane. The campus is easily accessible from Ghodbunder Road, Manpada, Hiranandani Estate, and all parts of Thane.</p>

<h2>Admissions Enquiry</h2>
<p>For admissions-related queries, call +91 82915 68972 or fill the enquiry form on our website. <a href="/admissions">View admissions details</a> or <a href="/schedule-appointment">schedule a campus visit</a>.</p>
</div>`;
}

function renderAmenities(): string {
  return `
<div class="section">
<h2>Amenities & Facilities</h2>
<p>Rainbow International School's 3.5-acre campus in Thane is equipped with world-class facilities designed to support academic excellence, physical fitness, creative expression, and overall child development.</p>

<h2>Academic Facilities</h2>
<ul>
<li><strong>Smart Classrooms:</strong> Interactive whiteboards and digital learning tools in every classroom</li>
<li><strong>Science Labs:</strong> Fully equipped Physics, Chemistry, and Biology laboratories</li>
<li><strong>Computer Lab:</strong> Modern systems with high-speed internet</li>
<li><strong>Library:</strong> 10,000+ books, reference materials, and digital resources</li>
<li><strong>Robotics & STEM Lab:</strong> Hands-on engineering and coding facilities</li>
</ul>

<h2>Sports & Recreation</h2>
<ul>
<li><strong>Swimming Pool:</strong> Temperature-controlled pool with trained coaches</li>
<li><strong>Skating Rink:</strong> Professional skating area for all age groups</li>
<li><strong>Sports Fields:</strong> Football, cricket, basketball, and athletics grounds</li>
<li><strong>Indoor Games:</strong> Table tennis, chess, carrom facilities</li>
</ul>

<h2>Creative & Performing Arts</h2>
<ul>
<li><strong>Amphitheatre:</strong> 500-seat open-air venue for performances and events</li>
<li><strong>Art Studio:</strong> Dedicated space for visual arts, pottery, and crafts</li>
<li><strong>Music Room:</strong> Instruments and vocal training facilities</li>
<li><strong>Dance Studio:</strong> Mirrored studio for classical and contemporary dance</li>
</ul>

<h2>Health & Wellness</h2>
<ul>
<li><strong>Infirmary:</strong> Full-time nurse and visiting paediatrician</li>
<li><strong>Ambulance:</strong> Equipped ambulance on standby</li>
<li><strong>Organic Farm:</strong> Students learn sustainable farming practices</li>
<li><strong>Cafeteria:</strong> Nutritious meals with hygienic preparation</li>
</ul>

<p>Take a virtual tour — visit our <a href="/photo-gallery">Photo Gallery</a> or <a href="/schedule-appointment">schedule a campus visit</a>.</p>
</div>`;
}

function renderAwards(): string {
  return `
<div class="section">
<h2>Awards & Achievements</h2>
<p>Rainbow International School has been consistently recognised as one of the top schools in Thane and Maharashtra. Our awards reflect our commitment to academic excellence, innovation in teaching, safety, and holistic student development.</p>

<h2>Key Recognitions</h2>
<ul>
<li><strong>Best School in Thane</strong> — Multiple years running (Education Today, Brainfeed Magazine)</li>
<li><strong>British Council International School Award (ISA)</strong> — Recognised for international dimension in teaching</li>
<li><strong>Google for Education Partner School</strong> — Certified for digital learning excellence</li>
<li><strong>Meta for Education Partner</strong> — Innovation in technology-enhanced learning</li>
<li><strong>Fit India School Certificate</strong> — Ministry of Youth Affairs & Sports recognition</li>
<li><strong>15th World Education Summit</strong> — Featured for educational leadership</li>
<li><strong>Knowledge Review Magazine</strong> — Rainbow Preschools featured as top early learning centres</li>
</ul>

<h2>Academic Results</h2>
<p>Our first batch (2018–19) achieved a 100% pass rate in CBSE Class 10 Board Exams. Since then, students have consistently scored above 95%, with toppers achieving near-perfect scores across subjects.</p>

<h2>Student Achievements</h2>
<p>Rainbow students excel in inter-school and national-level competitions in academics, sports, arts, robotics, MUN, and science exhibitions. View our <a href="/student-achievements">Student Achievements</a> page for detailed highlights.</p>
</div>`;
}

function renderSafety(): string {
  return `
<div class="section">
<h2>Safety & Security</h2>
<p>At Rainbow International School, student safety is our highest priority. We have implemented comprehensive, multi-layered safety systems that cover physical security, health, transport, and digital safety — ensuring complete peace of mind for parents.</p>

<h2>Campus Security</h2>
<ul>
<li><strong>200+ CCTV Cameras:</strong> Continuous monitoring of all campus areas including classrooms, corridors, gates, and play areas</li>
<li><strong>Card-Based Entry:</strong> Electronic access control at all entry points</li>
<li><strong>Trained Security Personnel:</strong> Professional security team on duty 24/7</li>
<li><strong>Metal Detectors:</strong> Screening at campus entry points</li>
<li><strong>Visitor Management System:</strong> Digital check-in/check-out for all visitors</li>
<li><strong>Boundary Wall & Fencing:</strong> Fully secured perimeter</li>
</ul>

<h2>Health & Medical</h2>
<ul>
<li><strong>On-Campus Infirmary:</strong> Full-time nurse and first-aid facilities</li>
<li><strong>Visiting Paediatrician:</strong> Regular health check-ups for all students</li>
<li><strong>Equipped Ambulance:</strong> On standby for emergencies</li>
<li><strong>First Aid Training:</strong> Staff trained in emergency first aid and CPR</li>
</ul>

<h2>Transport Safety</h2>
<ul>
<li><strong>GPS-Tracked Buses:</strong> Real-time tracking on 30+ routes</li>
<li><strong>Trained Attendants:</strong> Female attendant on every bus</li>
<li><strong>CCTV in Buses:</strong> Video monitoring inside every school bus</li>
<li><strong>Speed Governors:</strong> Speed limiters fitted on all vehicles</li>
</ul>

<h2>Child Protection</h2>
<ul>
<li><strong>100% Female Staff for Pre-Primary:</strong> Dedicated female educators and caregivers in the preschool wing</li>
<li><strong>Self-Defence Training:</strong> Regular sessions for all students</li>
<li><strong>Anti-Bullying Policy:</strong> Zero-tolerance approach with counsellor support</li>
<li><strong>Fire Safety:</strong> Fire extinguishers, drills, and evacuation training</li>
</ul>

<p>Visit <a href="/amenities">our facilities</a> or <a href="/contact-us">contact us</a> to learn more about our safety protocols.</p>
</div>`;
}

function renderAdmissions(): string {
  return `
<div class="section">
<h2>Admissions Open 2026–27 at Rainbow International School, Thane</h2>
<p>Admissions are now open at Rainbow International School, a CBSE school in Thane, for the 2026–27 academic year. We are accepting applications across all grades — Nursery, Junior KG, Senior KG, Class 1 through Class 8, Class 9, Class 10, Class 11 (Science, Commerce and Humanities) and Class 12. Whether you are looking for a Nursery seat near Hiranandani Estate, a Class 1 admission near Brahmand Phase 4, a Class 6 transfer from another school in Thane, or a Class 11 stream change after Class 10 results, our admissions team will guide you through every step with clarity and care.</p>
<p>Rainbow International School has been part of the Thane parent community since 2009. Over the years, more than 3,000 students from Brahmand, Manpada, Pokhran Road, Dhokali, Hiranandani Estate, Patlipada, Waghbil, Kavesar, Owale, Kolshet and surrounding neighbourhoods have called this 3.5-acre campus their school home. The 2026–27 admission cycle continues that tradition, offering a CBSE-aligned, future-ready learning environment from Nursery to Class 12 under one roof.</p>

<h2>Admission Process Overview</h2>
<p>Our admission process is designed to be simple, transparent and parent-friendly. We do not believe in entrance hurdles for young learners. Instead, we focus on getting to know each child and family so we can welcome them into the right grade with the right support from day one.</p>
<ol>
<li><strong>Step 1 — Enquiry & Campus Visit:</strong> Begin with a phone enquiry on +91 82915 68972 or fill the online enquiry form. Our admissions counsellor will share the prospectus and help you book a campus visit at a time that suits your family.</li>
<li><strong>Step 2 — Submit the Application Form:</strong> Complete the application form online or on campus, providing your child's grade, date of birth, current school details and parent contact information.</li>
<li><strong>Step 3 — Interaction Session:</strong> A friendly, age-appropriate interaction with our academic team helps us understand your child's strengths, interests and learning style. For Class 9 and above, a written subject-readiness assessment is included.</li>
<li><strong>Step 4 — Document Verification:</strong> Submit the original birth certificate, Aadhaar, Transfer Certificate (where applicable) and the last two years of report cards or progress reports.</li>
<li><strong>Step 5 — Confirmation & Onboarding:</strong> Once the seat is offered, complete the fee formalities and receive your welcome kit, uniform list, transport route confirmation and class teacher introduction before the academic year begins.</li>
</ol>

<h2>Grade-wise Admissions — Nursery to Class 12</h2>

<h3>Nursery, Junior KG and Senior KG Admissions in Thane</h3>
<p>Pre-Primary admissions are typically the most sought-after seats every year. We offer Nursery, Junior KG and Senior KG admissions for children aged 2.5 years and above as on 31st March 2026. The Pre-Primary wing operates with a 100% female teaching team, dedicated nap and play zones, age-appropriate furniture, and a play-based curriculum that gently builds early language, numeracy, motor and social skills.</p>

<h3>Class 1 to Class 5 Admissions in Thane</h3>
<p>Primary admissions for Class 1, Class 2, Class 3, Class 4 and Class 5 are open for 2026–27. The primary years build strong literacy, numeracy and inquiry foundations through experiential learning, daily reading, mental maths, EVS investigations, art, music, sports and computer literacy. New entrants from other Thane schools are supported with a friendly orientation week and a bridge-learning plan where needed.</p>

<h3>Class 6 to Class 8 Admissions in Thane</h3>
<p>Class 6, Class 7 and Class 8 admissions welcome students moving from another school or progressing from our own primary section. The middle school curriculum deepens subject knowledge in English, Hindi, Mathematics, Science, Social Science and a third language (Sanskrit or French), with strong emphasis on study skills, project work and confidence building.</p>

<h3>Class 9 and Class 10 Admissions in Thane</h3>
<p>Class 9 admissions and limited Class 10 admissions are available for the 2026–27 session. Students appear for a brief written assessment in core subjects to help us plan academic support. Once admitted, students follow a structured CBSE Class 10 board preparation programme that includes regular tests, doubt-clearing classes and exam strategy workshops.</p>

<h3>Class 11 and Class 12 Admissions in Thane</h3>
<p>Senior Secondary admissions for Class 11 are open across Science, Commerce and Humanities streams. Class 12 admissions are considered on a case-by-case basis subject to subject availability and CBSE transfer norms. Stream selection counselling is offered to every Class 10 student so that the choice is based on aptitude and aspiration, not pressure.</p>

<h2>Documents Required</h2>
<ul>
<li>Birth certificate (original and one photocopy)</li>
<li>Aadhaar card of the child and at least one parent</li>
<li>Transfer Certificate from the previous school (mandatory for Class 1 onwards if joining mid-stream)</li>
<li>Report cards or progress reports of the last two academic years</li>
<li>Four recent passport-size photographs of the child</li>
<li>Address proof — passport, electricity bill, rent agreement or Aadhaar with current address</li>
<li>Medical fitness certificate including immunisation record</li>
<li>For Class 11 admissions, the Class 10 mark sheet is required at the time of confirmation</li>
</ul>

<h2>Age Criteria for 2026–27</h2>
<ul>
<li><strong>Nursery:</strong> 2.5 years as on 31st March 2026</li>
<li><strong>Junior KG:</strong> 3.5 years as on 31st March 2026</li>
<li><strong>Senior KG:</strong> 4.5 years as on 31st March 2026</li>
<li><strong>Class 1:</strong> 6 years as on 31st March 2026</li>
<li><strong>Class 2 to Class 8:</strong> Age-appropriate progression as per CBSE norms</li>
<li><strong>Class 9 and Class 10:</strong> Subject to written assessment and seat availability</li>
<li><strong>Class 11:</strong> Based on Class 10 board results and stream preference</li>
</ul>

<h2>Why a Campus Visit Matters</h2>
<p>Choosing a school is one of the most important decisions a family makes. We strongly encourage every parent to visit the Rainbow International School campus before confirming admission. A campus visit lets you see our 3.5-acre Brahmand Phase 4 facility in person — the smart classrooms, science and computer labs, library, swimming pool, skating rink, sports grounds, amphitheatre, organic farm, infirmary and cafeteria. You will also meet members of our academic team, see students at work, and get a feel for the warmth and energy of the school community.</p>
<p>Campus visits can be scheduled on weekdays between 9:30 AM and 4:30 PM and on Saturdays between 9:30 AM and 1:00 PM. Walk-ins are welcome but a prior appointment ensures dedicated time with our admissions counsellor.</p>

<h2>Parent Counselling and Support</h2>
<p>We understand that every family has unique questions — about curriculum, fees, transport, special learning needs, language transitions, sports, extracurriculars or stream choices. Our admissions team and academic coordinators are available to answer these questions in detail, in person or over a phone call. For families relocating to Thane from another city or country, we offer relocation support, settling-in advice and a buddy system in the classroom to help your child feel at home quickly.</p>

<h2>Transport and Location Support</h2>
<p>Rainbow International School operates a fleet of GPS-tracked, CCTV-equipped buses across more than 30 routes covering Brahmand Phase 1 to 4, Hiranandani Estate, Manpada, Pokhran Road, Dhokali, Patlipada, Waghbil, Kavesar, Owale, Kolshet, Majiwada and other Thane neighbourhoods. Each bus has a trained female attendant, a speed governor and a real-time tracking system that parents can access during pick-up and drop windows. Route confirmation is part of the admission onboarding process.</p>

<h2>Hyperlocal Admissions — Find a Seat Near You</h2>
<p>Many of our families come from neighbourhoods within a 15-minute commute. If you are searching for "school admission near me" in Thane, here is how Rainbow International School fits into your locality.</p>

<h3>Admissions near Brahmand Thane</h3>
<p>Brahmand Phase 1 to Phase 4 families enjoy walking-distance access to the campus. Nursery, Class 1, Class 5, Class 8 and Class 11 admissions from Brahmand are particularly common because parents value the short, safe daily commute for their children.</p>

<h3>Admissions near Hiranandani Estate</h3>
<p>Hiranandani Estate is just a five-minute drive from campus. We see strong demand for Nursery admissions, Class 1 admissions and Class 6 admissions from Hiranandani Estate families looking for a CBSE option close to home.</p>

<h3>Admissions near Ghodbunder Road</h3>
<p>Families along the Ghodbunder Road corridor — Patlipada, Waghbil, Kavesar, Owale and Kolshet — are served by dedicated bus routes. Class 1 admission near Ghodbunder Road and Class 11 stream admissions are popular every year.</p>

<h3>Admissions near Manpada and Pokhran Road</h3>
<p>Manpada Junction is a five-minute drive from the campus. Pre-Primary, Primary and Senior Secondary admissions from Manpada and the Pokhran Road area benefit from our morning and afternoon shuttle slots.</p>

<h3>Admissions near Kavesar and Kolshet</h3>
<p>Kavesar and Kolshet families typically choose Rainbow for the combination of CBSE curriculum, K-12 continuity and reliable transport. Class 5, Class 8 and Class 9 transfer admissions from these neighbourhoods are common.</p>

<h2>Frequently Asked Questions about Admissions</h2>

<h3>When do admissions open for 2026–27?</h3>
<p>Admissions for the 2026–27 academic year are open now. Pre-Primary and Class 1 seats fill the fastest, so we recommend submitting your enquiry as early as possible.</p>

<h3>Is there an entrance test for Nursery or Class 1?</h3>
<p>No. There is no formal entrance test for Pre-Primary or Class 1. Instead, we hold a friendly interaction with the child and parents to understand readiness and family expectations.</p>

<h3>Do you accept mid-year transfers?</h3>
<p>Mid-year transfers are considered on a case-by-case basis, subject to seat availability in the relevant grade and CBSE transfer guidelines.</p>

<h3>How do I book a campus visit?</h3>
<p>Call +91 82915 68972 or use the enquiry form on the website. Our admissions team will confirm a slot within working hours.</p>

<h3>Are sibling concessions available?</h3>
<p>Yes, sibling concessions are offered. Details are shared during the admission interaction.</p>

<h3>What is the medium of instruction?</h3>
<p>The medium of instruction is English, with Hindi and Marathi taught as second and third languages as per CBSE norms. French and Sanskrit are offered as third-language options in middle school.</p>

<h3>Do you provide transport from my area?</h3>
<p>We operate routes across Brahmand, Hiranandani Estate, Manpada, Pokhran Road, Dhokali, Patlipada, Waghbil, Kavesar, Owale, Kolshet, Majiwada and surrounding areas. Confirm your route during the admission visit.</p>

<h3>How do I begin the admission process?</h3>
<p>Call +91 82915 68972, write to info@rainbowinternationalschool.in, or use the application form on this page. We will guide you through enquiry, campus visit, interaction and confirmation.</p>

<p>Ready to begin? <a href="/application-form">Start your 2026–27 application</a> or call us at <strong>+91 82915 68972</strong>. You can also explore our <a href="/primary-section">Primary</a>, <a href="/middle-school-section">Middle</a>, <a href="/secondary-section">Secondary</a> and <a href="/senior-secondary-section">Senior Secondary</a> sections.</p>
</div>`;
}

function renderFees(): string {
  return `
<div class="section">
<h2>Fee Structure</h2>
<p>Rainbow International School offers comprehensive, value-driven education from Nursery to Class 12 at competitive fee levels. Our fee structure covers tuition, access to world-class facilities, and a wide range of co-curricular activities.</p>

<h2>Fee Categories</h2>
<ul>
<li><strong>Pre-Primary (Nursery, Jr KG, Sr KG):</strong> Includes activity kits and learning materials</li>
<li><strong>Primary (Class 1–5):</strong> Includes lab access and library</li>
<li><strong>Middle School (Class 6–8):</strong> Includes all lab sessions and project materials</li>
<li><strong>Secondary (Class 9–10):</strong> Includes CBSE board exam preparation</li>
<li><strong>Senior Secondary (Class 11–12):</strong> Science, Commerce, and Humanities streams</li>
</ul>

<h2>What's Included</h2>
<ul>
<li>All classroom instruction, lab sessions, library access</li>
<li>Digital learning resources and smart classroom access</li>
<li>Core extracurricular activities</li>
<li>Safety and security infrastructure</li>
<li>On-campus health services (infirmary, nurse)</li>
</ul>

<h2>Payment</h2>
<p>Fees are payable in quarterly instalments via online bank transfer, UPI, or demand draft. Sibling concessions are available. The exact fee schedule is shared during the admission interaction.</p>

<p>Contact <strong>+91 82915 68972</strong> for the complete fee breakdown or <a href="/admissions">start the admission process</a>.</p>
</div>`;
}

function renderLocalityBrahmand(): string {
  return `
<div class="section">
<h2>Best School Near Brahmand, Thane</h2>
<p>Rainbow International School is located right inside Brahmand Phase 4 at Cosmos Arcade — making it the closest premium K–12 CBSE school for families across Brahmand Phase 1 through 4, Hiranandani Estate, and surrounding areas.</p>

<h2>Location Advantage</h2>
<ul>
<li><strong>Brahmand Phase 1–4:</strong> 2–5 min walk</li>
<li><strong>Cosmos Arcade / Brahmand Market:</strong> 3 min walk</li>
<li><strong>Hiranandani Estate:</strong> 5 min drive</li>
<li><strong>Manpada Junction:</strong> 5 min drive</li>
<li><strong>Ghodbunder Road:</strong> 8 min drive</li>
<li><strong>Viviana Mall:</strong> 10 min drive</li>
</ul>

<h2>Why Brahmand Families Choose Rainbow</h2>
<ul>
<li>Walking distance — no long commutes for young children</li>
<li>K–12 under one roof (Nursery to Class 12, CBSE)</li>
<li>3.5-acre campus with world-class facilities</li>
<li>200+ CCTV cameras, on-campus nurse, GPS-tracked buses</li>
<li>3,000+ students — largest school community in Brahmand</li>
<li>Multiple 'Best School in Thane' awards</li>
</ul>

<p>Schedule a campus visit — call <strong>+91 82915 68972</strong> or <a href="/admissions">apply online</a>.</p>
</div>`;
}

function renderLocalityGhodbunder(): string {
  return `
<div class="section">
<h2>Best School Near Ghodbunder Road, Thane</h2>
<p>Rainbow International School at Brahmand Phase 4 is the top-rated CBSE K–12 school serving the entire Ghodbunder Road corridor — from Patlipada and Waghbil to Kavesar, Owale, and Kolshet. Just 8 minutes from the main GB Road junction.</p>

<h2>Distance from GB Road Areas</h2>
<ul>
<li><strong>Ghodbunder Road (main junction):</strong> 8 min drive</li>
<li><strong>Patlipada:</strong> 10 min drive</li>
<li><strong>Waghbil / Kavesar:</strong> 12 min drive</li>
<li><strong>Kolshet Road:</strong> 15 min drive</li>
<li><strong>Owale / Dosti Vihar:</strong> 12 min drive</li>
<li><strong>Hiranandani Estate:</strong> 5 min drive</li>
</ul>

<h2>Why GB Road Families Choose Rainbow</h2>
<ul>
<li>Dedicated bus routes covering the entire GB Road corridor</li>
<li>Complete K–12 CBSE school (Nursery to Class 12)</li>
<li>3.5-acre campus with swimming pool, skating rink, labs, amphitheatre</li>
<li>Award-winning school — British Council ISA, Google & Meta partnerships</li>
<li>3,000+ students, rated 4.8/5 by parents</li>
<li>GPS-tracked transport with trained attendants</li>
</ul>

<p>Contact us at <strong>+91 82915 68972</strong> or <a href="/admissions">apply for 2026–27</a>.</p>
</div>`;
}

function renderLocalityManpada(): string {
  return `
<div class="section">
<h2>Best School Near Manpada, Thane</h2>
<p>Rainbow International School is located just 5 minutes from Manpada Junction at Brahmand Phase 4 — the highest-rated CBSE K–12 school serving the Manpada, Pokhran Road, and Majiwada corridor.</p>

<h2>Distance from Nearby Areas</h2>
<ul>
<li><strong>Manpada Junction:</strong> 5 min drive</li>
<li><strong>Pokhran Road No. 2:</strong> 7 min drive</li>
<li><strong>Majiwada Junction:</strong> 10 min drive</li>
<li><strong>Dhokali:</strong> 12 min drive</li>
<li><strong>Brahmand (all phases):</strong> 2–5 min</li>
<li><strong>Hiranandani Estate:</strong> 5 min drive</li>
</ul>

<h2>Why Manpada Families Choose Rainbow</h2>
<ul>
<li>5 minutes from Manpada — convenient daily commute</li>
<li>Nursery to Class 12 CBSE with Science, Commerce, and Humanities</li>
<li>3.5-acre campus with smart classrooms, labs, pool, rink, amphitheatre</li>
<li>Award-winning school — Best School in Thane multiple years</li>
<li>Dedicated bus routes covering Manpada, Pokhran Road, Majiwada</li>
<li>200+ CCTV cameras, on-campus infirmary, GPS-tracked buses</li>
</ul>

<p>Contact us at <strong>+91 82915 68972</strong> or <a href="/admissions">start the admission process</a>.</p>
</div>`;
}

const SCHOOL_LD = {
  "@context": "https://schema.org",
  "@type": ["EducationalOrganization", "School"],
  name: "Rainbow International School",
  url: "https://rainbowinternationalschool.in/",
  address: { "@type": "PostalAddress", streetAddress: "Cosmos Arcade, Brahmand Phase 4", addressLocality: "Thane", addressRegion: "Maharashtra", postalCode: "400607", addressCountry: "IN" },
  telephone: "+91-82915-68972",
  foundingDate: "2009-04-01",
  numberOfStudents: "3000",
  sameAs: [
    "https://maps.app.goo.gl/mfJjMMkksCkcXzMCA",
    "https://www.facebook.com/RainbowInternationalSchoolThane/",
    "https://www.instagram.com/rainbowinternationalschool/",
    "https://www.youtube.com/@RainbowInternationalSchool",
  ],
};

function renderCareer(): string {
  const jobs = [
    { title: "PRT – Primary Teacher", type: "Full-time", department: "Primary Section", exp: "1–3 years" },
    { title: "TGT – Trained Graduate Teacher (Maths / Science)", type: "Full-time", department: "Middle Section", exp: "2–5 years" },
    { title: "PGT – Post Graduate Teacher (Physics / Chemistry / Maths)", type: "Full-time", department: "Senior Secondary", exp: "3+ years" },
    { title: "Counsellor", type: "Full-time", department: "Student Welfare", exp: "2+ years" },
    { title: "Sports Coach (Multi-sport)", type: "Full-time", department: "Sports Department", exp: "2+ years" },
    { title: "Librarian", type: "Full-time", department: "Library", exp: "1+ year" },
  ];
  const benefits = [
    { title: "Professional Growth", desc: "Regular training, workshops, and career development opportunities." },
    { title: "Collaborative Culture", desc: "Work with a dedicated team passionate about student development." },
    { title: "Student-Centric", desc: "A fulfilling role where your work directly impacts young lives." },
    { title: "Competitive Compensation", desc: "Attractive salary packages commensurate with experience." },
  ];
  return `
<div class="section">
<h2>Why Work at Rainbow International School?</h2>
<p>Rainbow International School is one of Thane's leading CBSE-affiliated K–12 schools, with over 3,000 students, a 3.5-acre campus, and 17 years of educational excellence. We believe great schools are built by great educators.</p>

${benefits.map(b => `<div class="card"><h3>${e(b.title)}</h3><p>${e(b.desc)}</p></div>`).join("")}

<h2>Current Openings</h2>
<p>We are currently hiring passionate educators and support staff for the following positions:</p>

${jobs.map(j => `<div class="card">
<h3>${e(j.title)}</h3>
<p><strong>Type:</strong> ${e(j.type)} · <strong>Department:</strong> ${e(j.department)} · <strong>Experience:</strong> ${e(j.exp)}</p>
</div>`).join("")}

<h2>How to Apply</h2>
<p>Send your CV and a brief cover letter to <a href="mailto:hr.recruiter3@rainbowinternationalschool.in">hr.recruiter3@rainbowinternationalschool.in</a>. Our HR team will contact shortlisted candidates within 3–5 working days.</p>

<p>Learn more about our school at <a href="/about-rainbow-international-school">About Rainbow International School</a>.</p>
</div>`;
}

function renderBeyondClassroom(): string {
  const activities = [
    { title: "School Exhibitions", desc: "Annual science, art, and heritage exhibitions where students showcase their projects and skills to parents and the wider community." },
    { title: "Club Activities", desc: "Health & Wellness Club, Interact Club, Culinary Club, Literary Club, Heritage Club, Science & Maths Club, Eco Club, and Cultural Club — something for every interest." },
    { title: "Educational Tours", desc: "Curated day trips and overnight educational tours that bring curriculum to life through real-world experiences across Maharashtra and beyond." },
    { title: "Organic Farming", desc: "A unique on-campus organic farm where students learn sustainability, responsibility, and the joy of growing their own produce." },
  ];
  return `
<div class="section">
<h2>Learning Beyond the Classroom</h2>
<p>At Rainbow International School, we believe real education extends far beyond textbooks and classrooms. Our comprehensive co-curricular programme is designed to meet the social, physical, and cultural needs of every student, nurturing well-rounded individuals ready for the world.</p>

${activities.map(a => `<div class="card"><h3>${e(a.title)}</h3><p>${e(a.desc)}</p></div>`).join("")}

<h2>Our Clubs</h2>
<ul>
<li><strong>Health &amp; Wellness Club</strong> – Promotes physical fitness, mental well-being, and healthy habits.</li>
<li><strong>Interact Club</strong> – Rotary-affiliated, fostering leadership and community service.</li>
<li><strong>Culinary Club</strong> – Hands-on cooking and nutrition education.</li>
<li><strong>Literary Club</strong> – Reading, writing, debating, and storytelling.</li>
<li><strong>Heritage Club</strong> – Indian culture, history, arts, and crafts.</li>
<li><strong>Science &amp; Maths Club</strong> – Experiments, puzzles, and STEM challenges.</li>
<li><strong>Eco Club</strong> – Environmental awareness and sustainability projects.</li>
<li><strong>Cultural Club</strong> – Dance, music, drama, and folk art.</li>
</ul>

<p>Explore our <a href="/extracurriculars">Extracurricular Activities</a> or learn more about life at <a href="/about-rainbow-international-school">Rainbow International School</a>.</p>
</div>`;
}

function renderExtracurriculars(): string {
  const sports = [
    "Swimming", "Football", "Cricket", "Basketball", "Skating", "Badminton",
    "Table Tennis", "Chess", "Athletics", "Kabaddi", "Yoga",
  ];
  const arts = ["Dance (Classical &amp; Western)", "Music (Vocal &amp; Instrumental)", "Drama &amp; Theatre", "Art &amp; Craft", "Photography"];
  const stem = ["Robotics", "Coding &amp; Programming", "Science Club", "Maths Olympiad Preparation", "MUN (Model United Nations)"];
  return `
<div class="section">
<h2>A FIT INDIA School — 30+ Activities for All-Round Excellence</h2>
<p>Rainbow International School is a recognised FIT INDIA school offering 30+ extracurricular activities spanning sports, arts, STEM, and leadership. Every student is encouraged to discover their unique passion and develop it with expert guidance.</p>

<h2>Sports & Physical Education</h2>
<p>Our 3.5-acre campus provides dedicated facilities for:</p>
<ul>
${sports.map(s => `<li>${s}</li>`).join("")}
</ul>

<h2>Arts & Performing Arts</h2>
<ul>
${arts.map(a => `<li>${a}</li>`).join("")}
</ul>

<h2>STEM, Leadership & Academic Enrichment</h2>
<ul>
${stem.map(s => `<li>${s}</li>`).join("")}
</ul>

<h2>Why Extracurriculars Matter</h2>
<p>Research shows that students who participate in extracurricular activities perform better academically, develop stronger social skills, and demonstrate greater resilience. At Rainbow, extracurriculars are not optional — they are an integral part of every student's journey.</p>

<p>Explore life <a href="/beyond-the-classroom">Beyond the Classroom</a> or <a href="/admissions">apply for admissions</a>.</p>
</div>`;
}

function renderStudentAchievements(): string {
  const sports = [
    { sport: "Swimming Championship", name: "Miss Raghavi Ramanunjan", award: "300+ medals till date" },
    { sport: "Badminton Tournament", name: "Master Himanshu Desai", award: "Gold at National Level (Represented Maharashtra for U-17)" },
    { sport: "Cycling U-17 (DSO)", name: "Master Atharva Vaidya", award: "Gold" },
    { sport: "South Zone Speed Skating Championship", name: "Miss Lakshmi Sahithi", award: "Bronze" },
    { sport: "Kickboxing Championship", name: "Student", award: "State &amp; National medals" },
  ];
  return `
<div class="section">
<h2>Academic Excellence</h2>
<p>We are extremely proud of our first batch of Class X students who appeared for the All India Secondary School Examination (AISSE) in March 2019. All <strong>43 students</strong> who appeared achieved <strong>100% results</strong>, bringing great laurels to the school.</p>

<div class="card">
<h3>Class X AISSE 2018-19 — 100% Results</h3>
<p>43 students appeared. 100% pass rate. Multiple students secured Distinction, with several toppers scoring above 90%.</p>
</div>

<h2>Sports Achievements — National & State Level</h2>
<p>Rainbow International School students have represented Maharashtra and India at national and state championships across multiple sports:</p>

${sports.map(s => `<div class="card">
<h3>${e(s.sport)}</h3>
<p><strong>Student:</strong> ${s.name} · <strong>Award:</strong> ${s.award}</p>
</div>`).join("")}

<h2>Why We Celebrate Achievements</h2>
<p>At Rainbow International School, every achievement — academic, sporting, artistic, or personal — is acknowledged and honoured. We believe recognition motivates students to strive further and builds a culture of excellence that permeates the entire school community.</p>

<p>Learn more about our <a href="/extracurriculars">extracurricular programmes</a> or <a href="/awards-achievements">school awards</a>.</p>
</div>`;
}

function renderBlogs(): string {
  const posts = [
    { slug: "how-cbse-schools-can-foster-entrepreneurship-and-innovation", title: "How CBSE Schools Can Foster Entrepreneurship and Innovation Among Students" },
    { slug: "why-rainbow-international-school-is-among-the-top-schools-in-thane", title: "Why Rainbow International School Is Among the Top Schools in Thane" },
    { slug: "the-growing-popularity-of-cbse-schools-in-thane-west-among-parents", title: "The Growing Popularity of CBSE Schools in Thane Among Parents" },
    { slug: "key-facilities-every-good-cbse-school-should-have", title: "Key Facilities Every Good CBSE School Should Have" },
    { slug: "why-choose-a-cbse-school-for-your-childs-education", title: "Why Choose a CBSE School for Your Child's Education?" },
    { slug: "riddles-for-kids", title: "100 Fun Riddles for Kids to Sharpen Their Minds" },
    { slug: "problem-solving-activities-life-skills-students", title: "Problem-Solving Activities & Life Skills for Students: Why They Matter" },
    { slug: "role-of-parents-in-education-orientation-importance", title: "The Role of Parents in Education: Why School Orientation Programmes Matter" },
    { slug: "importance-of-foundational-literacy-and-numeracy-in-schools", title: "The Importance of Foundational Literacy and Numeracy in Schools" },
    { slug: "co-curricular-activities", title: "Co-Curricular Activities: The Key to Holistic Student Development" },
    { slug: "age-criteria-for-international-schools-admission-2025-in-mumbai", title: "Age Criteria for International School Admission 2025 in Mumbai: A Parent's Guide" },
    { slug: "international-school-admission-process-guide", title: "A Complete Guide to the International School Admission Process in India" },
    { slug: "advantages-of-starting-early-international-school", title: "The Advantages of Starting Early at an International School" },
    { slug: "the-benefits-of-early-learning-in-shaping-a-childs-personality", title: "The Benefits of Early Learning in Shaping a Child's Personality" },
    { slug: "what-you-need-to-know-before-applying-to-an-international-school", title: "What You Need to Know Before Applying to an International School" },
    { slug: "best-age-for-international-school-admission", title: "Best Age for International School Admission: A Complete Parent's Guide" },
    { slug: "why-maths-matters-in-student-life-benefits-uses", title: "Why Maths Matters in Student Life: Benefits, Uses, and How to Build a Love for Numbers" },
    { slug: "importance-of-sports-in-students-life-teamwork-skills", title: "The Importance of Sports in a Student's Life: Building Teamwork and Life Skills" },
    { slug: "ideal-teacher-qualities-traits-of-a-great-educator", title: "The Ideal Teacher: 8 Qualities and Traits That Define a Great Educator" },
    { slug: "10-fun-and-educational-republic-day-activities-for-kids", title: "10 Fun and Educational Republic Day Activities for Kids" },
    { slug: "understanding-the-effects-of-mobile-phones-on-children-benefits-risks-and-managing-screen-time", title: "Understanding the Effects of Mobile Phones on Children: Benefits, Risks, and Managing Screen Time" },
    { slug: "5-tips-to-choose-best-cbse-schools-in-mumbai", title: "5 Tips to Choose the Best CBSE School in Mumbai: A Parent's Practical Guide" },
    { slug: "benefits-of-rainbow-international-school", title: "The Key Benefits of Rainbow International School: What Makes It the Right Choice for Your Child" },
    { slug: "christmas-celebration-in-school-10-fun-and-festive-activity-ideas", title: "Christmas Celebration in School: 10 Fun and Festive Activity Ideas for Students" },
    { slug: "back-to-school-a-step-by-step-guide-to-international-school-admissions", title: "Back to School: A Step-by-Step Guide to International School Admissions" },
    { slug: "benefits-of-meditation-for-students", title: "Benefits of Meditation for Students: How Mindfulness Improves Learning and Wellbeing" },
    { slug: "diwali-activities-for-students", title: "Diwali Activities for Students: Fun, Creative, and Culturally Rich Ideas for School" },
    { slug: "cbse-vs-icse-which-board-prepares-students-better-for-the-future", title: "CBSE vs ICSE: Which Board Prepares Students Better for the Future?" },
    { slug: "10-things-in-the-classroom-to-boost-student-engagement", title: "10 Things in the Classroom to Boost Student Engagement" },
    { slug: "holistic-development-rainbow-international-school", title: "Holistic Development at Rainbow International School: Educating the Whole Child" },
    { slug: "top-reasons-choose-rainbow-international-school-thane", title: "Top Reasons to Choose Rainbow International School, Thane" },
    { slug: "6-excellent-ideas-to-innovate-cultural-programmes-in-school", title: "6 Excellent Ideas to Innovate Cultural Programmes in School" },
    { slug: "teaching-children-the-value-of-money-5-ways-schools-can-help", title: "Teaching Children the Value of Money: 5 Ways Schools Can Help" },
    { slug: "amazing-coaches-who-improved-players-willpower", title: "Amazing Coaches Who Improved Players' Willpower: Why Schools Need Specialist Sports Coaches" },
    { slug: "how-organic-farming-in-schools-helps-the-nation", title: "How Organic Farming in Schools Helps the Nation" },
    { slug: "how-school-buses-are-changing-with-technology", title: "How School Buses Are Changing with Technology: Safer, Smarter Commutes for Students" },
    { slug: "amazing-youtube-channels-on-general-knowledge-for-kids", title: "7 Amazing YouTube Channels to Boost Kids' General Knowledge" },
    { slug: "know-how-swimming-helps-your-child-in-7-ways", title: "Know How Swimming Helps Your Child in 7 Ways" },
    { slug: "6-reasons-why-cbse-is-the-best-board-of-the-country", title: "6 Reasons Why CBSE Is the Best Board in India for Your Child" },
    { slug: "big-school-playgrounds-6-reasons-why-kids-need-them", title: "Big School Playgrounds: 6 Reasons Why Kids Absolutely Need Them" },
    { slug: "6-reasons-why-indoor-sports-is-important-in-schools", title: "6 Reasons Why Indoor Sports Are Important in Schools" },
    { slug: "an-all-rounder-kid-raghvi-ramanujan-displays-exceptional-talent-in-swimming", title: "An All-Rounder in the Making: Raghvi Ramanujan Bags Her 101st Swimming Medal" },
    { slug: "rainbow-awarded-as-best-preschool-and-secondary-school-in-thane", title: "Rainbow Awarded Best Preschool and Secondary School in Thane at Retail & Hospitality Awards 2018" },
    { slug: "rainbow-preschools-featured-in-knowledge-review-magazine", title: "Rainbow Preschools Featured in 'The 10 Best Preschools in India 2018' — The Knowledge Review" },
    { slug: "rainbow-wins-award-for-excellence", title: "Rainbow Wins India Today Awards for Excellence in Preschool and CBSE Education — Thane 2017" },
    { slug: "100-result-rainbows-first-batch-2018-19", title: "100% Result: Rainbow International School's First Batch Achieves Perfect Class 10 Outcome" },
    { slug: "field-trips-know-how-they-groom-students-in-5-ways", title: "Field Trips: Know How They Groom Students in 5 Important Ways" },
    { slug: "time-management-for-school-children-6-ways-parents-can-help", title: "Time Management for School Children: 6 Ways Parents Can Help" },
    { slug: "how-to-teach-benefits-of-family-meals-to-kids", title: "How to Teach Kids the Benefits of Family Meals — 6 Reasons to Eat Together" },
    { slug: "do-your-children-hate-reading-know-why-youre-the-reason", title: "Do Your Children Hate Reading? Know Why You Might Be the Reason" },
    { slug: "how-regular-sports-help-students-6-reasons", title: "How Regular Sports Help Students: 6 Reasons Every School Child Should Play" },
    { slug: "digital-classrooms-how-technology-improves-education-in-school", title: "Digital Classrooms: How Technology Improves Education in School" },
    { slug: "9-reasons-why-schools-should-have-an-infirmary-and-paediatrician", title: "9 Reasons Why Schools Should Have an Infirmary and a Paediatrician" },
    { slug: "7-safety-and-security-measures-your-kids-school-should-have", title: "7 Safety and Security Measures Your Child's School Must Have" },
    { slug: "cbse-vs-icse-vs-state-board-which-is-best-for-your-child", title: "CBSE vs ICSE vs State Board — Which Is Best for Your Child in 2026?" },
    { slug: "school-admission-checklist-thane-parents-guide-2026", title: "School Admission Checklist for Parents in Thane — Complete Guide for 2026-27" },
    { slug: "how-to-help-your-child-focus-better-in-studies", title: "How to Help Your Child Focus Better in Studies — 12 Proven Strategies" },
    { slug: "importance-of-extracurricular-activities-in-school", title: "Why Extracurricular Activities Are Just as Important as Academics" },
    { slug: "new-education-policy-nep-2020-what-parents-should-know", title: "NEP 2020 Explained for Parents — What Changes and How It Affects Your Child" },
    { slug: "how-to-prepare-your-child-for-first-day-of-school", title: "How to Prepare Your Child for Their First Day of School — A Parent's Guide" },
    { slug: "benefits-of-multiple-intelligence-based-learning-in-schools", title: "Multiple Intelligence-Based Learning — How It Helps Every Child Succeed" },
    { slug: "best-cbse-schools-in-thane-what-to-look-for", title: "Best CBSE Schools in Thane — What to Look for When Choosing One" },
    { slug: "group-activities-for-students", title: "Group Activities for Students: Benefits, Types, and How to Make Them Work" },
    { slug: "imporatnce-of-sports-in-students-life", title: "The Importance of Sports in a Student's Life: Physical Health, Mental Wellbeing, and Academic Benefits" },
    { slug: "cultural-activities-for-students-key-to-developing-critical-thinking-skills", title: "Cultural Activities for Students: The Key to Developing Critical Thinking Skills" },
    { slug: "parental-guidance-how-to-choose-the-best-cbse-school-in-thane-for-your-child", title: "Parental Guidance: How to Choose the Best CBSE School in Thane for Your Child" },
    { slug: "how-to-learn-boring-subjects", title: "How to Learn Boring Subjects: 8 Strategies That Actually Work" },
    { slug: "how-to-increase-attention-span", title: "How to Increase Attention Span: Proven Tips for Students to Focus Better" },
    { slug: "benefits-of-learning-a-second-language", title: "The Benefits of Learning a Second Language for Students" },
    { slug: "how-to-avoid-procrastination-while-studying", title: "How to Avoid Procrastination While Studying: 8 Strategies That Work" },
    { slug: "innovative-teaching-method-for-active-learning", title: "Innovative Teaching Methods for Active Learning: The Flipped Classroom and Beyond" },
    { slug: "smart-revision-techniques-for-students", title: "Smart Revision Techniques for Students: Beyond Rote Memorisation" },
    { slug: "teen-entrepreneurship-fostering-innovation-and-responsibility", title: "Teen Entrepreneurship: Fostering Innovation and Responsibility in Young People" },
    { slug: "teaching-teens-resilience-and-thriving-through-failure", title: "Teaching Teens Resilience: How to Help Young People Thrive Through Failure" },
    { slug: "nutritional-requirements-of-the-teenagers-how-to-fulfil-them", title: "Nutritional Requirements of Teenagers and How to Fulfil Them" },
    { slug: "stress-in-teenagers-symptoms-management", title: "Stress in Teenagers: Symptoms, Causes, and Effective Management Strategies" },
    { slug: "top-5-techniques-for-taming-anger-in-children", title: "Top 5 Techniques for Taming Anger in Children" },
    { slug: "top-6-easy-ways-to-develop-patience-in-your-child", title: "Top 6 Easy Ways to Develop Patience in Your Child" },
    { slug: "homework-war-endgame", title: "The Homework War: How to End the Nightly Battle and Make Study Time Work" },
    { slug: "using-gadgets-the-right-way", title: "Using Gadgets the Right Way: How Technology Can Benefit Children When Used Wisely" },
    { slug: "regulating-childrens-screen-time", title: "Regulating Children's Screen Time: A Practical Guide for Parents" },
    { slug: "how-to-deal-with-anxiety-during-exams", title: "How to Deal with Anxiety During Exams: 8 Proven Tips for Students" },
    { slug: "understanding-adolescence-how-to-handle-the-process", title: "Understanding Adolescence: How to Handle the Process as a Parent" },
    { slug: "how-to-develop-fine-motor-skills-at-home", title: "How to Develop Fine Motor Skills at Home: Fun Activities for Toddlers" },
    { slug: "the-leading-school-of-the-year-thane", title: "Rainbow International School Wins 'Leading School of the Year – Thane' at Pride of Bharat Awards 2021" },
    { slug: "give-earth-to-life-on-earth", title: "Give Earth to Life on Earth: Celebrating Earth Day at Rainbow International School" },
    { slug: "coronavirus-the-new-monster-in-town", title: "Coronavirus: The New Monster in Town — What Schools and Families Need to Know" },
    { slug: "fit-india-certificate-of-recognition", title: "Rainbow International School Receives FIT INDIA Certificate of Recognition" },
    { slug: "the-15th-world-education-summit", title: "Rainbow Wins Big at the 15th World Education Summit: Two National Awards" },
    { slug: "teen-depression-how-to-spot-and-cure-it", title: "Teen Depression: How to Spot It Early and Help Your Child" },
    { slug: "7-areas-in-education-where-indian-women-are-excellent", title: "7 Areas in Education Where Indian Women Are Excellent" },
    { slug: "4-reasons-why-school-bags-should-not-be-a-burden", title: "4 Reasons Why School Bags Should Not Be a Burden on Children" },
    { slug: "smartphone-addiction-how-to-ensure-healthy-use-by-kids", title: "Smartphone Addiction in Kids: 7 Ways to Ensure Healthy Use" },
    { slug: "school-sanitation-standards-how-to-stay-clean-and-safe", title: "School Sanitation Standards: 7 Hygiene Tips Every School Should Implement" },
  ];
  return `
<div class="section">
<h2>94 Articles on Education, Parenting &amp; Student Development</h2>
<p>The Rainbow International School blog covers CBSE curriculum updates, parenting strategies, sports achievements, student wellness, school life in Thane, and much more — written by our educators and academic team.</p>

<h2>All Blog Posts</h2>
<ul>
${posts.map(p => `<li><a href="/blog/${e(p.slug)}">${e(p.title)}</a></li>`).join("\n")}
</ul>

<p>Explore all articles on our <a href="/blogs">blog listing page</a>, or learn more about <a href="/about-rainbow-international-school">Rainbow International School</a>.</p>
</div>`;
}

function renderCurriculum(): string {
  const stages = [
    { stage: "Pre-Primary (Nursery – Sr KG)", subjects: ["Language Arts (English)", "Hindi / Marathi", "EVS", "Maths Readiness", "Art &amp; Craft", "Music &amp; Movement", "Physical Education"] },
    { stage: "Primary (Class 1–5)", subjects: ["English", "Hindi", "Mathematics", "Environmental Science (EVS)", "General Knowledge", "Computer Science", "Art &amp; Craft", "Physical Education"] },
    { stage: "Middle School (Class 6–8)", subjects: ["English", "Hindi / Sanskrit", "Mathematics", "Science", "Social Science", "Computer Applications", "Art Education", "Health &amp; Physical Education"] },
    { stage: "Secondary (Class 9–10)", subjects: ["English (Core)", "Hindi / Sanskrit", "Mathematics (Standard)", "Science", "Social Science", "Information Technology / Computer Applications"] },
    { stage: "Senior Secondary — Science", subjects: ["Physics", "Chemistry", "Biology / Mathematics / Computer Science", "English Core", "Physical Education / Informatics Practices"] },
    { stage: "Senior Secondary — Commerce", subjects: ["Accountancy", "Business Studies", "Economics", "English Core", "Mathematics / Informatics Practices"] },
    { stage: "Senior Secondary — Humanities", subjects: ["History", "Political Science", "Geography / Psychology / Sociology", "English Core", "Economics / Legal Studies"] },
  ];
  return `
<div class="section">
<h2>CBSE-Aligned Curriculum from Nursery to Class 12</h2>
<p>Rainbow International School follows the CBSE curriculum framework — one of India's most rigorous and widely respected educational standards. Our curriculum spans all stages from Pre-Primary to Class 12, balancing academic depth with holistic development.</p>

${stages.map(s => `<div class="card">
<h3>${e(s.stage)}</h3>
<ul>${s.subjects.map(sub => `<li>${sub}</li>`).join("")}</ul>
</div>`).join("")}

<h2>Our Teaching Approach</h2>
<p>Beyond subject content, Rainbow's curriculum is delivered through a Multiple Intelligence-based pedagogy that recognises every child's unique learning style. We combine:</p>
<ul>
<li><strong>Experiential Learning</strong> – Hands-on experiments, field trips, and project work.</li>
<li><strong>Formative Assessment</strong> – Regular quizzes, presentations, and assignments aligned to CBSE CCE guidelines.</li>
<li><strong>Summative Assessment</strong> – Term-end examinations aligned to CBSE guidelines.</li>
<li><strong>Co-Scholastic Grading</strong> – Structured grading of extracurricular participation and physical education as per CBSE norms.</li>
</ul>

<p>View the official <a href="https://cbseacademic.nic.in//curriculum_2024.html" rel="noopener noreferrer" target="_blank">CBSE 2024 Curriculum</a> or learn about our <a href="/our-philosophy">educational philosophy</a>.</p>
</div>`;
}

function renderCbseDisclosures(): string {
  const generalInfo = [
    { label: "School Name", value: "Rainbow International School" },
    { label: "Affiliation Number", value: "1130661" },
    { label: "School Code", value: "27231" },
    { label: "Board", value: "Central Board of Secondary Education (CBSE)" },
    { label: "Address", value: "Cosmos Arcade, Brahmand Phase 4, Thane, Maharashtra 400607" },
    { label: "Contact", value: "(022) 69105000" },
    { label: "Email", value: "info@rainbowinternationalschool.in" },
    { label: "Principal", value: "Available on request" },
    { label: "School Category", value: "Senior Secondary (Classes 1–12)" },
    { label: "Affiliation Period", value: "2022–2027" },
    { label: "Trust/Society", value: "Registered Trust" },
    { label: "NOC", value: "Issued by State Government of Maharashtra" },
  ];
  return `
<div class="section">
<h2>CBSE Mandatory Public Disclosures — Affiliation No. 1130661</h2>
<p>The following disclosures are provided in compliance with CBSE affiliation requirements under the School Affiliation Bye-Laws. Rainbow International School, Thane maintains full transparency with parents, students, and regulatory bodies.</p>

<h2>A. General Information</h2>
${generalInfo.map(r => `<div class="card"><p><strong>${e(r.label)}:</strong> ${e(r.value)}</p></div>`).join("")}

<h2>B. Documents &amp; Information</h2>
<div class="card"><p>Copies of affiliation letter, recognition certificate, building safety certificate, fire NOC, health and sanitation certificate, and land certificate are available for inspection at the school office during working hours (Mon–Sat, 9:00 AM–6:00 PM).</p></div>

<h2>C. Results &amp; Academics</h2>
<div class="card"><p>Class X AISSE 2018-19: 100% results (43 students appeared). Class XII results available at school office. Board examination result data as per CBSE OASIS is updated annually.</p></div>

<h2>D. Staff (Teaching)</h2>
<div class="card"><p>All teaching staff hold recognised qualifications as per CBSE norms — B.Ed./M.Ed. for trained graduates, PG degrees for post-graduate teachers. The school employs qualified PRTs (Primary Teachers), TGTs (Trained Graduate Teachers), and PGTs (Post Graduate Teachers) across all sections.</p></div>

<p>For detailed disclosures or document verification, contact us at <a href="mailto:info@rainbowinternationalschool.in">info@rainbowinternationalschool.in</a> or visit our <a href="/contact-us">Contact page</a>.</p>
</div>`;
}

function renderRainbowPreschool(): string {
  const programmes = [
    { name: "Playgroup", age: "1.5 – 2.5 years", desc: "Gentle introduction to group learning through play, songs, and sensory activities. Builds comfort and confidence in a classroom setting." },
    { name: "Nursery", age: "2.5 – 3.5 years", desc: "Language development, pre-number skills, social interaction, and creative expression. 100% female teaching staff." },
    { name: "Junior KG", age: "3.5 – 4.5 years", desc: "Structured play-based learning with early reading readiness, number sense, and self-help skills." },
    { name: "Senior KG", age: "4.5 – 5.5 years", desc: "Preparation for Class 1 with phonics, early mathematics, logical reasoning, and collaborative project work." },
  ];
  const awards = [
    "Top 10 Pre-Primary Schools — Maharashtra (Education World Rankings)",
    "Best Preschool in Thane — Hindustan Times School Survey",
    "100% Female Teaching Staff — Preschool Wing",
    "Google for Education recognised campus",
  ];
  return `
<div class="section">
<h2>Award-Winning Preschool in Thane — Ages 1.5 to 5.5</h2>
<p>Rainbow Preschool International is the early childhood wing of Rainbow International School — one of Thane's most trusted preschools, recognised for its nurturing environment, 100% female teaching staff, and research-backed pedagogy for children aged 1.5 to 5.5 years.</p>

<h2>Our Preschool Programmes</h2>
${programmes.map(p => `<div class="card">
<h3>${e(p.name)} (Age ${e(p.age)})</h3>
<p>${e(p.desc)}</p>
</div>`).join("")}

<h2>Why Choose Rainbow Preschool?</h2>
<ul>
<li><strong>100% Female Staff</strong> – Dedicated all-female teaching team in the preschool wing for maximum comfort and safety.</li>
<li><strong>Award-Winning</strong> – Recognised among India's best preschools by multiple education bodies.</li>
<li><strong>Seamless K-12 Pathway</strong> – Preschool students transition naturally to Class 1 within the Rainbow family.</li>
<li><strong>Safe Environment</strong> – 200+ CCTV cameras, card-based entry, on-campus infirmary.</li>
<li><strong>Play-Based Learning</strong> – Developmentally appropriate activities that nurture curiosity, creativity, and confidence.</li>
</ul>

<h2>Recognition &amp; Awards</h2>
<ul>
${awards.map(a => `<li>${e(a)}</li>`).join("")}
</ul>

<p>Learn about our <a href="/pre-primary-school-thane">Pre-Primary section</a> or <a href="/admissions">apply for preschool admission</a>.</p>
</div>`;
}

function renderAcademicCalendar(): string {
  const terms = [
    { term: "Term 1", months: "April – September 2026", highlights: ["School reopens April 7, 2026", "Annual Sports Day", "Mid-term examinations (July)", "Independence Day celebration", "Teacher's Day (September 5)", "Ganesh Chaturthi break"] },
    { term: "Term 2", months: "October 2026 – March 2027", highlights: ["Diwali break (October)", "Annual Day / Cultural Programme", "Republic Day celebration", "Pre-board examinations (January)", "CBSE Board Examinations (February–March 2027)", "Annual Prize Distribution"] },
  ];
  const events = [
    "Science Exhibition", "Art Exhibition", "Heritage Day", "Sports Day",
    "Annual Day (Cultural Programme)", "Book Fair", "Career Guidance Sessions",
    "Parent-Teacher Meetings", "Organic Farming Day", "Inter-School Competitions",
  ];
  return `
<div class="section">
<h2>Academic Calendar 2026–27</h2>
<p>The Rainbow International School academic year runs from April to March, following CBSE guidelines. Stay updated with important dates, examinations, events, and school activities throughout the year.</p>

${terms.map(t => `<div class="card">
<h3>${e(t.term)} (${e(t.months)})</h3>
<ul>${t.highlights.map(h => `<li>${e(h)}</li>`).join("")}</ul>
</div>`).join("")}

<h2>Annual Events &amp; Activities</h2>
<ul>
${events.map(ev => `<li>${e(ev)}</li>`).join("")}
</ul>

<h2>Working Hours</h2>
<p>School office hours: Monday to Saturday, 9:00 AM – 6:00 PM. Academic hours vary by grade level. Please contact the school for grade-specific timings.</p>

<p>For the latest updates, <a href="/contact-us">contact us</a> or follow our official communications. Explore our <a href="/blogs">school blog</a> for event highlights and updates.</p>
</div>`;
}

function renderAcademicTeam(): string {
  const departments = [
    { name: "Pre-Primary Academic Team", desc: "Our pre-primary wing is staffed entirely by qualified female educators with specialised training in early childhood development, play-based learning, and child psychology." },
    { name: "Class Teachers (Class 1–10)", desc: "Experienced class teachers guide students through their primary, middle, and secondary school journey — providing academic support, emotional guidance, and pastoral care." },
    { name: "Senior Secondary Teachers (Class 11–12)", desc: "Post-graduate teachers with subject specialisations in Physics, Chemistry, Mathematics, Biology, Commerce, Accountancy, History, Political Science, and more." },
    { name: "Subject Teachers (Primary & Middle)", desc: "Specialist teachers for Computer Science, Art, Music, Dance, Physical Education, and Library across primary and middle school sections." },
    { name: "Student Support Staff", desc: "School counsellors, special educators, sports coaches, and activity coordinators who ensure every student's holistic development." },
  ];
  return `
<div class="section">
<h2>Our Academic Team — The Heart of Rainbow</h2>
<p>Rainbow International School's academic team comprises over 150 dedicated educators — teachers, coaches, counsellors, and support staff — united by a shared passion for student excellence and holistic development.</p>

${departments.map(d => `<div class="card">
<h3>${e(d.name)}</h3>
<p>${e(d.desc)}</p>
</div>`).join("")}

<h2>Our Commitment to Quality Teaching</h2>
<p>All teaching staff at Rainbow International School hold qualifications as per CBSE norms — B.Ed./M.Ed. for PRTs and TGTs, postgraduate degrees for PGTs. We invest regularly in teacher training, professional development workshops, and exposure to global pedagogy best practices.</p>

<h2>Professional Development</h2>
<ul>
<li>Google for Education certified trainers on staff</li>
<li>British Council professional development programme participation</li>
<li>Regular in-house workshops on Multiple Intelligence pedagogy</li>
<li>Annual teacher appreciation and recognition programmes</li>
</ul>

<p>Interested in joining our team? Visit our <a href="/career">Careers page</a>. Learn more about our <a href="/our-philosophy">educational philosophy</a>.</p>
</div>`;
}

function renderOurPhilosophy(): string {
  const pillars = [
    { number: "01", title: "Competence", accent: "#0d3b86", desc: "We build academic competence through a rigorous yet engaging curriculum, innovative teaching methods, and a relentless pursuit of knowledge. Every Rainbow student is equipped with the intellectual tools to succeed in any field they choose." },
    { number: "02", title: "Conscience", accent: "#047857", desc: "We nurture a strong moral compass in every student — developing values of integrity, honesty, and responsibility. We believe that true education leads to an awakened conscience that guides actions for the greater good." },
    { number: "03", title: "Compassion", accent: "#ec4899", desc: "Empathy is at the heart of Rainbow's culture. We cultivate compassion through community service, inter-personal engagement, and a school environment where every individual is respected and valued for who they are." },
    { number: "04", title: "Courage", accent: "#d97706", desc: "We encourage our students to be bold — to question, to explore, to fail and rise again. Courage is the driving force behind innovation and progress, and we build it through challenges both inside and outside the classroom." },
  ];
  return `
<div class="section">
<h2>Education That Builds Character, Not Just Careers</h2>
<p>At Rainbow International School, our educational philosophy is rooted in a simple yet powerful belief: <strong>every child is unique, every child has potential, and every child deserves the very best.</strong></p>

<p>Our philosophy is built on four foundational pillars that guide everything we do — from curriculum design to classroom culture, from teacher training to student well-being.</p>

<h2>Our Four Pillars</h2>
${pillars.map(p => `<div class="card">
<h3>${p.number}. ${e(p.title)}</h3>
<p>${e(p.desc)}</p>
</div>`).join("")}

<h2>Multiple Intelligence Framework</h2>
<p>We are guided by Howard Gardner's Theory of Multiple Intelligences — recognising that children learn in diverse ways. Our curriculum, classroom methods, and extracurricular programmes are designed to nurture all eight intelligences: Linguistic, Logical-Mathematical, Spatial, Musical, Bodily-Kinaesthetic, Interpersonal, Intrapersonal, and Naturalist.</p>

<p>Explore our <a href="/ris-vision-mission">Vision &amp; Mission</a> or learn about our <a href="/curriculum">CBSE curriculum</a>.</p>
</div>`;
}

function renderVisionMission(): string {
  const values = [
    { title: "Vision", desc: "To be a globally recognized institution that nurtures curious, compassionate, and confident world citizens who uphold Indian values while making a meaningful impact on the world." },
    { title: "Mission", desc: "To provide a holistic, student-centered education that balances academic excellence with character development, creativity, and physical well-being through innovative teaching and a supportive environment." },
  ];
  const coreValues = [
    { title: "Excellence", desc: "We pursue the highest standards in everything we do — academic, co-curricular, and personal." },
    { title: "Compassion", desc: "We nurture empathy, kindness, and respect for all people and living beings." },
    { title: "Global Mindset", desc: "We prepare students to thrive in a diverse, interconnected world while remaining rooted in Indian heritage." },
    { title: "Innovation", desc: "We embrace creativity and critical thinking as tools for solving tomorrow's challenges." },
  ];
  return `
<div class="section">
<h2>Our Vision</h2>
<p>${e(values[0].desc)}</p>

<h2>Our Mission</h2>
<p>${e(values[1].desc)}</p>

<h2>Core Values</h2>
${coreValues.map(v => `<div class="card">
<h3>${e(v.title)}</h3>
<p>${e(v.desc)}</p>
</div>`).join("")}

<h2>Our Commitment</h2>
<p>Founded in April 2009, Rainbow International School has spent 17 years transforming these values from words into everyday reality. Our teachers, administrators, and support staff collectively embody the Rainbow vision in every interaction with students, parents, and the community.</p>

<p>Learn more about <a href="/our-philosophy">Our Philosophy</a> or read a <a href="/chairpersons-note">message from our Chairperson</a>.</p>
</div>`;
}

function renderChairpersonsNote(): string {
  return `
<div class="section">
<h2>A Message from the Chairperson</h2>
<p>Welcome to Rainbow International School — a place where we believe that the true measure of an education is not merely academic achievement, but the holistic growth of a child into a confident, compassionate, and capable human being.</p>

<p>When Rainbow International School was founded in April 2009, our vision was clear: to create a school that would become a second home for children — a place where they would be challenged, supported, celebrated, and above all, loved.</p>

<h2>Our Journey</h2>
<p>Over the past 17 years, we have had the privilege of serving over 1 lakh students and their families. What began as a dream has grown into one of Thane's most respected CBSE K–12 institutions, with over 3,000 students across Nursery to Class 12, a dedicated team of 150+ educators, and a sprawling 3.5-acre campus that continues to evolve with the needs of modern education.</p>

<h2>Our Promise</h2>
<p>We are committed to providing every child — regardless of their background or learning style — with an education that equips them for life. This means investing in our teachers, continuously upgrading our infrastructure, embracing the best of global pedagogies, and keeping the student at the centre of every decision we make.</p>

<p>At Rainbow, your child will not only learn — they will grow, discover, and thrive.</p>

<p>Warm regards,<br/><strong>Chairperson, Rainbow International School</strong></p>

<p>Learn more <a href="/about-rainbow-international-school">about our school</a> or explore our <a href="/ris-vision-mission">Vision &amp; Mission</a>.</p>
</div>`;
}

function renderPhotoGallery(): string {
  const categories = [
    { name: "Campus &amp; Infrastructure", desc: "Our 3.5-acre campus in Brahmand, Thane — smart classrooms, labs, library, sports facilities, swimming pool, skating rink, amphitheatre, and organic farm." },
    { name: "Academic Activities", desc: "Science experiments, art projects, computer labs, library sessions, and classroom learning across all grade levels." },
    { name: "Sports &amp; Physical Education", desc: "Swimming championships, football tournaments, cricket matches, basketball courts, skating events, yoga sessions, and inter-school competitions." },
    { name: "Cultural &amp; Performing Arts", desc: "Annual Day performances, dance recitals, music concerts, drama productions, and heritage day celebrations." },
    { name: "School Exhibitions", desc: "Science exhibitions, art exhibitions, heritage exhibitions, and project showcases where students present their work to parents and the community." },
    { name: "Beyond the Classroom", desc: "Club activities, organic farming, educational tours, and community service initiatives." },
    { name: "Awards &amp; Achievements", desc: "Award ceremonies, recognition events, and celebrations of student and school achievements at state, national, and international levels." },
  ];
  return `
<div class="section">
<h2>A Visual Journey Through Rainbow International School</h2>
<p>Browse our photo gallery to experience life at Rainbow International School — from academics and sports to cultural events, campus facilities, and student achievements across our 3.5-acre campus in Thane.</p>

${categories.map(c => `<div class="card">
<h3>${c.name}</h3>
<p>${c.desc}</p>
</div>`).join("")}

<h2>Visit Us in Person</h2>
<p>Photographs can only capture a glimpse of what makes Rainbow International School special. We invite you to experience our campus firsthand — meet our educators, explore our facilities, and see Rainbow's vibrant learning environment come alive.</p>

<p><a href="/contact-us">Schedule a campus visit</a> or <a href="/admissions">apply for admissions 2026–27</a>.</p>
</div>`;
}

function renderScheduleAppointment(): string {
  return `
<div class="section">
<h2>Schedule a Campus Visit</h2>
<p>We warmly invite parents and guardians to visit the Rainbow International School campus in Thane. A campus visit is the best way to experience our facilities, meet our faculty, and understand the Rainbow learning environment first-hand.</p>

<div class="card">
<h3>Book an Appointment</h3>
<p>To schedule a campus visit or meeting with our admissions team, reach out to us through any of the following:</p>
<ul>
<li><strong>Phone:</strong> <a href="tel:02269105000">(022) 69105000</a> &nbsp;|&nbsp; <a href="tel:+918291568972">+91 82915 68972</a></li>
<li><strong>WhatsApp:</strong> <a href="https://wa.me/918291568972">+91 82915 68972</a></li>
<li><strong>Email:</strong> <a href="mailto:info@rainbowinternationalschool.in">info@rainbowinternationalschool.in</a></li>
</ul>
</div>

<div class="card">
<h3>Campus Location &amp; Hours</h3>
<p><strong>Address:</strong> Cosmos Arcade, Brahmand Phase 4, Thane, Maharashtra 400607</p>
<p><strong>Working Hours:</strong> Monday – Saturday, 9:00 AM – 6:00 PM</p>
</div>

<p>Interested in admissions for 2026–27? <a href="/admissions">View admissions details</a> or <a href="/contact-us">fill an enquiry form</a> and our team will get back to you promptly.</p>
</div>`;
}

function renderWelcomeToRIS(): string {
  return `
<div class="section">
<h2>Welcome to Rainbow International School</h2>
<p>Rainbow International School is a CBSE-affiliated K–12 institution in Thane, Maharashtra, founded in April 2009. Set on a 3.5-acre campus in Brahmand Phase 4, Thane, it serves 3,000+ students from Nursery to Class 12 (CBSE Affiliation No. 1130661).</p>

<div class="card">
<h3>School At a Glance</h3>
<p><strong>Founded:</strong> April 2009 &nbsp;|&nbsp; <strong>Campus:</strong> 3.5 acres &nbsp;|&nbsp; <strong>Students:</strong> 3,000+ &nbsp;|&nbsp; <strong>Grades:</strong> Nursery to Class 12 &nbsp;|&nbsp; <strong>CBSE Affiliation:</strong> 1130661</p>
<p><strong>Location:</strong> Cosmos Arcade, Brahmand Phase 4, Thane, Maharashtra 400607</p>
</div>

<p>Admissions for 2026–27 are open. <a href="/admissions">Apply online</a> or <a href="/contact-us">contact our admissions team</a> to learn more.</p>
</div>`;
}

const pages: PageSSRConfig[] = [
  {
    path: "/about-rainbow-international-school",
    title: "About Rainbow International School — Best CBSE School in Thane",
    description: "Rainbow International School, founded in 2009, is a top-rated CBSE K–12 school in Thane. 3.5-acre campus, 3000+ students, award-winning education from Nursery to Class 12.",
    keywords: "about Rainbow International School, CBSE school Thane, best school Thane, K-12 school Thane, international school Thane",
    canonical: "https://rainbowinternationalschool.in/about-rainbow-international-school",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "About Us", url: "https://rainbowinternationalschool.in/about-rainbow-international-school" },
    ],
    jsonLd: SCHOOL_LD,
    renderBody: renderAbout,
  },
  {
    path: "/pre-primary-school-thane",
    title: "Pre-Primary School in Thane — Nursery, Jr KG, Sr KG | Rainbow International School",
    description: "Best pre-primary school in Thane. Nursery, Jr KG, Sr KG with play-based learning, 100% female staff, CBSE-aligned curriculum. Admissions open for 2026–27.",
    keywords: "pre-primary school Thane, nursery school Thane, Jr KG admission Thane, best preschool Thane, kindergarten Thane",
    canonical: "https://rainbowinternationalschool.in/pre-primary-school-thane",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Pre-Primary Section", url: "https://rainbowinternationalschool.in/pre-primary-school-thane" },
    ],
    jsonLd: { ...SCHOOL_LD, "@type": "School", department: { "@type": "EducationalOccupationalProgram", name: "Pre-Primary Section", educationalLevel: "Preschool" } },
    renderBody: renderPrePrimary,
  },
  {
    path: "/primary-section",
    appendSiteName: false,
    title: "Primary School in Thane | CBSE Class 1 to 5",
    description: "Explore Primary School at Rainbow International School, a CBSE school in Thane for Class 1 to 5 with academics, activities, safety and care.",
    keywords: "primary school Thane, Class 1 to 5 CBSE Thane, best primary school Thane, CBSE primary Thane",
    canonical: "https://rainbowinternationalschool.in/primary-section",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Primary School in Thane | Class 1 to Class 5", url: "https://rainbowinternationalschool.in/primary-section" },
    ],
    jsonLd: { ...SCHOOL_LD, "@type": "School", department: { "@type": "EducationalOccupationalProgram", name: "Primary Section", educationalLevel: "Primary" } },
    renderBody: renderPrimary,
  },
  {
    path: "/middle-school-section",
    appendSiteName: false,
    title: "Middle School in Thane | CBSE Class 6 to 8",
    description: "Explore Middle School at Rainbow International School, a CBSE school in Thane for Class 6 to 8 with academics, activities and confidence building.",
    keywords: "middle school Thane, Class 6 to 8 CBSE Thane, best middle school Thane, CBSE school Class 6 7 8 Thane",
    canonical: "https://rainbowinternationalschool.in/middle-school-section",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Middle School in Thane | CBSE Class 6 to 8", url: "https://rainbowinternationalschool.in/middle-school-section" },
    ],
    jsonLd: { ...SCHOOL_LD, "@type": "School", department: { "@type": "EducationalOccupationalProgram", name: "Middle School Section", educationalLevel: "Middle School" } },
    renderBody: renderMiddleSchool,
  },
  {
    path: "/secondary-section",
    appendSiteName: false,
    title: "Secondary School in Thane | CBSE Class 9 & 10",
    description: "Explore Secondary School at Rainbow International School, a CBSE school in Thane for Class 9 and 10 with academics and board preparation.",
    keywords: "secondary school Thane, Class 9 10 CBSE Thane, CBSE board exam school Thane, Class 10 school Thane",
    canonical: "https://rainbowinternationalschool.in/secondary-section",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Secondary School in Thane | CBSE Class 9 & 10", url: "https://rainbowinternationalschool.in/secondary-section" },
    ],
    jsonLd: { ...SCHOOL_LD, "@type": "School", department: { "@type": "EducationalOccupationalProgram", name: "Secondary Section", educationalLevel: "Secondary" } },
    renderBody: renderSecondary,
  },
  {
    path: "/senior-secondary-section",
    appendSiteName: false,
    title: "Senior Secondary in Thane | CBSE Class 11 & 12",
    description: "Explore Senior Secondary at Rainbow International School, a CBSE school in Thane for Class 11 and 12 with board preparation and career readiness.",
    keywords: "senior secondary school Thane, Class 11 12 Thane, Science Commerce Humanities Thane, CBSE Class 12 school Thane, JEE NEET school Thane",
    canonical: "https://rainbowinternationalschool.in/senior-secondary-section",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Senior Secondary in Thane | CBSE Class 11 & 12", url: "https://rainbowinternationalschool.in/senior-secondary-section" },
    ],
    jsonLd: { ...SCHOOL_LD, "@type": "School", department: { "@type": "EducationalOccupationalProgram", name: "Senior Secondary Section", educationalLevel: "Senior Secondary" } },
    renderBody: renderSeniorSecondary,
  },
  {
    path: "/contact-us",
    title: "Contact Rainbow International School Thane — Phone, Email, Address",
    description: "Contact Rainbow International School, Thane. Phone: +91 82915 68972. Email: info@rainbowinternationalschool.in. Address: Cosmos Arcade, Brahmand Phase 4, Thane 400607.",
    keywords: "contact Rainbow International School, school phone number Thane, school address Thane, Rainbow school email, visit campus Thane",
    canonical: "https://rainbowinternationalschool.in/contact-us",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Contact Us", url: "https://rainbowinternationalschool.in/contact-us" },
    ],
    jsonLd: SCHOOL_LD,
    renderBody: renderContact,
  },
  {
    path: "/amenities",
    title: "School Amenities & Facilities — 3.5-Acre Campus | Rainbow International School Thane",
    description: "Explore world-class amenities at Rainbow International School, Thane. Smart classrooms, science labs, swimming pool, skating rink, amphitheatre, library, organic farm.",
    keywords: "school amenities Thane, school facilities Thane, school with swimming pool Thane, best campus school Thane, school infrastructure Thane",
    canonical: "https://rainbowinternationalschool.in/amenities",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Amenities & Facilities", url: "https://rainbowinternationalschool.in/amenities" },
    ],
    jsonLd: SCHOOL_LD,
    renderBody: renderAmenities,
  },
  {
    path: "/awards-achievements",
    title: "Awards & Achievements — Best School in Thane | Rainbow International School",
    description: "Rainbow International School awards: Best School in Thane, British Council ISA, Google for Education, Fit India. View our complete recognition list.",
    keywords: "best school Thane awards, school achievements Thane, British Council school Thane, award winning school Thane",
    canonical: "https://rainbowinternationalschool.in/awards-achievements",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Awards & Achievements", url: "https://rainbowinternationalschool.in/awards-achievements" },
    ],
    jsonLd: SCHOOL_LD,
    renderBody: renderAwards,
  },
  {
    path: "/safety-security",
    title: "School Safety & Security — 200+ CCTV, GPS Buses | Rainbow International School Thane",
    description: "Comprehensive safety at Rainbow International School, Thane. 200+ CCTV cameras, card-based entry, infirmary, GPS-tracked buses, trained security, fire safety.",
    keywords: "school safety Thane, safe school Thane, CCTV school Thane, school security Thane, school with nurse Thane",
    canonical: "https://rainbowinternationalschool.in/safety-security",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Safety & Security", url: "https://rainbowinternationalschool.in/safety-security" },
    ],
    jsonLd: SCHOOL_LD,
    renderBody: renderSafety,
  },
  {
    path: "/admissions",
    appendSiteName: false,
    title: "Admissions Open 2026–27 | CBSE School in Thane",
    description: "Admissions open at Rainbow International School, a CBSE school in Thane for Nursery to Class 12. Enquire, book a campus visit or apply today.",
    keywords: "school admission Thane 2026, nursery admission Thane, CBSE school admission, Rainbow International School admission",
    canonical: "https://rainbowinternationalschool.in/admissions",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Admissions Open 2026–27 | CBSE School in Thane", url: "https://rainbowinternationalschool.in/admissions" },
    ],
    jsonLd: SCHOOL_LD,
    renderBody: renderAdmissions,
  },
  {
    path: "/fee-structure",
    title: "CBSE School Fee Structure Thane 2026-27 | Rainbow International School",
    description: "Fee structure details for Rainbow International School, Thane — Nursery to Class 12 CBSE. Transparent fees, sibling concessions, quarterly payment.",
    keywords: "CBSE school fees Thane, school fee structure Thane, Rainbow International School fees, nursery school fees Thane",
    canonical: "https://rainbowinternationalschool.in/fee-structure",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Fee Structure", url: "https://rainbowinternationalschool.in/fee-structure" },
    ],
    jsonLd: { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [
      { "@type": "Question", name: "What is the fee payment schedule?", acceptedAnswer: { "@type": "Answer", text: "Fees are payable in quarterly instalments." } },
      { "@type": "Question", name: "Are there sibling concessions?", acceptedAnswer: { "@type": "Answer", text: "Yes, sibling discounts are available." } },
    ]},
    renderBody: renderFees,
  },
  {
    path: "/school-near-brahmand-thane",
    title: "Best School Near Brahmand Thane — CBSE Nursery to Class 12 | Rainbow International School",
    description: "Rainbow International School — best CBSE school near Brahmand, Thane. Located in Brahmand Phase 4. Nursery to Class 12, 3.5-acre campus.",
    keywords: "school near Brahmand Thane, best school Brahmand, CBSE school Brahmand Thane",
    canonical: "https://rainbowinternationalschool.in/school-near-brahmand-thane",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "School Near Brahmand", url: "https://rainbowinternationalschool.in/school-near-brahmand-thane" },
    ],
    jsonLd: { ...SCHOOL_LD, areaServed: "Brahmand, Thane" },
    renderBody: renderLocalityBrahmand,
  },
  {
    path: "/school-near-ghodbunder-road-thane",
    title: "Best School Near Ghodbunder Road Thane — CBSE K–12 | Rainbow International School",
    description: "Rainbow International School — top CBSE school near Ghodbunder Road, Thane. 8 min from GB Road. Bus routes covering Patlipada, Waghbil, Kavesar.",
    keywords: "school near Ghodbunder Road, best school GB Road Thane, CBSE school Ghodbunder Road",
    canonical: "https://rainbowinternationalschool.in/school-near-ghodbunder-road-thane",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "School Near Ghodbunder Road", url: "https://rainbowinternationalschool.in/school-near-ghodbunder-road-thane" },
    ],
    jsonLd: { ...SCHOOL_LD, areaServed: "Ghodbunder Road, Thane" },
    renderBody: renderLocalityGhodbunder,
  },
  {
    path: "/school-near-manpada-thane",
    title: "Best School Near Manpada Thane — CBSE Nursery to Class 12 | Rainbow International School",
    description: "Rainbow International School — top CBSE school near Manpada, Thane. 5 min from Manpada Junction. Nursery to Class 12, 3.5-acre campus.",
    keywords: "school near Manpada Thane, best school Manpada, CBSE school Manpada Thane",
    canonical: "https://rainbowinternationalschool.in/school-near-manpada-thane",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "School Near Manpada", url: "https://rainbowinternationalschool.in/school-near-manpada-thane" },
    ],
    jsonLd: { ...SCHOOL_LD, areaServed: "Manpada, Thane" },
    renderBody: renderLocalityManpada,
  },
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
  {
    path: "/career",
    title: "Career Opportunities",
    description: "Explore career opportunities at Rainbow International School in Thane. We're looking for passionate educators and staff to join our esteemed institution.",
    keywords: "Rainbow school career, teacher jobs Thane, school jobs Thane, educator jobs Rainbow International School",
    canonical: "https://rainbowinternationalschool.in/career",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Career Opportunities", url: "https://rainbowinternationalschool.in/career" },
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Career Opportunities at Rainbow International School",
      description: "Explore teacher and staff job openings at Rainbow International School, Thane — a leading CBSE K-12 school.",
      url: "https://rainbowinternationalschool.in/career",
      publisher: { "@type": "Organization", name: "Rainbow International School", url: "https://rainbowinternationalschool.in" },
    },
    renderBody: renderCareer,
  },
  {
    path: "/beyond-the-classroom",
    title: "Beyond the Classroom",
    description: "Rainbow International School offers exhibitions, clubs, tours, and organic farming activities beyond academics. A comprehensive programme designed to meet the social, physical, and cultural needs of students.",
    keywords: "beyond classroom activities Rainbow School, school clubs Thane, extracurricular activities Thane school, school exhibitions Thane",
    canonical: "https://rainbowinternationalschool.in/beyond-the-classroom",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Beyond the Classroom", url: "https://rainbowinternationalschool.in/beyond-the-classroom" },
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Beyond the Classroom — Rainbow International School",
      description: "Clubs, exhibitions, educational tours, and organic farming at Rainbow International School, Thane.",
      url: "https://rainbowinternationalschool.in/beyond-the-classroom",
    },
    renderBody: renderBeyondClassroom,
  },
  {
    path: "/extracurriculars",
    title: "Extracurricular Activities",
    description: "Rainbow International School — FIT INDIA School with sports, clubs, exhibitions, cultural activities and tours for holistic student development in Thane.",
    keywords: "extracurricular activities Thane school, Rainbow school sports clubs, FIT INDIA school Thane",
    canonical: "https://rainbowinternationalschool.in/extracurriculars",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Extracurriculars", url: "https://rainbowinternationalschool.in/extracurriculars" },
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Extracurricular Activities — Rainbow International School",
      description: "30+ extracurricular activities including sports, arts, STEM, and leadership at Rainbow International School, Thane.",
      url: "https://rainbowinternationalschool.in/extracurriculars",
    },
    renderBody: renderExtracurriculars,
  },
  {
    path: "/student-achievements",
    title: "Student Achievements",
    description: "Rainbow International School student achievements — 100% result in Class X AISSE 2018-19, National and State level sports achievements in Swimming, Badminton, Skating, Chess and more.",
    keywords: "Rainbow school student achievements, CBSE school results Thane, school sports achievements Thane",
    canonical: "https://rainbowinternationalschool.in/student-achievements",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Student Achievements", url: "https://rainbowinternationalschool.in/student-achievements" },
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Student Achievements — Rainbow International School",
      description: "Academic and sports achievements by Rainbow International School students at national and state level.",
      url: "https://rainbowinternationalschool.in/student-achievements",
    },
    renderBody: renderStudentAchievements,
  },
  {
    path: "/blogs",
    title: "Blogs",
    description: "Read 86+ insightful articles from Rainbow International School on education, parenting, CBSE, student wellness, admissions, sports and more.",
    keywords: "Rainbow school blog, education blog Thane, CBSE school blog, parenting tips school Thane, student development blog Rainbow International",
    canonical: "https://rainbowinternationalschool.in/blogs",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Blogs", url: "https://rainbowinternationalschool.in/blogs" },
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "Rainbow International School Blog",
      description: "Education, parenting, CBSE, and school life insights from Rainbow International School, Thane.",
      url: "https://rainbowinternationalschool.in/blogs",
      publisher: { "@type": "Organization", name: "Rainbow International School", url: "https://rainbowinternationalschool.in" },
    },
    renderBody: renderBlogs,
  },
  {
    path: "/curriculum",
    title: "Curriculum",
    description: "Explore Rainbow International School's comprehensive CBSE-aligned curriculum from Pre-Primary to Class 12 — covering all stages, subjects, streams and teaching methodology.",
    keywords: "CBSE curriculum Thane, Rainbow International School curriculum, CBSE 2024 curriculum, school syllabus Thane",
    canonical: "https://rainbowinternationalschool.in/curriculum",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Curriculum", url: "https://rainbowinternationalschool.in/curriculum" },
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Course",
      name: "CBSE K-12 Curriculum — Rainbow International School",
      description: "Complete CBSE-aligned curriculum from Nursery to Class 12 including Science, Commerce, and Humanities streams.",
      provider: { "@type": "Organization", name: "Rainbow International School", url: "https://rainbowinternationalschool.in" },
      url: "https://rainbowinternationalschool.in/curriculum",
    },
    renderBody: renderCurriculum,
  },
  {
    path: "/cbse-mandatory-public-disclosures",
    title: "CBSE Public Disclosures | Rainbow International School",
    description: "CBSE mandatory public disclosures for Rainbow International School, Thane. Affiliation number 1130661. Full details including staff, infrastructure, results and documents.",
    keywords: "Rainbow school CBSE disclosure, CBSE affiliation number 1130661, public disclosure school Thane",
    canonical: "https://rainbowinternationalschool.in/cbse-mandatory-public-disclosures",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "CBSE Mandatory Public Disclosures", url: "https://rainbowinternationalschool.in/cbse-mandatory-public-disclosures" },
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "CBSE Mandatory Public Disclosures — Rainbow International School",
      description: "Regulatory disclosures for Rainbow International School, Thane as required under CBSE Affiliation Bye-Laws.",
      url: "https://rainbowinternationalschool.in/cbse-mandatory-public-disclosures",
      publisher: { "@type": "Organization", name: "Rainbow International School", url: "https://rainbowinternationalschool.in" },
    },
    renderBody: renderCbseDisclosures,
  },
  {
    path: "/rainbow-preschool-international",
    title: "Preschool (Age 1.5–5.5) Thane",
    description: "Rainbow Preschool International — award-winning preschool for children aged 1.5 to 5.5 years. Playgroup, Nursery, Jr KG, and Sr KG. 100% female staff. Recognised among India's best preschools.",
    keywords: "Rainbow Preschool International, best preschool Thane, playgroup Thane, nursery admission Thane, Rainbow pre-primary school, early childhood education Thane",
    canonical: "https://rainbowinternationalschool.in/rainbow-preschool-international",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Rainbow Preschool International", url: "https://rainbowinternationalschool.in/rainbow-preschool-international" },
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "School",
      name: "Rainbow Preschool International",
      description: "Award-winning preschool in Thane for children aged 1.5–5.5 years. 100% female staff.",
      url: "https://rainbowinternationalschool.in/rainbow-preschool-international",
      address: { "@type": "PostalAddress", streetAddress: "Cosmos Arcade, Brahmand Phase 4", addressLocality: "Thane", addressRegion: "Maharashtra", postalCode: "400607", addressCountry: "IN" },
      telephone: "(022) 69105000",
    },
    renderBody: renderRainbowPreschool,
  },
  {
    path: "/academic-calendar",
    title: "Academic Calendar 2026–27",
    description: "View and download the academic calendar for Rainbow International School, Thane. Stay updated with important dates, events, and school activities.",
    keywords: "Rainbow school academic calendar, school calendar Thane, Rainbow International School events schedule",
    canonical: "https://rainbowinternationalschool.in/academic-calendar",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Academic Calendar", url: "https://rainbowinternationalschool.in/academic-calendar" },
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Academic Calendar 2026–27 — Rainbow International School",
      description: "School calendar with important dates, term dates, examinations, and events for academic year 2026–27.",
      url: "https://rainbowinternationalschool.in/academic-calendar",
    },
    renderBody: renderAcademicCalendar,
  },
  {
    path: "/academic-team",
    title: "Academic Team",
    description: "Meet Rainbow International School's dedicated academic team — highly qualified and experienced teachers, coaches, counsellors and support staff committed to student excellence.",
    keywords: "Rainbow school teachers, academic team Rainbow International School, school faculty Thane, CBSE school staff",
    canonical: "https://rainbowinternationalschool.in/academic-team",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "About Us", url: "https://rainbowinternationalschool.in/about-rainbow-international-school" },
      { name: "Academic Team", url: "https://rainbowinternationalschool.in/academic-team" },
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Academic Team — Rainbow International School",
      description: "150+ dedicated educators across all sections from Pre-Primary to Senior Secondary.",
      url: "https://rainbowinternationalschool.in/academic-team",
    },
    renderBody: renderAcademicTeam,
  },
  {
    path: "/our-philosophy",
    title: "Our Philosophy",
    description: "Rainbow International School's educational philosophy — built on four pillars: Competence, Conscience, Compassion, and Courage. Holistic development for every Rainbow student.",
    keywords: "Rainbow school philosophy, Rainbow International School education approach, school philosophy Thane CBSE",
    canonical: "https://rainbowinternationalschool.in/our-philosophy",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "About Us", url: "https://rainbowinternationalschool.in/about-rainbow-international-school" },
      { name: "Our Philosophy", url: "https://rainbowinternationalschool.in/our-philosophy" },
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "Our Philosophy — Rainbow International School",
      description: "Educational philosophy built on Competence, Conscience, Compassion, and Courage.",
      url: "https://rainbowinternationalschool.in/our-philosophy",
      publisher: { "@type": "Organization", name: "Rainbow International School", url: "https://rainbowinternationalschool.in" },
    },
    renderBody: renderOurPhilosophy,
  },
  {
    path: "/ris-vision-mission",
    title: "Vision & Mission | Rainbow International School",
    description: "Rainbow International School's Vision and Mission — nurturing curious, compassionate, and confident world citizens who uphold Indian values while making a global impact.",
    keywords: "Rainbow school vision mission, Rainbow International School values, school philosophy Thane",
    canonical: "https://rainbowinternationalschool.in/ris-vision-mission",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "About Us", url: "https://rainbowinternationalschool.in/about-rainbow-international-school" },
      { name: "Vision & Mission", url: "https://rainbowinternationalschool.in/ris-vision-mission" },
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "Vision & Mission — Rainbow International School",
      description: "The vision and mission of Rainbow International School — nurturing world citizens rooted in Indian values.",
      url: "https://rainbowinternationalschool.in/ris-vision-mission",
      publisher: { "@type": "Organization", name: "Rainbow International School", url: "https://rainbowinternationalschool.in" },
    },
    renderBody: renderVisionMission,
  },
  {
    path: "/chairpersons-note",
    title: "Chairperson's Note",
    description: "A message from the Chairperson of Rainbow International School, Thane — on the school's vision, values, and commitment to excellence in education.",
    keywords: "Rainbow school chairperson, Rainbow International School leadership message, chairperson note Thane school",
    canonical: "https://rainbowinternationalschool.in/chairpersons-note",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "About Us", url: "https://rainbowinternationalschool.in/about-rainbow-international-school" },
      { name: "Chairperson's Note", url: "https://rainbowinternationalschool.in/chairpersons-note" },
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "Chairperson's Note — Rainbow International School",
      description: "A message from the Chairperson on Rainbow's vision, journey, and commitment to education.",
      url: "https://rainbowinternationalschool.in/chairpersons-note",
      publisher: { "@type": "Organization", name: "Rainbow International School", url: "https://rainbowinternationalschool.in" },
    },
    renderBody: renderChairpersonsNote,
  },
  {
    path: "/photo-gallery",
    title: "Photo Gallery",
    description: "Browse the Rainbow International School photo gallery — academics, extracurriculars, sports, amenities, and achievements from our campus in Thane.",
    keywords: "Rainbow school photo gallery, school photos Thane, school campus photos Rainbow International",
    canonical: "https://rainbowinternationalschool.in/photo-gallery",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Photo Gallery", url: "https://rainbowinternationalschool.in/photo-gallery" },
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "ImageGallery",
      name: "Photo Gallery — Rainbow International School",
      description: "Photos from campus life, sports, academics, cultural events, and achievements at Rainbow International School, Thane.",
      url: "https://rainbowinternationalschool.in/photo-gallery",
      publisher: { "@type": "Organization", name: "Rainbow International School", url: "https://rainbowinternationalschool.in" },
    },
    renderBody: renderPhotoGallery,
  },
  {
    path: "/welcome-to-ris",
    title: "Welcome to Rainbow International School",
    description: "Welcome to Rainbow International School — founded in 2009, one of the finest CBSE-affiliated educational institutes in Thane with 3.5 acres campus and 3000+ students.",
    keywords: "Welcome Rainbow International School, about Rainbow school, Rainbow International School Thane",
    canonical: "https://rainbowinternationalschool.in/welcome-to-ris",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "About Us", url: "https://rainbowinternationalschool.in/about-rainbow-international-school" },
      { name: "Welcome to RIS", url: "https://rainbowinternationalschool.in/welcome-to-ris" },
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Welcome to Rainbow International School — Best CBSE School in Thane",
      description: "Welcome to Rainbow International School, founded in April 2009 — a CBSE-affiliated K–12 school on a 3.5-acre campus in Thane serving 3000+ students.",
      url: "https://rainbowinternationalschool.in/welcome-to-ris",
      about: {
        "@type": "EducationalOrganization",
        name: "Rainbow International School",
        foundingDate: "2009-04",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Cosmos Arcade, Brahmand Phase 4",
          addressLocality: "Thane",
          addressRegion: "Maharashtra",
          postalCode: "400607",
          addressCountry: "IN",
        },
        telephone: "+912269105000",
        hasCredential: "CBSE Affiliation No. 1130661",
      },
    },
    renderBody: renderWelcomeToRIS,
  },
  {
    path: "/schedule-appointment",
    title: "Schedule a Campus Visit | Rainbow International School Thane",
    description: "Book a campus visit or appointment with the Rainbow International School admissions team. Meet our faculty, tour the campus, and learn about admissions for 2026–27.",
    keywords: "schedule appointment Rainbow International School, campus visit CBSE school Thane, book school visit Brahmand Thane",
    canonical: "https://rainbowinternationalschool.in/schedule-appointment",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Contact Us", url: "https://rainbowinternationalschool.in/contact-us" },
      { name: "Schedule a Visit", url: "https://rainbowinternationalschool.in/schedule-appointment" },
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Schedule a Campus Visit — Rainbow International School",
      description: "Book a campus visit or appointment with the Rainbow International School admissions team in Thane.",
      url: "https://rainbowinternationalschool.in/schedule-appointment",
    },
    renderBody: renderScheduleAppointment,
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
