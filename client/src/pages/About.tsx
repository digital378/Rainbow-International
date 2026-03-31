import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";

export default function About() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="About Rainbow International School - Thane West"
        description="Learn about Rainbow International School — founded in April 2009, serving 3000+ students across 3.5 acres in Thane West. CBSE affiliated, Nursery to Class 12."
        keywords="about Rainbow International School, CBSE school Thane West, best school Thane, Rainbow school history"
        canonical="https://rainbowinternationalschool.in/about-rainbow-international-school/"
      />
      <Navbar />
      <PageBanner
        title="About Rainbow"
        breadcrumb={[{ label: "About Rainbow" }]}
        bgImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Infrastructure-3-1024x536-1.jpg"
      />

      <main className="flex-grow">
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-serif font-bold text-primary mb-6">Welcome to Rainbow International School</h2>
              <div className="prose prose-lg max-w-none text-muted-foreground space-y-5">
                <p>
                  Founded in <strong>April 2009, Rainbow International School</strong> has touched the lives of more than 50,000 students ever since.
                </p>
                <p>
                  Being One of the Finest educational Institutes in Thane, Rainbow International School is considered to have a campus that spans over <strong>3.5 acres</strong>. In addition to being a visible landmark, we are also enormous in terms of many other factors — more than <strong>3,000 students</strong> are enrolled across two shifts.
                </p>
                <p>
                  In addition to being synonymous with quality education, we at Rainbow International School are committed to all-around growth in our students. Rainbow allows its students to explore human excellence through competence, conscience, and compassion.
                </p>
                <p>
                  Our Teaching methods integrate comfort, colors, and technology within classrooms, which enables our students not only to learn more effectively but also quickly.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <img
                src="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Infrastructure-3-1024x536-1.jpg"
                alt="Rainbow International School Infrastructure"
                className="rounded-2xl shadow-lg w-full object-cover"
              />
              <img
                src="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/01.jpeg"
                alt="Rainbow International School"
                className="rounded-2xl shadow-lg w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-serif font-bold text-primary text-center mb-12">Our Learning Spaces</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-card rounded-xl p-6 shadow border">
                <h3 className="font-serif font-bold text-xl text-primary mb-3">Academic Spaces</h3>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  <li>• State-of-the-art Laboratories</li>
                  <li>• Library & Reading Room</li>
                  <li>• Multipurpose Hall</li>
                  <li>• Music Room</li>
                  <li>• Art & Craft Room</li>
                  <li>• Amphitheater</li>
                  <li>• Organic Farming Area</li>
                  <li>• Infirmary</li>
                </ul>
              </div>
              <div className="bg-card rounded-xl p-6 shadow border">
                <h3 className="font-serif font-bold text-xl text-primary mb-3">Sports Spaces</h3>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  <li>• Football Field</li>
                  <li>• Adventure Sports Field</li>
                  <li>• Skating Rink</li>
                  <li>• Swimming Pool</li>
                  <li>• Multipurpose Courts</li>
                  <li>• Cricket Ground</li>
                  <li>• Indoor Sports Facility</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-serif font-bold mb-8">Rainbow at a Glance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              <div>
                <div className="text-4xl font-bold font-serif text-secondary mb-2">2009</div>
                <div className="text-white/80 text-sm">Founded</div>
              </div>
              <div>
                <div className="text-4xl font-bold font-serif text-secondary mb-2">50,000+</div>
                <div className="text-white/80 text-sm">Students Impacted</div>
              </div>
              <div>
                <div className="text-4xl font-bold font-serif text-secondary mb-2">3.5</div>
                <div className="text-white/80 text-sm">Acres Campus</div>
              </div>
              <div>
                <div className="text-4xl font-bold font-serif text-secondary mb-2">3,000+</div>
                <div className="text-white/80 text-sm">Current Students</div>
              </div>
            </div>
          </div>
        </section>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
