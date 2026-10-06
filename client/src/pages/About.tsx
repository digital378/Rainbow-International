import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { CheckCircle2, Target, Eye, BookOpen, Heart, Star, Users } from "lucide-react";
import { Fragment } from "react";
import {
  ABOUT_SEO, ABOUT_BANNER, ABOUT_WELCOME, ABOUT_IMAGE_ALTS, ABOUT_LEARNING,
  ABOUT_STATS, ABOUT_CHAIRPERSON, ABOUT_PURPOSE, ABOUT_PHILOSOPHY, ABOUT_JSON_LD,
  type AboutTextPart,
} from "@shared/content/about";

const academicSpaces = ABOUT_LEARNING.academic;
const sportsSpaces = ABOUT_LEARNING.sports;
const stats = ABOUT_STATS.items;
const philosophyPillars = [BookOpen, Heart, Star, Users].map((icon, i) => ({
  ...ABOUT_PHILOSOPHY.pillars[i],
  icon,
}));
const missionPoints = ABOUT_PURPOSE.mission;

function AboutText({ parts }: { parts: AboutTextPart[] }) {
  return parts.map((part, i) => part.href
    ? <a key={i} href={part.href} className="text-[#0d3b86] font-semibold hover:underline">{part.text}</a>
    : part.strong ? <strong key={i}>{part.text}</strong>
    : <Fragment key={i}>{part.text}</Fragment>);
}

export default function About() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title={ABOUT_SEO.title}
        description={ABOUT_SEO.description}
        keywords={ABOUT_SEO.keywords}
        appendSiteName={false}
        canonical="https://rainbowinternationalschool.in/about-rainbow-international-school"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: ABOUT_SEO.crumb, href: "https://rainbowinternationalschool.in/about-rainbow-international-school" },
        ]}
        jsonLd={ABOUT_JSON_LD}
      />
      <ScrollProgress />
      <Navbar />
      <PageBanner
        title={ABOUT_BANNER.title}
        subtitle={ABOUT_BANNER.subtitle}
        breadcrumb={[{ label: ABOUT_SEO.crumb }]}
        bgImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Infrastructure-3-1024x536-1.jpg"
      />

      <main className="flex-grow">

        {/* ── Welcome to RIS ─────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-6" style={{ background: "#eef5ff", color: "#0d3b86" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {ABOUT_WELCOME.eyebrow}
              </span>
              <h2 className="text-3xl md:text-4xl font-black mb-6" style={{ color: "#0d3b86" }}>
                {ABOUT_WELCOME.heading}
              </h2>
              <div className="space-y-4 text-gray-600 text-[15px] leading-[1.8]">
                {ABOUT_WELCOME.paragraphs.map((parts, i) => (
                  <p key={i}><AboutText parts={parts} /></p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Campus images */}
        <section className="py-16" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <img
                src="/images/extra/campus/school-front.jpg"
                alt={ABOUT_IMAGE_ALTS[0]}
                className="rounded-3xl shadow-sm w-full object-cover"
                width={800}
                height={533}
                loading="lazy"
                decoding="async"
              />
              <img
                src="/images/extra/campus/school-building.jpg"
                alt={ABOUT_IMAGE_ALTS[1]}
                className="rounded-3xl shadow-sm w-full object-cover"
                width={800}
                height={533}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-6">
              <img
                src="/images/extra/classroom/science-lab.jpg"
                alt={ABOUT_IMAGE_ALTS[2]}
                className="rounded-2xl shadow-sm w-full object-cover aspect-[4/3]"
                width={400} height={300} loading="lazy" decoding="async"
              />
              <img
                src="/images/extra/classroom/students-turf.jpg"
                alt={ABOUT_IMAGE_ALTS[3]}
                className="rounded-2xl shadow-sm w-full object-cover aspect-[4/3]"
                width={400} height={300} loading="lazy" decoding="async"
              />
              <img
                src="/images/extra/campus/swimming-pool.jpg"
                alt={ABOUT_IMAGE_ALTS[4]}
                className="rounded-2xl shadow-sm w-full object-cover aspect-[4/3]"
                width={400} height={300} loading="lazy" decoding="async"
              />
              <img
                src="/images/extra/campus/monument.jpg"
                alt={ABOUT_IMAGE_ALTS[5]}
                className="rounded-2xl shadow-sm w-full object-cover aspect-[4/3]"
                width={400} height={300} loading="lazy" decoding="async"
              />
            </div>
          </div>
        </section>

        {/* Learning Spaces */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-black text-gray-900 text-center mb-12">{ABOUT_LEARNING.heading}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm">
                <h3 className="font-black text-xl mb-5" style={{ color: "#0d3b86" }}>{ABOUT_LEARNING.academicHeading}</h3>
                <ul className="space-y-2.5">
                  {academicSpaces.map((s, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-gray-600 text-sm">
                      <CheckCircle2 size={14} className="flex-shrink-0" style={{ color: "#0d3b86" }} />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm">
                <h3 className="font-black text-xl mb-5" style={{ color: "#10b981" }}>{ABOUT_LEARNING.sportsHeading}</h3>
                <ul className="space-y-2.5">
                  {sportsSpaces.map((s, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-gray-600 text-sm">
                      <CheckCircle2 size={14} className="flex-shrink-0" style={{ color: "#10b981" }} />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Rainbow at a Glance */}
        <section className="py-20" style={{ background: "#091a4f" }}>
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-black text-white mb-12">{ABOUT_STATS.heading}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((s, i) => (
                <div key={i} className="bg-white/10 rounded-3xl p-6 border border-white/10">
                  <div className="text-3xl font-black mb-2" style={{ color: "#fbbf24" }}>{s.num}</div>
                  <div className="text-white/70 text-sm">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Chairperson's Note ────────────────────────────────── */}
        <section id="chairpersons-note" className="py-20 bg-white scroll-mt-32">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-14">
                <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-5" style={{ background: "#eef5ff", color: "#0d3b86" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {ABOUT_CHAIRPERSON.eyebrow}
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900">{ABOUT_CHAIRPERSON.heading}</h2>
              </div>

              <div className="flex flex-col lg:flex-row gap-12 items-start">
                <div className="flex-shrink-0 flex flex-col items-center gap-4">
                  <div
                    className="w-52 h-64 rounded-3xl overflow-hidden shadow-xl border-4 border-white flex items-center justify-center"
                    style={{ boxShadow: "0 20px 60px -10px rgba(13,59,134,0.25)", background: "#f1f5f9" }}
                  >
                  </div>
                  <div className="text-center">
                    <p className="font-black text-gray-900 text-base">{ABOUT_CHAIRPERSON.role}</p>
                    <p className="text-sm text-gray-500">{ABOUT_CHAIRPERSON.school}</p>
                  </div>
                </div>

                <div className="flex-1">
                  <div
                    className="rounded-3xl p-8 md:p-10 relative"
                    style={{ background: "#f8faff", border: "1.5px solid #dbeafe" }}
                  >
                    <span className="absolute -top-5 left-8 text-7xl leading-none font-serif" style={{ color: "#0d3b86", opacity: 0.15 }}>{ABOUT_CHAIRPERSON.quoteMark}</span>
                    <div className="space-y-5 text-gray-600 text-[15px] leading-[1.9] relative">
                      {ABOUT_CHAIRPERSON.paragraphs.map((parts, i) => (
                        <p key={i}><AboutText parts={parts} /></p>
                      ))}
                      <p className="font-bold text-gray-800">
                        {ABOUT_CHAIRPERSON.signoff}<br />
                        <span style={{ color: "#0d3b86" }}>{ABOUT_CHAIRPERSON.name}</span><br />
                        <span style={{ color: "#0d3b86" }}>{ABOUT_CHAIRPERSON.role}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── RIS Vision & Mission ──────────────────────────────── */}
        <section id="vision-mission" className="py-20 scroll-mt-32" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-5" style={{ background: "#eef5ff", color: "#0d3b86" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {ABOUT_PURPOSE.eyebrow}
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">{ABOUT_PURPOSE.heading}</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-14">
              {/* Vision */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: "#eef5ff" }}
                >
                  <Eye size={26} style={{ color: "#0d3b86" }} />
                </div>
                <h3 className="text-2xl font-black mb-4" style={{ color: "#0d3b86" }}>{ABOUT_PURPOSE.visionHeading}</h3>
                <p className="text-gray-600 text-[15px] leading-[1.8]">
                  <AboutText parts={ABOUT_PURPOSE.vision} />
                </p>
                <div
                  className="absolute bottom-0 right-0 w-24 h-24 rounded-tl-[40px] opacity-[0.06]"
                  style={{ background: "#0d3b86" }}
                />
              </div>

              {/* Mission */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: "#fff7ed" }}
                >
                  <Target size={26} style={{ color: "#f97316" }} />
                </div>
                <h3 className="text-2xl font-black mb-4" style={{ color: "#0d3b86" }}>{ABOUT_PURPOSE.missionHeading}</h3>
                <ul className="space-y-3">
                  {missionPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-gray-600 text-[14px] leading-[1.7]">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-black text-white"
                        style={{ background: "#0d3b86" }}
                      >
                        {i + 1}
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
                <div
                  className="absolute bottom-0 right-0 w-24 h-24 rounded-tl-[40px] opacity-[0.04]"
                  style={{ background: "#f97316" }}
                />
              </div>
            </div>

            {/* Core Values strip */}
            <div className="max-w-5xl mx-auto">
              <p className="text-center text-sm font-bold tracking-widest uppercase text-gray-400 mb-6">{ABOUT_PURPOSE.valuesHeading}</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {ABOUT_PURPOSE.values.map((v, i) => (
                  <span
                    key={i}
                    className="px-5 py-2.5 rounded-full text-sm font-bold"
                    style={{ background: "#eef5ff", color: "#0d3b86", border: "1.5px solid #c7dbf8" }}
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Our Philosophy ────────────────────────────────────── */}
        <section id="our-philosophy" className="py-20 bg-white scroll-mt-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-5" style={{ background: "#eef5ff", color: "#0d3b86" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {ABOUT_PHILOSOPHY.eyebrow}
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">{ABOUT_PHILOSOPHY.heading}</h2>
              <p className="text-gray-500 text-lg mt-4 max-w-2xl mx-auto">
                {ABOUT_PHILOSOPHY.intro}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-14">
              {philosophyPillars.map((pillar, i) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={i}
                    className="rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 bg-white"
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: "#eef5ff" }}
                    >
                      <Icon size={22} style={{ color: "#0d3b86" }} />
                    </div>
                    <h3 className="font-black text-gray-900 text-lg mb-3">{pillar.title}</h3>
                    <p className="text-gray-500 text-sm leading-[1.75]">{pillar.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Philosophy quote banner */}
            <div
              className="max-w-4xl mx-auto rounded-3xl px-10 py-12 text-center"
              style={{ background: "linear-gradient(135deg, #0a2763 0%, #0d3b86 100%)" }}
            >
              <p className="text-white/90 text-lg md:text-xl leading-[1.8] font-light italic mb-5">
                {ABOUT_PHILOSOPHY.quoteBefore}<strong className="font-black text-white not-italic">{ABOUT_PHILOSOPHY.quoteStrong}</strong>{ABOUT_PHILOSOPHY.quoteAfter}
              </p>
              <p className="text-white/60 text-sm tracking-widest uppercase font-semibold">{ABOUT_PHILOSOPHY.attribution}</p>
            </div>
          </div>
        </section>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
