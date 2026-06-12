import React, { useState, useEffect } from 'react';
import { Pharmacy, Patient, Medication, ReminderLog, SystemStats } from './types';
import PatientRegistry from './components/PatientRegistry';
import SchedulerSim from './components/SchedulerSim';
import MessageTemplatesEditor from './components/MessageTemplatesEditor';
import MetricCards from './components/MetricCards';
import IntegrationsHub from './components/IntegrationsHub';
import PatientPortal from './components/PatientPortal';
import ClinicConsultDesk from './components/ClinicConsultDesk';
import AdminPanel from './components/AdminPanel';
import RoleActorLogin from './components/RoleActorLogin';
import SettingsPanel from './components/SettingsPanel';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Users, 
  Settings, 
  RefreshCw, 
  CalendarDays, 
  ShieldAlert, 
  Shield,
  CheckCircle,
  Clock, 
  Sparkles, 
  Database,
  Sliders,
  MessageSquare,
  HelpCircle,
  Plus
} from 'lucide-react';

export default function App() {
  // Tenant states
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>('pharm-001');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);

  // Global Session State
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('supabase_user_session');
    if (saved) return JSON.parse(saved);
    return null; // Start on multi-actor login for an interactive demo evaluation
  });

  // Routing paths for /admin support
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handleUrlChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleUrlChange);
    
    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleUrlChange();
    };
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.history.pushState = originalPushState;
    };
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
  };

  // Core Entity States
  const [patients, setPatients] = useState<(Patient & { medication: Medication | null })[]>([]);
  const [reminders, setReminders] = useState<(ReminderLog & { patient_name: string; phone_number: string; condition: string; medication_name: string })[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'scheduler' | 'templates' | 'integrations' | 'patient-portal' | 'clinic-desk' | 'admin' | 'facility-info' | 'settings'>('dashboard');

  // Dynamic Tab Router based on Logged Actor Role and current URL pathname
  useEffect(() => {
    if (!currentUser) return;
    if (window.location.pathname === '/admin' && currentUser.role === 'Admin') {
      setActiveTab('admin');
    } else if (currentUser.role === 'Patient') {
      setActiveTab('patient-portal');
    } else {
      setActiveTab('dashboard');
    }
  }, [currentUser, currentPath]);

  // Simulation Clock state
  const [simulationDate, setSimulationDate] = useState<string>('2026-06-12');

  // Page States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SystemStats>({ totalPatients: 0, dueThisWeek: 0, overdue: 0, sentToday: 0 });
  const [resettingDb, setResettingDb] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // 1. Initial Load of Pharmacies list
  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const response = await fetch('/api/pharmacies');
        if (response.ok) {
          const data = await response.json();
          setPharmacies(data);
          // Set initial pharmacy
          if (data.length > 0) {
            setSelectedPharmacyId(data[0].pharmacy_id);
            setSelectedPharmacy(data[0]);
          }
        } else {
          setError("Failed to fetch tenant list.");
        }
      } catch (err) {
        console.error(err);
        setError("Unable to connect to full-stack backend. Please confirm the server configuration.");
      }
    };
    fetchPharmacies();
  }, []);

  // 2. Fetch Patients & Reminders whenever selected pharmacy or calendar simulation date changes
  const fetchTenantData = async (pharmId: string) => {
    setLoading(true);
    try {
      const pharm = pharmacies.find(p => p.pharmacy_id === pharmId) || null;
      setSelectedPharmacy(pharm);

      // Fetch patients
      const patientRes = await fetch(`/api/patients?pharmacy_id=${pharmId}`);
      let patientData: (Patient & { medication: Medication | null })[] = [];
      if (patientRes.ok) {
        patientData = await patientRes.json();
        setPatients(patientData);
      }

      // Fetch reminders
      const reminderRes = await fetch(`/api/reminders?pharmacy_id=${pharmId}`);
      let reminderData: any[] = [];
      if (reminderRes.ok) {
        reminderData = await reminderRes.json();
        setReminders(reminderData);
      }

      // Calculate localized real-time simulation statistics
      calculateStats(patientData, reminderData, simulationDate);
      
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to synchronize tenant lists.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPharmacyId) {
      fetchTenantData(selectedPharmacyId);
    }
  }, [selectedPharmacyId, pharmacies]);

  // Recalculate stats when simulation clock changes
  useEffect(() => {
    calculateStats(patients, reminders, simulationDate);
  }, [simulationDate]);

  const calculateStats = (
    patientList: (Patient & { medication: Medication | null })[],
    reminderList: any[],
    referenceDateStr: string
  ) => {
    const refDate = new Date(referenceDateStr);
    refDate.setHours(8, 0, 0, 0);

    const oneWeekLater = new Date(refDate.getTime());
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);

    let total = 0;
    let dueCount = 0;
    let overdueCount = 0;
    let sentCount = 0;

    patientList.forEach(p => {
      total++;
      if (p.status === 'Active' && p.medication) {
        const nextDue = new Date(p.medication.next_refill_date);
        nextDue.setHours(8, 0, 0, 0);

        const diffTime = nextDue.getTime() - refDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        // Due this week is within 0 to 7 days
        if (diffDays >= 0 && diffDays <= 7) {
          dueCount++;
        }
        // Overdue is past due date (diffDays < 0)
        if (diffDays < 0) {
          overdueCount++;
        }
      }
    });

    // Count reminders sent on the specific simulation date
    const targetDateStr = referenceDateStr;
    reminderList.forEach(r => {
      if (r.status === 'Sent' && r.reminder_date.startsWith(targetDateStr)) {
        sentCount++;
      }
    });

    setStats({
      totalPatients: total,
      dueThisWeek: dueCount,
      overdue: overdueCount,
      sentToday: sentCount
    });
  };

  const handleAddPatient = async (patientPayload: any) => {
    const response = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pharmacy_id: selectedPharmacyId,
        ...patientPayload
      })
    });

    if (response.ok) {
      await fetchTenantData(selectedPharmacyId);
    } else {
      throw new Error("Unable to save patient record.");
    }
  };

  const handleMarkRefilled = async (medicationId: string, customDate?: string) => {
    const response = await fetch('/api/refills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        medication_id: medicationId,
        refill_date: customDate ? new Date(customDate).toISOString() : new Date().toISOString()
      })
    });

    if (response.ok) {
      await fetchTenantData(selectedPharmacyId);
    } else {
      alert("Failed to submit refill cycle update.");
    }
  };

  const handleToggleStatus = async (patientId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    const response = await fetch(`/api/patients/${patientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    if (response.ok) {
      await fetchTenantData(selectedPharmacyId);
    }
  };

  const handleTriggerScheduler = async (dateStr: string) => {
    setSimulationDate(dateStr);
    const response = await fetch('/api/trigger-scheduler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pharmacy_id: selectedPharmacyId,
        simulation_date: dateStr
      })
    });

    if (response.ok) {
      const data = await response.json();
      // Re-fetch everything to sync states immediately
      await fetchTenantData(selectedPharmacyId);
      return data;
    } else {
      throw new Error("Scheduler script compilation error.");
    }
  };

  const resetDatabasePrimacy = async () => {
    setResettingDb(true);
    setResetSuccess(false);
    try {
      const res = await fetch('/api/reset-db', { method: 'POST' });
      if (res.ok) {
        setResetSuccess(true);
        // Reload pharmacies lists
        const reloadRes = await fetch('/api/pharmacies');
        if (reloadRes.ok) {
          const data = await reloadRes.json();
          setPharmacies(data);
          if (data.length > 0) {
            setSelectedPharmacyId(data[0].pharmacy_id);
          }
        }
        setTimeout(() => setResetSuccess(false), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResettingDb(false);
    }
  };

  // Theme styling helpers
  const getThemeBgClass = () => {
    if (!selectedPharmacy) return 'bg-teal-600';
    switch (selectedPharmacy.color_theme) {
      case 'emerald': return 'bg-emerald-600';
      case 'indigo': return 'bg-indigo-600';
      default: return 'bg-teal-600';
    }
  };

  const getThemeTextClass = () => {
    if (!selectedPharmacy) return 'text-teal-600';
    switch (selectedPharmacy.color_theme) {
      case 'emerald': return 'text-emerald-600';
      case 'indigo': return 'text-indigo-600';
      default: return 'text-teal-600';
    }
  };

  const getThemeBorderClass = () => {
    if (!selectedPharmacy) return 'border-teal-500';
    switch (selectedPharmacy.color_theme) {
      case 'emerald': return 'border-emerald-500';
      case 'indigo': return 'border-indigo-500';
      default: return 'border-teal-500';
    }
  };

  const getThemeGradient = () => {
    if (!selectedPharmacy) return 'from-teal-600 via-teal-700 to-emerald-800';
    switch (selectedPharmacy.color_theme) {
      case 'emerald': return 'from-emerald-600 via-teal-600 to-emerald-800';
      case 'indigo': return 'from-indigo-600 via-blue-700 to-sky-900';
      default: return 'from-teal-600 via-teal-700 to-emerald-800';
    }
  };

  const isCurrentlyAdminPath = currentPath === '/admin';
  const showLogin = !currentUser || (isCurrentlyAdminPath && currentUser.role !== 'Admin');

  if (showLogin) {
    return (
      <RoleActorLogin 
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          if (u.role === 'Admin') {
            navigateTo('/admin');
          } else {
            navigateTo('/');
          }
        }} 
        pharmacies={pharmacies} 
        initialActor={isCurrentlyAdminPath ? 'admin' : 'facility'} 
      />
    );
  }

  const isPatientUser = currentUser?.role === 'Patient';
  const isFacilityUser = currentUser?.role === 'Pharmacist' || currentUser?.role === 'Staff' || currentUser?.role === 'Health Facility';
  const isAdminUser = currentUser?.role === 'Admin';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col justify-between">
      
      {/* Header Panel with Gradient & Multi-Tenant Switcher */}
      <div className={`bg-gradient-to-r ${getThemeGradient()} text-white pt-4 pb-14 shadow-md px-4 sm:px-6 md:px-8 shrink-0`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Building2 className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Pharmacy Refill Reminder Bot</h1>
              <p className="text-xs text-emerald-100/80 font-sans flex items-center gap-1">
                <span>🇺🇬 East Africa Patient Adherence SaaS MVP</span>
                <span>•</span>
                <span>Active Workspace SIM</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Tenant Switcher Portal */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-2 flex items-center gap-2 text-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-100 px-2 pl-3 select-none">Active Tenant:</span>
              <select
                value={selectedPharmacyId}
                onChange={(e) => setSelectedPharmacyId(e.target.value)}
                className="bg-slate-900/40 text-white font-medium text-xs rounded-xl py-1.5 px-3 border border-white/10 focus:outline-none focus:ring-1 focus:ring-teal-300"
              >
                {pharmacies.map((pharm) => (
                  <option key={pharm.pharmacy_id} value={pharm.pharmacy_id} className="bg-slate-800 text-white">
                    🏢 {pharm.pharmacy_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Session Profile Badge & Logout with Settings option */}
            <div className="bg-slate-950/30 border border-white/10 rounded-2xl p-1.5 pl-3 flex items-center gap-3 shrink-0">
              <div className="text-left font-sans text-xs flex items-center gap-2">
                <div>
                  <p className="font-extrabold text-white leading-tight">{currentUser?.name}</p>
                  <p className="text-[10px] text-teal-200 font-mono leading-none mt-0.5">{currentUser?.role}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  title="Configure System Customization Preferences"
                  className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all flex items-center justify-center cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('supabase_user_session');
                  setCurrentUser(null);
                  navigateTo('/');
                }}
                className="bg-white/10 hover:bg-white/20 transition-colors text-[10px] font-black uppercase tracking-wider text-white px-2.5 py-1.5 rounded-xl cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Body Grid */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 -mt-8 flex-1 pb-16">
        <div className="space-y-6">
          
          {/* Tenant Profile Banner Card */}
          {selectedPharmacy && (
            <motion.div 
              key={selectedPharmacy.pharmacy_id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${selectedPharmacy.color_theme === 'emerald' ? 'bg-emerald-50 text-emerald-700' : selectedPharmacy.color_theme === 'indigo' ? 'bg-indigo-50 text-indigo-700' : 'bg-teal-50 text-teal-700'}`}>
                  {isPatientUser ? "Your Care Provider" : "Clinical Workspace Profile"}
                </span>
                <h2 className="text-lg font-bold text-gray-950">{selectedPharmacy.pharmacy_name}</h2>
                <p className="text-xs text-gray-400 font-sans">{selectedPharmacy.address} • {selectedPharmacy.phone_number}</p>
              </div>

              {/* Navigation Options inside Tenant wrapper (filtered by actor role) */}
              <div className="flex flex-wrap bg-gray-100 p-1 rounded-xl border border-gray-200/85 gap-1 items-center self-start md:self-auto shadow-2xs">
                
                {/* PATIENT ROLE TABS */}
                {isPatientUser && (
                  <>
                    <button
                      onClick={() => setActiveTab('patient-portal')}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all duration-150 flex items-center gap-1 border ${
                        activeTab === 'patient-portal' 
                          ? 'bg-indigo-650 text-white shadow-3xs border-indigo-550 font-extrabold' 
                          : 'text-indigo-600 hover:bg-indigo-50/50 bg-transparent border-transparent'
                      }`}
                    >
                      My Treatment Portal
                    </button>
                    <button
                      onClick={() => setActiveTab('facility-info')}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all duration-150 ${activeTab === 'facility-info' ? 'bg-white text-gray-950 shadow-3xs font-black' : 'text-gray-500 hover:text-gray-850 bg-transparent'}`}
                    >
                      🏢 Facility Profile Coordinates
                    </button>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all duration-150 flex items-center gap-1 border border-transparent ${
                        activeTab === 'settings' ? 'bg-slate-900 text-teal-300 font-black shadow-3xs' : 'text-gray-500 hover:text-gray-850 bg-transparent'
                      }`}
                    >
                      <Settings className="w-3.5 h-3.5 shrink-0" />
                      Settings
                    </button>
                  </>
                )}

                {/* CLINICAL HEALTH FACILITY TABS */}
                {(isFacilityUser || isAdminUser) && (
                  <>
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all duration-150 ${activeTab === 'dashboard' ? 'bg-white text-gray-950 shadow-3xs font-black' : 'text-gray-500 hover:text-gray-850 bg-transparent'}`}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveTab('patients')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all duration-150 ${activeTab === 'patients' ? 'bg-white text-gray-950 shadow-3xs font-black' : 'text-gray-500 hover:text-gray-850 bg-transparent'}`}
                    >
                      Registry ({patients.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('scheduler')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all duration-150 ${activeTab === 'scheduler' ? 'bg-white text-gray-950 shadow-3xs font-black' : 'text-gray-500 hover:text-gray-850 bg-transparent'}`}
                    >
                      Cron Scheduler
                    </button>
                    <button
                      onClick={() => setActiveTab('templates')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all duration-150 ${activeTab === 'templates' ? 'bg-white text-gray-950 shadow-3xs font-black' : 'text-gray-500 hover:text-gray-850 bg-transparent'}`}
                    >
                      Customizer
                    </button>
                    <button
                      onClick={() => setActiveTab('integrations')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all duration-150 ${activeTab === 'integrations' ? 'bg-white text-gray-950 shadow-3xs font-black' : 'text-gray-500 hover:text-gray-850 bg-transparent'}`}
                    >
                      Integrations Hub
                    </button>
                    <button
                      onClick={() => setActiveTab('clinic-desk')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all duration-150 flex items-center gap-1 border ${
                        activeTab === 'clinic-desk' 
                          ? 'bg-slate-900 text-teal-300 border-slate-950 font-extrabold' 
                          : 'text-slate-700 hover:bg-slate-100 bg-transparent border-transparent'
                      }`}
                    >
                      Care Consult Desk
                    </button>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all duration-150 flex items-center gap-1 border border-transparent ${
                        activeTab === 'settings' ? 'bg-slate-900 text-teal-300 font-semibold shadow-3xs' : 'text-gray-500 hover:text-gray-850 bg-transparent'
                      }`}
                    >
                      <Settings className="w-3.5 h-3.5 shrink-0" />
                      Settings
                    </button>
                  </>
                )}

                {/* ADMIN TABS */}
                {isAdminUser && (
                  <>
                    <div className="h-4 w-[1px] bg-gray-300 mx-1 hidden sm:block"></div>
                    <button
                      onClick={() => setActiveTab('admin')}
                      className={`px-3 py-1.5 text-xs font-black rounded-lg cursor-pointer transition-all duration-150 flex items-center gap-1.5 border ${
                        activeTab === 'admin' 
                          ? 'bg-slate-950 text-emerald-400 border-slate-950 font-black shadow-3xs' 
                          : 'text-rose-700 hover:bg-rose-50/50 bg-transparent border-transparent'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      Admin Panel 🔑
                    </button>
                  </>
                )}

              </div>
            </motion.div>
          )}

          {/* Quick Loading or Error Overlays */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs flex items-center gap-2 font-medium">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-2xl py-20 text-center border border-gray-100 flex flex-col items-center justify-center gap-4">
              <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
              <p className="text-xs text-gray-500 font-medium">Loading isolated tenant records...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                
                {/* 1. Dashboard Block */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    {/* Synchronized calendar alert banner */}
                    <div className="bg-blue-50 border border-blue-150/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-3xs">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="bg-blue-600 text-white rounded-xl p-2 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-blue-900 leading-tight">Simulation Time Calibration: {simulationDate}</p>
                          <p className="text-[11px] text-blue-700 font-sans leading-normal mt-0.5">Toggle the simulation clock to test compliance alerts on different dates.</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-white border border-blue-200 rounded-xl p-1 shadow-2xs self-start sm:self-auto shrink-0">
                        <CalendarDays className="w-3.5 h-3.5 text-blue-400 ml-2" />
                        <input
                          type="date"
                          value={simulationDate}
                          onChange={(e) => setSimulationDate(e.target.value)}
                          className="border-0 bg-transparent text-xs font-bold text-gray-800 font-mono focus:outline-none p-1.5 shrink-0"
                        />
                      </div>
                    </div>

                    {/* Primary KPI Cards */}
                    <MetricCards
                      stats={stats}
                      patients={patients}
                      colorTheme={selectedPharmacy?.color_theme || 'teal'}
                    />

                    {/* Fast Track workflow info bento */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row gap-6 shadow-3xs justify-between">
                      <div className="max-w-md">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2.5 py-1 border border-teal-100 rounded-sm">Quick Action Play</span>
                        <h4 className="text-base font-bold text-gray-950 mt-2 mb-1">How to demonstrate the refill cycle:</h4>
                        <ol className="text-xs text-gray-650 space-y-1.5 list-decimal list-inside leading-relaxed text-gray-600">
                          <li>Click on the <strong className="text-gray-900 font-medium">Registry tab</strong> above.</li>
                          <li>Locate <strong className="text-gray-950 font-medium">Sarah Namubiru</strong> (Hypertension) or <strong className="text-gray-950 font-medium">Moses Okello</strong> (Diabetes).</li>
                          <li>Press the green <strong className="text-gray-950 font-bold">Refill button</strong> (adjusting dates back or forward).</li>
                          <li>The system automatically updates the cycle, calculates the new refill date, and resets logs!</li>
                          <li>Run the <strong className="text-gray-950 font-medium">Scheduler tab</strong> to audit instant delivery webhooks.</li>
                        </ol>
                      </div>

                      <div className="bg-slate-50 border border-gray-200/60 rounded-xl p-4 flex flex-col justify-between md:max-w-xs shrink-0">
                        <div className="flex items-center gap-1.5 font-bold uppercase tracking-widest text-[10px] text-slate-500 mb-1">
                          <Database className="w-4 h-4 text-slate-400" /> Administrative Sandbox
                        </div>
                        <p className="text-[11px] text-gray-500 leading-normal mb-3">
                          Need a clean slate? Press below to reset all workspaces back to pre-seeded Ugandan pharmacy records instantly.
                        </p>
                        <button
                          onClick={resetDatabasePrimacy}
                          disabled={resettingDb}
                          className="bg-slate-200 hover:bg-slate-300 transition-colors text-slate-700 py-1.5 px-3 border border-slate-300 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
                        >
                          {resettingDb ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Seeding...
                            </>
                          ) : resetSuccess ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Succeeded!
                            </>
                          ) : (
                            <>
                              Re-seed Sandbox Defaults
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Patient Directory block */}
                {activeTab === 'patients' && (
                  <PatientRegistry
                    patients={patients}
                    onAddPatient={handleAddPatient}
                    onMarkRefilled={handleMarkRefilled}
                    onToggleStatus={handleToggleStatus}
                    colorTheme={selectedPharmacy?.color_theme || 'teal'}
                  />
                )}

                {/* 3. Cron automated scheduler tab block */}
                {activeTab === 'scheduler' && (
                  <SchedulerSim
                    reminders={reminders}
                    onTriggerScheduler={handleTriggerScheduler}
                    colorTheme={selectedPharmacy?.color_theme || 'teal'}
                  />
                )}

                {/* 4. Text customization block */}
                {activeTab === 'templates' && (
                  <MessageTemplatesEditor
                    pharmacyId={selectedPharmacyId}
                    pharmacyName={selectedPharmacy ? selectedPharmacy.pharmacy_name : " Kampala Chemistry"}
                    colorTheme={selectedPharmacy?.color_theme || 'teal'}
                  />
                )}

                {/* 5. Database & Delivery Integration Hub */}
                {activeTab === 'integrations' && (
                  <IntegrationsHub
                    colorTheme={selectedPharmacy?.color_theme || 'teal'}
                    currentUser={currentUser}
                    onUserUpdate={setCurrentUser}
                  />
                )}

                {/* 6. Patient self-service portal (Vitals logging, Appts slots picker, doctor-patient QAs) */}
                {activeTab === 'patient-portal' && (
                  <PatientPortal
                    patients={patients}
                    pharmacyId={selectedPharmacyId}
                    pharmacyName={selectedPharmacy ? selectedPharmacy.pharmacy_name : "Kampala Community Pharmacy"}
                    colorTheme={selectedPharmacy?.color_theme || 'teal'}
                    onRefreshPatients={() => fetchTenantData(selectedPharmacyId)}
                  />
                )}

                {/* Patient Health Facility Information Coordinates Tab */}
                {activeTab === 'facility-info' && selectedPharmacy && (
                  <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-teal-50 rounded-2xl text-teal-600">
                        <Building2 className="w-6 h-6 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Health Facility Information</h3>
                        <p className="text-xs text-gray-500 font-sans">Official workspace coordinates of {selectedPharmacy.pharmacy_name}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                      <div className="bg-slate-50 p-5 rounded-2xl border border-gray-100 space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Contact Desk</span>
                        <h4 className="text-sm font-bold text-gray-950 font-sans">SaaS Mobile Coordinates</h4>
                        <p className="text-xs text-teal-700 font-mono font-bold">{selectedPharmacy.phone_number}</p>
                        <p className="text-[10px] text-gray-400">Available 24/7 for SMS adherence confirmations and emergency refills.</p>
                      </div>

                      <div className="bg-slate-50 p-5 rounded-2xl border border-gray-100 space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Clinic Coordinates</span>
                        <h4 className="text-sm font-bold text-gray-950 font-sans">Physical Address</h4>
                        <p className="text-xs text-gray-700 font-sans font-medium">{selectedPharmacy.address}</p>
                        <p className="text-[10px] text-gray-400">Main medical center location, Kampala, Uganda.</p>
                      </div>

                      <div className="bg-slate-50 p-5 rounded-2xl border border-gray-100 space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Treatment Programs</span>
                        <h4 className="text-sm font-bold text-gray-950 font-sans">Adherence Support Centers</h4>
                        <p className="text-xs text-slate-600 font-sans font-medium">Hypertension • Diabetes • HIV/ARV Therapy</p>
                        <p className="text-[10px] text-gray-400">Personalized SMS triggers configured for maximum medicine compliance.</p>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Clinical Care Team</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-gray-100">
                          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700">SM</div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">Dr. Sarah Mukasa</p>
                            <p className="text-[10px] text-gray-400">Chief Clinical Pharmacist</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-gray-100">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">EO</div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">Dr. Emmanuel Okot</p>
                            <p className="text-[10px] text-gray-400">Lead Patient Relations Officer</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. Personalization Settings and System Configuration */}
                {activeTab === 'settings' && (
                  <SettingsPanel />
                )}

                {/* 7. Practice Specialist Clinic Consultation Desk (Auto AI Clinician advice drafter, confirmations, vitals trends dashboards) */}
                {activeTab === 'clinic-desk' && (
                  <ClinicConsultDesk
                    patients={patients}
                    pharmacyId={selectedPharmacyId}
                    pharmacyName={selectedPharmacy ? selectedPharmacy.pharmacy_name : "Kampala Community Pharmacy"}
                    colorTheme={selectedPharmacy?.color_theme || 'teal'}
                    onRefreshPatients={() => fetchTenantData(selectedPharmacyId)}
                  />
                )}

                {/* 8. Super-Admin control panel */}
                {activeTab === 'admin' && (
                  <AdminPanel
                    currentUser={currentUser}
                    onUserUpdate={setCurrentUser}
                    onRefreshAllData={() => {
                      fetch('/api/pharmacies')
                        .then(res => res.ok ? res.json() : [])
                        .then(data => {
                          setPharmacies(data);
                          if (data.length > 0) {
                            const chosen = data.find((p: any) => p.pharmacy_id === selectedPharmacyId) || data[0];
                            setSelectedPharmacyId(chosen.pharmacy_id);
                            setSelectedPharmacy(chosen);
                          }
                        });
                    }}
                  />
                )}

              </motion.div>
            </AnimatePresence>
          )}

        </div>
      </main>

      {/* Styled Human Footer */}
      <footer className="bg-white border-t border-gray-150 py-6 px-4 shrink-0 text-center select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 Pharmacy Refill Reminder Bot. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="font-sans font-medium text-emerald-600 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              WhatsApp Business API Simulator Live
            </span>
            <span className="font-sans font-medium text-indigo-600 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
              SMS Telecomm Webhook Logs Configured
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
