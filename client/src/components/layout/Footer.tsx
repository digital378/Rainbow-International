import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-primary text-white pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-white to-gray-200 rounded-lg flex items-center justify-center text-primary font-serif font-bold text-xl shadow-md">
                R
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-serif font-bold text-xl tracking-tight">Rainbow</span>
                <span className="text-xs uppercase tracking-widest text-white/70 font-semibold">International School</span>
              </div>
            </div>
            <p className="text-white/70 leading-relaxed mb-6">
              Empowering students with knowledge, character, and skills to succeed in a dynamic global society.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-primary transition-all duration-300">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-primary transition-all duration-300">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-primary transition-all duration-300">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-primary transition-all duration-300">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif font-bold text-xl mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/70 hover:text-secondary transition-colors inline-block">About Us</a></li>
              <li><a href="#" className="text-white/70 hover:text-secondary transition-colors inline-block">Admissions Process</a></li>
              <li><a href="#" className="text-white/70 hover:text-secondary transition-colors inline-block">Academic Calendar</a></li>
              <li><a href="#" className="text-white/70 hover:text-secondary transition-colors inline-block">School Policies</a></li>
              <li><a href="#" className="text-white/70 hover:text-secondary transition-colors inline-block">Career Opportunities</a></li>
              <li><a href="#" className="text-white/70 hover:text-secondary transition-colors inline-block">Contact Support</a></li>
            </ul>
          </div>

          {/* Academics */}
          <div>
            <h3 className="font-serif font-bold text-xl mb-6">Academics</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/70 hover:text-secondary transition-colors inline-block">Pre-Primary (EYFS)</a></li>
              <li><a href="#" className="text-white/70 hover:text-secondary transition-colors inline-block">Primary School</a></li>
              <li><a href="#" className="text-white/70 hover:text-secondary transition-colors inline-block">Middle School</a></li>
              <li><a href="#" className="text-white/70 hover:text-secondary transition-colors inline-block">Senior School (IGCSE)</a></li>
              <li><a href="#" className="text-white/70 hover:text-secondary transition-colors inline-block">High School (IB DP)</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-serif font-bold text-xl mb-6">Get in Touch</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="mt-1 text-secondary shrink-0" size={18} />
                <span className="text-white/70">123 Education Lane, Knowledge Park III, Greater Noida, UP 201306</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-secondary shrink-0" size={18} />
                <span className="text-white/70">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-secondary shrink-0" size={18} />
                <span className="text-white/70">info@rainbowschool.in</span>
              </li>
            </ul>
            <div className="mt-6">
              <Button className="w-full bg-secondary text-secondary-foreground font-bold hover:bg-secondary/90">
                Book a Campus Tour
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-white/50 text-sm">
          <p>&copy; {new Date().getFullYear()} Rainbow International School. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
