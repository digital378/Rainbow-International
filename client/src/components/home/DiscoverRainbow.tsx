import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

const highlights = [
  {
    title: "Awards & Accomplishments",
    description: "Accolades earned for being one of the best and most promising international schools in Thane for over a decade.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad.jpg",
    href: "/awards-achievements",
    tag: "Recognition",
    accent: "#f59e0b",
    tagBg: "#fef3c7",
  },
  {
    title: "Amenities & Facilities",
    description: "Globally recognised resources and state-of-the-art facilities on our beautiful 3.5-acre campus.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/amenities-facilities01-768x610.png",
    href: "/amenities",
    tag: "Campus",
    accent: "#10b981",
    tagBg: "#d1fae5",
  },
  {
    title: "Student Achievements",
    description: "Student accomplishments are acknowledged and honored. Here you can view our best achievers.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad-2.png",
    href: "/student-achievements",
    tag: "Excellence",
    accent: "#8b5cf6",
    tagBg: "#ede9fe",
  },
  {
    title: "Safety & Security",
    description: "Student safety and well-being is our top priority, safeguarded through stringent modern security measures.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/security-768x610.png",
    href: "/safety-security",
    tag: "Wellbeing",
    accent: "#0d3b86",
    tagBg: "#dbeafe",
  },
];

export function DiscoverRainbow() {
  return (
    <section className="py-24" style={{ background: "#f8faff" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-5" style={{ background: "#eef5ff", color: "#0d3b86" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Life at Rainbow
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
            Let's Discover Rainbow!
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Committed to educating, strengthening, and nurturing every student — and empowering lifelong learners.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {highlights.map((item, index) => (
            <Link key={index} href={item.href}>
              <div
                className="group relative overflow-hidden rounded-3xl cursor-pointer"
                style={{ height: "360px" }}
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
                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)" }} />

                <div className="absolute top-4 left-4">
                  <span
                    className="text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{ background: item.tagBg, color: item.accent }}
                  >
                    {item.tag}
                  </span>
                </div>

                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 backdrop-blur-sm">
                  <ArrowUpRight size={15} className="text-white" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white font-black text-[17px] leading-tight mb-2">{item.title}</h3>
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
