import React, { useState, useEffect } from 'react';
import { Patient, Medication } from '../types';
import { 
  HeartHandshake, 
  Plus, 
  Smartphone, 
  Users, 
  Check, 
  AlertTriangle, 
  Search, 
  Clock 
} from 'lucide-react';

interface CaregiversAlertDeskProps {
  patients: (Patient & { medication: Medication | null })[];
  pharmacyId: string;
  onRefreshData: () => Promise<void>;
  showToast: (msg: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export default function CaregiversAlertDesk({
  patients,
  pharmacyId,
  onRefreshData,
  showToast
}: CaregiversAlertDeskProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [caregiverName, setCaregiverName] = useState('');
  const [caregiverPhone, setCaregiverPhone] = useState('+256 ');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Loaded caregivers map
  const [caregivers, setCaregivers] = useState<any[]>([]);

  // Search filter
  const [search, setSearch] = useState('');

  const loadAllCaregivers = async () => {
    try {
      const list: any[] = [];
      for (const p of patients) {
        const res = await fetch(`/api/patients/${p.patient_id}/caregivers`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.caregiver_name) {
            list.push({
              patient_id: p.patient_id,
              patient_name: p.full_name,
              caregiver_name: data.caregiver_name,
              caregiver_phone: data.caregiver_phone,
              alerts_enabled: true // Default alert toggled
            });
          }
        }
      }
      setCaregivers(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAllCaregivers();
  }, [patients]);

  const handleRegisterCaregiver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !caregiverName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/patients/${selectedPatientId}/caregivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiver_name: caregiverName,
          caregiver_phone: caregiverPhone
        })
      });

      if (res.ok) {
        showToast("Caregiver Associated", "Secondary notification consent recorded on patient file.", "success");
        setCaregiverName('');
        setCaregiverPhone('+256 ');
        await loadAllCaregivers();
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activePat = patients.find(p => p.patient_id === selectedPatientId);

  // Simulate secondary alert test
  const handleTestPingCaregiver = (patName: string, cgName: string, phone: string) => {
    showToast(
      "Dispatched Caregiver Ping", 
      `Alert SMS triggered successfully to ${cgName} (${phone}) regarding ${patName}'s adherence status.`, 
      "info"
    );
  };

  const filteredCaregivers = caregivers.filter(c => 
    c.patient_name.toLowerCase().includes(search.toLowerCase()) ||
    c.caregiver_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Association Register Form */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-brand-green">
          <HeartHandshake className="w-5 h-5 animate-pulse" />
          <h3 className="font-bold text-sm">Register Secondary Caregiver</h3>
        </div>

        <form onSubmit={handleRegisterCaregiver} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Select Patient</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/20 border border-gray-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-green"
            >
              <option value="">-- Choose Patient program --</option>
              {patients.filter(p => !caregivers.some(c => c.patient_id === p.patient_id)).map(p => (
                <option key={p.patient_id} value={p.patient_id}>
                  {p.full_name} ({p.chronic_condition})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Caregiver Name</label>
            <input 
              type="text" 
              placeholder="e.g. Mary Nakato Okello"
              value={caregiverName}
              onChange={(e) => setCaregiverName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/20 border border-gray-200 dark:border-slate-800 rounded-lg p-2.5 text-xs"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Caregiver Phone (Sms/WhatsApp Coords)</label>
            <input 
              type="text" 
              placeholder='+256 7XX XXX XXX'
              value={caregiverPhone}
              onChange={(e) => setCaregiverPhone(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/20 border border-gray-200 dark:border-slate-800 rounded-lg p-2.5 text-xs font-mono"
              required
            />
          </div>

          <div className="bg-brand-accent-bg/40 border border-dotted border-brand-green/20 p-2.5 rounded-xl text-[10px] text-gray-500">
            <strong>Consent check: </strong> CareRefill program parameters require patients' consent before registering caregiver alerts. By saving, you confirm consent is on file.
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !selectedPatientId || !caregiverName.trim()}
            className="w-full bg-brand-green hover:bg-brand-green-hover text-white rounded-xl py-2.5 px-4 text-xs font-black shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>Associates Care Contact</span>
          </button>
        </form>
      </div>

      {/* Relations Log table */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Caregiver Alert Contacts Directory</h3>
            <p className="text-xs text-gray-400">Patients connected to supporting relatives or guardians for auxiliary help.</p>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-950/20 px-3 py-1.5 border border-gray-150 dark:border-slate-850 rounded-xl flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search caregivers..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-0 text-xs focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 font-bold">
                <th className="py-2.5">Primary Patient</th>
                <th className="py-2.5">Caregiver Proxy Name</th>
                <th className="py-2.5">Contact coordinates</th>
                <th className="py-2.5">Auxiliary Alert Status</th>
                <th className="py-2.5 text-right">Verification desk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-850 text-gray-600 dark:text-gray-300">
              {filteredCaregivers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 font-serif italic">
                    No caregiver-patient programs registered under this filtered view.
                  </td>
                </tr>
              ) : (
                filteredCaregivers.map((c) => (
                  <tr key={c.patient_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10">
                    <td className="py-3 font-bold text-gray-950 dark:text-gray-100">{c.patient_name}</td>
                    <td className="py-3 font-medium">{c.caregiver_name}</td>
                    <td className="py-3 font-mono text-teal-650">{c.caregiver_phone}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="dot dot-green"></span>
                        <span className="text-[10px] font-black text-brand-green tracking-wide">ENABLED</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleTestPingCaregiver(c.patient_name, c.caregiver_name, c.caregiver_phone)}
                        className="px-2.5 py-1.5 bg-brand-accent-bg text-brand-green font-bold text-[10px] rounded-lg tracking-wider hover:bg-emerald-100/70 cursor-pointer inline-flex items-center gap-1 border border-brand-green/20"
                      >
                        <Smartphone className="w-3" />
                        <span>Trigger Test Ping</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
