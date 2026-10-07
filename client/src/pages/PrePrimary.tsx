import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { ExternalLink } from "lucide-react";
import { WaveOneSeoBlock } from "@/components/WaveOneSeoBlock";
import {
  PRE_PRIMARY_SEO, PRE_PRIMARY_BANNER, PRE_PRIMARY_INTRO, PRE_PRIMARY_IMAGE_ALTS,
  PRE_PRIMARY_CTA, PRE_PRIMARY_CURRICULUM, PRE_PRIMARY_PHILOSOPHY,
  PRE_PRIMARY_METHODOLOGY, PRE_PRIMARY_EVALUATION, PRE_PRIMARY_RPS,
  PRE_PRIMARY_QUICK_ANSWER, PRE_PRIMARY_FAQS, PRE_PRIMARY_QUICK_HEADINGS, PRE_PRIMARY_JSON_LD,
} from "@shared/content/preprimary";

const curriculum = [
  {
    ...PRE_PRIMARY_CURRICULUM.subjects[0],
    emoji: "📖",
    color: "#e0edff",
    accent: "#0d3b86",
  },
  {
    ...PRE_PRIMARY_CURRICULUM.subjects[1],
    emoji: "🔢",
    color: "#fff7e0",
    accent: "#d97706",
  },
  {
    ...PRE_PRIMARY_CURRICULUM.subjects[2],
    emoji: "✏️",
    color: "#e0f7f0",
    accent: "#059669",
  },
  {
    ...PRE_PRIMARY_CURRICULUM.subjects[3],
    emoji: "🌍",
    color: "#f3e0ff",
    accent: "#7c3aed",
  },
];

const philosophy = [
  {
    ...PRE_PRIMARY_PHILOSOPHY.pillars[0],
    color: "#e0edff",
    textColor: "#0d3b86",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="6" width="14" height="14" rx="3" stroke="#0d3b86" strokeWidth="2"/>
        <rect x="22" y="6" width="14" height="14" rx="3" stroke="#0d3b86" strokeWidth="2"/>
        <rect x="4" y="24" width="14" height="10" rx="3" stroke="#0d3b86" strokeWidth="2"/>
        <rect x="22" y="24" width="14" height="10" rx="3" stroke="#0d3b86" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    ...PRE_PRIMARY_PHILOSOPHY.pillars[1],
    color: "#fff3e0",
    textColor: "#b45309",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14" cy="20" r="9" stroke="#b45309" strokeWidth="2"/>
        <circle cx="26" cy="20" r="9" stroke="#b45309" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    ...PRE_PRIMARY_PHILOSOPHY.pillars[2],
    color: "#e0f7f0",
    textColor: "#047857",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="14" r="5" stroke="#047857" strokeWidth="2"/>
        <circle cx="10" cy="30" r="4" stroke="#047857" strokeWidth="2"/>
        <circle cx="30" cy="30" r="4" stroke="#047857" strokeWidth="2"/>
        <line x1="20" y1="19" x2="10" y2="26" stroke="#047857" strokeWidth="2"/>
        <line x1="20" y1="19" x2="30" y2="26" stroke="#047857" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    ...PRE_PRIMARY_PHILOSOPHY.pillars[3],
    color: "#f3e0ff",
    textColor: "#6d28d9",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 28 Q10 10 20 8 Q30 10 32 28 Q28 34 20 34 Q12 34 8 28Z" stroke="#6d28d9" strokeWidth="2"/>
        <line x1="20" y1="34" x2="20" y2="38" stroke="#6d28d9" strokeWidth="2"/>
        <line x1="16" y1="38" x2="24" y2="38" stroke="#6d28d9" strokeWidth="2"/>
      </svg>
    ),
  },
];

const methodology = [
  {
    ...PRE_PRIMARY_METHODOLOGY.activities[0],
    img: "/images/gallery/educational/school-library.jpg",
  },
  {
    ...PRE_PRIMARY_METHODOLOGY.activities[1],
    img: "/images/preschool/nursery-kids.jpg",
  },
  {
    ...PRE_PRIMARY_METHODOLOGY.activities[2],
    img: "/images/gallery/talent/multipurpose-hall.jpg",
  },
  {
    ...PRE_PRIMARY_METHODOLOGY.activities[3],
    img: "/images/gallery/talent/music-room.jpg",
  },
];

export default function PrePrimary() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title={PRE_PRIMARY_SEO.title}
        appendSiteName={false}
        description={PRE_PRIMARY_SEO.description}
        keywords={PRE_PRIMARY_SEO.keywords}
        canonical={PRE_PRIMARY_SEO.canonical}
        ogImage="/images/preschool/hero.jpg"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: PRE_PRIMARY_BANNER.breadcrumb, href: PRE_PRIMARY_SEO.canonical },
        ]}
        jsonLd={PRE_PRIMARY_JSON_LD}
      />
      <Navbar />
      <PageBanner
        title={PRE_PRIMARY_BANNER.title}
        subtitle={PRE_PRIMARY_BANNER.subtitle}
        breadcrumb={[{ label: PRE_PRIMARY_BANNER.breadcrumb }]}
        bgImage="/images/preschool/hero.jpg"
      />

      <main className="flex-grow">

        {/* ── Intro + Curriculum sidebar ───────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

              {/* Left — intro text */}
              <div className="lg:col-span-2 space-y-5">
                <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full" style={{ background: "#eef5ff", color: "#0d3b86" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {PRE_PRIMARY_INTRO.label}
                </span>
                <h2 className="text-3xl font-black" style={{ color: "#0d3b86", fontFamily: "'DM Sans', sans-serif" }}>{PRE_PRIMARY_INTRO.heading}</h2>
                <p className="text-base text-gray-500 font-semibold -mt-3">{PRE_PRIMARY_INTRO.classes}</p>
                <p className="text-gray-600 leading-relaxed">
                  {PRE_PRIMARY_INTRO.paragraphs[0]}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {PRE_PRIMARY_INTRO.paragraphs[1].split(PRE_PRIMARY_INTRO.emphasis)[0]}<strong>{PRE_PRIMARY_INTRO.emphasis}</strong>{PRE_PRIMARY_INTRO.paragraphs[1].split(PRE_PRIMARY_INTRO.emphasis)[1]}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {PRE_PRIMARY_INTRO.paragraphs[2]}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {PRE_PRIMARY_INTRO.paragraphs[3]}
                </p>

                {/* Photo */}
                <img
                  src="/images/students/pre-primary-running.jpg"
                  alt={PRE_PRIMARY_IMAGE_ALTS.running}
                  className="rounded-3xl w-full object-cover max-h-72 mt-4"
                  width={800}
                  height={400}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <img
                  src="/images/students/preprimary-classroom.webp"
                  alt={PRE_PRIMARY_IMAGE_ALTS.classroom}
                  className="rounded-3xl w-full object-cover max-h-72 mt-4"
                  width={800}
                  height={533}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>

              {/* Right — admission CTA + curriculum card */}
              <div className="space-y-6">
                {/* Admission banner */}
                <div className="rounded-3xl border-2 border-amber-400 p-6 text-center" style={{ background: "#fffbeb" }}>
                  <p className="text-sm font-black uppercase tracking-wide mb-3" style={{ color: "#b45309" }}>
                    {PRE_PRIMARY_CTA.title}
                  </p>
                  <a
                    href={PRE_PRIMARY_CTA.href}
                    className="inline-block font-bold py-2.5 px-7 rounded-full text-white transition-opacity hover:opacity-90"
                    style={{ background: "#f97316" }}
                  >
                    {PRE_PRIMARY_CTA.label}
                  </a>
                </div>

                {/* Curriculum card */}
                <div className="rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4" style={{ background: "#0d3b86" }}>
                    <h3 className="text-white font-black text-lg">{PRE_PRIMARY_CURRICULUM.heading}</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {curriculum.map((c, i) => (
                      <div key={i} className="flex items-start gap-3 px-5 py-4 bg-white">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl" style={{ background: c.color }}>
                          {c.emoji}
                        </div>
                        <div>
                          <p className="font-black text-sm" style={{ color: c.accent }}>{c.subject}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{c.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Curriculum Philosophy ─────────────────────────────── */}
        <section className="py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-black text-center mb-12" style={{ color: "#0d3b86", fontFamily: "'DM Sans', sans-serif" }}>{PRE_PRIMARY_PHILOSOPHY.heading}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {philosophy.map((p, i) => (
                <div
                  key={i}
                  className="rounded-3xl p-6 flex flex-col gap-4 border border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow"
                >
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

        {/* ── Kindergarten Methodology ──────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-black text-center mb-12" style={{ color: "#0d3b86", fontFamily: "'DM Sans', sans-serif" }}>{PRE_PRIMARY_METHODOLOGY.heading}</h2>

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
                    <h3 className="font-black text-base" style={{ color: "#0d3b86" }}>{m.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Evaluation Strategy */}
            <div className="max-w-lg mx-auto rounded-3xl border-2 border-amber-300 p-8 text-center" style={{ background: "#fffbeb" }}>
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#fef3c7" }}>
                <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="10" width="10" height="10" rx="2" stroke="#d97706" strokeWidth="2"/>
                  <rect x="20" y="18" width="10" height="10" rx="2" stroke="#d97706" strokeWidth="2"/>
                  <rect x="6" y="24" width="10" height="10" rx="2" stroke="#d97706" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="font-black text-xl mb-1" style={{ color: "#92400e" }}>{PRE_PRIMARY_EVALUATION.heading}</h3>
              <p className="text-sm font-bold mb-3" style={{ color: "#b45309" }}>{PRE_PRIMARY_EVALUATION.subheading}</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {PRE_PRIMARY_EVALUATION.paragraphs[0]}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {PRE_PRIMARY_EVALUATION.paragraphs[1]}
              </p>
            </div>
          </div>
        </section>

        {/* ── Rainbow Preschool International ───────────────────── */}
        <section className="py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

              {/* Main content */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#0d3b86" }}>{PRE_PRIMARY_RPS.eyebrow}</p>
                  <h2 className="text-3xl font-black mb-4" style={{ color: "#0d3b86", fontFamily: "'DM Sans', sans-serif" }}>
                    {PRE_PRIMARY_RPS.headingLead}
                    <a href={PRE_PRIMARY_RPS.homeHref} target="_blank" rel="noopener noreferrer"
                      className="underline underline-offset-4 hover:opacity-80 transition-opacity" style={{ color: "#f97316" }}>
                      {PRE_PRIMARY_RPS.headingLink}
                    </a>
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {PRE_PRIMARY_RPS.paragraphs[0].before}
                    <a href={PRE_PRIMARY_RPS.paragraphs[0].href} target="_blank" rel="noopener noreferrer"
                      className="font-semibold text-orange-500 hover:underline">{PRE_PRIMARY_RPS.paragraphs[0].link}</a>{PRE_PRIMARY_RPS.paragraphs[0].after}
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {PRE_PRIMARY_RPS.paragraphs[1].before}
                    <a href={PRE_PRIMARY_RPS.paragraphs[1].href} target="_blank" rel="noopener noreferrer"
                      className="font-semibold text-orange-500 hover:underline">{PRE_PRIMARY_RPS.paragraphs[1].link}</a>{PRE_PRIMARY_RPS.paragraphs[1].after}
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {PRE_PRIMARY_RPS.paragraphs[2].before}
                    <a href={PRE_PRIMARY_RPS.paragraphs[2].href} target="_blank" rel="noopener noreferrer"
                      className="font-semibold text-orange-500 hover:underline">{PRE_PRIMARY_RPS.paragraphs[2].link}</a>{PRE_PRIMARY_RPS.paragraphs[2].after}
                  </p>
                </div>

                {/* Transition pathway — pyramid */}
                <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-7">
                  <h3 className="font-black text-lg mb-6" style={{ color: "#0d3b86" }}>{PRE_PRIMARY_RPS.pathwayHeading}</h3>
                  <div className="grid grid-cols-3 gap-3 sm:gap-0 sm:flex sm:items-end relative">
                    <a
                      href={PRE_PRIMARY_RPS.pathway[0].href}
                      target="_blank" rel="noopener noreferrer"
                      className="rounded-2xl text-center hover:opacity-90 transition-opacity relative"
                      style={{
                        padding: "14px 10px 16px",
                        background: "#fff7e0",
                        zIndex: 1,
                      }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#b4530999" }}>{PRE_PRIMARY_RPS.pathway[0].step}</p>
                      <p className="font-black text-sm leading-tight" style={{ color: "#b45309" }}>{PRE_PRIMARY_RPS.pathway[0].title}</p>
                      <p className="text-[10px] mt-1.5 leading-snug" style={{ color: "#b45309bb" }}>{PRE_PRIMARY_RPS.pathway[0].school}</p>
                    </a>

                    <a
                      href={PRE_PRIMARY_RPS.pathway[1].href}
                      target="_blank" rel="noopener noreferrer"
                      className="rounded-2xl text-center hover:opacity-90 transition-opacity relative"
                      style={{
                        padding: "20px 10px 22px",
                        background: "#e0f7f0",
                        zIndex: 2,
                      }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#04785799" }}>{PRE_PRIMARY_RPS.pathway[1].step}</p>
                      <p className="font-black text-sm sm:text-base leading-tight" style={{ color: "#047857" }}>{PRE_PRIMARY_RPS.pathway[1].title}</p>
                      <p className="text-[10px] mt-1.5 leading-snug" style={{ color: "#047857bb" }}>{PRE_PRIMARY_RPS.pathway[1].school}</p>
                    </a>

                    <a
                      href={PRE_PRIMARY_RPS.pathway[2].href}
                      className="rounded-2xl text-center hover:opacity-90 transition-opacity relative"
                      style={{
                        padding: "28px 10px 30px",
                        background: "#e0edff",
                        zIndex: 3,
                        boxShadow: "0 4px 16px rgba(13,59,134,0.12)",
                      }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#0d3b8699" }}>{PRE_PRIMARY_RPS.pathway[2].step}</p>
                      <p className="font-black text-sm sm:text-lg leading-tight" style={{ color: "#0d3b86" }}>{PRE_PRIMARY_RPS.pathway[2].title}</p>
                      <p className="text-[11px] mt-1.5 leading-snug" style={{ color: "#0d3b86bb" }}>{PRE_PRIMARY_RPS.pathway[2].school}</p>
                    </a>
                  </div>
                </div>

                {/* What makes RPS special */}
                <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-7">
                  <h3 className="font-black text-lg mb-5" style={{ color: "#0d3b86" }}>{PRE_PRIMARY_RPS.featuresHeading}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {PRE_PRIMARY_RPS.features.map((f, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#f97316" }} />
                        <div>
                          <p className="font-black text-sm text-gray-800">{f.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-5">

                {/* Visit RPS CTA */}
                <div className="rounded-3xl p-6 text-center" style={{ background: "#fff7ed", border: "2px solid #fed7aa" }}>
                  <div className="w-20 h-20 rounded-2xl mx-auto mb-4 overflow-hidden flex items-center justify-center bg-white shadow-sm">
                    <img src="/rps-logo.png" alt={PRE_PRIMARY_RPS.school} className="w-full h-full object-contain" width={80} height={80} loading="lazy" decoding="async" />
                  </div>
                  <p className="font-black text-base mb-1" style={{ color: "#b45309" }}>{PRE_PRIMARY_RPS.school}</p>
                  <p className="text-xs text-gray-500 mb-4">{PRE_PRIMARY_RPS.tagline}</p>
                  <a href={PRE_PRIMARY_RPS.visitHref} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-bold py-2.5 px-6 rounded-full text-white transition-opacity hover:opacity-90"
                    style={{ background: "#f97316" }}
                    data-testid="link-rps-main">
                    <ExternalLink size={14} />
                    {PRE_PRIMARY_RPS.visitLabel}
                  </a>
                </div>

                {/* RPS Branches */}
                <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6">
                  <h4 className="font-black text-sm uppercase tracking-wider mb-4 pb-3 border-b border-gray-100 text-gray-800">{PRE_PRIMARY_RPS.branchesHeading}</h4>
                  <ul className="space-y-2.5">
                    {PRE_PRIMARY_RPS.branches.map((b, i) => (
                      <li key={i}>
                        <a href={b.href} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-500 transition-colors group"
                          data-testid={`link-rps-branch-${i}`}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-orange-300 group-hover:bg-orange-500 transition-colors" />
                          {b.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* RPS Quick Links */}
                <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6">
                  <h4 className="font-black text-sm uppercase tracking-wider mb-4 pb-3 border-b border-gray-100 text-gray-800">{PRE_PRIMARY_RPS.exploreHeading}</h4>
                  <ul className="space-y-2.5">
                    {PRE_PRIMARY_RPS.explore.map((l, i) => (
                      <li key={i}>
                        <a href={l.href} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-500 transition-colors group"
                          data-testid={`link-rps-explore-${i}`}>
                          <ExternalLink size={11} className="flex-shrink-0 text-gray-300 group-hover:text-orange-400 transition-colors" />
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ── Admissions CTA strip ──────────────────────────────── */}
        <div className="py-14 text-center" style={{ background: "#091a4f" }}>
          <p className="text-white font-bold text-lg mb-4">{PRE_PRIMARY_CTA.title}</p>
          <a href={PRE_PRIMARY_CTA.href} className="inline-block text-white font-bold py-3 px-8 rounded-full border-2 border-amber-400 hover:bg-amber-400 hover:text-gray-900 transition-colors">
            {PRE_PRIMARY_CTA.label}
          </a>
        </div>

        {/* ── Contact Form ──────────────────────────────────────── */}
        <ContactForm />
        <WaveOneSeoBlock pageId="pre-primary" quickAnswer={PRE_PRIMARY_QUICK_ANSWER} quickAnswerHeading={PRE_PRIMARY_QUICK_HEADINGS.title} faqs={PRE_PRIMARY_FAQS} faqHeading={PRE_PRIMARY_QUICK_HEADINGS.faqTitle} />
      </main>
      <Footer />
    </div>
  );
}
