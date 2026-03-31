import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInquirySchema, type InsertInquiry } from "@shared/schema";
import { toast } from "sonner";

const classOptions = [
  "Nursery", "Jr. KG", "Sr. KG",
  "Class I", "Class II", "Class III", "Class IV", "Class V",
  "Class VI", "Class VII", "Class VIII",
  "Class IX", "Class X", "Class XI", "Class XII",
];

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InsertInquiry>({
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

  return (
    <section id="contact" style={{ background: "linear-gradient(135deg, #f7903a 0%, #e8641e 100%)" }} className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Send Inquiries</h2>
            <p className="text-white/90 text-sm leading-relaxed">
              Thank You for Contacting Rainbow International School. Kindly fill the Inquiry form to enroll your child at Best International School in Thane. Once received, Our Admission Counsellor will connect with you shortly. Thank you!
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <input
                  {...register("parentName")}
                  placeholder="Enter Parent Name*"
                  data-testid="input-parent-name"
                  className="w-full border border-orange-300 rounded px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white bg-white"
                />
                {errors.parentName && (
                  <p className="text-white text-xs mt-1">{errors.parentName.message}</p>
                )}
              </div>
              <div>
                <input
                  {...register("studentName")}
                  placeholder="Enter Student Name*"
                  data-testid="input-student-name"
                  className="w-full border border-orange-300 rounded px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white bg-white"
                />
                {errors.studentName && (
                  <p className="text-white text-xs mt-1">{errors.studentName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-orange-300 rounded-l bg-gray-50 text-gray-500 text-sm">
                    🇮🇳 +91
                  </span>
                  <input
                    {...register("phone")}
                    placeholder="Enter Mobile No.*"
                    type="tel"
                    data-testid="input-phone"
                    className="flex-1 border border-orange-300 rounded-r px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white bg-white"
                  />
                </div>
                {errors.phone && (
                  <p className="text-white text-xs mt-1">{errors.phone.message}</p>
                )}
              </div>
              <div>
                <input
                  {...register("email")}
                  placeholder="Enter Email Id*"
                  type="email"
                  data-testid="input-email"
                  className="w-full border border-orange-300 rounded px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white bg-white"
                />
                {errors.email && (
                  <p className="text-white text-xs mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <select
                {...register("grade")}
                data-testid="select-grade"
                className="w-full border border-orange-300 rounded px-4 py-3 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-white bg-white"
              >
                <option value="">Select Grade*</option>
                {classOptions.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              {errors.grade && (
                <p className="text-white text-xs mt-1">{errors.grade.message}</p>
              )}
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="consent"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 accent-white"
                data-testid="checkbox-consent"
              />
              <label htmlFor="consent" className="text-white text-xs leading-relaxed">
                I authorize 'Rainbow International School' and its representatives to contact me with updates/notifications via Email, SMS, WhatsApp and Call. This will override the registry on DND/NDNC.*
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                data-testid="button-submit-inquiry"
                className="bg-white text-orange-500 font-bold px-8 py-2 rounded text-sm hover:bg-orange-50 transition-colors disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
