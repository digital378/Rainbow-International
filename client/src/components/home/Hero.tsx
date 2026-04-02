import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInquirySchema, type InsertInquiry } from "@shared/schema";
import { toast } from "sonner";
import { PhoneCall, ChevronRight, ArrowRight } from "lucide-react";

const classOptions = [
  "Nursery", "Jr. KG", "Sr. KG",
  "Class I", "Class II", "Class III", "Class IV", "Class V",
  "Class VI", "Class VII", "Class VIII",
  "Class IX", "Class X", "Class XI", "Class XII",
];

const gridPanels = [
  {
    title: "About Us",
    sub: "Our story, values & vision",
    href: "/about-rainbow-international-school",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/12-300x200.jpg",
    span: "col-span-2 row-span-2",
    size: "h-full",
  },
  {
    title: "Admissions 2026–27",
    sub: "Now open for all grades",
    href: "#contact",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/pre-primary-school-nursery-jrkg-srkg-admissions-ad.jpg",
    span: "col-span-1 row-span-1",
    size: "h-full",
  },
  {
    title: "Academics",
    sub: "Nursery to Class XII",
    href: "/primary-section",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Primary-scetion-768x513.png",
    span: "col-span-1 row-span-1",
    size: "h-full",
  },
  {
    title: "Campus & Facilities",
    sub: "3.5-acre modern campus",
    href: "/amenities",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/amenities-facilities01-768x610.png",
    span: "col-span-1 row-span-1",
    size: "h-full",
  },
  {
    title: "Beyond Classroom",
    sub: "Sports, arts & culture",
    href: "/beyond-the-classroom",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2023/07/web-art-work-for-pranit-d-02-1024x831.png",
    span: "col-span-1 row-span-1",
    size: "h-full",
  },
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
    <section className="relative overflow-hidden" style={{ background: "#091a4f" }}>
      <div className="container mx-auto px-4 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 xl:gap-8">

          <div className="flex-1 flex flex-col">
            <div className="mb-6 pt-4 lg:pt-6">
              <div className="inline-flex items-center gap-2.5 mb-5 px-4 py-2 border border-amber-400/25 bg-amber-400/10 backdrop-blur-sm" style={{ borderRadius: "3px" }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                </span>
                <span className="text-amber-300 text-[11px] font-semibold tracking-[0.14em] uppercase">
                  Admissions Open · 2026–27
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold leading-[1.08] text-white mb-4 tracking-tight">
                Rainbow{" "}
                <span className="text-amber-400">International</span>
                <br />School
              </h1>

              <p className="text-blue-200/80 text-base md:text-lg leading-relaxed max-w-lg font-light">
                Thane West's premier CBSE K–12 school — where every child dares to dream, learns with joy, and grows into a lifelong learner.
              </p>
            </div>

            <div className="hidden lg:grid grid-cols-4 grid-rows-2 gap-2.5 flex-1" style={{ minHeight: "320px" }}>
              {gridPanels.map((panel, i) => (
                <Link key={i} href={panel.href}>
                  <div
                    className={`group relative overflow-hidden cursor-pointer ${panel.span} h-full`}
                    style={{ borderRadius: "4px" }}
                    data-testid={`hero-panel-${i}`}
                  >
                    <img
                      src={panel.image}
                      alt={panel.title}
                      width={400}
                      height={300}
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-amber-600/80 group-hover:via-amber-600/20 transition-all duration-500" />
                    <div className="absolute inset-0 flex flex-col justify-end p-4">
                      <h3 className="text-white font-bold text-sm md:text-base leading-tight mb-0.5">{panel.title}</h3>
                      <p className="text-white/70 text-xs group-hover:text-white/90 transition-colors">{panel.sub}</p>
                    </div>
                    <div className="absolute top-3 right-3 w-7 h-7 bg-white/10 border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ borderRadius: "3px" }}>
                      <ArrowRight size={13} className="text-white" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="lg:hidden flex flex-wrap gap-3 mt-2 mb-6">
              <a href="#contact" data-testid="button-hero-know-more" className="inline-flex items-center gap-2 px-6 py-3 font-bold text-sm text-[#091a4f] transition-all hover:opacity-90" style={{ background: "#fbbf24", borderRadius: "3px" }}>
                Enquire Now <ChevronRight size={15} />
              </a>
              <Link href="/about-rainbow-international-school" className="inline-flex items-center gap-2 px-6 py-3 font-bold text-sm border border-white/30 text-white hover:bg-white/10 transition-all" style={{ borderRadius: "3px" }} data-testid="link-hero-about">
                About Us
              </Link>
            </div>

            <div className="flex flex-wrap gap-5 mt-4 lg:mt-6 py-4 border-t border-white/10">
              {[
                { num: "50K+", label: "Happy Students" },
                { num: "Since 2009", label: "Established" },
                { num: "3.5 Acres", label: "Campus" },
                { num: "CBSE", label: "#1130661" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-amber-400 text-lg font-extrabold leading-none mb-1">{s.num}</div>
                  <div className="text-blue-200/60 text-[11px] font-medium tracking-wide uppercase">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-[370px] flex-shrink-0">
            <div className="bg-white overflow-hidden shadow-2xl" style={{ borderRadius: "4px" }}>
              <div className="px-7 py-5 border-b border-gray-100" style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-white/25" style={{ borderRadius: "4px" }}>
                    <PhoneCall size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="font-extrabold text-[#091a4f] text-sm leading-tight">Quick Enquiry</p>
                    <p className="text-[#091a4f]/60 text-xs">Our counsellor will call you back</p>
                  </div>
                </div>
              </div>

              <div className="px-7 py-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
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
                        className="w-full border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all bg-white"
                        style={{ borderRadius: "3px" }}
                      />
                    </div>
                  ))}

                  <label htmlFor="hero-grade" className="sr-only">Select Class</label>
                  <select
                    {...register("grade")}
                    id="hero-grade"
                    data-testid="select-hero-grade"
                    aria-label="Select Class"
                    className="w-full border border-gray-200 px-4 py-3 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all bg-white appearance-none"
                    style={{ borderRadius: "3px" }}
                  >
                    <option value="">Select Class *</option>
                    {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    data-testid="button-hero-submit"
                    className="w-full py-3.5 font-bold text-white text-sm transition-all hover:opacity-90 hover:shadow-lg active:scale-[0.99] disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #091a4f 0%, #0d3b86 100%)", borderRadius: "3px" }}
                  >
                    {isSubmitting ? "Submitting..." : "Get a Free Callback"}
                  </button>

                  <p className="text-center text-[11px] text-gray-400">No spam · One call only · Completely free</p>
                </form>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
