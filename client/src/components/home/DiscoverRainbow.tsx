import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

const highlights = [
  {
    title: "Awards & Accomplishments",
    description: "Accolades earned by Rainbow International School for being one of the best & most promising international schools in Thane for the decade in the educational sphere.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad.jpg",
    href: "/awards-achievements",
    tag: "Recognition",
    color: "#f59e0b",
  },
  {
    title: "Amenities & Facilities",
    description: "We offer globally recognized educational resources and state-of-the-art facilities that make Rainbow International School the best international school in Thane.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/amenities-facilities01-768x610.png",
    href: "/amenities",
    tag: "Campus",
    color: "#10b981",
  },
  {
    title: "Student Achievements",
    description: "At Rainbow, Student Accomplishments are acknowledged and honored. Here you can view the list of our Best Achievers.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad-2.png",
    href: "/student-achievements",
    tag: "Excellence",
    color: "#8b5cf6",
  },
  {
    title: "Safety & Security",
    description: "Student safety & well-being is our top-most priority and we ensure it is safeguarded through the stringent security measures of modern times.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/security-768x610.png",
    href: "/safety-security",
    tag: "Wellbeing",
    color: "#3b82f6",
  },
];

export function DiscoverRainbow() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-4 px-4 py-1.5 rounded-full" style={{ background: "#e8f4fb", color: "#0d3b86" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#0d3b86" }} />
            Life at Rainbow
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">Let's Discover the Rainbow!</h2>
          <p className="text-gray-500 text-base max-w-2xl mx-auto leading-relaxed">
            The best international school in Thane committed to Educating, Strengthening, Nurturing Students, and Empowering all learners.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {highlights.map((item, index) => (
            <Link key={index} href={item.href}>
              <div
                className="group relative overflow-hidden rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border border-gray-100"
                style={{ height: "340px" }}
                data-testid={`card-highlight-${index}`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-4 left-4">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white backdrop-blur-sm border border-white/30" style={{ background: `${item.color}cc` }}>
                    {item.tag}
                  </span>
                </div>

                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 border border-white/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110 backdrop-blur-sm">
                  <ArrowUpRight size={15} className="text-white" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white font-black text-lg leading-tight mb-2">{item.title}</h3>
                  <p className="text-white/70 text-xs leading-relaxed opacity-0 group-hover:opacity-100 transition-all duration-300 line-clamp-3">
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
