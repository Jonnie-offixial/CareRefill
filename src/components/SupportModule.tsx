import React, { useState } from "react";
import { 
  HelpCircle, 
  Search, 
  AlertOctagon, 
  CheckCircle2, 
  User, 
  MessageSquare,
  FileQuestion,
  X,
  Sparkles
} from "lucide-react";

interface Ticket {
  ticket_id: string;
  user: string;
  issue: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "Resolved";
  date: string;
  replies: string[];
}

interface SupportModuleProps {
  showToast: (message: string, description?: string, type?: "success" | "error" | "info") => void;
}

export default function SupportModule({
  showToast,
}: SupportModuleProps) {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const cached = localStorage.getItem("carerefill_support_tickets");
    if (cached) {
      try { return JSON.parse(cached); } catch(e) {}
    }
    const defaults: Ticket[] = [
      {
        ticket_id: "TCK-801",
        user: "Joan Namazzi",
        issue: "Unable to confirm mobile subscription replenishment bundle using MTN mobile money.",
        priority: "High",
        status: "Pending",
        date: new Date().toISOString().split("T")[0],
        replies: []
      },
      {
        ticket_id: "TCK-802",
        user: "Dr. Ben Kigozi",
        issue: "Requesting additional API endpoint authorization keys for direct clinical EMR synchronization.",
        priority: "Medium",
        status: "Pending",
        date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString().split("T")[0],
        replies: []
      },
      {
        ticket_id: "TCK-803",
        user: "Pius Musisi",
        issue: "My periodic WhatsApp adherence reminders are arriving 2 hours later than standard scheduled chron slots.",
        priority: "Low",
        status: "Resolved",
        date: new Date(Date.now() - 48 * 60 * 60 * 1005).toISOString().split("T")[0],
        replies: ["System delay resolved. Readjusted WhatsApp Cron Engine configuration."]
      }
    ];
    localStorage.setItem("carerefill_support_tickets", JSON.stringify(defaults));
    return defaults;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"All" | Ticket["priority"]>("All");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyInput, setReplyInput] = useState("");

  const handleResolveTicket = (id: string) => {
    const updated = tickets.map(t => {
      if (t.ticket_id === id) {
        return { 
          ...t, 
          status: "Resolved" as const,
          replies: replyInput ? [...t.replies, replyInput] : t.replies 
        };
      }
      return t;
    });
    setTickets(updated);
    localStorage.setItem("carerefill_support_tickets", JSON.stringify(updated));
    showToast("Ticket Resolved", `Ticket ${id} state synchronized to Resolved.`, "success");
    setSelectedTicket(null);
    setReplyInput("");
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.user?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.issue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.ticket_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === "All" || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Upper Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-sans tracking-tight">Patient &amp; Partner Support Tickets</h3>
          <p className="text-xs text-gray-500">Respond to clinics complaints, authorize clinical integrations, and respond to WhatsApp channel issues.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 font-bold uppercase font-mono">Filter Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="bg-white dark:bg-slate-900 border dark:border-slate-800 p-2 px-3 rounded-xl text-xs font-bold text-gray-650 cursor-pointer focus:outline-none"
          >
            <option value="All">All Tickets</option>
            <option value="High">🔴 High Priority</option>
            <option value="Medium">🟡 Medium Priority</option>
            <option value="Low">🟢 Low Priority</option>
          </select>
        </div>
      </div>

      {/* Query Search panel */}
      <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-4 rounded-3xl">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search support ticket logs by patient, UUID code, or issue keywords..."
            className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 pl-11 pr-4 py-3 rounded-2xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
          />
        </div>
      </div>

      {/* Table grid listing */}
      <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-950/40 border-b dark:border-slate-800 text-[10px] uppercase font-black tracking-wider text-gray-450">
                <th className="p-4 px-6">Ticket ID</th>
                <th className="p-4">User</th>
                <th className="p-4">Issue Complaint Description</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right pr-6">Operational Action</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800/80">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-gray-400 font-bold uppercase font-mono">
                    No support tickets found matching specifications.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => {
                  const isHigh = t.priority === "High";
                  const isMedium = t.priority === "Medium";
                  const isPending = t.status === "Pending";

                  return (
                    <tr key={t.ticket_id} className="text-xs hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all font-medium">
                      
                      <td className="p-4 px-6 font-mono font-black text-rose-500">
                        {t.ticket_id}
                      </td>

                      <td className="p-4 font-extrabold text-slate-850 dark:text-white">
                        {t.user}
                      </td>

                      <td className="p-4 max-w-[280px]">
                        <p className="truncate text-gray-650 dark:text-gray-300 font-medium" title={t.issue}>{t.issue}</p>
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex px-2 py-0.5 text-[9px] font-black uppercase rounded-md ${
                          isHigh ? "bg-red-50 text-red-700 dark:bg-red-950/25" :
                          isMedium ? "bg-amber-50 text-amber-700 dark:bg-amber-950/25" :
                          "bg-blue-50 text-blue-700 dark:bg-blue-950/25"
                        }`}>
                          {t.priority}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-0.5 border text-[9px] font-black uppercase tracking-wider rounded-full ${
                          isPending 
                            ? "bg-amber-500/10 text-amber-700 border-amber-500/10 animate-pulse" 
                            : "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/10"
                        }`}>
                          {t.status}
                        </span>
                      </td>

                      <td className="p-4 text-right pr-6">
                        <button
                          onClick={() => setSelectedTicket(t)}
                          className={`p-1 px-2.5 rounded-lg border text-[10px] font-black uppercase cursor-pointer tracking-wider transition ${
                            isPending
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-3xs"
                              : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-gray-600 dark:text-gray-200"
                          }`}
                        >
                          {isPending ? "Reply & Resolve" : "Review logs"}
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Details & Composer Modal View */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border dark:border-slate-800 animate-[zoomIn_0.2s_ease-out] flex flex-col">
            
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950 rounded-xl text-emerald-600">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black dark:text-white uppercase tracking-tight">Active Support Desk</h3>
                    <p className="text-[10px] text-gray-400 font-mono font-bold">Ticket: {selectedTicket.ticket_id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="p-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* General complaint details */}
              <div className="space-y-2 text-xs">
                <p className="text-gray-400 uppercase font-mono text-[9px] tracking-widest font-bold">User Submitting coordinates</p>
                <div className="flex items-center gap-2 font-black text-gray-800 dark:text-white">
                  <User className="w-3.5 h-3.5" />
                  <span>{selectedTicket.user}</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/45 border dark:border-slate-850 rounded-xl leading-relaxed text-gray-700 dark:text-slate-300 font-medium">
                  {selectedTicket.issue}
                </div>
              </div>

              {/* Replies logs */}
              {selectedTicket.replies.length > 0 && (
                <div className="space-y-1.5 text-xs">
                  <p className="text-gray-400 uppercase font-mono text-[9px] tracking-widest font-bold">Resolution Messages Archive</p>
                  {selectedTicket.replies.map((rep, idx) => (
                    <div key={idx} className="p-2.5 bg-emerald-500/10 border border-emerald-500/10 text-emerald-800 dark:text-emerald-300 rounded-lg font-medium leading-normal">
                      {rep}
                    </div>
                  ))}
                </div>
              )}

              {/* Write answer */}
              {selectedTicket.status === "Pending" && (
                <div className="space-y-1.5 text-xs font-medium">
                  <label className="text-gray-400 uppercase font-mono text-[9px] tracking-widest font-bold block">Type Resolution Response Message</label>
                  <textarea
                    rows={3}
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    placeholder="Describe resolution steps mapped..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-semibold"
                  />
                </div>
              )}

            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t dark:border-slate-850 flex items-center justify-end gap-2 shrink-0 text-xs">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-white rounded-xl font-bold cursor-pointer"
              >
                Close Logs
              </button>
              {selectedTicket.status === "Pending" && (
                <button
                  onClick={() => handleResolveTicket(selectedTicket.ticket_id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase tracking-wider cursor-pointer shadow-3xs"
                >
                  Confirm &amp; set Resolved
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
