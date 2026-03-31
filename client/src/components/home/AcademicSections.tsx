import { ArrowRight } from "lucide-react";

const sections = [
  {
    label: "Nursery | Jr KG | Sr KG",
    title: "Pre-Primary Section",
    description: "Playful Learning for Stronger Foundation: Nursery, Junior & Senior KG | Pre-Primary School",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/pre-primary-school-nursery-jrkg-srkg-admissions-ad.jpg",
    href: "#contact",
  },
  {
    label: "Class 1 to Class 5",
    title: "Primary Section",
    description: "The Five Fundamental Skills Approach: Language, Math, Science, Creativity & Interpersonal",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Primary-scetion-768x513.png",
    href: "#contact",
  },
  {
    label: "Class 6 to Class 8",
    title: "Middle Section",
    description: "Multi-dimensional Curriculum to Develop Creativity, Intellectual Curiosity & Maturity",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/middle-section-768x513.png",
    href: "#contact",
  },
  {
    label: "Class 9 and Class 10",
    title: "Secondary Section",
    description: "Scholastic and Co-scholastic CBSE Curriculum Taught with the help of Technology",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/middle-school-class-6-class-8-international-school-admission-ad-2.jpg",
    href: "#contact",
  },
  {
    label: "Class 11 & 12",
    title: "Senior Secondary Section",
    description: "A Major Advancement toward Students' Professional Objectives & Aspirations",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/senior-secondary-768x513.png",
    href: "#contact",
  },
];

export function AcademicSections() {
  return (
    <section id="academics" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-secondary font-bold tracking-widest uppercase text-sm">Programs</span>
          <h2 className="text-4xl font-serif font-bold text-primary mt-3 mb-4">At A Glance</h2>
          <p className="text-muted-foreground text-lg">
            Nurturing Children's Confidence and Skills for a Promising Future.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              data-testid={`card-section-${index}`}
            >
              <div className="relative overflow-hidden aspect-[4/3]">
                <img
                  src={section.image}
                  alt={section.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {section.label}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-serif font-bold text-primary mb-2">{section.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{section.description}</p>
                <a
                  href={section.href}
                  className="inline-flex items-center text-primary font-semibold text-sm hover:text-primary/80 group/link"
                  data-testid={`link-section-${index}`}
                >
                  Know More
                  <ArrowRight className="ml-1 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
