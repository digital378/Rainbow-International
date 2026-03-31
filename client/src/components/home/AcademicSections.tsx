import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const sections = [
  {
    label: "Nursery | Jr KG | Sr KG",
    title: "Pre-Primary Section",
    description: "Playful Learning for Stronger Foundation: Nursery, Junior & Senior KG | Pre-Primary School",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/pre-primary-school-nursery-jrkg-srkg-admissions-ad.jpg",
    href: "/pre-primary-school-thane",
    accent: "#ffd600",
  },
  {
    label: "Class-1 to Class-5",
    title: "Primary Section",
    description: "The Five Fundamental Skills Approach Language, Math, Science, Creativity & Interpersonal",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Primary-scetion-768x513.png",
    href: "/primary-section",
    accent: "#64b5f6",
  },
  {
    label: "Class-6 to Class-8",
    title: "Middle Section",
    description: "Multi-dimensional Curriculum to Develop Creativity, Intellectual Curiosity & Maturity",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/middle-section-768x513.png",
    href: "/middle-school-section",
    accent: "#81c784",
  },
  {
    label: "Class-9 and Class-10",
    title: "Secondary Section",
    description: "Scholastic and Co-scholastic CBSE Curriculum Taught with the help of Technology",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/middle-school-class-6-class-8-international-school-admission-ad-2.jpg",
    href: "/secondary-section",
    accent: "#ef9a9a",
  },
  {
    label: "Class-11 & 12",
    title: "Senior Secondary Section",
    description: "A Major Advancement toward Students' Professional Objectives & Aspirations",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/senior-secondary-768x513.png",
    href: "/senior-secondary-section",
    accent: "#ce93d8",
  },
];

export function AcademicSections() {
  return (
    <section id="academics" style={{ background: "linear-gradient(160deg, #c62828 0%, #e53935 60%, #b71c1c 100%)" }} className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: "repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)",
        backgroundSize: "20px 20px"
      }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold tracking-widest uppercase mb-3 px-4 py-1.5 rounded-full bg-white/20 text-white/90">
            Academic Programs
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-3">At A Glance</h2>
          <p className="text-red-100 text-base max-w-md mx-auto">
            Nurturing Children's Confidence and Skills for a Promising Future.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
          {sections.slice(0, 3).map((section, index) => (
            <Link key={index} href={section.href}>
              <div
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-400 hover:-translate-y-2 cursor-pointer"
                data-testid={`card-section-${index}`}
              >
                <div className="relative overflow-hidden" style={{ height: "190px" }}>
                  <img
                    src={section.image}
                    alt={section.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-xs font-bold px-3 py-1 rounded-full text-gray-900" style={{ background: section.accent }}>
                      {section.label}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="w-8 h-1 rounded-full mb-3 transition-all duration-300 group-hover:w-12" style={{ background: section.accent }} />
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{section.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{section.description}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-bold" style={{ color: "#0d3b86" }} data-testid={`link-section-${index}`}>
                    Know More <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {sections.slice(3).map((section, index) => (
            <Link key={index + 3} href={section.href}>
              <div
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-400 hover:-translate-y-2 cursor-pointer"
                data-testid={`card-section-${index + 3}`}
              >
                <div className="relative overflow-hidden" style={{ height: "190px" }}>
                  <img
                    src={section.image}
                    alt={section.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-xs font-bold px-3 py-1 rounded-full text-gray-900" style={{ background: section.accent }}>
                      {section.label}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="w-8 h-1 rounded-full mb-3 transition-all duration-300 group-hover:w-12" style={{ background: section.accent }} />
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{section.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{section.description}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-bold" style={{ color: "#0d3b86" }} data-testid={`link-section-${index + 3}`}>
                    Know More <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full" style={{ height: "80px" }} xmlns="http://www.w3.org/2000/svg">
          <path d="M0,40 C360,0 720,80 1080,40 C1260,20 1380,60 1440,40 L1440,80 L0,80 Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
