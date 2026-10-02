import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  Briefcase,
  Users,
  Heart,
  TrendingUp,
  CheckCircle,
  GraduationCap,
  ClipboardList,
  Phone,
  Mail,
  Upload,
  Info,
} from "lucide-react";
import ScrollProgress from "@/components/home/ScrollProgress";

type Opening = { title: string; type: string; department: string; exp: string };

const academicOpenings: Opening[] = [
  { title: "PRT – English", type: "Full-time", department: "Primary Section", exp: "1–4 years" },
  { title: "PRT – EVS", type: "Full-time", department: "Primary Section", exp: "1–4 years" },
  { title: "PRT – Computer", type: "Full-time", department: "Primary Section", exp: "1–4 years" },
  { title: "PGT – English", type: "Full-time", department: "Senior Secondary", exp: "1–4 years" },
  { title: "PGT – History", type: "Full-time", department: "Senior Secondary", exp: "1–4 years" },
  { title: "TGT – English", type: "Full-time", department: "Middle Section", exp: "1–4 years" },
];

const nonAcademicOpenings: Opening[] = [
  { title: "Swimming Coach", type: "Full-time", department: "Sports Department", exp: "1–4 years" },
  { title: "Librarian", type: "Full-time", department: "Library", exp: "1–4 years" },
  { title: "Admission Counsellor", type: "Full-time", department: "Admissions", exp: "2–5 years" },
  { title: "School Clerk", type: "Full-time", department: "Administration", exp: "2–5 years" },
  { title: "HR Manager", type: "Full-time", department: "Human Resources", exp: "8–12 years" },
  { title: "HR Recruiter", type: "Full-time", department: "Human Resources", exp: "3–6 years" },
  { title: "Admin", type: "Full-time", department: "Administration", exp: "2–5 years" },
  { title: "Sales Manager", type: "Full-time", department: "Marketing & Sales", exp: "8–12 years" },
  { title: "L&D Trainer", type: "Full-time", department: "Learning & Development", exp: "5–8 years" },
];

const benefits = [
  { icon: Briefcase, title: "Professional Growth", description: "Regular training, workshops, and career development opportunities." },
  { icon: Users, title: "Collaborative Culture", description: "Work with a dedicated team passionate about student development." },
  { icon: Heart, title: "Student-Centric", description: "A fulfilling role where your work directly impacts young lives." },
  { icon: TrendingUp, title: "Competitive Compensation", description: "Attractive salary packages commensurate with experience." },
];

const HR_PHONE = "+91 87799 81827";
const HR_PHONE_TEL = "+918779981827";
const HR_EMAIL = "hr.recruiter2@rainbowinternationalschool.in";

const ACCEPTED_RESUME_TYPES = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const MAX_RESUME_BYTES = 5 * 1024 * 1024;

type CareerFormValues = {
  name: string;
  email: string;
  phone: string;
  experience: string;
  qualification: string;
  position: string;
  currentLocation: string;
  resume: FileList;
  message?: string;
};

function OpeningCard({ job, index, testIdPrefix }: { job: Opening; index: number; testIdPrefix: string }) {
  return (
    <div
      className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      data-testid={`card-${testIdPrefix}-${index}`}
    >
      <div>
        <h3 className="font-black text-lg" style={{ color: "#0d3b86" }} data-testid={`text-${testIdPrefix}-title-${index}`}>
          {job.title}
        </h3>
        <div className="flex flex-wrap gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#f0f4ff", color: "#0d3b86" }}>
            {job.type}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#fef3c7", color: "#92400e" }}>
            {job.department}
          </span>
          <span className="text-xs text-gray-500">{job.exp} experience</span>
        </div>
      </div>
      <a
        href="#apply"
        className="shrink-0 text-white text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-opacity"
        style={{ background: "#0d3b86" }}
        data-testid={`link-${testIdPrefix}-apply-${index}`}
      >
        Apply Now
      </a>
    </div>
  );
}

function PreferenceNote({ section }: { section: string }) {
  return (
    <div
      className="flex items-start gap-3 rounded-2xl px-4 py-3 mb-6 border"
      style={{ background: "#fff7ed", borderColor: "#fed7aa" }}
      data-testid={`note-female-preference-${section}`}
    >
      <Info size={18} className="mt-0.5 shrink-0" style={{ color: "#b45309" }} />
      <p className="text-sm" style={{ color: "#7c2d12" }}>
        Female candidates are preferred for these roles, in line with current team requirements.
      </p>
    </div>
  );
}

export default function Career() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<CareerFormValues>();

  const onSubmit = async (data: CareerFormValues) => {
    setServerError(null);
    const file = data.resume?.[0];
    if (!file) {
      setServerError("Please upload your resume (PDF, DOC, or DOCX).");
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      setServerError("Resume file is too large (max 5 MB).");
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("experience", data.experience);
    formData.append("qualification", data.qualification);
    formData.append("position", data.position);
    formData.append("currentLocation", data.currentLocation);
    if (data.message) formData.append("message", data.message);
    formData.append("resume", file);

    try {
      const res = await fetch("/api/career-applications", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.message || "Submission failed. Please try again.");
      }
      setSubmitted(true);
      reset();
    } catch (err: any) {
      setServerError(err?.message || "Submission failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Careers at Rainbow International School Thane | Teaching & Non-Teaching Jobs"
        description="Explore current academic and non-academic job openings at Rainbow International School, Thane. Apply online for teacher, coach, librarian, HR, admin, sales and L&D roles. Female candidates preferred."
        keywords="careers Rainbow International School, teacher jobs Thane, school jobs Thane, PRT PGT TGT vacancies Thane, non-teaching school jobs Thane, HR manager school Thane, librarian jobs Thane"
        canonical="https://rainbowinternationalschool.in/career"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "Careers", href: "https://rainbowinternationalschool.in/career" },
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Careers at Rainbow International School",
          description:
            "Current academic (PRT, PGT, TGT) and non-academic (Coach, Librarian, HR, Admin, Sales, L&D) openings at Rainbow International School, Thane.",
          url: "https://rainbowinternationalschool.in/career",
          isPartOf: {
            "@type": "WebSite",
            name: "Rainbow International School",
            url: "https://rainbowinternationalschool.in",
          },
        }}
      />
      <Navbar />
      <PageBanner
        title="Careers at Rainbow International School"
        subtitle="Join our team of passionate educators and changemakers."
        breadcrumb={[{ label: "Careers" }]}
      />

      <main className="flex-grow">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black mb-4" style={{ color: "#0d3b86" }}>
                Why Work at Rainbow?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Rainbow International School offers a stimulating, student-centric work environment where educators and staff are empowered to innovate and inspire.
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
                    <h3 className="font-black text-base mb-2" style={{ color: "#0d3b86" }}>
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                );
              })}
            </div>

            <h2 className="text-3xl font-black mb-8 text-center" style={{ color: "#0d3b86" }}>
              Current Job Openings
            </h2>

            {/* Academic Openings */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "#f0f4ff" }}>
                  <GraduationCap size={20} style={{ color: "#0d3b86" }} />
                </div>
                <h3 className="text-2xl font-black" style={{ color: "#0d3b86" }}>
                  Academic Openings
                </h3>
              </div>
              <PreferenceNote section="academic" />
              <div className="space-y-4">
                {academicOpenings.map((job, i) => (
                  <OpeningCard key={`academic-${i}`} job={job} index={i} testIdPrefix="academic-job" />
                ))}
              </div>
            </div>

            {/* Non-Academic Openings */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "#fef3c7" }}>
                  <ClipboardList size={20} style={{ color: "#92400e" }} />
                </div>
                <h3 className="text-2xl font-black" style={{ color: "#0d3b86" }}>
                  Non-Academic Openings
                </h3>
              </div>
              <PreferenceNote section="non-academic" />
              <div className="space-y-4">
                {nonAcademicOpenings.map((job, i) => (
                  <OpeningCard key={`non-academic-${i}`} job={job} index={i} testIdPrefix="non-academic-job" />
                ))}
              </div>
            </div>

            {/* HR Contact */}
            <div className="grid md:grid-cols-2 gap-4 mb-10">
              <div
                className="rounded-3xl p-6 border flex items-start gap-4"
                style={{ background: "#0d3b86", borderColor: "#0d3b86" }}
                data-testid="card-hr-contact"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <Phone size={22} className="text-white" />
                </div>
                <div className="text-white">
                  <p className="text-xs uppercase tracking-wide opacity-80 mb-1">Career Enquiries</p>
                  <p className="font-black text-lg leading-tight">HR Recruiter</p>
                  <a
                    href={`tel:${HR_PHONE_TEL}`}
                    className="block mt-1 text-base font-bold underline-offset-4 hover:underline"
                    data-testid="link-hr-phone"
                  >
                    {HR_PHONE}
                  </a>
                </div>
              </div>
              <div className="rounded-3xl p-6 border border-gray-100 flex items-start gap-4" style={{ background: "#f8faff" }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "#fff" }}>
                  <Mail size={22} style={{ color: "#0d3b86" }} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Email Applications To</p>
                  <p className="font-black text-base" style={{ color: "#0d3b86" }}>
                    HR Team
                  </p>
                  <a
                    href={`mailto:${HR_EMAIL}`}
                    className="block mt-1 text-sm font-semibold break-all hover:underline"
                    style={{ color: "#0d3b86" }}
                    data-testid="link-hr-email"
                  >
                    {HR_EMAIL}
                  </a>
                </div>
              </div>
            </div>

            {/* Application Form */}
            <div id="apply" className="rounded-3xl p-8 border border-gray-100" style={{ background: "#f8faff" }}>
              <h2 className="text-2xl font-black mb-2" style={{ color: "#0d3b86" }}>
                Apply for a Position
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Fill in your details below and upload your latest resume. Our HR team will get in touch with shortlisted candidates.
              </p>
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-14 text-center" data-testid="status-application-success">
                  <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-5">
                    <CheckCircle size={40} className="text-green-500" />
                  </div>
                  <h3 className="text-2xl font-extrabold mb-2" style={{ color: "#0d3b86" }}>
                    Application Received
                  </h3>
                  <p className="text-gray-600 text-sm mb-8 max-w-md" data-testid="text-success-message">
                    Thank you for applying. Our HR team will review your application and contact shortlisted candidates.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    data-testid="button-career-another-request"
                    className="px-7 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Submit Another Application
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-5" noValidate>
                  <div>
                    <label htmlFor="career-name" className="block text-sm font-semibold mb-1 text-gray-700">Full Name *</label>
                    <input
                      id="career-name"
                      {...register("name", { required: "Full name is required" })}
                      type="text"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                      placeholder="Your full name"
                      data-testid="input-career-name"
                    />
                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="career-email" className="block text-sm font-semibold mb-1 text-gray-700">Email ID *</label>
                    <input
                      id="career-email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
                      })}
                      type="email"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                      placeholder="your@email.com"
                      data-testid="input-career-email"
                    />
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="career-phone" className="block text-sm font-semibold mb-1 text-gray-700">Phone Number *</label>
                    <input
                      id="career-phone"
                      {...register("phone", {
                        required: "Phone number is required",
                        minLength: { value: 7, message: "Enter a valid phone number" },
                      })}
                      type="tel"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                      placeholder="+91 98765 43210"
                      data-testid="input-career-phone"
                    />
                    {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="career-experience" className="block text-sm font-semibold mb-1 text-gray-700">Total Experience *</label>
                    <input
                      id="career-experience"
                      {...register("experience", { required: "Total experience is required" })}
                      type="text"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                      placeholder="e.g. 3 years"
                      data-testid="input-career-experience"
                    />
                    {errors.experience && <p className="text-xs text-red-600 mt-1">{errors.experience.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="career-qualification" className="block text-sm font-semibold mb-1 text-gray-700">Qualification *</label>
                    <input
                      id="career-qualification"
                      {...register("qualification", { required: "Qualification is required" })}
                      type="text"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                      placeholder="e.g. B.Ed, M.Sc"
                      data-testid="input-career-qualification"
                    />
                    {errors.qualification && <p className="text-xs text-red-600 mt-1">{errors.qualification.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="career-position" className="block text-sm font-semibold mb-1 text-gray-700">Role Applied For *</label>
                    <select
                      id="career-position"
                      {...register("position", { required: "Please select a role" })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                      data-testid="select-career-position"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select a role
                      </option>
                      <optgroup label="Academic">
                        {academicOpenings.map((job) => (
                          <option key={`opt-academic-${job.title}`} value={job.title}>
                            {job.title}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Non-Academic">
                        {nonAcademicOpenings.map((job) => (
                          <option key={`opt-non-academic-${job.title}`} value={job.title}>
                            {job.title}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    {errors.position && <p className="text-xs text-red-600 mt-1">{errors.position.message}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="career-location" className="block text-sm font-semibold mb-1 text-gray-700">Current Location *</label>
                    <input
                      id="career-location"
                      {...register("currentLocation", { required: "Current location is required" })}
                      type="text"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                      placeholder="City, State (e.g. Thane, Maharashtra)"
                      data-testid="input-career-location"
                    />
                    {errors.currentLocation && (
                      <p className="text-xs text-red-600 mt-1">{errors.currentLocation.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <span className="block text-sm font-semibold mb-1 text-gray-700">Updated Resume *</span>
                    <label
                      htmlFor="career-resume-input"
                      className="flex items-center gap-3 w-full border border-dashed border-gray-300 rounded-xl px-4 py-4 text-sm bg-white cursor-pointer hover:border-[#0d3b86] transition-colors"
                    >
                      <Upload size={18} style={{ color: "#0d3b86" }} />
                      <span className="text-gray-600">
                        Click to upload your resume <span className="text-gray-400">(PDF, DOC, DOCX — max 5 MB)</span>
                      </span>
                    </label>
                    <input
                      id="career-resume-input"
                      {...register("resume", { required: "Please upload your resume" })}
                      type="file"
                      accept={ACCEPTED_RESUME_TYPES}
                      className="block mt-2 text-xs text-gray-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#0d3b86]/10 file:text-[#0d3b86] hover:file:bg-[#0d3b86]/20"
                      data-testid="input-career-resume"
                    />
                    {errors.resume && <p className="text-xs text-red-600 mt-1">{errors.resume.message as string}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="career-message" className="block text-sm font-semibold mb-1 text-gray-700">Message (optional)</label>
                    <textarea
                      id="career-message"
                      {...register("message")}
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                      placeholder="Tell us a bit about yourself..."
                      data-testid="textarea-career-message"
                    />
                  </div>
                  {serverError && (
                    <div
                      className="md:col-span-2 text-sm rounded-xl px-4 py-3 border"
                      style={{ background: "#fef2f2", borderColor: "#fecaca", color: "#991b1b" }}
                      data-testid="text-server-error"
                    >
                      {serverError}
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity disabled:opacity-70"
                      style={{ background: "#0d3b86" }}
                      data-testid="button-career-submit"
                    >
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
