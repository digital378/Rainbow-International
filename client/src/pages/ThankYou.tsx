import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import ScrollProgress from "@/components/home/ScrollProgress";
import { Link } from "wouter";
import { CheckCircle, Phone, Mail, ArrowRight } from "lucide-react";

const nextSteps = [
  { step: "1", title: "Expect a call", desc: "Our admissions coordinator will call you within one working day to confirm details and next steps." },
  { step: "2", title: "Campus visit", desc: "You'll be invited to visit our campus, meet our faculty, and tour our world-class facilities." },
  { step: "3", title: "Application review", desc: "Your application is reviewed and you'll receive confirmation of your child's admission offer." },
];

const quickLinks = [
  { label: "About the School", href: "/about-rainbow-international-school" },
  { label: "Our Academics", href: "/secondary-section" },
  { label: "Amenities & Facilities", href: "/amenities" },
  { label: "Student Achievements", href: "/student-achievements" },
  { label: "Awards & Recognition", href: "/awards-achievements" },
  { label: "Photo Gallery", href: "/photo-gallery" },
];

export default function ThankYou() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="Thank You for Your Enquiry"
        description="Thank you for reaching out to Rainbow International School. Our admissions team will contact you within one working day."
        keywords="Rainbow International School enquiry received, thank you admissions"
        canonical="/thank-you"
      />
      <ScrollProgress />
      <Navbar />

      <main className="flex-1 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Success icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border-4 border-green-100">
              <CheckCircle className="text-green-500" size={40} />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-[#091a4f] mb-4">
            Thank You for Reaching Out!
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed max-w-xl mx-auto mb-10">
            We've received your enquiry and are delighted you're considering Rainbow International School
            for your child. Our admissions team will be in touch within <strong>one working day</strong>.
          </p>

          {/* Next steps */}
          <div className="bg-[#f8faff] rounded-2xl p-8 mb-10 border border-blue-100 text-left">
            <h2 className="text-lg font-bold text-[#091a4f] text-center mb-6">What Happens Next</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {nextSteps.map(({ step, title, desc }) => (
                <div key={step} className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-[#0d3b86] text-white rounded-full flex items-center justify-center font-bold text-sm mb-3">
                    {step}
                  </div>
                  <h3 className="font-bold text-[#091a4f] mb-1 text-sm">{title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <a href="tel:+918291568972" className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Phone className="text-[#0d3b86]" size={18} />
              </div>
              <div className="text-left">
                <div className="text-xs text-gray-500">Call us directly</div>
                <div className="font-bold text-[#0d3b86] text-sm">+91 82915 68972</div>
              </div>
            </a>
            <a href="mailto:info@rainbowinternationalschool.in" className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Mail className="text-[#0d3b86]" size={18} />
              </div>
              <div className="text-left">
                <div className="text-xs text-gray-500">Email us</div>
                <div className="font-bold text-[#0d3b86] text-sm">info@rainbowinternationalschool.in</div>
              </div>
            </a>
          </div>

          {/* Quick links */}
          <div>
            <h2 className="text-base font-bold text-[#091a4f] mb-4">Explore Rainbow International School</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {quickLinks.map(({ label, href }) => (
                <Link key={label} href={href} className="flex items-center justify-between gap-2 bg-[#f8faff] border border-blue-100 rounded-xl px-4 py-3 text-sm font-medium text-[#0d3b86] hover:bg-blue-50 hover:border-blue-300 transition-colors">
                  <span>{label}</span>
                  <ArrowRight size={14} className="shrink-0 opacity-60" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
