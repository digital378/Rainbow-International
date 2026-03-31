import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const paragraphs = [
  "Rainbow International School is a trailblazer in the arena of education with a passion for excellence. We are considered as one of the top CBSE schools in Thane west because we emphasize that the child enjoys his learning, dares to dream, and becomes a lifelong learner.",
  "Our expert educators provide a conducive environment with their multicultural perspectives. Social ethics like empathy, compassion, and respect for others is inculcated in the pedagogy. We provide state-of-the-art facilities, technologies, and infrastructure to optimize teaching and learning outcomes.",
  "Our educational programs support child's academic, moral, social, and physical development. Our curriculum reflects global, rural, and urban dimensions, thereby preparing our students to face all future challenges. At the preschool level, we follow the theory of Multiple Intelligence for holistic development.",
  "At Rainbow, students are encouraged to build a positive self-image and evolve into well-disciplined, resourceful, and accountable human beings. Emotional intelligence is nurtured through well-designed activities and programs to overcome discrimination, prejudice, and bullying.",
  "We are proud to consistently deliver world-class education and remain the best international school in Thane west.",
];

export function AboutPreview() {
  return (
    <section className="py-20" style={{ background: "#f8faff" }}>
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-28">
              <span className="inline-block text-xs font-bold tracking-widest uppercase mb-4 px-4 py-1.5 rounded-full" style={{ background: "#fee2e2", color: "#d63031" }}>
                Why Us
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                Why<br />
                <span style={{ color: "#d63031" }}>Rainbow?</span>
              </h2>
              <div className="w-12 h-1 rounded-full mb-6" style={{ background: "#ffd600" }} />
              <Link href="/about-rainbow-international-school">
                <button
                  className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-full text-white text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{ background: "#0a1f5c" }}
                  data-testid="button-about-us"
                >
                  About Us <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            {paragraphs.map((para, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="flex-shrink-0 mt-1.5">
                  <div className="w-2 h-2 rounded-full transition-all duration-300 group-hover:scale-125" style={{ background: i === 0 ? "#0d3b86" : i === 1 ? "#d63031" : i === 2 ? "#ffd600" : i === 3 ? "#0d3b86" : "#d63031" }} />
                </div>
                <p className="text-gray-600 leading-relaxed text-base">{para}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mt-16 overflow-hidden" style={{ height: "80px" }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="#c62828" />
        </svg>
      </div>
    </section>
  );
}
