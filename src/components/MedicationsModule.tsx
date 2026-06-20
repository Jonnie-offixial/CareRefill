import React, { useState } from "react";
import { 
  Pill, 
  Search, 
  AlertTriangle, 
  Calendar, 
  Plus, 
  Filter, 
  CheckCircle,
  X,
  Sparkles
} from "lucide-react";

interface MedicationItem {
  medication_id: string;
  name: string;
  category: "Cardiologic" | "Diabetic" | "Antibiotic" | "Respiratory" | "Antiviral (ARVs)" | "General Care";
  stock_quantity: number;
  expiry_date: string; // ISO YYYY-MM-DD
  status: "Normal" | "Low Stock" | "Critical Stock" | "Expired";
}

interface MedicationsModuleProps {
  showToast: (message: string, description?: string, type?: "success" | "error" | "info") => void;
}

export default function MedicationsModule({
  showToast,
}: MedicationsModuleProps) {
  const [meds, setMeds] = useState<MedicationItem[]>(() => {
    const cached = localStorage.getItem("carerefill_medications_catalog");
    if (cached) {
      try { return JSON.parse(cached); } catch(e) {}
    }
    const defaults: MedicationItem[] = [
      {
        medication_id: "med-001",
        name: "Atorvastatin 20mg",
        category: "Cardiologic",
        stock_quantity: 450,
        expiry_date: "2027-11-20",
        status: "Normal"
      },
      {
        medication_id: "med-002",
        name: "Metformin 500mg (Glucophage)",
        category: "Diabetic",
        stock_quantity: 15,
        expiry_date: "2027-04-12",
        status: "Low Stock"
      },
      {
        medication_id: "med-003",
        name: "Amoxicillin 500mg",
        category: "Antibiotic",
        stock_quantity: 0,
        expiry_date: "2026-06-10",
        status: "Expired"
      },
      {
        medication_id: "med-004",
        name: "Albuterol Inhaler (Ventolin)",
        category: "Respiratory",
        stock_quantity: 120,
        expiry_date: "2028-01-30",
        status: "Normal"
      },
      {
        medication_id: "med-005",
        name: "Dolutegravir 50mg / Tenofovir",
        category: "Antiviral (ARVs)",
        stock_quantity: 40,
        expiry_date: "2027-09-18",
        status: "Low Stock"
      },
      {
        medication_id: "med-006",
        name: "Panadol Extra 500mg",
        category: "General Care",
        stock_quantity: 2100,
        expiry_date: "2028-08-15",
        status: "Normal"
      }
    ];
    localStorage.setItem("carerefill_medications_catalog", JSON.stringify(defaults));
    return defaults;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"All" | MedicationItem["category"]>("All");
  const [showAddForm, setShowAddForm] = useState(false);

  // Adding form state coordinates
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<MedicationItem["category"]>("Cardiologic");
  const [formStock, setFormStock] = useState<number>(100);
  const [formExpiry, setFormExpiry] = useState("");

  const handleCreateMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formExpiry) {
      showToast("Verification Error", "All fields of the medication item are required.", "error");
      return;
    }

    // Determine status
    let status: MedicationItem["status"] = "Normal";
    if (formStock === 0) {
      status = "Critical Stock";
    } else if (formStock <= 50) {
      status = "Low Stock";
    }

    // Is it expired?
    if (new Date(formExpiry) < new Date()) {
      status = "Expired";
    }

    const newItem: MedicationItem = {
      medication_id: `med-${Date.now()}`,
      name: formName,
      category: formCategory,
      stock_quantity: Number(formStock),
      expiry_date: formExpiry,
      status
    };

    const updated = [newItem, ...meds];
    setMeds(updated);
    localStorage.setItem("carerefill_medications_catalog", JSON.stringify(updated));
    setShowAddForm(false);
    showToast("Medication Enrolled", `${formName} catalog has been successfully updated.`, "success");

    // Reset
    setFormName("");
    setFormStock(100);
    setFormExpiry("");
  };

  const handleAddStock = (id: string, amount: number) => {
    const updated = meds.map(m => {
      if (m.medication_id === id) {
        const nextQty = m.stock_quantity + amount;
        let nextStatus: MedicationItem["status"] = "Normal";
        if (nextQty === 0) nextStatus = "Critical Stock";
        else if (nextQty <= 50) nextStatus = "Low Stock";
        
        // Expiry preserve check
        if (new Date(m.expiry_date) < new Date()) {
          nextStatus = "Expired";
        }

        return { ...m, stock_quantity: nextQty, status: nextStatus };
      }
      return m;
    });
    setMeds(updated);
    localStorage.setItem("carerefill_medications_catalog", JSON.stringify(updated));
    showToast("Inflow stock updated", `Restocked selected drug package.`, "success");
  };

  const filteredMeds = meds.filter(m => {
    const matchesSearch = m.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title section with fast actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-sans tracking-tight">Clinical Drug Listings &amp; Inventory</h3>
          <p className="text-xs text-gray-500">Query active formulary catalogs, stock levels, low-level alarms, and medication dispatch timelines.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer transition duration-300 active:scale-95 flex items-center gap-2 self-start sm:self-center shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Close Form" : "Add Formulary Drug"}</span>
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-gray-250 dark:border-slate-800 p-6 rounded-3xl space-y-4">
          <h4 className="text-xs font-black uppercase text-emerald-600 tracking-wider">Fast Drug Catalog Registry</h4>
          
          <form onSubmit={handleCreateMed} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider">Medication Name</label>
              <input 
                type="text" 
                required
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="Atorvastatin 40mg"
                className="w-full text-xs font-semibold p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider">Category Class</label>
              <select 
                value={formCategory}
                onChange={e => setFormCategory(e.target.value as any)}
                className="w-full text-xs font-semibold p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-855 rounded-xl focus:outline-none cursor-pointer text-gray-700 dark:text-gray-200"
              >
                <option value="Cardiologic">Cardiologic</option>
                <option value="Diabetic">Diabetic</option>
                <option value="Antibiotic">Antibiotic</option>
                <option value="Respiratory">Respiratory</option>
                <option value="Antiviral (ARVs)">Antiviral (ARVs)</option>
                <option value="General Care">General Care</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider">Stock Quantity Units</label>
              <input 
                type="number" 
                min={0}
                required
                value={formStock}
                onChange={e => setFormStock(Number(e.target.value))}
                placeholder="100"
                className="w-full text-xs font-semibold p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider">Expiry Date</label>
              <div className="flex gap-2">
                <input 
                  type="date" 
                  required
                  value={formExpiry}
                  onChange={e => setFormExpiry(e.target.value)}
                  className="flex-1 text-xs font-semibold p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl focus:outline-none cursor-pointer"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase tracking-wider px-4 rounded-xl cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Expiry / Low stock notifications alert boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Urgent Low Stock Alerts */}
        <div className="bg-amber-500/10 border border-amber-500/20 dark:border-amber-800/40 rounded-3xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-400 tracking-wider font-mono">Attention: Low Stock Items</h5>
              <p className="text-xs text-gray-650 dark:text-gray-300 font-medium">Metformin 500mg, Tenofovir are below threshold (50 units).</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setCategoryFilter("Diabetic");
              showToast("Applied Filter", "Showing only Diabetic formulations.", "info");
            }}
            className="text-[9px] font-black uppercase bg-amber-100 hover:bg-amber-200 text-amber-800 py-1.5 px-3 rounded-lg transition"
          >
            Review Items
          </button>
        </div>

        {/* Expiring shortly alerts */}
        <div className="bg-rose-500/10 border border-rose-500/20 dark:border-rose-800/40 rounded-3xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/20 rounded-xl text-rose-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-[10px] font-black uppercase text-rose-800 dark:text-rose-400 tracking-wider font-mono">Formulation Expired Warnings</h5>
              <p className="text-xs text-gray-655 dark:text-gray-300 font-medium">Amoxicillin 500mg expired. Requires replacement registry immediately.</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setCategoryFilter("Antibiotic");
              showToast("Applied Filter", "Showing only Antibiotic formulations.", "info");
            }}
            className="text-[9px] font-black uppercase bg-rose-100 hover:bg-rose-200 text-rose-850 py-1.5 px-3 rounded-lg transition"
          >
            Replace Batch
          </button>
        </div>

      </div>

      {/* Filters Search Controls */}
      <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-4 rounded-3xl flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search medications catalog formulary..."
            className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 pl-11 pr-4 py-3 rounded-2xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto self-end md:self-center">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 p-2 px-4 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-200 cursor-pointer focus:outline-none"
          >
            <option value="All">All Categories formulary</option>
            <option value="Cardiologic">Cardiologic</option>
            <option value="Diabetic">Diabetic</option>
            <option value="Antibiotic">Antibiotic</option>
            <option value="Respiratory">Respiratory</option>
            <option value="Antiviral (ARVs)">Antiviral (ARVs)</option>
            <option value="General Care">General Care</option>
          </select>
        </div>
      </div>

      {/* Table listing of formulation catalog items */}
      <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-950/40 border-b dark:border-slate-800 text-[10px] uppercase font-black tracking-wider text-gray-450">
                <th className="p-4 px-6">Medication Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Stock Quantity</th>
                <th className="p-4">Expiry Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right pr-6">Stock Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800/80">
              {filteredMeds.map((med) => {
                const isNormal = med.status === "Normal";
                const isLow = med.status === "Low Stock";
                const isCritical = med.status === "Critical Stock";
                const isExpired = med.status === "Expired";

                return (
                  <tr key={med.medication_id} className="text-xs hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all font-medium">
                    
                    <td className="p-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                          <Pill className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="font-extrabold text-gray-900 dark:text-gray-100">{med.name}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="text-[10px] uppercase font-bold text-blue-800 bg-blue-55/15 dark:bg-blue-950 px-2 py-0.5 rounded-md font-mono">
                        {med.category}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`font-mono font-bold ${isCritical ? "text-red-500" : isLow ? "text-amber-500" : "text-gray-700 dark:text-slate-350"}`}>
                        {med.stock_quantity === 0 ? "OUT OF STOCK" : `${med.stock_quantity} tabs`}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-gray-450 text-[11px]">{med.expiry_date}</td>

                    <td className="p-4">
                      <span className={`px-2 py-0.5 border text-[9px] font-black uppercase tracking-wider rounded-full ${
                        isNormal ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/10" :
                        isExpired ? "bg-red-500/10 text-red-705 border-red-500/10" : "bg-amber-500/10 text-amber-700 border-amber-500/10"
                      }`}>
                        {med.status}
                      </span>
                    </td>

                    <td className="p-4 text-right pr-6 space-x-1.5">
                      <button
                        onClick={() => handleAddStock(med.medication_id, 100)}
                        className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border dark:border-slate-700 rounded-lg text-emerald-600 dark:text-emerald-400 cursor-pointer font-extrabold text-[10px] transition"
                        title="Restock +100 units"
                      >
                        +100 Quick Restock
                      </button>
                      <button
                        onClick={() => handleAddStock(med.medication_id, -30)}
                        disabled={med.stock_quantity < 30}
                        className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border dark:border-slate-700 rounded-lg text-gray-600 dark:text-gray-300 disabled:opacity-40 cursor-pointer text-[10px] font-bold transition"
                        title="Deduct 30 units (Dispatch)"
                      >
                        Dispatch 30
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
