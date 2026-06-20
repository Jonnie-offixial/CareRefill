import React, { useState, useEffect } from 'react';
// @ts-ignore
import logoUrl from './assets/images/carerefill_logo_1781646744724.jpg';
import { Pharmacy, Patient, Medication, ReminderLog, SystemStats } from './types';

// Standalone newly created modular files
import DashboardOverview from './components/DashboardOverview';
import PatientsModule from './components/PatientsModule';
import HealthFacilitiesModule from './components/HealthFacilitiesModule';
import MedicationsModule from './components/MedicationsModule';
import RefillRequestsModule from './components/RefillRequestsModule';
import OrdersModule from './components/OrdersModule';
import CommunicationsModule from './components/CommunicationsModule';
import AnalyticsModule from './components/AnalyticsModule';
import SupportModule from './components/SupportModule';
import SettingsModule from './components/SettingsModule';
import TalkWithUsFab from './components/TalkWithUsFab';
import LaunchPage from './components/LaunchPage';
import RoleActorLogin from './components/RoleActorLogin';

import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Users, 
  Settings, 
  RefreshCw, 
  CalendarDays, 
  ShieldAlert, 
  Shield,
  CreditCard,
  BarChart3,
  CheckCircle,
  Clock, 
  Sparkles, 
  Database,
  Sliders,
  MessageSquare,
  HelpCircle,
  Plus,
  Sun,
  Moon,
  TrendingUp,
  Activity,
  Heart,
  Award,
  Bell,
  Calendar,
  Stethoscope,
  ChevronRight,
  LogOut,
  Menu,
  X,
  MapPin,
  Flame,
  Search,
  Wifi
} from 'lucide-react';

export default function App() {
  // Theme support
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('carerefill_dark_mode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    const updated = !darkMode;
    setDarkMode(updated);
    localStorage.setItem('carerefill_dark_mode', String(updated));
  };

  // Tenant/Pharmacy structures
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>('pharm-001');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);

  // Global logging session
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Routing paths for /admin panel
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  // Navigation tab selections matching the sidebar categories
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Mobile sidebar menu sliding overlay drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Real world ticking clock
  const [realTime, setRealTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setRealTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulation parameters reference Clock - now matching today's system date dynamically
  const [simulationDate, setSimulationDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Core entities
  const [patients, setPatients] = useState<(Patient & { medication: Medication | null })[]>([]);
  const [reminders, setReminders] = useState<(ReminderLog & { patient_name: string; phone_number: string; condition: string; medication_name: string })[]>([]);
  
  // Custom branches doctors state coordinates
  interface Doctor {
    id: string;
    name: string;
    specialty: string;
    initials: string;
    colorBg: string;
  }
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);

  useEffect(() => {
    if (!selectedPharmacyId) return;
    const cacheKey = `carerefill_doctors_${selectedPharmacyId}`;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        setDoctorsList(JSON.parse(cachedData));
      } catch (e) {
        console.error("Failed parsing cached doctors", e);
      }
    } else {
      const defaults: Doctor[] = [
        {
          id: `${selectedPharmacyId}-doc-1`,
          name: "Dr. Sarah Mukasa",
          specialty: "Chief Clinical Adherence Pharmacist",
          initials: "SM",
          colorBg: "bg-emerald-500 text-white"
        },
        {
          id: `${selectedPharmacyId}-doc-2`,
          name: "Dr. Emmanuel Okot",
          specialty: "Supervisor Relations Officer",
          initials: "EO",
          colorBg: "bg-blue-500 text-white"
        }
      ];
      setDoctorsList(defaults);
      localStorage.setItem(cacheKey, JSON.stringify(defaults));
    }
  }, [selectedPharmacyId]);

  // Doctor Creation form states
  const [newDocName, setNewDocName] = useState("");
  const [newDocSpecialty, setNewDocSpecialty] = useState("");
  const [showAddDocForm, setShowAddDocForm] = useState(false);
  
  // Page load status flags
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SystemStats>({ totalPatients: 0, dueThisWeek: 0, overdue: 0, sentToday: 0 });

  // Sync / Online and Launch states
  const [showLaunchPage, setShowLaunchPage] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast("Connection Restored", "Real-time sync has been re-established.", "success");
      if (selectedPharmacyId) {
        fetchTenantData(selectedPharmacyId);
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast("Offline Mode Active", "Working on cached clinical logs.", "info");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [selectedPharmacyId]);

  // Custom toast lists
  interface ToastMessage {
    id: string;
    message: string;
    description?: string;
    type: 'success' | 'error' | 'info';
  }
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, description?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // 1. Initial Load of Pharmacies list
  useEffect(() => {
    const fetchPharmacies = async () => {
      const isActuallyOnline = navigator.onLine;
      setIsOnline(isActuallyOnline);

      if (!isActuallyOnline) {
        const cachedPharms = localStorage.getItem('carerefill_cache_pharmacies');
        if (cachedPharms) {
          try {
            const data = JSON.parse(cachedPharms);
            setPharmacies(data);
            if (data.length > 0) {
              setSelectedPharmacyId(data[0].pharmacy_id);
              setSelectedPharmacy(data[0]);
            }
          } catch (e) {
            console.error("Failed to parse cached pharmacies", e);
          }
        } else {
          setError("Offline and no local pharmacy list cached.");
        }
        return;
      }

      try {
        const response = await fetch('/api/pharmacies');
        if (response.ok) {
          const data = await response.json();
          setPharmacies(data);
          localStorage.setItem('carerefill_cache_pharmacies', JSON.stringify(data));
          if (data.length > 0) {
            setSelectedPharmacyId(data[0].pharmacy_id);
            setSelectedPharmacy(data[0]);
          }
        } else {
          setError("Failed to fetch tenant list.");
        }
      } catch (err) {
        console.error(err);
        const cachedPharms = localStorage.getItem('carerefill_cache_pharmacies');
        if (cachedPharms) {
          try {
            const data = JSON.parse(cachedPharms);
            setPharmacies(data);
            if (data.length > 0) {
              setSelectedPharmacyId(data[0].pharmacy_id);
              setSelectedPharmacy(data[0]);
            }
          } catch (e) {
            console.error(e);
          }
          setError(null);
        } else {
          setError("Unable to connect to full-stack backend.");
        }
      }
    };
    fetchPharmacies();
  }, []);

  // 2. Fetch Patients & Reminders logs dynamically
  const fetchTenantData = async (pharmId: string) => {
    setLoading(true);
    const isActuallyOnline = navigator.onLine;
    setIsOnline(isActuallyOnline);

    if (!isActuallyOnline) {
      // Offline: immediately read from localStorage
      const cachedPatientsStr = localStorage.getItem('carerefill_cache_patients_' + pharmId);
      const cachedRemindersStr = localStorage.getItem('carerefill_cache_reminders_' + pharmId);
      const cachedTime = localStorage.getItem('carerefill_cache_timestamp_' + pharmId);

      if (cachedPatientsStr) {
        try {
          const parsed = JSON.parse(cachedPatientsStr);
          setPatients(parsed);
          setLastSyncedTime(cachedTime ? new Date(cachedTime).toLocaleTimeString() : 'Unknown');
          showToast("Offline Cache Loaded", `Loaded ${parsed.length} patient coordinates locally from storage.`, "info");
        } catch (e) {
          console.error("Failed to parse patient cache", e);
        }
      }
      if (cachedRemindersStr) {
        try {
          setReminders(JSON.parse(cachedRemindersStr));
        } catch (e) {
          console.error("Failed to parse reminders cache", e);
        }
      }
      setLoading(false);
      return;
    }

    try {
      const pharm = pharmacies.find(p => p.pharmacy_id === pharmId) || null;
      setSelectedPharmacy(pharm);

      // Fetch patients
      const patientRes = await fetch(`/api/patients?pharmacy_id=${pharmId}`);
      let patientData: (Patient & { medication: Medication | null })[] = [];
      if (patientRes.ok) {
        patientData = await patientRes.json();
        setPatients(patientData);
        localStorage.setItem('carerefill_cache_patients_' + pharmId, JSON.stringify(patientData));
      }

      // Fetch reminders logs
      const reminderRes = await fetch(`/api/reminders?pharmacy_id=${pharmId}`);
      let reminderData: any[] = [];
      if (reminderRes.ok) {
        reminderData = await reminderRes.json();
        setReminders(reminderData);
        localStorage.setItem('carerefill_cache_reminders_' + pharmId, JSON.stringify(reminderData));
      }

      const syncTime = new Date().toISOString();
      localStorage.setItem('carerefill_cache_timestamp_' + pharmId, syncTime);
      setLastSyncedTime(new Date(syncTime).toLocaleTimeString());
      setError(null);
    } catch (err) {
      console.error(err);
      const cachedPatientsStr = localStorage.getItem('carerefill_cache_patients_' + pharmId);
      const cachedRemindersStr = localStorage.getItem('carerefill_cache_reminders_' + pharmId);
      const cachedTime = localStorage.getItem('carerefill_cache_timestamp_' + pharmId);

      if (cachedPatientsStr) {
        try {
          setPatients(JSON.parse(cachedPatientsStr));
          setLastSyncedTime(cachedTime ? new Date(cachedTime).toLocaleTimeString() : 'Unknown');
          showToast("Sync Interrupted", "Showing your offline cached patient database.", "info");
          setError(null);
        } catch (e) {}
      } else {
        setError("Failed to synchronize database records and no offline cache found.");
      }
      if (cachedRemindersStr) {
        try {
          setReminders(JSON.parse(cachedRemindersStr));
        } catch (e) {}
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPharmacyId) {
      fetchTenantData(selectedPharmacyId);
    }
  }, [selectedPharmacyId, pharmacies]);

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
      showToast("Patient Registered", `${patientPayload.full_name} added to the Registry database.`, 'success');
      await fetchTenantData(selectedPharmacyId);
    } else {
      throw new Error("Unable to save patient record.");
    }
  };

  const handleMarkRefilled = async (medicationId: string, customDate?: string) => {
    const matchedPatient = patients.find(p => p.medication?.medication_id === medicationId);
    const patientName = matchedPatient ? matchedPatient.full_name : "Patient";

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
      showToast(
        "Medication Refilled",
        `Compliance loop logged for ${patientName}. Next refill schedules armed.`,
        "success"
      );
    } else {
      showToast("Refill Update Failed", "Unable to log values.", "error");
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
      showToast("Status Updated", `Patient flagged as ${newStatus}.`, "success");
      await fetchTenantData(selectedPharmacyId);
    }
  };

  const handleTriggerScheduler = async () => {
    try {
      const response = await fetch('/api/trigger-scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pharmacy_id: selectedPharmacyId,
          reference_date: simulationDate
        })
      });

      if (response.ok) {
        const result = await response.json();
        showToast(
          "Scheduler Completed",
          `Automated cron completed: dispatched ${result.reminders_sent} notifications (WA: ${result.channels_summary.WhatsApp}, SMS: ${result.channels_summary.SMS}).`,
          "success"
        );
        await fetchTenantData(selectedPharmacyId);
      } else {
        showToast("Error", "Scheduler execution failed.", "error");
      }
    } catch (err) {
      showToast("Error", "Unable to trigger scheduler core services.", "error");
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('supabase_user_session');
    setCurrentUser(null);
    showToast("Logged Out Successfully", "You have signed out of your workspace.", "info");
  };

  // Verify roles access levels
  const isAdminUser = currentUser?.role === 'Admin';
  
  // Render Launcher Gate First
  if (showLaunchPage) {
    return <LaunchPage onLaunchComplete={() => setShowLaunchPage(false)} />;
  }

  if (!currentUser) {
    return (
      <RoleActorLogin 
        pharmacies={pharmacies} 
        onLoginSuccess={(user) => {
          localStorage.setItem('supabase_user_session', JSON.stringify(user));
          setCurrentUser(user);
          showToast("Workspace Logged In", `Logged in securely as ${user.email}.`, "success");
        }} 
      />
    );
  }

  // Sidebar dynamic navigation configuration groups
  const sidebarNavGroups = [
    {
      group_title: 'CareRefill Platform',
      links: [
        { id: 'dashboard', label: 'Dashboard', icon: Clock },
        { id: 'patients', label: 'Patients', icon: Users },
        { id: 'facilities', label: 'Health Facilities', icon: Building2 },
        { id: 'medications', label: 'Medications', icon: Sparkles },
        { id: 'refill-requests', label: 'Refill Requests', icon: Activity },
        { id: 'orders', label: 'Orders', icon: CreditCard },
        { id: 'communications', label: 'Communications', icon: MessageSquare },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'support', label: 'Support', icon: HelpCircle },
        { id: 'settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  const handleSidebarClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAFAFA] dark:bg-slate-950 text-gray-900 dark:text-slate-100 font-sans premium-transition">
      
      {/* Mobile Header Bar */}
      <header className="md:hidden bg-white/90 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-white px-4 py-3 flex items-center justify-between border-b border-lime-150 dark:border-slate-800 z-50 shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg overflow-hidden bg-emerald-600 flex items-center justify-center shadow-sm">
            <span className="text-white font-extrabold text-sm select-none">CR</span>
          </div>
          <span className="font-sans font-black tracking-tight text-slate-800 dark:text-gray-100 text-sm">CareRefill</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(prev => !prev)}
          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Left Sidebar Menu Drawer (Visible on md+ or conditional drawer on mobile) */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-emerald-950/98 dark:bg-slate-950 text-emerald-100 dark:text-slate-300 flex flex-col justify-between transform transition-transform duration-300 ease-in-out shrink-0
        md:relative md:translate-x-0 border-r border-[#041d0e] dark:border-slate-900 backdrop-blur-lg
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Sidebar Nav Items Pane */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          
          {/* Logo Brand coordinates */}
          <div className="p-4 flex items-center gap-2.5 border-b border-[#041d0e] dark:border-slate-900 bg-emerald-900/10 dark:bg-slate-900/30">
            <img src={logoUrl} alt="CareRefill Logo" className="w-8 h-8 rounded-xl object-contain shrink-0 active:rotate-12 transition-transform duration-300" />
            <div>
              <h1 className="font-sans font-black tracking-tight text-white text-sm">CareRefill</h1>
              <span className="text-[10px] text-emerald-400 dark:text-emerald-500 uppercase font-black tracking-wider block">Workspace Desk</span>
            </div>
          </div>

          {/* Active Tenant branch selector dropdown */}
          <div className="px-4 py-3 border-b border-[#041d0e] dark:border-slate-900 bg-emerald-900/20 dark:bg-slate-900/10">
            <label className="text-[9px] text-emerald-400 dark:text-slate-400 font-bold uppercase tracking-widest block mb-1">Active Office Center Log</label>
            <select
               value={selectedPharmacyId}
               onChange={(e) => setSelectedPharmacyId(e.target.value)}
               className="w-full bg-[#041d0e] dark:bg-slate-900 text-white text-xs p-2 rounded-xl focus:outline-none border border-emerald-800/60 dark:border-slate-800 font-medium cursor-pointer shadow-sm hover:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
            >
              {pharmacies.map((p) => (
                <option key={p.pharmacy_id} value={p.pharmacy_id} className="text-white bg-[#062c16] dark:bg-slate-900">
                  {p.pharmacy_name}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Map groupings links */}
          <nav className="p-3 space-y-5">
            {sidebarNavGroups.map((group) => {
              // No group-level exclusion, we will do fine-grained link filtering instead
              return (
                <div key={group.group_title} className="space-y-1 bg-emerald-900/[0.02] dark:bg-slate-900/[0.01] p-1 rounded-2xl">
                  <span className="text-[9px] pl-3.5 uppercase font-extrabold text-emerald-400 dark:text-slate-400 tracking-widest block opacity-92 mb-1.5">
                    {group.group_title}
                  </span>
                  <div className="space-y-0.5">
                    {group.links.map((link) => {
                      // Fine-grained role filter: hide integrations & billing/subscriptions from non-admins
                      if (!isAdminUser && (link.id === 'billing-subscriptions' || link.id === 'integrations')) {
                        return null;
                      }

                      const isActive = activeTab === link.id || 
                        (link.id === 'clinic-desk-appointments' && activeTab === 'clinic-desk-appointments') ||
                        (link.id === 'clinic-desk-consults' && activeTab === 'clinic-desk-consults');
                      
                      return (
                        <button
                          key={link.id}
                          onClick={() => handleSidebarClick(link.id)}
                          className={`
                            w-full text-left py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all duration-200 cursor-pointer hover:translate-x-1.5
                            ${isActive 
                              ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-900/30 scale-[0.98]' 
                              : 'text-emerald-100 hover:bg-emerald-900/40 hover:text-white dark:text-slate-400 dark:hover:bg-slate-850 dark:hover:text-slate-200'
                            }
                          `}
                        >
                          <link.icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isActive ? 'text-white scale-110' : 'text-emerald-400 dark:text-slate-500 group-hover:scale-110'}`} />
                          <span>{link.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Special System admin link only for admin session roles */}
            {isAdminUser && (
              <div className="space-y-1 pt-1">
                <span className="text-[9px] pl-3.5 uppercase font-extrabold text-emerald-300 tracking-widest block opacity-92">Super-Admin</span>
                <button
                  onClick={() => handleSidebarClick('admin')}
                  className={`
                    w-full text-left py-2 px-3.5 rounded-xl text-xs font-black flex items-center gap-2.5 transition-all cursor-pointer
                    ${activeTab === 'admin' 
                      ? 'bg-amber-400 text-slate-900 font-extrabold shadow-sm' 
                      : 'text-emerald-100 hover:bg-emerald-900/50 hover:text-white'
                    }
                  `}
                >
                  <Shield className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>Admin Panel 🔑</span>
                </button>
              </div>
            )}
          </nav>

        </div>

        {/* Sidebar Footer session badge */}
        <div className="p-4 border-t border-[#041d0e] bg-emerald-950/40 space-y-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#84CC16] text-white flex items-center justify-center font-black text-xs shrink-0 select-none shadow-xs">
              {(currentUser?.email || 'VI').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{currentUser?.email || 'Vianne Jonny'}</p>
              <p className="text-[9px] text-emerald-300 tracking-wide font-mono uppercase truncate">{currentUser?.role || 'Program staff'}</p>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="w-full bg-[#041d0e] hover:bg-rose-600 text-[10px] tracking-widest font-black uppercase text-emerald-100 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-800 shadow-3xs"
          >
            <LogOut className="w-3 h-3 text-emerald-300 hover:text-white" />
            <span>Sign Out Session</span>
          </button>
        </div>

      </aside>

      {/* Main Right Area Viewport scroll-pane */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA] dark:bg-slate-950 overflow-hidden relative">
        
        {/* Top bar control coordinates header */}
        <header className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-150/80 dark:border-slate-800 shrink-0 select-none pb-4 pt-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-3xs z-30">
          <div>
            <h2 className="text-lg font-black tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span>
                {activeTab === 'dashboard' ? 'Overview' : 
                 activeTab === 'analytics' ? 'Analytics Segment' : 
                 activeTab === 'patients' ? 'Patient Registry' : 
                 activeTab === 'progress' ? 'Vitals log check-in' : 
                 activeTab === 'caregivers' ? 'Auxiliary caregivers desk' : 
                 activeTab === 'loyalty' ? 'Gamification rewards scoreboard' : 
                 activeTab === 'reminders' ? 'Simulated SMS Reminders Queue' : 
                 activeTab === 'conversations' ? 'Two-way WhatsApp Communication console' : 
                 activeTab === 'ai-messages' ? 'AI messages' : 
                 activeTab === 'templates' ? 'Message templates' : 
                 activeTab === 'clinic-desk-appointments' ? 'Clinic Scheduled appointments' : 
                 activeTab === 'clinic-desk-consults' ? 'Clinic Q&A desk' : 
                 activeTab === 'facility-info' ? 'Doctors & specialists directories' : 
                 activeTab === 'gemini-chatbot' ? 'Gemini Advisor Companion 💬' : 
                 activeTab === 'settings' ? 'Branding settings' : 
                 'Control Desk Console'}
              </span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Refill coordination program portal under branch log: <span className="font-extrabold text-teal-600">{selectedPharmacy?.pharmacy_name || 'Kampala Road'}</span>
            </p>
          </div>

          {/* Real world system clock widget */}
          <div className="flex items-center gap-3">
            
            <div className="bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-100 dark:border-emerald-900/60 px-3 py-2 rounded-2xl flex items-center gap-2.5 shadow-2xs">
              <CalendarDays className="w-4 h-4 text-brand-green" />
              <div className="text-left font-sans">
                <span className="text-[8px] text-gray-400 block font-bold leading-none uppercase">Real-World Date &amp; Time</span>
                <span className="text-[11px] font-black tracking-wider text-brand-green font-mono block">
                  {realTime.toLocaleDateString()} {realTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Connection Status Indicator */}
            <div className={`p-2 rounded-2xl flex items-center gap-2.5 border text-[11px] shadow-2xs ${
              isOnline 
                ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-150 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300' 
                : 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300'
            }`}>
              <div className="relative flex items-center justify-center">
                <span className={`block h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping top-0 left-0 ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[8px] text-gray-400 font-bold uppercase leading-none">Sync Engine</span>
                <span className="font-extrabold tracking-wide leading-tight text-[10px]">
                  {isOnline ? 'ONLINE' : 'OFFLINE MODE (Cached)'}
                </span>
              </div>
              <button
                onClick={() => {
                  if (isOnline) {
                    fetchTenantData(selectedPharmacyId);
                    showToast("Synchronized", "Clinical database synchronized and cached locally.", "success");
                  } else {
                    showToast("Offline Mode Active", "Cannot reconcile remote backend while offline. Showing local cache.", "info");
                  }
                }}
                className="ml-1 bg-white hover:bg-slate-100 dark:bg-white/10 dark:hover:bg-white/20 border border-slate-250 dark:border-slate-800 px-2 py-1 rounded-lg text-[9px] font-black text-slate-700 dark:text-slate-150 transition cursor-pointer flex items-center gap-1 shrink-0 shadow-3xs"
                title="Synchronize clinical database cache manually"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>
            </div>

            {/* Dark & Light switch button */}
            <button
              onClick={toggleTheme}
              className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 hover:text-slate-850 dark:text-slate-200 border border-gray-150 dark:border-slate-800 rounded-2xl cursor-pointer shadow-3xs"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500 shrink-0" /> : <Moon className="w-4 h-4 text-slate-700 shrink-0" />}
            </button>

          </div>
        </header>

        {/* Central screen workspace scroll area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 relative overflow-x-hidden z-25">
          {/* Animated Mesh/Aurora Glows (SaaS 2026 UI layout) */}
          <div className="absolute top-[10%] left-[10%] w-[350px] h-[350px] aurora-glow-1 pointer-events-none rounded-full" />
          <div className="absolute bottom-[20%] right-[10%] w-[450px] h-[450px] aurora-glow-2 pointer-events-none rounded-full animate-pulse pointer-events-none duration-1000" />
          
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="h-96 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <RefreshCw className="w-8 h-8 text-brand-green animate-spin" />
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Querying workspace...</h4>
              </div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 max-w-7xl mx-auto w-full"
              >
                
                {/* View 1: Dashboard Overview */}
                {activeTab === 'dashboard' && (
                  <DashboardOverview
                    patientsCount={patients.length || 1240}
                    facilitiesCount={5}
                    activeRefillRequests={8}
                    ordersTodayCount={12}
                    revenueTotal="UGX 1,580,000"
                    messagesSentCount={148}
                    recentActivities={[
                      { id: "act-1", user: "Joy Nabasa", action: "Requested Atorvastatin 20mg Refill", time: "10 mins ago", type: "info" as const, avatar: "JN" },
                      { id: "act-2", user: "Kampala Branch", action: "Approved 12 pending patient couriers", time: "2 hrs ago", type: "success" as const, avatar: "KB" },
                      { id: "act-3", user: "Moses Sempampa", action: "WhatsApp delivery warning fail", time: "4 hrs ago", type: "alert" as const, avatar: "MS" },
                      { id: "act-4", user: "Airtel Pay Gateway", action: "Reconciled UGX 380,000 corporate payment", time: "Yesterday", type: "success" as const, avatar: "AP" }
                    ]}
                    upcomingReminders={[
                      { id: "rem-1", patient_name: "Joy Nabasa", medication: "Atorvastatin 20mg", time: "In 15 mins", channel: "WhatsApp" as const },
                      { id: "rem-2", patient_name: "Robert Okello", medication: "Metformin 500mg", time: "In 1 hr", channel: "SMS" as const },
                      { id: "rem-3", patient_name: "Esther Alupo", medication: "Ventolin Inhaler", time: "In 2 hrs", channel: "Email" as const }
                    ]}
                    onTriggerQuickAction={(type) => {
                      if (type === "whatsapp") {
                        showToast("Manual Alert Initiated", "WhatsApp bulk dispatch cron run queued successfully.", "success");
                      } else if (type === "enroll") {
                        setActiveTab("patients");
                      } else if (type === "report") {
                        setActiveTab("analytics");
                      }
                    }}
                    setActiveTab={setActiveTab}
                  />
                )}

                {/* View 2: Patients Module */}
                {activeTab === 'patients' && (
                  <PatientsModule
                    patients={patients}
                    onToggleStatus={handleToggleStatus}
                    onAddPatient={handleAddPatient}
                    showToast={showToast}
                  />
                )}

                {/* View 3: Analytics Module */}
                {activeTab === 'analytics' && (
                  <AnalyticsModule />
                )}

                {/* View 4: Health Facilities Module */}
                {activeTab === 'facilities' && (
                  <HealthFacilitiesModule
                    pharmaciesList={pharmacies}
                    showToast={showToast}
                  />
                )}

                {/* View 5: Medications Module */}
                {activeTab === 'medications' && (
                  <MedicationsModule
                    showToast={showToast}
                  />
                )}

                {/* View 6: Refill Requests Module */}
                {activeTab === 'refill-requests' && (
                  <RefillRequestsModule
                    showToast={showToast}
                  />
                )}

                {/* View 7: Orders Module */}
                {activeTab === 'orders' && (
                  <OrdersModule
                    showToast={showToast}
                  />
                )}

                {/* View 8: Communications Module */}
                {activeTab === 'communications' && (
                  <CommunicationsModule
                    showToast={showToast}
                  />
                )}

                {/* View 9: Support Module */}
                {activeTab === 'support' && (
                  <SupportModule
                    showToast={showToast}
                  />
                )}

                {/* View 10: Settings Module */}
                {activeTab === 'settings' && (
                  <SettingsModule
                    showToast={showToast}
                  />
                )}

                {/* View 12b: Billing, Subscriptions & Mobile Money Payouts Panel */}
                {activeTab === 'obsolete-billing' && (
                  <div className="bg-white rounded-3xl border border-gray-150 p-8 shadow-xs space-y-8 text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-brand-green font-bold text-xs uppercase tracking-wider">
                          <CreditCard className="w-4 h-4" /> Platform Finance Gateway
                        </div>
                        <h3 className="text-xl font-black text-gray-950 font-sans tracking-tight">Subscriptions &amp; Corporate Billing Logs</h3>
                        <p className="text-xs text-gray-400">Configure pharmacy software licensing, map SMS/WhatsApp bundles, and process mobile cashouts.</p>
                      </div>
                      <div className="bg-[#F4FCE3] border border-[#84CC16]/20 px-3 py-1.5 rounded-xl font-bold text-xs text-[#71B20A] tracking-wide shrink-0">
                        Corporate Standing: ACTIVE
                      </div>
                    </div>

                    {/* Subscription billing options cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="border border-slate-150 p-6 rounded-2xl space-y-4 bg-slate-50 relative overflow-hidden flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="text-[9px] font-black uppercase text-brand-green">Tier 1</span>
                          <h4 className="text-sm font-bold text-gray-900">Community Pharmacy</h4>
                          <p className="text-xs text-gray-500">For individual single branch clinics and drug stores.</p>
                          <p className="text-xl font-black text-slate-800 pt-2">UGX 150,500 <span className="text-xs font-normal text-gray-400">/ month</span></p>
                        </div>
                        <button 
                          onClick={() => showToast("Upgrade Requested", "A platform representative will contact your City branch.", "info")}
                          className="w-full bg-slate-800 hover:bg-slate-705 p-2 rounded-xl text-xs font-extrabold text-white text-center cursor-pointer mt-4"
                        >
                          Downgrade to Standard
                        </button>
                      </div>

                      <div className="border-2 border-emerald-500 p-6 rounded-2xl space-y-4 bg-emerald-50/10 relative overflow-hidden flex flex-col justify-between shadow-2xs">
                        <div className="absolute right-0 top-0 bg-emerald-500 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-bl-xl tracking-wider">
                          Active Branch Tier
                        </div>
                        <div className="space-y-2">
                          <span className="text-[9px] font-black uppercase text-teal-700">Tier 2</span>
                          <h4 className="text-sm font-bold text-slate-900">Regional Chain Care</h4>
                          <p className="text-xs text-gray-500">Supports up to 5 enterprise branches + advanced analytics.</p>
                          <p className="text-xl font-black text-emerald-800 pt-2">UGX 380,000 <span className="text-xs font-normal text-gray-400">/ month</span></p>
                        </div>
                        <button 
                          disabled
                          className="w-full bg-emerald-500/10 text-emerald-700 border border-emerald-300 p-2 rounded-xl text-xs font-bold text-center mt-4"
                        >
                          Current Subscription active
                        </button>
                      </div>

                      <div className="border border-slate-150 p-6 rounded-2xl space-y-4 bg-slate-50 relative overflow-hidden flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="text-[9px] font-black uppercase text-brand-green">Tier 3</span>
                          <h4 className="text-sm font-bold text-gray-900">Enterprise Corporate Group</h4>
                          <p className="text-xs text-gray-500">Unlimited national branches, multi-tenant locks, API gateways.</p>
                          <p className="text-xl font-black text-slate-850 pt-2">Custom Quote <span className="text-xs font-normal text-gray-400">/ year</span></p>
                        </div>
                        <button 
                          onClick={() => showToast("Enterprise Proposal Sent", "Enterprise specialist assigned. Check your registered clinical email shortly.", "success")}
                          className="w-full bg-[#84CC16] hover:bg-[#71B20A] p-2 rounded-xl text-xs font-extrabold text-white text-center cursor-pointer mt-4"
                        >
                          Contact Enterprise Desk
                        </button>
                      </div>
                    </div>

                    {/* Ugandan payment options selection and mobile money payment simulator */}
                    <div className="border-t border-slate-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Dynamic Payout Configuration</h4>
                        <p className="text-xs text-gray-500">
                          Toggle or register local East African payment networks to accept bulk patient mobile deposits or automatically handle clinician fee balances.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between">
                            <span className="font-bold text-xs text-gray-800">MTN Mobile Money</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                          </div>
                          <div className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between">
                            <span className="font-bold text-xs text-gray-800">Airtel Pay Portal</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-5 rounded-2xl border space-y-3">
                        <span className="text-[9px] font-black uppercase text-slate-400">Ugandan Wallet Simulator</span>
                        <h5 className="text-xs font-bold text-slate-800">Simulate Test Mobile Checkout</h5>
                        <div className="space-y-2">
                          <input 
                            type="text" 
                            placeholder="+256 701 445588" 
                            className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none" 
                          />
                          <button
                            onClick={() => {
                              showToast("Transaction Dispatched", "Test checkout notification pushed! Check simulated MTN/Airtel response.", "success");
                            }}
                            className="w-full bg-brand-green hover:bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider py-2 rounded-xl cursor-pointer"
                          >
                            Dispatch UGX 10,000 Push Log
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* View 12c: High-fidelity Regional Analytics & Uganda Map Center */}
                {activeTab === 'regional-analytics' && (
                  <div className="bg-white rounded-3xl border border-gray-150 p-8 shadow-xs space-y-8 text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-brand-green font-bold text-xs uppercase tracking-wider">
                          <BarChart3 className="w-4 h-4" /> Regional Compliance Intelligence
                        </div>
                        <h3 className="text-xl font-black text-gray-950 font-sans tracking-tight">Enterprise Uganda Regional Analytics</h3>
                        <p className="text-xs text-gray-400">View real-time district statistics, reminder effectiveness logs, and regional adherence indexes.</p>
                      </div>
                    </div>

                    {/* Regional Grid analytics list representing branches */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border border-slate-150 rounded-2xl p-6 bg-slate-50/50 space-y-4">
                        <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Active Regional Adherence indices</h4>
                        <div className="space-y-4">
                          {[
                            { district: "Kampala Central Road Zone (Branch A)", index: 92, status: "EXCELLENT", color: "bg-emerald-500" },
                            { district: "Arua West Nile Division (Branch B)", index: 78, status: "ATTENTION", color: "bg-amber-500" },
                            { district: "Mbale Bugisu High Area (Branch C)", index: 85, status: "STABLE", color: "bg-[#84CC16]" },
                            { district: "Gulu Acholi Northern Hub (Branch D)", index: 68, status: "CRITICAL ALERT", color: "bg-rose-500" }
                          ].map((reg, idx) => (
                            <div key={idx} className="space-y-1.5">
                              <div className="flex justify-between text-xs font-bold text-slate-800">
                                <span>{reg.district}</span>
                                <span>{reg.index}% Adherence ({reg.status})</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className={`h-full ${reg.color} rounded-full`} style={{ width: `${reg.index}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Diagnostic Summary */}
                      <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
                        <div className="space-y-3">
                          <span className="text-[10px] font-black uppercase text-[#84CC16] tracking-wider block font-mono">Statistical Insights</span>
                          <h4 className="text-md font-bold tracking-tight">Pre-emptive SMS / WA Impacts in Uganda</h4>
                          <p className="text-xs text-slate-300 leading-relaxed font-sans">
                            National adherence tracking shows that over 40% of patients skip essential anti-hypertensive cycle treatments because of travel cost or simple forgetfulness. 
                            CareRefill automatons reduce this margin significantly down by 22% in Kampala and 18% in Eastern Mbale district branches.
                          </p>
                        </div>
                        <div className="pt-4 border-t border-slate-800 mt-6 flex justify-between items-center">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#84CC16]">Data Feed: REALTIME</span>
                          <button
                            onClick={() => {
                              showToast("Exporting National Report", "Compiling compiled PDF sheets of East Africa indexes...", "success");
                            }}
                            className="bg-brand-green hover:bg-emerald-600 font-extrabold text-[10px] uppercase text-white px-3.5 py-2 rounded-xl transition cursor-pointer"
                          >
                            Export Comprehensive Audit Logs
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}



                {/* View 13: Doctor branch specialists credentials templates */}
                {activeTab === 'obsolete-facility' && selectedPharmacy && (() => {
                  const canManageDoctors = currentUser?.role === 'Admin' || currentUser?.role === 'Executive';
                  
                  const handleAddDoctor = (e: React.FormEvent) => {
                    e.preventDefault();
                    if (!newDocName.trim() || !newDocSpecialty.trim()) {
                      showToast("Incomplete specialist information", "Please fill in all medical coordinate inputs.", "error");
                      return;
                    }

                    // Compute initials
                    let clean = newDocName.replace(/^(Dr\.|Dr)\s+/i, '');
                    const parts = clean.trim().split(/\s+/);
                    let initials = "MD";
                    if (parts.length >= 2) {
                      initials = (parts[0][0] + parts[1][0]).toUpperCase();
                    } else if (parts.length === 1 && parts[0].length > 0) {
                      initials = parts[0].substring(0, 2).toUpperCase();
                    }

                    // Select a modern clinical aura color
                    const clinicalColors = [
                      "bg-emerald-500 text-white",
                      "bg-blue-500 text-white",
                      "bg-violet-500 text-white",
                      "bg-rose-500 text-white",
                      "bg-amber-500 text-white"
                    ];
                    const colorBg = clinicalColors[doctorsList.length % clinicalColors.length];

                    const prefixDocName = newDocName.toLowerCase().startsWith('dr') ? newDocName : `Dr. ${newDocName}`;

                    const newDoc = {
                      id: `${selectedPharmacyId}-doc-${Date.now()}`,
                      name: prefixDocName,
                      specialty: newDocSpecialty,
                      initials,
                      colorBg
                    };

                    const updated = [...doctorsList, newDoc];
                    setDoctorsList(updated);
                    localStorage.setItem(`carerefill_doctors_${selectedPharmacyId}`, JSON.stringify(updated));
                    
                    setNewDocName("");
                    setNewDocSpecialty("");
                    setShowAddDocForm(false);
                    showToast("Specialist Registered", `${prefixDocName} has been enrolled in the branch medical registry.`, "success");
                  };

                  return (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-slate-800 p-8 shadow-sm space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-slate-800 pb-5">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl text-brand-green">
                            <Building2 className="w-6 h-6 text-brand-green" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-sans tracking-tight">Care Center Workspace coordinates</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Official medical specialists registry for branch {selectedPharmacy.pharmacy_name}</p>
                          </div>
                        </div>

                        {canManageDoctors && (
                          <button
                            onClick={() => setShowAddDocForm(!showAddDocForm)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer transition duration-200 active:scale-97 flex items-center gap-2 shadow-sm self-start sm:self-center"
                          >
                            <Plus className="w-4 h-4" />
                            <span>{showAddDocForm ? "Hide Form" : "Add Branch Doctor"}</span>
                          </button>
                        )}
                      </div>

                      {/* Expandable modern glassmorphic/neumorphic enrollment form */}
                      <AnimatePresence>
                        {canManageDoctors && showAddDocForm && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <form 
                              onSubmit={handleAddDoctor} 
                              className="bg-slate-50 dark:bg-slate-950/40 p-6 rounded-2xl border border-dashed dark:border-slate-800 space-y-4 mb-4 transition-all duration-300 relative"
                            >
                              <h4 className="text-xs font-black uppercase tracking-widest text-[#84CC16]">Enroll Branch Medical Specialist</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-gray-500 uppercase font-mono tracking-wider">Full Legal Name</label>
                                  <input
                                    type="text"
                                    value={newDocName}
                                    onChange={(e) => setNewDocName(e.target.value)}
                                    placeholder="e.g. Dr. Peter Okello"
                                    className="w-full text-xs font-semibold p-3 bg-white dark:bg-slate-900 text-gray-950 dark:text-white border dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                                    required
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-gray-500 uppercase font-mono tracking-wider">Specialty / Title Designation</label>
                                  <input
                                    type="text"
                                    value={newDocSpecialty}
                                    onChange={(e) => setNewDocSpecialty(e.target.value)}
                                    placeholder="e.g. Lead Pediatric Counselor"
                                    className="w-full text-xs font-semibold p-3 bg-white dark:bg-slate-900 text-gray-950 dark:text-white border dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                                    required
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2.5 pt-2">
                                <button
                                  type="button"
                                  onClick={() => setShowAddDocForm(false)}
                                  className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 transition cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer shadow-sm pr-6 flex items-center gap-1.5"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Submit Enroll Registry</span>
                                </button>
                              </div>
                            </form>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                        <div className="bg-slate-50 dark:bg-slate-950/20 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block font-mono">Contact channel</span>
                          <h4 className="text-sm font-bold text-gray-950 dark:text-gray-150">Clinic Gateway Mobile</h4>
                          <p className="text-xs text-teal-700 font-mono font-bold">{selectedPharmacy.phone_number}</p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-950/20 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block font-mono">Location coordinates</span>
                          <h4 className="text-sm font-bold text-gray-950 dark:text-gray-150">Physical Address coordinates</h4>
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">{selectedPharmacy.address}</p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-950/20 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block font-mono">Monitored Treatment Groups</span>
                          <h4 className="text-sm font-bold text-gray-950 dark:text-gray-150">Chronic Adherent Protocols</h4>
                          <p className="text-xs text-slate-600 dark:text-gray-400">Hypertension • Diabetes • Asthma • HIV/ARV</p>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 dark:border-slate-800 pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-450 font-mono">Facility Doctors & specialists ({doctorsList.length})</h4>
                          {!canManageDoctors && (
                            <span className="text-[10px] text-gray-450 bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-md font-mono">
                              Role constraints restrict registrations
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {doctorsList.map((doc) => (
                            <div key={doc.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/20 p-3.5 rounded-xl border border-gray-100 dark:border-slate-800 relative group overflow-hidden premium-transition hover:border-emerald-500/20 dark:hover:border-emerald-500/10">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-3xs ${doc.colorBg}`}>
                                {doc.initials}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-900 dark:text-gray-150">{doc.name}</p>
                                <p className="text-[10px] text-gray-450 font-medium">{doc.specialty}</p>
                              </div>
                              {canManageDoctors && (
                                <button
                                  onClick={() => {
                                    const updated = doctorsList.filter(d => d.id !== doc.id);
                                    setDoctorsList(updated);
                                    localStorage.setItem(`carerefill_doctors_${selectedPharmacyId}`, JSON.stringify(updated));
                                    showToast("Specialist Removed", `${doc.name} removed from the registry.`, "info");
                                  }}
                                  className="absolute top-2.5 right-2.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer"
                                  title="Remove Specialist"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}



              </motion.div>
            )}
          </AnimatePresence>

        </main>

        {/* Global Footer coordinates */}
        <footer className="bg-white dark:bg-slate-900 border-t border-gray-150 dark:border-slate-800 py-4 px-6 text-center shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
            <p className="font-medium">© 2026 CareRefill Compliance CRM. Uganda Center.</p>
            <div className="flex gap-4">
              <span className="text-emerald-500 font-bold flex items-center gap-1 font-sans">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                WhatsApp Business API Active
              </span>
              <span className="text-blue-500 font-bold flex items-center gap-1 font-sans">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                SMS Cellular Gateway Online
              </span>
            </div>
          </div>
        </footer>

      </div>

      {/* Talk With Us Floating Action Button & Live Support Panel */}
      <TalkWithUsFab 
        showToast={showToast} 
        branchName={selectedPharmacy?.pharmacy_name} 
        branchPhone={selectedPharmacy?.phone_number} 
      />

      {/* Dynamic notifications popup alerts stack container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-start gap-3 transition-all duration-300 transform translate-y-0 opacity-100 ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950 dark:bg-emerald-950/90 dark:border-emerald-800 dark:text-emerald-100'
                : toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-950 dark:bg-rose-950/90 dark:border-rose-800 dark:text-rose-100'
                : 'bg-slate-50 border-slate-200 text-slate-950 dark:bg-slate-905/90 dark:border-slate-850 dark:text-slate-100'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            ) : toast.type === 'error' ? (
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            ) : (
              <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wide leading-none">{toast.message}</h4>
              {toast.description && (
                <p className="text-[11px] font-medium leading-tight opacity-90">{toast.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
