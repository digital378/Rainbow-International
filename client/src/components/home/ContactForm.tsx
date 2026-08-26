import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInquirySchema, type InsertInquiry } from "@shared/schema";
import { toast } from "sonner";
import { Send, MapPin, Phone, Mail, Clock, CheckCircle } from "lucide-react";
import { trackFormSubmit, trackCallClick, trackDirectionsClick, getFormTrackingData } from "@/lib/analytics";
import { submitInquiry } from "@/lib/inquiryProtection";

const classOptions = [
  "Nursery", "Jr. KG", "Sr. KG",
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8",
  "Class 9", "Class 10",
  "Class 11 – Science", "Class 11 – Commerce", "Class 11 – Humanities",
  "Class 12 – Science", "Class 12 – Commerce", "Class 12 – Humanities",
];

const contactCards = [
  {
    icon: Phone,
    label: "Call Us",
    lines: ["+91 82915 68972"],
    href: "tel:+918291568972",
  },
  {
    icon: Mail,
    label: "Email Us",
    lines: ["admin@rainbow", "internationalschool.in"],
    href: "mailto:admin@rainbowinternationalschool.in",
  },
  {
    icon: Clock,
    label: "Working Hours",
    lines: ["Monday – Saturday", "9:00 AM – 6:00 PM"],
    href: null,
  },
  {
    icon: MapPin,
    label: "Our Address",
    lines: ["Cosmos Arcade, Brahmand Phase 4", "Thane, Maharashtra"],
    href: "https://maps.google.com/?q=Rainbow+International+School+Thane",
  },
];

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [website, setWebsite] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InsertInquiry>({
    resolver: zodResolver(insertInquirySchema),
  });

  const onSubmit = async (data: InsertInquiry) => {
    setIsSubmitting(true);
    try {
      const trackingData = getFormTrackingData("Contact Section Form");
      const response = await submitInquiry({ ...data, ...trackingData, website });
      if (!response.ok) throw new Error("Failed");
      trackFormSubmit({
        formType: "inquiry",
        parentName: data.parentName,
        studentName: data.studentName,
        phone: data.phone,
        grade: data.grade,
      });
      setSubmitted(true);
      reset();
      setAgreed(false);
      setWebsite("");
    } catch {
      toast.error("Submission failed. Please try again or call us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase = "w-full border border-white/20 rounded-xl px-5 py-3 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all bg-white/10 backdrop-blur-sm";

  return (
    <section id="contact" className="py-0">
      <div
        className="w-full px-4 py-16"
        style={{ background: "linear-gradient(135deg, #091a4f 0%, #0d3b86 60%, #091a4f 100%)" }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-block mb-4">
              <span className="text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase">Visit Us</span>
              <div className="w-8 h-0.5 bg-amber-400 mx-auto mt-2" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">Book a Campus Tour</h2>
            <p className="text-blue-200/80 text-sm leading-relaxed max-w-xl mx-auto">
              <strong className="text-white">We'd love to welcome you to Rainbow International School!</strong> Please call us at <a href="tel:+918291568972" className="text-amber-400 font-semibold hover:underline">+91 82915 68972</a> to schedule your visit before arriving on campus. Alternatively, fill the form below and our Admission Counsellor will connect with you to arrange a tour.
            </p>
          </div>

          <div className="p-8 border border-white/10 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)" }}>
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center mb-5">
                  <CheckCircle size={40} className="text-green-400" />
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-2">Thank You!</h3>
                <p className="text-blue-200/80 text-sm mb-8 max-w-sm">We've received your request and will contact you within 24 hours.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  data-testid="button-contact-another-request"
                  className="px-7 py-2.5 text-sm font-semibold border border-white/20 rounded-full text-white hover:bg-white/10 transition-colors"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input
                name="website"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[10000px] h-px w-px opacity-0"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-amber-300 text-xs font-semibold mb-1.5 ml-1">Parent's Name</label>
                  <input {...register("parentName")} placeholder="Parent's Name" data-testid="input-parent-name" className={inputBase} />
                  {errors.parentName && <p className="text-amber-200/80 text-xs mt-1 ml-1">{errors.parentName.message}</p>}
                </div>
                <div>
                  <label className="block text-amber-300 text-xs font-semibold mb-1.5 ml-1">Child's Name</label>
                  <input {...register("studentName")} placeholder="Child's Name" data-testid="input-student-name" className={inputBase} />
                  {errors.studentName && <p className="text-amber-200/80 text-xs mt-1 ml-1">{errors.studentName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-amber-300 text-xs font-semibold mb-1.5 ml-1">Phone Number</label>
                  <input {...register("phone")} placeholder="10-digit mobile number" type="tel" inputMode="numeric" maxLength={10} onInput={e => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 10); }} data-testid="input-phone" className={inputBase} />
                  {errors.phone && <p className="text-amber-200/80 text-xs mt-1 ml-1">{errors.phone.message}</p>}
                </div>
                <div>
                  <label className="block text-amber-300 text-xs font-semibold mb-1.5 ml-1">Email</label>
                  <input {...register("email")} placeholder="Email (optional)" type="email" data-testid="input-email" className={inputBase} />
                  {errors.email && <p className="text-amber-200/80 text-xs mt-1 ml-1">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-amber-300 text-xs font-semibold mb-1.5 ml-1">Select Class</label>
                <select {...register("grade")} data-testid="select-grade" className={inputBase + " appearance-none"}>
                  <option value="">Select Class *</option>
                  {classOptions.map((cls) => <option key={cls} value={cls} className="text-gray-800">{cls}</option>)}
                </select>
                {errors.grade && <p className="text-amber-200/80 text-xs mt-1 ml-1">{errors.grade.message}</p>}
              </div>

              <div>
                <label className="block text-amber-300 text-xs font-semibold mb-1.5 ml-1">Message</label>
                <textarea
                  {...register("message")}
                  placeholder="Message (optional)"
                  rows={3}
                  data-testid="textarea-message"
                  className="w-full border border-white/20 rounded-xl px-5 py-3 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all bg-white/10 backdrop-blur-sm resize-none"
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 flex-shrink-0 accent-amber-400"
                  data-testid="checkbox-consent"
                />
                <label htmlFor="consent" className="text-blue-200/70 text-xs leading-relaxed cursor-pointer">
                  I confirm the details above are correct and authorize Rainbow International School and its representatives to contact me with updates via Email, SMS, WhatsApp and Call. This will override DND/NDNC registry.
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !agreed}
                data-testid="button-submit-inquiry"
                className="w-full font-bold py-3.5 text-[#091a4f] text-sm transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", borderRadius: "9999px" }}
              >
                {isSubmitting ? "Submitting..." : "Send Enquiry"}
              </button>
            </form>
            )}
          </div>

        </div>
      </div>

      <div style={{ background: "#071640" }}>
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {contactCards.map((card, i) => {
              const Icon = card.icon;
              const content = (
                <div
                  className="p-6 flex flex-col items-center text-center gap-3 hover:bg-white/5 transition-colors h-full"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px" }}
                >
                  <div
                    className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(251,191,36,0.15)", borderRadius: "12px" }}
                  >
                    <Icon size={20} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm mb-2">{card.label}</p>
                    {card.lines.map((line, j) => (
                      <p key={j} className="text-blue-200/70 text-xs leading-relaxed">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              );
              return card.href ? (
                <a
                  key={i}
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full"
                  data-testid={`link-contact-${card.label.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => {
                    if (card.href?.startsWith("tel:")) trackCallClick({ phone: card.lines[0] });
                    if (card.href?.includes("maps.google")) trackDirectionsClick();
                  }}
                >
                  {content}
                </a>
              ) : (
                <div key={i} className="h-full" data-testid={`info-contact-${card.label.toLowerCase().replace(/\s+/g, "-")}`}>{content}</div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
