import React, { useState } from 'react';
import { Patient, Medication } from '../types';
import { Plus, Search, Calendar, CheckCircle2, UserCheck, Smartphone, AlertTriangle, UserMinus, ToggleLeft, RefreshCw, Send, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PatientRegistryProps {
  patients: (Patient & { medication: Medication | null })[];
  onAddPatient: (data: any) => Promise<void>;
  onMarkRefilled: (medicationId: string, customDate?: string) => Promise<void>;
  onToggleStatus: (patientId: string, currentStatus: string) => Promise<void>;
  colorTheme: string;
}

export default function PatientRegistry({
  patients,
  onAddPatient,
  onMarkRefilled,
  onToggleStatus,
  colorTheme,
}: PatientRegistryProps) {
  const [search, setSearch] = useState('');
  const [filterCondition, setFilterCondition] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+256 ');
  const [chronicCondition, setChronicCondition] = useState<'Hypertension' | 'Diabetes' | 'HIV/ARVs' | 'Asthma' | 'Epilepsy' | 'Chronic Kidney Disease' | 'Tuberculosis (TB)' | 'Heart Failure' | 'Depression/Mental Health' | 'Other'>('Hypertension');
  const [preferredChannel, setPreferredChannel] = useState<'WhatsApp' | 'SMS' | 'Both'>('WhatsApp');
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [durationDays, setDurationDays] = useState(30);
  const [lastRefillDate, setLastRefillDate] = useState('2026-06-12');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Custom date selection for manual override refill
  const [customRefillDates, setCustomRefillDates] = useState<{ [key: string]: string }>({});

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.full_name.toLowerCase().includes(search.toLowerCase()) ||
      patient.phone_number.includes(search);
    const matchesCondition =
      filterCondition === 'All' || patient.chronic_condition === filterCondition;
    return matchesSearch && matchesCondition;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phoneNumber || !medName || !durationDays) return;

    setIsSubmitting(true);
    try {
      await onAddPatient({
        full_name: fullName,
        phone_number: phoneNumber,
        chronic_condition: chronicCondition,
        preferred_channel: preferredChannel,
        medication_name: medName,
        dosage: dosage || "1 tablet daily",
        duration_days: durationDays,
        last_refill_date: lastRefillDate ? new Date(lastRefillDate).toISOString() : new Date().toISOString()
      });
      
      setSuccessMsg(`Patient ${fullName} successfully registered!`);
      // Reset form
      setFullName('');
      setPhoneNumber('+256 ');
      setMedName('');
      setDosage('');
      setDurationDays(30);
      setLastRefillDate('2026-06-12');
      
      setTimeout(() => {
        setSuccessMsg('');
        setShowAddForm(false);
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getThemeColorClass = () => {
    switch (colorTheme) {
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500';
      case 'indigo': return 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500';
      default: return 'bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500';
    }
  };

  const getBadgeColor = (condition: string) => {
    switch (condition) {
      case 'Hypertension': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Diabetes': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'HIV/ARVs': return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'Asthma': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Epilepsy': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Chronic Kidney Disease': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Tuberculosis (TB)': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Heart Failure': return 'bg-red-50 text-red-700 border-red-200';
      case 'Depression/Mental Health': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-medium text-gray-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-gray-500" />
            Patient Medication Registry
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Register patients, track current dosages, and manage medication cycles.
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-xs shrink-0 ${getThemeColorClass()}`}
        >
          <Plus className="w-4 h-4" />
          Register Patient
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-b border-gray-100 pb-6 mb-6"
          >
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-5 border border-gray-200/60 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-800 mb-2">Register Patient &amp; Initial Medication</h3>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Juliet Namatovu"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number (MTN/Airtel/WhatsApp) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +256 701 XXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Chronic Condition *</label>
                <select
                  value={chronicCondition}
                  onChange={(e) => setChronicCondition(e.target.value as any)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="Hypertension">Hypertension (High Blood Pressure)</option>
                  <option value="Diabetes">Diabetes</option>
                  <option value="HIV/ARVs">HIV / ARV Regimen</option>
                  <option value="Asthma">Asthma (Respiratory)</option>
                  <option value="Epilepsy">Epilepsy (Neurological)</option>
                  <option value="Chronic Kidney Disease">Chronic Kidney Disease</option>
                  <option value="Tuberculosis (TB)">Tuberculosis (TB) Course</option>
                  <option value="Heart Failure">Heart Failure</option>
                  <option value="Depression/Mental Health">Depression / Mental Health Plan</option>
                  <option value="Other">Other Chronic Disease</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Preferred Notification Channel</label>
                <select
                  value={preferredChannel}
                  onChange={(e) => setPreferredChannel(e.target.value as any)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="WhatsApp">WhatsApp Message</option>
                  <option value="SMS">Standard SMS</option>
                  <option value="Both">Both WhatsApp &amp; SMS</option>
                </select>
              </div>

              <div className="md:col-span-2 border-t border-gray-200/60 pt-4 mt-2">
                <p className="text-xs font-medium text-gray-700 mb-3">Medication Specifications &amp; Cycle Calc</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Medication Generic/Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metformin / Acriptega TLD"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Dosage Schedule</label>
                <input
                  type="text"
                  placeholder="e.g. 500mg twice daily with meals"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Refill Cycle (Duration in Days) *</label>
                <div className="grid grid-cols-4 gap-2">
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="col-span-3 bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value={15}>15 Days refill (bi-weekly)</option>
                    <option value={21}>21 Days (3-week cycle)</option>
                    <option value={30}>30 Days refill (standard monthly)</option>
                    <option value={60}>60 Days refill (bi-monthly)</option>
                    <option value={90}>90 Days refill (standard quarterly)</option>
                  </select>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Math.max(1, Number(e.target.value)))}
                    className="bg-white border border-gray-300 rounded-xl px-2 py-2 text-sm text-center focus:outline-none"
                    placeholder="Custom"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Calculates the next due date automatically: Last Refill Date + Refill Cycle</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Last Refill Date *</label>
                <input
                  type="date"
                  required
                  value={lastRefillDate}
                  onChange={(e) => setLastRefillDate(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent transition-all"
                />
                <p className="text-[10px] text-gray-400 mt-1">Specify when the patient last received their refill.</p>
              </div>

              <div className="flex items-end justify-end gap-2 md:col-span-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-xl text-xs font-medium text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2 rounded-xl text-xs font-medium text-white flex items-center gap-1.5 ${getThemeColorClass()} disabled:opacity-50`}
                >
                  {isSubmitting ? 'Registering...' : 'Complete Registration'}
                </button>
              </div>

              {successMsg && (
                <div className="md:col-span-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl p-3 text-xs text-center font-medium mt-2 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {successMsg}
                </div>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Directory Filter Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        <div className="relative col-span-1 sm:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search patient name or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div>
          <select
            value={filterCondition}
            onChange={(e) => setFilterCondition(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
          >
            <option value="All">All Conditions</option>
            <option value="Hypertension">Hypertension</option>
            <option value="Diabetes">Diabetes</option>
            <option value="HIV/ARVs">HIV/ARVs</option>
            <option value="Asthma">Asthma</option>
            <option value="Epilepsy">Epilepsy</option>
            <option value="Chronic Kidney Disease">Chronic Kidney Disease</option>
            <option value="Tuberculosis (TB)">Tuberculosis (TB)</option>
            <option value="Heart Failure">Heart Failure</option>
            <option value="Depression/Mental Health">Depression/Mental Health</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Patients Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-left text-sm text-gray-500 border-collapse">
          <thead className="bg-gray-50 text-xs text-gray-700 uppercase font-medium border-b border-gray-100">
            <tr>
              <th className="px-4 py-3.5">Patient Details</th>
              <th className="px-4 py-3.5">Condition</th>
              <th className="px-4 py-3.5">Medication &amp; Dose</th>
              <th className="px-4 py-3.5">Next Refill Due</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  <UserMinus className="w-10 h-10 mx-auto opacity-30 mb-2" />
                  <p className="text-sm">No patients matched this workspace query.</p>
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => {
                const med = patient.medication;
                const overdue = med ? new Date(med.next_refill_date).getTime() < new Date("2026-06-12T08:00:00Z").getTime() : false;
                
                return (
                  <tr key={patient.patient_id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-4 shrink-0">
                      <div className="flex items-start gap-2.5">
                        <div className={`w-9 h-9 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center border border-gray-200 text-xs shrink-0 mt-0.5`}>
                          {patient.full_name.split(' ').map(n=>n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-950 text-xs sm:text-sm">{patient.full_name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-400">
                            <span className="font-mono">{patient.phone_number}</span>
                            <span>•</span>
                            <span className="bg-gray-100 text-gray-600 px-1 border border-gray-200 rounded-sm">{patient.preferred_channel}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`text-[11px] font-semibold border px-2 py-0.5 rounded-full ${getBadgeColor(patient.chronic_condition)}`}>
                        {patient.chronic_condition}
                      </span>
                    </td>
                    
                    <td className="px-4 py-4">
                      {med ? (
                        <div>
                          <p className="font-medium text-gray-900 border-b border-dashed border-gray-300 inline duration-0">{med.medication_name}</p>
                          <p className="text-[10px] text-gray-400 mt-1 max-w-[200px] truncate" title={med.dosage}>{med.dosage}</p>
                          <span className="text-[9px] text-gray-400 bg-gray-50 border px-1 rounded-sm">{med.duration_days} days cyl</span>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-500 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> No active prescription
                        </span>
                      )}
                    </td>
                    
                    <td className="px-4 py-4">
                      {med ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span className={`text-xs font-semibold ${overdue ? 'text-rose-600' : 'text-gray-900'}`}>
                              Next: {med.next_refill_date ? med.next_refill_date.split('T')[0] : 'N/A'}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500">
                            Last: {med.last_refill_date ? med.last_refill_date.split('T')[0] : 'N/A'}
                          </p>
                          {overdue && (
                            <span className="text-[9px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-sm inline-block">
                              Patient Overdue
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    
                    <td className="px-4 py-4 text-right">
                      {med && (
                        <div className="flex flex-col sm:flex-row items-end justify-end gap-1.5">
                          {/* Fast Refill Cycle Trigger Button */}
                          <div className="flex items-center gap-1 border border-gray-200 bg-white rounded-lg p-0.5 shadow-2xs">
                            <input
                              type="date"
                              id={`date-${med.medication_id}`}
                              value={customRefillDates[med.medication_id] || new Date("2026-06-12Z").toISOString().split('T')[0]}
                              onChange={(e) => setCustomRefillDates({ ...customRefillDates, [med.medication_id]: e.target.value })}
                              className="text-[10px] font-mono border-0 bg-transparent text-gray-600 focus:outline-none p-1 shrink-0"
                            />
                            <button
                              onClick={() => onMarkRefilled(med.medication_id, customRefillDates[med.medication_id])}
                              title="Set date and record refill cycle"
                              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded px-2.5 py-1 text-[11px] font-medium transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3 animate-spin hover:animate-none duration-1000" />
                              Refill
                            </button>
                          </div>
                          
                          <button
                            onClick={() => onToggleStatus(patient.patient_id, patient.status)}
                            className={`text-[10px] font-semibold border rounded-md px-1.5 py-1 cursor-pointer ${
                              patient.status === 'Active'
                                ? 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                          >
                            {patient.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
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
  );
}
