import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import ScrollProgress from "@/components/home/ScrollProgress";
import { buildFaqPageSchema, type WaveOneFaq } from "@/components/WaveOneSeoBlock";
import {
  BookOpen, Calculator, FlaskConical, TrendingUp, Heart, Briefcase,
  ShieldCheck, Sparkles, MessageCircle, Phone, MapPin, ChevronRight, GraduationCap,
  ClipboardCheck, Bus, ArrowRight, CheckCircle2, Compass, Brain, Lightbulb,
  Target, BookMarked, Award, RefreshCw, Clock, Trophy, Users, Rocket,
} from "lucide-react";
import { useState } from "react";
import { trackCallClick, trackWhatsAppClick, trackDirectionsClick, trackEvent } from "@/lib/analytics";

const NAVY = "#091a4f";
const NAVY_MID = "#0d3b86";
const AMBER = "#d97706";
const AMBER_LIGHT = "#f59e0b";

const WHATSAPP_URL = "https://wa.me/918291568972?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20Senior%20Secondary%20%28Class%2011%26%2012%29%20admission%20at%20Rainbow%20International%20School.";
const PHONE = "+912225976097";
const DIRECTIONS_URL = "https://maps.google.com/?q=Rainbow+International+School+Brahmand+Phase+4+Thane";

const FAQS: WaveOneFaq[] = [
  { q: "Which classes are included in the Senior Secondary section at Rainbow International School?", a: "Our Senior Secondary section covers Class 11 and Class 12, following the CBSE curriculum and leading up to the CBSE Class 12 board examination." },
  { q: "Is the Senior Secondary section CBSE-aligned?", a: "Yes. The Senior Secondary section is CBSE-affiliated and prepares students for the CBSE All India Senior School Certificate Examination (Class 12 board exam)." },
  { q: "Which streams are available for Class 11 and Class 12?", a: "RIS offers Science, Commerce and Humanities streams for Class 11 and Class 12. Final stream and subject combinations are confirmed by the admissions team based on availability for each batch." },
  { q: "What subjects are offered in Class 11?", a: "Science: Physics, Chemistry, Mathematics or Biology, English, Hindi (Core) and Computer Science. Commerce: Mathematics, Economics, Business Studies, Accountancy, English and Computer Science. Humanities: Psychology, Economics, History, Political Science, English and additional electives. Final electives are confirmed at admission." },
  { q: "How does RIS support Class 12 board exam preparation?", a: "Through structured CBSE board preparation — concept clarity, regular assessments, pre-board exams, revision plans aligned to CBSE sample papers, doubt-clearing sessions and individual academic mentoring." },
  { q: "How does RIS help students choose the right stream?", a: "Through stream and career counselling — students and parents discuss aptitude, interests, future pathways and subject combinations before stream selection at the start of Class 11." },
  { q: "Does RIS provide career guidance or higher education orientation?", a: "Yes. Senior Secondary students receive career awareness sessions, higher education orientation, college and entrance exam guidance, and support for stream-aligned career pathways." },
  { q: "Are co-curricular activities available for Senior Secondary students?", a: "Yes. Sports, fitness, clubs, student leadership roles, events, competitions and value-based activities continue in the Senior Secondary timetable to balance academics with growth." },
  { q: "How are Class 11 and Class 12 students assessed?", a: "Through continuous evaluation — class participation, assignments, projects and practical work, periodic tests, pre-board or board-oriented assessments, revision performance, teacher observation and regular parent updates." },
  { q: "Is transport available for Senior Secondary students?", a: "Yes. School transport covers Brahmand, Hiranandani Estate, Ghodbunder Road, Manpada, Kavesar, Kolshet, Pokhran Road and nearby Thane areas. Please confirm route availability with the admissions team." },
  { q: "Is RIS convenient for Class 11 and Class 12 admissions near Hiranandani Estate?", a: "Yes. Our Brahmand Phase 4 campus is easily reachable from Hiranandani Estate, with transport available on this route for Senior Secondary students." },
  { q: "Is RIS convenient for Senior Secondary admissions near Ghodbunder Road?", a: "Yes. Many of our Class 11 and 12 families travel along Ghodbunder Road, and transport routes cover this corridor." },
  { q: "How can students enquire for Class 11 admission?", a: "Submit the admission enquiry on the Admissions page, WhatsApp us, or call the admissions desk. Class 11 admissions typically open after Class 10 board results — please confirm dates with the team." },
  { q: "How can students enquire for Class 12 admission?", a: "Class 12 admissions are subject to seat availability and stream fit. Please connect with the admissions team to discuss the next steps." },
  { q: "How can parents book a campus visit for Senior Secondary?", a: "Book a guided campus visit through the Admissions page, by WhatsApp or by calling the admissions desk. Visits include a walkthrough of senior classrooms, science labs, library and activity spaces." },
  { q: "What makes RIS a good Senior Secondary School in Thane?", a: "Focused CBSE academics, stream and career guidance, structured board preparation, leadership exposure, balanced co-curriculars and a supportive learning environment make RIS a trusted choice for Class 11 and 12 students in Thane." },
];

const decisionCards = [
  { icon: GraduationCap, title: "Focused CBSE Academic Preparation", body: "Concept-led teaching across stream subjects aligned to the CBSE Class 12 syllabus." },
  { icon: Compass, title: "Stream and Subject Guidance", body: "Counselling-led stream selection with subject combinations matched to student aspirations." },
  { icon: Target, title: "Board Exam Readiness", body: "Periodic tests, pre-boards, revision plans and CBSE sample-paper practice for Class 12." },
  { icon: Rocket, title: "Career and Higher Education Orientation", body: "Awareness sessions, college guidance and entrance-exam-aligned planning." },
  { icon: Users, title: "Leadership and Communication Skills", body: "Student council, presentations, clubs and events that grow real-world confidence." },
  { icon: Heart, title: "Supportive Teachers and Learning Environment", body: "Mentor-style teachers, individual academic support and a calm, focused campus." },
];

const journey = [
  { grade: "Class 11", body: "Students build strong foundations in their selected stream, adjust to higher academic expectations, strengthen study routines and begin career-oriented thinking." },
  { grade: "Class 12", body: "Students focus on board exam preparation, revision, assessments, higher education readiness, confidence, discipline and future planning." },
];

const gradeAdmissions = [
  { grade: "Class 11", title: "Class 11 Admission in Thane", body: "A crucial year for stream selection, academic foundation, career direction and building the right study habits for Senior Secondary success." },
  { grade: "Class 12", title: "Class 12 Admission in Thane", body: "Focused preparation for board examinations, revision, assessments, confidence building and higher education readiness." },
];

const streams = [
  {
    name: "Science Stream",
    description: "For students interested in science, technology, medicine, engineering, research or applied sciences.",
    suitable: "Aspiring engineers, doctors, researchers and applied science professionals.",
    direction: "Physics, Chemistry, Mathematics or Biology, English, Hindi (Core), Computer Science.",
    skills: "Analytical thinking, scientific reasoning, problem-solving, lab skills.",
    pathways: "Engineering (JEE), Medical (NEET), Pure Sciences, Research, CUET-based programs.",
    color: "#e0edff", accent: NAVY_MID, icon: FlaskConical,
  },
  {
    name: "Commerce Stream",
    description: "For students interested in business, finance, entrepreneurship, accounting, economics or management.",
    suitable: "Aspiring CAs, finance professionals, business leaders and economists.",
    direction: "Mathematics, Economics, Business Studies, Accountancy, English, Computer Science.",
    skills: "Quantitative reasoning, financial literacy, business thinking, communication.",
    pathways: "B.Com, BBA, CA, CFA, Economics, Management, CUET-based programs.",
    color: "#fff7e0", accent: AMBER, icon: TrendingUp,
  },
  {
    name: "Humanities Stream",
    description: "For students interested in social sciences, communication, psychology, law, design, civil services or liberal arts.",
    suitable: "Aspiring lawyers, psychologists, civil servants, designers and liberal arts students.",
    direction: "Psychology, Economics, History, Political Science, English, Computer Science, Fine Arts.",
    skills: "Critical thinking, writing, research, communication, social awareness.",
    pathways: "Law (CLAT), BA, Psychology, Mass Comm, Design (NIFT/NID), UPSC, CUET-based programs.",
    color: "#fdf2f8", accent: "#be185d", icon: BookOpen,
  },
];

const boardSupport = [
  { icon: Lightbulb, title: "Structured Study Planning" },
  { icon: ClipboardCheck, title: "Regular Assessments" },
  { icon: RefreshCw, title: "Revision Support" },
  { icon: MessageCircle, title: "Doubt Clarification" },
  { icon: BookMarked, title: "Practice Tests" },
  { icon: Clock, title: "Time Management" },
  { icon: TrendingUp, title: "Teacher Feedback" },
  { icon: Heart, title: "Parent Communication" },
  { icon: Award, title: "Confidence Building" },
];

const careerCards = [
  { icon: Compass, title: "Stream Selection Support", body: "Guidance to choose the stream that matches aptitude and aspirations.", color: "#e0edff", accent: NAVY_MID },
  { icon: Briefcase, title: "Career Awareness", body: "Exposure to career paths, professions and future industries.", color: "#fff7e0", accent: AMBER },
  { icon: MessageCircle, title: "Communication & Presentation", body: "Public speaking, debates and presentations for real-world readiness.", color: "#e0f7f0", accent: "#059669" },
  { icon: BookMarked, title: "Research & Project Work", body: "Stream-linked projects that build research and analytical skills.", color: "#fdf2f8", accent: "#be185d" },
  { icon: Users, title: "Leadership Exposure", body: "Student council, prefects, club leadership and event organising.", color: "#f3e0ff", accent: "#7c3aed" },
  { icon: Rocket, title: "Future Readiness", body: "College, entrance exam and career-pathway orientation.", color: "#e0f2fe", accent: "#0369a1" },
];

const beyondAcademics = [
  { icon: Trophy, title: "Sports & Fitness" },
  { icon: Sparkles, title: "Clubs & Activities" },
  { icon: Users, title: "Student Leadership" },
  { icon: Award, title: "Events & Competitions" },
  { icon: Heart, title: "Values & Responsibility" },
  { icon: ShieldCheck, title: "Emotional Balance & Confidence" },
];

const evaluationPoints = [
  "Class participation",
  "Assignments",
  "Projects and practical work",
  "Periodic tests",
  "Pre-board / board-oriented assessments",
  "Revision performance",
  "Teacher observation",
  "Parent updates",
  "Student counselling and guidance",
];

const futureCards = [
  { title: "Board Examination Readiness", body: "A structured Class 12 prep system that builds calmness and clarity.", icon: Award },
  { title: "Higher Education Planning", body: "Course discovery, entrance exam awareness and college shortlisting.", icon: GraduationCap },
  { title: "Career Direction", body: "Stream-aligned career counselling and future pathways.", icon: Compass },
  { title: "Confidence & Independence", body: "Self-management, decision-making and personal growth.", icon: Rocket },
];

const localities = ["Hiranandani Estate", "Ghodbunder Road", "Brahmand Thane", "Manpada", "Kavesar", "Kolshet"];
const grades = ["Class 11", "Class 12"];

function ctaTrack(label: string) {
  trackEvent("senior_cta_click", "senior_secondary", label);
}

export default function SeniorSecondary() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Senior Secondary in Thane | CBSE Class 11 & 12"
        description="Explore Senior Secondary at Rainbow International School, a CBSE school in Thane for Class 11 and 12 with board preparation and career readiness."
        keywords="senior secondary school in Thane, CBSE senior secondary school in Thane, best senior secondary school in Thane, Class 11 admission in Thane, Class 12 admission in Thane, Science stream school in Thane, Commerce stream school in Thane, Humanities stream school in Thane, Class 12 board preparation school in Thane, senior secondary near Hiranandani Estate, senior secondary near Ghodbunder Road, senior secondary near Brahmand Thane, senior secondary near Manpada, senior secondary near Kavesar, senior secondary near Kolshet"
        canonical="https://rainbowinternationalschool.in/senior-secondary-section"
        ogImage="/images/home/academic/senior-secondary.jpg"
        appendSiteName={false}
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "Academics", href: "https://rainbowinternationalschool.in/senior-secondary-section" },
          { name: "Senior Secondary (Class 11–12)", href: "https://rainbowinternationalschool.in/senior-secondary-section" },
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": "https://rainbowinternationalschool.in/senior-secondary-section#webpage",
              "url": "https://rainbowinternationalschool.in/senior-secondary-section",
              "name": "Senior Secondary in Thane | CBSE Class 11 & 12",
              "description": "CBSE-affiliated Senior Secondary (Class 11 and Class 12) at Rainbow International School, Thane — Science, Commerce and Humanities.",
              "inLanguage": "en-IN",
              "isPartOf": { "@id": "https://rainbowinternationalschool.in/#website" },
              "about": { "@id": "https://rainbowinternationalschool.in/#school" },
            },
            {
              "@type": ["EducationalOrganization", "School"],
              "@id": "https://rainbowinternationalschool.in/#school",
              "name": "Rainbow International School",
              "url": "https://rainbowinternationalschool.in/",
              "telephone": "+91 82915 68972",
              "email": "info@rainbowinternationalschool.in",
              "sameAs": ["https://maps.app.goo.gl/mfJjMMkksCkcXzMCA"],
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Cosmos Arcade, Brahmand Phase 4",
                "addressLocality": "Thane West",
                "addressRegion": "Maharashtra",
                "postalCode": "400607",
                "addressCountry": "IN",
              },
            },
            {
              "@type": "EducationalOccupationalProgram",
              "name": "Senior Secondary (Class 11–12)",
              "description": "CBSE-affiliated senior secondary education for Class 11 and Class 12 in Thane, with Science, Commerce and Humanities streams, structured board preparation and career guidance.",
              "provider": { "@id": "https://rainbowinternationalschool.in/#school" },
              "educationalProgramMode": "full-time",
              "programPrerequisites": "Completion of Class 10 / CBSE AISSE",
              "url": "https://rainbowinternationalschool.in/senior-secondary-section",
            },
            buildFaqPageSchema(FAQS),
          ],
        }}
      />
      <Navbar />

      {/* HERO */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: "min(78vh, 720px)" }} data-testid="section-hero">
        <picture>
          <source media="(max-width: 768px)" srcSet="/images/students/hero-senior-secondary-mobile.webp" type="image/webp" />
          <source srcSet="/images/students/hero-senior-secondary.webp" type="image/webp" />
          <img src="/images/students/hero-senior-secondary.jpg" alt="Senior secondary students at Rainbow International School Thane" className="absolute inset-0 w-full h-full object-cover" fetchPriority="high" decoding="async" />
        </picture>
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(9,26,79,0.92) 0%, rgba(13,59,134,0.78) 60%, rgba(9,26,79,0.65) 100%)" }} />
        <div className="relative z-10 container mx-auto px-4 max-w-6xl py-20 md:py-28 lg:py-32 flex flex-col">
          <span className="inline-flex self-start items-center gap-2 text-[11px] font-extrabold tracking-[0.2em] uppercase px-4 py-2 rounded-full mb-5" style={{ background: AMBER_LIGHT, color: NAVY }} data-testid="badge-admissions-open">
            <Sparkles className="w-3.5 h-3.5" /> Admissions Open 2026–27
          </span>
          <h1 className="text-white font-black leading-[1.05] text-3xl sm:text-4xl md:text-5xl lg:text-6xl max-w-4xl" style={{ fontFamily: "'DM Sans', sans-serif" }} data-testid="text-h1">
            Senior Secondary School in Thane <span className="text-white/40 font-normal">|</span> <span style={{ color: AMBER_LIGHT }}>Class 11 and Class 12</span>
          </h1>
          <p className="text-white/95 text-base md:text-lg lg:text-xl mt-5 max-w-2xl font-medium">Preparing students for board success, career choices, higher education and life beyond school.</p>
          <p className="text-white/75 text-sm md:text-base mt-3 max-w-2xl">A CBSE-aligned Senior Secondary experience for Class 11 and Class 12 with focused academics, stream guidance, board preparation, career readiness, leadership exposure and a supportive learning environment.</p>
          <div className="flex flex-wrap gap-2 mt-6 max-w-3xl">
            {["CBSE-Aligned Senior Secondary", "Class 11 and Class 12", "Science · Commerce · Humanities", "Board Exam Preparation", "Career & Higher Education Readiness"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
                <CheckCircle2 className="w-3 h-3" /> {t}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-8">
            <a href="/admissions" onClick={() => ctaTrack("hero_enquire_class_11_12")} className="inline-flex items-center gap-2 font-extrabold text-sm sm:text-base px-6 py-3 rounded-full text-white shadow-lg hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }} data-testid="button-hero-enquire">
              Enquire for Class 11–12 <ArrowRight className="w-4 h-4" />
            </a>
            <a href="/admissions#campus-visit" onClick={() => ctaTrack("hero_campus_visit")} className="inline-flex items-center gap-2 font-extrabold text-sm sm:text-base px-6 py-3 rounded-full text-white border-2 border-white/80 hover:bg-white hover:text-[#091a4f] transition-colors" data-testid="button-hero-campus-visit">
              Book a Campus Visit
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => { ctaTrack("hero_whatsapp"); trackWhatsAppClick({ sourcePage: "senior_hero" }); }} className="inline-flex items-center gap-2 font-extrabold text-sm sm:text-base px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }} data-testid="button-hero-whatsapp">
              <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <main className="flex-grow">
        {/* WHY STUDENTS */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3" style={{ background: "#eef5ff", color: NAVY_MID }}>Why RIS for Senior Secondary</span>
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>Why Students Choose RIS for Senior Secondary</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {decisionCards.map((c, i) => {
                const Icon = c.icon;
                return (
                  <div key={i} className="rounded-2xl p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all" data-testid={`card-decision-${i}`}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "#eef5ff" }}><Icon className="w-6 h-6" style={{ color: NAVY_MID }} /></div>
                    <h3 className="font-extrabold text-base mb-1.5" style={{ color: NAVY }}>{c.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{c.body}</p>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-10">
              <a href="/admissions" onClick={() => ctaTrack("why_explore_admissions")} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: NAVY }} data-testid="button-explore-admissions">
                Explore Admissions for Class 11–12 <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* JOURNEY */}
        <section className="py-16 md:py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>The Senior Secondary Learning Journey at RIS</h2>
              <p className="text-gray-600 mt-3">From Class 11 stream foundations to focused Class 12 board preparation.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {journey.map((j, i) => (
                <div key={j.grade} className="rounded-3xl bg-white border border-gray-100 shadow-sm p-7 relative overflow-hidden">
                  <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-10" style={{ background: i === 0 ? NAVY_MID : AMBER }} />
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black shadow-lg mb-4" style={{ background: i === 0 ? NAVY_MID : AMBER }}>{j.grade.replace("Class ", "")}</div>
                  <h3 className="font-extrabold text-xl mb-2" style={{ color: NAVY }}>{j.grade}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{j.body}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <a href="/admissions" onClick={() => ctaTrack("journey_enquire")} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }} data-testid="button-journey-enquire">
                Enquire for Senior Secondary Admissions <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* GRADE ADMISSIONS */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3" style={{ background: "#fff7e0", color: AMBER }}>Grade-Wise Admissions</span>
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>Class 11 and Class 12 Admissions at RIS</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gradeAdmissions.map((g, i) => (
                <div key={g.grade} className="rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all p-7 flex flex-col" data-testid={`card-grade-${i}`}>
                  <span className="inline-block self-start text-[11px] font-extrabold px-3 py-1 rounded-full mb-3" style={{ background: NAVY, color: "#fff" }}>{g.grade}</span>
                  <h3 className="font-extrabold text-lg mb-2" style={{ color: NAVY }}>{g.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed flex-grow">{g.body}</p>
                  <a href="/admissions" onClick={() => ctaTrack(`grade_enquire_${g.grade.toLowerCase().replace(" ", "_")}`)} className="inline-flex items-center gap-1.5 text-xs font-extrabold mt-5 self-start px-4 py-2 rounded-full border-2 hover:opacity-80 transition-opacity" style={{ color: NAVY, borderColor: NAVY }} data-testid={`button-grade-${i}`}>
                    Enquire for this Class <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STREAMS */}
        <section className="py-16 md:py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>Streams and Subject Options</h2>
              <p className="text-gray-600 mt-3">Three streams for Class 11 and 12 — Science, Commerce and Humanities. Final subject combinations are confirmed by the admissions team.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {streams.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.name} className="rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col" data-testid={`card-stream-${i}`} onClick={() => ctaTrack(`stream_card_${s.name.toLowerCase().replace(/\s+/g, "_")}`)}>
                    <div className="p-6" style={{ background: s.color }}>
                      <div className="w-14 h-14 rounded-2xl bg-white/70 flex items-center justify-center mb-3"><Icon className="w-7 h-7" style={{ color: s.accent }} /></div>
                      <h3 className="font-black text-xl" style={{ color: s.accent }}>{s.name}</h3>
                      <p className="text-sm text-gray-700 mt-2">{s.description}</p>
                    </div>
                    <div className="p-6 space-y-3 flex-grow">
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: s.accent }}>Suitable for</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{s.suitable}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: s.accent }}>Subject direction</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{s.direction}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: s.accent }}>Skills developed</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{s.skills}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: s.accent }}>Future pathways</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{s.pathways}</p>
                      </div>
                    </div>
                    <div className="px-6 pb-6">
                      <a href="/admissions" className="inline-flex items-center gap-1.5 text-xs font-extrabold px-4 py-2 rounded-full border-2 hover:opacity-80 transition-opacity" style={{ color: s.accent, borderColor: s.accent }}>
                        Enquire for this stream <ChevronRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* BOARD SUPPORT */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3" style={{ background: "#fff7e0", color: AMBER }}>Board Year</span>
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>Board Exam Preparation and Academic Support</h2>
              <p className="text-gray-600 mt-3">A structured, supportive system for Class 12 — with calmness, clarity and consistent practice.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5">
              {boardSupport.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div key={b.title} className="rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm bg-gradient-to-br from-white to-[#fffbeb] hover:shadow-md transition-shadow" data-testid={`card-board-${i}`}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: AMBER_LIGHT }}><Icon className="w-5 h-5 text-white" /></div>
                    <h3 className="font-extrabold text-sm md:text-base" style={{ color: NAVY }}>{b.title}</h3>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CAREER READINESS */}
        <section className="py-16 md:py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>Preparing Students for Higher Education and Careers</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {careerCards.map((c, i) => {
                const Icon = c.icon;
                return (
                  <div key={c.title} className="rounded-2xl p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow" data-testid={`card-career-${i}`}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: c.color }}><Icon className="w-6 h-6" style={{ color: c.accent }} /></div>
                    <h3 className="font-extrabold text-base mb-2" style={{ color: c.accent }}>{c.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{c.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* BEYOND ACADEMICS */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>Beyond Academics in Senior Secondary</h2>
              <p className="text-gray-600 mt-3">Sports, leadership, events and values that shape well-rounded students.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {beyondAcademics.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div key={b.title} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 text-center hover:shadow-md transition-shadow" data-testid={`card-beyond-${i}`}>
                    <div className="w-11 h-11 mx-auto rounded-xl flex items-center justify-center mb-3" style={{ background: "#eef5ff" }}><Icon className="w-5 h-5" style={{ color: NAVY_MID }} /></div>
                    <p className="font-extrabold text-xs md:text-sm" style={{ color: NAVY }}>{b.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* EVALUATION */}
        <section className="py-16 md:py-20" style={{ background: NAVY }}>
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3" style={{ background: AMBER_LIGHT, color: NAVY }}>Continuous Evaluation</span>
              <h2 className="text-2xl md:text-4xl font-black text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>How We Track Senior Secondary Progress</h2>
              <p className="text-white/80 mt-3 text-sm md:text-base">A structured framework that supports steady academic growth and confident board readiness.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              {evaluationPoints.map((pt, i) => (
                <div key={pt} className="rounded-xl p-4 text-center backdrop-blur-sm border" style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.15)" }} data-testid={`evaluation-${i}`}>
                  <CheckCircle2 className="w-5 h-5 mx-auto mb-2" style={{ color: AMBER_LIGHT }} />
                  <p className="text-white text-xs md:text-sm font-bold leading-tight">{pt}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <a href="/admissions" onClick={() => ctaTrack("evaluation_speak_counsellor")} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full hover:opacity-90 transition-opacity" style={{ background: AMBER, color: "#fff" }} data-testid="button-speak-counsellor">
                Speak to Our Senior Secondary Counsellor <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* FUTURE PATHWAYS */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>From School to Future Pathways</h2>
              <p className="text-gray-600 mt-3">Senior Secondary at RIS is designed to help students move confidently toward higher education, competitive pathways, career choices and life beyond school.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {futureCards.map((t, i) => {
                const Icon = t.icon;
                return (
                  <div key={t.title} className="rounded-2xl p-6 bg-gradient-to-br from-white to-[#f8faff] border border-gray-100 shadow-sm hover:shadow-md transition-shadow" data-testid={`card-future-${i}`}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: NAVY }}><Icon className="w-6 h-6 text-white" /></div>
                    <h3 className="font-extrabold text-base mb-2" style={{ color: NAVY }}>{t.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{t.body}</p>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-10">
              <a href="/admissions" onClick={() => ctaTrack("future_enquire")} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }} data-testid="button-future-enquire">
                Enquire for Class 11–12 <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* HYPERLOCAL */}
        <section className="py-16 md:py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3" style={{ background: "#eef5ff", color: NAVY_MID }}><MapPin className="w-3 h-3" /> Local to Thane</span>
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>Senior Secondary Admissions Near You in Thane</h2>
              <p className="text-gray-600 mt-3 text-sm md:text-base">Rainbow International School is located at Brahmand Phase 4, Thane and is easily accessible for parents and students looking for Class 11 and Class 12 admission near Hiranandani Estate, Ghodbunder Road, Brahmand, Manpada, Kavesar, Kolshet, Pokhran Road, Patlipada and nearby areas.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {localities.map((loc, i) => (
                <div key={loc} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5" data-testid={`locality-${i}`}>
                  <div className="flex items-center gap-2 mb-3"><MapPin className="w-4 h-4" style={{ color: AMBER }} /><h3 className="font-extrabold text-base" style={{ color: NAVY }}>Near {loc}</h3></div>
                  <div className="flex flex-wrap gap-1.5">
                    {grades.map((g) => (
                      <a key={g} href="/admissions" onClick={() => ctaTrack(`hyperlocal_${g}_${loc}`.toLowerCase().replace(/\s+/g, "_"))} className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full border hover:opacity-80 transition-opacity" style={{ background: "#f8faff", color: NAVY_MID, borderColor: "#dbe7ff" }}>
                        {g} admission
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-10">
              <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" onClick={() => { ctaTrack("hyperlocal_directions"); trackDirectionsClick({ sourcePage: "senior_hyperlocal" }); }} className="inline-flex items-center gap-2 font-extrabold text-sm px-5 py-2.5 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: NAVY }} data-testid="button-get-directions">
                <MapPin className="w-4 h-4" /> Get Directions
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => { ctaTrack("hyperlocal_transport"); trackWhatsAppClick({ sourcePage: "senior_hyperlocal_transport" }); }} className="inline-flex items-center gap-2 font-extrabold text-sm px-5 py-2.5 rounded-full border-2 hover:opacity-80 transition-opacity" style={{ color: NAVY, borderColor: NAVY }} data-testid="button-check-transport">
                <Bus className="w-4 h-4" /> Check Transport Availability
              </a>
              <a href="/admissions" onClick={() => ctaTrack("hyperlocal_enquire")} className="inline-flex items-center gap-2 font-extrabold text-sm px-5 py-2.5 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }} data-testid="button-hyperlocal-enquire">
                Enquire for Senior Secondary Admissions <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="rounded-3xl p-8 md:p-12 text-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_MID} 100%)` }}>
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20" style={{ background: AMBER_LIGHT }} />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10" style={{ background: AMBER_LIGHT }} />
              <div className="relative z-10">
                <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-4" style={{ background: AMBER_LIGHT, color: NAVY }}>Admissions 2026–27</span>
                <h2 className="text-2xl md:text-4xl font-black text-white mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>Looking for Class 11 or Class 12 Admission?</h2>
                <p className="text-white/85 max-w-2xl mx-auto mb-7 text-sm md:text-base">Explore Senior Secondary at Rainbow International School and speak to our admissions team for stream availability, campus visit and admission guidance.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <a href="/admissions" onClick={() => ctaTrack("final_enquire")} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }} data-testid="button-final-enquire">
                    Enquire for Class 11–12 <ArrowRight className="w-4 h-4" />
                  </a>
                  <a href="/admissions#campus-visit" onClick={() => ctaTrack("final_campus_visit")} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white border-2 border-white/80 hover:bg-white hover:text-[#091a4f] transition-colors" data-testid="button-final-campus-visit">
                    Book a Campus Visit
                  </a>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => { ctaTrack("final_whatsapp"); trackWhatsAppClick({ sourcePage: "senior_final" }); }} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }} data-testid="button-final-whatsapp">
                    <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                  </a>
                  <a href={`tel:${PHONE}`} onClick={() => { ctaTrack("final_call"); trackCallClick({ phone: PHONE, sourcePage: "senior_final" }); }} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white border-2 border-white/80 hover:bg-white hover:text-[#091a4f] transition-colors" data-testid="button-final-call">
                    <Phone className="w-4 h-4" /> Call Admissions
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>Frequently Asked Questions About Senior Secondary at RIS</h2>
              <p className="text-gray-600 mt-3">Quick answers about Class 11 and Class 12 admissions, streams, board prep, transport and more.</p>
            </div>
            <div className="space-y-3">
              {FAQS.map((f, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className="rounded-2xl border border-gray-200 bg-white overflow-hidden" data-testid={`faq-${i}`}>
                    <button type="button" onClick={() => { setOpenFaq(isOpen ? null : i); trackEvent("faq_interaction", "senior_faq", `q${i}_${!isOpen ? "open" : "close"}`); }} className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-gray-50 transition-colors" aria-expanded={isOpen}>
                      <span className="font-extrabold text-sm md:text-base" style={{ color: NAVY }}>{f.q}</span>
                      <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} style={{ color: AMBER }} />
                    </button>
                    {isOpen && (<div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">{f.a}</div>)}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t border-gray-200 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.08)]" data-testid="mobile-cta-bar">
        <div className="grid grid-cols-4 divide-x divide-gray-200">
          <a href={`tel:${PHONE}`} onClick={() => { ctaTrack("sticky_call"); trackCallClick({ phone: PHONE, sourcePage: "senior_sticky" }); }} className="flex flex-col items-center justify-center py-2.5 gap-0.5 hover:bg-gray-50">
            <Phone className="w-4 h-4" style={{ color: NAVY }} /><span className="text-[10px] font-extrabold" style={{ color: NAVY }}>Call</span>
          </a>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => { ctaTrack("sticky_whatsapp"); trackWhatsAppClick({ sourcePage: "senior_sticky" }); }} className="flex flex-col items-center justify-center py-2.5 gap-0.5 hover:bg-gray-50">
            <MessageCircle className="w-4 h-4" style={{ color: "#25D366" }} /><span className="text-[10px] font-extrabold" style={{ color: NAVY }}>WhatsApp</span>
          </a>
          <a href="/admissions" onClick={() => ctaTrack("sticky_enquire")} className="flex flex-col items-center justify-center py-2.5 gap-0.5 hover:bg-gray-50">
            <ClipboardCheck className="w-4 h-4" style={{ color: AMBER }} /><span className="text-[10px] font-extrabold" style={{ color: NAVY }}>Enquire</span>
          </a>
          <a href="/admissions#campus-visit" onClick={() => ctaTrack("sticky_book_visit")} className="flex flex-col items-center justify-center py-2.5 gap-0.5 hover:bg-gray-50">
            <Compass className="w-4 h-4" style={{ color: NAVY_MID }} /><span className="text-[10px] font-extrabold" style={{ color: NAVY }}>Book Visit</span>
          </a>
        </div>
      </div>
      <div className="h-14 lg:hidden" aria-hidden="true" />
    </div>
  );
}
