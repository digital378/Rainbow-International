import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";

const committee = [
  {
    sr: 1,
    name: "Mrs. Akila Balbale",
    occupation: "Proprietor Rainbow International School",
    qualification: "B.Com",
    designation: "Chairperson",
    term: "—",
  },
  {
    sr: 2,
    name: "Mrs. Vimlesh Sindhu",
    occupation: "Service",
    qualification: "M.A, B.Ed.",
    designation: "Principal",
    term: "—",
  },
  {
    sr: 3,
    name: "Mr. Balaji Srinivasan",
    occupation: "Service",
    qualification: "MSc & PG in System Analysis & PG in Marketing & Finance",
    designation: "School Manager",
    term: "3 Years",
  },
  {
    sr: 4,
    name: "Mr. Pratap Ade",
    occupation: "Service",
    qualification: "B.A.",
    designation: "Parent Representative",
    term: "3 Years",
  },
  {
    sr: 5,
    name: "Mrs. Anuja Pradhan",
    occupation: "Business",
    qualification: "B. Arch",
    designation: "Parent Representative",
    term: "3 Years",
  },
  {
    sr: 6,
    name: "Rizwia Khan",
    occupation: "Service",
    qualification: "M.Sc, M.A (Edu)",
    designation: "Teacher Representative",
    term: "3 Years",
  },
  {
    sr: 7,
    name: "Ashwini Rasal",
    occupation: "Service",
    qualification: "M.Sc, B. Ed",
    designation: "Teacher Representative",
    term: "3 Years",
  },
  {
    sr: 8,
    name: "Dr. Poonam Singh",
    occupation: "Service",
    qualification: "M.A (Eco), Ph.D.",
    designation: "Nominated Member",
    term: "3 Years",
  },
  {
    sr: 9,
    name: "Mrs. Seema Tiwari",
    occupation: "Service",
    qualification: "MA, B.Ed.",
    designation: "Nominated Member",
    term: "3 Years",
  },
  {
    sr: 10,
    name: "Dr. Jyoti Nair",
    occupation: "Service",
    qualification: "Ph.D, Biology",
    designation: "Principal",
    term: "3 Years",
  },
  {
    sr: 11,
    name: "Dr. Lipika Chandra",
    occupation: "Service",
    qualification: "MA, Ph.D.",
    designation: "Principal",
    term: "3 Years",
  },
  {
    sr: 12,
    name: "Wg. Cdr. Rahul Kumar",
    occupation: "Service",
    qualification: "B.A.",
    designation: "Govt Employee",
    term: "3 Years",
  },
  {
    sr: 13,
    name: "Amrita Pereira",
    occupation: "Service",
    qualification: "B.Com, MBA",
    designation: "Trustee Representative",
    term: "3 Years",
  },
  {
    sr: 14,
    name: "Mrs. Rama Chandrasekhar",
    occupation: "Service",
    qualification: "M.A, B.Ed",
    designation: "Resource Representative",
    term: "3 Years",
  },
  {
    sr: 15,
    name: "Mrs. Susmita Vivek Tamhankar",
    occupation: "Service",
    qualification: "Bachelors of Fine Arts",
    designation: "Cultural Representative",
    term: "3 Years",
  },
  {
    sr: 16,
    name: "Rahul Singh",
    occupation: "Service",
    qualification: "B.Tech, MBA",
    designation: "Technical Representative",
    term: "3 Years",
  },
];

const designationColors: Record<string, { bg: string; text: string }> = {
  "Chairperson":             { bg: "#fef3c7", text: "#b45309" },
  "Principal":               { bg: "#e0edff", text: "#0d3b86" },
  "School Manager":          { bg: "#e0f7f0", text: "#047857" },
  "Parent Representative":   { bg: "#f3e0ff", text: "#6d28d9" },
  "Teacher Representative":  { bg: "#fdf2f8", text: "#be185d" },
  "Nominated Member":        { bg: "#f0fdf4", text: "#15803d" },
  "Govt Employee":           { bg: "#fff7ed", text: "#c2410c" },
  "Trustee Representative":  { bg: "#eff6ff", text: "#1d4ed8" },
  "Resource Representative": { bg: "#fefce8", text: "#854d0e" },
  "Cultural Representative": { bg: "#fdf4ff", text: "#7e22ce" },
  "Technical Representative":{ bg: "#f0f9ff", text: "#0369a1" },
};

function badge(designation: string) {
  const c = designationColors[designation] ?? { bg: "#f1f5f9", text: "#475569" };
  return (
    <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: c.bg, color: c.text }}>
      {designation}
    </span>
  );
}

export default function SchoolManagingCommittee() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="School Managing Committee"
        description="Meet the School Managing Committee of Rainbow International School, Thane — 16 members including the Chairperson, Principal, parent & teacher representatives."
        keywords="Rainbow school managing committee, Rainbow International School leadership, school management Thane, CBSE school committee"
        canonical="https://rainbowinternationalschool.in/school-managing-committee"
      />
      <Navbar />
      <PageBanner
        title="School Managing Committee"
        subtitle="The dedicated leaders guiding Rainbow International School."
        breadcrumb={[{ label: "School Managing Committee" }]}
      />

      <main className="flex-grow">

        {/* ── Intro ────────────────────────────────────────────────── */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl font-black mb-5" style={{ color: "#0d3b86" }}>Our School Managing Committee</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              The School Managing Committee (SMC) of Rainbow International School is constituted as per CBSE norms and plays a pivotal role in the academic, administrative and financial governance of the institution.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our committee brings together the Chairperson, Principals, Parent Representatives, Teacher Representatives, Nominated Members and other domain experts — collectively ensuring the school upholds the highest standards of education and welfare for every student.
            </p>
          </div>
        </section>

        {/* ── Table Section ─────────────────────────────────────────── */}
        <section className="py-4 pb-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <p className="text-gray-700 font-semibold mb-6 text-sm">List of School Managing Committee are as under:</p>

            {/* Desktop table */}
            <div className="hidden md:block rounded-3xl overflow-hidden border border-gray-200 shadow-sm bg-white">
              <table className="w-full text-sm" data-testid="table-smc">
                <thead>
                  <tr style={{ background: "#0d3b86" }}>
                    <th className="text-white font-bold text-left px-5 py-4 w-12">Sr. No</th>
                    <th className="text-white font-bold text-left px-5 py-4">Name</th>
                    <th className="text-white font-bold text-left px-5 py-4">Occupation</th>
                    <th className="text-white font-bold text-left px-5 py-4">Qualification</th>
                    <th className="text-white font-bold text-left px-5 py-4">Designation</th>
                    <th className="text-white font-bold text-left px-5 py-4">Term of Membership</th>
                  </tr>
                </thead>
                <tbody>
                  {committee.map((m, i) => (
                    <tr
                      key={m.sr}
                      className="border-t border-gray-100 transition-colors hover:bg-blue-50/50"
                      data-testid={`row-smc-${m.sr}`}
                    >
                      <td className="px-5 py-4 text-gray-400 font-semibold">{m.sr}</td>
                      <td className="px-5 py-4 font-bold text-gray-800">{m.name}</td>
                      <td className="px-5 py-4 text-gray-500">{m.occupation}</td>
                      <td className="px-5 py-4 text-gray-600">{m.qualification}</td>
                      <td className="px-5 py-4">{badge(m.designation)}</td>
                      <td className="px-5 py-4 text-gray-500 font-semibold">{m.term}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-4">
              {committee.map((m) => (
                <div key={m.sr} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5" data-testid={`card-smc-${m.sr}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-black text-base text-gray-800">{m.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">#{m.sr} · {m.occupation}</p>
                    </div>
                    {badge(m.designation)}
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span><strong className="text-gray-600">Qualification:</strong> {m.qualification}</span>
                    <span><strong className="text-gray-600">Term:</strong> {m.term}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Governance note ────────────────────────────────────────── */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="rounded-3xl p-7 border border-gray-100 shadow-sm" style={{ background: "#f8faff" }}>
                <p className="text-4xl font-black mb-2" style={{ color: "#0d3b86" }}>16</p>
                <p className="text-sm font-semibold text-gray-500">Committee Members</p>
              </div>
              <div className="rounded-3xl p-7 border border-gray-100 shadow-sm" style={{ background: "#fef3c7" }}>
                <p className="text-4xl font-black mb-2" style={{ color: "#b45309" }}>CBSE</p>
                <p className="text-sm font-semibold text-gray-500">Norms Compliant</p>
              </div>
              <div className="rounded-3xl p-7 border border-gray-100 shadow-sm" style={{ background: "#e0f7f0" }}>
                <p className="text-4xl font-black mb-2" style={{ color: "#047857" }}>3 Yrs</p>
                <p className="text-sm font-semibold text-gray-500">Standard Term of Membership</p>
              </div>
            </div>

            <div className="mt-10 rounded-3xl p-8 border border-gray-100 shadow-sm" style={{ background: "#f8faff" }}>
              <h3 className="text-xl font-black mb-3" style={{ color: "#0d3b86" }}>Our Governance Philosophy</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                The School Managing Committee of Rainbow International School is committed to maintaining the highest standards of academic excellence, ethical governance and student well-being. Constituted in accordance with CBSE guidelines, the committee meets regularly to review policies, budgets, academic outcomes and infrastructure development — ensuring Rainbow continues to be one of the finest CBSE schools in Thane.
              </p>
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────────── */}
        <div className="py-14 text-center" style={{ background: "#091a4f" }}>
          <p className="text-white font-bold text-lg mb-4">Admissions are Open for the Academic Year 2026–27</p>
          <a href="#contact" className="inline-block text-white font-bold py-3 px-8 rounded-full border-2 border-amber-400 hover:bg-amber-400 hover:text-gray-900 transition-colors">
            Enquire Now
          </a>
        </div>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
