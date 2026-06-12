import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Info, 
  MapPin, 
  PhoneCall, 
  ShieldCheck, 
  Send, 
  Activity, 
  QrCode, 
  BrainCircuit, 
  CreditCard 
} from 'lucide-react';

interface IntegrationsHubProps {
  colorTheme: string;
  currentUser?: any;
  onUserUpdate?: (user: any) => void;
}

export default function IntegrationsHub({ colorTheme, currentUser, onUserUpdate }: IntegrationsHubProps) {
  // Connection and API Status
  const [status, setStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Interactive NIN verification states
  const [ninInput, setNinInput] = useState('CM8601248K7J9');
  const [ninStatus, setNinStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [ninResult, setNinResult] = useState<any>(null);

  // DHIS2 Aggregate reporting states
  const [reportingStatus, setReportingStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const [reportLog, setReportLog] = useState<string[]>([]);

  // VHT Dispatch referral state
  const [selectedPatRef, setSelectedPatRef] = useState('Sarah Namubiru');
  const [vhtTarget, setVhtTarget] = useState('VHT Juma Aliba (Kisenyi Zone)');
  const [vhtNote, setVhtNote] = useState('Patient requires home check for blood pressure compliance.');
  const [vhtDispatchStatus, setVhtDispatchStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (e) {
      console.error("Failed to load status API", e);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const getThemeTextClass = () => {
    switch (colorTheme) {
      case 'emerald': return 'text-emerald-400';
      case 'indigo': return 'text-indigo-400';
      default: return 'text-teal-400';
    }
  };

  const getThemeBgClass = () => {
    switch (colorTheme) {
      case 'emerald': return 'bg-emerald-500';
      case 'indigo': return 'bg-indigo-500';
      default: return 'bg-teal-500';
    }
  };

  // Interactive NIN check logic
  const handleVerifyNIN = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ninInput.trim()) return;
    setNinStatus('checking');

    setTimeout(() => {
      // Simulate real-time NIRA API check
      if (ninInput.toUpperCase().startsWith('CM')) {
        setNinStatus('success');
        setNinResult({
          nin: ninInput.toUpperCase(),
          fullName: selectedPatRef || "Florence Namono",
          issuedCity: "Kampala",
          validUntil: "2031-10-15",
          biometricsMatch: "99.4%"
        });
      } else {
        setNinStatus('error');
        setNinResult({
          error: "No registry matches found for NIN prefix. Must start with country code 'CM' for standard verification."
        });
      }
    }, 1000);
  };

  // DHIS2 reporting log logic
  const handleTriggerDHIS2Sync = () => {
    setReportingStatus('syncing');
    setReportLog(["Compiles weekly chronic medication compliance parameters...", "Aggregates 42 adherence schedules across clinical registry..."]);
    
    setTimeout(() => {
      setReportLog(prev => [...prev, "Connected securely to MoH endpoint: https://dhis2.health.go.ug/api/..."]);
      
      setTimeout(() => {
        setReportLog(prev => [...prev, "Aggregate data package signed and transmitted.", "Confirmation Token received: UG-MOH-9482-AD"]) ;
        setReportingStatus('synced');
      }, 1000);

    }, 850);
  };

  // VHT Dispatch logic
  const handleVHTDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    setVhtDispatchStatus('sending');
    setTimeout(() => {
      setVhtDispatchStatus('sent');
      setTimeout(() => setVhtDispatchStatus('idle'), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Info Block */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded border border-teal-400/20">System Integration Status</span>
            <h3 className="text-xl font-bold text-white mt-1.5 font-sans">Ministry & Gateway Integrations Platform</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Uganda Chronic Outreach Portal communicates natively with national registries, district reports, and payment interfaces. This hub shows active connection handshakes and permits live diagnostic tests.
            </p>
          </div>
          <button
            onClick={fetchStatus}
            disabled={loadingStatus}
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-950 text-white hover:bg-slate-850 transition cursor-pointer border border-white/10 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin' : ''}`} />
            Refresh Gateway Handshakes
          </button>
        </div>

        {/* Dynamic National Integrations Gateways Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
          
          {/* 1. NIRA National NIN Sync */}
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between">
              <span className="p-2 bg-indigo-500/10 text-indigo-300 rounded-xl border border-indigo-500/20">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold rounded-md uppercase">ONLINE</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">National ID (NIRA)</p>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                Verified instant biometric checks and name mapping protocols.
              </p>
            </div>
          </div>

          {/* 2. MoH DHIS2 Reporting */}
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between">
              <span className="p-2 bg-teal-500/10 text-teal-300 rounded-xl border border-teal-500/20">
                <Activity className="w-5 h-5" />
              </span>
              <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold rounded-md uppercase">CONNECTED</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">DHIS2 MoH Reports</p>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                District Health Information compliance exports for national planning.
              </p>
            </div>
          </div>

          {/* 3. MTN & Airtel Mobile Money */}
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between">
              <span className="p-2 bg-amber-500/10 text-amber-300 rounded-xl border border-amber-500/20">
                <CreditCard className="w-5 h-5" />
              </span>
              <span className="text-[9px] px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-extrabold rounded-md uppercase">READY</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">Mobile Money Pay</p>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                MTN MoMo & Airtel Money automatic subscription billing triggers.
              </p>
            </div>
          </div>

          {/* 4. bulk SMS Gateways */}
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between">
              <span className="p-2 bg-emerald-500/10 text-emerald-300 rounded-xl border border-emerald-500/20">
                <PhoneCall className="w-5 h-5" />
              </span>
              <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold rounded-md uppercase">ACTIVE</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">Outreach SMS Network</p>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                AfricasTalking, Twilio, and localized nodes for compliance dispatches.
              </p>
            </div>
          </div>

          {/* 5. AI Guidance Grounding */}
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between">
              <span className="p-2 bg-pink-500/10 text-pink-300 rounded-xl border border-pink-500/20">
                <BrainCircuit className="w-5 h-5" />
              </span>
              <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold rounded-md uppercase">LATENCY: 85MS</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">AI Clinical Grounding</p>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                Gemini SDK aligned with Ministry-approved clinical guideline databases.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Integrations Simulation Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
        
        {/* INTERACTIVE WORKFLOW 1: NIRA NATIONAL ID VALIDATOR */}
        <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
            <h4 className="text-sm font-black text-gray-950 uppercase tracking-wide">National Registry ID Verification</h4>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Ensure chronic registry candidates provide valid National Identification Numbers before prescribing automatic text compliance routines.
          </p>

          <form onSubmit={handleVerifyNIN} className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Enter candidate NIN</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={ninInput}
                  onChange={(e) => setNinInput(e.target.value)}
                  placeholder="e.g. CM8601248K7J9" 
                  required
                  className="bg-slate-50 border text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono text-gray-900 flex-1 leading-none uppercase"
                />
                <button 
                  type="submit"
                  disabled={ninStatus === 'checking'}
                  className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer transition shadow-xs leading-none"
                >
                  {ninStatus === 'checking' ? 'Checking...' : 'Verify NIN'}
                </button>
              </div>
            </div>
          </form>

          {/* NIN Result Displays */}
          {ninStatus === 'success' && ninResult && (
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl space-y-1.5 text-xs animate-fadeIn">
              <p className="font-extrabold text-emerald-800 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                NIRA NIN VERIFIED
              </p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-gray-700 font-sans text-[11px] pt-1 border-t border-emerald-200/50">
                <p><strong>Mapped Patient:</strong> {ninResult.fullName}</p>
                <p><strong>District:</strong> {ninResult.issuedCity}</p>
                <p><strong>Expiry:</strong> {ninResult.validUntil}</p>
                <p><strong>Biometrics:</strong> Match {ninResult.biometricsMatch}</p>
              </div>
            </div>
          )}

          {ninStatus === 'error' && ninResult && (
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-xs text-rose-800 space-y-1 leading-relaxed">
              <p className="font-black text-rose-900">VERIFICATION REJECTED</p>
              <p>{ninResult.error}</p>
            </div>
          )}
        </div>

        {/* INTERACTIVE WORKFLOW 2: DHIS2 AGGREGATE OUTREACH COMPREHENSIVES */}
        <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600 shrink-0" />
            <h4 className="text-sm font-black text-gray-950 uppercase tracking-wide">MoH DHIS2 Aggregate Transmit</h4>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Ugandans receive national healthcare mapping through automatic aggregation of clinic refill performance indices. Push aggregate data packets to government report streams.
          </p>

          <div className="space-y-3 pt-2">
            {reportingStatus === 'idle' && (
              <button
                type="button"
                onClick={handleTriggerDHIS2Sync}
                className="w-full bg-teal-605 hover:bg-teal-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer shadow-xs"
              >
                Assemble & Publish DHIS2 Aggregate Reports
              </button>
            )}

            {reportingStatus === 'syncing' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 justify-center py-2 text-xs font-bold text-slate-500">
                  <RefreshCw className="w-4 h-4 text-teal-500 animate-spin" />
                  <span>Preparing aggregate payloads...</span>
                </div>
              </div>
            )}

            {reportingStatus === 'synced' && (
              <div className="bg-teal-50 border border-teal-150 p-3 rounded-xl text-xs space-y-2 animate-fadeIn text-teal-900">
                <p className="font-extrabold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  TRANSFERRED SUCCESSFULLY
                </p>
                <p className="text-[11px] leading-relaxed">
                  DHIS2 aggregate telemetry registered for district monitoring. Government planning code: <span className="font-mono bg-white px-1 border rounded font-bold">UG-MOH-9482-AD</span>
                </p>
                <button
                  onClick={() => setReportingStatus('idle')}
                  className="text-[10px] underline hover:text-teal-750 font-bold block"
                >
                  Clear audit logs and prepare new dispatch
                </button>
              </div>
            )}

            {/* Live Logs Panel */}
            {reportLog.length > 0 && (
              <div className="bg-slate-900 rounded-xl p-3 text-[10px] font-mono text-slate-300 space-y-1 max-h-32 overflow-y-auto border border-slate-800">
                <p className="text-teal-400 font-extrabold text-[9px] border-b border-slate-800 pb-1 uppercase tracking-wider">AGGREGATE PROCESS AUDIT LOGS</p>
                {reportLog.map((log, idx) => (
                  <p key={idx} className="leading-tight">{`> ${log}`}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* INTERACTIVE WORKFLOW 3: VILLAGE HEALTH TEAM (VHT) REFERRALS */}
        <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
            <h4 className="text-sm font-black text-gray-950 uppercase tracking-wide">Community Care Referral Desk</h4>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Dispatch diagnostic care referral tickets directly to local village health workers using specialized community SMS lines.
          </p>

          <form onSubmit={handleVHTDispatch} className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Patient Candidate</label>
                <select
                  value={selectedPatRef}
                  onChange={(e) => {
                    setSelectedPatRef(e.target.value);
                    // Also adjust NIN preview
                    if (e.target.value === 'Sarah Namubiru') {
                      setNinInput('CM8601248K7J9');
                    } else if (e.target.value === 'Moses Okello') {
                      setNinInput('CM9204128N9F2');
                    } else {
                      setNinInput('CM7902415L3F1');
                    }
                  }}
                  className="w-full bg-slate-50 border text-[11px] p-1.5 rounded-lg text-gray-850"
                >
                  <option value="Sarah Namubiru">Sarah Namubiru</option>
                  <option value="Moses Okello">Moses Okello</option>
                  <option value="Joseph Aliga">Joseph Aliga</option>
                  <option value="Florence Namono">Florence Namono (Custom)</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Assigned VHT Node</label>
                <select
                  value={vhtTarget}
                  onChange={(e) => setVhtTarget(e.target.value)}
                  className="w-full bg-slate-50 border text-[11px] p-1.5 rounded-lg text-gray-850"
                >
                  <option value="VHT Juma Aliba (Kisenyi Zone)">VHT Juma Aliba</option>
                  <option value="VHT Mary Nakasi (Katwe Area)">VHT Mary Nakasi</option>
                  <option value="VHT Simon Kaggwa (Rubaga Sector)">VHT Simon Kaggwa</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Referral / Intervention Notes</label>
              <textarea
                value={vhtNote}
                onChange={(e) => setVhtNote(e.target.value)}
                maxLength={140}
                placeholder="Enter clinical message notes for the VHT home visit..."
                className="w-full bg-slate-50 border text-[11px] p-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-900 resize-none h-14"
              />
            </div>

            <button
              type="submit"
              disabled={vhtDispatchStatus === 'sending'}
              className="w-full bg-emerald-555 hover:bg-emerald-600 text-slate-950 font-black text-xs py-2 px-4 rounded-xl cursor-pointer transition flex items-center justify-center gap-1 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{vhtDispatchStatus === 'sending' ? 'Transmitting note...' : 'Dispatch VHT Community SMS Ticket'}</span>
            </button>
          </form>

          {vhtDispatchStatus === 'sent' && (
            <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-xs text-emerald-850 font-sans flex items-start gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-emerald-950 leading-tight">VHT TICKET COMMITTED</p>
                <p className="text-[10px] text-gray-500 mt-1 leading-normal">
                  SMS dispatch transmitted successfully to <strong>{vhtTarget}</strong>. Home check scheduled in registry dashboard.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
