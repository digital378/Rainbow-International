import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const activities = [
  "Tours & Visits",
  "Exhibitions",
  "Subject Clubs",
  "Promoting Green",
  "Dignity of Labour",
  "Arts & Culture",
];

export function BeyondClassroomSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16 xl:gap-24">
          <div className="flex-1 order-2 lg:order-1 max-w-lg">
            <div className="inline-block mb-5">
              <span className="text-amber-500 text-xs font-semibold tracking-[0.2em] uppercase">Extra Curricular</span>
              <div className="w-8 h-0.5 bg-amber-400 mt-2" />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-5 tracking-tight">
              Beyond The<br />
              <span style={{ color: "#091a4f" }}>Classroom</span>
            </h2>
            <p className="text-gray-600 text-[15px] leading-[1.8] mb-3">
              The real aim of education is not only knowledge but also <strong>ACTION.</strong>
            </p>
            <p className="text-gray-600 text-[15px] leading-[1.8] mb-8">
              We provide a rigorous, comprehensive and cohesive learning programme that is designed to meet the social, physical and cultural needs of our entire student community — preparing them for the real world.
            </p>

            <div className="flex flex-wrap gap-2 mb-10">
              {activities.map((act, i) => (
                <div
                  key={i}
                  className="px-4 py-2 text-sm font-semibold transition-all hover:bg-amber-50 cursor-default"
                  style={{ background: "#f8fafc", color: "#091a4f", border: "1.5px solid #e2e8f0", borderRadius: "9999px" }}
                >
                  {act}
                </div>
              ))}
            </div>

            <Link
              href="/beyond-the-classroom"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 font-bold text-white text-sm transition-all duration-300 hover:opacity-90 hover:shadow-lg"
              style={{ background: "#091a4f", borderRadius: "9999px" }}
              data-testid="button-beyond-classroom"
            >
              Know More
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="flex-1 flex justify-center order-1 lg:order-2">
            <div className="relative">
              <div
                className="w-80 h-80 md:w-96 md:h-96 overflow-hidden"
                style={{
                  borderRadius: "20px",
                }}
              >
                <picture>
                  <source srcSet="/images/home/beyond-classroom-rocket.webp" type="image/webp" />
                  <img
                    src="/images/home/beyond-classroom-rocket.jpg"
                    alt="Beyond The Classroom at Rainbow International School — Tours, Exhibitions, Clubs, Promoting Green, Dignity of Labour"
                    width={384}
                    height={384}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain"
                  />
                </picture>
              </div>

              <div className="absolute -top-4 -right-4 w-28 h-28 overflow-hidden shadow-xl border-4 border-white rounded-2xl">
                <picture>
                  <source srcSet="/images/home/academic/pre-primary.webp" type="image/webp" />
                  <img
                    src="/images/home/academic/pre-primary.jpg"
                    alt="Pre-primary activities"
                    width={112}
                    height={112}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </picture>
              </div>

              <div className="absolute -bottom-4 -left-4 w-24 h-24 overflow-hidden shadow-xl border-4 border-white rounded-2xl">
                <picture>
                  <source srcSet="/images/home/academic/primary-section.webp" type="image/webp" />
                  <img
                    src="/images/home/academic/primary-section.jpg"
                    alt="Campus amenities"
                    width={96}
                    height={96}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </picture>
              </div>

              <div
                className="absolute -bottom-6 right-8 px-5 py-3 shadow-xl bg-white"
                style={{ border: "1.5px solid #fbbf24", borderRadius: "12px" }}
              >
                <p className="text-xs font-medium text-gray-400 mb-0.5">Annual events</p>
                <p className="text-xl font-extrabold" style={{ color: "#091a4f" }}>25+</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
