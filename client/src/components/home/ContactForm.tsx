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

const timeSlots = [
  "9:00AM – 11:00AM",
  "11:00AM – 1:00PM",
  "1:00PM – 3:00PM",
  "3:00PM – 5:00PM",
  "5:00PM – 6:00PM",
];

const sourceOptions = [
  "Reference (Family, Friends, Siblings)",
  "Google Search",
  "Social Media (Facebook / Instagram)",
  "School Banner / Hoarding",
  "Newspaper / Magazine",
  "Other",
];

const contactCards = [
  {
    icon: Phone,
    label: "Call Us",
    lines: ["(022) 69105000", "+91 82915 68972"],
    href: "tel:02269105000",
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
    lines: ["Cosmos Arcade, Brahmand Phase 4", "Thane West, Maharashtra"],
    href: "https://maps.google.com/?q=Rainbow+International+School+Thane",
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

  const inputBase = "w-full border-0 rounded-full px-5 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/60 transition-all bg-white";
  const selectBase = inputBase + " appearance-none";

  return (
    <section id="contact" className="py-0">
      <div
        className="w-full px-4 py-16"
        style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
      >
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Send Inquiries</h2>
            <p className="text-white/90 text-sm leading-relaxed max-w-xl mx-auto">
              <strong>Thank You for Contacting Rainbow International School.</strong> Kindly fill the inquiry form to enrol your child. Once received, our Admission Counsellor will connect with you shortly.
            </p>
          </div>

          {/* Form */}
          <div className="rounded-3xl p-8" style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(4px)" }}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-xs font-bold mb-1.5 ml-1">Parent's Name</label>
                  <input {...register("parentName")} placeholder="Parent's Name" data-testid="input-parent-name" className={inputBase} />
                  {errors.parentName && <p className="text-white/80 text-xs mt-1 ml-1">{errors.parentName.message}</p>}
                </div>
                <div>
                  <label className="block text-white text-xs font-bold mb-1.5 ml-1">Child's Name</label>
                  <input {...register("studentName")} placeholder="Child's Name" data-testid="input-student-name" className={inputBase} />
                  {errors.studentName && <p className="text-white/80 text-xs mt-1 ml-1">{errors.studentName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-xs font-bold mb-1.5 ml-1">Phone Number</label>
                  <input {...register("phone")} placeholder="Phone Number" type="tel" data-testid="input-phone" className={inputBase} />
                  {errors.phone && <p className="text-white/80 text-xs mt-1 ml-1">{errors.phone.message}</p>}
                </div>
                <div>
                  <label className="block text-white text-xs font-bold mb-1.5 ml-1">Email</label>
                  <input {...register("email")} placeholder="Email (optional)" type="email" data-testid="input-email" className={inputBase} />
                  {errors.email && <p className="text-white/80 text-xs mt-1 ml-1">{errors.email.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-xs font-bold mb-1.5 ml-1">Preferred time to connect with you</label>
                  <select {...register("preferredTime")} data-testid="select-time" className={selectBase}>
                    <option value="">Select Time Slot</option>
                    {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-white text-xs font-bold mb-1.5 ml-1">Select Class</label>
                  <select {...register("grade")} data-testid="select-grade" className={selectBase}>
                    <option value="">Select Class *</option>
                    {classOptions.map((cls) => <option key={cls} value={cls}>{cls}</option>)}
                  </select>
                  {errors.grade && <p className="text-white/80 text-xs mt-1 ml-1">{errors.grade.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-white text-xs font-bold mb-1.5 ml-1">How did you hear about us?</label>
                <select {...register("source")} data-testid="select-source" className={selectBase}>
                  <option value="">Select an option</option>
                  {sourceOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-white text-xs font-bold mb-1.5 ml-1">Message</label>
                <textarea
                  {...register("message")}
                  placeholder="Message (optional)"
                  rows={3}
                  data-testid="textarea-message"
                  className="w-full border-0 rounded-2xl px-5 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/60 transition-all bg-white resize-none"
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded flex-shrink-0 accent-white"
                  data-testid="checkbox-consent"
                />
                <label htmlFor="consent" className="text-white/80 text-xs leading-relaxed cursor-pointer">
                  I authorize Rainbow International School and its representatives to contact me with updates via Email, SMS, WhatsApp and Call. This will override DND/NDNC registry.
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                data-testid="button-submit-inquiry"
                className="w-full font-black py-3.5 rounded-full text-orange-600 bg-white text-sm transition-all hover:bg-orange-50 active:scale-[0.99] disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Send"}
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Contact info bar */}
      <div style={{ background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)" }}>
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {contactCards.map((card, i) => {
              const Icon = card.icon;
              const content = (
                <div
                  className="rounded-2xl p-6 flex flex-col items-center text-center gap-3 hover:bg-white/10 transition-colors h-full"
                  style={{ background: "rgba(255,255,255,0.12)" }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.25)" }}
                  >
                    <Icon size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-extrabold text-white text-sm mb-2">{card.label}</p>
                    {card.lines.map((line, j) => (
                      <p key={j} className="text-white/90 text-xs leading-relaxed">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              );
              return card.href ? (
                <a key={i} href={card.href} target="_blank" rel="noopener noreferrer" className="block h-full">
                  {content}
                </a>
              ) : (
                <div key={i} className="h-full">{content}</div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
