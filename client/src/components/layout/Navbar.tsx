import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, Mail } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "#academics", label: "Academics" },
    { href: "#contact", label: "Admissions" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="bg-primary text-primary-foreground py-2 text-xs font-medium hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><Phone size={14} /> +91 86550 03366</span>
            <span className="flex items-center gap-2"><Mail size={14} /> info@rainbowinternationalschool.in</span>
          </div>
          <div className="flex gap-4 text-xs">
            <span className="text-white/80">CBSE Affiliated · Thane West</span>
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
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all group-hover:w-full"></span>
            </a>
          ))}
          <a href="#contact">
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold shadow-sm">
              Apply Now
            </Button>
          </a>
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
        <div className="md:hidden border-t bg-background p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-5">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-lg font-medium py-2 border-b border-border/50 text-foreground"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a href="#contact" onClick={() => setIsOpen(false)}>
            <Button className="w-full bg-secondary text-secondary-foreground font-bold mt-2">
              Apply Now
            </Button>
          </a>
        </div>
      )}
    </nav>
  );
}
