import React, { useState } from 'react';
import { 
  Sparkles, 
  PhoneCall, 
  TrendingUp, 
  CreditCard, 
  BarChart3, 
  Languages, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Plus, 
  ShieldAlert, 
  Flame, 
  MessageSquare,
  BookmarkCheck,
  Check,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

interface Patient {
  patient_id: string;
  full_name: string;
  condition: string;
  preferred_channel: string;
  recommendedAction?: string;
  risk?: 'High' | 'Medium' | 'Low';
}

interface MvpRoadmapProps {
  patients?: Patient[];
  showToast: (msg: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export default function MvpRoadmap({ patients = [], showToast }: MvpRoadmapProps) {
  // Navigation active tab inside the Suite panel
  const [activeRoadmapSubTab, setActiveRoadmapSubTab] = useState<'voice' | 'messages' | 'risk' | 'payments' | 'forecasting' | 'alerts' | 'reports'>('voice');

  // Voice Reminders Select Language, logs & custom additions
  const [voiceLang, setVoiceLang] = useState<'Luganda' | 'English' | 'Swahili'>('Luganda');
  const [voiceLogs, setVoiceLogs] = useState([
    { id: 'v-1', patient: 'Peter Wanyama', language: 'Luganda', result: 'Answered', time: '10:14 AM' },
    { id: 'v-2', patient: 'Grace Nakamya', language: 'English', result: 'Missed', time: '11:30 AM' },
    { id: 'v-3', patient: 'Mary Achiro', language: 'Swahili', result: 'Failed', time: '02:15 PM' }
  ]);
  const [customVoiceName, setCustomVoiceName] = useState('');
  const [customVoicePhone, setCustomVoicePhone] = useState('');

  // AI Personalized Messages State & approved message archives
  const [selectedAIPatient, setSelectedAIPatient] = useState('Grace Nakamya');
  const [aiDraftMessage, setAIDraftMessage] = useState(
    "Hi Grace, just a gentle nudge from City Pharmacy — your Metformin refill is ready whenever you can stop by. We're here if you need anything. Take care!"
  );
  const [aiCondition, setAICondition] = useState('Diabetes');
  const [aiSelectedLang, setAISelectedLang] = useState('Luganda');
  const [generationCount, setGenerationCount] = useState(1);
  const [approvedMessages, setApprovedMessages] = useState<{id: string, name: string, condition: string, language: string, message: string, approvedAt: string}[]>([]);

  // AI Risk Predictions State & custom input states
  const [riskList, setRiskList] = useState([
    { id: 'r-1', name: 'Grace Nakamya', risk: 'High', action: 'Call patient', condition: 'Diabetes', state: 'Pending Action' },
    { id: 'r-2', name: 'Peter Wanyama', risk: 'Medium', action: 'Extra reminder', condition: 'Hypertension', state: 'Pending Action' },
    { id: 'r-3', name: 'Mary Achiro', risk: 'Medium', action: 'Notify caregiver', condition: 'Asthma', state: 'Pending Action' },
    { id: 'r-4', name: 'Samuel Okello', risk: 'Low', action: 'No action needed', condition: 'HIV/ARV', state: 'Compliant' }
  ]);
  const [newRiskPatientName, setNewRiskPatientName] = useState('');
  const [newRiskCondition, setNewRiskCondition] = useState('');
  const [newRiskLevel, setNewRiskLevel] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newRiskAction, setNewRiskAction] = useState('Call patient');

  // Payments & subscriptions State & custom invoicing input fields
  const [selectedPaymentRail, setSelectedPaymentRail] = useState<'MTN' | 'Airtel' | 'Visa' | 'Mastercard'>('MTN');
  const [paymentPhone, setPaymentPhone] = useState('+256 772 123 456');
  const [paymentCardNum, setPaymentCardNum] = useState('4000 1234 5678 9010');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  
  const [invoices, setInvoices] = useState([
    { id: 'INV-2026-06', period: 'June 2026', amount: 'UGX 150,000', status: 'Paid', method: 'MTN MoMo' },
    { id: 'INV-2026-05', period: 'May 2026', amount: 'UGX 150,000', status: 'Paid', method: 'Visa Card' }
  ]);
  const [newInvoiceCodeExtra, setNewInvoiceCodeExtra] = useState('INV-2026-07');
  const [newInvoicePeriod, setNewInvoicePeriod] = useState('July 2026');
  const [newInvoiceAmount, setNewInvoiceAmount] = useState('UGX 150,050');

  // Stock runout forecasting state & custom inventory fields
  const [stockForecasts, setStockForecasts] = useState([
    { id: 'st-1', medName: 'Metformin 850mg', currentStock: 45, consumptionRate: 3.5, forecastDays: 12, risk: 'High Risk' },
    { id: 'st-2', medName: 'Amlodipine 10mg', currentStock: 120, consumptionRate: 4.2, forecastDays: 28, risk: 'Medium Risk' },
    { id: 'st-3', medName: 'Salbutamol Inhaler', currentStock: 12, consumptionRate: 1.1, forecastDays: 10, risk: 'High Risk' },
    { id: 'st-4', medName: 'Tenofovir Cohort', currentStock: 340, consumptionRate: 8.9, forecastDays: 38, risk: 'Safe' }
  ]);
  const [newStockMedName, setNewStockMedName] = useState('');
  const [newStockUnits, setNewStockUnits] = useState('80');
  const [newStockDailyRate, setNewStockDailyRate] = useState('4');

  // AI Alerts Queue State & custom alerts entries
  const [aiAlerts, setAiAlerts] = useState([
    { id: 'alert-1', patient: 'Mary Achiro', reason: 'Missed 3 consecutive SMS alerts', severity: 'High Alert', dispatched: 'Caregiver alerted via SMS code.' },
    { id: 'alert-2', patient: 'Peter Wanyama', reason: 'Risk model flagged 65% delay', severity: 'Medium Alert', dispatched: 'Standard dial queue injected.' },
    { id: 'alert-3', patient: 'Grace Nakamya', reason: 'Voice call feedback flagged: Out of Transport costs', severity: 'High Alert', dispatched: 'Assigned Courier Delivery consultation.' }
  ]);
  const [newAlertPatientName, setNewAlertPatientName] = useState('');
  const [newAlertSeverity, setNewAlertSeverity] = useState('High Alert');
  const [newAlertReason, setNewAlertReason] = useState('');

  // Wipe preseeded data to start fresh instantly
  const handleClearAllPreloadedData = () => {
    setVoiceLogs([]);
    setRiskList([]);
    setInvoices([]);
    setStockForecasts([]);
    setAiAlerts([]);
    setApprovedMessages([]);
    showToast("Data Purged Successfully", "All preloaded demo registers have been wiped out. Ready for your manual inputs!", "success");
  };

  // Handle voice call trigger action
  const handleSimulateVoiceCall = (patientName: string, selectedLangOption: string) => {
    showToast(
      "Dialing Voice Remind Node",
      `Initiating computerized voice dispatch to ${patientName} in dialect ${selectedLangOption}...`,
      "info"
    );

    setTimeout(() => {
      const results = ['Answered', 'Missed', 'Failed'];
      const pickedResult = results[Math.floor(Math.random() * results.length)];
      
      const newLog = {
        id: `v-${Date.now()}`,
        patient: patientName,
        language: selectedLangOption,
        result: pickedResult,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setVoiceLogs(prev => [newLog, ...prev]);

      if (pickedResult === 'Answered') {
        showToast("Voice Call Successed", `${patientName} answered and confirmed compliance. Refills armed!`, "success");
      } else {
        showToast("Voice Call Signal", `${patientName} missed or failed the automated Dial alert.`, "error");
      }
    }, 2200);
  };

  // Handle message approve action
  const handleApproveDraft = () => {
    const newApproved = {
      id: `appr-${Date.now()}`,
      name: selectedAIPatient,
      condition: aiCondition,
      language: aiSelectedLang,
      message: aiDraftMessage,
      approvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setApprovedMessages(prev => [newApproved, ...prev]);

    showToast(
      "Draft Approved & Dispatched", 
      `AI personalized message approved for ${selectedAIPatient}. Refill schedule armed via preferred channel.`, 
      "success"
    );
  };

  // Handle message regenerate action with rich model simulated spins
  const handleRegenerateDraft = () => {
    const greetings = [
      `Hi ${selectedAIPatient}, City Pharmacy values you. Just a friendly check-in about your ${aiCondition} refill. Let us know Luganda support needs!`,
      `Hello ${selectedAIPatient}, your ${aiCondition} therapy pack is ready for collection at City Pharmacy plot 14. We are keeping it fresh for you!`,
      `Webale nnyo ${selectedAIPatient}! Just a polite note from City Pharmacy — your Metformin is ready. Safe journey coming for the pickup.`
    ];
    
    setAIDraftMessage(greetings[generationCount % greetings.length]);
    setGenerationCount(prev => prev + 1);
    showToast("AI Regenerated Draft", `Spun adherence message (Luganda Translation checked).`, "info");
  };

  // Handle Risk level action trigger
  const handleRiskAction = (riskId: string, patientName: string, recommendedAction: string) => {
    showToast("Action Executed", `${recommendedAction} logged securely for ${patientName}.`, "success");
    setRiskList(prev => prev.map(r => r.id === riskId ? { ...r, state: 'Action Logged ✓' } : r));
  };

  // Handle subscription invoice payment simulations
  const handlePayInvoice = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setShowPaymentModal(false);

      const nextID = `INV-2026-0${7 + invoices.length}`;
      const newInvoice = {
        id: nextID,
        period: 'Upcoming Refill Cycle SaaS',
        amount: 'UGX 150,000',
        status: 'Paid',
        method: selectedPaymentRail === 'MTN' ? 'MTN MoMo' : selectedPaymentRail === 'Airtel' ? 'Airtel Money' : 'Visa Debit'
      };

      setInvoices(prev => [newInvoice, ...prev]);
      showToast("Subscription Paid Successfully", `${newInvoice.id} processed via East Africa local financial nodes!`, "success");
    }, 2500);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-150 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3.5 bg-brand-accent-bg text-brand-green rounded-2xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-[#84CC16]/10 text-[#71B20A] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider border border-[#84CC16]/20">East Africa Module</span>
              <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 font-sans tracking-tight">CareRefill Suite Operations Hub ⚡</h3>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Analyze stock forecasts, configure voice dialers, review AI personalized message drafts, process mobile payouts, and run advanced compliance logs.
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <button
            onClick={handleClearAllPreloadedData}
            className="w-full md:w-auto bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-150 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-3xs"
          >
            Clear Preloaded Data 🪣
          </button>
        </div>
      </div>

      {/* Ribbon Roadmap Subtabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 dark:bg-[#1e293b]/45 p-1 rounded-2xl border border-gray-100 dark:border-slate-800">
        {[
          { id: 'voice', label: 'Voice Call Reminders 📞', icon: PhoneCall },
          { id: 'messages', label: 'AI Messages Desk ✉️', icon: MessageSquare },
          { id: 'alerts', label: 'AI Alerts Hub ⚠️', icon: AlertTriangle },
          { id: 'risk', label: 'AI Risk Index 🛡️', icon: ShieldAlert },
          { id: 'forecasting', label: 'Inventory Forecasting 📈', icon: TrendingUp },
          { id: 'reports', label: 'Compliance Reports 📊', icon: BarChart3 }
        ].map((tab) => {
          const isSelected = activeRoadmapSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveRoadmapSubTab(tab.id as any)}
              className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-brand-green text-white shadow-3xs'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-150 hover:bg-white/80 dark:hover:bg-slate-900'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ROADMAP SECTION VIEWS */}
      <div className="pt-2">

        {/* Phase 11: Voice call reminders */}
        {activeRoadmapSubTab === 'voice' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            <div className="md:col-span-4 bg-slate-50 dark:bg-slate-950/20 p-5 rounded-3xl border border-gray-100 dark:border-slate-850 space-y-4">
              <div>
                <span className="text-[9px] font-black uppercase text-gray-400 block tracking-wider">Telecom Dial Node</span>
                <h4 className="text-sm font-black text-gray-800 dark:text-gray-200 mt-0.5">Automated voice reminders for patients without smartphone access.</h4>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Select Language Dialect</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['English', 'Luganda', 'Swahili'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setVoiceLang(lang as any)}
                        className={`p-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                          voiceLang === lang 
                            ? 'bg-brand-green text-white' 
                            : 'bg-white dark:bg-slate-900 text-gray-500 border border-gray-150 dark:border-slate-800 hover:bg-gray-50'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Instant Quick-Trigger Options</label>
                  <div className="space-y-1.5">
                    {[
                      { name: 'Peter Wanyama', phone: '+256 701 445 221' },
                      { name: 'Grace Nakamya', phone: '+256 772 901 024' },
                      { name: 'Mary Achiro', phone: '+256 752 148 990' }
                    ].map((p) => (
                      <button
                        key={p.name}
                        onClick={() => handleSimulateVoiceCall(p.name, voiceLang)}
                        className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-brand-green p-2 text-xs font-semibold rounded-xl text-left hover:bg-lime-50/20 text-gray-700 dark:text-gray-300 flex items-center justify-between group"
                      >
                        <div>
                          <p className="font-extrabold">{p.name}</p>
                          <p className="text-[9px] text-gray-400 font-mono">{p.phone}</p>
                        </div>
                        <PhoneCall className="w-3.5 h-3.5 text-gray-450 group-hover:text-brand-green shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 border-t border-gray-150 dark:border-slate-800 pt-3 text-left">
                  <label className="text-[10px] font-black uppercase text-gray-400 block pb-1">Dial Custom Mobile Numbers</label>
                  <div className="space-y-2">
                    <input 
                      type="text"
                      placeholder="Patient Full Name"
                      value={customVoiceName}
                      onChange={(e) => setCustomVoiceName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850 text-xs p-2.5 rounded-xl font-medium focus:outline-none focus:border-[#84CC16]"
                    />
                    <input 
                      type="text"
                      placeholder="Phone Number (+256...)"
                      value={customVoicePhone}
                      onChange={(e) => setCustomVoicePhone(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850 text-xs p-2.5 rounded-xl font-mono font-medium focus:outline-none focus:border-[#84CC16]"
                    />
                    <button
                      onClick={() => {
                        if (!customVoiceName.trim()) {
                          showToast("Validation Warning", "Please write the patient's name to dial.", "error");
                          return;
                        }
                        handleSimulateVoiceCall(customVoiceName, voiceLang);
                        setCustomVoiceName('');
                        setCustomVoicePhone('');
                      }}
                      className="w-full bg-[#84CC16] hover:bg-[#71B20A] text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Trigger Custom Outbound Dial</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-8 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-850 space-y-4">
              <h5 className="text-xs font-black uppercase tracking-wider text-gray-400">Voice Dial Transcripts Logs Archive</h5>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-150 dark:border-slate-850 text-gray-400 font-extrabold uppercase text-[9px]">
                      <th className="pb-2">Patient</th>
                      <th className="pb-2">Language</th>
                      <th className="pb-2">Call-Time</th>
                      <th className="pb-2 text-right">Dial Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-slate-850">
                    {voiceLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/30">
                        <td className="py-3 font-extrabold text-gray-800 dark:text-gray-200">{log.patient}</td>
                        <td className="py-3 text-gray-500 font-semibold">{log.language}</td>
                        <td className="py-3 text-gray-400 font-mono">{log.time}</td>
                        <td className="py-3 text-right">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide ${
                            log.result === 'Answered' 
                              ? 'bg-lime-50 text-[#71B20A] border border-lime-150' 
                              : log.result === 'Missed' 
                              ? 'bg-amber-50 text-amber-700 border border-amber-150' 
                              : 'bg-rose-50 text-rose-700 border border-rose-150'
                          }`}>
                            {log.result}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Phase 12: AI personalized messages */}
        {activeRoadmapSubTab === 'messages' && (
          <div className="space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 bg-slate-50 dark:bg-slate-950/20 p-5 rounded-3xl border border-gray-100 dark:border-slate-850 space-y-4">
              <div>
                <span className="text-[9px] font-black uppercase text-gray-400 block tracking-wider">AI Tailor Crafting</span>
                <h4 className="text-sm font-black text-gray-800 dark:text-gray-200 mt-0.5">Drafts friendly, adherence-focused messages for staff to review before sending.</h4>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Select Patient Profile</label>
                  <select
                    value={selectedAIPatient}
                    onChange={(e) => {
                      const name = e.target.value;
                      setSelectedAIPatient(name);
                      if (name === 'Grace Nakamya') {
                        setAICondition('Diabetes');
                        setAIDraftMessage("Hi Grace, just a gentle nudge from City Pharmacy — your Metformin refill is ready whenever you can stop by. We're here if you need anything. Take care!");
                      } else if (name === 'Peter Wanyama') {
                        setAICondition('Hypertension');
                        setAIDraftMessage("Hello Peter, hope you are feeling energetic. Just checking in about your Losartan refills at City Pharmacy Kampala road branch. Drop by!");
                      } else {
                        setAICondition('Asthma');
                        setAIDraftMessage("Dear Mary, friendly greetings from City Pharmacy. Your Salbutamol inhaler is ready for delivery or pick up. Adherence is energy! Webale.");
                      }
                    }}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-xs text-gray-700 dark:text-gray-300 p-2.5 rounded-xl font-bold cursor-pointer"
                  >
                    <option value="Grace Nakamya">Grace Nakamya · Diabetes</option>
                    <option value="Peter Wanyama">Peter Wanyama · Hypertension</option>
                    <option value="Mary Achiro">Mary Achiro · Asthma</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-gray-100 block">
                    <span className="text-[9px] text-gray-400 block font-bold leading-none">THERAPY TYPE</span>
                    <span className="text-[11px] font-mono font-black text-brand-green uppercase">{aiCondition}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-gray-100 block">
                    <span className="text-[9px] text-gray-400 block font-bold leading-none">DIALECT CHOSEN</span>
                    <span className="text-[11px] font-mono font-black text-lime-700 uppercase">{aiSelectedLang}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 bg-[#F4FCE3]/40 dark:bg-slate-950/20 p-6 rounded-3xl border border-lime-150/40 dark:border-slate-850 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#71B20A] uppercase tracking-wider">AI Generated Draft Template</span>
                <span className="text-[9px] font-mono text-gray-400">Refill ID: CityPharm-Auto</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-150 dark:border-slate-800 shadow-3xs space-y-3 text-xs text-gray-750 dark:text-gray-250">
                <span className="text-[9px] font-bold text-gray-400 uppercase italic">Draft with {selectedAIPatient} · {aiCondition} · {aiSelectedLang}</span>
                <textarea 
                  value={aiDraftMessage}
                  onChange={(e) => setAIDraftMessage(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-gray-150 focus:outline-none focus:ring-1 focus:ring-brand-green font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleApproveDraft}
                  className="px-5 py-2.5 bg-[#84CC16] hover:bg-[#71B20A] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Approve Message
                </button>
                <button
                  type="button"
                  onClick={handleRegenerateDraft}
                  className="px-5 py-2.5 bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-800 hover:bg-slate-50 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Regenerate Draft
                </button>
              </div>
            </div>
          </div>

          {/* Approved / Sent logs list */}
          {approvedMessages.length > 0 && (
            <div className="mt-6 bg-slate-50 dark:bg-slate-950/20 p-5 rounded-3xl border border-gray-100 dark:border-slate-850 text-left">
              <h5 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">Approved & Dispatched Messages Queue ({approvedMessages.length})</h5>
              <div className="space-y-2">
                {approvedMessages.map((msg) => (
                  <div key={msg.id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-850 p-3.5 rounded-2xl shadow-3xs flex justify-between items-start text-xs gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-gray-900 dark:text-gray-150 font-extrabold">{msg.name}</strong>
                        <span className="text-[10px] font-mono text-gray-450">{msg.condition} · {msg.language}</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mt-1 italic leading-relaxed text-[11px]">"{msg.message}"</p>
                    </div>
                    <div className="text-[9px] text-[#71B20A] bg-lime-50 dark:bg-lime-950/30 border border-lime-150 relative py-0.5 px-2 rounded-md font-black uppercase text-center shrink-0">
                      Dispatched {msg.approvedAt}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

        {/* Phase 13: AI Alerts Queue */}
        {activeRoadmapSubTab === 'alerts' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-950/20 p-5 rounded-3xl border border-gray-100 dark:border-slate-850 h-fit space-y-4 text-left">
              <div>
                <span className="text-[9px] font-black uppercase text-gray-400 block tracking-wider">Enqueue Live Alert</span>
                <h4 className="text-sm font-black text-gray-800 dark:text-gray-200 mt-0.5">Manually record compliance watch flags.</h4>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 font-sans">Patient Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Bosco"
                    value={newAlertPatientName}
                    onChange={(e) => setNewAlertPatientName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850 px-3 py-2 text-xs rounded-xl font-medium focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-405 font-sans">Severity Level</label>
                  <select
                    value={newAlertSeverity}
                    onChange={(e) => setNewAlertSeverity(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850 px-3 py-2 text-xs rounded-xl font-bold cursor-pointer"
                  >
                    <option value="High Alert">High Alert</option>
                    <option value="Medium Alert">Medium Alert</option>
                    <option value="Low Alert">Low Alert</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 font-sans">Watch Reason</label>
                  <textarea
                    placeholder="e.g. Swahili phone line disconnected, missed 4 reminders"
                    value={newAlertReason}
                    onChange={(e) => setNewAlertReason(e.target.value)}
                    rows={3}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850 px-3 py-2 text-xs rounded-xl font-medium focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => {
                    if (!newAlertPatientName.trim() || !newAlertReason.trim()) {
                      showToast("Validation Error", "Please fill in patient name and watch reason.", "error");
                      return;
                    }
                    const newAlert = {
                      id: `alert-${Date.now()}`,
                      patient: newAlertPatientName,
                      reason: newAlertReason,
                      severity: newAlertSeverity,
                      dispatched: 'Injected into active clinician triage feed.'
                    };
                    setAiAlerts(prev => [newAlert, ...prev]);
                    setNewAlertPatientName('');
                    setNewAlertReason('');
                    showToast("Alert Enqueued", `A new ${newAlertSeverity} watch flag has been registered for ${newAlertPatientName}!`, "success");
                  }}
                  className="w-full bg-[#84CC16] hover:bg-[#71B20A] text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Enqueue Custom Alert</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between text-left">
                <div>
                  <span className="text-[9px] font-black uppercase text-gray-400 block tracking-wider">Anomalous compliance monitor</span>
                  <h4 className="text-sm font-black text-gray-800 dark:text-gray-200">Active Adherence Alerts Queue ({aiAlerts.length})</h4>
                </div>
                <button 
                  onClick={() => {
                    showToast("Queue Synced", "Fully queried compliance metrics databases to locate critical deviations.", "info");
                  }}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-705 dark:text-gray-300 rounded-xl text-[10px] font-bold cursor-pointer"
                >
                  Sync Queue
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {aiAlerts.length === 0 ? (
                  <div className="bg-slate-50 dark:bg-slate-950/10 border-2 border-dashed border-gray-150 dark:border-slate-850 py-12 text-center rounded-3xl text-gray-400">
                    <p className="text-xs">No compliance alerts currently active.</p>
                    <p className="text-[10px] mt-1 text-gray-450">Use the form on the left to write and enqueue a new active alert.</p>
                  </div>
                ) : (
                  aiAlerts.map((alert) => (
                    <div key={alert.id} className="bg-slate-50 dark:bg-slate-950/20 p-4 rounded-2xl border border-gray-100 dark:border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-50 dark:bg-amber-950/25 rounded-xl text-amber-700 shrink-0">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                             <h5 className="text-xs font-black text-gray-900 dark:text-gray-100">{alert.patient}</h5>
                             <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 border border-rose-100 text-rose-700">
                               {alert.severity}
                             </span>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{alert.reason}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-gray-400 italic mb-1.5">State: {alert.dispatched}</p>
                        <button
                          onClick={() => {
                            setAiAlerts(prev => prev.filter(al => al.id !== alert.id));
                            showToast("Alert Resolved", `Successfully cleared compliance watch flags for ${alert.patient}.`, "success");
                          }}
                          className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850 hover:border-brand-green text-[10px] font-black uppercase rounded-lg text-gray-700 dark:text-gray-300 hover:text-brand-green transition-colors cursor-pointer shadow-3xs"
                        >
                          Resolve Alert
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Phase 15: AI risk prediction */}
        {activeRoadmapSubTab === 'risk' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-950/20 p-5 rounded-3xl border border-gray-100 dark:border-slate-850 h-fit space-y-4 text-left">
              <div>
                <span className="text-[9px] font-black uppercase text-gray-400 block tracking-wider">Configure Adherence Profile</span>
                <h4 className="text-sm font-black text-gray-800 dark:text-gray-200 mt-0.5">Add custom risk predictive scoring.</h4>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Patient Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Susan Nabakooza"
                    value={newRiskPatientName}
                    onChange={(e) => setNewRiskPatientName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850 px-3 py-2 text-xs rounded-xl font-medium focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Chronic Condition</label>
                  <input
                    type="text"
                    placeholder="e.g. Tuberculosis"
                    value={newRiskCondition}
                    onChange={(e) => setNewRiskCondition(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850 px-3 py-2 text-xs rounded-xl font-medium focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Calculated Risk</label>
                  <select
                    value={newRiskLevel}
                    onChange={(e) => setNewRiskLevel(e.target.value as any)}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850 px-3 py-2 text-xs rounded-xl font-bold cursor-pointer"
                  >
                    <option value="High">High Risk</option>
                    <option value="Medium font-bold">Medium Risk</option>
                    <option value="Low font-bold">Low Risk</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Action Prompted</label>
                  <input
                    type="text"
                    placeholder="e.g. Courier deliver medicine"
                    value={newRiskAction}
                    onChange={(e) => setNewRiskAction(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850 px-3 py-2 text-xs rounded-xl font-medium focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => {
                    if (!newRiskPatientName.trim() || !newRiskCondition.trim() || !newRiskAction.trim()) {
                      showToast("Validation Error", "Please provide patient name, condition, and recommended action.", "error");
                      return;
                    }
                    const newRiskItem = {
                      id: `r-${Date.now()}`,
                      name: newRiskPatientName,
                      condition: newRiskCondition,
                      risk: newRiskLevel,
                      action: newRiskAction,
                      state: 'Pending Action'
                    };
                    setRiskList(prev => [newRiskItem, ...prev]);
                    setNewRiskPatientName('');
                    setNewRiskCondition('');
                    setNewRiskAction('Call patient');
                    showToast("Risk Record Logged", `Adherence prediction logged for ${newRiskPatientName}.`, "success");
                  }}
                  className="w-full bg-[#84CC16] hover:bg-[#71B20A] text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Predict Adherence Risk</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <div>
                <span className="text-[9px] font-black uppercase text-gray-400 block tracking-wider text-left">Predictive Adherence analytics</span>
                <h4 className="text-sm font-black text-gray-800 dark:text-gray-150 text-left">Refills Default Risks Predictions Index ({riskList.length})</h4>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-850 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[500px]">
                    <thead>
                      <tr className="border-b border-gray-150 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/40 text-gray-400 font-extrabold uppercase text-[9px]">
                        <th className="py-3 px-4">Patient</th>
                        <th className="py-3 px-4">Condition</th>
                        <th className="py-3 px-4">Risk Level</th>
                        <th className="py-3 px-4">State / Resolution</th>
                        <th className="py-3 px-4 text-right">Recommended Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-850">
                      {riskList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-400">
                            No risk profiles active. Please configure custom ones on the left.
                          </td>
                        </tr>
                      ) : (
                        riskList.map((item) => {
                          const isHigh = item.risk === 'High';
                          const isMed = item.risk === 'Medium';
                          return (
                            <tr key={item.id} className="hover:bg-slate-50/40">
                              <td className="py-3.5 px-4 font-black text-gray-800 dark:text-gray-200">{item.name}</td>
                              <td className="py-3.5 px-4 text-gray-500 font-mono font-medium">{item.condition}</td>
                              <td className="py-3.5 px-4">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                  isHigh 
                                    ? 'bg-rose-50 text-rose-700 border border-rose-150' 
                                    : isMed 
                                    ? 'bg-amber-50 text-amber-700 border border-amber-150' 
                                    : 'bg-lime-50 text-lime-700 border border-lime-150'
                                }`}>
                                  {item.risk} Risk
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="text-[10px] text-gray-400 font-mono font-semibold italic">{item.state}</span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                {item.action === 'No action needed' ? (
                                  <span className="text-[10px] text-gray-400 font-mono font-semibold">✓ Fully Compliant</span>
                                ) : (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => handleRiskAction(item.id, item.name, item.action)}
                                      className="px-3 py-1 bg-[#84CC16] hover:bg-[#71B20A] text-white text-[10px] font-black uppercase rounded-lg transition-colors cursor-pointer"
                                    >
                                      {item.action}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setRiskList(prev => prev.filter(r => r.id !== item.id));
                                        showToast("Profile Removed", "Removed predictive card from clinician feed.", "success");
                                      }}
                                      className="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                      title="Remove profile"
                                    >
                                      ✕
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
            </div>
          </div>
        )}

        {/* Phase 16: Payments & subscriptions SaaS */}
        {activeRoadmapSubTab === 'payments' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-950/20 p-5 rounded-3xl border border-gray-100 dark:border-slate-850 space-y-4 text-left">
              <div>
                <span className="text-[9px] font-black uppercase text-gray-400 block tracking-wider">Configure Invoicing</span>
                <h4 className="text-sm font-black text-gray-800 dark:text-gray-200 mt-0.5">SaaS Billing & Mobile Payments Key</h4>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-black text-gray-450 uppercase tracking-widest block font-sans">Payment Channel</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'MTN', label: 'MTN MoMo', desc: 'MTN Mobile Money' },
                    { id: 'Airtel', label: 'Airtel Pay', desc: 'Airtel Mobile Money' },
                    { id: 'Visa', label: 'Visa Card', desc: 'Visa Online Gateway' },
                    { id: 'Mastercard', label: 'Mastercard', desc: 'Card checkout' }
                  ].map((rail) => (
                    <button
                      key={rail.id}
                      onClick={() => setSelectedPaymentRail(rail.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        selectedPaymentRail === rail.id 
                          ? 'border-[2px] border-brand-green bg-[#F4FCE3]/30 text-gray-900 dark:text-white font-bold' 
                          : 'bg-white dark:bg-slate-900 border-gray-205 dark:border-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-black">{rail.label}</span>
                      <span className="text-[9px] text-gray-400 block mt-1 leading-none">{rail.desc}</span>
                    </button>
                  ))}
                </div>

                {/* Form fields for financial logs */}
                {selectedPaymentRail === 'MTN' || selectedPaymentRail === 'Airtel' ? (
                  <div className="space-y-1.5 pt-1 text-left">
                    <label className="text-[10px] font-black uppercase text-gray-405">East Africa Mobile Number</label>
                    <input 
                      type="text" 
                      value={paymentPhone} 
                      onChange={(e) => setPaymentPhone(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850 p-2.5 text-xs rounded-xl font-mono focus:outline-none focus:border-[#84CC16]"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5 pt-1 text-left">
                    <label className="text-[10px] font-black uppercase text-gray-405">Visa credit card digits</label>
                    <input 
                      type="text" 
                      value={paymentCardNum} 
                      onChange={(e) => setPaymentCardNum(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850 p-2.5 text-xs rounded-xl font-mono focus:outline-none focus:border-[#84CC16]"
                    />
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full bg-[#84CC16] hover:bg-[#71B20A] text-white rounded-2xl py-3 text-xs font-black uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
                  >
                    Pay Pending Invoice
                  </button>
                </div>

                {/* Create custom invoice subform */}
                <div className="border-t border-gray-200 dark:border-slate-800 pt-3 space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 block">Record New External Invoice</label>
                  <input
                    type="text"
                    placeholder="Invoice Code (e.g. INV-2026-07)"
                    value={newInvoiceCodeExtra}
                    onChange={(e) => setNewInvoiceCodeExtra(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850 text-xs p-2 rounded-lg font-mono focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Billing Period (e.g. July 2026)"
                    value={newInvoicePeriod}
                    onChange={(e) => setNewInvoicePeriod(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850 text-xs p-2 rounded-lg font-sans focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Amount (e.g. UGX 150,000)"
                    value={newInvoiceAmount}
                    onChange={(e) => setNewInvoiceAmount(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850 text-xs p-2 rounded-lg font-mono focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (!newInvoiceCodeExtra.trim() || !newInvoicePeriod.trim()) {
                        showToast("Validation Error", "Please provide billing details.", "error");
                        return;
                      }
                      const newInvoice = {
                        id: newInvoiceCodeExtra,
                        period: newInvoicePeriod,
                        amount: newInvoiceAmount || "UGX 150,000",
                        status: 'Pending Pay',
                        method: 'Unpaid'
                      };
                      setInvoices(prev => [newInvoice, ...prev]);
                      showToast("Invoice Drafted", `Invoice ${newInvoiceCodeExtra} has been added as Pending.`, "success");
                    }}
                    className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-xs font-black uppercase cursor-pointer"
                  >
                    + Record Invoice Draft
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-850 space-y-4 text-left">
              <h5 className="text-xs font-black uppercase text-gray-400 font-sans">SaaS Invoices History logs ({invoices.length})</h5>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-150 dark:border-slate-850 text-gray-400 uppercase font-black text-[9px]">
                      <th className="pb-2">Invoice Code</th>
                      <th className="pb-2">Billing Period</th>
                      <th className="pb-2">Total Amount</th>
                      <th className="pb-2">Receipt Gate</th>
                      <th className="pb-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-slate-850">
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400">
                          No invoices recorded currently. Use the editor to add new invoices.
                        </td>
                      </tr>
                    ) : (
                      invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/20">
                          <td className="py-3 font-mono font-black text-[#71B20A]">{inv.id}</td>
                          <td className="py-3 text-gray-600 dark:text-gray-300 font-semibold">{inv.period}</td>
                          <td className="py-3 text-gray-901 dark:text-white font-bold">{inv.amount}</td>
                          <td className="py-3 text-gray-450 text-[11px] font-semibold">{inv.method}</td>
                          <td className="py-3 text-right">
                            <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black uppercase rounded-full border ${
                              inv.status === 'Paid' 
                                ? 'bg-lime-50 dark:bg-lime-950/20 text-[#71B20A] border-lime-150' 
                                : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 border-amber-150'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Phase 8: Stock runout forecasting */}
        {activeRoadmapSubTab === 'forecasting' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-950/20 p-5 rounded-3xl border border-gray-100 dark:border-slate-850 h-fit space-y-4 text-left">
              <div>
                <span className="text-[9px] font-black uppercase text-gray-400 block tracking-wider">Log Reserves Levels</span>
                <h4 className="text-sm font-black text-gray-800 dark:text-gray-200 mt-0.5">Medication Stock Velocity Control</h4>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Drug Name & Dose</label>
                  <input
                    type="text"
                    placeholder="e.g. Dolutegravir 50mg"
                    value={newStockMedName}
                    onChange={(e) => setNewStockMedName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850 px-3 py-2 text-xs rounded-xl font-medium focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Current In-Stock Units</label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={newStockUnits}
                    onChange={(e) => setNewStockUnits(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850 px-3 py-2 text-xs rounded-xl font-mono focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Daily Dip Velocity (units)</label>
                  <input
                    type="number"
                    placeholder="e.g. 15"
                    value={newStockDailyRate}
                    onChange={(e) => setNewStockDailyRate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850 px-3 py-2 text-xs rounded-xl font-mono focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => {
                    const unitsNum = parseInt(newStockUnits, 10);
                    const rateNum = parseInt(newStockDailyRate, 10);
                    if (!newStockMedName.trim() || isNaN(unitsNum) || isNaN(rateNum) || rateNum <= 0) {
                      showToast("Validation Error", "Please provide a valid medication name, stock units, and daily deplete speed.", "error");
                      return;
                    }
                    const daysLeft = Math.floor(unitsNum / rateNum);
                    const riskStatus = daysLeft < 15 ? 'HIGH RISK' : 'STABLE';
                    const newForecast = {
                      id: `stock-${Date.now()}`,
                      medName: newStockMedName,
                      currentStock: unitsNum,
                      consumptionRate: rateNum,
                      forecastDays: daysLeft,
                      risk: riskStatus
                    };
                    setStockForecasts(prev => [newForecast, ...prev]);
                    setNewStockMedName('');
                    setNewStockUnits('180');
                    setNewStockDailyRate('12');
                    showToast("Reserves Forecast Synced", `Velocity computed: ${daysLeft} days left for ${newStockMedName}.`, "success");
                  }}
                  className="w-full bg-[#84CC16] hover:bg-[#71B20A] text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-3xs"
                >
                  <span>Calculate Depletion Flow</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between text-left">
                <div>
                  <span className="text-[9px] font-black uppercase text-gray-400 block tracking-wider">Adherence pharmacology inventory forecasting</span>
                  <h4 className="text-sm font-black text-gray-800 dark:text-gray-255">Inventory Stock Run-Out Forecast Analytics (30-day view)</h4>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-850 overflow-hidden text-left">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[500px]">
                    <thead>
                      <tr className="border-b border-gray-150 bg-slate-50 text-gray-400 font-bold uppercase text-[9px]">
                        <th className="py-3 px-4">Medication Name</th>
                        <th className="py-3 px-4">In-Stock units</th>
                        <th className="py-3 px-4">daily deplete velocity</th>
                        <th className="py-3 px-4">Forecast days left</th>
                        <th className="py-3 px-4 text-right">Run-Out risk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-850">
                      {stockForecasts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-450 text-[11px]">
                            No inventory forecasts active. Log reserves on the left.
                          </td>
                        </tr>
                      ) : (
                        stockForecasts.map((st) => {
                          const isHigh = st.forecastDays < 15;
                          return (
                            <tr key={st.id} className="hover:bg-slate-50/40">
                              <td className="py-3.5 px-4 font-black text-gray-850 dark:text-gray-150">{st.medName}</td>
                              <td className="py-3.5 px-4 text-gray-500 font-mono font-bold">{st.currentStock} packs</td>
                              <td className="py-3.5 px-4 text-gray-400 font-mono">{st.consumptionRate} daily</td>
                              <td className="py-3.5 px-4 font-black text-slate-800 dark:text-gray-200">{st.forecastDays} days</td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full ${
                                    isHigh 
                                      ? 'bg-rose-50 text-rose-700 border border-rose-150' 
                                      : 'bg-lime-50 text-lime-700 border border-lime-150'
                                  }`}>
                                    {st.risk}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setStockForecasts(prev => prev.filter(s => s.id !== st.id));
                                      showToast("Reserves Cleared", `Purged ${st.medName} from tracking matrix.`, "info");
                                    }}
                                    className="p-1 hover:text-rose-600 rounded cursor-pointer"
                                    title="Delete record"
                                  >
                                    ✕
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
          </div>
        )}

        {/* Phase 10: Compliance reports charts view */}
        {activeRoadmapSubTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-950/20 p-5 rounded-3xl border border-gray-150 dark:border-slate-850">
            <div className="space-y-4">
              <h5 className="text-xs font-black uppercase text-gray-400 tracking-wider">Uganda Region Clinic Compliance Rates</h5>
              
              <div className="space-y-3.5 pt-2">
                {[
                  { region: 'Kampala road Central (Branch A)', rate: '92% Adherence index', barWidth: 'w-[92%]', color: 'bg-brand-green' },
                  { region: 'Arua first care (Branch B)', rate: '78% Adherence index', barWidth: 'w-[78%]', color: 'bg-lime-500' },
                  { region: 'Mbale Elgon chemist (Branch C)', rate: '85% Adherence index', barWidth: 'w-[85%]', color: 'bg-lime-600' }
                ].map((bg, i) => (
                  <div key={i} className="space-y-1 block">
                    <div className="flex justify-between items-center text-xs font-extrabold text-gray-700 dark:text-gray-300">
                      <span>{bg.region}</span>
                      <span className="text-brand-green">{bg.rate}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className={`h-full ${bg.color} rounded-full transition-all duration-500 ${bg.barWidth}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-850 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-black uppercase text-gray-400">Analytical highlights</span>
                <h6 className="text-xs font-black text-gray-800 dark:text-gray-205 mt-0.5">Community Pharmacy Compliance Indexes</h6>
                <p className="text-[11px] text-gray-450 mt-2 leading-relaxed">
                  CareRefill registers compliance indicators mapping patients therapy duration indices. In Uganda, 81% of chronic patients suffer from irregular dosage because of high travel costs or stock runouts. Automatically dispatched SMS pre-emption mitigates this by up to 26% margin.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-slate-850">
                <button
                  onClick={() => {
                    showToast("Exporting Compliance Reports", "Initiating PDF generation of Ugandan branch data...", "info");
                  }}
                  className="px-4 py-2 bg-[#84CC16] text-white text-[10px] font-black uppercase rounded-lg hover:bg-[#71B20A] tracking-wider transition-colors cursor-pointer"
                >
                  Export compliance audit logs
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL OVERLAY FOR SUBSCRIPTION PAYMENTS */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-gray-100 max-w-sm w-full p-6 text-center space-y-5 animate-scale-in">
            <div className="w-12 h-12 bg-lime-50 text-brand-green rounded-full flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-black text-gray-900 dark:text-white">Verify Payment Confirmation</h4>
              <p className="text-xs text-gray-400 mt-1">
                About to authorize a secure subscription pay node.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl space-y-1.5 text-xs text-left">
              <p className="text-gray-450">Payment Method: <strong className="text-gray-850 dark:text-gray-150 font-black">{selectedPaymentRail === 'MTN' ? 'MTN MoMo' : selectedPaymentRail === 'Airtel' ? 'Airtel Pay' : 'Debit Card'}</strong></p>
              <p className="text-gray-455">Total Amount: <strong className="text-brand-green font-mono font-black">UGX 150,000</strong></p>
              <p className="text-gray-455">Reference Period: <strong className="text-gray-800 dark:text-gray-200">SaaS Monthly Program Refills</strong></p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                disabled={isPaying}
                onClick={handlePayInvoice}
                className="flex-1 bg-[#84CC16] hover:bg-[#71B20A] text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isPaying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{isPaying ? 'Paying Node...' : 'Confirm Payments'}</span>
              </button>
              <button
                disabled={isPaying}
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-205 text-gray-700 dark:text-gray-250 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
