import { Link } from "wouter";

const sections = [
  {
    label: "Nursery | Jr KG | Sr KG",
    title: "Pre-Primary Section",
    description: "Playful Learning for Stronger Foundation: Nursery, Junior & Senior KG | Pre-Primary School",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/pre-primary-school-nursery-jrkg-srkg-admissions-ad.jpg",
    href: "/pre-primary-school-thane",
  },
  {
    label: "Class-1 to Class-5",
    title: "Primary Section",
    description: "The Five Fundamental Skills Approach Language, Math, Science, Creativity & Interpersonal",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Primary-scetion-768x513.png",
    href: "/primary-section",
  },
  {
    label: "Class-6 to Class-8",
    title: "Middle Section",
    description: "Multi-dimensional Curriculum to Develop Creativity, Intellectual Curiosity & Maturity",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/middle-section-768x513.png",
    href: "/middle-school-section",
  },
  {
    label: "Class-9 and Class-10",
    title: "Secondary Section",
    description: "Scholastic and Co-scholastic CBSE Curriculum Taught with the help of Technology",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/middle-school-class-6-class-8-international-school-admission-ad-2.jpg",
    href: "/secondary-section",
  },
  {
    label: "Class-11",
    title: "Senior Secondary Section",
    description: "A Major Advancement toward Students' Professional Objectives & Aspirations",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/senior-secondary-768x513.png",
    href: "/senior-secondary-section",
  },
];

export function AcademicSections() {
  return (
    <section id="academics" style={{ backgroundColor: "#e03535" }} className="pt-0 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 pt-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">At A Glance</h2>
          <p className="text-white/80 text-sm md:text-base">
            Nurturing Children's Confidence and Skills for a Promising Future.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.slice(0, 3).map((section, index) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-lg"
                data-testid={`card-section-${index}`}
              >
                <div className="relative overflow-hidden" style={{ height: "180px" }}>
                  <img
                    src={section.image}
                    alt={section.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Primary-scetion-768x513.png";
                    }}
                  />
                </div>
                <div className="p-4">
                  <p className="text-gray-400 text-xs mb-1">({section.label})</p>
                  <h3 className="font-bold text-gray-900 text-base mb-1">{section.title}</h3>
                  <p className="text-gray-500 text-xs mb-3 leading-relaxed">{section.description}</p>
                  <Link href={section.href}>
                    <span
                      className="text-sm font-semibold cursor-pointer hover:underline"
                      style={{ color: "#1a3a6b" }}
                      data-testid={`link-section-${index}`}
                    >
                      Know More
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto w-full">
            {sections.slice(3).map((section, index) => (
              <div
                key={index + 3}
                className="bg-white rounded-xl overflow-hidden shadow-lg"
                data-testid={`card-section-${index + 3}`}
              >
                <div className="relative overflow-hidden" style={{ height: "180px" }}>
                  <img
                    src={section.image}
                    alt={section.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/senior-secondary-768x513.png";
                    }}
                  />
                </div>
                <div className="p-4">
                  <p className="text-gray-400 text-xs mb-1">({section.label})</p>
                  <h3 className="font-bold text-gray-900 text-base mb-1">{section.title}</h3>
                  <p className="text-gray-500 text-xs mb-3 leading-relaxed">{section.description}</p>
                  <Link href={section.href}>
                    <span
                      className="text-sm font-semibold cursor-pointer hover:underline"
                      style={{ color: "#1a3a6b" }}
                      data-testid={`link-section-${index + 3}`}
                    >
                      Know More
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
