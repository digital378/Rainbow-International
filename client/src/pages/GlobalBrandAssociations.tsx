import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";

const associations = [
  {
    name: "Cambridge International",
    logo: null,
    description: "Curriculum frameworks and learning resources aligned with Cambridge International's global standards.",
  },
  {
    name: "Google for Education",
    logo: null,
    description: "Google Classroom, Workspace for Education, and Chromebooks for seamless digital learning.",
  },
  {
    name: "FIT INDIA",
    logo: null,
    description: "Approved by the Ministry of Youth Affairs and Sports as an official FIT INDIA School.",
  },
  {
    name: "CBSE",
    logo: null,
    description: "Affiliated to the Central Board of Secondary Education (Affiliation No. 1130661).",
  },
];

export default function GlobalBrandAssociations() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Global Brand Associations - Rainbow International School"
        description="Rainbow International School's global brand associations and partnerships that enhance the quality of education and learning experiences for students in Thane West."
        keywords="Rainbow school global partnerships, school associations Thane, Rainbow International School CBSE Google partnership"
        canonical="https://rainbowinternationalschool.in/global-brand-associations/"
      />
      <Navbar />
      <PageBanner
        title="Global Brand Associations"
        subtitle="World-class partnerships that elevate Rainbow's educational standards."
        breadcrumb={[{ label: "Global Brand Associations" }]}
      />

      <main className="flex-grow">
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              Rainbow International School's commitment to world-class education is reflected in our carefully curated global brand associations. These partnerships enable us to deliver the best of global educational practices to our students in Thane West.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {associations.map((item, i) => (
                <div key={i} className="bg-card rounded-2xl p-8 shadow border text-center" data-testid={`card-association-${i}`}>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary font-serif">
                    {item.name.charAt(0)}
                  </div>
                  <h3 className="font-serif font-bold text-xl text-primary mb-3">{item.name}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
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
