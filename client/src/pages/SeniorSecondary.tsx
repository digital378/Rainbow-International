import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";

// ── 3 Streams ─────────────────────────────────────────────────────
const streams = [
  {
    stream: "Commerce",
    color: "#fff7e0", accent: "#d97706", border: "#fde68a",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="24" width="48" height="38" rx="4" stroke="#d97706" strokeWidth="2.5"/>
        <line x1="8" y1="34" x2="56" y2="34" stroke="#d97706" strokeWidth="2.5"/>
        <circle cx="60" cy="52" r="16" fill="#fffbeb" stroke="#d97706" strokeWidth="2.5"/>
        <line x1="60" y1="44" x2="60" y2="60" stroke="#d97706" strokeWidth="2"/>
        <line x1="52" y1="52" x2="68" y2="52" stroke="#d97706" strokeWidth="2"/>
        <path d="M16 42 L20 38 L24 44 L28 40 L32 46" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    subjects: ["Hindi (Core)", "Mathematics", "Economics", "Business Studies", "Accountancy", "Computer Science"],
  },
  {
    stream: "Science",
    color: "#e0edff", accent: "#0d3b86", border: "#bfdbfe",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16" xmlns="http://www.w3.org/2000/svg">
        <path d="M28 12 L28 38 L12 62 Q10 66 14 68 H66 Q70 66 68 62 L52 38 L52 12" stroke="#0d3b86" strokeWidth="2.5" strokeLinejoin="round"/>
        <line x1="22" y1="12" x2="58" y2="12" stroke="#0d3b86" strokeWidth="2.5"/>
        <circle cx="36" cy="52" r="5" fill="#dbeafe" stroke="#0d3b86" strokeWidth="2"/>
        <circle cx="50" cy="58" r="3" fill="#dbeafe" stroke="#0d3b86" strokeWidth="2"/>
      </svg>
    ),
    subjects: ["Hindi (Core)", "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science"],
  },
  {
    stream: "Humanities",
    color: "#fdf2f8", accent: "#be185d", border: "#fbcfe8",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16" xmlns="http://www.w3.org/2000/svg">
        <path d="M40 20 C20 20 12 32 12 44 C12 58 26 68 40 68 C54 68 68 58 68 44 C68 32 60 20 40 20Z" stroke="#be185d" strokeWidth="2.5"/>
        <path d="M28 36 C28 30 36 26 40 30 C44 26 52 30 52 36 C52 44 40 52 40 52 C40 52 28 44 28 36Z" fill="#fce7f3" stroke="#be185d" strokeWidth="2"/>
      </svg>
    ),
    subjects: ["Hindi (Core)", "Psychology", "Economics", "History", "Political Science", "Computer Science", "Fine Arts"],
  },
];

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
    desc: "Intellectual stimulation for developing talent & maturity of mind",
    color: "#e0f7f0", textColor: "#047857",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="16" r="8" stroke="#047857" strokeWidth="2"/>
        <line x1="20" y1="24" x2="20" y2="30" stroke="#047857" strokeWidth="2"/>
        <circle cx="20" cy="34" r="2" fill="#047857"/>
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
        <line x1="20" y1="16" x2="20" y2="26" stroke="#6d28d9" strokeWidth="2"/>
        <line x1="14" y1="21" x2="26" y2="21" stroke="#6d28d9" strokeWidth="2"/>
      </svg>
    ),
  },
];

// ── Teaching Methodology (Senior Secondary specific) ──────────────
const methodology = [
  {
    title: "Experiential Learning Programmes",
    desc: "Unique International Experiential Learning Certificate Programs, integrated throughout year-round coursework & offered exclusively to our Grade 11 students.",
    img: "/images/students/senior-secondary-group.jpg",
    color: "#e0edff", accent: "#0d3b86",
  },
  {
    title: "Career Counselling",
    desc: "A Career Guidance Programme powered by Proventus, an Overseas Education Company. Customised workshops for aspirants with individual focus when making life-altering decisions.",
    img: "/images/students/senior-secondary-girls.jpg",
    color: "#fff7e0", accent: "#d97706",
  },
  {
    title: "Foreign Language Classes",
    desc: "Our Foreign Language Skill Development Programme presents one of the most relevant languages of the current era — French — adding to students' global readiness.",
    img: "/images/home/academic/senior-secondary.jpg",
    color: "#e0f7f0", accent: "#047857",
  },
  {
    title: "Summer Internship Programme",
    desc: "Industry expert workshops, lectures, and internship opportunities carefully structured by experienced mentors for students during their Senior Secondary years.",
    img: "/images/students/hero-senior-secondary.jpg",
    color: "#fdf2f8", accent: "#be185d",
  },
];

export default function SeniorSecondary() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Senior Secondary (Class 11–12)"
        description="Rainbow International School's Senior Secondary Section (Class 11 & 12). Science, Humanities, and Commerce streams. CBSE affiliation number 1130661."
        keywords="senior secondary school Thane, Class 11 12 CBSE Thane West, science commerce humanities Thane school"
        canonical="https://rainbowinternationalschool.in/senior-secondary-section/"
        ogImage="/images/home/academic/senior-secondary.jpg"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "Academics", href: "https://rainbowinternationalschool.in/senior-secondary-section" },
          { name: "Senior Secondary (Class 11-12)", href: "https://rainbowinternationalschool.in/senior-secondary-section" },
        ]}
      />
      <Navbar />
      <PageBanner
        title="Senior Secondary Section"
        subtitle="Class 11 & 12"
        breadcrumb={[{ label: "Senior Secondary Section" }]}
        bgImage="/images/home/academic/senior-secondary.jpg"
      />

      <main className="flex-grow">

        {/* ── Intro ──────────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

              {/* Left — intro text */}
              <div className="lg:col-span-2 space-y-5">
                <div>
                  <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-3" style={{ background: "#eef5ff", color: "#0d3b86" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    Career Pathways
                  </span>
                  <h2 className="text-3xl font-black" style={{ color: "#0d3b86", fontFamily: "'DM Sans', sans-serif" }}>Senior Secondary Section</h2>
                  <p className="text-base text-gray-500 font-semibold mt-1">(Class 11 – 12)</p>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Through a rigorous accreditation process, RIS has been affiliated to the CBSE Board for <strong>Science, Commerce and Humanities</strong> streams.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Details of our affiliation can be found through our affiliation number: <strong>1130661</strong>. We offer a slew of subject options for our students to choose from, to ensure their education is customised around what their exact career plans are, and to provide the flexibility to explore alternatives that are rarely offered elsewhere.
                </p>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <img
                    src="/images/students/senior-secondary-girls.jpg"
                    alt="Senior Secondary girls studying together at Rainbow International School"
                    className="rounded-3xl w-full object-cover h-48"
                    width={512}
                    height={384}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <img
                    src="/images/students/senior-secondary-group.jpg"
                    alt="Senior Secondary students in blazers at Rainbow International School"
                    className="rounded-3xl w-full object-cover h-48"
                    width={512}
                    height={384}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>

                {/* Curriculum box — 3 streams */}
                <div className="rounded-3xl border-2 border-amber-300 overflow-hidden mt-6">
                  <div className="px-6 py-4" style={{ background: "#fffbeb" }}>
                    <h3 className="font-black text-lg" style={{ color: "#92400e" }}>Curriculum</h3>
                  </div>
                  <div className="divide-y divide-amber-100">
                    {streams.map((s, i) => (
                      <div key={i} className="flex items-start gap-5 px-6 py-6 bg-white">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: s.color }}>
                          {s.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-lg mb-0.5" style={{ color: s.accent }}>{s.stream}</h4>
                          <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: s.accent }}>
                            Mandatory English (Core)
                          </p>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                            Any Four Subjects Mentioned Below:
                          </p>
                          <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                            {s.subjects.map((sub, j) => (
                              <li key={j} className="flex items-center gap-1.5 text-sm text-gray-600">
                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.accent }} />
                                {sub}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right — admission CTA */}
              <div className="space-y-6">
                <div className="rounded-3xl border-2 border-amber-400 p-6 text-center" style={{ background: "#fffbeb" }}>
                  <p className="text-sm font-black uppercase tracking-wide mb-3" style={{ color: "#b45309" }}>
                    Admissions are Open for the Academic Year 2026–27
                  </p>
                  <a href="#contact" className="inline-block font-bold py-2.5 px-7 rounded-full text-white transition-opacity hover:opacity-90" style={{ background: "#f97316" }}>
                    Enquire Now
                  </a>
                </div>

                {/* Stream highlights */}
                <div className="rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4" style={{ background: "#0d3b86" }}>
                    <h3 className="text-white font-black">Streams Offered</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {streams.map((s, i) => (
                      <div key={i} className="flex items-center gap-3 px-5 py-3.5 bg-white">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: s.color }}>
                          <span className="w-3 h-3 rounded-full" style={{ background: s.accent }} />
                        </div>
                        <div>
                          <p className="font-black text-sm" style={{ color: s.accent }}>{s.stream}</p>
                          <p className="text-xs text-gray-400">Class 11 & 12</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Curriculum Philosophy ──────────────────────────────── */}
        <section className="py-20" style={{ background: "#f8faff" }}>
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
        <section className="py-20 bg-white">
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
                    <h3 className="font-black text-sm leading-snug" style={{ color: "#0d3b86" }}>{m.title}</h3>
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
              <p className="text-sm text-gray-600">2 Summative Assessment Tests: one at the end of each semester</p>
              <p className="text-sm text-gray-600 mt-1">4 Formative Assessment Tests: two tests per semester to assess on-going learning</p>
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
