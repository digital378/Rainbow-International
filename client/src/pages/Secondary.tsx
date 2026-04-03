import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { BookOpen, FlaskConical, Globe, Trophy } from "lucide-react";

// ── Sidebar curriculum ────────────────────────────────────────────
const curriculum = [
  { icon: BookOpen,     subject: "Language Skills",      detail: "Two Languages at Secondary Level: English, Hindi",             color: "#e0edff", accent: "#0d3b86" },
  { icon: FlaskConical, subject: "Math & Science",       detail: "Rigorous focus on learning the natural & physical sciences",   color: "#e0f7f0", accent: "#059669" },
  { icon: Globe,        subject: "Social Science",       detail: "Awareness of our surroundings, our past & our present",        color: "#fff7e0", accent: "#d97706" },
  { icon: Trophy,       subject: "Co-scholastic Subjects", detail: "Sports, Value Education, Music, Art & Craft, GK",           color: "#f3e0ff", accent: "#7c3aed" },
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

// ── Teaching Methodology ──────────────────────────────────────────
const methodology = [
  {
    title: "Hands-on Activities",
    desc: "Annual exhibitions for many subjects & always active clubs help students apply what they learn",
    img: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/SS-02.jpeg",
  },
  {
    title: "Tours & Visits",
    desc: "Exciting recreational, educational & cultural excursions get students to \"think outside the classroom\"",
    img: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Primary-scetion-768x513.png",
  },
  {
    title: "Project Work",
    desc: "Individual & group projects get students to learn from their families & peers & get better at application",
    img: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/SS-02-1024x554.jpeg",
  },
  {
    title: "Digital Tools",
    desc: "E-learning amenities make abstract concepts concrete & assist in greater retention of data & processes",
    img: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/MS-02-1024x559.jpeg",
  },
];

export default function Secondary() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Secondary Section (Class 9-10) - Rainbow International School Thane"
        description="Rainbow International School's Secondary Section (Class 9 & 10). CBSE curriculum focused on academic excellence, career guidance, and all-round development."
        keywords="secondary school Thane, Class 9 10 CBSE Thane West, Rainbow school secondary section admission"
        canonical="https://rainbowinternationalschool.in/secondary-section/"
        ogImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/middle-school-class-6-class-8-international-school-admission-ad-2.jpg"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "Academics", href: "https://rainbowinternationalschool.in/secondary-section" },
          { name: "Secondary (Class 9-10)", href: "https://rainbowinternationalschool.in/secondary-section" },
        ]}
      />
      <Navbar />
      <PageBanner
        title="Secondary Section"
        subtitle="Class 9 and Class 10"
        breadcrumb={[{ label: "Secondary Section" }]}
        bgImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/middle-school-class-6-class-8-international-school-admission-ad.jpg"
      />

      <main className="flex-grow">

        {/* ── Intro + Curriculum sidebar ─────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

              {/* Left — intro content */}
              <div className="lg:col-span-2 space-y-5">
                <div>
                  <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-3" style={{ background: "#eef5ff", color: "#0d3b86" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    Board Preparation
                  </span>
                  <h2 className="text-3xl font-black" style={{ color: "#0d3b86", fontFamily: "'DM Sans', sans-serif" }}>Secondary Section</h2>
                  <p className="text-base text-gray-500 font-semibold mt-1">(Class-9 and Class-10)</p>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  For the final lap of their schooling years, Rainbow ensures, above all, the students are ready to take on the world outside of the school and are prepared for the directions their varied careers would take them on.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Our zestful curriculum is entirely focused on quality learning, one that would shape them for a future not only in India, but globally as well. It is designed to keep them intrigued and engaged, developing them into responsible, confident, and independent thinkers. Keeping in mind the importance of their over-all growth, we ensure their continued involvement in Sports, Arts, and Languages to maintain their physical and mental health in light of their academic commitments.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  At Rainbow, our higher graders receive <strong>one-on-one career guidance</strong> from counselors to ensure they have a medium where they may voice out their concerns, sort through their dilemmas, and navigate through several layers of career options to find one that suits their interests best. Our leadership and teamwork oriented programs hone their own skills and help highlight their own unique qualities.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  When our students graduate from here, they do so as academically stellar, responsible, and naturally outstanding young adults, fit to take on the world.
                </p>

                {/* Photo */}
                <div className="grid grid-cols-2 gap-4">
                  <img
                    src="/images/students/secondary-students.png"
                    alt="Secondary section students in navy blazers at Rainbow International School"
                    className="rounded-3xl w-full object-cover h-48"
                    width={512}
                    height={384}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <img
                    src="/images/students/secondary-students-2.png"
                    alt="Secondary students at Rainbow International School"
                    className="rounded-3xl w-full object-cover h-48"
                    width={512}
                    height={384}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
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

        {/* ── 100% Result milestone ──────────────────────────────── */}
        <div className="py-10" style={{ background: "#0d3b86" }}>
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <p className="text-white/70 text-sm font-bold uppercase tracking-widest mb-2">Milestone</p>
            <h3 className="text-2xl font-black text-white mb-3">100% Result — Rainbow's First Batch (2018–19)</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Our first batch of Class X students achieved <strong className="text-white">100% results</strong> in the All India Secondary School Examination (March 2019) — with topper Aryan Gulhane scoring <strong className="text-amber-400">96.6%</strong>.
            </p>
          </div>
        </div>

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
                        (e.target as HTMLImageElement).src = "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/SS-02.jpeg";
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
