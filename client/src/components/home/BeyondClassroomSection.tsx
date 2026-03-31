import { Link } from "wouter";

export function BeyondClassroomSection() {
  return (
    <>
      <div className="relative overflow-hidden leading-none" style={{ height: "80px", background: "white" }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,30 1440,40 L1440,80 L0,80 Z" fill="#e03535" />
        </svg>
      </div>

      <section style={{ backgroundColor: "#e03535" }} className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 flex justify-center">
              <div className="relative w-72 h-72 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-white/20" />
                <img
                  src="https://rainbowinternationalschool.in/wp-content/uploads/2023/07/web-art-work-for-pranit-d-02-1024x831.png"
                  alt="Beyond The Classroom"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute top-4 left-0 bg-white/90 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full shadow flex items-center gap-1">
                  🏛️ Tours & Visits
                </div>
                <div className="absolute top-4 right-0 bg-white/90 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full shadow flex items-center gap-1">
                  🎭 Exhibitions
                </div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full shadow flex items-center gap-1">
                  🎯 Clubs
                </div>
                <div className="absolute bottom-8 left-4 bg-white/90 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full shadow flex items-center gap-1">
                  🌿 Promoting Green
                </div>
                <div className="absolute bottom-4 right-4 bg-white/90 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full shadow flex items-center gap-1">
                  🤲 Dignity of Labour
                </div>
              </div>
            </div>

            <div className="flex-1 text-white">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                Beyond The<br />Classroom
              </h2>
              <p className="text-white/90 text-sm mb-3 leading-relaxed">
                The real aim of education is not only knowledge but also ACTION.
              </p>
              <p className="text-white/90 text-sm mb-6 leading-relaxed">
                We provide rigorous, comprehensive & Cohesive learning. PROGRAMME that is designed to meet the Social Physical & Cultural needs of an International student body as well
              </p>
              <Link href="/beyond-the-classroom">
                <button
                  className="border-2 border-white text-white font-semibold px-7 py-2 rounded-full hover:bg-white hover:text-red-600 transition-all duration-200 text-sm"
                  data-testid="button-beyond-classroom"
                >
                  Know more
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="relative overflow-hidden leading-none" style={{ height: "80px", background: "#e03535" }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,40 C360,0 720,80 1080,40 C1260,20 1380,50 1440,40 L1440,0 L0,0 Z" fill="white" />
        </svg>
      </div>
    </>
  );
}
