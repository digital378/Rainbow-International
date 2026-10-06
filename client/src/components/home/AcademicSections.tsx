import { HOME_ACADEMICS } from "@shared/content/home";
import { Link } from "wouter";
import { ArrowRight, MessageCircle } from "lucide-react";

const programs = [
  { image: "/images/home/academic/pre-primary.webp", fallback: "/images/home/academic/pre-primary.jpg", accent: "#f59e0b" },
  { image: "/images/home/academic/primary-section.webp", fallback: "/images/home/academic/primary-section.jpg", accent: "#091a4f" },
  { image: "/images/home/academic/middle-section.webp", fallback: "/images/home/academic/middle-section.jpg", accent: "#0d3b86" },
  { image: "/images/home/academic/secondary.webp", fallback: "/images/home/academic/secondary.jpg", accent: "#091a4f" },
  { image: "/images/home/academic/senior-secondary.webp", fallback: "/images/home/academic/senior-secondary.jpg", accent: "#f59e0b" },
].map((visual, index) => ({ ...visual, ...HOME_ACADEMICS.cards[index] }));

function ProgramCard({ p, index }: { p: typeof programs[0]; index: number }) {
  return (
    <div
      className="group bg-white overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 h-full flex flex-col"
      style={{ borderRadius: "16px" }}
      data-testid={`card-section-${index}`}
    >
      <Link href={p.href} className="block">
        <div className="relative overflow-hidden aspect-[4/3]">
          <picture>
            <source srcSet={p.image} type="image/webp" />
            <img
              src={p.fallback}
              alt={`${p.label} at Rainbow International School Thane`}
              width={400} height={300}
              loading="lazy" decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <span className="inline-block px-3 py-1 text-[11px] font-bold mb-2 text-amber-600 bg-amber-50 rounded-full self-start">
          {p.grade}
        </span>
        <h3 className="font-extrabold text-gray-900 text-lg mb-1.5">{p.label}</h3>
        <p className="text-[#091a4f] text-xs font-semibold italic mb-1">"{p.concern}"</p>
        <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">{p.advantage}</p>
        <div className="flex items-center gap-2 flex-wrap mt-auto">
          <Link
            href={p.href}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full border-2 transition-all hover:bg-[#091a4f] hover:text-white"
            style={{ color: "#091a4f", borderColor: "#091a4f" }}
            data-testid={`link-section-${index}`}
          >
            {HOME_ACADEMICS.explore} <ArrowRight size={12} />
          </Link>
          <a
            href="/admissions"
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full text-white transition-all hover:opacity-80"
            style={{ background: "linear-gradient(135deg, #091a4f 0%, #1a56db 100%)" }}
            data-testid={`btn-enquire-grade-${index}`}
          >
            <MessageCircle size={12} />
            {HOME_ACADEMICS.enquire}
          </a>
        </div>
      </div>
    </div>
  );
}

export function AcademicSections() {
  return (
    <section id="academics" className="py-20" style={{ background: "#f8fafc" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="text-amber-500 text-xs font-semibold tracking-[0.2em] uppercase">{HOME_ACADEMICS.eyebrow}</span>
            <div className="w-8 h-0.5 bg-amber-400 mx-auto mt-2" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-3 tracking-tight">
            {HOME_ACADEMICS.title} <span style={{ color: "#091a4f" }}>{HOME_ACADEMICS.titleAccent}</span>
          </h2>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            {HOME_ACADEMICS.sub}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
          {programs.slice(0, 3).map((p, i) => <ProgramCard key={i} p={p} index={i} />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {programs.slice(3).map((p, i) => <ProgramCard key={i + 3} p={p} index={i + 3} />)}
        </div>
      </div>
    </section>
  );
}
