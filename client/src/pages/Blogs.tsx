import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

const allBlogs = [
  { slug: "how-cbse-schools-can-foster-entrepreneurship-and-innovation", title: "How CBSE Schools Can Foster Entrepreneurship and Innovation Among Students", thumb: "https://rainbowinternationalschool.in/wp-content/uploads/2025/12/how-cbse-schools-can-foster-entrepreneurship-and-innovation-among-students-300x183.jpg", category: "Education" },
  { slug: "why-rainbow-international-school-is-among-the-top-schools-in-thane", title: "Why Rainbow International School Is Among the Top Schools in Thane", thumb: "https://rainbowinternationalschool.in/wp-content/uploads/2025/11/why-rainbow-international-school-is-among-the-top-schools-in-thane-300x183.jpg", category: "School" },
  { slug: "the-growing-popularity-of-cbse-schools-in-thane-west-among-parents", title: "The Growing Popularity of CBSE Schools in Thane West Among Parents", thumb: "https://rainbowinternationalschool.in/wp-content/uploads/2025/11/the-growing-popularity-of-cbse-schools-in-thane-west-among-parents-300x183.jpg", category: "CBSE" },
  { slug: "top-6-easy-ways-to-develop-patience-in-your-child", title: "Top 6 Easy Ways to Develop Patience in Your Child", thumb: null, category: "Parenting" },
  { slug: "stress-in-teenagers-symptoms-management", title: "Stress in Teenagers: Symptoms & Management", thumb: null, category: "Student Wellness" },
  { slug: "why-choose-a-cbse-school-for-your-childs-education", title: "Why Choose a CBSE School for Your Child's Education", thumb: null, category: "CBSE" },
  { slug: "key-facilities-every-good-cbse-school-should-have", title: "Key Facilities Every Good CBSE School Should Have", thumb: null, category: "Education" },
  { slug: "what-you-need-to-know-before-applying-to-an-international-school", title: "What You Need to Know Before Applying to an International School", thumb: null, category: "Admissions" },
  { slug: "group-activities-for-students", title: "Group Activities for Students", thumb: null, category: "Student Life" },
  { slug: "importance-of-foundational-literacy-and-numeracy-in-schools", title: "Importance of Foundational Literacy and Numeracy in Schools", thumb: null, category: "Education" },
  { slug: "co-curricular-activities", title: "Co-Curricular Activities and Their Importance", thumb: null, category: "Extracurriculars" },
  { slug: "international-school-admission-process-guide", title: "International School Admission Process Guide", thumb: null, category: "Admissions" },
  { slug: "best-age-for-international-school-admission", title: "Best Age for International School Admission", thumb: null, category: "Admissions" },
  { slug: "the-benefits-of-early-learning-in-shaping-a-childs-personality", title: "The Benefits of Early Learning in Shaping a Child's Personality", thumb: null, category: "Early Childhood" },
  { slug: "cbse-vs-icse-which-board-prepares-students-better-for-the-future", title: "CBSE vs ICSE: Which Board Prepares Students Better for the Future?", thumb: null, category: "CBSE" },
  { slug: "benefits-of-meditation-for-students", title: "Benefits of Meditation for Students", thumb: null, category: "Student Wellness" },
  { slug: "diwali-activities-for-students", title: "Diwali Activities for Students", thumb: null, category: "Student Life" },
  { slug: "holistic-development-rainbow-international-school", title: "Holistic Development at Rainbow International School", thumb: null, category: "School" },
  { slug: "top-reasons-choose-rainbow-international-school-thane", title: "Top Reasons to Choose Rainbow International School Thane", thumb: null, category: "School" },
  { slug: "benefits-of-rainbow-international-school", title: "Benefits of Rainbow International School", thumb: null, category: "School" },
  { slug: "how-to-deal-with-anxiety-during-exams", title: "How to Deal with Anxiety During Exams", thumb: null, category: "Student Wellness" },
  { slug: "smart-revision-techniques-for-students", title: "Smart Revision Techniques for Students", thumb: null, category: "Study Tips" },
  { slug: "innovative-teaching-method-for-active-learning", title: "Innovative Teaching Methods for Active Learning", thumb: null, category: "Education" },
  { slug: "teen-entrepreneurship-fostering-innovation-and-responsibility", title: "Teen Entrepreneurship: Fostering Innovation and Responsibility", thumb: null, category: "Student Life" },
  { slug: "teaching-teens-resilience-and-thriving-through-failure", title: "Teaching Teens Resilience and Thriving Through Failure", thumb: null, category: "Parenting" },
  { slug: "parental-guidance-how-to-choose-the-best-cbse-school-in-thane-for-your-child", title: "Parental Guidance: How to Choose the Best CBSE School in Thane for Your Child", thumb: null, category: "Parenting" },
  { slug: "6-reasons-why-cbse-is-the-best-board-of-the-country", title: "6 Reasons Why CBSE is the Best Board of the Country", thumb: null, category: "CBSE" },
  { slug: "digital-classrooms-how-technology-improves-education-in-school", title: "Digital Classrooms: How Technology Improves Education in School", thumb: null, category: "Education" },
  { slug: "7-safety-and-security-measures-your-kids-school-should-have", title: "7 Safety and Security Measures Your Kid's School Should Have", thumb: null, category: "School" },
  { slug: "how-organic-farming-in-schools-helps-the-nation", title: "How Organic Farming in Schools Helps the Nation", thumb: null, category: "Education" },
  { slug: "100-result-rainbows-first-batch-2018-19", title: "100% Result: Rainbow's First Batch (2018–19)", thumb: null, category: "School" },
  { slug: "fit-india-certificate-of-recognition", title: "FIT INDIA Certificate of Recognition", thumb: null, category: "School" },
  { slug: "rainbow-wins-award-for-excellence", title: "Rainbow Wins Award For Excellence", thumb: null, category: "School" },
  { slug: "6-excellent-ideas-to-innovate-cultural-programmes-in-school", title: "6 Excellent Ideas to Innovate Cultural Programmes in School", thumb: null, category: "Student Life" },
  { slug: "an-all-rounder-kid-raghvi-ramanujan-displays-exceptional-talent-in-swimming", title: "An All-Rounder Kid: Raghvi Ramanujan Displays Exceptional Talent in Swimming", thumb: null, category: "Student Life" },
  { slug: "big-school-playgrounds-6-reasons-why-kids-need-them", title: "Big School Playgrounds: 6 Reasons Why Kids Need Them", thumb: null, category: "Education" },
  { slug: "rainbow-awarded-as-best-preschool-and-secondary-school-in-thane", title: "Rainbow Awarded as Best Preschool and Secondary School in Thane", thumb: null, category: "School" },
  { slug: "rainbow-preschools-featured-in-knowledge-review-magazine", title: "Rainbow Preschools Featured in Knowledge Review Magazine", thumb: null, category: "School" },
  { slug: "the-15th-world-education-summit", title: "The 15th World Education Summit", thumb: null, category: "School" },
  { slug: "the-leading-school-of-the-year-thane", title: "The Leading School of the Year — Thane", thumb: null, category: "School" },
  { slug: "cultural-activities-for-students-key-to-developing-critical-thinking-skills", title: "Cultural Activities for Students: Key to Developing Critical Thinking Skills", thumb: null, category: "Student Life" },
  { slug: "how-to-learn-boring-subjects", title: "How to Learn Boring Subjects", thumb: null, category: "Study Tips" },
  { slug: "how-to-increase-attention-span", title: "How to Increase Attention Span", thumb: null, category: "Study Tips" },
  { slug: "benefits-of-learning-a-second-language", title: "Benefits of Learning a Second Language", thumb: null, category: "Education" },
  { slug: "how-to-avoid-procrastination-while-studying", title: "How to Avoid Procrastination While Studying", thumb: null, category: "Study Tips" },
  { slug: "nutritional-requirements-of-the-teenagers-how-to-fulfil-them", title: "Nutritional Requirements of Teenagers: How to Fulfil Them", thumb: null, category: "Student Wellness" },
  { slug: "top-5-techniques-for-taming-anger-in-children", title: "Top 5 Techniques for Taming Anger in Children", thumb: null, category: "Parenting" },
  { slug: "homework-war-endgame", title: "Homework War: Endgame", thumb: null, category: "Parenting" },
  { slug: "using-gadgets-the-right-way", title: "Using Gadgets the Right Way", thumb: null, category: "Parenting" },
  { slug: "regulating-childrens-screen-time", title: "Regulating Children's Screen Time", thumb: null, category: "Parenting" },
  { slug: "understanding-adolescence-how-to-handle-the-process", title: "Understanding Adolescence: How to Handle the Process", thumb: null, category: "Parenting" },
  { slug: "how-to-develop-fine-motor-skills-at-home", title: "How to Develop Fine Motor Skills at Home", thumb: null, category: "Early Childhood" },
  { slug: "give-earth-to-life-on-earth", title: "Give Earth to Life on Earth", thumb: null, category: "Education" },
  { slug: "teen-depression-how-to-spot-and-cure-it", title: "Teen Depression: How to Spot and Cure It", thumb: null, category: "Student Wellness" },
  { slug: "7-areas-in-education-where-indian-women-are-excellent", title: "7 Areas in Education Where Indian Women Are Excellent", thumb: null, category: "Education" },
  { slug: "4-reasons-why-school-bags-should-not-be-a-burden", title: "4 Reasons Why School Bags Should Not Be a Burden", thumb: null, category: "Student Life" },
  { slug: "smartphone-addiction-how-to-ensure-healthy-use-by-kids", title: "Smartphone Addiction: How to Ensure Healthy Use by Kids", thumb: null, category: "Parenting" },
  { slug: "school-sanitation-standards-how-to-stay-clean-and-safe", title: "School Sanitation Standards: How to Stay Clean and Safe", thumb: null, category: "School" },
  { slug: "teaching-children-the-value-of-money-5-ways-schools-can-help", title: "Teaching Children the Value of Money: 5 Ways Schools Can Help", thumb: null, category: "Education" },
  { slug: "amazing-coaches-who-improved-players-willpower", title: "Amazing Coaches Who Improved Players' Willpower", thumb: null, category: "Sports" },
  { slug: "how-school-buses-are-changing-with-technology", title: "How School Buses Are Changing with Technology", thumb: null, category: "School" },
  { slug: "amazing-youtube-channels-on-general-knowledge-for-kids", title: "Amazing YouTube Channels on General Knowledge for Kids", thumb: null, category: "Education" },
  { slug: "know-how-swimming-helps-your-child-in-7-ways", title: "Know How Swimming Helps Your Child in 7 Ways", thumb: null, category: "Sports" },
  { slug: "6-reasons-why-indoor-sports-is-important-in-schools", title: "6 Reasons Why Indoor Sports is Important in Schools", thumb: null, category: "Sports" },
  { slug: "field-trips-know-how-they-groom-students-in-5-ways", title: "Field Trips: Know How They Groom Students in 5 Ways", thumb: null, category: "Education" },
  { slug: "time-management-for-school-children-6-ways-parents-can-help", title: "Time Management for School Children: 6 Ways Parents Can Help", thumb: null, category: "Parenting" },
  { slug: "how-to-teach-benefits-of-family-meals-to-kids", title: "How to Teach the Benefits of Family Meals to Kids", thumb: null, category: "Parenting" },
  { slug: "do-your-children-hate-reading-know-why-youre-the-reason", title: "Do Your Children Hate Reading? Know Why You're the Reason", thumb: null, category: "Parenting" },
  { slug: "how-regular-sports-help-students-6-reasons", title: "How Regular Sports Help Students: 6 Reasons", thumb: null, category: "Sports" },
  { slug: "9-reasons-why-schools-should-have-an-infirmary-and-paediatrician", title: "9 Reasons Why Schools Should Have an Infirmary and Paediatrician", thumb: null, category: "School" },
  { slug: "10-things-in-the-classroom-to-boost-student-engagement", title: "10 Things in the Classroom to Boost Student Engagement", thumb: null, category: "Education" },
  { slug: "back-to-school-a-step-by-step-guide-to-international-school-admissions", title: "Back to School: A Step-by-Step Guide to International School Admissions", thumb: null, category: "Admissions" },
  { slug: "christmas-celebration-in-school-10-fun-and-festive-activity-ideas", title: "Christmas Celebration in School: 10 Fun and Festive Activity Ideas", thumb: null, category: "Student Life" },
  { slug: "5-tips-to-choose-best-cbse-schools-in-mumbai", title: "5 Tips to Choose the Best CBSE Schools in Mumbai", thumb: null, category: "CBSE" },
  { slug: "understanding-the-effects-of-mobile-phones-on-children-benefits-risks-and-managing-screen-time", title: "Understanding the Effects of Mobile Phones on Children: Benefits, Risks and Managing Screen Time", thumb: null, category: "Parenting" },
  { slug: "10-fun-and-educational-republic-day-activities-for-kids", title: "10 Fun and Educational Republic Day Activities for Kids", thumb: null, category: "Student Life" },
  { slug: "ideal-teacher-qualities-traits-of-a-great-educator", title: "Ideal Teacher Qualities: Traits of a Great Educator", thumb: null, category: "Education" },
  { slug: "importance-of-sports-in-students-life-teamwork-skills", title: "Importance of Sports in Students' Life: Teamwork & Skills", thumb: null, category: "Sports" },
  { slug: "why-maths-matters-in-student-life-benefits-uses", title: "Why Maths Matters in Student Life: Benefits & Uses", thumb: null, category: "Education" },
  { slug: "advantages-of-starting-early-international-school", title: "Advantages of Starting Early at an International School", thumb: null, category: "Admissions" },
  { slug: "age-criteria-for-international-schools-admission-2025-in-mumbai", title: "Age Criteria for International Schools Admission 2025 in Mumbai", thumb: null, category: "Admissions" },
  { slug: "role-of-parents-in-education-orientation-importance", title: "Role of Parents in Education: Orientation & Importance", thumb: null, category: "Parenting" },
  { slug: "problem-solving-activities-life-skills-students", title: "Problem Solving Activities & Life Skills for Students", thumb: null, category: "Student Life" },
  { slug: "riddles-for-kids", title: "Riddles for Kids: Fun and Educational", thumb: null, category: "Student Life" },
  { slug: "imporatnce-of-sports-in-students-life", title: "Importance of Sports in Students' Life", thumb: null, category: "Sports" },
];

const categories = ["All", "School", "CBSE", "Education", "Parenting", "Student Life", "Student Wellness", "Admissions", "Sports", "Study Tips", "Early Childhood", "Extracurriculars"];

export default function Blogs() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All" ? allBlogs : allBlogs.filter(b => b.category === activeCategory);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Blogs - Rainbow International School Thane"
        description="Read 86+ insightful articles from Rainbow International School on education, parenting, student development, CBSE curriculum, holistic development and more."
        keywords="Rainbow school blog, education blog Thane, CBSE school blog, parenting tips school Thane, student development blog"
        canonical="https://rainbowinternationalschool.in/blogs/"
      />
      <Navbar />
      <PageBanner
        title="Blogs"
        subtitle={`${allBlogs.length} articles on education, parenting & student development.`}
        breadcrumb={[{ label: "Blogs" }]}
      />

      <main className="flex-grow py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                data-testid={`button-blog-cat-${cat}`}
                className={`px-4 py-1.5 rounded-full font-semibold text-xs transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-white shadow"
                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mb-8">Showing {filtered.length} articles</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filtered.map((blog, i) => (
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
                          parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-primary/5"><span class="text-primary/20 font-serif text-3xl font-bold">RIS</span></div>`;
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
                  <span className="text-xs font-bold text-secondary uppercase tracking-wide mb-2">{blog.category}</span>
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
