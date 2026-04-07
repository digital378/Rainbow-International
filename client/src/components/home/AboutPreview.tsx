import { Link } from "wouter";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const stats = [
  { target: 50000, suffix: "+", label: "Happy Students", display: "50K+" },
  { target: 2009, suffix: "", label: "Established", display: "2009" },
  { target: 3.5, suffix: " Acres", label: "Campus Area", display: "3.5 Acres", decimals: 1 },
  { target: 100000, suffix: "+", label: "Lives Impacted", display: "1 Lac+" },
];

const highlights = [
  "CBSE Affiliated (No. 1130661)",
  "Nursery to Class 12",
  "Multiple Intelligence methodology",
  "3.5-acre green campus in Thane",
];

function formatNum(val: number, decimals?: number, suffix?: string, target?: number): string {
  if (target === 100000) {
    const lac = val / 100000;
    if (lac >= 1) return "1 Lac+";
    return `${Math.floor(val / 1000)}K+`;
  }
  if (target === 50000) {
    return `${Math.floor(val / 1000)}K+`;
  }
  if (decimals) {
    return val.toFixed(decimals) + (suffix || "");
  }
  return Math.floor(val).toString() + (suffix || "");
}

function CountUp({ stat }: { stat: typeof stats[0] }) {
  const [value, setValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 2000;
          const startTime = performance.now();
          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(eased * stat.target);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated, stat.target]);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center text-center bg-white p-7 shadow-sm border border-gray-100 hover:shadow-md hover:border-amber-200 transition-all"
      style={{ width: "165px", height: "165px", borderRadius: "16px" }}
    >
      <div className="text-[28px] font-extrabold leading-none mb-2" style={{ color: "#091a4f" }}>
        {hasAnimated ? formatNum(value, stat.decimals, stat.suffix, stat.target) : "0"}
      </div>
      <div className="text-xs font-semibold text-gray-500 leading-snug">{stat.label}</div>
    </div>
  );
}

export function AboutPreview() {
  return (
    <section className="py-24" style={{ background: "#f8fafc" }}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-16 xl:gap-24 items-center">

          <div className="flex-1">
            <div className="inline-block mb-5">
              <span className="text-amber-500 text-xs font-semibold tracking-[0.2em] uppercase">Why Choose Us</span>
              <div className="w-8 h-0.5 bg-amber-400 mt-2" />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
              Why Parents Trust<br />
              <span style={{ color: "#091a4f" }}>Rainbow</span>
            </h2>

            <div className="space-y-4 text-gray-600 text-[15px] leading-[1.8] mb-7">
              <p>Rainbow International School is a trailblazer in the arena of education with a passion for excellence. We are considered as one of the top CBSE schools in Thane because we emphasize that the child enjoys his learning, dares to dream, and becomes a lifelong learner.</p>
              <p>Our expert educators provide a conducive environment with their multicultural perspectives. Social ethics like empathy, compassion, and respect for others is inculcated in the pedagogy. We provide state-of-the-art facilities, technologies, and infrastructure to optimize teaching and learning outcomes.</p>
              <p>Our educational programs support child's academic, moral, social, and physical development. Our curriculum reflects global, rural, and urban dimensions, thereby preparing our students to face all future challenges. At the preschool level, we follow the theory of{" "}
                <Link href="/about-rainbow-international-school" className="font-medium underline" style={{ color: "#091a4f" }} data-testid="link-multiple-intelligence">Multiple Intelligence</Link>{" "}for holistic development.</p>
              <p>We are proud to consistently deliver world-class education and remain the best international school in Thane.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
              {highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} className="text-amber-500 flex-shrink-0" />
                  <span className="text-gray-600 text-sm">{h}</span>
                </div>
              ))}
            </div>

            <Link
              href="/about-rainbow-international-school"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 font-bold text-white text-sm transition-all duration-300 hover:opacity-90 hover:shadow-lg"
              style={{ background: "#091a4f", borderRadius: "9999px" }}
              data-testid="button-about-us"
            >
              Learn More About Us
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="flex-shrink-0">
            <div className="grid grid-cols-2 gap-3">
              {stats.map((s, i) => (
                <CountUp key={i} stat={s} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
