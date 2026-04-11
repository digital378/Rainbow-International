import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { ExternalLink, Download } from "lucide-react";

const GDRIVE_ID = "1qYTNQn4sS00jFaHUjm83Uc_pcRz4vUcZ";
const PREVIEW_URL = `https://drive.google.com/file/d/${GDRIVE_ID}/preview`;
const VIEW_URL = `https://drive.google.com/file/d/${GDRIVE_ID}/view`;

export default function BookList() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Book List 2026–27"
        description="Rainbow International School provides a book list and study material to each student so they understand the syllabus from the start of the year. View the complete book list for all classes."
        keywords="Rainbow school book list, school books Thane, CBSE book list Thane, Rainbow International School study material"
        canonical="https://rainbowinternationalschool.in/book-list"
      />
      <Navbar />
      <PageBanner
        title="Book List"
        subtitle="Study materials for all classes — Academic Year 2026–27."
        breadcrumb={[{ label: "Book List" }]}
      />

      <main className="flex-grow py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3" style={{ background: "#f0f4ff" }}>
              <h2 className="font-black text-lg" style={{ color: "#0d3b86" }}>Book List — Academic Year 2026–27</h2>
              <a
                href={VIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full text-white transition-opacity hover:opacity-90"
                style={{ background: "#0d3b86" }}
                data-testid="link-booklist-download"
              >
                <Download size={14} />
                Open in Google Drive
                <ExternalLink size={12} />
              </a>
            </div>

            <div className="w-full" style={{ minHeight: "80vh" }}>
              <iframe
                src={PREVIEW_URL}
                title="Book List PDF"
                className="w-full border-0"
                style={{ height: "80vh" }}
                allow="autoplay"
                data-testid="iframe-booklist"
              />
            </div>
          </div>

          <div className="mt-6 p-5 rounded-2xl border border-gray-100 bg-white text-center">
            <p className="text-gray-500 text-sm mb-3">Having trouble viewing the document?</p>
            <div className="flex justify-center gap-3 flex-wrap">
              <a
                href={VIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-full text-white transition-opacity hover:opacity-90"
                style={{ background: "#0d3b86" }}
                data-testid="link-booklist-fallback"
              >
                <ExternalLink size={14} />
                Open PDF Directly
              </a>
              <a
                href="tel:+918291568972"
                onClick={() => { import("@/lib/analytics").then(m => m.trackCallClick({ phone: "+91 82915 68972" })); }}
                className="inline-flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-full border-2 transition-colors hover:bg-gray-50"
                style={{ borderColor: "#0d3b86", color: "#0d3b86" }}
              >
                Call +91 82915 68972
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <ContactForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
