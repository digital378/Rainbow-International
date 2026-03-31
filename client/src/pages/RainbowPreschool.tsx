import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import { Link } from "wouter";
import ScrollProgress from "@/components/home/ScrollProgress";
import { Star, Heart, Sparkles, Music, Palette, BookOpen, Users, Shield, Smile, Award, Globe, CheckCircle2, ArrowRight, Play } from "lucide-react";

const programs = [
  {
    name: "Playgroup",
    age: "1.5 – 2.5 years",
    emoji: "🌱",
    color: "#10b981",
    bg: "#ecfdf5",
    border: "#6ee7b7",
    description: "A gentle, joyful introduction to the world of learning through play, music, movement, and sensory exploration. Your child's very first adventure begins here.",
    highlights: ["Sensory play activities", "Nursery rhymes & music", "Colour & shape recognition", "Socialisation skills"],
  },
  {
    name: "Nursery",
    age: "2.5 – 3.5 years",
    emoji: "🌸",
    color: "#ec4899",
    bg: "#fdf2f8",
    border: "#f9a8d4",
    description: "Building curiosity and confidence through hands-on learning. Children develop language, early numeracy, and the social skills that last a lifetime.",
    highlights: ["Language & storytelling", "Early maths concepts", "Art & creative play", "Emotional development"],
  },
  {
    name: "Jr. KG",
    age: "3.5 – 4.5 years",
    emoji: "🚀",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    border: "#c4b5fd",
    description: "Igniting the spark of inquiry. Children develop reading readiness, creative thinking, and fine motor skills in our vibrant, child-centred classroom.",
    highlights: ["Phonics & pre-reading", "Creative writing basics", "Science discovery", "Motor skill activities"],
  },
  {
    name: "Sr. KG",
    age: "4.5 – 5.5 years",
    emoji: "🎓",
    color: "#f59e0b",
    bg: "#fffbeb",
    border: "#fcd34d",
    description: "The bridge to primary school. Children develop academic confidence, self-expression, and the joy of achievement — fully ready for the next big leap.",
    highlights: ["Structured academics", "Public speaking & drama", "Number skills & logic", "Self-confidence building"],
  },
];

const features = [
  { icon: Shield, label: "100% Female Staff", desc: "Safe, nurturing environment — every class staffed entirely by trained female educators.", color: "#ec4899", bg: "#fdf2f8" },
  { icon: BookOpen, label: "Multiple Intelligence", desc: "Every child is unique. We follow Howard Gardner's Multiple Intelligence theory for holistic growth.", color: "#8b5cf6", bg: "#f5f3ff" },
  { icon: Sparkles, label: "Activity-Based Learning", desc: "Children learn by doing. Our curriculum is built around exploration, experiments, and discovery.", color: "#f59e0b", bg: "#fffbeb" },
  { icon: Music, label: "Arts, Music & Dance", desc: "Creative expression is core to our programme. Every child gets to sing, dance, paint, and perform.", color: "#10b981", bg: "#ecfdf5" },
  { icon: Globe, label: "Smart Classrooms", desc: "Technology-enabled classrooms with smart boards and e-learning resources, even at pre-primary level.", color: "#3b82f6", bg: "#eff6ff" },
  { icon: Heart, label: "Emotional Intelligence", desc: "Structured activities nurture empathy, kindness, and resilience — alongside academic learning.", color: "#ef4444", bg: "#fef2f2" },
];

const awards = [
  { title: "10 Best Preschools in India", body: "The Knowledge Review Magazine" },
  { title: "Profound Technology in Early Childhood", body: "15th World Education Summit" },
  { title: "Excellence in Preschool Education", body: "India Today — Thane, 2017" },
  { title: "FIT INDIA School", body: "Ministry of Youth Affairs & Sports" },
];

const whyPoints = [
  "World-class education with deep Indian values",
  "Seamless transition from preschool to Class 12 within the Rainbow family",
  "Award-winning pedagogy recognised nationally and globally",
  "Strong focus on emotional intelligence alongside academics",
  "Safe, inclusive, and joyful learning environment",
  "Parent engagement programmes to keep families involved",
];

const pillars = [
  { word: "Competence", color: "#3b82f6", bg: "#eff6ff", desc: "Building academic foundations through engaging, age-appropriate curriculum." },
  { word: "Conscience", color: "#10b981", bg: "#ecfdf5", desc: "Nurturing values, integrity, and a strong moral compass from the very start." },
  { word: "Compassion", color: "#ec4899", bg: "#fdf2f8", desc: "Cultivating kindness, empathy, and care for others and the world around us." },
  { word: "Courage", color: "#f59e0b", bg: "#fffbeb", desc: "Encouraging children to explore, question, and believe in themselves." },
];

export default function RainbowPreschool() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Rainbow Preschool International - Playful Early Learning in Thane West"
        description="Rainbow Preschool International — award-winning preschool for children aged 1.5 to 5.5 years. Playgroup, Nursery, Jr KG, and Sr KG. 100% female staff. Recognised among India's best preschools."
        keywords="Rainbow Preschool International, best preschool Thane West, playgroup Thane, nursery admission Thane, Rainbow pre-primary school, early childhood education Thane"
        canonical="https://rainbowinternationalschool.in/rainbow-preschool-international/"
        ogImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-preschool-playgroup-banner-1.jpg"
      />
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-24" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)" }}>
        {/* Floating decorative blobs */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-20" style={{ background: "#fbbf24", filter: "blur(30px)" }} />
        <div className="absolute bottom-10 right-16 w-40 h-40 rounded-full opacity-20" style={{ background: "#34d399", filter: "blur(35px)" }} />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full opacity-15" style={{ background: "#f87171", filter: "blur(25px)" }} />

        {/* Breadcrumb */}
        <div className="relative container mx-auto px-4 mb-8">
          <p className="text-white/60 text-sm">
            <Link href="/" className="hover:text-white transition-colors">Rainbow International</Link>
            <span className="mx-2">›</span>
            <span className="text-white">Rainbow Preschool International</span>
          </p>
        </div>

        <div className="relative container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-sm font-bold mb-6">
                <Star size={14} className="text-yellow-300 fill-yellow-300" />
                <span>Recognised Among India's 10 Best Preschools</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black leading-tight mb-5 text-white">
                Where Little<br />
                <span className="relative inline-block" style={{ color: "#fbbf24" }}>Dreamers</span>
                <br />Begin
              </h1>
              <p className="text-white/85 text-lg leading-relaxed mb-8 max-w-lg">
                Rainbow Preschool International is a warm, award-winning preschool for children aged <strong>1.5 to 5.5 years</strong> — where play, curiosity, and creativity come together to build the very best start in life.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#programmes">
                  <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm transition-all hover:scale-[1.03]" style={{ background: "#fbbf24", color: "#0d3b86" }}>
                    Explore Programmes
                    <ArrowRight size={15} />
                  </button>
                </a>
                <a href="#contact">
                  <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm border-2 border-white/40 text-white hover:bg-white/10 transition-all">
                    Enquire Now
                  </button>
                </a>
              </div>
            </div>

            <div className="flex-shrink-0 relative">
              <div className="w-72 h-72 md:w-80 md:h-80 rounded-[40px] overflow-hidden shadow-2xl border-4 border-white/30">
                <img
                  src="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/pre-primary-school-nursery-jrkg-srkg-admissions-ad.jpg"
                  alt="Rainbow Preschool children"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              {/* Floating stat badges */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl px-4 py-3 shadow-xl">
                <p className="text-xs text-gray-500 font-medium">Est.</p>
                <p className="text-xl font-black" style={{ color: "#8b5cf6" }}>2009</p>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-3 shadow-xl">
                <p className="text-xs text-gray-500 font-medium">Students Impacted</p>
                <p className="text-xl font-black" style={{ color: "#ec4899" }}>50,000+</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ height: "60px", display: "block" }} xmlns="http://www.w3.org/2000/svg">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="white" />
          </svg>
        </div>
      </section>

      <main className="flex-grow">

        {/* ── About Intro ──────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-12 items-center">
                <div className="flex-1">
                  <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-6" style={{ background: "#fdf2f8", color: "#ec4899" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    About the Preschool
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-5 leading-tight">
                    The Most Joyful<br />
                    <span style={{ color: "#8b5cf6" }}>Start in Life</span>
                  </h2>
                  <div className="space-y-4 text-gray-600 text-[15px] leading-[1.85]">
                    <p>
                      <strong>Rainbow Preschool International</strong> is the early childhood wing of Rainbow International School — one of Thane's most respected CBSE institutions. Our preschool is built on the belief that <strong>the early years are the most important years</strong>, and every child deserves a start that is safe, joyful, and deeply enriching.
                    </p>
                    <p>
                      We follow the <strong>Multiple Intelligence Theory</strong> by Howard Gardner, ensuring that every child — whether they are a visual thinker, a musical genius, a little athlete, or a natural storyteller — finds their unique strength celebrated and developed.
                    </p>
                    <p>
                      Awarded as one of the <strong>10 Best Preschools in India</strong> by The Knowledge Review Magazine, and recognised at the <strong>15th World Education Summit</strong> for technology in early childhood education, Rainbow Preschool International is where world-class learning meets warmth and wonder.
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0 grid grid-cols-2 gap-4 w-full lg:w-80">
                  {[
                    "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/PPS-02.jpg",
                    "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/pre-primary-school-nursery-jrkg-srkg-admissions-ad.jpg",
                    "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-preschool-playgroup-banner-1.jpg",
                    "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/amenities-facilities01-768x610.png",
                  ].map((src, i) => (
                    <div key={i} className={`rounded-2xl overflow-hidden shadow-md ${i === 0 ? "col-span-2 h-44" : "h-32"}`}>
                      <img src={src} alt="Rainbow Preschool" className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4 Pillars ─────────────────────────────────────────── */}
        <section className="py-20" style={{ background: "#fafafa" }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-5" style={{ background: "#f5f3ff", color: "#8b5cf6" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                Our Foundation
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">Built on 4 Strong Pillars</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {pillars.map((p, i) => (
                <div
                  key={i}
                  className="rounded-3xl p-7 text-center border-2 hover:-translate-y-1 transition-all shadow-sm hover:shadow-lg"
                  style={{ background: p.bg, borderColor: "transparent", boxShadow: `0 4px 20px -4px ${p.color}25` }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black text-white"
                    style={{ background: p.color }}
                  >
                    {["C", "C", "C", "C"][i]}
                  </div>
                  <h3 className="text-xl font-black mb-3" style={{ color: p.color }}>{p.word}</h3>
                  <p className="text-gray-600 text-sm leading-[1.7]">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Programmes ───────────────────────────────────────── */}
        <section id="programmes" className="py-20 bg-white scroll-mt-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-5" style={{ background: "#fffbeb", color: "#f59e0b" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                Age-Wise Programmes
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">A Programme for<br />Every Little Learner</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {programs.map((prog, i) => (
                <div
                  key={i}
                  className="rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 border-2"
                  style={{ borderColor: prog.border, background: "white" }}
                  data-testid={`card-preschool-${i}`}
                >
                  {/* Coloured header */}
                  <div className="px-6 pt-7 pb-5 text-center" style={{ background: prog.bg }}>
                    <span className="text-4xl block mb-3">{prog.emoji}</span>
                    <h3 className="text-xl font-black mb-1" style={{ color: prog.color }}>{prog.name}</h3>
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: prog.color, color: "white" }}
                    >
                      {prog.age}
                    </span>
                  </div>
                  <div className="px-6 py-5">
                    <p className="text-gray-600 text-sm leading-[1.75] mb-4">{prog.description}</p>
                    <ul className="space-y-2">
                      {prog.highlights.map((h, j) => (
                        <li key={j} className="flex items-center gap-2 text-xs text-gray-500">
                          <CheckCircle2 size={12} style={{ color: prog.color }} className="flex-shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why Rainbow Preschool ─────────────────────────────── */}
        <section className="py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-14 items-center max-w-5xl mx-auto">
              <div className="flex-1">
                <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-6" style={{ background: "#eef5ff", color: "#0d3b86" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  Why Choose Us
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 leading-tight">
                  The Rainbow<br />
                  <span style={{ color: "#0d3b86" }}>Difference</span>
                </h2>
                <ul className="space-y-4">
                  {whyPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: "#eef5ff" }}
                      >
                        <CheckCircle2 size={14} style={{ color: "#0d3b86" }} />
                      </span>
                      <span className="text-gray-600 text-[15px] leading-[1.7]">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex-shrink-0 w-full lg:w-96">
                <img
                  src="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-preschool-playgroup-banner-1.jpg"
                  alt="Rainbow Preschool classroom"
                  className="rounded-3xl shadow-xl w-full object-cover h-80"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Features Grid ─────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-5" style={{ background: "#ecfdf5", color: "#10b981" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                Our Approach
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">What Makes Our Preschool Special</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {features.map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={i}
                    className="rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
                    style={{ background: "white" }}
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: feat.bg }}
                    >
                      <Icon size={22} style={{ color: feat.color }} />
                    </div>
                    <h3 className="font-black text-gray-900 text-lg mb-2">{feat.label}</h3>
                    <p className="text-gray-500 text-sm leading-[1.75]">{feat.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Awards ───────────────────────────────────────────── */}
        <section className="py-20" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)" }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-5 bg-white/10 text-yellow-300 border border-white/15">
                <Star size={12} className="fill-current" />
                Recognition & Awards
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white">Nationally & Globally Recognised</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
              {awards.map((aw, i) => (
                <div
                  key={i}
                  className="rounded-3xl p-6 text-center border border-white/10"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  <div className="w-12 h-12 rounded-full bg-yellow-400/20 flex items-center justify-center mx-auto mb-4">
                    <Award size={22} className="text-yellow-300" />
                  </div>
                  <p className="font-black text-white text-[15px] leading-tight mb-2">{aw.title}</p>
                  <p className="text-white/55 text-xs">{aw.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Seamless Journey CTA ──────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-xl">
              <div
                className="px-10 py-12 text-center"
                style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #fda085 100%)" }}
              >
                <span className="text-4xl block mb-4">🌈</span>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                  One School. One Journey.<br />Nursery to Class 12.
                </h2>
                <p className="text-white/85 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
                  Children who begin at Rainbow Preschool International seamlessly grow into Rainbow International School — with the same values, the same warmth, and the same commitment to excellence at every stage.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link href="/pre-primary-school-thane">
                    <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm transition-all hover:scale-[1.03]" style={{ background: "white", color: "#f5576c" }}>
                      View Pre-Primary Section
                      <ArrowRight size={15} />
                    </button>
                  </Link>
                  <a href="#contact">
                    <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm border-2 border-white/50 text-white hover:bg-white/10 transition-all">
                      Enquire About Admissions
                    </button>
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-3" style={{ background: "#fff9f9" }}>
                {[
                  { num: "1.5–5.5", label: "Age Group" },
                  { num: "100%", label: "Female Staff" },
                  { num: "4", label: "Programmes" },
                ].map((s, i) => (
                  <div key={i} className={`px-6 py-5 text-center ${i < 2 ? "border-r border-pink-100" : ""}`}>
                    <p className="text-2xl font-black mb-1" style={{ color: "#f5576c" }}>{s.num}</p>
                    <p className="text-gray-500 text-xs font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
