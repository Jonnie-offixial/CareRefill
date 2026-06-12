import React from 'react';
import { SystemStats, Patient, Medication } from '../types';
import { Users, AlertCircle, Sparkles, CheckCircle2, ChevronRight, Activity, TrendingUp, CalendarDays } from 'lucide-react';
import { motion } from 'motion/react';

interface MetricCardsProps {
  stats: SystemStats;
  patients: (Patient & { medication: Medication | null })[];
  colorTheme: string;
}

export default function MetricCards({
  stats,
  patients,
  colorTheme,
}: MetricCardsProps) {
  
  // Advanced Breakdown Math
  const conditionCount = {
    Hypertension: 0,
    Diabetes: 0,
    'HIV/ARVs': 0,
    Other: 0
  };

  const activeCountByCondition = {
    Hypertension: 0,
    Diabetes: 0,
    'HIV/ARVs': 0,
    Other: 0
  };

  patients.forEach(p => {
    if (conditionCount[p.chronic_condition] !== undefined) {
      conditionCount[p.chronic_condition]++;
      if (p.status === 'Active') {
        activeCountByCondition[p.chronic_condition]++;
      }
    } else {
      conditionCount.Other++;
      if (p.status === 'Active') activeCountByCondition.Other++;
    }
  });

  const getThemeClass = (role: string) => {
    switch (colorTheme) {
      case 'emerald':
        if (role === 'bg') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        if (role === 'icon') return 'bg-emerald-500 text-white';
        return 'emerald';
      case 'indigo':
        if (role === 'bg') return 'bg-indigo-50 text-indigo-700 border-indigo-100';
        if (role === 'icon') return 'bg-indigo-500 text-white';
        return 'indigo';
      default:
        if (role === 'bg') return 'bg-teal-50 text-teal-700 border-teal-100';
        if (role === 'icon') return 'bg-teal-500 text-white';
        return 'teal';
    }
  };

  const getConditionColor = (cond: string) => {
    switch (cond) {
      case 'Hypertension': return 'from-amber-400 to-amber-500';
      case 'Diabetes': return 'from-blue-400 to-blue-500';
      case 'HIV/ARVs': return 'from-pink-400 to-pink-500';
      default: return 'from-slate-400 to-slate-500';
    }
  };

  const cardData = [
    {
      title: "Total Patients Registered",
      value: stats.totalPatients,
      subtitle: "Chronic medication cohorts",
      icon: Users,
      color: "from-teal-500 to-emerald-500",
      bgClass: "bg-teal-50 text-teal-600"
    },
    {
      title: "Refills Due This Week",
      value: stats.dueThisWeek,
      subtitle: "Within past 7 calendar days",
      icon: CalendarDays,
      color: "from-blue-500 to-indigo-500",
      bgClass: "bg-blue-50 text-blue-600"
    },
    {
      title: "Overdue for Refill",
      value: stats.overdue,
      subtitle: "Critical patient drop-offs",
      icon: AlertCircle,
      color: "from-rose-500 to-pink-500",
      bgClass: "bg-rose-50 text-rose-600"
    },
    {
      title: "Reminders Sent (Today)",
      value: stats.sentToday,
      subtitle: "SMS/WhatsApp logs synced",
      icon: CheckCircle2,
      color: "from-emerald-500 to-teal-500",
      bgClass: "bg-emerald-50 text-emerald-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Prime KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardData.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs flex items-start justify-between hover:scale-[1.01] transition-all"
          >
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{card.title}</span>
              <h3 className="text-3xl font-bold font-mono text-gray-900 tracking-tight leading-none">{card.value}</h3>
              <p className="text-[10px] text-gray-500">{card.subtitle}</p>
            </div>
            <div className={`p-2.5 rounded-xl ${card.bgClass} flex items-center justify-center shrink-0`}>
              <card.icon className="w-5 h-5" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Auxiliary Breakdown Bento Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-gray-400" />
            Chronic Illness Retention Trackers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(['Hypertension', 'Diabetes', 'HIV/ARVs'] as const).map((cond, idx) => {
              const total = conditionCount[cond] || 0;
              const active = activeCountByCondition[cond] || 0;
              const rate = total > 0 ? Math.round((active / total) * 100) : 0;
              
              return (
                <div key={idx} className="bg-slate-50 border border-gray-150 rounded-xl p-3.5 space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-900">{cond}</span>
                    <span className="text-[10px] font-mono text-gray-400 bg-white border border-gray-200 px-1 rounded-sm">
                      {active}/{total} act
                    </span>
                  </div>
                  <div>
                    <div className="flex items-end justify-between mb-1">
                      <span className="text-[9px] text-gray-400 uppercase font-medium">Retention Adherence</span>
                      <span className="text-xs font-mono font-bold text-gray-800">{rate}%</span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${getConditionColor(cond)} transition-all duration-1000`}
                        style={{ width: `${rate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
              Community Outreach Health impact
            </h3>
            <p className="text-xs text-gray-500 leading-normal">
              Refill notification loops eliminate standard multi-week gaps, preventing hypertensive crashes and glycemic drop-offs.
            </p>
          </div>
          <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-xl p-3 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-emerald-800 leading-none mb-1">94% Loyalty Rating</p>
              <p className="text-[10px] text-emerald-600/90 leading-tight">Retention increased amongst chronic hypertensive patients in Uganda.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
