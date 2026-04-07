import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { ExternalLink } from "lucide-react";

const CBSE_URL = "https://cbseacademic.nic.in//curriculum_2024.html";

// ── Stage-wise data ──────────────────────────────────────────────
const stages = [
  {
    label: "Pre-Primary",
    grades: "Nursery · Jr. KG · Sr. KG",
    color: "#fef3c7",
    accent: "#b45309",
    tagline: "Learning through play, exploration and joy",
    focus: [
      "Play-based and activity-based learning",
      "Early literacy — phonics, storytelling, rhymes",
      "Early numeracy — counting, shapes, patterns",
      "Social skills — sharing, cooperation, communication",
      "Sensory and motor skill development",
      "Introduction to environment awareness",
    ],
    subjects: ["English", "Hindi / Marathi", "EVS", "Maths Readiness", "Art & Craft", "Music & Movement", "Physical Education"],
  },
  {
    label: "Primary",
    grades: "Class 1 – 5",
    color: "#e0edff",
    accent: "#0d3b86",
    tagline: "Building strong foundations across all domains",
    focus: [
      "CBSE-aligned scholastic subjects with activity-based teaching",
      "Balanced scholastic and co-scholastic development",
      "Concept-based Mathematics and Science",
      "Language proficiency in English and Hindi",
      "Introduction to Computer education",
      "Creative expression through arts and sports",
    ],
    subjects: ["English", "Hindi", "Mathematics", "Environmental Science (EVS)", "General Knowledge", "Computer Science", "Art & Craft", "Physical Education"],
  },
  {
    label: "Middle School",
    grades: "Class 6 – 8",
    color: "#e0f7f0",
    accent: "#047857",
    tagline: "Deepening knowledge and nurturing curiosity",
    focus: [
      "In-depth subject study with critical thinking emphasis",
      "Science divided into Physics, Chemistry and Biology concepts",
      "Project-based and experiential learning activities",
      "Language skills: reading, writing, comprehension",
      "Introduction to Social Science: History, Geography, Civics, Economics",
      "SUPW and co-curricular integration",
    ],
    subjects: ["English", "Hindi / Sanskrit", "Mathematics", "Science", "Social Science", "Computer Applications", "Art Education", "Health & Physical Education"],
  },
  {
    label: "Secondary",
    grades: "Class 9 – 10",
    color: "#fdf2f8",
    accent: "#be185d",
    tagline: "Board-readiness with conceptual rigour",
    focus: [
      "Structured CBSE Board preparation (Class 10)",
      "Conceptual clarity through diagnostic and formative assessments",
      "Continuous and Comprehensive Evaluation (CCE) approach",
      "Subject-specific labs: Science, Computer, Language",
      "Career awareness and stream selection guidance",
      "Competitive exam exposure (Olympiads, quizzes)",
    ],
    subjects: ["English (Core)", "Hindi / Sanskrit", "Mathematics (Standard)", "Science", "Social Science", "Information Technology / Computer Applications"],
  },
  {
    label: "Senior Secondary",
    grades: "Class 11 – 12",
    color: "#f3e0ff",
    accent: "#6d28d9",
    tagline: "Stream-focused learning with career clarity",
    streams: [
      {
        name: "Science",
        subjects: ["Physics", "Chemistry", "Biology / Mathematics / Computer Science", "English Core", "Physical Education / Informatics Practices"],
      },
      {
        name: "Commerce",
        subjects: ["Accountancy", "Business Studies", "Economics", "English Core", "Mathematics / Informatics Practices"],
      },
      {
        name: "Humanities",
        subjects: ["History", "Political Science", "Geography / Psychology / Sociology", "English Core", "Economics / Legal Studies"],
      },
    ],
    focus: [
      "CBSE Class 12 Board examination preparation",
      "Experiential and project-based learning",
      "Career counselling and university entrance guidance",
      "Foreign language electives available",
      "Summer internship and industry exposure programmes",
      "Strong alumni mentorship network",
    ],
  },
];

// ── Pillars ──────────────────────────────────────────────────────
const pillars = [
  {
    title: "Scholastic Areas",
    desc: "Core subjects following CBSE guidelines — Languages, Mathematics, Science, Social Science — building foundational knowledge and analytical thinking.",
    color: "#e0edff", accent: "#0d3b86",
  },
  {
    title: "Co-Scholastic Areas",
    desc: "Work education, art education, health & physical education, and discipline — nurturing creativity, wellness and character alongside academics.",
    color: "#fff7e0", accent: "#d97706",
  },
  {
    title: "Life Skills",
    desc: "Thinking skills, social skills and emotional skills woven into daily learning — equipping students for real-world challenges beyond the classroom.",
    color: "#e0f7f0", accent: "#047857",
  },
  {
    title: "Values & Attitude",
    desc: "Encouraging positive national identity, respect for diversity, and a sense of global citizenship — building tomorrow's responsible leaders today.",
    color: "#f3e0ff", accent: "#6d28d9",
  },
];

// ── Assessment framework ─────────────────────────────────────────
const assessments = [
  { title: "Formative Assessment", desc: "Ongoing class activities, assignments, projects, oral assessment and quizzes that track progress throughout the term." },
  { title: "Summative Assessment", desc: "Term-end examinations aligned to CBSE guidelines that evaluate cumulative learning and subject mastery." },
  { title: "Portfolio & Projects", desc: "Long-term individual and group projects that demonstrate applied thinking, research skills and creativity." },
  { title: "Co-Scholastic Grading", desc: "Structured grading of extracurricular participation, discipline, health & physical education as per CBSE norms." },
];

// ── Teaching methodology ─────────────────────────────────────────
const methodology = [
  { title: "Activity-Based Learning", desc: "Hands-on experiments, manipulatives and creative tasks make abstract concepts tangible and memorable." },
  { title: "Experiential Learning", desc: "Field visits, labs, demonstrations and real-world projects bridge classroom theory with practical experience." },
  { title: "Technology Integration", desc: "Smart classrooms, projectors and digital tools enhance engagement and prepare students for a tech-driven world." },
  { title: "Collaborative Learning", desc: "Group work, debates and presentations build communication, teamwork and critical thinking skills." },
  { title: "Differentiated Instruction", desc: "Teachers adapt methods and pace to suit each learner's strengths, ensuring no child is left behind." },
  { title: "Assessment for Learning", desc: "Regular diagnostic tests inform teaching adjustments so instruction stays responsive to student needs." },
];

// ── Stage card ───────────────────────────────────────────────────
function StageCard({ s, i }: { s: typeof stages[0]; i: number }) {
  return (
    <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-white" data-testid={`stage-${i}`}>
      {/* Header */}
      <div className="px-7 py-5 flex items-center gap-4" style={{ background: s.color }}>
        <div>
          <p className="font-black text-xl" style={{ color: s.accent }}>{s.label}</p>
          <p className="text-sm font-semibold mt-0.5" style={{ color: s.accent + "bb" }}>{s.grades}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs font-semibold italic" style={{ color: s.accent + "cc" }}>{s.tagline}</p>
        </div>
      </div>

      <div className="p-7 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Focus areas */}
        <div>
          <p className="font-black text-sm mb-3" style={{ color: s.accent }}>Key Focus Areas</p>
          <ul className="space-y-2">
            {s.focus.map((f, j) => (
              <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.accent }} />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Subjects / Streams */}
        <div>
          {"streams" in s && s.streams ? (
            <>
              <p className="font-black text-sm mb-3" style={{ color: s.accent }}>Streams & Subjects</p>
              <div className="space-y-4">
                {s.streams.map((stream, si) => (
                  <div key={si}>
                    <p className="font-black text-xs mb-1.5" style={{ color: s.accent }}>{stream.name}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {stream.subjects.map((sub, sj) => (
                        <span key={sj} className="text-[11px] px-2.5 py-1 rounded-full font-semibold" style={{ background: s.color, color: s.accent }}>
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="font-black text-sm mb-3" style={{ color: s.accent }}>Subjects Offered</p>
              <div className="flex flex-wrap gap-2">
                {(s as any).subjects?.map((sub: string, j: number) => (
                  <span key={j} className="text-[11px] px-2.5 py-1 rounded-full font-semibold" style={{ background: s.color, color: s.accent }}>
                    {sub}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────
export default function Curriculum() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Curriculum"
        description="Explore Rainbow International School's comprehensive CBSE-aligned curriculum from Pre-Primary to Class 12 — covering all stages, subjects, streams and teaching methodology."
        keywords="CBSE curriculum Thane, Rainbow International School curriculum, CBSE 2024 curriculum, school syllabus Thane"
        canonical="https://rainbowinternationalschool.in/curriculum/"
        ogImage="/images/home/academic/primary-section.jpg"
      />
      <Navbar />
      <PageBanner
        title="Curriculum"
        subtitle="A balanced, future-ready CBSE curriculum from Nursery to Class 12."
        breadcrumb={[{ label: "Curriculum" }]}
        bgImage="/images/home/academic/primary-section.jpg"
      />

      <main className="flex-grow">

        {/* ── Intro ─────────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-black mb-5" style={{ color: "#0d3b86" }}>Our Curriculum Framework</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Rainbow International School follows the <strong>CBSE (Central Board of Secondary Education)</strong> curriculum — renowned for its academic rigour, balanced approach and student-centric philosophy.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Our curriculum is designed to develop the whole child — building academic excellence alongside creative, physical, social and emotional competencies. We ensure every student at RIS has the skills, knowledge and values to thrive in an evolving world.
                </p>
                <p className="text-gray-600 leading-relaxed mb-8">
                  CBSE's National Curriculum Framework emphasises critical thinking, problem-solving, and the application of knowledge — principles that are embedded in every classroom at Rainbow.
                </p>
                <a
                  href={CBSE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-bold py-3 px-7 rounded-full text-white transition-opacity hover:opacity-90"
                  style={{ background: "#0d3b86" }}
                  data-testid="link-cbse-curriculum"
                >
                  <ExternalLink size={16} />
                  View CBSE Curriculum 2024
                </a>
              </div>
              <div className="rounded-3xl overflow-hidden shadow-sm">
                <img
                  src="/images/home/academic/primary-3.jpg"
                  alt="Rainbow International School curriculum"
                  className="w-full h-72 object-cover"
                  width={800}
                  height={288}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── CBSE 2024 Highlight Banner ─────────────────────────── */}
        <section className="py-10" style={{ background: "#091a4f" }}>
          <div className="container mx-auto px-4 max-w-5xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-white font-black text-xl mb-1">CBSE National Curriculum Framework 2024</p>
              <p className="text-white/70 text-sm">Access the official CBSE curriculum document for all classes — the same framework our school follows.</p>
            </div>
            <a
              href={CBSE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-2 font-bold py-3 px-7 rounded-full border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-gray-900 transition-colors"
              data-testid="link-cbse-curriculum-banner"
            >
              <ExternalLink size={15} />
              Visit CBSE Academic Website
            </a>
          </div>
        </section>

        {/* ── 4 Pillars ─────────────────────────────────────────── */}
        <section className="py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-black text-center mb-3" style={{ color: "#0d3b86" }}>Curriculum Pillars</h2>
            <p className="text-center text-gray-500 text-sm mb-10">The four dimensions of learning at Rainbow International School</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pillars.map((p, i) => (
                <div key={i} className="rounded-3xl p-6 bg-white border border-gray-100 shadow-sm flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: p.color }}>
                    <div className="w-4 h-4 rounded-full" style={{ background: p.accent }} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm mb-2" style={{ color: p.accent }}>{p.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stage-wise Curriculum ──────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-black text-center mb-3" style={{ color: "#0d3b86" }}>Stage-wise Curriculum</h2>
            <p className="text-center text-gray-500 text-sm mb-10">Subjects, focus areas and learning outcomes at every stage of schooling</p>
            <div className="space-y-6">
              {stages.map((s, i) => <StageCard key={i} s={s} i={i} />)}
            </div>
          </div>
        </section>

        {/* ── Assessment Framework ──────────────────────────────── */}
        <section className="py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-black text-center mb-3" style={{ color: "#0d3b86" }}>Assessment Framework</h2>
            <p className="text-center text-gray-500 text-sm mb-10">How we evaluate and support student growth at Rainbow International School</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {assessments.map((a, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-black text-base mb-2" style={{ color: "#0d3b86" }}>{a.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Teaching Methodology ──────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-black text-center mb-3" style={{ color: "#0d3b86" }}>Teaching Methodology</h2>
            <p className="text-center text-gray-500 text-sm mb-10">Innovative approaches that make learning engaging, meaningful and effective</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {methodology.map((m, i) => (
                <div key={i} className="rounded-3xl p-6 border border-gray-100 shadow-sm bg-white flex gap-4">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#e0edff" }}>
                    <div className="w-3 h-3 rounded-full" style={{ background: "#0d3b86" }} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm mb-1" style={{ color: "#0d3b86" }}>{m.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CBSE Link Section ─────────────────────────────────── */}
        <section className="py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-grow">
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#0d3b86" }}>Official Reference</p>
                <h3 className="text-2xl font-black mb-3" style={{ color: "#0d3b86" }}>CBSE Curriculum 2024</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-2">
                  Rainbow International School strictly follows the CBSE National Curriculum Framework. For the complete and most up-to-date syllabus, subject codes, and curriculum guidelines, please refer to the official CBSE Academic website.
                </p>
                <p className="text-xs text-gray-400 break-all">{CBSE_URL}</p>
              </div>
              <a
                href={CBSE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 inline-flex items-center gap-2 text-white font-bold py-4 px-8 rounded-full transition-opacity hover:opacity-90"
                style={{ background: "#0d3b86" }}
                data-testid="link-cbse-full"
              >
                <ExternalLink size={16} />
                Open CBSE Curriculum
              </a>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <div className="py-14 text-center" style={{ background: "#091a4f" }}>
          <p className="text-white font-bold text-lg mb-4">Admissions are Open for the Academic Year 2026–27</p>
          <a href="#contact" className="inline-block text-white font-bold py-3 px-8 rounded-full border-2 border-amber-400 hover:bg-amber-400 hover:text-gray-900 transition-colors">
            Enquire Now
          </a>
        </div>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
