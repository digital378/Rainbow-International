import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { MapPin, GraduationCap, Shield, Trophy, Users, Bus, Phone } from "lucide-react";

const highlights = [
  { icon: MapPin, title: "Close to Manpada", desc: "Located at Brahmand Phase 4, just 5 minutes from Manpada Junction — convenient access from Manpada, Pokhran Road, and Majiwada." },
  { icon: GraduationCap, title: "K–12 CBSE School", desc: "Complete education from Nursery to Class 12 with Science, Commerce, and Humanities streams in senior secondary." },
  { icon: Shield, title: "World-Class Campus", desc: "3.5-acre campus with smart classrooms, science labs, swimming pool, skating rink, amphitheatre, and organic farm." },
  { icon: Trophy, title: "Award-Winning Excellence", desc: "Multiple 'Best School in Thane' recognitions, British Council ISA, and consistently outstanding board results." },
  { icon: Users, title: "Trusted by 3,000+ Families", desc: "4.8/5 parent rating — one of the most trusted school communities in the Manpada–Brahmand–Majiwada corridor." },
  { icon: Bus, title: "Manpada Bus Routes", desc: "Dedicated school bus routes covering Manpada, Pokhran Road, Majiwada, Dhokali, and surrounding residential complexes." },
];

const distances = [
  { place: "Manpada Junction", time: "5 min drive" },
  { place: "Pokhran Road No. 2", time: "7 min drive" },
  { place: "Majiwada Junction", time: "10 min drive" },
  { place: "Dhokali", time: "12 min drive" },
  { place: "Brahmand (all phases)", time: "2–5 min" },
  { place: "Hiranandani Estate", time: "5 min drive" },
  { place: "Thane Station", time: "15 min drive" },
];

const faqs = [
  { q: "How far is Rainbow International School from Manpada?", a: "The school is located at Brahmand Phase 4, approximately 5 minutes by road from Manpada Junction via the internal Brahmand road." },
  { q: "Is there a school bus from Manpada?", a: "Yes, GPS-tracked school buses operate on dedicated routes covering Manpada, Pokhran Road, Majiwada, and Dhokali with trained attendants." },
  { q: "Which board is the school affiliated to?", a: "CBSE (Central Board of Secondary Education), Affiliation No. 1130661." },
  { q: "What age can my child start?", a: "Children can join Nursery from age 2.5 years (as on 31st March). Admissions are open for all classes from Nursery to Class 12." },
];

export default function SchoolNearManpada() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Best School Near Manpada Thane — CBSE Nursery to Class 12"
        description="Rainbow International School — top CBSE school near Manpada, Thane. 5 min from Manpada Junction. Nursery to Class 12, 3.5-acre campus, 3000+ students. Admissions 2026-27 open."
        keywords="school near Manpada Thane, best school Manpada, CBSE school Manpada Thane, school near me Manpada, nursery school Manpada Thane, school Pokhran Road"
        canonical="https://www.rainbowinternationalschool.in/school-near-manpada-thane/"
        breadcrumbs={[
          { name: "Home", href: "https://www.rainbowinternationalschool.in/" },
          { name: "School Near Manpada", href: "https://www.rainbowinternationalschool.in/school-near-manpada-thane" },
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "School",
          "name": "Rainbow International School",
          "url": "https://www.rainbowinternationalschool.in/",
          "address": { "@type": "PostalAddress", "streetAddress": "Cosmos Arcade, Brahmand Phase 4", "addressLocality": "Thane", "addressRegion": "Maharashtra", "postalCode": "400607", "addressCountry": "IN" },
          "geo": { "@type": "GeoCoordinates", "latitude": 19.2287, "longitude": 72.9637 },
          "areaServed": "Manpada, Thane"
        }}
      />
      <Navbar />
      <PageBanner
        title="Best School Near Manpada, Thane"
        subtitle="Rainbow International School — 5 Minutes from Manpada Junction"
        bgImage="/images/students/hero-senior-secondary.webp"
      />

      <main className="flex-grow" role="main">
        <section className="py-16 bg-gradient-to-b from-white to-gray-50" data-testid="section-intro">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-['DM_Sans'] font-black text-2xl md:text-3xl text-[#091a4f] mb-6">Top-Rated CBSE School Near Manpada</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Manpada is one of Thane's most sought-after residential areas, and families here deserve access to premium education 
              close to home. Rainbow International School, located just 5 minutes from Manpada Junction at Brahmand Phase 4, is the 
              highest-rated CBSE K–12 school serving the Manpada–Pokhran Road–Majiwada corridor.
            </p>
            <p className="text-gray-600 leading-relaxed">
              With a 3.5-acre campus, CBSE affiliation, and classes from Nursery to Class 12 (Science, Commerce, and Humanities), 
              Rainbow International is the neighbourhood school that doesn't compromise on quality.
            </p>
          </div>
        </section>

        <section className="py-16" data-testid="section-highlights">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-['DM_Sans'] font-black text-2xl md:text-3xl text-[#091a4f] mb-8 text-center">Why Manpada Families Choose Rainbow</h2>
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
