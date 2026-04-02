import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, Clock, MapPin, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

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

function Dropdown({ label, links }: { label: string; links: { href: string; label: string; external?: boolean }[] }) {
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
        className="flex items-center gap-1 text-sm font-medium text-[#333] hover:text-primary transition-colors py-1"
      >
        {label}
        <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 min-w-56 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1">
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
  const [location] = useLocation();

  useEffect(() => { setIsOpen(false); }, [location]);

  return (
    <div className="sticky top-0 z-50 w-full">
      <div className="bg-[#00a550] text-white text-center py-2 text-xs font-bold tracking-widest uppercase">
        ADMISSIONS ARE OPEN FOR THE ACADEMIC YEAR 26–27
      </div>

      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img
              src="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/cropped-RIS-Logo-PNG.png"
              alt="Rainbow International School"
              className="h-16 w-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const next = target.nextElementSibling as HTMLElement;
                if (next) next.style.display = 'flex';
              }}
            />
            <div
              className="w-16 h-16 bg-gradient-to-br from-primary to-blue-700 rounded-lg items-center justify-center text-white font-serif font-bold text-2xl shadow hidden"
            >
              R
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8 ml-auto">
            <div className="flex items-start gap-2">
              <Phone className="text-primary mt-0.5 shrink-0" size={18} />
              <div>
                <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">Call</p>
                <a href="tel:02269105000" className="block text-xs text-gray-600 hover:text-primary transition-colors">(022) 69105000</a>
                <a href="tel:+918291568972" className="block text-xs text-gray-600 hover:text-primary transition-colors">+91 82915 68972</a>
              </div>
            </div>
            <div className="h-10 w-px bg-gray-200" />
            <div className="flex items-start gap-2">
              <Clock className="text-primary mt-0.5 shrink-0" size={18} />
              <div>
                <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">Working Time</p>
                <p className="text-xs text-gray-600">Mon - Sat</p>
                <p className="text-xs text-gray-600">9.00 AM – 6.00 PM</p>
              </div>
            </div>
            <div className="h-10 w-px bg-gray-200" />
            <div className="flex items-start gap-2">
              <MapPin className="text-primary mt-0.5 shrink-0" size={18} />
              <div>
                <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">Address</p>
                <p className="text-xs text-gray-600">Cosmos Arcade,</p>
                <p className="text-xs text-gray-600">Brahmand Phase 4, Thane West</p>
              </div>
            </div>
          </div>

          <button
            className="lg:hidden p-2.5 text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setIsOpen(!isOpen)}
            data-testid="button-mobile-menu"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <nav className="bg-white border-b shadow-md">
        <div className="container mx-auto px-4">
          <div className="hidden lg:flex items-center gap-1">
            <Link href="/" className="text-sm font-medium text-[#333] hover:text-primary transition-colors px-3 py-4 border-b-2 border-transparent hover:border-primary">
              Home
            </Link>
            <div className="px-3 py-4 border-b-2 border-transparent hover:border-primary">
              <Dropdown label="About Us" links={aboutLinks} />
            </div>
            <div className="px-3 py-4 border-b-2 border-transparent hover:border-primary">
              <Dropdown label="Academics" links={academicsLinks} />
            </div>
            <div className="px-3 py-4 border-b-2 border-transparent hover:border-primary">
              <Dropdown label="At Rainbow" links={atRainbowLinks} />
            </div>
            <div className="px-3 py-4 border-b-2 border-transparent hover:border-primary">
              <Dropdown label="Gallery" links={galleryLinks} />
            </div>
            <Link href="/blogs" className="text-sm font-medium text-[#333] hover:text-primary transition-colors px-3 py-4 border-b-2 border-transparent hover:border-primary">
              Blogs
            </Link>
            <div className="px-3 py-4 border-b-2 border-transparent hover:border-primary">
              <Dropdown label="Parent's Corner" links={parentLinks} />
            </div>
            <Link href="/contact-us" className="text-sm font-medium text-[#333] hover:text-primary transition-colors px-3 py-4 border-b-2 border-transparent hover:border-primary">
              Connect with us
            </Link>
            <Link href="/career" className="text-sm font-medium text-[#333] hover:text-primary transition-colors px-3 py-4 border-b-2 border-transparent hover:border-primary">
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
  );
}
