import { useState, useRef, useEffect } from "react";
import { ChevronDown, Send, MessageCircle } from "lucide-react";

const WA_URL = "https://wa.me/918291568972";

// ── Quick-reply chips ────────────────────────────────────────────
const CHIPS = [
  "Our Programmes",
  "Timings & Hours",
  "Campus & Location",
  "Admissions 2026–27",
  "Fees",
  "Safety & Security",
  "Talk to Someone",
];

// ── Knowledge base ───────────────────────────────────────────────
function getBotReply(input: string): string {
  const t = input.toLowerCase();

  if (t.includes("programme") || t.includes("program") || t.includes("class") || t.includes("grade") || t.includes("stream") || t.includes("curriculum")) {
    return "Rainbow International School offers Nursery to Class 12 under CBSE (Affiliation No. 1130661). Our stages include Pre-Primary, Primary (Cl. 1–5), Middle School (Cl. 6–8), Secondary (Cl. 9–10), and Senior Secondary (Cl. 11–12) with Science, Commerce, and Humanities streams.";
  }
  if (t.includes("timing") || t.includes("hour") || t.includes("time") || t.includes("schedule") || t.includes("batch")) {
    return "Our school office hours are Monday to Saturday, 9:00 AM – 6:00 PM.\n\nPhone: (022) 69105000\nMobile: +91 82915 68972";
  }
  if (t.includes("campus") || t.includes("location") || t.includes("address") || t.includes("centre") || t.includes("center")) {
    return "We are located at:\nCosmos Arcade, Brahmand Phase 4,\nThane West, Maharashtra.\n\nOur campus spans 3.5 acres and serves 3,000+ students from Nursery to Class 12 — all under one roof.";
  }
  if (t.includes("admission") || t.includes("apply") || t.includes("enrol") || t.includes("enroll") || t.includes("2026")) {
    return "Admissions are open for Academic Year 2026–27!\n\nWe welcome students from Nursery to Class 12.\n\nCall: +91 82915 68972\nEmail: info@rainbowinternationalschool.in\n\nOr fill the enquiry form on our Contact Us page.";
  }
  if (t.includes("fee") || t.includes("fees") || t.includes("cost")) {
    return "Fee details vary by grade. Please contact our admissions team for the complete fee structure:\n\nCall: +91 82915 68972\nEmail: info@rainbowinternationalschool.in\nHours: Mon–Sat, 9 AM – 6 PM";
  }
  if (t.includes("safety") || t.includes("security") || t.includes("safe")) {
    return "Safety is our top priority. We have:\n• 160 CCTV cameras across campus\n• Metal detectors at all entry points\n• GPS-tracked buses with lady attendants\n• Trained nurse & equipped ambulance\n• First aid & self-defence training\n• 100% female staff for Preschool\n• Security personnel with walkie-talkies";
  }
  if (t.includes("talk") || t.includes("speak") || t.includes("call") || t.includes("contact") || t.includes("someone") || t.includes("human")) {
    return "Reach our team directly:\n\nPhone: (022) 69105000\nMobile: +91 82915 68972\nEmail: info@rainbowinternationalschool.in\nHours: Mon–Sat, 9:00 AM – 6:00 PM\n\nOr tap the WhatsApp button above to chat with us instantly!";
  }
  if (t.includes("transport") || t.includes("bus")) {
    return "Rainbow provides GPS-tracked, CCTV-enabled school buses with trained drivers, safety marshalls, and lady attendants on every route.\n\nCall +91 82915 68972 for route details.";
  }
  if (t.includes("cbse") || t.includes("affiliation") || t.includes("board")) {
    return "Rainbow International School is CBSE-affiliated.\nAffiliation No.: 1130661\nSchool Code: 30562";
  }
  if (t.includes("sport") || t.includes("club") || t.includes("activity") || t.includes("extracurricular") || t.includes("beyond")) {
    return "Beyond academics, Rainbow offers 12+ sports (Football, Basketball, Cricket, Swimming, Skating, etc.), Arts, Music, Dance, Drama, Robotics, and themed clubs. We are proudly part of the FIT India Movement.";
  }
  if (t.includes("facility") || t.includes("lab") || t.includes("library") || t.includes("amenity")) {
    return "Our 3.5-acre campus features:\n• Modern Science & Computer Labs\n• Well-stocked Library\n• Smart Classrooms\n• Swimming Pool & Skating Rink\n• Sports Courts & Auditorium\n• Art, Music & Dance Rooms\n• Infirmary with trained nurse";
  }

  return "Thank you for your message! For the best assistance, please call us at +91 82915 68972 or email info@rainbowinternationalschool.in. We're available Mon–Sat, 9:00 AM – 6:00 PM.";
}

// ── Types ────────────────────────────────────────────────────────
interface Message {
  from: "bot" | "user";
  text: string;
}

// ── WhatsApp SVG ─────────────────────────────────────────────────
function WaSvg() {
  return (
    <svg viewBox="0 0 32 32" width="20" height="20" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.504 1.128 6.752 3.052 9.388L1.056 30.74l5.516-1.972A15.903 15.903 0 0 0 16.004 32C24.828 32 32 24.824 32 16S24.828 0 16.004 0zm9.22 22.596c-.38 1.072-1.888 1.964-3.096 2.224-.824.176-1.9.316-5.52-1.188-4.628-1.916-7.608-6.616-7.84-6.924-.224-.308-1.88-2.504-1.88-4.776 0-2.272 1.188-3.38 1.608-3.808.38-.388.824-.56 1.1-.56.276 0 .548.004.788.016.252.012.59-.096.924.704.348.82 1.18 2.896 1.284 3.108.104.212.172.46.032.744-.14.284-.208.46-.416.708-.208.248-.436.556-.624.748-.208.208-.424.432-.184.848.24.416 1.068 1.76 2.292 2.852 1.576 1.404 2.904 1.836 3.316 2.044.412.208.648.176.888-.104.24-.28 1.028-1.2 1.3-1.612.272-.412.548-.344.924-.208.376.136 2.392 1.128 2.8 1.336.412.208.684.308.784.48.1.172.1.992-.28 2.068z" />
    </svg>
  );
}

// ── Main component ───────────────────────────────────────────────
export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [chipsVisible, setChipsVisible] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  }, [messages, open]);

  const handleOpen = () => {
    setOpen(true);
    if (messages.length === 0) {
      setMessages([
        {
          from: "bot",
          text: "Hi there! I'm Bhumika, your Rainbow International School assistant.\n\nHow can I help you today?",
        },
      ]);
      setChipsVisible(true);
    }
  };

  const pushReply = (userText: string) => {
    setChipsVisible(false);
    setMessages(prev => [...prev, { from: "user", text: userText }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { from: "bot", text: getBotReply(userText) }]);
    }, 500);
  };

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText("");
    pushReply(text);
  };

  return (
    <>
      {/* ── Chat window ──────────────────────────────────── */}
      {open && (
        <div
          className="fixed bottom-24 right-5 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          style={{ width: 340, maxHeight: 570, background: "#fff", border: "1px solid #e5e7eb" }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{ background: "#0d3b86" }}
          >
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.22)", color: "#fff" }}
            >
              B
            </div>
            {/* Name + subtitle */}
            <div className="flex-grow min-w-0">
              <p className="text-white font-black text-sm leading-tight">Bhumika</p>
              <p className="text-white/65 text-[11px] leading-tight truncate">Rainbow International School Assistant</p>
            </div>
            {/* WhatsApp button */}
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              data-testid="link-whatsapp-chat"
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity"
              style={{ background: "#25D366" }}
            >
              <WaSvg />
            </a>
            {/* Minimise */}
            <button
              onClick={() => setOpen(false)}
              className="text-white/60 hover:text-white transition-colors ml-1 flex-shrink-0"
              data-testid="button-chat-minimize"
              aria-label="Minimise"
            >
              <ChevronDown size={20} />
            </button>
          </div>

          {/* Messages area */}
          <div
            className="flex-grow overflow-y-auto px-4 py-4 space-y-3"
            style={{ minHeight: 0 }}
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"} gap-2`}>
                {msg.from === "bot" && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5"
                    style={{ background: "#0d3b86", color: "#fff" }}
                  >
                    B
                  </div>
                )}
                <div
                  className={`max-w-[76%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-line ${
                    msg.from === "bot"
                      ? "bg-gray-100 text-gray-800 rounded-tl-none"
                      : "text-white rounded-tr-none"
                  }`}
                  style={msg.from === "user" ? { background: "#0d3b86" } : {}}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick-reply chips */}
          {chipsVisible && (
            <div className="px-4 pb-3 flex flex-wrap gap-2 flex-shrink-0">
              {CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => pushReply(chip)}
                  className="text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors hover:bg-blue-50 active:scale-95"
                  style={{ borderColor: "#0d3b86", color: "#0d3b86" }}
                  data-testid={`chip-${chip.replace(/\s+/g, "-").replace(/–/g, "").toLowerCase()}`}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t px-3 py-2 flex gap-2 items-center flex-shrink-0">
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-grow text-xs border rounded-full px-3 py-2 focus:outline-none focus:border-blue-400"
              data-testid="input-chat-message"
            />
            <button
              onClick={sendMessage}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white hover:opacity-90 transition-opacity"
              style={{ background: "#0d3b86" }}
              data-testid="button-chat-send"
            >
              <Send size={14} />
            </button>
          </div>

          {/* Footer */}
          <div className="text-center py-2 border-t flex-shrink-0" style={{ background: "#f8faff" }}>
            <p className="text-gray-400 text-[10px]">
              Rainbow International School &nbsp;&middot;&nbsp; Thane West &nbsp;&middot;&nbsp; Since 2009
            </p>
          </div>
        </div>
      )}

      {/* ── Toggle FAB ───────────────────────────────────── */}
      <button
        onClick={open ? () => setOpen(false) : handleOpen}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{ background: "#0d3b86" }}
        data-testid="button-chatbot-toggle"
        aria-label="Open chat"
      >
        {open ? (
          <ChevronDown size={22} className="text-white" />
        ) : (
          <MessageCircle size={22} className="text-white" />
        )}
      </button>
    </>
  );
}
