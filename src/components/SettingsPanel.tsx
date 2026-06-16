import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Smartphone, 
  Sliders, 
  Palette, 
  Volume2, 
  Sparkles, 
  Languages, 
  Check, 
  Layers, 
  BellRing, 
  HelpCircle,
  Clock,
  Play,
  Users,
  Calendar,
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
  MonitorSmartphone,
  Info,
  Save
} from 'lucide-react';

interface SettingsPanelProps {
  pharmacyId?: string;
  currentPharmacyName?: string;
  currentPhoneNumber?: string;
  currentAddress?: string;
  onBrandingSave?: (data: { name: string; phone: string; website: string; address: string; logoUrl?: string }) => void;
  showGlobalToast?: (msg: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export default function SettingsPanel({ 
  pharmacyId = 'pharm-001', 
  currentPharmacyName = 'City Pharmacy Kampala',
  currentPhoneNumber = '+256 700 123 456',
  currentAddress = 'Plot 14, Kampala Road, Kampala',
  onBrandingSave,
  showGlobalToast
}: SettingsPanelProps) {
  
  // Tab states matching the mockup exactly
  const [activeTab, setActiveTab] = useState<'branding' | 'roles' | 'scheduler' | 'notifications' | 'how-it-works' | 'pwa'>('branding');

  // Load / Initialize dynamic branding state
  const [brandName, setBrandName] = useState(() => {
    return localStorage.getItem(`carerefill_brand_name_${pharmacyId}`) || currentPharmacyName;
  });
  const [brandPhone, setBrandPhone] = useState(() => {
    return localStorage.getItem(`carerefill_brand_phone_${pharmacyId}`) || currentPhoneNumber;
  });
  const [brandWebsite, setBrandWebsite] = useState(() => {
    return localStorage.getItem(`carerefill_brand_website_${pharmacyId}`) || 'citypharmacy.ug';
  });
  const [brandAddress, setBrandAddress] = useState(() => {
    return localStorage.getItem(`carerefill_brand_address_${pharmacyId}`) || currentAddress;
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(() => {
    return localStorage.getItem(`carerefill_brand_logo_${pharmacyId}`) || null;
  });

  // Notification states
  const [channels, setChannels] = useState({
    sms: true,
    whatsapp: true,
    voice: false
  });
  const [notificationVolume, setNotificationVolume] = useState(70);
  const [soundPitch, setSoundPitch] = useState<'soothing' | 'alert' | 'double'>('soothing');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'lg' | 'sw'>('en');

  // Scheduler states
  const [cronTime, setCronTime] = useState('08:00');
  const [cronFrequency, setCronFrequency] = useState('daily');
  const [dispatchBufferDays, setDispatchBufferDays] = useState(7);

  // PWA states
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [pwaOfflineCache, setPwaOfflineCache] = useState(true);

  // Saved alerts
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state if props change and not customized
  useEffect(() => {
    const customized = localStorage.getItem(`carerefill_brand_name_${pharmacyId}`);
    if (!customized) {
      setBrandName(currentPharmacyName);
      setBrandPhone(currentPhoneNumber);
      setBrandAddress(currentAddress);
    }
  }, [currentPharmacyName, currentPhoneNumber, currentAddress, pharmacyId]);

  // Handle saving the branding values
  const handleSaveBranding = () => {
    localStorage.setItem(`carerefill_brand_name_${pharmacyId}`, brandName);
    localStorage.setItem(`carerefill_brand_phone_${pharmacyId}`, brandPhone);
    localStorage.setItem(`carerefill_brand_website_${pharmacyId}`, brandWebsite);
    localStorage.setItem(`carerefill_brand_address_${pharmacyId}`, brandAddress);
    if (logoPreview) {
      localStorage.setItem(`carerefill_brand_logo_${pharmacyId}`, logoPreview);
    }

    if (onBrandingSave) {
      onBrandingSave({
        name: brandName,
        phone: brandPhone,
        website: brandWebsite,
        address: brandAddress,
        logoUrl: logoPreview || undefined
      });
    }

    setSavedSuccess(true);
    if (showGlobalToast) {
      showGlobalToast(
        "Branding Saved", 
        `Successfully updated. All notifications are now branded as ${brandName}.`, 
        "success"
      );
    } else {
      alert("Settings saved successfully!");
    }
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Sound Synth alert chimer for verification
  const playSynthesizedChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      const vol = notificationVolume / 100;
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(vol * 0.25, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
      
      if (soundPitch === 'soothing') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 high chime
        osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.3);
      } else if (soundPitch === 'alert') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 alert tone
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
        osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.12); // E6
      }
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.9);
    } catch (e) {
      console.warn("AudioContext block standard preview", e);
    }
  };

  // Mock logo upload action
  const handleLogoUpload = () => {
    // Inject custom mock logo or reset to provided one
    const mockLogos = [
      'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=100&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=100&auto=format&fit=crop&q=60'
    ];
    const pickedLogo = mockLogos[Math.floor(Math.random() * mockLogos.length)];
    setLogoPreview(pickedLogo);
    if (showGlobalToast) {
      showGlobalToast("Logo uploaded", "Placeholder logo file loaded successfully.", "info");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-8 font-sans max-w-5xl mx-auto">
      
      {/* Top Header branding section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-150 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-brand-accent-bg text-brand-green rounded-2xl">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 font-sans tracking-tight">Clinical Settings Hub</h3>
            <p className="text-xs text-gray-400">
              Update branch coordinate logs, custom branding, notification templates, automatic chronometers, access controls, and install options.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="bg-lime-50 dark:bg-lime-950/40 border border-lime-200 dark:border-lime-900/60 text-[#71B20A] text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 animate-bounce">
            <Check className="w-4 h-4" />
            <span>Preferences saved!</span>
          </div>
        )}
      </div>

      {/* Internal Ribbon tabs styled specifically for white and lemon green */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 dark:bg-slate-950/40 p-1.5 rounded-2xl border border-gray-100 dark:border-slate-850">
        {[
          { id: 'branding', label: 'Branding', icon: Building2 },
          { id: 'roles', label: 'Roles & access', icon: Users },
          { id: 'scheduler', label: 'Scheduler', icon: Clock },
          { id: 'notifications', label: 'Notification Settings', icon: BellRing },
          { id: 'how-it-works', label: 'How it works', icon: Info },
          { id: 'pwa', label: 'PWA Mode', icon: MonitorSmartphone }
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-brand-green text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-white/70 dark:hover:bg-slate-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Workspace Sections Content container */}
      <div className="pt-2">
        
        {/* SUBTAB 1: Branding and Message Preview */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Form Fields */}
              <div className="lg:col-span-7 bg-slate-50/50 dark:bg-slate-950/20 rounded-3xl p-6 border border-gray-100 dark:border-slate-850 space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] bg-brand-green/10 text-brand-green uppercase font-black tracking-widest px-2.5 py-1 rounded-full">Pharmacy Profile</span>
                  <h4 className="text-sm font-extrabold text-gray-800 dark:text-gray-200">Pharmacy Branding Details</h4>
                </div>

                <div className="space-y-4">
                  {/* Pharmacy Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Pharmacy name</label>
                    <input 
                      type="text" 
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-3 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-green font-semibold shadow-2xs"
                      placeholder="e.g. City Pharmacy Kampala"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Phone number</label>
                    <input 
                      type="text" 
                      value={brandPhone}
                      onChange={(e) => setBrandPhone(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-3 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-green font-mono font-semibold shadow-2xs"
                      placeholder="e.g. +256 700 123 456"
                    />
                  </div>

                  {/* Website Link */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Website</label>
                    <input 
                      type="text" 
                      value={brandWebsite}
                      onChange={(e) => setBrandWebsite(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-3 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-green font-semibold shadow-2xs"
                      placeholder="e.g. citypharmacy.ug"
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Address</label>
                    <textarea 
                      value={brandAddress}
                      onChange={(e) => setBrandAddress(e.target.value)}
                      rows={2}
                      className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-3 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-green font-semibold shadow-2xs"
                      placeholder="e.g. Plot 14, Kampala Road, Kampala"
                    />
                  </div>

                  {/* Logo Upload Placeholder */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Logo</label>
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-3 rounded-xl shadow-2xs">
                      {logoPreview ? (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-150">
                          <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-dashed border-gray-200 dark:border-slate-800">
                          <Building2 className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="flex-1 text-left">
                        <p className="text-[10px] text-gray-500 font-bold mb-1">Upload logo (PNG/JPG)</p>
                        <button
                          type="button"
                          onClick={handleLogoUpload}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-[9px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <UploadCloud className="w-3 h-3 text-gray-400" />
                          <span>Simulate Upload</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={handleSaveBranding}
                    className="w-full bg-brand-green hover:bg-brand-green-hover text-white py-3 rounded-2xl text-xs font-black tracking-wider uppercase transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Branding Configurations</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Premium Message Preview (Reactive values) */}
              <div className="lg:col-span-5 flex flex-col justify-between bg-[#F4FCE3]/40 dark:bg-slate-950/30 rounded-3xl p-6 border border-lime-100 dark:border-slate-850 space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 text-[#599E05] dark:text-lime-400 font-extrabold text-[10px] uppercase tracking-wider mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#84CC16]"></span>
                    <span>Real-time Notification Preview</span>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-850 p-5 rounded-2xl shadow-3xs space-y-4 text-xs text-gray-800 dark:text-gray-200">
                    <div className="pb-3 border-b border-gray-50 dark:border-slate-850 flex justify-between items-center">
                      <span className="text-[9px] font-mono text-gray-400 lowercase italic">channel: automatic sms</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>

                    <p className="font-sans font-medium text-gray-800 dark:text-gray-200 leading-relaxed space-y-2">
                      Hello Sarah,
                      <br /><br />
                      This is <strong className="text-brand-green">{brandName || "City Pharmacy Kampala"}</strong>.
                      <br /><br />
                      Your diabetes medication will run out on <strong>20 July</strong>.
                      <br /><br />
                      Please visit us for your refill.
                    </p>

                    <div className="border-t border-dotted border-gray-100 dark:border-slate-850 pt-4 space-y-1 font-mono text-[10px] text-gray-400">
                      <p className="text-gray-700 dark:text-gray-300 font-bold">{brandName || "City Pharmacy Kampala"}</p>
                      <p>{brandAddress || "Plot 14, Kampala Road, Kampala"}</p>
                      <p>{brandPhone || "+256 700 123 456"}</p>
                      <p className="text-[#71B20A] underline lowercase">{brandWebsite || "citypharmacy.ug"}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/60 p-4 rounded-xl border border-dotted border-[#84CC16]/30 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                  <p>
                    <strong>Adherence Hint:</strong> Saving updates the template variables dispatched via the Twilio SMS network and WhatsApp Business nodes within 2 minutes.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SUBTAB 2: Roles and Access permissions mock */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-950/20 p-5 sm:p-6 rounded-3xl border border-gray-100 dark:border-slate-850 space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-green" />
                <h4 className="text-sm font-extrabold text-gray-800 dark:text-gray-150">Clinic Staff Roles & Access Authorization Protocols</h4>
              </div>
              <p className="text-xs text-gray-400 max-w-2xl">
                Authorize specific nursing, pharmacological support, or auxiliary administrative desk profiles. Each profile is hardcoded to distinct data fields.
              </p>

              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-800 text-[10px] text-gray-400 uppercase font-bold">
                      <th className="py-2.5">User Profile</th>
                      <th className="py-2.5">Position Role</th>
                      <th className="py-2.5">Permissions Status</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-850">
                    {[
                      { email: 'viannejonny@gmail.com', role: 'Admin', badge: 'badge-purple-custom', desc: 'Full core tenant database access, API keys visibility & master branch configurations.' },
                      { email: 'mukasa.sarah@citypharm.ug', role: 'Pharmacist', badge: 'badge-green-custom', desc: 'Can process refills, add patients, configure vitals metrics, and answer consultas.' },
                      { email: 'namutebi.proscovia@citypharm.ug', role: 'Desk Nurse', badge: 'badge-blue-custom', desc: 'Authorized to dispatch SMS reminders, review AI personalized messages, and register patients.' }
                    ].map((user) => (
                      <tr key={user.email} className="hover:bg-slate-100/40 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 font-semibold text-gray-800 dark:text-gray-200">{user.email}</td>
                        <td className="py-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${user.badge}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 text-gray-400 font-medium max-w-xs truncate" title={user.desc}>{user.desc}</td>
                        <td className="py-3 text-right">
                          <button 
                            type="button" 
                            onClick={() => showGlobalToast?.("Update Restricted", "Requires Super-Admin role auth permissions.", "error")}
                            className="text-brand-green font-bold text-[11px] hover:underline cursor-pointer"
                          >
                            Edit Access
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: Scheduler and automated triggers options */}
        {activeTab === 'scheduler' && (
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-950/20 p-5 sm:p-6 rounded-3xl border border-gray-100 dark:border-slate-850 space-y-5">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-green" />
                <h4 className="text-sm font-extrabold text-gray-800 dark:text-gray-150">Automated Dispatch Chronometer</h4>
              </div>
              <p className="text-xs text-gray-400">
                Setup the automated scheduler to sweep medication registries and query run-out thresholds.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Trigger Time (Daily)</label>
                  <input 
                    type="time" 
                    value={cronTime} 
                    onChange={(e) => setCronTime(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-205 dark:border-slate-800 p-3 rounded-xl text-xs font-mono font-black"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Trigger Frequency</label>
                  <select 
                    value={cronFrequency} 
                    onChange={(e) => setCronFrequency(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-205 dark:border-slate-800 p-3 rounded-xl text-xs font-semibold"
                  >
                    <option value="daily">Every Morning (Recommended)</option>
                    <option value="twicedaily">Morning & Evening (Dual Shift)</option>
                    <option value="weekly">Every Monday morning only</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Pre-Alert Warning Period</label>
                  <select 
                    value={dispatchBufferDays} 
                    onChange={(e) => setDispatchBufferDays(parseInt(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-205 dark:border-slate-800 p-3 rounded-xl text-xs font-semibold"
                  >
                    <option value={3}>3 Days before runout date</option>
                    <option value={7}>7 Days before runout date (Standard)</option>
                    <option value={10}>10 Days before runout date</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    showGlobalToast?.("Chronometer Updated", `Pre-empt and check cron armed for daily dispatches at ${cronTime}.`, "success");
                  }}
                  className="px-4 py-2 bg-brand-green hover:bg-brand-green-hover text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Apply Chronometer Intervals
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 4: Notification settings Luganda translation chimes volume */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Box 1: Toggle delivery channels */}
              <div className="bg-slate-50 dark:bg-slate-950/20 p-5 rounded-3xl border border-gray-100 dark:border-slate-850 space-y-4 text-left">
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-brand-green" />
                  <h4 className="text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Enabled Delivery Modes</h4>
                </div>

                <div className="space-y-3.5 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-400">
                    <input 
                      type="checkbox" 
                      checked={channels.sms} 
                      onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
                      className="w-4 h-4 rounded text-brand-green accent-brand-green focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <p>Enable SMS Notifications</p>
                      <span className="text-[10px] text-gray-400 font-normal">Dispatches brief direct textual SMS alarms.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-400">
                    <input 
                      type="checkbox" 
                      checked={channels.whatsapp} 
                      onChange={(e) => setChannels({ ...channels, whatsapp: e.target.checked })}
                      className="w-4 h-4 rounded text-brand-green accent-brand-green focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <p>Enable Two-way WhatsApp Integration</p>
                      <span className="text-[10px] text-gray-400 font-normal">Triggers rich interactive message templates.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-400">
                    <input 
                      type="checkbox" 
                      checked={channels.voice} 
                      onChange={(e) => setChannels({ ...channels, voice: e.target.checked })}
                      className="w-4 h-4 rounded text-brand-green accent-brand-green focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <p>Enable Automated Voice Call Reminders</p>
                      <span className="text-[10px] text-gray-400 font-normal">Enables automated Luganda/English robotic phone signals.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Box 2: Volume chimes synthesizer */}
              <div className="bg-slate-50 dark:bg-slate-950/20 p-5 rounded-3xl border border-gray-100 dark:border-slate-850 space-y-4">
                <div className="flex items-center gap-2 text-slate-800 dark:text-gray-300">
                  <Volume2 className="w-4 h-4 text-brand-green" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-400">Audio Feedback Chimes</h4>
                </div>
                <p className="text-xs text-gray-400">
                  Configure real-time chime warnings played whenever patient compliance drops below thresholds.
                </p>

                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest block">Signal Pitch</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['soothing', 'alert', 'double'].map((pitch) => (
                        <button
                          key={pitch}
                          type="button"
                          onClick={() => setSoundPitch(pitch as any)}
                          className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer text-xs uppercase font-bold ${
                            soundPitch === pitch 
                              ? 'bg-brand-green text-white border-brand-green' 
                              : 'bg-white dark:bg-slate-900 text-gray-500 border-gray-200 dark:border-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          {pitch}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                      <span>Volume ({notificationVolume}%)</span>
                      <button
                        type="button"
                        onClick={playSynthesizedChime}
                        className="bg-brand-accent-bg text-brand-green font-black text-[9px] px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3" />
                        Test Tone
                      </button>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={notificationVolume}
                      onChange={(e) => setNotificationVolume(parseInt(e.target.value))}
                      className="w-full accent-brand-green cursor-pointer"
                    />
                  </div>
                </div>
              </div>

            </div>

            <div className="bg-slate-50 dark:bg-slate-950/20 p-5 rounded-3xl border border-gray-100 dark:border-slate-850 space-y-4">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-brand-green" />
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Regional Dialect Adaptation</h4>
              </div>
              <p className="text-xs text-gray-400">
                Select default translation dialect to support patients with limited English literacy. Auto-transcripts templates dispatch in the matching dialect.
              </p>

              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { id: 'en', label: '🇬🇧 English', desc: 'Direct technical instruction translation' },
                  { id: 'lg', label: '🇺🇬 Luganda (Central)', desc: 'Friendly oral dialect templates' },
                  { id: 'sw', label: '🇰🇪 Kiswahili (East Africa)', desc: 'Simplified medical-care phrasing' }
                ].map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setSelectedLanguage(lang.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                      selectedLanguage === lang.id
                        ? 'bg-brand-accent-bg border-brand-green'
                        : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-black text-gray-800 dark:text-gray-150">{lang.label}</span>
                    <span className="text-[9px] text-gray-400 leading-tight mt-1">{lang.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 5: Instruction Guide */}
        {activeTab === 'how-it-works' && (
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-950/20 p-6 rounded-3xl border border-gray-100 dark:border-slate-850 space-y-4">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-brand-green" />
                <h4 className="text-sm font-extrabold text-gray-800 dark:text-gray-150">CareRefill Coordination Framework Guidelines</h4>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Welcome to City Pharmacy Kampala Adherence Platform! CareRefill provides structured compliance tracking for chronic patient populations (Diabetes, Hypertension, Asthma, IVF, HIV/ARV). Here is how the system coordinates the loops:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                {[
                  { step: '01', title: 'Registry Log', text: 'Physicians log chronic patients and append medication duration runs (standard 30 or 90 day packs).' },
                  { step: '02', title: 'Automated Sweep', text: 'CareRefill Chronometer sweeps the database nightly, identifying patients approaching 7-day runouts.' },
                  { step: '03', title: 'Multi-Channel Alert', text: 'Automated SMS or WhatsApp templates are compiled and dispatched directly using Local Gateway nodes.' },
                  { step: '04', title: 'Two-Way Compliance', text: 'Patients reply to confirm, logging refills. If non-compliant, care alerts triage patients to high-risk monitors.' }
                ].map((guide) => (
                  <div key={guide.step} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-850 space-y-1.5">
                    <span className="text-xs font-black text-brand-green font-mono block">{guide.step}</span>
                    <h5 className="text-xs font-extrabold text-gray-800 dark:text-gray-200">{guide.title}</h5>
                    <p className="text-[10px] text-gray-400 leading-relaxed font-medium">{guide.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 6: Progressive Web App installation simulator */}
        {activeTab === 'pwa' && (
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-950/20 p-6 rounded-3xl border border-gray-100 dark:border-slate-850 space-y-5">
              <div className="flex items-center gap-2">
                <MonitorSmartphone className="w-5 h-5 text-brand-green" />
                <h4 className="text-sm font-extrabold text-gray-800 dark:text-gray-150">Progressive Web Application (PWA) Settings</h4>
              </div>
              
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-150 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3 text-left">
                  <div className="p-2.5 bg-lime-50 rounded-xl text-[#71B20A] shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-gray-900 dark:text-gray-150">PWA Manifest & Service Worker Registered</h5>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                      This application contains active PWA manifest tags at <code>/manifest.json</code> and installs an offline cached asset synchronization service worker at <code>sw.js</code>.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-lime-50 text-[#71B20A] text-[9px] font-black uppercase tracking-wider rounded-lg border border-lime-150 self-start md:self-auto uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#84CC16] animate-pulse"></span>
                    installed
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-850 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-gray-700 dark:text-gray-300">Offline Fallback Syncing</span>
                    <input 
                      type="checkbox" 
                      checked={pwaOfflineCache} 
                      onChange={(e) => setPwaOfflineCache(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-green accent-brand-green focus:ring-0 cursor-pointer"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                    Pre-caches critical HTML, Javascript, CSS stylesheet bundles, and specialized vector medical icons for fully offline clinic lookup coordinate logs.
                  </p>
                </div>

                <div className="bg-slate-100/50 dark:bg-slate-950/40 p-4 rounded-xl border border-gray-100 dark:border-slate-850 flex items-start gap-2 text-gray-500">
                  <ShieldCheck className="w-4 h-4 text-[#71B20A] shrink-0 mt-0.5" />
                  <p className="text-[10px] leading-relaxed">
                    <strong>Direct Install Tip:</strong> To pin the CareRefill patient CRM application directly to your physical tablet or mobile home screen, click the browser Share option and select <strong>"Add to Home Screen"</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
