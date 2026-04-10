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
<meta property="og:image" content="https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad.jpg"/>
<meta property="og:locale" content="en_IN"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${e(cfg.title)}"/>
<meta name="twitter:description" content="${e(cfg.description)}"/>
<meta name="twitter:image" content="https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad.jpg"/>
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
  url: "https://www.rainbowinternationalschool.in/",
  address: { "@type": "PostalAddress", streetAddress: "Cosmos Arcade, Brahmand Phase 4", addressLocality: "Thane", addressRegion: "Maharashtra", postalCode: "400607", addressCountry: "IN" },
  telephone: "+91-82915-68972",
  foundingDate: "2009-04-01",
  numberOfStudents: "3000",
};

const pages: PageSSRConfig[] = [
  {
    path: "/about-rainbow-international-school",
    title: "About Rainbow International School — Best CBSE School in Thane",
    description: "Rainbow International School, founded in 2009, is a top-rated CBSE K–12 school in Thane. 3.5-acre campus, 3000+ students, award-winning education from Nursery to Class 12.",
    keywords: "about Rainbow International School, CBSE school Thane, best school Thane, K-12 school Thane, international school Thane",
    canonical: "https://www.rainbowinternationalschool.in/about-rainbow-international-school",
    breadcrumbs: [
      { name: "Home", url: "https://www.rainbowinternationalschool.in/" },
      { name: "About Us", url: "https://www.rainbowinternationalschool.in/about-rainbow-international-school" },
    ],
    jsonLd: SCHOOL_LD,
    renderBody: renderAbout,
  },
  {
    path: "/pre-primary-school-thane",
    title: "Pre-Primary School in Thane — Nursery, Jr KG, Sr KG | Rainbow International School",
    description: "Best pre-primary school in Thane. Nursery, Jr KG, Sr KG with play-based learning, 100% female staff, CBSE-aligned curriculum. Admissions open for 2026–27.",
    keywords: "pre-primary school Thane, nursery school Thane, Jr KG admission Thane, best preschool Thane, kindergarten Thane",
    canonical: "https://www.rainbowinternationalschool.in/pre-primary-school-thane",
    breadcrumbs: [
      { name: "Home", url: "https://www.rainbowinternationalschool.in/" },
      { name: "Pre-Primary Section", url: "https://www.rainbowinternationalschool.in/pre-primary-school-thane" },
    ],
    jsonLd: { ...SCHOOL_LD, "@type": "School", department: { "@type": "EducationalOccupationalProgram", name: "Pre-Primary Section", educationalLevel: "Preschool" } },
    renderBody: renderPrePrimary,
  },
  {
    path: "/primary-section",
    title: "Primary School in Thane — Class 1 to 5 CBSE | Rainbow International School",
    description: "Primary section (Class 1–5) at Rainbow International School, Thane. CBSE curriculum, smart classrooms, experiential learning, 30+ extracurriculars.",
    keywords: "primary school Thane, Class 1 to 5 CBSE Thane, best primary school Thane, CBSE primary Thane",
    canonical: "https://www.rainbowinternationalschool.in/primary-section",
    breadcrumbs: [
      { name: "Home", url: "https://www.rainbowinternationalschool.in/" },
      { name: "Primary Section", url: "https://www.rainbowinternationalschool.in/primary-section" },
    ],
    jsonLd: { ...SCHOOL_LD, "@type": "School", department: { "@type": "EducationalOccupationalProgram", name: "Primary Section", educationalLevel: "Primary" } },
    renderBody: renderPrimary,
  },
  {
    path: "/middle-school-section",
    title: "Middle School in Thane — Class 6 to 8 CBSE | Rainbow International School",
    description: "Middle school section (Class 6–8) at Rainbow International School, Thane. CBSE curriculum, project-based learning, science labs, MUN, robotics.",
    keywords: "middle school Thane, Class 6 to 8 CBSE Thane, best middle school Thane, CBSE school Class 6 7 8 Thane",
    canonical: "https://www.rainbowinternationalschool.in/middle-school-section",
    breadcrumbs: [
      { name: "Home", url: "https://www.rainbowinternationalschool.in/" },
      { name: "Middle School", url: "https://www.rainbowinternationalschool.in/middle-school-section" },
    ],
    jsonLd: { ...SCHOOL_LD, "@type": "School", department: { "@type": "EducationalOccupationalProgram", name: "Middle School Section", educationalLevel: "Middle School" } },
    renderBody: renderMiddleSchool,
  },
  {
    path: "/secondary-section",
    title: "Secondary School in Thane — Class 9 & 10 CBSE | Rainbow International School",
    description: "Secondary section (Class 9–10) at Rainbow International School, Thane. CBSE board exam prep, mock tests, career counselling, outstanding results.",
    keywords: "secondary school Thane, Class 9 10 CBSE Thane, CBSE board exam school Thane, Class 10 school Thane",
    canonical: "https://www.rainbowinternationalschool.in/secondary-section",
    breadcrumbs: [
      { name: "Home", url: "https://www.rainbowinternationalschool.in/" },
      { name: "Secondary Section", url: "https://www.rainbowinternationalschool.in/secondary-section" },
    ],
    jsonLd: { ...SCHOOL_LD, "@type": "School", department: { "@type": "EducationalOccupationalProgram", name: "Secondary Section", educationalLevel: "Secondary" } },
    renderBody: renderSecondary,
  },
  {
    path: "/senior-secondary-section",
    title: "Senior Secondary in Thane — Class 11 & 12 Science Commerce Humanities | Rainbow International School",
    description: "Senior secondary (Class 11–12) at Rainbow International School, Thane. Science, Commerce, Humanities streams. JEE, NEET, CUET preparation. CBSE board.",
    keywords: "senior secondary school Thane, Class 11 12 Thane, Science Commerce Humanities Thane, CBSE Class 12 school Thane, JEE NEET school Thane",
    canonical: "https://www.rainbowinternationalschool.in/senior-secondary-section",
    breadcrumbs: [
      { name: "Home", url: "https://www.rainbowinternationalschool.in/" },
      { name: "Senior Secondary", url: "https://www.rainbowinternationalschool.in/senior-secondary-section" },
    ],
    jsonLd: { ...SCHOOL_LD, "@type": "School", department: { "@type": "EducationalOccupationalProgram", name: "Senior Secondary Section", educationalLevel: "Senior Secondary" } },
    renderBody: renderSeniorSecondary,
  },
  {
    path: "/contact-us",
    title: "Contact Rainbow International School Thane — Phone, Email, Address",
    description: "Contact Rainbow International School, Thane. Phone: +91 82915 68972. Email: info@rainbowinternationalschool.in. Address: Cosmos Arcade, Brahmand Phase 4, Thane 400607.",
    keywords: "contact Rainbow International School, school phone number Thane, school address Thane, Rainbow school email, visit campus Thane",
    canonical: "https://www.rainbowinternationalschool.in/contact-us",
    breadcrumbs: [
      { name: "Home", url: "https://www.rainbowinternationalschool.in/" },
      { name: "Contact Us", url: "https://www.rainbowinternationalschool.in/contact-us" },
    ],
    jsonLd: SCHOOL_LD,
    renderBody: renderContact,
  },
  {
    path: "/amenities",
    title: "School Amenities & Facilities — 3.5-Acre Campus | Rainbow International School Thane",
    description: "Explore world-class amenities at Rainbow International School, Thane. Smart classrooms, science labs, swimming pool, skating rink, amphitheatre, library, organic farm.",
    keywords: "school amenities Thane, school facilities Thane, school with swimming pool Thane, best campus school Thane, school infrastructure Thane",
    canonical: "https://www.rainbowinternationalschool.in/amenities",
    breadcrumbs: [
      { name: "Home", url: "https://www.rainbowinternationalschool.in/" },
      { name: "Amenities & Facilities", url: "https://www.rainbowinternationalschool.in/amenities" },
    ],
    jsonLd: SCHOOL_LD,
    renderBody: renderAmenities,
  },
  {
    path: "/awards-achievements",
    title: "Awards & Achievements — Best School in Thane | Rainbow International School",
    description: "Rainbow International School awards: Best School in Thane, British Council ISA, Google for Education, Fit India. View our complete recognition list.",
    keywords: "best school Thane awards, school achievements Thane, British Council school Thane, award winning school Thane",
    canonical: "https://www.rainbowinternationalschool.in/awards-achievements",
    breadcrumbs: [
      { name: "Home", url: "https://www.rainbowinternationalschool.in/" },
      { name: "Awards & Achievements", url: "https://www.rainbowinternationalschool.in/awards-achievements" },
    ],
    jsonLd: SCHOOL_LD,
    renderBody: renderAwards,
  },
  {
    path: "/safety-security",
    title: "School Safety & Security — 200+ CCTV, GPS Buses | Rainbow International School Thane",
    description: "Comprehensive safety at Rainbow International School, Thane. 200+ CCTV cameras, card-based entry, infirmary, GPS-tracked buses, trained security, fire safety.",
    keywords: "school safety Thane, safe school Thane, CCTV school Thane, school security Thane, school with nurse Thane",
    canonical: "https://www.rainbowinternationalschool.in/safety-security",
    breadcrumbs: [
      { name: "Home", url: "https://www.rainbowinternationalschool.in/" },
      { name: "Safety & Security", url: "https://www.rainbowinternationalschool.in/safety-security" },
    ],
    jsonLd: SCHOOL_LD,
    renderBody: renderSafety,
  },
  {
    path: "/admissions",
    title: "School Admissions 2026-27 Thane — Nursery to Class 12 | Rainbow International School",
    description: "Admissions open at Rainbow International School, Thane for 2026-27. Nursery to Class 12, CBSE board. Age criteria, process, documents, and fee details.",
    keywords: "school admission Thane 2026, nursery admission Thane, CBSE school admission, Rainbow International School admission",
    canonical: "https://www.rainbowinternationalschool.in/admissions",
    breadcrumbs: [
      { name: "Home", url: "https://www.rainbowinternationalschool.in/" },
      { name: "Admissions 2026-27", url: "https://www.rainbowinternationalschool.in/admissions" },
    ],
    jsonLd: SCHOOL_LD,
    renderBody: renderAdmissions,
  },
  {
    path: "/fee-structure",
    title: "CBSE School Fee Structure Thane 2026-27 | Rainbow International School",
    description: "Fee structure details for Rainbow International School, Thane — Nursery to Class 12 CBSE. Transparent fees, sibling concessions, quarterly payment.",
    keywords: "CBSE school fees Thane, school fee structure Thane, Rainbow International School fees, nursery school fees Thane",
    canonical: "https://www.rainbowinternationalschool.in/fee-structure",
    breadcrumbs: [
      { name: "Home", url: "https://www.rainbowinternationalschool.in/" },
      { name: "Fee Structure", url: "https://www.rainbowinternationalschool.in/fee-structure" },
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
    canonical: "https://www.rainbowinternationalschool.in/school-near-brahmand-thane",
    breadcrumbs: [
      { name: "Home", url: "https://www.rainbowinternationalschool.in/" },
      { name: "School Near Brahmand", url: "https://www.rainbowinternationalschool.in/school-near-brahmand-thane" },
    ],
    jsonLd: { ...SCHOOL_LD, areaServed: "Brahmand, Thane" },
    renderBody: renderLocalityBrahmand,
  },
  {
    path: "/school-near-ghodbunder-road-thane",
    title: "Best School Near Ghodbunder Road Thane — CBSE K–12 | Rainbow International School",
    description: "Rainbow International School — top CBSE school near Ghodbunder Road, Thane. 8 min from GB Road. Bus routes covering Patlipada, Waghbil, Kavesar.",
    keywords: "school near Ghodbunder Road, best school GB Road Thane, CBSE school Ghodbunder Road",
    canonical: "https://www.rainbowinternationalschool.in/school-near-ghodbunder-road-thane",
    breadcrumbs: [
      { name: "Home", url: "https://www.rainbowinternationalschool.in/" },
      { name: "School Near Ghodbunder Road", url: "https://www.rainbowinternationalschool.in/school-near-ghodbunder-road-thane" },
    ],
    jsonLd: { ...SCHOOL_LD, areaServed: "Ghodbunder Road, Thane" },
    renderBody: renderLocalityGhodbunder,
  },
  {
    path: "/school-near-manpada-thane",
    title: "Best School Near Manpada Thane — CBSE Nursery to Class 12 | Rainbow International School",
    description: "Rainbow International School — top CBSE school near Manpada, Thane. 5 min from Manpada Junction. Nursery to Class 12, 3.5-acre campus.",
    keywords: "school near Manpada Thane, best school Manpada, CBSE school Manpada Thane",
    canonical: "https://www.rainbowinternationalschool.in/school-near-manpada-thane",
    breadcrumbs: [
      { name: "Home", url: "https://www.rainbowinternationalschool.in/" },
      { name: "School Near Manpada", url: "https://www.rainbowinternationalschool.in/school-near-manpada-thane" },
    ],
    jsonLd: { ...SCHOOL_LD, areaServed: "Manpada, Thane" },
    renderBody: renderLocalityManpada,
  },
  {
    path: "/school-readiness-quiz",
    title: "School Readiness Quiz — Is My Child Ready for Grade 1? | Rainbow International School",
    description: "Take our free 10-question school readiness quiz to find out if your child is prepared for Grade 1. Covers academic, social, emotional, physical, and independence skills.",
    keywords: "school readiness quiz, is my child ready for school, grade 1 readiness test, school readiness checklist, child development assessment",
    canonical: "https://www.rainbowinternationalschool.in/school-readiness-quiz",
    breadcrumbs: [
      { name: "Home", url: "https://www.rainbowinternationalschool.in/" },
      { name: "School Readiness Quiz", url: "https://www.rainbowinternationalschool.in/school-readiness-quiz" },
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
    canonical: "https://www.rainbowinternationalschool.in/top-schools-in-thane",
    breadcrumbs: [
      { name: "Home", url: "https://www.rainbowinternationalschool.in/" },
      { name: "Top Schools in Thane", url: "https://www.rainbowinternationalschool.in/top-schools-in-thane" },
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
    canonical: "https://www.rainbowinternationalschool.in/testimonials",
    breadcrumbs: [
      { name: "Home", url: "https://www.rainbowinternationalschool.in/" },
      { name: "Testimonials", url: "https://www.rainbowinternationalschool.in/testimonials" },
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
    canonical: "https://www.rainbowinternationalschool.in/faqs",
    breadcrumbs: [
      { name: "Home", url: "https://www.rainbowinternationalschool.in/" },
      { name: "FAQs", url: "https://www.rainbowinternationalschool.in/faqs" },
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
