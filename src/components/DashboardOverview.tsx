import React from "react";
import { 
  Users, 
  Building2, 
  ClipboardList, 
  ShoppingBag, 
  Banknote, 
  MessageSquare, 
  Bell, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Clock,
  ChevronRight,
  ShieldCheck,
  Zap
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar
} from "recharts";

interface Activity {
  id: string;
  user: string;
  action: string;
  time: string;
  type: "info" | "success" | "warning" | "alert";
  avatar: string;
}

interface Reminder {
  id: string;
  patient_name: string;
  medication: string;
  time: string;
  channel: "WhatsApp" | "SMS" | "Email";
}

interface DashboardOverviewProps {
  patientsCount: number;
  facilitiesCount: number;
  activeRefillRequests: number;
  ordersTodayCount: number;
  revenueTotal: string;
  messagesSentCount: number;
  recentActivities: Activity[];
  upcomingReminders: Reminder[];
  onTriggerQuickAction: (actionType: string) => void;
  setActiveTab: (tabId: string) => void;
}

export default function DashboardOverview({
  patientsCount,
  facilitiesCount,
  activeRefillRequests,
  ordersTodayCount,
  revenueTotal,
  messagesSentCount,
  recentActivities,
  upcomingReminders,
  onTriggerQuickAction,
  setActiveTab,
}: DashboardOverviewProps) {

  // Monthly refill requests chart data
  const monthlyRefillsData = [
    { name: "Jan", Requests: 280, PrevRequests: 210 },
    { name: "Feb", Requests: 340, PrevRequests: 250 },
    { name: "Mar", Requests: 450, PrevRequests: 300 },
    { name: "Apr", Requests: 520, PrevRequests: 420 },
    { name: "May", Requests: 610, PrevRequests: 490 },
    { name: "Jun", Requests: 740, PrevRequests: 550 },
  ];

  // User growth chart data
  const userGrowthData = [
    { name: "Jan", Patients: 120, Facilities: 12 },
    { name: "Feb", Patients: 180, Facilities: 15 },
    { name: "Mar", Patients: 240, Facilities: 18 },
    { name: "Apr", Patients: 390, Facilities: 24 },
    { name: "May", Patients: 510, Facilities: 30 },
    { name: "Jun", Patients: 680, Facilities: 35 },
  ];

  // Revenue trend data in USD/UGX
  const revenueTrendData = [
    { name: "Jan", Revenue: 2.1 },
    { name: "Feb", Revenue: 2.9 },
    { name: "Mar", Revenue: 4.2 },
    { name: "Apr", Revenue: 5.6 },
    { name: "May", Revenue: 6.8 },
    { name: "Jun", Revenue: 8.5 },
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Alert Header Notification Bar (Notifications Center) */}
      <div className="bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20 dark:border-emerald-800/40 rounded-3xl p-4 px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-xl">
            <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-emerald-800 dark:text-emerald-400 tracking-wider">CARE SYSTEM NOTICE</h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Auto-scheduler online. Next automated medication adherence push in 45 minutes.</p>
          </div>
        </div>
        <button 
          onClick={() => onTriggerQuickAction("auto-scheduler")}
          className="text-[10px] uppercase font-black tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-xl cursor-pointer shadow-3xs hover:translate-x-1 duration-200"
        >
          Dispatch Now
        </button>
      </div>

      {/* Grid statistics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* State Card: Total Patients */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-5 rounded-3xl relative overflow-hidden group hover:border-[#84CC16] dark:hover:border-emerald-500 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest font-mono">Total Patients</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition">
              <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{patientsCount}</h3>
          <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1.5">
            <TrendingUp className="w-3 h-3" /> +14.2% MTD
          </p>
        </div>

        {/* State Card: Total Health Facilities */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-5 rounded-3xl relative overflow-hidden group hover:border-[#84CC16] dark:hover:border-emerald-500 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest font-mono">Facilities</span>
            <div className="p-2 bg-teal-50 dark:bg-teal-950/40 rounded-xl group-hover:bg-teal-100 dark:group-hover:bg-teal-900/40 transition">
              <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{facilitiesCount}</h3>
          <p className="text-[10px] text-teal-600 font-bold flex items-center gap-0.5 mt-1.5">
            <TrendingUp className="w-3 h-3" /> +5 Active Hubs
          </p>
        </div>

        {/* State Card: Active Refill Requests */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-5 rounded-3xl relative overflow-hidden group hover:border-[#84CC16] dark:hover:border-emerald-500 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest font-mono">Active Refills</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 transition">
              <ClipboardList className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{activeRefillRequests}</h3>
          <p className="text-[10px] text-rose-500 font-bold flex items-center gap-0.5 mt-1.5">
            Pending Approval
          </p>
        </div>

        {/* State Card: Orders Today */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-5 rounded-3xl relative overflow-hidden group hover:border-[#84CC16] dark:hover:border-emerald-500 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest font-mono">Orders Today</span>
            <div className="p-2 bg-sky-50 dark:bg-sky-950/40 rounded-xl group-hover:bg-sky-100 dark:group-hover:bg-sky-900/40 transition">
              <ShoppingBag className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{ordersTodayCount}</h3>
          <p className="text-[10px] text-sky-600 font-bold flex items-center gap-0.5 mt-1.5">
            <TrendingUp className="w-3 h-3" /> 92% Fulfilled
          </p>
        </div>

        {/* State Card: Revenue */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-5 rounded-3xl relative overflow-hidden group hover:border-[#84CC16] dark:hover:border-emerald-500 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest font-mono">Revenue MTD</span>
            <div className="p-2 bg-violet-50 dark:bg-violet-950/40 rounded-xl group-hover:bg-violet-100 dark:group-hover:bg-violet-900/40 transition">
              <Banknote className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white truncate tracking-tight">{revenueTotal}</h3>
          <p className="text-[10px] text-violet-600 font-bold flex items-center gap-0.5 mt-1.5">
            <TrendingUp className="w-3 h-3" /> +18.5% weekly
          </p>
        </div>

        {/* State Card: Messages Sent */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-5 rounded-3xl relative overflow-hidden group hover:border-[#84CC16] dark:hover:border-emerald-500 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest font-mono">Alerts Dispatched</span>
            <div className="p-2 bg-lime-50 dark:bg-lime-950/40 rounded-xl group-hover:bg-lime-100 dark:group-hover:bg-lime-900/40 transition">
              <MessageSquare className="w-4 h-4 text-[#84CC16]" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{messagesSentCount}</h3>
          <p className="text-[10px] text-[#84CC16] font-bold flex items-center gap-0.5 mt-1.5">
            Deliveries: 99.7%
          </p>
        </div>

      </div>

      {/* Quick Action buttons panel */}
      <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-6 rounded-3xl">
        <h4 className="text-[10px] font-black uppercase text-gray-400 font-mono tracking-wider mb-4">Quick Diagnostic Actions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <button
            onClick={() => {
              onTriggerQuickAction("add-patient");
              setActiveTab("patients");
            }}
            className="p-4 bg-slate-50 dark:bg-slate-950/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border dark:border-slate-800/80 rounded-2xl text-left cursor-pointer transition group"
          >
            <h5 className="text-xs font-extrabold text-gray-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center justify-between">
              <span>Enroll Patient</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 duration-200" />
            </h5>
            <p className="text-[10px] text-gray-500 mt-1">Register user & set timeline constraints</p>
          </button>

          <button
            onClick={() => setActiveTab("medications")}
            className="p-4 bg-slate-50 dark:bg-slate-950/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border dark:border-slate-800/80 rounded-2xl text-left cursor-pointer transition group"
          >
            <h5 className="text-xs font-extrabold text-gray-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center justify-between">
              <span>Add Medication</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 duration-200" />
            </h5>
            <p className="text-[10px] text-gray-500 mt-1">Update clinical medication listings</p>
          </button>

          <button
            onClick={() => {
              onTriggerQuickAction("force-recheck");
            }}
            className="p-4 bg-slate-50 dark:bg-slate-950/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border dark:border-slate-800/80 rounded-2xl text-left cursor-pointer transition group"
          >
            <h5 className="text-xs font-extrabold text-gray-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center justify-between">
              <span>Sync Database</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 duration-200" />
            </h5>
            <p className="text-[10px] text-gray-500 mt-1">Re-evaluate data synchronizations</p>
          </button>

          <button
            onClick={() => setActiveTab("communications")}
            className="p-4 bg-slate-50 dark:bg-slate-950/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border dark:border-slate-800/80 rounded-2xl text-left cursor-pointer transition group"
          >
            <h5 className="text-xs font-extrabold text-gray-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center justify-between">
              <span>Compose Alerts</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 duration-200" />
            </h5>
            <p className="text-[10px] text-gray-500 mt-1">Edit default SMS/WhatsApp templates</p>
          </button>
        </div>
      </div>

      {/* Chart analytics row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly refill requests chart wrapper */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-sans font-black dark:text-white">Refill Requests Loop</h4>
              <p className="text-[10px] text-gray-400">Monthly volume of refill notifications</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-bold text-gray-500">Completed</span>
            </div>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRefillsData}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="Requests" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRequests)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Growth Chart wrapper */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-sans font-black dark:text-white">User Growth Index</h4>
              <p className="text-[10px] text-gray-400">Total clinics vs active patients</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-[9px] font-bold text-gray-500">Patients</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-[9px] font-bold text-gray-500">Centers</span>
              </div>
            </div>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="Patients" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="Facilities" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Trends Chart wrapper */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-sans font-black dark:text-white">Revenue Trends</h4>
              <p className="text-[10px] text-gray-400">Gross billing cycles (M UGX)</p>
            </div>
            <div className="text-[10px] text-teal-600 font-extrabold flex items-center gap-0.5 bg-teal-50 px-2 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3" /> +26% Year-Over-Year
            </div>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="Revenue" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row: Activities and Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Activities Feed */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-sans font-black dark:text-white">Recent Activities Registry</h4>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Realtime logs</span>
          </div>

          <div className="space-y-3.5">
            {recentActivities.map((act) => {
              const borderStyles = {
                success: "border-l-emerald-500",
                info: "border-l-blue-500",
                warning: "border-l-amber-500",
                alert: "border-l-rose-500"
              }[act.type] || "border-l-gray-300";

              return (
                <div key={act.id} className={`p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-transparent border-l-4 ${borderStyles} rounded-xl flex items-center justify-between gap-3`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">
                      {act.avatar}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-gray-800 dark:text-slate-100">{act.user}</p>
                      <p className="text-[10px] text-gray-500">{act.action}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-medium text-gray-400">{act.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Reminders with Channels */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-sans font-black dark:text-white">Pending Patient Reminders</h4>
            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md">Next queue</span>
          </div>

          <div className="space-y-3.5">
            {upcomingReminders.map((rem) => {
              const badgeClass = {
                WhatsApp: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
                SMS: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
                Email: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20"
              }[rem.channel];

              return (
                <div key={rem.id} className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-gray-100 dark:border-slate-800/80 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-black text-gray-500">
                      🔔
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800 dark:text-slate-100">{rem.patient_name}</p>
                      <p className="text-[10px] text-gray-500 font-medium">Req Refill: <span className="text-gray-700 dark:text-slate-300 font-bold">{rem.medication}</span></p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${badgeClass}`}>
                      {rem.channel}
                    </span>
                    <span className="text-[9px] font-mono text-gray-400">{rem.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
