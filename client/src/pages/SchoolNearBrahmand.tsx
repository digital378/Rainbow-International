import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { MapPin, GraduationCap, Shield, Trophy, Users, Bus, Phone } from "lucide-react";

const highlights = [
  { icon: MapPin, title: "Heart of Brahmand", desc: "Located in Brahmand Phase 4 — walking distance from Cosmos Arcade, Brahmand Society, and surrounding residential complexes." },
  { icon: GraduationCap, title: "K–12 Under One Roof", desc: "Nursery to Class 12 (Science, Commerce, Humanities) — no school changes, seamless transitions." },
  { icon: Shield, title: "Safe & Secure Campus", desc: "200+ CCTV cameras, card-based entry, trained security, full-time nurse, and equipped ambulance." },
  { icon: Trophy, title: "Award-Winning School", desc: "Best School in Thane (multiple years), British Council International School Award, Google for Education certified." },
  { icon: Users, title: "3,000+ Students", desc: "One of Thane's largest CBSE school communities, with 200+ dedicated educators." },
  { icon: Bus, title: "Brahmand Bus Routes", desc: "Multiple bus routes covering all phases of Brahmand, Hiranandani Estate, and surrounding areas." },
];

const distances = [
  { place: "Brahmand Phase 1–4", time: "2–5 min walk" },
  { place: "Cosmos Arcade / Brahmand Market", time: "3 min walk" },
  { place: "Hiranandani Estate", time: "5 min drive" },
  { place: "Manpada Junction", time: "5 min drive" },
  { place: "Ghodbunder Road", time: "8 min drive" },
  { place: "Thane Station", time: "15 min drive" },
  { place: "Viviana Mall", time: "10 min drive" },
];

const faqs = [
  { q: "How far is Rainbow International School from Brahmand?", a: "Rainbow International School is located inside Brahmand Phase 4 itself (Cosmos Arcade). Most Brahmand residents can walk to school in 2–5 minutes." },
  { q: "Is there bus transport within Brahmand?", a: "Yes, school buses operate within all phases of Brahmand and surrounding neighbourhoods. GPS tracking and trained attendants are provided on every route." },
  { q: "What board does the school follow?", a: "Rainbow International School is affiliated to the CBSE board (Affiliation No. 1130661) and offers classes from Nursery to Class 12." },
  { q: "Are admissions open for 2026–27?", a: "Yes, admissions for 2026–27 are currently open for all classes from Nursery to Class 12. Contact +91 82915 68972 to apply." },
];

export default function SchoolNearBrahmand() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Best School Near Brahmand Thane — CBSE Nursery to Class 12"
        description="Rainbow International School — the best CBSE school near Brahmand, Thane. Located in Brahmand Phase 4. Nursery to Class 12, 3.5-acre campus, 3000+ students. Admissions 2026-27 open."
        keywords="school near Brahmand Thane, best school Brahmand, CBSE school Brahmand Thane, school near me Brahmand, nursery school Brahmand Thane"
        canonical="https://www.rainbowinternationalschool.in/school-near-brahmand-thane/"
        breadcrumbs={[
          { name: "Home", href: "https://www.rainbowinternationalschool.in/" },
          { name: "School Near Brahmand", href: "https://www.rainbowinternationalschool.in/school-near-brahmand-thane" },
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "School",
          "name": "Rainbow International School",
          "url": "https://www.rainbowinternationalschool.in/",
          "address": { "@type": "PostalAddress", "streetAddress": "Cosmos Arcade, Brahmand Phase 4", "addressLocality": "Thane", "addressRegion": "Maharashtra", "postalCode": "400607", "addressCountry": "IN" },
          "geo": { "@type": "GeoCoordinates", "latitude": 19.2287, "longitude": 72.9637 },
          "areaServed": "Brahmand, Thane"
        }}
      />
      <Navbar />
      <PageBanner
        title="Best School Near Brahmand, Thane"
        subtitle="Rainbow International School — Right in the Heart of Brahmand Phase 4"
        bgImage="/images/students/hero-senior-secondary.webp"
      />

      <main className="flex-grow" role="main">
        <section className="py-16 bg-gradient-to-b from-white to-gray-50" data-testid="section-intro">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-['DM_Sans'] font-black text-2xl md:text-3xl text-[#091a4f] mb-6">Your Neighbourhood School in Brahmand</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              For families in Brahmand, Thane, finding a top-quality CBSE school within walking distance is a rare advantage. Rainbow International School 
              is located right inside Brahmand Phase 4 at Cosmos Arcade — making it the closest premium K–12 school for thousands of families across 
              Brahmand Phase 1 through 4, Hiranandani Estate, and surrounding areas.
            </p>
            <p className="text-gray-600 leading-relaxed">
              With a 3.5-acre campus, CBSE affiliation, 3,000+ students, and classes from Nursery to Class 12 (including Science, Commerce, and Humanities 
              streams), Rainbow International offers everything parents look for — without the long commute.
            </p>
          </div>
        </section>

        <section className="py-16" data-testid="section-highlights">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-['DM_Sans'] font-black text-2xl md:text-3xl text-[#091a4f] mb-8 text-center">Why Brahmand Families Choose Rainbow</h2>
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
            <h2 className="font-['DM_Sans'] font-black text-2xl md:text-3xl text-[#091a4f] mb-8 text-center">Distance from Nearby Areas</h2>
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
            <h2 className="font-['DM_Sans'] font-black text-2xl md:text-3xl text-[#091a4f] mb-4">Visit Your Neighbourhood School</h2>
            <p className="text-gray-500 mb-6">Schedule a campus visit or apply online — we're right here in Brahmand Phase 4.</p>
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
