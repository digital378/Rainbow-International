import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import ScrollProgress from "@/components/home/ScrollProgress";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getFormTrackingData } from "@/lib/analytics";
import { buildFaqPageSchema } from "@/components/WaveOneSeoBlock";
import {
  CheckCircle, Phone, MessageCircle, MapPin, CalendarCheck,
  ClipboardList, UserCheck, BadgeCheck, GraduationCap, ChevronRight, Star, Shield, Bus, BookOpen,
} from "lucide-react";

// ── Data ─────────────────────────────────────────────────────────────────────

const grades = [
  "Nursery", "Jr. KG", "Sr. KG",
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8",
  "Class 9", "Class 10",
  "Class 11 – Science", "Class 11 – Commerce", "Class 11 – Humanities",
  "Class 12 – Science", "Class 12 – Commerce", "Class 12 – Humanities",
];

const benefits = [
  { icon: GraduationCap,  title: "CBSE-Affiliated",       desc: "Full CBSE curriculum, Affiliation No. 1130661, from Nursery through Class 12.",      color: "#e0edff", accent: "#0d3b86" },
  { icon: BookOpen,       title: "Nursery to Class 12",   desc: "One campus, one community — a complete K-12 journey so your child never has to change schools.", color: "#fff3e0", accent: "#d97706" },
  { icon: MapPin,         title: "3.5-Acre Campus",       desc: "Sprawling Brahmand campus with smart classrooms, labs, library, pool and sports ground.",          color: "#e0f7f0", accent: "#059669" },
  { icon: BadgeCheck,     title: "Strong Academics",      desc: "Multiple Intelligence pedagogy, project-based learning, Olympiad coaching and board prep.",          color: "#f3e0ff", accent: "#7c3aed" },
  { icon: Star,           title: "Sports & Activities",   desc: "Swimming pool, football turf, cricket ground, skating rink, karate, chess and 15+ more.",           color: "#fdf0e0", accent: "#ea580c" },
  { icon: Shield,         title: "Safe Environment",      desc: "CCTV-monitored campus, on-campus infirmary, paediatrician on call, metal detectors at entry.",      color: "#e0f0ff", accent: "#0891b2" },
];

const steps = [
  { icon: ClipboardList, step: "01", title: "Submit Enquiry",               desc: "Fill the admission enquiry form online or call the admission desk directly." },
  { icon: Phone,         step: "02", title: "Counsellor Call-Back",         desc: "An admissions counsellor calls within one working day to discuss your child's needs." },
  { icon: MapPin,        step: "03", title: "Campus Visit & Counselling",   desc: "Visit the Brahmand campus, meet the team and see facilities first-hand." },
  { icon: UserCheck,     step: "04", title: "Interaction & Document Review",desc: "A friendly student interaction and document verification session." },
  { icon: BadgeCheck,    step: "05", title: "Admission Confirmation",       desc: "Complete fee payment and receive the admission confirmation letter." },
];

const gradeBlocks = [
  {
    label: "Pre-Primary",
    classes: "Nursery · Jr KG · Sr KG",
    img: "/images/home/academic/pre-primary.webp",
    concern: "Starting school is a big moment.",
    advantage: "Our play-based, activity-led Nursery wing uses the Multiple Intelligence approach. A female-staff-led section with a safe, nurturing atmosphere.",
    href: "/pre-primary-school-thane",
    color: "#fff3e0",
    accent: "#d97706",
  },
  {
    label: "Primary",
    classes: "Class 1 – 5",
    img: "/images/home/academic/primary-section.webp",
    concern: "Building the right foundation matters.",
    advantage: "CBSE-aligned literacy, numeracy, science and creative skills. Co-curricular activities built into every school day.",
    href: "/primary-section",
    color: "#e0f7f0",
    accent: "#059669",
  },
  {
    label: "Middle School",
    classes: "Class 6 – 8",
    img: "/images/home/academic/middle-section.webp",
    concern: "The tween years need structure and stimulation.",
    advantage: "Conceptual depth across subjects, project-based learning, Olympiad coaching and a rich co-curricular calendar.",
    href: "/middle-school-section",
    color: "#e0edff",
    accent: "#0d3b86",
  },
  {
    label: "Secondary",
    classes: "Class 9 – 10",
    img: "/images/home/academic/secondary-section.webp",
    concern: "Board prep without burning out.",
    advantage: "Structured CBSE Class 10 preparation with periodic tests, pre-boards, doubt sessions and career counselling for stream choice.",
    href: "/secondary-section",
    color: "#f3e0ff",
    accent: "#7c3aed",
  },
  {
    label: "Senior Secondary",
    classes: "Class 11 – 12",
    img: "/images/home/academic/senior-section.webp",
    concern: "The right stream, the right support.",
    advantage: "Science, Commerce and Humanities streams with JEE / NEET / CUET prep support, dedicated subject labs and expert faculty.",
    href: "/senior-secondary-section",
    color: "#e0f0ff",
    accent: "#0891b2",
  },
];

const documents = [
  "Birth certificate (original + photocopy)",
  "Aadhaar card — child and parent",
  "Passport-size photographs (child × 4, parent × 2)",
  "Previous school Transfer Certificate (where applicable)",
  "Report cards / mark sheets (last 2 years)",
  "Address proof (utility bill / rent agreement)",
  "Medical fitness certificate",
  "Caste / category certificate (if applicable)",
];

const testimonials = [
  { name: "Anuja Pradhan",    initials: "AP", color: "#0d3b86", review: "Highly recommended. Most lively atmosphere. The warmth makes every child comfortable. Practical activities, great hygiene — undoubtedly the best school in Thane." },
  { name: "Surabhi Trivedi",  initials: "ST", color: "#d97706", review: "Fantastic! The teachers are professional, caring and well organised. Infrastructure is outstanding. Children grow intellectually and in co-curricular activities." },
  { name: "Dhaval Lodaya",    initials: "DL", color: "#059669", review: "RIS gave my child a stellar foundation and a nurturing environment that made the school an extension of our family." },
  { name: "Ratish Pradhan",   initials: "RP", color: "#7c3aed", review: "We are very happy with the school, authorities and management. Teachers are nice and ensure all kids get the required attention." },
];

const PAGE_FAQS = [
  { q: "Which board is Rainbow International School affiliated to?",    a: "Rainbow International School Thane is affiliated to the Central Board of Secondary Education (CBSE), New Delhi. Affiliation No. 1130661." },
  { q: "Which classes are admissions open for in 2026-27?",            a: "Admissions are open for Nursery to Class 12 for the 2026-27 academic year, subject to seat availability per class." },
  { q: "What is the admission process at RIS?",                         a: "Submit an enquiry online or by phone → counsellor calls back → campus visit and counselling session → student interaction and document review → admission confirmation on fee payment." },
  { q: "Is school transport available?",                                a: "Yes. GPS-tracked school buses with trained attendants cover Brahmand, Ghodbunder Road, Manpada and 30+ routes across Thane." },
  { q: "What documents are required for admission?",                    a: "Birth certificate, Aadhaar (child and parent), passport photos, address proof, previous school transfer certificate, last two years' report cards, and a medical fitness certificate." },
  { q: "Is there an admission interaction or assessment?",              a: "For Nursery to Class 8 there is no written test — an informal interaction session is held. For Class 9 and above, a written assessment in core subjects is required." },
  { q: "How can parents book a campus visit?",                          a: "Book through the enquiry form on this page, call the admission desk at +91 82915 68972, or WhatsApp us. Campus visits are available Mon–Sat, 9 AM–5 PM." },
  { q: "What are the school timings?",                                  a: "School hours are Monday to Saturday, 9:00 AM to 6:00 PM (office). Academic hours for students vary by section; confirmed at the time of admission." },
  { q: "Are senior secondary streams available?",                       a: "Yes. Class 11 and 12 are offered in three CBSE streams: Science (PCM / PCB), Commerce, and Humanities, with JEE, NEET and CUET prep support." },
];

// ── Form ─────────────────────────────────────────────────────────────────────

const emptyForm = { parentName: "", phone: "", studentName: "", gradeApplying: "", location: "", preferredDate: "", message: "" };

export default function ApplicationForm() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const mutation = useMutation({
    mutationFn: async (data: typeof form) =>
      apiRequest("POST", "/api/inquiries", {
        parentName: data.parentName,
        studentName: data.studentName,
        phone: data.phone,
        grade: data.gradeApplying,
        message: `Admissions Landing Page | Location: ${data.location} | Preferred Visit: ${data.preferredDate} | Notes: ${data.message}`,
        ...getFormTrackingData("Admissions Landing Page"),
      }),
    onSuccess: () => setSubmitted(true),
    onError: () => toast({ title: "Submission failed", description: "Please try again or call us at +91 82915 68972.", variant: "destructive" }),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); mutation.mutate(form); };

  const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0d3b86] bg-white";
  const lbl = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="Admissions Open 2026–27 | CBSE School in Thane | Rainbow International School"
        description="Apply for admission to Rainbow International School Thane — CBSE-affiliated, Nursery to Class 12, established 2009, 3.5-acre Brahmand campus. Book a campus visit today."
        keywords="CBSE school in Thane admissions, nursery admission Thane, best school in Thane, admissions open Thane 2026-27, Class 11 admission Thane, international school Thane, Rainbow International School admission"
        canonical="https://rainbowinternationalschool.in/application-form"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "Admissions 2026-27", href: "https://rainbowinternationalschool.in/application-form" },
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "name": "Admissions Open 2026–27 | Rainbow International School Thane",
              "description": "CBSE admissions open for 2026-27 at Rainbow International School Thane — Nursery to Class 12.",
              "url": "https://rainbowinternationalschool.in/application-form",
            },
            buildFaqPageSchema(PAGE_FAQS),
          ],
        }}
      />
      <ScrollProgress />
      <Navbar />

      {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[88vh] flex items-center"
        style={{ background: "linear-gradient(135deg,#091a4f 0%,#0d3b86 60%,#1550b8 100%)" }}
        data-testid="section-hero"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/images/students/hero-senior-secondary.webp')" }}
          aria-hidden="true"
        />
        <div className="relative container mx-auto px-4 max-w-6xl py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          {/* Left copy */}
          <div className="text-white">
            <span className="inline-flex items-center gap-2 bg-amber-400 text-[#091a4f] text-xs font-extrabold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-[#091a4f] animate-pulse" /> Admissions Open 2026–27
            </span>
            <h1 className="font-['DM_Sans'] font-black text-4xl md:text-5xl lg:text-6xl leading-tight mb-4">
              Give Your Child<br />
              <span className="text-amber-400">the Best Start</span><br />
              in Thane
            </h1>
            <p className="text-blue-100 text-lg mb-2 font-medium">CBSE Affiliated School | Nursery to Class 12</p>
            <p className="text-blue-200 text-sm mb-8">Established 2009 · 3.5-acre campus · 3,000+ students · Brahmand, Thane</p>

            {/* Trust stats */}
            <div className="flex flex-wrap gap-4 mb-10">
              {[["50K+","Happy Students"],["15+","Years of Excellence"],["CBSE","Affiliation 1130661"],["3.5 Acres","Campus"]].map(([val, lbl]) => (
                <div key={lbl} className="bg-white/10 backdrop-blur rounded-2xl px-5 py-3 text-center border border-white/20">
                  <div className="text-amber-400 font-black text-lg leading-none">{val}</div>
                  <div className="text-blue-200 text-xs mt-0.5">{lbl}</div>
                </div>
              ))}
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex gap-3 flex-wrap">
              <a href="#enquiry-form" data-testid="btn-hero-book-visit" className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-[#091a4f] font-extrabold px-7 py-3.5 rounded-full text-sm transition-colors shadow-lg shadow-amber-400/30">
                <CalendarCheck className="w-4 h-4" /> Book a Campus Visit
              </a>
              <a href="#enquiry-form" data-testid="btn-hero-apply" className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold px-7 py-3.5 rounded-full text-sm border border-white/30 transition-colors">
                Apply Now <ChevronRight className="w-4 h-4" />
              </a>
            </div>
            {/* Mobile CTAs */}
            <div className="flex md:hidden gap-3 flex-wrap">
              <a href="tel:+918291568972" data-testid="btn-hero-call" className="flex items-center gap-2 bg-white/15 border border-white/30 text-white font-bold px-5 py-3 rounded-full text-sm">
                <Phone className="w-4 h-4" /> Call
              </a>
              <a href="https://wa.me/918291568972?text=I'd+like+information+about+admissions+at+Rainbow+International+School+Thane" target="_blank" rel="noopener noreferrer" data-testid="btn-hero-whatsapp" className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-5 py-3 rounded-full text-sm">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
              <a href="#enquiry-form" data-testid="btn-hero-book-mobile" className="flex items-center gap-2 bg-amber-400 text-[#091a4f] font-bold px-5 py-3 rounded-full text-sm">
                <CalendarCheck className="w-4 h-4" /> Book Visit
              </a>
            </div>
          </div>

          {/* Right — inline mini form card */}
          <div id="enquiry-form" className="bg-white rounded-3xl shadow-2xl p-7 md:p-8">
            {submitted ? (
              <div className="flex flex-col items-center text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                  <CheckCircle className="w-9 h-9 text-green-500" />
                </div>
                <h3 className="font-['DM_Sans'] font-black text-xl text-[#091a4f] mb-2">Thank You!</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-xs">Our admissions counsellor will contact you shortly to guide you through the next step.</p>
                <button onClick={() => { setSubmitted(false); setForm(emptyForm); }} data-testid="button-submit-another" className="text-sm font-semibold text-[#0d3b86] underline underline-offset-2">Submit another enquiry</button>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <h2 className="font-['DM_Sans'] font-black text-xl text-[#091a4f]">Quick Admission Enquiry</h2>
                  <p className="text-gray-500 text-xs mt-1">Our counsellor will call you back within one working day.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-enquiry">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Parent Name *</label>
                      <input name="parentName" value={form.parentName} onChange={handleChange} required placeholder="Your full name" className={inp} data-testid="input-parent-name" />
                    </div>
                    <div>
                      <label className={lbl}>Mobile Number *</label>
                      <input type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="+91 XXXXX XXXXX" className={inp} data-testid="input-phone" />
                    </div>
                    <div>
                      <label className={lbl}>Child's Name *</label>
                      <input name="studentName" value={form.studentName} onChange={handleChange} required placeholder="Child's full name" className={inp} data-testid="input-student-name" />
                    </div>
                    <div>
                      <label className={lbl}>Grade Applying For *</label>
                      <select name="gradeApplying" value={form.gradeApplying} onChange={handleChange} required className={inp} data-testid="select-grade">
                        <option value="">Select grade</option>
                        {grades.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>Your Area / Location</label>
                      <input name="location" value={form.location} onChange={handleChange} placeholder="Brahmand, Ghodbunder…" className={inp} data-testid="input-location" />
                    </div>
                    <div>
                      <label className={lbl}>Preferred Visit Date</label>
                      <input type="date" name="preferredDate" value={form.preferredDate} onChange={handleChange} className={inp} data-testid="input-preferred-date" />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Message (optional)</label>
                    <textarea name="message" value={form.message} onChange={handleChange} rows={2} placeholder="Any specific questions…" className={inp + " resize-none"} data-testid="textarea-message" />
                  </div>
                  <button type="submit" disabled={mutation.isPending} data-testid="button-submit-enquiry" className="w-full bg-[#0d3b86] hover:bg-[#091a4f] text-white font-bold py-3.5 rounded-xl text-sm tracking-wide transition-colors disabled:opacity-60 shadow-lg shadow-blue-900/20">
                    {mutation.isPending ? "Submitting…" : "Book a Campus Visit →"}
                  </button>
                  <p className="text-center text-xs text-gray-400">Mon–Sat · 9 AM–6 PM · No entrance test for Nursery–Class 8</p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── 2. WHY CHOOSE RIS ────────────────────────────────────────────── */}
      <section className="py-20 bg-[#f8faff]" data-testid="section-why-ris">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-widest uppercase bg-[#eef5ff] text-[#0d3b86] px-4 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0d3b86]" /> Why Parents Choose RIS
            </span>
            <h2 className="font-['DM_Sans'] font-black text-3xl md:text-4xl text-[#091a4f]">The RIS Advantage</h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">A school that cares as much about character as it does about academics.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow" data-testid={`card-benefit-${b.title.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: b.color }}>
                    <Icon className="w-6 h-6" style={{ color: b.accent }} />
                  </div>
                  <h3 className="font-['DM_Sans'] font-black text-base text-[#091a4f] mb-2">{b.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. ADMISSION JOURNEY ─────────────────────────────────────────── */}
      <section className="py-20 bg-white" data-testid="section-admission-journey">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-widest uppercase bg-[#eef5ff] text-[#0d3b86] px-4 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0d3b86]" /> Simple & Transparent
            </span>
            <h2 className="font-['DM_Sans'] font-black text-3xl md:text-4xl text-[#091a4f]">The Admission Journey</h2>
            <p className="text-gray-500 mt-3 max-w-md mx-auto">Five straightforward steps from enquiry to first day of school.</p>
          </div>
          <div className="relative">
            <div className="absolute left-[38px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#0d3b86] via-amber-400 to-transparent hidden md:block" aria-hidden="true" />
            <div className="space-y-8">
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.step} className="relative flex items-start gap-6" data-testid={`step-admission-${i + 1}`}>
                    <div className="relative flex-shrink-0 w-[76px] h-[76px] rounded-2xl flex flex-col items-center justify-center shadow-md z-10" style={{ background: i % 2 === 0 ? "#0d3b86" : "#f59e0b" }}>
                      <Icon className="w-6 h-6 text-white mb-0.5" />
                      <span className="text-[10px] font-black text-white/70">{s.step}</span>
                    </div>
                    <div className="pt-3">
                      <h3 className="font-['DM_Sans'] font-black text-lg text-[#091a4f]">{s.title}</h3>
                      <p className="text-gray-500 text-sm mt-1 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-10 text-center">
            <a href="#enquiry-form" data-testid="btn-journey-cta" className="inline-flex items-center gap-2 bg-[#0d3b86] hover:bg-[#091a4f] text-white font-bold px-8 py-3.5 rounded-full text-sm transition-colors shadow-lg shadow-blue-900/20">
              <CalendarCheck className="w-4 h-4" /> Start Your Journey — Book a Visit
            </a>
          </div>
        </div>
      </section>

      {/* ── 4. GRADE-WISE ADMISSIONS ─────────────────────────────────────── */}
      <section className="py-20 bg-[#f8faff]" data-testid="section-grade-wise">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-widest uppercase bg-[#eef5ff] text-[#0d3b86] px-4 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0d3b86]" /> For Every Stage
            </span>
            <h2 className="font-['DM_Sans'] font-black text-3xl md:text-4xl text-[#091a4f]">Admissions by Grade</h2>
            <p className="text-gray-500 mt-3 max-w-md mx-auto">Find the right programme for where your child is today.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {gradeBlocks.map((g) => (
              <div key={g.label} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group" data-testid={`card-grade-${g.label.toLowerCase().replace(/\s+/g, "-")}`}>
                <div className="h-44 overflow-hidden">
                  <img src={g.img} alt={`${g.label} at Rainbow International School Thane`} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block text-xs font-extrabold px-3 py-1 rounded-full" style={{ background: g.color, color: g.accent }}>{g.label}</span>
                    <span className="text-xs text-gray-400">{g.classes}</span>
                  </div>
                  <p className="text-[#091a4f] font-semibold text-sm mb-1.5 italic">"{g.concern}"</p>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{g.advantage}</p>
                  <a href={g.href} data-testid={`link-grade-${g.label.toLowerCase().replace(/\s+/g, "-")}`} className="inline-flex items-center gap-1.5 text-sm font-bold transition-colors" style={{ color: g.accent }}>
                    Learn more <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. DOCUMENTS REQUIRED ────────────────────────────────────────── */}
      <section className="py-20 bg-white" data-testid="section-documents">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-widest uppercase bg-[#eef5ff] text-[#0d3b86] px-4 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0d3b86]" /> Be Prepared
            </span>
            <h2 className="font-['DM_Sans'] font-black text-3xl md:text-4xl text-[#091a4f]">Documents Required</h2>
            <p className="text-gray-500 mt-3 max-w-sm mx-auto">Keep these ready before your campus visit to fast-track the process.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.map((doc, i) => (
              <div key={i} className="flex items-start gap-3 bg-[#f8faff] rounded-xl p-4 border border-blue-50" data-testid={`doc-item-${i}`}>
                <CheckCircle className="w-5 h-5 text-[#0d3b86] flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">{doc}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">Documents may vary by grade. The admissions team will confirm the full checklist during the counsellor call-back.</p>
        </div>
      </section>

      {/* ── 6. PARENT TRUST ──────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: "#091a4f" }} data-testid="section-trust">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-widest uppercase bg-white/10 text-amber-400 px-4 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Parent Voices
            </span>
            <h2 className="font-['DM_Sans'] font-black text-3xl md:text-4xl text-white">What Parents Say About RIS</h2>
            <div className="flex items-center justify-center gap-1 mt-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
              <span className="text-amber-400 font-bold text-sm ml-2">Highly Rated by Parents in Thane</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white/5 border border-white/10 rounded-2xl p-6" data-testid={`card-testimonial-${t.name.toLowerCase().replace(/\s+/g, "-")}`}>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-blue-100 text-sm leading-relaxed mb-5 italic">"{t.review}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0" style={{ background: t.color }}>{t.initials}</div>
                  <div>
                    <p className="text-white font-bold text-sm">{t.name}</p>
                    <p className="text-blue-300 text-xs">Parent · Rainbow International School</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Campus photo strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { src: "/images/gallery/sports/swimming-pool.jpg", alt: "Swimming pool at RIS Thane" },
              { src: "/images/gallery/sports/football-turf.jpg", alt: "Football turf at RIS Thane" },
              { src: "/images/gallery/educational/maths-science-lab.jpg", alt: "Maths and science lab RIS Thane" },
              { src: "/images/gallery/talent/multipurpose-hall.jpg", alt: "Multipurpose hall RIS Thane" },
            ].map(({ src, alt }) => (
              <div key={src} className="aspect-[4/3] rounded-xl overflow-hidden">
                <img src={src} alt={alt} loading="lazy" decoding="async" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>

          {/* Safety & transport assurance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            {[
              { Icon: Shield, title: "Safe & Secure Campus", desc: "CCTV, metal detectors, female-led Pre-Primary wing, on-campus infirmary and paediatrician on call." },
              { Icon: Bus,    title: "Transport Across Thane", desc: "GPS-tracked buses with trained attendants on 30+ routes — Brahmand, Ghodbunder, Manpada and more." },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="flex gap-4 bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm mb-1">{title}</p>
                  <p className="text-blue-200 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. FAQ ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#f8faff]" data-testid="section-faq">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-widest uppercase bg-[#eef5ff] text-[#0d3b86] px-4 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0d3b86]" /> Got Questions?
            </span>
            <h2 className="font-['DM_Sans'] font-black text-3xl md:text-4xl text-[#091a4f]">Frequently Asked Questions</h2>
          </div>
          <div className="divide-y divide-gray-200 rounded-2xl bg-white border border-gray-100 shadow-sm">
            {PAGE_FAQS.map((f, i) => (
              <details key={i} className="group p-5 md:p-6" data-testid={`faq-item-${i}`}>
                <summary className="cursor-pointer list-none flex items-start justify-between gap-4 text-[15px] font-semibold text-[#091a4f]">
                  <span>{f.q}</span>
                  <span aria-hidden="true" className="flex-shrink-0 text-amber-500 text-xl leading-none transition-transform group-open:rotate-45 select-none">+</span>
                </summary>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. FULL LEAD FORM (bottom) ───────────────────────────────────── */}
      <section className="py-20 bg-white" data-testid="section-bottom-form">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-widest uppercase bg-[#eef5ff] text-[#0d3b86] px-4 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0d3b86]" /> Start Today
            </span>
            <h2 className="font-['DM_Sans'] font-black text-3xl md:text-4xl text-[#091a4f]">Book a Campus Visit</h2>
            <p className="text-gray-500 mt-3 max-w-md mx-auto">See our 3.5-acre campus, meet the team and take the first step towards your child's best school years.</p>
          </div>
          <div className="bg-[#f8faff] border border-blue-100 rounded-3xl p-7 md:p-10">
            {submitted ? (
              <div className="flex flex-col items-center text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                  <CheckCircle className="w-9 h-9 text-green-500" />
                </div>
                <h3 className="font-['DM_Sans'] font-black text-2xl text-[#091a4f] mb-2">Thank You!</h3>
                <p className="text-gray-500 text-sm max-w-sm">Our admissions counsellor will contact you shortly to guide you through the next step.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" data-testid="form-bottom-enquiry">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={lbl}>Parent Name *</label>
                    <input name="parentName" value={form.parentName} onChange={handleChange} required placeholder="Your full name" className={inp} data-testid="input-bottom-parent-name" />
                  </div>
                  <div>
                    <label className={lbl}>Mobile Number *</label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="+91 XXXXX XXXXX" className={inp} data-testid="input-bottom-phone" />
                  </div>
                  <div>
                    <label className={lbl}>Child's Name *</label>
                    <input name="studentName" value={form.studentName} onChange={handleChange} required placeholder="Child's full name" className={inp} data-testid="input-bottom-student-name" />
                  </div>
                  <div>
                    <label className={lbl}>Grade Applying For *</label>
                    <select name="gradeApplying" value={form.gradeApplying} onChange={handleChange} required className={inp} data-testid="select-bottom-grade">
                      <option value="">Select grade</option>
                      {grades.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Your Area / Location</label>
                    <input name="location" value={form.location} onChange={handleChange} placeholder="Brahmand, Ghodbunder…" className={inp} data-testid="input-bottom-location" />
                  </div>
                  <div>
                    <label className={lbl}>Preferred Visit Date</label>
                    <input type="date" name="preferredDate" value={form.preferredDate} onChange={handleChange} className={inp} data-testid="input-bottom-preferred-date" />
                  </div>
                </div>
                <div>
                  <label className={lbl}>Message (optional)</label>
                  <textarea name="message" value={form.message} onChange={handleChange} rows={3} placeholder="Any specific questions or requirements…" className={inp + " resize-none"} data-testid="textarea-bottom-message" />
                </div>
                <button type="submit" disabled={mutation.isPending} data-testid="button-submit-bottom" className="w-full bg-[#0d3b86] hover:bg-[#091a4f] text-white font-bold py-4 rounded-xl text-sm tracking-wide transition-colors disabled:opacity-60 shadow-lg shadow-blue-900/20">
                  {mutation.isPending ? "Submitting…" : "Book My Campus Visit →"}
                </button>
                <p className="text-center text-xs text-gray-400">Our team responds within one working day · Mon–Sat, 9 AM–6 PM</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── 9. MOBILE STICKY CTA BAR ─────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 shadow-2xl" data-testid="mobile-sticky-bar">
        <div className="grid grid-cols-4">
          {[
            { href: "tel:+918291568972",                               label: "Call",       Icon: Phone,        bg: "#0d3b86", text: "#fff" },
            { href: "https://wa.me/918291568972?text=Admission+enquiry",label: "WhatsApp", Icon: MessageCircle, bg: "#25d366", text: "#fff" },
            { href: "#enquiry-form",                                   label: "Book Visit", Icon: CalendarCheck, bg: "#f59e0b", text: "#091a4f" },
            { href: "#enquiry-form",                                   label: "Apply Now",  Icon: ChevronRight,  bg: "#091a4f", text: "#fff" },
          ].map(({ href, label, Icon, bg, text }) => (
            <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} data-testid={`sticky-btn-${label.toLowerCase().replace(/\s+/g, "-")}`}
              className="flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-extrabold tracking-wide transition-opacity active:opacity-80"
              style={{ background: bg, color: text }}>
              <Icon className="w-5 h-5" />
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* Bottom padding to avoid content hiding behind sticky bar on mobile */}
      <div className="h-14 md:hidden" aria-hidden="true" />

      <Footer />
    </div>
  );
}
