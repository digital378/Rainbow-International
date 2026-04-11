import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { MapPin, GraduationCap, Shield, Trophy, Users, Bus, Phone } from "lucide-react";

const highlights = [
  { icon: MapPin, title: "Minutes from Ghodbunder Road", desc: "Located at Brahmand Phase 4, just 8 minutes off the Ghodbunder Road corridor — easy access from Patlipada, Waghbil, Kavesar, and Owale." },
  { icon: GraduationCap, title: "Complete K–12 School", desc: "Nursery to Class 12 under one roof — Science, Commerce, and Humanities streams available in senior secondary." },
  { icon: Shield, title: "3.5-Acre Secure Campus", desc: "Sprawling campus with 200+ CCTV cameras, card-based entry, on-campus infirmary, and equipped ambulance." },
  { icon: Trophy, title: "Top-Rated in Thane", desc: "Multiple 'Best School in Thane' awards, British Council ISA, Google & Meta for Education partnerships." },
  { icon: Users, title: "3,000+ Happy Students", desc: "Rated 4.8/5 by parents — one of the largest and most trusted school communities on the Ghodbunder Road belt." },
  { icon: Bus, title: "Ghodbunder Road Bus Routes", desc: "Dedicated bus routes covering the entire Ghodbunder Road corridor — Patlipada, Waghbil, Kavesar, Kolshet, and Owale." },
];

const distances = [
  { place: "Ghodbunder Road (main junction)", time: "8 min drive" },
  { place: "Patlipada", time: "10 min drive" },
  { place: "Waghbil / Kavesar", time: "12 min drive" },
  { place: "Kolshet Road", time: "15 min drive" },
  { place: "Owale / Dosti Vihar", time: "12 min drive" },
  { place: "Hiranandani Estate", time: "5 min drive" },
  { place: "Viviana Mall", time: "10 min drive" },
];

const faqs = [
  { q: "How far is Rainbow International School from Ghodbunder Road?", a: "The school is located at Brahmand Phase 4, approximately 8 minutes from the main Ghodbunder Road junction via internal roads." },
  { q: "Is there school bus service along Ghodbunder Road?", a: "Yes, dedicated GPS-tracked bus routes cover the entire Ghodbunder Road corridor including Patlipada, Waghbil, Kavesar, Kolshet, and Owale." },
  { q: "What classes are available?", a: "Nursery through Class 12 (CBSE). Senior Secondary offers Science, Commerce, and Humanities streams." },
  { q: "How do I apply?", a: "Apply online through our website or visit the campus. Admissions for 2026–27 are currently open. Call +91 82915 68972 for details." },
];

export default function SchoolNearGhodbunderRoad() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Best School Near Ghodbunder Road Thane — CBSE K–12"
        description="Rainbow International School — top-rated CBSE school near Ghodbunder Road, Thane. 8 min from GB Road. Nursery to Class 12, 3.5-acre campus. Bus routes covering Patlipada, Waghbil, Kavesar."
        keywords="school near Ghodbunder Road, best school Ghodbunder Road Thane, CBSE school GB Road Thane, school near me Ghodbunder Road, nursery school Ghodbunder Road"
        canonical="https://rainbowinternationalschool.in/school-near-ghodbunder-road-thane"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "School Near Ghodbunder Road", href: "https://rainbowinternationalschool.in/school-near-ghodbunder-road-thane" },
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "School",
          "name": "Rainbow International School",
          "url": "https://rainbowinternationalschool.in/",
          "address": { "@type": "PostalAddress", "streetAddress": "Cosmos Arcade, Brahmand Phase 4", "addressLocality": "Thane", "addressRegion": "Maharashtra", "postalCode": "400607", "addressCountry": "IN" },
          "geo": { "@type": "GeoCoordinates", "latitude": 19.2287, "longitude": 72.9637 },
          "areaServed": "Ghodbunder Road, Thane"
        }}
      />
      <Navbar />
      <PageBanner
        title="Best School Near Ghodbunder Road"
        subtitle="Rainbow International School — 8 Minutes from the GB Road Corridor"
        bgImage="/images/students/hero-senior-secondary.webp"
      />

      <main className="flex-grow" role="main">
        <section className="py-16 bg-gradient-to-b from-white to-gray-50" data-testid="section-intro">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-['DM_Sans'] font-black text-2xl md:text-3xl text-[#091a4f] mb-6">Premium CBSE School on the Ghodbunder Road Belt</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Ghodbunder Road is one of Thane's fastest-growing residential corridors, home to thousands of young families looking for 
              quality education nearby. Rainbow International School, located at Brahmand Phase 4, is the top-rated CBSE K–12 school 
              serving the entire GB Road belt — from Patlipada and Waghbil to Kavesar, Owale, and Kolshet.
            </p>
            <p className="text-gray-600 leading-relaxed">
              With a 3.5-acre campus, 3,000+ students, CBSE affiliation (No. 1130661), and dedicated bus routes along the Ghodbunder Road 
              corridor, we make premium education accessible without the long commute to central Thane.
            </p>
          </div>
        </section>

        <section className="py-16" data-testid="section-highlights">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-['DM_Sans'] font-black text-2xl md:text-3xl text-[#091a4f] mb-8 text-center">Why GB Road Families Choose Rainbow</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {highlights.map((h, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100" data-testid={`highlight-${i}`}>
                  <div className="w-12 h-12 bg-[#091a4f]/5 rounded-xl flex items-center justify-center mb-4">
                    <h.icon className="w-6 h-6 text-[#091a4f]" />
                  </div>
                  <h3 className="font-['DM_Sans'] font-bold text-[#091a4f] mb-2">{h.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{h.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50" data-testid="section-distance">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-['DM_Sans'] font-black text-2xl md:text-3xl text-[#091a4f] mb-8 text-center">Distance from GB Road Areas</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {distances.map((d, i) => (
                <div key={i} className={`flex items-center justify-between px-6 py-3.5 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`} data-testid={`distance-${i}`}>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-gray-700">{d.place}</span>
                  </div>
                  <span className="text-sm text-[#091a4f] font-semibold">{d.time}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16" data-testid="section-faq">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-['DM_Sans'] font-black text-2xl md:text-3xl text-[#091a4f] mb-8 text-center">Frequently Asked Questions</h2>
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
          <div className="container mx-auto px-4 max-w-4xl text-center mb-8">
            <h2 className="font-['DM_Sans'] font-black text-2xl md:text-3xl text-[#091a4f] mb-4">Enrol Your Child Today</h2>
            <p className="text-gray-500 mb-6">Admissions 2026–27 are open. Schedule a campus visit or apply online.</p>
            <a href="tel:+918291568972" className="inline-flex items-center gap-2 bg-[#091a4f] text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-[#0d3b86] transition" data-testid="btn-call">
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
