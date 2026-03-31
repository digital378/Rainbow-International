import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const activities = [
  { icon: "🏛️", label: "Tours & Visits" },
  { icon: "🎭", label: "Exhibitions" },
  { icon: "🎯", label: "Subject Clubs" },
  { icon: "🌿", label: "Promoting Green" },
  { icon: "🤲", label: "Dignity of Labour" },
  { icon: "🎨", label: "Arts & Culture" },
];

export function BeyondClassroomSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16 xl:gap-24">
          <div className="flex-1 order-2 lg:order-1 max-w-lg">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-6" style={{ background: "#fff1f2", color: "#dc2626" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              Extra Curricular
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-5">
              Beyond The<br />
              <span style={{ color: "#0d3b86" }}>Classroom</span>
            </h2>
            <p className="text-gray-600 text-[15px] leading-[1.8] mb-3">
              The real aim of education is not only knowledge but also <strong>ACTION.</strong>
            </p>
            <p className="text-gray-600 text-[15px] leading-[1.8] mb-8">
              We provide a rigorous, comprehensive and cohesive learning programme that is designed to meet the social, physical and cultural needs of our entire student community — preparing them for the real world.
            </p>

            <div className="flex flex-wrap gap-2.5 mb-10">
              {activities.map((act, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white shadow-sm text-sm font-semibold text-gray-700 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <span className="text-base">{act.icon}</span>
                  <span>{act.label}</span>
                </div>
              ))}
            </div>

            <Link href="/beyond-the-classroom">
              <button
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-bold text-white text-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
                style={{ background: "#0d3b86" }}
                data-testid="button-beyond-classroom"
              >
                Know More
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
          </div>

          <div className="flex-1 flex justify-center order-1 lg:order-2">
            <div className="relative">
              <div
                className="w-80 h-80 md:w-96 md:h-96 rounded-[40px] overflow-hidden shadow-2xl border-4 border-white"
                style={{ background: "#eef5ff" }}
              >
                <img
                  src="https://rainbowinternationalschool.in/wp-content/uploads/2023/07/web-art-work-for-pranit-d-02-1024x831.png"
                  alt="Beyond The Classroom at Rainbow International School"
                  className="w-full h-full object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <div className="absolute -top-5 -right-5 w-28 h-28 rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                <img
                  src="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/pre-primary-school-nursery-jrkg-srkg-admissions-ad.jpg"
                  alt="Pre-primary activities"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <div className="absolute -bottom-5 -left-5 w-24 h-24 rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                <img
                  src="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/amenities-facilities01-768x610.png"
                  alt="Campus amenities"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <div
                className="absolute -bottom-8 right-8 px-5 py-3 rounded-2xl shadow-xl border border-white bg-white"
              >
                <p className="text-xs font-medium text-gray-500 mb-0.5">Annual events</p>
                <p className="text-lg font-black" style={{ color: "#0d3b86" }}>25+</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
