import { HOME_HERO, HOME_SEATS } from "@shared/content/home";
import { useState, lazy, Suspense } from "react";
import { Link } from "wouter";
import { ChevronRight, X, CalendarCheck } from "lucide-react";
import { trackCallClick } from "@/lib/analytics";

const HeroForm = lazy(() => import("./HeroForm").then(m => ({ default: m.HeroForm })));



const quickLinks = HOME_HERO.quickLinks;

export function Hero() {
  const [showSeats, setShowSeats] = useState(false);

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden mb-[-2px]">
      <picture>
        <source type="image/webp" media="(max-width: 768px)" srcSet="/images/students/hero-senior-secondary-mobile.webp" />
        <source srcSet="/images/students/hero-senior-secondary.webp" type="image/webp" />
        <img
          src="/images/students/hero-senior-secondary.jpg"
          alt="Rainbow International School CBSE Thane — senior secondary students"
          width={1620} height={1080}
          loading="eager" decoding="async" fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover object-top"
          style={{ zIndex: 0 }}
        />
      </picture>
      <div className="absolute inset-0" style={{ zIndex: 1, background: "linear-gradient(135deg, rgba(9,26,79,0.92) 0%, rgba(13,59,134,0.82) 50%, rgba(9,26,79,0.75) 100%)" }} />
      <div className="absolute bottom-0 left-0 right-0 h-40" style={{ zIndex: 1, background: "linear-gradient(to bottom, transparent 0%, rgba(9,26,79,0.7) 40%, #091a4f 100%)" }} />

      <div className="relative container mx-auto px-4 lg:px-8 pt-48 pb-16 lg:pt-44 lg:pb-16" style={{ zIndex: 2 }}>
        <div className="flex flex-col lg:flex-row gap-10 xl:gap-16 items-center">

          {/* Left — copy */}
          <div className="flex-1">
            <button
              onClick={() => setShowSeats(true)}
              data-testid="button-check-seats"
              className="group inline-flex items-center gap-2.5 mb-6 px-5 py-2.5 rounded-full cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(251,191,36,0.1) 100%)", border: "1.5px solid rgba(251,191,36,0.5)" }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
              </span>
              <span className="text-amber-300 text-[11px] font-semibold tracking-[0.14em] uppercase">{HOME_HERO.badge}</span>
              <ChevronRight size={14} className="text-amber-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold leading-[1.08] text-white mb-4 tracking-tight">
              {HOME_HERO.titleLines[0]}{" "}<br />
              <span className="text-amber-400">{HOME_HERO.titleLines[1]}</span>{" "}<br />
              <span className="text-3xl md:text-4xl xl:text-5xl">{HOME_HERO.titleLines[2]}</span>
            </h1>

            <p className="text-blue-100 text-base md:text-lg font-semibold mb-2">
              {HOME_HERO.subLine}
            </p>
            <p className="text-blue-200/70 text-sm md:text-base leading-relaxed max-w-lg font-light mb-8">
              {HOME_HERO.intro}
            </p>

            {/* Trust chips */}
            <div className="flex flex-wrap gap-3 mb-8">
              {HOME_HERO.trustChips.map((s, i) => (
                <div key={i} className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-center">
                  <div className="text-amber-400 text-sm font-extrabold leading-none mb-1">{s.num}</div>
                  <div className="text-blue-200/60 text-[10px] font-medium tracking-wide uppercase">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Desktop CTAs */}
            <div className="flex flex-wrap gap-3 mb-8">
              <a
                href={HOME_HERO.buttons[0].href}
                data-testid="btn-hero-book-visit"
                className="inline-flex items-center gap-2 px-7 py-3.5 font-bold text-sm text-[#091a4f] rounded-full transition-all hover:shadow-lg hover:scale-[1.02]"
                style={{ background: "#fbbf24" }}
              >
                <CalendarCheck size={16} />
                {HOME_HERO.buttons[0].label}
              </a>
              <Link
                href={HOME_HERO.buttons[1].href}
                data-testid="btn-hero-apply"
                className="inline-flex items-center gap-2 px-7 py-3.5 font-bold text-sm border-2 border-white/30 text-white rounded-full hover:bg-white/10 transition-all"
              >
                {HOME_HERO.buttons[1].label} <ChevronRight size={15} />
              </Link>
            </div>

            <div className="hidden lg:flex flex-wrap gap-2 pt-6 border-t border-white/10">
              {quickLinks.map((ql, i) => (
                <Link key={i} href={ql.href} className="px-4 py-2 rounded-full text-xs font-medium text-white/70 border border-white/15 hover:bg-white/10 hover:text-white transition-all" data-testid={`link-quick-${i}`}>
                  {ql.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right — enquiry form */}
          <div className="w-full lg:w-[390px] flex-shrink-0">
            <Suspense fallback={<div className="bg-white rounded-2xl shadow-2xl" style={{ minHeight: 540 }} />}>
              <HeroForm />
            </Suspense>
          </div>

        </div>
      </div>

      {/* Seat availability modal */}
      {showSeats && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 9999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowSeats(false)}
          data-testid="modal-seats-overlay"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>{HOME_SEATS.title}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{HOME_SEATS.subtitle}</p>
              </div>
              <button onClick={() => setShowSeats(false)} data-testid="button-close-seats" className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <p className="px-6 py-6 text-sm text-gray-700">
                {HOME_SEATS.beforePhone}<a href={HOME_SEATS.phoneHref} onClick={() => trackCallClick({ phone: HOME_SEATS.phone })}>{HOME_SEATS.phone}</a>{HOME_SEATS.afterPhone}
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-gray-50">
              <p className="text-xs text-gray-500">{HOME_SEATS.office}</p>
              <a
                href={HOME_HERO.buttons[0].href}
                onClick={() => setShowSeats(false)}
                className="px-6 py-2.5 text-sm font-bold text-white rounded-full hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(135deg, #091a4f 0%, #1a56db 100%)" }}
                data-testid="button-seats-enquire"
              >
                {HOME_HERO.buttons[0].label}
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
