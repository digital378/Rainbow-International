import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";

export default function ChairpersonsNote() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Chairperson's Note - Rainbow International School"
        description="A message from the Chairperson of Rainbow International School, Thane West — on the school's vision, values, and commitment to excellence in education."
        keywords="Rainbow school chairperson, Rainbow International School leadership message, chairperson note Thane school"
        canonical="https://rainbowinternationalschool.in/chairpersons-note/"
      />
      <Navbar />
      <PageBanner
        title="Chairperson's Note"
        breadcrumb={[{ label: "About Us", href: "/about-rainbow-international-school" }, { label: "Chairperson's Note" }]}
      />

      <main className="flex-grow">
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex flex-col md:flex-row gap-10 items-start">
              <div className="md:w-64 shrink-0 flex flex-col items-center md:items-start">
                <div className="w-44 h-44 rounded-2xl overflow-hidden bg-primary/10 shadow-lg flex items-center justify-center mb-4">
                  <img
                    src="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/cropped-RIS-Logo-PNG.png"
                    alt="Rainbow International School"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <p className="font-serif font-bold text-lg text-primary text-center md:text-left">Mr. Dhananjay Sapre</p>
                <p className="text-sm text-secondary font-semibold uppercase tracking-wide text-center md:text-left">Chairperson</p>
                <p className="text-xs text-muted-foreground text-center md:text-left mt-1">Rainbow International School</p>
              </div>

              <div className="flex-grow space-y-5 text-muted-foreground leading-relaxed">
                <p className="text-2xl font-serif font-bold text-primary mb-4">"World-Class Education, Indian Values"</p>

                <p>
                  Dear Students, Parents, and Well-wishers,
                </p>

                <p>
                  It is with immense pride and joy that I welcome you to Rainbow International School — an institution that has been a beacon of excellence in Thane West since 2009. What began as a dream to create a world-class school rooted in Indian values has today grown into one of the most trusted names in education, serving over <strong>3,000 students</strong> across Nursery to Class 12.
                </p>

                <p>
                  At Rainbow, we believe education is far more than academics. It is about nurturing curious, compassionate, and confident individuals who are ready to take on the world. Our emphasis on holistic development — through sports, arts, technology, and character building — ensures that every Rainbow student emerges as a well-rounded human being.
                </p>

                <p>
                  We have always believed that the partnership between a school and its parents is sacred. When we work together toward a common goal — the growth and wellbeing of our children — remarkable things happen. I personally commit to maintaining the highest standards of transparency, communication, and care in this partnership.
                </p>

                <p>
                  Our exceptional faculty, state-of-the-art infrastructure, and 3.5-acre campus are all designed with one purpose: to give every child the environment they need to discover their potential and pursue their passion.
                </p>

                <p>
                  As we look ahead, we remain committed to innovating, improving, and inspiring — because at Rainbow, excellence is not a destination; it's a journey we undertake together.
                </p>

                <p>
                  Thank you for your trust and faith in Rainbow International School.
                </p>

                <div className="pt-4">
                  <p className="font-bold text-primary font-serif text-lg">Warm regards,</p>
                  <p className="font-bold text-primary mt-1">Mr. Dhananjay Sapre</p>
                  <p className="text-sm text-muted-foreground">Chairperson, Rainbow International School</p>
                </div>
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
