import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, Mail } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/academics", label: "Academics" },
    { href: "/admissions", label: "Admissions" },
    { href: "/campus", label: "Campus Life" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground py-2 text-xs font-medium hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><Phone size={14} /> +91 123 456 7890</span>
            <span className="flex items-center gap-2"><Mail size={14} /> admissions@rainbowschool.in</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-secondary transition-colors">Parent Portal</a>
            <a href="#" className="hover:text-secondary transition-colors">Staff Login</a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center text-white font-serif font-bold text-xl shadow-md">
              R
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-serif font-bold text-xl text-primary tracking-tight">Rainbow</span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">International School</span>
            </div>
          </a>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <a className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group">
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all group-hover:w-full"></span>
              </a>
            </Link>
          ))}
          <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold shadow-sm">
            Apply Now
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t bg-background p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-5">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <a 
                className="text-lg font-medium py-2 border-b border-border/50 text-foreground"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            </Link>
          ))}
          <Button className="w-full bg-secondary text-secondary-foreground font-bold mt-2">
            Apply Now
          </Button>
        </div>
      )}
    </nav>
  );
}
