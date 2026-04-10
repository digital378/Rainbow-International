import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";

const associations = [
  {
    name: "Cambridge International",
    description: "Curriculum frameworks and learning resources aligned with Cambridge International's global standards.",
  },
  {
    name: "Google for Education",
    description: "Google Classroom, Workspace for Education, and Chromebooks for seamless digital learning.",
  },
  {
    name: "FIT INDIA",
    description: "Approved by the Ministry of Youth Affairs and Sports as an official FIT INDIA School.",
  },
  {
    name: "CBSE",
    description: "Affiliated to the Central Board of Secondary Education (Affiliation No. 1130661).",
  },
];

export default function GlobalBrandAssociations() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Global Brand Associations"
        description="Rainbow International School's global brand associations and partnerships that enhance the quality of education and learning experiences for students in Thane."
        keywords="Rainbow school global partnerships, school associations Thane, Rainbow International School CBSE Google partnership"
        canonical="https://www.rainbowinternationalschool.in/global-brand-associations/"
      />
      <Navbar />
      <PageBanner
        title="Global Brand Associations"
        subtitle="World-class partnerships that elevate Rainbow's educational standards."
        breadcrumb={[{ label: "Global Brand Associations" }]}
      />

      <main className="flex-grow">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <p className="text-lg text-gray-600 leading-relaxed mb-12">
              Rainbow International School's commitment to world-class education is reflected in our carefully curated global brand associations. These partnerships enable us to deliver the best of global educational practices to our students in Thane.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {associations.map((item, i) => (
                <div key={i} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center" data-testid={`card-association-${i}`}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black" style={{ background: "#f0f4ff", color: "#0d3b86" }}>
                    {item.name.charAt(0)}
                  </div>
                  <h3 className="font-black text-xl mb-3" style={{ color: "#0d3b86" }}>{item.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
