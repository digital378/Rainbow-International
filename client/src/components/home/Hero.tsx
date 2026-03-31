import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInquirySchema, type InsertInquiry } from "@shared/schema";
import { toast } from "sonner";
import { Phone } from "lucide-react";

const classOptions = [
  "Nursery", "Jr. KG", "Sr. KG",
  "Class I", "Class II", "Class III", "Class IV", "Class V",
  "Class VI", "Class VII", "Class VIII",
  "Class IX", "Class X", "Class XI", "Class XII",
];

const quickLinks = [
  { label: "CBSE School", icon: "🏆", href: "/cbse-mandatory-public-disclosures" },
  { label: "Pre-Primary", icon: "🌱", href: "/pre-primary-school-thane" },
  { label: "Primary", icon: "📚", href: "/primary-section" },
  { label: "Middle School", icon: "🔬", href: "/middle-school-section" },
  { label: "Secondary", icon: "📐", href: "/secondary-section" },
  { label: "Sr. Secondary", icon: "🎓", href: "/senior-secondary-section" },
];

export function Hero() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<InsertInquiry>({
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
      toast.success("Thank you! Our Admission Counsellor will contact you shortly.");
      reset();
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(https://rainbowinternationalschool.in/wp-content/uploads/2023/04/picwish.webp)` }}
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(110deg, rgba(10,31,92,0.92) 0%, rgba(13,59,134,0.85) 50%, rgba(10,31,92,0.6) 100%)" }} />

      <div className="relative container mx-auto px-4 lg:px-8 min-h-screen flex flex-col justify-center" style={{ paddingTop: "6rem", paddingBottom: "3rem" }}>
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

          <div className="flex-1 text-white">
            <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full bg-yellow-400/20 border border-yellow-400/40">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse flex-shrink-0" />
              <span className="text-yellow-300 text-xs font-bold tracking-widest uppercase">Admissions Open · Academic Year 2026–27</span>
            </div>

            <h1 className="text-4xl md:text-5xl xl:text-6xl font-black leading-tight mb-4">
              Rainbow{" "}
              <span style={{ color: "#ffd600" }}>International</span>
              <br />School
            </h1>

            <p className="text-blue-100 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
              Thane West's trusted CBSE school since 2009 — where every child enjoys learning, dares to dream, and becomes a lifelong learner.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              {[
                { num: "3,000+", label: "Happy Students" },
                { num: "2009", label: "Est. Year" },
                { num: "3.5 Acres", label: "Campus" },
                { num: "Nur–12", label: "All Grades" },
              ].map((s, i) => (
                <div key={i} className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-center">
                  <div className="text-lg font-black text-yellow-300">{s.num}</div>
                  <div className="text-xs text-blue-200">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mb-10">
              <a href="#contact" data-testid="button-hero-know-more">
                <button className="px-7 py-3 rounded-full font-bold text-sm text-blue-900 transition-all hover:scale-105 hover:shadow-lg" style={{ background: "#ffd600" }}>
                  Know More
                </button>
              </a>
              <Link href="/about-rainbow-international-school">
                <button className="px-7 py-3 rounded-full font-bold text-sm text-white border-2 border-white/40 hover:bg-white/10 transition-all">
                  About Us
                </button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {quickLinks.map((l, i) => (
                <Link key={i} href={l.href}>
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
                    <span className="text-base">{l.icon}</span>
                    <span className="text-white text-xs font-semibold">{l.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-3xl shadow-2xl p-6 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#e8f4fb" }}>
                  <Phone size={14} style={{ color: "#0d3b86" }} />
                </div>
                <div>
                  <p className="font-black text-gray-900 text-sm">Quick Enquiry</p>
                  <p className="text-gray-400 text-xs">Free consultation</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-4">No spam · We'll call you shortly</p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
                <input
                  {...register("parentName")}
                  placeholder="Parent Name *"
                  data-testid="input-hero-parent-name"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-blue-400 transition-all"
                  style={{ "--tw-ring-color": "#0d3b86" } as React.CSSProperties}
                />
                <input
                  {...register("phone")}
                  placeholder="Phone Number *"
                  type="tel"
                  data-testid="input-hero-phone"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all"
                />
                <input
                  {...register("studentName")}
                  placeholder="Child's Name *"
                  data-testid="input-hero-student-name"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all"
                />
                <select
                  {...register("grade")}
                  data-testid="select-hero-grade"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-500 focus:outline-none focus:ring-2 transition-all appearance-none bg-white"
                >
                  <option value="">Select Class *</option>
                  {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="button-hero-submit"
                  className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #0d3b86, #1565c0)" }}
                >
                  {isSubmitting ? "Sending..." : "Get a Free Callback"}
                </button>
                <p className="text-center text-xs text-gray-400">No spam · One call from our admissions team · Free</p>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full" style={{ height: "80px" }} xmlns="http://www.w3.org/2000/svg">
          <path d="M0,50 C360,80 720,20 1080,50 C1260,65 1380,35 1440,50 L1440,80 L0,80 Z" fill="white" />
        </svg>
      </div>
    </div>
  );
}
