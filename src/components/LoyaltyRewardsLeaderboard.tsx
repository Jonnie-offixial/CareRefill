import React, { useState, useEffect } from 'react';
import { Patient, Medication } from '../types';
import { 
  Award, 
  Gift, 
  Zap, 
  Search, 
  User, 
  Check, 
  Flame, 
  Coins 
} from 'lucide-react';

interface LoyaltyRewardsLeaderboardProps {
  patients: (Patient & { medication: Medication | null })[];
  pharmacyId: string;
  onRefreshData: () => Promise<void>;
  showToast: (msg: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export default function LoyaltyRewardsLeaderboard({
  patients,
  pharmacyId,
  onRefreshData,
  showToast
}: LoyaltyRewardsLeaderboardProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [loyaltyData, setLoyaltyData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);

  // Load all loyalty scores from backend
  const loadLoyaltyRosters = async () => {
    try {
      const list: any[] = [];
      for (const p of patients) {
        const res = await fetch(`/api/patients/${p.patient_id}/loyalty`);
        if (res.ok) {
          const scoreData = await res.json();
          const onTimeCount = (p as any).refilled_on_time || 1;
          const delayedCount = (p as any).delayed_refills || 0;
          const totalPlannedRefills = onTimeCount + delayedCount;
          
          list.push({
            patient_id: p.patient_id,
            full_name: p.full_name,
            chronic_condition: p.chronic_condition,
            points: scoreData.points || totalPlannedRefills * 2, // Default formula fallback
            tier: scoreData.points >= 15 ? 'Gold Star' : scoreData.points >= 8 ? 'Silver Core' : 'Bronze Guard',
            streak: scoreData.points > 20 ? 4 : scoreData.points > 10 ? 2 : 1
          });
        }
      }
      setLoyaltyData(list);
    } catch (e) {
      console.error("Error loading loyalty ledger", e);
    }
  };

  useEffect(() => {
    loadLoyaltyRosters();
  }, [patients]);

  const handleRedeemPoints = async (patId: string, rewardName: string, pointsCost: number) => {
    const record = loyaltyData.find(l => l.patient_id === patId);
    if (!record) return;

    if (record.points < pointsCost) {
      showToast("Insufficient Balance", `${record.full_name} needs ${pointsCost} points but only has ${record.points}.`, "error");
      return;
    }

    setRedeemLoading(true);
    try {
      const res = await fetch(`/api/patients/${patId}/loyalty/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reward_name: rewardName, points_cost: pointsCost })
      });

      if (res.ok) {
        showToast(
          "Reward Redeemed Successfully", 
          `${rewardName} unlocked with verification voucher number #${Math.floor(100000 + Math.random() * 900000)}.`, 
          'success'
        );
        await loadLoyaltyRosters();
        onRefreshData();
      } else {
        const err = await res.json();
        showToast("Claim Denied", err.error || "Unable to claim this reward.", "error");
      }
    } catch (e) {
      showToast("Clinical network failed", "Please try again later.", "error");
    } finally {
      setRedeemLoading(false);
    }
  };

  const filteredLoyalty = loyaltyData.filter(l => 
    l.full_name.toLowerCase().includes(search.toLowerCase()) || 
    l.chronic_condition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Rewards Catalog panel */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4 col-span-1">
        <div className="flex items-center gap-2 text-brand-green">
          <Gift className="w-5 h-5" />
          <h3 className="font-bold text-sm">Loyalty Program Incentives</h3>
        </div>
        <p className="text-xs text-gray-500">Patients earn points based on consistent clinic appointment adherence and timely, on-time refills.</p>

        <div className="space-y-3 pt-2">
          <div className="border border-brand-green/20 bg-brand-accent-bg p-3 rounded-2xl flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-brand-green">15% Bill Coupon</h4>
              <p className="text-[10px] text-gray-500">Deduct 15% off their next medication bill invoice.</p>
            </div>
            <span className="badge-green-custom px-2.5 py-1 text-[10px] font-black rounded-lg shrink-0 font-mono">10 PTS</span>
          </div>

          <div className="border border-blue-105 bg-blue-50 p-3 rounded-2xl flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-blue-900">Free Medical consultation</h4>
              <p className="text-[10px] text-gray-600">Access premium pharmacist consulting desk free of charge.</p>
            </div>
            <span className="badge-blue-custom px-2.5 py-1 text-[10px] font-black rounded-lg shrink-0 font-mono">15 PTS</span>
          </div>

          <div className="border border-amber-105 bg-amber-50 p-3 rounded-2xl flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-amber-900">Rapid Testing Combo</h4>
              <p className="text-[10px] text-gray-600">Free blood sugar, glucose testing and BP checks.</p>
            </div>
            <span className="badge-amber-custom px-2.5 py-1 text-[10px] font-black rounded-lg shrink-0 font-mono">20 PTS</span>
          </div>
        </div>
      </div>

      {/* Points Leaderboard directory list */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">CareRefill Gamified Leaderboard</h3>
            <p className="text-xs text-gray-400">Rosters ranking patients by on-time compliance performance coefficients.</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/20 px-3 py-1.5 border border-gray-150 dark:border-slate-850 rounded-xl flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search patients..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-0 text-xs focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 font-bold">
                <th className="py-2.5">Patient</th>
                <th className="py-2.5">Chronic Diagnosis</th>
                <th className="py-2.5">Current Points Balance</th>
                <th className="py-2.5">Compliance Level Badge</th>
                <th className="py-2.5 text-right">Redeem Center Desk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-850 text-gray-700 dark:text-gray-300">
              {filteredLoyalty.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 font-serif italic">
                    No active score records found.
                  </td>
                </tr>
              ) : (
                filteredLoyalty.map((item) => (
                  <tr key={item.patient_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10">
                    <td className="py-3 font-bold text-gray-950 dark:text-gray-100">{item.full_name}</td>
                    <td className="py-3">
                      <span className="badge-gray-custom text-[10px] px-2 py-0.5 rounded-full">{item.chronic_condition}</span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-extrabold text-sm">{item.points}</span>
                      </div>
                    </td>
                    <td className="py-3 font-semibold">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        item.tier === 'Gold Star' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.tier}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => handleRedeemPoints(item.patient_id, "15% Bill Coupon", 10)}
                          disabled={item.points < 10 || redeemLoading}
                          className="px-2 py-1 bg-brand-accent-bg disabled:opacity-40 text-brand-green font-bold text-[9px] rounded hover:bg-emerald-100/60 transition-colors cursor-pointer"
                        >
                          Redeem 10pts
                        </button>
                        <button
                          onClick={() => handleRedeemPoints(item.patient_id, "Free Consultation Coupon", 15)}
                          disabled={item.points < 15 || redeemLoading}
                          className="px-2 py-1 bg-blue-100 text-blue-800 disabled:opacity-40 font-bold text-[9px] rounded hover:bg-blue-200 transition-colors cursor-pointer"
                        >
                          Redeem 15pts
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
