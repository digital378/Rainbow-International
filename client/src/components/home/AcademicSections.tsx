import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const programs = [
  {
    label: "Pre-Primary",
    grade: "Nursery · Jr. KG · Sr. KG",
    description: "Play-based learning that nurtures curiosity, creativity, and foundational skills in a safe and joyful environment.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=450&fit=crop&q=80",
    href: "/pre-primary-school-thane",
    accent: "#f59e0b",
  },
  {
    label: "Primary",
    grade: "Class I – V",
    description: "Building strong literacy, numeracy, and social skills through structured experiential learning.",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=450&fit=crop&q=80",
    href: "/primary-section",
    accent: "#091a4f",
  },
  {
    label: "Middle School",
    grade: "Class VI – VIII",
    description: "Critical thinking, digital literacy, and leadership skills for the evolving modern learner.",
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&h=450&fit=crop&q=80",
    href: "/middle-school-section",
    accent: "#0d3b86",
  },
  {
    label: "Secondary",
    grade: "Class IX – X",
    description: "CBSE board preparation with strong academics and holistic co-curricular engagement.",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=600&h=450&fit=crop&q=80",
    href: "/secondary-section",
    accent: "#091a4f",
  },
  {
    label: "Senior Secondary",
    grade: "Class XI – XII",
    description: "Science, Commerce & Humanities streams to launch your child's next chapter.",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=450&fit=crop&q=80",
    href: "/senior-secondary-section",
    accent: "#f59e0b",
  },
];

function ProgramCard({ p, index }: { p: typeof programs[0]; index: number }) {
  return (
    <Link href={p.href}>
      <div
        className="group bg-white overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer h-full"
        style={{ borderRadius: "16px" }}
        data-testid={`card-section-${index}`}
      >
        <div className="relative overflow-hidden aspect-[4/3]">
          <img
            src={p.image}
            alt={p.label}
            width={400}
            height={300}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-6">
          <span className="inline-block px-3 py-1 text-[11px] font-bold mb-3 text-amber-600 bg-amber-50 rounded-full">
            {p.grade}
          </span>
          <h3 className="font-extrabold text-gray-900 text-xl mb-2">{p.label}</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">{p.description}</p>
          <span className="inline-flex items-center gap-1.5 text-sm font-bold group-hover:gap-2.5 transition-all" style={{ color: p.accent }} data-testid={`link-section-${index}`}>
            Explore <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function AcademicSections() {
  return (
    <section id="academics" className="py-24" style={{ background: "#f8fafc" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-amber-500 text-xs font-semibold tracking-[0.2em] uppercase">Academics</span>
            <div className="w-8 h-0.5 bg-amber-400 mx-auto mt-2" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">
            Academic Programmes<br />
            <span style={{ color: "#091a4f" }}>At A Glance</span>
          </h2>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            From Nursery to Class 12 — a complete CBSE learning journey under one roof.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
          {programs.slice(0, 3).map((p, i) => (
            <ProgramCard key={i} p={p} index={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-none mx-auto mb-10">
          {programs.slice(3).map((p, i) => (
            <ProgramCard key={i + 3} p={p} index={i + 3} />
          ))}
          <div className="hidden sm:flex lg:hidden" />
        </div>
      </div>
    </section>
  );
}
