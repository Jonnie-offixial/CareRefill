import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Palette, 
  Volume2, 
  Sparkles, 
  Languages, 
  Check, 
  Layers, 
  BellRing, 
  Smartphone, 
  HelpCircle,
  Clock,
  Play
} from 'lucide-react';

interface SettingsPanelProps {
  onSettingsChange?: (newSettings: any) => void;
}

export default function SettingsPanel({ onSettingsChange }: SettingsPanelProps) {
  // Read existing preferences from localStorage or fallback
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('ug_outreach_preferences');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      themeMode: 'default', // 'default' | 'dark' | 'sepia'
      accentColor: 'teal', // 'teal' | 'indigo' | 'emerald' | 'crimson'
      fontScale: 'medium', // 'small' | 'medium' | 'large'
      appLanguage: 'en', // 'en' | 'lg' (Luganda) | 'sw' (Swahili)
      notificationVolume: 70,
      soundPitch: 'soothing', // 'soothing' | 'alert' | 'double'
      advanceAutomationSpeed: 'realtime' // 'realtime' | 'fast'
    };
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync preferences back to localStorage and prop
  const updatePreference = (key: string, value: any) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    localStorage.setItem('ug_outreach_preferences', JSON.stringify(updated));
    if (onSettingsChange) {
      onSettingsChange(updated);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);

    // Apply font scale or dark attributes to body element
    applyThemeProperties(updated);
  };

  const applyThemeProperties = (prefs: typeof preferences) => {
    // Sync font scale class
    const root = document.documentElement;
    root.classList.remove('text-size-small', 'text-size-medium', 'text-size-large');
    if (prefs.fontScale === 'small') {
      root.classList.add('text-size-small');
    } else if (prefs.fontScale === 'large') {
      root.classList.add('text-size-large');
    } else {
      root.classList.add('text-size-medium');
    }
  };

  // Run on mount
  useEffect(() => {
    applyThemeProperties(preferences);
  }, []);

  // Use simple AudioContext synthesizer to create a live alert chime!
  const playSynthesizedChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      const vol = preferences.notificationVolume / 100;
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(vol * 0.25, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
      
      if (preferences.soundPitch === 'soothing') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 high chime
        osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.3);
      } else if (preferences.soundPitch === 'alert') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 alert tone
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      } else {
        // double digital chime
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

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-8 font-sans max-w-4xl mx-auto">
      
      {/* Header and Branding */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-50 rounded-2xl text-teal-600">
            <Sliders className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-950 font-sans">System Personalization Desk</h3>
            <p className="text-xs text-gray-400 font-sans">
              Tailor and calibrate visual rendering, regional languages, alert sound chimes, and system priority gates.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-xl self-start sm:self-auto flex items-center gap-1.5 animate-bounce">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Preferences updated!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* SECTION 1: Visual Theme Overrides (Bento Box 1) */}
        <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-slate-800">
            <Palette className="w-4 h-4 text-teal-600" />
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-700">UI Theme & Look Feel</h4>
          </div>
          <p className="text-xs text-gray-400 max-w-xs">
            Switch UI accents and choose high contrast rendering to optimize device battery and outdoor health center glare.
          </p>

          <div className="space-y-4 pt-2">
            {/* Color Accent Tint */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Active Workspace Tint</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'teal', label: 'Teal Coast', bg: 'bg-teal-500 border-teal-300' },
                  { id: 'emerald', label: 'Uganda Hills', bg: 'bg-emerald-500 border-emerald-300' },
                  { id: 'indigo', label: 'Bwindi Blue', bg: 'bg-indigo-600 border-indigo-400' },
                  { id: 'crimson', label: 'Amber Flame', bg: 'bg-rose-600 border-rose-400' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => updatePreference('accentColor', item.id)}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all text-[11px] cursor-pointer ${
                      preferences.accentColor === item.id 
                        ? 'bg-white border-slate-900 shadow-xs scale-102 text-gray-950 font-extrabold' 
                        : 'bg-white/80 hover:bg-white text-slate-500 border-slate-200'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${item.bg}`} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Contrast Mode / Theme mode */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Appearance Mode</label>
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
                {[
                  { id: 'default', label: 'Tenant Preset' },
                  { id: 'dark', label: 'Ebony Adherence' },
                  { id: 'sepia', label: 'Sepia Reader' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => updatePreference('themeMode', item.id)}
                    className={`py-1.5 text-center rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      preferences.themeMode === item.id 
                        ? 'bg-slate-900 text-white shadow-xs font-bold' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Typography & Regional Localizer Dialect (Bento Box 2) */}
        <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-slate-800">
            <Languages className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-700">Localization & Display Size</h4>
          </div>
          <p className="text-xs text-gray-400 max-w-xs">
            Translate primary UI markers, instructions & text sizes to facilitate quick tablet entry inside crowded clinical counters.
          </p>

          <div className="space-y-4 pt-2">
            {/* App Languages */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Primary Regional Language</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'en', code: '🇬🇧', label: 'English' },
                  { id: 'lg', code: '🇺🇬', label: 'Luganda' },
                  { id: 'sw', code: '🇰🇪', label: 'Kiswahili' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => updatePreference('appLanguage', item.id)}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      preferences.appLanguage === item.id 
                        ? 'bg-white border-slate-950 text-slate-950 font-black' 
                        : 'bg-white/80 hover:bg-white text-slate-500 border-slate-200'
                    }`}
                  >
                    <span className="text-sm">{item.code}</span>
                    <span className="text-[11px] mt-0.5">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Scale sizing */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Clinical Font Scale</label>
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
                {[
                  { id: 'small', label: 'Compact' },
                  { id: 'medium', label: 'Normal' },
                  { id: 'large', label: 'High Visibility' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => updatePreference('fontScale', item.id)}
                    className={`py-1.5 text-center rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      preferences.fontScale === item.id 
                        ? 'bg-slate-900 text-white shadow-xs font-bold' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Live SMS Audio Chimes & Alert Synthesizers (Bento Box 3) */}
        <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-slate-800">
            <Volume2 className="w-4 h-4 text-indigo-600" />
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-700">Digital Alert Synthesizer</h4>
          </div>
          <p className="text-xs text-gray-400">
            Simulate standard sound notifications during critical pill-due states. Uses browser Web Audio synthesizer.
          </p>

          <div className="space-y-4 pt-1">
            {/* Tone Pitch selectors */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Alert Audio Signal Profile</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'soothing', label: 'Sine Wave' },
                  { id: 'alert', label: 'Pulse Wave' },
                  { id: 'double', label: 'Double Digital' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => updatePreference('soundPitch', item.id)}
                    className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer text-xs ${
                      preferences.soundPitch === item.id 
                        ? 'bg-white border-slate-950 text-slate-950 font-black shadow-xs' 
                        : 'bg-white/80 hover:bg-white text-slate-500 border-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Alert sound simulation tester */}
            <div className="bg-white rounded-2xl p-3 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
                <span>Notification Volume ({preferences.notificationVolume}%)</span>
                <button
                  type="button"
                  onClick={playSynthesizedChime}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3 text-indigo-600" />
                  Test Chime
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={preferences.notificationVolume}
                onChange={(e) => updatePreference('notificationVolume', parseInt(e.target.value))}
                className="w-full accent-indigo-650 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: Necessary Settings: SMS Delivery Gates & Simulation Clock advanced speed (Bento Box 4) */}
        <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-slate-800">
            <Smartphone className="w-4 h-4 text-purple-600" />
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-700">Adherence SIM Gateway Protocol</h4>
          </div>
          <p className="text-xs text-gray-400">
            Configure default carrier dispatch priorities and automation triggers for daily East Africa SMS compliance alerts.
          </p>

          <div className="space-y-4 pt-1">
            {/* Default dispatch channel */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Active Telecom Gateway Channel</label>
              <select
                value={preferences.advanceAutomationSpeed}
                onChange={(e) => updatePreference('advanceAutomationSpeed', e.target.value)}
                className="w-full bg-white border border-slate-200 p-2 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-800"
              >
                <option value="realtime">🌐 MTN Uganda Premium SIM Gateway (Fastest Delivery)</option>
                <option value="airtel">🌐 Airtel Uganda Local Cell Tower Transit</option>
                <option value="safaricom">🌐 Safaricom Regional Cross-Border Roaming Hub</option>
                <option value="simulation">🤖 Sandboxed Local GSM Simulator Node</option>
              </select>
            </div>

            {/* Quick Helper guidelines */}
            <div className="p-3 bg-teal-50/50 rounded-2xl border border-teal-100 flex gap-2.5 items-start text-[11px] leading-relaxed text-teal-900">
              <HelpCircle className="w-4 h-4 mt-0.5 text-teal-600 shrink-0" />
              <span>
                <strong>System Tip:</strong> Preference selections are backed up securely using device-isolated <code>localStorage</code>. They auto-adjust visual frames upon startup, optimizing your clinical adherence desk experience.
              </span>
            </div>
          </div>
        </div>
        
      </div>

      {/* Save action/confirm panel */}
      <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans text-xs">
        <p className="text-gray-400 font-sans">
          To reset all customization options back to initial Uganda outreach system defaults, click Reset settings.
        </p>
        <button
          type="button"
          onClick={() => {
            const defaults = {
              themeMode: 'default',
              accentColor: 'teal',
              fontScale: 'medium',
              appLanguage: 'en',
              notificationVolume: 70,
              soundPitch: 'soothing',
              advanceAutomationSpeed: 'realtime'
            };
            setPreferences(defaults);
            localStorage.setItem('ug_outreach_preferences', JSON.stringify(defaults));
            applyThemeProperties(defaults);
            setSavedSuccess(true);
            setTimeout(() => setSavedSuccess(false), 2000);
          }}
          className="bg-slate-100 hover:bg-slate-200 text-slate-850 px-4 py-2 rounded-xl transition font-bold self-end sm:self-auto cursor-pointer"
        >
          Reset To Factory Defaults
        </button>
      </div>

    </div>
  );
}
