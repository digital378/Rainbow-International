import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";

const committee = [
  { role: "Chairman", name: "Mr. Dhananjay Sapre", icon: "🎓" },
  { role: "Principal", name: "Ms. Vaishali Sapre", icon: "🏫" },
  { role: "Vice Principal", name: "As per school records", icon: "📋" },
  { role: "Academic Head", name: "As per school records", icon: "📚" },
  { role: "Administrative Head", name: "As per school records", icon: "🗂️" },
  { role: "Co-ordinator – Pre-Primary", name: "As per school records", icon: "🌈" },
  { role: "Co-ordinator – Primary", name: "As per school records", icon: "🌱" },
  { role: "Co-ordinator – Secondary", name: "As per school records", icon: "🔬" },
];

export default function SchoolManagingCommittee() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
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
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              Rainbow International School is led by an experienced and passionate managing committee committed to delivering world-class education and nurturing every student's potential.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10">
              Our committee members bring years of experience in education, management, and student development — ensuring that Rainbow remains one of the top CBSE schools in Thane West.
            </p>

            <h2 className="text-2xl font-serif font-bold text-primary mb-8 text-center">Committee Members</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {committee.map((member, i) => (
                <div key={i} className="bg-card rounded-2xl p-6 shadow border text-center" data-testid={`card-committee-${i}`}>
                  <div className="text-4xl mb-4">{member.icon}</div>
                  <h3 className="font-serif font-bold text-lg text-primary mb-1">{member.name}</h3>
                  <p className="text-sm text-secondary font-semibold uppercase tracking-wide">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-primary/5">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-2xl font-serif font-bold text-primary mb-4">Our Governance Philosophy</h2>
            <p className="text-muted-foreground leading-relaxed">
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
