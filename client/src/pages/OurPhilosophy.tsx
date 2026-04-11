import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";

const pillars = [
  {
    number: "01",
    title: "Competence",
    description: "We build academic competence through a rigorous yet engaging curriculum, innovative teaching methods, and a relentless pursuit of knowledge. Every Rainbow student is equipped with the intellectual tools to succeed in any field they choose.",
    accent: "#3b82f6",
  },
  {
    number: "02",
    title: "Conscience",
    description: "We nurture a strong moral compass in every student — developing values of integrity, honesty, and responsibility. We believe that true education leads to an awakened conscience that guides actions for the greater good.",
    accent: "#22c55e",
  },
  {
    number: "03",
    title: "Compassion",
    description: "We cultivate empathy and kindness as core human virtues. Rainbow students are taught to care for others — their classmates, their community, and their world. Compassion is the foundation of lasting relationships and meaningful leadership.",
    accent: "#fbbf24",
  },
  {
    number: "04",
    title: "Courage",
    description: "We encourage our students to be bold — to question, to explore, to fail and rise again. Courage is the driving force behind innovation and progress, and we build it through challenges both inside and outside the classroom.",
    accent: "#ef4444",
  },
];

export default function OurPhilosophy() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Our Philosophy"
        description="Rainbow International School's educational philosophy — built on four pillars: Competence, Conscience, Compassion, and Courage. Holistic development for every Rainbow student."
        keywords="Rainbow school philosophy, Rainbow International School education approach, school philosophy Thane CBSE"
        canonical="https://rainbowinternationalschool.in/our-philosophy"
      />
      <Navbar />
      <PageBanner
        title="Our Philosophy"
        subtitle="Education that builds character, not just careers."
        breadcrumb={[{ label: "About Us", href: "/about-rainbow-international-school" }, { label: "Our Philosophy" }]}
      />

      <main className="flex-grow">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <p className="text-lg text-gray-600 leading-relaxed mb-5">
              At Rainbow International School, our educational philosophy is rooted in a simple yet powerful belief: <strong>every child is unique, every child has potential, and every child deserves the very best.</strong>
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-5">
              We do not see education as merely the transfer of knowledge. For us, true education is the cultivation of the whole person — the mind, the body, the spirit, and the soul.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-12">
              This belief is woven into everything we do — our curriculum design, our teaching methods, our assessments, our co-curricular programs, and our interactions with students and families.
            </p>

            <h2 className="text-3xl font-black text-center mb-10" style={{ color: "#0d3b86" }}>The Four Pillars of Rainbow's Philosophy</h2>
            <div className="space-y-6">
              {pillars.map((pillar, i) => (
                <div key={i} className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100 flex gap-6 items-start" style={{ borderLeft: `4px solid ${pillar.accent}` }} data-testid={`card-pillar-${i}`}>
                  <span className="text-4xl font-black shrink-0 leading-none" style={{ color: `${pillar.accent}40` }}>{pillar.number}</span>
                  <div>
                    <h3 className="font-black text-2xl mb-3" style={{ color: "#0d3b86" }}>{pillar.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{pillar.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 text-white text-center" style={{ background: "#0d3b86" }}>
          <div className="container mx-auto px-4 max-w-3xl">
            <p className="text-2xl font-black mb-4">"Allow its students to explore human excellence through Competence, Conscience and Compassion."</p>
            <p className="text-white/70">— Rainbow International School</p>
          </div>
        </section>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
