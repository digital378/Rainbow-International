import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInquirySchema, type InsertInquiry } from "@shared/schema";
import { toast } from "sonner";
import { Send, MapPin, Phone, Mail, Clock, ShieldCheck } from "lucide-react";

const classOptions = [
  "Nursery", "Jr. KG", "Sr. KG",
  "Class I", "Class II", "Class III", "Class IV", "Class V",
  "Class VI", "Class VII", "Class VIII",
  "Class IX", "Class X", "Class XI", "Class XII",
];

const contactCards = [
  {
    icon: Phone,
    label: "Call Us",
    lines: ["(022) 69105000", "+91 82915 68972"],
    href: "tel:02269105000",
    accent: "#0d3b86",
    bg: "#eef5ff",
  },
  {
    icon: Mail,
    label: "Email Us",
    lines: ["admin@rainbowinternationalschool.in"],
    href: "mailto:admin@rainbowinternationalschool.in",
    accent: "#8b5cf6",
    bg: "#f5f3ff",
  },
  {
    icon: Clock,
    label: "Working Hours",
    lines: ["Monday – Saturday", "9:00 AM – 6:00 PM"],
    href: null,
    accent: "#10b981",
    bg: "#ecfdf5",
  },
  {
    icon: MapPin,
    label: "Our Address",
    lines: ["Cosmos Arcade, Brahmand Phase 4,", "Thane West, Maharashtra"],
    href: "https://maps.google.com/?q=Rainbow+International+School+Thane",
    accent: "#f97316",
    bg: "#fff7ed",
  },
];

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InsertInquiry>({
    resolver: zodResolver(insertInquirySchema),
  });

  const onSubmit = async (data: InsertInquiry) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed");
      toast.success("Thank you! Our Admission Counsellor will connect with you shortly.");
      reset();
      setAgreed(false);
    } catch {
      toast.error("Submission failed. Please try again or call us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white";

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-5" style={{ background: "#eef5ff", color: "#0d3b86" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Get In Touch
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
            Send an Inquiry
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Fill in your details below and our Admission Counsellor will get back to you promptly.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 max-w-5xl mx-auto items-start">
          <div className="flex-1 w-full">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input {...register("parentName")} placeholder="Parent Name *" data-testid="input-parent-name" className={inputBase} />
                    {errors.parentName && <p className="text-red-500 text-xs mt-1">{errors.parentName.message}</p>}
                  </div>
                  <div>
                    <input {...register("studentName")} placeholder="Student Name *" data-testid="input-student-name" className={inputBase} />
                    {errors.studentName && <p className="text-red-500 text-xs mt-1">{errors.studentName.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex">
                      <span className="inline-flex items-center px-3.5 border border-r-0 border-gray-200 rounded-l-xl bg-gray-50 text-gray-500 text-sm font-medium whitespace-nowrap">🇮🇳 +91</span>
                      <input {...register("phone")} placeholder="Mobile Number *" type="tel" data-testid="input-phone" className="flex-1 border border-gray-200 rounded-r-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white min-w-0" />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <input {...register("email")} placeholder="Email Address (optional)" type="email" data-testid="input-email" className={inputBase} />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <select {...register("grade")} data-testid="select-grade" className={inputBase + " appearance-none"}>
                    <option value="">Select Grade *</option>
                    {classOptions.map((cls) => <option key={cls} value={cls}>{cls}</option>)}
                  </select>
                  {errors.grade && <p className="text-red-500 text-xs mt-1">{errors.grade.message}</p>}
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "#f8faff" }}>
                  <input
                    type="checkbox"
                    id="consent"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded flex-shrink-0"
                    data-testid="checkbox-consent"
                  />
                  <label htmlFor="consent" className="text-gray-500 text-xs leading-relaxed cursor-pointer">
                    I authorize Rainbow International School and its representatives to contact me with updates via Email, SMS, WhatsApp and Call. This will override DND/NDNC registry.*
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="button-submit-inquiry"
                  className="w-full inline-flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl text-white text-sm transition-all hover:opacity-90 hover:shadow-lg active:scale-[0.99] disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #0d3b86 0%, #1565c0 100%)" }}
                >
                  <Send size={15} />
                  {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                </button>

                <div className="flex items-center gap-2 justify-center">
                  <ShieldCheck size={13} className="text-green-500 flex-shrink-0" />
                  <p className="text-[11px] text-gray-400">Your information is safe and will not be shared with third parties.</p>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:w-72 flex-shrink-0 space-y-3 w-full">
            {contactCards.map((card, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: card.bg }}
                >
                  <card.icon size={18} style={{ color: card.accent }} />
                </div>
                <div>
                  <p className="font-black text-gray-900 text-sm mb-1">{card.label}</p>
                  {card.lines.map((line, j) => (
                    <p key={j} className="text-gray-500 text-xs leading-relaxed">{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
