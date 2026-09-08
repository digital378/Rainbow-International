import { useState } from "react";
import { ArrowDown, ArrowRight, Check, ChevronDown, Copy, Menu, Pause, Play, Sparkles } from "lucide-react";
import "./_sacred.css";

const chapters = [
  { id: "arrival", no: "I", title: "The arrival", label: "A festival begins", text: "Ganesh Chaturthi welcomes wisdom into the home, the classroom, and the street. In 2026, Ganesh Sthapana falls on Monday, 14 September.", tone: "ink" },
  { id: "story", no: "II", title: "The story held in clay", label: "A tale of belonging", text: "Ganesha is made, adorned, and welcomed — a reminder that every beginning asks us to make space for learning.", tone: "ochre" },
  { id: "learning", no: "III", title: "Open the folio", label: "Learn by looking closer", text: "Turn each card to discover the meaning carried by Ganesha's familiar symbols.", tone: "paper" },
];

const symbols = [
  ["The large ears", "Listen before you answer. Wisdom begins with attention."],
  ["The curved trunk", "Stay adaptable. A gentle approach can move what force cannot."],
  ["The single tusk", "Keep what is useful; let go of what clouds the mind."],
  ["The modak", "Effort has a sweetness, especially when shared."],
];

function Seal() {
  return <div className="seal" aria-hidden="true"><span>RIS</span><small>THANE · 2026</small></div>;
}

export function SacredManuscript() {
  const [open, setOpen] = useState(0);
  const [quiz, setQuiz] = useState<"idle" | "right" | "wrong">("idle");
  const [copied, setCopied] = useState(false);
  const [paused, setPaused] = useState(false);
  const copyWish = async () => {
    await navigator.clipboard?.writeText("May wisdom light every new beginning. Happy Ganesh Chaturthi 2026 — Rainbow International School, Thane.");
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };
  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  return (
    <main className="manuscript">
      <div className="reading-line" />
      <header className="masthead">
        <div className="wordmark"><span className="wordmark-mark">R</span><span>Rainbow International School<small>THANE · A GUIDE FOR CURIOUS MINDS</small></span></div>
        <nav aria-label="Chapter navigation" className="chapter-nav">
          {chapters.map((c) => <button key={c.id} onClick={() => jump(c.id)}>{c.no} <span>{c.title}</span></button>)}
        </nav>
        <button className="menu-btn" aria-label="Open navigation"><Menu size={18} /></button>
      </header>

      <section className="hero-portal" aria-labelledby="title">
        <div className="arch arch-one" /><div className="arch arch-two" />
        <div className="hero-copy">
          <p className="eyebrow">A contemporary school guide · 2026 edition</p>
          <h1 id="title">Ganesh<br /><em>Chaturthi</em></h1>
          <p className="hero-dek">History, meaning, classroom ideas, and words to carry into the festival.</p>
          <div className="date-lockup"><span>14—25</span><small>SEPTEMBER<br />2026</small></div>
          <button className="begin-btn" onClick={() => jump("arrival")}>Begin the guide <ArrowDown size={16} /></button>
        </div>
        <div className="hero-medallion"><Seal /><div className="sun-disc"><span>ॐ</span></div><p>THE FESTIVAL<br />OF WISDOM</p></div>
        <div className="hero-caption">01 / 06 &nbsp; UNFOLDING A FESTIVAL</div>
      </section>

      <aside className="folio-rail" aria-label="Guide progress"><span>THE GUIDE</span>{chapters.map((c, i) => <button key={c.id} className={open === i ? "active" : ""} onClick={() => { setOpen(i); jump(c.id); }}><i>{c.no}</i>{c.title}</button>)}<span className="rail-rule" /></aside>

      <section id="arrival" className="reading-canvas">
        <div className="chapter-heading"><p className="chapter-kicker">Chapter I <span>·</span> A festival begins</p><h2>Make room<br /><i>for wonder.</i></h2><div className="chapter-number">01</div></div>
        <div className="two-column"><div className="dropcap">G</div><div><p className="lead-copy">anesh Chaturthi is a ten-day festival that welcomes Lord Ganesha — the remover of obstacles and the god of wisdom and new beginnings — into homes, schools, and communities across India.</p><p>For students at Rainbow International School, Thane, it is a living classroom in history, values, culture, and community spirit. The festival begins with <strong>Ganesh Sthapana on Monday, 14 September</strong> and concludes with immersion on Anant Chaturdashi, Friday, 25 September.</p><div className="margin-note"><span>FIELD NOTE 01</span><p>Here in Maharashtra, Ganeshotsav is celebrated with a scale and warmth found nowhere else in the world.</p></div></div></div>
        <div className="date-strip"><span><b>14 SEP</b> Ganesh Sthapana</span><ArrowRight size={17} /><span><b>25 SEP</b> Anant Chaturdashi</span><button onClick={() => jump("story")}>Read the story <ArrowRight size={15} /></button></div>
      </section>

      <section id="story" className="portal-section">
        <div className="portal-ornament">II</div><p className="chapter-kicker light">Chapter II · A tale of belonging</p><h2>The story<br /><i>held in clay.</i></h2><p className="portal-text">Some stories are not only read. They are shaped by hand, placed at the centre of a room, and welcomed with song.</p><button className="outline-light" onClick={() => jump("learning")}>Open the next folio <ArrowRight size={16} /></button>
        <div className="story-diagram" aria-label="Decorative illustration of a clay form"><div className="diagram-halo" /><div className="diagram-head">G</div><div className="diagram-base" /></div>
        <div className="portal-footer"><span>02 / 06</span><span>THE MYTHOLOGY OF BEGINNINGS</span></div>
      </section>

      <section id="learning" className="learning-canvas">
        <div className="section-topline"><span>CHAPTER III · OPEN THE FOLIO</span><span>SYMBOLS &amp; MEANING</span></div>
        <div className="learning-intro"><div><h2>Look closer.<br /><i>Learn deeper.</i></h2></div><p>Turn a card to discover the values held in Ganesha's familiar symbols. Then test your memory below.</p></div>
        <div className="symbol-grid">{symbols.map(([title, text], i) => <button key={title} className={`symbol-card ${open === i + 3 ? "turned" : ""}`} onClick={() => setOpen(open === i + 3 ? 0 : i + 3)} aria-pressed={open === i + 3}><div className="card-front"><span className="symbol-index">0{i + 1}</span><div className="symbol-mark">{["◌", "⌁", "◒", "◇"][i]}</div><h3>{title}</h3><span className="turn-hint">Turn the card <ArrowRight size={13} /></span></div><div className="card-back"><span>THE LESSON</span><p>{text}</p><ChevronDown size={17} /></div></button>)}</div>
        <div className="quiz-ribbon"><div><span className="eyebrow">A quick check</span><h3>Which date begins the festival?</h3></div><div className="quiz-actions"><button className={quiz === "right" ? "answer right" : "answer"} onClick={() => setQuiz("right")}>14 September <Check size={14} /></button><button className={quiz === "wrong" ? "answer wrong" : "answer"} onClick={() => setQuiz("wrong")}>25 September</button></div>{quiz !== "idle" && <p className="quiz-result">{quiz === "right" ? "Correct — the Sthapana begins on 14 September." : "Almost — 25 September is Anant Chaturdashi."}</p>}</div>
      </section>

      <section className="wish-cta"><Sparkles size={18} /><p className="eyebrow">A note to carry home</p><h2>Let wisdom<br /><i>light the way.</i></h2><p className="cta-copy">Share a considered wish with your family, your class, or someone beginning something new.</p><button className="wish-btn" onClick={copyWish}>{copied ? <><Check size={16} /> Copied to clipboard</> : <><Copy size={16} /> Copy a festival wish</>}</button><div className="cta-meta"><span>RAINBOW INTERNATIONAL SCHOOL</span><span>THANE · MAHARASHTRA</span><span>2026</span></div></section>
      <footer className="manuscript-footer"><span>GANESH CHATURTHI 2026</span><span>Designed for curious minds</span><button onClick={() => setPaused(!paused)} aria-label={paused ? "Resume motion" : "Pause motion"}>{paused ? <Play size={15} /> : <Pause size={15} />}</button></footer>
    </main>
  );
}