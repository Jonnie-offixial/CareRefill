import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  HelpCircle,
  User,
  Bot
} from "lucide-react";

interface StatusBadgeProps {
  online: boolean;
}

function StatusBadge({ online }: StatusBadgeProps) {
  return (
    <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
      <span className={`w-2 h-2 rounded-full ${online ? "bg-emerald-500 animate-pulse" : "bg-gray-400"} shadow-xs`} />
      <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-400 tracking-wider">
        {online ? "Desk Available" : "Offline"}
      </span>
    </div>
  );
}

interface TalkWithUsFabProps {
  showToast: (message: string, description?: string, type?: "success" | "error" | "info") => void;
  branchName?: string;
  branchPhone?: string;
}

export default function TalkWithUsFab({ showToast, branchName = "Kampala Community Pharmacy", branchPhone = "+256 700 000000" }: TalkWithUsFabProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [ripple, setRipple] = useState(false);
  
  // Chat messaging states
  const [messages, setMessages] = useState<Array<{ role: "user" | "bot"; text: string; time: Date }>>([
    {
      role: "bot",
      text: "👋 Jambo! Welcome to CareRefill Patient Support. How can we make your treatment loop easier today?",
      time: new Date()
    }
  ]);
  const [typedMessage, setTypedMessage] = useState("");
  const [botReplying, setBotReplying] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, botReplying]);

  // Click handler with ripple logic
  const handleFabClick = () => {
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
    setIsOpen(prev => !prev);
    setShowTooltip(false);
  };

  // Preset support topics
  const handlePresetSelect = (text: string, botResponse: string) => {
    const userMsg = { role: "user" as const, text, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setBotReplying(true);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "bot",
        text: botResponse,
        time: new Date()
      }]);
      setBotReplying(false);
      showToast("Support loop active", "Help desk response generated successfully.", "success");
    }, 1000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || botReplying) return;

    const userText = typedMessage;
    setMessages(prev => [...prev, { role: "user", text: userText, time: new Date() }]);
    setTypedMessage("");
    setBotReplying(true);

    // Auto-generate realistic helpdesk / AI response
    setTimeout(() => {
      let replyText = "";
      const textLower = userText.toLowerCase();

      if (textLower.includes("appointment") || textLower.includes("book") || textLower.includes("doctor")) {
        replyText = `Understood. I can help coordinate an appointment with Dr. Sarah Mukasa or Dr. Emmanuel Okot. Please let me know your preferred dates, or visit the "Appointments Book" tab in your control panel to lock in slots.`;
      } else if (textLower.includes("adherence") || textLower.includes("refill") || textLower.includes("loyal")) {
        replyText = `Every timely refill logs +50 loyalty credentials. You earn credit points towards complimentary checkups. Keeping your drug timeline uninterrupted is our highest directive!`;
      } else if (textLower.includes("address") || textLower.includes("location") || textLower.includes("branch")) {
        replyText = `We are open at ${branchName}. You can reach us physically here or ring our priority desk on ${branchPhone}.`;
      } else {
        replyText = `Your message has been marked for priority review. A CareRefill counselor at ${branchName} will reach out to you within 15 minutes! Please call us directly at ${branchPhone} for emergency questions.`;
      }

      setMessages(prev => [...prev, { role: "bot", text: replyText, time: new Date() }]);
      setBotReplying(false);
      showToast("Message Transmitted", "Our nurse coordinator has received your notes.", "success");
    }, 1200);
  };

  // Close with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Slide-Up Support Panel Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="pointer-events-auto w-[92vw] sm:w-[380px] h-[550px] rounded-3xl overflow-hidden shadow-2xl glass-panel border border-white/60 dark:border-slate-800 flex flex-col mb-4 origin-bottom-right"
          >
            {/* Elegant Header Panel */}
            <div className="p-5 bg-gradient-to-r from-emerald-600 to-lime-600 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                  <Sparkles className="w-5 h-5 text-lime-150 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-black font-sans tracking-tight">CareRefill Careline</h4>
                  <p className="text-[10px] text-emerald-100 font-medium">Real-time Patient Nudge & Support Portal</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <StatusBadge online={true} />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/25 transition cursor-pointer"
                  aria-label="Close support loop"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Info Bar */}
            <div className="bg-slate-50/80 dark:bg-slate-950/60 p-2.5 px-4 border-b dark:border-slate-800 flex items-center gap-2 text-[10px] text-gray-500 font-medium justify-between font-mono">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                {branchName}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-600" />
                {branchPhone}
              </span>
            </div>

            {/* Messages Thread list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-white/40 dark:bg-slate-900/40">
              {messages.map((m, idx) => {
                const isUser = m.role === "user";
                return (
                  <div key={idx} className={`flex gap-2 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      isUser ? "bg-lime-500 text-white" : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-350 border dark:border-emerald-900/50"
                    }`}>
                      {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>
                    
                    <div className="space-y-0.5">
                      <div className={`p-3 rounded-2xl text-[11px] leading-relaxed shadow-3xs ${
                        isUser 
                          ? "bg-lime-600 text-white rounded-tr-none font-medium" 
                          : "bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 border dark:border-slate-800 rounded-tl-none font-medium"
                      }`}>
                        {m.text}
                      </div>
                      <span className={`text-[8px] text-gray-400 block px-1 ${isUser ? "text-right" : "text-left"}`}>
                        {m.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {botReplying && (
                <div className="flex gap-2 max-w-[85%] mr-auto">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-350 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 p-3 rounded-2xl rounded-tl-none flex items-center gap-1 shadow-3xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion buttons */}
            <div className="p-3 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 space-y-1.5">
              <label className="text-[9px] uppercase tracking-wider font-extrabold text-gray-400 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-amber-500" />
                <span>Frequently Asked Inquiries</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => handlePresetSelect(
                    "📅 Schedule Appointment",
                    "We can book you into our calendar for custom adherence diagnostic consults immediately! Please give us your preferred shift, morning or afternoon."
                  )}
                  className="bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 border dark:border-slate-700 text-[10px] font-bold px-2 py-1 rounded-lg text-gray-600 dark:text-gray-300 cursor-pointer premium-transition transition-all"
                >
                  Schedule Appointment
                </button>
                <button
                  onClick={() => handlePresetSelect(
                    "💊 Adherence Loyalty Points",
                    "For every compliant timely refill logged, we credit your profile with +50 health tokens! These can be redeemed for diagnostics, cellular airtime and more."
                  )}
                  className="bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 border dark:border-slate-700 text-[10px] font-bold px-2 py-1 rounded-lg text-gray-600 dark:text-gray-300 cursor-pointer premium-transition transition-all"
                >
                  Adherence Loyalty
                </button>
                <button
                  onClick={() => handlePresetSelect(
                    "🩺 View Facility Contacts",
                    `Sure! Reach our Kampala hub on ${branchPhone}. We are available 7 AM to 9 PM, local East Africa time.`
                  )}
                  className="bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 border dark:border-slate-700 text-[10px] font-bold px-2 py-1 rounded-lg text-gray-600 dark:text-gray-300 cursor-pointer premium-transition transition-all"
                >
                  Facility Contacts
                </button>
              </div>
            </div>

            {/* Input Form Footer */}
            <form onSubmit={handleSendMessage} className="p-3 border-t dark:border-slate-850 bg-white dark:bg-slate-900 flex gap-1.5">
              <input
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder="Message patient support..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 text-xs px-3 py-2 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              />
              <button
                type="submit"
                disabled={!typedMessage.trim() || botReplying}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl transition cursor-pointer flex items-center justify-center shrink-0 shadow-3xs active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern floating pill shaped action button (FAB) */}
      <div className="relative pointer-events-auto flex items-center justify-end">
        {/* Help Tooltip */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute right-[190px] bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-xl shadow-lg border border-slate-800 dark:border-slate-200 whitespace-nowrap z-40 select-none mr-2 flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
              <span>Need help? Chat with us!</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          id="talk-with-us-fab"
          ref={fabRef}
          onClick={handleFabClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.96 }}
          className={`
            relative overflow-hidden group flex items-center gap-2 px-5 py-3.5 rounded-full cursor-pointer
            bg-gradient-to-r from-emerald-600 to-lime-600 text-white font-extrabold text-xs uppercase tracking-wider
            shadow-xl shadow-emerald-950/20 hover:shadow-emerald-900/30 font-sans border border-emerald-500/30 border-t-emerald-400/50 
            transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500
          `}
          aria-label="Talk With Us support chat panel toggle"
        >
          {/* Subtle glowing animated backdrop indicator */}
          <span className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
          
          <div className="relative flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
            
            {/* Collapsed text coordinates (Compact on ultra mobile, full on normal sizes) */}
            <span className="inline-block">Talk With Us</span>
          </div>

          {/* Glowing pulse aura animation */}
          {!isOpen && (
            <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-lime-500 opacity-30 blur-sm -z-10 group-hover:scale-110 transition duration-300 animate-pulse" />
          )}

          {/* Custom ripple feedback click render simulation */}
          {ripple && (
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/20 rounded-full animate-ping pointer-events-none" />
          )}
        </motion.button>
      </div>

    </div>
  );
}
