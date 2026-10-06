import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";

export default function ChairpersonsNote() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Chairperson's Note"
        description="A message from the Chairperson of Rainbow International School, Thane — on the school's vision, values, and commitment to excellence in education."
        keywords="Rainbow school chairperson, Rainbow International School leadership message, chairperson note Thane school"
        canonical="https://rainbowinternationalschool.in/chairpersons-note"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "About Us", href: "https://rainbowinternationalschool.in/about-rainbow-international-school" },
          { name: "Chairperson's Note", href: "https://rainbowinternationalschool.in/chairpersons-note" },
        ]}
      />
      <Navbar />
      <PageBanner
        title="Chairperson's Note"
        breadcrumb={[{ label: "About Us", href: "/about-rainbow-international-school" }, { label: "Chairperson's Note" }]}
      />

      <main className="flex-grow">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex flex-col md:flex-row gap-10 items-start">
              <div className="md:w-64 shrink-0 flex flex-col items-center md:items-start">
                <div className="w-44 h-44 rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex items-center justify-center mb-4" style={{ background: "#f0f4ff" }}>
                  <img
                    src="https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/cropped-RIS-Logo-PNG.png"
                    alt="Rainbow International School"
                    className="w-full h-full object-cover"
                    width={176}
                    height={176}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                <p className="font-black text-lg text-center md:text-left" style={{ color: "#0d3b86" }}>Ms. Akila Balbale</p>
                <p className="text-sm font-bold uppercase tracking-wide text-center md:text-left text-amber-500">Chairperson</p>
                <p className="text-xs text-gray-500 text-center md:text-left mt-1">Rainbow International School</p>
              </div>

              <div className="flex-grow space-y-5 text-gray-600 leading-relaxed">
                <p className="text-2xl font-black mb-4" style={{ color: "#0d3b86" }}>"World-Class Education, Indian Values"</p>

                <p>Dear Students, Parents, and Well-wishers,</p>

                <p>
                  It is with immense pride and joy that I welcome you to Rainbow International School — an institution that has been a beacon of excellence in Thane since 2009. What began as a dream to create a world-class school rooted in Indian values has today grown into one of the most trusted names in education, serving over <strong>3,000 students</strong> across KG to Class 12.
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

                <p>Thank you for your trust and faith in Rainbow International School.</p>

                <div className="pt-4">
                  <p className="font-black text-lg" style={{ color: "#0d3b86" }}>Warm regards,</p>
                  <p className="font-black mt-1" style={{ color: "#0d3b86" }}>Ms. Akila Balbale</p>
                  <p className="text-sm text-gray-500">Chairperson, Rainbow International School</p>
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
