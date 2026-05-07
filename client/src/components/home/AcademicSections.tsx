import { Link } from "wouter";
import { ArrowRight, MessageCircle } from "lucide-react";

const programs = [
  {
    label: "Pre-Primary",
    grade: "Nursery · Jr. KG · Sr. KG",
    concern: "Starting school is a big milestone.",
    advantage: "Play-based, activity-led learning in a safe, female-staff-led Nursery wing using the Multiple Intelligence approach.",
    image: "/images/home/academic/pre-primary.webp",
    fallback: "/images/home/academic/pre-primary.jpg",
    href: "/pre-primary-school-thane",
    accent: "#f59e0b",
  },
  {
    label: "Primary",
    grade: "Class I – V",
    concern: "Building the right foundation matters.",
    advantage: "CBSE-aligned literacy, numeracy, science and creative skills with co-curriculars built into every school day.",
    image: "/images/home/academic/primary-section.webp",
    fallback: "/images/home/academic/primary-section.jpg",
    href: "/primary-section",
    accent: "#091a4f",
  },
  {
    label: "Middle School",
    grade: "Class VI – VIII",
    concern: "The tween years need structure and stimulation.",
    advantage: "Critical thinking, Olympiad coaching, project-based learning and a rich co-curricular calendar.",
    image: "/images/home/academic/middle-section.webp",
    fallback: "/images/home/academic/middle-section.jpg",
    href: "/middle-school-section",
    accent: "#0d3b86",
  },
  {
    label: "Secondary",
    grade: "Class IX – X",
    concern: "Board prep without burning out.",
    advantage: "Structured CBSE Class 10 preparation with periodic tests, pre-boards, doubt sessions and career counselling.",
    image: "/images/home/academic/secondary.webp",
    fallback: "/images/home/academic/secondary.jpg",
    href: "/secondary-section",
    accent: "#091a4f",
  },
  {
    label: "Senior Secondary",
    grade: "Class XI – XII",
    concern: "The right stream, the right support.",
    advantage: "Science, Commerce and Humanities streams with JEE / NEET / CUET prep support and expert faculty.",
    image: "/images/home/academic/senior-secondary.webp",
    fallback: "/images/home/academic/senior-secondary.jpg",
    href: "/senior-secondary-section",
    accent: "#f59e0b",
  },
];

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
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full border-2 transition-all hover:opacity-80"
            style={{ color: p.accent, borderColor: p.accent }}
            data-testid={`link-section-${index}`}
          >
            Explore <ArrowRight size={12} />
          </Link>
          <a
            href="/admissions"
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full text-white transition-all hover:opacity-80"
            style={{ background: p.accent }}
            data-testid={`btn-enquire-grade-${index}`}
          >
            <MessageCircle size={12} />
            Enquire for this Grade
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
            <span className="text-amber-500 text-xs font-semibold tracking-[0.2em] uppercase">Academics</span>
            <div className="w-8 h-0.5 bg-amber-400 mx-auto mt-2" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-3 tracking-tight">
            Academic Programmes <span style={{ color: "#091a4f" }}>at a Glance</span>
          </h2>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            From Nursery to Class 12 — a complete CBSE learning journey under one roof.
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
