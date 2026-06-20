import React from "react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  YAxis, 
  XAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { TrendingUp, Award, Activity, Heart, ShoppingBag } from "lucide-react";

export default function AnalyticsModule() {
  
  // 1. Refill Adherence Trends
  const refillTrendsSeries = [
    { week: "Wk 1", Adherent: 88, Delayed: 12 },
    { week: "Wk 2", Adherent: 91, Delayed: 9 },
    { week: "Wk 3", Adherent: 94, Delayed: 6 },
    { week: "Wk 4", Adherent: 96, Delayed: 4 },
  ];

  // 2. Revenue growth data
  const revenueSeries = [
    { month: "Jan", "In-Store Refills": 12.5, "Delivery Orders": 8.1 },
    { month: "Feb", "In-Store Refills": 14.2, "Delivery Orders": 10.4 },
    { month: "Mar", "In-Store Refills": 18.0, "Delivery Orders": 15.6 },
    { month: "Apr", "In-Store Refills": 21.4, "Delivery Orders": 19.8 },
    { month: "May", "In-Store Refills": 25.8, "Delivery Orders": 24.2 },
    { month: "Jun", "In-Store Refills": 31.0, "Delivery Orders": 29.5 },
  ];

  // 3. Active patients/clinics user trends
  const userGrowthTrends = [
    { month: "Jan", Patients: 420, Clinics: 18 },
    { month: "Feb", Patients: 550, Clinics: 22 },
    { month: "Mar", Patients: 780, Clinics: 30 },
    { month: "Apr", Patients: 940, Clinics: 35 },
    { month: "May", Patients: 1250, Clinics: 42 },
    { month: "Jun", Patients: 1680, Clinics: 50 },
  ];

  // 4. Most Requested Medications data
  const drugsDistribution = [
    { name: "Atorvastatin (Heart)", value: 450, color: "#10b981" },
    { name: "Metformin (Diabetes)", value: 320, color: "#3b82f6" },
    { name: "Ventolin (Asthma)", value: 240, color: "#f59e0b" },
    { name: "ARV Combos (HIV)", value: 180, color: "#8b5cf6" },
    { name: "Other Drugs", value: 110, color: "#ec4899" },
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-sans tracking-tight">Enterprise Clinical Analytics</h3>
          <p className="text-xs text-gray-500">Global tracking of patient medication adherence levels, brand cash flows, and drug distribution logs.</p>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl font-bold text-[10px] text-emerald-700 uppercase tracking-widest shrink-0 font-mono">
          MTD Global Adherence Rate: 94.2%
        </div>
      </div>

      {/* Grid: charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Adherence / Refill trends */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-6 rounded-3xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b dark:border-slate-800">
            <div>
              <h4 className="text-sm font-sans font-black dark:text-white">Refill Prompt Adherence %</h4>
              <p className="text-[10px] text-gray-400">Weekly prompt refills vs delay cycles</p>
            </div>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={refillTrendsSeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} unit="%" />
                <Tooltip />
                <Legend iconSize={8} />
                <Line type="monotone" dataKey="Adherent" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Delayed" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Growth chart */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-6 rounded-3xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b dark:border-slate-800">
            <div>
              <h4 className="text-sm font-sans font-black dark:text-white">Monthly Revenue Growth Category</h4>
              <p className="text-[10px] text-gray-400">Physical in-store vs courier mobile money orders (M UGX)</p>
            </div>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>

          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend iconSize={8} />
                <Bar dataKey="In-Store Refills" fill="#14b8a6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Delivery Orders" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Patients & partners */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-6 rounded-3xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b dark:border-slate-800">
            <div>
              <h4 className="text-sm font-sans font-black dark:text-white">Active patient growth cycle</h4>
              <p className="text-[10px] text-gray-400">Monthly patient enrollment volume</p>
            </div>
            <Heart className="w-4 h-4 text-violet-600" />
          </div>

          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend iconSize={8} />
                <Line type="monotone" dataKey="Patients" stroke="#8b5cf6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Requested Medications distribution Pie */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-6 rounded-3xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b dark:border-slate-800">
            <div>
              <h4 className="text-sm font-sans font-black dark:text-white">Formulations Distribution Portfolio</h4>
              <p className="text-[10px] text-gray-400">Relative share of prescription refills</p>
            </div>
            <Award className="w-4 h-4 text-amber-500" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={drugsDistribution}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {drugsDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 text-xs">
              {drugsDistribution.map((drug, index) => (
                <div key={index} className="flex items-center justify-between font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: drug.color }} />
                    <span className="text-gray-650 dark:text-slate-300">{drug.name}</span>
                  </div>
                  <span className="text-gray-900 dark:text-white font-mono font-bold">{drug.value} units</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
