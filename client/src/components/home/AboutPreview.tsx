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
    <section className="py-24" style={{ background: "#f8fafc" }}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-16 xl:gap-24 items-center">

          <div className="flex-1">
            <div className="inline-block mb-5">
              <span className="text-amber-500 text-xs font-semibold tracking-[0.2em] uppercase">Why Choose Us</span>
              <div className="w-8 h-0.5 bg-amber-400 mt-2" />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
              Why Parents Trust<br />
              <span style={{ color: "#091a4f" }}>Rainbow</span>
            </h2>

            <div className="space-y-4 text-gray-600 text-[15px] leading-[1.8] mb-7">
              <p>Rainbow International School is a trailblazer in the arena of education with a passion for excellence. We are considered as one of the top CBSE schools in Thane west because we emphasize that the child enjoys his learning, dares to dream, and becomes a lifelong learner.</p>
              <p>Our expert educators provide a conducive environment with their multicultural perspectives. Social ethics like empathy, compassion, and respect for others is inculcated in the pedagogy. We provide state-of-the-art facilities, technologies, and infrastructure to optimize teaching and learning outcomes.</p>
              <p>Our educational programs support child's academic, moral, social, and physical development. Our curriculum reflects global, rural, and urban dimensions, thereby preparing our students to face all future challenges. At the preschool level, we follow the theory of{" "}
                <Link href="/about-rainbow-international-school" className="font-medium underline" style={{ color: "#091a4f" }} data-testid="link-multiple-intelligence">Multiple Intelligence</Link>{" "}for holistic development.</p>
              <p>We are proud to consistently deliver world-class education and remain the best international school in Thane west.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
              {highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} className="text-amber-500 flex-shrink-0" />
                  <span className="text-gray-600 text-sm">{h}</span>
                </div>
              ))}
            </div>

            <Link
              href="/about-rainbow-international-school"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 font-bold text-white text-sm transition-all duration-300 hover:opacity-90 hover:shadow-lg"
              style={{ background: "#091a4f", borderRadius: "9999px" }}
              data-testid="button-about-us"
            >
              Learn More About Us
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="flex-shrink-0">
            <div className="grid grid-cols-2 gap-3">
              {stats.map((s, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center text-center bg-white p-7 shadow-sm border border-gray-100 hover:shadow-md hover:border-amber-200 transition-all"
                  style={{ width: "165px", height: "165px", borderRadius: "16px" }}
                >
                  <div className="text-[28px] font-extrabold leading-none mb-2" style={{ color: "#091a4f" }}>{s.num}</div>
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
