import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

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
    label: "Class-11 & Class-12",
    title: "Senior Secondary Section",
    description: "A Major Advancement toward Students' Professional Objectives & Aspirations",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/senior-secondary-768x513.png",
    href: "/senior-secondary-section",
  },
];

export function AcademicSections() {
  return (
    <section id="academics" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-4 px-4 py-1.5 rounded-full" style={{ background: "#e8f4fb", color: "#0d3b86" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#0d3b86" }} />
            Academic Programs
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">At A Glance</h2>
          <p className="text-gray-500 text-base">Nurturing Children's Confidence and Skills for a Promising Future.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {sections.slice(0, 3).map((section, index) => (
            <Link key={index} href={section.href}>
              <div
                className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-400 hover:-translate-y-1.5 cursor-pointer"
                data-testid={`card-section-${index}`}
              >
                <div className="relative overflow-hidden" style={{ height: "200px" }}>
                  <img
                    src={section.image}
                    alt={section.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
                  />
                </div>
                <div className="p-6">
                  <span className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3" style={{ background: "#e8f4fb", color: "#0d3b86" }}>
                    {section.label}
                  </span>
                  <h3 className="font-black text-gray-900 text-xl mb-2">{section.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{section.description}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-bold" style={{ color: "#0d3b86" }} data-testid={`link-section-${index}`}>
                    Know More <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {sections.slice(3).map((section, index) => (
            <Link key={index + 3} href={section.href}>
              <div
                className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-400 hover:-translate-y-1.5 cursor-pointer"
                data-testid={`card-section-${index + 3}`}
              >
                <div className="relative overflow-hidden" style={{ height: "200px" }}>
                  <img
                    src={section.image}
                    alt={section.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
                  />
                </div>
                <div className="p-6">
                  <span className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3" style={{ background: "#e8f4fb", color: "#0d3b86" }}>
                    {section.label}
                  </span>
                  <h3 className="font-black text-gray-900 text-xl mb-2">{section.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{section.description}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-bold" style={{ color: "#0d3b86" }} data-testid={`link-section-${index + 3}`}>
                    Know More <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/pre-primary-school-thane">
            <button className="px-8 py-3.5 rounded-full font-bold text-sm border-2 transition-all hover:scale-105" style={{ borderColor: "#0d3b86", color: "#0d3b86" }}>
              View All Programmes
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
