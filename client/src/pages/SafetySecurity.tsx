import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";

const measures = [
  {
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Screenshot--768x415.jpeg",
    title: "Infirmary, Ambulance & Trained Nurse",
    description: "Fully equipped infirmary on campus with a trained nurse and ambulance for emergency situations.",
  },
  {
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-thane-amenities-metal-detectors.jpg",
    title: "CCTV Surveillance & Metal Detectors",
    description: "24/7 CCTV surveillance across the campus and metal detectors at entry points for maximum security.",
  },
  {
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-thane-transport.jpg",
    title: "CCTV & GPS Enabled Transport",
    description: "All school buses are equipped with CCTV cameras and GPS tracking for safe and monitored transportation.",
  },
  {
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/100-female-768x418.jpeg",
    title: "100% Female Staff for Preschool",
    description: "All preschool staff are female, ensuring a safe and nurturing environment for our youngest students.",
  },
];

export default function SafetySecurity() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Safety & Security - Rainbow International School Thane"
        description="Rainbow International School prioritizes student safety with CCTV surveillance, metal detectors, GPS-enabled transport, trained nurses, ambulance, and 100% female staff in the preschool."
        keywords="school safety Thane, Rainbow school security, safe school Thane West, CCTV school Thane, GPS school bus Thane"
        canonical="https://rainbowinternationalschool.in/safety-security/"
        ogImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/security.png"
      />
      <Navbar />
      <PageBanner
        title="Safety & Security"
        subtitle="Student safety & well-being is our top-most priority."
        breadcrumb={[{ label: "Safety & Security" }]}
        bgImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/security.png"
      />

      <main className="flex-grow">
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <p className="text-lg text-muted-foreground leading-relaxed mb-5">
              At Rainbow International School, we believe it's too narrow-minded of a school to think only about academics. We take safety and security very seriously. Every child's physical wellbeing is our responsibility — it's crucial for their mental wellbeing too.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-5">
              We use our human and technological resources in a variety of ways to ensure that the children are away from any kind of danger. We also ensure that the children are equipped with the knowledge of how to defend themselves when needed.
            </p>
          </div>
        </section>

        <section className="py-10 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-serif font-bold text-primary text-center mb-12">Rainbow – Safety & Security Measures</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {measures.map((measure, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-lg border" data-testid={`card-safety-${i}`}>
                  <img
                    src={measure.image}
                    alt={measure.title}
                    className="w-full h-52 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="p-6">
                    <h3 className="font-serif font-bold text-xl text-primary mb-2">{measure.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{measure.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 bg-background">
          <div className="container mx-auto px-4">
            <img
              src="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/ss-desktop.png"
              alt="Safety and Security overview"
              className="max-w-4xl mx-auto w-full rounded-2xl shadow-lg"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        </section>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
