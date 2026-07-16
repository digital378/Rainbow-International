import * as React from "react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import ScrollProgress from "@/components/home/ScrollProgress";
import { ChevronDown, ChevronUp, ExternalLink, BookOpen, GraduationCap } from "lucide-react";

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const SLUG = "spain-vs-argentina-world-cup-2026-final-lessons";

const META = {
  title: "Spain vs Argentina Final 2026: What It Teaches Your Child",
  description:
    "Spain meets Argentina in the World Cup 2026 Final on July 19. Rainbow International School Thane shows how the big finish is packed with geography and maths lessons for kids.",
  keywords:
    "Spain vs Argentina World Cup 2026 Final, World Cup learning activities for kids, World Cup 2026 geography lesson, teamwork lessons from sports, CBSE school Thane blog, Rainbow International School Thane",
};

const WC_WINNERS = [
  { country: "Brazil", wins: 5, years: "1958, 1962, 1970, 1994, 2002" },
  { country: "Germany", wins: 4, years: "1954, 1974, 1990, 2014" },
  { country: "Italy", wins: 4, years: "1934, 1938, 1982, 2006" },
  { country: "Argentina", wins: 3, years: "1978, 1986, 2022" },
  { country: "France", wins: 2, years: "1998, 2018" },
  { country: "Uruguay", wins: 2, years: "1930, 1950" },
  { country: "England", wins: 1, years: "1966" },
  { country: "Spain", wins: 1, years: "2010" },
];

const ALL_48_TEAMS = [
  ["USA (Host)", "Washington D.C.", "North America", 0],
  ["Canada (Host)", "Ottawa", "North America", 0],
  ["Mexico (Host)", "Mexico City", "North America", 0],
  ["Argentina", "Buenos Aires", "South America", 3],
  ["Brazil", "Brasília", "South America", 5],
  ["France", "Paris", "Europe", 2],
  ["England", "London", "Europe", 1],
  ["Spain", "Madrid", "Europe", 1],
  ["Germany", "Berlin", "Europe", 4],
  ["Portugal", "Lisbon", "Europe", 0],
  ["Netherlands", "Amsterdam", "Europe", 0],
  ["Belgium", "Brussels", "Europe", 0],
  ["Croatia", "Zagreb", "Europe", 0],
  ["Switzerland", "Bern", "Europe", 0],
  ["Austria", "Vienna", "Europe", 0],
  ["Scotland", "Edinburgh", "Europe", 0],
  ["Norway", "Oslo", "Europe", 0],
  ["Sweden", "Stockholm", "Europe", 0],
  ["Türkiye", "Ankara", "Europe/Asia", 0],
  ["Czechia", "Prague", "Europe", 0],
  ["Bosnia & Herzegovina", "Sarajevo", "Europe", 0],
  ["Uruguay", "Montevideo", "South America", 2],
  ["Colombia", "Bogotá", "South America", 0],
  ["Ecuador", "Quito", "South America", 0],
  ["Paraguay", "Asunción", "South America", 0],
  ["Japan", "Tokyo", "Asia", 0],
  ["South Korea", "Seoul", "Asia", 0],
  ["Australia", "Canberra", "Oceania/Asia", 0],
  ["Saudi Arabia", "Riyadh", "Asia", 0],
  ["Iran", "Tehran", "Asia", 0],
  ["Iraq", "Baghdad", "Asia", 0],
  ["Jordan ★", "Amman", "Asia", 0],
  ["Qatar", "Doha", "Asia", 0],
  ["Uzbekistan ★", "Tashkent", "Asia", 0],
  ["Morocco", "Rabat", "Africa", 0],
  ["Senegal", "Dakar", "Africa", 0],
  ["Egypt", "Cairo", "Africa", 0],
  ["Côte d'Ivoire", "Yamoussoukro", "Africa", 0],
  ["Ghana", "Accra", "Africa", 0],
  ["Algeria", "Algiers", "Africa", 0],
  ["Tunisia", "Tunis", "Africa", 0],
  ["South Africa", "Pretoria / Cape Town / Bloemfontein", "Africa", 0],
  ["DR Congo", "Kinshasa", "Africa", 0],
  ["Cabo Verde ★", "Praia", "Africa", 0],
  ["New Zealand", "Wellington", "Oceania", 0],
  ["Panama", "Panama City", "North America", 0],
  ["Haiti", "Port-au-Prince", "North America", 0],
  ["Curaçao ★", "Willemstad", "North America/Caribbean", 0],
];

const CONTINENTS = [
  ["Europe", 16],
  ["Africa", 10],
  ["Asia", 9],
  ["South America", 6],
  ["North & Central America + Caribbean", 6],
  ["Oceania", 1],
];

const TOP_SCORERS = [
  { rank: "=1st", player: "Lionel Messi", country: "Argentina", stat: 8 },
  { rank: "=1st", player: "Kylian Mbappé", country: "France (eliminated)", stat: 8 },
  { rank: "3rd", player: "Erling Haaland", country: "Norway (eliminated)", stat: 7 },
  { rank: "=4th", player: "Harry Kane", country: "England (eliminated)", stat: 6 },
  { rank: "=4th", player: "Jude Bellingham", country: "England (eliminated)", stat: 6 },
  { rank: "=5th", player: "Mikel Oyarzabal", country: "Spain", stat: 5 },
];

const TOP_ASSISTS = [
  { rank: "1st", player: "Michael Olise", country: "France (eliminated)", stat: 5 },
  { rank: "=2nd", player: "Bruno Guimarães", country: "Brazil (eliminated)", stat: 4 },
  { rank: "=2nd", player: "Brahim Díaz", country: "Morocco (eliminated)", stat: 4 },
  { rank: "=2nd", player: "Lionel Messi", country: "Argentina", stat: 4 },
];

const COMBINED_CONTRIBUTIONS = [
  { rank: "1st", player: "Kylian Mbappé", country: "France (eliminated)", stat: 11 },
  { rank: "2nd", player: "Lionel Messi", country: "Argentina", stat: 10 },
  { rank: "=3rd", player: "Jude Bellingham", country: "England (eliminated)", stat: 7 },
  { rank: "=3rd", player: "Erling Haaland", country: "Norway (eliminated)", stat: 7 },
  { rank: "=3rd", player: "Harry Kane", country: "England (eliminated)", stat: 7 },
];

const HEAD_TO_HEAD = [
  ["World Cup titles", "1 (2010)", "3 (1978, 1986, 2022)"],
  ["World Cup finals played", "2nd appearance", "7th appearance (3 wins)"],
  ["Captain for the final", "Rodri", "Lionel Messi (age 39)"],
  ["Top scorer this tournament", "Mikel Oyarzabal (5 goals)", "Lionel Messi (8 goals)"],
  ["Goals conceded in 2026 WC", "Only 1 in 7 games", "7 in 7 games"],
  ["Style of play", "Patient passing, disciplined defence", "Counter-attack, flair, Messi"],
];

const FAQS = [
  {
    q: "When is the FIFA World Cup 2026 final?",
    a: "The final is Spain vs Argentina on Sunday, July 19, 2026 at MetLife Stadium in East Rutherford, New Jersey. The third-place match is France vs England the day before, Saturday July 18, at Hard Rock Stadium in Miami. Both matches kick off in the late evening India time, so plan ahead.",
  },
  {
    q: "How many teams are playing in the FIFA World Cup 2026?",
    a: "This is the first 48-team World Cup, up from 32 in previous editions, played across 12 groups and 104 matches.",
  },
  {
    q: "Will the World Cup affect my child's exam or school schedule?",
    a: "Most matches kick off late at night or early morning in Indian Standard Time, so with some routine planning it shouldn't conflict with regular school hours. We'd still recommend keeping bedtime and homework routines steady where possible.",
  },
  {
    q: "How can schools use the World Cup for learning?",
    a: "Teachers can use match data for maths exercises, host countries for geography, and match outcomes for discussions on teamwork and resilience — exactly the kind of cross-curricular, real-world learning we encourage at Rainbow International School.",
  },
];

const TOC_ITEMS = [
  { id: "primer", label: "World Cup 2026 Primer" },
  { id: "geography", label: "Geography Lessons" },
  { id: "maths", label: "The Maths in the Game" },
  { id: "teamwork", label: "Teamwork & Resilience" },
  { id: "family-learning", label: "Family Learning Tips" },
  { id: "faq", label: "Frequently Asked Questions" },
  { id: "48-nations", label: "Meet the 48 Nations" },
  { id: "the-final", label: "The Big Final" },
  { id: "stat-leaders", label: "Stat Leaders" },
  { id: "conclusion", label: "Conclusion" },
];

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */

function Callout({ type, children }: { type: "activity" | "tip" | "fact"; children: React.ReactNode }) {
  const styles = {
    activity: {
      bg: "bg-amber-50 border-amber-400",
      icon: "📚",
      label: "Classroom Activity",
      labelColor: "text-amber-700",
    },
    tip: {
      bg: "bg-blue-50 border-blue-400",
      icon: "💡",
      label: "Teaching Tip",
      labelColor: "text-blue-700",
    },
    fact: {
      bg: "bg-emerald-50 border-emerald-400",
      icon: "🌟",
      label: "Fun History Fact",
      labelColor: "text-emerald-700",
    },
  };
  const s = styles[type];
  return (
    <div className={`rounded-xl border-l-4 ${s.bg} p-4 my-6`}>
      <p className={`font-semibold text-sm mb-1 ${s.labelColor}`}>
        {s.icon} {s.label}
      </p>
      <div className="text-gray-700 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function ScrollTable({ children, caption }: { children: React.ReactNode; caption?: string }) {
  return (
    <div className="overflow-x-auto my-6 rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full text-sm text-left">
        {caption && (
          <caption className="text-xs text-gray-500 text-left px-4 py-2 bg-gray-50 border-b border-gray-200">
            {caption}
          </caption>
        )}
        {children}
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 bg-[#0d3b86] text-white font-semibold whitespace-nowrap text-xs uppercase tracking-wide">
      {children}
    </th>
  );
}

function Td({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return (
    <td className={`px-4 py-3 border-b border-gray-100 text-gray-700 ${highlight ? "font-semibold text-[#0d3b86]" : ""}`}>
      {children}
    </td>
  );
}

function AccordionItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
        aria-expanded={open}
        data-testid={`faq-toggle-${q.slice(0, 20).replace(/\s/g, "-").toLowerCase()}`}
      >
        <span className="font-semibold text-[#0d3b86] text-sm md:text-base pr-4">{q}</span>
        {open ? <ChevronUp className="shrink-0 text-amber-500 w-5 h-5" /> : <ChevronDown className="shrink-0 text-gray-400 w-5 h-5" />}
      </button>
      {open && (
        <div className="px-5 py-4 bg-amber-50 border-t border-gray-100 text-gray-700 text-sm leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="font-bold text-[#0d3b86] text-xl md:text-2xl mt-12 mb-4 scroll-mt-24 leading-tight"
    >
      {children}
    </h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-bold text-gray-800 text-base md:text-lg mt-8 mb-3 leading-snug">
      {children}
    </h3>
  );
}

function BodyP({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-700 leading-relaxed mb-4 text-[15px] md:text-base">{children}</p>;
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */

export default function BlogSpainArgentina() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  /* JSON-LD schemas */
  useEffect(() => {
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: META.title,
      description: META.description,
      image:
        "https://rainbowinternationalschool.in/og-image.jpg",
      author: {
        "@type": "Organization",
        name: "Rainbow International School Marketing Team",
        url: "https://rainbowinternationalschool.in",
      },
      publisher: {
        "@type": "Organization",
        name: "Rainbow International School",
        logo: {
          "@type": "ImageObject",
          url: "https://rainbowinternationalschool.in/logo.png",
        },
      },
      datePublished: "2026-07-16",
      dateModified: "2026-07-16",
      url: `https://rainbowinternationalschool.in/blog/${SLUG}`,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://rainbowinternationalschool.in/blog/${SLUG}`,
      },
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    };

    const scriptArticle = document.createElement("script");
    scriptArticle.type = "application/ld+json";
    scriptArticle.id = "ld-article";
    scriptArticle.textContent = JSON.stringify(articleSchema);
    document.head.appendChild(scriptArticle);

    const scriptFaq = document.createElement("script");
    scriptFaq.type = "application/ld+json";
    scriptFaq.id = "ld-faq";
    scriptFaq.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(scriptFaq);

    return () => {
      document.getElementById("ld-article")?.remove();
      document.getElementById("ld-faq")?.remove();
    };
  }, []);

  return (
    <>
      <SEO
        title={META.title}
        description={META.description}
        keywords={META.keywords}
        canonical={`https://rainbowinternationalschool.in/blog/${SLUG}`}
      />
      <ScrollProgress />
      <Navbar />

      <main className="min-h-screen bg-white">
        {/* ── HERO ── */}
        <div className="relative w-full bg-[#0d3b86] overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #f59e0b 0%, transparent 50%), radial-gradient(circle at 80% 50%, #3b82f6 0%, transparent 50%)" }}
          />
          {/* Hero image placeholder */}
          <div className="relative mx-auto max-w-4xl px-4 pt-8 pb-0">
            <div
              className="w-full rounded-t-2xl overflow-hidden bg-gradient-to-br from-blue-900 via-[#0d3b86] to-blue-800 flex items-center justify-center"
              style={{ minHeight: 220 }}
              role="img"
              aria-label="Students at Rainbow International School Thane doing a FIFA World Cup 2026 geography and maths activity in class"
            >
              <div className="text-center py-14 px-6">
                <div className="text-6xl mb-3">🏆⚽🌍</div>
                <p className="text-blue-200 text-sm max-w-sm mx-auto">
                  Students at Rainbow International School Thane doing a FIFA World Cup 2026 geography and maths activity in class
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── ARTICLE HEADER ── */}
        <div className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-4xl px-4 py-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {["Learning Beyond the Classroom", "CBSE School Thane", "World Cup 2026"].map((tag) => (
                <span key={tag} className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="font-extrabold text-[#0d3b86] text-2xl md:text-4xl leading-tight mb-4">
              What the Spain vs Argentina World Cup Final Can Teach Your Child
            </h1>

            {/* Byline / Last updated */}
            {/* NOTE: Update this date + the prediction/odds/quotes sections below once the July 19 final is played */}
            <p className="text-sm text-gray-500 mb-2" data-testid="blog-byline">
              Written by the Rainbow International School Marketing Team &nbsp;·&nbsp;{" "}
              <time dateTime="2026-07-16">Last updated 16 July 2026</time>
            </p>
            <p className="text-xs text-amber-600 bg-amber-50 inline-block px-3 py-1 rounded-full border border-amber-200">
              ⏰ Pre-match preview — see predictions &amp; odds sections below. Update post-July 19.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
          {/* ── MAIN CONTENT ── */}
          <article>
            {/* TABLE OF CONTENTS */}
            <nav className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-10" aria-label="Table of contents">
              <p className="font-bold text-[#0d3b86] text-sm mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> In this article
              </p>
              <ol className="space-y-1 list-decimal list-inside">
                {TOC_ITEMS.map(({ id, label }) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className="text-[#0d3b86] hover:text-amber-600 text-sm underline underline-offset-2"
                      data-testid={`toc-link-${id}`}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            {/* INTRO */}
            <BodyP>
              If dinner conversations at home have suddenly turned into match-time negotiations, you're not alone. The FIFA World Cup 2026 — running from June 11 to July 19 — is well underway, and it's hard to find a household in Thane where it hasn't taken over the TV remote at least once this month.
            </BodyP>
            <BodyP>
              Here's the good news for parents: this tournament isn't just 90 minutes of entertainment per match. Tucked inside the excitement is a genuine opportunity to talk to your child about geography, numbers, and the kind of life skills that don't always fit neatly into a textbook chapter. At{" "}
              <a href="https://rainbowinternationalschool.in/holistic-development-rainbow-international-school/" className="text-[#0d3b86] underline hover:text-amber-600" target="_blank" rel="noopener">
                Rainbow International School
              </a>
              , we believe learning happens everywhere — and the World Cup is currently one of the biggest, liveliest classrooms going.
            </BodyP>

            {/* ── SECTION 1: PRIMER ── */}
            <SectionHeading id="primer">A Quick FIFA World Cup 2026 Primer (For Parents Catching Up)</SectionHeading>
            <BodyP>
              In case you're piecing it together between meetings and homework checks: this edition is the biggest World Cup in history. 48 teams competed across 12 groups, playing a total of 104 matches. For the first time ever, three countries — the USA, Mexico, and Canada — co-hosted, spreading matches across 16 cities. The tournament wraps up with the final in New Jersey on July 19.
            </BodyP>
            <BodyP>
              That's plenty of material for a curious child to sink their teeth into — and plenty of natural openings for you to turn "Can I watch the match?" into "Let's watch it together and figure some things out."
            </BodyP>

            {/* ── SECTION 2: GEOGRAPHY ── */}
            <SectionHeading id="geography">Geography Lessons Hiding in Every Match</SectionHeading>
            <BodyP>
              Every match comes with a built-in geography lesson. With teams from across the globe playing in cities spread over three countries and several time zones, there's a lot to explore:
            </BodyP>
            <ul className="list-none space-y-3 mb-6 pl-0">
              {[
                "Pull up a world map (physical or digital) and have your child locate each competing country as it plays.",
                "Talk about why some matches air late at night in India — a simple, hands-on way to introduce time zones.",
                "Ask your child to guess which continent has the most teams in the tournament this year, then check together.",
              ].map((item, i) => (
                <li key={i} className="flex gap-3 items-start text-gray-700 text-sm md:text-base">
                  <span className="mt-1 w-5 h-5 shrink-0 rounded-full bg-amber-400 text-white text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <BodyP>
              This kind of casual mapping builds spatial awareness far more effectively than memorising a list of capitals ever could.
            </BodyP>

            {/* ── SECTION 3: MATHS ── */}
            <SectionHeading id="maths">The Maths Hiding in the Beautiful Game</SectionHeading>
            <BodyP>
              Group-stage standings are essentially a live maths worksheet. Wins are worth 3 points, draws 1, and losses 0 — and from there, your child can calculate:
            </BodyP>
            <ul className="list-none space-y-3 mb-6">
              {[
                "How many points a team needs to qualify for the knockout rounds",
                "Goal difference, and why it matters when teams are tied on points",
                'Simple probability — "If Team A needs to win by 2 goals, what are the chances?"',
              ].map((item, i) => (
                <li key={i} className="flex gap-3 items-start text-gray-700 text-sm md:text-base">
                  <span className="text-amber-500 mt-0.5">▸</span>
                  {item}
                </li>
              ))}
            </ul>
            <BodyP>
              Older children (Class 6 and up) can even build their own mini standings table on paper and update it after every match — a genuinely fun way to practise arithmetic without it feeling like homework.
            </BodyP>

            {/* ── SECTION 4: TEAMWORK ── */}
            <SectionHeading id="teamwork">Teamwork, Resilience, and a Few Real Underdog Stories</SectionHeading>
            <BodyP>
              This World Cup has already delivered its share of surprises — debut nations holding their own against footballing giants, and seasoned teams learning hard lessons. These moments are great conversation starters about resilience, sportsmanship, and what it really means to be part of a team, win or lose. It's the kind of values-based discussion that complements everything we work on in the classroom around collaboration and emotional resilience.
            </BodyP>

            {/* ── SECTION 5: FAMILY LEARNING ── */}
            <SectionHeading id="family-learning">Simple Ways to Turn World Cup Time Into Family Learning Time</SectionHeading>
            <ul className="list-none space-y-4 mb-6">
              {[
                "Pick one match a week to watch together as a family, and talk about the host city afterwards.",
                "Start a wall chart with flags of qualified teams, updated as the tournament progresses.",
                "Let your child be the "commentator" for five minutes of a match — a fun way to build vocabulary and confidence.",
                "Track the group tables together as a quick, low-pressure maths exercise.",
              ].map((item, i) => (
                <li key={i} className="flex gap-3 items-start text-gray-700 text-sm md:text-base">
                  <span className="mt-1 w-6 h-6 shrink-0 rounded-full bg-[#0d3b86] text-white text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            {/* ── SECTION 6: FAQ ── */}
            <SectionHeading id="faq">Frequently Asked Questions</SectionHeading>
            <div role="list">
              {FAQS.map(({ q, a }, i) => (
                <AccordionItem
                  key={i}
                  q={q}
                  a={a}
                  open={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </div>

            {/* ── SECTION 7: 48 NATIONS ── */}
            <SectionHeading id="48-nations">Meet the 48 Nations of FIFA World Cup 2026 — A Geography Classroom Like No Other</SectionHeading>
            <BodyP>
              This is the first World Cup in history to feature 48 teams, split across 12 groups of 4. For students, that's 48 countries to find on a map, 48 capitals to look up, and 48 flags to colour in. Here's a full look at every participating nation — with facts that go well beyond football.
            </BodyP>

            <SubHeading>The World Cup Winners — Countries That Have Lifted the Trophy</SubHeading>
            <BodyP>Only 8 countries have ever won the FIFA World Cup. Here's how they stack up:</BodyP>

            <ScrollTable caption="FIFA World Cup winners by number of titles">
              <thead>
                <tr>
                  <Th>Country</Th>
                  <Th>World Cup Wins</Th>
                  <Th>Years Won</Th>
                </tr>
              </thead>
              <tbody>
                {WC_WINNERS.map((row) => (
                  <tr key={row.country} className="odd:bg-white even:bg-gray-50 hover:bg-amber-50 transition-colors">
                    <Td highlight>{row.country}</Td>
                    <Td>{row.wins}</Td>
                    <Td>{row.years}</Td>
                  </tr>
                ))}
              </tbody>
            </ScrollTable>

            <Callout type="fact">
              Italy has won the World Cup four times — but did you know they failed to qualify for 2026? It's one of the biggest upsets in football history.
            </Callout>

            <SubHeading>All 48 Teams — Country, Capital, and Continent</SubHeading>
            <BodyP>
              Use the table below to find any team on a world map, identify their capital city, and explore which continent they come from. Teams marked with ★ are making their World Cup debut in 2026.
            </BodyP>

            <ScrollTable caption="All 48 FIFA World Cup 2026 participating nations — capital cities and continents. ★ = World Cup debut">
              <thead>
                <tr>
                  <Th>Team</Th>
                  <Th>Capital City</Th>
                  <Th>Continent</Th>
                  <Th>WC Wins</Th>
                </tr>
              </thead>
              <tbody>
                {ALL_48_TEAMS.map(([team, capital, continent, wins]) => (
                  <tr key={team as string} className="odd:bg-white even:bg-gray-50 hover:bg-amber-50 transition-colors">
                    <Td highlight>{team}</Td>
                    <Td>{capital}</Td>
                    <Td>{continent}</Td>
                    <Td>{wins}</Td>
                  </tr>
                ))}
              </tbody>
            </ScrollTable>

            <Callout type="activity">
              Curaçao, Jordan, Cabo Verde, and Uzbekistan (marked ★) are making their World Cup debut at this tournament — ask students to find these four countries on a map and share one interesting fact about each.
            </Callout>

            <SubHeading>Continents at a Glance — Who Has the Most Teams?</SubHeading>

            <ScrollTable caption="Number of FIFA World Cup 2026 teams by continent">
              <thead>
                <tr>
                  <Th>Continent</Th>
                  <Th>Number of Teams</Th>
                </tr>
              </thead>
              <tbody>
                {CONTINENTS.map(([continent, count]) => (
                  <tr key={continent as string} className="odd:bg-white even:bg-gray-50 hover:bg-amber-50 transition-colors">
                    <Td highlight>{continent}</Td>
                    <Td>{count}</Td>
                  </tr>
                ))}
              </tbody>
            </ScrollTable>

            <BodyP>
              <strong>Question for your child:</strong> Which continent has the most teams? Which has the fewest? Can you find all the African nations on a map?
            </BodyP>

            <SubHeading>Did You Know? World Cup Facts for Curious Minds</SubHeading>
            <ul className="list-none space-y-3 mb-6">
              {[
                "The first-ever FIFA World Cup was held in Uruguay in 1930. Uruguay won it — on home soil.",
                "Brazil is the only country to have played at every single World Cup — all 23 editions.",
                "The 2026 final takes place on 19 July at MetLife Stadium in East Rutherford, New Jersey, USA.",
                "The largest ever World Cup win was Australia 31–0 American Samoa in a qualifying match in 2001.",
                "Pelé of Brazil remains the only player to have won three World Cups (1958, 1962, 1970).",
                "This year's World Cup spans three countries — the first time in history the tournament has had more than two host nations.",
              ].map((fact, i) => (
                <li key={i} className="flex gap-3 items-start text-gray-700 text-sm md:text-base">
                  <span className="text-amber-500 shrink-0 mt-0.5 text-lg">⚽</span>
                  {fact}
                </li>
              ))}
            </ul>

            <SubHeading>First-Time Qualifiers — Brand New on the World Stage</SubHeading>
            <BodyP>Four nations are appearing at the FIFA World Cup for the very first time in 2026:</BodyP>
            <ul className="list-none space-y-3 mb-6">
              {[
                { name: "Curaçao", desc: "a small island in the Caribbean Sea, part of the Kingdom of the Netherlands" },
                { name: "Jordan", desc: "a country in the Middle East, neighbour to Saudi Arabia, Iraq, and Israel" },
                { name: "Cabo Verde", desc: "an island nation off the west coast of Africa" },
                { name: "Uzbekistan", desc: "a landlocked country in Central Asia, bordered by Kazakhstan and Afghanistan" },
              ].map(({ name, desc }) => (
                <li key={name} className="flex gap-3 items-start text-gray-700 text-sm md:text-base">
                  <span className="font-bold text-[#0d3b86] shrink-0">★ {name}</span>
                  <span>— {desc}</span>
                </li>
              ))}
            </ul>

            {/* ── SECTION 8: THE FINAL ── */}
            {/* NOTE TO EDITOR: Everything from here to Conclusion is time-bound.
                The predictions, odds, "records still possible" language, and paraphrased
                quotes will become inaccurate once the final is played on July 19, 2026.
                Plan to revisit this section immediately after the match and convert
                it from a preview into a match recap at the same URL. */}
            <SectionHeading id="the-final">The Big Final — Spain vs Argentina: What Every Student Should Know</SectionHeading>
            <BodyP>
              After six weeks of extraordinary football across 16 cities in three countries, it comes down to this: Spain vs Argentina in the 2026 FIFA World Cup Final at MetLife Stadium, New Jersey, on Sunday 19 July. It is the first time in the history of the World Cup that the reigning European Champions (Spain) and the reigning South American Champions (Argentina) have met in the final.
            </BodyP>

            <SubHeading>Head-to-Head — How Spain and Argentina Have Clashed</SubHeading>
            <BodyP>
              These two footballing nations have met 22 times in total, in friendlies and official competitions, but have never before met in a World Cup final — making Sunday 19 July a historic occasion.
            </BodyP>

            <ScrollTable caption="Spain vs Argentina head-to-head stats at FIFA World Cup 2026">
              <thead>
                <tr>
                  <Th>Stat</Th>
                  <Th>Spain</Th>
                  <Th>Argentina</Th>
                </tr>
              </thead>
              <tbody>
                {HEAD_TO_HEAD.map(([stat, spain, arg]) => (
                  <tr key={stat as string} className="odd:bg-white even:bg-gray-50 hover:bg-amber-50 transition-colors">
                    <Td><span className="font-medium text-gray-600">{stat}</span></Td>
                    <Td>{spain}</Td>
                    <Td>{arg}</Td>
                  </tr>
                ))}
              </tbody>
            </ScrollTable>

            <Callout type="fact">
              The last time Spain and Argentina played each other was a friendly in March 2018 — and Spain won 6–1! But Argentina have won the World Cup twice since that defeat. Both teams are completely different now.
            </Callout>

            <Callout type="activity">
              <strong>Classroom geography link:</strong> Spain's capital is Madrid. Argentina's capital is Buenos Aires. Find both on a world map — they are on opposite sides of the Atlantic Ocean, yet both countries share deep cultural roots because Spain colonised much of South America in the 16th century. Football, language, and passion connect them!
            </Callout>

            <SubHeading>Score Predictions — Who Will Win?</SubHeading>
            {/* NOTE TO EDITOR: These predictions will be stale after July 19.
                Update or remove this sub-section once the result is known. */}
            <BodyP>
              Analysts and data scientists have weighed in ahead of the final:
            </BodyP>
            <ul className="list-none space-y-3 mb-6">
              <li className="flex gap-3 items-start text-gray-700 text-sm md:text-base">
                <span className="font-semibold text-[#0d3b86] shrink-0">
                  <a href="https://squawka.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-600 inline-flex items-center gap-1">
                    Squawka <ExternalLink className="w-3 h-3" />
                  </a>
                </span>
                <span>(football stats site): Spain to win narrowly — Spain 2–1 Argentina.</span>
              </li>
              <li className="flex gap-3 items-start text-gray-700 text-sm md:text-base">
                <span className="font-semibold text-[#0d3b86] shrink-0">
                  <a href="https://espn.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-600 inline-flex items-center gap-1">
                    ESPN <ExternalLink className="w-3 h-3" />
                  </a>
                </span>
                <span>analysts: Spain favoured but Argentina dangerous — Spain 2–1 Argentina.</span>
              </li>
              <li className="flex gap-3 items-start text-gray-700 text-sm md:text-base">
                <span className="font-semibold text-[#0d3b86] shrink-0">
                  <a href="https://www.natesilver.net" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-600 inline-flex items-center gap-1">
                    Nate Silver <ExternalLink className="w-3 h-3" />
                  </a>
                </span>
                <span>(US data expert): Spain have the statistical edge.</span>
              </li>
              <li className="flex gap-3 items-start text-gray-700 text-sm md:text-base">
                <span className="font-semibold text-[#0d3b86] shrink-0">
                  <a href="https://draftkings.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-600 inline-flex items-center gap-1">
                    DraftKings <ExternalLink className="w-3 h-3" />
                  </a>
                </span>
                <span>Sportsbook (odds): Spain favourites (−164), Argentina underdogs (+134).</span>
              </li>
              <li className="flex gap-3 items-start text-gray-700 text-sm md:text-base">
                <span className="font-semibold text-[#0d3b86] shrink-0">Fans on social media:</span>
                <span>split 50–50 — could go to extra time or penalties.</span>
              </li>
            </ul>

            <Callout type="tip">
              <strong>Probability in maths:</strong> If Spain are favourites at −164 odds and Argentina are underdogs at +134, ask your child which team has the better statistical chance, and to convert those numbers into percentages (roughly 62% vs 43% — the two won't add to 100% because the bookmaker takes a cut).
            </Callout>

            <SubHeading>What the World Is Saying — Voices Around the Final</SubHeading>
            {/* NOTE TO EDITOR: All quotes below are paraphrased (not direct quotes) because
                original attributed quotes could not be verified against a press conference
                transcript or published interview. Do not convert these back to direct quotes
                without sourcing each one. */}
            <BodyP>
              Messi has spoken about wanting to win this final for his teammates and for Argentina's fans across the world.
            </BodyP>
            <BodyP>
              Spain's head coach has expressed full confidence in his squad, emphasising that the team believes deeply in each other.
            </BodyP>
            <BodyP>
              ESPN analysts have noted that Spain look like the best team in the tournament, while also cautioning that Messi's presence makes Argentina dangerous in any match, at any time.
            </BodyP>
            <BodyP>
              Lamine Yamal has spoken about Messi being his idol — while also making clear that on Sunday he will be competing against him on the pitch, not admiring him from afar.
            </BodyP>
            <BodyP>
              Football fans on social media have been drawn to the Yamal-vs-Messi angle — a 20-year age gap between opposing lead players, described by many as "the next Messi vs the original Messi."
            </BodyP>
            <Callout type="fact">
              Something genuinely remarkable: Lamine Yamal was photographed as a baby with Lionel Messi in 2007. Nineteen years later, that baby is Messi's opponent in a World Cup final — a widely reported detail that brings the story full circle.
            </Callout>

            {/* ── SECTION 9: STAT LEADERS ── */}
            <SectionHeading id="stat-leaders">Stat Leaders at the 2026 World Cup</SectionHeading>

            <SubHeading>Top Scorers (Golden Boot Race)</SubHeading>
            <ScrollTable caption="FIFA World Cup 2026 top scorers">
              <thead>
                <tr>
                  <Th>Rank</Th>
                  <Th>Player</Th>
                  <Th>Country</Th>
                  <Th>Goals</Th>
                </tr>
              </thead>
              <tbody>
                {TOP_SCORERS.map((row, i) => (
                  <tr key={i} className="odd:bg-white even:bg-gray-50 hover:bg-amber-50 transition-colors">
                    <Td>{row.rank}</Td>
                    <Td highlight>{row.player}</Td>
                    <Td>{row.country}</Td>
                    <Td>{row.stat}</Td>
                  </tr>
                ))}
              </tbody>
            </ScrollTable>

            <SubHeading>Top Assists — Creative Playmakers</SubHeading>
            <ScrollTable caption="FIFA World Cup 2026 top assist providers">
              <thead>
                <tr>
                  <Th>Rank</Th>
                  <Th>Player</Th>
                  <Th>Country</Th>
                  <Th>Assists</Th>
                </tr>
              </thead>
              <tbody>
                {TOP_ASSISTS.map((row, i) => (
                  <tr key={i} className="odd:bg-white even:bg-gray-50 hover:bg-amber-50 transition-colors">
                    <Td>{row.rank}</Td>
                    <Td highlight>{row.player}</Td>
                    <Td>{row.country}</Td>
                    <Td>{row.stat}</Td>
                  </tr>
                ))}
              </tbody>
            </ScrollTable>

            <SubHeading>Most Combined Goal Contributions (Goals + Assists)</SubHeading>
            <ScrollTable caption="FIFA World Cup 2026 combined goal contributions (goals + assists)">
              <thead>
                <tr>
                  <Th>Rank</Th>
                  <Th>Player</Th>
                  <Th>Country</Th>
                  <Th>Contributions</Th>
                </tr>
              </thead>
              <tbody>
                {COMBINED_CONTRIBUTIONS.map((row, i) => (
                  <tr key={i} className="odd:bg-white even:bg-gray-50 hover:bg-amber-50 transition-colors">
                    <Td>{row.rank}</Td>
                    <Td highlight>{row.player}</Td>
                    <Td>{row.country}</Td>
                    <Td>{row.stat}</Td>
                  </tr>
                ))}
              </tbody>
            </ScrollTable>

            <Callout type="activity">
              <strong>Classroom maths activity:</strong> Challenge students to add up all goals scored in the tournament so far, work out the average goals per match, and predict whether the final will finish 1–0 or 2–1 — real-world statistics in action.
            </Callout>

            <SubHeading>Messi's Record-Breaking 2026 World Cup</SubHeading>
            <BodyP>Lionel Messi enters Sunday's final having already broken or equalled several World Cup records:</BodyP>
            <ul className="list-none space-y-2 mb-4">
              {[
                "All-time World Cup goalscorer record, surpassing Germany's Miroslav Klose.",
                "Most assists in World Cup history.",
                "Most World Cup knockout-stage assists.",
                "Oldest outfield player ever to play in a World Cup semifinal.",
                "Oldest hat-trick scorer in World Cup history, from the group stage.",
              ].map((item, i) => (
                <li key={i} className="flex gap-3 items-start text-gray-700 text-sm md:text-base">
                  <span className="text-amber-500 shrink-0 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <BodyP>Still possible on Sunday:</BodyP>
            <ul className="list-none space-y-2 mb-4">
              {[
                "The Golden Boot — Messi is tied for the tournament's top scorer with 8 goals. If he scores in the final while Mbappé (in the 3rd-place match) does not, Messi wins his first-ever World Cup Golden Boot.",
                "Back-to-back World Cup winner — if Argentina win, Messi becomes the first player to win back-to-back World Cup titles since Brazil's players in 1958 and 1962, and the oldest World Cup winning captain ever.",
                "Triple World Cup finalist — only Cafu of Brazil has ever played in three World Cup finals. Messi can join him on Sunday.",
              ].map((item, i) => (
                <li key={i} className="flex gap-3 items-start text-gray-700 text-sm md:text-base">
                  <span className="text-blue-500 shrink-0 mt-0.5">→</span>
                  {item}
                </li>
              ))}
            </ul>
            <Callout type="activity">
              Messi's 8 goals in this tournament means he needs 6 more in one match to beat Just Fontaine's single-tournament record of 13 goals (set in 1958). That won't happen — but can your students calculate how many goals per game Messi averages across his 6 World Cups?
            </Callout>

            <SubHeading>7 Mind-Blowing Facts About This World Cup Final</SubHeading>
            <ol className="list-none space-y-4 mb-8">
              {[
                {
                  icon: "👶",
                  title: "A baby in the photo, now in the final",
                  body: "In 2007, Lamine Yamal was photographed as a newborn baby alongside Lionel Messi at a charity event. On Sunday, that baby — now 19 years old — plays against Messi in the World Cup Final.",
                },
                {
                  icon: "📅",
                  title: "20-year age gap",
                  body: "Lamine Yamal is 19, Lionel Messi is 39 — the widest gap between two finalists' lead players in World Cup final history.",
                },
                {
                  icon: "🏆",
                  title: "First EURO vs Copa America final",
                  body: "The first-ever World Cup final between the reigning European Champions (Spain, Euro 2024) and the reigning South American Champions (Argentina, Copa America 2024).",
                },
                {
                  icon: "⚡",
                  title: "Argentina's incredible comeback record",
                  body: "Six come-from-behind victories in this World Cup alone — more than any other team, including a 2–0 comeback against Egypt and two late goals against England in the semifinal.",
                },
                {
                  icon: "🛡️",
                  title: "Spain's fortress defence",
                  body: "Spain have conceded only one goal in seven matches — an extraordinary record at this level.",
                },
                {
                  icon: "📊",
                  title: "The final was predicted before it happened",
                  body: "Nate Silver's statistical model had Argentina and Spain as co-favourites before the tournament even kicked off.",
                },
                {
                  icon: "🌙",
                  title: "India stays up late — for both teams",
                  body: "Fans in Thane watching on IST will see the final kick off at roughly 12:30 AM Monday morning (July 20). Parents — just this once, maybe let them stay up.",
                },
              ].map((fact, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <span className="text-2xl shrink-0">{fact.icon}</span>
                  <div>
                    <p className="font-bold text-[#0d3b86] text-sm md:text-base mb-1">
                      {i + 1}. {fact.title}
                    </p>
                    <p className="text-gray-700 text-sm md:text-base">{fact.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            {/* ── CONCLUSION ── */}
            <SectionHeading id="conclusion">Conclusion</SectionHeading>
            <BodyP>
              The FIFA World Cup 2026 will move on, but the habits of curiosity it sparks don't have to. Geography on a map, numbers on a scoreboard, and lessons in teamwork are everywhere once you start looking for them — and that's exactly the kind of learning we encourage every day at Rainbow International School.
            </BodyP>
            <BodyP>
              We believe in{" "}
              <a
                href="https://rainbowinternationalschool.in/holistic-development-rainbow-international-school/"
                className="text-[#0d3b86] underline hover:text-amber-600"
                target="_blank"
                rel="noopener"
              >
                holistic development
              </a>{" "}
              — nurturing curious, confident learners who find lessons in the world around them, not just in their textbooks.
            </BodyP>

            {/* CTA */}
            <div className="bg-gradient-to-br from-[#0d3b86] to-blue-700 rounded-2xl p-6 md:p-8 text-center my-8">
              <GraduationCap className="w-10 h-10 text-amber-400 mx-auto mb-3" />
              <h3 className="font-extrabold text-white text-xl mb-2">Ready to join Rainbow International School?</h3>
              <p className="text-blue-100 text-sm mb-5 max-w-sm mx-auto">
                Discover a school where learning is an adventure — inside the classroom and beyond.
              </p>
              <a
                href="https://rainbowinternationalschool.in/application-form/"
                target="_blank"
                rel="noopener"
                className="inline-block bg-amber-400 hover:bg-amber-300 text-[#0d3b86] font-bold px-8 py-3 rounded-xl text-base transition-colors shadow-lg"
                data-testid="cta-explore-admissions"
              >
                Explore Admissions →
              </a>
            </div>

            {/* Cross-promotion */}
            <div className="border border-blue-100 bg-blue-50 rounded-xl p-5 my-6 flex gap-4 items-start">
              <span className="text-2xl shrink-0">🌈</span>
              <div>
                <p className="font-semibold text-[#0d3b86] text-sm mb-1">Looking for early-learning ideas for a younger child?</p>
                <p className="text-gray-700 text-sm">
                  Visit{" "}
                  <a
                    href="https://rainbowinternationalschool.in/rainbow-preschool-international/"
                    className="underline text-[#0d3b86] hover:text-amber-600"
                    target="_blank"
                    rel="noopener"
                  >
                    Rainbow Preschool International
                  </a>{" "}
                  for a fun World Cup-themed activity guide for toddlers and pre-schoolers too.
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
              {[
                "World Cup 2026 for kids",
                "learning through sports",
                "CBSE school Thane",
                "geography activities for children",
                "maths activities for kids",
                "holistic education",
              ].map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                  #{tag.replace(/\s/g, "")}
                </span>
              ))}
            </div>
          </article>

          {/* ── SIDEBAR ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Quick nav */}
              <div className="bg-[#0d3b86] rounded-2xl p-5 text-white">
                <p className="font-bold text-sm mb-3 text-amber-300">Quick Links</p>
                <ul className="space-y-2 text-sm">
                  {TOC_ITEMS.map(({ id, label }) => (
                    <li key={id}>
                      <a href={`#${id}`} className="text-blue-100 hover:text-amber-300 transition-colors">
                        → {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Admissions sidebar CTA */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <p className="font-bold text-[#0d3b86] text-sm mb-2">Admissions Open</p>
                <p className="text-gray-600 text-xs mb-4 leading-relaxed">
                  Rainbow International School, Thane — CBSE-affiliated, nurturing curious learners since 1992.
                </p>
                <a
                  href="https://rainbowinternationalschool.in/application-form/"
                  target="_blank"
                  rel="noopener"
                  className="block text-center bg-[#0d3b86] hover:bg-blue-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
                  data-testid="sidebar-cta-admissions"
                >
                  Apply Now →
                </a>
              </div>

              {/* Match info */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <p className="font-bold text-[#0d3b86] text-sm mb-3">🏟️ The Final</p>
                <dl className="space-y-2 text-xs text-gray-600">
                  <div><dt className="font-semibold text-gray-700">Teams</dt><dd>Spain vs Argentina</dd></div>
                  <div><dt className="font-semibold text-gray-700">Venue</dt><dd>MetLife Stadium, New Jersey</dd></div>
                  <div><dt className="font-semibold text-gray-700">Date</dt><dd>Sunday, 19 July 2026</dd></div>
                  <div><dt className="font-semibold text-gray-700">IST kick-off</dt><dd>~12:30 AM (early Monday)</dd></div>
                </dl>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}
