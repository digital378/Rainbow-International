import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInquirySchema, type InsertInquiry } from "@shared/schema";
import { toast } from "sonner";
import { Send } from "lucide-react";

const classOptions = [
  "Nursery", "Jr. KG", "Sr. KG",
  "Class I", "Class II", "Class III", "Class IV", "Class V",
  "Class VI", "Class VII", "Class VIII",
  "Class IX", "Class X", "Class XI", "Class XII",
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
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit inquiry");
      }
      toast.success("Thank you! Our Admission Counsellor will connect with you shortly.");
      reset();
      setAgreed(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit inquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full bg-white/15 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all duration-200";

  return (
    <section id="contact" className="relative py-20 overflow-hidden" style={{ background: "linear-gradient(135deg, #e65100 0%, #f57c00 50%, #fb8c00 100%)" }}>
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, white, transparent)", transform: "translate(30%, -30%)" }} />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, white, transparent)", transform: "translate(-30%, 30%)" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-block text-xs font-bold tracking-widest uppercase mb-3 px-4 py-1.5 rounded-full bg-white/20 text-white">
              Admissions Open
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-3">Send Inquiries</h2>
            <p className="text-orange-100 text-sm leading-relaxed max-w-lg mx-auto">
              Thank You for Contacting Rainbow International School. Kindly fill the Inquiry form to enroll your child at Best International School in Thane. Once received, Our Admission Counsellor will connect with you shortly. Thank you!
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <input {...register("parentName")} placeholder="Enter Parent Name*" data-testid="input-parent-name" className={inputClass} />
                {errors.parentName && <p className="text-yellow-200 text-xs mt-1">{errors.parentName.message}</p>}
              </div>
              <div>
                <input {...register("studentName")} placeholder="Enter Student Name*" data-testid="input-student-name" className={inputClass} />
                {errors.studentName && <p className="text-yellow-200 text-xs mt-1">{errors.studentName.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-white/30 rounded-l-xl bg-white/20 text-white text-sm">🇮🇳 +91</span>
                  <input {...register("phone")} placeholder="Enter Mobile No.*" type="tel" data-testid="input-phone" className="flex-1 bg-white/15 border border-white/30 rounded-r-xl px-4 py-3 text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all" />
                </div>
                {errors.phone && <p className="text-yellow-200 text-xs mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <input {...register("email")} placeholder="Enter Email Id*" type="email" data-testid="input-email" className={inputClass} />
                {errors.email && <p className="text-yellow-200 text-xs mt-1">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <select {...register("grade")} data-testid="select-grade" className={inputClass + " appearance-none"} style={{ color: "white" }}>
                <option value="" style={{ color: "#333" }}>Select Grade*</option>
                {classOptions.map((cls) => (
                  <option key={cls} value={cls} style={{ color: "#333" }}>{cls}</option>
                ))}
              </select>
              {errors.grade && <p className="text-yellow-200 text-xs mt-1">{errors.grade.message}</p>}
            </div>

            <div className="flex items-start gap-3 pt-1">
              <input type="checkbox" id="consent" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 w-4 h-4 rounded" data-testid="checkbox-consent" />
              <label htmlFor="consent" className="text-white/80 text-xs leading-relaxed">
                I authorize 'Rainbow International School' and its representatives to contact me with updates/notifications via Email, SMS, WhatsApp and Call. This will override the registry on DND/NDNC.*
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                data-testid="button-submit-inquiry"
                className="inline-flex items-center gap-2 font-bold px-8 py-3 rounded-full bg-white text-orange-600 text-sm hover:bg-orange-50 transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-60"
              >
                <Send size={16} />
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
