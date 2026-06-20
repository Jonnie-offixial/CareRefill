import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Eye, 
  Calendar, 
  Mail, 
  Phone, 
  X, 
  Sparkles,
  Heart,
  Plus
} from "lucide-react";

interface PatientRecord {
  patient_id: string;
  full_name: string;
  phone_number: string;
  email: string;
  registered_date: string;
  status: "Active" | "Inactive";
  chronic_condition: string;
  medication: {
    medication_name: string;
    dosage: string;
    duration_days: number;
    last_refill: string;
    next_refill: string;
  } | null;
  history: Array<{
    refill_id: string;
    date: string;
    medication: string;
    facility: string;
    status: "Completed" | "Pending" | "Rejected";
  }>;
}

interface PatientsModuleProps {
  patients: PatientRecord[];
  onToggleStatus: (id: string, currentStatus: "Active" | "Inactive") => void;
  onAddPatient: (patient: any) => void;
  showToast: (message: string, description?: string, type?: "success" | "error" | "info") => void;
}

export default function PatientsModule({
  patients: initialPatients,
  onToggleStatus,
  onAddPatient,
  showToast,
}: PatientsModuleProps) {
  const [patients, setPatients] = useState<PatientRecord[]>(initialPatients);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCondition, setFormCondition] = useState("Hypertension");
  const [formMedication, setFormMedication] = useState("");
  const [formDosage, setFormDosage] = useState("1 tablet once daily");

  // Handle manual additions
  const handleAddNewPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone || !formEmail) {
      showToast("Validation Error", "All patient profile coordinates are required.", "error");
      return;
    }

    const patient_id = `pat-${Math.random().toString(36).substring(2, 9)}`;
    const newRecord: PatientRecord = {
      patient_id,
      full_name: formName,
      phone_number: formPhone,
      email: formEmail,
      registered_date: new Date().toISOString().split("T")[0],
      status: "Active",
      chronic_condition: formCondition,
      medication: formMedication ? {
        medication_name: formMedication,
        dosage: formDosage,
        duration_days: 30,
        last_refill: new Date().toISOString().split("T")[0],
        next_refill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      } : null,
      history: []
    };

    setPatients([newRecord, ...patients]);
    onAddPatient(newRecord);
    setShowAddForm(false);
    showToast("Patient Enrolled", `${formName} has been enrolled in CareRefill CRM.`, "success");

    // Clear form
    setFormName("");
    setFormPhone("");
    setFormEmail("");
    setFormCondition("Hypertension");
    setFormMedication("");
    setFormDosage("1 tablet once daily");
  };

  // Local state status toggle simulation
  const handleStatusToggle = (id: string, current: "Active" | "Inactive") => {
    const nextStatus = current === "Active" ? "Inactive" : "Active";
    setPatients(prev => prev.map(p => {
      if (p.patient_id === id) {
        return { ...p, status: nextStatus };
      }
      return p;
    }));
    onToggleStatus(id, current);
    showToast("Status Synchronized", `Account index set to ${nextStatus}.`, "success");
  };

  // Filters
  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.phone_number?.includes(searchTerm) || 
                          p.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans relative">
      
      {/* Title & upper action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-sans tracking-tight">Active Patients Registry</h3>
          <p className="text-xs text-gray-500">Query and manage chronic patient loyalty indices and medication loops.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer transition duration-300 active:scale-95 flex items-center gap-2 self-start sm:self-center shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Close Form" : "Enroll New Patient"}</span>
        </button>
      </div>

      {/* Enroll Form (Simulated) */}
      {showAddForm && (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-gray-250 dark:border-slate-800 p-6 rounded-3xl space-y-4">
          <h4 className="text-xs font-black uppercase text-emerald-600 tracking-wider">Fast Patient Enrollment Form</h4>
          
          <form onSubmit={handleAddNewPatient} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider">Full Legal Name</label>
              <input 
                type="text" 
                required
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="Vianne Jonny"
                className="w-full text-xs font-semibold p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider">Mobile Number</label>
              <input 
                type="tel" 
                required
                value={formPhone}
                onChange={e => setFormPhone(e.target.value)}
                placeholder="+256 701 234567"
                className="w-full text-xs font-semibold p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider">Email Address</label>
              <input 
                type="email" 
                required
                value={formEmail}
                onChange={e => setFormEmail(e.target.value)}
                placeholder="vianne@company.com"
                className="w-full text-xs font-semibold p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider">Chronic Diagnosis</label>
              <select 
                value={formCondition}
                onChange={e => setFormCondition(e.target.value)}
                className="w-full text-xs font-semibold p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 transition cursor-pointer text-gray-700 dark:text-gray-200"
              >
                <option value="Hypertension">Hypertension (High BP)</option>
                <option value="Diabetes">Diabetes mellitus</option>
                <option value="HIV/ARVs">HIV Care Plan (ARVs)</option>
                <option value="Asthma">Bronchial Asthma</option>
                <option value="Epilepsy">Epilepsy / Convulsant</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider">Medication Prescribed</label>
              <input 
                type="text" 
                value={formMedication}
                onChange={e => setFormMedication(e.target.value)}
                placeholder="e.g. Atorvastatin 20mg"
                className="w-full text-xs font-semibold p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider">Dosage Loop</label>
                <input 
                  type="text" 
                  value={formDosage}
                  onChange={e => setFormDosage(e.target.value)}
                  placeholder="1 tab daily"
                  className="w-full text-xs font-semibold p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>

              <div className="flex items-end pb-1">
                <button
                  type="submit"
                  className="w-full p-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer transition shadow-3xs"
                >
                  Enroll Patient Profile
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Query filters controls bar */}
      <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-4 rounded-3xl flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patient coordinates (name, email, phone number)..."
            className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 pl-11 pr-4 py-3 rounded-2xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto self-end md:self-center">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 p-2 px-4 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-200 cursor-pointer focus:outline-none"
          >
            <option value="All">Filter By Status: All</option>
            <option value="Active">Active Loop</option>
            <option value="Inactive">Excluded / Inactive</option>
          </select>
        </div>
      </div>

      {/* Responsive Patient Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-950/40 border-b dark:border-slate-800 text-[10px] uppercase font-black tracking-wider text-gray-450">
                <th className="p-4 px-6">Name</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Email</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800/80">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-gray-400 font-bold uppercase font-mono">
                    No clinical logs matching criteria.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => {
                  const isActive = p.status === "Active";
                  const avatarLetters = p.full_name?.slice(0, 2).toUpperCase() || "PT";
                  return (
                    <tr 
                      key={p.patient_id}
                      className="text-xs hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all font-medium"
                    >
                      <td className="p-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            isActive ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300" : "bg-gray-100 dark:bg-slate-800 text-gray-400"
                          }`}>
                            {avatarLetters}
                          </div>
                          <div>
                            <p className="font-extrabold text-gray-900 dark:text-gray-100">{p.full_name}</p>
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                              {p.chronic_condition}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-gray-600 dark:text-slate-300">{p.phone_number}</td>
                      <td className="p-4 text-gray-500">{p.email || "N/A"}</td>
                      <td className="p-4 text-gray-400 font-mono text-[11px]">{p.registered_date}</td>
                      
                      <td className="p-4">
                        <span className={`inline-flex px-2 px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${
                          isActive 
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20" 
                            : "bg-gray-150/80 text-gray-600 dark:bg-slate-800 dark:text-slate-400 border-transparent"
                        }`}>
                          {p.status}
                        </span>
                      </td>

                      <td className="p-4 text-right pr-6 space-x-1">
                        <button
                          onClick={() => setSelectedPatient(p)}
                          className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border dark:border-slate-700 rounded-lg text-gray-600 dark:text-gray-200 cursor-pointer font-bold inline-flex items-center gap-1.5 transition"
                          title="View clinical medical profiles"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Profile</span>
                        </button>
                        <button
                          onClick={() => handleStatusToggle(p.patient_id, p.status)}
                          className={`p-1 px-2.5 rounded-lg border text-[10px] font-black uppercase cursor-pointer tracking-wider transition ${
                            isActive
                              ? "bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 dark:border-rose-900"
                              : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-950/25 dark:hover:bg-emerald-950/45 dark:border-emerald-900"
                          }`}
                        >
                          {isActive ? "Deactivate" : "Activate"}
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

      {/* Profile Detail Slider / Popup Pane */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex justify-end">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl p-6 md:p-8 flex flex-col justify-between overflow-y-auto animate-[slideIn_0.3s_ease-out]">
            
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-2xl">
                    <Heart className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-950 dark:text-white">{selectedPatient.full_name}</h3>
                    <p className="text-xs text-emerald-600 font-extrabold uppercase font-mono tracking-wider">{selectedPatient.chronic_condition}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="p-1 px-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Patient general card */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-950/30 p-4 rounded-2xl border dark:border-slate-850">
                <h4 className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Demographic Information Coordinates</h4>
                <div className="space-y-2 text-xs">
                  <p className="flex items-center gap-2 font-medium">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>Phone:</span>
                    <strong className="font-mono text-gray-700 dark:text-slate-350">{selectedPatient.phone_number}</strong>
                  </p>
                  <p className="flex items-center gap-2 font-medium">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>Email:</span>
                    <strong className="text-gray-700 dark:text-slate-300">{selectedPatient.email || "Not specified"}</strong>
                  </p>
                  <p className="flex items-center gap-2 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Registered Date:</span>
                    <strong className="font-mono text-gray-700 dark:text-slate-300">{selectedPatient.registered_date}</strong>
                  </p>
                </div>
              </div>

              {/* Medication prescribed */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest block font-mono">Prescribed Medication Loop</h4>
                {selectedPatient.medication ? (
                  <div className="p-4 bg-[#FAFAFA] dark:bg-slate-950/40 rounded-2xl border dark:border-slate-800 space-y-2 text-xs">
                    <p className="font-extrabold text-gray-900 dark:text-white flex items-center justify-between text-sm">
                      <span>{selectedPatient.medication.medication_name}</span>
                      <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-mono">{selectedPatient.medication.dosage}</span>
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-1 text-[11px] font-medium text-gray-700 dark:text-slate-400">
                      <div>
                        <span className="text-[9px] text-gray-400 uppercase tracking-widest block font-mono">Last Refill cycle</span>
                        <span>{selectedPatient.medication.last_refill}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 uppercase tracking-widest block font-mono">Next Due refile</span>
                        <span className="text-amber-600 font-bold">{selectedPatient.medication.next_refill}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 font-bold uppercase font-mono">No active drug treatments customized.</p>
                )}
              </div>

              {/* History logs */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest block font-mono">Medication Refill History Logs</h4>
                
                <div className="space-y-2.5 max-h-[160px] overflow-y-auto">
                  {selectedPatient.history && selectedPatient.history.length > 0 ? (
                    selectedPatient.history.map((hist) => (
                      <div key={hist.refill_id} className="p-3 bg-slate-50/60 dark:bg-slate-950/20 border dark:border-slate-800 rounded-xl flex items-center justify-between text-[11px]">
                        <div>
                          <p className="font-extrabold text-gray-800 dark:text-white">{hist.medication}</p>
                          <p className="text-[10px] text-gray-400">{hist.facility} • {hist.date}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          hist.status === "Completed" ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300" :
                          hist.status === "Pending" ? "bg-amber-500/10 text-amber-700" : "bg-red-500/10 text-red-700"
                        }`}>
                          {hist.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 font-bold py-2 font-mono uppercase">No refill loop records found.</p>
                  )}
                </div>
              </div>

            </div>

            <div className="border-t dark:border-slate-800 pt-4 flex gap-3">
              <button
                onClick={() => handleStatusToggle(selectedPatient.patient_id, selectedPatient.status)}
                className="flex-1 p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-gray-800 dark:text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition text-center"
              >
                Toggle Enrolled Status
              </button>
              <button
                onClick={() => setSelectedPatient(null)}
                className="flex-1 p-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition text-center shadow-3xs"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
