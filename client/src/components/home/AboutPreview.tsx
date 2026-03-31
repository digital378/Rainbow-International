import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export function AboutPreview() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-8">
          Why Rainbow ?
        </h2>

        <div className="space-y-4 text-gray-600 text-sm md:text-base leading-relaxed">
          <p>
            Rainbow International School is a trailblazer in the arena of education with a passion for excellence. We are considered as one of the top CBSE schools in Thane west because we emphasize that the child enjoys his learning, dares to dream, and becomes a lifelong learner.
          </p>
          <p>
            Our expert educators provide a conducive environment with their multicultural perspectives. Social ethics like empathy, compassion, and respect for others is inculcated in the pedagogy. We provide state-of-the-art facilities, technologies, and infrastructure to optimize teaching and learning outcomes.
          </p>
          <p>
            Our educational programs support child's academic, moral, social, and physical development. Our curriculum reflects global, rural, and urban dimensions, thereby preparing our students to face all future challenges. At the preschool level, we follow the theory of{" "}
            <a href="/about-rainbow-international-school" className="text-red-500 underline">
              Multiple Intelligence
            </a>
            . for holistic development.
          </p>
          <p>
            At Rainbow, students are encouraged to build a positive self-image and evolve into well-disciplined, resourceful, and accountable human beings. Emotional intelligence is nurtured through well-designed activities and programs to overcome discrimination, prejudice, and bullying.
          </p>
          <p>
            We are proud to consistently deliver world-class education and remain the best international school in Thane west.
          </p>
        </div>

        <div className="mt-8">
          <Link href="/about-rainbow-international-school">
            <button
              className="inline-flex items-center gap-2 text-white font-semibold px-7 py-3 rounded-md"
              style={{ backgroundColor: "#1a3a6b" }}
              data-testid="button-about-us"
            >
              About Us <ArrowRight size={18} />
            </button>
          </Link>
        </div>
      </div>

      <div className="relative mt-12 overflow-hidden leading-none" style={{ height: "80px" }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,30 1440,40 L1440,80 L0,80 Z" fill="#e03535" />
        </svg>
      </div>
    </section>
  );
}
