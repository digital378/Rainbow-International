import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ArrowRight } from "lucide-react";

const blogs = [
  { slug: "how-cbse-schools-can-foster-entrepreneurship-and-innovation", title: "How CBSE Schools Can Foster Entrepreneurship and Innovation Among Students", thumb: "https://rainbowinternationalschool.in/wp-content/uploads/2025/12/how-cbse-schools-can-foster-entrepreneurship-and-innovation-among-students-300x183.jpg" },
  { slug: "why-rainbow-international-school-is-among-the-top-schools-in-thane", title: "Why Rainbow International School Is Among the Top Schools in Thane", thumb: "https://rainbowinternationalschool.in/wp-content/uploads/2025/11/why-rainbow-international-school-is-among-the-top-schools-in-thane-300x183.jpg" },
  { slug: "the-growing-popularity-of-cbse-schools-in-thane-west-among-parents", title: "The Growing Popularity of CBSE Schools in Thane West Among Parents", thumb: "https://rainbowinternationalschool.in/wp-content/uploads/2025/11/the-growing-popularity-of-cbse-schools-in-thane-west-among-parents-300x183.jpg" },
  { slug: "top-6-easy-ways-to-develop-patience-in-your-child", title: "Top 6 Easy Ways to Develop Patience in Your Child", thumb: null },
  { slug: "stress-in-teenagers-symptoms-management", title: "Stress in Teenagers: Symptoms & Management", thumb: null },
  { slug: "why-choose-a-cbse-school-for-your-childs-education", title: "Why Choose a CBSE School for Your Child's Education", thumb: null },
  { slug: "key-facilities-every-good-cbse-school-should-have", title: "Key Facilities Every Good CBSE School Should Have", thumb: null },
  { slug: "what-you-need-to-know-before-applying-to-an-international-school", title: "What You Need to Know Before Applying to an International School", thumb: null },
  { slug: "group-activities-for-students", title: "Group Activities for Students", thumb: null },
  { slug: "importance-of-foundational-literacy-and-numeracy-in-schools", title: "Importance of Foundational Literacy and Numeracy in Schools", thumb: null },
  { slug: "co-curricular-activities", title: "Co-Curricular Activities and Their Importance", thumb: null },
  { slug: "international-school-admission-process-guide", title: "International School Admission Process Guide", thumb: null },
  { slug: "best-age-for-international-school-admission", title: "Best Age for International School Admission", thumb: null },
  { slug: "the-benefits-of-early-learning-in-shaping-a-childs-personality", title: "The Benefits of Early Learning in Shaping a Child's Personality", thumb: null },
  { slug: "cbse-vs-icse-which-board-prepares-students-better-for-the-future", title: "CBSE vs ICSE: Which Board Prepares Students Better for the Future?", thumb: null },
  { slug: "benefits-of-meditation-for-students", title: "Benefits of Meditation for Students", thumb: null },
  { slug: "diwali-activities-for-students", title: "Diwali Activities for Students", thumb: null },
  { slug: "holistic-development-rainbow-international-school", title: "Holistic Development at Rainbow International School", thumb: null },
  { slug: "top-reasons-choose-rainbow-international-school-thane", title: "Top Reasons to Choose Rainbow International School Thane", thumb: null },
  { slug: "benefits-of-rainbow-international-school", title: "Benefits of Rainbow International School", thumb: null },
  { slug: "how-to-deal-with-anxiety-during-exams", title: "How to Deal with Anxiety During Exams", thumb: null },
  { slug: "smart-revision-techniques-for-students", title: "Smart Revision Techniques for Students", thumb: null },
  { slug: "innovative-teaching-method-for-active-learning", title: "Innovative Teaching Methods for Active Learning", thumb: null },
  { slug: "teen-entrepreneurship-fostering-innovation-and-responsibility", title: "Teen Entrepreneurship: Fostering Innovation and Responsibility", thumb: null },
  { slug: "teaching-teens-resilience-and-thriving-through-failure", title: "Teaching Teens Resilience and Thriving Through Failure", thumb: null },
  { slug: "parental-guidance-how-to-choose-the-best-cbse-school-in-thane-for-your-child", title: "Parental Guidance: How to Choose the Best CBSE School in Thane for Your Child", thumb: null },
  { slug: "6-reasons-why-cbse-is-the-best-board-of-the-country", title: "6 Reasons Why CBSE is the Best Board of the Country", thumb: null },
  { slug: "digital-classrooms-how-technology-improves-education-in-school", title: "Digital Classrooms: How Technology Improves Education in School", thumb: null },
  { slug: "7-safety-and-security-measures-your-kids-school-should-have", title: "7 Safety and Security Measures Your Kid's School Should Have", thumb: null },
  { slug: "how-organic-farming-in-schools-helps-the-nation", title: "How Organic Farming in Schools Helps the Nation", thumb: null },
];

export default function Blogs() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Blogs - Rainbow International School Thane"
        description="Read insightful articles from Rainbow International School on education, parenting, student development, CBSE curriculum, holistic development and more."
        keywords="Rainbow school blog, education blog Thane, CBSE school blog, parenting tips school Thane, student development blog"
        canonical="https://rainbowinternationalschool.in/blogs/"
      />
      <Navbar />
      <PageBanner
        title="Blogs"
        subtitle="Insights on education, parenting, and student development."
        breadcrumb={[{ label: "Blogs" }]}
      />

      <main className="flex-grow py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {blogs.map((blog, i) => (
              <a
                key={i}
                href={`https://rainbowinternationalschool.in/${blog.slug}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-card rounded-2xl overflow-hidden shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border flex flex-col"
                data-testid={`card-blog-${i}`}
              >
                <div className="aspect-video bg-primary/5 overflow-hidden">
                  {blog.thumb ? (
                    <img
                      src={blog.thumb}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const parent = (e.target as HTMLImageElement).parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-full h-full flex items-center justify-center"><span class="text-primary/20 font-serif text-3xl font-bold">RIS</span></div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-primary/20 font-serif text-3xl font-bold">RIS</span>
                    </div>
                  )}
                </div>
                <div className="p-5 flex-grow flex flex-col">
                  <h3 className="font-serif font-bold text-base text-foreground group-hover:text-primary transition-colors mb-3 flex-grow line-clamp-3">
                    {blog.title}
                  </h3>
                  <span className="inline-flex items-center text-primary font-semibold text-sm gap-1 mt-auto">
                    Read More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
