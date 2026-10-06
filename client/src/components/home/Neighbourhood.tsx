import { HOME_NEIGHBOURHOOD } from "@shared/content/home";
import { Link } from "wouter";
import { MapPin, Clock, Bus, TreePine, CalendarCheck, Navigation } from "lucide-react";

const areas = HOME_NEIGHBOURHOOD.areas;

const features = [
  { icon: MapPin, color: "#e0edff", accent: "#0d3b86" },
  { icon: Bus, color: "#e0f7f0", accent: "#059669" },
  { icon: TreePine, color: "#fff7e0", accent: "#d97706" },
  { icon: Clock, color: "#f3e0ff", accent: "#7c3aed" },
].map((visual, index) => ({ ...visual, ...HOME_NEIGHBOURHOOD.features[index] }));

export function Neighbourhood() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="text-amber-500 text-xs font-semibold tracking-[0.2em] uppercase">{HOME_NEIGHBOURHOOD.eyebrow}</span>
            <div className="w-8 h-0.5 bg-amber-400 mx-auto mt-2" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-3 tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {HOME_NEIGHBOURHOOD.title}
          </h2>
          <p className="text-gray-500 text-base max-w-2xl mx-auto">
            {HOME_NEIGHBOURHOOD.sub}
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
              {HOME_NEIGHBOURHOOD.areaTitle}
            </h3>
            <div className="space-y-2.5 mb-6">
              {areas.map((a, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5 rounded-xl bg-gray-50 border border-gray-100" data-testid={`row-area-${i}`}>
                  <div className="flex items-center gap-3">
                    <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700">{a.name}</span>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "#eef5ff", color: "#0d3b86" }}>
                    {a.time} {HOME_NEIGHBOURHOOD.drive}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              {HOME_NEIGHBOURHOOD.address}
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
                {HOME_NEIGHBOURHOOD.buttons[0].label}
              </Link>
              <a
                href="/admissions"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-[#091a4f] rounded-full transition-all hover:opacity-90"
                style={{ background: "#fbbf24" }}
                data-testid="btn-neighbourhood-book-visit"
              >
                <CalendarCheck size={14} />
                {HOME_NEIGHBOURHOOD.buttons[1].label}
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
                {HOME_NEIGHBOURHOOD.buttons[2].label}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
