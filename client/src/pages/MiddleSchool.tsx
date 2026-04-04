import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { BookOpen, FlaskConical, Globe, Trophy } from "lucide-react";

// ── Sidebar curriculum ────────────────────────────────────────────
const curriculum = [
  { icon: BookOpen,   subject: "Language Skills",      detail: "English, Hindi, Option to Choose Between Marathi/French",      color: "#e0edff", accent: "#0d3b86" },
  { icon: FlaskConical, subject: "Math & Science",     detail: "Rigorous focus on learning the natural & physical sciences",    color: "#e0f7f0", accent: "#059669" },
  { icon: Globe,      subject: "Social Science",       detail: "Awareness of our surroundings, our past & our present",         color: "#fff7e0", accent: "#d97706" },
  { icon: Trophy,     subject: "Co-scholastic Subjects", detail: "Sports, Value Education, Music, Art & Craft, GK",            color: "#f3e0ff", accent: "#7c3aed" },
];

// ── Subjects ──────────────────────────────────────────────────────
const scholastic = ["English", "Hindi", "Maths", "Science", "Social Science", "Marathi / French", "Computer (ICT)"];
const coScholastic = ["Sports (Indoor & Outdoor Games)", "Physical Education", "Value Education", "Dance & Music", "Yoga", "Personality Development", "Art & Craft"];

// ── Curriculum Philosophy ─────────────────────────────────────────
const philosophy = [
  {
    title: "Creativity",
    desc: "Development of creative ideas & ways of thinking",
    color: "#e0edff", textColor: "#0d3b86",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="8" stroke="#0d3b86" strokeWidth="2"/>
        <line x1="20" y1="4" x2="20" y2="8" stroke="#0d3b86" strokeWidth="2"/>
        <line x1="20" y1="32" x2="20" y2="36" stroke="#0d3b86" strokeWidth="2"/>
        <line x1="4" y1="20" x2="8" y2="20" stroke="#0d3b86" strokeWidth="2"/>
        <line x1="32" y1="20" x2="36" y2="20" stroke="#0d3b86" strokeWidth="2"/>
        <line x1="8.69" y1="8.69" x2="11.52" y2="11.52" stroke="#0d3b86" strokeWidth="2"/>
        <line x1="28.48" y1="28.48" x2="31.31" y2="31.31" stroke="#0d3b86" strokeWidth="2"/>
        <line x1="8.69" y1="31.31" x2="11.52" y2="28.48" stroke="#0d3b86" strokeWidth="2"/>
        <line x1="28.48" y1="11.52" x2="31.31" y2="8.69" stroke="#0d3b86" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    title: "Excellence",
    desc: "Multidimensional curriculum to excel in all aspects of school life",
    color: "#fff3e0", textColor: "#b45309",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="14" r="8" stroke="#b45309" strokeWidth="2"/>
        <path d="M12 22 L8 36 L20 28 L32 36 L28 22" stroke="#b45309" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    title: "Curiosity",
    desc: "Intellectual stimulation for developing talent & maturity of the mind",
    color: "#e0f7f0", textColor: "#047857",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="16" r="8" stroke="#047857" strokeWidth="2"/>
        <line x1="20" y1="24" x2="20" y2="30" stroke="#047857" strokeWidth="2"/>
        <circle cx="20" cy="34" r="2" fill="#047857"/>
        <path d="M16 13 Q20 8 24 13 Q22 16 20 18 Q18 16 16 13Z" stroke="#047857" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    title: "Personality",
    desc: "Character building through opportunities for leadership",
    color: "#f3e0ff", textColor: "#6d28d9",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="11" r="5" stroke="#6d28d9" strokeWidth="2"/>
        <path d="M10 34 C10 26 30 26 30 34" stroke="#6d28d9" strokeWidth="2"/>
        <path d="M20 16 L16 26 L20 24 L24 26 Z" stroke="#6d28d9" strokeWidth="1.5"/>
      </svg>
    ),
  },
];

// ── Teaching Methodology ──────────────────────────────────────────
const methodology = [
  {
    title: "Hands-on Activities",
    desc: "Annual exhibitions for many subjects & always active clubs help students apply what they learn",
    img: "/images/gallery/talent/art-craft-room.jpg",
  },
  {
    title: "Tours & Visits",
    desc: "Exciting recreational, educational & cultural excursions get students to \"think outside the classroom\"",
    img: "/images/gallery/talent/amphitheatre.jpg",
  },
  {
    title: "Project Work",
    desc: "Individual & group projects get students to learn from their families & peers & get better at application",
    img: "/images/gallery/educational/reading-room.jpg",
  },
  {
    title: "Digital Tools",
    desc: "E-learning amenities make abstract concepts concrete & assist in greater retention of data & processes",
    img: "/images/gallery/educational/storage-facility.jpg",
  },
];

// ── Info cards ────────────────────────────────────────────────────
const infocards = [
  {
    title: "CBSE Curriculum",
    body: "The curriculum is laid down according to the Secondary School curriculum designed by CBSE. Variety of instructional strategies to assess the strengths, needs and interests of students are adopted.",
    color: "#e0edff", accent: "#0d3b86",
  },
  {
    title: "Teaching-Learning Strategies",
    body: "Technology is extensively used in day-to-day teaching in classrooms. Creative, collaborative and project-based learning are woven into every subject.",
    color: "#e0f7f0", accent: "#047857",
  },
  {
    title: "Evaluation Pattern",
    body: "Two terms with two Summative Assessments — one in September and the other in March (Term I SA1 + Term II SA2). Four Formatives spread over two in each term [Term I (FA1 + FA2) and Term II (FA3 + FA4)].",
    color: "#fff7e0", accent: "#d97706",
  },
];

export default function MiddleSchool() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Middle School (Class 6–10)"
        description="Rainbow International School's Middle School Section (Class 6 to 10). Multi-dimensional curriculum to develop creativity, intellectual curiosity and maturity. CBSE affiliated."
        keywords="middle school Thane West, Class 6 to 10 CBSE Thane, Rainbow International School middle section"
        canonical="https://rainbowinternationalschool.in/middle-school-section/"
        ogImage="/images/home/academic/middle-section.jpg"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "Academics", href: "https://rainbowinternationalschool.in/middle-school-section" },
          { name: "Middle School (Class 6-10)", href: "https://rainbowinternationalschool.in/middle-school-section" },
        ]}
      />
      <Navbar />
      <PageBanner
        title="Middle Section"
        subtitle="Class 6 to Class 10"
        breadcrumb={[{ label: "Middle Section" }]}
        bgImage="/images/home/academic/middle-section.jpg"
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
                    Academic Growth
                  </span>
                  <h2 className="text-3xl font-black" style={{ color: "#0d3b86", fontFamily: "'DM Sans', sans-serif" }}>Middle Section</h2>
                  <p className="text-base text-gray-500 font-semibold mt-1">(Class-6 to Class-10)</p>
                </div>

                {/* Subject cards */}
                <div className="grid sm:grid-cols-2 gap-6">
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
                <img
                  src="/images/students/middle-section.jpg"
                  alt="Middle school students in classroom at Rainbow International School"
                  className="rounded-3xl w-full object-cover max-h-64"
                  width={1024}
                  height={559}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>

              {/* Right — admission CTA + curriculum card */}
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

        {/* ── CBSE / Strategy / Evaluation cards ────────────────── */}
        <section className="py-16" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-black text-center mb-10" style={{ color: "#0d3b86", fontFamily: "'DM Sans', sans-serif" }}>Our Approach</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {infocards.map((c, i) => (
                <div key={i} className="rounded-3xl p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-2xl mb-4 flex items-center justify-center" style={{ background: c.color }}>
                    <span className="w-4 h-4 rounded-full" style={{ background: c.accent }} />
                  </div>
                  <h3 className="font-black text-base mb-2" style={{ color: c.accent }}>{c.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{c.body}</p>
                </div>
              ))}
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
                  <rect x="6" y="4" width="28" height="34" rx="3" stroke="#d97706" strokeWidth="2"/>
                  <line x1="12" y1="13" x2="28" y2="13" stroke="#d97706" strokeWidth="2"/>
                  <line x1="12" y1="19" x2="28" y2="19" stroke="#d97706" strokeWidth="2"/>
                  <line x1="12" y1="25" x2="20" y2="25" stroke="#d97706" strokeWidth="2"/>
                  <path d="M24 28 L26 31 L31 24" stroke="#d97706" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="font-black text-xl mb-1" style={{ color: "#92400e" }}>Evaluation Strategy</h3>
              <p className="text-sm font-bold mb-3" style={{ color: "#b45309" }}>Formal Examination</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Summative Assessment Tests: one at the end of each semester
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Formative Assessment Tests: two tests per semester to assess on-going learning
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
