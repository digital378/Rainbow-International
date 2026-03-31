import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";

const awards = [
  {
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-world-education-summit-mumbai.jpg",
    title: "15th World Education Summit in Mumbai",
    description: "Won awards in the following categories: 1) Innovation in Campus Infrastructure – Rainbow International School. 2) Profound Technology usage in Early Childhood Teaching – Rainbow Preschool International.",
  },
  {
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-featured-knowledge-review-magazine-international-school-ad.jpg",
    title: "Featured in Knowledge Review Magazine",
    description: "Yet another Milestone achieved by Rainbow Preschool International. It's a Proud moment for Rainbow Preschools to get featured in 'The 10 Best Preschools in India' in The Knowledge Review Magazine.",
  },
  {
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-hundred-percent-results-international-school-ad.jpg",
    title: "100% Result: Rainbow's First Batch (2018–19)",
    description: "100% Result covered by The Times of India. At Rainbow International School, we feel really proud to announce 100% Result of our 10th standard students for the academic year 2018–19.",
  },
  {
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad-1.jpg",
    title: "Best Preschool & Secondary School in Thane",
    description: "Rainbow awarded as Best Preschool and Secondary School in Thane. It gives us a great sense of pride that Rainbow Preschools and Rainbow International School have been awarded this prestigious recognition.",
  },
  {
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-awards-excellence-international-school-ad.jpg",
    title: "Rainbow Wins Award For Excellence",
    description: "It gives us immense pleasure to announce that we were awarded 'Excellence in Preschool Education' and 'Excellence in CBSE Education' in Thane by India Today on Saturday, 7th October 2017.",
  },
  {
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-thane-fit-india.jpg",
    title: "FIT INDIA Certificate of Recognition",
    description: "Rainbow International School is proud to announce that our FIT INDIA declaration has been approved by the Ministry of Youth Affairs and Sports — we are an official FIT INDIA School!",
  },
];

export default function Awards() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Awards & Achievements - Rainbow International School Thane"
        description="Rainbow International School's awards and achievements — World Education Summit, Best Preschool & Secondary School in Thane, Excellence in CBSE Education, FIT INDIA School and more."
        keywords="Rainbow International School awards, best school Thane West, CBSE school awards Thane, school achievements Thane"
        canonical="https://rainbowinternationalschool.in/awards-achievements/"
        ogImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad.jpg"
      />
      <Navbar />
      <PageBanner
        title="Awards & Achievements"
        breadcrumb={[{ label: "Awards & Achievements" }]}
      />

      <main className="flex-grow">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <p className="text-center text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              Accolades earned by Rainbow International School for being one of the best & most promising international schools in Thane for the decade in the educational sphere.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {awards.map((award, i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col" data-testid={`card-award-${i}`}>
                  <img
                    src={award.image}
                    alt={award.title}
                    className="w-full h-52 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="p-6 flex-grow">
                    <h3 className="font-black text-xl mb-3" style={{ color: "#0d3b86" }}>{award.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{award.description}</p>
                  </div>
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
