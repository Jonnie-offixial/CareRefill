import React, { useState, useEffect } from 'react';
import { MessageSquare, Sparkles, Smartphone, Save, ShieldCheck, Languages, Check, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MessageTemplatesEditorProps {
  pharmacyId: string;
  pharmacyName: string;
  colorTheme: string;
}

export default function MessageTemplatesEditor({
  pharmacyId,
  pharmacyName,
  colorTheme,
}: MessageTemplatesEditorProps) {
  const [templates, setTemplates] = useState<any>({
    "Hypertension": "Hello {patient_name}, this is a reminder from {pharmacy_name}. Your medication for {med_name} will run out on {next_refill_date}. Please visit us to collect your brand new refill package.",
    "Diabetes": "Dear {patient_name}, this is {pharmacy_name}. Your {med_name} is running thin. Next refill date is set and ready for {next_refill_date}. Stop by Kampala Community Pharmacy or call us directly. Stay healthy!",
    "HIV/ARVs": "Hello {patient_name}, this serves as a wellness routine treatment therapy update from {pharmacy_name}. Your pack {med_name} is due to be refilled on {next_refill_date}. Package selection is sorted.",
    "General": "Hello {patient_name}. Chronic prescription of {med_name} from {pharmacy_name} will require a refill on {next_refill_date}. Please secure your refill. Thank you."
  });

  const [activeTab, setActiveTab] = useState<'Hypertension' | 'Diabetes' | 'HIV/ARVs' | 'General'>('Hypertension');
  const [editedText, setEditedText] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // AI assistant states
  const [aiLanguage, setAiLanguage] = useState<string>('English');
  const [promptPatientName, setPromptPatientName] = useState('Juliet Namatovu');
  const [promptMedName, setPromptMedName] = useState('Acriptega TLD');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiApplied, setAiApplied] = useState(false);

  // Sync edited text on tab change
  useEffect(() => {
    setEditedText(templates[activeTab] || '');
  }, [activeTab, templates]);

  // Load backend templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch(`/api/templates?pharmacy_id=${pharmacyId}`);
        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
        }
      } catch (err) {
        console.error("Failed to fetch templates", err);
      }
    };
    fetchTemplates();
  }, [pharmacyId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedTemplates = {
        ...templates,
        [activeTab]: editedText
      };

      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pharmacy_id: pharmacyId,
          templates: updatedTemplates
        })
      });

      if (response.ok) {
        setTemplates(updatedTemplates);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAI = async () => {
    setAiGenerating(true);
    setAiResponse('');
    setAiApplied(false);
    try {
      const response = await fetch('/api/gemini/personalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: promptPatientName,
          condition: activeTab,
          med_name: promptMedName,
          next_refill_date: '2026-06-19',
          language: aiLanguage,
          pharmacy_name: pharmacyName
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiResponse(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleApplyAI = () => {
    // Replace names back to templates keys to keep variables dynamic
    let genericTemplate = aiResponse
      .replace(new RegExp(promptPatientName, 'g'), '{patient_name}')
      .replace(new RegExp(pharmacyName, 'g'), '{pharmacy_name}')
      .replace(new RegExp(promptMedName, 'g'), '{med_name}')
      .replace(/2026-06-19/g, '{next_refill_date}');

    setEditedText(genericTemplate);
    setAiApplied(true);
    setTimeout(() => {
      setAiApplied(false);
      setAiResponse('');
    }, 1500);
  };

  // Preview helper
  const getRenderedPreview = () => {
    return editedText
      .replace(/{patient_name}/g, "Flavia Nabakooza")
      .replace(/{pharmacy_name}/g, pharmacyName)
      .replace(/{med_name}/g, activeTab === "Hypertension" ? "Amlodipine" : activeTab === "Diabetes" ? "Metformin" : activeTab === "HIV/ARVs" ? "Acriptega TLD" : "Chronic Pill")
      .replace(/{next_refill_date}/g, "2026-06-19");
  };

  const getThemeColorClass = () => {
    switch (colorTheme) {
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500';
      case 'indigo': return 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500';
      default: return 'bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500';
    }
  };

  const getThemeTextClass = () => {
    switch (colorTheme) {
      case 'emerald': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'indigo': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      default: return 'text-teal-600 bg-teal-50 border-teal-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-gray-500" />
        <div>
          <h2 className="text-xl font-medium text-gray-900 tracking-tight">Chronic Reminder Messages Panel</h2>
          <p className="text-xs text-gray-500 mt-1">Manage notification templates. Patients receive supportive, branded alerts tailored to high-density privacy laws.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Editing Column */}
        <div className="lg:col-span-8 space-y-4">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-100 gap-1 overflow-x-auto pb-0.5">
            {(['Hypertension', 'Diabetes', 'HIV/ARVs', 'General'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-3 text-xs font-semibold rounded-t-xl shrink-0 border-t-2 border-x transition-all duration-150 cursor-pointer ${
                  activeTab === tab
                    ? 'border-teal-500 text-teal-700 bg-teal-50/20 font-bold border-x-gray-200'
                    : 'border-transparent text-gray-400 hover:text-gray-600 bg-white'
                }`}
              >
                {tab === 'HIV/ARVs' ? 'HIV/ARVs (Privacy protected)' : tab}
              </button>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-700 uppercase">Interactive message template text</label>
              <div className="flex gap-2 text-[10px] text-gray-400">
                <span className="bg-slate-100 px-1 rounded">&#123;patient_name&#125;</span>
                <span className="bg-slate-100 px-1 rounded">&#123;pharmacy_name&#125;</span>
                <span className="bg-slate-100 px-1 rounded">&#123;med_name&#125;</span>
                <span className="bg-slate-100 px-1 rounded">&#123;next_refill_date&#125;</span>
              </div>
            </div>

            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              rows={4}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl p-4 text-xs font-sans text-gray-800 leading-normal focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="Enter message text with variables..."
            />
          </div>

          <div className="flex items-center justify-between">
            {activeTab === 'HIV/ARVs' && (
              <div className="flex items-center gap-1.5 text-[10px] text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Privacy mandate: Avoid raw illness labels. Refer to "wellness routine package" instead.
              </div>
            )}
            <div className="ml-auto flex items-center gap-2">
              {saveSuccess && (
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Template saved!
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer shadow-2xs ${getThemeColorClass()} disabled:opacity-50`}
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>

          {/* AI Generator Helper Option */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-blue-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
              Gemini LLM Assistant Workspace (Powered by Gemini 3.5 Flash)
            </div>
            <p className="text-[11px] text-gray-600">
              Generate a warm, custom message centered on African clinical wellness. Write directly in standard Luganda, Swahili, or English.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Target Language</label>
                <select
                  value={aiLanguage}
                  onChange={(e) => setAiLanguage(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none font-medium text-gray-800"
                >
                  <option value="English">English</option>
                  <option value="Luganda">Luganda (Uganda Central)</option>
                  <option value="Swahili">Swahili (East Africa)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Mock Patient Name</label>
                <input
                  type="text"
                  value={promptPatientName}
                  onChange={(e) => setPromptPatientName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Mock Medication Name</label>
                <input
                  type="text"
                  value={promptMedName}
                  onChange={(e) => setPromptMedName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between gap-4">
              <button
                onClick={handleGenerateAI}
                disabled={aiGenerating}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl px-4 py-2 cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                {aiGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Drafting translation...
                  </>
                ) : (
                  <>
                    <Languages className="w-3.5 h-3.5" /> AI Draft Message
                  </>
                )}
              </button>

              <span className="text-[10px] text-blue-500 italic">Sensitive terms (HIV) are safely masked into privacy tokens.</span>
            </div>

            {aiResponse && (
              <div className="bg-white border border-blue-200 rounded-xl p-3 text-xs space-y-2">
                <p className="font-semibold text-blue-800 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                  Draft Generated:
                </p>
                <p className="text-gray-700 italic border-l-2 border-blue-400 pl-2 leading-relaxed">&quot;{aiResponse}&quot;</p>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setAiResponse('')}
                    className="px-2.5 py-1 border border-gray-200 hover:bg-gray-50 rounded-lg text-[10px] font-medium text-gray-500"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleApplyAI}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 py-1 text-[10px] font-medium flex items-center gap-1"
                  >
                    {aiApplied ? <Check className="w-3.5 h-3.5" /> : 'Apply to Template'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Preview Panel (Mock Phone Screen) */}
        <div className="lg:col-span-4 flex flex-col items-center">
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-3 align-self-start">Live Dispatch Message Layout Preview</label>
          
          {/* Mock Smartphone Frame */}
          <div className="w-[280px] h-[450px] bg-slate-900 rounded-[36px] shadow-lg border-4 border-slate-800 relative flex flex-col overflow-hidden">
            {/* Camera notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-800 rounded-b-2xl z-20 flex items-center justify-around px-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-950"></div>
              <div className="w-8 h-1 rounded-full bg-slate-700"></div>
            </div>

            {/* Active Phone Screen Status Bar */}
            <div className="bg-[#075e54] text-white px-5 pt-6 pb-2 text-[10px] font-medium flex justify-between items-center select-none shrink-0 z-10">
              <span>8:03 AM</span>
              <div className="flex items-center gap-1.5">
                <span>4G</span>
                <span className="font-sans">🔋 84%</span>
              </div>
            </div>

            {/* Chat header (WhatsApp style) */}
            <div className="bg-[#075e54] text-white px-4 py-2 flex items-center gap-2 select-none shrink-0 z-10">
              <div className="w-7 h-7 rounded-full bg-slate-700/80 border border-slate-600 flex items-center justify-center font-bold text-[10px]">
                {pharmacyName.split(' ').map(n=>n[0]).join('').slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-xs leading-none truncate">{pharmacyName}</p>
                <p className="text-[8px] text-teal-100 leading-none mt-1">Verified Pharmacy Care Account</p>
              </div>
            </div>

            {/* Messaging Canvas */}
            <div className="flex-1 bg-[#ebe5df] p-3 text-[11px] overflow-y-auto space-y-3 relative">
              {/* Central Date stamp */}
              <div className="text-center">
                <span className="bg-white/80 text-gray-500 text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-md font-medium border border-gray-150">Today</span>
              </div>

              {/* Message Bubble */}
              <div className="bg-white/95 rounded-t-xl rounded-br-none rounded-bl-xl p-3 border border-gray-200/50 shadow-3xs text-left text-gray-800 relative max-w-[90%] ml-auto">
                <p className="text-[10px] leading-relaxed text-gray-900">{getRenderedPreview()}</p>
                <div className="flex justify-end gap-1.5 mt-1.5 text-[8px] text-gray-400">
                  <span>8:03 AM</span>
                  <span className="text-blue-500">✓✓</span>
                </div>
              </div>

              {/* Secure patient disclaimer */}
              <p className="text-[9px] text-gray-400 text-center select-none leading-normal px-2 mt-2">
                🔒 HIPAA Compliant encrypted messaging channels. Refill verification codes are bound securely.
              </p>
            </div>

            {/* Chat footer styling */}
            <div className="bg-gray-100 px-3 py-2 flex items-center gap-2 border-t border-gray-200 shrink-0">
              <div className="bg-white flex-1 rounded-full px-3 py-1.5 border border-gray-200/80 text-[10px] text-gray-400">
                Message...
              </div>
              <div className="w-7 h-7 bg-[#075e54] rounded-full text-white flex items-center justify-center text-xs shadow-xs">
                {">"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
