import { ClipboardList, Phone, MapPin, UserCheck, BadgeCheck, ArrowRight } from "lucide-react";

const steps = [
  { icon: ClipboardList, step: "01", title: "Submit Enquiry",             desc: "Share your basic details through our online form, by calling the admissions desk, or via WhatsApp.", bg: "#0d3b86" },
  { icon: Phone,         step: "02", title: "Counsellor Call-Back",       desc: "Our admissions team calls you to understand your child's grade, location and requirements.",             bg: "#f59e0b" },
  { icon: MapPin,        step: "03", title: "Campus Visit",               desc: "Visit our 3.5-acre Brahmand campus, meet the team and experience the school environment first-hand.",    bg: "#0d3b86" },
  { icon: UserCheck,     step: "04", title: "Interaction & Documents",    desc: "A friendly student interaction or document review is completed as per the grade requirement.",            bg: "#f59e0b" },
  { icon: BadgeCheck,    step: "05", title: "Admission Confirmed",        desc: "Complete the fee process, receive your admission confirmation and get full onboarding support.",          bg: "#0d3b86" },
];

export function AdmissionJourney() {
  return (
    <section className="py-20 bg-white" data-testid="section-admission-journey">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="text-amber-500 text-xs font-semibold tracking-[0.2em] uppercase">Simple & Transparent</span>
            <div className="w-8 h-0.5 bg-amber-400 mx-auto mt-2" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-3 tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Your Admission Journey at RIS
          </h2>
          <p className="text-gray-500 text-base max-w-md mx-auto">Five straightforward steps from your first enquiry to your child's first day of school.</p>
        </div>

        {/* Desktop horizontal timeline */}
        <div className="hidden lg:flex items-start gap-0 mb-12 relative">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="flex-1 relative flex flex-col items-center text-center px-3" data-testid={`step-journey-${i + 1}`}>
                {i < steps.length - 1 && (
                  <div className="absolute top-8 left-1/2 w-full h-0.5 z-0" style={{ background: "linear-gradient(to right, #0d3b86, #f59e0b)" }} aria-hidden="true" />
                )}
                <div className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center shadow-md mb-4 flex-shrink-0" style={{ background: s.bg }}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-[10px] font-black text-amber-500 tracking-widest uppercase mb-1">Step {s.step}</span>
                <h3 className="font-extrabold text-gray-900 text-sm mb-2 leading-snug">{s.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Mobile vertical timeline */}
        <div className="lg:hidden space-y-6 mb-10 max-w-md mx-auto">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="relative flex items-start gap-5" data-testid={`step-journey-mobile-${i + 1}`}>
                {i < steps.length - 1 && (
                  <div className="absolute left-[30px] top-[64px] h-full w-0.5 z-0" style={{ background: "linear-gradient(to bottom, #0d3b86, #f59e0b)" }} aria-hidden="true" />
                )}
                <div className="flex-shrink-0 w-[60px] h-[60px] rounded-2xl flex items-center justify-center shadow-md z-10" style={{ background: s.bg }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="pt-1">
                  <span className="text-[10px] font-black text-amber-500 tracking-widest uppercase">Step {s.step}</span>
                  <h3 className="font-extrabold text-gray-900 text-sm mt-0.5 mb-1">{s.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <a
            href="/admissions"
            className="group inline-flex items-center gap-2.5 px-8 py-3.5 font-bold text-[#091a4f] text-sm transition-all duration-300 hover:opacity-90 hover:shadow-lg"
            style={{ background: "#fbbf24", borderRadius: "9999px" }}
            data-testid="btn-journey-book-visit"
          >
            Book a Campus Visit
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
}
