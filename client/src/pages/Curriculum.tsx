import { Fragment } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { ExternalLink } from "lucide-react";
import {
  CURRICULUM_ASSESSMENT,
  CURRICULUM_BANNER,
  CURRICULUM_CTA,
  CURRICULUM_FRAMEWORK,
  CURRICULUM_HIGHLIGHT,
  CURRICULUM_IMAGE_ALT,
  CURRICULUM_JSON_LD,
  CURRICULUM_LINKS,
  CURRICULUM_METHODOLOGY,
  CURRICULUM_PILLARS,
  CURRICULUM_REFERENCE,
  CURRICULUM_SEO,
  CURRICULUM_STAGE_SECTION,
  CURRICULUM_STAGES,
  type CurriculumStage,
} from "@shared/content/curriculum";

const stageStyles = [
  { color: "#fef3c7", accent: "#b45309" },
  { color: "#e0edff", accent: "#0d3b86" },
  { color: "#e0f7f0", accent: "#047857" },
  { color: "#fdf2f8", accent: "#be185d" },
  { color: "#f3e0ff", accent: "#6d28d9" },
];

const pillarStyles = [
  { color: "#e0edff", accent: "#0d3b86" },
  { color: "#fff7e0", accent: "#d97706" },
  { color: "#e0f7f0", accent: "#047857" },
  { color: "#f3e0ff", accent: "#6d28d9" },
];

// ── Stage card ───────────────────────────────────────────────────
function StageCard({ s, i }: { s: CurriculumStage; i: number }) {
  const theme = stageStyles[i];
  return (
    <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-white" data-testid={`stage-${i}`}>
      {/* Header */}
      <div className="px-7 py-5 flex items-center gap-4" style={{ background: theme.color }}>
        <div>
          <h3 className="font-black text-xl" style={{ color: theme.accent }}>{s.label}</h3>
          <p className="text-sm font-semibold mt-0.5" style={{ color: theme.accent + "bb" }}>{s.grades}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs font-semibold italic" style={{ color: theme.accent + "cc" }}>{s.tagline}</p>
        </div>
      </div>

      <div className="p-7 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Focus areas */}
        <div>
          <p className="font-black text-sm mb-3" style={{ color: theme.accent }}>{CURRICULUM_STAGE_SECTION.focusLabel}</p>
          <ul className="space-y-2">
            {s.focus.map((f, j) => (
              <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ background: theme.accent }} />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Subjects / Streams */}
        <div>
          {s.streams ? (
            <>
              <p className="font-black text-sm mb-3" style={{ color: theme.accent }}>{CURRICULUM_STAGE_SECTION.streamsLabel}</p>
              <div className="space-y-4">
                {s.streams.map((stream, si) => (
                  <div key={si}>
                    <p className="font-black text-xs mb-1.5" style={{ color: theme.accent }}>{stream.name}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {stream.subjects.map((sub, sj) => (
                        <span key={sj} className="text-[11px] px-2.5 py-1 rounded-full font-semibold" style={{ background: theme.color, color: theme.accent }}>
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {s.streamNote && <p className="text-xs text-gray-500 leading-relaxed">{s.streamNote}</p>}
            </>
          ) : (
            <>
              <p className="font-black text-sm mb-3" style={{ color: theme.accent }}>{CURRICULUM_STAGE_SECTION.subjectsLabel}</p>
              <div className="flex flex-wrap gap-2">
                {s.subjects?.map((sub, j) => (
                  <span key={j} className="text-[11px] px-2.5 py-1 rounded-full font-semibold" style={{ background: theme.color, color: theme.accent }}>
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
        title={CURRICULUM_SEO.title}
        description={CURRICULUM_SEO.description}
        keywords={CURRICULUM_SEO.keywords}
        canonical={CURRICULUM_SEO.canonical}
        appendSiteName={false}
        ogImage="/images/home/academic/primary-section.jpg"
        breadcrumbs={[
          { name: CURRICULUM_SEO.homeCrumb, href: CURRICULUM_SEO.homeUrl },
          { name: CURRICULUM_SEO.crumb, href: CURRICULUM_SEO.canonical },
        ]}
        jsonLd={CURRICULUM_JSON_LD}
      />
      <Navbar />
      <PageBanner
        title={CURRICULUM_BANNER.title}
        subtitle={CURRICULUM_BANNER.subtitle}
        breadcrumb={[{ label: CURRICULUM_SEO.crumb }]}
        bgImage="/images/home/academic/primary-section.jpg"
      />

      <main className="flex-grow">

        {/* ── Intro ─────────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-black mb-5" style={{ color: "#0d3b86" }}>{CURRICULUM_FRAMEWORK.heading}</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {CURRICULUM_FRAMEWORK.introBeforeBold}<strong>{CURRICULUM_FRAMEWORK.introBold}</strong>{CURRICULUM_FRAMEWORK.introAfterBold}
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {CURRICULUM_FRAMEWORK.paragraphs[0]}
                </p>
                <p className="text-gray-600 leading-relaxed mb-8">
                  {CURRICULUM_FRAMEWORK.paragraphs[1]}
                </p>
                <p className="text-gray-600 leading-relaxed mb-8">
                  {CURRICULUM_FRAMEWORK.stageLinksLead}
                  {CURRICULUM_LINKS.stages.map((link, i) => (
                    <Fragment key={link.href}>
                      {i > 0 && (i === CURRICULUM_LINKS.stages.length - 1 ? " and " : ", ")}
                      <a href={link.href} className="text-[#0d3b86] font-semibold hover:underline">{link.label}</a>
                    </Fragment>
                  ))}
                  .
                </p>
                <a
                  href={CURRICULUM_LINKS.cbse}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-bold py-3 px-7 rounded-full text-white transition-opacity hover:opacity-90"
                  style={{ background: "#0d3b86" }}
                  data-testid="link-cbse-curriculum"
                >
                  <ExternalLink size={16} />
                  {CURRICULUM_FRAMEWORK.cbseLinkLabel}
                </a>
              </div>
              <div className="rounded-3xl overflow-hidden shadow-sm">
                <img
                  src="/images/home/academic/primary-3.jpg"
                  alt={CURRICULUM_IMAGE_ALT}
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
              <p className="text-white font-black text-xl mb-1">{CURRICULUM_HIGHLIGHT.title}</p>
              <p className="text-white/70 text-sm">{CURRICULUM_HIGHLIGHT.description}</p>
            </div>
            <a
              href={CURRICULUM_LINKS.cbse}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-2 font-bold py-3 px-7 rounded-full border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-gray-900 transition-colors"
              data-testid="link-cbse-curriculum-banner"
            >
              <ExternalLink size={15} />
              {CURRICULUM_HIGHLIGHT.linkLabel}
            </a>
          </div>
        </section>

        {/* ── 4 Pillars ─────────────────────────────────────────── */}
        <section className="py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-black text-center mb-3" style={{ color: "#0d3b86" }}>{CURRICULUM_PILLARS.heading}</h2>
            <p className="text-center text-gray-500 text-sm mb-10">{CURRICULUM_PILLARS.subtitle}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {CURRICULUM_PILLARS.items.map((p, i) => (
                <div key={i} className="rounded-3xl p-6 bg-white border border-gray-100 shadow-sm flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: pillarStyles[i].color }}>
                    <div className="w-4 h-4 rounded-full" style={{ background: pillarStyles[i].accent }} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm mb-2" style={{ color: pillarStyles[i].accent }}>{p.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stage-wise Curriculum ──────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-black text-center mb-3" style={{ color: "#0d3b86" }}>{CURRICULUM_STAGE_SECTION.heading}</h2>
            <p className="text-center text-gray-500 text-sm mb-10">{CURRICULUM_STAGE_SECTION.subtitle}</p>
            <div className="space-y-6">
              {CURRICULUM_STAGES.map((s, i) => <StageCard key={i} s={s} i={i} />)}
            </div>
          </div>
        </section>

        {/* ── Assessment Framework ──────────────────────────────── */}
        <section className="py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-black text-center mb-3" style={{ color: "#0d3b86" }}>{CURRICULUM_ASSESSMENT.heading}</h2>
            <p className="text-center text-gray-500 text-sm mb-10">{CURRICULUM_ASSESSMENT.subtitle}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {CURRICULUM_ASSESSMENT.items.map((a, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-black text-base mb-2" style={{ color: "#0d3b86" }}>{a.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{a.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Teaching Methodology ──────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-black text-center mb-3" style={{ color: "#0d3b86" }}>{CURRICULUM_METHODOLOGY.heading}</h2>
            <p className="text-center text-gray-500 text-sm mb-10">{CURRICULUM_METHODOLOGY.subtitle}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {CURRICULUM_METHODOLOGY.items.map((m, i) => (
                <div key={i} className="rounded-3xl p-6 border border-gray-100 shadow-sm bg-white flex gap-4">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#e0edff" }}>
                    <div className="w-3 h-3 rounded-full" style={{ background: "#0d3b86" }} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm mb-1" style={{ color: "#0d3b86" }}>{m.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{m.description}</p>
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
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#0d3b86" }}>{CURRICULUM_REFERENCE.eyebrow}</p>
                <h3 className="text-2xl font-black mb-3" style={{ color: "#0d3b86" }}>{CURRICULUM_REFERENCE.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-2">
                  {CURRICULUM_REFERENCE.description}
                </p>
                <p className="text-xs text-gray-400 break-all">{CURRICULUM_LINKS.cbse}</p>
              </div>
              <a
                href={CURRICULUM_LINKS.cbse}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 inline-flex items-center gap-2 text-white font-bold py-4 px-8 rounded-full transition-opacity hover:opacity-90"
                style={{ background: "#0d3b86" }}
                data-testid="link-cbse-full"
              >
                <ExternalLink size={16} />
                {CURRICULUM_REFERENCE.linkLabel}
              </a>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <div className="py-14 text-center" style={{ background: "#091a4f" }}>
          <p className="text-white font-bold text-lg mb-4">{CURRICULUM_CTA.title}</p>
          <a href="#contact" className="inline-block text-white font-bold py-3 px-8 rounded-full border-2 border-amber-400 hover:bg-amber-400 hover:text-gray-900 transition-colors">
            {CURRICULUM_CTA.linkLabel}
          </a>
        </div>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
