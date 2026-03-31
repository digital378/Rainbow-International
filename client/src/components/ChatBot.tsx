import { useState } from "react";
import { X, MessageCircle, Send } from "lucide-react";
import { useForm } from "react-hook-form";

interface ContactInfo {
  name: string;
  mobile: string;
  email: string;
}

type ChatStep = "closed" | "bubble" | "contact" | "chat";

const botMessages = [
  "Welcome to the Rainbow International School!",
  "Thank you for connecting with us. Click below to start the chat...",
];

export function ChatBot() {
  const [step, setStep] = useState<ChatStep>("bubble");
  const [userInfo, setUserInfo] = useState<ContactInfo | null>(null);
  const [messages, setMessages] = useState<{ from: "bot" | "user"; text: string }[]>([]);
  const [inputText, setInputText] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactInfo>();

  const onContactSubmit = async (data: ContactInfo) => {
    await new Promise(r => setTimeout(r, 500));
    setUserInfo(data);
    setStep("chat");
    setMessages([
      { from: "bot", text: `Hello ${data.name}! Welcome to Rainbow International School. How can I help you today?` },
      { from: "bot", text: "You can ask me about Admissions, Academics, Fees, School Facilities, or any other queries." },
    ]);
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const userMsg = inputText.trim();
    setInputText("");
    setMessages(prev => [...prev, { from: "user", text: userMsg }]);

    setTimeout(() => {
      let botReply = "Thank you for your message! Our team will get back to you shortly. For immediate assistance, please call +91 86550 03366.";

      const lower = userMsg.toLowerCase();
      if (lower.includes("admission") || lower.includes("apply")) {
        botReply = "Admissions are open for Academic Year 2026–27! You can visit our Contact page or call +91 86550 03366 to speak with our admissions counsellor.";
      } else if (lower.includes("fee") || lower.includes("fees")) {
        botReply = "For detailed fee structure, please contact our admissions office at +91 86550 03366 or email info@rainbowinternationalschool.in.";
      } else if (lower.includes("class") || lower.includes("grade")) {
        botReply = "Rainbow International School offers Nursery to Class 12 (CBSE). For curriculum details, please explore our Academics section.";
      } else if (lower.includes("timing") || lower.includes("hours") || lower.includes("time")) {
        botReply = "Our school timings are Mon–Sat, 9:00 AM to 6:00 PM. Office hours: Mon–Sat, 9:00 AM to 6:00 PM.";
      } else if (lower.includes("address") || lower.includes("location")) {
        botReply = "We are located at Cosmos Arcade, Brahmand Phase 4, Thane West, Maharashtra.";
      } else if (lower.includes("transport") || lower.includes("bus")) {
        botReply = "Rainbow provides GPS-tracked, CCTV-enabled school transport. Please contact us at +91 86550 03366 for route details.";
      }

      setMessages(prev => [...prev, { from: "bot", text: botReply }]);
    }, 800);
  };

  if (step === "closed") return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {step === "bubble" && (
        <div
          className="bg-white rounded-2xl shadow-xl border px-4 py-2 text-sm text-primary font-semibold cursor-pointer hover:shadow-2xl transition-shadow max-w-52 text-center"
          onClick={() => setStep("contact")}
        >
          Welcome to Rainbow International School
        </div>
      )}

      {(step === "contact" || step === "chat") && (
        <div className="bg-white rounded-2xl shadow-2xl border w-80 overflow-hidden" style={{ maxHeight: "520px" }}>
          <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle size={16} />
              </div>
              <span className="font-semibold text-sm">Chat with us</span>
            </div>
            <button onClick={() => setStep("bubble")} className="hover:bg-white/20 rounded-full p-1 transition-colors">
              <X size={16} />
            </button>
          </div>

          {step === "contact" && (
            <div className="p-4">
              <div className="bg-primary/5 rounded-xl p-3 mb-4 flex gap-2 items-start">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">R</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p className="font-semibold text-primary mb-1">Welcome to the Rainbow International School!</p>
                  <p>Thank you for connecting with us. Click below to start the chat...</p>
                </div>
              </div>

              <div className="bg-muted/30 rounded-xl p-3 mb-4 text-xs text-muted-foreground">
                Before we proceed further, may I know your contact details so that if the connection gets interrupted we can get back to you.
              </div>

              <form onSubmit={handleSubmit(onContactSubmit)} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Name*</label>
                  <input
                    {...register("name", { required: true })}
                    placeholder="Enter your Name*"
                    className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                    data-testid="input-chat-name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Mobile Number*</label>
                  <input
                    {...register("mobile", { required: true })}
                    placeholder="Mobile*"
                    type="tel"
                    className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                    data-testid="input-chat-mobile"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Email ID*</label>
                  <input
                    {...register("email", { required: true })}
                    placeholder="Email*"
                    type="email"
                    className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                    data-testid="input-chat-email"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white font-bold py-2.5 rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-70"
                  data-testid="button-chat-proceed"
                >
                  {isSubmitting ? "Please wait..." : "Click to Proceed"}
                </button>
              </form>
              <p className="text-center text-xs text-muted-foreground/60 mt-3">
                Powered by Rainbow International School
              </p>
            </div>
          )}

          {step === "chat" && (
            <div className="flex flex-col" style={{ height: "420px" }}>
              <div className="flex-grow overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.from === "bot" && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5 mr-2">
                        <span className="text-white text-xs font-bold">R</span>
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${msg.from === "bot" ? "bg-primary/10 text-primary" : "bg-primary text-white"}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t p-3 flex gap-2">
                <input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-grow border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                  data-testid="input-chat-message"
                />
                <button
                  onClick={sendMessage}
                  className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary/90 transition-colors shrink-0"
                  data-testid="button-chat-send"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setStep(step === "bubble" ? "contact" : "bubble")}
        className="w-14 h-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-center hover:bg-primary/90 transition-all hover:scale-105"
        data-testid="button-chatbot-toggle"
      >
        {step !== "bubble" ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
