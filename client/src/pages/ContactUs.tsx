import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInquirySchema, type InsertInquiry } from "@shared/schema";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { MapPin, Phone, Mail, Clock, CheckCircle, MessageCircle } from "lucide-react";
import ScrollProgress from "@/components/home/ScrollProgress";
import { trackFormSubmit, trackCallClick, trackDirectionsClick, getFormTrackingData } from "@/lib/analytics";

const classOptions = [
  "Nursery", "Jr. KG", "Sr. KG",
  "Class I", "Class II", "Class III", "Class IV", "Class V",
  "Class VI", "Class VII", "Class VIII",
  "Class IX", "Class X", "Class XI", "Class XII",
];

const contactItems = [
  {
    icon: Phone,
    label: "Phone",
    lines: ["+91 82915 68972"],
    href: "tel:+918291568972",
  },
  {
    icon: Mail,
    label: "Email",
    lines: ["info@rainbowinternationalschool.in"],
    href: "mailto:info@rainbowinternationalschool.in",
  },
  {
    icon: Clock,
    label: "Working Hours",
    lines: ["Monday - Saturday", "9AM - 6PM"],
    href: null as string | null,
  },
  {
    icon: MapPin,
    label: "Locations",
    lines: ["Cosmos Arcade, Brahmand Phase 4", "Thane, Maharashtra"],
    href: "https://maps.google.com/?q=Rainbow+International+School+Thane",
  },
];

export default function ContactUs() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InsertInquiry>({
    resolver: zodResolver(insertInquirySchema),
  });

  const onSubmit = async (data: InsertInquiry) => {
    setIsSubmitting(true);
    try {
      const trackingData = getFormTrackingData("Contact Page Form");
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...trackingData }),
      });
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
    } catch {
      toast.error("Submission failed. Please try again or call us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase = "w-full border border-white/20 rounded-xl px-5 py-3 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all bg-white/10 backdrop-blur-sm";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Contact Us"
        description="Connect with Rainbow International School, Thane. Call +91 82915 68972, email info@rainbowinternationalschool.in. Admissions open for Nursery to Class 12."
        keywords="contact Rainbow International School, Rainbow school Thane phone number, Rainbow school admission contact, school address Thane"
        canonical="https://rainbowinternationalschool.in/contact-us"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "Contact Us", href: "https://rainbowinternationalschool.in/contact-us" },
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Contact Rainbow International School",
          "description": "Contact Rainbow International School, Thane — for admissions enquiries, call +91 82915 68972 or email info@rainbowinternationalschool.in.",
          "url": "https://rainbowinternationalschool.in/contact-us",
          "mainEntity": {
            "@type": "EducationalOrganization",
            "name": "Rainbow International School",
            "telephone": ["+912269105000", "+918291568972"],
            "email": "info@rainbowinternationalschool.in",
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
              "opens": "09:00",
              "closes": "18:00"
            },
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Cosmos Arcade, Brahmand Phase 4",
              "addressLocality": "Thane",
              "addressRegion": "Maharashtra",
              "postalCode": "400607",
              "addressCountry": "IN"
            }
          }
        }}
      />
      <Navbar />
      <PageBanner
        title="Connect with Us"
        subtitle="Do you have a Question? Feel free to reach out — we'd be glad to solve your queries."
        breadcrumb={[{ label: "Contact Us" }]}
      />

      <main className="flex-grow">
        <section
          className="py-16 md:py-20"
          style={{ background: "linear-gradient(135deg, #091a4f 0%, #0d3b86 60%, #091a4f 100%)" }}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-block mb-4">
                <span className="text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase">Visit Us</span>
                <div className="w-8 h-0.5 bg-amber-400 mx-auto mt-2" />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Book a Campus Tour
              </h2>
              <p className="text-blue-200/80 text-sm leading-relaxed max-w-xl mx-auto">
                <strong className="text-white">We'd love to welcome you to Rainbow International School!</strong>{" "}
                Please call us at{" "}
                <a href="tel:+918291568972" className="text-amber-400 font-semibold hover:underline">+91 82915 68972</a>{" "}
                to schedule your visit, or fill the form and our Admission Counsellor will connect with you.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-10 max-w-5xl mx-auto items-start">

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-amber-300 text-xs font-semibold mb-1.5 ml-1">Parent Name *</label>
                        <input {...register("parentName")} placeholder="Enter your name" data-testid="input-contact-parent-name" className={inputBase} />
                        {errors.parentName && <p className="text-amber-200/80 text-xs mt-1 ml-1">{errors.parentName.message}</p>}
                      </div>
                      <div>
                        <label className="block text-amber-300 text-xs font-semibold mb-1.5 ml-1">Phone Number *</label>
                        <input {...register("phone")} placeholder="Enter phone number" type="tel" data-testid="input-contact-phone" className={inputBase} />
                        {errors.phone && <p className="text-amber-200/80 text-xs mt-1 ml-1">{errors.phone.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-amber-300 text-xs font-semibold mb-1.5 ml-1">Email</label>
                        <input {...register("email")} placeholder="Email address (optional)" type="email" data-testid="input-contact-email" className={inputBase} />
                        {errors.email && <p className="text-amber-200/80 text-xs mt-1 ml-1">{errors.email.message}</p>}
                      </div>
                      <div>
                        <label className="block text-amber-300 text-xs font-semibold mb-1.5 ml-1">Child's Name</label>
                        <input {...register("studentName")} placeholder="Enter child's name" data-testid="input-contact-student-name" className={inputBase} />
                        {errors.studentName && <p className="text-amber-200/80 text-xs mt-1 ml-1">{errors.studentName.message}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-amber-300 text-xs font-semibold mb-1.5 ml-1">Programme *</label>
                      <select {...register("grade")} data-testid="select-contact-grade" className={inputBase + " appearance-none"}>
                        <option value="">Select programme</option>
                        {classOptions.map((cls) => <option key={cls} value={cls} className="text-gray-800">{cls}</option>)}
                      </select>
                      {errors.grade && <p className="text-amber-200/80 text-xs mt-1 ml-1">{errors.grade.message}</p>}
                    </div>

                    <div>
                      <label className="block text-amber-300 text-xs font-semibold mb-1.5 ml-1">Message (Optional)</label>
                      <textarea
                        {...register("message")}
                        placeholder="Any questions or specific requirements?"
                        rows={3}
                        data-testid="textarea-contact-message"
                        className={inputBase + " resize-none"}
                      />
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="contact-consent"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-0.5 w-4 h-4 flex-shrink-0 accent-amber-400"
                        data-testid="checkbox-contact-consent"
                      />
                      <label htmlFor="contact-consent" className="text-blue-200/70 text-xs leading-relaxed cursor-pointer">
                        I confirm the details above are correct and authorize Rainbow International School and its representatives to contact me with updates via Email, SMS, WhatsApp and Call. This will override DND/NDNC registry.
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !agreed}
                      data-testid="button-contact-submit"
                      className="w-full font-bold py-3.5 text-[#091a4f] text-sm transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60 rounded-full"
                      style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" }}
                    >
                      {isSubmitting ? "Submitting..." : "Request Callback"}
                    </button>

                    <a
                      href="https://wa.me/918291568972?text=Hi%2C%20I%20would%20like%20to%20know%20more%20about%20admissions%20at%20Rainbow%20International%20School."
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="button-contact-whatsapp"
                      className="w-full flex items-center justify-center gap-2 font-bold py-3.5 text-white text-sm transition-all hover:opacity-90 active:scale-[0.99] rounded-full"
                      style={{ background: "#128C7E" }}
                    >
                      <MessageCircle size={18} />
                      Chat on WhatsApp
                    </a>
                  </form>
                )}
              </div>

              <div className="space-y-6">
                {contactItems.map((item, i) => {
                  const Icon = item.icon;
                  const inner = (
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: "rgba(251,191,36,0.15)" }}
                      >
                        <Icon size={22} className="text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm mb-1">{item.label}</h3>
                        {item.lines.map((line, j) => (
                          <p key={j} className="text-blue-200/70 text-sm leading-relaxed">{line}</p>
                        ))}
                      </div>
                    </div>
                  );
                  return item.href ? (
                    <a
                      key={i}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:opacity-80 transition-opacity"
                      data-testid={`link-contact-${item.label.toLowerCase()}`}
                      onClick={() => {
                        if (item.href?.startsWith("tel:")) trackCallClick({ phone: item.lines[0] });
                        if (item.href?.includes("maps.google")) trackDirectionsClick();
                      }}
                    >
                      {inner}
                    </a>
                  ) : (
                    <div key={i} data-testid={`info-contact-${item.label.toLowerCase()}`}>{inner}</div>
                  );
                })}

                <div className="mt-6 pl-4 border-l-4 border-amber-400">
                  <p className="text-blue-200/80 text-sm italic leading-relaxed">
                    "The secret of getting ahead is getting started."
                  </p>
                  <p className="text-white text-sm font-semibold mt-2">— Mark Twain</p>
                </div>

              </div>

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
