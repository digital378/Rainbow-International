import { Facebook, Instagram, Youtube, MapPin, Phone, Mail, Navigation } from "lucide-react";
import { Link } from "wouter";
import { trackCallClick, trackDirectionsClick } from "@/lib/analytics";

const MAPS_LINK = "https://maps.app.goo.gl/mfJjMMkksCkcXzMCA";

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

const preschoolLinks = [
  { label: "Playgroup", href: "https://www.rainbowpreschools.com/playgroup" },
  { label: "Nursery", href: "https://www.rainbowpreschools.com/nursery" },
  { label: "Kindergarten", href: "https://www.rainbowpreschools.com/kindergarten" },
  { label: "Our Centres", href: "https://www.rainbowpreschools.com/preschool-near-me" },
  { label: "Gallery", href: "https://www.rainbowpreschools.com/gallery" },
  { label: "Best Playschool in Thane", href: "https://www.rainbowpreschools.com/play-school-near-me" },
  { label: "Preschool Near You", href: "https://www.rainbowpreschools.com/best-preschool-near-me-in-thane" },
  { label: "Apply for Admission", href: "https://www.rainbowpreschools.com/preschool-admissions" },
];

export function Footer() {
  return (
    <footer style={{ background: "#091a4f" }} className="text-white" role="contentinfo">

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
            onClick={() => trackDirectionsClick()}
          >
            <img
              src="/campus-aerial.jpg"
              alt="Rainbow International School Campus - Aerial View"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              style={{ filter: "brightness(0.85) saturate(1.1)" }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#091a4f]/60 via-transparent to-[#091a4f]/30" />

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative flex flex-col items-center">
                <div
                  className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
                  style={{
                    background: "linear-gradient(135deg, #ef4444, #f97316)",
                    boxShadow: "0 0 0 4px rgba(255,255,255,0.9), 0 0 30px rgba(249,115,22,0.5), 0 8px 24px rgba(0,0,0,0.4)",
                  }}
                >
                  <MapPin size={26} className="text-white drop-shadow-lg" strokeWidth={2.5} />
                </div>
                <div
                  className="w-1 h-6 -mt-1 relative z-0"
                  style={{
                    background: "linear-gradient(to bottom, #ef4444, #b91c1c)",
                    borderRadius: "0 0 2px 2px",
                  }}
                />
                <div
                  className="w-10 h-3 -mt-0.5 rounded-full"
                  style={{
                    background: "radial-gradient(ellipse, rgba(0,0,0,0.35), transparent 70%)",
                  }}
                />
              </div>
            </div>

            <div
              className="absolute top-4 left-4 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3 pointer-events-none backdrop-blur-sm"
              style={{ background: "rgba(9,26,79,0.85)", border: "1px solid rgba(251,191,36,0.35)", maxWidth: 260 }}
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)" }}>
                <MapPin size={18} style={{ color: "#fbbf24" }} />
              </div>
              <div>
                <p className="font-black text-xs text-white leading-tight">Rainbow International School</p>
                <p className="text-white/50 text-[10px] mt-0.5 leading-tight">Cosmos Arcade, Brahmand Phase 4<br />Thane West, Maharashtra</p>
              </div>
            </div>

            <div
              className="absolute bottom-4 right-4 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl pointer-events-none transition-all group-hover:scale-105 shadow-lg"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img
                  src="/rps-logo.png"
                  alt="Rainbow International School Logo"
                  className="w-14 h-14 object-contain"
                />
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
              <h3 className="font-black text-base mb-6 text-white">Rainbow Preschools</h3>
              <ul className="space-y-2.5">
                {preschoolLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-white/55 hover:text-white text-sm transition-colors duration-200 inline-flex items-center gap-1.5 hover:gap-2 group">
                      <span className="w-1 h-1 rounded-full bg-current opacity-50 group-hover:opacity-100 flex-shrink-0" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              <a
                href="https://www.rainbowpreschools.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-5 text-xs font-semibold uppercase tracking-wider text-yellow-400/80 hover:text-yellow-400 transition-colors"
              >
                Visit Website &rarr;
              </a>
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
                      <a href="tel:+918291568972" onClick={() => trackCallClick({ phone: "+91 82915 68972" })} className="block text-white/60 text-sm hover:text-white transition-colors">+91 82915 68972</a>
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
