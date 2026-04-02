const awards = [
  { label: "India Today Award", src: "https://www.rainbowpreschools.com/images/optimized/india-today.webp" },
  { label: "National School Awards", src: "https://www.rainbowpreschools.com/images/optimized/nsa-award.webp" },
  { label: "World Education Summit", src: "https://www.rainbowpreschools.com/images/optimized/wes-mumbai.webp" },
  { label: "Economic Times", src: "https://www.rainbowpreschools.com/images/optimized/economic-times.webp" },
  { label: "Scoo News", src: "https://www.rainbowpreschools.com/images/optimized/scoonews-light.webp" },
  { label: "Thane Municipal Corp", src: "https://www.rainbowpreschools.com/images/optimized/tmc-logo.webp" },
];

const doubled = [...awards, ...awards];

export function AwardsStrip() {
  return (
    <section className="py-10 bg-white border-b border-gray-100">
      <p className="text-center text-xs font-bold tracking-[0.15em] uppercase text-gray-400 mb-7">
        Recognised & Awarded By
      </p>
      <div className="overflow-hidden relative">
        <div
          className="flex gap-14 items-center"
          style={{ animation: "strip-scroll 24s linear infinite", width: "max-content" }}
        >
          {doubled.map((a, i) => (
            <div
              key={i}
              className="flex-shrink-0 flex items-center justify-center grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300"
              style={{ height: "44px", width: "110px" }}
            >
              <img
                src={a.src}
                alt={a.label}
                width={110}
                height={44}
                loading="lazy"
                decoding="async"
                className="max-h-full max-w-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes strip-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
