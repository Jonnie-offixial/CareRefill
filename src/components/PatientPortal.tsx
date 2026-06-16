import React, { useState, useEffect } from 'react';
import { Patient, Medication, ProgressMetric, Appointment, Consultation, Feedback } from '../types';
import { 
  Heart, 
  Activity, 
  Calendar, 
  MessageSquare, 
  Star, 
  Plus, 
  CheckCircle, 
  Sparkles, 
  ArrowRight, 
  Smartphone, 
  Clock, 
  BookOpen, 
  AlertCircle, 
  HeartHandshake, 
  TrendingUp, 
  AlertTriangle,
  Send,
  User,
  ShieldAlert,
  Sliders,
  Award
} from 'lucide-react';

interface PatientPortalProps {
  patients: (Patient & { medication: Medication | null })[];
  pharmacyId: string;
  pharmacyName: string;
  colorTheme: string;
  onRefreshPatients: () => Promise<void>;
}

export default function PatientPortal({
  patients,
  pharmacyId,
  pharmacyName,
  colorTheme,
  onRefreshPatients
}: PatientPortalProps) {
  // Current Selected Active Patient state
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  
  // Data lists
  const [metrics, setMetrics] = useState<ProgressMetric[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  
  // Tab states
  const [portalTab, setPortalTab] = useState<'status' | 'metrics' | 'appointments' | 'consult' | 'feedback'>('status');
  
  // Submitting form loaders
  const [submittingMetric, setSubmittingMetric] = useState(false);
  const [submittingApt, setSubmittingApt] = useState(false);
  const [submittingConsult, setSubmittingConsult] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  
  // Alerts success/error
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  
  // Form Vitals Inputs
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');
  const [sugarType, setSugarType] = useState<'Fasting' | 'Random' | 'Post-Meal'>('Fasting');
  const [wellnessLevel, setWellnessLevel] = useState<'Great' | 'Good' | 'Fair' | 'Poor'>('Good');
  const [symptoms, setSymptoms] = useState('');
  
  // Form Appointment booking
  const [doctorName, setDoctorName] = useState('Dr. Sarah Mukasa');
  const [aptDate, setAptDate] = useState('');
  const [aptTime, setAptTime] = useState('09:00');
  const [aptReason, setAptReason] = useState('');

  // Form Consultation
  const [consultQuestion, setConsultQuestion] = useState('');

  // Form Feedback
  const [fbRating, setFbRating] = useState<number>(5);
  const [fbComment, setFbComment] = useState('');
  const [fbCategory, setFbCategory] = useState<'Reminders' | 'Refills' | 'Pharmacy Service' | 'Other'>('Reminders');

  // Two-Way WhatsApp states
  const [repliesList, setRepliesList] = useState<any[]>([]);
  const [incomingText, setIncomingText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Load all patient portal records
  const loadPortalData = async (patId: string) => {
    if (!patId) return;
    try {
      // Fetch Metrics
      const mRes = await fetch(`/api/progress-metrics?patient_id=${patId}`);
      if (mRes.ok) {
        setMetrics(await mRes.json());
      }
      
      // Fetch Replies list
      const repRes = await fetch(`/api/patients/${patId}/replies`);
      if (repRes.ok) {
        setRepliesList(await repRes.json());
      }
      
      // Fetch Appointments
      const aRes = await fetch(`/api/appointments?pharmacy_id=${pharmacyId}&patient_id=${patId}`);
      if (aRes.ok) {
        setAppointments(await aRes.json());
      }
      
      // Fetch Consultations
      const cRes = await fetch(`/api/consultations?pharmacy_id=${pharmacyId}&patient_id=${patId}`);
      if (cRes.ok) {
        setConsultations(await cRes.json());
      }

      // Fetch Feedback
      const fRes = await fetch(`/api/feedback?pharmacy_id=${pharmacyId}`);
      if (fRes.ok) {
        const allFbs: Feedback[] = await fRes.json();
        setFeedbacks(allFbs.filter(f => f.patient_id === patId));
      }
    } catch (e) {
      console.error("Failed to fetch Patient Portal details", e);
    }
  };

  useEffect(() => {
    if (selectedPatientId) {
      loadPortalData(selectedPatientId);
    }
  }, [selectedPatientId]);

  // Handle selecting default on mount
  useEffect(() => {
    const activePats = patients.filter(p => p.pharmacy_id === pharmacyId && p.status === 'Active');
    if (activePats.length > 0 && !selectedPatientId) {
      setSelectedPatientId(activePats[0].patient_id);
    }
  }, [patients, pharmacyId]);

  const activePatient = patients.find(p => p.patient_id === selectedPatientId);
  const med = activePatient?.medication || null;

  // Days calculations
  const getDaysRemainingText = () => {
    if (!med) return { days: 0, text: "No Active Medication Cycle", status: 'none', percent: 0 };
    const nextDate = new Date(med.next_refill_date);
    const today = new Date("2026-06-12T08:00:00Z"); // Locked treatment calendar reference point
    
    nextDate.setHours(8, 0, 0, 0);
    today.setHours(8, 0, 0, 0);

    const diff = nextDate.getTime() - today.getTime();
    const days = Math.round(diff / (1000 * 60 * 60 * 24));
    const totalDays = med.duration_days || 30;
    const percent = Math.max(0, Math.min(100, Math.round((days / totalDays) * 100)));

    if (days < 0) {
      return { days: Math.abs(days), text: `${Math.abs(days)} days OVERDUE`, status: 'overdue', percent };
    } else if (days === 0) {
      return { days, text: "Refill is Due Today!", status: 'critical', percent };
    } else if (days <= 5) {
      return { days, text: `${days} days left (Refill Soon)`, status: 'warning', percent };
    } else {
      return { days, text: `${days} days remaining`, status: 'safe', percent };
    }
  };

  const refillStatus = getDaysRemainingText();

  // Form Submissions
  const submitMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    setSubmittingMetric(true);
    try {
      const res = await fetch('/api/progress-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatientId,
          systolic_bp: systolic ? Number(systolic) : undefined,
          diastolic_bp: diastolic ? Number(diastolic) : undefined,
          blood_sugar: bloodSugar ? Number(bloodSugar) : undefined,
          sugar_type: bloodSugar ? sugarType : undefined,
          wellness_level: wellnessLevel,
          symptoms
        })
      });
      if (res.ok) {
        setSystolic('');
        setDiastolic('');
        setBloodSugar('');
        setSymptoms('');
        setFeedbackSuccess("Wellness metric logged successfully!");
        setTimeout(() => setFeedbackSuccess(null), 3000);
        await loadPortalData(selectedPatientId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingMetric(false);
    }
  };

  const handleSendReply = async (optionValue: string) => {
    if (!selectedPatientId || !optionValue.trim()) return;
    setSubmittingReply(true);
    try {
      const response = await fetch(`/api/patients/${selectedPatientId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reply_option: optionValue,
          channel: activePatient?.preferred_channel || 'WhatsApp'
        })
      });
      if (response.ok) {
        setIncomingText('');
        await loadPortalData(selectedPatientId);
        if (onRefreshPatients) {
          await onRefreshPatients();
        }
      }
    } catch (err) {
      console.error("Failed to send response reply:", err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const submitAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !aptDate || !aptReason) return;
    setSubmittingApt(true);
    try {
      const fullDate = `${aptDate}T${aptTime}:00Z`;
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatientId,
          doctor_name: doctorName,
          appointment_date: fullDate,
          reason: aptReason
        })
      });
      if (res.ok) {
        setAptReason('');
        setFeedbackSuccess("Doctor appointment requested successfully!");
        setTimeout(() => setFeedbackSuccess(null), 3000);
        await loadPortalData(selectedPatientId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingApt(false);
    }
  };

  const submitConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !consultQuestion.trim()) return;
    setSubmittingConsult(true);
    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatientId,
          question: consultQuestion
        })
      });
      if (res.ok) {
        setConsultQuestion('');
        setFeedbackSuccess("Symptom consultation sent to clinical staff!");
        setTimeout(() => setFeedbackSuccess(null), 3000);
        await loadPortalData(selectedPatientId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingConsult(false);
    }
  };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !fbComment.trim()) return;
    setSubmittingFeedback(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatientId,
          rating: fbRating,
          comment: fbComment,
          category: fbCategory
        })
      });
      if (res.ok) {
        setFbComment('');
        setFeedbackSuccess("Highly appreciate your feedback. Helping our clinics refine communications!");
        setTimeout(() => setFeedbackSuccess(null), 3000);
        await loadPortalData(selectedPatientId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingFeedback(false);
    }
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
      case 'emerald': return 'bg-emerald-600';
      case 'indigo': return 'bg-indigo-600';
      default: return 'bg-teal-600';
    }
  };

  const getThemeAccentBorder = () => {
    switch (colorTheme) {
      case 'emerald': return 'border-emerald-550 focus:ring-emerald-500';
      case 'indigo': return 'border-indigo-550 focus:ring-indigo-500';
      default: return 'border-teal-550 focus:ring-teal-500';
    }
  };

  // Custom SVG Chart Renderers (Failsafe & highly customized)
  const renderBPChart = () => {
    const bpLogs = metrics
      .filter(m => m.systolic_bp !== null && m.systolic_bp !== undefined)
      .slice(0, 10)
      .reverse();

    if (bpLogs.length < 2) {
      return (
        <div className="h-44 bg-slate-50 border border-dashed rounded-2xl flex flex-col items-center justify-center text-gray-400 p-4">
          <TrendingUp className="w-8 h-8 opacity-40 mb-1.5" />
          <p className="text-xs font-semibold text-gray-500">Awaiting blood pressure logs</p>
          <p className="text-[10px] text-gray-400 text-center mt-0.5">Please add at least 2 vitals logs to construct the chronic blood pressure graph.</p>
        </div>
      );
    }

    // Chart Specs
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

    // Create Path Strings
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
      <div className="space-y-4">
        <div className="flex gap-4 text-xs font-semibold mb-1">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block"></span>Systolic (ideal &lt; 130)</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500 inline-block"></span>Diastolic (ideal &lt; 85)</span>
        </div>
        <div className="relative bg-white border border-gray-150 rounded-xl p-2 shadow-2xs">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
              const yVal = height - padding - r * chartH;
              const textVal = Math.round(minVal + r * range);
              return (
                <g key={i}>
                  <line x1={padding} y1={yVal} x2={width - padding} y2={yVal} stroke="#e2e8f0" strokeDasharray="3 3" />
                  <text x={padding - 5} y={yVal + 3} textAnchor="end" fontSize="9" fill="#94a3b8" className="font-mono">{textVal}</text>
                </g>
              );
            })}

            {/* Lines */}
            <path d={sysPath} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d={diaPath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Scatter Dots */}
            {bpLogs.map((l, idx) => {
              const x = getX(idx);
              const sy = getY(l.systolic_bp || 120);
              const dy = getY(l.diastolic_bp || 80);
              return (
                <g key={idx}>
                  <circle cx={x} cy={sy} r="4" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx={x} cy={dy} r="4" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                  <text x={x} y={height - 5} textAnchor="middle" fontSize="8" fill="#64748b" className="font-sans font-medium">
                    {new Date(l.logged_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  const renderSugarChart = () => {
    const sugarLogs = metrics
      .filter(m => m.blood_sugar !== null && m.blood_sugar !== undefined)
      .slice(0, 10)
      .reverse();

    if (sugarLogs.length < 2) {
      return (
        <div className="h-44 bg-slate-50 border border-dashed rounded-2xl flex flex-col items-center justify-center text-gray-400 p-4">
          <Activity className="w-8 h-8 opacity-40 mb-1.5 text-blue-400" />
          <p className="text-xs font-semibold text-gray-500">Awaiting blood glucose logs</p>
          <p className="text-[10px] text-gray-400 text-center mt-0.5">Please log blood sugar at least 2 times to automatically graph diabetes responses.</p>
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
      <div className="space-y-4">
        <div className="flex gap-4 text-xs font-semibold mb-1">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-violet-600 inline-block"></span>Blood Glucose (mmol/L)</span>
          <span className="text-slate-400 italic text-[11px] font-normal">• Perfect Fasting range: 4.0 - 7.0 mmol/L</span>
        </div>
        <div className="relative bg-white border border-gray-150 rounded-xl p-2 shadow-2xs">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
              const yVal = height - padding - r * chartH;
              const textVal = (minVal + r * range).toFixed(1);
              return (
                <g key={i}>
                  <line x1={padding} y1={yVal} x2={width - padding} y2={yVal} stroke="#e2e8f0" strokeDasharray="3 3" />
                  <text x={padding - 5} y={yVal + 3} textAnchor="end" fontSize="9" fill="#94a3b8" className="font-mono">{textVal}</text>
                </g>
              );
            })}

            {/* Area under curve */}
            {pathD && (
              <path 
                d={`${pathD} L ${getX(sugarLogs.length - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`} 
                fill="rgba(124, 58, 237, 0.05)" 
              />
            )}

            {/* Line */}
            <path d={pathD} fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Dots */}
            {sugarLogs.map((l, idx) => {
              const x = getX(idx);
              const y = getY(l.blood_sugar || 5.5);
              return (
                <g key={idx}>
                  <circle cx={x} cy={y} r="4" fill="#7c3aed" stroke="#ffffff" strokeWidth="1.5" />
                  <text x={x} y={y - 8} textAnchor="middle" fontSize="8" fill="#7c3aed" className="font-mono font-bold">
                    {l.blood_sugar}
                  </text>
                  <text x={x} y={height - 5} textAnchor="middle" fontSize="8" fill="#64748b" className="font-sans font-medium">
                    {new Date(l.logged_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  // Condition Badge colors helper
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
    <div className="space-y-6">
      
      {/* Patient Active Terminal Selector Header */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 tracking-wider uppercase">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
              Live Patient Terminal
            </div>
            <h2 className="text-xl font-bold tracking-tight">Chronic Treatment Self-Service Portal</h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Access active wellness actions for patient care. Log daily progress, submit physiological queries, request clinic consultations, and share treatment feedback.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <div className="text-xs text-right hidden sm:block">
              <p className="text-slate-400 font-medium">Active Logged-in Patient:</p>
              <p className="text-white font-bold">{activePatient?.full_name || 'No Patient Active'}</p>
            </div>
            
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="bg-slate-850 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl outline-none border border-slate-700 cursor-pointer w-full sm:w-64 max-w-xs transition"
            >
              <option value="" disabled>-- Select Active Patient Coordinates --</option>
              {patients
                .filter(p => p.pharmacy_id === pharmacyId && p.status === 'Active')
                .map(p => (
                  <option key={p.patient_id} value={p.patient_id}>
                    {p.full_name} ({p.chronic_condition})
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {!activePatient ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
          <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto opacity-40 mb-3" />
          <h3 className="text-base font-bold text-gray-900">No Patient Registered</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Please register some active patient profiles in the "Medication Registry" tab first, then select them to open the portal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Side navigation tabs */}
          <div className="md:col-span-1 space-y-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-3xs flex flex-row md:flex-col gap-1 overflow-x-auto">
              <button
                onClick={() => setPortalTab('status')}
                className={`w-full flex items-center justify-start gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${portalTab === 'status' ? 'bg-indigo-50 text-indigo-700 font-bold border-l-3 border-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Award className="w-4 h-4 shrink-0" />
                Treatment Summary
              </button>

              <button
                onClick={() => setPortalTab('metrics')}
                className={`w-full flex items-center justify-start gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${portalTab === 'metrics' ? 'bg-indigo-50 text-indigo-700 font-bold border-l-3 border-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Heart className="w-4 h-4 shrink-0" />
                Vitals Progress Logs
              </button>

              <button
                onClick={() => setPortalTab('appointments')}
                className={`w-full flex items-center justify-start gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${portalTab === 'appointments' ? 'bg-indigo-50 text-indigo-700 font-bold border-l-3 border-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Calendar className="w-4 h-4 shrink-0" />
                Clinician Bookings
              </button>

              <button
                onClick={() => setPortalTab('consult')}
                className={`w-full flex items-center justify-start gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${portalTab === 'consult' ? 'bg-indigo-50 text-indigo-700 font-bold border-l-3 border-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                Medical Consult Room
              </button>

              <button
                onClick={() => setPortalTab('feedback')}
                className={`w-full flex items-center justify-start gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${portalTab === 'feedback' ? 'bg-indigo-50 text-indigo-700 font-bold border-l-3 border-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Star className="w-4 h-4 shrink-0" />
                outreach Feedback
              </button>
            </div>

            {/* Secondary stats overview inside rail */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-3 font-sans">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-gray-900">Treatment Plan Active</span>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Diagnosis</p>
                <p className="text-xs font-semibold text-gray-800">{activePatient.chronic_condition}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Therapy course</p>
                <p className="text-xs font-semibold text-gray-800">{med?.medication_name || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Tab contents panel */}
          <div className="md:col-span-3">
            
            {feedbackSuccess && (
              <div className="mb-4 bg-emerald-50 border border-emerald-150 rounded-xl p-4 text-xs font-medium text-emerald-850 flex items-center gap-2 shadow-xs">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{feedbackSuccess}</span>
              </div>
            )}

            {/* TAB 1: TREATMENT SUMMARY */}
            {portalTab === 'status' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 border-b pb-3 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    Chronic Therapy Wellness Scorecard
                  </h3>
                  
                  {/* Countdown Card */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="md:col-span-2 bg-slate-50 border rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
                      {refillStatus.status === 'overdue' && (
                        <div className="absolute top-4 right-4 bg-rose-100 border border-rose-200 text-rose-700 rounded-full px-3 py-0.5 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          OVERDUE
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Refill Cycle Status</p>
                        <h4 className="text-xl font-black text-slate-800 mt-2">{refillStatus.text}</h4>
                        <p className="text-xs text-slate-550 mt-1 max-w-sm">
                          {refillStatus.status === 'overdue' 
                            ? 'Our system dispatched WhatsApp/SMS alerts. Please visit Plot 42 immediately or request a clinical home delivery arrangement.' 
                            : 'Maintaining compliance to chronic refills is essential to control underlying symptoms and avoid acute events.'}
                        </p>
                      </div>

                      <div className="mt-6 border-t border-slate-200/50 pt-4 flex justify-between text-xs text-slate-500 font-sans">
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Last Refill Date</p>
                          <p className="font-semibold text-slate-800 mt-0.5">{med?.last_refill_date ? med.last_refill_date.split('T')[0] : 'Unlogged'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Next Due Date</p>
                          <p className="font-semibold text-slate-800 mt-0.5">{med?.next_refill_date ? med.next_refill_date.split('T')[0] : 'Unlogged'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 border rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Cycle Remaining</p>
                      <div className="relative h-24 w-24">
                        <svg className="h-full w-full" viewBox="0 0 36 36">
                          <path
                            className="text-slate-200"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className={refillStatus.status === 'overdue' ? 'text-rose-500' : 'text-indigo-600'}
                            strokeDasharray={`${refillStatus.percent}, 100`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <text x="18" y="20.35" className="fill-slate-800 font-bold text-[8.5px] text-center font-mono" textAnchor="middle">
                            {refillStatus.status === 'overdue' ? '0%' : `${refillStatus.percent}%`}
                          </text>
                        </svg>
                      </div>
                      <p className="text-[10px] text-slate-550 mt-3 font-semibold">
                        Cycle length: {med?.duration_days ?? 30} days
                      </p>
                    </div>
                  </div>
                </div>

                {/* 💬 TWO-WAY WHATSAPP / SMS OUTREACH SIMULATOR */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-3 mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                        Interactive Two-Way Outreach Simulator
                      </h3>
                      <p className="text-[10px] text-gray-400">Simulate incoming patient replied choices on WhatsApp &amp; SMS channels</p>
                    </div>
                    <span className="text-[9px] font-mono tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200 uppercase px-2 py-0.5 rounded-full font-black">
                      {activePatient.preferred_channel} Channel Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Interactive Phone Screen */}
                    <div className="lg:col-span-7 bg-slate-950 rounded-3xl p-3 shadow-lg border-4 border-slate-800 max-w-md mx-auto w-full relative">
                      {/* Top camera notch */}
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-slate-800 rounded-full z-15"></div>
                      
                      {/* Inner screen container */}
                      <div className="bg-slate-900 rounded-2xl overflow-hidden flex flex-col h-[380px] font-sans text-xs">
                        {/* Header of Chat screen */}
                        <div className="bg-slate-800 border-b border-slate-700/80 p-3 pt-5 flex items-center justify-between text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center font-bold text-[10px] text-white tracking-tighter uppercase">
                              {pharmacyName.split(' ')[0]}
                            </div>
                            <div>
                              <p className="font-bold text-[11px] leading-tight">{pharmacyName}</p>
                              <p className="text-[8px] text-emerald-450 font-mono flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                                Refill Outreach Bot Online
                              </p>
                            </div>
                          </div>
                          <span className="text-[8px] opacity-60 font-mono">Simulated chat</span>
                        </div>

                        {/* Scrollable messages zone */}
                        <div className="flex-1 p-3 overflow-y-auto space-y-3 flex flex-col bg-[#0b141a]">
                          {/* System automated outbound alert */}
                          <div className="self-start max-w-[85%] bg-slate-800 text-white rounded-2xl rounded-tl-sm p-2.5 shadow-sm space-y-1">
                            <p className="text-[10px] leading-relaxed text-gray-200">
                              Halo <strong>{activePatient.full_name}</strong>, kano kajjukizo mu mukwano okuva mu {pharmacyName}. Your medication for <strong>{med?.medication_name || "Metformin"}</strong> is due for a refill on <strong>{med?.next_refill_date ? med.next_refill_date.split('T')[0] : "Next cycle"}</strong>.
                            </p>
                            <div className="border-t border-white/10 pt-1 mt-1 text-[9px] text-amber-300 font-medium space-y-0.5">
                              <p>Please reply with the digit code below:</p>
                              <p><strong>1</strong> = Already picked up / Refilled meds.</p>
                              <p><strong>2</strong> = Postpone and remind me tomorrow.</p>
                              <p><strong>3</strong> = I need clinical assistance.</p>
                              <p><strong>4</strong> = Call me back.</p>
                            </div>
                            <span className="text-[8px] opacity-40 text-right block font-mono">System Dispatched</span>
                          </div>

                          {/* Historical reply bubble lists */}
                          {repliesList.length === 0 ? (
                            <p className="text-center text-slate-500 text-[9px] py-4 italic">No replies recorded yet. Click options below to simulate an incoming answer!</p>
                          ) : (
                            repliesList.map((rep: any) => (
                              <div 
                                key={rep.reply_id} 
                                className={`self-end max-w-[80%] rounded-2xl rounded-tr-sm p-2.5 shadow-sm ${
                                  rep.option_selected === 1 
                                    ? 'bg-emerald-600 text-white' 
                                    : rep.option_selected === 2 
                                    ? 'bg-yellow-600 text-slate-900 font-bold' 
                                    : 'bg-indigo-650 text-white'
                                }`}
                              >
                                <p className="text-[10px] leading-normal">{rep.reply_text}</p>
                                <span className="text-[8px] opacity-60 text-right block font-mono mt-1">
                                  {rep.channel} • {new Date(rep.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Interactive Footer Text bar */}
                        <div className="p-2 bg-slate-800 border-t border-slate-700 flex items-center gap-1.5 shrink-0">
                          <input
                            type="text"
                            placeholder="Type raw response option or message..."
                            value={incomingText}
                            onChange={(e) => setIncomingText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendReply(incomingText)}
                            className="flex-1 bg-slate-900 border border-slate-700/60 rounded-xl px-2.5 py-1.5 text-[10px] text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <button
                            type="button"
                            disabled={submittingReply || !incomingText.trim()}
                            onClick={() => handleSendReply(incomingText)}
                            className="w-7 h-7 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center text-white shrink-0 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Command Simulator Dashboard */}
                    <div className="lg:col-span-5 flex flex-col justify-between space-y-4 font-sans text-xs">
                      <div className="bg-slate-50 border rounded-2xl p-4 space-y-3">
                        <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px] text-slate-500 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Instant Option Triggers
                        </h4>
                        <p className="text-slate-550 leading-relaxed text-[11px]">
                          Click a predetermined response button below to simulate receiving that exact option back from the patient's device instantly.
                        </p>

                        <div className="space-y-2 pt-1.5">
                          <button
                            type="button"
                            disabled={submittingReply}
                            onClick={() => handleSendReply("1")}
                            className="w-full flex items-center justify-between bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 p-2.5 rounded-xl transition text-left cursor-pointer group"
                          >
                            <div>
                              <p className="font-bold text-slate-900 group-hover:text-emerald-700">Refill Meds (Choice 1)</p>
                              <p className="text-[10px] text-slate-400">"I have already refilled my medication"</p>
                            </div>
                            <span className="text-[9px] bg-slate-100 group-hover:bg-emerald-100 text-gray-600 group-hover:text-emerald-700 rounded px-1.5 py-0.5 font-bold font-mono">1</span>
                          </button>

                          <button
                            type="button"
                            disabled={submittingReply}
                            onClick={() => handleSendReply("2")}
                            className="w-full flex items-center justify-between bg-white hover:bg-yellow-50 border border-gray-200 hover:border-yellow-300 p-2.5 rounded-xl transition text-left cursor-pointer group"
                          >
                            <div>
                              <p className="font-bold text-slate-900 group-hover:text-yellow-700">Remind Tomorrow (Choice 2)</p>
                              <p className="text-[10px] text-slate-400">"Remind me tomorrow"</p>
                            </div>
                            <span className="text-[9px] bg-slate-100 group-hover:bg-yellow-100 text-gray-600 group-hover:text-yellow-700 rounded px-1.5 py-0.5 font-bold font-mono">2</span>
                          </button>

                          <button
                            type="button"
                            disabled={submittingReply}
                            onClick={() => handleSendReply("3")}
                            className="w-full flex items-center justify-between bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 p-2.5 rounded-xl transition text-left cursor-pointer group"
                          >
                            <div>
                              <p className="font-bold text-slate-900 group-hover:text-indigo-700">Needs Assistance (Choice 3)</p>
                              <p className="text-[10px] text-slate-400">"I need assistance"</p>
                            </div>
                            <span className="text-[9px] bg-slate-100 group-hover:bg-indigo-100 text-gray-600 group-hover:text-indigo-700 rounded px-1.5 py-0.5 font-bold font-mono">3</span>
                          </button>

                          <button
                            type="button"
                            disabled={submittingReply}
                            onClick={() => handleSendReply("4")}
                            className="w-full flex items-center justify-between bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 p-2.5 rounded-xl transition text-left cursor-pointer group"
                          >
                            <div>
                              <p className="font-bold text-slate-900 group-hover:text-indigo-700">Callback Requested (Choice 4)</p>
                              <p className="text-[10px] text-slate-400">"Call me"</p>
                            </div>
                            <span className="text-[9px] bg-slate-100 group-hover:bg-indigo-100 text-gray-600 group-hover:text-indigo-700 rounded px-1.5 py-0.5 font-bold font-mono">4</span>
                          </button>
                        </div>
                      </div>

                      <div className="bg-emerald-950 text-emerald-200 rounded-2xl p-4 border border-emerald-900 text-[11px] leading-relaxed relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 opacity-10 blur-xs">
                          <Smartphone className="w-24 h-24 stroke-[4px]" />
                        </div>
                        <h5 className="font-extrabold text-white mb-1 uppercase tracking-wider text-[9px]">SaaS Telemetry Rules</h5>
                        <p>
                          Our two-way core logic updates patient parameters in real-time. If choices 3 or 4 are activated, notification warnings are immediately pushed onto the Clinician Overview. If 1 is accepted, the medication cycle resets instantly.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Treatment details card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 border-b pb-3">Prescription &amp; Patient Records</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs font-sans">
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-400">Diagnosis Code:</span>
                        <p className="font-semibold text-gray-800 mt-0.5">{activePatient.chronic_condition}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Medication Brand / Generic:</span>
                        <p className="font-semibold text-gray-800 mt-0.5 text-sm">{med?.medication_name || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-400">Dosage Instructions:</span>
                        <p className="font-semibold text-gray-800 mt-0.5">{med?.dosage || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Preferred Outreach Route:</span>
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase bg-slate-100 px-2 py-0.5 rounded border">
                          {activePatient.preferred_channel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PROGRESS VITALS LOGGING & GRAPHING */}
            {portalTab === 'metrics' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Register vital signs */}
                  <div className="md:col-span-1 space-y-4 border-r border-slate-150/50 pr-4">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Add Progression Vitals</h3>
                    <form onSubmit={submitMetric} className="space-y-4 font-sans text-xs">
                      <div>
                        <label className="block font-semibold text-gray-600 mb-1">General Wellness Feeling</label>
                        <select
                          value={wellnessLevel}
                          onChange={(e) => setWellnessLevel(e.target.value as any)}
                          className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="Great">Great (No issues)</option>
                          <option value="Good">Good (Manageable)</option>
                          <option value="Fair">Fair (Slight symptoms)</option>
                          <option value="Poor">Poor (Struggling today)</option>
                        </select>
                      </div>

                      {/* Diagnostic Condition conditional inputs */}
                      {(activePatient.chronic_condition === 'Hypertension' || activePatient.chronic_condition === 'Other' || activePatient.chronic_condition === 'Heart Failure') && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block font-semibold text-gray-600 mb-1">Sys BP (mmHg)</label>
                            <input
                              type="number"
                              placeholder="e.g. 125"
                              value={systolic}
                              onChange={(e) => setSystolic(e.target.value)}
                              className="w-full bg-white border border-gray-350 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-gray-600 mb-1">Dia BP (mmHg)</label>
                            <input
                              type="number"
                              placeholder="e.g. 80"
                              value={diastolic}
                              onChange={(e) => setDiastolic(e.target.value)}
                              className="w-full bg-white border border-gray-350 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {(activePatient.chronic_condition === 'Diabetes' || activePatient.chronic_condition === 'Other' || activePatient.chronic_condition === 'Chronic Kidney Disease') && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="col-span-1">
                            <label className="block font-semibold text-gray-600 mb-1">glucose (mmol/L)</label>
                            <input
                              type="number"
                              step="0.1"
                              placeholder="e.g. 5.8"
                              value={bloodSugar}
                              onChange={(e) => setBloodSugar(e.target.value)}
                              className="w-full bg-white border border-gray-350 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none font-mono"
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="block font-semibold text-gray-600 mb-1">Reading State</label>
                            <select
                              value={sugarType}
                              onChange={(e) => setSugarType(e.target.value as any)}
                              className="w-full bg-white border border-gray-300 rounded-lg px-1 py-1.5 text-[10px] focus:outline-none focus:ring-1"
                            >
                              <option value="Fasting">Fasting</option>
                              <option value="Random">Random</option>
                              <option value="Post-Meal">Post-Meal</option>
                            </select>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block font-semibold text-gray-600 mb-1">Active Symptoms / Side-Effects</label>
                        <input
                          type="text"
                          placeholder="e.g. chest tightness, mild headache"
                          value={symptoms}
                          onChange={(e) => setSymptoms(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingMetric}
                        className={`w-full text-xs text-white ${getThemeBgClass()} font-bold py-2 rounded-xl transition hover:brightness-105 cursor-pointer`}
                      >
                        {submittingMetric ? 'Saving Log...' : 'Record Wellness Log'}
                      </button>
                    </form>
                  </div>

                  {/* Graphs Panel */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Progression Graphing</h3>
                    
                    {activePatient.chronic_condition === 'Hypertension' && renderBPChart()}
                    {activePatient.chronic_condition === 'Diabetes' && renderSugarChart()}
                    
                    {activePatient.chronic_condition !== 'Hypertension' && activePatient.chronic_condition !== 'Diabetes' && (
                      <div className="space-y-4">
                        <p className="text-[11px] text-slate-500 font-sans">
                          Plotting symptom check-in wellness levels for <strong>{activePatient.chronic_condition}</strong>.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          {metrics.slice(0, 4).map((m, idx) => (
                            <div key={idx} className="bg-slate-50 border p-3.5 rounded-xl font-sans text-xs">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-gray-800">State: {m.wellness_level}</span>
                                <span className="text-[10px] text-gray-400">{new Date(m.logged_date).toLocaleDateString()}</span>
                              </div>
                              <p className="text-[11px] text-gray-500">Symptoms: {m.symptoms || "None reported"}</p>
                              {m.blood_sugar && <p className="text-[10px] text-violet-600 font-mono mt-1">Glucose: {m.blood_sugar} mmol/L</p>}
                              {m.systolic_bp && <p className="text-[10px] text-rose-600 font-mono mt-1">BP: {m.systolic_bp}/{m.diastolic_bp} mmHg</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* TAB 3: CLINICIAN APPOINTMENTS BOOKING */}
            {portalTab === 'appointments' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Booking Request Form */}
                    <div className="md:col-span-1 space-y-4 border-r pr-4 border-slate-150/50">
                      <h3 className="text-sm font-bold text-slate-800">Book Appointment</h3>
                      <form onSubmit={submitAppointment} className="space-y-3 text-xs font-sans">
                        <div>
                          <label className="block font-semibold text-gray-600 mb-1">Medical Specialist</label>
                          <select
                            value={doctorName}
                            onChange={(e) => setDoctorName(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2"
                          >
                            <option value="Dr. Sarah Mukasa">Dr. Sarah Mukasa (Pharmacist In-Charge)</option>
                            <option value="Clinical Officer John Opio">John Opio (Clinical Officer)</option>
                            <option value="Sister Juliet Namara">Juliet Namara (Registered Nurse)</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block font-semibold text-gray-600 mb-1">Select Date</label>
                            <input
                              type="date"
                              required
                              value={aptDate}
                              onChange={(e) => setAptDate(e.target.value)}
                              className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1.5"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-gray-600 mb-1">Pick Time</label>
                            <input
                              type="time" 
                              required
                              value={aptTime}
                              onChange={(e) => setAptTime(e.target.value)}
                              className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1.5"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold text-gray-600 mb-1">Symptom Summary / Reason</label>
                          <textarea
                            required
                            placeholder="Describe reasons: medication refill reconciliation, BP review, dizziness side effects..."
                            value={aptReason}
                            onChange={(e) => setAptReason(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 h-20 outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={submittingApt}
                          className={`w-full text-xs text-white ${getThemeBgClass()} font-bold py-2 rounded-xl transition hover:brightness-105 cursor-pointer`}
                        >
                          {submittingApt ? 'Booking Request...' : 'Submit Request'}
                        </button>
                      </form>
                    </div>

                    {/* Bookings status dashboard */}
                    <div className="md:col-span-2 space-y-4">
                      <h3 className="text-sm font-bold text-slate-800">Your Appointment History</h3>
                      
                      {appointments.length === 0 ? (
                        <div className="p-8 bg-slate-50 border border-dashed rounded-xl text-center text-gray-400 text-xs">
                          <Calendar className="w-8 h-8 opacity-40 mx-auto mb-1 text-indigo-500" />
                          <p className="font-semibold text-slate-600">No scheduled appointments logged</p>
                          <p className="text-[10px] mt-0.5">Your bookings will appear here as soon as they are requested.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {appointments.map((a, idx) => (
                            <div key={idx} className="bg-slate-50 border border-slate-150/70 p-4 rounded-xl font-sans text-xs flex justify-between items-start">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-800">{a.doctor_name}</span>
                                  <span className="text-[10px] text-gray-400 border bg-white px-2 py-0.5 rounded-full font-semibold">
                                    {a.status}
                                  </span>
                                </div>
                                <p className="text-gray-500 font-medium">Reason: {a.reason}</p>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{new Date(a.appointment_date).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CLINICAL CONSULTATIONS AND ADVICE ROOM */}
            {portalTab === 'consult' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Ask symptom query form */}
                    <div className="md:col-span-1 space-y-4 border-r pr-4 border-slate-150/50">
                      <h3 className="text-sm font-bold text-slate-800">Consult Clinical Doctor</h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                        Submit clinical questions regarding skipped doses, new physiological symptoms, diet integrations, or side effects. The clinical pharmacist will review your question.
                      </p>
                      
                      <form onSubmit={submitConsultation} className="space-y-3 text-xs font-sans mt-2">
                        <div>
                          <label className="block font-semibold text-gray-600 mb-1">Your Question</label>
                          <textarea
                            required
                            placeholder="e.g. I forgotten my medication package at home while visiting relatives. Should I rush to buy a temporary dose, or skip until I head back on Monday?"
                            value={consultQuestion}
                            onChange={(e) => setConsultQuestion(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 h-40 outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={submittingConsult}
                          className={`w-full text-xs text-white ${getThemeBgClass()} font-bold py-2 rounded-xl transition hover:brightness-105 cursor-pointer flex items-center justify-center gap-1.5`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          {submittingConsult ? 'Sending Question...' : 'Send Question'}
                        </button>
                      </form>
                    </div>

                    {/* consultations Conversation feeds */}
                    <div className="md:col-span-2 space-y-4">
                      <h3 className="text-sm font-bold text-slate-800">Q&amp;A Clinical Log</h3>

                      {consultations.length === 0 ? (
                        <div className="p-8 bg-slate-50 border border-dashed rounded-xl text-center text-gray-400 text-xs">
                          <MessageSquare className="w-8 h-8 opacity-40 mx-auto mb-1.5 text-blue-500" />
                          <p className="font-semibold text-slate-600">No consultations logged</p>
                          <p className="text-[10px] mt-0.5">Submit a medical question to start chatting securely with specialists.</p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                          {consultations.map((c, idx) => (
                            <div key={idx} className="bg-slate-50 border border-slate-150 rounded-xl p-4 font-sans text-xs space-y-3">
                              
                              {/* Patient Question */}
                              <div className="flex items-start gap-2">
                                <span className="bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded text-[10px]">Q</span>
                                <div className="space-y-0.5">
                                  <p className="text-[10px] text-slate-400">Asked on {new Date(c.created_at).toLocaleString()}</p>
                                  <p className="font-medium text-slate-800 leading-relaxed">{c.question}</p>
                                </div>
                              </div>

                              {/* Doctor Answer */}
                              {c.answer ? (
                                <div className="bg-teal-50 border border-teal-150 rounded-lg p-3 flex items-start gap-2">
                                  <span className="bg-teal-600 text-white font-bold px-1.5 py-0.5 rounded text-[10px] shrink-0">A</span>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1">
                                      <span className="font-bold text-teal-900 text-[11px]">Specialist Response</span>
                                      <span className="text-[9px] text-teal-600">({new Date(c.answered_at!).toLocaleDateString()})</span>
                                    </div>
                                    <p className="text-slate-700 leading-relaxed">{c.answer}</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-3 bg-amber-50 text-amber-800 border border-amber-100 rounded-lg text-[11px] font-medium flex items-center gap-1.5 animate-pulse">
                                  <span className="h-2 w-2 rounded-full bg-amber-500 inline-block"></span>
                                  Awaiting clinical officer response...
                                </div>
                              )}

                            </div>
                          ))}
                        </div>
                      )}

                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: REMINDERS OUTREACH FEEDBACK */}
            {portalTab === 'feedback' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* feedback submission */}
                    <div className="md:col-span-1 space-y-4 border-r pr-4 border-slate-150/50">
                      <h3 className="text-sm font-bold text-slate-800 font-sans">outreach Service Feedback</h3>
                      <p className="text-[11px] text-slate-450 leading-relaxed font-sans">
                        Let us know how we can improve the chronic refill SMS/WhatsApp outreach. Your feedback helps fine-tune interval alerts and secure better local transport logistics for medicine collections.
                      </p>

                      <form onSubmit={submitFeedback} className="space-y-3 text-xs font-sans mt-3">
                        <div>
                          <label className="block font-semibold text-gray-600 mb-1">Refill Outreach Rating</label>
                          <div className="flex gap-1.5 pt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setFbRating(star)}
                                className="cursor-pointer"
                              >
                                <Star className={`w-6 h-6 ${star <= fbRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold text-gray-600 mb-1">Feedback Category</label>
                          <select
                            value={fbCategory}
                            onChange={(e) => setFbCategory(e.target.value as any)}
                            className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2"
                          >
                            <option value="Reminders">Reminders (SMS Interval Timing)</option>
                            <option value="Refills">Refills &amp; Packaging</option>
                            <option value="Pharmacy Service">Pharmacy Counter Service</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-gray-600 mb-1">Comments</label>
                          <textarea
                            required
                            placeholder="Help our staff improve: 'The texts are highly helpful, but can you send it at 9 AM instead of 8 AM?'"
                            value={fbComment}
                            onChange={(e) => setFbComment(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 h-24 outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={submittingFeedback}
                          className={`w-full text-xs text-white ${getThemeBgClass()} font-bold py-2 rounded-xl transition hover:brightness-105 cursor-pointer`}
                        >
                          {submittingFeedback ? 'Submitting Feedback...' : 'Post Service Feedback'}
                        </button>
                      </form>
                    </div>

                    {/* feedback comments feed */}
                    <div className="md:col-span-2 space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 font-sans">Your Feedback History</h3>

                      {feedbacks.length === 0 ? (
                        <div className="p-8 bg-slate-50 border border-dashed rounded-xl text-center text-gray-400 text-xs">
                          <Star className="w-8 h-8 opacity-40 mx-auto mb-1.5 text-amber-400" />
                          <p className="font-semibold text-slate-600">No previous feedback logged</p>
                          <p className="text-[10px] mt-0.5">Please share your rating on the left side to help improve Kampala clinical staff operations.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {feedbacks.map((f, idx) => (
                            <div key={idx} className="bg-slate-50 border border-slate-150/70 p-4 rounded-xl font-sans text-xs">
                              <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-1.5">
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star key={star} className={`w-3.5 h-3.5 ${star <= f.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                    ))}
                                  </div>
                                  <span className="text-[10px] uppercase font-bold bg-white text-indigo-700 border px-2 py-0.5 rounded-full scale-90">
                                    {f.category}
                                  </span>
                                </div>
                                <span className="text-[10px] text-gray-400">{new Date(f.created_at).toLocaleDateString()}</span>
                              </div>
                              <p className="text-slate-700 italic">"{f.comment}"</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
