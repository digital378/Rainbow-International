import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { ExternalLink } from "lucide-react";

const curriculum = [
  {
    subject: "English",
    detail: "Small letters, 2–3 letters' words, sentences, Q&A, cursive writing",
    icon: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/image-24-Traced.png",
    color: "#e0edff",
    accent: "#0d3b86",
  },
  {
    subject: "Math",
    detail: "Comparison, addition, subtraction, time, number names",
    icon: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/image-25-Traced.png",
    color: "#fff7e0",
    accent: "#d97706",
  },
  {
    subject: "Hindi",
    detail: "Swar, vyanjan, 2–3 letters' words",
    icon: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/image-26-Traced.png",
    color: "#e0f7f0",
    accent: "#059669",
  },
  {
    subject: "GK",
    detail: "Nature, transport, good manners, living & non-living, day & night, seasons, food, community helpers, my body & home",
    icon: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/image-27-Traced.png",
    color: "#f3e0ff",
    accent: "#7c3aed",
  },
];

const philosophy = [
  {
    title: "Focused Analysis",
    desc: "Alphabet games, complete sentences, simple math, critical thinking",
    color: "#e0edff",
    textColor: "#0d3b86",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="6" width="14" height="14" rx="3" stroke="#0d3b86" strokeWidth="2"/>
        <rect x="22" y="6" width="14" height="14" rx="3" stroke="#0d3b86" strokeWidth="2"/>
        <rect x="4" y="24" width="14" height="10" rx="3" stroke="#0d3b86" strokeWidth="2"/>
        <rect x="22" y="24" width="14" height="10" rx="3" stroke="#0d3b86" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    title: "Conceptual Focus",
    desc: "Visual arts, drama, science, reflection on previous lessons, drawing elaborate figures",
    color: "#fff3e0",
    textColor: "#b45309",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14" cy="20" r="9" stroke="#b45309" strokeWidth="2"/>
        <circle cx="26" cy="20" r="9" stroke="#b45309" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    title: "Making Connections",
    desc: "Observing the world, making meaning, adequate awareness of surroundings",
    color: "#e0f7f0",
    textColor: "#047857",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="14" r="5" stroke="#047857" strokeWidth="2"/>
        <circle cx="10" cy="30" r="4" stroke="#047857" strokeWidth="2"/>
        <circle cx="30" cy="30" r="4" stroke="#047857" strokeWidth="2"/>
        <line x1="20" y1="19" x2="10" y2="26" stroke="#047857" strokeWidth="2"/>
        <line x1="20" y1="19" x2="30" y2="26" stroke="#047857" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    title: "Exploring Imagination",
    desc: "Use of classroom interaction for framing original stories, inquiry about varied happenings",
    color: "#f3e0ff",
    textColor: "#6d28d9",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 28 Q10 10 20 8 Q30 10 32 28 Q28 34 20 34 Q12 34 8 28Z" stroke="#6d28d9" strokeWidth="2"/>
        <line x1="20" y1="34" x2="20" y2="38" stroke="#6d28d9" strokeWidth="2"/>
        <line x1="16" y1="38" x2="24" y2="38" stroke="#6d28d9" strokeWidth="2"/>
      </svg>
    ),
  },
];

const methodology = [
  {
    title: "Books",
    desc: "Activity books, E-learning, Flash cards, Memory books",
    img: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Books.jpg",
    fallback: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/PPS-02.jpg",
  },
  {
    title: "Spaces",
    desc: "Theme Based Classrooms, Picnics and Field Trips",
    img: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Space.jpg",
    fallback: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/pre-primary-school-nursery-jrkg-srkg-admissions-ad.jpg",
  },
  {
    title: "Action",
    desc: "Enactment, Puppet Shows, Muppet Shows, Celebrations",
    img: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Action.jpg",
    fallback: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/PPS-02.jpg",
  },
  {
    title: "Sound",
    desc: "Audio Visual Aids for Phonics, Rhymes and Stories",
    img: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Sound.jpg",
    fallback: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/pre-primary-school-nursery-jrkg-srkg-admissions-ad.jpg",
  },
];

export default function PrePrimary() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Pre-Primary School Thane - Nursery, Jr KG, Sr KG Admissions"
        description="Rainbow International School's Pre-Primary Section (Nursery, Jr KG, Sr KG) in Thane West. Activity-based, game-based learning for holistic development. Admissions open."
        keywords="pre-primary school Thane, nursery admission Thane West, Jr KG Sr KG admission, Rainbow preschool Thane"
        canonical="https://rainbowinternationalschool.in/pre-primary-school-thane/"
        ogImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/pre-primary-school-nursery-jrkg-srkg-admissions-ad.jpg"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "Academics", href: "https://rainbowinternationalschool.in/pre-primary-school-thane" },
          { name: "Pre-Primary", href: "https://rainbowinternationalschool.in/pre-primary-school-thane" },
        ]}
      />
      <Navbar />
      <PageBanner
        title="Pre-Primary Section"
        subtitle="Nursery | Jr KG | Sr KG"
        breadcrumb={[{ label: "Pre-Primary Section" }]}
        bgImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/pre-primary-school-nursery-jrkg-srkg-admissions-ad.jpg"
      />

      <main className="flex-grow">

        {/* ── Intro + Curriculum sidebar ───────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

              {/* Left — intro text */}
              <div className="lg:col-span-2 space-y-5">
                <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full" style={{ background: "#eef5ff", color: "#0d3b86" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  Early Learning
                </span>
                <h2 className="text-3xl font-black" style={{ color: "#0d3b86", fontFamily: "'DM Sans', sans-serif" }}>Pre-Primary Section</h2>
                <p className="text-base text-gray-500 font-semibold -mt-3">(Nursery | Jr KG | Sr KG)</p>
                <p className="text-gray-600 leading-relaxed">
                  The urgency of catching up has increased in a world that is continuously expanding and changing. We introduce our kids into academia in a way that ensures they are constantly one step ahead — learning, growing, and being nurtured without having to worry about the pace.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Their general growth is our sole concern, and thus we incorporate <strong>activity/game-based learning</strong> into their curriculum from a very young age. This is included in a curriculum that encourages children to be kids.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Their learning is supported by activities outside and within the four walls of their classroom, extending their horizons as far as possible to make room for growth. We safeguard them in a conducive yet challenging environment where life-long skills such as creativity, teamwork, and responsibility are cultivated.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Regular participation of parents in their activities is commonplace with us — we believe a steady partnership between us and parents will go a long way in the development of our students.
                </p>

                {/* Photo */}
                <img
                  src="/images/students/pre-primary-running.jpg"
                  alt="Pre-Primary kids running in colorful uniforms at Rainbow International School"
                  className="rounded-3xl w-full object-cover max-h-72 mt-4"
                  width={800}
                  height={400}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <img
                  src="/images/students/pre-primary-teacher.jpg"
                  alt="Pre-Primary teacher engaging with young students at Rainbow International School"
                  className="rounded-3xl w-full object-cover max-h-72 mt-4"
                  width={800}
                  height={400}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>

              {/* Right — admission CTA + curriculum card */}
              <div className="space-y-6">
                {/* Admission banner */}
                <div className="rounded-3xl border-2 border-amber-400 p-6 text-center" style={{ background: "#fffbeb" }}>
                  <p className="text-sm font-black uppercase tracking-wide mb-3" style={{ color: "#b45309" }}>
                    Admissions are Open for the Academic Year 2026–27
                  </p>
                  <a
                    href="#contact"
                    className="inline-block font-bold py-2.5 px-7 rounded-full text-white transition-opacity hover:opacity-90"
                    style={{ background: "#f97316" }}
                  >
                    Enquire Now
                  </a>
                </div>

                {/* Curriculum card */}
                <div className="rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4" style={{ background: "#0d3b86" }}>
                    <h3 className="text-white font-black text-lg">Curriculum</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {curriculum.map((c, i) => (
                      <div key={i} className="flex items-start gap-3 px-5 py-4 bg-white">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: c.color }}>
                          <img src={c.icon} alt={c.subject} className="w-6 h-6 object-contain"
                            width={24} height={24} loading="lazy" decoding="async"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        </div>
                        <div>
                          <p className="font-black text-sm" style={{ color: c.accent }}>{c.subject}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{c.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Curriculum Philosophy ─────────────────────────────── */}
        <section className="py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-black text-center mb-12" style={{ color: "#0d3b86", fontFamily: "'DM Sans', sans-serif" }}>Curriculum Philosophy</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {philosophy.map((p, i) => (
                <div
                  key={i}
                  className="rounded-3xl p-6 flex flex-col gap-4 border border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow"
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: p.color }}>
                    {p.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-base mb-2" style={{ color: p.textColor }}>{p.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Kindergarten Methodology ──────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-black text-center mb-12" style={{ color: "#0d3b86", fontFamily: "'DM Sans', sans-serif" }}>Kindergarten Methodology</h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {methodology.map((m, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-gray-100">
                    <img
                      src={m.img}
                      alt={m.title}
                      className="w-full h-full object-cover"
                      width={400}
                      height={300}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = m.fallback;
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-black text-base" style={{ color: "#0d3b86" }}>{m.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Evaluation Strategy */}
            <div className="max-w-lg mx-auto rounded-3xl border-2 border-amber-300 p-8 text-center" style={{ background: "#fffbeb" }}>
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#fef3c7" }}>
                <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="10" width="10" height="10" rx="2" stroke="#d97706" strokeWidth="2"/>
                  <rect x="20" y="18" width="10" height="10" rx="2" stroke="#d97706" strokeWidth="2"/>
                  <rect x="6" y="24" width="10" height="10" rx="2" stroke="#d97706" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="font-black text-xl mb-1" style={{ color: "#92400e" }}>Evaluation Strategy</h3>
              <p className="text-sm font-bold mb-3" style={{ color: "#b45309" }}>Curriculum — Two Tiers</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                End term assessments: Before Diwali break &amp; End of the year (March)
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Monthly assessment to understand ongoing progress
              </p>
            </div>
          </div>
        </section>

        {/* ── Rainbow Preschool International ───────────────────── */}
        <section className="py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

              {/* Main content */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#0d3b86" }}>About Rainbow Preschools</p>
                  <h2 className="text-3xl font-black mb-4" style={{ color: "#0d3b86", fontFamily: "'DM Sans', sans-serif" }}>
                    Rainbow Preschool International —{" "}
                    <a href="https://www.rainbowpreschools.com" target="_blank" rel="noopener noreferrer"
                      className="underline underline-offset-4 hover:opacity-80 transition-opacity" style={{ color: "#f97316" }}>
                      Where Every Journey Begins
                    </a>
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Before children step into the Pre-Primary section at Rainbow International School, many begin their educational journey at{" "}
                    <a href="https://www.rainbowpreschools.com" target="_blank" rel="noopener noreferrer"
                      className="font-semibold text-orange-500 hover:underline">Rainbow Preschool International (RPS)</a> — our award-winning, CBSE-aligned sister preschool brand with multiple branches across Thane.
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    RPS follows the same play-based, activity-rich philosophy as our Pre-Primary section, ensuring a seamless and anxiety-free transition to formal schooling. Children nurtured at{" "}
                    <a href="https://www.rainbowpreschools.com/why-rainbow-preschool-best-thane-2026" target="_blank" rel="noopener noreferrer"
                      className="font-semibold text-orange-500 hover:underline">Rainbow Preschool</a>{" "}
                    arrive at Rainbow International School with strong foundational skills in literacy, numeracy, social interaction, and creative thinking.
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Recognised among{" "}
                    <a href="https://www.rainbowpreschools.com" target="_blank" rel="noopener noreferrer"
                      className="font-semibold text-orange-500 hover:underline">India's 10 Best Preschools</a>{" "}
                    by The Knowledge Review Magazine and honoured at the 15th World Education Summit for innovation in early childhood education, RPS brings world-class early learning to Thane's families.
                  </p>
                </div>

                {/* Transition pathway — pyramid */}
                <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-7">
                  <h3 className="font-black text-lg mb-6" style={{ color: "#0d3b86" }}>The Rainbow Learning Pathway</h3>
                  <div className="grid grid-cols-3 gap-3 sm:gap-0 sm:flex sm:items-end relative">
                    <a
                      href="https://www.rainbowpreschools.com/programmes"
                      target="_blank" rel="noopener noreferrer"
                      className="rounded-2xl text-center hover:opacity-90 transition-opacity relative"
                      style={{
                        padding: "14px 10px 16px",
                        background: "#fff7e0",
                        zIndex: 1,
                      }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#b4530999" }}>Step 1</p>
                      <p className="font-black text-sm leading-tight" style={{ color: "#b45309" }}>Playgroup / Nursery</p>
                      <p className="text-[10px] mt-1.5 leading-snug" style={{ color: "#b45309bb" }}>Rainbow Preschool International</p>
                    </a>

                    <a
                      href="https://www.rainbowpreschools.com/kindergarten"
                      target="_blank" rel="noopener noreferrer"
                      className="rounded-2xl text-center hover:opacity-90 transition-opacity relative"
                      style={{
                        padding: "20px 10px 22px",
                        background: "#e0f7f0",
                        zIndex: 2,
                      }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#04785799" }}>Step 2</p>
                      <p className="font-black text-sm sm:text-base leading-tight" style={{ color: "#047857" }}>Jr. KG / Sr. KG</p>
                      <p className="text-[10px] mt-1.5 leading-snug" style={{ color: "#047857bb" }}>Rainbow Preschool International</p>
                    </a>

                    <a
                      href="/primary-section"
                      className="rounded-2xl text-center hover:opacity-90 transition-opacity relative"
                      style={{
                        padding: "28px 10px 30px",
                        background: "#e0edff",
                        zIndex: 3,
                        boxShadow: "0 4px 16px rgba(13,59,134,0.12)",
                      }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#0d3b8699" }}>Step 3</p>
                      <p className="font-black text-sm sm:text-lg leading-tight" style={{ color: "#0d3b86" }}>Class 1 onwards</p>
                      <p className="text-[11px] mt-1.5 leading-snug" style={{ color: "#0d3b86bb" }}>Rainbow International School</p>
                    </a>
                  </div>
                </div>

                {/* What makes RPS special */}
                <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-7">
                  <h3 className="font-black text-lg mb-5" style={{ color: "#0d3b86" }}>What Makes Rainbow Preschool Special</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { title: "Play-Based Curriculum", desc: "Learning through structured play, arts, music, movement and storytelling — the way young minds are meant to grow." },
                      { title: "Theme-Based Classrooms", desc: "Vibrant, print-rich environments that spark curiosity and make every school day an adventure." },
                      { title: "Trained Early Childhood Educators", desc: "Every RPS teacher is specially trained in early childhood development and child psychology." },
                      { title: "Parent Partnership Programme", desc: "Regular parent-teacher interactions, workshops and progress updates ensure families are always involved." },
                      { title: "Safe & Nurturing Environment", desc: "CCTV-monitored, GPS-enabled transport, qualified first-aid staff and zero-tolerance bullying policy." },
                      { title: "Seamless RIS Transition", desc: "Children graduating from RPS are academically and emotionally prepared for Class 1 at Rainbow International School." },
                    ].map((f, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#f97316" }} />
                        <div>
                          <p className="font-black text-sm text-gray-800">{f.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-5">

                {/* Visit RPS CTA */}
                <div className="rounded-3xl p-6 text-center" style={{ background: "#fff7ed", border: "2px solid #fed7aa" }}>
                  <div className="w-20 h-20 rounded-2xl mx-auto mb-4 overflow-hidden flex items-center justify-center bg-white shadow-sm">
                    <img src="/rps-logo.png" alt="Rainbow Preschool International" className="w-full h-full object-contain" width={80} height={80} loading="lazy" decoding="async" />
                  </div>
                  <p className="font-black text-base mb-1" style={{ color: "#b45309" }}>Rainbow Preschool International</p>
                  <p className="text-xs text-gray-500 mb-4">Award-winning preschools across Thane</p>
                  <a href="https://www.rainbowpreschools.com/best-preschool-near-me-in-thane" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-bold py-2.5 px-6 rounded-full text-white transition-opacity hover:opacity-90"
                    style={{ background: "#f97316" }}
                    data-testid="link-rps-main">
                    <ExternalLink size={14} />
                    Visit RPS Website
                  </a>
                </div>

                {/* RPS Branches */}
                <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6">
                  <h4 className="font-black text-sm uppercase tracking-wider mb-4 pb-3 border-b border-gray-100 text-gray-800">RPS Branches in Thane</h4>
                  <ul className="space-y-2.5">
                    {[
                      { label: "Manpada", href: "https://www.rainbowpreschools.com/preschool-in-manpada-thane" },
                      { label: "Hariniwas", href: "https://www.rainbowpreschools.com/preschool-in-hariniwas-thane" },
                      { label: "Anand Nagar", href: "https://www.rainbowpreschools.com/preschool-in-anand-nagar-thane" },
                      { label: "Kasarvadavali", href: "https://www.rainbowpreschools.com/preschool-in-kasarvadavali-thane" },
                      { label: "Dhokali", href: "https://www.rainbowpreschools.com/preschool-in-dhokali-thane" },
                      { label: "Kalwa", href: "https://www.rainbowpreschools.com/preschool-in-kalwa-thane" },
                    ].map((b, i) => (
                      <li key={i}>
                        <a href={b.href} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-500 transition-colors group"
                          data-testid={`link-rps-branch-${i}`}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-orange-300 group-hover:bg-orange-500 transition-colors" />
                          {b.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* RPS Quick Links */}
                <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6">
                  <h4 className="font-black text-sm uppercase tracking-wider mb-4 pb-3 border-b border-gray-100 text-gray-800">Explore RPS</h4>
                  <ul className="space-y-2.5">
                    {[
                      { label: "Why Rainbow Preschool", href: "https://www.rainbowpreschools.com/why-rainbow-preschool-best-thane-2026" },
                      { label: "Awards & Recognition", href: "https://www.rainbowpreschools.com/rainbow-preschool-awards-recognition" },
                      { label: "Parent Testimonials", href: "https://www.rainbowpreschools.com/parent-testimonials-rainbow-preschool" },
                      { label: "Play-Based Learning", href: "https://www.rainbowpreschools.com/blog/how-play-based-learning-shapes-young-minds" },
                      { label: "First Day at Preschool", href: "https://www.rainbowpreschools.com/blog/preparing-your-child-for-first-day-preschool" },
                      { label: "Admissions at RPS", href: "https://www.rainbowpreschools.com/admissions" },
                    ].map((l, i) => (
                      <li key={i}>
                        <a href={l.href} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-500 transition-colors group"
                          data-testid={`link-rps-explore-${i}`}>
                          <ExternalLink size={11} className="flex-shrink-0 text-gray-300 group-hover:text-orange-400 transition-colors" />
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ── Admissions CTA strip ──────────────────────────────── */}
        <div className="py-14 text-center" style={{ background: "#091a4f" }}>
          <p className="text-white font-bold text-lg mb-4">Admissions are Open for the Academic Year 2026–27</p>
          <a href="#contact" className="inline-block text-white font-bold py-3 px-8 rounded-full border-2 border-amber-400 hover:bg-amber-400 hover:text-gray-900 transition-colors">
            Enquire Now
          </a>
        </div>

        {/* ── Contact Form ──────────────────────────────────────── */}
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
