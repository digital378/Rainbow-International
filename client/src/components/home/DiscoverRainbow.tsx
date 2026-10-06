import { HOME_DISCOVER } from "@shared/content/home";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

const highlights = [
  { image: "/images/home/discover/awards.webp", fallback: "/images/home/discover/awards.jpg" },
  { image: "/images/home/discover/amenities.webp", fallback: "/images/home/discover/amenities.jpg" },
  { image: "/images/home/discover/student-achievements.webp", fallback: "/images/home/discover/student-achievements.jpg" },
  { image: "/images/home/discover/safety-security.webp", fallback: "/images/home/discover/safety-security.jpg" },
].map((visual, index) => ({ ...visual, ...HOME_DISCOVER.cards[index] }));

export function DiscoverRainbow() {
  return (
    <section className="py-24" style={{ background: "#f8fafc" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-amber-500 text-xs font-semibold tracking-[0.2em] uppercase">{HOME_DISCOVER.eyebrow}</span>
            <div className="w-8 h-0.5 bg-amber-400 mx-auto mt-2" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">
            {HOME_DISCOVER.title}
          </h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            {HOME_DISCOVER.sub}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {highlights.map((item, index) => (
            <Link key={index} href={item.href}>
              <div
                className="group relative overflow-hidden cursor-pointer"
                style={{ height: "360px", borderRadius: "16px" }}
                data-testid={`card-highlight-${index}`}
              >
                <picture>
                  <source srcSet={item.image} type="image/webp" />
                  <img
                    src={item.fallback}
                    alt={item.title}
                    width={300}
                    height={360}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-t from-[#091a4f]/90 via-[#091a4f]/30 to-transparent group-hover:from-amber-600/85 group-hover:via-amber-600/20 transition-all duration-500" />

                <div className="absolute top-4 left-4">
                  <span className="text-xs font-bold px-3 py-1.5 bg-amber-400 text-[#091a4f] rounded-full">
                    {item.tag}
                  </span>
                </div>

                <div className="absolute top-4 right-4 w-8 h-8 bg-white/10 border border-white/25 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <ArrowUpRight size={14} className="text-white" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white font-extrabold text-[17px] leading-tight mb-2">{item.title}</h3>
                  <p className="text-white/70 text-xs leading-relaxed max-h-0 overflow-hidden group-hover:max-h-20 transition-all duration-500">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
