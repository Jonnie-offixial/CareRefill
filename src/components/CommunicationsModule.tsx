import React, { useState } from "react";
import { 
  MessageSquare, 
  Send, 
  Search, 
  CheckCircle, 
  X, 
  Clock, 
  FileText,
  Mail,
  Smartphone,
  Check,
  AlertCircle
} from "lucide-react";

interface CommLog {
  id: string;
  recipient: string;
  channel: "SMS" | "WhatsApp" | "Email";
  templateUsed: string;
  sentAt: string;
  status: "Sent" | "Delivered" | "Failed";
  content: string;
}

interface CommTemplate {
  id: string;
  title: string;
  channel: "SMS" | "WhatsApp" | "Email";
  content: string;
}

interface CommunicationsModuleProps {
  showToast: (message: string, description?: string, type?: "success" | "error" | "info") => void;
}

export default function CommunicationsModule({
  showToast,
}: CommunicationsModuleProps) {
  const [activeCommTab, setActiveCommTab] = useState<"SMS" | "WhatsApp" | "Email">("WhatsApp");
  const [searchTerm, setSearchTerm] = useState("");

  // Templates list
  const [templates, setTemplates] = useState<CommTemplate[]>([
    {
      id: "tmp-01",
      title: "Medication Refill Alert Reminder",
      channel: "WhatsApp",
      content: "Hello {{patient_name}}, this is CareRefill. Your critical prescription of {{medication}} is due for refill on {{refill_date}} at {{facility}}. Reply Refill to dispatch courier automatically."
    },
    {
      id: "tmp-02",
      title: "Fast Adherence Questionnaire survey",
      channel: "WhatsApp",
      content: "Hi {{patient_name}}, how are you feeling today since last clinical refill of {{medication}}? Text 1 for Great, 2 for Fair, 3 for poor."
    },
    {
      id: "tmp-03",
      title: "Basic Refill SMS Warning Notification",
      channel: "SMS",
      content: "Alert: Refill for {{medication}} is due soon. Secure your clinic slot by texting CareRefill."
    },
    {
      id: "tmp-04",
      title: "Inflow Billing Invoice Dispatch",
      channel: "Email",
      content: "Dear {{patient_name}}, your CareRefill monthly medication courier parcel has been packed. Billed amount: {{amount}}. Track progress at CareRefill.com/track."
    }
  ]);

  // Pre-populated messages logs list
  const [commsLogs, setCommsLogs] = useState<CommLog[]>([
    {
      id: "log-501",
      recipient: "+256 701 443221",
      channel: "WhatsApp",
      templateUsed: "Medication Refill Alert Reminder",
      sentAt: "10:15 AM",
      status: "Delivered",
      content: "Hello Joy Nabasa, this is CareRefill. Your critical prescription of Atorvastatin 20mg is due for refill tomorrow at Kampala Community Pharmacy."
    },
    {
      id: "log-502",
      recipient: "+256 788 123456",
      channel: "SMS",
      templateUsed: "Basic Refill SMS Warning Notification",
      sentAt: "Yesterday 4:00 PM",
      status: "Sent",
      content: "Alert: Refill for Metformin 500mg is due soon. Secure your slot with CareRefill."
    },
    {
      id: "log-503",
      recipient: "estyalupo@gmail.com",
      channel: "Email",
      templateUsed: "Inflow Billing Invoice Dispatch",
      sentAt: "Yesterday 9:00 AM",
      status: "Delivered",
      content: "Dear Esther Alupo, your CareRefill monthly medication parcel has been packed. Billed amount: UGX 35,000. Track progress at CareRefill.com/track."
    },
    {
      id: "log-504",
      recipient: "+256 705 987654",
      channel: "WhatsApp",
      templateUsed: "Fast Adherence Questionnaire survey",
      sentAt: "2 days ago",
      status: "Failed",
      content: "Hi Moses Sempampa, how are you feeling today since last refill of Dolutegravir 50mg? Text 1 for Great, 2 for Fair."
    }
  ]);

  // Composer values
  const [composerRecipient, setComposerRecipient] = useState("");
  const [composerTemplate, setComposerTemplate] = useState("tmp-01");
  const [composerContent, setComposerContent] = useState("");

  // When template changes in option
  const handleTemplateSelect = (id: string) => {
    setComposerTemplate(id);
    const tmpl = templates.find(t => t.id === id);
    if (tmpl) {
      setComposerContent(tmpl.content);
    }
  };

  const handleSendReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerRecipient || !composerContent) {
      showToast("Verification Error", "Recipient address and custom message text are required.", "error");
      return;
    }

    const newLog: CommLog = {
      id: `log-${Date.now().toString().slice(-3)}`,
      recipient: composerRecipient,
      channel: activeCommTab,
      templateUsed: templates.find(t => t.id === composerTemplate)?.title || "Manual Custom Dispatch",
      sentAt: "Just Now",
      status: "Sent",
      content: composerContent
    };

    setCommsLogs([newLog, ...commsLogs]);
    showToast("Message Dispatched", `Secure ${activeCommTab} automated reminder sent to ${composerRecipient}.`, "success");

    // Reset composer form
    setComposerRecipient("");
    setComposerContent("");
  };

  const filteredLogs = commsLogs.filter(cl => {
    const matchesSearch = cl.recipient?.includes(searchTerm) || 
                          cl.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cl.templateUsed?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChannel = cl.channel === activeCommTab;
    return matchesSearch && matchesChannel;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Upper header section */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-sans tracking-tight">Clinical communications console</h3>
        <p className="text-xs text-gray-500 font-medium">Configure automated patient feedback channels, customize WhatsApp bots, and audit SMS bulk templates.</p>
      </div>

      {/* Primary Channel Tabs */}
      <div className="flex border-b dark:border-slate-800 gap-6">
        <button
          onClick={() => {
            setActiveCommTab("WhatsApp");
            handleTemplateSelect("tmp-01");
          }}
          className={`pb-3 text-xs uppercase font-black tracking-widest cursor-pointer border-b-2 flex items-center gap-1.5 transition ${
            activeCommTab === "WhatsApp" 
              ? "border-emerald-600 text-emerald-600 font-black" 
              : "border-transparent text-gray-400 hover:text-gray-650"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>WhatsApp Chat API</span>
        </button>

        <button
          onClick={() => {
            setActiveCommTab("SMS");
            handleTemplateSelect("tmp-03");
          }}
          className={`pb-3 text-xs uppercase font-black tracking-widest cursor-pointer border-b-2 flex items-center gap-1.5 transition ${
            activeCommTab === "SMS" 
              ? "border-emerald-600 text-emerald-600 font-black" 
              : "border-transparent text-gray-400 hover:text-gray-650"
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>SMS Network Gateway</span>
        </button>

        <button
          onClick={() => {
            setActiveCommTab("Email");
            handleTemplateSelect("tmp-04");
          }}
          className={`pb-3 text-xs uppercase font-black tracking-widest cursor-pointer border-b-2 flex items-center gap-1.5 transition ${
            activeCommTab === "Email" 
              ? "border-emerald-600 text-emerald-600" 
              : "border-transparent text-gray-400 hover:text-gray-650"
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Corporate Emails</span>
        </button>
      </div>

      {/* Grid: Send and Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Campaign Sender & Template Editor (5 Columns) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b dark:border-slate-800">
            <Send className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-black uppercase text-gray-900 dark:text-white tracking-wider">Fast Campaign Sender</h4>
          </div>

          <form onSubmit={handleSendReminder} className="space-y-4 text-xs font-medium">
            
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase font-mono text-gray-400">Select Campaign Template</label>
              <select
                value={composerTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full text-xs font-semibold p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl focus:outline-none cursor-pointer"
              >
                {templates.filter(t => t.channel === activeCommTab).map(tmpl => (
                  <option key={tmpl.id} value={tmpl.id}>{tmpl.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase font-mono text-gray-400">
                {activeCommTab === "Email" ? "Recipient Email Address" : "Recipient Mobile Contact"}
              </label>
              <input
                type="text"
                required
                value={composerRecipient}
                onChange={(e) => setComposerRecipient(e.target.value)}
                placeholder={activeCommTab === "Email" ? "joy@gmail.com" : "+256 701 443221"}
                className="w-full text-xs font-semibold p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase font-mono text-gray-400">Message Text Content Preview &amp; Edit</label>
              <textarea
                required
                rows={4}
                value={composerContent}
                onChange={(e) => setComposerContent(e.target.value)}
                className="w-full text-xs font-semibold p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer transition shadow-3xs flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Secure Alert</span>
            </button>

          </form>
        </div>

        {/* Right Side: Message Audit Logs & Delivery Tracker (7 Columns) */}
        <div className="lg:col-span-12 lg:col-span-7 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-black uppercase text-gray-900 dark:text-white tracking-wider">Live Communication Logs</h4>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search dispatch logs..."
                className="bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 p-1.5 px-3 pl-8 rounded-xl text-xs font-bold focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="space-y-3.5 max-h-[360px] overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <p className="text-xs text-gray-400 font-bold py-8 font-mono text-center uppercase">No active communication logs.</p>
            ) : (
              filteredLogs.map((log) => {
                const isDelivered = log.status === "Delivered";
                const isSent = log.status === "Sent";
                const isFailed = log.status === "Failed";

                return (
                  <div key={log.id} className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border dark:border-slate-850 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-extrabold text-gray-900 dark:text-white">
                        <span className="text-[9px] uppercase tracking-wide font-black text-gray-400 font-mono">ID: {log.id}</span>
                        <span>•</span>
                        <span>{log.recipient}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 font-mono">{log.sentAt}</span>
                        <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 border rounded-full ${
                          isDelivered ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-transparent" :
                          isFailed ? "bg-red-500/10 text-red-750 border-transparent" : "bg-blue-500/10 text-blue-700 border-transparent"
                        }`}>
                          {isDelivered && <Check className="w-2.5 h-2.5" />}
                          {isFailed && <AlertCircle className="w-2.5 h-2.5" />}
                          {isSent && <Clock className="w-2.5 h-2.5" />}
                          <span>{log.status}</span>
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-600 dark:text-slate-350 leading-relaxed font-sans prose dark:prose-invert">
                      {log.content}
                    </p>

                    <p className="text-[9.5px] text-gray-400 font-medium font-mono uppercase tracking-wider">
                      Template: {log.templateUsed}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
