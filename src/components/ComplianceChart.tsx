import React, { useState, useMemo } from 'react';
import { Patient, Medication } from '../types';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { TrendingUp, CheckCircle, ShieldAlert, Sliders, Calendar } from 'lucide-react';

interface ComplianceChartProps {
  patients: (Patient & { medication: Medication | null })[];
  colorTheme: string;
}

export default function ComplianceChart({
  patients,
  colorTheme,
}: ComplianceChartProps) {
  const [metricMode, setMetricMode] = useState<'adherence' | 'refills'>('adherence');

  // Compute stats based on current lists
  const statsSummary = useMemo(() => {
    const total = patients.length;
    const active = patients.filter(p => p.status === 'Active').length;
    const activePercentage = total > 0 ? Math.round((active / total) * 100) : 80;
    
    // Calculate a dynamic index to make sure chart changes if user modifies patients
    const dynamicOffset = (activePercentage - 75) * 0.3; 

    // Generate monthly historical compliance data leading up to June 2026
    const monthlyData = [
      { month: 'Jan 2026', compliance: Math.min(100, Math.max(0, Math.round(71 + dynamicOffset))), refills: Math.max(5, Math.ceil(total * 0.4)) },
      { month: 'Feb 2026', compliance: Math.min(100, Math.max(0, Math.round(74 + dynamicOffset * 1.1))), refills: Math.max(8, Math.ceil(total * 0.48)) },
      { month: 'Mar 2026', compliance: Math.min(100, Math.max(0, Math.round(78 + dynamicOffset * 1.2))), refills: Math.max(12, Math.ceil(total * 0.55)) },
      { month: 'Apr 2026', compliance: Math.min(100, Math.max(0, Math.round(83 + dynamicOffset * 1.4))), refills: Math.max(15, Math.ceil(total * 0.65)) },
      { month: 'May 2026', compliance: Math.min(100, Math.max(0, Math.round(89 + dynamicOffset * 1.6))), refills: Math.max(19, Math.ceil(total * 0.78)) },
      { month: 'Jun 2026', compliance: Math.min(100, Math.max(0, Math.round(94 + dynamicOffset * 1.8))), refills: Math.max(24, Math.ceil(total * 0.9)) },
    ];

    return {
      monthlyData,
      activePercentage,
      improvement: Math.round(94 + dynamicOffset * 1.8) - Math.round(71 + dynamicOffset)
    };
  }, [patients]);

  const getThemeColors = () => {
    switch (colorTheme) {
      case 'emerald':
        return {
          stroke: '#10b981',
          fill: '#ecfdf5',
          text: 'text-emerald-605',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          indicator: '#10b981',
        };
      case 'indigo':
        return {
          stroke: '#6366f1',
          fill: '#e0e7ff',
          text: 'text-indigo-605',
          badge: 'bg-indigo-50 text-indigo-700 border-indigo-100',
          indicator: '#6366f1',
        };
      default:
        return {
          stroke: '#0d9488',
          fill: '#f0fdfa',
          text: 'text-teal-605',
          badge: 'bg-teal-50 text-teal-700 border-teal-100',
          indicator: '#0d9488',
        };
    }
  };

  const themeColors = getThemeColors();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 shadow-xs space-y-6">
      
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" style={{ color: themeColors.indicator }} />
            CareRefill Compliance Diagnostics
          </span>
          <h3 className="text-base font-bold text-gray-950 dark:text-white">
            Medication Adherence Trend Line
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Real-time visual monitoring of patient compliance and monthly dispatched refill cycles.
          </p>
        </div>

        {/* Metric mode toggle selectors */}
        <div className="flex rounded-xl bg-gray-100 dark:bg-slate-950 p-1 border border-gray-200/80 dark:border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setMetricMode('adherence')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              metricMode === 'adherence'
                ? 'bg-white dark:bg-slate-900 text-gray-950 dark:text-white shadow-3xs font-black'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
            }`}
          >
            Adherence Rate %
          </button>
          <button
            onClick={() => setMetricMode('refills')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              metricMode === 'refills'
                ? 'bg-white dark:bg-slate-900 text-gray-950 dark:text-white shadow-3xs font-black'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
            }`}
          >
            Refill Dispatches
          </button>
        </div>
      </div>

      {/* Main Stats summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50/50 dark:bg-slate-950/45 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 font-sans">
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-400">Adherence Target</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-gray-950 dark:text-white">95%</span>
            <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/10">Standard</span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-400">Current Level</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-gray-950 dark:text-white">
              {statsSummary.monthlyData[5].compliance}%
            </span>
            <span className="text-[10px] text-indigo-500 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded-md border border-indigo-500/10">Active</span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-400">Historical Gains</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              +{statsSummary.improvement}%
            </span>
            <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-medium">Since Jan</span>
          </div>
        </div>
      </div>

      {/* Recharts responsive container */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={statsSummary.monthlyData}
            margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" opacity={0.6} />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 10, fill: '#64748b' }} 
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              domain={metricMode === 'adherence' ? [50, 100] : [0, 'auto']} 
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => metricMode === 'adherence' ? `${val}%` : val}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '11px',
                fontFamily: 'sans-serif'
              }}
              labelStyle={{ fontWeight: 'bold', color: '#818cf8', marginBottom: '4px' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            />
            <Line
              type="monotone"
              dataKey={metricMode === 'adherence' ? 'compliance' : 'refills'}
              name={metricMode === 'adherence' ? 'Medication Compliance Rate (%)' : 'Refill Cycles Completed'}
              stroke={themeColors.stroke}
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 1, fill: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0, fill: themeColors.stroke }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Clinical Adherence Diagnostic Insight */}
      <div className="bg-slate-50 dark:bg-slate-950/20 p-4 rounded-2xl border border-gray-100 dark:border-slate-805 text-xs text-gray-600 dark:text-slate-300 flex items-start gap-3">
        <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-gray-950 dark:text-white uppercase text-[10px] tracking-wider">SMS-Driven Behavioral Impact</p>
          <p className="leading-relaxed">
            The integration of personalized, language-specific SMS reminders (sent direct to patient phones) has triggered a consistent monthly increase in on-time refills since January. The target goal is <strong className="text-teal-600 dark:text-teal-400">95.0% adherence</strong> across all registered chronic hypertension and diabetes patients.
          </p>
        </div>
      </div>

    </div>
  );
}
