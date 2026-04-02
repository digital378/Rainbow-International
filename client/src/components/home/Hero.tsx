import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInquirySchema, type InsertInquiry } from "@shared/schema";
import { toast } from "sonner";
import { PhoneCall, ChevronRight, ShieldCheck } from "lucide-react";

const classOptions = [
  "Nursery", "Jr. KG", "Sr. KG",
  "Class I", "Class II", "Class III", "Class IV", "Class V",
  "Class VI", "Class VII", "Class VIII",
  "Class IX", "Class X", "Class XI", "Class XII",
];

const stats = [
  { num: "50K+", label: "Happy Students" },
  { num: "Since 2009", label: "Established" },
  { num: "3.5 Acres", label: "Campus" },
  { num: "CBSE #1130661", label: "Affiliation" },
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
  const { register, handleSubmit, reset } = useForm<InsertInquiry>({
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
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(https://rainbowinternationalschool.in/wp-content/uploads/2023/04/picwish.webp)` }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(115deg, rgba(9,26,79,0.95) 0%, rgba(13,59,134,0.88) 55%, rgba(9,26,79,0.65) 100%)" }}
      />

      <div className="relative z-10 container mx-auto px-4 lg:px-10 py-28 lg:py-0 lg:min-h-screen flex items-center">
        <div className="flex flex-col lg:flex-row items-center gap-12 xl:gap-20 w-full">

          <div className="flex-1 text-white max-w-2xl">
            <div className="inline-flex items-center gap-2.5 mb-6 px-4 py-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400" />
              </span>
              <span className="text-yellow-300 text-xs font-bold tracking-[0.12em] uppercase">
                Admissions Open · Academic Year 2026–27
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl xl:text-7xl font-black leading-[1.05] mb-5">
              <span className="text-white">Rainbow </span>
              <span
                className="relative inline-block"
                style={{ color: "#fbbf24" }}
              >
                International
              </span>
              <br />
              <span className="text-white">School</span>
            </h1>

            <p className="text-blue-100 text-lg md:text-xl leading-relaxed mb-8 max-w-lg font-light">
              Thane West's premier CBSE K–12 school — where every child dares to dream, learns with joy, and grows into a lifelong learner.
            </p>

            <div className="flex flex-wrap gap-3 mb-9">
              {stats.map((s, i) => (
                <div
                  key={i}
                  className="px-5 py-3 rounded-2xl border border-white/15 bg-white/8 backdrop-blur-sm text-center"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                >
                  <div className="text-lg font-black text-yellow-300 leading-none mb-0.5">{s.num}</div>
                  <div className="text-[11px] text-blue-200/80 font-medium tracking-wide">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mb-9">
              <a href="#contact" data-testid="button-hero-know-more" aria-label="Enquire now about admissions" className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-95" style={{ background: "#fbbf24", color: "#0d3b86" }}>
                  Enquire Now
                  <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </a>
              <Link href="/about-rainbow-international-school" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300" aria-label="Learn about Rainbow International School">
                  About Us
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {quickLinks.map((l, i) => (
                <Link key={i} href={l.href}>
                  <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-white/10 border border-white/15 text-white/80 text-xs font-medium hover:bg-white/20 hover:text-white cursor-pointer transition-all backdrop-blur-sm">
                    {l.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-[360px] flex-shrink-0">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="px-7 py-5 border-b border-gray-100" style={{ background: "#f8faff" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#e8f4fb" }}>
                    <PhoneCall size={18} style={{ color: "#0d3b86" }} />
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-sm leading-tight">Quick Enquiry</p>
                    <p className="text-gray-400 text-xs">Our counsellor will call you back</p>
                  </div>
                </div>
              </div>

              <div className="px-7 py-6">
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
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white"
                      />
                    </div>
                  ))}

                  <label htmlFor="hero-grade" className="sr-only">Select Class</label>
                  <select
                    {...register("grade")}
                    id="hero-grade"
                    data-testid="select-hero-grade"
                    aria-label="Select Class"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white appearance-none"
                  >
                    <option value="">Select Class *</option>
                    {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    data-testid="button-hero-submit"
                    className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 hover:shadow-lg active:scale-[0.99] disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #0d3b86 0%, #1565c0 100%)" }}
                  >
                    {isSubmitting ? "Submitting..." : "Get a Free Callback"}
                  </button>

                  <div className="flex items-center gap-2 justify-center">
                    <ShieldCheck size={13} className="text-green-500 flex-shrink-0" />
                    <p className="text-center text-[11px] text-gray-400">No spam · One call only · Completely free</p>
                  </div>
                </form>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="w-full" style={{ height: "90px", display: "block" }} xmlns="http://www.w3.org/2000/svg">
          <path d="M0,55 C240,90 480,20 720,55 C960,90 1200,25 1440,55 L1440,90 L0,90 Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
