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
}

export default function ClinicConsultDesk({
  patients,
  pharmacyId,
  pharmacyName,
  colorTheme,
  onRefreshPatients
}: ClinicConsultDeskProps) {
  // Lists
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [metrics, setMetrics] = useState<ProgressMetric[]>([]);
  
  // Tab/Active state inside Clinician console
  const [activeSubTab, setActiveSubTab] = useState<'appointments' | 'consults' | 'progress' | 'feedback'>('appointments');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  
  // AI Drafting & answer States
  const [draftingMap, setDraftingMap] = useState<{ [consultId: string]: boolean }>({});
  const [aiDraftResults, setAiDraftResults] = useState<{ [consultId: string]: string }>({});
  const [answerInputs, setAnswerInputs] = useState<{ [consultId: string]: string }>({});
  const [submittingAnswer, setSubmittingAnswer] = useState<{ [consultId: string]: boolean }>({});

  // Success indicators
  const [clinSuccessMsg, setClinSuccessMsg] = useState<string | null>(null);

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

      {/* Primary Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Left Side: Clinician Console Navigation tabs */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border p-4 flex flex-col gap-1 shadow-3xs">
            <button
              onClick={() => setActiveSubTab('appointments')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center justify-between ${
                activeSubTab === 'appointments' ? 'bg-indigo-50 text-indigo-700 font-bold border-l-3 border-indigo-600' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" /> Appointments
              </span>
              {appointments.filter(a => a.status === 'Requested').length > 0 && (
                <span className="text-[9.5px] bg-indigo-600 font-black text-white px-1.5 py-0.5 rounded-full">
                  {appointments.filter(a => a.status === 'Requested').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('consults')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center justify-between ${
                activeSubTab === 'consults' ? 'bg-indigo-50 text-indigo-700 font-bold border-l-3 border-indigo-600' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-500" /> Patient Consults
              </span>
              {consultations.filter(c => !c.answer).length > 0 && (
                <span className="text-[9.5px] bg-rose-500 font-black text-white px-1.5 py-0.5 rounded-full">
                  {consultations.filter(c => !c.answer).length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('progress')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center justify-between ${
                activeSubTab === 'progress' ? 'bg-indigo-50 text-indigo-700 font-bold border-l-3 border-indigo-600' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-slate-500" /> Patient Vitals Map
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveSubTab('feedback')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center justify-between ${
                activeSubTab === 'feedback' ? 'bg-indigo-50 text-indigo-700 font-bold border-l-3 border-indigo-600' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4 text-slate-500" /> NPS Feedback logs
              </span>
              <span className="text-[10px] font-bold text-amber-600 font-sans">
                {avgNPSRating}★
              </span>
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

        {/* Right Side: Tab panel contents */}
        <div className="md:col-span-3">
          
          {/* TAB 1: BOOKED APPOINTMENTS LIST */}
          {activeSubTab === 'appointments' && (
            <div className="bg-white rounded-2xl border p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b pb-3.5">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Clinic Scheduling Ledger</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Verify, confirm or complete booked appointments across patient streams.</p>
                </div>
                <button 
                  onClick={loadClinicData}
                  className="bg-gray-50 border hover:bg-gray-100 rounded-lg p-1.5 text-gray-500 transition cursor-pointer"
                  title="Reload Bookings"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {appointments.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-sans">
                  <Calendar className="w-10 h-10 opacity-30 mx-auto mb-2 text-indigo-600" />
                  <p className="font-semibold text-slate-700">No scheduled appointments found</p>
                  <p className="text-xs mt-0.5">When sandbox patient-actors record requested appointments, they appear instantly here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((a) => {
                    const patientObj = patients.find(p => p.patient_id === a.patient_id);
                    return (
                      <div key={a.appointment_id} className="bg-slate-50 border p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-sans text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-850 text-sm">
                              {patientObj?.full_name || 'Generic Patient'}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              (a.status === 'Confirmed' || a.status === 'Approved') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              a.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                              a.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                              'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                              {a.status === 'Confirmed' ? 'Approved' : a.status}
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

                        {/* Action buttons */}
                        <div className="flex gap-2 shrink-0 self-end sm:self-auto">
                          {(a.status === 'Requested' || a.status === 'Pending') && (
                            <>
                              <button
                                onClick={() => handleUpdateAppointmentStatus(a.appointment_id, 'Approved')}
                                className="bg-emerald-450 hover:bg-emerald-500 text-slate-950 rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer transition shadow-xs"
                              >
                                Approve Request
                              </button>
                              <button
                                onClick={() => handleUpdateAppointmentStatus(a.appointment_id, 'Cancelled')}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition"
                              >
                                Decline
                              </button>
                            </>
                          )}
                          {(a.status === 'Confirmed' || a.status === 'Approved') && (
                            <button
                              onClick={() => handleUpdateAppointmentStatus(a.appointment_id, 'Completed')}
                              className="bg-slate-800 hover:bg-slate-950 text-white rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition"
                            >
                              Mark Completed
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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

        </div>

      </div>

    </div>
  );
}
