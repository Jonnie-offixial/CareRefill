import React, { useState, useEffect } from 'react';
import { Patient, Medication } from '../types';
import { 
  Sparkles, 
  Send, 
  User, 
  Activity, 
  Check, 
  AlertCircle, 
  Settings, 
  MessageSquare,
  RefreshCw 
} from 'lucide-react';

interface AiPersonalizedMessagesProps {
  patients: (Patient & { medication: Medication | null })[];
  pharmacyId: string;
  onRefreshData: () => Promise<void>;
  showToast: (msg: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export default function AiPersonalizedMessages({
  patients,
  pharmacyId,
  onRefreshData,
  showToast
}: AiPersonalizedMessagesProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [promptContext, setPromptContext] = useState('');
  const [draftedText, setDraftedText] = useState('');
  const [generationLoading, setGenerationLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Active loaded drafts list from SQLite DB
  const [draftsList, setDraftsList] = useState<any[]>([]);

  // active patient
  const activePatient = patients.find(p => p.patient_id === selectedPatientId);

  const fetchDraftsList = async () => {
    try {
      const res = await fetch(`/api/ai-drafts?pharmacy_id=${pharmacyId}`);
      if (res.ok) {
        setDraftsList(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDraftsList();
  }, [patients, pharmacyId]);

  useEffect(() => {
    const activeP = patients.find(p => (p.status as string) === 'Needs Assistance' || p.status === 'Active');
    if (activeP && !selectedPatientId) {
      setSelectedPatientId(activeP.patient_id);
    }
  }, [patients]);

  const handleGenerateAidraft = async () => {
    if (!selectedPatientId) return;
    setGenerationLoading(true);
    try {
      showToast("Triggering Gemini", "Generating personalized clinical care message drafts...", "info");
      const res = await fetch('/api/ai-drafts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatientId,
          custom_context: promptContext || "Draft a warm care notification emphasizing checkups"
        })
      });

      if (res.ok) {
        const result = await res.json();
        setDraftedText(result.draft_text);
        showToast("Gemini Draft Prepared", "Empathetic message drafted successfully.", "success");
        await fetchDraftsList();
      } else {
        const body = await res.json();
        showToast("AI Draft Error", body.error || "Unable to reach model services.", "error");
      }
    } catch (err) {
      showToast("Connection Problem", "Server failed to invoke Gemini model pipeline.", "error");
    } finally {
      setGenerationLoading(false);
    }
  };

  const handleApproveAndSend = async (draftId?: string) => {
    if (!selectedPatientId && !draftId) return;
    setIsSending(true);
    try {
      // If dispatching the newly drafted text area, post to active patient replies list!
      const finalBody = draftedText || "Warm reminder regarding your on-time refills!";
      const res = await fetch(`/api/patients/${selectedPatientId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reply_option: `[AI Care Message] ${finalBody}`,
          channel: activePatient?.preferred_channel || 'WhatsApp'
        })
      });

      if (res.ok) {
        showToast("AI Message Dispatched", `Care notification delivered to patient's ${activePatient?.preferred_channel} channel.`, "success");
        setDraftedText('');
        setPromptContext('');
        await fetchDraftsList();
        onRefreshData();
      }
    } catch (e) {
      showToast("Delivery Failed", "Communication gateway offline.", "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Left Prompt Setup desk */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-brand-green">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <h3 className="font-bold text-sm">Gemini Care Message Personalizer</h3>
        </div>
        <p className="text-xs text-gray-500">Draft empathetic medication reminders tuned to specific patient needs using clinical AI models.</p>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-405 block">Pick Patient</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/20 border border-gray-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-gray-900 dark:text-gray-100"
            >
              {patients.map(p => (
                <option key={p.patient_id} value={p.patient_id}>
                  {p.full_name} ({p.chronic_condition}) - {p.preferred_channel}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-405 block">Context Constraints (Optional)</label>
            <textarea 
              value={promptContext}
              onChange={(e) => setPromptContext(e.target.value)}
              placeholder="e.g. Include Mary Okello as her secondary caregiver. Advise the patient to avoid skipping insulin during hot days."
              className="w-full bg-slate-50 dark:bg-slate-950/20 border border-gray-200 dark:border-slate-800 rounded-lg p-2.5 text-xs h-24 resize-none"
            />
          </div>

          <button
            onClick={handleGenerateAidraft}
            disabled={generationLoading || !selectedPatientId}
            className="bg-brand-green hover:bg-brand-green-hover text-white rounded-xl py-2.5 px-4 text-xs font-black w-full shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-1"
          >
            <RefreshCw className={`w-4 h-4 ${generationLoading ? 'animate-spin' : ''}`} />
            <span>{generationLoading ? 'Drafting care report...' : 'Draft empathetic message'}</span>
          </button>
        </div>
      </div>

      {/* Middle Text review editor */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Clinical Editor & Guardrails</h3>
        
        <div className="space-y-3">
          <textarea 
            value={draftedText}
            onChange={(e) => setDraftedText(e.target.value)}
            placeholder="AI response drafts will output here. Click the green button to start generating!"
            className="w-full bg-slate-50 dark:bg-slate-950/15 border border-gray-200 dark:border-slate-850 rounded-2xl p-4 text-xs font-sans text-gray-800 dark:text-gray-100 h-64 focus:outline-none"
          />

          <button
            onClick={() => handleApproveAndSend()}
            disabled={isSending || !draftedText.trim()}
            className="bg-brand-green hover:bg-brand-green-hover text-white rounded-xl py-2.5 px-4 text-xs font-black w-full shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>{isSending ? 'Transmitting logs...' : 'Approve & Deliver via Carrier'}</span>
          </button>
        </div>
      </div>

      {/* Right Drafts history directory list from server cache */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Personalized Message Logs</h3>
        
        <div className="space-y-3 max-h-[340px] overflow-y-auto">
          {draftsList.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs italic font-serif">
              No previous AI personalized messaging logs generated yet on this pharmacy profile.
            </div>
          ) : (
            draftsList.slice(0, 5).map((d) => (
              <div key={d.draft_id} className="bg-slate-50 dark:bg-slate-950/30 p-3 rounded-2xl space-y-1 text-[11px] leading-tight">
                <div className="flex items-center justify-between font-bold text-gray-900 dark:text-gray-100">
                  <span>Patient ID: {d.patient_id.slice(0, 8)}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-850 font-mono font-bold">{d.status}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-serif italic">"{d.draft_text.slice(0, 100)}..."</p>
                <span className="text-[9px] text-slate-400 block font-mono">{new Date(d.created_at).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
