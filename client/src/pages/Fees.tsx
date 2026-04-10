import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { Phone, IndianRupee, Shield, Bus, BookOpen, Stethoscope } from "lucide-react";

const inclusions = [
  { icon: BookOpen, title: "Tuition & Academics", desc: "All classroom instruction, lab sessions, library access, and digital learning resources." },
  { icon: Bus, title: "Transport (Optional)", desc: "GPS-tracked buses covering 30+ routes across Thane with trained attendants." },
  { icon: Shield, title: "Safety & Security", desc: "200+ CCTV cameras, card-based entry, trained security personnel, fire safety systems." },
  { icon: Stethoscope, title: "Health & Wellness", desc: "On-campus infirmary with full-time nurse, visiting paediatrician, equipped ambulance." },
];

const faqs = [
  { q: "What is the fee payment schedule?", a: "Fees are payable in quarterly instalments. The exact schedule is shared at the time of admission confirmation." },
  { q: "Are there sibling concessions?", a: "Yes, sibling discounts are available. Please discuss this with our admissions team during the interaction session." },
  { q: "Is there a one-time admission fee?", a: "Yes, a one-time admission and registration fee is applicable at the time of joining. This is non-refundable." },
  { q: "Are there additional charges for extracurriculars?", a: "Core extracurricular activities are included. Specialised programmes like advanced swimming coaching or competitive robotics may have a nominal additional fee." },
  { q: "What payment methods are accepted?", a: "Fees can be paid via online bank transfer, UPI, demand draft, or cheque. Cash payments are not accepted." },
  { q: "Is there a fee refund policy?", a: "Refund policies are governed by CBSE guidelines. Details are shared during the admission process." },
];

export default function Fees() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="CBSE School Fee Structure Thane 2026-27"
        description="Fee structure details for Rainbow International School, Thane — Nursery to Class 12 CBSE. Transparent fees, sibling concessions, quarterly payment. Contact admissions for exact fee schedule."
        keywords="CBSE school fees Thane, school fee structure Thane, Rainbow International School fees, nursery school fees Thane, school fees near me Thane"
        canonical="https://www.rainbowinternationalschool.in/fee-structure/"
        breadcrumbs={[
          { name: "Home", href: "https://www.rainbowinternationalschool.in/" },
          { name: "Fee Structure", href: "https://www.rainbowinternationalschool.in/fee-structure" },
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(f => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": { "@type": "Answer", "text": f.a }
          }))
        }}
      />
      <Navbar />
      <PageBanner
        title="Fee Structure"
        subtitle="Transparent, Value-Based Education — Nursery to Class 12"
        bgImage="/images/students/hero-senior-secondary.webp"
      />

      <main className="flex-grow" role="main">
        <section className="py-16 bg-gradient-to-b from-white to-gray-50" data-testid="section-overview">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-['DM_Sans'] font-black text-2xl md:text-3xl text-[#091a4f] mb-6">Fee Overview</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Rainbow International School offers a comprehensive, value-driven education from Nursery to Class 12 at competitive fee levels. 
              Our fee structure covers tuition, access to world-class facilities on our 3.5-acre campus, and a wide range of co-curricular activities. 
              We believe in complete transparency — there are no hidden charges.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6" data-testid="fee-note">
              <div className="flex items-start gap-3">
                <IndianRupee className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-[#091a4f] mb-1">Fee Details Available on Request</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    The exact fee schedule for each class is shared during the admission interaction session. This allows us to walk you through 
                    every component and answer your questions personally. Contact our admissions office at <strong>+91 82915 68972</strong> or fill 
                    the enquiry form below to receive the complete fee breakdown.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16" data-testid="section-sections">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-['DM_Sans'] font-black text-2xl md:text-3xl text-[#091a4f] mb-8 text-center">Fee Categories by Section</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { section: "Pre-Primary", grades: "Nursery, Jr KG, Sr KG", note: "Includes activity kits and learning materials", link: "/pre-primary-school-thane" },
                { section: "Primary", grades: "Class 1 to 5", note: "Includes lab access and library", link: "/primary-section" },
                { section: "Middle School", grades: "Class 6 to 8", note: "Includes all lab sessions and project materials", link: "/middle-school-section" },
                { section: "Secondary", grades: "Class 9 & 10", note: "Includes CBSE board exam preparation", link: "/secondary-section" },
                { section: "Senior Secondary (Science)", grades: "Class 11 & 12", note: "Physics, Chemistry, Maths/Biology labs", link: "/senior-secondary-section" },
                { section: "Senior Secondary (Commerce/Humanities)", grades: "Class 11 & 12", note: "Business studies, Economics, Psychology labs", link: "/senior-secondary-section" },
              ].map((item, i) => (
                <a key={i} href={item.link} className="block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition group" data-testid={`section-${i}`}>
                  <h3 className="font-['DM_Sans'] font-bold text-[#091a4f] mb-1 group-hover:text-[#0d3b86]">{item.section}</h3>
                  <p className="text-sm text-amber-600 font-medium mb-2">{item.grades}</p>
                  <p className="text-xs text-gray-500">{item.note}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50" data-testid="section-inclusions">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-['DM_Sans'] font-black text-2xl md:text-3xl text-[#091a4f] mb-8 text-center">What's Included in Your Fees</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {inclusions.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100" data-testid={`inclusion-${i}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#091a4f]/5 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-[#091a4f]" />
                    </div>
                    <div>
                      <h3 className="font-['DM_Sans'] font-bold text-[#091a4f] mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16" data-testid="section-faq">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-['DM_Sans'] font-black text-2xl md:text-3xl text-[#091a4f] mb-8 text-center">Fee-Related FAQs</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm group" data-testid={`faq-${i}`}>
                  <summary className="px-6 py-4 cursor-pointer font-semibold text-[#091a4f] list-none flex items-center justify-between">
                    {faq.q}
                    <span className="text-amber-500 text-xl group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50" data-testid="section-cta">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="font-['DM_Sans'] font-black text-2xl md:text-3xl text-[#091a4f] mb-4">Get the Complete Fee Schedule</h2>
            <p className="text-gray-500 mb-8 max-w-xl mx-auto">Call our admissions team or fill the form below for the detailed fee structure for your child's class.</p>
            <a href="tel:+918291568972" className="inline-flex items-center gap-2 bg-[#091a4f] text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-[#0d3b86] transition mb-8" data-testid="btn-call">
              <Phone className="w-4 h-4" /> +91 82915 68972
            </a>
          </div>
          <div className="container mx-auto px-4 max-w-5xl">
            <ContactForm />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
