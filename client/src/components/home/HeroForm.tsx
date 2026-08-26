import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInquirySchema, type InsertInquiry } from "@shared/schema";
import { toast } from "sonner";
import { CalendarCheck, ChevronRight, CheckCircle, MessageCircle } from "lucide-react";
import { trackFormSubmit, getFormTrackingData, trackWhatsAppClick } from "@/lib/analytics";
import { submitInquiry } from "@/lib/inquiryProtection";

const classOptions = [
  "Nursery", "Jr. KG", "Sr. KG",
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8",
  "Class 9", "Class 10",
  "Class 11 – Science", "Class 11 – Commerce", "Class 11 – Humanities",
  "Class 12 – Science", "Class 12 – Commerce", "Class 12 – Humanities",
];

export function HeroForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [location, setLocation] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [website, setWebsite] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InsertInquiry>({
    resolver: zodResolver(insertInquirySchema),
  });

  const onSubmit = async (data: InsertInquiry) => {
    setIsSubmitting(true);
    try {
      const trackingData = getFormTrackingData("Hero Quick Enquiry");
      const messageParts = [
        location && `Location: ${location}`,
        preferredDate && `Preferred Visit: ${preferredDate}`,
      ].filter(Boolean).join(" | ");

      const res = await submitInquiry({
          ...data,
          message: messageParts || undefined,
          ...trackingData,
          website,
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
      setLocation("");
      setPreferredDate("");
      setWebsite("");
    } catch {
      toast.error("Could not submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inp = (hasError: boolean) =>
    `w-full border rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white ${hasError ? "border-red-400" : "border-gray-200"}`;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#0d3b86" }}>
            <CalendarCheck size={17} className="text-white" />
          </div>
          <div>
            <p className="font-extrabold text-gray-900 text-[15px] leading-tight">Quick Admission Enquiry</p>
            <p className="text-gray-400 text-xs">Our admissions counsellor will call you shortly.</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-5">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-[260px]">Our admissions counsellor will contact you shortly to guide you through the next step.</p>
            <button
              onClick={() => setSubmitted(false)}
              data-testid="button-hero-another-request"
              className="px-6 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <input
              name="website"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[10000px] h-px w-px opacity-0"
            />
            {/* Parent Name + Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="hero-parent" className="sr-only">Parent Name</label>
                <input {...register("parentName")} id="hero-parent" placeholder="Parent Name *" type="text" data-testid="input-hero-parent" className={inp(!!errors.parentName)} />
                {errors.parentName && <p className="text-red-500 text-[11px] mt-1 ml-1">{errors.parentName.message}</p>}
              </div>
              <div>
                <label htmlFor="hero-phone" className="sr-only">Phone Number</label>
                <input {...register("phone")} id="hero-phone" placeholder="10-digit mobile number *" type="tel" inputMode="numeric" maxLength={10} onInput={e => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 10); }} data-testid="input-hero-phone" className={inp(!!errors.phone)} />
                {errors.phone && <p className="text-red-500 text-[11px] mt-1 ml-1">{errors.phone.message}</p>}
              </div>
            </div>

            {/* Child Name */}
            <div>
              <label htmlFor="hero-child" className="sr-only">Child's Name</label>
              <input {...register("studentName")} id="hero-child" placeholder="Child's Name *" type="text" data-testid="input-hero-child" className={inp(!!errors.studentName)} />
              {errors.studentName && <p className="text-red-500 text-[11px] mt-1 ml-1">{errors.studentName.message}</p>}
            </div>

            {/* Grade */}
            <div>
              <label htmlFor="hero-grade" className="sr-only">Grade Applying For</label>
              <select {...register("grade")} id="hero-grade" data-testid="select-hero-grade" aria-label="Grade Applying For" className={inp(!!errors.grade) + " appearance-none"}>
                <option value="">Grade Applying For *</option>
                {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.grade && <p className="text-red-500 text-[11px] mt-1 ml-1">{errors.grade.message}</p>}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="hero-location" className="sr-only">Your Area / Location</label>
              <input
                id="hero-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Your Area / Location (optional)"
                type="text"
                data-testid="input-hero-location"
                className={inp(false)}
              />
            </div>

            {/* Preferred Visit Date */}
            <div>
              <label htmlFor="hero-date" className="sr-only">Preferred Campus Visit Date</label>
              <input
                id="hero-date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                type="date"
                data-testid="input-hero-date"
                className={inp(false)}
              />
            </div>

            {/* Email (optional) */}
            <div>
              <label htmlFor="hero-email" className="sr-only">Email Address</label>
              <input {...register("email")} id="hero-email" placeholder="Email Address (optional)" type="email" data-testid="input-hero-email" className={inp(!!errors.email)} />
              {errors.email && <p className="text-red-500 text-[11px] mt-1 ml-1">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              data-testid="button-hero-submit"
              className="w-full py-3.5 font-bold text-white text-sm rounded-xl transition-all hover:opacity-90 hover:shadow-lg active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #091a4f 0%, #1a56db 100%)" }}
            >
              <CalendarCheck size={16} />
              {isSubmitting ? "Submitting…" : "Book a Campus Visit"}
            </button>

            <a
              href="https://wa.me/918291568972?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20admissions%20at%20Rainbow%20International%20School."
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick()}
              data-testid="button-hero-whatsapp"
              className="w-full py-3 font-bold text-white text-sm rounded-xl transition-all hover:opacity-90 hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #128c4b 0%, #25D366 100%)" }}
            >
              <MessageCircle size={17} />
              Chat on WhatsApp
            </a>

            <p className="text-center text-[11px] text-gray-400 pt-1">Mon–Sat · 9 AM–6 PM · No entrance test for Nursery–Class 8</p>
          </form>
        )}
      </div>
    </div>
  );
}
