import React, { useState, useEffect } from 'react';
import { Patient, Medication, ProgressMetric } from '../types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Plus, 
  Heart, 
  Activity, 
  Clock, 
  Check, 
  TrendingUp, 
  Search, 
  Eye 
} from 'lucide-react';

interface VitalsProgressTrackerProps {
  patients: (Patient & { medication: Medication | null })[];
  pharmacyId: string;
  onRefreshData: () => Promise<void>;
  showToast: (msg: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export default function VitalsProgressTracker({
  patients,
  pharmacyId,
  onRefreshData,
  showToast
}: VitalsProgressTrackerProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [metricsList, setMetricsList] = useState<ProgressMetric[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  
  // Vitals form entries
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');
  const [sugarType, setSugarType] = useState<'Fasting' | 'Random' | 'Post-Meal'>('Fasting');
  const [wellnessLevel, setWellnessLevel] = useState<'Great' | 'Good' | 'Fair' | 'Poor'>('Good');
  const [symptoms, setSymptoms] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search filter
  const [patQuery, setPatQuery] = useState('');

  // active patient
  const activePatient = patients.find(p => p.patient_id === selectedPatientId);

  // Load vitals history
  const loadVitalsHistory = async (patId: string) => {
    if (!patId) return;
    setLoadingMetrics(true);
    try {
      const res = await fetch(`/api/progress-metrics?patient_id=${patId}`);
      if (res.ok) {
        setMetricsList(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    if (selectedPatientId) {
      loadVitalsHistory(selectedPatientId);
    }
  }, [selectedPatientId]);

  // Default patient on mount
  useEffect(() => {
    const activePats = patients.filter(p => p.status === 'Active');
    if (activePats.length > 0 && !selectedPatientId) {
      setSelectedPatientId(activePats[0].patient_id);
    }
  }, [patients]);

  const handleLogVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    setIsSubmitting(true);
    try {
      const payload = {
        patient_id: selectedPatientId,
        systolic_bp: systolic ? Number(systolic) : undefined,
        diastolic_bp: diastolic ? Number(diastolic) : undefined,
        blood_sugar: bloodSugar ? Number(bloodSugar) : undefined,
        sugar_type: sugarType,
        wellness_level: wellnessLevel,
        symptoms: symptoms || undefined
      };

      const res = await fetch('/api/progress-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast("Vitals Registered", `Health data successfully logged for ${activePatient?.full_name}.`, 'success');
        await loadVitalsHistory(selectedPatientId);
        // Reset form
        setSystolic('');
        setDiastolic('');
        setBloodSugar('');
        setSymptoms('');
        onRefreshData();
      } else {
        const data = await res.json();
        showToast("Error", data.error || "Unable to commit vitals record.", "error");
      }
    } catch (err) {
      showToast("Error", "Check-in failed because of clinical network issue.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPatientList = patients.filter(p => 
    p.full_name.toLowerCase().includes(patQuery.toLowerCase()) || 
    p.chronic_condition.toLowerCase().includes(patQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Left Patient Lookup Column - Bento Selection Card */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
        <div className="space-y-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Search Care Cohorts</h3>
          <p className="text-[11px] text-gray-500">Pick the patient folder to record vitals check-ins:</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/20 border border-gray-150 dark:border-slate-850 px-3 py-2 rounded-xl">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search patients..."
            value={patQuery}
            onChange={(e) => setPatQuery(e.target.value)}
            className="bg-transparent border-0 text-xs w-full focus:outline-none text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1">
          {filteredPatientList.map(p => {
            const active = p.patient_id === selectedPatientId;
            return (
              <button
                key={p.patient_id}
                onClick={() => setSelectedPatientId(p.patient_id)}
                className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between border ${
                  active 
                    ? 'bg-brand-green/10 border-brand-green/30 text-brand-green' 
                    : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-950/20'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">{p.full_name}</h4>
                  <span className="text-[10px] text-slate-400 block font-mono">{p.chronic_condition}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Middle Check-In Vitals Intake Form */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-brand-green">
          <Activity className="w-5 h-5" />
          <h3 className="font-bold text-sm">Vitals Record Check-in</h3>
        </div>

        {activePatient ? (
          <form onSubmit={handleLogVitals} className="space-y-4">
            <div className="text-xs font-mono bg-slate-50 dark:bg-slate-950/30 p-2.5 rounded-xl">
              Patient: <span className="font-black text-brand-green">{activePatient.full_name}</span><br />
              Chronic Diagnosis: <span className="font-bold">{activePatient.chronic_condition}</span>
            </div>

            {/* Blood Pressure Inputs */}
            {(activePatient.chronic_condition === 'Hypertension' || activePatient.chronic_condition === 'Heart Failure' || activePatient.chronic_condition === 'Other') && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Cardiovascular Pressure (BP)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 font-bold font-mono">Systolic (mmHg)</span>
                    <input 
                      type="number" 
                      placeholder="e.g. 120"
                      value={systolic}
                      onChange={(e) => setSystolic(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950/20 border border-gray-200 dark:border-slate-800 rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 font-bold font-mono">Diastolic (mmHg)</span>
                    <input 
                      type="number" 
                      placeholder="e.g. 80"
                      value={diastolic}
                      onChange={(e) => setDiastolic(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950/20 border border-gray-200 dark:border-slate-800 rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Blood Sugar Inputs */}
            {(activePatient.chronic_condition === 'Diabetes' || activePatient.chronic_condition === 'Other') && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Blood Sugar Concentration</label>
                  <input 
                    type="number" 
                    step="0.1"
                    placeholder="e.g. 5.8 (mmol/L or mg/dL)"
                    value={bloodSugar}
                    onChange={(e) => setBloodSugar(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/20 border border-gray-200 dark:border-slate-800 rounded-lg p-2 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold">Intake Stage Type</span>
                  <select
                    value={sugarType}
                    onChange={(e: any) => setSugarType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/20 border border-gray-200 dark:border-slate-800 rounded-lg p-2 text-xs"
                  >
                    <option value="Fasting">Fasting</option>
                    <option value="Random">Random</option>
                    <option value="Post-Meal">Post-Meal</option>
                  </select>
                </div>
              </div>
            )}

            {/* Overall Level Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Current Adhesion/Wellness Level</label>
              <select
                value={wellnessLevel}
                onChange={(e: any) => setWellnessLevel(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/20 border border-gray-200 dark:border-slate-800 rounded-lg p-2 text-xs"
              >
                <option value="Great">Great (Feeling completely healthy)</option>
                <option value="Good">Good (Feeling normal)</option>
                <option value="Fair">Fair (Mild symptoms/discomfort)</option>
                <option value="Poor">Poor (Crucial clinic feedback is needed)</option>
              </select>
            </div>

            {/* Symptoms Comments */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Associated Symptoms / Clinical Notes</label>
              <textarea 
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Type symptoms or notes e.g., headaches, fatigue..."
                className="w-full bg-slate-50 dark:bg-slate-950/20 border border-gray-200 dark:border-slate-800 rounded-lg p-2 text-xs h-16 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-green hover:bg-brand-green-hover text-white rounded-xl py-2.5 px-4 text-xs font-black w-full shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{isSubmitting ? 'Logging...' : 'Register Health Vitals'}</span>
            </button>
          </form>
        ) : (
          <p className="text-xs text-gray-400 italic">Please select an active patient from the left column first.</p>
        )}
      </div>

      {/* Right Vitals Charts History Plots */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4 col-span-1">
        <div className="space-y-0.5">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-405">Indicators Log File</h3>
          <p className="text-[10px] text-gray-450 leading-tight">Historical clinical trends of {activePatient?.full_name || 'Sarah'}:</p>
        </div>

        {loadingMetrics ? (
          <p className="text-xs text-gray-500 italic block py-4 text-center">Reading historical medical charts...</p>
        ) : metricsList.length === 0 ? (
          <div className="py-12 text-center text-gray-405 text-xs font-serif italic">
            No vitals history or check-ins logged for this patient yet. Use the intake desk to submit a fresh record!
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* BP Trend Chart with Recharts if Hypertension */}
            {metricsList.some(m => m.systolic_bp) && (
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Blood Pressure Trend (mmHg)</span>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metricsList}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="logged_date" tick={false} />
                      <YAxis domain={['dataMin - 10', 'dataMax + 10']} tick={{ fontSize: 9 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="systolic_bp" stroke="#e11d48" strokeWidth={2} name="Systolic" dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="diastolic_bp" stroke="#2563eb" strokeWidth={2} name="Diastolic" dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Glucose Trend Chart with Recharts if Diabetes */}
            {metricsList.some(m => m.blood_sugar) && (
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Blood Sugar Levels (mmol/L)</span>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metricsList}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="logged_date" tick={false} />
                      <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 9 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="blood_sugar" stroke="#059669" strokeWidth={2.5} name="Glucose" dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Simple listed readings list as feedback */}
            <div className="space-y-2 border-t border-gray-100 dark:border-slate-800 pt-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Recent Consult Logbook</span>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {metricsList.slice(0, 4).map((item, idx) => (
                  <div key={item.metric_id || idx} className="bg-slate-50 dark:bg-slate-950/20 p-2 rounded-xl text-[11px] leading-tight flex justify-between items-start gap-2">
                    <div>
                      <p className="font-bold text-gray-800 dark:text-gray-200">Wellness: {item.wellness_level}</p>
                      {item.symptoms && <p className="text-[10px] text-gray-500 italic mt-0.5">"{item.symptoms}"</p>}
                    </div>
                    <span className="text-[9px] text-gray-400 font-mono shrink-0">
                      {new Date(item.logged_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}

// Chevron helper
function ChevronRight(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
