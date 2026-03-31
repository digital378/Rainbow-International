import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";

const pillars = [
  {
    title: "Scholastic Areas",
    desc: "Core subjects following CBSE guidelines — Languages, Mathematics, Science, Social Science — designed to build foundational knowledge and analytical thinking.",
    color: "#e0edff", accent: "#0d3b86",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="4" width="28" height="32" rx="2" stroke="#0d3b86" strokeWidth="2"/>
        <line x1="12" y1="14" x2="28" y2="14" stroke="#0d3b86" strokeWidth="2"/>
        <line x1="12" y1="20" x2="28" y2="20" stroke="#0d3b86" strokeWidth="2"/>
        <line x1="12" y1="26" x2="22" y2="26" stroke="#0d3b86" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    title: "Co-Scholastic Areas",
    desc: "Work education, art education, health & physical education, and discipline — nurturing creativity, wellness and character alongside academics.",
    color: "#fff7e0", accent: "#d97706",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="14" r="7" stroke="#d97706" strokeWidth="2"/>
        <path d="M8 34 C8 26 32 26 32 34" stroke="#d97706" strokeWidth="2"/>
        <line x1="14" y1="14" x2="26" y2="14" stroke="#d97706" strokeWidth="2"/>
        <line x1="20" y1="8" x2="20" y2="20" stroke="#d97706" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    title: "Life Skills",
    desc: "Thinking skills, social skills and emotional skills woven into daily learning — equipping students for real-world challenges beyond the classroom.",
    color: "#e0f7f0", accent: "#047857",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6 L24 16 L35 16 L26 23 L29 33 L20 27 L11 33 L14 23 L5 16 L16 16 Z" stroke="#047857" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Values & Attitude",
    desc: "Encouraging positive national identity, respect for diversity, and a sense of global citizenship — building tomorrow's responsible leaders today.",
    color: "#f3e0ff", accent: "#6d28d9",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 8 C14 8 8 13 8 19 C8 26 20 34 20 34 C20 34 32 26 32 19 C32 13 26 8 20 8Z" stroke="#6d28d9" strokeWidth="2"/>
        <path d="M14 19 L18 23 L26 15" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const stages = [
  {
    label: "Pre-Primary",
    grades: "Nursery – KG",
    focus: "Play-based learning, sensory activities, early literacy and numeracy, social skills development through storytelling and activities.",
    color: "#fef3c7", accent: "#b45309",
  },
  {
    label: "Primary",
    grades: "Class 1 – 5",
    focus: "Core CBSE subjects with activity-based teaching, scholastic and co-scholastic development, introduction to English, Hindi, Maths, EVS and Arts.",
    color: "#e0edff", accent: "#0d3b86",
  },
  {
    label: "Middle School",
    grades: "Class 6 – 8",
    focus: "Deepened subject study, critical thinking, project work, language skills, science experiments, and extracurricular exploration.",
    color: "#e0f7f0", accent: "#047857",
  },
  {
    label: "Secondary",
    grades: "Class 9 – 10",
    focus: "Board-focused learning, conceptual clarity in core subjects, preparation for CBSE Class 10 Board Examination.",
    color: "#fdf2f8", accent: "#be185d",
  },
  {
    label: "Senior Secondary",
    grades: "Class 11 – 12",
    focus: "Stream-based learning: Science, Commerce, Humanities. Career counselling, experiential learning programmes, and CBSE Board preparation.",
    color: "#f3e0ff", accent: "#6d28d9",
  },
];

export default function Curriculum() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Curriculum - Rainbow International School Thane"
        description="Explore Rainbow International School's CBSE-aligned curriculum across Pre-Primary to Senior Secondary. Scholastic, co-scholastic, life skills, and values education."
        keywords="CBSE curriculum Thane school, Rainbow International School curriculum, school syllabus Thane"
        canonical="https://rainbowinternationalschool.in/curriculum/"
        ogImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/primary-section-768x513.png"
      />
      <Navbar />
      <PageBanner
        title="Curriculum"
        subtitle="A balanced, future-ready CBSE curriculum from Nursery to Class 12."
        breadcrumb={[{ label: "Curriculum" }]}
        bgImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/primary-section-768x513.png"
      />

      <main className="flex-grow">

        {/* ── Intro ─────────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl font-black mb-4" style={{ color: "#0d3b86" }}>Our Curriculum Framework</h2>
            <p className="text-gray-600 leading-relaxed text-lg mb-3">
              Rainbow International School follows the <strong>CBSE (Central Board of Secondary Education)</strong> curriculum, renowned for its rigour, balance, and student-centric approach.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our curriculum is designed to develop the whole child — building academic excellence alongside creative, physical, social, and emotional competencies. We ensure every student at RIS has the skills, knowledge, and values to thrive in an evolving world.
            </p>
          </div>
        </section>

        {/* ── 4 Pillars ─────────────────────────────────────────── */}
        <section className="py-16" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-black text-center mb-10" style={{ color: "#0d3b86" }}>Curriculum Pillars</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pillars.map((p, i) => (
                <div key={i} className="rounded-3xl p-6 bg-white border border-gray-100 shadow-sm flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: p.color }}>
                    {p.icon}
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

        {/* ── Stage-wise ─────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-black text-center mb-10" style={{ color: "#0d3b86" }}>Stage-wise Curriculum</h2>
            <div className="space-y-4">
              {stages.map((s, i) => (
                <div key={i} className="rounded-3xl p-6 border border-gray-100 shadow-sm flex gap-5 items-start" style={{ background: s.color + "55" }}>
                  <div className="min-w-[110px]">
                    <p className="font-black text-base" style={{ color: s.accent }}>{s.label}</p>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: s.accent }}>{s.grades}</p>
                  </div>
                  <div className="w-px self-stretch" style={{ background: s.accent + "44" }} />
                  <p className="text-sm text-gray-600 leading-relaxed flex-1">{s.focus}</p>
                </div>
              ))}
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
