import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  MessageSquare, 
  Sparkles, 
  RefreshCw, 
  User, 
  Bot, 
  Lightbulb, 
  CheckCircle,
  HelpCircle,
  Shield,
  Coins
} from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
  timestamp: Date;
  source?: string;
}

interface GeminiChatbotProps {
  showToast: (message: string, description?: string, type?: "success" | "error" | "info") => void;
  pharmacyName?: string;
}

export default function GeminiChatbot({ showToast, pharmacyName = "Kampala Community Pharmacy" }: GeminiChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Hello! I'm your CareRefill Gemini Advisor. I'm trained of custom East African patient compliance behaviors, and medication monitoring guidelines. Ask me anything!",
      timestamp: new Date(),
      source: "simulated-fallback"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [systemRole, setSystemRole] = useState<"clinical-pharmacist" | "patient-care" | "adherence-expert">("clinical-pharmacist");
  const [activeModel, setActiveModel] = useState<"gemini-3.5-flash" | "gemini-3.1-pro-preview" | "gemini-3.1-flash-lite">("gemini-3.5-flash");

  const messageEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    containerRef.current.style.setProperty("--mouse-x", `${x}px`);
    containerRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  // Auto-scroll to the latest message
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      role: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          systemRole,
          model: activeModel
        })
      });

      if (!res.ok) {
        throw new Error("Unable to communicate with the Gemini server module.");
      }

      const data = await res.json();
      const botMsg: Message = {
        role: "model",
        text: data.reply || "No parsed response returned.",
        timestamp: new Date(),
        source: data.source
      };

      setMessages((prev) => [...prev, botMsg]);
      
      if (data.source && data.source.startsWith("simulated")) {
        showToast("Simulated Response", `Gemini simulation active using ${activeModel}.`, "info");
      } else {
        showToast("Gemini Thinking Completed", `Completed multi-turn chat via ${activeModel}.`, "success");
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: `⚠️ Communication Failure: ${err.message}. Please restart services or verify connection routes.`,
          timestamp: new Date()
        }
      ]);
      showToast("Chat Error", "Failed to get automated guidance response.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: "model",
        text: `Chat coordinates flushed. Standby under active role: ${
          systemRole === "clinical-pharmacist" ? "Clinical Pharmacist Advisor" : 
          systemRole === "patient-care" ? "Patient Care Liaison" : "Behaviors & Adherence Specialist"
        } utilizing reasoning engine ${activeModel}. How can I support your clinic shift today?`,
        timestamp: new Date()
      }
    ]);
    showToast("Chat Cleared", "Conversation history has been cleared.", "success");
  };

  // Quick suggestions based on role
  const getSuggestions = () => {
    switch (systemRole) {
      case "clinical-pharmacist":
        return [
          "Side effects of Metformin and Amlodipine?",
          "Empathy guide for hypertensive patients.",
          "Check clinical signs of therapy fatigue."
        ];
      case "patient-care":
        return [
          "Explain Diabetes simply in direct English",
          "Draft a sweet supportive message for Sarah",
          "Tips for remembering medication on travel days"
        ];
      case "adherence-expert":
        return [
          "Why do Kampala patients miss refills?",
          "Behavioral nudges for HIV/ARV patients",
          "Explain how CareRefill loyalty multipliers work"
        ];
    }
  };

  return (
    <div 
      id="gemini-chatbot-main" 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="glass-panel premium-transition spotlight-card rounded-3xl p-6 shadow-xl space-y-6 text-left relative overflow-hidden"
    >
      
      {/* Header and Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b dark:border-slate-800 pb-5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
            AI Clinical Intelligence Hub
          </span>
          <h3 className="text-xl font-black text-gray-950 dark:text-gray-150 mt-2 font-sans tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-green" />
            Gemini Companion Advisor
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            SaaS multi-turn clinical chatbot powered securely by <span className="font-semibold text-gray-900 dark:text-gray-300">models/gemini-3.5-flash</span>.
          </p>
        </div>
        
        {/* Reset button */}
        <button
          onClick={handleResetChat}
          className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-755 border border-gray-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 dark:text-slate-350 transition-all cursor-pointer shadow-3xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Memory</span>
        </button>
      </div>

      {/* Role Selection Tabs */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
          Select Active Chat Companion Persona
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950/40 p-1.5 rounded-2xl border dark:border-slate-800">
          <button
            onClick={() => {
              setSystemRole("clinical-pharmacist");
              showToast("Companion Switched", "Assisting you as Chief Clinical Pharmacist.", "info");
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              systemRole === "clinical-pharmacist"
                ? "bg-emerald-600 text-white shadow-md active:scale-98"
                : "text-gray-600 dark:text-slate-400 hover:bg-slate-150/40 dark:hover:bg-slate-800"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Clinical Pharmacist</span>
          </button>
          
          <button
            onClick={() => {
              setSystemRole("patient-care");
              showToast("Companion Switched", "Assisting you as Patient Care Liaison Advocate.", "info");
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              systemRole === "patient-care"
                ? "bg-emerald-600 text-white shadow-md active:scale-98"
                : "text-gray-600 dark:text-slate-400 hover:bg-slate-150/40 dark:hover:bg-slate-800"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Patient Advocate</span>
          </button>

          <button
            onClick={() => {
              setSystemRole("adherence-expert");
              showToast("Companion Switched", "Assisting you as Behavioral Adherence Specialist.", "info");
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              systemRole === "adherence-expert"
                ? "bg-emerald-600 text-white shadow-md active:scale-98"
                : "text-gray-600 dark:text-slate-400 hover:bg-slate-150/40 dark:hover:bg-slate-800"
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Adherence Specialist</span>
          </button>
        </div>
      </div>

      {/* Model Selection Tabs */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
          Select Active Chat Reasoner Model Engine
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950/40 p-1.5 rounded-2xl border dark:border-slate-800">
          <button
            onClick={() => {
              setActiveModel("gemini-3.5-flash");
              showToast("Reasoner Switched", "Using gemini-3.5-flash for general tasks.", "info");
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeModel === "gemini-3.5-flash"
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-gray-950 shadow-md active:scale-98"
                : "text-gray-600 dark:text-slate-400 hover:bg-slate-150/40 dark:hover:bg-slate-800"
            }`}
          >
            <span>gemini-3.5-flash (General)</span>
          </button>
          
          <button
            onClick={() => {
              setActiveModel("gemini-3.1-pro-preview");
              showToast("Reasoner Switched", "Using gemini-3.1-pro-preview for complex tasks.", "info");
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeModel === "gemini-3.1-pro-preview"
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-gray-950 shadow-md active:scale-98"
                : "text-gray-600 dark:text-slate-400 hover:bg-slate-150/40 dark:hover:bg-slate-800"
            }`}
          >
            <span>gemini-3.1-pro-preview (Complex)</span>
          </button>

          <button
            onClick={() => {
              setActiveModel("gemini-3.1-flash-lite");
              showToast("Reasoner Switched", "Using gemini-3.1-flash-lite for fast tasks.", "info");
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeModel === "gemini-3.1-flash-lite"
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-gray-950 shadow-md active:scale-98"
                : "text-gray-650 dark:text-slate-400 hover:bg-slate-150/40 dark:hover:bg-slate-800"
            }`}
          >
            <span>gemini-3.1-flash-lite (Fast)</span>
          </button>
        </div>
      </div>

      {/* Main Chat Thread Frame */}
      <div className="bg-slate-50 dark:bg-slate-950/20 border dark:border-slate-850 rounded-2xl h-96 flex flex-col justify-between overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => {
            const isUser = message.role === "user";
            return (
              <div
                key={index}
                className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isUser
                      ? "bg-[#84CC16] text-white"
                      : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-350 border dark:border-emerald-800/40"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-1">
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? "bg-[#84CC16] text-white rounded-tr-none font-bold shadow-2xs"
                        : "bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 border border-gray-150 dark:border-slate-800 rounded-tl-none shadow-3xs"
                    }`}
                  >
                    {message.text.split("\n").map((para, pIdx) => (
                      <p key={pIdx} className={pIdx > 0 ? "mt-1.5" : ""}>
                        {para}
                      </p>
                    ))}
                  </div>

                  {/* Bubble details/timestamp */}
                  <div className={`flex items-center gap-1.5 px-1 text-[9px] text-gray-400 ${isUser ? "justify-end" : "justify-start"}`}>
                    <span>
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {!isUser && message.source && (
                      <span className="text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/10">
                        {message.source}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading bubble */}
          {loading && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          {/* Scrolling anchor */}
          <div ref={messageEndRef} />
        </div>
      </div>

      {/* Suggestion Quick Prompts */}
      <div className="space-y-2">
        <div className="flex items-center gap-1 text-[10px] uppercase font-black tracking-wider text-gray-400">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Quick starting inquiries</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {getSuggestions().map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(undefined, sug)}
              disabled={loading}
              className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/40 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-2xl text-[11px] font-bold text-gray-700 dark:text-slate-350 transition cursor-pointer hover:shadow-2xs"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form Bar */}
      <form onSubmit={handleSendMessage} className="flex gap-2.5">
        <input
          type="text"
          value={inputMessage}
          disabled={loading}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Inquire with ${
            systemRole === "clinical-pharmacist" ? "Chief Pharmacist AI..." : 
            systemRole === "patient-care" ? "Patient Advocate Liaison..." : "Adherence Specialist core..."
          }`}
          className="flex-1 bg-slate-55 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-xs px-4 py-3 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
        />
        
        <button
          type="submit"
          disabled={!inputMessage.trim() || loading}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-xs px-4 rounded-2xl cursor-pointer transition shadow-sm flex items-center justify-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>

    </div>
  );
}
