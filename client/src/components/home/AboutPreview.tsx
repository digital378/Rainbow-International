import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const stats = [
  { num: "3,000+", label: "Happy Students" },
  { num: "2009", label: "Founded" },
  { num: "3.5", label: "Acre Campus" },
  { num: "50,000+", label: "Lives Impacted" },
];

export function AboutPreview() {
  return (
    <section className="py-20" style={{ background: "#f8faff" }}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-14 lg:gap-20 items-center">

          <div className="flex-1">
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-5 px-4 py-1.5 rounded-full" style={{ background: "#e8f4fb", color: "#0d3b86" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#0d3b86" }} />
              Why Choose Us
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
              Why Parents Trust<br />
              <span style={{ color: "#0d3b86" }}>Rainbow</span>
            </h2>
            <div className="space-y-4 text-gray-600 text-base leading-relaxed mb-8">
              <p>Rainbow International School is a trailblazer in the arena of education with a passion for excellence. We are considered as one of the top CBSE schools in Thane west because we emphasize that the child enjoys his learning, dares to dream, and becomes a lifelong learner.</p>
              <p>Our expert educators provide a conducive environment with their multicultural perspectives. Social ethics like empathy, compassion, and respect for others is inculcated in the pedagogy. We provide state-of-the-art facilities, technologies, and infrastructure to optimize teaching and learning outcomes.</p>
              <p>Our educational programs support child's academic, moral, social, and physical development. Our curriculum reflects global, rural, and urban dimensions, thereby preparing our students to face all future challenges. At the preschool level, we follow the theory of{" "}
                <a href="/about-rainbow-international-school" style={{ color: "#0d3b86" }} className="underline">Multiple Intelligence</a>{" "}for holistic development.</p>
              <p>At Rainbow, students are encouraged to build a positive self-image and evolve into well-disciplined, resourceful, and accountable human beings. Emotional intelligence is nurtured through well-designed activities and programs to overcome discrimination, prejudice, and bullying.</p>
              <p>We are proud to consistently deliver world-class education and remain the best international school in Thane west.</p>
            </div>
            <Link href="/about-rainbow-international-school">
              <button
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-white text-sm transition-all hover:scale-105 hover:shadow-lg"
                style={{ background: "#0d3b86" }}
                data-testid="button-about-us"
              >
                Learn More About Us <ArrowRight size={16} />
              </button>
            </Link>
          </div>

          <div className="flex-shrink-0 grid grid-cols-2 gap-5">
            {stats.map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center text-center rounded-3xl p-8 shadow-sm border border-gray-100 bg-white hover:shadow-md transition-shadow"
                style={{ width: "160px", height: "160px" }}
              >
                <div className="text-3xl font-black mb-1.5" style={{ color: "#0d3b86" }}>{s.num}</div>
                <div className="text-xs font-semibold text-gray-500 leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
