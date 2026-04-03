import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";

const CDN = "https://rainbowinternationalschool.in/wp-content/uploads";

const awards = [
  {
    image: `${CDN}/2022/09/rainbow-international-school-awards-world-education-summit-mumbai.jpg`,
    title: "15th World Education Summit in Mumbai!",
    description: "Won awards in the following categories:\n1) Innovation in Campus Infrastructure – Rainbow International School\n2) Profound Technology usage in Early Childhood Teaching – Rainbow Preschool International.",
  },
  {
    image: `${CDN}/2022/09/rainbow-international-school-awards-featured-knowledge-review-magazine-international-school-ad.jpg`,
    title: "Featured in Knowledge Review Magazine",
    description: "Yet another Milestone achieved by Rainbow Preschool International. It's a Proud moment for Rainbow Preschools to get featured in 'The 10 Best Preschools in India' in The Knowledge Review Magazine.",
  },
  {
    image: `${CDN}/2022/09/rainbow-international-school-awards-hundred-percent-results-international-school-ad.jpg`,
    title: "100% Result: Rainbow's First Batch (2018-19)",
    description: "100% Result: The Times Of India At Rainbow International School, we feel really proud to announce 100% Result of our 10th standard students for the academic year 2018-19. As per The Times Of India, Rainbow International.",
  },
  {
    image: `${CDN}/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad-1.jpg`,
    title: "Best Preschool & Secondary School in Thane",
    description: "Rainbow awarded as Best Preschool and Secondary School in Thane. It gives us a great sense of pride that Rainbow Preschools and Rainbow International School have been awarded 'The Best Preschool and Secondary School in Thane'.",
  },
  {
    image: `${CDN}/2022/09/rainbow-international-school-awards-awards-excellence-international-school-ad.jpg`,
    title: "Rainbow Wins Award For Excellence",
    description: "It gives us immense pleasure to announce that we were awarded 'Excellence in Preschool Education' and 'Excellence in CBSE Education' in Thane by India Today on Saturday, 7th October 2017.",
  },
  {
    image: `${CDN}/2022/09/rainbow-international-school-thane-fit-india.jpg`,
    title: "We are a FIT INDIA School",
    description: "FIT INDIA Certificate of Recognition Rainbow International School proud to announce that our declaration has been approved by the Ministry of Youth Affairs and Sports and we are a FIT INDIA School!",
  },
  {
    image: `${CDN}/2022/09/rainbow-international-school-thane-awards-swach.jpg`,
    title: "Swachatam Vidyalay Award",
    description: "Swachh Survekshan League – 2020 Rainbow Preschools is felicitated by Thane Municipal Corporation for its cleanliness and hygiene on campus.",
  },
  {
    image: `${CDN}/2022/09/rainbow-international-school-akila-balbale-thane-icon.jpg`,
    title: "'Icon of Thane' Award",
    description: "Its indeed a proud moment to share with all of you our Chairperson – Hon. Akila Balbale has been presented with an award by Economic Times for 'Icon of Thane', for contributing exemplary education services in Thane city. A commendable service to our society.",
  },
  {
    image: `${CDN}/2022/09/rainbow-international-school-awards-raghvi-ramanujan-international-school-ad.jpg`,
    title: "An All Rounder Kid Raghvi Ramanujan",
    description: "An All Rounder Kid Raghvi Ramanujan Displays Exceptional Talent in Swimming. 8-year-old Raghvi Ramanujan is an all rounder. She has also developed a niche interest – swimming! She has just bagged her 101st medal at the Rotary Club Swimming Competition held at Thane.",
  },
  {
    image: `${CDN}/2022/09/Mask-group.png`,
    title: "First Prize in Bharat Vikas Parishad QUIZ COMPETITION",
    description: "Rainbow International School won the First Prize in Bharat Vikas Parishad QUIZ COMPETITION for the Senior Category at the Branch Level.",
  },
  {
    image: `${CDN}/2022/09/Mask-group-1.png`,
    title: "48th JUNIOR NATIONAL AQUATIC CHAMPIONSHIP",
    description: "850 participants from all over India participated in the 48th JUNIOR AQUATIC NATIONAL CHAMPIONSHIP in Bhubaneswar. Maharashtra was represented by Rainbow International School student RAGHVI RAMANUJAN, who is the only medallist from Thane City with two silver and three bronze medals.",
  },
  {
    image: `${CDN}/2022/09/Mask-group-2.png`,
    title: "Big win for Rainbow at SGEF 2022!",
    description: "We are elated to have won the following awards at @scoonewsindia Global Educators Fest 2022:\n• Emerging Pre-School Chain of the Year – Editor's Choice: Rainbow Preschool International\n• Emerging School of the Year, West India Division: Rainbow International School\nOur respected Chairperson, Mrs. Akila Balbale received the awards along with the Director of Academics, Mrs. Vimlesh Sindhu.",
  },
  {
    image: `${CDN}/2022/10/Mask-group.png`,
    title: "Going Plastic Free Drive",
    description: "Under the 'Going Plastic Free Drive,' Samarth Bharat Vyaspeeth has set the following goals with the intention of establishing a plastic-free environment. Rainbow International School has since 2019 participated in the 'Going Plastic Free Drive'.",
  },
];

export default function Awards() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Awards & Achievements"
        description="Rainbow International School's awards and achievements — World Education Summit, Best Preschool & Secondary School in Thane, Excellence in CBSE Education, FIT INDIA School and more."
        keywords="Rainbow International School awards, best school Thane West, CBSE school awards Thane, school achievements Thane"
        canonical="https://rainbowinternationalschool.in/awards-achievements/"
        ogImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad.jpg"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "Awards & Achievements", href: "https://rainbowinternationalschool.in/awards-achievements" },
        ]}
      />
      <Navbar />
      <PageBanner
        title="Awards & Achievements"
        breadcrumb={[{ label: "Awards & Achievements" }]}
      />

      <main className="flex-grow">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-5" style={{ background: "#eef5ff", color: "#0d3b86" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                Our Achievements
              </span>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Accolades earned by Rainbow International School for being one of the best & most promising international schools in Thane for the decade in the educational sphere.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {awards.map((award, i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col" data-testid={`card-award-${i}`}>
                  <div className="relative">
                    <img
                      src={award.image}
                      alt={award.title}
                      className="w-full h-52 object-cover"
                      width={600}
                      height={208}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "#fbbf24" }} />
                  </div>
                  <div className="p-6 flex-grow">
                    <h3 className="font-black text-lg mb-3 text-center" style={{ color: "#0d3b86" }}>{award.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{award.description}</p>
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
