import React, { useState } from "react";
import { 
  Sliders, 
  Palette, 
  Code2, 
  ShieldCheck, 
  Users2, 
  BellRing, 
  Check, 
  RefreshCw,
  Sparkles,
  Lock,
  Mail,
  Zap
} from "lucide-react";

interface SettingsModuleProps {
  showToast: (message: string, description?: string, type?: "success" | "error" | "info") => void;
}

export default function SettingsModule({
  showToast,
}: SettingsModuleProps) {
  // Navigation for settings sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<
    "general" | "branding" | "api" | "security" | "roles" | "notifications"
  >("general");

  // State configurations cached locally for awesome realism
  const [platformName, setPlatformName] = useState("CareRefill Enterprise CRM");
  const [supportEmail, setSupportEmail] = useState("support@carerefill.com");
  const [primaryTheme, setPrimaryTheme] = useState("teal");
  const [useSmsGateway, setUseSmsGateway] = useState(true);
  const [apiEndpoint, setApiEndpoint] = useState("https://api.carerefill.com/v1/clinical-sync");
  const [mfaActive, setMfaActive] = useState(true);
  const [sessionExpiry, setSessionExpiry] = useState("60");

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Settings Saved", "Your configuration updates are durably preserved.", "success");
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title section */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-sans tracking-tight">Platform Configurations &amp; Settings</h3>
        <p className="text-xs text-gray-500 font-medium">Fine-tune system alerts, adjust security parameters, set clinic branding tokens, and audit developer endpoints.</p>
      </div>

      {/* Grid: Sidemenu on left & Configuration viewport on right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Sub-navigation Links Sidebar (4 columns) */}
        <div className="md:col-span-4 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-4 rounded-3xl space-y-1">
          
          <button
            onClick={() => setActiveSubTab("general")}
            className={`w-full text-left p-3.5 rounded-2xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
              activeSubTab === "general" 
                ? "bg-slate-50 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400 font-black border-l-4 border-emerald-500" 
                : "text-gray-500 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
            }`}
          >
            <Sliders className="w-4 h-4 shrink-0" />
            <span>General Settings</span>
          </button>

          <button
            onClick={() => setActiveSubTab("branding")}
            className={`w-full text-left p-3.5 rounded-2xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
              activeSubTab === "branding" 
                ? "bg-slate-50 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400 font-black border-l-4 border-emerald-500" 
                : "text-gray-500 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
            }`}
          >
            <Palette className="w-4 h-4 shrink-0" />
            <span>Branding Aesthetics</span>
          </button>

          <button
            onClick={() => setActiveSubTab("api")}
            className={`w-full text-left p-3.5 rounded-2xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
              activeSubTab === "api" 
                ? "bg-slate-50 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400 font-black border-l-4 border-emerald-500" 
                : "text-gray-500 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
            }`}
          >
            <Code2 className="w-4 h-4 shrink-0" />
            <span>API Gateway Config</span>
          </button>

          <button
            onClick={() => setActiveSubTab("security")}
            className={`w-full text-left p-3.5 rounded-2xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
              activeSubTab === "security" 
                ? "bg-slate-50 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400 font-black border-l-4 border-emerald-500" 
                : "text-gray-500 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Security Settings</span>
          </button>

          <button
            onClick={() => setActiveSubTab("roles")}
            className={`w-full text-left p-3.5 rounded-2xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
              activeSubTab === "roles" 
                ? "bg-slate-50 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400 font-black border-l-4 border-emerald-500" 
                : "text-gray-500 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
            }`}
          >
            <Users2 className="w-4 h-4 shrink-0" />
            <span>Role Management</span>
          </button>

          <button
            onClick={() => setActiveSubTab("notifications")}
            className={`w-full text-left p-3.5 rounded-2xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
              activeSubTab === "notifications" 
                ? "bg-slate-50 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400 font-black border-l-4 border-emerald-500" 
                : "text-gray-500 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
            }`}
          >
            <BellRing className="w-4 h-4 shrink-0" />
            <span>Notification Channels</span>
          </button>

        </div>

        {/* Viewport content area (8 columns) */}
        <div className="md:col-span-8 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-6 md:p-8 rounded-3xl min-h-[380px]">
          
          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {/* 1. General Settings Viewport */}
            {activeSubTab === "general" && (
              <div className="space-y-4">
                <div className="border-b pb-3 dark:border-slate-850">
                  <h4 className="text-sm font-sans font-black dark:text-white">General Platform Settings</h4>
                  <p className="text-[10px] text-gray-400">Configure global platform coordinate metadata</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Platform Branding Label</label>
                    <input 
                      type="text"
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Support Contact E-mail</label>
                    <input 
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono block">Clinical Timezone Reference</label>
                  <select className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl w-full text-xs font-semibold">
                    <option value="EAT">East Africa Time (EAT) - (UTC+03:00)</option>
                    <option value="GMT">Greenwich Mean Time (GMT) - (UTC+00:00)</option>
                  </select>
                </div>
              </div>
            )}

            {/* 2. Branding Aesthetics Viewport */}
            {activeSubTab === "branding" && (
              <div className="space-y-4">
                <div className="border-b pb-3 dark:border-slate-850">
                  <h4 className="text-sm font-sans font-black dark:text-white">Branding &amp; Theming Aesthetics</h4>
                  <p className="text-[10px] text-gray-400">Personalize corporate color accents and logo parameters</p>
                </div>

                <div className="space-y-3.5 text-xs">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Corporate Primary Aesthetics Color</label>
                  <div className="grid grid-cols-4 gap-3">
                    <button
                      type="button"
                      onClick={() => { setPrimaryTheme("teal"); showToast("Visual Accent Selected", "Teal palette activated.", "info"); }}
                      className={`p-3 rounded-xl border font-bold text-center capitalize cursor-pointer transition ${
                        primaryTheme === "teal" ? "border-teal-500 bg-teal-500/10 text-teal-700" : "border-slate-200"
                      }`}
                    >
                      Teal healthcare
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPrimaryTheme("blue"); showToast("Visual Accent Selected", "Blue medical palette activated.", "info"); }}
                      className={`p-3 rounded-xl border font-bold text-center capitalize cursor-pointer transition ${
                        primaryTheme === "blue" ? "border-blue-500 bg-blue-500/10 text-blue-700" : "border-slate-200"
                      }`}
                    >
                      Blue medical
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPrimaryTheme("emerald"); showToast("Visual Accent Selected", "Emerald clinical palette activated.", "info"); }}
                      className={`p-3 rounded-xl border font-bold text-center capitalize cursor-pointer transition ${
                        primaryTheme === "emerald" ? "border-emerald-500 bg-emerald-500/10 text-emerald-700" : "border-slate-200"
                      }`}
                    >
                      Emerald clean
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPrimaryTheme("soft-green"); showToast("Visual Accent Selected", "Soft green eco palette activated.", "info"); }}
                      className={`p-3 rounded-xl border font-bold text-center capitalize cursor-pointer transition ${
                        primaryTheme === "soft-green" ? "border-lime-500 bg-lime-500/10 text-lime-700" : "border-slate-200"
                      }`}
                    >
                      Soft eco green
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-emerald-600 block uppercase font-mono">System Preset Notice</span>
                  <p className="text-gray-500 leading-relaxed">Selecting an accent dynamically adapts highlights throughout statistics counters and timeline elements.</p>
                </div>
              </div>
            )}

            {/* 3. API Gateway Configuration Viewport */}
            {activeSubTab === "api" && (
              <div className="space-y-4">
                <div className="border-b pb-3 dark:border-slate-850">
                  <h4 className="text-sm font-sans font-black dark:text-white">Direct API &amp; Integrations Configurations</h4>
                  <p className="text-[10px] text-gray-400">Manage clinical EMR database syncing keys</p>
                </div>

                <div className="space-y-3.5 text-xs font-semibold">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">EMR Sync API Endpoint</label>
                    <input 
                      type="text"
                      value={apiEndpoint}
                      onChange={(e) => setApiEndpoint(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl focus:outline-none font-mono"
                    />
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950/45 rounded-xl border dark:border-slate-855 text-xs text-gray-500 leading-normal">
                    <p className="font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-gray-400" />
                      <span>Security credentials key parameter</span>
                    </p>
                    <span className="font-mono text-[10px] text-gray-400">Authorization Token ID: bearer_sk_live_carerefill_f7g9a8h76stg294hasb</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Security Settings Viewport */}
            {activeSubTab === "security" && (
              <div className="space-y-4">
                <div className="border-b pb-3 dark:border-slate-850">
                  <h4 className="text-sm font-sans font-black dark:text-white">Compliance &amp; Security Settings</h4>
                  <p className="text-[10px] text-gray-400">Lock down patient data coordinate records</p>
                </div>

                <div className="space-y-4 text-xs font-semibold">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl">
                    <div>
                      <h5 className="font-bold text-gray-800 dark:text-slate-200">Force Multi-Factor Authentication (MFA)</h5>
                      <p className="text-[10px] font-medium text-gray-400">Require automated OTP codes on clinical team login</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMfaActive(!mfaActive)}
                      className={`p-1.5 px-3 rounded-lg text-[10px] font-black uppercase transition cursor-pointer ${
                        mfaActive ? "bg-emerald-600 text-white" : "bg-gray-205 text-gray-650"
                      }`}
                    >
                      {mfaActive ? "Mandatory" : "Optional"}
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-strong font-mono">Session Expiry Lock (Minutes)</label>
                    <input 
                      type="number"
                      value={sessionExpiry}
                      onChange={(e) => setSessionExpiry(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. Role Management Viewport */}
            {activeSubTab === "roles" && (
              <div className="space-y-4">
                <div className="border-b pb-3 dark:border-slate-850">
                  <h4 className="text-sm font-sans font-black dark:text-white">Role Matrix &amp; Permissions</h4>
                  <p className="text-[10px] text-gray-400">Configure permission boundaries for care coordinators</p>
                </div>

                <div className="space-y-2.5 text-xs font-semibold text-gray-700 dark:text-slate-300">
                  <div className="p-3 bg-[#FAFAFA] dark:bg-slate-950/30 rounded-xl border dark:border-slate-850 flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-gray-950 dark:text-white">SaaS Administrators</p>
                      <span className="text-[9.5px] text-gray-400 font-medium font-mono">Complete override access • Multi-tenancies approvals</span>
                    </div>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-700 font-black px-2 py-0.5 rounded-full uppercase font-mono">Full control</span>
                  </div>

                  <div className="p-3 bg-[#FAFAFA] dark:bg-slate-950/30 rounded-xl border dark:border-slate-850 flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-gray-950 dark:text-white">Executive Clinicians</p>
                      <span className="text-[9.5px] text-gray-400 font-medium font-mono">Medication catalogs management • Adherence reports view</span>
                    </div>
                    <span className="text-[9px] bg-blue-500/10 text-blue-700 font-black px-2 py-0.5 rounded-full uppercase font-mono">Clinical write</span>
                  </div>

                  <div className="p-3 bg-[#FAFAFA] dark:bg-slate-950/30 rounded-xl border dark:border-slate-850 flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-gray-950 dark:text-white">Staff Attendants</p>
                      <span className="text-[9.5px] text-gray-400 font-medium font-mono">Dispatch order approvals • Queue reminders notifications</span>
                    </div>
                    <span className="text-[9px] bg-amber-500/10 text-amber-700 font-black px-2 py-0.5 rounded-full uppercase font-mono">Attendant operations</span>
                  </div>
                </div>
              </div>
            )}

            {/* 6. Notification Preferences Viewport */}
            {activeSubTab === "notifications" && (
              <div className="space-y-4">
                <div className="border-b pb-3 dark:border-slate-850">
                  <h4 className="text-sm font-sans font-black dark:text-white">Alert Dispatch Notifications</h4>
                  <p className="text-[10px] text-gray-400">Designate outbound reminder alert gateways</p>
                </div>

                <div className="space-y-4 text-xs font-semibold text-gray-700 dark:text-slate-350">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl">
                    <div>
                      <p className="font-bold text-gray-800 dark:text-slate-200">Outbound SMS Alerts Gateway</p>
                      <p className="text-[10px] text-gray-400">Utilize Twilio / local SMS gateways for cellular dispatch</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUseSmsGateway(!useSmsGateway)}
                      className={`p-1.5 px-3 rounded-lg text-[10px] font-black uppercase transition cursor-pointer ${
                        useSmsGateway ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-650"
                      }`}
                    >
                      {useSmsGateway ? "Active" : "Bypassed"}
                    </button>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950/45 rounded-xl border dark:border-slate-855 text-xs text-gray-500 leading-normal">
                    <p className="font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-gray-400 text-emerald-600" />
                      <span>WhatsApp Cloud API Service</span>
                    </p>
                    <span className="text-[10.5px] text-gray-450 leading-relaxed font-sans">Primary WhatsApp dispatch utilizes fully encrypted automated client webhooks instantly triggered by cron chronometers.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Form Save Button */}
            <div className="border-t dark:border-slate-800 pt-5 flex items-center justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow-3xs transition active:scale-95"
              >
                Save configurations
              </button>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
}
