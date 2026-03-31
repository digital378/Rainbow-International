import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, Mail, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const academicsLinks = [
  { href: "/pre-primary-school-thane", label: "Pre-Primary (Nursery–Sr KG)" },
  { href: "/primary-section", label: "Primary (Class 1–5)" },
  { href: "/middle-school-section", label: "Middle (Class 6–10)" },
  { href: "/secondary-section", label: "Secondary (Class 9–10)" },
  { href: "/senior-secondary-section", label: "Senior Secondary (Class 11–12)" },
];

const exploreLinks = [
  { href: "/amenities", label: "Amenities & Facilities" },
  { href: "/awards-achievements", label: "Awards & Achievements" },
  { href: "/student-achievements", label: "Student Achievements" },
  { href: "/safety-security", label: "Safety & Security" },
  { href: "/beyond-the-classroom", label: "Beyond The Classroom" },
  { href: "/extracurriculars", label: "Extracurriculars" },
  { href: "/photo-gallery", label: "Photo Gallery" },
  { href: "/academic-calendar", label: "Academic Calendar" },
  { href: "/virtual-learning", label: "Virtual Learning" },
  { href: "/academic-team", label: "Academic Team" },
  { href: "/book-list", label: "Book List" },
  { href: "/school-managing-committee", label: "School Managing Committee" },
  { href: "/global-brand-associations", label: "Global Brand Associations" },
  { href: "/blogs", label: "Blogs" },
];

function Dropdown({ label, links }: { label: string; links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
      >
        {label}
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all group-hover:w-full"></span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-border z-50 py-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="bg-primary text-primary-foreground py-2 text-xs font-medium hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-6">
            <a href="tel:+918655003366" className="flex items-center gap-2 hover:text-secondary transition-colors">
              <Phone size={14} /> +91 86550 03366
            </a>
            <a href="mailto:info@rainbowinternationalschool.in" className="flex items-center gap-2 hover:text-secondary transition-colors">
              <Mail size={14} /> info@rainbowinternationalschool.in
            </a>
          </div>
          <div className="text-xs text-white/70">
            CBSE Affiliated · Thane West · Nursery to Class 12
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center text-white font-serif font-bold text-xl shadow-md">
            R
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-serif font-bold text-xl text-primary tracking-tight">Rainbow</span>
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">International School</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group">
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all group-hover:w-full"></span>
          </Link>
          <Link href="/about-rainbow-international-school" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group">
            About
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all group-hover:w-full"></span>
          </Link>
          <Dropdown label="Academics" links={academicsLinks} />
          <Dropdown label="Explore" links={exploreLinks} />
          <Link href="/contact-us" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group">
            Contact
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all group-hover:w-full"></span>
          </Link>
          <Link href="/contact-us">
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold shadow-sm">
              Apply Now
            </Button>
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          data-testid="button-mobile-menu"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t bg-background p-4 flex flex-col gap-2 shadow-lg animate-in slide-in-from-top-5 max-h-[80vh] overflow-y-auto">
          <Link href="/" className="text-base font-medium py-2 border-b border-border/50 text-foreground" onClick={() => setIsOpen(false)}>Home</Link>
          <Link href="/about-rainbow-international-school" className="text-base font-medium py-2 border-b border-border/50 text-foreground" onClick={() => setIsOpen(false)}>About</Link>

          <button
            className="text-base font-medium py-2 border-b border-border/50 text-foreground text-left flex items-center justify-between"
            onClick={() => setMobileExpanded(mobileExpanded === "academics" ? null : "academics")}
          >
            Academics <ChevronDown size={14} className={mobileExpanded === "academics" ? "rotate-180" : ""} />
          </button>
          {mobileExpanded === "academics" && (
            <div className="pl-4 flex flex-col gap-1 pb-2">
              {academicsLinks.map((l) => (
                <Link key={l.href} href={l.href} className="text-sm py-1.5 text-muted-foreground" onClick={() => setIsOpen(false)}>{l.label}</Link>
              ))}
            </div>
          )}

          <button
            className="text-base font-medium py-2 border-b border-border/50 text-foreground text-left flex items-center justify-between"
            onClick={() => setMobileExpanded(mobileExpanded === "explore" ? null : "explore")}
          >
            Explore <ChevronDown size={14} className={mobileExpanded === "explore" ? "rotate-180" : ""} />
          </button>
          {mobileExpanded === "explore" && (
            <div className="pl-4 flex flex-col gap-1 pb-2">
              {exploreLinks.map((l) => (
                <Link key={l.href} href={l.href} className="text-sm py-1.5 text-muted-foreground" onClick={() => setIsOpen(false)}>{l.label}</Link>
              ))}
            </div>
          )}

          <Link href="/contact-us" className="text-base font-medium py-2 border-b border-border/50 text-foreground" onClick={() => setIsOpen(false)}>Contact</Link>
          <Link href="/contact-us" onClick={() => setIsOpen(false)}>
            <Button className="w-full bg-secondary text-secondary-foreground font-bold mt-2">Apply Now</Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
