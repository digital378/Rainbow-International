import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const activities = [
  { icon: "🏛️", label: "Tours & Visits" },
  { icon: "🎭", label: "Exhibitions" },
  { icon: "🎯", label: "Clubs" },
  { icon: "🌿", label: "Promoting Green" },
  { icon: "🤲", label: "Dignity of Labour" },
];

export function BeyondClassroomSection() {
  return (
    <section className="py-20" style={{ background: "#f8faff" }}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 order-2 lg:order-1">
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-5 px-4 py-1.5 rounded-full" style={{ background: "#fee2e2", color: "#c62828" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#c62828" }} />
              Extra Curricular
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
              Beyond The<br />
              <span style={{ color: "#0d3b86" }}>Classroom</span>
            </h2>
            <p className="text-gray-600 text-base leading-relaxed mb-3">
              The real aim of education is not only knowledge but also <strong>ACTION.</strong>
            </p>
            <p className="text-gray-600 text-base leading-relaxed mb-8">
              We provide rigorous, comprehensive & Cohesive learning. PROGRAMME that is designed to meet the Social Physical & Cultural needs of an International student body as well
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {activities.map((act, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white shadow-sm text-sm font-semibold text-gray-700 hover:border-blue-300 transition-colors">
                  <span>{act.icon}</span>
                  <span>{act.label}</span>
                </div>
              ))}
            </div>

            <Link href="/beyond-the-classroom">
              <button
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-white text-sm transition-all hover:scale-105 hover:shadow-lg"
                style={{ background: "#0d3b86" }}
                data-testid="button-beyond-classroom"
              >
                Know more <ArrowRight size={16} />
              </button>
            </Link>
          </div>

          <div className="flex-1 flex justify-center order-1 lg:order-2">
            <div className="relative">
              <div className="w-72 h-72 md:w-80 md:h-80 rounded-full overflow-hidden border-8 border-white shadow-2xl">
                <img
                  src="https://rainbowinternationalschool.in/wp-content/uploads/2023/07/web-art-work-for-pranit-d-02-1024x831.png"
                  alt="Beyond The Classroom"
                  className="w-full h-full object-contain bg-blue-50"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                <img src="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/pre-primary-school-nursery-jrkg-srkg-admissions-ad.jpg" alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                <img src="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/amenities-facilities01-768x610.png" alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
