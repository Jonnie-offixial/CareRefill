import React, { useState } from "react";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Plus, 
  UserCheck, 
  UserX, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  X,
  CreditCard,
  ShieldAlert
} from "lucide-react";

interface HealthFacility {
  facility_id: string;
  facility_name: string;
  type: "Pharmacy" | "Hospital" | "Clinic";
  location: string;
  contact: string;
  status: "Active" | "Pending Approval" | "Suspended";
  subscription_status: "Enterprise Plan" | "Regional Bundle" | "Basic Free" | "Expired";
}

interface HealthFacilitiesModuleProps {
  pharmaciesList: Array<{ pharmacy_id: string; pharmacy_name: string; address: string; phone_number: string }>;
  showToast: (message: string, description?: string, type?: "success" | "error" | "info") => void;
}

export default function HealthFacilitiesModule({
  pharmaciesList,
  showToast,
}: HealthFacilitiesModuleProps) {
  // Prepopulate using current pharmacies database + supplementary mock centers for extreme realism
  const [facilities, setFacilities] = useState<HealthFacility[]>(() => {
    const list: HealthFacility[] = pharmaciesList.map(p => ({
      facility_id: p.pharmacy_id,
      facility_name: p.pharmacy_name,
      type: "Pharmacy",
      location: p.address,
      contact: p.phone_number,
      status: "Active",
      subscription_status: "Regional Bundle"
    }));

    // Add classic medical centers in East Africa
    return [
      ...list,
      {
        facility_id: "fac-002",
        facility_name: "Mulago National Referral Hospital",
        type: "Hospital",
        location: "Kayiwa Rd, Kampala, Uganda",
        contact: "+256 414 554200",
        status: "Active",
        subscription_status: "Enterprise Plan"
      },
      {
        facility_id: "fac-003",
        facility_name: "Nakasero Medical Clinic Group",
        type: "Clinic",
        location: "Akii Bua Rd, Kampala, Uganda",
        contact: "+256 312 531400",
        status: "Pending Approval",
        subscription_status: "Basic Free"
      },
      {
        facility_id: "fac-004",
        facility_name: "Kisumu Community Care Dispensary",
        type: "Clinic",
        location: "Oginga Odinga Road, Kisumu, Kenya",
        contact: "+254 711 098765",
        status: "Suspended",
        subscription_status: "Expired"
      }
    ];
  });

  const [selectedFacility, setSelectedFacility] = useState<HealthFacility | null>(null);
  const [filterType, setFilterType] = useState<"All" | "Pharmacy" | "Hospital" | "Clinic">("All");

  // Status transitions
  const handleApprove = (id: string, name: string) => {
    setFacilities(prev => prev.map(f => {
      if (f.facility_id === id) {
        return { ...f, status: "Active" };
      }
      return f;
    }));
    showToast("Registration Approved", `${name} has been approved as an active medical refill node.`, "success");
  };

  const handleSuspend = (id: string, name: string) => {
    setFacilities(prev => prev.map(f => {
      if (f.facility_id === id) {
        return { ...f, status: "Suspended" };
      }
      return f;
    }));
    showToast("Account Suspended", `${name} has been suspended from the CareRefill clinical registry.`, "info");
  };

  const handleActiveToggle = (id: string, name: string) => {
    setFacilities(prev => prev.map(f => {
      if (f.facility_id === id) {
        return { ...f, status: f.status === "Active" ? "Suspended" : "Active" };
      }
      return f;
    }));
    showToast("Status Updated", `${name} status updated successfully.`, "success");
  };

  const filteredFacilities = facilities.filter(f => {
    return filterType === "All" || f.type === filterType;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title & upper action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-sans tracking-tight">Health Facilities Node Registry</h3>
          <p className="text-xs text-gray-500">Monitor multi-tenant clinical partners, handle license registrations, and suspend fraud nodes.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 font-bold uppercase font-mono">Filter Category:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="bg-white dark:bg-slate-900 border dark:border-slate-800 p-2 px-3 rounded-xl text-xs font-bold text-gray-650 cursor-pointer focus:outline-none"
          >
            <option value="All">All Facility Nodes</option>
            <option value="Pharmacy">Pharmacies</option>
            <option value="Hospital">Hospitals</option>
            <option value="Clinic">Clinics</option>
          </select>
        </div>
      </div>

      {/* Facilities table */}
      <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-950/40 border-b dark:border-slate-800 text-[10px] uppercase font-black tracking-wider text-gray-450">
                <th className="p-4 px-6">Facility Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Location</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Subscription Status</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800/80">
              {filteredFacilities.map((fac) => {
                const isApproved = fac.status === "Active";
                const isSuspended = fac.status === "Suspended";
                const isPending = fac.status === "Pending Approval";

                return (
                  <tr key={fac.facility_id} className="text-xs hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all font-medium">
                    <td className="p-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 dark:bg-slate-950/60 rounded-xl border dark:border-slate-800">
                          <Building2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="font-extrabold text-gray-900 dark:text-gray-100">{fac.facility_name}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="text-[10px] uppercase font-mono font-black text-slate-450 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">
                        {fac.type}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="text-gray-600 dark:text-slate-350 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate max-w-[170px]">{fac.location}</span>
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="text-gray-600 dark:text-slate-300 flex items-center gap-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{fac.contact}</span>
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="text-xs font-semibold text-gray-750 dark:text-slate-300 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{fac.subscription_status}</span>
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-0.5 border text-[9px] font-black uppercase tracking-wider rounded-full ${
                        isApproved ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/10" :
                        isSuspended ? "bg-red-500/10 text-red-700 border-red-500/10" : "bg-amber-500/10 text-amber-700 border-amber-500/10"
                      }`}>
                        {fac.status}
                      </span>
                    </td>

                    <td className="p-4 text-right pr-6 space-x-1">
                      <button
                        onClick={() => setSelectedFacility(fac)}
                        className="p-1 px-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border dark:border-slate-700 rounded-lg text-gray-600 dark:text-slate-200 cursor-pointer font-bold inline-flex items-center gap-1 transition"
                        title="View subscription logs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      {isPending ? (
                        <button
                          onClick={() => handleApprove(fac.facility_id, fac.facility_name)}
                          className="p-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] uppercase tracking-wider rounded-lg cursor-pointer inline-flex items-center gap-1 transition active:scale-95"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActiveToggle(fac.facility_id, fac.facility_name)}
                          className={`p-1 px-2 rounded-lg text-[9px] uppercase font-black cursor-pointer tracking-wider transition ${
                            isApproved 
                              ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/50 dark:bg-rose-950/20 dark:border-rose-900" 
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-105 border border-emerald-200/50 dark:bg-emerald-950/25"
                          }`}
                        >
                          {isApproved ? "Suspend" : "Activate"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Facility detail pane modal */}
      {selectedFacility && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border dark:border-slate-800 animate-[zoomIn_0.2s_ease-out] flex flex-col">
            
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950 rounded-xl">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black dark:text-white uppercase tracking-tight">{selectedFacility.facility_name}</h3>
                    <p className="text-[10px] text-gray-400 uppercase font-mono font-bold">{selectedFacility.type} coordinate</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedFacility(null)}
                  className="p-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                
                <div className="p-3 bg-slate-50 dark:bg-slate-950/45 rounded-xl space-y-1.5 font-medium border dark:border-slate-850">
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 block font-mono">Location coordinates</span>
                  <p className="text-gray-800 dark:text-slate-200 font-bold">{selectedFacility.location}</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/45 rounded-xl space-y-1.5 font-medium border dark:border-slate-850">
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 block font-mono">Authorized Contact Desk</span>
                  <p className="text-gray-800 dark:text-slate-200 font-bold">{selectedFacility.contact}</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/45 rounded-xl space-y-1.5 font-medium border dark:border-slate-850">
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 block font-mono">Subscription Authorization Logs</span>
                  <p className="text-emerald-700 dark:text-emerald-400 font-black flex items-center justify-between">
                    <span>{selectedFacility.subscription_status}</span>
                    <span className="text-[8px] bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Verified tier</span>
                  </p>
                </div>

                <div className="flex gap-2 items-center justify-between p-3 border dark:border-slate-800 rounded-xl">
                  <span className="text-xs font-bold text-gray-500 font-mono">Regulatory Status</span>
                  <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full ${
                    selectedFacility.status === "Active" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950" : "bg-red-50 text-red-700"
                  }`}>
                    {selectedFacility.status}
                  </span>
                </div>

              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t dark:border-slate-850 flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => setSelectedFacility(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close dialog
              </button>
              <button
                onClick={() => {
                  handleActiveToggle(selectedFacility.facility_id, selectedFacility.facility_name);
                  setSelectedFacility(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow-3xs"
              >
                Toggle Suspended index
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
