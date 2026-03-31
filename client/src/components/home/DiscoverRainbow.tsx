const highlights = [
  {
    title: "Awards & Accomplishments",
    description: "Accolades earned by Rainbow International School for being one of the best & most promising international schools in Thane for the decade in the educational sphere.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad.jpg",
    href: "#",
  },
  {
    title: "Amenities & Facilities",
    description: "We offer globally recognized educational resources and state-of-the-art facilities that make Rainbow International School the best international school in Thane.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/amenities-facilities01-768x610.png",
    href: "#",
  },
  {
    title: "Student Achievements",
    description: "At Rainbow, Student Accomplishments are acknowledged and honored. Here you can view the list of our Best Achievers.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad-2.png",
    href: "#",
  },
  {
    title: "Safety & Security",
    description: "Student safety & well-being is our top-most priority and we ensure it is safeguarded through the stringent security measures of modern times.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/security-768x610.png",
    href: "#",
  },
  {
    title: "Beyond The Classroom",
    description: "The real aim of education is not only knowledge but also ACTION. We provide rigorous, comprehensive & cohesive learning programmes designed to meet the social, physical & cultural needs of students.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2023/07/web-art-work-for-pranit-d-02-1024x831.png",
    href: "#",
  },
];

export function DiscoverRainbow() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <span className="text-secondary font-bold tracking-widest uppercase text-sm">Explore</span>
          <h2 className="text-4xl font-serif font-bold text-primary mt-3 mb-4">
            Let's Discover the Rainbow!
          </h2>
          <p className="text-muted-foreground text-lg">
            The best international school in Thane committed to Educating, Strengthening, Nurturing Students, and Empowering all learners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {highlights.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="group relative overflow-hidden rounded-2xl shadow-lg aspect-[4/3] block"
              data-testid={`card-highlight-${index}`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-white font-serif font-bold text-xl mb-2">{item.title}</h3>
                <p className="text-white/80 text-sm leading-relaxed line-clamp-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
