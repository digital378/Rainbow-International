import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { CheckCircle, Calendar, FileText, Phone, GraduationCap } from "lucide-react";

const ageData = [
  { grade: "Nursery", age: "2.5 years", by: "31st March" },
  { grade: "Jr KG", age: "3.5 years", by: "31st March" },
  { grade: "Sr KG", age: "4.5 years", by: "31st March" },
  { grade: "Class 1", age: "6 years", by: "31st March" },
  { grade: "Class 2–8", age: "Age appropriate", by: "As per CBSE norms" },
  { grade: "Class 9–10", age: "Written assessment", by: "Subject to availability" },
  { grade: "Class 11–12", age: "Class 10 results", by: "Science / Commerce / Humanities" },
];

const steps = [
  { icon: FileText, title: "Submit Application", desc: "Fill the online application form with your child's details, previous school info, and preferred class." },
  { icon: Calendar, title: "Interaction Session", desc: "Attend a one-on-one interaction session with our academic team. For Class 9+, a written assessment is conducted." },
  { icon: CheckCircle, title: "Document Verification", desc: "Submit original documents including birth certificate, Aadhaar card, transfer certificate, and report cards." },
  { icon: GraduationCap, title: "Admission Confirmation", desc: "Upon selection, complete the fee payment and receive your admission confirmation with class details." },
];

const documents = [
  "Birth Certificate (original + photocopy)",
  "Aadhaar Card of child and parent",
  "Previous school Transfer Certificate (TC)",
  "Report card / mark sheet of last 2 years",
  "4 passport-size photographs of the child",
  "Address proof (utility bill / rent agreement)",
  "Medical fitness certificate",
  "Caste / Category certificate (if applicable)",
];

const faqs = [
  { q: "When do admissions open for 2026–27?", a: "Admissions for the 2026–27 academic year are currently open. We recommend applying early as seats fill on a first-come, first-served basis." },
  { q: "Is there an entrance test?", a: "For Nursery to Class 8, there is no written test — we conduct an informal interaction session. For Class 9 and above, a written assessment in core subjects is required." },
  { q: "Can my child join mid-session?", a: "Mid-session admissions are available subject to seat availability. Contact our admissions office for current openings." },
  { q: "What is the fee structure?", a: "Fee details are shared during the admission interaction. You can also visit our Fee Structure page or contact the admissions office at +91 82915 68972." },
  { q: "Do you offer transport facilities?", a: "Yes, GPS-tracked school buses cover 30+ routes across Thane with a trained attendant on each bus." },
  { q: "Is there a sibling discount?", a: "Yes, sibling concessions are available. Please discuss this during the admission process." },
];

export default function Admissions() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="School Admissions 2026-27 Thane — Nursery to Class 12"
        description="Admissions open at Rainbow International School, Thane for 2026-27. Nursery to Class 12, CBSE board. Apply online — age criteria, process, documents, and fee details."
        keywords="school admission Thane 2026, nursery admission Thane, CBSE school admission, Rainbow International School admission, school admission near me Thane, Class 11 admission Thane"
        canonical="https://rainbowinternationalschool.in/admissions"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "Admissions 2026-27", href: "https://rainbowinternationalschool.in/admissions" },
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            { "@type": "Question", "name": "When do admissions open for 2026–27?", "acceptedAnswer": { "@type": "Answer", "text": "Admissions for the 2026–27 academic year are currently open. We recommend applying early as seats fill on a first-come, first-served basis." } },
            { "@type": "Question", "name": "Is there an entrance test?", "acceptedAnswer": { "@type": "Answer", "text": "For Nursery to Class 8, there is no written test — we conduct an informal interaction session. For Class 9 and above, a written assessment in core subjects is required." } },
            { "@type": "Question", "name": "What is the age criteria for Nursery?", "acceptedAnswer": { "@type": "Answer", "text": "Nursery: 2.5 years, Jr KG: 3.5 years, Sr KG: 4.5 years, Class 1: 6 years — as on 31st March of the academic year, per CBSE norms." } },
            { "@type": "Question", "name": "Can my child join mid-session?", "acceptedAnswer": { "@type": "Answer", "text": "Mid-session admissions are available subject to seat availability. Contact our admissions office for current openings." } },
            { "@type": "Question", "name": "Do you offer transport facilities?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, GPS-tracked school buses cover 30+ routes across Thane with a trained attendant on each bus." } },
            { "@type": "Question", "name": "Is there a sibling discount?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, sibling concessions are available. Please discuss this during the admission process." } }
          ]
        }}
      />
      <Navbar />
      <PageBanner
        title="Admissions 2026–27"
        subtitle="Nursery to Class 12 — CBSE Affiliated"
        bgImage="/images/students/hero-senior-secondary.webp"
      />

      <main className="flex-grow" role="main">
        <section className="py-16 bg-gradient-to-b from-white to-gray-50" data-testid="section-why-rainbow">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-['DM_Sans'] font-black text-2xl md:text-3xl text-[#091a4f] mb-6">Why Choose Rainbow International School?</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Rainbow International School is one of Thane's top-rated CBSE K–12 schools, spread across a 3.5-acre campus in Brahmand Phase 4. 
              Founded in 2009, we serve 3,000+ students with a Multiple Intelligence-based pedagogy, world-class facilities, and a proven track record 
              of academic and co-curricular excellence. Admissions for the 2026–27 academic year are now open across all sections.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: "3.5 Acres", label: "Campus" },
                { value: "3,000+", label: "Students" },
                { value: "CBSE", label: "Board" },
                { value: "K–12", label: "Nursery to 12" },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 text-center shadow-sm border border-gray-100" data-testid={`stat-${i}`}>
                  <div className="font-['DM_Sans'] font-black text-2xl text-[#091a4f]">{s.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16" data-testid="section-process">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-['DM_Sans'] font-black text-2xl md:text-3xl text-[#091a4f] mb-10 text-center">Admission Process</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center" data-testid={`step-${i}`}>
                  <div className="w-14 h-14 bg-[#091a4f]/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-7 h-7 text-[#091a4f]" />
                  </div>
                  <div className="text-xs font-bold text-amber-500 mb-1">Step {i + 1}</div>
                  <h3 className="font-['DM_Sans'] font-bold text-[#091a4f] mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50" data-testid="section-age">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-['DM_Sans'] font-black text-2xl md:text-3xl text-[#091a4f] mb-8 text-center">Age Criteria & Class Eligibility</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm" data-testid="table-age">
                <thead>
                  <tr className="bg-[#091a4f] text-white">
                    <th className="py-3 px-4 text-left font-semibold">Grade</th>
                    <th className="py-3 px-4 text-left font-semibold">Minimum Age</th>
                    <th className="py-3 px-4 text-left font-semibold">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {ageData.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="py-3 px-4 font-medium text-[#091a4f]">{row.grade}</td>
                      <td className="py-3 px-4 text-gray-600">{row.age}</td>
                      <td className="py-3 px-4 text-gray-500">{row.by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="py-16" data-testid="section-documents">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-['DM_Sans'] font-black text-2xl md:text-3xl text-[#091a4f] mb-8">Documents Required</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {documents.map((doc, i) => (
                <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-100" data-testid={`doc-${i}`}>
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50" data-testid="section-faq">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-['DM_Sans'] font-black text-2xl md:text-3xl text-[#091a4f] mb-8 text-center">Admission FAQs</h2>
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

        <section className="py-16" data-testid="section-contact">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="font-['DM_Sans'] font-black text-2xl md:text-3xl text-[#091a4f] mb-4">Start Your Child's Journey</h2>
            <p className="text-gray-500 mb-8 max-w-xl mx-auto">Fill the enquiry form below or call our admissions desk directly.</p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <a href="tel:+918291568972" className="inline-flex items-center gap-2 bg-[#091a4f] text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-[#0d3b86] transition" data-testid="btn-call">
                <Phone className="w-4 h-4" /> +91 82915 68972
              </a>
              <a href="/application-form" className="inline-flex items-center gap-2 bg-amber-400 text-[#091a4f] px-6 py-3 rounded-full font-semibold text-sm hover:bg-amber-300 transition" data-testid="btn-apply">
                <FileText className="w-4 h-4" /> Apply Online
              </a>
            </div>
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
