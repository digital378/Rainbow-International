import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";

const pillars = [
  {
    number: "01",
    title: "Competence",
    description: "We build academic competence through a rigorous yet engaging curriculum, innovative teaching methods, and a relentless pursuit of knowledge. Every Rainbow student is equipped with the intellectual tools to succeed in any field they choose.",
    color: "border-blue-400",
  },
  {
    number: "02",
    title: "Conscience",
    description: "We nurture a strong moral compass in every student — developing values of integrity, honesty, and responsibility. We believe that true education leads to an awakened conscience that guides actions for the greater good.",
    color: "border-green-400",
  },
  {
    number: "03",
    title: "Compassion",
    description: "We cultivate empathy and kindness as core human virtues. Rainbow students are taught to care for others — their classmates, their community, and their world. Compassion is the foundation of lasting relationships and meaningful leadership.",
    color: "border-yellow-400",
  },
  {
    number: "04",
    title: "Courage",
    description: "We encourage our students to be bold — to question, to explore, to fail and rise again. Courage is the driving force behind innovation and progress, and we build it through challenges both inside and outside the classroom.",
    color: "border-red-400",
  },
];

export default function OurPhilosophy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Our Philosophy - Rainbow International School Thane"
        description="Rainbow International School's educational philosophy — built on four pillars: Competence, Conscience, Compassion, and Courage. Holistic development for every Rainbow student."
        keywords="Rainbow school philosophy, Rainbow International School education approach, school philosophy Thane West CBSE"
        canonical="https://rainbowinternationalschool.in/our-philosophy/"
      />
      <Navbar />
      <PageBanner
        title="Our Philosophy"
        subtitle="Education that builds character, not just careers."
        breadcrumb={[{ label: "About Us", href: "/about-rainbow-international-school" }, { label: "Our Philosophy" }]}
      />

      <main className="flex-grow">
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <p className="text-lg text-muted-foreground leading-relaxed mb-5">
              At Rainbow International School, our educational philosophy is rooted in a simple yet powerful belief: <strong>every child is unique, every child has potential, and every child deserves the very best.</strong>
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-5">
              We do not see education as merely the transfer of knowledge. For us, true education is the cultivation of the whole person — the mind, the body, the spirit, and the soul.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              This belief is woven into everything we do — our curriculum design, our teaching methods, our assessments, our co-curricular programs, and our interactions with students and families.
            </p>

            <h2 className="text-3xl font-serif font-bold text-primary text-center mb-10">The Four Pillars of Rainbow's Philosophy</h2>
            <div className="space-y-6">
              {pillars.map((pillar, i) => (
                <div key={i} className={`bg-card rounded-2xl p-7 shadow border-l-4 ${pillar.color} flex gap-6 items-start`} data-testid={`card-pillar-${i}`}>
                  <span className="text-4xl font-serif font-bold text-primary/20 shrink-0 leading-none">{pillar.number}</span>
                  <div>
                    <h3 className="font-serif font-bold text-2xl text-primary mb-3">{pillar.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{pillar.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-primary text-white">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <p className="text-2xl font-serif font-bold mb-4">"Allow its students to explore human excellence through Competence, Conscience and Compassion."</p>
            <p className="text-white/70">— Rainbow International School</p>
          </div>
        </section>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
