import { SENIOR_SEO, SENIOR_CONTENT } from "@shared/content/senior";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import ScrollProgress from "@/components/home/ScrollProgress";
import { type WaveOneFaq } from "@/components/WaveOneSeoBlock";
import {
  BookOpen, Calculator, FlaskConical, TrendingUp, Heart, Briefcase,
  ShieldCheck, Sparkles, MessageCircle, Phone, MapPin, ChevronRight, GraduationCap,
  ClipboardCheck, Bus, ArrowRight, CheckCircle2, Compass, Brain, Lightbulb,
  Target, BookMarked, Award, RefreshCw, Clock, Trophy, Users, Rocket,
} from "lucide-react";
import { useState } from "react";
import { trackCallClick, trackWhatsAppClick, trackDirectionsClick, trackEvent } from "@/lib/analytics";

const NAVY = "#091a4f";
const NAVY_MID = "#0d3b86";
const AMBER = "#d97706";
const AMBER_LIGHT = "#f59e0b";

const WHATSAPP_URL = "https://wa.me/918291568972?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20Senior%20Secondary%20%28Class%2011%26%2012%29%20admission%20at%20Rainbow%20International%20School.";
const PHONE = "+918291568972";
const DIRECTIONS_URL = "https://maps.google.com/?q=Rainbow+International+School+Brahmand+Phase+4+Thane";

const FAQS: WaveOneFaq[] = SENIOR_CONTENT.faqs;

const decisionCards = [
  { icon: GraduationCap },
  { icon: Compass },
  { icon: Target },
  { icon: Rocket },
  { icon: Users },
  { icon: Heart }
].map((visual, index) => ({ ...visual, ...SENIOR_CONTENT.decisionCards[index] }));

const journey = SENIOR_CONTENT.journey;

const gradeAdmissions = SENIOR_CONTENT.gradeAdmissions;

const streams = [
  { color: "#e0edff", accent: NAVY_MID, icon: FlaskConical },
  { color: "#fff7e0", accent: AMBER, icon: TrendingUp },
  { color: "#fdf2f8", accent: "#be185d", icon: BookOpen }
].map((visual, index) => ({ ...visual, ...SENIOR_CONTENT.streams[index] }));

const boardSupport = [
  { icon: Lightbulb },
  { icon: ClipboardCheck },
  { icon: RefreshCw },
  { icon: MessageCircle },
  { icon: BookMarked },
  { icon: Clock },
  { icon: TrendingUp },
  { icon: Heart },
  { icon: Award }
].map((visual, index) => ({ ...visual, ...SENIOR_CONTENT.boardSupport[index] }));

const careerCards = [
  { icon: Compass, color: "#e0edff", accent: NAVY_MID },
  { icon: Briefcase, color: "#fff7e0", accent: AMBER },
  { icon: MessageCircle, color: "#e0f7f0", accent: "#059669" },
  { icon: BookMarked, color: "#fdf2f8", accent: "#be185d" },
  { icon: Users, color: "#f3e0ff", accent: "#7c3aed" },
  { icon: Rocket, color: "#e0f2fe", accent: "#0369a1" }
].map((visual, index) => ({ ...visual, ...SENIOR_CONTENT.careerCards[index] }));

const beyondAcademics = [
  { icon: Trophy },
  { icon: Sparkles },
  { icon: Users },
  { icon: Award },
  { icon: Heart },
  { icon: ShieldCheck }
].map((visual, index) => ({ ...visual, ...SENIOR_CONTENT.beyondAcademics[index] }));

const evaluationPoints = SENIOR_CONTENT.evaluationPoints;

const futureCards = [
  { icon: Award },
  { icon: GraduationCap },
  { icon: Compass },
  { icon: Rocket }
].map((visual, index) => ({ ...visual, ...SENIOR_CONTENT.futureCards[index] }));

const localities = SENIOR_CONTENT.localities;
const grades = SENIOR_CONTENT.grades;

function ctaTrack(label: string) {
  trackEvent("senior_cta_click", "senior_secondary", label);
}

export default function SeniorSecondary() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title={SENIOR_SEO.title}
        description={SENIOR_SEO.description}
        keywords={SENIOR_SEO.keywords}
        canonical="https://rainbowinternationalschool.in/senior-secondary-section"
        ogImage="/images/home/academic/senior-secondary.jpg"
        appendSiteName={false}
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "Academics", href: "https://rainbowinternationalschool.in/senior-secondary-section" },
          { name: SENIOR_SEO.crumb, href: "https://rainbowinternationalschool.in/senior-secondary-section" },
        ]}
        jsonLd={{ "@context": "https://schema.org", "@type": "WebPage", name: SENIOR_SEO.title, description: SENIOR_SEO.description, url: "https://rainbowinternationalschool.in/senior-secondary-section" }}
      />
      <Navbar />

      {/* HERO */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: "min(78vh, 720px)" }} data-testid="section-hero">
        <picture>
          <source media="(max-width: 768px)" srcSet="/images/students/hero-senior-secondary-mobile.webp" type="image/webp" />
          <source srcSet="/images/students/hero-senior-secondary.webp" type="image/webp" />
          <img src="/images/students/hero-senior-secondary.jpg" alt="Senior secondary students at Rainbow International School Thane" className="absolute inset-0 w-full h-full object-cover" fetchPriority="high" decoding="async" />
        </picture>
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(9,26,79,0.92) 0%, rgba(13,59,134,0.78) 60%, rgba(9,26,79,0.65) 100%)" }} />
        <div className="relative z-10 container mx-auto px-4 max-w-6xl py-20 md:py-28 lg:py-32 flex flex-col">
          <span className="inline-flex self-start items-center gap-2 text-[11px] font-extrabold tracking-[0.2em] uppercase px-4 py-2 rounded-full mb-5" style={{ background: AMBER_LIGHT, color: NAVY }} data-testid="badge-admissions-open">
            <Sparkles className="w-3.5 h-3.5" /> {SENIOR_CONTENT.text.label1}
          </span>
          <h1 className="text-white font-black leading-[1.05] text-3xl sm:text-4xl md:text-5xl lg:text-6xl max-w-4xl" style={{ fontFamily: "'DM Sans', sans-serif" }} data-testid="text-h1">
            {SENIOR_CONTENT.text.h1Lead1} <span className="text-white/40 font-normal">{SENIOR_CONTENT.text.h1Separator1}</span> <span style={{ color: AMBER_LIGHT }}>{SENIOR_CONTENT.text.h1Accent1}</span>
          </h1>
          <p className="text-white/95 text-base md:text-lg lg:text-xl mt-5 max-w-2xl font-medium">{SENIOR_CONTENT.text.heroIntro1}</p>
          <p className="text-white/75 text-sm md:text-base mt-3 max-w-2xl">{SENIOR_CONTENT.text.heroDetail1}</p>
          <div className="flex flex-wrap gap-2 mt-6 max-w-3xl">
            {SENIOR_CONTENT.inlineList1.map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
                <CheckCircle2 className="w-3 h-3" /> {t}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-8">
            <a href="/admissions" onClick={() => ctaTrack("hero_enquire_class_11_12")} className="inline-flex items-center gap-2 font-extrabold text-sm sm:text-base px-6 py-3 rounded-full text-white shadow-lg hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }} data-testid="button-hero-enquire">
              {SENIOR_CONTENT.text.cta1} <ArrowRight className="w-4 h-4" />
            </a>
            <a href="/admissions#campus-visit" onClick={() => ctaTrack("hero_campus_visit")} className="inline-flex items-center gap-2 font-extrabold text-sm sm:text-base px-6 py-3 rounded-full text-white border-2 border-white/80 hover:bg-white hover:text-[#091a4f] transition-colors" data-testid="button-hero-campus-visit">
              {SENIOR_CONTENT.text.cta2}
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => { ctaTrack("hero_whatsapp"); trackWhatsAppClick({ sourcePage: "senior_hero" }); }} className="inline-flex items-center gap-2 font-extrabold text-sm sm:text-base px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }} data-testid="button-hero-whatsapp">
              <MessageCircle className="w-4 h-4" /> {SENIOR_CONTENT.text.cta3}
            </a>
          </div>
        </div>
      </section>

      <main className="flex-grow">
        {/* WHY STUDENTS */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3" style={{ background: "#eef5ff", color: NAVY_MID }}>{SENIOR_CONTENT.text.label2}</span>
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>{SENIOR_CONTENT.text.h21}</h2>
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
              <a href="/admissions" onClick={() => ctaTrack("why_explore_admissions")} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: NAVY }} data-testid="button-explore-admissions">
                {SENIOR_CONTENT.text.cta4} <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* JOURNEY */}
        <section className="py-16 md:py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>{SENIOR_CONTENT.text.h22}</h2>
              <p className="text-gray-600 mt-3">{SENIOR_CONTENT.text.paragraph1}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {journey.map((j, i) => (
                <div key={j.grade} className="rounded-3xl bg-white border border-gray-100 shadow-sm p-7 relative overflow-hidden">
                  <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-10" style={{ background: i === 0 ? NAVY_MID : AMBER }} />
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black shadow-lg mb-4" style={{ background: i === 0 ? NAVY_MID : AMBER }}>{j.grade.replace("Class ", "")}</div>
                  <h3 className="font-extrabold text-xl mb-2" style={{ color: NAVY }}>{j.grade}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{j.body}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <a href="/admissions" onClick={() => ctaTrack("journey_enquire")} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }} data-testid="button-journey-enquire">
                {SENIOR_CONTENT.text.cta5} <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* GRADE ADMISSIONS */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3" style={{ background: "#fff7e0", color: AMBER }}>{SENIOR_CONTENT.text.label3}</span>
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>{SENIOR_CONTENT.text.h23}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gradeAdmissions.map((g, i) => (
                <div key={g.grade} className="rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all p-7 flex flex-col" data-testid={`card-grade-${i}`}>
                  <span className="inline-block self-start text-[11px] font-extrabold px-3 py-1 rounded-full mb-3" style={{ background: NAVY, color: "#fff" }}>{g.grade}</span>
                  <h3 className="font-extrabold text-lg mb-2" style={{ color: NAVY }}>{g.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed flex-grow">{g.body}</p>
                  <a href="/admissions" onClick={() => ctaTrack(`grade_enquire_${g.grade.toLowerCase().replace(" ", "_")}`)} className="inline-flex items-center gap-1.5 text-xs font-extrabold mt-5 self-start px-4 py-2 rounded-full border-2 hover:opacity-80 transition-opacity" style={{ color: NAVY, borderColor: NAVY }} data-testid={`button-grade-${i}`}>
                    {SENIOR_CONTENT.text.cta6} <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STREAMS */}
        <section className="py-16 md:py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>{SENIOR_CONTENT.text.h24}</h2>
              <p className="text-gray-600 mt-3">{SENIOR_CONTENT.text.paragraph2}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {streams.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.name} className="rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col" data-testid={`card-stream-${i}`} onClick={() => ctaTrack(`stream_card_${s.name.toLowerCase().replace(/\s+/g, "_")}`)}>
                    <div className="p-6" style={{ background: s.color }}>
                      <div className="w-14 h-14 rounded-2xl bg-white/70 flex items-center justify-center mb-3"><Icon className="w-7 h-7" style={{ color: s.accent }} /></div>
                      <h3 className="font-black text-xl" style={{ color: s.accent }}>{s.name}</h3>
                      <p className="text-sm text-gray-700 mt-2">{s.description}</p>
                    </div>
                    <div className="p-6 space-y-3 flex-grow">
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: s.accent }}>{SENIOR_CONTENT.text.paragraph3}</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{s.suitable}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: s.accent }}>{SENIOR_CONTENT.text.paragraph4}</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{s.direction}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: s.accent }}>{SENIOR_CONTENT.text.paragraph5}</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{s.skills}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: s.accent }}>{SENIOR_CONTENT.text.paragraph6}</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{s.pathways}</p>
                      </div>
                    </div>
                    <div className="px-6 pb-6">
                      <a href="/admissions" className="inline-flex items-center gap-1.5 text-xs font-extrabold px-4 py-2 rounded-full border-2 hover:opacity-80 transition-opacity" style={{ color: s.accent, borderColor: s.accent }}>
                        {SENIOR_CONTENT.text.cta7} <ChevronRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* BOARD SUPPORT */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3" style={{ background: "#fff7e0", color: AMBER }}>{SENIOR_CONTENT.text.label4}</span>
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>{SENIOR_CONTENT.text.h25}</h2>
              <p className="text-gray-600 mt-3">{SENIOR_CONTENT.text.paragraph7}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5">
              {boardSupport.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div key={b.title} className="rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm bg-gradient-to-br from-white to-[#fffbeb] hover:shadow-md transition-shadow" data-testid={`card-board-${i}`}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: AMBER_LIGHT }}><Icon className="w-5 h-5 text-white" /></div>
                    <h3 className="font-extrabold text-sm md:text-base" style={{ color: NAVY }}>{b.title}</h3>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CAREER READINESS */}
        <section className="py-16 md:py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>{SENIOR_CONTENT.text.h26}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {careerCards.map((c, i) => {
                const Icon = c.icon;
                return (
                  <div key={c.title} className="rounded-2xl p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow" data-testid={`card-career-${i}`}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: c.color }}><Icon className="w-6 h-6" style={{ color: c.accent }} /></div>
                    <h3 className="font-extrabold text-base mb-2" style={{ color: c.accent }}>{c.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{c.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* BEYOND ACADEMICS */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>{SENIOR_CONTENT.text.h27}</h2>
              <p className="text-gray-600 mt-3">{SENIOR_CONTENT.text.paragraph8}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {beyondAcademics.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div key={b.title} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 text-center hover:shadow-md transition-shadow" data-testid={`card-beyond-${i}`}>
                    <div className="w-11 h-11 mx-auto rounded-xl flex items-center justify-center mb-3" style={{ background: "#eef5ff" }}><Icon className="w-5 h-5" style={{ color: NAVY_MID }} /></div>
                    <p className="font-extrabold text-xs md:text-sm" style={{ color: NAVY }}>{b.title}</p>
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
              <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3" style={{ background: AMBER_LIGHT, color: NAVY }}>{SENIOR_CONTENT.text.label5}</span>
              <h2 className="text-2xl md:text-4xl font-black text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>{SENIOR_CONTENT.text.h28}</h2>
              <p className="text-white/80 mt-3 text-sm md:text-base">{SENIOR_CONTENT.text.paragraph9}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              {evaluationPoints.map((pt, i) => (
                <div key={pt} className="rounded-xl p-4 text-center backdrop-blur-sm border" style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.15)" }} data-testid={`evaluation-${i}`}>
                  <CheckCircle2 className="w-5 h-5 mx-auto mb-2" style={{ color: AMBER_LIGHT }} />
                  <p className="text-white text-xs md:text-sm font-bold leading-tight">{pt}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <a href="/admissions" onClick={() => ctaTrack("evaluation_speak_counsellor")} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full hover:opacity-90 transition-opacity" style={{ background: AMBER, color: "#fff" }} data-testid="button-speak-counsellor">
                {SENIOR_CONTENT.text.cta8} <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* FUTURE PATHWAYS */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>{SENIOR_CONTENT.text.h29}</h2>
              <p className="text-gray-600 mt-3">{SENIOR_CONTENT.text.paragraph10}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {futureCards.map((t, i) => {
                const Icon = t.icon;
                return (
                  <div key={t.title} className="rounded-2xl p-6 bg-gradient-to-br from-white to-[#f8faff] border border-gray-100 shadow-sm hover:shadow-md transition-shadow" data-testid={`card-future-${i}`}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: NAVY }}><Icon className="w-6 h-6 text-white" /></div>
                    <h3 className="font-extrabold text-base mb-2" style={{ color: NAVY }}>{t.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{t.body}</p>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-10">
              <a href="/admissions" onClick={() => ctaTrack("future_enquire")} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }} data-testid="button-future-enquire">
                {SENIOR_CONTENT.text.cta1} <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* HYPERLOCAL */}
        <section className="py-16 md:py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3" style={{ background: "#eef5ff", color: NAVY_MID }}><MapPin className="w-3 h-3" /> {SENIOR_CONTENT.text.label6}</span>
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>{SENIOR_CONTENT.text.h210}</h2>
              <p className="text-gray-600 mt-3 text-sm md:text-base">{SENIOR_CONTENT.text.paragraph11}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {localities.map((loc, i) => (
                <div key={loc} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5" data-testid={`locality-${i}`}>
                  <div className="flex items-center gap-2 mb-3"><MapPin className="w-4 h-4" style={{ color: AMBER }} /><h3 className="font-extrabold text-base" style={{ color: NAVY }}>{SENIOR_CONTENT.text.h31} {loc}</h3></div>
                  <div className="flex flex-wrap gap-1.5">
                    {grades.map((g) => (
                      <a key={g} href="/admissions" onClick={() => ctaTrack(`hyperlocal_${g}_${loc}`.toLowerCase().replace(/\s+/g, "_"))} className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full border hover:opacity-80 transition-opacity" style={{ background: "#f8faff", color: NAVY_MID, borderColor: "#dbe7ff" }}>
                        {g} {SENIOR_CONTENT.text.cta9}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-10">
              <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" onClick={() => { ctaTrack("hyperlocal_directions"); trackDirectionsClick({ sourcePage: "senior_hyperlocal" }); }} className="inline-flex items-center gap-2 font-extrabold text-sm px-5 py-2.5 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: NAVY }} data-testid="button-get-directions">
                <MapPin className="w-4 h-4" /> {SENIOR_CONTENT.text.cta10}
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => { ctaTrack("hyperlocal_transport"); trackWhatsAppClick({ sourcePage: "senior_hyperlocal_transport" }); }} className="inline-flex items-center gap-2 font-extrabold text-sm px-5 py-2.5 rounded-full border-2 hover:opacity-80 transition-opacity" style={{ color: NAVY, borderColor: NAVY }} data-testid="button-check-transport">
                <Bus className="w-4 h-4" /> {SENIOR_CONTENT.text.cta11}
              </a>
              <a href="/admissions" onClick={() => ctaTrack("hyperlocal_enquire")} className="inline-flex items-center gap-2 font-extrabold text-sm px-5 py-2.5 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }} data-testid="button-hyperlocal-enquire">
                {SENIOR_CONTENT.text.cta5} <ArrowRight className="w-4 h-4" />
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
                <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-4" style={{ background: AMBER_LIGHT, color: NAVY }}>{SENIOR_CONTENT.text.label7}</span>
                <h2 className="text-2xl md:text-4xl font-black text-white mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>{SENIOR_CONTENT.text.h211}</h2>
                <p className="text-white/85 max-w-2xl mx-auto mb-7 text-sm md:text-base">{SENIOR_CONTENT.text.paragraph12}</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <a href="/admissions" onClick={() => ctaTrack("final_enquire")} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }} data-testid="button-final-enquire">
                    {SENIOR_CONTENT.text.cta1} <ArrowRight className="w-4 h-4" />
                  </a>
                  <a href="/admissions#campus-visit" onClick={() => ctaTrack("final_campus_visit")} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white border-2 border-white/80 hover:bg-white hover:text-[#091a4f] transition-colors" data-testid="button-final-campus-visit">
                    {SENIOR_CONTENT.text.cta2}
                  </a>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => { ctaTrack("final_whatsapp"); trackWhatsAppClick({ sourcePage: "senior_final" }); }} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }} data-testid="button-final-whatsapp">
                    <MessageCircle className="w-4 h-4" /> {SENIOR_CONTENT.text.cta3}
                  </a>
                  <a href={`tel:${PHONE}`} onClick={() => { ctaTrack("final_call"); trackCallClick({ phone: PHONE, sourcePage: "senior_final" }); }} className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-full text-white border-2 border-white/80 hover:bg-white hover:text-[#091a4f] transition-colors" data-testid="button-final-call">
                    <Phone className="w-4 h-4" /> {SENIOR_CONTENT.text.cta12}
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
              <h2 className="text-2xl md:text-4xl font-black" style={{ color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>{SENIOR_CONTENT.text.h212}</h2>
              <p className="text-gray-600 mt-3">{SENIOR_CONTENT.text.paragraph13}</p>
            </div>
            <div className="space-y-3">
              {FAQS.map((f, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className="rounded-2xl border border-gray-200 bg-white overflow-hidden" data-testid={`faq-${i}`}>
                    <button type="button" onClick={() => { setOpenFaq(isOpen ? null : i); trackEvent("faq_interaction", "senior_faq", `q${i}_${!isOpen ? "open" : "close"}`); }} className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-gray-50 transition-colors" aria-expanded={isOpen}>
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
          <a href={`tel:${PHONE}`} onClick={() => { ctaTrack("sticky_call"); trackCallClick({ phone: PHONE, sourcePage: "senior_sticky" }); }} className="flex flex-col items-center justify-center py-2.5 gap-0.5 hover:bg-gray-50">
            <Phone className="w-4 h-4" style={{ color: NAVY }} /><span className="text-[10px] font-extrabold" style={{ color: NAVY }}>{SENIOR_CONTENT.text.label8}</span>
          </a>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => { ctaTrack("sticky_whatsapp"); trackWhatsAppClick({ sourcePage: "senior_sticky" }); }} className="flex flex-col items-center justify-center py-2.5 gap-0.5 hover:bg-gray-50">
            <MessageCircle className="w-4 h-4" style={{ color: "#25D366" }} /><span className="text-[10px] font-extrabold" style={{ color: NAVY }}>{SENIOR_CONTENT.text.label9}</span>
          </a>
          <a href="/admissions" onClick={() => ctaTrack("sticky_enquire")} className="flex flex-col items-center justify-center py-2.5 gap-0.5 hover:bg-gray-50">
            <ClipboardCheck className="w-4 h-4" style={{ color: AMBER }} /><span className="text-[10px] font-extrabold" style={{ color: NAVY }}>{SENIOR_CONTENT.text.label10}</span>
          </a>
          <a href="/admissions#campus-visit" onClick={() => ctaTrack("sticky_book_visit")} className="flex flex-col items-center justify-center py-2.5 gap-0.5 hover:bg-gray-50">
            <Compass className="w-4 h-4" style={{ color: NAVY_MID }} /><span className="text-[10px] font-extrabold" style={{ color: NAVY }}>{SENIOR_CONTENT.text.label11}</span>
          </a>
        </div>
      </div>
      <div className="h-14 lg:hidden" aria-hidden="true" />
    </div>
  );
}
