import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import ScrollProgress from "@/components/home/ScrollProgress";

const disclosures = [
  { label: "Name of the School", value: "Rainbow International School" },
  { label: "Affiliation Number", value: "1130661" },
  { label: "School Code", value: "As per CBSE records" },
  { label: "Address", value: "Cosmos Arcade, Brahmand Phase 4, Thane West, Maharashtra, India" },
  { label: "Principal Name", value: "As per school records" },
  { label: "Contact Details", value: "+91 86550 03366 | info@rainbowinternationalschool.in" },
  { label: "Year of Establishment", value: "2009" },
  { label: "Status of Affiliation", value: "Permanent / Provisional (CBSE)" },
  { label: "Classes", value: "Nursery to Class XII" },
  { label: "Medium of Instruction", value: "English" },
  { label: "School Type", value: "Co-Educational Day School" },
  { label: "CBSE Region", value: "Maharashtra" },
];

export default function CbseDisclosures() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="CBSE Mandatory Public Disclosures - Rainbow International School"
        description="CBSE mandatory public disclosures for Rainbow International School, Thane West. Affiliation number 1130661. School information as required by CBSE regulations."
        keywords="Rainbow school CBSE disclosure, CBSE affiliation number 1130661, public disclosure school Thane"
        canonical="https://rainbowinternationalschool.in/cbse-mandatory-public-disclosures/"
      />
      <Navbar />
      <PageBanner
        title="CBSE Mandatory Public Disclosures"
        breadcrumb={[{ label: "CBSE Disclosures" }]}
      />

      <main className="flex-grow py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="text-gray-600 mb-8 leading-relaxed">
            As per CBSE guidelines, Rainbow International School is required to publish the following mandatory information for public disclosure. Affiliation Number: <strong>1130661</strong>.
          </p>

          <div className="rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            {disclosures.map((item, i) => (
              <div
                key={i}
                className={`flex gap-4 p-4 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
              >
                <span className="font-semibold text-sm w-52 shrink-0" style={{ color: "#0d3b86" }}>{item.label}</span>
                <span className="text-gray-600 text-sm">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 rounded-3xl border border-gray-100" style={{ background: "#f8faff" }}>
            <p className="text-sm text-gray-600">
              For complete and up-to-date CBSE mandatory disclosures, please refer to the official CBSE website at <a href="https://cbse.gov.in" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#0d3b86" }}>cbse.gov.in</a> or contact the school administration directly.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
