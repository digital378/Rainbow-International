import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Briefcase, Users, Heart, TrendingUp } from "lucide-react";

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

  const onSubmit = async (data: any) => {
    await new Promise(r => setTimeout(r, 800));
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Career Opportunities - Rainbow International School Thane"
        description="Explore career opportunities at Rainbow International School in Thane. We're looking for passionate educators and staff to join our esteemed institution."
        keywords="Rainbow school career, teacher jobs Thane West, school jobs Thane, educator jobs Rainbow International School"
        canonical="https://rainbowinternationalschool.in/career/"
      />
      <Navbar />
      <PageBanner
        title="Career Opportunities"
        subtitle="Join our team of passionate educators and changemakers."
        breadcrumb={[{ label: "Career" }]}
      />

      <main className="flex-grow">
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-primary mb-4">Why Work at Rainbow?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Rainbow International School offers a stimulating, student-centric work environment where educators are empowered to innovate and inspire.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {benefits.map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <div key={i} className="bg-card rounded-xl p-6 shadow border text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="text-primary" size={22} />
                    </div>
                    <h3 className="font-serif font-bold text-base text-primary mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                );
              })}
            </div>

            <h2 className="text-3xl font-serif font-bold text-primary mb-8 text-center">Current Openings</h2>
            <div className="space-y-4 mb-16">
              {openings.map((job, i) => (
                <div key={i} className="bg-card rounded-xl p-5 shadow border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" data-testid={`card-job-${i}`}>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-primary">{job.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{job.type}</span>
                      <span className="text-xs bg-secondary/30 text-primary px-2 py-0.5 rounded-full">{job.department}</span>
                      <span className="text-xs text-muted-foreground">{job.exp} experience</span>
                    </div>
                  </div>
                  <a href="#apply" className="shrink-0 bg-primary text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-primary/90 transition-colors">Apply Now</a>
                </div>
              ))}
            </div>

            <div id="apply" className="bg-muted/30 rounded-2xl p-8 border">
              <h2 className="text-2xl font-serif font-bold text-primary mb-6">Apply for a Position</h2>
              {submitted ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="text-xl font-bold text-primary mb-2">Application Received!</h3>
                  <p className="text-muted-foreground">Thank you for your interest. Our HR team will contact you within 3–5 working days.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-foreground">Full Name *</label>
                    <input {...register("name", { required: true })} type="text" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Your full name" data-testid="input-career-name" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-foreground">Email *</label>
                    <input {...register("email", { required: true })} type="email" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="your@email.com" data-testid="input-career-email" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-foreground">Phone *</label>
                    <input {...register("phone", { required: true })} type="tel" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="+91 98765 43210" data-testid="input-career-phone" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-foreground">Position Applied For *</label>
                    <select {...register("position", { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm bg-background" data-testid="select-career-position">
                      <option value="">Select Position</option>
                      {openings.map((job, i) => <option key={i} value={job.title}>{job.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-foreground">Years of Experience</label>
                    <input {...register("experience")} type="text" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. 3 years" data-testid="input-career-experience" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-foreground">Qualification</label>
                    <input {...register("qualification")} type="text" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. B.Ed, M.Sc" data-testid="input-career-qualification" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-1 text-foreground">Message</label>
                    <textarea {...register("message")} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Tell us about yourself..." data-testid="textarea-career-message" />
                  </div>
                  <div className="md:col-span-2">
                    <button type="submit" disabled={isSubmitting} className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70" data-testid="button-career-submit">
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
