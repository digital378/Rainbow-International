import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import ScrollProgress from "@/components/home/ScrollProgress";
import { buildFaqPageSchema, type WaveOneFaq } from "@/components/WaveOneSeoBlock";
import {
  BookOpen, Calculator, FlaskConical, Palette, Users, Monitor, Languages,
  ShieldCheck, Heart, Trophy, Sparkles, MessageCircle, Phone, MapPin, ChevronRight,
  GraduationCap, ClipboardCheck, Bus, ArrowRight, CheckCircle2, Compass,
} from "lucide-react";
import { useState } from "react";
import { trackCallClick, trackWhatsAppClick, trackDirectionsClick, trackEvent } from "@/lib/analytics";

const NAVY = "#091a4f";
const NAVY_MID = "#0d3b86";
const AMBER = "#d97706";
const AMBER_LIGHT = "#f59e0b";

const WHATSAPP_URL = "https://wa.me/918291568972?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20Primary%20%28Class%201%E2%80%935%29%20admission%20at%20Rainbow%20International%20School.";
const PHONE = "+918291568972";
const DIRECTIONS_URL = "https://maps.google.com/?q=Rainbow+International+School+Brahmand+Phase+4+Thane";

// ── FAQ data ──────────────────────────────────────────────────────────────────
const PRIMARY_FAQS: WaveOneFaq[] = [
  { q: "Which classes are included in the Primary Section at Rainbow International School?", a: "Our Primary Section covers Class 1 to Class 5, following the CBSE curriculum with NCERT-aligned material." },
  { q: "Is the Primary Section CBSE-aligned?", a: "Yes. The entire Primary Section is CBSE-affiliated, with curriculum, learning outcomes and assessments aligned to CBSE and NEP 2020." },
  { q: "What subjects are taught from Class 1 to Class 5?", a: "Scholastic subjects include English, Mathematics, Hindi, Marathi, EVS, Computer and General Knowledge. Co-scholastic learning includes Physical Education, Sports, Value Education, Dance & Music, Personality Development and Art & Craft." },
  { q: "How does RIS build literacy and numeracy skills?", a: "Through structured reading, phonics, writing practice, recitation, number sense, real-world math and continuous activity-based learning — in line with the Foundational Literacy & Numeracy goals of NEP 2020." },
  { q: "Are co-curricular activities part of the Primary School routine?", a: "Yes. Music, art, sports, library, value education and personality development are part of the regular Primary timetable." },
  { q: "Does RIS offer computer education in Primary School?", a: "Yes. Computer literacy and technology-aided learning are introduced from Class 1 onwards in our smart classrooms." },
  { q: "How does the school assess primary students?", a: "We follow continuous academic observation — class participation, worksheets, project work, homework, reading & writing progress, co-curricular participation and regular parent communication." },
  { q: "Is transport available for primary students?", a: "Yes. School transport is available across Brahmand, Hiranandani Estate, Ghodbunder Road, Manpada, Kavesar, Kolshet, Pokhran Road and nearby Thane areas. Please check route availability with the admissions team." },
  { q: "Is RIS convenient for Class 1 to Class 5 students near Hiranandani Estate?", a: "Yes. Our campus at Brahmand Phase 4 is easily reachable from Hiranandani Estate, and transport is available on this route for primary students." },
  { q: "Is RIS convenient for primary admissions near Ghodbunder Road?", a: "Yes. Many of our Class 1 to Class 5 families travel from along Ghodbunder Road. Transport routes cover this corridor." },
  { q: "Is RIS close to Brahmand, Manpada, Kavesar and Kolshet?", a: "Yes. RIS is located in Brahmand Phase 4 and is conveniently accessible from Manpada, Kavesar, Kolshet and surrounding Thane neighbourhoods." },
  { q: "How can parents enquire for Class 1 admission?", a: "Submit the admission enquiry on the Admissions page, WhatsApp us, or call the admissions desk to confirm Class 1 seat availability and book a campus visit." },
  { q: "How can parents enquire for Class 2 to Class 5 admission?", a: "Class 2–5 admissions depend on seat availability for each grade. Please connect with the admissions team to check current vacancies and the next steps." },
  { q: "How can parents book a campus visit for the Primary Section?", a: "You can book a guided campus visit through the Admissions page, by WhatsApp or by calling the admissions desk. Visits include a walkthrough of the primary classrooms, library, activity areas and sports facilities." },
  { q: "What makes RIS a good CBSE primary school in Thane?", a: "Strong literacy and numeracy foundation, CBSE-aligned curriculum, activity-based classrooms, female-staff-led safe environment, integrated co-curriculars and a smooth transition to Middle School make RIS a trusted choice for parents in Thane." },
];

// ── Section data ──────────────────────────────────────────────────────────────
const decisionCards = [
  { icon: BookOpen, title: "Strong Foundation in English, Math & EVS", body: "Structured literacy, numeracy and EVS lessons that build clarity in core subjects from Class 1 itself." },
  { icon: GraduationCap, title: "CBSE-Aligned Learning", body: "NCERT-based curriculum, CBSE learning outcomes and NEP 2020-aligned foundational learning." },
  { icon: Languages, title: "Communication & Language Development", body: "Daily reading, recitation, storytelling and speaking practice in English, Hindi and Marathi." },
  { icon: Sparkles, title: "Activity-Based Classroom Learning", body: "Pair work, group activities, projects and hands-on tasks make concepts stick — not just rote learning." },
  { icon: Trophy, title: "Sports, Arts & Co-curricular Exposure", body: "Music, dance, art, craft, sports and clubs are part of the regular weekly timetable." },
  { icon: ShieldCheck, title: "Safe, Caring & Parent-Friendly Environment", body: "Female-staff-led primary section, structured routine, safe campus and regular parent communication." },
];

const scholastic = [
  { name: "English", icon: BookOpen },
  { name: "Mathematics", icon: Calculator },
  { name: "Hindi", icon: Languages },
  { name: "Marathi", icon: Languages },
  { name: "EVS", icon: FlaskConical },
  { name: "Computer", icon: Monitor },
  { name: "General Knowledge", icon: Compass },
];
const coScholastic = [
  { name: "Physical Education", icon: Trophy },
  { name: "Sports (Indoor & Outdoor)", icon: Trophy },
  { name: "Value Education", icon: Heart },
  { name: "Dance & Music", icon: Sparkles },
  { name: "Personality Development", icon: Users },
  { name: "Art & Craft", icon: Palette },
];

const journey = [
  { grade: "Class 1", body: "Settling into formal school learning with strong language and number foundations." },
  { grade: "Class 2", body: "Building reading fluency, writing confidence, number sense and classroom participation." },
  { grade: "Class 3", body: "Strengthening comprehension, problem-solving, EVS concepts and activity-based learning." },
  { grade: "Class 4", body: "Developing independent learning, project work, communication and subject confidence." },
  { grade: "Class 5", body: "Preparing students for middle school with stronger academics, responsibility and confidence." },
];

const gradeAdmissions = [
  { grade: "Class 1", title: "Class 1 Admission in Thane", body: "A smooth transition into formal schooling with a strong focus on reading, writing, number sense, routines and confidence." },
  { grade: "Class 2", title: "Class 2 Admission in Thane", body: "Strengthening literacy, numeracy, classroom participation and activity-based learning." },
  { grade: "Class 3", title: "Class 3 Admission in Thane", body: "Helping students build comprehension, EVS understanding, problem-solving and independent learning habits." },
  { grade: "Class 4", title: "Class 4 Admission in Thane", body: "Supporting subject clarity, project work, communication skills and academic confidence." },
  { grade: "Class 5", title: "Class 5 Admission in Thane", body: "Preparing students for middle school with stronger academics, responsibility, confidence and study habits." },
];

const skills = [
  { icon: Languages, title: "Language Skills", body: "English, Hindi and Marathi communication", color: "#e0edff", accent: NAVY_MID },
  { icon: Calculator, title: "Math Skills", body: "Numeracy, calculations and problem-solving", color: "#fff7e0", accent: AMBER },
  { icon: FlaskConical, title: "Scientific Skills", body: "EVS, observation and curiosity", color: "#e0f7f0", accent: "#059669" },
  { icon: Palette, title: "Creative Skills", body: "Music, art, craft and expression", color: "#fdf2f8", accent: "#be185d" },
  { icon: Users, title: "Interpersonal Skills", body: "Teamwork, values and classroom confidence", color: "#f3e0ff", accent: "#7c3aed" },
  { icon: Monitor, title: "Digital Readiness", body: "Computers and technology-aided learning", color: "#e0f2fe", accent: "#0369a1" },
];

const classroom = [
  { title: "Activity-Based Learning", body: "Hands-on tasks, manipulatives and learning by doing." },
  { title: "Group Work & Peer Learning", body: "Small-group discussions, collaborative projects and peer support." },
  { title: "Reading, Writing & Speaking", body: "Daily practice across English, Hindi and Marathi." },
  { title: "Smart Classrooms & Digital Tools", body: "Visual, interactive lessons that bring concepts to life." },
  { title: "Teacher-Guided Concept Clarity", body: "Patient teachers, regular doubt-clearing and individual attention." },
  { title: "Project Work & Presentations", body: "Confidence-building through show-and-tell, projects and class presentations." },
];

const approach = [
  { title: "Teaching–Learning Strategies", body: "Students learn through explanation, discussion, pair work, group activities, worksheets, projects and hands-on classroom experiences.", color: "#e0edff", accent: NAVY_MID, icon: BookOpen },
  { title: "Language Development", body: "Regular reading, writing, recitation, storytelling and speaking activities help children become confident communicators.", color: "#e0f7f0", accent: "#047857", icon: Languages },
  { title: "Numeracy Development", body: "Mathematics is taught through practice, real-life examples, number work, problem-solving and activity-based learning.", color: "#fff7e0", accent: AMBER, icon: Calculator },
  { title: "Continuous Evaluation", body: "Students are assessed through class participation, worksheets, projects, homework and regular academic observation.", color: "#fdf2f8", accent: "#be185d", icon: ClipboardCheck },
];

const evaluationPoints = [
  "Class participation",
  "Worksheets and assignments",
  "Project work",
  "Homework",
  "Reading and writing progress",
  "Co-curricular participation",
  "Teacher observation",
  "Regular parent communication",
];

const transitionCards = [
  { title: "Academic Readiness", body: "Subject clarity, study habits and groundwork for middle-school concepts.", icon: GraduationCap },
  { title: "Confidence & Communication", body: "Speaking, presenting and engaging with peers and teachers.", icon: MessageCircle },
  { title: "Responsibility & Discipline", body: "Routine, time management, homework and personal organisation.", icon: ClipboardCheck },
  { title: "Activity & Leadership Exposure", body: "Sports, arts, clubs and class roles that build leadership early.", icon: Trophy },
];

const trustItems = [
  { icon: Heart, title: "Caring Teachers" },
  { icon: ShieldCheck, title: "Safe Campus" },
  { icon: ClipboardCheck, title: "Structured School Routine" },
  { icon: MessageCircle, title: "Regular Parent Communication" },
  { icon: Sparkles, title: "Co-curricular Balance" },
  { icon: Bus, title: "Transport Support" },
];

const localities = ["Hiranandani Estate", "Ghodbunder Road", "Brahmand Thane", "Manpada", "Kavesar", "Kolshet"];
const grades = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function ctaTrack(label: string) {
  trackEvent("primary_cta_click", "primary", label);
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Primary() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Primary School in Thane | CBSE Class 1 to 5"
        description="Explore Primary School at Rainbow International School, a CBSE school in Thane for Class 1 to 5 with academics, activities, safety and care."
        keywords="primary school in Thane, CBSE primary school in Thane, best primary school in Thane, Class 1 admission in Thane, Class 2 admission in Thane, Class 3 admission in Thane, Class 4 admission in Thane, Class 5 admission in Thane, Class 1 admission near Hiranandani Estate, Class 1 admission near Ghodbunder Road, Class 5 admission near Brahmand Thane"
        canonical="https://rainbowinternationalschool.in/primary-section"
        ogImage="/images/home/academic/primary-section.jpg"
        appendSiteName={false}
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "Academics", href: "https://rainbowinternationalschool.in/primary-section" },
          { name: "Primary (Class 1–5)", href: "https://rainbowinternationalschool.in/primary-section" },
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "EducationalOccupationalProgram",
              "name": "Primary Section (Class 1–5)",
              "description": "CBSE-affiliated primary education for Class 1 to Class 5 in Thane, covering English, Math, Hindi, Marathi, EVS, Computer and co-curricular learning with continuous evaluation.",
              "provider": { "@type": "School", "name": "Rainbow International School", "url": "https://rainbowinternationalschool.in/" },
              "educationalProgramMode": "full-time",
              "programPrerequisites": "Completion of Pre-Primary / Age 6 years",
              "url": "https://rainbowinternationalschool.in/primary-section",
            },
            buildFaqPageSchema(PRIMARY_FAQS),
          ],
        }}
      />
      <Navbar />

      {/* ═════════════════ 1. HERO ═════════════════ */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: "min(78vh, 720px)" }} data-testid="section-primary-hero">
        <picture>
          <source media="(max-width: 768px)" srcSet="/images/home/academic/primary-section.webp" type="image/webp" />
          <source srcSet="/images/home/academic/primary-section.webp" type="image/webp" />
          <img
            src="/images/home/academic/primary-section.jpg"
            alt="Primary school students at Rainbow International School Thane"
            className="absolute inset-0 w-full h-full object-cover"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(9,26,79,0.92) 0%, rgba(13,59,134,0.78) 60%, rgba(9,26,79,0.65) 100%)" }}
        />
        <div className="relative z-10 container mx-auto px-4 max-w-6xl py-20 md:py-28 lg:py-32 flex flex-col">
          <span
            className="inline-flex self-start items-center gap-2 text-[11px] font-extrabold tracking-[0.2em] uppercase px-4 py-2 rounded-full mb-5"
            style={{ background: AMBER_LIGHT, color: NAVY }}
            data-testid="badge-admissions-open"
          >
            <Sparkles className="w-3.5 h-3.5" /> Admissions Open 2027–28
          </span>
          <h1
            className="text-white font-black leading-[1.05] text-3xl sm:text-4xl md:text-5xl lg:text-6xl max-w-4xl"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            data-testid="text-primary-h1"
          >
            Primary School in Thane <br className="hidden sm:block" />
            <span style={{ color: AMBER_LIGHT }}>Class 1 to Class 5</span>
          </h1>
          <p className="text-white/95 text-base md:text-lg lg:text-xl mt-5 max-w-2xl font-medium">
            Build strong foundations in literacy, numeracy, confidence, values and joyful learning at Rainbow International School.
          </p>
          <p className="text-white/75 text-sm md:text-base mt-3 max-w-2xl">
            A CBSE-affiliated primary school experience designed for academic growth, communication skills, creativity, co-curricular exposure and a safe learning environment.
          </p>

          {/* Trust chips */}
          <div className="flex flex-wrap gap-2 mt-6 max-w-3xl">
            {["CBSE Affiliated", "Class 1 to Class 5", "Strong Literacy & Numeracy", "Safe & Caring Campus", "Activities, Sports & Values"].map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm"
                style={{ background: "rgba(255,255,255,0.15)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.3)" }}
              >
                <CheckCircle2 className="w-3 h-3" /> {t}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mt-8">
            <a
              href="/admissions"
              onClick={() => ctaTrack("hero_enquire_class_1_5")}
              className="inline-flex items-center gap-2 font-extrabold text-sm sm:text-base px-6 py-3 rounded-full text-white shadow-lg hover:opacity-90 transition-opacity"
              style={{ background: AMBER }}
              data-testid="button-hero-enquire"
            >
              Enquire for Class 1–5 <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/admissions#campus-visit"
              onClick={() => ctaTrack("hero_campus_visit")}
              className="inline-flex items-center gap-2 font-extrabold text-sm sm:text-base px-6 py-3 rounded-full text-white border-2 border-white/80 hover:bg-white hover:text-[#091a4f] transition-colors"
              data-testid="button-hero-campus-visit"
            >
              Book a Campus Visit
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { ctaTrack("hero_whatsapp"); trackWhatsAppClick({ sourcePage: "primary_hero" }); }}
              className="inline-flex items-center gap-2 font-extrabold text-sm sm:text-base px-6 py-3 rounded-full bg-[#25D366] text-white hover:opacity-90 transition-opacity"
              data-testid="button-hero-whatsapp"
            >
              <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <main className="flex-grow">

        {/* ═════════════════ 2. WHY PARENTS CHOOSE RIS ═════════════════ */}
        <section className="py-16 md:py-20 bg-white" data-testid="section-why-parents">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3" style={{ background: "#eef5ff", color: NAVY_MID }}>
                Why RIS for Primary
              </span>
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>
                Why Parents Choose RIS for Primary School
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {decisionCards.map((c, i) => {
                const Icon = c.icon;
                return (
                  <div key={i} className="rounded-2xl p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all" data-testid={`card-decision-${i}`}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "#eef5ff" }}>
                      <Icon className="w-6 h-6" style={{ color: NAVY_MID }} />
                    </div>
                    <h3 className="font-extrabold text-base mb-1.5" style={{ color: NAVY }}>{c.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{c.body}</p>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-10">
              <a
                href="/admissions"
                onClick={() => ctaTrack("why_parents_explore_admissions")}
                className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity"
                style={{ background: NAVY }}
                data-testid="button-explore-admissions-1"
              >
                Explore Admissions for Class 1–5 <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* ═════════════════ 3. SUBJECTS & LEARNING AREAS ═════════════════ */}
        <section className="py-16 md:py-20" style={{ background: "#f8faff" }} data-testid="section-subjects">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>
                Subjects and Learning Areas
              </h2>
              <p className="text-gray-600 mt-3">A balanced mix of scholastic and co-scholastic learning across Class 1 to Class 5.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Scholastic */}
              <div className="rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col" data-testid="card-scholastic">
                <div className="px-6 py-4" style={{ background: NAVY_MID }}>
                  <h3 className="text-white font-black text-base uppercase tracking-wide flex items-center gap-2">
                    <BookOpen className="w-5 h-5" /> Scholastic Subjects
                  </h3>
                </div>
                <ul className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 flex-grow">
                  {scholastic.map(({ name, icon: Icon }) => (
                    <li key={name} className="flex items-center gap-3 text-sm text-gray-700">
                      <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#eef5ff" }}>
                        <Icon className="w-4 h-4" style={{ color: NAVY_MID }} />
                      </span>
                      <span className="font-semibold">{name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Co-Scholastic */}
              <div className="rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col" data-testid="card-co-scholastic">
                <div className="px-6 py-4" style={{ background: AMBER }}>
                  <h3 className="text-white font-black text-base uppercase tracking-wide flex items-center gap-2">
                    <Trophy className="w-5 h-5" /> Co-Scholastic Learning
                  </h3>
                </div>
                <ul className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 flex-grow">
                  {coScholastic.map(({ name, icon: Icon }) => (
                    <li key={name} className="flex items-center gap-3 text-sm text-gray-700">
                      <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#fff7e0" }}>
                        <Icon className="w-4 h-4" style={{ color: AMBER }} />
                      </span>
                      <span className="font-semibold">{name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ═════════════════ 4. PRIMARY LEARNING JOURNEY ═════════════════ */}
        <section className="py-16 md:py-20 bg-white" data-testid="section-journey">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>
                The Primary Learning Journey at RIS
              </h2>
              <p className="text-gray-600 mt-3">How learning grows year by year, from Class 1 to Class 5.</p>
            </div>

            {/* Desktop horizontal */}
            <div className="hidden md:block relative">
              <div className="absolute left-0 right-0 top-7 h-0.5" style={{ background: `linear-gradient(90deg, ${NAVY_MID}, ${AMBER})` }} />
              <div className="grid grid-cols-5 gap-4 relative">
                {journey.map((j, i) => (
                  <div key={j.grade} className="flex flex-col items-center text-center" data-testid={`journey-${i}`}>
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg ring-4 ring-white relative z-10"
                      style={{ background: i < 2 ? NAVY_MID : i < 4 ? "#1e5bb6" : AMBER }}
                    >
                      {j.grade.replace("Class ", "")}
                    </div>
                    <h3 className="font-extrabold text-sm mt-4" style={{ color: NAVY }}>{j.grade}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed mt-2 px-1">{j.body}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile vertical */}
            <div className="md:hidden space-y-4">
              {journey.map((j, i) => (
                <div key={j.grade} className="flex gap-4" data-testid={`journey-mobile-${i}`}>
                  <div className="flex flex-col items-center">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-sm shadow flex-shrink-0"
                      style={{ background: i < 2 ? NAVY_MID : i < 4 ? "#1e5bb6" : AMBER }}
                    >
                      {j.grade.replace("Class ", "")}
                    </div>
                    {i < journey.length - 1 && <div className="w-0.5 flex-grow my-1" style={{ background: "#cbd5e1" }} />}
                  </div>
                  <div className="pb-2 flex-grow">
                    <h3 className="font-extrabold text-base" style={{ color: NAVY }}>{j.grade}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mt-1">{j.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <a
                href="/admissions"
                onClick={() => ctaTrack("journey_enquire")}
                className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity"
                style={{ background: AMBER }}
                data-testid="button-journey-enquire"
              >
                Enquire for Primary Admissions <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* ═════════════════ 5. CLASS 1–5 ADMISSIONS ═════════════════ */}
        <section className="py-16 md:py-20" style={{ background: "#f8faff" }} data-testid="section-grade-admissions">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3" style={{ background: "#fff7e0", color: AMBER }}>
                Grade-Wise Admissions
              </span>
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>
                Class 1 to Class 5 Admissions at RIS
              </h2>
              <p className="text-gray-600 mt-3">Each grade has a specific learning focus. Choose your child's grade to enquire.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {gradeAdmissions.map((g, i) => (
                <div key={g.grade} className="rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 flex flex-col" data-testid={`card-grade-admission-${i}`}>
                  <span className="inline-block self-start text-[11px] font-extrabold px-3 py-1 rounded-full mb-3" style={{ background: NAVY, color: "#ffffff" }}>
                    {g.grade}
                  </span>
                  <h3 className="font-extrabold text-base mb-2" style={{ color: NAVY }}>{g.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed flex-grow">{g.body}</p>
                  <a
                    href="/admissions"
                    onClick={() => ctaTrack(`grade_admission_enquire_${g.grade.toLowerCase().replace(" ", "_")}`)}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold mt-5 self-start px-4 py-2 rounded-full border-2 hover:opacity-80 transition-opacity"
                    style={{ color: NAVY, borderColor: NAVY }}
                    data-testid={`button-grade-enquire-${i}`}
                  >
                    Enquire for this Class <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═════════════════ 6. SKILLS WE BUILD ═════════════════ */}
        <section className="py-16 md:py-20 bg-white" data-testid="section-skills">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>
                Skills We Build in Primary Years
              </h2>
              <p className="text-gray-600 mt-3">Six skill areas that grow steadily across Class 1 to Class 5.</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {skills.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.title} className="rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow" data-testid={`card-skill-${i}`}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: s.color }}>
                      <Icon className="w-5 h-5" style={{ color: s.accent }} />
                    </div>
                    <h3 className="font-extrabold text-sm md:text-base mb-1.5" style={{ color: s.accent }}>{s.title}</h3>
                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{s.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═════════════════ 7. INSIDE THE PRIMARY CLASSROOM ═════════════════ */}
        <section className="py-16 md:py-20" style={{ background: "#f8faff" }} data-testid="section-classroom">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>
                Inside the Primary Classroom
              </h2>
              <p className="text-gray-600 mt-3">Real classrooms, real learning — what a typical day at our Primary Section looks like.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Hero image */}
              <div className="lg:col-span-7 rounded-3xl overflow-hidden shadow-md aspect-[16/10] lg:aspect-auto lg:min-h-[420px] relative">
                <img
                  src="/images/students/primary-group-work.jpg"
                  alt="CBSE primary classroom at RIS Thane — students in group work"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  width={1200}
                  height={750}
                />
                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-white font-extrabold text-base md:text-lg">Group work and peer learning</p>
                </div>
              </div>
              {/* Side images */}
              <div className="lg:col-span-5 grid grid-cols-2 lg:grid-cols-1 gap-5">
                <div className="rounded-3xl overflow-hidden shadow-md aspect-[4/3] lg:aspect-auto lg:h-[200px] relative">
                  <img
                    src="/images/students/primary-classroom-hand.jpg"
                    alt="Class 1 to Class 5 students learning at Rainbow International School"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    width={600}
                    height={400}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-white font-extrabold text-sm">Class participation</p>
                  </div>
                </div>
                <div className="rounded-3xl overflow-hidden shadow-md aspect-[4/3] lg:aspect-auto lg:h-[200px] relative">
                  <img
                    src="/images/students/primary-section.jpg"
                    alt="Primary school activities in Thane at RIS"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    width={600}
                    height={400}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-white font-extrabold text-sm">Activity-based learning</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {classroom.map((c, i) => (
                <div key={c.title} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5" data-testid={`card-classroom-${i}`}>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: AMBER }} />
                    <div>
                      <h3 className="font-extrabold text-sm" style={{ color: NAVY }}>{c.title}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed mt-1">{c.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═════════════════ 8. OUR APPROACH ═════════════════ */}
        <section className="py-16 md:py-20 bg-white" data-testid="section-approach">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>
                Our Approach to Primary Education
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {approach.map((a, i) => {
                const Icon = a.icon;
                return (
                  <div key={a.title} className="rounded-2xl p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col" data-testid={`card-approach-${i}`}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: a.color }}>
                      <Icon className="w-6 h-6" style={{ color: a.accent }} />
                    </div>
                    <h3 className="font-extrabold text-base mb-2" style={{ color: a.accent }}>{a.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{a.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═════════════════ 9. HOW WE TRACK PROGRESS ═════════════════ */}
        <section className="py-16 md:py-20" style={{ background: NAVY }} data-testid="section-evaluation">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3" style={{ background: AMBER_LIGHT, color: NAVY }}>
                Continuous Evaluation
              </span>
              <h2 className="text-2xl md:text-4xl font-black text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                How We Track Student Progress
              </h2>
              <p className="text-white/80 mt-3 text-sm md:text-base">
                RIS follows continuous academic observation to help every child improve steadily — without unnecessary pressure.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {evaluationPoints.map((pt, i) => (
                <div
                  key={pt}
                  className="rounded-xl p-4 text-center backdrop-blur-sm border"
                  style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.15)" }}
                  data-testid={`evaluation-point-${i}`}
                >
                  <CheckCircle2 className="w-5 h-5 mx-auto mb-2" style={{ color: AMBER_LIGHT }} />
                  <p className="text-white text-xs md:text-sm font-bold leading-tight">{pt}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <a
                href="/admissions"
                onClick={() => ctaTrack("evaluation_speak_counsellor")}
                className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
                style={{ background: AMBER, color: "#ffffff" }}
                data-testid="button-speak-counsellor"
              >
                Speak to Our Primary Section Counsellor <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* ═════════════════ 10. PREPARING FOR MIDDLE SCHOOL ═════════════════ */}
        <section className="py-16 md:py-20 bg-white" data-testid="section-transition">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>
                Preparing Children for Middle School
              </h2>
              <p className="text-gray-600 mt-3">
                Our Primary Section prepares students for the next stage of learning by building subject clarity, independent study habits, confidence, teamwork, responsibility and communication skills.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {transitionCards.map((t, i) => {
                const Icon = t.icon;
                return (
                  <div key={t.title} className="rounded-2xl p-6 bg-gradient-to-br from-white to-[#f8faff] border border-gray-100 shadow-sm hover:shadow-md transition-shadow" data-testid={`card-transition-${i}`}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: NAVY }}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-extrabold text-base mb-2" style={{ color: NAVY }}>{t.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{t.body}</p>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-10">
              <a
                href="/middle-school-section"
                onClick={() => ctaTrack("transition_explore_middle_school")}
                className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity"
                style={{ background: NAVY }}
                data-testid="button-explore-middle-school"
              >
                Explore Middle School <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* ═════════════════ 11. SAFE & SUPPORTIVE ENVIRONMENT ═════════════════ */}
        <section className="py-16 md:py-20" style={{ background: "#f8faff" }} data-testid="section-trust">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3" style={{ background: "#eef5ff", color: NAVY_MID }}>
                  Parent Trust
                </span>
                <h2 className="text-2xl md:text-4xl font-black mb-4" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>
                  A Safe and Supportive Primary School Environment
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Our Primary Section is led by a caring, female-staff-led team and a structured daily routine that gives parents confidence — and helps children settle, learn and grow happily.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {trustItems.map((t) => {
                    const Icon = t.icon;
                    return (
                      <div key={t.title} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100">
                        <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#fff7e0" }}>
                          <Icon className="w-4 h-4" style={{ color: AMBER }} />
                        </span>
                        <p className="text-sm font-bold" style={{ color: NAVY }}>{t.title}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-3xl overflow-hidden shadow-lg aspect-[4/3] lg:aspect-[5/4]">
                <img
                  src="/images/students/primary-classroom-hand.jpg"
                  alt="CBSE primary education at Rainbow International School Thane"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  width={800}
                  height={640}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ═════════════════ 12. HYPERLOCAL GRADE-WISE ═════════════════ */}
        <section className="py-16 md:py-20 bg-white" data-testid="section-hyperlocal">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3" style={{ background: "#eef5ff", color: NAVY_MID }}>
                <MapPin className="w-3 h-3" /> Local to Thane
              </span>
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>
                Primary Admissions Near You in Thane
              </h2>
              <p className="text-gray-600 mt-3 text-sm md:text-base">
                Rainbow International School is located at Brahmand Phase 4, Thane and is easily accessible for parents looking for Class 1 to Class 5 admission near Hiranandani Estate, Ghodbunder Road, Manpada, Kavesar, Kolshet, Pokhran Road, Patlipada and nearby areas.
              </p>
            </div>

            {/* Locality cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {localities.map((loc, i) => (
                <div key={loc} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5" data-testid={`locality-${i}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4" style={{ color: AMBER }} />
                    <h3 className="font-extrabold text-base" style={{ color: NAVY }}>Near {loc}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {grades.map((g) => (
                      <a
                        key={g}
                        href="/admissions"
                        onClick={() => ctaTrack(`hyperlocal_${g}_${loc}`.toLowerCase().replace(/\s+/g, "_"))}
                        className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full border hover:opacity-80 transition-opacity"
                        style={{ background: "#f8faff", color: NAVY_MID, borderColor: "#dbe7ff" }}
                        data-testid={`chip-${g.toLowerCase().replace(" ", "-")}-${loc.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {g} admission
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-10">
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => { ctaTrack("hyperlocal_directions"); trackDirectionsClick({ sourcePage: "primary_hyperlocal" }); }}
                className="inline-flex items-center gap-2 font-extrabold text-sm px-5 py-2.5 rounded-full text-white hover:opacity-90 transition-opacity"
                style={{ background: NAVY }}
                data-testid="button-get-directions"
              >
                <MapPin className="w-4 h-4" /> Get Directions
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => { ctaTrack("hyperlocal_transport"); trackWhatsAppClick({ sourcePage: "primary_hyperlocal_transport" }); }}
                className="inline-flex items-center gap-2 font-extrabold text-sm px-5 py-2.5 rounded-full border-2 hover:opacity-80 transition-opacity"
                style={{ color: NAVY, borderColor: NAVY }}
                data-testid="button-check-transport"
              >
                <Bus className="w-4 h-4" /> Check Transport Availability
              </a>
              <a
                href="/admissions"
                onClick={() => ctaTrack("hyperlocal_enquire")}
                className="inline-flex items-center gap-2 font-extrabold text-sm px-5 py-2.5 rounded-full text-white hover:opacity-90 transition-opacity"
                style={{ background: AMBER }}
                data-testid="button-hyperlocal-enquire"
              >
                Enquire for Primary Admissions <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* ═════════════════ 13. CTA BLOCK ═════════════════ */}
        <section className="py-16 md:py-20" data-testid="section-cta">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="rounded-3xl p-8 md:p-12 text-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_MID} 100%)` }}>
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20" style={{ background: AMBER_LIGHT }} />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10" style={{ background: AMBER_LIGHT }} />
              <div className="relative z-10">
                <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-4" style={{ background: AMBER_LIGHT, color: NAVY }}>
                  Admissions 2027–28
                </span>
                <h2 className="text-2xl md:text-4xl font-black text-white mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Looking for Class 1 to Class 5 Admission?
                </h2>
                <p className="text-white/85 max-w-2xl mx-auto mb-7 text-sm md:text-base">
                  Explore the Primary Section at Rainbow International School and speak to our admissions team for grade-wise availability, campus visit and admission guidance.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <a
                    href="/admissions"
                    onClick={() => ctaTrack("final_enquire")}
                    className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity"
                    style={{ background: AMBER }}
                    data-testid="button-final-enquire"
                  >
                    Enquire for Class 1–5 <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="/admissions#campus-visit"
                    onClick={() => ctaTrack("final_campus_visit")}
                    className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white border-2 border-white/80 hover:bg-white hover:text-[#091a4f] transition-colors"
                    data-testid="button-final-campus-visit"
                  >
                    Book a Campus Visit
                  </a>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => { ctaTrack("final_whatsapp"); trackWhatsAppClick({ sourcePage: "primary_final_cta" }); }}
                    className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full bg-[#25D366] text-white hover:opacity-90 transition-opacity"
                    data-testid="button-final-whatsapp"
                  >
                    <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                  </a>
                  <a
                    href={`tel:${PHONE}`}
                    onClick={() => { ctaTrack("final_call"); trackCallClick({ phone: PHONE, sourcePage: "primary_final_cta" }); }}
                    className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white border-2 border-white/80 hover:bg-white hover:text-[#091a4f] transition-colors"
                    data-testid="button-final-call"
                  >
                    <Phone className="w-4 h-4" /> Call Admissions
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═════════════════ 14. FAQS ═════════════════ */}
        <section className="py-16 md:py-20 bg-white" data-testid="section-faqs">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>
                Frequently Asked Questions About Primary School at RIS
              </h2>
              <p className="text-gray-600 mt-3">Quick answers about Class 1 to Class 5 admissions, curriculum, transport and more.</p>
            </div>
            <div className="space-y-3">
              {PRIMARY_FAQS.map((f, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className="rounded-2xl border border-gray-200 bg-white overflow-hidden" data-testid={`faq-${i}`}>
                    <button
                      type="button"
                      onClick={() => { setOpenFaq(isOpen ? null : i); trackEvent("faq_interaction", "primary_faq", `q${i}_${!isOpen ? "open" : "close"}`); }}
                      className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-gray-50 transition-colors"
                      aria-expanded={isOpen}
                      data-testid={`faq-toggle-${i}`}
                    >
                      <span className="font-extrabold text-sm md:text-base" style={{ color: NAVY }}>{f.q}</span>
                      <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} style={{ color: AMBER }} />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                        {f.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </main>

      <Footer />

      {/* ═════════════════ Sticky Mobile CTA Bar ═════════════════ */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t border-gray-200 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.08)]" data-testid="mobile-cta-bar">
        <div className="grid grid-cols-4 divide-x divide-gray-200">
          <a
            href={`tel:${PHONE}`}
            onClick={() => { ctaTrack("sticky_call"); trackCallClick({ phone: PHONE, sourcePage: "primary_sticky" }); }}
            className="flex flex-col items-center justify-center py-2.5 gap-0.5 hover:bg-gray-50"
            data-testid="sticky-call"
          >
            <Phone className="w-4 h-4" style={{ color: NAVY }} />
            <span className="text-[10px] font-extrabold" style={{ color: NAVY }}>Call</span>
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => { ctaTrack("sticky_whatsapp"); trackWhatsAppClick({ sourcePage: "primary_sticky" }); }}
            className="flex flex-col items-center justify-center py-2.5 gap-0.5 hover:bg-gray-50"
            data-testid="sticky-whatsapp"
          >
            <MessageCircle className="w-4 h-4" style={{ color: "#25D366" }} />
            <span className="text-[10px] font-extrabold" style={{ color: NAVY }}>WhatsApp</span>
          </a>
          <a
            href="/admissions"
            onClick={() => ctaTrack("sticky_enquire")}
            className="flex flex-col items-center justify-center py-2.5 gap-0.5 hover:bg-gray-50"
            data-testid="sticky-enquire"
          >
            <ClipboardCheck className="w-4 h-4" style={{ color: AMBER }} />
            <span className="text-[10px] font-extrabold" style={{ color: NAVY }}>Enquire</span>
          </a>
          <a
            href="/admissions#campus-visit"
            onClick={() => ctaTrack("sticky_book_visit")}
            className="flex flex-col items-center justify-center py-2.5 gap-0.5 hover:bg-gray-50"
            data-testid="sticky-book-visit"
          >
            <Compass className="w-4 h-4" style={{ color: NAVY_MID }} />
            <span className="text-[10px] font-extrabold" style={{ color: NAVY }}>Book Visit</span>
          </a>
        </div>
      </div>
      {/* spacer so sticky bar doesn't cover content */}
      <div className="h-14 lg:hidden" aria-hidden="true" />
    </div>
  );
}
