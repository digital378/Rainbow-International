import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const programs = [
  {
    label: "Pre-Primary",
    grade: "Nursery · Jr. KG · Sr. KG",
    description: "Play-based learning that nurtures curiosity, creativity, and foundational skills in a safe and joyful environment.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/pre-primary-school-nursery-jrkg-srkg-admissions-ad.jpg",
    href: "/pre-primary-school-thane",
    accent: "#f97316",
    tag: "#fff7ed",
  },
  {
    label: "Primary",
    grade: "Class I – V",
    description: "Building strong literacy, numeracy, and social skills through structured experiential learning.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Primary-scetion-768x513.png",
    href: "/primary-section",
    accent: "#0d3b86",
    tag: "#eef5ff",
  },
  {
    label: "Middle School",
    grade: "Class VI – VIII",
    description: "Critical thinking, digital literacy, and leadership skills for the evolving modern learner.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/middle-section-768x513.png",
    href: "/middle-school-section",
    accent: "#10b981",
    tag: "#ecfdf5",
  },
  {
    label: "Secondary",
    grade: "Class IX – X",
    description: "CBSE board preparation with strong academics and holistic co-curricular engagement.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/middle-school-class-6-class-8-international-school-admission-ad-2.jpg",
    href: "/secondary-section",
    accent: "#8b5cf6",
    tag: "#f5f3ff",
  },
  {
    label: "Senior Secondary",
    grade: "Class XI – XII",
    description: "Science, Commerce & Humanities streams to launch your child's next chapter.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/senior-secondary-768x513.png",
    href: "/senior-secondary-section",
    accent: "#ef4444",
    tag: "#fff1f2",
  },
];

export function AcademicSections() {
  return (
    <section id="academics" className="py-24" style={{ background: "#f8faff" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-5" style={{ background: "#eef5ff", color: "#0d3b86" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Academics
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
            Academic Programmes<br />
            <span style={{ color: "#0d3b86" }}>At A Glance</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            From Nursery to Class 12 — a complete CBSE learning journey under one roof.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
          {programs.slice(0, 3).map((p, i) => (
            <Link key={i} href={p.href}>
              <div
                className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer"
                data-testid={`card-section-${i}`}
              >
                <div className="relative overflow-hidden" style={{ height: "210px" }}>
                  <img
                    src={p.image}
                    alt={p.label}
                    width={400}
                    height={210}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      el.parentElement!.style.background = p.tag;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6">
                  <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold mb-3" style={{ background: p.tag, color: p.accent }}>
                    {p.grade}
                  </span>
                  <h3 className="font-black text-gray-900 text-xl mb-2">{p.label}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{p.description}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold group-hover:gap-2.5 transition-all" style={{ color: p.accent }} data-testid={`link-section-${i}`}>
                    Explore <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto mb-10">
          {programs.slice(3).map((p, i) => (
            <Link key={i + 3} href={p.href}>
              <div
                className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer"
                data-testid={`card-section-${i + 3}`}
              >
                <div className="relative overflow-hidden" style={{ height: "210px" }}>
                  <img
                    src={p.image}
                    alt={p.label}
                    width={400}
                    height={210}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      el.parentElement!.style.background = p.tag;
                    }}
                  />
                </div>
                <div className="p-6">
                  <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold mb-3" style={{ background: p.tag, color: p.accent }}>
                    {p.grade}
                  </span>
                  <h3 className="font-black text-gray-900 text-xl mb-2">{p.label}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{p.description}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold group-hover:gap-2.5 transition-all" style={{ color: p.accent }} data-testid={`link-section-${i + 3}`}>
                    Explore <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
