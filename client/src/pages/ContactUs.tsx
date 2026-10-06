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
import { submitInquiry } from "@/lib/inquiryProtection";
import { CONTACT_SEO, CONTACT_BANNER, CONTACT_CARDS, CONTACT_TOUR, CONTACT_FORM, CONTACT_QUOTE, CONTACT_JSON_LD } from "@shared/content/contact";

const classOptions = CONTACT_FORM.programmes;
const contactItems = [Phone, Mail, Clock, MapPin].map((icon, i) => ({
  ...CONTACT_CARDS[i],
  icon,
}));

export default function ContactUs() {
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
      const trackingData = getFormTrackingData("Contact Page Form");
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
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title={CONTACT_SEO.title}
        description={CONTACT_SEO.description}
        keywords={CONTACT_SEO.keywords}
        appendSiteName={false}
        canonical="https://rainbowinternationalschool.in/contact-us"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: CONTACT_BANNER.title, href: "https://rainbowinternationalschool.in/contact-us" },
        ]}
        jsonLd={CONTACT_JSON_LD}
      />
      <Navbar />
      <PageBanner
        title={CONTACT_BANNER.title}
        subtitle={CONTACT_BANNER.subtitle}
        breadcrumb={[{ label: CONTACT_BANNER.title }]}
      />

      <main className="flex-grow">
        <section
          className="py-16 md:py-20"
          style={{ background: "linear-gradient(135deg, #091a4f 0%, #0d3b86 60%, #091a4f 100%)" }}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-block mb-4">
                <span className="text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase">{CONTACT_TOUR.eyebrow}</span>
                <div className="w-8 h-0.5 bg-amber-400 mx-auto mt-2" />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {CONTACT_TOUR.heading}
              </h2>
              <p className="text-blue-200/80 text-sm leading-relaxed max-w-xl mx-auto">
                <strong className="text-white">{CONTACT_TOUR.introStrong}</strong>{" "}
                {CONTACT_TOUR.introBeforePhone}{" "}
                <a href="tel:+918291568972" className="text-amber-400 font-semibold hover:underline">{CONTACT_CARDS[0].lines[0]}</a>{" "}
                {CONTACT_TOUR.introAfterPhone}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-10 max-w-5xl mx-auto items-start">

              <div className="p-8 border border-white/10 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)" }}>
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center mb-5">
                      <CheckCircle size={40} className="text-green-400" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-white mb-2">{CONTACT_FORM.thankYouHeading}</h3>
                    <p className="text-blue-200/80 text-sm mb-8 max-w-sm">{CONTACT_FORM.thankYou}</p>
                    <button
                      onClick={() => setSubmitted(false)}
                      data-testid="button-contact-another-request"
                      className="px-7 py-2.5 text-sm font-semibold border border-white/20 rounded-full text-white hover:bg-white/10 transition-colors"
                    >
                      {CONTACT_FORM.anotherRequest}
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
                        <label className="block text-amber-300 text-xs font-semibold mb-1.5 ml-1">{CONTACT_FORM.parentLabel}</label>
                        <input {...register("parentName")} placeholder={CONTACT_FORM.parentPlaceholder} data-testid="input-contact-parent-name" className={inputBase} />
                        {errors.parentName && <p className="text-amber-200/80 text-xs mt-1 ml-1">{errors.parentName.message}</p>}
                      </div>
                      <div>
                        <label className="block text-amber-300 text-xs font-semibold mb-1.5 ml-1">{CONTACT_FORM.phoneLabel}</label>
                        <input {...register("phone")} placeholder={CONTACT_FORM.phonePlaceholder} type="tel" inputMode="numeric" maxLength={10} onInput={e => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 10); }} data-testid="input-contact-phone" className={inputBase} />
                        {errors.phone && <p className="text-amber-200/80 text-xs mt-1 ml-1">{errors.phone.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-amber-300 text-xs font-semibold mb-1.5 ml-1">{CONTACT_FORM.emailLabel}</label>
                        <input {...register("email")} placeholder={CONTACT_FORM.emailPlaceholder} type="email" data-testid="input-contact-email" className={inputBase} />
                        {errors.email && <p className="text-amber-200/80 text-xs mt-1 ml-1">{errors.email.message}</p>}
                      </div>
                      <div>
                        <label className="block text-amber-300 text-xs font-semibold mb-1.5 ml-1">{CONTACT_FORM.childLabel}</label>
                        <input {...register("studentName")} placeholder={CONTACT_FORM.childPlaceholder} data-testid="input-contact-student-name" className={inputBase} />
                        {errors.studentName && <p className="text-amber-200/80 text-xs mt-1 ml-1">{errors.studentName.message}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-amber-300 text-xs font-semibold mb-1.5 ml-1">{CONTACT_FORM.programmeLabel}</label>
                      <select {...register("grade")} data-testid="select-contact-grade" className={inputBase + " appearance-none"}>
                        <option value="">{CONTACT_FORM.programmePlaceholder}</option>
                        {classOptions.map((cls) => <option key={cls} value={cls} className="text-gray-800">{cls}</option>)}
                      </select>
                      {errors.grade && <p className="text-amber-200/80 text-xs mt-1 ml-1">{errors.grade.message}</p>}
                    </div>

                    <div>
                      <label className="block text-amber-300 text-xs font-semibold mb-1.5 ml-1">{CONTACT_FORM.messageLabel}</label>
                      <textarea
                        {...register("message")}
                        placeholder={CONTACT_FORM.messagePlaceholder}
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
                        {CONTACT_FORM.consent}
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !agreed}
                      data-testid="button-contact-submit"
                      className="w-full font-bold py-3.5 text-[#091a4f] text-sm transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60 rounded-full"
                      style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" }}
                    >
                      {isSubmitting ? CONTACT_FORM.submitting : CONTACT_FORM.submit}
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
                      {CONTACT_FORM.whatsapp}
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
                      data-testid={item.testId}
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
                    {CONTACT_QUOTE.text}
                  </p>
                  <p className="text-white text-sm font-semibold mt-2">{CONTACT_QUOTE.attribution}</p>
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
