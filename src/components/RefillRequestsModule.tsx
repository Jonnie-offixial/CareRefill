import React, { useState } from "react";
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Hourglass,
  ExternalLink,
  Bot
} from "lucide-react";

interface RefillRequest {
  request_id: string;
  patient_name: string;
  medication: string;
  facility: string;
  request_date: string; // ISO date
  status: "Pending" | "Approved" | "Rejected" | "Completed";
}

interface RefillRequestsModuleProps {
  showToast: (message: string, description?: string, type?: "success" | "error" | "info") => void;
}

export default function RefillRequestsModule({
  showToast,
}: RefillRequestsModuleProps) {
  const [requests, setRequests] = useState<RefillRequest[]>(() => {
    const cached = localStorage.getItem("carerefill_refill_requests");
    if (cached) {
      try { return JSON.parse(cached); } catch(e) {}
    }
    const defaults: RefillRequest[] = [
      {
        request_id: "req-101",
        patient_name: "Joy Nabasa",
        medication: "Atorvastatin 20mg",
        facility: "Kampala Community Pharmacy",
        request_date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "Pending"
      },
      {
        request_id: "req-102",
        patient_name: "Robert Okello",
        medication: "Metformin 500mg",
        facility: "Mulago National Referral Hospital",
        request_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "Approved"
      },
      {
        request_id: "req-103",
        patient_name: "Esther Alupo",
        medication: "Albuterol Inhaler (Ventolin)",
        facility: "Nakasero Medical Clinic Group",
        request_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "Completed"
      },
      {
        request_id: "req-104",
        patient_name: "Moses Sempampa",
        medication: "Dolutegravir 50mg / Tenofovir",
        facility: "Kampala Community Pharmacy",
        request_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "Rejected"
      },
      {
        request_id: "req-105",
        patient_name: "Vianne Jonny",
        medication: "Coartem 80/480mg",
        facility: "Nakasero Medical Clinic Group",
        request_date: new Date().toISOString().split("T")[0],
        status: "Pending"
      }
    ];
    localStorage.setItem("carerefill_refill_requests", JSON.stringify(defaults));
    return defaults;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | RefillRequest["status"]>("All");

  const updateRequestStatus = (id: string, nextStatus: RefillRequest["status"]) => {
    const updated = requests.map(r => {
      if (r.request_id === id) {
        return { ...r, status: nextStatus };
      }
      return r;
    });
    setRequests(updated);
    localStorage.setItem("carerefill_refill_requests", JSON.stringify(updated));
    
    const message = {
      Approved: "Refill Approved",
      Rejected: "Refill Rejected",
      Completed: "Refill Completed Successfully"
    }[nextStatus as string] || "Status Update";

    showToast(message, `Request ${id} status has been synchronized.`, nextStatus === "Rejected" ? "error" : "success");
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.medication?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.facility?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Upper header action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-sans tracking-tight">Chronic Refill Requests Hub</h3>
          <p className="text-xs text-gray-500">Coordinate and verify incoming drug replenishment requests flagged by patients and remote pharmacies.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 font-bold uppercase font-mono">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-white dark:bg-slate-900 border dark:border-slate-800 p-2 px-3 rounded-xl text-xs font-bold text-gray-650 cursor-pointer focus:outline-none"
          >
            <option value="All">All Refill Requests</option>
            <option value="Pending">Pending Approval</option>
            <option value="Approved">Approved / In-transit</option>
            <option value="Completed">Completed cycles</option>
            <option value="Rejected">Rejected requests</option>
          </select>
        </div>
      </div>

      {/* Query search filters */}
      <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-4 rounded-3xl">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search request logs by patient name, medication, or dispensing branch clinic..."
            className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 pl-11 pr-4 py-3 rounded-2xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
          />
        </div>
      </div>

      {/* Requests table listing */}
      <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-950/40 border-b dark:border-slate-800 text-[10px] uppercase font-black tracking-wider text-gray-450">
                <th className="p-4 px-6">Patient</th>
                <th className="p-4">Medication</th>
                <th className="p-4">Dispatched Facility</th>
                <th className="p-4">Request Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right pr-6">Workflow Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800/80">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-gray-400 font-bold uppercase font-mono">
                    No active refill request coordinates found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const isPending = req.status === "Pending";
                  const isApproved = req.status === "Approved";
                  const isCompleted = req.status === "Completed";
                  const isRejected = req.status === "Rejected";

                  return (
                    <tr key={req.request_id} className="text-xs hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all font-medium">
                      
                      <td className="p-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200/50 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black uppercase text-teal-850 dark:text-teal-300">
                            {req.patient_name?.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-extrabold text-gray-900 dark:text-gray-100">{req.patient_name}</span>
                        </div>
                      </td>

                      <td className="p-4 text-slate-850 dark:text-white font-bold">{req.medication}</td>
                      <td className="p-4 text-gray-500 font-medium">{req.facility}</td>
                      <td className="p-4 font-mono text-gray-450 text-[11px]">{req.request_date}</td>

                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-0.5 border text-[9px] font-black uppercase tracking-wider rounded-full ${
                          isCompleted ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/10" :
                          isRejected ? "bg-red-500/10 text-red-700 border-red-500/10" :
                          isApproved ? "bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/10" :
                          "bg-amber-500/10 text-amber-700 border-amber-500/10 animate-pulse"
                        }`}>
                          {req.status}
                        </span>
                      </td>

                      <td className="p-4 text-right pr-6 space-x-1.5">
                        {isPending && (
                          <>
                            <button
                              onClick={() => updateRequestStatus(req.request_id, "Approved")}
                              className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] uppercase tracking-wider rounded-lg cursor-pointer transition active:scale-95"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateRequestStatus(req.request_id, "Rejected")}
                              className="p-1 px-2.5 bg-red-100 dark:bg-rose-950/20 text-red-700 dark:text-rose-400 font-black text-[9px] uppercase tracking-wider rounded-lg cursor-pointer transition"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {isApproved && (
                          <button
                            onClick={() => updateRequestStatus(req.request_id, "Completed")}
                            className="p-1 px-2.5 bg-[#84CC16] hover:bg-[#71B20A] text-white font-black text-[9px] uppercase tracking-wider rounded-lg cursor-pointer transition active:scale-95 flex items-center gap-1.5 ml-auto"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Mark Completed</span>
                          </button>
                        )}

                        {(isCompleted || isRejected) && (
                          <span className="text-[10px] text-gray-400 uppercase font-mono font-bold block select-none">
                            Cycle Finalized
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
