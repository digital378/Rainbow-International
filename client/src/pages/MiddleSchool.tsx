import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import ScrollProgress from "@/components/home/ScrollProgress";
import { buildFaqPageSchema, type WaveOneFaq } from "@/components/WaveOneSeoBlock";
import {
  BookOpen, Calculator, FlaskConical, Globe, Languages, Monitor, Trophy, Heart,
  ShieldCheck, Sparkles, MessageCircle, Phone, MapPin, ChevronRight, GraduationCap,
  ClipboardCheck, Bus, ArrowRight, CheckCircle2, Compass, Users, Brain, Lightbulb, Palette,
} from "lucide-react";
import { useState } from "react";
import { trackCallClick, trackWhatsAppClick, trackDirectionsClick, trackEvent } from "@/lib/analytics";

const NAVY = "#091a4f";
const NAVY_MID = "#0d3b86";
const AMBER = "#d97706";
const AMBER_LIGHT = "#f59e0b";

const WHATSAPP_URL = "https://wa.me/918291568972?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20Middle%20School%20%28Class%206%E2%80%938%29%20admission%20at%20Rainbow%20International%20School.";
const PHONE = "+912225976097";
const DIRECTIONS_URL = "https://maps.google.com/?q=Rainbow+International+School+Brahmand+Phase+4+Thane";

const FAQS: WaveOneFaq[] = [
  { q: "Which classes are included in the Middle School section at Rainbow International School?", a: "Our Middle School section covers Class 6, Class 7 and Class 8, following the CBSE curriculum with NCERT-aligned material." },
  { q: "Is the Middle School section CBSE-aligned?", a: "Yes. The entire Middle School is CBSE-affiliated, with curriculum, learning outcomes and assessments aligned to CBSE and NEP 2020." },
  { q: "What subjects are taught in Class 6 to Class 8?", a: "Scholastic subjects include English, Mathematics, Science, Social Science, Hindi, Marathi, Computer Studies and General Knowledge. Co-scholastic learning includes Physical Education, Sports, Art & Craft, Music & Dance, Clubs, Personality Development and Value Education." },
  { q: "How does RIS help students transition from Primary to Middle School?", a: "We focus on stronger study routines, subject-wise reading comprehension, writing skills, structured numeracy and confident classroom participation in Class 6 — easing the move from Primary to Middle School." },
  { q: "Does RIS focus on communication and confidence building in Middle School?", a: "Yes. Discussion-based learning, presentations, project work, public speaking and clubs are part of the regular Middle School routine to build communication and confidence." },
  { q: "Are sports and co-curricular activities part of Middle School?", a: "Yes. Sports, art, music, clubs, value education and personality development are part of the regular Class 6 to Class 8 timetable." },
  { q: "How does the school assess Middle School students?", a: "Through continuous evaluation — class participation, homework, worksheets, projects, periodic unit tests, reading and writing progress, co-curricular participation, teacher observation and regular parent communication." },
  { q: "Is transport available for Class 6 to Class 8 students?", a: "Yes. School transport covers Brahmand, Hiranandani Estate, Ghodbunder Road, Manpada, Kavesar, Kolshet, Pokhran Road and nearby Thane areas. Please confirm route availability with the admissions team." },
  { q: "Is RIS convenient for Class 6 to Class 8 admissions near Hiranandani Estate?", a: "Yes. Our Brahmand Phase 4 campus is easily reachable from Hiranandani Estate, with transport available on this route for middle school students." },
  { q: "Is RIS convenient for Middle School admissions near Ghodbunder Road?", a: "Yes. Many of our Class 6 to Class 8 families travel along Ghodbunder Road, and transport routes cover this corridor." },
  { q: "How can parents enquire for Class 6 admission?", a: "Submit the admission enquiry on the Admissions page, WhatsApp us, or call the admissions desk to confirm Class 6 seat availability and book a campus visit." },
  { q: "How can parents enquire for Class 7 and Class 8 admission?", a: "Class 7 and Class 8 admissions depend on seat availability for each grade. Please connect with the admissions team to check current vacancies and the next steps." },
  { q: "How can parents book a campus visit for Middle School?", a: "Book a guided campus visit through the Admissions page, by WhatsApp or by calling the admissions desk. Visits include a walkthrough of the middle school classrooms, labs, library and sports facilities." },
  { q: "What makes RIS a good CBSE Middle School in Thane?", a: "Strong academic foundation, CBSE-aligned curriculum, technology-aided learning, integrated co-curriculars, safe campus and a smooth transition to Secondary School make RIS a trusted choice for parents in Thane." },
];

const decisionCards = [
  { icon: BookOpen, title: "Strong Subject Foundation", body: "Deeper conceptual understanding across English, Math, Science and Social Science from Class 6 onwards." },
  { icon: GraduationCap, title: "CBSE-Aligned Learning", body: "NCERT-based curriculum, CBSE learning outcomes and structured academic routines." },
  { icon: MessageCircle, title: "Communication & Confidence Building", body: "Presentations, projects, debates and clubs that build voice, clarity and confidence." },
  { icon: Monitor, title: "Technology & Project-Based Learning", body: "Smart classrooms, digital tools, research-led projects and computer studies from Class 6." },
  { icon: Trophy, title: "Sports & Co-curricular Exposure", body: "Sports, art, music, dance, clubs and competitions are part of the regular weekly routine." },
  { icon: ShieldCheck, title: "Safe & Supportive School Environment", body: "Caring teachers, structured routine, safe campus and regular parent communication." },
];

const journey = [
  { grade: "Class 6", body: "Smooth transition from Primary with stronger subject routines, reading comprehension, writing skills, numeracy and classroom confidence." },
  { grade: "Class 7", body: "Deeper subject understanding, project work, scientific thinking, communication skills, teamwork and independent study habits." },
  { grade: "Class 8", body: "Preparing for Secondary School with stronger academics, responsibility, critical thinking, confidence and exam readiness." },
];

const gradeAdmissions = [
  { grade: "Class 6", title: "Class 6 Admission in Thane", body: "A smooth transition into Middle School with stronger academic routines, subject clarity, communication skills and confidence." },
  { grade: "Class 7", title: "Class 7 Admission in Thane", body: "Focused learning across core subjects with project work, technology exposure, co-curricular development and independent study habits." },
  { grade: "Class 8", title: "Class 8 Admission in Thane", body: "Preparation for Secondary School through structured academics, conceptual understanding, responsibility and exam readiness." },
];

const scholastic = [
  { name: "English", icon: BookOpen },
  { name: "Mathematics", icon: Calculator },
  { name: "Science", icon: FlaskConical },
  { name: "Social Science", icon: Globe },
  { name: "Hindi", icon: Languages },
  { name: "Marathi / Third Language", icon: Languages },
  { name: "Computer Studies", icon: Monitor },
  { name: "General Knowledge", icon: Compass },
];
const coScholastic = [
  { name: "Physical Education", icon: Trophy },
  { name: "Sports", icon: Trophy },
  { name: "Art & Craft", icon: Palette },
  { name: "Music & Dance", icon: Sparkles },
  { name: "Clubs & Activities", icon: Users },
  { name: "Personality Development", icon: Heart },
  { name: "Value Education", icon: Heart },
];

const skills = [
  { icon: Brain, title: "Critical Thinking", body: "Analyzing, questioning and reasoning across subjects.", color: "#e0edff", accent: NAVY_MID },
  { icon: MessageCircle, title: "Communication Skills", body: "Speaking, writing and presenting with clarity.", color: "#fff7e0", accent: AMBER },
  { icon: Monitor, title: "Digital Readiness", body: "Computer literacy and technology-aided learning.", color: "#e0f2fe", accent: "#0369a1" },
  { icon: Lightbulb, title: "Problem Solving", body: "Real-world thinking applied to academic challenges.", color: "#fdf2f8", accent: "#be185d" },
  { icon: BookOpen, title: "Reading & Writing Confidence", body: "Stronger comprehension and expression in every subject.", color: "#e0f7f0", accent: "#059669" },
  { icon: FlaskConical, title: "Scientific Curiosity", body: "Observation, experimentation and inquiry-led learning.", color: "#f3e0ff", accent: "#7c3aed" },
  { icon: Users, title: "Teamwork & Leadership", body: "Group work, peer learning and student leadership.", color: "#fff7e0", accent: AMBER },
  { icon: Heart, title: "Values & Responsibility", body: "Empathy, discipline and personal accountability.", color: "#e0edff", accent: NAVY_MID },
];

const classroom = [
  { title: "Discussion-Based Learning", body: "Open discussions that build voice and reasoning." },
  { title: "Group Activities", body: "Collaborative tasks that strengthen teamwork." },
  { title: "Project Work", body: "Subject-linked projects with real-world application." },
  { title: "Experiments & Observations", body: "Lab work that brings Science alive." },
  { title: "Reading & Writing Practice", body: "Daily routines across English, Hindi and Marathi." },
  { title: "Technology-Aided Lessons", body: "Smart classrooms, visuals and digital resources." },
  { title: "Teacher-Guided Concept Clarity", body: "Patient teachers, regular doubt-clearing." },
  { title: "Sports & Co-curricular Exposure", body: "Activities that balance academics with growth." },
];

const approach = [
  { title: "Concept Clarity", body: "Students are guided to understand concepts deeply across subjects rather than depending only on memorisation.", color: "#e0edff", accent: NAVY_MID, icon: Lightbulb },
  { title: "Independent Learning", body: "Middle School students are encouraged to build routines, complete assignments responsibly and ask questions confidently.", color: "#e0f7f0", accent: "#047857", icon: BookOpen },
  { title: "Application-Based Learning", body: "Activities, examples, discussions and projects help students connect classroom concepts with real-world understanding.", color: "#fff7e0", accent: AMBER, icon: Sparkles },
  { title: "Continuous Academic Support", body: "Teachers observe progress regularly and support students through feedback, practice and parent communication.", color: "#fdf2f8", accent: "#be185d", icon: ClipboardCheck },
];

const evaluationPoints = [
  "Class participation",
  "Homework and worksheets",
  "Projects and assignments",
  "Unit tests and periodic assessments",
  "Reading and writing progress",
  "Subject understanding",
  "Co-curricular participation",
  "Teacher feedback",
  "Parent communication",
];

const transitionCards = [
  { title: "Stronger Subject Foundation", body: "Conceptual depth that prepares students for Class 9.", icon: GraduationCap },
  { title: "Study Habits & Responsibility", body: "Routines, time management and personal organisation.", icon: ClipboardCheck },
  { title: "Communication & Confidence", body: "Speaking, presenting and engaging with peers and teachers.", icon: MessageCircle },
  { title: "Exam Readiness", body: "Test-taking skills, revision discipline and academic focus.", icon: Brain },
];

const localities = ["Hiranandani Estate", "Ghodbunder Road", "Brahmand Thane", "Manpada", "Kavesar", "Kolshet"];
const grades = ["Class 6", "Class 7", "Class 8"];

function ctaTrack(label: string) {
  trackEvent("middle_cta_click", "middle_school", label);
}

export default function MiddleSchool() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Middle School in Thane | CBSE Class 6 to 8"
        description="Explore Middle School at Rainbow International School, a CBSE school in Thane for Class 6 to 8 with academics, activities and confidence building."
        keywords="middle school in Thane, CBSE middle school in Thane, best middle school in Thane, Class 6 admission in Thane, Class 7 admission in Thane, Class 8 admission in Thane, middle school near Hiranandani Estate, middle school near Ghodbunder Road, middle school near Brahmand Phase 4, middle school near Manpada, middle school near Kavesar, middle school near Kolshet"
        canonical="https://rainbowinternationalschool.in/middle-school-section"
        ogImage="/images/home/academic/middle-section.jpg"
        appendSiteName={false}
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "Academics", href: "https://rainbowinternationalschool.in/middle-school-section" },
          { name: "Middle School (Class 6–8)", href: "https://rainbowinternationalschool.in/middle-school-section" },
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": "https://rainbowinternationalschool.in/middle-school-section#webpage",
              "url": "https://rainbowinternationalschool.in/middle-school-section",
              "name": "Middle School in Thane | CBSE Class 6 to 8",
              "description": "CBSE-affiliated Middle School (Class 6 to Class 8) at Rainbow International School, Thane.",
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
              "name": "Middle School (Class 6–8)",
              "description": "CBSE-affiliated middle school education for Class 6 to Class 8 in Thane, covering English, Mathematics, Science, Social Science, Hindi, Marathi, Computer Studies and co-curricular learning.",
              "provider": { "@id": "https://rainbowinternationalschool.in/#school" },
              "educationalProgramMode": "full-time",
              "programPrerequisites": "Completion of Primary / Class 5",
              "url": "https://rainbowinternationalschool.in/middle-school-section",
            },
            buildFaqPageSchema(FAQS),
          ],
        }}
      />
      <Navbar />

      {/* HERO */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: "min(78vh, 720px)" }} data-testid="section-hero">
        <picture>
          <source srcSet="/images/home/academic/middle-section.webp" type="image/webp" />
          <img src="/images/home/academic/middle-section.jpg" alt="Middle school students at Rainbow International School Thane" className="absolute inset-0 w-full h-full object-cover" fetchPriority="high" decoding="async" />
        </picture>
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(9,26,79,0.92) 0%, rgba(13,59,134,0.78) 60%, rgba(9,26,79,0.65) 100%)" }} />
        <div className="relative z-10 container mx-auto px-4 max-w-6xl py-20 md:py-28 lg:py-32 flex flex-col">
          <span className="inline-flex self-start items-center gap-2 text-[11px] font-extrabold tracking-[0.2em] uppercase px-4 py-2 rounded-full mb-5" style={{ background: AMBER_LIGHT, color: NAVY }} data-testid="badge-admissions-open">
            <Sparkles className="w-3.5 h-3.5" /> Admissions Open 2026–27
          </span>
          <h1 className="text-white font-black leading-[1.05] text-3xl sm:text-4xl md:text-5xl lg:text-6xl max-w-4xl" style={{ fontFamily: "'DM Sans', sans-serif" }} data-testid="text-h1">
            Middle School in Thane <span className="text-white/40 font-normal">|</span> <span style={{ color: AMBER_LIGHT }}>Class 6 to Class 8</span>
          </h1>
          <p className="text-white/95 text-base md:text-lg lg:text-xl mt-5 max-w-2xl font-medium">Building academic confidence, independent thinking, communication skills and strong subject foundations for the middle years.</p>
          <p className="text-white/75 text-sm md:text-base mt-3 max-w-2xl">A CBSE-aligned Middle School experience for Class 6 to Class 8 with structured academics, activity-based learning, values, sports, technology exposure and a safe learning environment.</p>
          <div className="flex flex-wrap gap-2 mt-6 max-w-3xl">
            {["CBSE-Aligned Middle School", "Class 6 to Class 8", "Strong Academic Foundation", "Technology-Aided Learning", "Sports, Activities & Values"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
                <CheckCircle2 className="w-3 h-3" /> {t}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-8">
            <a href="/admissions" onClick={() => ctaTrack("hero_enquire_class_6_8")} className="inline-flex items-center gap-2 font-extrabold text-sm sm:text-base px-6 py-3 rounded-full text-white shadow-lg hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }} data-testid="button-hero-enquire">
              Enquire for Class 6–8 <ArrowRight className="w-4 h-4" />
            </a>
            <a href="/admissions#campus-visit" onClick={() => ctaTrack("hero_campus_visit")} className="inline-flex items-center gap-2 font-extrabold text-sm sm:text-base px-6 py-3 rounded-full text-white border-2 border-white/80 hover:bg-white hover:text-[#091a4f] transition-colors" data-testid="button-hero-campus-visit">
              Book a Campus Visit
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => { ctaTrack("hero_whatsapp"); trackWhatsAppClick({ sourcePage: "middle_hero" }); }} className="inline-flex items-center gap-2 font-extrabold text-sm sm:text-base px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }} data-testid="button-hero-whatsapp">
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
              <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3" style={{ background: "#eef5ff", color: NAVY_MID }}>Why RIS for Middle School</span>
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>Why Parents Choose RIS for Middle School</h2>
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
              <a href="/admissions" onClick={() => ctaTrack("why_explore_admissions")} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: NAVY }} data-testid="button-explore-admissions-1">
                Explore Admissions for Class 6–8 <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* JOURNEY */}
        <section className="py-16 md:py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>The Middle School Learning Journey at RIS</h2>
              <p className="text-gray-600 mt-3">How learning grows year by year, from Class 6 to Class 8.</p>
            </div>
            <div className="hidden md:block relative">
              <div className="absolute left-0 right-0 top-7 h-0.5" style={{ background: `linear-gradient(90deg, ${NAVY_MID}, ${AMBER})` }} />
              <div className="grid grid-cols-3 gap-4 relative">
                {journey.map((j, i) => (
                  <div key={j.grade} className="flex flex-col items-center text-center px-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg ring-4 ring-white relative z-10" style={{ background: i === 0 ? NAVY_MID : i === 1 ? "#1e5bb6" : AMBER }}>{j.grade.replace("Class ", "")}</div>
                    <h3 className="font-extrabold text-sm mt-4" style={{ color: NAVY }}>{j.grade}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed mt-2">{j.body}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:hidden space-y-4">
              {journey.map((j, i) => (
                <div key={j.grade} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-sm shadow flex-shrink-0" style={{ background: i === 0 ? NAVY_MID : i === 1 ? "#1e5bb6" : AMBER }}>{j.grade.replace("Class ", "")}</div>
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
              <a href="/admissions" onClick={() => ctaTrack("journey_enquire")} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }} data-testid="button-journey-enquire">
                Enquire for Middle School Admissions <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* GRADE ADMISSIONS */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3" style={{ background: "#fff7e0", color: AMBER }}>Grade-Wise Admissions</span>
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>Class 6 to Class 8 Admissions at RIS</h2>
              <p className="text-gray-600 mt-3">Each grade has a specific learning focus. Choose your child's grade to enquire.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {gradeAdmissions.map((g, i) => (
                <div key={g.grade} className="rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 flex flex-col" data-testid={`card-grade-${i}`}>
                  <span className="inline-block self-start text-[11px] font-extrabold px-3 py-1 rounded-full mb-3" style={{ background: NAVY, color: "#fff" }}>{g.grade}</span>
                  <h3 className="font-extrabold text-base mb-2" style={{ color: NAVY }}>{g.title}</h3>
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
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>Subjects and Learning Areas in Middle School</h2>
              <p className="text-gray-600 mt-3">A balanced mix of scholastic and co-scholastic learning across Class 6 to Class 8.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-4" style={{ background: NAVY_MID }}>
                  <h3 className="text-white font-black text-base uppercase tracking-wide flex items-center gap-2"><BookOpen className="w-5 h-5" /> Scholastic Subjects</h3>
                </div>
                <ul className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 flex-grow">
                  {scholastic.map(({ name, icon: Icon }) => (
                    <li key={name} className="flex items-center gap-3 text-sm text-gray-700">
                      <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#eef5ff" }}><Icon className="w-4 h-4" style={{ color: NAVY_MID }} /></span>
                      <span className="font-semibold">{name}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-4" style={{ background: AMBER }}>
                  <h3 className="text-white font-black text-base uppercase tracking-wide flex items-center gap-2"><Trophy className="w-5 h-5" /> Co-Scholastic Learning</h3>
                </div>
                <ul className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 flex-grow">
                  {coScholastic.map(({ name, icon: Icon }) => (
                    <li key={name} className="flex items-center gap-3 text-sm text-gray-700">
                      <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#fff7e0" }}><Icon className="w-4 h-4" style={{ color: AMBER }} /></span>
                      <span className="font-semibold">{name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SKILLS */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>Skills We Build from Class 6 to Class 8</h2>
              <p className="text-gray-600 mt-3">Eight skill areas that grow steadily across Middle School.</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {skills.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.title} className="rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow" data-testid={`card-skill-${i}`}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: s.color }}><Icon className="w-5 h-5" style={{ color: s.accent }} /></div>
                    <h3 className="font-extrabold text-sm md:text-base mb-1.5" style={{ color: s.accent }}>{s.title}</h3>
                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{s.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CLASSROOM */}
        <section className="py-16 md:py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>Inside the Middle School Classroom</h2>
              <p className="text-gray-600 mt-3">Real classrooms, real learning — what a typical day at our Middle School looks like.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7 rounded-3xl overflow-hidden shadow-md aspect-[16/10] lg:aspect-auto lg:min-h-[420px] relative">
                <img src="/images/home/academic/middle-2.jpg" alt="Class 6 to Class 8 classroom at RIS Thane" className="w-full h-full object-cover" loading="lazy" decoding="async" width={1200} height={750} />
                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-white font-extrabold text-base md:text-lg">Discussion-based learning</p>
                </div>
              </div>
              <div className="lg:col-span-5 grid grid-cols-2 lg:grid-cols-1 gap-5">
                <div className="rounded-3xl overflow-hidden shadow-md aspect-[4/3] lg:aspect-auto lg:h-[200px] relative">
                  <img src="/images/home/academic/middle-3.jpg" alt="Middle school students at Rainbow International School Thane" className="w-full h-full object-cover" loading="lazy" decoding="async" width={600} height={400} />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-white font-extrabold text-sm">Group activities</p>
                  </div>
                </div>
                <div className="rounded-3xl overflow-hidden shadow-md aspect-[4/3] lg:aspect-auto lg:h-[200px] relative">
                  <img src="/images/students/middle-section.jpg" alt="Class 7 classroom activities at RIS Thane" className="w-full h-full object-cover" loading="lazy" decoding="async" width={600} height={400} />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-white font-extrabold text-sm">Project work</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
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

        {/* APPROACH */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>Our Approach to Middle School Education</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {approach.map((a, i) => {
                const Icon = a.icon;
                return (
                  <div key={a.title} className="rounded-2xl p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col" data-testid={`card-approach-${i}`}>
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
              <h2 className="text-2xl md:text-4xl font-black text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>How We Track Student Progress</h2>
              <p className="text-white/80 mt-3 text-sm md:text-base">Continuous academic observation that helps every Middle School student improve steadily — without unnecessary pressure.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 md:gap-4">
              {evaluationPoints.map((pt, i) => (
                <div key={pt} className="rounded-xl p-4 text-center backdrop-blur-sm border" style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.15)" }} data-testid={`evaluation-${i}`}>
                  <CheckCircle2 className="w-5 h-5 mx-auto mb-2" style={{ color: AMBER_LIGHT }} />
                  <p className="text-white text-xs md:text-sm font-bold leading-tight">{pt}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <a href="/admissions" onClick={() => ctaTrack("evaluation_speak_counsellor")} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full hover:opacity-90 transition-opacity" style={{ background: AMBER, color: "#fff" }} data-testid="button-speak-counsellor">
                Speak to Our Middle School Counsellor <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* TRANSITION TO SECONDARY */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>Preparing Students for Secondary School</h2>
              <p className="text-gray-600 mt-3">The Middle School years at RIS prepare students for the academic expectations of Class 9 and Class 10 by building strong study habits, conceptual clarity, confidence, discipline and responsibility.</p>
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
              <a href="/secondary-section" onClick={() => ctaTrack("transition_secondary")} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: NAVY }} data-testid="button-explore-secondary">
                Explore Secondary School <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* HYPERLOCAL */}
        <section className="py-16 md:py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3" style={{ background: "#eef5ff", color: NAVY_MID }}><MapPin className="w-3 h-3" /> Local to Thane</span>
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>Middle School Admissions Near You in Thane</h2>
              <p className="text-gray-600 mt-3 text-sm md:text-base">Rainbow International School is located at Brahmand Phase 4, Thane and is easily accessible for parents looking for Class 6 to Class 8 admission near Hiranandani Estate, Ghodbunder Road, Brahmand, Manpada, Kavesar, Kolshet, Pokhran Road, Patlipada and nearby areas.</p>
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
              <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" onClick={() => { ctaTrack("hyperlocal_directions"); trackDirectionsClick({ sourcePage: "middle_hyperlocal" }); }} className="inline-flex items-center gap-2 font-extrabold text-sm px-5 py-2.5 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: NAVY }} data-testid="button-get-directions">
                <MapPin className="w-4 h-4" /> Get Directions
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => { ctaTrack("hyperlocal_transport"); trackWhatsAppClick({ sourcePage: "middle_hyperlocal_transport" }); }} className="inline-flex items-center gap-2 font-extrabold text-sm px-5 py-2.5 rounded-full border-2 hover:opacity-80 transition-opacity" style={{ color: NAVY, borderColor: NAVY }} data-testid="button-check-transport">
                <Bus className="w-4 h-4" /> Check Transport Availability
              </a>
              <a href="/admissions" onClick={() => ctaTrack("hyperlocal_enquire")} className="inline-flex items-center gap-2 font-extrabold text-sm px-5 py-2.5 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }} data-testid="button-hyperlocal-enquire">
                Enquire for Middle School Admissions <ArrowRight className="w-4 h-4" />
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
                <h2 className="text-2xl md:text-4xl font-black text-white mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>Looking for Class 6 to Class 8 Admission?</h2>
                <p className="text-white/85 max-w-2xl mx-auto mb-7 text-sm md:text-base">Explore the Middle School at Rainbow International School and speak to our admissions team for grade-wise availability, campus visit and admission guidance.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <a href="/admissions" onClick={() => ctaTrack("final_enquire")} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }} data-testid="button-final-enquire">
                    Enquire for Class 6–8 <ArrowRight className="w-4 h-4" />
                  </a>
                  <a href="/admissions#campus-visit" onClick={() => ctaTrack("final_campus_visit")} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white border-2 border-white/80 hover:bg-white hover:text-[#091a4f] transition-colors" data-testid="button-final-campus-visit">
                    Book a Campus Visit
                  </a>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => { ctaTrack("final_whatsapp"); trackWhatsAppClick({ sourcePage: "middle_final" }); }} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }} data-testid="button-final-whatsapp">
                    <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                  </a>
                  <a href={`tel:${PHONE}`} onClick={() => { ctaTrack("final_call"); trackCallClick({ phone: PHONE, sourcePage: "middle_final" }); }} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white border-2 border-white/80 hover:bg-white hover:text-[#091a4f] transition-colors" data-testid="button-final-call">
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
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>Frequently Asked Questions About Middle School at RIS</h2>
              <p className="text-gray-600 mt-3">Quick answers about Class 6 to Class 8 admissions, curriculum, transport and more.</p>
            </div>
            <div className="space-y-3">
              {FAQS.map((f, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className="rounded-2xl border border-gray-200 bg-white overflow-hidden" data-testid={`faq-${i}`}>
                    <button type="button" onClick={() => { setOpenFaq(isOpen ? null : i); trackEvent("faq_interaction", "middle_faq", `q${i}_${!isOpen ? "open" : "close"}`); }} className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-gray-50 transition-colors" aria-expanded={isOpen}>
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
          <a href={`tel:${PHONE}`} onClick={() => { ctaTrack("sticky_call"); trackCallClick({ phone: PHONE, sourcePage: "middle_sticky" }); }} className="flex flex-col items-center justify-center py-2.5 gap-0.5 hover:bg-gray-50">
            <Phone className="w-4 h-4" style={{ color: NAVY }} /><span className="text-[10px] font-extrabold" style={{ color: NAVY }}>Call</span>
          </a>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => { ctaTrack("sticky_whatsapp"); trackWhatsAppClick({ sourcePage: "middle_sticky" }); }} className="flex flex-col items-center justify-center py-2.5 gap-0.5 hover:bg-gray-50">
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
