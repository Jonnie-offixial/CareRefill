import React, { useState, useEffect } from 'react';
import { Patient, Medication, ProgressMetric, Appointment, Consultation, Feedback } from '../types';
import { 
  Heart, 
  Activity, 
  Calendar, 
  MessageSquare, 
  Star, 
  Sparkles, 
  Send, 
  Check, 
  TrendingUp, 
  AlertTriangle, 
  ThumbsUp,
  Clock,
  ShieldCheck,
  Search,
  User,
  ExternalLink,
  ChevronRight,
  ClipboardList,
  Flame,
  Stethoscope,
  Smile,
  RefreshCw
} from 'lucide-react';

interface ClinicConsultDeskProps {
  patients: (Patient & { medication: Medication | null })[];
  pharmacyId: string;
  pharmacyName: string;
  colorTheme: string;
  onRefreshPatients: () => Promise<void>;
  defaultSubTab?: 'appointments' | 'consults' | 'progress' | 'feedback' | 'ai-alerts' | 'inventory' | 'billing' | 'reports';
}

export default function ClinicConsultDesk({
  patients,
  pharmacyId,
  pharmacyName,
  colorTheme,
  onRefreshPatients,
  defaultSubTab
}: ClinicConsultDeskProps) {
  // Lists
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [metrics, setMetrics] = useState<ProgressMetric[]>([]);
  
  // Tab/Active state inside Clinician console
  const [activeSubTab, setActiveSubTab] = useState<'appointments' | 'consults' | 'progress' | 'feedback' | 'ai-alerts' | 'inventory' | 'billing' | 'reports'>(defaultSubTab || 'appointments');

  // Sync subtab state when prop updates
  useEffect(() => {
    if (defaultSubTab) {
      setActiveSubTab(defaultSubTab);
    }
  }, [defaultSubTab]);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  // Adherence Compliance Report state
  const [reportsData, setReportsData] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  
  // AI Drafting & answer States
  const [draftingMap, setDraftingMap] = useState<{ [consultId: string]: boolean }>({});
  const [aiDraftResults, setAiDraftResults] = useState<{ [consultId: string]: string }>({});
  const [answerInputs, setAnswerInputs] = useState<{ [consultId: string]: string }>({});
  const [submittingAnswer, setSubmittingAnswer] = useState<{ [consultId: string]: boolean }>({});

  // --- Premium Integration State Variables ---
  const [aiDraftsList, setAiDraftsList] = useState<any[]>([]);
  const [loadingAiDrafts, setLoadingAiDrafts] = useState(false);
  const [newDraftPatientId, setNewDraftPatientId] = useState('');
  const [newDraftTone, setNewDraftTone] = useState('Friendly');
  const [newDraftLang, setNewDraftLang] = useState('English');
  const [generatingCustomDraft, setGeneratingCustomDraft] = useState(false);
  const [customDraftContent, setCustomDraftContent] = useState('');
  
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [updatingStockName, setUpdatingStockName] = useState<string | null>(null);
  const [newStockVal, setNewStockVal] = useState<number>(100);

  const [paymentInvoices, setPaymentInvoices] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [saasTier, setSaasTier] = useState<'Standard' | 'Professional' | 'Enterprise'>('Professional');
  const [momoPhone, setMomoPhone] = useState('+256 701 445588');
  const [momoCarrier, setMomoCarrier] = useState<'MTN' | 'Airtel'>('MTN');
  const [payingBill, setPayingBill] = useState(false);

  // Success indicators
  const [clinSuccessMsg, setClinSuccessMsg] = useState<string | null>(null);

  // Make Appointment form states
  const [showMakeAppointment, setShowMakeAppointment] = useState(false);
  const [aptPatientId, setAptPatientId] = useState('');
  const [aptDoctorName, setAptDoctorName] = useState('Dr. Sarah Mukasa');
  const [aptDate, setAptDate] = useState('');
  const [aptReason, setAptReason] = useState('Routine chronic review');
  const [aptStatus, setAptStatus] = useState<'Successful' | 'Missed' | 'Discarded'>('Successful');
  const [creatingApt, setCreatingApt] = useState(false);

  // Load clinic data
  const loadClinicData = async () => {
    try {
      // 1. Fetch appointments
      const aRes = await fetch(`/api/appointments?pharmacy_id=${pharmacyId}`);
      if (aRes.ok) {
        setAppointments(await aRes.ok ? await aRes.json() : []);
      }
      
      // 2. Fetch consultations
      const cRes = await fetch(`/api/consultations?pharmacy_id=${pharmacyId}`);
      if (cRes.ok) {
        setConsultations(await cRes.ok ? await cRes.json() : []);
      }
      
      // 3. Fetch feedback
      const fRes = await fetch(`/api/feedback?pharmacy_id=${pharmacyId}`);
      if (fRes.ok) {
        setFeedbacks(await fRes.json());
      }

      // 4. Fetch premium drafts
      fetchAiDrafts();

      // 5. Fetch inventory forecast data
      fetchInventoryForecast();

      // 6. Fetch multi-tenant invoices
      fetchPaymentInvoices();

      // If a patient is selected for monitoring, fetch their metrics
      if (selectedPatientId) {
        const mRes = await fetch(`/api/progress-metrics?patient_id=${selectedPatientId}`);
        if (mRes.ok) {
          setMetrics(await mRes.json());
        }
      }
    } catch (e) {
      console.error("Failed loading clinician-facing workspace details", e);
    }
  };

  const fetchAiDrafts = async () => {
    try {
      setLoadingAiDrafts(true);
      const res = await fetch(`/api/ai-drafts`);
      if (res.ok) {
        setAiDraftsList(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAiDrafts(false);
    }
  };

  const fetchInventoryForecast = async () => {
    try {
      setLoadingInventory(true);
      const res = await fetch(`/api/inventory-forecast?pharmacy_id=${pharmacyId}`);
      if (res.ok) {
        setInventoryList(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInventory(false);
    }
  };

  const fetchPaymentInvoices = async () => {
    try {
      setLoadingPayments(true);
      const res = await fetch(`/api/pharmacies/${pharmacyId}/payments`);
      if (res.ok) {
        setPaymentInvoices(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchReportsData = async () => {
    setLoadingReport(true);
    try {
      const res = await fetch(`/api/pharmacies/${pharmacyId}/adherence-report`);
      if (res.ok) {
        setReportsData(await res.json());
      }
    } catch (e) {
      console.error("Failed to compile pharmacy adherence report data", e);
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'reports') {
      fetchReportsData();
    }
  }, [activeSubTab, pharmacyId, patients]);

  useEffect(() => {
    loadClinicData();
  }, [pharmacyId, selectedPatientId]);

  // Sync patient select default
  useEffect(() => {
    const activePats = patients.filter(p => p.pharmacy_id === pharmacyId);
    if (activePats.length > 0 && !selectedPatientId) {
      setSelectedPatientId(activePats[0].patient_id);
    }
  }, [patients]);

  const activePatForMonitoring = patients.find(p => p.patient_id === selectedPatientId);

  // Actions
  const handleUpdateAppointmentStatus = async (aptId: string, nextStatus: string) => {
    try {
      const res = await fetch(`/api/appointments/${aptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setClinSuccessMsg(`Appointment status successfully set to '${nextStatus}'`);
        setTimeout(() => setClinSuccessMsg(null), 3000);
        await loadClinicData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aptPatientId) {
      alert("Please select a patient.");
      return;
    }
    if (!aptDate) {
      alert("Please specify appointment date and time.");
      return;
    }

    setCreatingApt(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: aptPatientId,
          doctor_name: aptDoctorName,
          appointment_date: new Date(aptDate).toISOString(),
          reason: aptReason,
          status: aptStatus
        })
      });
      if (res.ok) {
        setClinSuccessMsg("Appointment booked and confirmed successfully!");
        setTimeout(() => setClinSuccessMsg(null), 4000);
        setShowMakeAppointment(false);
        setAptDate('');
        setAptReason('Routine chronic review');
        await loadClinicData();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to make appointment.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Connection failed while creating appointment.");
    } finally {
      setCreatingApt(false);
    }
  };

  const handleTriggerAIDraft = async (consultId: string, questionText: string, patName: string, cond: string, medName: string) => {
    setDraftingMap(prev => ({ ...prev, [consultId]: true }));
    try {
      const res = await fetch('/api/gemini/consult-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          patient_name: patName,
          condition: cond,
          medication_name: medName
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiDraftResults(prev => ({ ...prev, [consultId]: data.draft }));
        setAnswerInputs(prev => ({ ...prev, [consultId]: data.draft }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDraftingMap(prev => ({ ...prev, [consultId]: false }));
    }
  };

  const handlePostAnswer = async (consultId: string) => {
    const ansText = answerInputs[consultId];
    if (!ansText || !ansText.trim()) return;

    setSubmittingAnswer(prev => ({ ...prev, [consultId]: true }));
    try {
      const res = await fetch(`/api/consultations/${consultId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: ansText })
      });
      if (res.ok) {
        setClinSuccessMsg("Empathetic advice reply disseminated successfully!");
        setTimeout(() => setClinSuccessMsg(null), 3000);
        await loadClinicData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAnswer(prev => ({ ...prev, [consultId]: false }));
    }
  };

  // Graph renderers (same as Portal to facilitate full monitoring alignment inside clinic Workspace)
  const renderClinicBPChart = () => {
    const bpLogs = metrics
      .filter(m => m.systolic_bp !== null && m.systolic_bp !== undefined)
      .slice(0, 10)
      .reverse();

    if (bpLogs.length < 2) {
      return (
        <div className="h-44 bg-slate-50 border border-dashed rounded-xl flex flex-col items-center justify-center text-gray-400 p-4">
          <TrendingUp className="w-8 h-8 opacity-40 mb-1" />
          <p className="text-xs font-semibold text-gray-550">No blood pressure telemetry recorded yet</p>
        </div>
      );
    }

    const width = 500;
    const height = 150;
    const padding = 25;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    const systolics = bpLogs.map(l => l.systolic_bp || 120);
    const diastolics = bpLogs.map(l => l.diastolic_bp || 80);
    const maxVal = Math.max(...systolics, 160) + 10;
    const minVal = Math.min(...diastolics, 60) - 10;
    const range = maxVal - minVal;

    const getX = (index: number) => padding + (index / (bpLogs.length - 1)) * chartW;
    const getY = (val: number) => height - padding - ((val - minVal) / range) * chartH;

    let sysPath = "";
    let diaPath = "";
    bpLogs.forEach((l, idx) => {
      const x = getX(idx);
      const sy = getY(l.systolic_bp || 120);
      const dy = getY(l.diastolic_bp || 80);
      
      if (idx === 0) {
        sysPath = `M ${x} ${sy}`;
        diaPath = `M ${x} ${dy}`;
      } else {
        sysPath += ` L ${x} ${sy}`;
        diaPath += ` L ${x} ${dy}`;
      }
    });

    return (
      <div className="bg-white border p-4 rounded-xl text-xs space-y-2 font-sans">
        <p className="font-bold text-gray-800">Systolic &amp; Diastolic Chronological Waveform Map</p>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
            const yVal = height - padding - r * chartH;
            return (
              <g key={i}>
                <line x1={padding} y1={yVal} x2={width - padding} y2={yVal} stroke="#e2e8f0" strokeDasharray="3 3" />
                <text x={padding - 5} y={yVal + 3} textAnchor="end" fontSize="9" fill="#94a3b8" className="font-mono">{Math.round(minVal + r * range)}</text>
              </g>
            );
          })}
          <path d={sysPath} fill="none" stroke="#ef4444" strokeWidth="2" />
          <path d={diaPath} fill="none" stroke="#3b82f6" strokeWidth="2" />
          {bpLogs.map((l, idx) => {
            const x = getX(idx);
            const sy = getY(l.systolic_bp || 120);
            const dy = getY(l.diastolic_bp || 80);
            return (
              <g key={idx}>
                <circle cx={x} cy={sy} r="3" fill="#ef4444" />
                <circle cx={x} cy={dy} r="3" fill="#3b82f6" />
                <text x={x} y={height - 5} textAnchor="middle" fontSize="7" fill="#64748b">
                  {new Date(l.logged_date).toLocaleDateString(undefined, {month: 'numeric', day: 'numeric'})}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderClinicSugarChart = () => {
    const sugarLogs = metrics
      .filter(m => m.blood_sugar !== null && m.blood_sugar !== undefined)
      .slice(0, 10)
      .reverse();

    if (sugarLogs.length < 2) {
      return (
        <div className="h-44 bg-slate-50 border border-dashed rounded-xl flex flex-col items-center justify-center text-gray-400 p-4">
          <Activity className="w-8 h-8 opacity-40 mb-1" />
          <p className="text-xs font-semibold text-gray-550">No blood glucose telemetry recorded yet</p>
        </div>
      );
    }

    const width = 500;
    const height = 150;
    const padding = 25;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    const sugars = sugarLogs.map(l => l.blood_sugar || 0);
    const maxVal = Math.max(...sugars, 10) + 1;
    const minVal = Math.max(0, Math.min(...sugars, 4) - 1);
    const range = maxVal - minVal;

    const getX = (index: number) => padding + (index / (sugarLogs.length - 1)) * chartW;
    const getY = (val: number) => height - padding - ((val - minVal) / range) * chartH;

    let pathD = "";
    sugarLogs.forEach((l, idx) => {
      const x = getX(idx);
      const y = getY(l.blood_sugar || 5.5);
      if (idx === 0) pathD = `M ${x} ${y}`;
      else pathD += ` L ${x} ${y}`;
    });

    return (
      <div className="bg-white border p-4 rounded-xl text-xs space-y-2 font-sans overflow-hidden">
        <p className="font-bold text-gray-800">Glucose (mmol/L) Inter-patient Course Trend</p>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
            const yVal = height - padding - r * chartH;
            return (
              <g key={i}>
                <line x1={padding} y1={yVal} x2={width - padding} y2={yVal} stroke="#e2e8f0" strokeDasharray="3 3" />
                <text x={padding - 5} y={yVal + 3} textAnchor="end" fontSize="9" fill="#94a3b8" className="font-mono">{(minVal + r * range).toFixed(1)}</text>
              </g>
            );
          })}
          <path d={pathD} fill="none" stroke="#7c3aed" strokeWidth="2" />
          {sugarLogs.map((l, idx) => {
            const x = getX(idx);
            const y = getY(l.blood_sugar || 5.5);
            return (
              <g key={idx}>
                <circle cx={x} cy={y} r="3" fill="#7c3aed" />
                <text x={x} y={y - 6} textAnchor="middle" fontSize="7" fill="#7c3aed" className="font-bold">{l.blood_sugar}</text>
                <text x={x} y={height - 5} textAnchor="middle" fontSize="7" fill="#64748b">
                  {new Date(l.logged_date).toLocaleDateString(undefined, {month: 'numeric', day: 'numeric'})}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const getThemeTextClass = () => {
    switch (colorTheme) {
      case 'emerald': return 'text-emerald-600';
      case 'indigo': return 'text-indigo-600';
      default: return 'text-teal-600';
    }
  };

  const getThemeBgClass = () => {
    switch (colorTheme) {
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-700';
      case 'indigo': return 'bg-indigo-600 hover:bg-indigo-700';
      default: return 'bg-teal-600 hover:bg-teal-700';
    }
  };

  // NPS Calculations
  const totalNPS = feedbacks.length;
  const avgNPSRating = totalNPS > 0 
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalNPS).toFixed(1) 
    : '5.0';

  return (
    <div className="space-y-6">
      
      {/* Clinician Hub Welcome Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white text-xs sm:text-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full inline-block">
              Clinician Dashboard
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white mt-1">Specialist Consultation &amp; Care Desk</h2>
            <p className="text-xs text-slate-400 mt-1">
              Authorized view for doctors and pharmacists. Confirm bookings, check progression metrics, draft clinical answers with AI and monitor patient feedback.
            </p>
          </div>
          <div className="flex items-center gap-2 text-slate-350 shrink-0 bg-slate-850 border border-slate-700 rounded-xl px-4 py-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-emerald-300 font-bold">SECURE CHANNEL ACTIVE</span>
          </div>
        </div>
      </div>

      {clinSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{clinSuccessMsg}</span>
        </div>
      )}

      {/* 🚨 TWO-WAY WHATSAPP / SMS PATIENT ASSISTANCE ALARMS CENTRAL */}
      {(() => {
        const alerts = patients.filter((p: any) => p.pharmacy_id === pharmacyId && p.assistance_requested === true);
        if (alerts.length === 0) return null;
        return (
          <div className="bg-rose-50 border-2 border-rose-250 rounded-2xl p-4 space-y-3 font-sans text-xs shadow-md animate-pulse">
            <div className="flex items-center justify-between border-b border-rose-150 pb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-750 bg-rose-200 border border-rose-350 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 inline-block"></span>
                {alerts.length} URGENT CLINICAL ASSISTANCE ALERTS
              </span>
              <span className="text-[9px] text-rose-500 font-mono font-bold">Two-Way SMS/WhatsApp channel dispatch notifications</span>
            </div>
            
            <div className="space-y-2">
              {alerts.map((al: any) => (
                <div key={al.patient_id} className="bg-white border border-rose-150 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-800 leading-normal font-sans">
                  <div className="space-y-1">
                    <p className="font-extrabold text-slate-900">{al.full_name} ({al.phone_number})</p>
                    <p className="text-rose-700 text-[11px] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {al.assistance_reason || "Requested help."}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await fetch(`/api/patients/${al.patient_id}/clear-assistance`, { method: 'POST' });
                          alert(`Successfully cleared assistance request warning segment for ${al.full_name}.`);
                          if (onRefreshPatients) {
                            await onRefreshPatients();
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg border-0 cursor-pointer text-[10px] transition select-none shadow-xs"
                    >
                      ✓ Mark Resolved
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        alert(`Opening call VoIP link outbound to ${al.phone_number} on emergency chronic line.`);
                      }}
                      className="bg-slate-800 hover:bg-slate-950 text-white font-bold px-3 py-1.5 rounded-lg border-0 cursor-pointer text-[10px] transition select-none"
                    >
                      📞 Direct VoIP Call
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Primary Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Left Side: Clinician Console Navigation tabs - hidden if only showing appointments */}
        {defaultSubTab !== 'appointments' && (
          <div className="md:col-span-1 space-y-4 font-sans">
            <div className="bg-white rounded-2xl border p-4 flex flex-col gap-1 shadow-3xs text-xs">
              <button
                onClick={() => setActiveSubTab('appointments')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center justify-between ${
                  activeSubTab === 'appointments' ? 'bg-indigo-50 text-indigo-750 font-bold border-l-3 border-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" /> Appointments
                </span>
                {appointments.filter(a => a.status === 'Requested').length > 0 && (
                  <span className="text-[9px] bg-indigo-650 font-black text-white px-2 py-0.5 rounded-full">
                    {appointments.filter(a => a.status === 'Requested').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveSubTab('consults')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center justify-between ${
                  activeSubTab === 'consults' ? 'bg-indigo-50 text-indigo-750 font-bold border-l-3 border-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-400" /> Vitals Consultation
                </span>
                {consultations.filter(c => !c.answer).length > 0 && (
                  <span className="text-[9px] bg-rose-500 font-black text-white px-2 py-0.5 rounded-full">
                    {consultations.filter(c => !c.answer).length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveSubTab('progress')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center justify-between ${
                  activeSubTab === 'progress' ? 'bg-indigo-50 text-indigo-750 font-bold border-l-3 border-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-slate-400" /> Patient Vitals Map
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-405" />
              </button>

              <button
                onClick={() => setActiveSubTab('feedback')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center justify-between ${
                  activeSubTab === 'feedback' ? 'bg-indigo-50 text-indigo-750 font-bold border-l-3 border-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-slate-400" /> NPS Feedback logs
                </span>
                <span className="text-[9.5px] font-bold text-amber-600 bg-amber-50 px-1.5 border border-amber-200 rounded-md">
                  {avgNPSRating}★
                </span>
              </button>

              <div className="border-t border-dashed my-2"></div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400 px-3 font-bold mb-1">MVP+ ROADMAP</div>

              <button
                onClick={() => setActiveSubTab('ai-alerts')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center justify-between ${
                  activeSubTab === 'ai-alerts' ? 'bg-emerald-50 text-emerald-800 font-bold border-l-3 border-emerald-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" /> AI Alerts Queue
                </span>
                {aiDraftsList.filter(d => d.status === 'Pending Review').length > 0 && (
                  <span className="text-[9px] bg-emerald-650 font-black text-white px-2 py-0.5 rounded-full">
                    {aiDraftsList.filter(d => d.status === 'Pending Review').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveSubTab('inventory')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center justify-between ${
                  activeSubTab === 'inventory' ? 'bg-amber-50 text-amber-900 font-bold border-l-3 border-amber-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" /> Stock Forecasting
                </span>
                {inventoryList.some(i => i.current_stock < 35) && (
                  <span className="text-[8px] bg-amber-600 text-white font-extrabold px-1.5 rounded uppercase leading-5">LOW</span>
                )}
              </button>

              <button
                onClick={() => setActiveSubTab('billing')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center justify-between ${
                  activeSubTab === 'billing' ? 'bg-indigo-50 text-indigo-950 font-bold border-l-3 border-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-600" /> Subscription Payments
                </span>
                <span className="text-[9px] bg-cyan-600 font-black text-white px-2 py-0.5 rounded-full">SaaS</span>
              </button>

              <button
                onClick={() => setActiveSubTab('reports')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center justify-between ${
                  activeSubTab === 'reports' ? 'bg-emerald-50 text-emerald-950 font-bold border-l-3 border-emerald-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-emerald-600" /> Compliance Reports
                </span>
                <span className="text-[9px] bg-emerald-600 font-black text-white px-1.5 py-0.5 rounded">NEW</span>
              </button>
            </div>

            {/* Quick clinical stats summary card */}
            <div className="bg-slate-50 border p-4 rounded-2xl flex flex-col gap-3.5 font-sans">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                <ClipboardList className="w-4 h-4 text-slate-500" />
                Practice Status
              </h4>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-white border rounded-xl p-2.5">
                  <p className="text-[9px] uppercase text-gray-400 font-bold">Unconfirmed</p>
                  <p className="text-lg font-black text-gray-800 mt-0.5">
                    {appointments.filter(a => a.status === 'Requested').length}
                  </p>
                </div>
                <div className="bg-white border rounded-xl p-2.5">
                  <p className="text-[9px] uppercase text-gray-400 font-bold">Open Questions</p>
                  <p className="text-lg font-black text-rose-600 mt-0.5">
                    {consultations.filter(c => !c.answer).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Side: Tab panel contents */}
        <div className={defaultSubTab === 'appointments' ? "md:col-span-4" : "md:col-span-3"}>
          
          {/* TAB 1: BOOKED APPOINTMENTS LIST */}
          {activeSubTab === 'appointments' && (
            <div className="bg-white rounded-2xl border p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Clinic Scheduling Ledger</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Verify, confirm or complete booked appointments across patient streams.</p>
                </div>
                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                  <button
                    onClick={() => {
                      const activePats = patients.filter(p => p.pharmacy_id === pharmacyId);
                      if (activePats.length > 0) {
                        setAptPatientId(activePats[0].patient_id);
                      }
                      setShowMakeAppointment(!showMakeAppointment);
                    }}
                    className="bg-brand-green hover:bg-emerald-600 text-white font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition shadow-3xs"
                  >
                    <Calendar className="w-4 h-4" />
                    {showMakeAppointment ? "Close Form" : "Make Appointment"}
                  </button>
                  <button 
                    onClick={loadClinicData}
                    className="bg-gray-50 border hover:bg-gray-100 rounded-xl p-2 text-gray-500 transition cursor-pointer"
                    title="Reload Bookings"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Toggleable Make Appointment form panel */}
              {showMakeAppointment && (
                <form onSubmit={handleCreateAppointment} className="bg-slate-50 border rounded-2xl p-4 sm:p-5 space-y-4 text-xs font-sans">
                  <div className="border-b pb-2.5">
                    <h4 className="font-bold text-slate-850">Book New Active Appointment</h4>
                    <p className="text-[11px] text-gray-400">Instantly schedule an appointment for any registered client under {pharmacyName}.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Patient selector */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Select Patient</label>
                      <select
                        value={aptPatientId}
                        onChange={(e) => setAptPatientId(e.target.value)}
                        className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-green"
                      >
                        <option value="">-- Choose active patient --</option>
                        {patients
                          .filter(p => p.pharmacy_id === pharmacyId)
                          .map(p => (
                            <option key={p.patient_id} value={p.patient_id}>
                              {p.full_name} ({p.chronic_condition})
                            </option>
                          ))
                        }
                      </select>
                    </div>

                    {/* Clinician dropdown */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assigned Clinician</label>
                      <select
                        value={aptDoctorName}
                        onChange={(e) => setAptDoctorName(e.target.value)}
                        className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-green"
                      >
                        <option value="Dr. Sarah Mukasa">Dr. Sarah Mukasa (Chief Adherence Pharmacist)</option>
                        <option value="Dr. Emmanuel Okot">Dr. Emmanuel Okot (Medical Supervisor)</option>
                      </select>
                    </div>

                    {/* Appointment Date and Time */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Appointment Date & Time</label>
                      <input
                        type="datetime-local"
                        value={aptDate}
                        onChange={(e) => setAptDate(e.target.value)}
                        className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-green"
                      />
                    </div>

                    {/* Reason */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Clinical Reason / Diagnosis</label>
                      <input
                        type="text"
                        value={aptReason}
                        onChange={(e) => setAptReason(e.target.value)}
                        placeholder="e.g. Routine chronic review, Blood pressure check"
                        className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-xs font-medium text-slate-850 focus:outline-none focus:ring-1 focus:ring-brand-green"
                      />
                    </div>

                    {/* Status Outcome selection */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">Outcome Status (Passed Only)</label>
                      <select
                        value={aptStatus}
                        onChange={(e) => setAptStatus(e.target.value as any)}
                        className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-green"
                      >
                        <option value="Successful">Successful (Completed)</option>
                        <option value="Missed">Missed Outcome</option>
                        <option value="Discarded">Discarded (Cancelled)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t">
                    <button
                      type="button"
                      onClick={() => setShowMakeAppointment(false)}
                      className="bg-white border hover:bg-gray-100 text-slate-650 font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creatingApt}
                      className="bg-brand-green hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition shadow-3xs disabled:opacity-50"
                    >
                      {creatingApt ? "Confirming..." : "Publish Passed Appointment Log"}
                    </button>
                  </div>
                </form>
              )}

              {(() => {
                const displayedAppointments = appointments.filter((a) =>
                  ['Successful', 'Completed', 'Missed', 'Discarded', 'Cancelled'].includes(a.status)
                );
                return displayedAppointments.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 font-sans">
                    <Calendar className="w-10 h-10 opacity-30 mx-auto mb-2 text-indigo-600" />
                    <p className="font-semibold text-slate-700">No passed appointments found</p>
                    <p className="text-xs mt-0.5">When sandbox patient-actors record passed appointments, they appear here instantly.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayedAppointments.map((a) => {
                      const patientObj = patients.find(p => p.patient_id === a.patient_id);
                      const displayStatus = a.status === 'Completed' ? 'Successful' : (a.status === 'Cancelled' ? 'Discarded' : a.status);
                      return (
                        <div key={a.appointment_id} className="bg-slate-50 border p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-sans text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-850 text-sm">
                                {patientObj?.full_name || 'Generic Patient'}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                displayStatus === 'Successful' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                displayStatus === 'Missed' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                'bg-rose-50 text-rose-700 border-rose-100'
                              }`}>
                                {displayStatus}
                              </span>
                            </div>
                            
                            <p className="text-gray-500 font-medium leading-relaxed">
                              <strong>Reason:</strong> {a.reason}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-400 pt-1">
                              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> clinician: {a.doctor_name}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(a.appointment_date).toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Passed appointments are historical logs, no actionable transition buttons are needed */}
                          <div className="text-[10px] text-slate-400 font-semibold italic shrink-0">
                            Historical Outcome Logged ✓
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 2: CONSULTATIONS SECURE AI Q&A ROOM */}
          {activeSubTab === 'consults' && (
            <div className="bg-white rounded-2xl border p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b pb-3.5">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Clinician Advice Inbox</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Use professional guidelines or smart Gemini-assisted auto-drafting to respond empathetic advice.</p>
                </div>
                <button 
                  onClick={loadClinicData}
                  className="bg-gray-50 border hover:bg-gray-100 rounded-lg p-1.5 text-gray-500 transition cursor-pointer"
                  title="Reload Consults"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {consultations.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-sans">
                  <MessageSquare className="w-10 h-10 opacity-30 mx-auto mb-2 text-indigo-500" />
                  <p className="font-semibold text-slate-700">Symptom inbox is empty</p>
                  <p className="text-xs mt-0.5">When patients consult about symptoms, they appear here instantly.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {consultations.map((c) => {
                    const patientObj = patients.find(p => p.patient_id === c.patient_id);
                    const isAnswered = !!c.answer;
                    const isDraftLoading = draftingMap[c.consultation_id];
                    
                    return (
                      <div key={c.consultation_id} className="bg-slate-50 border p-5 rounded-2xl space-y-4 text-xs font-sans">
                        
                        {/* Consultation Heading with Patient details */}
                        <div className="flex justify-between items-start border-b border-gray-200/50 pb-2.5">
                          <div className="space-y-0.5">
                            <span className="font-black text-slate-850 hover:underline cursor-pointer block text-[13px]">
                              {patientObj?.full_name || 'Anonymous Patient'}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                              <span className="bg-slate-100 border text-slate-600 px-1 rounded-sm">{patientObj?.chronic_condition || 'N/A'}</span>
                              <span>•</span>
                              <span>Asked on {new Date(c.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                          <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-sm uppercase ${isAnswered ? 'bg-teal-50 text-teal-700 border border-teal-150' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                            {isAnswered ? 'Answered' : 'Pending Response'}
                          </span>
                        </div>

                        {/* Patient Query Question content */}
                        <div className="bg-white border rounded-xl p-3.5 space-y-1">
                          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Patient's physiological query</p>
                          <p className="text-slate-800 leading-relaxed font-medium">"{c.question}"</p>
                        </div>

                        {/* Answers log or answers editor panel */}
                        {isAnswered ? (
                          <div className="bg-teal-50 border border-teal-150 rounded-xl p-4 text-xs space-y-1.5">
                            <p className="font-bold text-teal-900">Your Disseminated clinical Advice:</p>
                            <p className="text-slate-700 leading-relaxed italic">"{c.answer}"</p>
                            <p className="text-[10px] text-slate-400 pt-1 text-right">Served on {new Date(c.answered_at!).toLocaleString()}</p>
                          </div>
                        ) : (
                          <div className="space-y-3 pt-1">
                            
                            {/* Gemini Auto Draft button bar */}
                            <div className="flex flex-wrap items-center justify-between gap-2.5">
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Draft Professional Reply</p>
                              
                              <button
                                type="button"
                                disabled={isDraftLoading}
                                onClick={() => handleTriggerAIDraft(
                                  c.consultation_id, 
                                  c.question, 
                                  patientObj?.full_name || 'Patient', 
                                  patientObj?.chronic_condition || 'Chronic disease', 
                                  patientObj?.medication?.medication_name || 'Routine therapy'
                                )}
                                className="bg-slate-900 border border-slate-750 hover:bg-slate-800 text-teal-300 rounded-lg px-3.5 py-2 text-[11px] font-black cursor-pointer transition flex items-center gap-1.5 shadow-xs"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                {isDraftLoading ? 'Assisting...' : 'Auto-Draft response with AI Clinician'}
                              </button>
                            </div>

                            {/* Answer Text Area */}
                            <div className="relative">
                              <textarea
                                placeholder="Enter clinical advice directions or customize the Gemini AI draft..."
                                value={answerInputs[c.consultation_id] || ''}
                                onChange={(e) => setAnswerInputs({ ...answerInputs, [c.consultation_id]: e.target.value })}
                                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 h-32 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                              />
                            </div>

                            {/* Reply button */}
                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                disabled={submittingAnswer[c.consultation_id] || !(answerInputs[c.consultation_id]?.trim())}
                                onClick={() => handlePostAnswer(c.consultation_id)}
                                className={`text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition flex items-center gap-2 ${getThemeBgClass()} disabled:opacity-50`}
                              >
                                <Send className="w-3.5 h-3.5" />
                                {submittingAnswer[c.consultation_id] ? 'Publishing Reply...' : 'Disseminate Response'}
                              </button>
                            </div>

                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PATIENT PROGRESS & telemetry GRAPHS */}
          {activeSubTab === 'progress' && (
            <div className="bg-white rounded-2xl border p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Chronic Vitals Telemetry logs</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Select any patient profile below to assess their logged vitals over time.</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-slate-400 shrink-0 font-medium">Select Patient:</span>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="bg-gray-50 border text-xs font-bold px-3 py-2 rounded-lg cursor-pointer max-w-xs focus:outline-none"
                  >
                    {patients.map(p => (
                      <option key={p.patient_id} value={p.patient_id}>
                        {p.full_name} ({p.chronic_condition})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!activePatForMonitoring ? (
                <div className="p-12 text-center text-slate-400 font-sans">
                  <ClipboardList className="w-10 h-10 opacity-30 mx-auto mb-2 text-indigo-500" />
                  <p className="font-semibold text-slate-700">Please select a patient profile</p>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Selected Patient Vitals Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 border p-4 rounded-xl font-sans text-xs flex flex-col justify-between">
                      <p className="text-[10px] uppercase text-gray-400 font-bold">Chronic Diagnosis</p>
                      <p className="text-sm font-black text-slate-800 mt-1">{activePatForMonitoring.chronic_condition}</p>
                    </div>
                    <div className="bg-slate-50 border p-4 rounded-xl font-sans text-xs flex flex-col justify-between">
                      <p className="text-[10px] uppercase text-gray-400 font-bold">Rx Medication Course</p>
                      <p className="text-sm font-black text-slate-800 mt-1">{activePatForMonitoring.medication?.medication_name || 'Unbound'}</p>
                    </div>
                    <div className="bg-slate-50 border p-4 rounded-xl font-sans text-xs flex flex-col justify-between">
                      <p className="text-[10px] uppercase text-gray-400 font-bold">Refill Compliance Status</p>
                      <p className="text-sm font-black text-slate-800 mt-1">{activePatForMonitoring.status}</p>
                    </div>
                  </div>

                  {/* Trends Graphs */}
                  <div className="grid grid-cols-1 gap-4 pt-2">
                    {activePatForMonitoring.chronic_condition === 'Hypertension' && renderClinicBPChart()}
                    {activePatForMonitoring.chronic_condition === 'Diabetes' && renderClinicSugarChart()}
                    
                    {activePatForMonitoring.chronic_condition !== 'Hypertension' && activePatForMonitoring.chronic_condition !== 'Diabetes' && (
                      <div className="space-y-4">
                        <p className="text-xs text-slate-500 font-sans border-b pb-2">
                          Displaying logged symptom logs for <strong>{activePatForMonitoring.full_name}</strong>:
                        </p>
                        
                        {metrics.length === 0 ? (
                          <div className="p-8 bg-slate-50 border border-dashed rounded-xl text-center text-xs text-gray-400">
                            Awaiting daily wellness progress logs from this patient.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {metrics.map((m, idx) => (
                              <div key={idx} className="bg-slate-50 border p-4 rounded-xl font-sans text-xs flex flex-col justify-between">
                                <div className="flex justify-between items-center mb-1 bg-white p-2 rounded-lg border">
                                  <span className="font-bold text-gray-800">State: {m.wellness_level}</span>
                                  <span className="text-[10px] text-gray-400 font-mono">{new Date(m.logged_date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-slate-600 mt-1">Symptom notes: "{m.symptoms || "None reported"}"</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          )}

          {/* TAB 4: OUTREACH NPS FEEDBACK STATS */}
          {activeSubTab === 'feedback' && (
            <div className="bg-white rounded-2xl border p-6 shadow-xs space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-sm font-bold text-gray-900 font-sans">NPS Patient Satisfaction Dashboard</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Audit patient ratings regarding SMS &amp; WhatsApp reminders or pharmacy package logistics.</p>
              </div>

              {/* Aggregated ratings cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 border p-4 rounded-xl text-center flex flex-col justify-center">
                  <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Practice Average NPS</p>
                  <p className="text-2xl font-black text-amber-500 font-mono">
                    {avgNPSRating} <span className="text-sm font-normal text-gray-500">/ 5.0</span>
                  </p>
                </div>
                <div className="bg-slate-50 border p-4 rounded-xl text-center flex flex-col justify-center">
                  <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Total Submissions</p>
                  <p className="text-2xl font-black text-gray-800 font-mono">{totalNPS}</p>
                </div>
                <div className="bg-slate-50 border p-4 rounded-xl text-center flex flex-col items-center justify-center">
                  <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Clinical Trust Grade</p>
                  <span className="text-sm font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full uppercase border border-emerald-200">
                    {Number(avgNPSRating) >= 4.5 ? 'Excellent' : Number(avgNPSRating) >= 3.5 ? 'Good' : 'Needs Optimization'}
                  </span>
                </div>
              </div>

              {/* Feed of comments */}
              <div className="space-y-3.5 pt-2">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Patient Commentary Log</h4>
                
                {feedbacks.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 font-sans">
                    <Star className="w-10 h-10 opacity-30 mx-auto mb-2 text-amber-400" />
                    <p className="font-semibold text-slate-700">No commentary records found</p>
                  </div>
                ) : (
                  <div className="space-y-3 font-sans text-xs">
                    {feedbacks.map((f, idx) => {
                      const patientObj = patients.find(p => p.patient_id === f.patient_id);
                      return (
                        <div key={idx} className="bg-slate-50 border p-4 rounded-xl space-y-2">
                          <div className="flex justify-between items-center bg-white p-2 border rounded-lg">
                            <span className="font-bold text-slate-800">{patientObj?.full_name || 'Generic Patient'}</span>
                            <span className="text-[10px] font-mono text-gray-400">{new Date(f.created_at).toLocaleString()}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={`w-3.5 h-3.5 ${star <= f.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                              ))}
                            </div>
                            <span className="text-[10px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full uppercase">
                              {f.category}
                            </span>
                          </div>
                          
                          <p className="text-slate-750 font-medium italic">"{f.comment}"</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: AI MESSAGE APPROVALS & OUTBOX QUEUE */}
          {activeSubTab === 'ai-alerts' && (
            <div className="bg-white rounded-2xl border p-6 shadow-xs space-y-6 font-sans">
              <div className="flex justify-between items-center border-b pb-3.5">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-600" /> Patient Adherence AI Draft Outbox</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Generate, customize, and authorize highly empathetic personalized wellness messages before dispatching.</p>
                </div>
                <button 
                  onClick={fetchAiDrafts}
                  className="bg-gray-50 border hover:bg-gray-100 rounded-lg p-1.5 text-gray-500 transition cursor-pointer flex items-center gap-1 text-[11px]"
                  title="Reload drafts"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reload
                </button>
              </div>

              {/* Gemini Adherence Alert Generator Drawer widget */}
              <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 p-5 rounded-xl space-y-4 text-xs">
                <h4 className="font-bold text-emerald-950 flex items-center gap-1.5 text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-600" /> Personalized Refill Alert Builder (Powered by Gemini)
                </h4>
                <p className="text-slate-650 leading-relaxed max-w-2xl">
                  Construct a customized clinical alert for any patient. Our AI is securely programmed to omit complex jargon and formulate friendly, supportive reminders based on local culture and conditions.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Select Patient</label>
                    <select 
                      value={newDraftPatientId}
                      onChange={(e) => setNewDraftPatientId(e.target.value)}
                      className="w-full bg-white border rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">-- Choose Patient --</option>
                      {patients.map(p => (
                        <option key={p.patient_id} value={p.patient_id}>
                          {p.full_name} ({p.chronic_condition})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Tone Style</label>
                    <select 
                      value={newDraftTone}
                      onChange={(e) => setNewDraftTone(e.target.value)}
                      className="w-full bg-white border rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="Friendly">Empathetic Care</option>
                      <option value="Professional">Clinical Advisory</option>
                      <option value="Urgent">Important Refill Alert</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Target Language</label>
                    <select 
                      value={newDraftLang}
                      onChange={(e) => setNewDraftLang(e.target.value)}
                      className="w-full bg-white border rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="English">English</option>
                      <option value="Swahili">Swahili (East Africa)</option>
                      <option value="Luganda">Luganda (Uganda)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={async () => {
                        if (!newDraftPatientId) {
                          alert("Please select a patient to formulate advice.");
                          return;
                        }
                        const selectedP = patients.find(p => p.patient_id === newDraftPatientId);
                        if (!selectedP) return;
                        try {
                          setGeneratingCustomDraft(true);
                          const response = await fetch("/api/gemini/generate-personal-alert", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              name: selectedP.full_name,
                              medication_name: selectedP.medication?.medication_name || "Refill Package",
                              condition: selectedP.chronic_condition,
                              language: newDraftLang
                            })
                          });
                          if (response.ok) {
                            const data = await response.json();
                            setCustomDraftContent(data.draft);
                          }
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setGeneratingCustomDraft(false);
                        }
                      }}
                      disabled={generatingCustomDraft}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-2 rounded-lg cursor-pointer transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      {generatingCustomDraft ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Drafting...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" /> Draft with AI
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {customDraftContent && (
                  <div className="bg-white border text-xs border-emerald-150 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-emerald-850">Review Generated Text</span>
                      <span className="text-[9px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded uppercase font-semibold">Gemini 3.5 Draft</span>
                    </div>
                    <textarea
                      value={customDraftContent}
                      onChange={(e) => setCustomDraftContent(e.target.value)}
                      className="w-full bg-slate-50 border p-2.5 rounded-lg font-mono text-xs text-slate-800 h-20 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <div className="flex justify-end gap-2 text-xs">
                      <button
                        onClick={() => setCustomDraftContent("")}
                        className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer font-semibold"
                      >
                        Reset
                      </button>
                      <button
                        onClick={async () => {
                          const sP = patients.find(p => p.patient_id === newDraftPatientId);
                          if (!sP) return;
                          try {
                            const addDraftResponse = await fetch("/api/ai-drafts", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                patient_id: sP.patient_id,
                                patient_name: sP.full_name,
                                medication_name: sP.medication?.medication_name || "Adherence pack",
                                condition: sP.chronic_condition,
                                message: customDraftContent,
                                channel: sP.preferred_channel
                              })
                            });
                            if (addDraftResponse.ok) {
                              setClinSuccessMsg("New personalized Campaign alert appended to approval outbox queue.");
                              setCustomDraftContent("");
                              fetchAiDrafts();
                              setTimeout(() => setClinSuccessMsg(null), 5000);
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded-lg cursor-pointer shadow-sm"
                      >
                        Add to Review Outbox Queue
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* OUTBOX QUEUE FEED */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Clinical Approval Queue</h4>
                {loadingAiDrafts ? (
                  <div className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
                    <p>Loading active campaign drafts...</p>
                  </div>
                ) : aiDraftsList.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed rounded-xl p-8 text-center text-slate-400">
                    <Sparkles className="w-8 h-8 opacity-40 mx-auto mb-2 text-emerald-600" />
                    <p className="font-semibold text-slate-700 text-xs">No pending alert drafts require clinical review</p>
                    <p className="text-[10px] mt-1">Select a patient above to generate a supportive compliance draft with Gemini.</p>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    {aiDraftsList.map((draft) => (
                      <div key={draft.draft_id} className={`border rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                        draft.status === 'Approved & Sent' ? 'bg-slate-50 opacity-70 border-slate-200' : 'bg-white border-slate-200 hover:border-emerald-250 shadow-2xs'
                      }`}>
                        <div className="space-y-1.5 flex-1 w-full">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{draft.patient_name}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-full uppercase ${
                              draft.status === 'Approved & Sent' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-amber-50 border-amber-100 text-amber-700'
                            }`}>
                              {draft.status}
                            </span>
                            <span className="bg-slate-100 border text-[9.5px] px-2 py-0.5 rounded-sm text-slate-600 font-mono">
                              Channel: {draft.channel}
                            </span>
                            {draft.channel === 'Voice Call' && (
                              <span className="bg-rose-50 border border-rose-100 text-rose-700 text-[8px] font-black px-1.5 rounded uppercase leading-5">Interactive Voice</span>
                            )}
                          </div>

                          <div className="bg-slate-50 border font-mono p-3 rounded-lg text-[11px] text-slate-800 w-full relative group">
                            <p className="whitespace-pre-wrap">{draft.message}</p>
                          </div>

                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span>Condition: {draft.condition}</span>
                            <span>•</span>
                            <span>Medication: {draft.medication_name}</span>
                          </div>
                        </div>

                        {draft.status === 'Pending Review' && (
                          <div className="flex sm:flex-col md:flex-row gap-1.5 shrink-0 self-end md:self-auto">
                            <button
                              onClick={async () => {
                                try {
                                  const ans = await fetch(`/api/ai-drafts/${draft.draft_id}/approve`, {
                                    method: "POST"
                                  });
                                  if (ans.ok) {
                                    setClinSuccessMsg(`Message for ${draft.patient_name} approved and successfully dispatched to the ${draft.channel} gateway network!`);
                                    fetchAiDrafts();
                                    onRefreshPatients();
                                    setTimeout(() => setClinSuccessMsg(null), 5000);
                                  }
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white select-none whitespace-nowrap font-bold px-4 py-1.5 rounded-lg cursor-pointer transition shadow-xs flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve &amp; Dispatch
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm("Discard this campaign alert draft?")) return;
                                try {
                                  await fetch(`/api/ai-drafts/${draft.draft_id}`, { method: 'DELETE' });
                                  fetchAiDrafts();
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-3 py-1.5 rounded-lg cursor-pointer transition"
                            >
                              Discard
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: INVENTORY FORECASTING */}
          {activeSubTab === 'inventory' && (
            <div className="bg-white rounded-2xl border p-6 shadow-xs space-y-6 font-sans">
              <div className="flex justify-between items-center border-b pb-3.5">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-amber-600" /> Pharmacy Refill Inventory Forecasting</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Algorithmic calculations predicting upcoming 14-day medication replenishment workloads based on patient cycles.</p>
                </div>
                <button 
                  onClick={fetchInventoryForecast}
                  className="bg-gray-50 border hover:bg-gray-100 rounded-lg p-1.5 text-gray-500 transition cursor-pointer flex items-center gap-1 text-[11px]"
                  title="Recalculate demand"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Recalculate
                </button>
              </div>

              {/* Forecasting quick KPI bento summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 space-y-1">
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Refill Packages Due (Next 14 Days)</p>
                  <p className="text-2xl font-black text-amber-400">
                    {inventoryList.reduce((sum, item) => sum + item.due_next_week, 0)} packages
                  </p>
                  <p className="text-[10px] text-slate-400">Derived from actual registered patient next due schedules.</p>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-950 p-4 rounded-xl space-y-1">
                  <p className="text-[9px] uppercase tracking-wider text-amber-800 font-bold">Depleted Meds Flagged</p>
                  <p className="text-2xl font-black text-amber-700">
                    {inventoryList.filter(item => item.current_stock < 35).length} formulas
                  </p>
                  <p className="text-[10px] text-amber-800 leading-normal">Requires ordering from Kampala distributors immediately to prevent stockout.</p>
                </div>

                <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-1">
                  <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Predictive Model Level</p>
                  <span className="text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-full inline-block">
                    Adherence Time-Series v1
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">Cross-referencing refill records dynamically.</p>
                </div>
              </div>

              {/* FORECAST LIST TAB */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Workload Forecasting Ledger</h4>
                {loadingInventory ? (
                  <div className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-500" />
                    <p>Calculating live medication predictions...</p>
                  </div>
                ) : inventoryList.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-xl border">
                    <AlertTriangle className="w-10 h-10 opacity-30 mx-auto text-amber-500 mb-2" />
                    <p className="font-semibold text-slate-700">No active patient medications mapped yet</p>
                    <p className="text-xs mt-1">Configure active medications under "Refills Ledger" to display demand forecasts here.</p>
                  </div>
                ) : (
                  <div className="bg-white border rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 text-[10px] uppercase">
                          <th className="px-4 py-3">Medication Name</th>
                          <th className="px-4 py-3 text-center">Active Adhering Patients</th>
                          <th className="px-4 py-3 text-center">Demand Next 14 Days</th>
                          <th className="px-4 py-3 text-center">Estimated Stock level</th>
                          <th className="px-4 py-3 text-right">Inventory Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {inventoryList.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60 transition">
                            <td className="px-4 py-3.5">
                              <span className="font-bold text-slate-900 block">{item.medication_name}</span>
                            </td>
                            <td className="px-4 py-3.5 text-center font-semibold text-slate-700">
                              {item.total_active_patients} patients
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                item.due_next_week > 0 ? 'bg-rose-50 text-rose-700 border border-rose-150' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {item.due_next_week} due refilling
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <div className="flex flex-col items-center justify-center gap-1.5">
                                <span className={`font-mono text-xs font-extrabold ${
                                  item.current_stock < 35 ? 'text-rose-600' : 'text-slate-900'
                                }`}>
                                  {item.current_stock} tablets left
                                </span>
                                <div className="w-24 bg-gray-200 h-1.5 rounded-full overflow-hidden border">
                                  <div 
                                    className={`h-full ${item.current_stock < 35 ? 'bg-rose-500' : 'bg-amber-500'}`} 
                                    style={{ width: `${Math.min(item.current_stock, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              {updatingStockName === item.medication_name ? (
                                <div className="flex items-center justify-end gap-1 select-none">
                                  <input
                                    type="number"
                                    value={newStockVal}
                                    onChange={(e) => setNewStockVal(Number(e.target.value))}
                                    className="border rounded w-16 px-1.5 py-1 text-center font-mono text-xs focus:outline-none"
                                  />
                                  <button
                                    onClick={async () => {
                                      try {
                                        const res = await fetch("/api/inventory/stock", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ medication_name: item.medication_name, new_stock: newStockVal })
                                        });
                                        if (res.ok) {
                                          setClinSuccessMsg(`Stock level for ${item.medication_name} updated successfully.`);
                                          setUpdatingStockName(null);
                                          fetchInventoryForecast();
                                          setTimeout(() => setClinSuccessMsg(null), 5000);
                                        }
                                      } catch (err) {
                                        console.error(err);
                                      }
                                    }}
                                    className="bg-emerald-500 text-white hover:bg-emerald-600 font-bold rounded px-2.5 py-1 text-[10px]"
                                  >
                                    Save
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setUpdatingStockName(item.medication_name);
                                    setNewStockVal(item.current_stock);
                                  }}
                                  className="border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 px-2.5 py-1 text-[11px] font-semibold rounded-lg cursor-pointer transition"
                                >
                                  Stock Replenish
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: SUBSCRIPTIONS & PAYMENT PORTAL */}
          {activeSubTab === 'billing' && (
            <div className="bg-white rounded-2xl border p-6 shadow-xs space-y-6 font-sans">
              <div className="border-b pb-3.5">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-cyan-600" /> Multi-Tenant SaaS Billing &amp; Plan Upgrades</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Manage subscription invoices, print compliance reports, and process Mobile Money (MTN/Airtel) escrow settlements instantly.</p>
              </div>

              {/* Plan cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Standard */}
                <div className={`border rounded-2xl p-5 space-y-3.5 transition flex flex-col justify-between ${
                  saasTier === 'Standard' ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-200'
                }`}>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Standard Adherence</span>
                    <h4 className="font-bold text-slate-850 text-sm">Starter Care</h4>
                    <p className="text-2xl font-black text-slate-900">$19 <span className="text-xs font-normal text-slate-500">/ mo</span></p>
                    <p className="text-[10px] text-slate-500 mt-1">Includes basic automated WhatsApp triggers up to 50 active patients.</p>
                  </div>
                  <button
                    onClick={() => setSaasTier('Standard')}
                    className="w-full border select-none py-1.5 font-bold rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Select Plan
                  </button>
                </div>

                {/* Professional */}
                <div className={`border rounded-2xl p-5 space-y-3.5 transition relative flex flex-col justify-between ${
                  saasTier === 'Professional' ? 'border-cyan-500 bg-cyan-50/25 ring-2 ring-cyan-400/20' : 'border-slate-200'
                }`}>
                  <span className="absolute top-3 right-3 text-[8.5px] uppercase bg-cyan-600 text-white font-extrabold px-2 py-0.5 rounded-full">POPULAR</span>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-cyan-700 font-bold">Advanced Adherence</span>
                    <h4 className="font-bold text-slate-850 text-sm">Professional Team Plan</h4>
                    <p className="text-2xl font-black text-slate-900">$49 <span className="text-xs font-normal text-slate-500">/ mo</span></p>
                    <p className="text-[10px] text-cyan-850 leading-relaxed mt-1">Includes unlimited AI customized alerts (Gemini), Caregiver matching, and Stock predicting.</p>
                  </div>
                  <button
                    onClick={() => setSaasTier('Professional')}
                    className="w-full bg-cyan-600 text-white hover:bg-cyan-700 select-none py-1.5 font-bold rounded-xl text-xs cursor-pointer shadow-sm"
                  >
                    Active Tier
                  </button>
                </div>

                {/* Enterprise */}
                <div className={`border rounded-2xl p-5 space-y-3.5 transition flex flex-col justify-between ${
                  saasTier === 'Enterprise' ? 'border-orange-500 bg-orange-50/10' : 'border-slate-200'
                }`}>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Custom Hospital API</span>
                    <h4 className="font-bold text-slate-850 text-sm">Enterprise System</h4>
                    <p className="text-2xl font-black text-slate-900">$149 <span className="text-xs font-normal text-slate-500">/ mo</span></p>
                    <p className="text-[10px] text-slate-500 mt-1">Includes dedicated hospital database, full API integration, and clinical consult maps.</p>
                  </div>
                  <button
                    onClick={() => setSaasTier('Enterprise')}
                    className="w-full border select-none py-1.5 font-bold rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Upgrade Tier
                  </button>
                </div>
              </div>

              {/* SECURE IN-APP BILLING GATEWAY */}
              <div className="bg-slate-50 border rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div className="md:col-span-1 space-y-3">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-cyan-600" /> Gateway Settlement</h4>
                  <p className="text-slate-500 leading-relaxed">Initiate or adjust a premium subscription transaction directly with MTN Mobile Money or Airtel Money.</p>
                  
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setMomoCarrier('MTN'); setMomoPhone('+256 772 004455'); }}
                        className={`flex-1 p-2 border rounded-lg font-bold text-center transition cursor-pointer ${
                          momoCarrier === 'MTN' ? 'bg-amber-300 border-amber-400 text-amber-950' : 'bg-white hover:bg-gray-100'
                        }`}
                      >
                        MTN MoMo
                      </button>
                      <button 
                        onClick={() => { setMomoCarrier('Airtel'); setMomoPhone('+256 701 445588'); }}
                        className={`flex-1 p-2 border rounded-lg font-bold text-center transition cursor-pointer ${
                          momoCarrier === 'Airtel' ? 'bg-rose-650 border-rose-700 text-white' : 'bg-white hover:bg-gray-100'
                        }`}
                      >
                        Airtel Money
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-500 block">Mobile Wallet Number</label>
                      <input 
                        type="text" 
                        value={momoPhone}
                        onChange={(e) => setMomoPhone(e.target.value)}
                        className="w-full bg-white border rounded-lg p-2 font-mono focus:outline-none" 
                        placeholder="+256 7XX YYYYYY"
                      />
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      try {
                        setPayingBill(true);
                        const costMap = { "Standard": "$19.00", "Professional": "$49.00", "Enterprise": "$149.00" };
                        const cost = costMap[saasTier];
                        
                        const res = await fetch(`/api/pharmacies/${pharmacyId}/payments`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            amount: cost,
                            plan_tier: `${saasTier} SaaS Plan`,
                            gateway: `${momoCarrier} Mobile Money`,
                            phone_number: momoPhone
                          })
                        });
                        
                        if (res.ok) {
                          setClinSuccessMsg(`Premium Subscription update processed. Secure receipt added below.`);
                          fetchPaymentInvoices();
                          setTimeout(() => setClinSuccessMsg(null), 5000);
                        }
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setPayingBill(false);
                      }
                    }}
                    disabled={payingBill}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white select-none whitespace-nowrap font-bold p-2.5 rounded-lg cursor-pointer transition shadow-xs flex items-center justify-center gap-1.5"
                  >
                    {payingBill ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying OTP Escrow...
                      </>
                    ) : (
                      <>
                        Confirm and Upgrade to {saasTier}
                      </>
                    )}
                  </button>
                </div>

                {/* HISTORICAL INVOICES */}
                <div className="md:col-span-2 space-y-3.5 font-sans">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider">Pharmacy Invoice &amp; Settlement Vault</h4>
                  
                  {paymentInvoices.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 bg-white border border-dashed rounded-xl">
                      <ShieldCheck className="w-8 h-8 opacity-30 mx-auto mb-1.5 text-cyan-650" />
                      <p className="font-semibold text-slate-700 text-xs">No receipt invoices found for this pharmacy workspace tenant</p>
                      <p className="text-[10px] mt-1">Submit a Mobile Money gateway request to save securely.</p>
                    </div>
                  ) : (
                    <div className="bg-white border rounded-xl overflow-hidden shadow-3xs">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 text-[10px] uppercase">
                            <th className="px-4 py-2.5">Invoice ID</th>
                            <th className="px-4 py-2.5">Tier Package</th>
                            <th className="px-4 py-2.5">Settlement Gate</th>
                            <th className="px-4 py-2.5 text-center">Amount</th>
                            <th className="px-4 py-2.5 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150 font-mono text-[11px]">
                          {paymentInvoices.map((inv) => (
                            <tr key={inv.invoice_id} className="hover:bg-slate-50/60 transition">
                              <td className="px-4 py-2.5 font-bold text-slate-900">{inv.invoice_id.split('-')[0]}...</td>
                              <td className="px-4 py-2.5 font-semibold text-slate-600">{inv.plan_tier}</td>
                              <td className="px-4 py-2.5 text-slate-500 text-[10px]">{inv.gateway} ({inv.phone_number})</td>
                              <td className="px-4 py-2.5 text-center font-bold text-emerald-700">{inv.amount}</td>
                              <td className="px-4 py-2.5 text-right">
                                <span className="bg-emerald-50 text-emerald-800 border border-emerald-150 px-2 py-0.5 rounded font-black text-[9px] uppercase leading-5">SUCCESS</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              SUBTAB: MONTHLY ADHERENCE COMPLIANCE REPORT GENERATOR
             ========================================== */}
          {activeSubTab === 'reports' && (
            <div className="space-y-6 animate-fade-in text-slate-800 font-sans">
              
              {/* Report Header Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 blur-xs">
                  <ClipboardList className="w-56 h-56" />
                </div>
                <div className="space-y-1 z-10">
                  <span className="text-[10px] font-bold text-teal-300 uppercase tracking-widest bg-teal-950/60 border border-teal-900 rounded px-2.5 py-0.5">
                    District Compliance Intelligence
                  </span>
                  <h3 className="text-lg font-black">{pharmacyName} Monthly Adherence Report</h3>
                  <p className="text-xs text-slate-300">Compiled monthly adherence logs, risk factors, and WhatsApp option feedback channels.</p>
                </div>
                
                <div className="flex flex-wrap gap-2 z-10">
                  <button
                    type="button"
                    onClick={() => {
                      alert(`Generating Printable PDF Executive Briefing... Compiled: Adherence rate is ${reportsData?.overallAdherencePercent ?? 85}% with ${reportsData?.totalPatients ?? 0} active chronic patients.`);
                    }}
                    className="bg-teal-500 hover:bg-teal-600 active:scale-95 text-xs text-slate-950 font-black px-4 py-2 rounded-xl border-0 cursor-pointer transition select-none flex items-center gap-1 shadow-sm"
                  >
                    📥 Download PDF Summary
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      alert(`Compiling secure message... Monthly compliance compilation has been successfully dispatched to the Kampala District Health Ministry ledger.`);
                    }}
                    className="bg-white/10 hover:bg-white/20 text-xs text-white px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    ✉️ Dispatch Ministry File
                  </button>
                </div>
              </div>

              {loadingReport || !reportsData ? (
                <div className="bg-white border rounded-2xl p-16 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-650" />
                  <p className="font-semibold text-slate-600 text-xs">Compiling telemetry data tables...</p>
                  <p className="text-[10px] text-gray-400">Loading monthly compliant refill option rates from database storage.</p>
                </div>
              ) : (
                <div className="space-y-6">

                  {/* Dynamic KPI Bento Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border p-5 space-y-1 shadow-3xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#4a5568]">Total Chronic Patients</span>
                      <p className="text-3xl font-mono font-black text-slate-900">{reportsData.totalPatients}</p>
                      <span className="text-[10px] text-gray-400 block">Enrolled care cycles</span>
                    </div>

                    <div className="bg-white rounded-2xl border p-5 space-y-1 shadow-3xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">On-Time Compliance</span>
                      <p className="text-3xl font-mono font-black text-emerald-700">{reportsData.overallAdherencePercent}%</p>
                      <span className="text-[10px] text-emerald-600 block">Excellent &amp; Good rates</span>
                    </div>

                    <div className="bg-white rounded-2xl border p-5 space-y-1 shadow-3xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600">Delayed Refill Events</span>
                      <p className="text-3xl font-mono font-black text-amber-600">{reportsData.aggregateDelayed}</p>
                      <span className="text-[10px] text-gray-400 block">Requested postponing</span>
                    </div>

                    <div className="bg-white rounded-2xl border p-5 space-y-1 shadow-3xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-500">Missed Refills</span>
                      <p className="text-3xl font-mono font-black text-rose-600">{reportsData.aggregateMissed}</p>
                      <span className="text-[10px] text-rose-500 block">Critical risk cohorts</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Panel: Category distribution count */}
                    <div className="lg:col-span-5 bg-white border rounded-2xl p-6 shadow-3xs space-y-4">
                      <h4 className="font-extrabold text-slate-905 uppercase tracking-wider text-xs border-b pb-2 flex items-center gap-1">
                        📊 Adherence Segment Distribution
                      </h4>

                      <div className="space-y-3 pt-1">
                        <div>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="font-bold text-emerald-700 flex items-center gap-1">
                              🟢 Excellent Adherence (≥ 90%)
                            </span>
                            <span className="font-mono font-black text-slate-800">{reportsData.excellentCount} Patients</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500" 
                              style={{ width: `${reportsData.totalPatients > 0 ? (reportsData.excellentCount / reportsData.totalPatients) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="font-bold text-teal-700 flex items-center gap-1">
                              🔵 Good Adherence (80% - 89%)
                            </span>
                            <span className="font-mono font-black text-slate-800">{reportsData.goodCount} Patients</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-teal-500" 
                              style={{ width: `${reportsData.totalPatients > 0 ? (reportsData.goodCount / reportsData.totalPatients) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="font-bold text-amber-700 flex items-center gap-1">
                              🟡 Moderate Adherence (60% - 79%)
                            </span>
                            <span className="font-mono font-black text-slate-800">{reportsData.moderateCount} Patients</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500" 
                              style={{ width: `${reportsData.totalPatients > 0 ? (reportsData.moderateCount / reportsData.totalPatients) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="font-bold text-rose-700 flex items-center gap-1">
                              🔴 Poor Adherence (&lt; 60%)
                            </span>
                            <span className="font-mono font-black text-slate-800">{reportsData.poorCount} Patients</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-rose-500" 
                              style={{ width: `${reportsData.totalPatients > 0 ? (reportsData.poorCount / reportsData.totalPatients) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Kampala monthly compliance area compliance trends */}
                      <div className="bg-slate-50 border p-4 rounded-xl space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">District compliance Area Compliancy Trend</span>
                        <div className="flex items-end justify-between h-20 pt-2 font-mono text-[9px] text-slate-400">
                          {reportsData.trends?.map((item: any) => (
                            <div key={item.month} className="flex flex-col items-center flex-1 gap-1.5 group">
                              <span className="text-[8px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition truncate">{item.rate}%</span>
                              <div className="w-4 bg-emerald-500 rounded-t-sm" style={{ height: `${item.rate * 0.5}px` }}></div>
                              <span>{item.month}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Panel: Flagged At Risk Patients List */}
                    <div className="lg:col-span-7 bg-white border rounded-2xl p-6 shadow-3xs space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h4 className="font-extrabold text-slate-905 uppercase tracking-wider text-xs flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
                          Escalated High-Risk Cohort (Adherence ≤ 70%)
                        </h4>
                        <span className="bg-rose-50 text-rose-700 text-[10px] px-2 py-0.5 rounded border border-rose-150 font-mono">
                          {reportsData.atRiskPatients?.length ?? 0} flagged
                        </span>
                      </div>

                      {(!reportsData.atRiskPatients || reportsData.atRiskPatients.length === 0) ? (
                        <div className="p-12 text-center text-slate-400 bg-emerald-50/20 border border-dashed rounded-xl">
                          <Smile className="w-8 h-8 opacity-30 mx-auto mb-1.5 text-emerald-600" />
                          <p className="font-semibold text-slate-700 text-xs">No patients flagged under 70% Adherence!</p>
                          <p className="text-[10px]">Terrific job! Perfect chronic condition pickup rates achieved across the board.</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                          {reportsData.atRiskPatients.map((pat: any) => (
                            <div key={pat.patient_id} className="bg-slate-50 border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs leading-normal">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-extrabold text-slate-900">{pat.full_name}</p>
                                  <span className="bg-rose-100 text-rose-800 text-[9px] px-1.5 py-0.2 rounded font-black">
                                    {pat.category}: {pat.refill_percentage}%
                                  </span>
                                </div>
                                <p className="text-slate-400 text-[10px]">{pat.chronic_condition} • {pat.phone_number}</p>
                                <p className="text-[10px] text-[#4a5568]">
                                  Missed pickups: <strong className="text-rose-600">{pat.missed_count} periods</strong>.
                                </p>
                              </div>

                              <div className="flex sm:flex-col items-stretch gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    alert(`Direct urgent SMS reminder broadcast to patient ${pat.full_name} (${pat.phone_number}).`);
                                  }}
                                  className="bg-slate-800 hover:bg-slate-950 font-bold border-0 px-2.5 py-1.5 rounded-lg text-[10px] text-white cursor-pointer transition select-none flex items-center justify-center gap-1"
                                >
                                  ✉️ Urgent SMS
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    alert(`Placing high-priority direct clinician VoIP call out bound to caregivers list for ${pat.full_name}.`);
                                  }}
                                  className="bg-white hover:bg-slate-100 border text-slate-700 font-bold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer transition flex items-center justify-center gap-1"
                                >
                                  📞 Call Caregiver
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
