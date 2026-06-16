import React, { useState } from 'react';
import { ReminderLog } from '../types';
import { Calendar, Play, Clock, Search, CheckCircle, XCircle, AlertCircle, RefreshCw, Send, Radio, MessageSquare, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SchedulerSimProps {
  reminders: (ReminderLog & { patient_name: string; phone_number: string; condition: string, medication_name: string })[];
  onTriggerScheduler: (simulationDate: string) => Promise<any>;
  colorTheme: string;
}

export default function SchedulerSim({
  reminders,
  onTriggerScheduler,
  colorTheme,
}: SchedulerSimProps) {
  const [simulationDate, setSimulationDate] = useState('2026-06-12');
  const [running, setRunning] = useState(false);
  const [search, setSearch] = useState('');
  const [apiResponseLogs, setApiResponseLogs] = useState<any>(null);
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<'All' | 'WhatsApp' | 'SMS'>('All');

  const handleRunScheduler = async () => {
    setRunning(true);
    setApiResponseLogs(null);
    try {
      const res = await onTriggerScheduler(simulationDate);
      setApiResponseLogs(res);
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  const filteredReminders = reminders.filter((rem) => {
    const matchesSearch =
      rem.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      rem.phone_number.includes(search) ||
      rem.message.toLowerCase().includes(search.toLowerCase());
    
    const matchesChannel = selectedChannelFilter === 'All' || rem.channel === selectedChannelFilter;
    return matchesSearch && matchesChannel;
  });

  const getThemeColorClass = () => {
    switch (colorTheme) {
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500';
      case 'indigo': return 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500';
      default: return 'bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500';
    }
  };

  const getThemeTextClass = () => {
    switch (colorTheme) {
      case 'emerald': return 'text-emerald-600';
      case 'indigo': return 'text-indigo-600';
      default: return 'text-teal-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Scheduler Trigger Console */}
      <div className="lg:col-span-1 bg-gray-50 rounded-2xl p-5 border border-gray-100/80 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">8:00 AM Cron Engine</h3>
          </div>
          
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            Every day at 8:00 AM, the system runs an automated scheduler search for due medications:
          </p>

          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2 text-xs text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></span>
              <div><strong className="text-gray-950 font-medium">7 days away:</strong> First alert cycle.</div>
            </li>
            <li className="flex items-start gap-2 text-xs text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5"></span>
              <div><strong className="text-gray-950 font-medium">3 days away:</strong> Urgent check-in.</div>
            </li>
            <li className="flex items-start gap-2 text-xs text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5"></span>
              <div><strong className="text-gray-950 font-medium">Due Today (0 days):</strong> Pharmacy picker ready.</div>
            </li>
            <li className="flex items-start gap-2 text-xs text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5"></span>
              <div><strong className="text-gray-950 font-medium">Overdue (up to -5 days):</strong> Retention alerts.</div>
            </li>
          </ul>

          <div className="border-t border-gray-200/60 pt-4 mb-4">
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Operational Clock Calendar</label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={simulationDate}
                onChange={(e) => setSimulationDate(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-800 font-mono focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1 leading-normal">
              Change the operational date above to scan who is due on that specific date! 
              <br />Try <span className="font-mono bg-gray-100 border border-gray-200 px-0.5 text-[9px] rounded-sm text-gray-600">2026-06-12</span> (3 alerts) or <span className="font-mono bg-gray-100 border border-gray-200 px-0.5 text-[9px] rounded-sm text-gray-600">2026-06-14</span> (1 alert).
            </p>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleRunScheduler}
            disabled={running}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-xs transition-all shadow-md cursor-pointer ${getThemeColorClass()} disabled:opacity-50`}
          >
            {running ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Calculating cohort math...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" /> Trigger 8:00 AM Scheduler
              </>
            )}
          </button>
        </div>
      </div>

      {/* Outbox Event History Terminal & List */}
      <div className="lg:col-span-2 flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 border-b border-gray-100 pb-3">
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              Automated Notification Outbox ({filteredReminders.length})
            </h3>
            
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedChannelFilter('All')}
                className={`px-2 py-1 text-[10px] font-medium rounded-md cursor-pointer ${selectedChannelFilter === 'All' ? 'bg-slate-200 text-slate-800' : 'bg-transparent text-gray-500 hover:bg-gray-100'}`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedChannelFilter('WhatsApp')}
                className={`px-2 py-1 text-[10px] font-medium rounded-md cursor-pointer ${selectedChannelFilter === 'WhatsApp' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-transparent text-gray-500 hover:bg-gray-100'}`}
              >
                WhatsApp
              </button>
              <button
                onClick={() => setSelectedChannelFilter('SMS')}
                className={`px-2 py-1 text-[10px] font-medium rounded-md cursor-pointer ${selectedChannelFilter === 'SMS' ? 'bg-indigo-50 text-indigo-800 border border-indigo-100' : 'bg-transparent text-gray-500 hover:bg-gray-100'}`}
              >
                SMS
              </button>
            </div>
          </div>

          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-2 text-gray-400" />
            <input
              type="text"
              placeholder="Search outbox message texts or recipients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
            />
          </div>

          {/* Scroller Area */}
          <div className="max-h-[290px] overflow-y-auto space-y-2 pr-1">
            {filteredReminders.length === 0 ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl py-12 text-center text-gray-400">
                <Clock className="w-8 h-8 mx-auto opacity-30 mb-2" />
                <p className="text-xs">No notifications logged in outbox matching this filter.</p>
                <p className="text-[10px] mt-1 text-gray-400">Click &quot;Trigger 8:00 AM Scheduler&quot; to generate due medication reminders.</p>
              </div>
            ) : (
              filteredReminders.map((rem) => (
                <div key={rem.reminder_id} className="bg-white border border-gray-100 rounded-xl p-3 shadow-3xs flex gap-2.5 hover:border-gray-300/80 transition-all text-xs">
                  <div className="mt-0.5 shrink-0">
                    {rem.status === 'Sent' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : rem.status === 'Failed' ? (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-gray-900 truncate">{rem.patient_name}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={`px-1 text-[9px] font-mono rounded bg-slate-100 border border-gray-200 text-gray-600`}>{rem.channel}</span>
                        <span className={`px-1 text-[9px] font-medium rounded ${rem.status === 'Sent' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{rem.status}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1 italic tracking-tight font-sans line-clamp-3">&quot;{rem.message}&quot;</p>
                    <div className="flex items-center justify-between gap-2 mt-2 text-[10px] text-gray-400 border-t border-gray-50 pt-1.5 font-mono">
                      <span>{rem.phone_number} • {rem.condition}</span>
                      <span>Sent: {rem.sent_at ? rem.sent_at.split('T')[0] + ' ' + rem.sent_at.slice(11,16) : rem.reminder_date.split('T')[0]}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* API response webhook terminal container */}
        <AnimatePresence>
          {apiResponseLogs && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 border-t border-gray-100 pt-3 overflow-hidden"
            >
              <div className="bg-slate-900 rounded-xl p-3 text-[10px] font-mono text-emerald-400 border border-slate-800 shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5 text-slate-400">
                  <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-emerald-500" /> TELECOMM WEBHOOK TERMINAL</span>
                  <span className="text-[9px] bg-slate-800 px-1 border border-slate-700 rounded-sm">200 OK</span>
                </div>
                <p className="text-slate-200">Refill Bot engine completed live webhook dispatch check at: {new Date(apiResponseLogs.run_at || apiResponseLogs.simulation_run_at || Date.now()).toLocaleString()}</p>
                <div className="grid grid-cols-3 gap-2 my-1.5 bg-slate-950 p-1.5 rounded border border-slate-900 text-center">
                  <div>
                    <p className="text-slate-400 text-[8px] uppercase">Delivered Successful</p>
                    <p className="text-emerald-400 font-bold text-sm">{apiResponseLogs.reminders_sent_count}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[8px] uppercase">Failed (Bad Code)</p>
                    <p className="text-rose-400 font-bold text-sm">{apiResponseLogs.reminders_failed_count}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[8px] uppercase">Deduplicated Spam</p>
                    <p className="text-blue-400 font-bold text-sm">{apiResponseLogs.skipped_duplicates_count}</p>
                  </div>
                </div>
                {apiResponseLogs.details.length > 0 ? (
                  <div className="max-h-[80px] overflow-y-auto space-y-1 text-slate-300">
                    {apiResponseLogs.details.map((d: any, idx: number) => (
                      <p key={idx} className="truncate">
                        <span className="text-amber-500">[{d.channel}]</span> To {d.patient_name} ({d.phone}): {d.status === "Sent" ? "✓ SUCCESS_SMS" : "✗ ENDPOINT_ERR_404"}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No qualifying patient cohorts were found scheduled for 7d, 3d, or Due Today on the chosen calendar reference date.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
    </div>
  );
}
