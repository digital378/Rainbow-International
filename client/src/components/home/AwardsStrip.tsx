const awards = [
  { label: "India Today Award", src: "https://www.rainbowpreschools.com/images/optimized/india-today.webp" },
  { label: "National School Awards", src: "https://www.rainbowpreschools.com/images/optimized/nsa-award.webp" },
  { label: "World Education Summit", src: "https://www.rainbowpreschools.com/images/optimized/wes-mumbai.webp" },
  { label: "Economic Times", src: "https://www.rainbowpreschools.com/images/optimized/economic-times.webp" },
  { label: "Scoo News", src: "https://www.rainbowpreschools.com/images/optimized/scoonews-light.webp" },
  { label: "Thane Municipal Corp", src: "https://www.rainbowpreschools.com/images/optimized/tmc-logo.webp" },
];

const allAwards = [...awards, ...awards];

export function AwardsStrip() {
  return (
    <section className="py-10 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 mb-6 text-center">
        <p className="text-xs font-bold tracking-widest uppercase text-gray-400">Awarded & Recognised By</p>
      </div>
      <div className="overflow-hidden">
        <div className="flex gap-12 items-center" style={{
          animation: "marquee 20s linear infinite",
          width: "max-content",
        }}>
          {allAwards.map((award, i) => (
            <div key={i} className="flex items-center justify-center flex-shrink-0 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300" style={{ height: "48px", width: "120px" }}>
              <img
                src={award.src}
                alt={award.label}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
