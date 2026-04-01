import { Facebook, Instagram, Youtube, MapPin, Phone, Mail, Navigation } from "lucide-react";
import { Link } from "wouter";

const MAPS_LINK = "https://maps.app.goo.gl/mfJjMMkksCkcXzMCA";
const MAPS_EMBED =
  "https://maps.google.com/maps?q=Rainbow+International+School,+Cosmos+Arcade,+Brahmand+Phase+4,+Thane+West,+Maharashtra&output=embed&t=k&z=18&hl=en";

const quickLinks = [
  { label: "About Rainbow", href: "/about-rainbow-international-school" },
  { label: "Pre-Primary Section", href: "/pre-primary-school-thane" },
  { label: "Primary Section", href: "/primary-section" },
  { label: "Middle School", href: "/middle-school-section" },
  { label: "Secondary Section", href: "/secondary-section" },
  { label: "Senior Secondary", href: "/senior-secondary-section" },
  { label: "Academic Calendar", href: "/academic-calendar" },
];

const exploreLinks = [
  { label: "Awards & Achievements", href: "/awards-achievements" },
  { label: "Amenities & Facilities", href: "/amenities" },
  { label: "Student Achievements", href: "/student-achievements" },
  { label: "Safety & Security", href: "/safety-security" },
  { label: "Beyond The Classroom", href: "/beyond-the-classroom" },
  { label: "Extracurriculars", href: "/extracurriculars" },
  { label: "Photo Gallery", href: "/photo-gallery" },
  { label: "Blogs", href: "/blogs" },
  { label: "CBSE Disclosures", href: "/cbse-mandatory-public-disclosures" },
];

export function Footer() {
  return (
    <footer style={{ background: "#091a4f" }} className="text-white">

      {/* ── Campus Map ─────────────────────────────────────────── */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 pt-12 pb-0">
          <h3 className="font-black text-lg mb-4 text-white">Find Our Campus</h3>
          <a
            href={MAPS_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="block group relative rounded-2xl overflow-hidden"
            style={{ height: 280 }}
            data-testid="link-campus-map"
          >
            {/* Satellite map iframe */}
            <iframe
              src={MAPS_EMBED}
              width="100%"
              height="280"
              style={{ border: 0, display: "block", filter: "saturate(1.1) brightness(0.92)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Rainbow International School Campus Map"
            />

            {/* Transparent click-through overlay (captures click → Google Maps) */}
            <div className="absolute inset-0" />

            {/* School info card – top-left */}
            <div
              className="absolute top-4 left-4 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3 pointer-events-none"
              style={{ background: "#091a4f", border: "1px solid rgba(251,191,36,0.35)", maxWidth: 260 }}
            >
              {/* Isometric building icon */}
              <div className="flex-shrink-0">
                <svg width="44" height="48" viewBox="0 0 44 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Ground shadow */}
                  <ellipse cx="22" cy="45" rx="14" ry="3" fill="rgba(0,0,0,0.25)" />
                  {/* Main building body – front face */}
                  <polygon points="6,30 22,38 22,14 6,6" fill="#1e3a7a" />
                  {/* Main building body – right face */}
                  <polygon points="22,38 38,30 38,6 22,14" fill="#0d3b86" />
                  {/* Roof face */}
                  <polygon points="6,6 22,14 38,6 22,-2" fill="#1a56c4" />
                  {/* Rainbow accent strip on roof */}
                  <polygon points="6,6 22,14 38,6 22,-2" fill="url(#roofGrad)" opacity="0.7" />
                  {/* Windows – front */}
                  <rect x="9" y="14" width="5" height="5" rx="1" fill="#7dd3fc" opacity="0.85" />
                  <rect x="9" y="22" width="5" height="5" rx="1" fill="#7dd3fc" opacity="0.85" />
                  <rect x="16" y="17" width="4" height="4" rx="1" fill="#7dd3fc" opacity="0.7" />
                  {/* Windows – right */}
                  <rect x="25" y="14" width="5" height="5" rx="1" fill="#bae6fd" opacity="0.7" />
                  <rect x="32" y="14" width="4" height="4" rx="1" fill="#bae6fd" opacity="0.55" />
                  <rect x="25" y="22" width="5" height="5" rx="1" fill="#bae6fd" opacity="0.7" />
                  {/* Door */}
                  <rect x="12" y="28" width="5" height="7" rx="1" fill="#fbbf24" opacity="0.9" />
                  {/* Flag pole */}
                  <line x1="22" y1="-2" x2="22" y2="-10" stroke="#fbbf24" strokeWidth="1.5" />
                  <polygon points="22,-10 29,-7 22,-4" fill="#fbbf24" />
                  <defs>
                    <linearGradient id="roofGrad" x1="6" y1="6" x2="38" y2="6" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ef4444" />
                      <stop offset="0.25" stopColor="#f97316" />
                      <stop offset="0.5" stopColor="#22c55e" />
                      <stop offset="0.75" stopColor="#3b82f6" />
                      <stop offset="1" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div>
                <p className="font-black text-xs text-white leading-tight">Rainbow International School</p>
                <p className="text-white/50 text-[10px] mt-0.5 leading-tight">Cosmos Arcade, Brahmand Phase 4<br />Thane West, Maharashtra</p>
              </div>
            </div>

            {/* "View in 3D" button – bottom-right */}
            <div
              className="absolute bottom-4 right-4 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl pointer-events-none transition-all group-hover:scale-105"
              style={{ background: "#fbbf24", color: "#091a4f" }}
            >
              <Navigation size={12} />
              Get Directions
            </div>
          </a>
        </div>
      </div>

      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-[#091a4f] font-serif font-black text-xl shadow-md" style={{ background: "#fbbf24" }}>
                  R
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-black text-[17px] tracking-tight">Rainbow</span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-white/50 font-bold">International School</span>
                </div>
              </div>
              <p className="text-white/60 leading-relaxed text-sm mb-2">
                <strong className="text-white/80">World-Class Education, Indian Values.</strong>
              </p>
              <p className="text-white/50 leading-relaxed text-sm mb-8">
                One of the top CBSE schools in Thane West — where every child dares to dream and becomes a lifelong learner.
              </p>
              <p className="text-white/40 text-xs mb-3 font-semibold uppercase tracking-wider">Follow Us</p>
              <div className="flex gap-3">
                {[
                  { Icon: Facebook, href: "https://www.facebook.com/RainbowInternationalSchoolThane/", label: "Facebook" },
                  { Icon: Instagram, href: "https://www.instagram.com/rainbowinternationalschool/", label: "Instagram" },
                  { Icon: Youtube, href: "https://www.youtube.com/@rainbowinternationalschool", label: "YouTube" },
                ].map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 transition-all duration-300 hover:border-yellow-400/60 hover:text-yellow-400"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <Icon size={17} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-black text-base mb-6 text-white">Quick Links</h3>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-white/55 hover:text-white text-sm transition-colors duration-200 inline-flex items-center gap-1.5 hover:gap-2 group">
                      <span className="w-1 h-1 rounded-full bg-current opacity-50 group-hover:opacity-100 flex-shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-black text-base mb-6 text-white">Explore</h3>
              <ul className="space-y-2.5">
                {exploreLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-white/55 hover:text-white text-sm transition-colors duration-200 inline-flex items-center gap-1.5 hover:gap-2 group">
                      <span className="w-1 h-1 rounded-full bg-current opacity-50 group-hover:opacity-100 flex-shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-black text-base mb-6 text-white">Get In Touch</h3>
              <ul className="space-y-5">
                <li>
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.2)" }}>
                      <MapPin size={16} style={{ color: "#fbbf24" }} />
                    </div>
                    <span className="text-white/60 text-sm leading-relaxed">Cosmos Arcade, Brahmand Phase 4,<br />Thane West, Maharashtra</span>
                  </div>
                </li>
                <li>
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.2)" }}>
                      <Phone size={16} style={{ color: "#fbbf24" }} />
                    </div>
                    <div>
                      <a href="tel:02269105000" className="block text-white/60 text-sm hover:text-white transition-colors">(022) 69105000</a>
                      <a href="tel:+918291568972" className="block text-white/60 text-sm hover:text-white transition-colors">+91 82915 68972</a>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.2)" }}>
                      <Mail size={16} style={{ color: "#fbbf24" }} />
                    </div>
                    <a href="mailto:info@rainbowinternationalschool.in" className="text-white/60 text-sm hover:text-white transition-colors break-all leading-relaxed">info@rainbowinternationalschool.in</a>
                  </div>
                </li>
              </ul>
              <div className="mt-7">
                <Link href="/contact-us">
                  <button
                    className="w-full font-bold py-3 rounded-xl text-sm transition-all hover:opacity-90 hover:shadow-lg"
                    style={{ background: "#fbbf24", color: "#091a4f" }}
                  >
                    Book a Campus Tour
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-white/35 text-sm">
          © {new Date().getFullYear()} Rainbow International School · CBSE Affiliation No. 1130661
        </p>
        <div className="flex gap-6">
          <Link href="/cbse-mandatory-public-disclosures" className="text-white/35 hover:text-white/70 text-sm transition-colors">CBSE Disclosures</Link>
          <Link href="/privacy-policy-and-cookie-policy" className="text-white/35 hover:text-white/70 text-sm transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
