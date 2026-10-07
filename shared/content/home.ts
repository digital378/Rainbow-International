// Canonical homepage copy. Visual assets, icons and styling stay in the components.
const SCHOOL_NAME = "Rainbow International School";
const VISIT = { label: "Book a Campus Visit", href: "/admissions" };
const APPLY = { label: "Apply Now", href: "/application-form" };
const AWARDS_LINK = { label: "View All Awards", href: "/awards-achievements" };

const description = "Choosing a CBSE school in Thane? Rainbow International School, Brahmand: KG to Class 12, Spanish KG to Grade 8. Admissions 2027-28: +91 82915 68972.";
export const HOME_SEO = {
  title: "CBSE School in Thane West | Rainbow International School",
  description,
  ogTitle: "Rainbow International School | CBSE School in Thane West since 2009",
  ogDescription: description,
  ogImage: "https://rainbowinternationalschool.in/opengraph.jpg",
  canonical: "https://rainbowinternationalschool.in/",
  keywords: "CBSE school in Thane, CBSE school in Thane West, school in Brahmand Thane, CBSE school near Ghodbunder Road, KG to Class 12 school in Thane",
};

export const HOME_HERO = {
  badge: "Check Seat Availability 2027–28",
  titleLines: ["CBSE School", "in Thane West", "KG to Class 12"],
  subLine: "Admissions Open 2027–28 at Rainbow International School.",
  intro: "CBSE school in Brahmand, Thane West since 2009: a 3.5-acre campus, swimming pool, science labs and GPS-enabled buses.",
  trustChips: [
    { num: "CBSE", label: "Affiliated · #1130661" },
    { num: "Since 2009", label: "Established" },
    { num: "3.5 Acres", label: "Campus" },
    { num: "3,000+", label: "Students" },
  ],
  buttons: [VISIT, APPLY],
  quickLinks: [
    { label: "Admissions 2027–28", href: "/admissions" },
    { label: "Fee Structure", href: "/fee-structure" },
    { label: "Primary School", href: "/primary-section" },
    { label: "Senior Secondary", href: "/senior-secondary-section" },
    { label: "CBSE Disclosures", href: "/cbse-mandatory-public-disclosures" },
  ],
  formFootnote: "Mon–Sat · 9 AM–6 PM · No entrance test for KG–Class 8",
};

export const HOME_SEATS = {
  title: "Seat Availability — 2027–28",
  subtitle: "Rainbow International School, Thane West",
  beforePhone: "Seats for 2027–28 are confirmed class by class by our admissions office. Call or WhatsApp ",
  phone: "+91 82915 68972",
  phoneHref: "tel:+918291568972",
  afterPhone: " with your child's class (KG to Class 12) to check availability.",
  office: "Admissions office: Mon–Sat, 9 am–6 pm.",
  visit: VISIT,
};

export const HOME_AWARDS_INTRO = {
  eyebrow: "Recognised & Awarded",
  titleParts: ["Welcome To Rainbow", "International School"],
  paragraph: "Our recognitions include Best Dynamic School 2026 at the Maharashtra Educators Summit, the India Today award for Excellence in CBSE Education (2017) and Scoonews Emerging School of the Year, West India (2022).",
  button: AWARDS_LINK,
};

export const HOME_JOURNEY = {
  eyebrow: "Simple & Transparent",
  title: "Your Admission Journey at RIS",
  sub: "Five straightforward steps from your first enquiry to your child's first day of school.",
  stepLabel: "Step",
  steps: [
    { step: "01", title: "Submit Enquiry", desc: "Share your basic details through our online form, by calling the admissions desk, or via WhatsApp." },
    { step: "02", title: "Counsellor Call-Back", desc: "Our admissions team calls you to understand your child's class, location and requirements." },
    { step: "03", title: "Campus Visit", desc: "Visit our 3.5-acre Brahmand campus, meet the team and see the school environment first-hand." },
    { step: "04", title: "Interaction & Documents", desc: "No entrance test for KG to Class 8: a friendly interaction and a document review." },
    { step: "05", title: "Admission Confirmed", desc: "Complete the fee process, receive your admission confirmation and get onboarding support." },
  ],
  visit: VISIT,
};

const THEATRE_TITLE_PARTS = ["The Rainbow", "Theatre"];
export const HOME_THEATRE = {
  eyebrow: "A Glimpse into Life at RIS",
  title: THEATRE_TITLE_PARTS.join(" "),
  titleParts: THEATRE_TITLE_PARTS,
  sub: "See the moments that make our campus feel like home.",
  instagram: {
    label: "Visit our Instagram",
    href: "https://www.instagram.com/rainbowinternationalschool/",
  },
};

export const HOME_WHY = {
  eyebrow: "Why Choose Us",
  title: "Why Parents Choose",
  titleAccent: SCHOOL_NAME,
  sub: "A school that cares as much about character as it does about academic results — right here in Thane West.",
  cards: [
    { title: "CBSE Affiliated Curriculum", desc: "CBSE No. 1130661. Board-recognised curriculum from KG through Class 12, with Spanish from KG to Grade 8." },
    { title: "KG to Class 12 Under One Roof", desc: "No school switches. One campus, one community for the complete K–12 learning journey." },
    { title: "3.5-Acre Green Campus", desc: "Swimming pool, amphitheatre, sports facilities, organic garden and science labs on one Brahmand campus." },
    { title: "Strong Academics & Co-curricular Learning", desc: "AC classrooms with smart boards; Physics, Chemistry, Biology, IT and Maths labs; project-based work." },
    { title: "Safe & Caring Environment", desc: "CCTV surveillance, a 100% female staff team and the school's own GPS-enabled buses." },
    { title: "Transport & Parent Communication", desc: "In-house GPS-enabled buses for homes within 10 km. Admissions help on call and WhatsApp." },
  ],
  stats: [
    { display: "Since 2009", label: "Established" },
    { display: "3,000+", label: "Students" },
    { display: "3.5 Acres", label: "Campus" },
    { display: "CBSE", label: "Affiliation #1130661" },
  ],
  visit: VISIT,
  learnMore: { label: "Learn More", href: "/about-rainbow-international-school" },
};

export const HOME_ACADEMICS = {
  eyebrow: "Academics",
  title: "Academic Programmes",
  titleAccent: "at a Glance",
  sub: "From KG to Class 12 — a complete CBSE learning journey under one roof.",
  explore: "Explore",
  enquire: "Enquire for this Grade",
  cards: [
    { label: "Pre-Primary", grade: "Jr. KG · Sr. KG", concern: "Starting school is a big milestone.", advantage: "Play-based, activity-led learning with a 100% female staff team, Spanish from KG and a 9:30 am–12:30 pm day.", href: "/pre-primary-school-thane" },
    { label: "Primary", grade: "Class I – V", concern: "Building the right foundation matters.", advantage: "CBSE-aligned literacy, numeracy, science and Spanish, with co-curriculars built into a 7:30 am–1:00 pm day.", href: "/primary-section" },
    { label: "Middle School", grade: "Class VI – VIII", concern: "The tween years need structure and stimulation.", advantage: "Critical thinking, project work, science labs, Spanish up to Grade 8 and a full co-curricular calendar.", href: "/middle-school-section" },
    { label: "Secondary", grade: "Class IX – X", concern: "Board prep without burning out.", advantage: "Structured CBSE Class 10 preparation with periodic tests and pre-boards. 100% Class 10 result in 2018‑19.", href: "/secondary-section" },
    { label: "Senior Secondary", grade: "Class XI – XII", concern: "The right stream, the right support.", advantage: "Science, Commerce and Humanities streams in a 1:00–6:00 pm shift, with Physics, Chemistry, Biology, IT and Maths labs.", href: "/senior-secondary-section" },
  ],
};

export const HOME_PEDAGOGY = {
  eyebrow: "Our Methodology",
  title: "Our Pedagogy",
  sub: "Guiding light for achieving milestones in an evolving world.",
  tabs: [
    { label: "Technology", title: "Technology in Every Classroom", description: "E-learning tools for enhanced learning, memory, and future-readiness.", points: ["Smart boards in every classroom", "Digital and e-learning resources", "Technology-aided CBSE curriculum", "Enhanced memory and retention tools"] },
    { label: "Extracurricular", title: "Rich Extracurricular Life", description: "Annual cultural activities, clubs, exhibitions, music, art, organic farming and much more.", points: ["Annual cultural and sports events", "Subject clubs and exhibitions", "Music, art & creative programmes", "Organic farming and eco projects"] },
    { label: "Personality", title: "Personality Development", description: "Being mindful of etiquette, teamwork, and self-confidence every single day.", points: ["Etiquette and social skills training", "Collaborative team-building projects", "Public speaking & self-confidence", "Leadership & responsibility"] },
    { label: "Sensitivity", title: "Philosophy of Sensitivity", description: "Incorporating social and environmental awareness into daily learning.", points: ["Social awareness programmes", "Environmental responsibility", "Empathy and compassion building", "Anti-bullying and inclusion initiatives"] },
  ],
};

export const HOME_DISCOVER = {
  eyebrow: "Life at Rainbow",
  title: "Let's Discover Rainbow!",
  sub: "Committed to educating, strengthening, and nurturing every student — and empowering lifelong learners.",
  cards: [
    { title: "Awards & Accomplishments", description: "Awards since 2017, including Best Dynamic School 2026 (Maharashtra Educators Summit), India Today (2017) and Scoonews (2022).", href: "/awards-achievements", tag: "Recognition" },
    { title: "Amenities & Facilities", description: "Swimming pool, amphitheatre, AC classrooms, smart boards and five labs (Physics, Chemistry, Biology, IT, Maths) on our 3.5-acre campus.", href: "/amenities", tag: "Campus" },
    { title: "Student Achievements", description: "Student accomplishments are acknowledged and honoured. See our students' results and achievements here.", href: "/student-achievements", tag: "Excellence" },
    { title: "Safety & Security", description: "Student safety and well-being come first, with CCTV surveillance and GPS-enabled school buses.", href: "/safety-security", tag: "Wellbeing" },
  ],
};

export const HOME_NEIGHBOURHOOD = {
  eyebrow: "Location & Access",
  title: "A CBSE School Close to Home in Thane West",
  sub: "Located in Brahmand, Thane West, Rainbow International School is a short drive from most nearby residential areas — making the daily commute easy for families.",
  features: [
    { title: "Central Thane Location", desc: "Situated in Brahmand Phase 4, Thane West, easily reached from nearby Thane neighbourhoods." },
    { title: "In-house School Buses", desc: "GPS-enabled school buses run by the school for homes within 10 km of the campus." },
    { title: "3.5-Acre Green Campus", desc: "Open-air play areas, swimming pool, organic garden and amphitheatre — all within the city." },
    { title: "Section-wise Timings", desc: "KG 9:30 am–12:30 pm, Class 1–10 7:30 am–1:00 pm, Class 11–12 1:00–6:00 pm." },
  ],
  areaTitle: "How Far Are We From You?",
  drive: "",
  areas: [
    { name: "Brahmand", time: "Within 10 km" },
    { name: "Hiranandani Estate", time: "Within 10 km" },
    { name: "Manpada", time: "Within 10 km" },
    { name: "Ghodbunder Road", time: "Within 10 km" },
    { name: "Patlipada", time: "Within 10 km" },
    { name: "Kavesar", time: "Within 10 km" },
    { name: "Pokhran Road", time: "Within 10 km" },
    { name: "Kolshet", time: "Within 10 km" },
  ],
  address: "Cosmos Arcade, Brahmand Phase 4, Thane West 400607",
  buttons: [
    { label: "Check Transport", href: "/amenities" },
    VISIT,
    { label: "Get Directions", href: "https://maps.google.com/?q=Rainbow+International+School+Thane" },
  ],
};

export const HOME_BEYOND = {
  eyebrow: "Extra Curricular",
  titleParts: ["Beyond The", "Classroom"],
  intro: "The real aim of education is not only knowledge but also",
  emphasis: "ACTION.",
  paragraph: "We provide a rigorous, comprehensive and cohesive learning programme that is designed to meet the social, physical and cultural needs of our entire student community — preparing them for the real world.",
  activities: ["Tours & Visits", "Exhibitions", "Subject Clubs", "Promoting Green", "Dignity of Labour", "Arts & Culture"],
  button: { label: "Know More", href: "/beyond-the-classroom" },
  badgeLabel: "CBSE school since",
  badgeValue: "2009",
};

const PARENT_LOCATION = "Parent · Rainbow International School";
export const HOME_TESTIMONIALS = {
  eyebrow: "Parents' Corner",
  title: "What Parents Say About RIS",
  sub: "Authentic voices from our school community.",
  rating: "4.7",
  ratingLabel: "· 130 Google Reviews",
  button: { label: "Speak to an Admissions Counsellor", href: "/admissions" },
  reviews: [
    { name: "Mark D'Souza", location: PARENT_LOCATION, review: "It's a great educational establishment to entrust your kids to, with an excellent infrastructure and warm-hearted, friendly and cooperative staff. I will recommend Rainbow International School for your kids.", initials: "MD" },
    { name: "Mohan Ramaswamy", location: PARENT_LOCATION, review: "Good school, caring teachers, extremely supportive staff who put in a lot of effort. It's always a partnership between institutions and parents to give the best to children, and it has worked well for us. Keep up the good work!", initials: "MR" },
    { name: "Ruchi Verma", location: PARENT_LOCATION, review: "I will recommend this school. It gave us so much in terms of values and it is very well organized. Teachers communicate wonderfully and the picnic was beyond expectations — so well organized!", initials: "RV" },
    { name: "Ratish Pradhan", location: PARENT_LOCATION, review: "We are very happy with the school, authorities and the management. Teachers are nice and ensure all kids get the required attention. Extracurricular activities are also well looked after.", initials: "RP" },
    { name: "Alok Srivastava", location: PARENT_LOCATION, review: "A progressive school with very supportive management. Teachers and support staff are very cooperative. Most importantly, if there are any issues, the school always puts forward an issue-resolving approach.", initials: "AS" },
    { name: "Anuja Pradhan", location: PARENT_LOCATION, review: "Highly recommended. Most lively atmosphere. The warmth makes every child comfortable. Practical activities, great hygiene — undoubtedly the best school in Thane.", initials: "AP" },
    { name: "Surabhi Trivedi", location: PARENT_LOCATION, review: "Feeling privileged to share my view. Just one word — Fantastic! The teachers are professional, caring and well organized. Infrastructure is outstanding. Children grow intellectually and in co-curricular activities.", initials: "ST" },
    { name: "Dhaval Lodaya", location: PARENT_LOCATION, review: "I would highly recommend Rainbow International School without hesitation. RIS gave my child a stellar foundation and a nurturing environment that made the school an extension of our family.", initials: "DL" },
  ],
};

export const HOME_CONTACT = {
  title: "Book a Campus Tour",
  introBeforeBreak: "We'd love to welcome you to Rainbow International School!",
  introBeforePhone: "Please call us at",
  phone: HOME_SEATS.phone,
  phoneHref: HOME_SEATS.phoneHref,
  introAfterPhone: "to schedule your visit before arriving on campus. Alternatively, fill the form below and our Admission Counsellor will connect with you to arrange a tour.",
  thankYou: "We've received your request. Our admissions team will contact you during office hours (Mon–Sat, 9 am–6 pm).",
  address: "Cosmos Arcade, Brahmand Phase 4, Thane West, Maharashtra 400607",
  email: "admin@rainbowinternationalschool.in",
};

export const HOME_QUICK_ANSWER_HEADINGS = {
  title: "Quick answer",
  faqTitle: "Frequently asked questions",
};
export const HOME_QUICK_ANSWER = "Rainbow International School is a CBSE-affiliated school (No. 1130661) in Brahmand, Thane West, founded in 2009 on a 3.5-acre campus. It teaches KG to Class 12, with Spanish from KG to Grade 8, Science, Commerce and Humanities in Classes 11–12, and its own GPS-enabled buses for homes within 10 km. Admissions for 2027–28 are open: call or WhatsApp +91 82915 68972.";
export const HOME_CBSE_GUIDE_LINK = {
  text: "How to choose a CBSE school in Thane West",
  href: "/cbse-schools-in-thane-west",
};

export const HOME_FAQS = [
  { q: "Is Rainbow International School a CBSE school in Thane?", a: "Yes. Rainbow International School is affiliated to CBSE, New Delhi (Affiliation No. 1130661, School Code 30562) and has taught in Brahmand, Thane West since 2009." },
  { q: "Which is the best CBSE school in Thane for my child?", a: `It depends on what your family needs. Compare schools on: the CBSE affiliation number (check it on the CBSE SARAS portal), distance and bus cover from your home, timings for your child's class, the streams offered in Classes 11–12, the facilities you see on a campus visit, and fees confirmed in writing. At Rainbow International School you can check all of these in one visit: Affiliation No. 1130661, buses within 10 km and three streams in Classes 11–12. Read our guide: ${HOME_CBSE_GUIDE_LINK.text}.`, answerLink: HOME_CBSE_GUIDE_LINK },
  { q: "Which classes are admissions open for in 2027–28?", a: "Admissions for 2027–28 are open from KG (Jr KG and Sr KG) to Class 12, subject to seat availability in each class." },
  { q: "What is the age criteria for admission?", a: "Jr KG: 3.5 to 4.5 years. Sr KG: 4.5 to 5.5 years. Class 1: minimum 6 years (6 to 7 years). Later classes follow in one-year steps, as per CBSE norms." },
  { q: "Is there an entrance test?", a: "There is no entrance test for KG to Class 8: children have a friendly interaction and documents are reviewed. For Class 9 and above, the admissions office explains the process for your child's class." },
  { q: "What are the school timings?", a: "KG: 9:30 am to 12:30 pm. Class 1 to 10: 7:30 am to 1:00 pm. Class 11 and 12: 1:00 pm to 6:00 pm. The school office is open Monday to Saturday, 9 am to 6 pm." },
  { q: "Is school transport available?", a: "Yes. The school runs its own GPS-enabled buses for homes within 10 km of the Brahmand campus, including Ghodbunder Road, Manpada, Hiranandani Estate and Kolshet." },
  { q: "Which streams are offered in Class 11 and 12?", a: "Science, Commerce and Humanities, in an afternoon shift from 1:00 pm to 6:00 pm." },
  { q: "Does the school teach Spanish?", a: "Yes. Spanish is taught from KG to Grade 8." },
  { q: "What are the fees?", a: "Fees are not published online. Call or WhatsApp the admissions team on +91 82915 68972 for the fee for your child's class." },
  { q: "How can parents book a campus visit?", a: "Fill in the enquiry form on this page, or call or WhatsApp +91 82915 68972. The office is open Monday to Saturday, 9 am to 6 pm." },
  { q: "Where is the school?", a: "Cosmos Arcade, Brahmand Phase 4, Thane West, Maharashtra 400607." },
];

export const HOME_FOOTER_DESCRIPTION = "A CBSE school in Brahmand, Thane West — where every child dares to dream and becomes a lifelong learner.";
