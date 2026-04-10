import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";

// ── Sports Wheel Diagram ──────────────────────────────────────────
const sportsItems = [
  { lines: ["Adventure", "Sports"], angle: 0,   color: "#f97316" },
  { lines: ["Athletics"],           angle: 30,  color: "#f97316" },
  { lines: ["Basketball"],          angle: 60,  color: "#16a34a" },
  { lines: ["Carom"],               angle: 90,  color: "#2563eb" },
  { lines: ["Chess"],               angle: 120, color: "#2563eb" },
  { lines: ["Cricket"],             angle: 150, color: "#dc2626" },
  { lines: ["Football"],            angle: 180, color: "#dc2626" },
  { lines: ["Karate"],              angle: 210, color: "#f97316" },
  { lines: ["Table", "Tennis"],     angle: 240, color: "#16a34a" },
  { lines: ["Swimming"],            angle: 270, color: "#0ea5e9" },
  { lines: ["Skating"],             angle: 300, color: "#1e3a8a" },
  { lines: ["Volleyball"],          angle: 330, color: "#a855f7" },
];

function SportsWheel() {
  // Centre shifted RIGHT so left-side labels (Swimming/Skating/Volleyball) don't clip
  const cx = 340, cy = 290;
  const ringR = 158;   // yellow ring radius
  const innerR = 118;  // image circle radius
  const textR  = 240;  // label radius – well outside the ring on all sides
  const toRad  = (deg: number) => (deg - 90) * Math.PI / 180;

  return (
    // viewBox wide enough: left edge needs cx – textR – 80 ≈ 20px margin → start at 0
    // right edge needs cx + textR + 80 ≈ 660 → width 680
    <svg viewBox="0 0 680 580" className="w-full max-w-2xl mx-auto" role="img" aria-label="Sports to Add Action" style={{ overflow: "visible" }}>
      <defs>
        <clipPath id="sc1">
          <circle cx={cx} cy={cy} r={innerR} />
        </clipPath>
      </defs>

      {/* Yellow filled ring */}
      <circle cx={cx} cy={cy} r={ringR} fill="#fffde7" stroke="#fbbf24" strokeWidth="12" />
      {/* White inner disc */}
      <circle cx={cx} cy={cy} r={innerR} fill="#e0edff" />
      {/* Sports image clipped to inner circle */}
      <image
        href="https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-thane-extracurricular-activity-special-assembly.jpg"
        x={cx - innerR} y={cy - innerR} width={innerR * 2} height={innerR * 2}
        clipPath="url(#sc1)"
        preserveAspectRatio="xMidYMid slice"
      />

      {sportsItems.map((sport, i) => {
        const rad  = toRad(sport.angle);
        const dotX = cx + ringR * Math.cos(rad);
        const dotY = cy + ringR * Math.sin(rad);
        const tx   = cx + textR * Math.cos(rad);
        const ty   = cy + textR * Math.sin(rad);
        const anchor: "start" | "middle" | "end" =
          tx < cx - 15 ? "end" : tx > cx + 15 ? "start" : "middle";
        // short connector line from ring edge to label
        const lx1 = cx + (ringR + 12) * Math.cos(rad);
        const ly1 = cy + (ringR + 12) * Math.sin(rad);
        const lx2 = cx + (textR - 28) * Math.cos(rad);
        const ly2 = cy + (textR - 28) * Math.sin(rad);

        return (
          <g key={i}>
            <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke={sport.color} strokeWidth="1.5" strokeOpacity="0.5" />
            <circle cx={dotX} cy={dotY} r={8} fill={sport.color} />
            {sport.lines.map((ln, li) => (
              <text
                key={li}
                x={tx}
                y={ty + li * 15 - (sport.lines.length - 1) * 7.5}
                textAnchor={anchor}
                fontSize="13"
                fontWeight="700"
                fill="#1f2937"
                fontFamily="Poppins, sans-serif"
              >
                {ln}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

// ── Clubs Wheel Diagram ───────────────────────────────────────────
// Pill labels: { label, lines[], angle, color, textColor }
const clubItems1to5 = [
  { lines: ["Science", "with fun"], angle: 277, color: "#16a34a", textColor: "#fff" },
  { lines: ["Orators"],             angle: 316, color: "#1e3a8a", textColor: "#fff" },
  { lines: ["Nature"],              angle: 0,   color: "#16a34a", textColor: "#fff" },
  { lines: ["General Knowledge", "Sharing"], angle: 45, color: "#f97316", textColor: "#fff" },
  { lines: ["Culinary only", "for Grade 3"], angle: 83, color: "#dc2626", textColor: "#fff" },
];

const clubItems6to8 = [
  { lines: ["Entrepreneur"],           angle: 97,  color: "#dc2626", textColor: "#fff" },
  { lines: ["Health &", "Wellness"],   angle: 126, color: "#f97316", textColor: "#fff" },
  { lines: ["Heritage"],               angle: 157, color: "#ca8a04", textColor: "#fff" },
  { lines: ["Nature"],                 angle: 183, color: "#16a34a", textColor: "#fff" },
  { lines: ["Orators"],                angle: 208, color: "#0891b2", textColor: "#fff" },
  { lines: ["Theatre"],                angle: 237, color: "#1e3a8a", textColor: "#fff" },
  { lines: ["Dance &", "Music"],       angle: 263, color: "#7c3aed", textColor: "#fff" },
];

function Pill({ lines, x, y, anchor, color, textColor }: {
  lines: string[]; x: number; y: number; anchor: "start" | "middle" | "end";
  color: string; textColor: string;
}) {
  const maxLen = Math.max(...lines.map(l => l.length));
  const pw = maxLen * 7.2 + 18;
  const ph = lines.length * 16 + 10;
  const rx = anchor === "end" ? x - pw : anchor === "start" ? x : x - pw / 2;
  const ry = y - ph / 2;

  return (
    <g>
      <rect x={rx} y={ry} width={pw} height={ph} rx={ph / 2} fill={color} />
      {lines.map((ln, li) => (
        <text
          key={li}
          x={rx + pw / 2}
          y={ry + ph / 2 + li * 16 - (lines.length - 1) * 8 + 4}
          textAnchor="middle"
          fontSize="10"
          fontWeight="700"
          fill={textColor}
          fontFamily="Poppins, sans-serif"
        >
          {ln}
        </text>
      ))}
    </g>
  );
}

function ClubsWheel() {
  // Centre shifted so left pills don't clip (need ~180px left of cx for pills+lines)
  const cx = 400, cy = 320;
  const innerR = 120;
  const ringR  = 160;
  const pillR  = 255;  // centre of pill label
  const toRad  = (deg: number) => (deg - 90) * Math.PI / 180;

  const allItems = [...clubItems1to5, ...clubItems6to8];

  // viewBox: left = cx - pillR - 160 = 400 - 255 - 160 = -15 → start at 0
  //          right = cx + pillR + 160 = 815 → width 820
  //          top = cy - pillR - 60 = 5 → start at 0
  //          bottom = cy + pillR + 60 = 635 → height 640
  return (
    <svg viewBox="0 0 820 640" className="w-full max-w-3xl mx-auto" role="img" aria-label="Clubs to Provide Intellectual Stimulation">

      {/* Outer dashed ring */}
      <circle cx={cx} cy={cy} r={ringR} fill="none" stroke="#6ee7b7" strokeWidth="2" strokeDasharray="6 4" />

      {/* Top half — Clubs for 1–5 */}
      <path d={`M ${cx - innerR} ${cy} A ${innerR} ${innerR} 0 0 1 ${cx + innerR} ${cy} Z`} fill="#60a5fa" />
      {/* Bottom half — Clubs for 6–8 */}
      <path d={`M ${cx - innerR} ${cy} A ${innerR} ${innerR} 0 0 0 ${cx + innerR} ${cy} Z`} fill="#2563eb" />

      {/* Dividing line */}
      <line x1={cx - innerR} y1={cy} x2={cx + innerR} y2={cy} stroke="white" strokeWidth="3" />

      {/* Inner labels — top half */}
      <text x={cx} y={cy - 36} textAnchor="middle" fontSize="14" fontWeight="800" fill="white" fontFamily="Poppins, sans-serif">Clubs</text>
      <text x={cx} y={cy - 19} textAnchor="middle" fontSize="11" fontWeight="600" fill="white" fontFamily="Poppins, sans-serif">for</text>
      <text x={cx} y={cy - 4}  textAnchor="middle" fontSize="14" fontWeight="800" fill="white" fontFamily="Poppins, sans-serif">1 to 5</text>
      {/* Inner labels — bottom half */}
      <text x={cx} y={cy + 20} textAnchor="middle" fontSize="14" fontWeight="800" fill="white" fontFamily="Poppins, sans-serif">Clubs</text>
      <text x={cx} y={cy + 36} textAnchor="middle" fontSize="11" fontWeight="600" fill="white" fontFamily="Poppins, sans-serif">for</text>
      <text x={cx} y={cy + 51} textAnchor="middle" fontSize="14" fontWeight="800" fill="white" fontFamily="Poppins, sans-serif">6 to 8</text>

      {/* Pills + connectors for every club item */}
      {allItems.map((item, i) => {
        const rad  = toRad(item.angle);
        const dotX = cx + ringR * Math.cos(rad);
        const dotY = cy + ringR * Math.sin(rad);
        const px   = cx + pillR * Math.cos(rad);
        const py   = cy + pillR * Math.sin(rad);
        const anchor: "start" | "middle" | "end" =
          px < cx - 20 ? "end" : px > cx + 20 ? "start" : "middle";

        const lx1 = cx + (ringR + 10) * Math.cos(rad);
        const ly1 = cy + (ringR + 10) * Math.sin(rad);
        const lx2 = cx + (pillR - 36) * Math.cos(rad);
        const ly2 = cy + (pillR - 36) * Math.sin(rad);

        return (
          <g key={i}>
            <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke={item.color} strokeWidth="1.5" strokeOpacity="0.6" />
            <circle cx={dotX} cy={dotY} r={7} fill={item.color} />
            <Pill lines={item.lines} x={px} y={py} anchor={anchor} color={item.color} textColor={item.textColor} />
          </g>
        );
      })}
    </svg>
  );
}

// ── Teaching Methodology ──────────────────────────────────────────
const activities = [
  {
    image: "/images/extra/classroom/science-lab.jpg",
    alt: "Students conducting experiments in the school science laboratory",
    title: "Exhibitions",
    description: "Annual Exhibitions for Science, Maths, Social Science, EVS & Language",
  },
  {
    image: "/images/extra/campus/bus-students.jpg",
    alt: "Students waving from the school bus window before an educational excursion",
    title: "Tours & Visits",
    description: "Exciting Recreational, Educational & Cultural Excursions",
  },
  {
    image: "/images/extra/events/choir-uniform.jpg",
    alt: "Students in school uniform singing Rise Up during special assembly",
    title: "Special Assembly",
    description: "Celebration of Fun & Educational U.N. days, Motivational Speeches & Meaningful Activities",
  },
  {
    image: "/images/extra/events/dance-boys.jpg",
    alt: "Boys performing an energetic dance at the Annual Day cultural event",
    title: "Cultural Activities",
    description: "Annual Day, Sports Day, Indian Festivals & School Events",
  },
];

// ── Parent Testimonials ───────────────────────────────────────────
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    quote: "The study pattern in Rainbow is very well balanced between books & extra activity. I love to hear from my 8 yr son when he explains everything he learnt — this means he is enjoying, which was not the case one year back. Great going Rainbow teachers, keep it up.",
    name: "Chandrasekhar Ella",
    photo: "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/04-copy.jpeg",
  },
  {
    quote: "Rainbow International School has been a wonderful experience for my daughter. The teachers are dedicated and the holistic approach to education is commendable.",
    name: "Priya Sharma",
    photo: "",
  },
  {
    quote: "My son loves coming to school every day. The extracurricular activities have helped him develop confidence and leadership skills.",
    name: "Rajesh Kumar",
    photo: "",
  },
];

export default function Extracurriculars() {
  const [current, setCurrent] = useState(0);
  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);
  const t = testimonials[current];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Extracurricular Activities"
        description="Rainbow International School — FIT INDIA School with sports, clubs, exhibitions, cultural activities and tours for holistic student development in Thane."
        keywords="extracurricular activities Thane school, Rainbow school sports clubs, FIT INDIA school Thane"
        canonical="https://www.rainbowinternationalschool.in/extracurriculars/"
        breadcrumbs={[
          { name: "Home", href: "https://www.rainbowinternationalschool.in/" },
          { name: "Extracurriculars", href: "https://www.rainbowinternationalschool.in/extracurriculars" },
        ]}
      />
      <Navbar />
      <PageBanner
        title="Extracurriculars"
        subtitle="Activity beyond the classroom for all-round excellence."
        breadcrumb={[{ label: "Extracurriculars" }]}
      />

      <main className="flex-grow">

        {/* ── FIT INDIA ─────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row items-center gap-8 p-8 md:p-12" style={{ background: "#f0f4ff" }}>
              <div className="flex-1 space-y-4">
                <h2 className="text-3xl font-black" style={{ color: "#0d3b86", fontFamily: "'DM Sans', sans-serif" }}>We are a FIT INDIA School</h2>
                <p className="text-gray-600 leading-relaxed">
                  Our declaration has been approved by the Ministry of Youth Affairs and Sports and we are a FIT INDIA School!
                </p>
                <a
                  href="https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-thane-fit-india-4-1.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white font-bold py-2.5 px-6 rounded-full transition-opacity hover:opacity-90"
                  style={{ background: "#0d3b86" }}
                  data-testid="link-fit-india-certificate"
                >
                  View Certificate →
                </a>
              </div>
              <div className="flex-shrink-0">
                <div className="w-36 h-36 rounded-2xl overflow-hidden flex items-center justify-center" style={{ background: "#e0edff" }}>
                  <img
                    src="https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-thane-fit-india-4-1.jpg"
                    alt="FIT INDIA School Certificate"
                    className="w-full h-full object-cover"
                    width={144}
                    height={144}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      el.style.display = "none";
                      el.parentElement!.innerHTML = `<div style="padding:16px;text-align:center;font-weight:900;font-size:24px;color:#0d3b86;line-height:1.1">FIT<br/>INDIA</div>`;
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Sports Wheel ──────────────────────────────────────── */}
        <section className="py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-black text-center mb-10" style={{ color: "#0d3b86", fontFamily: "'DM Sans', sans-serif" }}>Sports to Add Action</h2>
            <SportsWheel />
          </div>
        </section>

        {/* ── Clubs Wheel ───────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-black text-center mb-10" style={{ color: "#0d3b86", fontFamily: "'DM Sans', sans-serif" }}>Clubs to Provide Intellectual Stimulation</h2>
            <ClubsWheel />
          </div>
        </section>

        {/* ── Teaching Methodology ──────────────────────────────── */}
        <section className="py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-black text-center mb-12" style={{ color: "#0d3b86", fontFamily: "'DM Sans', sans-serif" }}>Teaching Methodology</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {activities.map((item, i) => (
                <div key={i} className="flex flex-col gap-3" data-testid={`card-extracurricular-${i}`}>
                  <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-gray-100">
                    <img
                      src={item.image}
                      alt={item.alt}
                      className="w-full h-full object-cover"
                      width={400}
                      height={300}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                  <div>
                    <h3 className="font-black text-sm leading-snug" style={{ color: "#0d3b86" }}>{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SMC & Environment Info ─────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-3xl space-y-8 text-gray-700 text-sm leading-relaxed">
            <div>
              <h3 className="font-black text-base text-gray-900 mb-2">Important SMC Decisions</h3>
              <p className="mb-2">The Important SMC decisions taken by the SMC were as follows:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>To apply for upgradation to CBSE.</li>
                <li>To gain approval for shift system from CBSE.</li>
                <li>Give approval for appointment of teaching staff as per requirement.</li>
              </ol>
            </div>

            <div>
              <h3 className="font-black text-base text-gray-900 mb-2">Field of Environment Education</h3>
              <p className="mb-2">The school's environment education programme aims to sensitize the students to the environment through hands on year long thought provoking activities. The vision of the School Management is to convert RIS into a Green School in the coming years.</p>
              <p className="mb-2">The first step taken in this direction has been to conduct an audit of the existing biodiversity and to further enhance it by developing an academic garden based on syllabus, vegetable and medicinal patch along with composting.</p>
              <p className="mb-2">Butterfly garden has been developed on a plot of 500 sq.ft, wherein different host plant and nectar producing plants have been nurtured to attract butterflies. As of now many species of butterflies can be spotted. The students are exposed to the lifecycle of a butterfly in reality.</p>
              <p className="mb-2">Tree Plantation Drive was organized on Children's Day to sensitize the young minds on the importance of nurturing trees.</p>
              <p>Swatch Bharat Abhiyan was conducted to instill in the minds the importance of keeping their surroundings clean for a healthy body and mind.</p>
            </div>

            <div>
              <h3 className="font-black text-base text-gray-900 mb-2">INNOVATIONS</h3>
              <p className="mb-2">Inclusive teaching practice for Mathematics. On World Smile Day a very innovative method of teaching the concepts of area was adopted by the Maths teachers of Std VI & VII. The students were asked to measure their own smiles.</p>
              <p className="mb-2">Experiential teaching practice in EVS: The students were taken to the Butterfly Garden created in their own school premises to impart the knowledge of the life of a butterfly.</p>
              <p className="mb-2">To disseminate mitigation measures that can be taken by the community at large, students of Class IX and X are made to create innovative table top calendars on the topics related to several natural and man-made calamities.</p>
              <p className="mb-2">To promote waste management programme that is initiated by the citizens of Thane, the school has joined the Plastic Revitalization Program.</p>
              <p>Assembly programmes, workshops for parents and training session for teachers are designed and conducted on innovative topics like regard for senior citizens, fitness programme etc.</p>
            </div>

            <div>
              <h3 className="font-black text-base text-gray-900 mb-2">PTA Activities</h3>
              <p className="mb-2">Members of the PTA actively involved themselves in the following activities:</p>
              <ul className="space-y-1">
                <li>A member arranged a talk for the students by the Ex Chairman of ISRO Shri A. S Kiran Kumar.</li>
                <li>Help in resolving staff and parent related issues.</li>
                <li>Involve themselves in the co-ordination and success of school programs like the School exhibition "IMPULSE", Annual Day Programme and all the other cultural programmes.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── Parents Corner ─────────────────────────────────────── */}
        <section className="py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <h2 className="text-3xl font-black mb-2" style={{ color: "#0d3b86" }}>Parents Corner</h2>
            <p className="text-gray-500 text-sm mb-10">Explore Parent's Response box down here.</p>

            <div className="relative bg-white rounded-3xl shadow-sm border border-gray-100 px-10 py-10">
              <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors" data-testid="button-prev-testimonial">
                <ChevronLeft size={18} className="text-gray-500" />
              </button>
              <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors" data-testid="button-next-testimonial">
                <ChevronRight size={18} className="text-gray-500" />
              </button>

              <p className="text-gray-700 italic leading-relaxed text-base mb-6">"{t.quote}"</p>

              {t.photo && (
                <img
                  src={t.photo}
                  alt={t.name}
                  className="w-14 h-14 rounded-full mx-auto mb-3 object-cover border-2 border-gray-100"
                  width={56}
                  height={56}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
              {!t.photo && (
                <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-black text-xl" style={{ background: "#0d3b86" }}>
                  {t.name[0]}
                </div>
              )}

              <p className="font-bold text-sm" style={{ color: "#f97316" }}>{t.name}</p>

              <div className="flex justify-center gap-1.5 mt-5">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrent(idx)}
                    className="w-2.5 h-2.5 rounded-full transition-all"
                    style={{ background: idx === current ? "#f97316" : "#d1d5db" }}
                    data-testid={`button-testimonial-dot-${idx}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
