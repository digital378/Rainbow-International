import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Briefcase, Users, Heart, TrendingUp, CheckCircle } from "lucide-react";
import ScrollProgress from "@/components/home/ScrollProgress";

const openings = [
  { title: "PRT – Primary Teacher", type: "Full-time", department: "Primary Section", exp: "1–3 years" },
  { title: "TGT – Trained Graduate Teacher (Maths / Science)", type: "Full-time", department: "Middle Section", exp: "2–5 years" },
  { title: "PGT – Post Graduate Teacher (Physics / Chemistry / Maths)", type: "Full-time", department: "Senior Secondary", exp: "3+ years" },
  { title: "Counsellor", type: "Full-time", department: "Student Welfare", exp: "2+ years" },
  { title: "Sports Coach (Multi-sport)", type: "Full-time", department: "Sports Department", exp: "2+ years" },
  { title: "Librarian", type: "Full-time", department: "Library", exp: "1+ year" },
];

const benefits = [
  { icon: Briefcase, title: "Professional Growth", description: "Regular training, workshops, and career development opportunities." },
  { icon: Users, title: "Collaborative Culture", description: "Work with a dedicated team passionate about student development." },
  { icon: Heart, title: "Student-Centric", description: "A fulfilling role where your work directly impacts young lives." },
  { icon: TrendingUp, title: "Competitive Compensation", description: "Attractive salary packages commensurate with experience." },
];

export default function Career() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data: Record<string, string>) => {
    const res = await fetch("/api/career-applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Submission failed");
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Career Opportunities"
        description="Explore career opportunities at Rainbow International School in Thane. We're looking for passionate educators and staff to join our esteemed institution."
        keywords="Rainbow school career, teacher jobs Thane, school jobs Thane, educator jobs Rainbow International School"
        canonical="https://rainbowinternationalschool.in/career"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "Career Opportunities", href: "https://rainbowinternationalschool.in/career" },
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Career Opportunities at Rainbow International School",
          "description": "Explore teaching and staff career opportunities at Rainbow International School, Thane — a leading CBSE-affiliated K-12 school.",
          "url": "https://rainbowinternationalschool.in/career",
          "isPartOf": {
            "@type": "WebSite",
            "name": "Rainbow International School",
            "url": "https://rainbowinternationalschool.in"
          }
        }}
      />
      <Navbar />
      <PageBanner
        title="Career Opportunities"
        subtitle="Join our team of passionate educators and changemakers."
        breadcrumb={[{ label: "Career" }]}
      />

      <main className="flex-grow">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black mb-4" style={{ color: "#0d3b86" }}>Why Work at Rainbow?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Rainbow International School offers a stimulating, student-centric work environment where educators are empowered to innovate and inspire.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {benefits.map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#f0f4ff" }}>
                      <Icon size={22} style={{ color: "#0d3b86" }} />
                    </div>
                    <h3 className="font-black text-base mb-2" style={{ color: "#0d3b86" }}>{benefit.title}</h3>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                );
              })}
            </div>

            <h2 className="text-3xl font-black mb-8 text-center" style={{ color: "#0d3b86" }}>Current Openings</h2>
            <div className="space-y-4 mb-16">
              {openings.map((job, i) => (
                <div key={i} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" data-testid={`card-job-${i}`}>
                  <div>
                    <h3 className="font-black text-lg" style={{ color: "#0d3b86" }}>{job.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#f0f4ff", color: "#0d3b86" }}>{job.type}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#fef3c7", color: "#92400e" }}>{job.department}</span>
                      <span className="text-xs text-gray-500">{job.exp} experience</span>
                    </div>
                  </div>
                  <a href="#apply" className="shrink-0 text-white text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-opacity" style={{ background: "#0d3b86" }}>Apply Now</a>
                </div>
              ))}
            </div>

            <div id="apply" className="rounded-3xl p-8 border border-gray-100" style={{ background: "#f8faff" }}>
              <h2 className="text-2xl font-black mb-6" style={{ color: "#0d3b86" }}>Apply for a Position</h2>
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-5">
                    <CheckCircle size={40} className="text-green-500" />
                  </div>
                  <h3 className="text-2xl font-extrabold mb-2" style={{ color: "#0d3b86" }}>Thank You!</h3>
                  <p className="text-gray-500 text-sm mb-8 max-w-sm">We've received your application. Our HR team will contact you within 3–5 working days.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    data-testid="button-career-another-request"
                    className="px-7 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Submit Another Application
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Full Name *</label>
                    <input {...register("name", { required: true })} type="text" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="Your full name" data-testid="input-career-name" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Email *</label>
                    <input {...register("email", { required: true })} type="email" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="your@email.com" data-testid="input-career-email" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Phone *</label>
                    <input {...register("phone", { required: true })} type="tel" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="+91 98765 43210" data-testid="input-career-phone" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Position Applied For *</label>
                    <select {...register("position", { required: true })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white" data-testid="select-career-position">
                      <option value="">Select Position</option>
                      {openings.map((job, i) => <option key={i} value={job.title}>{job.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Years of Experience</label>
                    <input {...register("experience")} type="text" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="e.g. 3 years" data-testid="input-career-experience" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Qualification</label>
                    <input {...register("qualification")} type="text" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="e.g. B.Ed, M.Sc" data-testid="input-career-qualification" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Message</label>
                    <textarea {...register("message")} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="Tell us about yourself..." data-testid="textarea-career-message" />
                  </div>
                  <div className="md:col-span-2">
                    <button type="submit" disabled={isSubmitting} className="text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity disabled:opacity-70" style={{ background: "#0d3b86" }} data-testid="button-career-submit">
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
