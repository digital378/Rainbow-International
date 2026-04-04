import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInquirySchema, type InsertInquiry } from "@shared/schema";
import { toast } from "sonner";
import { PhoneCall, ChevronRight, CheckCircle2, CheckCircle } from "lucide-react";
import { trackFormSubmit, getFormTrackingData, trackWhatsAppClick } from "@/lib/analytics";

const classOptions = [
  "Nursery", "Jr. KG", "Sr. KG",
  "Class I", "Class II", "Class III", "Class IV", "Class V",
  "Class VI", "Class VII", "Class VIII",
  "Class IX", "Class X", "Class XI", "Class XII",
];

export function HeroForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InsertInquiry>({
    resolver: zodResolver(insertInquirySchema),
  });

  const onSubmit = async (data: InsertInquiry) => {
    setIsSubmitting(true);
    try {
      const trackingData = getFormTrackingData("Hero Quick Enquiry");
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...trackingData }),
      });
      if (!res.ok) throw new Error();
      trackFormSubmit({
        formType: "hero_inquiry",
        parentName: data.parentName,
        studentName: data.studentName,
        phone: data.phone,
        grade: data.grade,
        isHeroForm: true,
      });
      setSubmitted(true);
      reset();
      setConfirmed(false);
    } catch {
      toast.error("Could not submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
      <div className="px-7 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <PhoneCall size={16} className="text-white" />
          </div>
          <div>
            <p className="font-extrabold text-gray-900 text-[15px] leading-tight">Quick Admission Enquiry</p>
            <p className="text-gray-400 text-xs">Our counsellor will call you back</p>
          </div>
        </div>
      </div>

      <div className="px-7 pb-6">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-[260px]">We've received your request and will contact you within 24 hours.</p>
            <button
              onClick={() => setSubmitted(false)}
              data-testid="button-hero-another-request"
              className="px-6 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Submit Another Request
            </button>
          </div>
        ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          {[
            { name: "parentName", placeholder: "Parent Name *", type: "text", id: "input-hero-parent", label: "Parent Name" },
            { name: "phone", placeholder: "Phone Number *", type: "tel", id: "input-hero-phone", label: "Phone Number" },
            { name: "studentName", placeholder: "Child's Name *", type: "text", id: "input-hero-child", label: "Child's Name" },
            { name: "email", placeholder: "Email Address (optional)", type: "email", id: "input-hero-email", label: "Email Address" },
          ].map((f) => (
            <div key={f.name}>
              <label htmlFor={f.id} className="sr-only">{f.label}</label>
              <input
                {...register(f.name as keyof InsertInquiry)}
                id={f.id}
                placeholder={f.placeholder}
                type={f.type}
                data-testid={f.id}
                className={`w-full border rounded-xl px-4 py-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white ${errors[f.name as keyof InsertInquiry] ? "border-red-400" : "border-gray-200"}`}
              />
              {errors[f.name as keyof InsertInquiry] && <p className="text-red-500 text-[11px] mt-1 ml-1">{errors[f.name as keyof InsertInquiry]?.message}</p>}
            </div>
          ))}

          <div>
            <label htmlFor="hero-grade" className="sr-only">Select Class</label>
            <select
              {...register("grade")}
              id="hero-grade"
              data-testid="select-hero-grade"
              aria-label="Select Class"
              className={`w-full border rounded-xl px-4 py-3.5 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white appearance-none ${errors.grade ? "border-red-400" : "border-gray-200"}`}
            >
              <option value="">Select Class *</option>
              {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.grade && <p className="text-red-500 text-[11px] mt-1 ml-1">{errors.grade.message}</p>}
          </div>

          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              id="hero-confirm"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 flex-shrink-0 accent-blue-600"
              data-testid="checkbox-hero-confirm"
            />
            <label htmlFor="hero-confirm" className="text-gray-500 text-[11px] leading-relaxed cursor-pointer">
              I confirm the details above are correct
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !confirmed}
            data-testid="button-hero-submit"
            className="w-full py-4 font-bold text-white text-sm rounded-xl transition-all hover:opacity-90 hover:shadow-lg active:scale-[0.99] disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #091a4f 0%, #1a56db 100%)" }}
          >
            {isSubmitting ? "Submitting..." : "Get a Free Callback"}
          </button>

          <a
            href="https://wa.me/918291568972?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20admissions."
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick()}
            data-testid="button-hero-whatsapp"
            className="w-full py-3.5 font-bold text-white text-sm rounded-xl transition-all hover:opacity-90 hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
            style={{ background: "#25D366" }}
          >
            <svg viewBox="0 0 32 32" width="18" height="18" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.504 1.128 6.752 3.052 9.388L1.056 30.74l5.516-1.972A15.903 15.903 0 0 0 16.004 32C24.828 32 32 24.824 32 16S24.828 0 16.004 0zm9.22 22.596c-.38 1.072-1.888 1.964-3.096 2.224-.824.176-1.9.316-5.52-1.188-4.628-1.916-7.608-6.616-7.84-6.924-.224-.308-1.88-2.504-1.88-4.776 0-2.272 1.188-3.38 1.608-3.808.38-.388.824-.56 1.1-.56.276 0 .548.004.788.016.252.012.59-.096.924.704.348.82 1.18 2.896 1.284 3.108.104.212.172.46.032.744-.14.284-.208.46-.416.708-.208.248-.436.556-.624.748-.208.208-.424.432-.184.848.24.416 1.068 1.76 2.292 2.852 1.576 1.404 2.904 1.836 3.316 2.044.412.208.648.176.888-.104.24-.28 1.028-1.2 1.3-1.612.272-.412.548-.344.924-.208.376.136 2.392 1.128 2.8 1.336.412.208.684.308.784.48.1.172.1.992-.28 2.068z"/>
            </svg>
            Chat on WhatsApp
          </a>

          <div className="flex items-center justify-center gap-1.5 pt-1">
            <CheckCircle2 size={13} className="text-green-500" />
            <p className="text-[11px] text-gray-400">No spam · One call only · Completely free</p>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
