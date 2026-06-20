import React, { useState } from "react";
import { 
  Package, 
  Search, 
  MapPin, 
  Truck, 
  CheckCircle, 
  Eye, 
  X,
  Clock,
  ExternalLink
} from "lucide-react";

interface Order {
  order_id: string;
  patient_name: string;
  facility: string;
  amount: string; // e.g. "UGX 45,000"
  date: string;
  status: "Processing" | "Dispatched" | "In-Transit" | "Delivered" | "Cancelled";
  tracking_history: Array<{ step: string; refTime: string; done: boolean }>;
}

interface OrdersModuleProps {
  showToast: (message: string, description?: string, type?: "success" | "error" | "info") => void;
}

export default function OrdersModule({
  showToast,
}: OrdersModuleProps) {
  const [orders, setOrders] = useState<Order[]>(() => {
    const cached = localStorage.getItem("carerefill_orders_list");
    if (cached) {
      try { return JSON.parse(cached); } catch(e) {}
    }
    const defaults: Order[] = [
      {
        order_id: "ORD-921",
        patient_name: "Joy Nabasa",
        facility: "Kampala Community Pharmacy",
        amount: "UGX 55,000",
        date: new Date().toISOString().split("T")[0],
        status: "Processing",
        tracking_history: [
          { step: "Order Placed", refTime: "10:30 AM", done: true },
          { step: "Clinical Review Completed", refTime: "11:15 AM", done: true },
          { step: "Dispatched from Depot", refTime: "Waiting", done: false },
          { step: "Delivered to Patient Clinic", refTime: "Waiting", done: false }
        ]
      },
      {
        order_id: "ORD-922",
        patient_name: "Robert Okello",
        facility: "Mulago National Referral Hospital",
        amount: "UGX 120,000",
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "In-Transit",
        tracking_history: [
          { step: "Order Placed", refTime: "Yesterday", done: true },
          { step: "Clinical Review Completed", refTime: "Yesterday", done: true },
          { step: "Dispatched from Depot", refTime: "Yesterday 4:00 PM", done: true },
          { step: "Delivered to Patient Clinic", refTime: "In Transit", done: false }
        ]
      },
      {
        order_id: "ORD-923",
        patient_name: "Esther Alupo",
        facility: "Nakasero Medical Clinic Group",
        amount: "UGX 35,000",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "Delivered",
        tracking_history: [
          { step: "Order Placed", refTime: "3 days ago", done: true },
          { step: "Clinical Review Completed", refTime: "3 days ago", done: true },
          { step: "Dispatched from Depot", refTime: "2 days ago", done: true },
          { step: "Delivered to Patient Clinic", refTime: "Yesterday 9:00 AM", done: true }
        ]
      },
      {
        order_id: "ORD-924",
        patient_name: "Moses Sempampa",
        facility: "Kampala Community Pharmacy",
        amount: "UGX 88,000",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "Cancelled",
        tracking_history: [
          { step: "Order Placed", refTime: "Cancelled by Client", done: false },
          { step: "Clinical Review Completed", refTime: "N/A", done: false },
          { step: "Dispatched from Depot", refTime: "N/A", done: false },
          { step: "Delivered to Patient Clinic", refTime: "N/A", done: false }
        ]
      }
    ];
    localStorage.setItem("carerefill_orders_list", JSON.stringify(defaults));
    return defaults;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleUpdateStatus = (id: string, next: Order["status"]) => {
    const updated = orders.map(o => {
      if (o.order_id === id) {
        // Adjust tracking steps done array helper
        const stepIndex = {
          Processing: 1,
          Dispatched: 2,
          "In-Transit": 3,
          Delivered: 4,
          Cancelled: 0
        }[next] || 1;

        const nextHistory = o.tracking_history.map((th, index) => {
          if (next === "Cancelled") {
            return { ...th, done: false, refTime: "Cancelled" };
          }
          return {
            ...th,
            done: index < stepIndex,
            refTime: index < stepIndex ? (th.refTime === "Waiting" || th.refTime === "In Transit" ? "Just Now" : th.refTime) : "Waiting"
          };
        });

        return { ...o, status: next, tracking_history: nextHistory };
      }
      return o;
    });

    setOrders(updated);
    localStorage.setItem("carerefill_orders_list", JSON.stringify(updated));
    showToast("Delivery Updated", `Transit state designated as ${next}.`, "success");
    if (selectedOrder && selectedOrder.order_id === id) {
      const match = updated.find(o => o.order_id === id);
      if (match) setSelectedOrder(match);
    }
  };

  const filteredOrders = orders.filter(o => {
    return o.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
           o.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           o.facility?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title & upper action */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-sans tracking-tight">Active Delivery &amp; Orders Tracker</h3>
        <p className="text-xs text-gray-500">Query patient courier channels, update delivery dispatch cycles, and trace GPS timelines.</p>
      </div>

      {/* Query panel search */}
      <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-4 rounded-3xl">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search orders list by patient, clinic node, or tracking UUID ID..."
            className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 pl-11 pr-4 py-3 rounded-2xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
          />
        </div>
      </div>

      {/* Table grid layout list */}
      <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-950/40 border-b dark:border-slate-800 text-[10px] uppercase font-black tracking-wider text-gray-450">
                <th className="p-4 px-6">Order ID</th>
                <th className="p-4">Patient</th>
                <th className="p-4">Dispatched Facility</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800/80">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-gray-400 font-bold uppercase font-mono">
                    No order coordinates found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const isDelivered = o.status === "Delivered";
                  const isProcessing = o.status === "Processing";
                  const isTransit = o.status === "In-Transit" || o.status === "Dispatched";
                  const isCancelled = o.status === "Cancelled";

                  return (
                    <tr key={o.order_id} className="text-xs hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all font-medium">
                      
                      <td className="p-4 px-6 font-mono font-black text-emerald-600 dark:text-emerald-400">
                        {o.order_id}
                      </td>

                      <td className="p-4 font-extrabold text-slate-850 dark:text-white">
                        {o.patient_name}
                      </td>

                      <td className="p-4 text-gray-500 font-medium">{o.facility}</td>
                      <td className="p-4 text-gray-900 dark:text-gray-100 font-extrabold font-mono">{o.amount}</td>
                      <td className="p-4 font-mono text-gray-450 text-[11px]">{o.date}</td>

                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-0.5 border text-[9px] font-black uppercase tracking-wider rounded-full ${
                          isDelivered ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/10" :
                          isCancelled ? "bg-red-500/10 text-red-700 border-red-500/10" :
                          isProcessing ? "bg-amber-500/10 text-amber-700 border-amber-500/10 animate-pulse" :
                          "bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/10"
                        }`}>
                          {o.status}
                        </span>
                      </td>

                      <td className="p-4 text-right pr-6 space-x-1.5 flex items-center justify-end">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-1 px-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border dark:border-slate-700 rounded-lg text-gray-600 dark:text-gray-200 cursor-pointer font-bold inline-flex items-center gap-1 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Track</span>
                        </button>

                        <select
                          value={o.status}
                          onChange={(e) => handleUpdateStatus(o.order_id, e.target.value as any)}
                          className="bg-slate-50 dark:bg-slate-800 border dark:border-slate-751 text-[10px] font-black uppercase tracking-wide cursor-pointer rounded-lg p-1 px-1.5 text-gray-650 dark:text-gray-200"
                        >
                          <option value="Processing">Processing</option>
                          <option value="In-Transit">In-Transit</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Tracking Modal Dialogue */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border dark:border-slate-800 animate-[zoomIn_0.2s_ease-out] flex flex-col">
            
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950 rounded-xl text-emerald-600">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black dark:text-white uppercase tracking-tight">Delivery Milestones Log</h3>
                    <p className="text-[10px] text-gray-400 font-mono font-bold">Tracking ID: {selectedOrder.order_id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Patient and pricing overview */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl flex items-center justify-between text-xs font-bold text-gray-700 dark:text-slate-350">
                <div>
                  <span className="text-[9.5s] text-gray-400 uppercase tracking-widest block font-mono">Courier Destination</span>
                  <span>{selectedOrder.patient_name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9.5s] text-gray-400 uppercase tracking-widest block font-mono">Billed Price</span>
                  <span className="text-emerald-700 dark:text-emerald-450 font-mono text-sm">{selectedOrder.amount}</span>
                </div>
              </div>

              {/* Progress Milestones Checklist Vertical tree */}
              <div className="space-y-4 relative py-2 pl-4">
                <div className="absolute left-[23px] top-[15px] bottom-[25px] w-[2px] bg-slate-150 dark:bg-slate-800" />
                
                {selectedOrder.tracking_history.map((step, index) => {
                  return (
                    <div key={index} className="flex items-start gap-4 relative">
                      <div className={`w-5 h-5 rounded-full z-10 flex items-center justify-center shrink-0 ${
                        step.done 
                          ? "bg-emerald-500 text-white" 
                          : "bg-slate-100 border-2 border-slate-300 text-gray-400 dark:bg-slate-950 dark:border-slate-800"
                      }`}>
                        {step.done ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-2.5 h-2.5" />
                        )}
                      </div>
                      
                      <div className="text-xs">
                        <p className={`font-extrabold ${step.done ? "text-gray-950 dark:text-white" : "text-gray-400"}`}>
                          {step.step}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">{step.refTime}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t dark:border-slate-850 flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close Tracking
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
