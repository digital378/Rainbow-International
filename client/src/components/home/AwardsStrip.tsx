import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

const awards = [
  { label: "India Today Award", src: "/images/awards/india-today.webp" },
  { label: "National School Awards", src: "/images/awards/nsa-award.webp" },
  { label: "World Education Summit", src: "/images/awards/wes-mumbai.webp" },
  { label: "Economic Times", src: "/images/awards/economic-times.webp" },
  { label: "Scoo News", src: "/images/awards/scoonews.webp" },
  { label: "Thane Municipal Corp", src: "/images/awards/tmc-logo.webp" },
];

const leftColumn = [...awards.slice(0, 3), ...awards.slice(0, 3), ...awards.slice(0, 3)];
const rightColumn = [...awards.slice(3), ...awards.slice(3), ...awards.slice(3)];

export function AwardsStrip() {
  return (
    <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #091a4f 0%, #0d3b86 60%, #091a4f 100%)" }}>
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center">

          <div className="inline-block mb-5">
            <span className="text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase">Recognised & Awarded</span>
            <div className="w-8 h-0.5 bg-amber-400 mt-2 mx-auto" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-[42px] font-extrabold text-white leading-tight mb-5 tracking-tight">
            Welcome To Rainbow<br />
            <span className="text-amber-400">International School</span>
          </h2>
          <p className="text-blue-200/80 text-[15px] leading-[1.8] max-w-xl mb-10 mx-auto">
            Recognised and awarded by leading education platforms across India, Rainbow International School continues to set benchmarks in academic excellence, holistic development, and preparing students for success in an evolving world.
          </p>

          <div className="flex gap-4 h-[320px] overflow-hidden mb-10">
            <div className="w-[140px] relative overflow-hidden">
              <div className="flex flex-col gap-4 animate-scroll-up">
                {leftColumn.map((a, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-[140px] h-[100px] bg-white rounded-2xl flex items-center justify-center p-4 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <img
                      src={a.src}
                      alt={a.label}
                      width={100}
                      height={60}
                      loading="lazy"
                      decoding="async"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="w-[140px] relative overflow-hidden">
              <div className="flex flex-col gap-4 animate-scroll-down">
                {rightColumn.map((a, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-[140px] h-[100px] bg-white rounded-2xl flex items-center justify-center p-4 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <img
                      src={a.src}
                      alt={a.label}
                      width={100}
                      height={60}
                      loading="lazy"
                      decoding="async"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/awards-achievements"
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 font-bold text-sm transition-all duration-300 hover:opacity-90 hover:shadow-lg text-[#091a4f]"
            style={{ background: "#fbbf24", borderRadius: "9999px" }}
            data-testid="button-awards-cta"
          >
            View All Awards
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>

        </div>
      </div>

      <style>{`
        @keyframes scroll-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-33.33%); }
        }
        @keyframes scroll-down {
          0% { transform: translateY(-33.33%); }
          100% { transform: translateY(0); }
        }
        .animate-scroll-up {
          animation: scroll-up 12s linear infinite;
        }
        .animate-scroll-down {
          animation: scroll-down 12s linear infinite;
        }
      `}</style>
    </section>
  );
}
