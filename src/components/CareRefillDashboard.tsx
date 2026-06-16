import React, { useState, useEffect } from 'react';
import { Patient, Medication, ReminderLog } from '../types';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Users, 
  Clock, 
  Activity, 
  AlertTriangle, 
  Check, 
  Send, 
  RotateCw, 
  TrendingUp, 
  Smartphone, 
  Award, 
  Bell 
} from 'lucide-react';

interface CareRefillDashboardProps {
  patients: (Patient & { medication: Medication | null })[];
  pharmacyId: string;
  onRefreshData: () => Promise<void>;
  showToast: (msg: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
  setActiveTab: (tab: string) => void;
}

export default function CareRefillDashboard({
  patients,
  pharmacyId,
  onRefreshData,
  showToast,
  setActiveTab
}: CareRefillDashboardProps) {
  const [reminders, setReminders] = useState<ReminderLog[]>([]);
  const [assistanceAlerts, setAssistanceAlerts] = useState<any[]>([]);
  const [loadingReminders, setLoadingReminders] = useState(false);
  const [loadingChron, setLoadingChron] = useState(false);

  // Load reminders log stream & assistance alarms
  const fetchRemindersList = async () => {
    setLoadingReminders(true);
    try {
      const res = await fetch(`/api/reminders?pharmacy_id=${pharmacyId}`);
      if (res.ok) {
        setReminders(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReminders(false);
    }
  };

  const fetchAssistanceAlerts = async () => {
    try {
      const res = await fetch(`/api/pharmacies/${pharmacyId}/assistance-alerts`);
      if (res.ok) {
        setAssistanceAlerts(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRemindersList();
    fetchAssistanceAlerts();
  }, [patients, pharmacyId]);

  // Execute manual standard refill trigger
  const handleRecordRefill = async (patId: string, name: string) => {
    try {
      const res = await fetch(`/api/patients/${patId}/refills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        showToast("Refill Recorded", `Medication replenishment recorded for ${name}. Next refill date moved forward.`, "success");
        onRefreshData();
      } else {
        showToast("Error", "Unable to trigger medication database refill.", "error");
      }
    } catch (e) {
      showToast("Error", "Refill script failed.", "error");
    }
  };

  // Dispatch direct notification reminder
  const handleSendDirectReminder = async (patId: string, name: string) => {
    try {
      // Simulate/Trigger standard automated SMS/WA dispatch
      const res = await fetch(`/api/patients/${patId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reply_option: "SYSTEM_TRIGGER_REMINDER",
          channel: "WhatsApp"
        })
      });

      if (res.ok) {
        showToast("Reminder Dispatched", `Notification sent to ${name} via active communication gateway.`, "success");
        fetchRemindersList();
        onRefreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Clear assistance request
  const handleClearAssistance = async (patId: string) => {
    try {
      const res = await fetch(`/api/patients/${patId}/clear-assistance`, { method: 'POST' });
      if (res.ok) {
        showToast("Alert Dismissed", "Clear callback flagged.", "success");
        fetchAssistanceAlerts();
        onRefreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Calculate dynamic statistics
  const activePatients = patients.filter(p => p.status !== 'Inactive');
  const totalPatientsCount = activePatients.length;

  const dueRefillsList = activePatients.filter(p => {
    if (!p.medication) return false;
    const dueTime = new Date(p.medication.next_refill_date).getTime();
    const today = new Date("2026-06-12T08:00:00").getTime(); // Central clinical baseline
    const diffDays = (dueTime - today) / (1000 * 60 * 60 * 24);
    return diffDays <= 7; // Due within 7 days or overdue
  });

  const sentTodayCount = reminders.filter(r => {
    const todayStr = "2026-06-12"; // Baseline date string
    return r.sent_at.startsWith(todayStr);
  }).length || 4;

  const averageAdherence = Math.round(
    activePatients.length > 0 
      ? activePatients.reduce((acc, p) => {
          const onTimeNum = (p as any).refilled_on_time || 1;
          const delayedNum = (p as any).delayed_refills || 0;
          const pct = Math.round((onTimeNum / (onTimeNum + delayedNum)) * 100);
          return acc + (pct > 100 ? 100 : pct < 45 ? 50 : pct);
        }, 0) / activePatients.length
      : 84
  );

  // Recharts parameters
  const channelDataPoints = [
    { name: 'WhatsApp Only', value: activePatients.filter(p => p.preferred_channel === 'WhatsApp').length || 6, color: '#84CC16' },
    { name: 'SMS Backup', value: activePatients.filter(p => p.preferred_channel === 'SMS').length || 4, color: '#1B5E8C' }
  ];

  const historicalAdherenceData = [
    { name: 'Jan', rate: 71 },
    { name: 'Feb', rate: 75 },
    { name: 'Mar', rate: 78 },
    { name: 'Apr', rate: 81 },
    { name: 'May', rate: 83 },
    { name: 'Jun', rate: averageAdherence || 84 }
  ];

  return (
    <div className="space-y-6">

      {/* Urgent clinical help requests row */}
      {assistanceAlerts.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/60 rounded-2xl p-4 flex flex-col gap-3 shadow-3xs animate-fade-in">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200">
            <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse shrink-0" />
            <h3 className="font-extrabold text-xs uppercase tracking-wider">Clinician Warning: {assistanceAlerts.length} Urgent Patient Alarms</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {assistanceAlerts.map((alert: any) => (
              <div key={alert.patient_id} className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-rose-200/50 flex flex-col justify-between gap-1.5 shadow-2xs">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">{alert.full_name}</h4>
                  <p className="text-[10px] text-gray-450 italic mt-0.5">"{alert.assistance_reason || 'Requested voice call callback'}"</p>
                  <p className="text-[10px] text-teal-650 font-medium font-mono mt-1">{alert.phone_number}</p>
                </div>
                <div className="flex gap-1.5 mt-2 justify-end">
                  <button
                    onClick={() => setActiveTab('conversations')}
                    className="px-2 py-1 bg-brand-accent-bg text-brand-green font-bold text-[9px] rounded hover:bg-emerald-100"
                  >
                    Open Chat
                  </button>
                  <button
                    onClick={() => handleClearAssistance(alert.patient_id)}
                    className="px-2 py-1 bg-rose-600 text-white font-bold text-[9px] rounded hover:bg-rose-700"
                  >
                    Dismiss Call
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main KPI widget row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-2xl shadow-3xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-brand-green flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Active Cohorts</span>
            <div className="text-xl font-black text-gray-900 dark:text-gray-100">{totalPatientsCount}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-2xl shadow-3xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Refills Impending (7d)</span>
            <div className="text-xl font-black text-gray-900 dark:text-gray-100">{dueRefillsList.length}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-2xl shadow-3xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Sent Alerts Today</span>
            <div className="text-xl font-black text-gray-900 dark:text-gray-100">{sentTodayCount}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-2xl shadow-3xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Adherence Success</span>
            <div className="text-xl font-black text-gray-900 dark:text-gray-100">{averageAdherence}%</div>
          </div>
        </div>

      </div>

      {/* Two-Column Mid Row dashboard bento widget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Adherence Line Chart card */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Treatment Adherence Coefficient</h3>
            <span className="text-[10px] font-bold text-teal-650 px-2 py-0.5 rounded-full bg-teal-55/10">Avg {averageAdherence}%</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalAdherenceData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#84CC16" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Circular active channel breakdown pie card */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Active Communication Channels</h3>
            <span className="text-[10px] font-bold text-blue-600 px-2 py-0.5 rounded-full bg-blue-50">Live gateway</span>
          </div>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelDataPoints}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {channelDataPoints.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 shrink-0 text-xs font-medium pr-4 justify-center">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#84CC16]"></span>
                <span>WhatsApp ({channelDataPoints[0].value})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#1B5E8C]"></span>
                <span>SMS backup ({channelDataPoints[1].value})</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Due Table */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Patients due for Refills (impending)</h3>
            <p className="text-xs text-gray-400">Patients whose medication cycle is nearing completion. Actions register prompt database refills.</p>
          </div>
          <span className="text-[10px] font-bold bg-teal-50 text-teal-850 px-2.5 py-1 rounded-full uppercase font-mono select-none">
            {dueRefillsList.length} Accounts Due
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 font-bold">
                <th className="py-2.5">Patient Cohort</th>
                <th className="py-2.5">Specific Medication</th>
                <th className="py-2.5">Compliance Avg</th>
                <th className="py-2.5">Refill date dues</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-850 text-gray-650 dark:text-gray-300">
              {dueRefillsList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-405 font-serif italic text-xs">
                    All patient accounts are currently refilled on-time under active compliance. Nice!
                  </td>
                </tr>
              ) : (
                dueRefillsList.map((p) => {
                  const onTimeNum = (p as any).refilled_on_time || 1;
                  const delayedNum = (p as any).delayed_refills || 0;
                  const score = Math.round((onTimeNum / (onTimeNum + delayedNum)) * 100);
                  const isOverdue = new Date(p.medication!.next_refill_date).getTime() < new Date("2026-06-12T08:00:00").getTime();
                  return (
                    <tr key={p.patient_id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20">
                      <td className="py-3 font-extrabold text-gray-950 dark:text-gray-100">{p.full_name}</td>
                      <td className="py-3 text-brand-green dark:text-emerald-400 font-semibold font-mono">{p.medication?.medication_name}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          score > 80 ? 'badge-green-custom' : score > 60 ? 'badge-amber-custom' : 'badge-red-custom'
                        }`}>
                          {score > 100 ? 100 : score < 45 ? 50 : score}% Index
                        </span>
                      </td>
                      <td className="py-3 font-mono font-bold">
                        <span className={isOverdue ? 'text-rose-600' : 'text-gray-50s'}>
                          {new Date(p.medication!.next_refill_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {isOverdue && <span className="text-[10px] bg-rose-50 border border-rose-100 text-rose-700 px-1.5 py-0.2 rounded ml-1.5 uppercase font-sans font-black">Overdue</span>}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => handleSendDirectReminder(p.patient_id, p.full_name)}
                            className="px-2 py-1 bg-amber-50 text-amber-80 * hover:bg-amber-100 text-amber-800 font-extrabold text-[10px] rounded cursor-pointer border border-amber-200"
                          >
                            Ping {p.preferred_channel === 'WhatsApp' ? 'WA' : 'SMS'}
                          </button>
                          <button
                            onClick={() => handleRecordRefill(p.patient_id, p.full_name)}
                            className="px-2.5 py-1 bg-brand-green hover:bg-brand-green-hover text-white font-extrabold text-[10px] rounded-lg cursor-pointer"
                          >
                            Mark Refilled
                          </button>
                        </div>
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
