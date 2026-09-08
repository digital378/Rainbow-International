import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, Check, Copy, Menu, Sparkles, Volume2, X } from "lucide-react";

const chapters = [
  { id: "arrival", no: "01", label: "Arrival", title: "A festival enters the room", text: "Ganesh Chaturthi begins with an invitation: make space for wisdom, new beginnings, and the courage to meet an obstacle differently." },
  { id: "story", no: "02", label: "The story", title: "A guardian made from earth", text: "The story of Ganesha is told across generations — a child, a promise, and the understanding that love can turn a threshold into a home." },
  { id: "learning", no: "03", label: "Learn & make", title: "Turn celebration into a classroom", text: "History, language, craft, and care belong together. Choose a small action below and carry the festival forward." },
];

export function LivingProcession() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState("arrival");
  const [open, setOpen] = useState(false);
  const [quiz, setQuiz] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [wish, setWish] = useState("May wisdom clear every new path.");
  const dates = useMemo(() => [
    ["Sthapana", "14 SEP 2026"],
    ["Visarjan", "25 SEP 2026"],
  ], []);
  const go = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    setOpen(false);
  };
  const copyWish = async () => {
    await navigator.clipboard?.writeText(wish);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <main className="procession">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        :root { --ink:#f8f1df; --deep:#07152f; --mid:#0d2850; --saff:#e47c36; --gold:#f3c969; --mist:#bdc8cf; --cream:#fbf5e7; }
        * { box-sizing:border-box; } html { scroll-behavior:smooth; }
        body { margin:0; background:var(--deep); }
        .procession { min-height:100vh; overflow:hidden; color:var(--ink); background:var(--deep); font-family:'Plus Jakarta Sans',sans-serif; }
        .procession button { font:inherit; }
        .topline { height:4px; background:linear-gradient(90deg,var(--saff),var(--gold),#fbdf94); position:fixed; inset:0 0 auto; z-index:30; }
        .nav { position:fixed; z-index:20; top:4px; left:0; right:0; display:flex; align-items:center; justify-content:space-between; padding:20px clamp(20px,5vw,70px); border-bottom:1px solid rgba(255,255,255,.12); background:rgba(7,21,47,.68); backdrop-filter:blur(14px); }
        .brand { display:flex; gap:11px; align-items:center; color:var(--ink); font-size:12px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
        .brand-mark { width:27px; height:27px; border:1px solid var(--gold); border-radius:50%; display:grid; place-items:center; color:var(--gold); font-family:'Fraunces'; font-size:16px; }
        .menu { display:flex; gap:28px; align-items:center; } .menu button,.menu a { color:var(--mist); background:none; border:0; cursor:pointer; font-size:11px; letter-spacing:.1em; text-decoration:none; text-transform:uppercase; }
        .menu button:hover,.menu a:hover { color:var(--gold); } .menu-toggle { display:none; background:none; border:0; color:var(--ink); }
        .hero { min-height:800px; padding:180px clamp(24px,9vw,140px) 110px; position:relative; isolation:isolate; background:radial-gradient(ellipse at 69% 38%,rgba(228,124,54,.22),transparent 23%), radial-gradient(ellipse at 22% 70%,rgba(25,83,105,.4),transparent 34%), var(--deep); }
        .hero:before { content:""; position:absolute; inset:0; opacity:.25; background-image:linear-gradient(rgba(243,201,105,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(243,201,105,.12) 1px,transparent 1px); background-size:110px 110px; mask-image:linear-gradient(90deg,black,transparent 80%); pointer-events:none; }
        .sun { position:absolute; width:min(46vw,560px); aspect-ratio:1; right:8%; top:20%; border:1px solid rgba(243,201,105,.6); border-radius:50%; box-shadow:0 0 0 18px rgba(243,201,105,.04),0 0 0 54px rgba(243,201,105,.03); opacity:.9; }
        .sun:after,.sun:before { content:""; position:absolute; inset:13%; border:1px solid rgba(243,201,105,.25); border-radius:50%; } .sun:before { inset:27%; }
        .hero-copy { max-width:760px; position:relative; z-index:1; } .eyebrow { color:var(--gold); font:500 11px 'DM Mono'; letter-spacing:.18em; text-transform:uppercase; }
        h1,h2,h3 { font-family:'Fraunces',serif; font-weight:600; letter-spacing:-.045em; } h1 { max-width:800px; margin:20px 0 23px; font-size:clamp(3.35rem,8vw,7.6rem); line-height:.92; }
        .lede { max-width:560px; color:#c9d2d4; font-size:clamp(15px,1.5vw,18px); line-height:1.8; }
        .hero-meta { display:flex; flex-wrap:wrap; gap:12px 30px; margin-top:44px; color:var(--mist); font:11px 'DM Mono'; letter-spacing:.05em; text-transform:uppercase; }
        .hero-meta strong { color:var(--gold); display:block; margin-top:5px; font-size:13px; }
        .scroll-cue { display:flex; align-items:center; gap:12px; margin-top:76px; color:var(--gold); font:11px 'DM Mono'; letter-spacing:.15em; text-transform:uppercase; }
        .scroll-cue span { width:48px; height:1px; background:var(--gold); }
        .rail { position:sticky; top:74px; z-index:10; display:flex; justify-content:center; padding:12px 20px; background:rgba(251,245,231,.96); box-shadow:0 8px 20px #07152f1a; }
        .rail-inner { max-width:1080px; width:100%; display:flex; align-items:center; gap:10px; overflow:auto; scrollbar-width:none; } .rail-label { color:#7a6e5a; font:10px 'DM Mono'; letter-spacing:.14em; white-space:nowrap; text-transform:uppercase; margin-right:12px; }
        .rail button { padding:8px 13px; border:1px solid #d8cdb6; background:transparent; color:#37516a; cursor:pointer; white-space:nowrap; font-size:11px; } .rail button.active { background:#0d2850; border-color:#0d2850; color:var(--gold); }
        .chapter { min-height:610px; padding:110px clamp(24px,10vw,150px); position:relative; background:var(--cream); color:#102842; scroll-margin-top:70px; }
        .chapter.dark { background:var(--mid); color:var(--ink); } .chapter.saffron { background:#df7436; color:#fff3dc; }
        .chapter-inner { max-width:1080px; margin:auto; display:grid; grid-template-columns:180px 1fr; gap:clamp(30px,7vw,100px); align-items:start; }
        .chapter-no { color:#c46634; font:12px 'DM Mono'; letter-spacing:.16em; padding-top:15px; } .dark .chapter-no { color:var(--gold); } .saffron .chapter-no { color:#ffe3a5; }
        .chapter h2 { max-width:720px; margin:10px 0 24px; font-size:clamp(2.55rem,5.7vw,5.6rem); line-height:.94; } .chapter p { max-width:630px; color:#516474; font-size:16px; line-height:1.9; } .dark p,.saffron p { color:#cbd4d7; }
        .motif { margin-top:42px; height:100px; position:relative; overflow:hidden; border-top:1px solid currentColor; opacity:.7; } .motif:before { content:""; position:absolute; top:26px; left:0; width:74px; height:74px; border:1px solid currentColor; border-radius:50%; box-shadow:30px 0 0 -9px var(--cream),60px 0 0 -17px currentColor; }
        .story-grid { margin-top:48px; display:grid; grid-template-columns:1.2fr .8fr; gap:18px; } .story-note { padding:25px; background:#f2e7cc; border-left:3px solid var(--saff); } .story-note h3 { margin:0 0 12px; font-size:22px; } .story-note p { font-size:14px; margin:0; }
        .learning { background:#102642; } .learning-card { margin-top:42px; display:grid; grid-template-columns:1fr 1fr; gap:18px; } .quiz-box,.wish-box { padding:28px; border:1px solid rgba(243,201,105,.3); background:#143453; } .quiz-box h3,.wish-box h3 { margin:0 0 15px; font-size:28px; color:var(--gold); } .question { font-size:14px; line-height:1.7; color:#dfe3da; }
        .answers { display:flex; flex-wrap:wrap; gap:8px; margin:20px 0; } .answer,.copy { border:1px solid rgba(243,201,105,.55); background:transparent; color:var(--ink); padding:10px 12px; font-size:12px; cursor:pointer; } .answer:hover,.copy:hover { background:var(--gold); color:var(--deep); } .answer.correct { background:#91b99d; border-color:#91b99d; color:#0b2a2b; } .answer.wrong { background:#a9503e; border-color:#a9503e; }
        .wish-box textarea { width:100%; min-height:100px; resize:vertical; background:#0b2542; border:1px solid rgba(255,255,255,.2); color:var(--ink); padding:14px; font:14px/1.7 'Plus Jakarta Sans'; } .wish-box .copy { margin-top:13px; display:flex; gap:8px; align-items:center; }
        .final { min-height:520px; padding:130px 24px; text-align:center; background:radial-gradient(circle at center,rgba(228,124,54,.3),transparent 28%),#07152f; } .final h2 { margin:14px auto 20px; max-width:800px; font-size:clamp(3rem,7vw,6.4rem); } .final p { max-width:500px; margin:auto; color:var(--mist); line-height:1.8; } .final-action { display:inline-flex; align-items:center; gap:12px; margin-top:32px; padding:15px 22px; background:var(--gold); color:var(--deep); border:0; cursor:pointer; font-size:12px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
        footer { padding:25px clamp(20px,7vw,90px); display:flex; justify-content:space-between; color:#8e9ba0; font:10px 'DM Mono'; letter-spacing:.1em; text-transform:uppercase; } 
        @media(max-width:700px){ .nav { padding:16px 20px; } .menu { display:none; position:absolute; top:62px; left:0; right:0; padding:20px; flex-direction:column; align-items:flex-start; background:#091a36; } .menu.open { display:flex; } .menu-toggle { display:block; } .hero { min-height:740px; padding:140px 24px 60px; } .sun { right:-26%; top:38%; width:440px; opacity:.5; } .chapter { padding:76px 24px; } .chapter-inner { grid-template-columns:1fr; gap:15px; } .chapter-no { padding:0; } .story-grid,.learning-card { grid-template-columns:1fr; } footer { flex-direction:column; gap:10px; } }
        @media(prefers-reduced-motion:reduce){ *,*:before,*:after { scroll-behavior:auto!important; animation:none!important; transition:none!important; } }
      `}</style>
      <div className="topline" />
      <nav className="nav" aria-label="Festival guide navigation">
        <div className="brand"><span className="brand-mark">R</span> Rainbow International School</div>
        <button className="menu-toggle" aria-label="Open navigation" onClick={() => setOpen(!open)}>{open ? <X size={20}/> : <Menu size={20}/>}</button>
        <div className={`menu ${open ? "open" : ""}`}>
          {chapters.map(c => <button key={c.id} onClick={() => go(c.id)}>{c.label}</button>)}
          <a href="#celebrate">The close</a>
        </div>
      </nav>
      <header className="hero">
        <div className="sun" aria-hidden="true" />
        <motion.div className="hero-copy" initial={{ opacity: 0, y: reduce ? 0 : 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8 }}>
          <div className="eyebrow">A Rainbow International School guide · Thane</div>
          <h1>Make room<br/>for wonder.</h1>
          <p className="lede">Ganesh Chaturthi 2026 is a story students can step inside — from the first welcome to the final, graceful return.</p>
          <div className="hero-meta">{dates.map(d => <div key={d[0]}>{d[0]}<strong>{d[1]}</strong></div>)}<div>Format<strong>22 chapters · one journey</strong></div></div>
          <div className="scroll-cue"><span /> Follow the procession <ArrowDown size={14}/></div>
        </motion.div>
      </header>
      <div className="rail"><div className="rail-inner"><span className="rail-label">Your route</span>{chapters.map(c => <button className={active === c.id ? "active" : ""} key={c.id} onClick={() => go(c.id)}>{c.no} &nbsp; {c.label}</button>)}</div></div>
      <section id="arrival" className="chapter">
        <div className="chapter-inner"><div className="chapter-no">CHAPTER 01<br/>THE ARRIVAL</div><div><div className="eyebrow">A living classroom</div><h2>What we welcome, changes us.</h2><p>Ganesh Chaturthi is a ten-day festival of wisdom, community, and new beginnings. In Maharashtra, the celebration moves from homes to schools to streets — each doorway becoming part of a larger story.</p><div className="motif" aria-hidden="true"/><div className="story-grid"><div className="story-note"><h3>Why 2026 matters</h3><p>Ganesh Sthapana begins Monday, 14 September. Anant Chaturdashi brings the ceremonial visarjan on Friday, 25 September.</p></div><div className="story-note"><h3>A student’s lens</h3><p>Look for history in the procession, science in eco-friendly materials, and language in every greeting.</p></div></div></div></div>
      </section>
      <section id="story" className="chapter dark">
        <div className="chapter-inner"><div className="chapter-no">CHAPTER 02<br/>THE STORY</div><div><div className="eyebrow">Myth · memory · meaning</div><h2>A guardian made from earth.</h2><p>The story of Ganesha's birth carries a gentle paradox: a threshold guardian learns that wisdom is not only about holding a door closed, but knowing when to open it. Retell it, question it, make it your own.</p><div className="motif" aria-hidden="true"/></div></div>
      </section>
      <section id="learning" className="chapter saffron">
        <div className="chapter-inner"><div className="chapter-no">CHAPTER 03<br/>LEARN & MAKE</div><div><div className="eyebrow">A small challenge</div><h2>Take the next step.</h2><p>Try one question, then write a wish that feels like yours. Learning here is participatory: read, respond, carry something home.</p><div className="learning-card">
          <div className="quiz-box"><h3>Quick check</h3><p className="question">When does Ganesh Chaturthi 2026 begin?</p><div className="answers">{["14 September","25 September","2 October"].map((a,i)=><button key={a} className={`answer ${quiz !== null ? (i===0 ? "correct" : "wrong") : ""}`} onClick={() => setQuiz(i)}>{a}</button>)}</div>{quiz !== null && <p className="question"><Check size={14} style={{verticalAlign:"-2px"}}/> {quiz===0 ? "Correct — Sthapana begins on 14 September." : "Not quite. The welcome begins on 14 September."}</p>}</div>
          <div className="wish-box"><h3>Write a wish</h3><textarea value={wish} onChange={e => setWish(e.target.value)} aria-label="Your festival wish"/><button className="copy" onClick={copyWish}>{copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? "Copied to clipboard" : "Copy this wish"}</button></div>
        </div></div></div>
      </section>
      <section id="celebrate" className="final"><div className="eyebrow"><Sparkles size={15} style={{verticalAlign:"-3px"}}/> THE FINAL LIGHT</div><h2>Carry the wisdom<br/>forward.</h2><p>Explore speeches, essays, eco-friendly ideas, facts, FAQs, and more — resources for families and students to celebrate with care.</p><button className="final-action" onClick={() => go("arrival")}>Begin the journey again <ArrowRight size={16}/></button></section>
      <footer><span>Ganesh Chaturthi 2026 · Rainbow International School, Thane</span><span><Volume2 size={12} style={{verticalAlign:"-2px"}}/> Read at your own rhythm</span></footer>
    </main>
  );
}