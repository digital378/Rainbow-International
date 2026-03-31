import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";

const curriculum = [
  { icon: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/image-24-Traced.png", subject: "English", detail: "Small letters, 2–3 letter words, sentences, Q&A, cursive writing" },
  { icon: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/image-25-Traced.png", subject: "Math", detail: "Comparison, addition, subtraction, time, number names" },
  { icon: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/image-26-Traced.png", subject: "EVS / GK", detail: "Environmental awareness, general knowledge, our surroundings" },
  { icon: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/image-27-Traced.png", subject: "Creative Skills", detail: "Art, craft, music, dance and personality development" },
];

export default function PrePrimary() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Pre-Primary School Thane - Nursery, Jr KG, Sr KG Admissions"
        description="Rainbow International School's Pre-Primary Section (Nursery, Jr KG, Sr KG) in Thane West. Activity-based, game-based learning for holistic development. Admissions open."
        keywords="pre-primary school Thane, nursery admission Thane West, Jr KG Sr KG admission, Rainbow preschool Thane"
        canonical="https://rainbowinternationalschool.in/pre-primary-school-thane/"
        ogImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/pre-primary-school-nursery-jrkg-srkg-admissions-ad.jpg"
      />
      <Navbar />
      <PageBanner
        title="Pre-Primary Section"
        subtitle="Nursery | Jr KG | Sr KG"
        breadcrumb={[{ label: "Pre-Primary Section" }]}
        bgImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/pre-primary-school-nursery-jrkg-srkg-admissions-ad.jpg"
      />

      <main className="flex-grow">
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <p className="text-lg text-muted-foreground leading-relaxed mb-5">
              The urgency of catching up has increased in a world that is continuously expanding and changing. We introduce our kids into academia in a way that ensures they are constantly one step ahead — learning, growing, and being nurtured without having to worry about the pace.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-5">
              Their general growth is our sole concern, and thus we incorporate <strong>activity/game-based learning</strong> into their curriculum from a very young age. This is included in a curriculum that encourages children to be kids.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-5">
              Their learning is supported by activities outside and within the four walls of their classroom, extending their horizons as far as possible to make room for growth. We safeguard them in a conducive yet challenging environment where life-long skills such as creativity, teamwork, and responsibility are cultivated.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Regular participation of parents in their activities is commonplace with us — we believe a steady partnership between us and parents will go a long way in the development of our students.
            </p>
          </div>
        </section>

        <section className="py-10 bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <img
              src="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/PPS-02.jpg"
              alt="Pre-Primary Fun Activity"
              className="rounded-2xl shadow-lg w-full object-cover max-h-80"
            />
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-serif font-bold text-primary text-center mb-12">Curriculum</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {curriculum.map((item, i) => (
                <div key={i} className="bg-card rounded-xl p-6 shadow text-center border">
                  <img src={item.icon} alt={item.subject} className="w-14 h-14 mx-auto mb-4 object-contain" />
                  <h3 className="font-serif font-bold text-lg text-primary mb-2">{item.subject}</h3>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="bg-secondary py-10 text-center">
          <p className="text-primary font-bold text-lg mb-4">Admissions are Open for the Academic Year 2025–26</p>
          <a href="#contact" className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary/90 transition-colors">Enquire Now</a>
        </div>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
