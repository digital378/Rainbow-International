import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import { Clock, CheckCircle } from "lucide-react";
import ScrollProgress from "@/components/home/ScrollProgress";

const steps = [
  { step: 1, title: "Submit Application", description: "Parent/guardian submits a written application requesting the Leaving Certificate from the school office." },
  { step: 2, title: "Clearance Process", description: "All dues (fees, library books, sports equipment) must be cleared. The school verifies the student's record." },
  { step: 3, title: "Principal's Approval", description: "The application is reviewed and approved by the Principal after verification." },
  { step: 4, title: "Certificate Issuance", description: "The Leaving Certificate is issued typically within 3–5 working days of approval." },
];

const documents = [
  "Written application from parent/guardian",
  "School ID card of the student",
  "All fee receipts/payment confirmation",
  "Library clearance (return of all books)",
  "Sports equipment clearance (if applicable)",
  "Original Transfer Certificate (if admitted from another school)",
];

export default function StudentsLeavingCertificate() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Students Leaving Certificate"
        description="Information on how to apply for a Leaving Certificate (Transfer Certificate) from Rainbow International School, Thane. Process, required documents, and timelines."
        keywords="leaving certificate Rainbow school, transfer certificate Thane school, Rainbow International School TC, student leaving certificate Thane"
        canonical="https://rainbowinternationalschool.in/students-leaving-certificate/"
      />
      <Navbar />
      <PageBanner
        title="Students Leaving Certificate"
        subtitle="Process for obtaining a Leaving / Transfer Certificate."
        breadcrumb={[{ label: "Leaving Certificate" }]}
      />

      <main className="flex-grow">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 mb-10">
              <p className="text-amber-800 text-sm leading-relaxed">
                <strong>Important:</strong> Leaving Certificates are issued only to students who have fulfilled all academic and financial obligations to Rainbow International School. Please ensure all dues are cleared before applying.
              </p>
            </div>

            <h2 className="text-2xl font-black mb-8" style={{ color: "#0d3b86" }}>Process for Obtaining a Leaving Certificate</h2>
            <div className="space-y-4 mb-14">
              {steps.map((s) => (
                <div key={s.step} className="flex gap-5 bg-white rounded-3xl p-5 shadow-sm border border-gray-100 items-start" data-testid={`card-step-${s.step}`}>
                  <div className="w-10 h-10 text-white rounded-full flex items-center justify-center font-black text-lg shrink-0" style={{ background: "#0d3b86" }}>{s.step}</div>
                  <div>
                    <h3 className="font-black text-lg mb-1" style={{ color: "#0d3b86" }}>{s.title}</h3>
                    <p className="text-gray-600 text-sm">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-black mb-6" style={{ color: "#0d3b86" }}>Required Documents</h2>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-12">
              <ul className="space-y-3">
                {documents.map((doc, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600 text-sm">
                    <CheckCircle size={18} className="text-green-500 shrink-0" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl p-6 border border-gray-100" style={{ background: "#f8faff" }}>
              <div className="flex items-start gap-4">
                <Clock size={22} className="mt-1 shrink-0" style={{ color: "#0d3b86" }} />
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: "#0d3b86" }}>Processing Time</h3>
                  <p className="text-gray-600 text-sm">Leaving Certificates are typically issued within <strong>3–5 working days</strong> after all clearances are obtained and the application is approved by the Principal.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">For queries, please contact the school office:</p>
              <a href="tel:+918655003366" onClick={() => { import("@/lib/analytics").then(m => m.trackCallClick({ phone: "+91 86550 03366" })); }} className="inline-block text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity" style={{ background: "#0d3b86" }}>
                Call +91 86550 03366
              </a>
            </div>
          </div>
        </section>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
