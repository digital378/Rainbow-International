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
<h2>Primary Section — Class 1 to 5</h2>
<p>The Primary Section at Rainbow International School builds a strong academic foundation while nurturing curiosity, creativity, and confidence. Our CBSE-aligned curriculum is delivered through experiential, project-based, and collaborative learning methods.</p>

<h2>Curriculum</h2>
<p>Subjects include English, Hindi, Mathematics, Environmental Science (EVS), Computer Science, Art, Music, and Physical Education. The curriculum integrates the Multiple Intelligence framework to address diverse learning styles.</p>

<h2>Key Features</h2>
<ul>
<li>Smart classrooms with interactive whiteboards</li>
<li>Dedicated science and computer labs</li>
<li>Library with 10,000+ age-appropriate books</li>
<li>Activity-based learning and project work</li>
<li>Regular assessments with detailed progress reports</li>
<li>Personalised attention with low teacher-student ratio</li>
</ul>

<h2>Extracurriculars</h2>
<p>Primary students participate in swimming, skating, football, cricket, art, music, dance, drama, yoga, and robotics. Inter-house and inter-school competitions build confidence and teamwork.</p>

<p>Explore our <a href="/pre-primary-school-thane">Pre-Primary</a> or <a href="/middle-school-section">Middle School</a> sections.</p>
</div>`;
}

function renderMiddleSchool(): string {
  return `
<div class="section">
<h2>Middle School Section — Class 6 to 8</h2>
<p>The Middle School years at Rainbow International School are a critical bridge between primary learning and secondary academics. Our programme deepens subject knowledge while developing analytical thinking, research skills, and independent learning habits.</p>

<h2>Subjects Offered</h2>
<p>English, Hindi, Sanskrit/French (third language), Mathematics, Science, Social Science, Computer Science, Art, Music, and Physical Education.</p>

<h2>Academic Approach</h2>
<ul>
<li>CBSE-aligned curriculum with experiential learning</li>
<li>Fully equipped Physics, Chemistry, and Biology labs</li>
<li>Computer lab with modern systems</li>
<li>Project-based assessments and collaborative learning</li>
<li>Career awareness and skill development programmes</li>
<li>Regular parent-teacher interactions</li>
</ul>

<h2>Beyond the Classroom</h2>
<p>Students engage in MUN, science exhibitions, robotics, coding, inter-school debates, sports tournaments, field trips, and community service. Leadership opportunities through student council and house captaincy prepare them for senior school.</p>

<p>Explore our <a href="/primary-section">Primary</a> or <a href="/secondary-section">Secondary</a> sections.</p>
</div>`;
}

function renderSecondary(): string {
  return `
<div class="section">
<h2>Secondary Section — Class 9 & 10</h2>
<p>The Secondary Section at Rainbow International School prepares students for the CBSE Class 10 Board Examinations with a rigorous, structured academic programme complemented by comprehensive co-curricular development.</p>

<h2>Subjects</h2>
<p>English, Hindi, Mathematics, Science (Physics, Chemistry, Biology), Social Science (History, Geography, Political Science, Economics), Computer Applications / Information Technology, and Physical Education.</p>

<h2>Board Exam Preparation</h2>
<ul>
<li>Structured study plans aligned to CBSE syllabus</li>
<li>Regular practice tests and mock examinations</li>
<li>Dedicated remedial and enrichment classes</li>
<li>Previous year paper analysis and exam strategy workshops</li>
<li>Personal mentoring and academic counselling</li>
</ul>

<h2>Results</h2>
<p>Rainbow International School has consistently delivered outstanding Class 10 Board results, with students scoring above 95% and many achieving perfect scores in individual subjects. Our first batch (2018–19) achieved a 100% pass rate.</p>

<h2>Career Guidance</h2>
<p>From Class 9, students receive structured career counselling to help them choose the right stream — Science, Commerce, or Humanities — for Class 11.</p>

<p>Explore our <a href="/middle-school-section">Middle School</a> or <a href="/senior-secondary-section">Senior Secondary</a> sections.</p>
</div>`;
}

function renderSeniorSecondary(): string {
  return `
<div class="section">
<h2>Senior Secondary Section — Class 11 & 12</h2>
<p>Rainbow International School offers a comprehensive Senior Secondary programme with three streams — Science, Commerce, and Humanities — preparing students for CBSE Class 12 Board Examinations and competitive entrance tests.</p>

<h2>Streams & Subjects</h2>
<h3>Science Stream</h3>
<p>Physics, Chemistry, Mathematics / Biology, English, Physical Education / Computer Science</p>

<h3>Commerce Stream</h3>
<p>Accountancy, Business Studies, Economics, English, Mathematics / Informatics Practices</p>

<h3>Humanities Stream</h3>
<p>History, Political Science, Economics / Psychology, English, Physical Education / Sociology</p>

<h2>Key Features</h2>
<ul>
<li>Advanced Physics, Chemistry, Biology, and Computer labs</li>
<li>Experienced faculty with subject expertise</li>
<li>Competitive exam preparation (JEE, NEET, CUET, CLAT)</li>
<li>Career counselling and college application support</li>
<li>Internship and industry exposure opportunities</li>
<li>Regular mock tests and performance analytics</li>
</ul>

<h2>Beyond Academics</h2>
<p>Senior students participate in MUN, debate, leadership programmes, community service, inter-school competitions, and career fairs. Class 12 students receive dedicated college counselling.</p>

<p>Explore our <a href="/secondary-section">Secondary Section</a> or <a href="/admissions">apply for admission</a>.</p>
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
<h2>Admissions 2026–27</h2>
<p>Admissions are now open at Rainbow International School, Thane for the academic year 2026–27. We welcome applications for all classes from Nursery to Class 12 (CBSE).</p>

<h2>Why Choose Rainbow International School?</h2>
<ul>
<li>3.5-acre campus in Brahmand Phase 4, Thane</li>
<li>CBSE-affiliated (No. 1130661) — Nursery to Class 12</li>
<li>3,000+ students, 200+ dedicated educators</li>
<li>Multiple Intelligence-based pedagogy</li>
<li>30+ extracurricular activities</li>
<li>Award-winning school — Best School in Thane (multiple years)</li>
</ul>

<h2>Admission Process</h2>
<ol>
<li><strong>Step 1 — Submit Application:</strong> Fill the online application form with your child's details and preferred class.</li>
<li><strong>Step 2 — Interaction Session:</strong> Attend a one-on-one interaction with our academic team. Class 9+ requires a written assessment.</li>
<li><strong>Step 3 — Document Verification:</strong> Submit original documents including birth certificate, Aadhaar, TC, and report cards.</li>
<li><strong>Step 4 — Confirmation:</strong> Complete fee payment and receive admission confirmation.</li>
</ol>

<h2>Age Criteria</h2>
<ul>
<li><strong>Nursery:</strong> 2.5 years (as on 31st March)</li>
<li><strong>Jr KG:</strong> 3.5 years</li>
<li><strong>Sr KG:</strong> 4.5 years</li>
<li><strong>Class 1:</strong> 6 years</li>
<li><strong>Class 2–8:</strong> Age appropriate as per CBSE norms</li>
<li><strong>Class 9+:</strong> Written assessment required</li>
</ul>

<h2>Documents Required</h2>
<ul>
<li>Birth Certificate (original + photocopy)</li>
<li>Aadhaar Card of child and parent</li>
<li>Transfer Certificate from previous school</li>
<li>Report card / mark sheet of last 2 years</li>
<li>4 passport-size photographs</li>
<li>Address proof and medical fitness certificate</li>
</ul>

<p>Contact our admissions desk at <strong>+91 82915 68972</strong> or <a href="/application-form">apply online</a>.</p>
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
    title: "Primary School in Thane — Class 1 to 5 CBSE | Rainbow International School",
    description: "Primary section (Class 1–5) at Rainbow International School, Thane. CBSE curriculum, smart classrooms, experiential learning, 30+ extracurriculars.",
    keywords: "primary school Thane, Class 1 to 5 CBSE Thane, best primary school Thane, CBSE primary Thane",
    canonical: "https://rainbowinternationalschool.in/primary-section",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Primary Section", url: "https://rainbowinternationalschool.in/primary-section" },
    ],
    jsonLd: { ...SCHOOL_LD, "@type": "School", department: { "@type": "EducationalOccupationalProgram", name: "Primary Section", educationalLevel: "Primary" } },
    renderBody: renderPrimary,
  },
  {
    path: "/middle-school-section",
    title: "Middle School in Thane — Class 6 to 8 CBSE | Rainbow International School",
    description: "Middle school section (Class 6–8) at Rainbow International School, Thane. CBSE curriculum, project-based learning, science labs, MUN, robotics.",
    keywords: "middle school Thane, Class 6 to 8 CBSE Thane, best middle school Thane, CBSE school Class 6 7 8 Thane",
    canonical: "https://rainbowinternationalschool.in/middle-school-section",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Middle School", url: "https://rainbowinternationalschool.in/middle-school-section" },
    ],
    jsonLd: { ...SCHOOL_LD, "@type": "School", department: { "@type": "EducationalOccupationalProgram", name: "Middle School Section", educationalLevel: "Middle School" } },
    renderBody: renderMiddleSchool,
  },
  {
    path: "/secondary-section",
    title: "Secondary School in Thane — Class 9 & 10 CBSE | Rainbow International School",
    description: "Secondary section (Class 9–10) at Rainbow International School, Thane. CBSE board exam prep, mock tests, career counselling, outstanding results.",
    keywords: "secondary school Thane, Class 9 10 CBSE Thane, CBSE board exam school Thane, Class 10 school Thane",
    canonical: "https://rainbowinternationalschool.in/secondary-section",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Secondary Section", url: "https://rainbowinternationalschool.in/secondary-section" },
    ],
    jsonLd: { ...SCHOOL_LD, "@type": "School", department: { "@type": "EducationalOccupationalProgram", name: "Secondary Section", educationalLevel: "Secondary" } },
    renderBody: renderSecondary,
  },
  {
    path: "/senior-secondary-section",
    title: "Senior Secondary in Thane — Class 11 & 12 Science Commerce Humanities | Rainbow International School",
    description: "Senior secondary (Class 11–12) at Rainbow International School, Thane. Science, Commerce, Humanities streams. JEE, NEET, CUET preparation. CBSE board.",
    keywords: "senior secondary school Thane, Class 11 12 Thane, Science Commerce Humanities Thane, CBSE Class 12 school Thane, JEE NEET school Thane",
    canonical: "https://rainbowinternationalschool.in/senior-secondary-section",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Senior Secondary", url: "https://rainbowinternationalschool.in/senior-secondary-section" },
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
    title: "School Admissions 2026-27 Thane — Nursery to Class 12 | Rainbow International School",
    description: "Admissions open at Rainbow International School, Thane for 2026-27. Nursery to Class 12, CBSE board. Age criteria, process, documents, and fee details.",
    keywords: "school admission Thane 2026, nursery admission Thane, CBSE school admission, Rainbow International School admission",
    canonical: "https://rainbowinternationalschool.in/admissions",
    breadcrumbs: [
      { name: "Home", url: "https://rainbowinternationalschool.in/" },
      { name: "Admissions 2026-27", url: "https://rainbowinternationalschool.in/admissions" },
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
  {
    path: "/career",
    title: "Career Opportunities | Rainbow International School",
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
    title: "Beyond the Classroom | Rainbow International School",
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
    title: "Extracurricular Activities | Rainbow International School",
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
    title: "Student Achievements | Rainbow International School",
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
    title: "Blogs | Rainbow International School",
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
    title: "Curriculum | Rainbow International School",
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
    title: "CBSE Public Disclosures | Rainbow International School — Affiliation No. 1130661",
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
    title: "Preschool (Age 1.5–5.5) Thane | Rainbow International School",
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
    title: "Academic Calendar 2026–27 | Rainbow International School",
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
    title: "Academic Team | Rainbow International School",
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
    title: "Our Philosophy | Rainbow International School",
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
    title: "Chairperson's Note | Rainbow International School",
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
    title: "Photo Gallery | Rainbow International School",
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
