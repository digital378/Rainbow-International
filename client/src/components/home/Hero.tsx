import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInquirySchema, type InsertInquiry } from "@shared/schema";
import { toast } from "sonner";
import { PhoneCall, ChevronRight, CheckCircle2 } from "lucide-react";

const classOptions = [
  "Nursery", "Jr. KG", "Sr. KG",
  "Class I", "Class II", "Class III", "Class IV", "Class V",
  "Class VI", "Class VII", "Class VIII",
  "Class IX", "Class X", "Class XI", "Class XII",
];

const quickLinks = [
  { label: "CBSE Disclosures", href: "/cbse-mandatory-public-disclosures" },
  { label: "Pre-Primary", href: "/pre-primary-school-thane" },
  { label: "Middle School", href: "/middle-school-section" },
  { label: "Senior Secondary", href: "/senior-secondary-section" },
  { label: "Career", href: "/career" },
];

export function Hero() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InsertInquiry>({
    resolver: zodResolver(insertInquirySchema),
  });

  const onSubmit = async (data: InsertInquiry) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Thank you! Our team will call you shortly.");
      reset();
    } catch {
      toast.error("Could not submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      <img
        src="https://rainbowinternationalschool.in/wp-content/uploads/2023/04/picwish.webp"
        alt="Rainbow International School campus"
        width={1920}
        height={1080}
        loading="eager"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(9,26,79,0.92) 0%, rgba(13,59,134,0.82) 50%, rgba(9,26,79,0.75) 100%)" }} />

      <div className="relative container mx-auto px-4 lg:px-8 pt-40 pb-16 lg:pt-36 lg:pb-16">
        <div className="flex flex-col lg:flex-row gap-10 xl:gap-16 items-center">

          <div className="flex-1">
            <div className="inline-flex items-center gap-2.5 mb-6 px-4 py-2 border border-amber-400/30 bg-amber-400/10 backdrop-blur-sm rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
              </span>
              <span className="text-amber-300 text-[11px] font-semibold tracking-[0.14em] uppercase">
                Admissions Open · Academic Year 2026–27
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl xl:text-7xl font-extrabold leading-[1.05] text-white mb-5 tracking-tight">
              Rainbow<br />
              <span className="text-amber-400">International</span><br />
              School
            </h1>

            <p className="text-blue-200/80 text-base md:text-lg leading-relaxed max-w-lg font-light mb-8">
              Thane West's premier CBSE K–12 school — where every child dares to dream, learns with joy, and grows into a lifelong learner.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              {[
                { num: "50K+", label: "Happy Students" },
                { num: "Since 2009", label: "Established" },
                { num: "3.5 Acres", label: "Campus" },
                { num: "CBSE #1130661", label: "Affiliation" },
              ].map((s, i) => (
                <div key={i} className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-center">
                  <div className="text-amber-400 text-sm font-extrabold leading-none mb-1">{s.num}</div>
                  <div className="text-blue-200/60 text-[10px] font-medium tracking-wide uppercase">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              <a href="#contact" data-testid="button-hero-know-more" className="inline-flex items-center gap-2 px-7 py-3.5 font-bold text-sm text-[#091a4f] rounded-full transition-all hover:shadow-lg hover:scale-[1.02]" style={{ background: "#fbbf24" }}>
                Enquire Now <ChevronRight size={15} />
              </a>
              <Link href="/about-rainbow-international-school" className="inline-flex items-center gap-2 px-7 py-3.5 font-bold text-sm border-2 border-white/30 text-white rounded-full hover:bg-white/10 transition-all" data-testid="link-hero-about">
                About Us
              </Link>
            </div>

            <div className="hidden lg:flex flex-wrap gap-2 pt-6 border-t border-white/10">
              {quickLinks.map((ql, i) => (
                <Link key={i} href={ql.href} className="px-4 py-2 rounded-full text-xs font-medium text-white/70 border border-white/15 hover:bg-white/10 hover:text-white transition-all" data-testid={`link-quick-${i}`}>
                  {ql.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-[380px] flex-shrink-0">
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              <div className="px-7 pt-6 pb-4">
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex items-center -space-x-1">
                    <div className="w-7 h-7 rounded-full bg-pink-500 flex items-center justify-center">
                      <PhoneCall size={12} className="text-white" />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
                      <PhoneCall size={12} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-extrabold text-gray-900 text-[15px] leading-tight">Quick Enquiry</p>
                    <p className="text-gray-400 text-xs">Our counsellor will call you back</p>
                  </div>
                </div>
              </div>

              <div className="px-7 pb-6">
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

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    data-testid="button-hero-submit"
                    className="w-full py-4 font-bold text-white text-sm rounded-xl transition-all hover:opacity-90 hover:shadow-lg active:scale-[0.99] disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #091a4f 0%, #1a56db 100%)" }}
                  >
                    {isSubmitting ? "Submitting..." : "Get a Free Callback"}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 pt-1">
                    <CheckCircle2 size={13} className="text-green-500" />
                    <p className="text-[11px] text-gray-400">No spam · One call only · Completely free</p>
                  </div>
                </form>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
