import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import ScrollProgress from "@/components/home/ScrollProgress";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getFormTrackingData } from "@/lib/analytics";
import { submitInquiry } from "@/lib/inquiryProtection";
import { CheckCircle } from "lucide-react";

const grades = [
  "Jr. KG", "Sr. KG",
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8",
  "Class 9", "Class 10",
  "Class 11 – Science", "Class 11 – Commerce", "Class 11 – Humanities",
  "Class 12 – Science", "Class 12 – Commerce", "Class 12 – Humanities",
];

const timeSlots = [
  "9:00 AM – 10:00 AM", "10:00 AM – 11:00 AM",
  "11:00 AM – 12:00 PM", "12:00 PM – 1:00 PM",
  "2:00 PM – 3:00 PM",  "3:00 PM – 4:00 PM",
  "4:00 PM – 5:00 PM",
];

const emptyForm = {
  studentName: "", dateOfBirth: "", gradeApplying: "",
  parentName: "", email: "", phone: "",
  currentSchool: "", address: "", preferredDate: "", timeSlot: "", message: "", website: "",
};

export default function ApplicationForm() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const mutation = useMutation({
    mutationFn: async (data: typeof form) =>
      submitInquiry({
        parentName: data.parentName,
        studentName: data.studentName,
        email: data.email,
        phone: data.phone,
        grade: data.gradeApplying,
        preferredTime: data.timeSlot,
        message: `Application Form | DOB: ${data.dateOfBirth} | Current School: ${data.currentSchool} | Preferred Visit: ${data.preferredDate} ${data.timeSlot} | Address: ${data.address} | Notes: ${data.message}`,
        ...getFormTrackingData("Application Form"),
        website: data.website,
      }),
    onSuccess: () => setSubmitted(true),
    onError: () => toast({ title: "Submission failed", description: "Please try again or call us directly.", variant: "destructive" }),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let value = e.target.value;
    if (e.target.name === "phone") value = value.replace(/\D/g, "").slice(0, 10);
    setForm(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(form.phone)) {
      toast({ title: "Invalid phone number", description: "Please enter a valid 10-digit mobile number.", variant: "destructive" });
      return;
    }
    mutation.mutate(form);
  };

  const inp = "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
  const lbl = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="Application Form 2027–28 | Rainbow International School Thane"
        description="Submit a detailed admission application to Rainbow International School, Thane. CBSE affiliated, KG to Class 12. Schedule a campus visit and complete your application online."
        keywords="Rainbow International School application form, CBSE school admission Thane 2027-28, apply Rainbow school online"
        canonical="https://rainbowinternationalschool.in/application-form"
      />
      <ScrollProgress />
      <Navbar />
      <PageBanner
        title="Application Form"
        subtitle="Admissions Open for Academic Year 2027–28"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Admissions", href: "/admissions" }, { label: "Application Form" }]}
        bgImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/04-copy.jpeg"
      />

      <main className="flex-1 py-16 px-4">
        <div className="max-w-3xl mx-auto">

          <div className="text-center mb-10">
            <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold tracking-widest uppercase px-4 py-1 rounded-full mb-4">
              Detailed Application — 2027–28
            </span>
            <h2 className="text-3xl font-bold text-[#091a4f] mb-3">Complete Your Application</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">
              Fill in your child's details below. Our admissions team will review your application
              and contact you within one working day to confirm the next steps.
            </p>
            <p className="mt-3 text-sm text-[#0d3b86]">
              Just want to make a quick enquiry?{" "}
              <a href="/admissions" className="underline underline-offset-2 font-semibold">Visit the Admissions page →</a>
            </p>
          </div>

          {/* Info strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { label: "Grades",      value: "KG – Class 12" },
              { label: "Affiliation", value: "CBSE No. 1130661"   },
              { label: "Campus",      value: "Brahmand, Thane"    },
            ].map(item => (
              <div key={item.label} className="bg-[#f8faff] rounded-xl p-4 text-center border border-blue-100">
                <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                <div className="font-bold text-[#0d3b86] text-sm">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-5">
                  <CheckCircle size={40} className="text-green-500" />
                </div>
                <h3 className="text-2xl font-extrabold text-[#091a4f] mb-2">Thank You!</h3>
                <p className="text-gray-500 text-sm mb-8 max-w-sm">
                  Our admissions counsellor will contact you shortly to guide you through the next step.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm(emptyForm); }}
                  data-testid="button-application-another-request"
                  className="px-7 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Submit Another Application
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <input name="website" value={form.website} onChange={handleChange} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[10000px] h-px w-px opacity-0" />
                {/* Student details */}
                <h3 className="text-lg font-bold text-[#091a4f] border-b border-gray-100 pb-3">Student Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={lbl}>Student Full Name *</label>
                    <input name="studentName" value={form.studentName} onChange={handleChange} required placeholder="As per birth certificate" className={inp} data-testid="input-student-name" />
                  </div>
                  <div>
                    <label className={lbl}>Date of Birth *</label>
                    <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required className={inp} data-testid="input-dob" />
                  </div>
                  <div>
                    <label className={lbl}>Grade Applying For *</label>
                    <select name="gradeApplying" value={form.gradeApplying} onChange={handleChange} required className={inp} data-testid="select-grade">
                      <option value="">Select grade</option>
                      {grades.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Current School (if any)</label>
                    <input name="currentSchool" value={form.currentSchool} onChange={handleChange} placeholder="Name of previous / current school" className={inp} data-testid="input-current-school" />
                  </div>
                </div>

                {/* Parent details */}
                <h3 className="text-lg font-bold text-[#091a4f] border-b border-gray-100 pb-3 pt-2">Parent / Guardian Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={lbl}>Parent / Guardian Name *</label>
                    <input name="parentName" value={form.parentName} onChange={handleChange} required placeholder="Full name" className={inp} data-testid="input-parent-name" />
                  </div>
                  <div>
                    <label className={lbl}>Mobile Number *</label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="10-digit mobile number" inputMode="numeric" maxLength={10} className={inp} data-testid="input-phone" />
                  </div>
                  <div>
                    <label className={lbl}>Email Address *</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" className={inp} data-testid="input-email" />
                  </div>
                  <div>
                    <label className={lbl}>Residential Area</label>
                    <input name="address" value={form.address} onChange={handleChange} placeholder="Locality / Sector / Area" className={inp} data-testid="input-address" />
                  </div>
                </div>

                {/* Campus visit */}
                <h3 className="text-lg font-bold text-[#091a4f] border-b border-gray-100 pb-3 pt-2">Schedule a Campus Visit</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={lbl}>Preferred Visit Date</label>
                    <input type="date" name="preferredDate" value={form.preferredDate} onChange={handleChange} className={inp} data-testid="input-preferred-date" />
                  </div>
                  <div>
                    <label className={lbl}>Preferred Time Slot</label>
                    <select name="timeSlot" value={form.timeSlot} onChange={handleChange} className={inp} data-testid="select-time-slot">
                      <option value="">Select time</option>
                      {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={lbl}>Additional Message</label>
                  <textarea name="message" value={form.message} onChange={handleChange} rows={3} placeholder="Any specific questions or requirements…" className={inp + " resize-none"} data-testid="textarea-message" />
                </div>

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  data-testid="button-submit-application"
                  className="w-full bg-[#0d3b86] hover:bg-[#091a4f] text-white font-bold py-4 rounded-xl text-sm tracking-wide transition-colors disabled:opacity-60"
                >
                  {mutation.isPending ? "Submitting…" : "Submit Application"}
                </button>
                <p className="text-center text-xs text-gray-500">
                  Our admissions team will call you within one working day. Mon–Sat, 9 AM–6 PM.
                </p>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
