import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import ScrollProgress from "@/components/home/ScrollProgress";
import { buildFaqPageSchema, type WaveOneFaq } from "@/components/WaveOneSeoBlock";
import {
  BookOpen, Calculator, FlaskConical, Globe, Languages, Monitor, Trophy, Heart,
  ShieldCheck, Sparkles, MessageCircle, Phone, MapPin, ChevronRight, GraduationCap,
  ClipboardCheck, Bus, ArrowRight, CheckCircle2, Compass, Brain, Lightbulb,
  Target, TrendingUp, BookMarked, Award, RefreshCw, Clock,
} from "lucide-react";
import { useState } from "react";
import { trackCallClick, trackWhatsAppClick, trackDirectionsClick, trackEvent } from "@/lib/analytics";

const NAVY = "#091a4f";
const NAVY_MID = "#0d3b86";
const AMBER = "#d97706";
const AMBER_LIGHT = "#f59e0b";

const WHATSAPP_URL = "https://wa.me/918291568972?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20Secondary%20School%20%28Class%209%26%2010%29%20admission%20at%20Rainbow%20International%20School.";
const PHONE = "+912225976097";
const DIRECTIONS_URL = "https://maps.google.com/?q=Rainbow+International+School+Brahmand+Phase+4+Thane";

const FAQS: WaveOneFaq[] = [
  { q: "Which classes are included in the Secondary School section at Rainbow International School?", a: "Our Secondary School section covers Class 9 and Class 10, following the CBSE curriculum and leading up to the CBSE Class 10 board examination." },
  { q: "Is the Secondary School section CBSE-aligned?", a: "Yes. The Secondary section is CBSE-affiliated and prepares students for the CBSE All India Secondary School Examination (Class 10 board exam)." },
  { q: "What subjects are taught in Class 9 and Class 10?", a: "Students study English, Mathematics, Science (Physics, Chemistry, Biology), Social Science (History, Geography, Civics, Economics), Hindi or a second language and Computer or skill-based learning, alongside Physical Education and co-curricular activities — all aligned to the CBSE Class 10 syllabus." },
  { q: "How does RIS support board exam preparation?", a: "Through structured CBSE board preparation — concept clarity, regular periodic tests, pre-board examinations, revision plans aligned to CBSE sample papers, doubt-clearing sessions and individual academic mentoring." },
  { q: "How does RIS help Class 9 students prepare for Class 10?", a: "In Class 9 we focus on subject foundation, conceptual clarity, study routines, project work and academic discipline so students enter Class 10 with confidence and readiness." },
  { q: "How does RIS support Class 10 students during the board year?", a: "Class 10 students follow a focused board readiness track — revision planning, practice worksheets, time management, doubt-clearing, mock tests and regular feedback to parents." },
  { q: "Are co-curricular activities continued in Secondary School?", a: "Yes. Inter-house sports, science exhibitions, Olympiads, public speaking, music, art and clubs continue in the Secondary timetable to support all-round development alongside academics." },
  { q: "How are Secondary School students assessed?", a: "Through continuous evaluation — class participation, assignments, projects, periodic tests, term assessments, revision performance, teacher observation and regular parent updates." },
  { q: "Is transport available for Class 9 and Class 10 students?", a: "Yes. School transport covers Brahmand, Hiranandani Estate, Ghodbunder Road, Manpada, Kavesar, Kolshet, Pokhran Road and nearby Thane areas. Please confirm route availability with the admissions team." },
  { q: "Is RIS convenient for Class 9 and Class 10 admissions near Hiranandani Estate?", a: "Yes. Our Brahmand Phase 4 campus is easily reachable from Hiranandani Estate, with transport available on this route for Secondary students." },
  { q: "Is RIS convenient for Secondary School admissions near Ghodbunder Road?", a: "Yes. Many of our Class 9 and 10 families travel along Ghodbunder Road, and transport routes cover this corridor." },
  { q: "How can parents enquire for Class 9 admission?", a: "Submit the admission enquiry on the Admissions page, WhatsApp us, or call the admissions desk to confirm Class 9 seat availability and book a campus visit." },
  { q: "How can parents enquire for Class 10 admission?", a: "Class 10 admissions are subject to seat availability. Please connect with the admissions team to check current vacancies and the next steps." },
  { q: "How can parents book a campus visit for Secondary School?", a: "Book a guided campus visit through the Admissions page, by WhatsApp or by calling the admissions desk. Visits include a walkthrough of the secondary classrooms, science labs, library and sports facilities." },
  { q: "What makes RIS a good CBSE Secondary School in Thane?", a: "Strong academic foundation, CBSE-aligned curriculum, structured board preparation, regular assessments, balanced co-curriculars, safe campus and individual academic mentoring make RIS a trusted choice for Class 9 and 10 parents in Thane." },
];

const decisionCards = [
  { icon: GraduationCap, title: "Strong CBSE Academic Foundation", body: "Conceptual depth across English, Math, Science and Social Science aligned to the CBSE Class 10 syllabus." },
  { icon: BookMarked, title: "Class 9 and Class 10 Subject Focus", body: "Subject-specialist teachers, structured topic coverage and clarity-first teaching." },
  { icon: Target, title: "Board Exam Preparation", body: "Periodic tests, pre-boards, revision plans and CBSE sample-paper practice." },
  { icon: ClipboardCheck, title: "Regular Assessment & Feedback", body: "Continuous tracking with frequent parent communication and academic mentoring." },
  { icon: Brain, title: "Confidence, Discipline & Study Habits", body: "Time management, study routines and exam temperament that scale beyond school." },
  { icon: Trophy, title: "Balanced Academics & Co-curricular Growth", body: "Sports, clubs, Olympiads and events alongside structured academics." },
];

const journey = [
  { grade: "Class 9", body: "Strengthening subject foundations, conceptual clarity, study routines, project work and preparation for higher academic expectations." },
  { grade: "Class 10", body: "Focused board exam preparation with revision, assessments, teacher guidance, confidence building and academic discipline." },
];

const gradeAdmissions = [
  { grade: "Class 9", title: "Class 9 Admission in Thane", body: "A strong academic year focused on conceptual clarity, subject foundations, study discipline, project work and preparation for Class 10 expectations." },
  { grade: "Class 10", title: "Class 10 Admission in Thane", body: "Focused support for board exam readiness through structured revision, regular assessments, teacher guidance and confidence building." },
];

const subjects = [
  { name: "English", icon: BookOpen },
  { name: "Mathematics", icon: Calculator },
  { name: "Science (Phy / Chem / Bio)", icon: FlaskConical },
  { name: "Social Science", icon: Globe },
  { name: "Hindi / Second Language", icon: Languages },
  { name: "Computer / Skill-Based Learning", icon: Monitor },
  { name: "Physical Education", icon: Trophy },
  { name: "Co-Curricular Activities", icon: Sparkles },
];

const boardReadiness = [
  { icon: Lightbulb, title: "Concept Clarity" },
  { icon: ClipboardCheck, title: "Regular Assessments" },
  { icon: RefreshCw, title: "Revision Planning" },
  { icon: MessageCircle, title: "Doubt-Solving Support" },
  { icon: BookMarked, title: "Practice Worksheets" },
  { icon: Clock, title: "Time Management" },
  { icon: TrendingUp, title: "Feedback to Parents" },
  { icon: Award, title: "Confidence Building" },
  { icon: Target, title: "Balanced Study Routine" },
];

const studentDevelopment = [
  { icon: MessageCircle, title: "Communication Skills", body: "Speaking, presenting and writing with clarity.", color: "#e0edff", accent: NAVY_MID },
  { icon: ShieldCheck, title: "Responsibility & Discipline", body: "Routines, accountability and academic ownership.", color: "#fff7e0", accent: AMBER },
  { icon: Monitor, title: "Digital & Research Skills", body: "Technology, research projects and digital literacy.", color: "#e0f2fe", accent: "#0369a1" },
  { icon: Trophy, title: "Sports & Activities", body: "Inter-house sports, clubs and competitions.", color: "#e0f7f0", accent: "#059669" },
  { icon: Heart, title: "Values & Emotional Balance", body: "Empathy, resilience and emotional well-being.", color: "#fdf2f8", accent: "#be185d" },
];

const academicSupport = [
  { title: "Teacher-Guided Learning", body: "Subject-specialist teachers focused on each child's progress.", color: "#e0edff", accent: NAVY_MID, icon: GraduationCap },
  { title: "Regular Practice & Feedback", body: "Worksheets, tests and structured feedback through the year.", color: "#e0f7f0", accent: "#047857", icon: ClipboardCheck },
  { title: "Doubt Clarification", body: "Patient doubt-clearing in class and in dedicated sessions.", color: "#fff7e0", accent: AMBER, icon: MessageCircle },
  { title: "Parent Communication", body: "Regular updates so parents stay aligned with academic progress.", color: "#fdf2f8", accent: "#be185d", icon: Heart },
];

const evaluationPoints = [
  "Class participation",
  "Assignments and worksheets",
  "Projects and practical understanding",
  "Periodic tests",
  "Term assessments",
  "Revision performance",
  "Teacher observation",
  "Parent updates",
];

const transitionCards = [
  { title: "Subject Clarity", body: "Strong conceptual base across core subjects.", icon: Lightbulb },
  { title: "Exam Confidence", body: "Test-taking skills and academic temperament.", icon: Award },
  { title: "Study Discipline", body: "Routines, time management and consistency.", icon: ClipboardCheck },
  { title: "Stream Readiness", body: "Self-awareness for Senior Secondary stream choice.", icon: Compass },
];

const localities = ["Hiranandani Estate", "Ghodbunder Road", "Brahmand Thane", "Manpada", "Kavesar", "Kolshet"];
const grades = ["Class 9", "Class 10"];

function ctaTrack(label: string) {
  trackEvent("secondary_cta_click", "secondary_school", label);
}

export default function Secondary() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Secondary School in Thane | CBSE Class 9 & 10 | Rainbow International School"
        description="Explore the Secondary School section at Rainbow International School, a CBSE-affiliated school in Thane for Class 9 and Class 10 with strong academics, board exam preparation, assessments, activities and holistic growth."
        keywords="secondary school in Thane, CBSE secondary school in Thane, best secondary school in Thane, Class 9 admission in Thane, Class 10 admission in Thane, CBSE board school for Class 10 in Thane, Class 10 board preparation Thane, secondary school near Hiranandani Estate, secondary school near Ghodbunder Road, secondary school near Brahmand Thane, secondary school near Manpada, secondary school near Kavesar, secondary school near Kolshet"
        canonical="https://rainbowinternationalschool.in/secondary-section"
        ogImage="/images/home/academic/secondary-section.jpg"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "Academics", href: "https://rainbowinternationalschool.in/secondary-section" },
          { name: "Secondary School (Class 9–10)", href: "https://rainbowinternationalschool.in/secondary-section" },
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "EducationalOccupationalProgram",
              "name": "Secondary School (Class 9–10)",
              "description": "CBSE-affiliated secondary school education for Class 9 and Class 10 in Thane, with structured board preparation, regular assessments, doubt-clearing and academic mentoring.",
              "provider": { "@type": "School", "name": "Rainbow International School", "url": "https://rainbowinternationalschool.in/" },
              "educationalProgramMode": "full-time",
              "programPrerequisites": "Completion of Middle School / Class 8",
              "url": "https://rainbowinternationalschool.in/secondary-section",
            },
            buildFaqPageSchema(FAQS),
          ],
        }}
      />
      <Navbar />

      {/* HERO */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: "min(78vh, 720px)" }} data-testid="section-hero">
        <picture>
          <source srcSet="/images/home/academic/secondary-section.webp" type="image/webp" />
          <img src="/images/home/academic/secondary-section.jpg" alt="Secondary school students at Rainbow International School Thane" className="absolute inset-0 w-full h-full object-cover" fetchPriority="high" decoding="async" />
        </picture>
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(9,26,79,0.92) 0%, rgba(13,59,134,0.78) 60%, rgba(9,26,79,0.65) 100%)" }} />
        <div className="relative z-10 container mx-auto px-4 max-w-6xl py-20 md:py-28 lg:py-32 flex flex-col">
          <span className="inline-flex self-start items-center gap-2 text-[11px] font-extrabold tracking-[0.2em] uppercase px-4 py-2 rounded-full mb-5" style={{ background: AMBER_LIGHT, color: NAVY }} data-testid="badge-admissions-open">
            <Sparkles className="w-3.5 h-3.5" /> Admissions Open 2026–27
          </span>
          <h1 className="text-white font-black leading-[1.05] text-3xl sm:text-4xl md:text-5xl lg:text-6xl max-w-4xl" style={{ fontFamily: "'DM Sans', sans-serif" }} data-testid="text-h1">
            Secondary School in Thane <br className="hidden sm:block" /><span style={{ color: AMBER_LIGHT }}>Class 9 and Class 10</span>
          </h1>
          <p className="text-white/95 text-base md:text-lg lg:text-xl mt-5 max-w-2xl font-medium">Building subject mastery, exam confidence, discipline and future readiness during the crucial board preparation years.</p>
          <p className="text-white/75 text-sm md:text-base mt-3 max-w-2xl">A CBSE-aligned Secondary School experience for Class 9 and Class 10 with strong academics, structured assessment, teacher guidance, co-curricular balance and preparation for higher studies.</p>
          <div className="flex flex-wrap gap-2 mt-6 max-w-3xl">
            {["CBSE-Aligned Secondary School", "Class 9 and Class 10", "Board Exam Readiness", "Strong Academic Support", "Sports, Activities & Values"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
                <CheckCircle2 className="w-3 h-3" /> {t}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-8">
            <a href="/admissions" onClick={() => ctaTrack("hero_enquire_class_9_10")} className="inline-flex items-center gap-2 font-extrabold text-sm sm:text-base px-6 py-3 rounded-full text-white shadow-lg hover:opacity-90 transition-opacity" style={{ background: AMBER }} data-testid="button-hero-enquire">
              Enquire for Class 9–10 <ArrowRight className="w-4 h-4" />
            </a>
            <a href="/admissions#campus-visit" onClick={() => ctaTrack("hero_campus_visit")} className="inline-flex items-center gap-2 font-extrabold text-sm sm:text-base px-6 py-3 rounded-full text-white border-2 border-white/80 hover:bg-white hover:text-[#091a4f] transition-colors" data-testid="button-hero-campus-visit">
              Book a Campus Visit
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => { ctaTrack("hero_whatsapp"); trackWhatsAppClick({ sourcePage: "secondary_hero" }); }} className="inline-flex items-center gap-2 font-extrabold text-sm sm:text-base px-6 py-3 rounded-full bg-[#25D366] text-white hover:opacity-90 transition-opacity" data-testid="button-hero-whatsapp">
              <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <main className="flex-grow">
        {/* WHY PARENTS */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3" style={{ background: "#eef5ff", color: NAVY_MID }}>Why RIS for Secondary</span>
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>Why Parents Choose RIS for Secondary School</h2>
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
                Explore Admissions for Class 9–10 <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* JOURNEY */}
        <section className="py-16 md:py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>The Secondary School Learning Journey at RIS</h2>
              <p className="text-gray-600 mt-3">From Class 9 foundations to focused Class 10 board readiness.</p>
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
              <a href="/admissions" onClick={() => ctaTrack("journey_enquire")} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: AMBER }} data-testid="button-journey-enquire">
                Enquire for Secondary Admissions <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* GRADE ADMISSIONS */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3" style={{ background: "#fff7e0", color: AMBER }}>Grade-Wise Admissions</span>
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>Class 9 and Class 10 Admissions at RIS</h2>
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

        {/* SUBJECTS */}
        <section className="py-16 md:py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>Subjects and Academic Focus in Secondary School</h2>
              <p className="text-gray-600 mt-3">Aligned with the CBSE Class 10 syllabus, with co-curricular balance.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {subjects.map(({ name, icon: Icon }) => (
                <div key={name} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 text-center hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3" style={{ background: "#eef5ff" }}><Icon className="w-5 h-5" style={{ color: NAVY_MID }} /></div>
                  <p className="font-extrabold text-sm" style={{ color: NAVY }}>{name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BOARD READINESS */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3" style={{ background: "#fff7e0", color: AMBER }}>Board Year</span>
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>Board Exam Readiness at RIS</h2>
              <p className="text-gray-600 mt-3">A structured, supportive system that prepares Class 10 students for the CBSE board exam — with calmness, clarity and practice.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-5">
              {boardReadiness.map((b, i) => {
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

        {/* STUDENT DEVELOPMENT */}
        <section className="py-16 md:py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>Beyond Marks: Building Confident Secondary Students</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {studentDevelopment.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.title} className="rounded-2xl p-5 border border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow" data-testid={`card-development-${i}`}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: s.color }}><Icon className="w-5 h-5" style={{ color: s.accent }} /></div>
                    <h3 className="font-extrabold text-sm mb-1.5" style={{ color: s.accent }}>{s.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{s.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ACADEMIC SUPPORT */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>How RIS Supports Class 9 and Class 10 Students</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {academicSupport.map((a, i) => {
                const Icon = a.icon;
                return (
                  <div key={a.title} className="rounded-2xl p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col" data-testid={`card-support-${i}`}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: a.color }}><Icon className="w-6 h-6" style={{ color: a.accent }} /></div>
                    <h3 className="font-extrabold text-base mb-2" style={{ color: a.accent }}>{a.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{a.body}</p>
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
              <h2 className="text-2xl md:text-4xl font-black text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>How We Track Academic Progress</h2>
              <p className="text-white/80 mt-3 text-sm md:text-base">A structured evaluation framework that supports steady academic growth from Class 9 to Class 10.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              {evaluationPoints.map((pt, i) => (
                <div key={pt} className="rounded-xl p-4 text-center backdrop-blur-sm border" style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.15)" }} data-testid={`evaluation-${i}`}>
                  <CheckCircle2 className="w-5 h-5 mx-auto mb-2" style={{ color: AMBER_LIGHT }} />
                  <p className="text-white text-xs md:text-sm font-bold leading-tight">{pt}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <a href="/admissions" onClick={() => ctaTrack("evaluation_speak_counsellor")} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full hover:opacity-90 transition-opacity" style={{ background: AMBER, color: "#fff" }} data-testid="button-speak-counsellor">
                Speak to Our Secondary School Counsellor <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* PROGRESSION */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>Preparing Students for Senior Secondary</h2>
              <p className="text-gray-600 mt-3">The Secondary School years at RIS prepare students for informed stream selection and future academic choices by building subject clarity, responsibility, study habits, exam confidence and self-awareness.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {transitionCards.map((t, i) => {
                const Icon = t.icon;
                return (
                  <div key={t.title} className="rounded-2xl p-6 bg-gradient-to-br from-white to-[#f8faff] border border-gray-100 shadow-sm hover:shadow-md transition-shadow" data-testid={`card-transition-${i}`}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: NAVY }}><Icon className="w-6 h-6 text-white" /></div>
                    <h3 className="font-extrabold text-base mb-2" style={{ color: NAVY }}>{t.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{t.body}</p>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-10">
              <a href="/senior-secondary-section" onClick={() => ctaTrack("transition_senior_secondary")} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: NAVY }} data-testid="button-explore-senior">
                Explore Senior Secondary <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* HYPERLOCAL */}
        <section className="py-16 md:py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3" style={{ background: "#eef5ff", color: NAVY_MID }}><MapPin className="w-3 h-3" /> Local to Thane</span>
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>Secondary Admissions Near You in Thane</h2>
              <p className="text-gray-600 mt-3 text-sm md:text-base">Rainbow International School is located at Brahmand Phase 4, Thane and is easily accessible for parents looking for Class 9 and Class 10 admission near Hiranandani Estate, Ghodbunder Road, Brahmand, Manpada, Kavesar, Kolshet, Pokhran Road, Patlipada and nearby areas.</p>
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
              <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" onClick={() => { ctaTrack("hyperlocal_directions"); trackDirectionsClick({ sourcePage: "secondary_hyperlocal" }); }} className="inline-flex items-center gap-2 font-extrabold text-sm px-5 py-2.5 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: NAVY }} data-testid="button-get-directions">
                <MapPin className="w-4 h-4" /> Get Directions
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => { ctaTrack("hyperlocal_transport"); trackWhatsAppClick({ sourcePage: "secondary_hyperlocal_transport" }); }} className="inline-flex items-center gap-2 font-extrabold text-sm px-5 py-2.5 rounded-full border-2 hover:opacity-80 transition-opacity" style={{ color: NAVY, borderColor: NAVY }} data-testid="button-check-transport">
                <Bus className="w-4 h-4" /> Check Transport Availability
              </a>
              <a href="/admissions" onClick={() => ctaTrack("hyperlocal_enquire")} className="inline-flex items-center gap-2 font-extrabold text-sm px-5 py-2.5 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: AMBER }} data-testid="button-hyperlocal-enquire">
                Enquire for Secondary Admissions <ArrowRight className="w-4 h-4" />
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
                <h2 className="text-2xl md:text-4xl font-black text-white mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>Looking for Class 9 or Class 10 Admission?</h2>
                <p className="text-white/85 max-w-2xl mx-auto mb-7 text-sm md:text-base">Explore the Secondary School at Rainbow International School and speak to our admissions team for grade-wise availability, campus visit and admission guidance.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <a href="/admissions" onClick={() => ctaTrack("final_enquire")} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: AMBER }} data-testid="button-final-enquire">
                    Enquire for Class 9–10 <ArrowRight className="w-4 h-4" />
                  </a>
                  <a href="/admissions#campus-visit" onClick={() => ctaTrack("final_campus_visit")} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white border-2 border-white/80 hover:bg-white hover:text-[#091a4f] transition-colors" data-testid="button-final-campus-visit">
                    Book a Campus Visit
                  </a>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => { ctaTrack("final_whatsapp"); trackWhatsAppClick({ sourcePage: "secondary_final" }); }} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full bg-[#25D366] text-white hover:opacity-90 transition-opacity" data-testid="button-final-whatsapp">
                    <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                  </a>
                  <a href={`tel:${PHONE}`} onClick={() => { ctaTrack("final_call"); trackCallClick({ phone: PHONE, sourcePage: "secondary_final" }); }} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white border-2 border-white/80 hover:bg-white hover:text-[#091a4f] transition-colors" data-testid="button-final-call">
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
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>Frequently Asked Questions About Secondary School at RIS</h2>
              <p className="text-gray-600 mt-3">Quick answers about Class 9 and Class 10 admissions, board prep, transport and more.</p>
            </div>
            <div className="space-y-3">
              {FAQS.map((f, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className="rounded-2xl border border-gray-200 bg-white overflow-hidden" data-testid={`faq-${i}`}>
                    <button type="button" onClick={() => { setOpenFaq(isOpen ? null : i); trackEvent("faq_interaction", "secondary_faq", `q${i}_${!isOpen ? "open" : "close"}`); }} className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-gray-50 transition-colors" aria-expanded={isOpen}>
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
          <a href={`tel:${PHONE}`} onClick={() => { ctaTrack("sticky_call"); trackCallClick({ phone: PHONE, sourcePage: "secondary_sticky" }); }} className="flex flex-col items-center justify-center py-2.5 gap-0.5 hover:bg-gray-50">
            <Phone className="w-4 h-4" style={{ color: NAVY }} /><span className="text-[10px] font-extrabold" style={{ color: NAVY }}>Call</span>
          </a>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => { ctaTrack("sticky_whatsapp"); trackWhatsAppClick({ sourcePage: "secondary_sticky" }); }} className="flex flex-col items-center justify-center py-2.5 gap-0.5 hover:bg-gray-50">
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
