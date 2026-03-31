import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const activities = [
  { icon: "🏛️", label: "Tours & Visits" },
  { icon: "🎭", label: "Exhibitions" },
  { icon: "🎯", label: "Clubs" },
  { icon: "🌿", label: "Promoting Green" },
  { icon: "🤲", label: "Dignity of Labour" },
];

export function BeyondClassroomSection() {
  return (
    <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #b71c1c 0%, #c62828 50%, #d32f2f 100%)" }}>
      <div className="absolute top-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full" style={{ height: "80px" }} xmlns="http://www.w3.org/2000/svg">
          <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,0 L0,0 Z" fill="white" />
        </svg>
      </div>

      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: "repeating-linear-gradient(-45deg, white 0, white 1px, transparent 0, transparent 50%)",
        backgroundSize: "20px 20px"
      }} />

      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 flex justify-center">
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 rounded-full border-2 border-white/20" />
              <div className="absolute inset-6 rounded-full border border-white/10" />

              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src="https://rainbowinternationalschool.in/wp-content/uploads/2023/07/web-art-work-for-pranit-d-02-1024x831.png"
                  alt="Beyond The Classroom"
                  className="w-48 h-48 object-contain drop-shadow-2xl"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>

              {activities.map((act, i) => {
                const angle = (i * 360) / activities.length - 90;
                const rad = (angle * Math.PI) / 180;
                const radius = 140;
                const x = 50 + (radius / 160) * 50 * Math.cos(rad);
                const y = 50 + (radius / 160) * 50 * Math.sin(rad);
                return (
                  <div
                    key={i}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap hover:bg-white transition-colors duration-200">
                      <span>{act.icon}</span>
                      <span>{act.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-1 text-white">
            <span className="inline-block text-xs font-bold tracking-widest uppercase mb-4 px-4 py-1.5 rounded-full bg-white/20">
              Extra Curricular
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
              Beyond The<br />
              <span style={{ color: "#ffd600" }}>Classroom</span>
            </h2>
            <div className="w-12 h-1 rounded-full mb-6" style={{ background: "#ffd600" }} />
            <p className="text-red-100 text-base leading-relaxed mb-3">
              The real aim of education is not only knowledge but also <strong className="text-white">ACTION.</strong>
            </p>
            <p className="text-red-100 text-base leading-relaxed mb-8">
              We provide rigorous, comprehensive & Cohesive learning. PROGRAMME that is designed to meet the Social Physical & Cultural needs of an International student body as well
            </p>
            <Link href="/beyond-the-classroom">
              <button
                className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-full text-sm transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{ background: "#ffd600", color: "#0a1f5c" }}
                data-testid="button-beyond-classroom"
              >
                Know more <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full" style={{ height: "80px" }} xmlns="http://www.w3.org/2000/svg">
          <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
