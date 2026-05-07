import { Link } from "wouter";
import { CalendarCheck, GraduationCap, BookOpen, MapPin, BadgeCheck, Shield, Bus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const benefits = [
  { icon: GraduationCap, title: "CBSE Affiliated Curriculum",                desc: "CBSE No. 1130661. Rigorous, board-recognised curriculum from Nursery through Class 12.",                  color: "#e0edff", accent: "#0d3b86" },
  { icon: BookOpen,      title: "Nursery to Class 12 Under One Roof",        desc: "No school switches. One campus, one community for a complete K-12 learning journey.",                    color: "#fff3e0", accent: "#d97706" },
  { icon: MapPin,        title: "3.5-Acre Green Campus",                     desc: "Pool, football turf, cricket ground, labs, library — all on one spacious Brahmand campus.",              color: "#e0f7f0", accent: "#059669" },
  { icon: BadgeCheck,    title: "Strong Academics & Co-curricular Learning", desc: "Multiple Intelligence pedagogy, Olympiad coaching, project-based learning and 25+ annual events.",       color: "#f3e0ff", accent: "#7c3aed" },
  { icon: Shield,        title: "Safe & Caring Environment",                 desc: "CCTV, metal detectors, female-led Pre-Primary wing, on-campus infirmary and paediatrician on call.",     color: "#fdf0e0", accent: "#ea580c" },
  { icon: Bus,           title: "Transport & Parent Communication",          desc: "GPS-tracked buses on 30+ Thane routes. Regular PTMs, digital updates and counsellor support.",           color: "#e0f0ff", accent: "#0891b2" },
];

const stats = [
  { display: "Since 2009", label: "Established"      },
  { display: "3,000+",     label: "Students"         },
  { display: "3.5 Acres",  label: "Campus"           },
  { display: "CBSE",       label: "Affiliation #1130661" },
];

function StatChip({ display, label }: { display: string; label: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`bg-white rounded-2xl p-5 text-center shadow-sm border border-gray-100 hover:shadow-md hover:border-amber-200 transition-all ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`} style={{ transition: "opacity 0.5s, transform 0.5s" }}>
      <div className="text-2xl font-extrabold text-[#091a4f] leading-none mb-1">{display}</div>
      <div className="text-xs font-medium text-gray-500 leading-snug">{label}</div>
    </div>
  );
}

export function AboutPreview() {
  return (
    <section className="py-20" style={{ background: "#f8fafc" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="text-amber-500 text-xs font-semibold tracking-[0.2em] uppercase">Why Choose Us</span>
            <div className="w-8 h-0.5 bg-amber-400 mx-auto mt-2" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-3 tracking-tight">
            Why Parents Trust{" "}
            <span style={{ color: "#091a4f" }}>Rainbow International School</span>
          </h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            A school that cares as much about character as it does about academic results — right here in Thane.
          </p>
        </div>

        {/* 6 benefit cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-100 transition-all"
                data-testid={`card-benefit-${i}`}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: b.color }}>
                  <Icon className="w-6 h-6" style={{ color: b.accent }} />
                </div>
                <h3 className="font-extrabold text-gray-900 text-sm mb-1.5 leading-snug">{b.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Stat strip + CTA */}
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
            {stats.map((s, i) => <StatChip key={i} display={s.display} label={s.label} />)}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <a
              href="/admissions"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 font-bold text-[#091a4f] text-sm transition-all duration-300 hover:opacity-90 hover:shadow-lg"
              style={{ background: "#fbbf24", borderRadius: "9999px" }}
              data-testid="btn-about-book-visit"
            >
              <CalendarCheck size={16} />
              Book a Campus Visit
            </a>
            <Link
              href="/about-rainbow-international-school"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 font-bold text-white text-sm transition-all duration-300 hover:opacity-90 hover:shadow-lg"
              style={{ background: "#091a4f", borderRadius: "9999px" }}
              data-testid="btn-about-learn-more"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
