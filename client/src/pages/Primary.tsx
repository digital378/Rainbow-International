import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { BookOpen, Calculator, FlaskConical, Palette, Users } from "lucide-react";

// ── Sidebar curriculum ────────────────────────────────────────────
const curriculum = [
  { icon: BookOpen,  subject: "Language Skills",     detail: "English, Hindi, Marathi",                              color: "#e0edff", accent: "#0d3b86" },
  { icon: Calculator, subject: "Math Skills",          detail: "Computational Skills & Number Problems",               color: "#fff7e0", accent: "#d97706" },
  { icon: FlaskConical, subject: "Scientific Skills",    detail: "Scientific Temper for Science & Social Sciences",     color: "#e0f7f0", accent: "#059669" },
  { icon: Palette,    subject: "Creative Skills",      detail: "Music, Art & Craft Add Joy to Learning",               color: "#fdf2f8", accent: "#be185d" },
  { icon: Users,      subject: "Interpersonal Skills", detail: "Clubs & Activities Bring Students Together",           color: "#f3e0ff", accent: "#7c3aed" },
];

// ── Subjects ──────────────────────────────────────────────────────
const scholastic = ["English", "Math", "Marathi", "E.V.S", "Hindi", "Computer", "General Knowledge"];
const coScholastic = ["Physical Education", "Sports (Indoor & Outdoor Games)", "Value Education", "Dance & Music", "Personality Development", "Art & Craft"];

// ── Curriculum Philosophy ─────────────────────────────────────────
const philosophy = [
  {
    title: "Communication",
    desc: "Language development with narration, recitation & asking of questions",
    color: "#e0edff", textColor: "#0d3b86",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 10 Q6 6 10 6 H30 Q34 6 34 10 V22 Q34 26 30 26 H22 L14 34 V26 H10 Q6 26 6 22Z" stroke="#0d3b86" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    title: "Awe & Wonder",
    desc: "Exploration of answers through investigation of links with practical experience",
    color: "#fff3e0", textColor: "#b45309",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="16" r="8" stroke="#b45309" strokeWidth="2"/>
        <line x1="20" y1="24" x2="20" y2="30" stroke="#b45309" strokeWidth="2"/>
        <line x1="15" y1="30" x2="25" y2="30" stroke="#b45309" strokeWidth="2"/>
        <line x1="20" y1="4" x2="20" y2="1" stroke="#b45309" strokeWidth="2"/>
        <line x1="30" y1="8" x2="33" y2="5" stroke="#b45309" strokeWidth="2"/>
        <line x1="10" y1="8" x2="7" y2="5" stroke="#b45309" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    title: "Confidence",
    desc: "Development of confidence, self-esteem & self-discipline for Middle School",
    color: "#e0f7f0", textColor: "#047857",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="12" r="6" stroke="#047857" strokeWidth="2"/>
        <path d="M8 34 C8 26 32 26 32 34" stroke="#047857" strokeWidth="2"/>
        <line x1="20" y1="18" x2="20" y2="26" stroke="#047857" strokeWidth="2"/>
        <line x1="14" y1="22" x2="26" y2="22" stroke="#047857" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    title: "Psychomotor Skills",
    desc: "Attention to physical fitness and development through yoga, karate & skating",
    color: "#f3e0ff", textColor: "#6d28d9",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="8" r="4" stroke="#6d28d9" strokeWidth="2"/>
        <line x1="20" y1="12" x2="20" y2="26" stroke="#6d28d9" strokeWidth="2"/>
        <line x1="12" y1="18" x2="28" y2="18" stroke="#6d28d9" strokeWidth="2"/>
        <line x1="20" y1="26" x2="14" y2="36" stroke="#6d28d9" strokeWidth="2"/>
        <line x1="20" y1="26" x2="26" y2="36" stroke="#6d28d9" strokeWidth="2"/>
      </svg>
    ),
  },
];

// ── Teaching Methodology ──────────────────────────────────────────
const methodology = [
  {
    title: "Hands-on Activities",
    desc: "Annual exhibitions for many subjects & always active clubs help students apply what they learn",
    img: "/images/gallery/educational/maths-science-lab.jpg",
  },
  {
    title: "Tours & Visits",
    desc: "Exciting recreational, educational & cultural excursions get students to \"think outside the classroom\"",
    img: "/images/gallery/support/school-bus.jpg",
  },
  {
    title: "Project Work",
    desc: "Individual & group projects get students to learn from their families & peers and improve application skills",
    img: "/images/home/academic/primary-2.jpg",
  },
  {
    title: "Digital Tools",
    desc: "E-learning amenities make abstract concepts concrete & assist in greater retention of data & processes",
    img: "/images/gallery/educational/e-learning-classrooms.jpg",
  },
];

// ── Strategy info cards ───────────────────────────────────────────
const strategies = [
  {
    title: "Teaching-Learning Strategies",
    body: "To develop core competencies, a variety of creative and innovative classroom strategies are implemented — pair work, group work, project work and extensive hands-on activities. Digital tools are also used to facilitate learning and creativity.",
    color: "#e0edff", accent: "#0d3b86",
  },
  {
    title: "Language Development",
    body: "Through the Literary Club, students get a choice to learn a foreign language — French. We encourage verbalising extensively, enhancing vocabulary, narrating stories, reciting poems, and more.",
    color: "#e0f7f0", accent: "#047857",
  },
  {
    title: "Numeracy Development",
    body: "Mathematic skills play a vital role in the everyday lives of students. They are taught to develop confidence with numbers and measures through real-world problem-solving.",
    color: "#fff7e0", accent: "#d97706",
  },
];

export default function Primary() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Primary Section (Class 1–5)"
        description="Rainbow International School's Primary Section (Class 1 to 5) in Thane West. Language, Math, Science, Creative & Interpersonal skills via CBSE curriculum. Admissions open."
        keywords="primary school Thane West, Class 1 to 5 CBSE school Thane, primary section Rainbow School"
        canonical="https://rainbowinternationalschool.in/primary-section/"
        ogImage="/images/home/academic/primary-section.jpg"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "Academics", href: "https://rainbowinternationalschool.in/primary-section" },
          { name: "Primary (Class 1-5)", href: "https://rainbowinternationalschool.in/primary-section" },
        ]}
      />
      <Navbar />
      <PageBanner
        title="Primary Section"
        subtitle="Class 1 to Class 5"
        breadcrumb={[{ label: "Primary Section" }]}
        bgImage="/images/home/academic/primary-section.jpg"
      />

      <main className="flex-grow">

        {/* ── Intro + Curriculum sidebar ─────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

              {/* Left — content */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-3" style={{ background: "#eef5ff", color: "#0d3b86" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    Foundation Years
                  </span>
                  <h2 className="text-3xl font-black" style={{ color: "#0d3b86", fontFamily: "'DM Sans', sans-serif" }}>Primary Section</h2>
                  <p className="text-base text-gray-500 font-semibold mt-1">(Class-1 to Class-5)</p>
                </div>

                {/* Subjects grid */}
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Scholastic */}
                  <div className="rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-3" style={{ background: "#0d3b86" }}>
                      <h3 className="text-white font-black text-sm uppercase tracking-wide">Scholastic Subjects</h3>
                    </div>
                    <ul className="px-5 py-4 space-y-2.5">
                      {scholastic.map((s, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-gray-700 text-sm">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#0d3b86" }} />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Co-Scholastic */}
                  <div className="rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-3" style={{ background: "#d97706" }}>
                      <h3 className="text-white font-black text-sm uppercase tracking-wide">Co-Scholastic Subjects</h3>
                    </div>
                    <ul className="px-5 py-4 space-y-2.5">
                      {coScholastic.map((s, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-gray-700 text-sm">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#d97706" }} />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Photo */}
                <div className="grid grid-cols-2 gap-4">
                  <img
                    src="/images/students/primary-section.jpg"
                    alt="Primary section student raising hand in classroom"
                    className="rounded-3xl w-full object-cover h-48"
                    width={512}
                    height={384}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <img
                    src="/images/students/primary-classroom-hand.jpg"
                    alt="Primary students in classroom at Rainbow International School"
                    className="rounded-3xl w-full object-cover h-48"
                    width={512}
                    height={384}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <img
                  src="/images/students/primary-group-work.jpg"
                  alt="Primary students working together in classroom"
                  className="rounded-3xl w-full object-cover max-h-64"
                  width={1024}
                  height={546}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>

              {/* Right — admission CTA + curriculum */}
              <div className="space-y-6">
                <div className="rounded-3xl border-2 border-amber-400 p-6 text-center" style={{ background: "#fffbeb" }}>
                  <p className="text-sm font-black uppercase tracking-wide mb-3" style={{ color: "#b45309" }}>
                    Admissions are Open for the Academic Year 2026–27
                  </p>
                  <a href="#contact" className="inline-block font-bold py-2.5 px-7 rounded-full text-white transition-opacity hover:opacity-90" style={{ background: "#f97316" }}>
                    Enquire Now
                  </a>
                </div>

                <div className="rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4" style={{ background: "#0d3b86" }}>
                    <h3 className="text-white font-black text-lg">Curriculum</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {curriculum.map((c, i) => {
                      const Icon = c.icon;
                      return (
                        <div key={i} className="flex items-start gap-3 px-5 py-4 bg-white">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: c.color }}>
                            <Icon size={18} style={{ color: c.accent }} />
                          </div>
                          <div>
                            <p className="font-black text-sm" style={{ color: c.accent }}>{c.subject}</p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{c.detail}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Strategy info cards ────────────────────────────────── */}
        <section className="py-16" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-black text-center mb-10" style={{ color: "#0d3b86", fontFamily: "'DM Sans', sans-serif" }}>Our Approach</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {strategies.map((s, i) => (
                <div key={i} className="rounded-3xl p-6 border border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-2xl mb-4 flex items-center justify-center" style={{ background: s.color }}>
                    <span className="w-4 h-4 rounded-full" style={{ background: s.accent }} />
                  </div>
                  <h3 className="font-black text-base mb-2" style={{ color: s.accent }}>{s.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>

            {/* Evaluation at primary level */}
            <div className="mt-8 rounded-3xl border border-gray-100 shadow-sm bg-white p-7">
              <h3 className="font-black text-lg mb-3" style={{ color: "#0d3b86" }}>Evaluation at the Primary Level</h3>
              <ul className="space-y-2.5">
                {[
                  "A system of Continuous Comprehensive Evaluation (CCE) is followed.",
                  "Students are graded regularly based on the child's participation in various co-curricular activities.",
                  "Assessment of competencies in languages, sciences and mathematics is undertaken regularly.",
                ].map((pt, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#0d3b86" }} />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Curriculum Philosophy ──────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-black text-center mb-12" style={{ color: "#0d3b86", fontFamily: "'DM Sans', sans-serif" }}>Curriculum Philosophy</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {philosophy.map((p, i) => (
                <div key={i} className="rounded-3xl p-6 border border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow flex flex-col gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: p.color }}>
                    {p.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-base mb-2" style={{ color: p.textColor }}>{p.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Teaching Methodology ───────────────────────────────── */}
        <section className="py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-black text-center mb-12" style={{ color: "#0d3b86", fontFamily: "'DM Sans', sans-serif" }}>Teaching Methodology</h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {methodology.map((m, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-gray-100">
                    <img
                      src={m.img}
                      alt={m.title}
                      className="w-full h-full object-cover"
                      width={400}
                      height={300}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-black text-sm" style={{ color: "#0d3b86" }}>{m.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Evaluation Strategy */}
            <div className="max-w-lg mx-auto rounded-3xl border-2 border-amber-300 p-8 text-center" style={{ background: "#fffbeb" }}>
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#fef3c7" }}>
                <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="6" width="32" height="24" rx="3" stroke="#d97706" strokeWidth="2"/>
                  <line x1="4" y1="14" x2="36" y2="14" stroke="#d97706" strokeWidth="2"/>
                  <circle cx="12" cy="32" r="3" stroke="#d97706" strokeWidth="2"/>
                  <circle cx="20" cy="32" r="3" stroke="#d97706" strokeWidth="2"/>
                  <circle cx="28" cy="32" r="3" stroke="#d97706" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="font-black text-xl mb-1" style={{ color: "#92400e" }}>Evaluation Strategy</h3>
              <p className="text-sm font-bold mb-3" style={{ color: "#b45309" }}>Continuous Comprehensive Evaluation (CCE)</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Class participation, homework, project work, worksheets, individual & group behaviour — all form part of the continuous assessment framework.
              </p>
            </div>
          </div>
        </section>

        {/* ── CTA strip ──────────────────────────────────────────── */}
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
