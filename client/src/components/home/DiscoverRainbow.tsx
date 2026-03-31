import { Link } from "wouter";

const highlights = [
  {
    title: "Awards & Accomplishments",
    description: "Accolades earned by Rainbow International School for being one of the best & most promising international schools in Thane for the decade in the educational sphere.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad.jpg",
    href: "/awards-achievements",
  },
  {
    title: "Amenities & Facilities",
    description: "We offer globally recognized educational resources and state-of-the-art facilities that make Rainbow International School the best international school in Thane.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/amenities-facilities01-768x610.png",
    href: "/amenities",
  },
  {
    title: "Student Achievements",
    description: "At Rainbow, Student Accomplishments are acknowledged and honored. Here you can view the list of our Best Achievers.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad-2.png",
    href: "/student-achievements",
  },
  {
    title: "Safety & Security",
    description: "Student safety & well-being is our top-most priority and we ensure it is safeguarded through the stringent security measures of modern times.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/security-768x610.png",
    href: "/safety-security",
  },
];

export function DiscoverRainbow() {
  return (
    <section style={{ backgroundColor: "#f5e800" }} className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            Let's Discover the Rainbow!
          </h2>
          <p className="text-gray-700 text-sm md:text-base max-w-xl mx-auto">
            The best international school in Thane committed to Educating, Strengthening, Nurturing Students, and Empowering all learners.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, index) => (
            <Link key={index} href={item.href}>
              <div
                className="group cursor-pointer"
                data-testid={`card-highlight-${index}`}
              >
                <div className="relative overflow-hidden rounded-xl" style={{ height: "200px" }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/amenities-facilities01-768x610.png";
                    }}
                  />
                </div>
                <div className="pt-3 pb-2">
                  <h3 className="font-bold text-gray-900 text-base mb-1">{item.title}</h3>
                  <p className="text-gray-700 text-xs leading-relaxed">{item.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
