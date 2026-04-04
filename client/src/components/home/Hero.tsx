import { useState, lazy, Suspense } from "react";
import { Link } from "wouter";
import { ChevronRight, X } from "lucide-react";

const HeroForm = lazy(() => import("./HeroForm").then(m => ({ default: m.HeroForm })));

const seatData = [
  { grade: "Nursery", seats: 12, status: "Available" },
  { grade: "Jr. KG", seats: 4, status: "Almost Full" },
  { grade: "Sr. KG", seats: 5, status: "Almost Full" },
  { grade: "I", seats: 3, status: "Almost Full" },
  { grade: "II", seats: 3, status: "Almost Full" },
  { grade: "III", seats: 4, status: "Almost Full" },
  { grade: "IV", seats: 1, status: "Almost Full" },
  { grade: "V", seats: 1, status: "Almost Full" },
  { grade: "VI", seats: 2, status: "Almost Full" },
  { grade: "VII", seats: 0, status: "Closed" },
  { grade: "VIII", seats: 0, status: "Closed" },
  { grade: "IX", seats: 0, status: "Closed" },
  { grade: "X", seats: 0, status: "Closed" },
  { grade: "XI Science", seats: 20, status: "Available" },
  { grade: "XI Commerce", seats: 15, status: "Available" },
  { grade: "XI Humanities", seats: 23, status: "Available" },
  { grade: "XII Science", seats: 11, status: "Available" },
  { grade: "XII Commerce", seats: 13, status: "Available" },
  { grade: "XII Humanities", seats: 17, status: "Available" },
];

const quickLinks = [
  { label: "CBSE Disclosures", href: "/cbse-mandatory-public-disclosures" },
  { label: "Pre-Primary", href: "/pre-primary-school-thane" },
  { label: "Middle School", href: "/middle-school-section" },
  { label: "Senior Secondary", href: "/senior-secondary-section" },
  { label: "Career", href: "/career" },
];

function FormSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
      <div className="px-7 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-full bg-blue-500 flex-shrink-0" />
          <div>
            <div className="h-4 w-44 bg-gray-200 rounded mb-1.5" />
            <div className="h-3 w-36 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
      <div className="px-7 pb-6 space-y-3.5">
        {[1,2,3,4].map(i => (
          <div key={i} className="w-full h-12 bg-gray-100 rounded-xl animate-pulse" />
        ))}
        <div className="w-full h-12 bg-gray-100 rounded-xl animate-pulse" />
        <div className="w-full h-12 rounded-xl animate-pulse" style={{ background: "linear-gradient(135deg, #091a4f 0%, #1a56db 100%)", opacity: 0.6 }} />
      </div>
    </div>
  );
}

export function Hero() {
  const [showSeats, setShowSeats] = useState(false);

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden mb-[-2px]">
      <picture>
        <source srcSet="/images/students/hero-senior-secondary.webp" type="image/webp" />
        <img
          src="/images/students/hero-senior-secondary.jpg"
          alt="Rainbow International School senior secondary students in blazers"
          width={1920}
          height={1080}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover object-top"
          style={{ zIndex: 0 }}
        />
      </picture>
      <div className="absolute inset-0" style={{ zIndex: 1, background: "linear-gradient(135deg, rgba(9,26,79,0.92) 0%, rgba(13,59,134,0.82) 50%, rgba(9,26,79,0.75) 100%)" }} />
      <div className="absolute bottom-0 left-0 right-0 h-40" style={{ zIndex: 1, background: "linear-gradient(to bottom, transparent 0%, rgba(9,26,79,0.7) 40%, #091a4f 100%)" }} />

      <div className="relative container mx-auto px-4 lg:px-8 pt-48 pb-16 lg:pt-44 lg:pb-16" style={{ zIndex: 2 }}>
        <div className="flex flex-col lg:flex-row gap-10 xl:gap-16 items-center">

          <div className="flex-1">
            <button
              onClick={() => setShowSeats(true)}
              data-testid="button-check-seats"
              className="group inline-flex items-center gap-2.5 mb-6 px-5 py-2.5 rounded-full cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(251,191,36,0.1) 100%)", border: "1.5px solid rgba(251,191,36,0.5)" }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
              </span>
              <span className="text-amber-300 text-[11px] font-semibold tracking-[0.14em] uppercase">
                Check Seat Availability
              </span>
              <ChevronRight size={14} className="text-amber-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <h1 className="text-5xl md:text-6xl xl:text-7xl font-extrabold leading-[1.05] text-white mb-5 tracking-tight">
              Rainbow<br />
              <span className="text-amber-400">International</span><br />
              School
            </h1>

            <p className="text-blue-200/80 text-base md:text-lg leading-relaxed max-w-lg font-light mb-8">
              Thane West's premier CBSE K–12 school — where every child dares to dream, learns with joy, and grows into a lifelong learner.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              {[
                { num: "50K+", label: "Happy Students" },
                { num: "Since 2009", label: "Established" },
                { num: "3.5 Acres", label: "Campus" },
                { num: "CBSE #1130661", label: "Affiliation" },
              ].map((s, i) => (
                <div key={i} className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-center">
                  <div className="text-amber-400 text-sm font-extrabold leading-none mb-1">{s.num}</div>
                  <div className="text-blue-200/60 text-[10px] font-medium tracking-wide uppercase">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              <a href="#contact" data-testid="button-hero-know-more" className="inline-flex items-center gap-2 px-7 py-3.5 font-bold text-sm text-[#091a4f] rounded-full transition-all hover:shadow-lg hover:scale-[1.02]" style={{ background: "#fbbf24" }}>
                Enquire Now <ChevronRight size={15} />
              </a>
              <Link href="/about-rainbow-international-school" className="inline-flex items-center gap-2 px-7 py-3.5 font-bold text-sm border-2 border-white/30 text-white rounded-full hover:bg-white/10 transition-all" data-testid="link-hero-about">
                About Us
              </Link>
            </div>

            <div className="hidden lg:flex flex-wrap gap-2 pt-6 border-t border-white/10">
              {quickLinks.map((ql, i) => (
                <Link key={i} href={ql.href} className="px-4 py-2 rounded-full text-xs font-medium text-white/70 border border-white/15 hover:bg-white/10 hover:text-white transition-all" data-testid={`link-quick-${i}`}>
                  {ql.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-[380px] flex-shrink-0">
            <Suspense fallback={<FormSkeleton />}>
              <HeroForm />
            </Suspense>
          </div>

        </div>
      </div>

      {showSeats && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 9999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowSeats(false)}
          data-testid="modal-seats-overlay"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>Seat Availability — AY 2026–27</h2>
                <p className="text-xs text-gray-500 mt-0.5">Rainbow International School, Thane West</p>
              </div>
              <button
                onClick={() => setShowSeats(false)}
                data-testid="button-close-seats"
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-sm" data-testid="table-seats">
                <thead>
                  <tr style={{ background: "#091a4f" }}>
                    <th className="text-left px-6 py-3 text-white font-semibold text-xs uppercase tracking-wider">Grade</th>
                    <th className="text-center px-6 py-3 text-white font-semibold text-xs uppercase tracking-wider">Seats Available</th>
                    <th className="text-center px-6 py-3 text-white font-semibold text-xs uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {seatData.map((row, i) => (
                    <tr key={i} className={`border-b border-gray-100 ${row.status === "Closed" ? "bg-gray-50" : "hover:bg-blue-50/30"}`}>
                      <td className={`px-6 py-3 font-medium ${row.status === "Closed" ? "text-red-500" : "text-gray-800"}`}>{row.grade}</td>
                      <td className="px-6 py-3 text-center font-bold text-gray-700">{row.seats}</td>
                      <td className="px-6 py-3 text-center">
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                          style={
                            row.status === "Available"
                              ? { background: "#dcfce7", color: "#16a34a" }
                              : row.status === "Almost Full"
                              ? { background: "#fff7ed", color: "#ea580c" }
                              : { background: "#fee2e2", color: "#dc2626" }
                          }
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-gray-50">
              <p className="text-xs text-gray-500">Seats are subject to availability. Contact us to reserve.</p>
              <a
                href="#contact"
                onClick={() => setShowSeats(false)}
                className="px-6 py-2.5 text-sm font-bold text-white rounded-full hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(135deg, #091a4f 0%, #1a56db 100%)" }}
                data-testid="button-seats-enquire"
              >
                Enquire Now
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
