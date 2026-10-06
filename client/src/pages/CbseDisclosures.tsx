import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import ScrollProgress from "@/components/home/ScrollProgress";
import { ExternalLink, FileText, Download, Play } from "lucide-react";
import { Link } from "wouter";

const GDRIVE_VIEW = (id: string) => `https://drive.google.com/file/d/${id}/view`;

const generalInfo = [
  { label: "Name of the School", value: "Rainbow International School" },
  { label: "Affiliation Number (if applicable)", value: "1130661" },
  { label: "School Code (if applicable)", value: "30562" },
  { label: "Complete Address with PIN Code", value: "Brahmand Phase 4, Opp. TMC Water Tank, Kolshet Rd, Thane, Maharashtra – 400607" },
  { label: "Principal Name & Qualification", value: "Mrs. Vimlesh Sindhu / MA B.Ed" },
  { label: "Email ID", value: "vimlesh@rainbowpreschools.com" },
  { label: "Contact Details", value: "+91 82915 68972" },
];

const documents: { label: string; href: string; fileName: string }[] = [
  { label: "Copies of Affiliation / Upgradation Letter and Recent Extension of Affiliation if any", href: GDRIVE_VIEW("1nFeA3ELa4VYZngXGjIc7UNiMlJ1Z6Umk"), fileName: "Affiliation-Letter-of-Senior-Secondary.pdf" },
  { label: "Copies of Societies / Trust / Company / Registration, Renewal Certificate as Applicable", href: GDRIVE_VIEW("1oyUgxoO3C3zR4fNrTQnBGaXHikjk0Hnp"), fileName: "Trust-Certificate-merged.pdf" },
  { label: "Copies of Land Certificate as Applicable", href: GDRIVE_VIEW("1n1_tMa-gPDedmbT0nVVexXO7oQuo577s"), fileName: "Certificate-of-Land.webp" },
  { label: "Copy of No Objection Certificate (NOC) issued if applicable by the State Govt. / UT", href: GDRIVE_VIEW("1g1EGFW1-bxxHvTgF0c_L2LPCOF3301_U"), fileName: "NOC-Merged.pdf" },
  { label: "Copies of Recognition Certificate under RTE Act 2009 and its Renewal if Applicable", href: GDRIVE_VIEW("1cR1Yz_uVyZXqQozEW4gdg9h__Egbhp1S"), fileName: "RTE-combinepdf.pdf" },
  { label: "Copy of Valid Building Safety Certificate as per the National Building Code", href: GDRIVE_VIEW("1zXyfAyhgAJpiSPsACdNqjsIayGpB9x33"), fileName: "Building-Safety-Certificate-2025-26.pdf" },
  { label: "Copy of Valid Fire Safety Certificate issued by the Competent Authority", href: "/Fire-Safety-Certificate-2025-26.pdf", fileName: "Fire-Safety-Certificate-2025-26.pdf" },
  { label: "Copy of the DEO Certificate submitted by the School for Affiliation / Upgradation / Extension of Affiliation or Self Certification by the School", href: GDRIVE_VIEW("1efCCqNiaqg1Imx3bWePzmjYm9Qi2i2h8"), fileName: "Self-Certification-Proforma.pdf" },
  { label: "Copies of Valid Water, Health, Sanitation Certificates", href: GDRIVE_VIEW("166xkM9t8olMO5pX0a8wPHRGXi4va46pI"), fileName: "Water-Sanitation-Certificate-2025-26.pdf" },
];

const academicDocs: { label: string; href: string; fileName: string }[] = [
  { label: "Annual Academic Calendar", href: GDRIVE_VIEW("1TEcAUNV7Um6_1iSaGxcybOCJRPEaenFq"), fileName: "Academic-Calendar-25-26.pdf" },
  { label: "List of Teaching Staff", href: GDRIVE_VIEW("1TwI-ZRHfBEt8AdqRtpuOUO0bmL1BJ9My"), fileName: "List-of-Teaching-Staff.pdf" },
  { label: "List of School Management Committee (SMC)", href: GDRIVE_VIEW("1oh_2PLZVLaO9OBXI65t0GZIOhPyimZSQ"), fileName: "School-Managing-Committee-Members-AY-2024-25.pdf" },
  { label: "List of Parents Teachers Association (PTA) Members", href: GDRIVE_VIEW("1h4wYsy2htv3JdTaDPCGgAESbFuTgtuSJ"), fileName: "PTA-List-AY-2024-25.pdf" },
];

const classXResults = [
  { year: "2018-19", registered: 43, passed: 43, pct: "80%", remarks: "100% Result" },
  { year: "2019-20", registered: 84, passed: 84, pct: "80.5%", remarks: "100% Result" },
  { year: "2020-21", registered: 105, passed: 105, pct: "80.21%", remarks: "100% Result" },
  { year: "2021-22", registered: 134, passed: 134, pct: "82.93%", remarks: "100% Result" },
  { year: "2022-23", registered: 124, passed: 124, pct: "81.49%", remarks: "100% Result" },
  { year: "2023-24", registered: 122, passed: 122, pct: "83.92%", remarks: "100% Result" },
  { year: "2024-25", registered: 104, passed: 104, pct: "81.16%", remarks: "100% Result" },
];

const classXIIResults = [
  { year: "2022-23", registered: 14, passed: 14, pct: "65.88%", remarks: "100% Result" },
  { year: "2023-24", registered: 220, passed: 220, pct: "76.77%", remarks: "99% Result" },
  { year: "2024-25", registered: 337, passed: 335, pct: "73.43%", remarks: "99% Results" },
];

const staffInfo = [
  { label: "Principal", value: "1" },
  { label: "Total Number of Teachers", value: "112" },
  { label: "A. PGT", value: "30" },
  { label: "B. TGT", value: "31" },
  { label: "C. PRT", value: "40" },
  { label: "D. Other", value: "13" },
  { label: "Teachers Section Ratio", value: "1:3" },
  { label: "Details of Special Education", value: "Mrs. Sai Rasai" },
  { label: "Details of Counsellor and Wellness Teacher", value: "Ms. Nazneen Thawali" },
];

const infrastructure: { label: string; value: string; href?: string }[] = [
  { label: "Total Campus Area of the School (in square metres)", value: "4960 sq m" },
  { label: "No. and Size of the Classrooms in sq. mtr", value: "36 Classrooms — 553 sq ft each" },
  {
    label: "No. and Size of the Laboratories including the Computer Lab in sq. mtr",
    value: "5 Labs — Biology Lab: 750 sq ft | Chemistry Lab: 750 sq ft | Physics Lab: 750 sq ft | Computer Lab: 762 sq ft | Nilams: 553 sq ft",
  },
  { label: "Internet Facility (Y/N)", value: "YES" },
  { label: "No. of Girls Toilet", value: "12" },
  { label: "No. of Boys Toilet", value: "15" },
  {
    label: "Link of YouTube Video of Inspection of School covering the Infrastructure",
    value: "Watch Video",
    href: "https://youtu.be/Xz_t149modg?si=p0y4aPrPYuGr2vy4",
  },
];

const disclosureAppendix: { label: string; href: string; fileName: string }[] = [
  { label: "Mandatory Public Disclosure (Appendix – IX)", href: GDRIVE_VIEW("1kvwzSBk1AnPVAyIOgVwGDHSveUX2zU4v"), fileName: "SARAS-MANDATORY-DISCLOSURE.pdf" },
];

const thBase = "px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-50";
const tdBase = "px-4 py-3 text-sm text-gray-700 border-t border-gray-100";

function SectionTitle({ letter, title }: { letter: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0" style={{ background: "#0d3b86" }}>
        {letter}
      </div>
      <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">{title}</h2>
    </div>
  );
}

function InfoTable({ rows }: { rows: { label: string; value: string; href?: string }[] }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-4 overflow-x-auto">
      <table className="w-full min-w-[540px]">
        <thead>
          <tr>
            <th className={`${thBase} w-1/2`}>Information</th>
            <th className={thBase}>Details</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
              <td className={`${tdBase} font-medium text-gray-700`}>{row.label}</td>
              <td className={tdBase}>
                {row.href ? (
                  <a href={row.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold hover:underline" style={{ color: "#0d3b86" }}>
                    {row.value === "Watch Video" ? (
                      <><Play size={12} fill="#0d3b86" /> Watch Video</>
                    ) : (
                      <>{row.value} <ExternalLink size={12} /></>
                    )}
                  </a>
                ) : (
                  row.value
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DocumentTable({ rows }: { rows: { label: string; href: string; fileName: string }[] }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-4 overflow-x-auto">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr>
            <th className={`${thBase} w-2/5`}>Document Information</th>
            <th className={`${thBase}`}>File Name</th>
            <th className={`${thBase} text-center`}>View</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
              <td className={`${tdBase} font-medium text-gray-700`}>{row.label}</td>
              <td className={`${tdBase} text-gray-500 text-xs`}>{row.fileName}</td>
              <td className={`${tdBase} text-center`}>
                <a
                  href={row.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline px-3 py-1.5 rounded-lg transition-colors"
                  style={{ color: "#0d3b86", background: "#f0f4ff" }}
                  data-testid={`link-doc-${i}`}
                >
                  <Download size={13} /> View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResultTable({ rows }: { rows: typeof classXResults }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-8 overflow-x-auto">
      <table className="w-full min-w-[720px]">
        <thead>
          <tr>
            <th className={thBase}>Year</th>
            <th className={thBase}>No. of Registered Students</th>
            <th className={thBase}>No. of Students Passed</th>
            <th className={thBase}>Pass Percentage</th>
            <th className={thBase}>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
              <td className={`${tdBase} font-semibold`}>{row.year}</td>
              <td className={tdBase}>{row.registered}</td>
              <td className={tdBase}>{row.passed}</td>
              <td className={`${tdBase} font-semibold`} style={{ color: "#0d3b86" }}>{row.pct}</td>
              <td className={tdBase}>
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#ecfdf5", color: "#10b981" }}>
                  {row.remarks}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CbseDisclosures() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="CBSE Public Disclosures | Rainbow International School"
        description="CBSE mandatory public disclosures for Rainbow International School, Thane. Affiliation number 1130661. Full details including staff, infrastructure, results and documents."
        keywords="Rainbow school CBSE disclosure, CBSE affiliation number 1130661, public disclosure school Thane"
        canonical="https://rainbowinternationalschool.in/cbse-mandatory-public-disclosures"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "CBSE Disclosures", href: "https://rainbowinternationalschool.in/cbse-mandatory-public-disclosures" },
        ]}
      />
      <Navbar />
      <PageBanner
        title="CBSE Mandatory Public Disclosures"
        subtitle="Affiliation No. 1130661 — As required under CBSE norms"
        breadcrumb={[{ label: "CBSE Disclosures" }]}
      />

      <main className="flex-grow py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl space-y-14">

          <div>
            <SectionTitle letter="A" title="General Information" />
            <InfoTable rows={generalInfo} />
          </div>

          <div>
            <SectionTitle letter="B" title="Documents and Information" />
            <DocumentTable rows={documents} />
          </div>

          <div>
            <SectionTitle letter="C" title="Academic Details & Results" />
            <DocumentTable rows={academicDocs} />

            <h3 className="text-lg font-black text-gray-900 mt-8 mb-3 uppercase tracking-wide">Result — Class X</h3>
            <ResultTable rows={classXResults} />

            <h3 className="text-lg font-black text-gray-900 mt-8 mb-3 uppercase tracking-wide">Result — Class XII</h3>
            <ResultTable rows={classXIIResults} />
          </div>

          <div>
            <SectionTitle letter="D" title="Staff (Teaching)" />
            <InfoTable rows={staffInfo} />
          </div>

          <div>
            <SectionTitle letter="E" title="School Infrastructure" />
            <InfoTable rows={infrastructure} />
          </div>

          <div>
            <SectionTitle letter="F" title="Mandatory Public Disclosure" />
            <DocumentTable rows={disclosureAppendix} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/declaration"
              className="flex items-center gap-3 p-5 rounded-2xl border border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow"
              data-testid="link-declaration"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#f0f4ff" }}>
                <FileText size={20} style={{ color: "#0d3b86" }} />
              </div>
              <div>
                <p className="font-black text-sm" style={{ color: "#0d3b86" }}>Declaration</p>
                <p className="text-xs text-gray-500 mt-0.5">View the school's official declaration document</p>
              </div>
            </Link>
            <a
              href="/Book-List-2026-27.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-5 rounded-2xl border border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow"
              data-testid="link-booklist"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#fff7ed" }}>
                <FileText size={20} style={{ color: "#b45309" }} />
              </div>
              <div>
                <p className="font-black text-sm" style={{ color: "#b45309" }}>Book List 2026–27</p>
                <p className="text-xs text-gray-500 mt-0.5">View the complete book list for all classes</p>
              </div>
            </a>
          </div>

          <div className="p-6 rounded-2xl border border-gray-100 flex items-start gap-3" style={{ background: "#f8faff" }}>
            <FileText size={18} className="mt-0.5 flex-shrink-0" style={{ color: "#0d3b86" }} />
            <p className="text-sm text-gray-600 leading-relaxed">
              For complete and up-to-date CBSE mandatory disclosures, please refer to the{" "}
              <a href="https://cbse.gov.in" target="_blank" rel="noopener noreferrer" className="font-semibold underline" style={{ color: "#0d3b86" }}>official CBSE website</a>{" "}
              or contact the school administration at <strong>+91 82915 68972</strong>.
            </p>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
