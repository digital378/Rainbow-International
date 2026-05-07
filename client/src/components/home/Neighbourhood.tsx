import { Link } from "wouter";
import { MapPin, Clock, Bus, TreePine, CalendarCheck, Navigation } from "lucide-react";

const areas = [
  { name: "Brahmand",           time: "2 min"  },
  { name: "Hiranandani Estate", time: "5 min"  },
  { name: "Manpada",            time: "7 min"  },
  { name: "Ghodbunder Road",    time: "8 min"  },
  { name: "Patlipada",          time: "10 min" },
  { name: "Kavesar",            time: "10 min" },
  { name: "Pokhran Road",       time: "12 min" },
  { name: "Kolshet",            time: "12 min" },
];

const features = [
  { icon: MapPin,   title: "Central Thane Location",  desc: "Situated in Brahmand Phase 4, easily accessible from all major Thane neighbourhoods.",                                    color: "#e0edff", accent: "#0d3b86" },
  { icon: Bus,      title: "Door-to-Door Transport",   desc: "A fleet of GPS-tracked school buses covers 30+ routes across all of Thane.",                                               color: "#e0f7f0", accent: "#059669" },
  { icon: TreePine, title: "3.5-Acre Green Campus",   desc: "Open-air play areas, football turf, swimming pool and landscaped gardens — all within the city.",                          color: "#fff7e0", accent: "#d97706" },
  { icon: Clock,    title: "Flexible Timings",         desc: "Staggered entry and exit windows for Pre-Primary and Senior sections, making drop-off convenient for working parents.",   color: "#f3e0ff", accent: "#7c3aed" },
];

export function Neighbourhood() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="text-amber-500 text-xs font-semibold tracking-[0.2em] uppercase">Location & Access</span>
            <div className="w-8 h-0.5 bg-amber-400 mx-auto mt-2" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-3 tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            A Top School, Right in Your Neighbourhood
          </h2>
          <p className="text-gray-500 text-base max-w-2xl mx-auto">
            Located in the heart of Thane, Rainbow International School is just minutes away from most residential areas — making the daily commute easy for families.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-12">
          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="rounded-2xl p-5 border border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow" data-testid={`card-neighbourhood-${i}`}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: f.color }}>
                    <Icon size={20} style={{ color: f.accent }} />
                  </div>
                  <h3 className="font-extrabold text-sm text-gray-900 mb-1.5">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Distance list */}
          <div>
            <h3 className="font-extrabold text-lg text-gray-900 mb-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              How Far Are We From You?
            </h3>
            <div className="space-y-2.5 mb-6">
              {areas.map((a, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5 rounded-xl bg-gray-50 border border-gray-100" data-testid={`row-area-${i}`}>
                  <div className="flex items-center gap-3">
                    <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700">{a.name}</span>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "#eef5ff", color: "#0d3b86" }}>
                    {a.time} drive
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Cosmos Arcade, Brahmand Phase 4, Thane 400607
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/amenities"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-full border-2 transition-all hover:bg-gray-50"
                style={{ borderColor: "#0d3b86", color: "#0d3b86" }}
                data-testid="btn-transport-availability"
              >
                <Bus size={14} />
                Check Transport
              </Link>
              <a
                href="/admissions"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-[#091a4f] rounded-full transition-all hover:opacity-90"
                style={{ background: "#fbbf24" }}
                data-testid="btn-neighbourhood-book-visit"
              >
                <CalendarCheck size={14} />
                Book a Campus Visit
              </a>
              <a
                href="https://maps.google.com/?q=Rainbow+International+School+Thane"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white rounded-full transition-all hover:opacity-90"
                style={{ background: "#091a4f" }}
                data-testid="btn-get-directions"
              >
                <Navigation size={14} />
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
