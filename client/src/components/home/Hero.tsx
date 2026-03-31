import { Link } from "wouter";

export function Hero() {
  return (
    <div className="relative overflow-hidden" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a1f5c 0%, #0d3b86 40%, #1565c0 100%)" }}>
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(https://rainbowinternationalschool.in/wp-content/uploads/2023/04/picwish.webp)` }}
      />

      <div className="absolute inset-0" style={{
        backgroundImage: "radial-gradient(circle at 20% 80%, rgba(255,214,0,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(21,101,192,0.3) 0%, transparent 50%)"
      }} />

      <div className="absolute top-20 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #ffd600, transparent)" }} />
      <div className="absolute bottom-20 left-10 w-64 h-64 rounded-full opacity-5" style={{ background: "radial-gradient(circle, #ffffff, transparent)" }} />

      <div className="relative container mx-auto px-6 flex flex-col lg:flex-row items-center" style={{ minHeight: "100vh", paddingTop: "6rem", paddingBottom: "8rem" }}>
        <div className="flex-1 text-white z-10 pt-8 lg:pt-0">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-yellow-400/40 bg-yellow-400/10 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-yellow-300 text-xs font-bold tracking-widest uppercase">CBSE Affiliated · Affiliation No. 1130661</span>
          </div>

          <p className="text-blue-200 text-lg md:text-xl font-light mb-3 leading-snug tracking-wide">
            WORLD-CLASS EDUCATION, INDIAN VALUES:
          </p>

          <h1 className="text-5xl md:text-6xl xl:text-7xl font-black mb-6 leading-tight">
            <span className="text-white">Rainbow </span>
            <br />
            <span style={{ color: "#ffd600" }}>International</span>
            <br />
            <span className="text-white">School</span>
          </h1>

          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 max-w-16 bg-white/30" />
            <p className="text-blue-100 text-sm md:text-base font-medium tracking-widest uppercase">
              Nursery to Class 12<sup>th</sup> · CBSE Affiliated
            </p>
            <div className="h-px flex-1 max-w-16 bg-white/30" />
          </div>

          <div className="flex flex-wrap gap-4 mb-10">
            <a href="#contact" data-testid="button-hero-know-more">
              <button className="px-8 py-3.5 rounded-full font-bold text-sm tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-xl" style={{ background: "#ffd600", color: "#0a1f5c" }}>
                Know More
              </button>
            </a>
            <Link href="/about-rainbow-international-school">
              <button className="px-8 py-3.5 rounded-full font-bold text-sm tracking-wide border-2 border-white/40 text-white hover:bg-white/10 transition-all duration-300">
                About Us
              </button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-4">
            {[
              { num: "2009", label: "Founded" },
              { num: "3,000+", label: "Students" },
              { num: "3.5 Acres", label: "Campus" },
              { num: "Nur–12", label: "Classes" },
            ].map((stat, i) => (
              <div key={i} className="text-center px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
                <div className="text-xl font-black text-yellow-300">{stat.num}</div>
                <div className="text-xs text-blue-200 font-medium mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex justify-center lg:justify-end items-end mt-12 lg:mt-0 lg:pl-8">
          <div className="relative">
            <div className="absolute -inset-8 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #ffd600, transparent)" }} />
            <img
              src="https://rainbowinternationalschool.in/wp-content/uploads/2023/07/web-art-work-for-pranit-d-02-1024x831.png"
              alt="Students at Rainbow International School"
              className="relative z-10 object-contain drop-shadow-2xl"
              style={{ maxHeight: "520px", maxWidth: "100%" }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full" style={{ height: "100px" }} xmlns="http://www.w3.org/2000/svg">
          <path d="M0,60 C180,100 360,20 540,60 C720,100 900,20 1080,60 C1260,100 1380,40 1440,60 L1440,100 L0,100 Z" fill="white" />
        </svg>
      </div>
    </div>
  );
}
