import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-white pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
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
            <p className="text-white/70 leading-relaxed mb-2 text-sm font-medium">
              World-Class Education, Indian Values
            </p>
            <p className="text-white/60 leading-relaxed mb-6 text-sm">
              One of the top CBSE schools in Thane West — where every child dares to dream and becomes a lifelong learner.
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/RainbowInternationalSchoolThane/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-primary transition-all duration-300">
                <Facebook size={18} />
              </a>
              <a href="https://www.instagram.com/rainbow_international_school/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-primary transition-all duration-300">
                <Instagram size={18} />
              </a>
              <a href="https://www.youtube.com/@rainbowinternationalschool" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-primary transition-all duration-300">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-serif font-bold text-xl mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/70 hover:text-secondary transition-colors inline-block text-sm">About Rainbow</a></li>
              <li><a href="#academics" className="text-white/70 hover:text-secondary transition-colors inline-block text-sm">Pre-Primary Section</a></li>
              <li><a href="#academics" className="text-white/70 hover:text-secondary transition-colors inline-block text-sm">Primary Section</a></li>
              <li><a href="#academics" className="text-white/70 hover:text-secondary transition-colors inline-block text-sm">Middle Section</a></li>
              <li><a href="#academics" className="text-white/70 hover:text-secondary transition-colors inline-block text-sm">Secondary Section</a></li>
              <li><a href="#academics" className="text-white/70 hover:text-secondary transition-colors inline-block text-sm">Senior Secondary</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-bold text-xl mb-6">Explore</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/70 hover:text-secondary transition-colors inline-block text-sm">Awards & Accomplishments</a></li>
              <li><a href="#" className="text-white/70 hover:text-secondary transition-colors inline-block text-sm">Amenities & Facilities</a></li>
              <li><a href="#" className="text-white/70 hover:text-secondary transition-colors inline-block text-sm">Student Achievements</a></li>
              <li><a href="#" className="text-white/70 hover:text-secondary transition-colors inline-block text-sm">Safety & Security</a></li>
              <li><a href="#" className="text-white/70 hover:text-secondary transition-colors inline-block text-sm">Beyond The Classroom</a></li>
              <li><a href="#contact" className="text-white/70 hover:text-secondary transition-colors inline-block text-sm">Admissions</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-bold text-xl mb-6">Get in Touch</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="mt-1 text-secondary shrink-0" size={18} />
                <span className="text-white/70 text-sm">Anand Nagar, Thane West, Maharashtra, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-secondary shrink-0" size={18} />
                <a href="tel:+918655003366" className="text-white/70 text-sm hover:text-secondary transition-colors">+91 86550 03366</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-secondary shrink-0" size={18} />
                <a href="mailto:info@rainbowinternationalschool.in" className="text-white/70 text-sm hover:text-secondary transition-colors">info@rainbowinternationalschool.in</a>
              </li>
            </ul>
            <div className="mt-6">
              <a href="#contact">
                <button className="w-full bg-secondary text-secondary-foreground font-bold py-2.5 rounded-md hover:bg-secondary/90 transition-colors text-sm">
                  Book a Campus Tour
                </button>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-white/50 text-sm">
          <p>&copy; {new Date().getFullYear()} Rainbow International School. All rights reserved. | Thane West, Maharashtra</p>
        </div>
      </div>
    </footer>
  );
}
