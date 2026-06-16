import React, { useState, useEffect, useRef } from 'react';
import { Patient, Medication } from '../types';
import { 
  MessageSquare, 
  Send, 
  User, 
  Clock, 
  Smartphone, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Sparkles, 
  Zap, 
  PhoneCall, 
  Users 
} from 'lucide-react';

interface WhatsAppRepliesConsoleProps {
  patients: (Patient & { medication: Medication | null })[];
  pharmacyId: string;
  onRefreshData: () => Promise<void>;
  showToast: (msg: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export default function WhatsAppRepliesConsole({
  patients,
  pharmacyId,
  onRefreshData,
  showToast
}: WhatsAppRepliesConsoleProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [manualText, setManualText] = useState('');
  const [outgoingLoading, setOutgoingLoading] = useState(false);
  
  // Simulation trigger loaders
  const [simLoading, setSimLoading] = useState<number | null>(null);

  // Active Assistance alerts list state
  const [assistanceAlerts, setAssistanceAlerts] = useState<any[]>([]);

  // Find currently active patient for chat thread
  const activePatient = patients.find(p => p.patient_id === selectedPatientId);

  // Load chat replies logs and facility warning lists
  const loadChatDetails = async (patId: string) => {
    if (!patId) return;
    try {
      const res = await fetch(`/api/patients/${patId}/replies`);
      if (res.ok) {
        setChatHistory(await res.json());
      }
    } catch (e) {
      console.error("Error fetching chat logs", e);
    }
  };

  const loadAssistanceAlerts = async () => {
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
    loadAssistanceAlerts();
  }, [patients, pharmacyId]);

  useEffect(() => {
    if (selectedPatientId) {
      loadChatDetails(selectedPatientId);
    }
  }, [selectedPatientId]);

  // Set default patient on load
  useEffect(() => {
    const activePatients = patients.filter(p => p.status !== 'Inactive');
    if (activePatients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(activePatients[0].patient_id);
    }
  }, [patients]);

  // Send a manual outgoing pharmacist text
  const handleSendManual = async () => {
    if (!manualText.trim() || !selectedPatientId) return;
    setOutgoingLoading(true);
    try {
      // Simulate/post standard outgoing system text to the patient log
      const res = await fetch(`/api/patients/${selectedPatientId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reply_option: manualText,
          channel: activePatient?.preferred_channel || 'WhatsApp'
        })
      });

      if (res.ok) {
        await loadChatDetails(selectedPatientId);
        setManualText('');
        showToast("Message Sent", `Outgoing text delivered via ${activePatient?.preferred_channel || 'WhatsApp'} gateway.`, 'success');
        onRefreshData();
      }
    } catch (e) {
      showToast("Delivery Failed", "Communication gateway failed to compile request.", "error");
    } finally {
      setOutgoingLoading(false);
    }
  };

  // Simulate an incoming patient reply (1, 2, 3, or 4) to test automation
  const handleSimulateResponse = async (optionNum: number) => {
    if (!selectedPatientId) return;
    setSimLoading(optionNum);
    try {
      const res = await fetch(`/api/patients/${selectedPatientId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reply_option: String(optionNum),
          channel: activePatient?.preferred_channel || 'WhatsApp'
        })
      });

      if (res.ok) {
        const result = await res.json();
        await loadChatDetails(selectedPatientId);
        await loadAssistanceAlerts();
        showToast(
          "Simulated Incoming Response", 
          `Patient replied option "${optionNum}". CareRefill automatically updated their status!`, 
          'info'
        );
        onRefreshData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimLoading(null);
    }
  };

  // Dismiss/Clear patient urgent assistance alert flag
  const handleClearAssistance = async (patId: string) => {
    try {
      const res = await fetch(`/api/patients/${patId}/clear-assistance`, {
        method: 'POST'
      });
      if (res.ok) {
        showToast("Alert Dismissed", "Patient clinical help request flagged as resolved.", "success");
        await loadAssistanceAlerts();
        onRefreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Clinician Active Support Warnings Banner */}
      {assistanceAlerts.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/60 rounded-2xl p-4 space-y-3 shadow-3xs">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 animate-pulse" />
            <h3 className="font-bold text-sm">Action Needed: {assistanceAlerts.length} Active Care Alerts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {assistanceAlerts.map((alert: any) => (
              <div 
                key={alert.patient_id}
                className="bg-white dark:bg-slate-900 border border-rose-200/50 dark:border-rose-950/40 p-3.5 rounded-xl flex items-center justify-between gap-3 shadow-2xs"
              >
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">{alert.full_name}</h4>
                  <p className="text-[11px] text-gray-500 font-serif italic mt-0.5">"{alert.assistance_reason}"</p>
                  <p className="text-[10px] text-teal-600 font-mono mt-1">{alert.phone_number} • {alert.chronic_condition}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => setSelectedPatientId(alert.patient_id)}
                    className="px-2.5 py-1.5 bg-brand-accent-bg text-brand-green font-bold text-[10px] rounded-lg tracking-wider hover:bg-emerald-100/80 cursor-pointer"
                  >
                    Open Chat
                  </button>
                  <button
                    onClick={() => handleClearAssistance(alert.patient_id)}
                    className="px-2.5 py-1.5 bg-rose-600 text-white font-bold text-[10px] rounded-lg tracking-wider hover:bg-rose-700 cursor-pointer"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Two-Panel Chat UI */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row h-[520px]">
        
        {/* Left Contacts Selection Rail */}
        <div className="w-full md:w-64 border-r border-gray-100 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-950/20 overflow-y-auto">
          <div className="p-4 border-b border-gray-100 dark:border-slate-800">
            <h3 className="font-bold text-xs text-gray-400 uppercase tracking-widest">Connected Patients</h3>
          </div>
          <div className="flex-1 divide-y divide-gray-50 dark:divide-slate-800">
            {patients.map((p) => {
              const active = p.patient_id === selectedPatientId;
              const hasAlert = (p.status as string) === 'Needs Assistance' || (p.status as string) === 'Callback Requested';
              return (
                <button
                  key={p.patient_id}
                  onClick={() => setSelectedPatientId(p.patient_id)}
                  className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer ${
                    active ? 'bg-emerald-50/70 dark:bg-emerald-950/15 border-l-4 border-brand-green' : 'border-l-4 border-transparent'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-brand-green flex items-center justify-center font-bold text-xs shrink-0 select-none">
                    {p.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate">{p.full_name}</p>
                      {p.preferred_channel === 'WhatsApp' ? (
                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider font-mono">WA</span>
                      ) : (
                        <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider font-mono">SMS</span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 truncate font-mono mt-0.5">{p.phone_number}</p>
                    
                    {hasAlert && (
                      <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1.5 ${
                        (p.status as string) === 'Needs Assistance' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {p.status}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Conversation History Workspace */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 justify-between">
          {activePatient ? (
            <>
              {/* Header Coordinates */}
              <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-905 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">{activePatient.full_name}</h3>
                  <p className="text-[10px] text-gray-500 font-mono">
                    Channel priority: <span className="font-bold text-teal-600">{activePatient.preferred_channel}</span> • Condition: {activePatient.chronic_condition}
                  </p>
                </div>
                
                {activePatient.medication && (
                  <div className="text-right text-xs shrink-0">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">{activePatient.medication.medication_name}</span>
                    <span className="text-[9px] text-gray-400 block font-mono">Supply: {activePatient.medication.duration_days} days</span>
                  </div>
                )}
              </div>

              {/* Chat bubbles container */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/10 min-h-0">
                {chatHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
                    <MessageSquare className="w-8 h-8 text-gray-200 animate-bounce" />
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">No Message Logs Yet</h4>
                    <p className="text-[11px] text-gray-400 max-w-xs">Run the cron scheduler or use the patient simulation desk on the right to trigger incoming texts.</p>
                  </div>
                ) : (
                  chatHistory.map((msg) => {
                    const isIncoming = msg.option_selected !== null || msg.reply_text.includes(" = ") === false;
                    return (
                      <div 
                        key={msg.reply_id}
                        className={`flex flex-col max-w-[75%] ${isIncoming ? 'self-start items-start' : 'self-end items-end ml-auto'}`}
                      >
                        <div className={`p-3 rounded-2xl text-xs leading-normal font-sans shadow-3xs ${
                          isIncoming 
                            ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 rounded-tl-sm' 
                            : 'bg-brand-accent-bg text-brand-green dark:bg-emerald-950/40 dark:text-emerald-100 rounded-tr-sm'
                        }`}>
                          <p>{msg.reply_text}</p>
                          <div className="flex items-center gap-1.5 text-[9px] text-gray-400 mt-1.5 uppercase tracking-wider font-mono select-none">
                            <span>{msg.channel} Gateway</span>
                            <span>•</span>
                            <Clock className="w-2.5 h-2.5" />
                            <span>{new Date(msg.received_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom manual composer inputs */}
              <div className="p-3 border-t border-gray-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-905 flex items-center gap-2">
                <input
                  type="text"
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder={`Type manual response to send via ${activePatient.preferred_channel}...`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendManual();
                  }}
                  className="flex-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green text-gray-900 dark:text-gray-100"
                />
                <button
                  type="button"
                  onClick={handleSendManual}
                  disabled={outgoingLoading || !manualText.trim()}
                  className="p-3.5 bg-brand-green text-white rounded-xl hover:bg-brand-green-hover transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center shrink-0 shadow-2xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-2 bg-slate-50/5">
              <Users className="w-8 h-8 text-gray-200" />
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Patient</h4>
              <p className="text-[11px] text-gray-400">Choose a care profile from the left list to view WhatsApp / SMS logs.</p>
            </div>
          )}
        </div>

        {/* Rightmost Interactive Mock Patient Simulator Panel */}
        <div className="w-full md:w-56 border-l border-gray-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/30 p-4 shrink-0 flex flex-col space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-brand-green dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate Patient</span>
            </div>
            <p className="text-[10px] text-gray-450 leading-tight">Click an automated key trigger below to mock an incoming SMS or WhatsApp response from {activePatient?.full_name || 'Sarah'}:</p>
          </div>

          <div className="flex-1 flex flex-col gap-2 justify-center">
            <button
              onClick={() => handleSimulateResponse(1)}
              disabled={simLoading !== null || !selectedPatientId}
              className="p-2.5 text-left border border-emerald-250 hover:bg-emerald-55/40 text-emerald-800 dark:text-emerald-100 bg-white dark:bg-slate-900 rounded-xl text-xs transition-colors cursor-pointer flex flex-col gap-0.5"
            >
              <div className="flex items-center justify-between gap-1 w-full">
                <span className="font-extrabold text-[10px] bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded text-emerald-800">Reply Option 1</span>
                {simLoading === 1 && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>}
              </div>
              <span className="text-[10px] opacity-90 mt-0.5 font-medium leading-tight">Already Refilled medication. (Schedules automatically)</span>
            </button>

            <button
              onClick={() => handleSimulateResponse(2)}
              disabled={simLoading !== null || !selectedPatientId}
              className="p-2.5 text-left border border-amber-250 hover:bg-amber-55/40 text-amber-800 dark:text-amber-100 bg-white dark:bg-slate-900 rounded-xl text-xs transition-colors cursor-pointer flex flex-col gap-0.5"
            >
              <div className="flex items-center justify-between gap-1 w-full">
                <span className="font-extrabold text-[10px] bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded text-amber-800">Reply Option 2</span>
                {simLoading === 2 && <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>}
              </div>
              <span className="text-[10px] opacity-90 mt-0.5 font-medium leading-tight">Remind tomorrow morning. (Updates status to postpone logs)</span>
            </button>

            <button
              onClick={() => handleSimulateResponse(3)}
              disabled={simLoading !== null || !selectedPatientId}
              className="p-2.5 text-left border border-rose-250 hover:bg-rose-55/40 text-rose-800 dark:text-rose-100 bg-white dark:bg-slate-900 rounded-xl text-xs transition-colors cursor-pointer flex flex-col gap-0.5"
            >
              <div className="flex items-center justify-between gap-1 w-full">
                <span className="font-extrabold text-[10px] bg-rose-100 dark:bg-rose-950/80 px-1.5 py-0.5 rounded text-rose-800">Reply Option 3</span>
                {simLoading === 3 && <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>}
              </div>
              <span className="text-[10px] opacity-90 mt-0.5 font-medium leading-tight">Need urgent assistance! (Raises critical nurse alert banner)</span>
            </button>

            <button
              onClick={() => handleSimulateResponse(4)}
              disabled={simLoading !== null || !selectedPatientId}
              className="p-2.5 text-left border border-orange-255 hover:bg-orange-55/40 text-orange-800 dark:text-orange-100 bg-white dark:bg-slate-900 rounded-xl text-xs transition-colors cursor-pointer flex flex-col gap-0.5"
            >
              <div className="flex items-center justify-between gap-1 w-full">
                <span className="font-extrabold text-[10px] bg-orange-100 dark:bg-orange-950/80 px-1.5 py-0.5 rounded text-orange-850">Reply Option 4</span>
                {simLoading === 4 && <span className="h-2 w-2 rounded-full bg-orange-500 animate-ping"></span>}
              </div>
              <span className="text-[10px] opacity-90 mt-0.5 font-medium leading-tight">Immediate Voice Call requested. (Raises callback alert)</span>
            </button>
          </div>

          <div className="bg-emerald-50/40 dark:bg-slate-900/60 p-2.5 rounded-xl border border-dotted border-brand-green/20">
            <span className="text-[9px] font-black uppercase tracking-wider text-brand-green block">Gateway Status</span>
            <p className="text-[10px] text-slate-500 mt-1 leading-tight font-sans">
              CareRefill handles automatic updates securely via local SQLite logic and exports webhooks for real production numbers.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
