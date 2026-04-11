import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { useState } from "react";
import { Play, X } from "lucide-react";

// ── 4 Highlight Cards ─────────────────────────────────────────────
const highlights = [
  {
    image: "/images/gallery/support/infirmary.jpg",
    title: "Infirmary, Ambulance & Trained Nurse",
  },
  {
    image: "/images/home/discover/amenities.jpg",
    title: "CCTV Surveillance & Metal Detectors",
  },
  {
    image: "/images/extra/campus/school-bus.jpg",
    title: "CCTV & GPS enabled Transport",
  },
  {
    image: "/images/preschool/nursery-kids.jpg",
    title: "100% Female Staff for Preschool",
  },
];

// ── Mind-map items ─────────────────────────────────────────────────
const leftItems = [
  { label: "Infirmary and\nTrained Nurse",           color: "#ef4444" },
  { label: "Equipped Ambulance\nAvailability",        color: "#f97316" },
  { label: "First Aid\nTraining",                     color: "#16a34a" },
  { label: "Self Defence\nTraining",                  color: "#2563eb" },
  { label: "CCTV Surveillance\n– 160 Cameras",        color: "#7c3aed" },
  { label: "CCTV Enabled &\nGPS Tracked Transport",   color: "#be185d" },
];

const rightItems = [
  { label: "Trained Drivers &\nMarshalls in Buses",        color: "#0ea5e9" },
  { label: "Lady Attendants\nin Buses",                    color: "#f97316" },
  { label: "100% Female\nStaff for Preschool",             color: "#ec4899" },
  { label: "Escort Card Policy\nfor Parents",              color: "#8b5cf6" },
  { label: "Alert Security Personnel\nwith Walkie talkies", color: "#14b8a6" },
  { label: "CCTV Enabled &\nGPS Tracked Transport",        color: "#be185d" },
];

function SafetyMindMap() {
  // SVG mind-map: centre shield, 6 items each side
  const cx = 420, cy = 310;
  const shieldW = 110, shieldH = 120;

  // Vertical positions for 6 items on each side
  const itemH = 44;
  const gap = 16;
  const totalH = 6 * itemH + 5 * gap;
  const startY = cy - totalH / 2 + itemH / 2;
  const positions = Array.from({ length: 6 }, (_, i) => startY + i * (itemH + gap));

  const leftX = 185;  // right edge of left pills
  const rightX = 655; // left edge of right pills
  const pillW = 180;

  return (
    <svg
      viewBox="0 100 840 430"
      className="w-full max-w-4xl mx-auto"
      role="img"
      aria-label="Safety and Security measures diagram"
    >
      {/* Connector lines — left side */}
      {positions.map((y, i) => (
        <g key={`l${i}`}>
          <circle cx={leftX + 6} cy={y} r={5} fill={leftItems[i].color} />
          <line
            x1={leftX + 12} y1={y}
            x2={cx - shieldW / 2 - 8} y2={cy}
            stroke="#d1d5db" strokeWidth="1.5"
          />
        </g>
      ))}

      {/* Connector lines — right side */}
      {positions.map((y, i) => (
        <g key={`r${i}`}>
          <circle cx={rightX - 6} cy={y} r={5} fill={rightItems[i].color} />
          <line
            x1={rightX - 12} y1={y}
            x2={cx + shieldW / 2 + 8} y2={cy}
            stroke="#d1d5db" strokeWidth="1.5"
          />
        </g>
      ))}

      {/* Centre shield */}
      <path
        d={`M ${cx} ${cy - shieldH / 2 + 4}
            L ${cx + shieldW / 2} ${cy - shieldH / 2 + 22}
            L ${cx + shieldW / 2} ${cy + shieldH / 4}
            Q ${cx + shieldW / 2} ${cy + shieldH / 2} ${cx} ${cy + shieldH / 2}
            Q ${cx - shieldW / 2} ${cy + shieldH / 2} ${cx - shieldW / 2} ${cy + shieldH / 4}
            L ${cx - shieldW / 2} ${cy - shieldH / 2 + 22} Z`}
        fill="#fbbf24"
        stroke="#d97706"
        strokeWidth="3"
      />
      <text x={cx} y={cy - 12} textAnchor="middle" fontSize="13" fontWeight="900" fill="#92400e" fontFamily="Poppins,sans-serif">SAFETY</text>
      <text x={cx} y={cy + 4}  textAnchor="middle" fontSize="11" fontWeight="700" fill="#92400e" fontFamily="Poppins,sans-serif">&amp;</text>
      <text x={cx} y={cy + 20} textAnchor="middle" fontSize="13" fontWeight="900" fill="#92400e" fontFamily="Poppins,sans-serif">SECURITY</text>

      {/* Left pills */}
      {leftItems.map((item, i) => {
        const y = positions[i];
        const lines = item.label.split("\n");
        const h = itemH;
        const rx = leftX - pillW; // left edge
        return (
          <g key={i}>
            <rect x={rx} y={y - h / 2} width={pillW - 12} height={h} rx={h / 2} fill={item.color} />
            {/* Dark arrow tab on right */}
            <rect x={rx + pillW - 24} y={y - h / 2} width={16} height={h} rx={4} fill="rgba(0,0,0,0.25)" />
            {lines.map((ln, li) => (
              <text
                key={li}
                x={rx + (pillW - 24) / 2}
                y={y + li * 14 - (lines.length - 1) * 7 + 4}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="white"
                fontFamily="Poppins,sans-serif"
              >{ln}</text>
            ))}
          </g>
        );
      })}

      {/* Right pills */}
      {rightItems.map((item, i) => {
        const y = positions[i];
        const lines = item.label.split("\n");
        const h = itemH;
        const rx = rightX + 12; // left edge of pill
        return (
          <g key={i}>
            {/* Dark arrow tab on left */}
            <rect x={rx} y={y - h / 2} width={16} height={h} rx={4} fill="rgba(0,0,0,0.25)" />
            <rect x={rx + 8} y={y - h / 2} width={pillW - 12} height={h} rx={h / 2} fill={item.color} />
            {lines.map((ln, li) => (
              <text
                key={li}
                x={rx + 8 + (pillW - 24) / 2}
                y={y + li * 14 - (lines.length - 1) * 7 + 4}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="white"
                fontFamily="Poppins,sans-serif"
              >{ln}</text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

// ── Video Modal ───────────────────────────────────────────────────
const VIDEO_URL = "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Rainbow-International-School-Thane.mp4";

export default function SafetySecurity() {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Safety & Security"
        description="Rainbow International School prioritizes student safety with 160 CCTV cameras, metal detectors, GPS transport, trained nurses, ambulance, and 100% female preschool staff."
        keywords="school safety Thane, Rainbow school security, safe school Thane, CCTV school Thane, GPS school bus Thane"
        canonical="https://rainbowinternationalschool.in/safety-security"
        ogImage="/images/home/discover/safety-security.jpg"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "Safety & Security", href: "https://rainbowinternationalschool.in/safety-security" },
        ]}
      />
      <Navbar />
      <PageBanner
        title="Safety & Security"
        subtitle="Student safety & well-being is our top-most priority."
        breadcrumb={[{ label: "Safety & Security" }]}
        bgImage="/images/home/discover/safety-security.jpg"
      />

      <main className="flex-grow">

        {/* ── Intro ──────────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="rounded-3xl overflow-hidden shadow-sm">
                <img
                  src="/images/home/safety/safety.jpg"
                  alt="Security control room"
                  className="w-full h-72 object-cover"
                  width={768}
                  height={415}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-2" style={{ background: "#eef5ff", color: "#0d3b86" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  Student Safety First
                </span>
                <p className="text-gray-600 leading-relaxed">
                  At Rainbow International School, we believe it's too narrow-minded of a school to think only about academics.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  We take safety and security very seriously. Every child's physical wellbeing is our responsibility. It's crucial for their mental wellbeing.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  We use our human and technological resources in a variety of ways to ensure that the children are away from any kind of danger.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  We also ensure that the children are equipped with the knowledge of how to defend themselves when needed.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  We have the best of amenities related to physical and health related safety.
                </p>
                <button
                  onClick={() => setVideoOpen(true)}
                  className="inline-flex items-center gap-2 text-white font-bold py-3 px-7 rounded-full transition-opacity hover:opacity-90 mt-2"
                  style={{ background: "#0d3b86" }}
                  data-testid="button-safety-video"
                >
                  <Play size={16} fill="white" />
                  Check Safety Video
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4 Image Cards ─────────────────────────────────────── */}
        <section className="py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-black text-center mb-12" style={{ color: "#0d3b86", fontFamily: "'DM Sans', sans-serif" }}>Rainbow – Safety &amp; Security</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {highlights.map((h, i) => (
                <div key={i} className="flex flex-col gap-3" data-testid={`card-safety-${i}`}>
                  <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-gray-100">
                    <img
                      src={h.image}
                      alt={h.title}
                      className="w-full h-full object-cover"
                      width={400}
                      height={300}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                  <p className="font-black text-sm leading-snug" style={{ color: "#0d3b86" }}>{h.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Mind-map Diagram ──────────────────────────────────── */}
        <section className="py-6 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <SafetyMindMap />
          </div>
        </section>

        {/* ── Safety Measures Grid ──────────────────────────────── */}
        <section className="py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-black text-center mb-12" style={{ color: "#0d3b86", fontFamily: "'DM Sans', sans-serif" }}>Our Safety Commitments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Infirmary & Trained Nurse", desc: "A fully equipped infirmary on campus staffed by a trained nurse to attend to any medical needs immediately.", color: "#e0edff", accent: "#0d3b86" },
                { title: "Equipped Ambulance", desc: "An on-call ambulance on the school premises ensures rapid emergency response for any health-related incident.", color: "#fff7e0", accent: "#d97706" },
                { title: "First Aid Training", desc: "Teachers and support staff are trained in first aid so every child has a knowledgeable adult nearby at all times.", color: "#e0f7f0", accent: "#047857" },
                { title: "Self Defence Training", desc: "Students are equipped with the knowledge and basic skills to defend themselves when needed.", color: "#fdf2f8", accent: "#be185d" },
                { title: "160 CCTV Cameras", desc: "Complete campus coverage with 160 CCTV surveillance cameras monitored round the clock.", color: "#f3e0ff", accent: "#6d28d9" },
                { title: "Metal Detectors", desc: "Metal detectors at all entry points ensure no prohibited items enter the school premises.", color: "#e0edff", accent: "#0d3b86" },
                { title: "GPS Tracked Transport", desc: "All school buses have CCTV cameras and GPS tracking — parents can monitor bus location in real time.", color: "#fff7e0", accent: "#d97706" },
                { title: "Trained Drivers & Marshalls", desc: "School buses are operated by trained, verified drivers with dedicated safety marshalls on board.", color: "#e0f7f0", accent: "#047857" },
                { title: "Lady Attendants in Buses", desc: "Every school bus has a lady attendant to ensure the comfort and safety of all students during transit.", color: "#fdf2f8", accent: "#be185d" },
                { title: "100% Female Staff for Preschool", desc: "All preschool staff members are female — creating a safe, nurturing environment for the youngest students.", color: "#f3e0ff", accent: "#6d28d9" },
                { title: "Escort Card Policy", desc: "A strict escort card policy ensures only authorised persons can collect children from school.", color: "#e0edff", accent: "#0d3b86" },
                { title: "Alert Security Personnel", desc: "Trained security guards equipped with walkie-talkies monitor the campus and all entry/exit points.", color: "#fff7e0", accent: "#d97706" },
              ].map((item, i) => (
                <div key={i} className="rounded-3xl p-5 border border-gray-100 shadow-sm bg-white flex gap-4 items-start" data-testid={`measure-${i}`}>
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: item.color }}>
                    <div className="w-3 h-3 rounded-full" style={{ background: item.accent }} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm mb-1" style={{ color: item.accent }}>{item.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Video CTA ─────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <div
              className="relative rounded-3xl overflow-hidden cursor-pointer group shadow-lg"
              onClick={() => setVideoOpen(true)}
              data-testid="video-thumbnail"
              style={{ background: "#091a4f" }}
            >
              <img
                src="/images/home/discover/safety-security.jpg"
                alt="Safety video thumbnail"
                className="w-full h-72 object-cover opacity-40"
                width={800}
                height={288}
                loading="lazy"
                decoding="async"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="w-18 h-18 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: "rgba(255,255,255,0.15)", border: "3px solid white", width: 72, height: 72 }}>
                  <Play size={28} fill="white" className="text-white ml-1" />
                </div>
                <p className="text-white font-black text-xl">Watch Our Safety Video</p>
                <p className="text-white/70 text-sm">See how we keep your child safe every day</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <div className="py-14 text-center" style={{ background: "#091a4f" }}>
          <p className="text-white font-bold text-lg mb-4">Admissions are Open for the Academic Year 2026–27</p>
          <a href="#contact" className="inline-block text-white font-bold py-3 px-8 rounded-full border-2 border-amber-400 hover:bg-amber-400 hover:text-gray-900 transition-colors">
            Enquire Now
          </a>
        </div>

        <ContactForm />
      </main>

      {/* ── Video Modal ─────────────────────────────────────────── */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setVideoOpen(false)}
        >
          <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-amber-400 transition-colors"
              data-testid="button-close-video"
            >
              <X size={28} />
            </button>
            <div className="rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video">
              <video
                src={VIDEO_URL}
                controls
                autoPlay
                className="w-full h-full"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
