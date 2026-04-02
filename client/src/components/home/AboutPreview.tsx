import { Link } from "wouter";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const stats = [
  { num: "50K+", sub: "Happy Students" },
  { num: "2009", sub: "Established" },
  { num: "3.5 Acres", sub: "Campus Area" },
  { num: "1 Lac+", sub: "Lives Impacted" },
];

const highlights = [
  "CBSE Affiliated (No. 1130661)",
  "Nursery to Class 12",
  "Multiple Intelligence methodology",
  "3.5-acre green campus in Thane West",
];

export function AboutPreview() {
  return (
    <section className="py-24" style={{ background: "#f8faff" }}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-16 xl:gap-24 items-center">

          <div className="flex-1">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-6" style={{ background: "#eef5ff", color: "#0d3b86" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              Why Choose Us
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6">
              Why Parents Trust<br />
              <span style={{ color: "#0d3b86" }}>Rainbow</span>
            </h2>

            <div className="space-y-4 text-gray-600 text-[15px] leading-[1.8] mb-7">
              <p>Rainbow International School is a trailblazer in the arena of education with a passion for excellence. We are considered as one of the top CBSE schools in Thane west because we emphasize that the child enjoys his learning, dares to dream, and becomes a lifelong learner.</p>
              <p>Our expert educators provide a conducive environment with their multicultural perspectives. Social ethics like empathy, compassion, and respect for others is inculcated in the pedagogy. We provide state-of-the-art facilities, technologies, and infrastructure to optimize teaching and learning outcomes.</p>
              <p>Our educational programs support child's academic, moral, social, and physical development. Our curriculum reflects global, rural, and urban dimensions, thereby preparing our students to face all future challenges. At the preschool level, we follow the theory of{" "}
                <Link href="/about-rainbow-international-school" className="font-medium underline" style={{ color: "#0d3b86" }}>Multiple Intelligence</Link>{" "}for holistic development.</p>
              <p>We are proud to consistently deliver world-class education and remain the best international school in Thane west.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
              {highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} style={{ color: "#0d3b86", flexShrink: 0 }} />
                  <span className="text-gray-600 text-sm">{h}</span>
                </div>
              ))}
            </div>

            <Link href="/about-rainbow-international-school">
              <button
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-bold text-white text-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
                style={{ background: "#0d3b86" }}
                data-testid="button-about-us"
              >
                Learn More About Us
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
          </div>

          <div className="flex-shrink-0">
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center text-center bg-white rounded-3xl p-7 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  style={{ width: "165px", height: "165px" }}
                >
                  <div className="text-[28px] font-black leading-none mb-2" style={{ color: "#0d3b86" }}>{s.num}</div>
                  <div className="text-xs font-semibold text-gray-500 leading-snug">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
