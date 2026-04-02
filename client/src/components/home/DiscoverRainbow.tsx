import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

const highlights = [
  {
    title: "Awards & Accomplishments",
    description: "Accolades earned for being one of the best and most promising international schools in Thane for over a decade.",
    image: "https://images.unsplash.com/photo-1567168544230-6b5e27a1bde0?w=400&h=500&fit=crop&q=80",
    href: "/awards-achievements",
    tag: "Recognition",
  },
  {
    title: "Amenities & Facilities",
    description: "Globally recognised resources and state-of-the-art facilities on our beautiful 3.5-acre campus.",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=500&fit=crop&q=80",
    href: "/amenities",
    tag: "Campus",
  },
  {
    title: "Student Achievements",
    description: "Student accomplishments are acknowledged and honored. Here you can view our best achievers.",
    image: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=400&h=500&fit=crop&q=80",
    href: "/student-achievements",
    tag: "Excellence",
  },
  {
    title: "Safety & Security",
    description: "Student safety and well-being is our top priority, safeguarded through stringent modern security measures.",
    image: "https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=400&h=500&fit=crop&q=80",
    href: "/safety-security",
    tag: "Wellbeing",
  },
];

export function DiscoverRainbow() {
  return (
    <section className="py-24" style={{ background: "#f8fafc" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-amber-500 text-xs font-semibold tracking-[0.2em] uppercase">Life at Rainbow</span>
            <div className="w-8 h-0.5 bg-amber-400 mx-auto mt-2" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">
            Let's Discover Rainbow!
          </h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            Committed to educating, strengthening, and nurturing every student — and empowering lifelong learners.
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
                <img
                  src={item.image}
                  alt={item.title}
                  width={300}
                  height={360}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
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
