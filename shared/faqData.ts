/**
 * Shared FAQ content — single source of truth for both the visible React
 * pages and the server-side FAQPage JSON-LD injected into the raw HTML.
 *
 * Imported by:
 *   - client/src/pages/FAQs.tsx        (visible FAQ page)
 *   - client/src/pages/Admissions.tsx  (visible FAQ section)
 *   - server/pageTitles.ts             (FAQPage JSON-LD for /faqs and /admissions)
 */

export interface FaqLink {
  label: string;
  href: string;
}

export interface FaqItem {
  q: string;
  a: string;
  links?: FaqLink[];
}

export interface FaqCategory {
  id: string;
  title: string;
  faqs: FaqItem[];
}

/** All FAQs shown on /faqs, grouped by category. */
export const FAQ_PAGE_CATEGORIES: FaqCategory[] = [
  {
    id: "admissions",
    title: "Admissions",
    faqs: [
      { q: "What is the admission process at Rainbow International School?", a: "The admission process includes submitting an online application form, followed by an interaction session with the child and parents. For senior classes (Class 9 onwards), there is a written assessment. Applications are accepted on a first-come, first-served basis, subject to seat availability.", links: [{ label: "Apply Online", href: "/application-form" }, { label: "Schedule a Visit", href: "/schedule-appointment" }] },
      { q: "What is the age criteria for admission?", a: "For Nursery, the child should be 2.5 years old as on 31st March of the academic year. For Jr KG, the child should be 3.5 years, and for Sr KG, 4.5 years. For Class 1, the child must be 6 years old as on 31st March. Age criteria follow CBSE norms." },
      { q: "When do admissions open for the new academic year?", a: "Admissions for the academic year 2026–27 are currently open. We recommend applying early as seats fill up quickly, especially for Pre-Primary and Grade 1." },
      { q: "Is there a waiting list?", a: "Yes, once a class reaches full capacity, applicants are placed on a waiting list. Families on the waiting list are contacted if a seat becomes available." },
      { q: "Can my child join mid-year?", a: "Mid-year admissions are possible subject to seat availability. Please contact our admissions office to check current availability for the desired class." },
    ],
  },
  {
    id: "fees",
    title: "Fees",
    faqs: [
      { q: "What is the fee structure?", a: "The fee structure varies by grade level. Detailed fee information is shared during the admission interaction or upon request. Rainbow offers a transparent fee policy with no hidden charges." },
      { q: "Are there any sibling discounts?", a: "Yes, Rainbow International School offers a sibling discount for families enrolling more than one child. Details are available from the admissions office." },
      { q: "What are the payment options?", a: "Fees can be paid annually, semi-annually, or quarterly. Payment is accepted via bank transfer, cheque, or online payment. EMI options are not currently available." },
      { q: "Is the transport fee separate?", a: "Yes, the transport fee is charged separately based on the distance of pickup and drop. GPS-tracked buses cover 30+ routes across Thane.", links: [{ label: "Learn About Transport", href: "/amenities" }] },
    ],
  },
  {
    id: "academics",
    title: "Academics & Curriculum",
    faqs: [
      { q: "Which board is Rainbow International School affiliated to?", a: "Rainbow International School is affiliated to the Central Board of Secondary Education (CBSE), New Delhi. Our affiliation number is 1130661.", links: [{ label: "CBSE Public Disclosures", href: "/cbse-mandatory-public-disclosures" }] },
      { q: "What streams are available in Class 11–12?", a: "We offer three streams in the Senior Secondary section: Science (Physics, Chemistry, Mathematics/Biology), Commerce (Accountancy, Business Studies, Economics), and Humanities (Psychology, Sociology, Political Science, History).", links: [{ label: "Senior Secondary Section", href: "/senior-secondary-section" }] },
      { q: "What teaching methodology does the school follow?", a: "Rainbow follows a Multiple Intelligence-based pedagogy that combines experiential learning, project-based activities, digital integration, and collaborative learning. This ensures holistic development across all intelligences — linguistic, logical, spatial, musical, kinesthetic, interpersonal, intrapersonal, and naturalistic.", links: [{ label: "Our Philosophy", href: "/our-philosophy" }] },
      { q: "Does the school provide extra coaching for board exams?", a: "Yes, starting from Class 9, the school provides structured revision programmes, mock tests, doubt-clearing sessions, and personalised support to help students prepare for CBSE board examinations." },
      { q: "How does the school support students with learning difficulties?", a: "Rainbow has a dedicated counselling team that works with students who need additional academic or emotional support. Individualised learning plans, remedial classes, and parent counselling are part of our inclusive education approach." },
    ],
  },
  {
    id: "safety",
    title: "Safety & Security",
    faqs: [
      { q: "What safety measures are in place?", a: "The campus has 200+ CCTV cameras, trained security guards at all entry and exit points, fire safety systems, an on-campus infirmary with a paediatrician, card-based entry for parents, and GPS-tracked school buses with attendants on every route.", links: [{ label: "Safety & Security Details", href: "/safety-security" }] },
      { q: "Is there a school nurse or doctor?", a: "Yes, Rainbow has a full-time infirmary staffed by trained medical professionals. A visiting paediatrician is available for regular health check-ups and emergencies." },
      { q: "How does the school handle bullying?", a: "Rainbow has a zero-tolerance policy for bullying. The school counsellor conducts regular anti-bullying workshops. Any reported incidents are investigated promptly, and appropriate action is taken in coordination with parents." },
    ],
  },
  {
    id: "timings",
    title: "Timings & Calendar",
    faqs: [
      { q: "What are the school timings?", a: "Pre-Primary (Nursery to Sr KG): 8:30 AM to 12:30 PM. Primary (Class 1–5): 7:30 AM to 2:00 PM. Middle & Secondary (Class 6–12): 7:30 AM to 2:30 PM. Timings may vary slightly for special activities." },
      { q: "How many days a week does the school operate?", a: "The school operates Monday to Saturday. Saturdays typically have a shorter schedule and are used for enrichment activities, sports, or special programmes." },
      { q: "When does the academic year start?", a: "The academic year begins in June and ends in April, following the CBSE academic calendar. A detailed academic calendar is shared with parents at the start of the year.", links: [{ label: "Academic Calendar", href: "/academic-calendar" }] },
    ],
  },
  {
    id: "transport",
    title: "Transport",
    faqs: [
      { q: "Does the school provide bus transport?", a: "Yes, Rainbow operates a fleet of GPS-tracked school buses covering 30+ routes across all of Thane. Each bus has a trained attendant. Parents can track the bus location in real time via the school app." },
      { q: "What areas does the bus service cover?", a: "Bus routes cover all major areas across Thane. New routes are added based on demand. Please contact the transport office for route availability in your specific area." },
      { q: "Is the transport fee charged monthly or annually?", a: "Transport fees are charged along with the tuition fees on a quarterly or annual basis, depending on the payment plan chosen by the parent." },
    ],
  },
  {
    id: "extracurriculars",
    title: "Extracurriculars",
    faqs: [
      { q: "What extracurricular activities are available?", a: "Rainbow offers 30+ activities including swimming, skating, football, cricket, basketball, taekwondo, chess, robotics, coding, art, music, dance, drama, public speaking, MUN, and organic farming.", links: [{ label: "Extracurriculars", href: "/extracurriculars" }, { label: "Beyond the Classroom", href: "/beyond-the-classroom" }] },
      { q: "Are extracurricular activities included in the fees?", a: "Most in-school activities are included in the tuition fee. Specialised coaching programmes (e.g., advanced swimming, competitive sports, robotics) may have a nominal additional charge." },
      { q: "Does the school participate in inter-school competitions?", a: "Yes, students regularly participate and win at district, state, and national-level competitions in academics, sports, arts, and cultural events.", links: [{ label: "Awards & Achievements", href: "/awards-achievements" }] },
    ],
  },
  {
    id: "facilities",
    title: "Facilities",
    faqs: [
      { q: "What facilities does the campus have?", a: "The 3.5-acre campus includes smart classrooms, science and computer labs, a library, swimming pool, skating rink, football field, cricket ground, basketball and tennis courts, amphitheatre, art and music rooms, an organic farm, and a dedicated infirmary.", links: [{ label: "Amenities & Facilities", href: "/amenities" }] },
      { q: "Does the school have a cafeteria?", a: "Yes, Rainbow has a cafeteria that serves nutritious meals and snacks. The menu is curated to ensure balanced nutrition. Outside food vendors are not permitted." },
      { q: "Is there a library?", a: "Yes, the school has a well-stocked library with age-appropriate books across genres — fiction, non-fiction, reference, comics, and periodicals. Library periods are a regular part of the timetable." },
      { q: "Does the school use digital/smart classrooms?", a: "Yes, all classrooms from Class 1 onwards are equipped with interactive smart boards and digital learning tools. The pre-primary section uses age-appropriate audio-visual aids." },
    ],
  },
];

/** FAQ section shown on /admissions. */
export const ADMISSIONS_FAQS: FaqItem[] = [
  { q: "Which board is Rainbow International School affiliated to?",   a: "Rainbow International School Thane is affiliated to the Central Board of Secondary Education (CBSE), New Delhi. Affiliation No. 1130661." },
  { q: "Which classes are admissions open for in 2026-27?",           a: "Admissions are open for Nursery to Class 12 for the 2026-27 academic year, subject to seat availability per class." },
  { q: "What is the admission process at RIS?",                        a: "Submit an enquiry online or by phone → counsellor calls back → campus visit and counselling session → student interaction and document review → admission confirmation on fee payment." },
  { q: "Is school transport available?",                               a: "Yes. GPS-tracked school buses with trained attendants cover Brahmand, Ghodbunder Road, Manpada and 30+ routes across Thane." },
  { q: "What documents are required for admission?",                   a: "Birth certificate, Aadhaar (child and parent), passport photos, address proof, previous school transfer certificate, last two years' report cards, and a medical fitness certificate." },
  { q: "Is there an admission interaction or assessment?",             a: "For Nursery to Class 8 there is no written test — an informal interaction session is held. For Class 9 and above, a written assessment in core subjects is required." },
  { q: "How can parents book a campus visit?",                         a: "Book through the enquiry form on this page, call the admission desk at +91 82915 68972, or WhatsApp us. Campus visits are available Mon–Sat, 9 AM–5 PM." },
  { q: "What are the school timings?",                                 a: "School hours are Monday to Saturday, 9:00 AM to 6:00 PM (office). Academic hours for students vary by section; confirmed at the time of admission." },
  { q: "Are senior secondary streams available?",                      a: "Yes. Class 11 and 12 are offered in three CBSE streams: Science (PCM / PCB), Commerce, and Humanities, with JEE, NEET and CUET prep support." },
];

/** Flat list of every FAQ on /faqs (all categories). */
export const ALL_FAQS_PAGE_ITEMS: FaqItem[] = FAQ_PAGE_CATEGORIES.flatMap((c) => c.faqs);

/** FAQPage JSON-LD (with @context, ready to serialize into a script tag). */
export function buildFaqPageLd(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
