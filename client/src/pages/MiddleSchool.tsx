import { MIDDLE_SEO, MIDDLE_CONTENT } from "@shared/content/middle";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import ScrollProgress from "@/components/home/ScrollProgress";
import { type WaveOneFaq } from "@/components/WaveOneSeoBlock";
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
const PHONE = "+918291568972";
const DIRECTIONS_URL = "https://maps.google.com/?q=Rainbow+International+School+Brahmand+Phase+4+Thane";

const FAQS: WaveOneFaq[] = MIDDLE_CONTENT.faqs;

const decisionCards = [
  { icon: BookOpen },
  { icon: GraduationCap },
  { icon: MessageCircle },
  { icon: Monitor },
  { icon: Trophy },
  { icon: ShieldCheck }
].map((visual, index) => ({ ...visual, ...MIDDLE_CONTENT.decisionCards[index] }));

const journey = MIDDLE_CONTENT.journey;

const gradeAdmissions = MIDDLE_CONTENT.gradeAdmissions;

const scholastic = [
  { icon: BookOpen },
  { icon: Calculator },
  { icon: FlaskConical },
  { icon: Globe },
  { icon: Languages },
  { icon: Languages },
  { icon: Monitor },
  { icon: Compass }
].map((visual, index) => ({ ...visual, ...MIDDLE_CONTENT.scholastic[index] }));
const coScholastic = [
  { icon: Trophy },
  { icon: Trophy },
  { icon: Palette },
  { icon: Sparkles },
  { icon: Users },
  { icon: Heart },
  { icon: Heart }
].map((visual, index) => ({ ...visual, ...MIDDLE_CONTENT.coScholastic[index] }));

const skills = [
  { icon: Brain, color: "#e0edff", accent: NAVY_MID },
  { icon: MessageCircle, color: "#fff7e0", accent: AMBER },
  { icon: Monitor, color: "#e0f2fe", accent: "#0369a1" },
  { icon: Lightbulb, color: "#fdf2f8", accent: "#be185d" },
  { icon: BookOpen, color: "#e0f7f0", accent: "#059669" },
  { icon: FlaskConical, color: "#f3e0ff", accent: "#7c3aed" },
  { icon: Users, color: "#fff7e0", accent: AMBER },
  { icon: Heart, color: "#e0edff", accent: NAVY_MID }
].map((visual, index) => ({ ...visual, ...MIDDLE_CONTENT.skills[index] }));

const classroom = MIDDLE_CONTENT.classroom;

const approach = [
  { color: "#e0edff", accent: NAVY_MID, icon: Lightbulb },
  { color: "#e0f7f0", accent: "#047857", icon: BookOpen },
  { color: "#fff7e0", accent: AMBER, icon: Sparkles },
  { color: "#fdf2f8", accent: "#be185d", icon: ClipboardCheck }
].map((visual, index) => ({ ...visual, ...MIDDLE_CONTENT.approach[index] }));

const evaluationPoints = MIDDLE_CONTENT.evaluationPoints;

const transitionCards = [
  { icon: GraduationCap },
  { icon: ClipboardCheck },
  { icon: MessageCircle },
  { icon: Brain }
].map((visual, index) => ({ ...visual, ...MIDDLE_CONTENT.transitionCards[index] }));

const localities = MIDDLE_CONTENT.localities;
const grades = MIDDLE_CONTENT.grades;

function ctaTrack(label: string) {
  trackEvent("middle_cta_click", "middle_school", label);
}

export default function MiddleSchool() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title={MIDDLE_SEO.title}
        description={MIDDLE_SEO.description}
        keywords={MIDDLE_SEO.keywords}
        canonical="https://rainbowinternationalschool.in/middle-school-section"
        ogImage="/images/home/academic/middle-section.jpg"
        appendSiteName={false}
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "Academics", href: "https://rainbowinternationalschool.in/middle-school-section" },
          { name: MIDDLE_SEO.crumb, href: "https://rainbowinternationalschool.in/middle-school-section" },
        ]}
        jsonLd={{ "@context": "https://schema.org", "@type": "WebPage", name: MIDDLE_SEO.title, description: MIDDLE_SEO.description, url: "https://rainbowinternationalschool.in/middle-school-section" }}
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
            <Sparkles className="w-3.5 h-3.5" /> {MIDDLE_CONTENT.text.label1}
          </span>
          <h1 className="text-white font-black leading-[1.05] text-3xl sm:text-4xl md:text-5xl lg:text-6xl max-w-4xl" style={{ fontFamily: "'DM Sans', sans-serif" }} data-testid="text-h1">
            {MIDDLE_CONTENT.text.h1Lead1} <span className="text-white/40 font-normal">{MIDDLE_CONTENT.text.h1Separator1}</span> <span style={{ color: AMBER_LIGHT }}>{MIDDLE_CONTENT.text.h1Accent1}</span>
          </h1>
          <p className="text-white/95 text-base md:text-lg lg:text-xl mt-5 max-w-2xl font-medium">{MIDDLE_CONTENT.text.heroIntro1}</p>
          <p className="text-white/75 text-sm md:text-base mt-3 max-w-2xl">{MIDDLE_CONTENT.text.heroDetail1}</p>
          <div className="flex flex-wrap gap-2 mt-6 max-w-3xl">
            {MIDDLE_CONTENT.inlineList1.map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
                <CheckCircle2 className="w-3 h-3" /> {t}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-8">
            <a href="/admissions" onClick={() => ctaTrack("hero_enquire_class_6_8")} className="inline-flex items-center gap-2 font-extrabold text-sm sm:text-base px-6 py-3 rounded-full text-white shadow-lg hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }} data-testid="button-hero-enquire">
              {MIDDLE_CONTENT.text.cta1} <ArrowRight className="w-4 h-4" />
            </a>
            <a href="/admissions#campus-visit" onClick={() => ctaTrack("hero_campus_visit")} className="inline-flex items-center gap-2 font-extrabold text-sm sm:text-base px-6 py-3 rounded-full text-white border-2 border-white/80 hover:bg-white hover:text-[#091a4f] transition-colors" data-testid="button-hero-campus-visit">
              {MIDDLE_CONTENT.text.cta2}
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => { ctaTrack("hero_whatsapp"); trackWhatsAppClick({ sourcePage: "middle_hero" }); }} className="inline-flex items-center gap-2 font-extrabold text-sm sm:text-base px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }} data-testid="button-hero-whatsapp">
              <MessageCircle className="w-4 h-4" /> {MIDDLE_CONTENT.text.cta3}
            </a>
          </div>
        </div>
      </section>

      <main className="flex-grow">
        {/* WHY PARENTS */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3" style={{ background: "#eef5ff", color: NAVY_MID }}>{MIDDLE_CONTENT.text.label2}</span>
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>{MIDDLE_CONTENT.text.h21}</h2>
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
                {MIDDLE_CONTENT.text.cta4} <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* JOURNEY */}
        <section className="py-16 md:py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>{MIDDLE_CONTENT.text.h22}</h2>
              <p className="text-gray-600 mt-3">{MIDDLE_CONTENT.text.paragraph1}</p>
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
                {MIDDLE_CONTENT.text.cta5} <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* GRADE ADMISSIONS */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3" style={{ background: "#fff7e0", color: AMBER }}>{MIDDLE_CONTENT.text.label3}</span>
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>{MIDDLE_CONTENT.text.h23}</h2>
              <p className="text-gray-600 mt-3">{MIDDLE_CONTENT.text.paragraph2}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {gradeAdmissions.map((g, i) => (
                <div key={g.grade} className="rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 flex flex-col" data-testid={`card-grade-${i}`}>
                  <span className="inline-block self-start text-[11px] font-extrabold px-3 py-1 rounded-full mb-3" style={{ background: NAVY, color: "#fff" }}>{g.grade}</span>
                  <h3 className="font-extrabold text-base mb-2" style={{ color: NAVY }}>{g.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed flex-grow">{g.body}</p>
                  <a href="/admissions" onClick={() => ctaTrack(`grade_enquire_${g.grade.toLowerCase().replace(" ", "_")}`)} className="inline-flex items-center gap-1.5 text-xs font-extrabold mt-5 self-start px-4 py-2 rounded-full border-2 hover:opacity-80 transition-opacity" style={{ color: NAVY, borderColor: NAVY }} data-testid={`button-grade-${i}`}>
                    {MIDDLE_CONTENT.text.cta6} <ChevronRight className="w-3 h-3" />
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
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>{MIDDLE_CONTENT.text.h24}</h2>
              <p className="text-gray-600 mt-3">{MIDDLE_CONTENT.text.paragraph3}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-4" style={{ background: NAVY_MID }}>
                  <h3 className="text-white font-black text-base uppercase tracking-wide flex items-center gap-2"><BookOpen className="w-5 h-5" /> {MIDDLE_CONTENT.text.h31}</h3>
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
                  <h3 className="text-white font-black text-base uppercase tracking-wide flex items-center gap-2"><Trophy className="w-5 h-5" /> {MIDDLE_CONTENT.text.h32}</h3>
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
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>{MIDDLE_CONTENT.text.h25}</h2>
              <p className="text-gray-600 mt-3">{MIDDLE_CONTENT.text.paragraph4}</p>
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
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>{MIDDLE_CONTENT.text.h26}</h2>
              <p className="text-gray-600 mt-3">{MIDDLE_CONTENT.text.paragraph5}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7 rounded-3xl overflow-hidden shadow-md aspect-[16/10] lg:aspect-auto lg:min-h-[420px] relative">
                <img src="/images/home/academic/middle-2.jpg" alt="Class 6 to Class 8 classroom at RIS Thane" className="w-full h-full object-cover" loading="lazy" decoding="async" width={1200} height={750} />
                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-white font-extrabold text-base md:text-lg">{MIDDLE_CONTENT.text.paragraph6}</p>
                </div>
              </div>
              <div className="lg:col-span-5 grid grid-cols-2 lg:grid-cols-1 gap-5">
                <div className="rounded-3xl overflow-hidden shadow-md aspect-[4/3] lg:aspect-auto lg:h-[200px] relative">
                  <img src="/images/home/academic/middle-3.jpg" alt="Middle school students at Rainbow International School Thane" className="w-full h-full object-cover" loading="lazy" decoding="async" width={600} height={400} />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-white font-extrabold text-sm">{MIDDLE_CONTENT.text.paragraph7}</p>
                  </div>
                </div>
                <div className="rounded-3xl overflow-hidden shadow-md aspect-[4/3] lg:aspect-auto lg:h-[200px] relative">
                  <img src="/images/students/middle-section.jpg" alt="Class 7 classroom activities at RIS Thane" className="w-full h-full object-cover" loading="lazy" decoding="async" width={600} height={400} />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-white font-extrabold text-sm">{MIDDLE_CONTENT.text.paragraph8}</p>
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
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>{MIDDLE_CONTENT.text.h27}</h2>
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
              <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3" style={{ background: AMBER_LIGHT, color: NAVY }}>{MIDDLE_CONTENT.text.label4}</span>
              <h2 className="text-2xl md:text-4xl font-black text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>{MIDDLE_CONTENT.text.h28}</h2>
              <p className="text-white/80 mt-3 text-sm md:text-base">{MIDDLE_CONTENT.text.paragraph9}</p>
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
                {MIDDLE_CONTENT.text.cta7} <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* TRANSITION TO SECONDARY */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>{MIDDLE_CONTENT.text.h29}</h2>
              <p className="text-gray-600 mt-3">{MIDDLE_CONTENT.text.paragraph10}</p>
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
                {MIDDLE_CONTENT.text.cta8} <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* HYPERLOCAL */}
        <section className="py-16 md:py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3" style={{ background: "#eef5ff", color: NAVY_MID }}><MapPin className="w-3 h-3" /> {MIDDLE_CONTENT.text.label5}</span>
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>{MIDDLE_CONTENT.text.h210}</h2>
              <p className="text-gray-600 mt-3 text-sm md:text-base">{MIDDLE_CONTENT.text.paragraph11}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {localities.map((loc, i) => (
                <div key={loc} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5" data-testid={`locality-${i}`}>
                  <div className="flex items-center gap-2 mb-3"><MapPin className="w-4 h-4" style={{ color: AMBER }} /><h3 className="font-extrabold text-base" style={{ color: NAVY }}>{MIDDLE_CONTENT.text.h33} {loc}</h3></div>
                  <div className="flex flex-wrap gap-1.5">
                    {grades.map((g) => (
                      <a key={g} href="/admissions" onClick={() => ctaTrack(`hyperlocal_${g}_${loc}`.toLowerCase().replace(/\s+/g, "_"))} className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full border hover:opacity-80 transition-opacity" style={{ background: "#f8faff", color: NAVY_MID, borderColor: "#dbe7ff" }}>
                        {g} {MIDDLE_CONTENT.text.cta9}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-10">
              <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" onClick={() => { ctaTrack("hyperlocal_directions"); trackDirectionsClick({ sourcePage: "middle_hyperlocal" }); }} className="inline-flex items-center gap-2 font-extrabold text-sm px-5 py-2.5 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: NAVY }} data-testid="button-get-directions">
                <MapPin className="w-4 h-4" /> {MIDDLE_CONTENT.text.cta10}
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => { ctaTrack("hyperlocal_transport"); trackWhatsAppClick({ sourcePage: "middle_hyperlocal_transport" }); }} className="inline-flex items-center gap-2 font-extrabold text-sm px-5 py-2.5 rounded-full border-2 hover:opacity-80 transition-opacity" style={{ color: NAVY, borderColor: NAVY }} data-testid="button-check-transport">
                <Bus className="w-4 h-4" /> {MIDDLE_CONTENT.text.cta11}
              </a>
              <a href="/admissions" onClick={() => ctaTrack("hyperlocal_enquire")} className="inline-flex items-center gap-2 font-extrabold text-sm px-5 py-2.5 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }} data-testid="button-hyperlocal-enquire">
                {MIDDLE_CONTENT.text.cta5} <ArrowRight className="w-4 h-4" />
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
                <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-4" style={{ background: AMBER_LIGHT, color: NAVY }}>{MIDDLE_CONTENT.text.label6}</span>
                <h2 className="text-2xl md:text-4xl font-black text-white mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>{MIDDLE_CONTENT.text.h211}</h2>
                <p className="text-white/85 max-w-2xl mx-auto mb-7 text-sm md:text-base">{MIDDLE_CONTENT.text.paragraph12}</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <a href="/admissions" onClick={() => ctaTrack("final_enquire")} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }} data-testid="button-final-enquire">
                    {MIDDLE_CONTENT.text.cta1} <ArrowRight className="w-4 h-4" />
                  </a>
                  <a href="/admissions#campus-visit" onClick={() => ctaTrack("final_campus_visit")} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white border-2 border-white/80 hover:bg-white hover:text-[#091a4f] transition-colors" data-testid="button-final-campus-visit">
                    {MIDDLE_CONTENT.text.cta2}
                  </a>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => { ctaTrack("final_whatsapp"); trackWhatsAppClick({ sourcePage: "middle_final" }); }} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }} data-testid="button-final-whatsapp">
                    <MessageCircle className="w-4 h-4" /> {MIDDLE_CONTENT.text.cta3}
                  </a>
                  <a href={`tel:${PHONE}`} onClick={() => { ctaTrack("final_call"); trackCallClick({ phone: PHONE, sourcePage: "middle_final" }); }} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white border-2 border-white/80 hover:bg-white hover:text-[#091a4f] transition-colors" data-testid="button-final-call">
                    <Phone className="w-4 h-4" /> {MIDDLE_CONTENT.text.cta12}
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
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>{MIDDLE_CONTENT.text.h212}</h2>
              <p className="text-gray-600 mt-3">{MIDDLE_CONTENT.text.paragraph13}</p>
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
            <Phone className="w-4 h-4" style={{ color: NAVY }} /><span className="text-[10px] font-extrabold" style={{ color: NAVY }}>{MIDDLE_CONTENT.text.label7}</span>
          </a>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => { ctaTrack("sticky_whatsapp"); trackWhatsAppClick({ sourcePage: "middle_sticky" }); }} className="flex flex-col items-center justify-center py-2.5 gap-0.5 hover:bg-gray-50">
            <MessageCircle className="w-4 h-4" style={{ color: "#25D366" }} /><span className="text-[10px] font-extrabold" style={{ color: NAVY }}>{MIDDLE_CONTENT.text.label8}</span>
          </a>
          <a href="/admissions" onClick={() => ctaTrack("sticky_enquire")} className="flex flex-col items-center justify-center py-2.5 gap-0.5 hover:bg-gray-50">
            <ClipboardCheck className="w-4 h-4" style={{ color: AMBER }} /><span className="text-[10px] font-extrabold" style={{ color: NAVY }}>{MIDDLE_CONTENT.text.label9}</span>
          </a>
          <a href="/admissions#campus-visit" onClick={() => ctaTrack("sticky_book_visit")} className="flex flex-col items-center justify-center py-2.5 gap-0.5 hover:bg-gray-50">
            <Compass className="w-4 h-4" style={{ color: NAVY_MID }} /><span className="text-[10px] font-extrabold" style={{ color: NAVY }}>{MIDDLE_CONTENT.text.label10}</span>
          </a>
        </div>
      </div>
      <div className="h-14 lg:hidden" aria-hidden="true" />
    </div>
  );
}
