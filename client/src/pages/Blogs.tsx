import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import ScrollProgress from "@/components/home/ScrollProgress";
import { blogPosts } from "@/data/blogPosts";

const publishedSlugs = new Set(blogPosts.map((p) => p.slug));

const blogIntros: Record<string, string> = {};
blogPosts.forEach((p) => { blogIntros[p.slug] = p.intro; });

interface BlogPost {
  title: string;
  slug: string;
  date: string;
  cat: string;
  thumbUrl: string | null;
}

const allBlogs: BlogPost[] = [
  { title: "How CBSE Schools Can Foster Entrepreneurship and Innovation Among Students", slug: "how-cbse-schools-can-foster-entrepreneurship-and-innovation", date: "16 Dec 2025", cat: "CBSE School", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2025/12/how-cbse-schools-can-foster-entrepreneurship-and-innovation-among-students.jpg" },
  { title: "Why Rainbow International School Is Among the Top Schools in Thane", slug: "why-rainbow-international-school-is-among-the-top-schools-in-thane", date: "24 Nov 2025", cat: "CBSE School", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2025/11/why-rainbow-international-school-is-among-the-top-schools-in-thane.jpg" },
  { title: "The Growing Popularity of CBSE Schools in Thane Among Parents", slug: "the-growing-popularity-of-cbse-schools-in-thane-west-among-parents", date: "19 Nov 2025", cat: "CBSE School", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2025/11/the-growing-popularity-of-cbse-schools-in-thane-west-among-parents.jpg" },
  { title: "Key Facilities Every Good CBSE School Should Have", slug: "key-facilities-every-good-cbse-school-should-have", date: "31 Oct 2025", cat: "CBSE School", thumbUrl: null },
  { title: "Why Choose a CBSE School for Your Child's Education?", slug: "why-choose-a-cbse-school-for-your-childs-education", date: "31 Oct 2025", cat: "CBSE School", thumbUrl: null },
  { title: "100 Fun Riddles for Kids to Sharpen Their Minds", slug: "riddles-for-kids", date: "01 Sep 2025", cat: "Student Life", thumbUrl: null },
  { title: "How Problem-Solving Activities Help Students Develop Life Skills", slug: "problem-solving-activities-life-skills-students", date: "01 Sep 2025", cat: "Education", thumbUrl: null },
  { title: "The Role of Parents in Education: Why Orientation Matters", slug: "role-of-parents-in-education-orientation-importance", date: "28 Jul 2025", cat: "Parenting", thumbUrl: null },
  { title: "The Importance of Foundational Literacy and Numeracy in Schools", slug: "importance-of-foundational-literacy-and-numeracy-in-schools", date: "28 Jul 2025", cat: "Education", thumbUrl: null },
  { title: "Why Co-Curricular Activities Are Key for Student Growth", slug: "co-curricular-activities", date: "01 Jul 2025", cat: "Student Life", thumbUrl: null },
  { title: "Age Criteria for International Schools Admission 2025 in Mumbai", slug: "age-criteria-for-international-schools-admission-2025-in-mumbai", date: "01 Jul 2025", cat: "Admissions", thumbUrl: null },
  { title: "What to Expect During the International School Admission Process", slug: "international-school-admission-process-guide", date: "18 Jun 2025", cat: "Admissions", thumbUrl: null },
  { title: "What Are the Advantages of Starting Early at an International School?", slug: "advantages-of-starting-early-international-school", date: "18 Jun 2025", cat: "Admissions", thumbUrl: null },
  { title: "The Benefits of Early Learning in Shaping a Child's Personality", slug: "the-benefits-of-early-learning-in-shaping-a-childs-personality", date: "20 May 2025", cat: "Education", thumbUrl: null },
  { title: "What You Need to Know Before Applying to an International School", slug: "what-you-need-to-know-before-applying-to-an-international-school", date: "20 May 2025", cat: "Admissions", thumbUrl: null },
  { title: "When Is the Right Time to Enroll Your Child in an International School?", slug: "best-age-for-international-school-admission", date: "02 Apr 2025", cat: "Admissions", thumbUrl: null },
  { title: "Importance of Maths in Student Life: Key Benefits & Uses", slug: "why-maths-matters-in-student-life-benefits-uses", date: "02 Apr 2025", cat: "Education", thumbUrl: null },
  { title: "Importance of Sports in Students' Life for Teamwork Skills", slug: "importance-of-sports-in-students-life-teamwork-skills", date: "02 Mar 2025", cat: "Sports", thumbUrl: null },
  { title: "Ideal Teacher Qualities: Important Traits of a Great Educator", slug: "ideal-teacher-qualities-traits-of-a-great-educator", date: "02 Mar 2025", cat: "Education", thumbUrl: null },
  { title: "10 Fun and Educational Republic Day Activities for Kids", slug: "10-fun-and-educational-republic-day-activities-for-kids", date: "19 Jan 2025", cat: "Student Life", thumbUrl: null },
  { title: "Understanding the Effects of Mobile Phones on Children", slug: "understanding-the-effects-of-mobile-phones-on-children-benefits-risks-and-managing-screen-time", date: "19 Jan 2025", cat: "Parenting", thumbUrl: null },
  { title: "5 Tips to Choose the Best CBSE Schools in Mumbai for Your Child", slug: "5-tips-to-choose-best-cbse-schools-in-mumbai", date: "02 Jan 2025", cat: "CBSE School", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2025/01/5-Tips-to-Choose-the-Best-CBSE-Schools-in-Mumbai-for-Your-Child-copy.webp" },
  { title: "5 Top Benefits of Choosing Rainbow International School for Your Child", slug: "benefits-of-rainbow-international-school", date: "02 Jan 2025", cat: "School", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2025/01/5-Top-Benefits-of-Choosing-Rainbow-International-School-for-Your-Child-copy.webp" },
  { title: "Christmas Celebration in School: 10 Fun and Festive Activity Ideas", slug: "christmas-celebration-in-school-10-fun-and-festive-activity-ideas", date: "01 Dec 2024", cat: "Student Life", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2024/12/Christmas-Celebration-in-School-10-Fun-and-Festive-Activity-Ideas-copy.webp" },
  { title: "Back to School: A Step-by-Step Guide to International School Admissions", slug: "back-to-school-a-step-by-step-guide-to-international-school-admissions", date: "01 Dec 2024", cat: "Admissions", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2024/12/Back-to-School-A-Step-by-Step-Guide-to-International-School-Admissions-copy.webp" },
  { title: "Benefits of Meditation for Students: How Mindfulness Can Enhance Learning and Reduce Stress", slug: "benefits-of-meditation-for-students", date: "23 Oct 2024", cat: "Student Wellness", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2024/10/Benefits-of-Meditation-for-Students-copy.webp" },
  { title: "Diwali Activities for Students: Creative and Educational Ways to Celebrate the Festival", slug: "diwali-activities-for-students", date: "23 Oct 2024", cat: "Student Life", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2024/10/Diwali-Activities-for-Students-copy.webp" },
  { title: "CBSE vs ICSE: Which Board Prepares Students Better for the Future?", slug: "cbse-vs-icse-which-board-prepares-students-better-for-the-future", date: "07 Oct 2024", cat: "CBSE School", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2024/10/CBSE-vs-ICSE-copy.webp" },
  { title: "10 Things in the Classroom That Will Boost Student Engagement", slug: "10-things-in-the-classroom-to-boost-student-engagement", date: "07 Oct 2024", cat: "Education", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2024/10/10-Things-in-the-Classroom-That-Will-Boost-Student-Engagement-copy.webp" },
  { title: "Beyond Academics: The Holistic Development of Senior Secondary School Students at Rainbow International School", slug: "holistic-development-rainbow-international-school", date: "28 Aug 2024", cat: "School", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2024/08/Beyond-Academics-copy.webp" },
  { title: "Top 5 Reasons Why Rainbow International School is the Best Choice Among International Schools in Thane", slug: "top-reasons-choose-rainbow-international-school-thane", date: "28 Aug 2024", cat: "School", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2024/08/Top-5-Reasons-Why-Rainbow-International-School-copy.webp" },
  { title: "Group Activities for Students: Fostering Collaboration", slug: "group-activities-for-students", date: "16 Jul 2024", cat: "Student Life", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2024/07/Group-Activities-for-Students-copy.webp" },
  { title: "Importance of Sports in Students' Life: Enhancing Physical and Mental Health", slug: "imporatnce-of-sports-in-students-life", date: "16 Jul 2024", cat: "Sports", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2024/07/Importance-of-Sports-in-Students-copy.webp" },
  { title: "Cultural Activities for Students: Key to Developing Critical Thinking Skills", slug: "cultural-activities-for-students-key-to-developing-critical-thinking-skills", date: "15 Jun 2024", cat: "Student Life", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2024/06/Cultural-Activities-for-Students-Key-to-Developing-Critical-Thinking-Skills.webp" },
  { title: "Parental Guidance: How to Choose the Best CBSE School in Thane for Your Child", slug: "parental-guidance-how-to-choose-the-best-cbse-school-in-thane-for-your-child", date: "15 Jun 2024", cat: "Parenting", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2024/06/Parental-Guidance-How-to-Choose-the-Best-CBSE-School-in-Thane-for-Your-Child.webp" },
  { title: "How to Learn Boring Subjects: Making Study Sessions Interesting", slug: "how-to-learn-boring-subjects", date: "23 May 2024", cat: "Study Tips", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2024/05/How-to-Learn-Boring-Subjects-Making-Study-Sessions-Interesting.webp" },
  { title: "How to Increase Attention Span: Tips for Studious Minds", slug: "how-to-increase-attention-span", date: "23 May 2024", cat: "Study Tips", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2024/05/How-to-increase-attention-span.webp" },
  { title: "The Comprehensive Benefits of Learning a Second Language", slug: "benefits-of-learning-a-second-language", date: "21 May 2024", cat: "Education", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2024/05/benefits-of-learning-second-language.webp" },
  { title: "How to Avoid Procrastination While Studying: 8 Effective Strategies", slug: "how-to-avoid-procrastination-while-studying", date: "21 May 2024", cat: "Study Tips", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2024/05/How-to-Avoid-Procrastination-While-Studying-8-Effective-Strategies.webp" },
  { title: "Flipped Classrooms: An Innovative Teaching Method for Active Learning", slug: "innovative-teaching-method-for-active-learning", date: "28 Mar 2024", cat: "Education", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2024/03/Innovative-Teaching-Method-for-Active-Learning.webp" },
  { title: "From Memorization to Understanding: Smart Revision Techniques for Students", slug: "smart-revision-techniques-for-students", date: "27 Mar 2024", cat: "Study Tips", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2024/03/Smart-Revision-Techniques-for-Students.webp" },
  { title: "Teen Entrepreneurship: Fostering Innovation and Responsibility", slug: "teen-entrepreneurship-fostering-innovation-and-responsibility", date: "01 Mar 2024", cat: "Student Life", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2024/03/blogNew.webp" },
  { title: "The Art of Resilience: Teaching Teens to Thrive Through Failure", slug: "teaching-teens-resilience-and-thriving-through-failure", date: "01 Mar 2024", cat: "Student Wellness", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2024/03/RainbowInternationalBlog-01.webp" },
  { title: "Nutritional Requirements of the Teenagers & How to Fulfil Them", slug: "nutritional-requirements-of-the-teenagers-how-to-fulfil-them", date: "22 Sep 2022", cat: "Student Wellness", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/RIS-Blog-1-Jan-2022.png" },
  { title: "Stress in Teenagers: Symptoms & Management", slug: "stress-in-teenagers-symptoms-management", date: "22 Sep 2022", cat: "Student Wellness", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/RIS-Blog-Banner-2-Dec-2021-1.jpg" },
  { title: "Top 5 Techniques for Taming Anger in Children", slug: "top-5-techniques-for-taming-anger-in-children", date: "22 Sep 2022", cat: "Parenting", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/RIS-Blog-Dec-2021-1.jpg" },
  { title: "Top 6 Easy Ways to Develop Patience in Your Child", slug: "top-6-easy-ways-to-develop-patience-in-your-child", date: "22 Sep 2022", cat: "Parenting", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/Untitled-3-01-1-1.jpg" },
  { title: "Homework War: Endgame", slug: "homework-war-endgame", date: "22 Sep 2022", cat: "Parenting", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/How-to-encourage-children-to-do-their-homework-2.png" },
  { title: "Using Gadgets the Right Way", slug: "using-gadgets-the-right-way", date: "22 Sep 2022", cat: "Parenting", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/Using-Gadgets-the-Right-Way-1.png" },
  { title: "Regulating Children's Screen Time", slug: "regulating-childrens-screen-time", date: "22 Sep 2022", cat: "Parenting", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/Regulating-Childrens-Screen-Time3-1.jpg" },
  { title: "How to Deal with Anxiety During Exams", slug: "how-to-deal-with-anxiety-during-exams", date: "22 Sep 2022", cat: "Student Wellness", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/Add-a-heading-1.png" },
  { title: "Understanding Adolescence & How to Handle the Process", slug: "understanding-adolescence-how-to-handle-the-process", date: "22 Sep 2022", cat: "Parenting", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/Understanding-Adolescence-How-to-Handle-the-Process.png" },
  { title: "How to Develop Fine Motor Skills at Home", slug: "how-to-develop-fine-motor-skills-at-home", date: "22 Sep 2022", cat: "Education", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/RIS-Blog-Photo.jpg" },
  { title: "The Leading School of the Year (Thane)", slug: "the-leading-school-of-the-year-thane", date: "22 Sep 2022", cat: "School", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbowinternationalschool-awards-leading-school.jpg" },
  { title: "Give Earth to Life on Earth", slug: "give-earth-to-life-on-earth", date: "22 Sep 2022", cat: "Education", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-preschool-blog-earth-day-new.jpg" },
  { title: "Coronavirus: The New Monster in Town", slug: "coronavirus-the-new-monster-in-town", date: "22 Sep 2022", cat: "General", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-blog-coronavirus-world-news-today.jpg" },
  { title: "FIT INDIA Certificate of Recognition", slug: "fit-india-certificate-of-recognition", date: "22 Sep 2022", cat: "School", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-thane-fit-india-4-2.jpg" },
  { title: "The 15th World Education Summit", slug: "the-15th-world-education-summit", date: "22 Sep 2022", cat: "School", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-world-education-summit-2019.jpg" },
  { title: "Teen Depression: How To Spot And Cure It", slug: "teen-depression-how-to-spot-and-cure-it", date: "22 Sep 2022", cat: "Student Wellness", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/Teen-depression-How-To-Spot-And-Cure-It.jpg" },
  { title: "7 Areas in Education Where Indian Women Are Excellent", slug: "7-areas-in-education-where-indian-women-are-excellent", date: "22 Sep 2022", cat: "Education", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/7-areas-in-education-where-Indian-women-are-excellent.jpg" },
  { title: "4 Reasons Why School Bags Should Not Be a Burden", slug: "4-reasons-why-school-bags-should-not-be-a-burden", date: "22 Sep 2022", cat: "Student Life", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/4-Reasons-Why-School-Bags-Should-Not-Be-a-Burden.jpg" },
  { title: "Smartphone Addiction: How To Ensure Healthy Use By Kids", slug: "smartphone-addiction-how-to-ensure-healthy-use-by-kids", date: "22 Sep 2022", cat: "Parenting", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/Smartphone-Addiction-How-To-Ensure-Healthy-Use-By-Kids.jpg" },
  { title: "School Sanitation Standards: How To Stay Clean and Safe", slug: "school-sanitation-standards-how-to-stay-clean-and-safe", date: "22 Sep 2022", cat: "School", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/School-Sanitation-Standards-How-To-Stay-Clean-and-Safe.jpg" },
  { title: "6 Excellent Ideas to Innovate Cultural Programmes in School", slug: "6-excellent-ideas-to-innovate-cultural-programmes-in-school", date: "22 Sep 2022", cat: "Student Life", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/6-excellent-ideas-to-innovate-cultural-programmes-in-school.jpg" },
  { title: "Teaching Children the Value of Money: 5 Ways Schools Can Help", slug: "teaching-children-the-value-of-money-5-ways-schools-can-help", date: "22 Sep 2022", cat: "Education", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/Teaching-Children-the-Value-of-Money-5-Ways-Schools-Can-Help.jpg" },
  { title: "Amazing Coaches Who Improved Players' Willpower", slug: "amazing-coaches-who-improved-players-willpower", date: "22 Sep 2022", cat: "Sports", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/Amazing-coaches-who-improved-players-willpower.jpg" },
  { title: "How Organic Farming in Schools Helps the Nation", slug: "how-organic-farming-in-schools-helps-the-nation", date: "22 Sep 2022", cat: "Education", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/How-Organic-Farming-in-Schools-Helps-the-Nation.jpg" },
  { title: "How School Buses Are Changing with Technology", slug: "how-school-buses-are-changing-with-technology", date: "22 Sep 2022", cat: "School", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/How-School-Buses-are-Changing-with-Technology.jpg" },
  { title: "Amazing YouTube Channels on General Knowledge for Kids", slug: "amazing-youtube-channels-on-general-knowledge-for-kids", date: "22 Sep 2022", cat: "Education", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/Amazing-YouTube-channels-on-general-knowledge-for-kids.jpg" },
  { title: "Know How Swimming Helps Your Child in 7 Ways", slug: "know-how-swimming-helps-your-child-in-7-ways", date: "22 Sep 2022", cat: "Sports", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/Know-how-swimming-helps-your-child-in-7-ways.jpg" },
  { title: "6 Reasons Why CBSE Is the Best Board of the Country", slug: "6-reasons-why-cbse-is-the-best-board-of-the-country", date: "22 Sep 2022", cat: "CBSE School", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/6-reasons-why-CBSE-is-the-best-board-of-the-country.jpg" },
  { title: "Big School Playgrounds: 6 Reasons Why Kids Need Them", slug: "big-school-playgrounds-6-reasons-why-kids-need-them", date: "22 Sep 2022", cat: "Education", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/Big-School-Playgrounds-6-reasons-why-kids-need-them.jpg" },
  { title: "6 Reasons Why Indoor Sports Is Important In Schools", slug: "6-reasons-why-indoor-sports-is-important-in-schools", date: "22 Sep 2022", cat: "Sports", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/6-reasons-why-Indoor-Sports-is-important-In-Schools.jpg" },
  { title: "An All Rounder Kid: Raghvi Ramanujan Displays Exceptional Talent in Swimming", slug: "an-all-rounder-kid-raghvi-ramanujan-displays-exceptional-talent-in-swimming", date: "22 Sep 2022", cat: "Student Life", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/Raghavi.jpg" },
  { title: "Rainbow Awarded as Best Preschool and Secondary School in Thane", slug: "rainbow-awarded-as-best-preschool-and-secondary-school-in-thane", date: "22 Sep 2022", cat: "School", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/Rainbow-awarded-as-best-Preschool-and-Secondary-school-in-Thane.jpg" },
  { title: "Rainbow Preschools Featured in Knowledge Review Magazine", slug: "rainbow-preschools-featured-in-knowledge-review-magazine", date: "22 Sep 2022", cat: "School", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/Rainbow-Preschools-Featured-in-Knowledge-Review-Magazine.jpg" },
  { title: "Rainbow Wins Award For Excellence", slug: "rainbow-wins-award-for-excellence", date: "22 Sep 2022", cat: "School", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/Rainbow-Wins-Award-For-Excellence.jpg" },
  { title: "100% Result: Rainbow's First Batch (2018-19)", slug: "100-result-rainbows-first-batch-2018-19", date: "22 Sep 2022", cat: "School", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/100-percent-result.jpg" },
  { title: "Field Trips: Know How They Groom Students in 5 Ways", slug: "field-trips-know-how-they-groom-students-in-5-ways", date: "22 Sep 2022", cat: "Education", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/Field-trips-know-how-they-groom-students-in-5-ways.jpg" },
  { title: "Time Management for School Children: 6 Ways Parents Can Help", slug: "time-management-for-school-children-6-ways-parents-can-help", date: "22 Sep 2022", cat: "Parenting", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/Time-management.jpg" },
  { title: "How to Teach Benefits of Family Meals to Kids", slug: "how-to-teach-benefits-of-family-meals-to-kids", date: "22 Sep 2022", cat: "Parenting", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/How-to-teach-benefits-of-family-meals-to-kids.jpg" },
  { title: "Do Your Children Hate Reading? Know Why You're The Reason", slug: "do-your-children-hate-reading-know-why-youre-the-reason", date: "22 Sep 2022", cat: "Parenting", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/Do-youre-child-hate-reading-Know-why-you-are-the-reason.jpg" },
  { title: "How Regular Sports Help Students (6 Reasons)", slug: "how-regular-sports-help-students-6-reasons", date: "22 Sep 2022", cat: "Sports", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/How-regular-sports-helps-students.jpg" },
  { title: "9 Reasons Why Schools Should Have an Infirmary and Paediatrician", slug: "9-reasons-why-schools-should-have-an-infirmary-and-paediatrician", date: "22 Sep 2022", cat: "School", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/9-Reasons-Why-Schools-Should-Have-an-Infirmary-and-Paediatrician.jpg" },
  { title: "7 Safety and Security Measures Your Kids' School Should Have", slug: "7-safety-and-security-measures-your-kids-school-should-have", date: "22 Sep 2022", cat: "School", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/7-Safety-and-Security-Measures-Your-Kids-School-Should-Have.jpg" },
  { title: "Digital Classrooms: How Technology Improves Education In School", slug: "digital-classrooms-how-technology-improves-education-in-school", date: "22 Sep 2022", cat: "Education", thumbUrl: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/Digital-Classrooms-How-Technology-Improves-Education-In-School.jpg" },
];

const categories = ["All", "CBSE School", "School", "Education", "Parenting", "Student Life", "Student Wellness", "Admissions", "Sports", "Study Tips", "General"];

export default function Blogs() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = allBlogs.filter(b => {
    const matchesCat = activeCategory === "All" || b.cat === activeCategory;
    const matchesSearch = !searchQuery || b.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Blogs"
        description="Read 86+ insightful articles from Rainbow International School on education, parenting, CBSE, student wellness, admissions, sports and more."
        keywords="Rainbow school blog, education blog Thane, CBSE school blog, parenting tips school Thane, student development blog Rainbow International"
        canonical="https://www.rainbowinternationalschool.in/blogs/"
        breadcrumbs={[
          { name: "Home", href: "https://www.rainbowinternationalschool.in/" },
          { name: "Blogs", href: "https://www.rainbowinternationalschool.in/blogs" },
        ]}
      />
      <Navbar />
      <PageBanner
        title="Blogs"
        subtitle={`${allBlogs.length} articles on education, parenting & student development.`}
        breadcrumb={[{ label: "Blogs" }]}
      />

      <main className="flex-grow py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-blog-search"
                className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm w-32 focus:w-48 transition-all focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400"
              />
            </div>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                data-testid={`button-blog-cat-${cat}`}
                className={`px-4 py-1.5 rounded-full font-semibold text-sm transition-all border ${
                  activeCategory === cat
                    ? "text-white border-transparent bg-red-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-red-400 hover:text-red-500"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <p className="text-sm text-gray-500 mb-8">
            Showing {filtered.length} article{filtered.length !== 1 ? "s" : ""}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((blog, i) => {
              const isInternal = publishedSlugs.has(blog.slug);
              const excerpt = blogIntros[blog.slug] || "";
              const truncatedExcerpt = excerpt.length > 120 ? excerpt.slice(0, 120) + "..." : excerpt;
              const cardContent = (
                <div className="p-6 flex flex-col h-full">
                  <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full border border-green-400 text-green-600 mb-4 self-start">
                    {blog.cat}
                  </span>
                  <h3 className="font-bold text-lg leading-snug text-gray-900 mb-3">{blog.title}</h3>
                  {truncatedExcerpt && (
                    <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-grow">{truncatedExcerpt}</p>
                  )}
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-red-500 group-hover:gap-2.5 transition-all mt-auto">
                    Read Article <ArrowRight size={14} />
                  </span>
                </div>
              );
              return isInternal ? (
                <Link
                  key={i}
                  href={`/blog/${blog.slug}`}
                  className="group bg-white rounded-xl overflow-hidden border-l-4 border-l-red-500 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                  data-testid={`card-blog-${i}`}
                >
                  {cardContent}
                </Link>
              ) : (
                <a
                  key={i}
                  href={`https://rainbowinternationalschool.in/${blog.slug}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white rounded-xl overflow-hidden border-l-4 border-l-red-500 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                  data-testid={`card-blog-${i}`}
                >
                  {cardContent}
                </a>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
