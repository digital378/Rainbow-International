import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInquirySchema, type InsertInquiry } from "@shared/schema";
import { toast } from "sonner";
import { Send, MapPin, Phone, Mail, Clock } from "lucide-react";

const classOptions = [
  "Nursery", "Jr. KG", "Sr. KG",
  "Class I", "Class II", "Class III", "Class IV", "Class V",
  "Class VI", "Class VII", "Class VIII",
  "Class IX", "Class X", "Class XI", "Class XII",
];

const contactInfo = [
  { icon: Phone, label: "Call Us", value: "(022) 69105000\n+91 82915 68972" },
  { icon: Mail, label: "Email Us", value: "admin@rainbowinternationalschool.in\ncustomersupport@rainbowinternationalschool.in" },
  { icon: Clock, label: "Working Hours", value: "Mon – Sat\n9:00 AM – 6:00 PM" },
  { icon: MapPin, label: "Address", value: "Cosmos Arcade, Brahmand Phase 4,\nThane West, Maharashtra" },
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
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-blue-400 transition-all bg-white";

  return (
    <section id="contact" className="py-20" style={{ background: "#f8faff" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-4 px-4 py-1.5 rounded-full" style={{ background: "#e8f4fb", color: "#0d3b86" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#0d3b86" }} />
            Get In Touch
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">Send Inquiries</h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
            Thank You for Contacting Rainbow International School. Kindly fill the Inquiry form to enroll your child at Best International School in Thane. Once received, Our Admission Counsellor will connect with you shortly. Thank you!
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 max-w-5xl mx-auto">
          <div className="flex-1">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input {...register("parentName")} placeholder="Enter Parent Name*" data-testid="input-parent-name" className={inputClass} />
                  {errors.parentName && <p className="text-red-500 text-xs mt-1">{errors.parentName.message}</p>}
                </div>
                <div>
                  <input {...register("studentName")} placeholder="Enter Student Name*" data-testid="input-student-name" className={inputClass} />
                  {errors.studentName && <p className="text-red-500 text-xs mt-1">{errors.studentName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex">
                    <span className="inline-flex items-center px-3.5 border border-r-0 border-gray-200 rounded-l-xl bg-gray-50 text-gray-500 text-sm font-medium">🇮🇳 +91</span>
                    <input {...register("phone")} placeholder="Mobile No.*" type="tel" data-testid="input-phone" className="flex-1 border border-gray-200 rounded-r-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all bg-white" />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
                <div>
                  <input {...register("email")} placeholder="Enter Email Id*" type="email" data-testid="input-email" className={inputClass} />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <select {...register("grade")} data-testid="select-grade" className={inputClass + " appearance-none"}>
                  <option value="">Select Grade*</option>
                  {classOptions.map((cls) => <option key={cls} value={cls}>{cls}</option>)}
                </select>
                {errors.grade && <p className="text-red-500 text-xs mt-1">{errors.grade.message}</p>}
              </div>

              <div className="flex items-start gap-3">
                <input type="checkbox" id="consent" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 w-4 h-4 rounded" data-testid="checkbox-consent" />
                <label htmlFor="consent" className="text-gray-500 text-xs leading-relaxed">
                  I authorize 'Rainbow International School' and its representatives to contact me with updates/notifications via Email, SMS, WhatsApp and Call. This will override the registry on DND/NDNC.*
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                data-testid="button-submit-inquiry"
                className="w-full inline-flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl text-white text-sm transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #0d3b86, #1565c0)" }}
              >
                <Send size={16} />
                {isSubmitting ? "Submitting..." : "Request Callback"}
              </button>
            </form>
          </div>

          <div className="lg:w-72 flex-shrink-0 space-y-4">
            {contactInfo.map((info, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#e8f4fb" }}>
                  <info.icon size={18} style={{ color: "#0d3b86" }} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm mb-0.5">{info.label}</p>
                  {info.value.split("\n").map((line, j) => (
                    <p key={j} className="text-gray-500 text-xs">{line}</p>
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
