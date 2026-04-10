import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import ScrollProgress from "@/components/home/ScrollProgress";
import { ExternalLink, Download } from "lucide-react";

const GDRIVE_ID = "1RQf1Ccf9cQhan2kQrPe_87Pp2Czd4lt5";
const PREVIEW_URL = `https://drive.google.com/file/d/${GDRIVE_ID}/preview`;
const VIEW_URL = `https://drive.google.com/file/d/${GDRIVE_ID}/view`;

export default function Declaration() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Declaration"
        description="Official declaration document of Rainbow International School, Thane — CBSE affiliation number 1130661."
        keywords="Rainbow International School declaration, CBSE school declaration Thane, school declaration document"
        canonical="https://www.rainbowinternationalschool.in/declaration"
      />
      <Navbar />
      <PageBanner
        title="Declaration"
        subtitle="Official declaration document as per CBSE norms"
        breadcrumb={[
          { label: "CBSE Disclosures", href: "/cbse-mandatory-public-disclosures" },
          { label: "Declaration" },
        ]}
      />

      <main className="flex-grow py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3" style={{ background: "#f0f4ff" }}>
              <h2 className="font-black text-lg" style={{ color: "#0d3b86" }}>Declaration Document</h2>
              <a
                href={VIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full text-white transition-opacity hover:opacity-90"
                style={{ background: "#0d3b86" }}
                data-testid="link-declaration-download"
              >
                <Download size={14} />
                Open in Google Drive
                <ExternalLink size={12} />
              </a>
            </div>

            <div className="w-full" style={{ minHeight: "80vh" }}>
              <iframe
                src={PREVIEW_URL}
                title="Declaration PDF"
                className="w-full border-0"
                style={{ height: "80vh" }}
                allow="autoplay"
                data-testid="iframe-declaration"
              />
            </div>
          </div>

          <div className="mt-6 p-5 rounded-2xl border border-gray-100 bg-white text-center">
            <p className="text-gray-500 text-sm mb-3">Having trouble viewing the document?</p>
            <a
              href={VIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-full text-white transition-opacity hover:opacity-90"
              style={{ background: "#0d3b86" }}
              data-testid="link-declaration-fallback"
            >
              <ExternalLink size={14} />
              Open PDF Directly
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
