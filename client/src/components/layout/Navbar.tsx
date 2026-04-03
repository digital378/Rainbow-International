import { Link, useLocation } from "wouter";
import { Menu, X, Phone, Clock, MapPin, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { trackCallClick } from "@/lib/analytics";

const aboutLinks = [
  { href: "/about-rainbow-international-school", label: "About RIS" },
  { href: "/global-brand-associations", label: "Brand Partners" },
  { href: "/rainbow-preschool-international", label: "Rainbow Preschool International" },
];

const academicsLinks = [
  { href: "/cbse-mandatory-public-disclosures", label: "CBSE Mandatory Public Disclosures" },
  { href: "/pre-primary-school-thane", label: "Pre-Primary Section" },
  { href: "/primary-section", label: "Primary Section" },
  { href: "/middle-school-section", label: "Middle Section" },
  { href: "/secondary-section", label: "Secondary Section" },
  { href: "/senior-secondary-section", label: "Senior Secondary Section" },
  { href: "/extracurriculars", label: "Extracurriculars" },
  { href: "/declaration", label: "Declaration" },
  { href: "/book-list", label: "Book List" },
];

const atRainbowLinks = [
  { href: "/safety-security", label: "Safety & Security" },
  { href: "/curriculum", label: "Curriculum" },
  { href: "/school-managing-committee", label: "School Managing Committee" },
  { href: "/academic-team", label: "Academic Team" },
  { href: "/academic-calendar", label: "Academic Calendar" },
  { href: "https://www.cbse.gov.in/", label: "Circulars", external: true },
];

const galleryLinks = [
  { href: "/amenities", label: "Amenities & Facilities" },
  { href: "/awards-achievements", label: "Awards & Achievements" },
  { href: "/student-achievements", label: "Student Achievements" },
  { href: "/photo-gallery", label: "Photo Gallery" },
  { href: "https://www.google.co.in/maps/@19.2410872,72.9834173,3a,75y,173.49h,78.89t/data=!3m7!1e1!3m5!1sCIHM0ogKEICAgICEoPa6nwE!2e10!6shttps:%2F%2Flh3.googleusercontent.com%2Fgpms-cs-s%2FAFfmt2aWGOsrPaLwSCl_hpv4b0782kWAfeFtnO6PY5ALsP7irCvkUkFM4Mj-PBqTjsMKjRbuIfgun0HJuqtMJMNBEuil-DTNGWYGhJdBl9PnQ5TYN9T192c28YY8tQXxUB9Pxfez7bYSrA%3Dw900-h600-k-no-pi11.106874019713445-ya67.45613033629051-ro0-fo100!7i13312!8i6656?entry=ttu&g_ep=EgoyMDI2MDMyOS4wIKXMDSoASAFQAw%3D%3D", label: "360 View", external: true },
];

const parentLinks = [
  { href: "/contact-us", label: "Application Form" },
  { href: "/students-leaving-certificate", label: "Leaving Certificate" },
];

function Dropdown({ label, links, isTransparent }: { label: string; links: { href: string; label: string; external?: boolean }[]; isTransparent?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [location] = useLocation();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 text-sm font-medium transition-colors py-1 ${isTransparent ? "text-white/90 hover:text-white" : "text-[#333] hover:text-primary"}`}
      >
        {label}
        <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 min-w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1">
          {links.map((link, i) =>
            link.external ? (
              <a
                key={i}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={i}
                href={link.href}
                className="block px-4 py-2.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const isHome = location === "/";

  useEffect(() => { setIsOpen(false); }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isTransparent = isHome && !scrolled && !isOpen;

  return (
    <>
    {!isHome && <div className="h-[140px]" />}
    <div className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${isTransparent ? "" : "bg-white shadow-md"}`}>
      <div
        className="text-center py-1.5 text-[10px] sm:text-[11px] font-bold tracking-[0.1em] sm:tracking-[0.15em] uppercase transition-all duration-300 text-white whitespace-nowrap"
        style={{ background: "linear-gradient(135deg, #091a4f 0%, #0d3b86 100%)" }}
      >
        ADMISSIONS OPEN · ACADEMIC YEAR 2026–27
      </div>

      <div className={`transition-all duration-300 ${isTransparent ? "border-b border-white/10" : "border-b border-gray-100"}`}>
        <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/ris-logo.png"
              alt="Rainbow International School"
              className={`w-auto object-contain transition-all duration-300 ${scrolled ? "h-12" : "h-14"}`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/cropped-RIS-Logo-PNG.png";
              }}
            />
          </Link>

          <div className="hidden lg:flex items-center gap-8 ml-auto">
            <div className="flex items-start gap-2">
              <Phone className={`mt-0.5 shrink-0 transition-colors ${isTransparent ? "text-amber-300" : "text-primary"}`} size={16} />
              <div>
                <a href="tel:02269105000" onClick={() => trackCallClick({ phone: "(022) 69105000" })} className={`block text-xs transition-colors ${isTransparent ? "text-white/80 hover:text-white" : "text-gray-600 hover:text-primary"}`}>(022) 69105000</a>
                <a href="tel:+918291568972" onClick={() => trackCallClick({ phone: "+91 82915 68972" })} className={`block text-xs transition-colors ${isTransparent ? "text-white/80 hover:text-white" : "text-gray-600 hover:text-primary"}`}>+91 82915 68972</a>
              </div>
            </div>
            <div className={`h-8 w-px transition-colors ${isTransparent ? "bg-white/20" : "bg-gray-200"}`} />
            <div className="flex items-start gap-2">
              <Clock className={`mt-0.5 shrink-0 transition-colors ${isTransparent ? "text-amber-300" : "text-primary"}`} size={16} />
              <div>
                <p className={`text-xs transition-colors ${isTransparent ? "text-white/80" : "text-gray-600"}`}>Mon - Sat</p>
                <p className={`text-xs transition-colors ${isTransparent ? "text-white/80" : "text-gray-600"}`}>9.00 AM – 6.00 PM</p>
              </div>
            </div>
            <div className={`h-8 w-px transition-colors ${isTransparent ? "bg-white/20" : "bg-gray-200"}`} />
            <div className="flex items-start gap-2">
              <MapPin className={`mt-0.5 shrink-0 transition-colors ${isTransparent ? "text-amber-300" : "text-primary"}`} size={16} />
              <div>
                <p className={`text-xs transition-colors ${isTransparent ? "text-white/80" : "text-gray-600"}`}>Cosmos Arcade,</p>
                <p className={`text-xs transition-colors ${isTransparent ? "text-white/80" : "text-gray-600"}`}>Brahmand Phase 4, Thane West</p>
              </div>
            </div>
          </div>

          <button
            className={`lg:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors ${isTransparent ? "text-white" : "text-gray-600"}`}
            onClick={() => setIsOpen(!isOpen)}
            data-testid="button-mobile-menu"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <nav className={`transition-all duration-300 ${isTransparent ? "" : "bg-white border-b border-gray-100"}`}>
        <div className="container mx-auto px-4">
          <div className="hidden lg:flex items-center gap-1">
            <Link href="/" className={`text-sm font-medium transition-colors px-3 py-3.5 border-b-2 border-transparent hover:border-amber-400 ${isTransparent ? "text-white/90 hover:text-white" : "text-[#333] hover:text-primary"}`}>
              Home
            </Link>
            {[
              { label: "About Us", links: aboutLinks },
              { label: "Academics", links: academicsLinks },
              { label: "At Rainbow", links: atRainbowLinks },
              { label: "Gallery", links: galleryLinks },
            ].map(({ label, links }) => (
              <div key={label} className="px-3 py-3.5 border-b-2 border-transparent hover:border-amber-400">
                <Dropdown label={label} links={links} isTransparent={isTransparent} />
              </div>
            ))}
            <Link href="/blogs" className={`text-sm font-medium transition-colors px-3 py-3.5 border-b-2 border-transparent hover:border-amber-400 ${isTransparent ? "text-white/90 hover:text-white" : "text-[#333] hover:text-primary"}`}>
              Blogs
            </Link>
            <div className="px-3 py-3.5 border-b-2 border-transparent hover:border-amber-400">
              <Dropdown label="Parent's Corner" links={parentLinks} isTransparent={isTransparent} />
            </div>
            <Link href="/contact-us" className={`text-sm font-medium transition-colors px-3 py-3.5 border-b-2 border-transparent hover:border-amber-400 ${isTransparent ? "text-white/90 hover:text-white" : "text-[#333] hover:text-primary"}`}>
              Connect with us
            </Link>
            <Link href="/career" className={`text-sm font-medium transition-colors px-3 py-3.5 border-b-2 border-transparent hover:border-amber-400 ${isTransparent ? "text-white/90 hover:text-white" : "text-[#333] hover:text-primary"}`}>
              Career
            </Link>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div className="lg:hidden border-t bg-white shadow-lg flex flex-col max-h-[80vh] overflow-y-auto">
          <div className="p-4 space-y-1">
            {[
              { href: "/", label: "Home" },
              { href: "/blogs", label: "Blogs" },
              { href: "/contact-us", label: "Connect with us" },
              { href: "/career", label: "Career" },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="block text-base font-medium py-2.5 border-b border-gray-100 text-gray-700">
                {link.label}
              </Link>
            ))}

            {[
              { key: "about", label: "About Us", links: aboutLinks },
              { key: "academics", label: "Academics", links: academicsLinks },
              { key: "at-rainbow", label: "At Rainbow", links: atRainbowLinks },
              { key: "gallery", label: "Gallery", links: galleryLinks },
              { key: "parents", label: "Parent's Corner", links: parentLinks },
            ].map(({ key, label, links }) => (
              <div key={key}>
                <button
                  className="w-full text-left text-base font-medium py-2.5 border-b border-gray-100 text-gray-700 flex items-center justify-between"
                  onClick={() => setMobileExpanded(mobileExpanded === key ? null : key)}
                >
                  {label}
                  <ChevronDown size={14} className={mobileExpanded === key ? "rotate-180" : ""} />
                </button>
                {mobileExpanded === key && (
                  <div className="pl-4 py-1">
                    {links.map((l, i) => (
                      <Link key={i} href={l.href} className="block text-sm py-2 text-gray-500 hover:text-primary">
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
