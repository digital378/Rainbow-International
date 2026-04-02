import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import ScrollProgress from "@/components/home/ScrollProgress";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const grades = [
  "Playgroup", "Nursery", "Jr. KG", "Sr. KG",
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8",
  "Class 9", "Class 10", "Class 11 – Science",
  "Class 11 – Commerce", "Class 11 – Humanities",
  "Class 12 – Science", "Class 12 – Commerce", "Class 12 – Humanities",
];

const timeSlots = [
  "9:00 AM – 10:00 AM", "10:00 AM – 11:00 AM",
  "11:00 AM – 12:00 PM", "12:00 PM – 1:00 PM",
  "2:00 PM – 3:00 PM", "3:00 PM – 4:00 PM",
  "4:00 PM – 5:00 PM",
];

export default function ApplicationForm() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [form, setForm] = useState({
    studentName: "",
    dateOfBirth: "",
    gradeApplying: "",
    parentName: "",
    email: "",
    phone: "",
    currentSchool: "",
    address: "",
    preferredDate: "",
    timeSlot: "",
    message: "",
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof form) => {
      return apiRequest("POST", "/api/inquiries", {
        parentName: data.parentName,
        studentName: data.studentName,
        email: data.email,
        phone: data.phone,
        grade: data.gradeApplying,
        preferredTime: data.timeSlot,
        message: `Application Form | DOB: ${data.dateOfBirth} | Current School: ${data.currentSchool} | Preferred Visit: ${data.preferredDate} ${data.timeSlot} | Address: ${data.address} | Notes: ${data.message}`,
      });
    },
    onSuccess: () => {
      navigate("/thank-you");
    },
    onError: () => {
      toast({ title: "Submission failed", description: "Please try again or call us directly.", variant: "destructive" });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  const inputCls = "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="Application Form – Admissions 2026–27 | Rainbow International School Thane"
        description="Apply for admission to Rainbow International School, Thane West. Fill out the online application form for Nursery to Class 12. CBSE Affiliation No. 1130661."
        keywords="Rainbow International School application form, CBSE school admission Thane 2026-27, apply Rainbow school online"
        canonical="/application-form"
      />
      <ScrollProgress />
      <Navbar />
      <PageBanner
        title="Application Form"
        subtitle="Admissions Open for Academic Year 2026–27"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Application Form" }]}
        bgImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/04-copy.jpeg"
      />

      <main className="flex-1 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Intro */}
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold tracking-widest uppercase px-4 py-1 rounded-full mb-4">
              Admissions 2026–27
            </span>
            <h2 className="text-3xl font-bold text-[#091a4f] mb-4">Begin Your Child's Rainbow Journey</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Complete the form below and our admissions team will contact you within one working day
              to confirm your campus visit and walk you through the next steps.
            </p>
          </div>

          {/* Info strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { label: "Grades", value: "Nursery – Class 12" },
              { label: "Affiliation", value: "CBSE No. 1130661" },
              { label: "Campus", value: "Brahmand, Thane West" },
            ].map(item => (
              <div key={item.label} className="bg-[#f8faff] rounded-xl p-4 text-center border border-blue-100">
                <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                <div className="font-bold text-[#0d3b86] text-sm">{item.value}</div>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 space-y-6">
            <h3 className="text-lg font-bold text-[#091a4f] border-b border-gray-100 pb-3">Student Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Student Full Name *</label>
                <input name="studentName" value={form.studentName} onChange={handleChange} required placeholder="As per birth certificate" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Date of Birth *</label>
                <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Grade Applying For *</label>
                <select name="gradeApplying" value={form.gradeApplying} onChange={handleChange} required className={inputCls}>
                  <option value="">Select grade</option>
                  {grades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Current School (if any)</label>
                <input name="currentSchool" value={form.currentSchool} onChange={handleChange} placeholder="Name of previous/current school" className={inputCls} />
              </div>
            </div>

            <h3 className="text-lg font-bold text-[#091a4f] border-b border-gray-100 pb-3 pt-2">Parent / Guardian Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Parent / Guardian Name *</label>
                <input name="parentName" value={form.parentName} onChange={handleChange} required placeholder="Full name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Mobile Number *</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="+91 XXXXX XXXXX" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email Address *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Residential Area</label>
                <input name="address" value={form.address} onChange={handleChange} placeholder="Locality / Sector / Area" className={inputCls} />
              </div>
            </div>

            <h3 className="text-lg font-bold text-[#091a4f] border-b border-gray-100 pb-3 pt-2">Schedule a Campus Visit</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Preferred Visit Date</label>
                <input type="date" name="preferredDate" value={form.preferredDate} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Preferred Time Slot</label>
                <select name="timeSlot" value={form.timeSlot} onChange={handleChange} className={inputCls}>
                  <option value="">Select time</option>
                  {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Additional Message</label>
              <textarea name="message" value={form.message} onChange={handleChange} rows={3} placeholder="Any specific questions or requirements..." className={inputCls + " resize-none"} />
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              data-testid="button-submit-application"
              className="w-full bg-[#0d3b86] hover:bg-[#091a4f] text-white font-bold py-4 rounded-xl text-sm tracking-wide transition-colors disabled:opacity-60"
            >
              {mutation.isPending ? "Submitting..." : "Submit Application"}
            </button>
            <p className="text-center text-xs text-gray-500">
              Our admissions team will call you within one working day. Mon–Sat, 9 AM–6 PM.
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
