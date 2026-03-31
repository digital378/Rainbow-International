import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

const highlights = [
  {
    title: "Awards & Accomplishments",
    description: "Accolades earned by Rainbow International School for being one of the best & most promising international schools in Thane for the decade in the educational sphere.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad.jpg",
    href: "/awards-achievements",
    tag: "Recognition",
  },
  {
    title: "Amenities & Facilities",
    description: "We offer globally recognized educational resources and state-of-the-art facilities that make Rainbow International School the best international school in Thane.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/amenities-facilities01-768x610.png",
    href: "/amenities",
    tag: "Campus",
  },
  {
    title: "Student Achievements",
    description: "At Rainbow, Student Accomplishments are acknowledged and honored. Here you can view the list of our Best Achievers.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad-2.png",
    href: "/student-achievements",
    tag: "Excellence",
  },
  {
    title: "Safety & Security",
    description: "Student safety & well-being is our top-most priority and we ensure it is safeguarded through the stringent security measures of modern times.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/security-768x610.png",
    href: "/safety-security",
    tag: "Wellbeing",
  },
];

export function DiscoverRainbow() {
  return (
    <section className="py-20 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #f9c900 0%, #ffd600 60%, #ffde00 100%)" }}>
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: "radial-gradient(circle, #0a1f5c 1px, transparent 1px)",
        backgroundSize: "30px 30px"
      }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold tracking-widest uppercase mb-3 px-4 py-1.5 rounded-full bg-white/40 text-gray-800">
            Explore Rainbow
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
            Let's Discover the Rainbow!
          </h2>
          <p className="text-gray-700 text-base max-w-2xl mx-auto leading-relaxed">
            The best international school in Thane committed to Educating, Strengthening, Nurturing Students, and Empowering all learners.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {highlights.map((item, index) => (
            <Link key={index} href={item.href}>
              <div
                className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer bg-white"
                style={{ height: "320px" }}
                data-testid={`card-highlight-${index}`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                <div className="absolute top-4 left-4">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/30">
                    {item.tag}
                  </span>
                </div>

                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                  <ArrowUpRight size={14} className="text-white" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white font-black text-lg mb-1 leading-tight">{item.title}</h3>
                  <p className="text-white/70 text-xs leading-relaxed line-clamp-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
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
