import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";

const committee = [
  { role: "Chairman", name: "Mr. Dhananjay Sapre" },
  { role: "Principal", name: "Ms. Vaishali Sapre" },
  { role: "Vice Principal", name: "As per school records" },
  { role: "Academic Head", name: "As per school records" },
  { role: "Administrative Head", name: "As per school records" },
  { role: "Co-ordinator – Pre-Primary", name: "As per school records" },
  { role: "Co-ordinator – Primary", name: "As per school records" },
  { role: "Co-ordinator – Secondary", name: "As per school records" },
];

export default function SchoolManagingCommittee() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="School Managing Committee - Rainbow International School"
        description="Meet the dedicated leaders behind Rainbow International School. Our School Managing Committee ensures excellence in educational governance and student development."
        keywords="Rainbow school managing committee, Rainbow International School leadership, school management Thane West"
        canonical="https://rainbowinternationalschool.in/school-managing-committee/"
      />
      <Navbar />
      <PageBanner
        title="School Managing Committee"
        subtitle="The dedicated leaders behind Rainbow International School."
        breadcrumb={[{ label: "School Managing Committee" }]}
      />

      <main className="flex-grow">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              Rainbow International School is led by an experienced and passionate managing committee committed to delivering world-class education and nurturing every student's potential.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-10">
              Our committee members bring years of experience in education, management, and student development — ensuring that Rainbow remains one of the top CBSE schools in Thane West.
            </p>

            <h2 className="text-2xl font-black mb-8 text-center" style={{ color: "#0d3b86" }}>Committee Members</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {committee.map((member, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center" data-testid={`card-committee-${i}`}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black" style={{ background: "#f0f4ff", color: "#0d3b86" }}>
                    {member.name.charAt(0)}
                  </div>
                  <h3 className="font-black text-lg mb-1" style={{ color: "#0d3b86" }}>{member.name}</h3>
                  <p className="text-sm font-bold uppercase tracking-wide text-amber-500">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-2xl font-black mb-4" style={{ color: "#0d3b86" }}>Our Governance Philosophy</h2>
            <p className="text-gray-600 leading-relaxed">
              The School Managing Committee of Rainbow International School is committed to maintaining the highest standards of academic excellence, ethical governance, and student well-being. We work tirelessly to create an environment where every child can thrive and achieve their full potential.
            </p>
          </div>
        </section>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
