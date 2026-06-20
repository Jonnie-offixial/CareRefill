import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  Sliders, 
  Plus, 
  Edit2, 
  Trash2, 
  Activity, 
  TrendingUp, 
  CreditCard, 
  CheckCircle, 
  MapPin, 
  Smartphone, 
  UserPlus, 
  Briefcase, 
  Lock, 
  RefreshCw,
  Sparkles,
  Search
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  patientsCount: number;
  revenue: string;
  status: 'Active' | 'Under Maintenance' | 'Suspended';
  staffCount: number;
}

interface ExecutiveUser {
  id: string;
  name: string;
  email: string;
  role: 'Pharmacy Owner' | 'Pharmacist' | 'Nurse' | 'Receptionist';
  branchId: string;
  status: 'Active' | 'Suspended' | 'Pending';
}

interface ExecutiveDashboardProps {
  currentPharmacyId: string;
  onSelectPharmacy: (id: string) => void;
  showToast: (msg: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export default function ExecutiveDashboard({ currentPharmacyId, onSelectPharmacy, showToast }: ExecutiveDashboardProps) {
  // 1. Branches state
  const [branches, setBranches] = useState<Branch[]>([
    { id: 'pharm-001', name: 'City Pharmacy (Branch A - Kampala Road)', address: 'Plot 14, Kampala Road, Kampala', phone: '+256 700 123 456', patientsCount: 145, revenue: 'UGX 1,450,000', status: 'Active', staffCount: 5 },
    { id: 'pharm-002', name: 'Arua First Care Chemist (Branch B)', address: 'Arua-Gulu Highway, Arua City', phone: '+256 788 344 555', patientsCount: 82, revenue: 'UGX 780,000', status: 'Active', staffCount: 3 },
    { id: 'pharm-003', name: 'Mbale Elgon Chemist (Branch C)', address: 'Elgon Avenue, Mbale City', phone: '+256 752 988 111', patientsCount: 54, revenue: 'UGX 510,005', status: 'Active', staffCount: 2 },
    { id: 'pharm-004', name: 'Gulu Northern Medical Hub (Branch D)', address: 'Airfield Road, Gulu Town', phone: '+256 701 445 588', patientsCount: 38, revenue: 'UGX 320,000', status: 'Under Maintenance', staffCount: 1 }
  ]);

  // 2. Multi-branch users
  const [users, setUsers] = useState<ExecutiveUser[]>([
    { id: 'usr-101', name: 'Vianne Jonny', email: 'viannejonny@gmail.com', role: 'Pharmacy Owner', branchId: 'pharm-001', status: 'Active' },
    { id: 'usr-102', name: 'Dr. Sarah Mukasa', email: 'sarah.mukasa@carerefill.ug', role: 'Pharmacist', branchId: 'pharm-001', status: 'Active' },
    { id: 'usr-103', name: 'Dr. Emmanuel Okot', email: 'emmanuel.okot@carerefill.ug', role: 'Pharmacist', branchId: 'pharm-002', status: 'Active' },
    { id: 'usr-104', name: 'Grace Nakamya', email: 'grace.n@carerefill.ug', role: 'Nurse', branchId: 'pharm-001', status: 'Active' },
    { id: 'usr-105', name: 'Kato Derrick', email: 'derrick.k@carerefill.ug', role: 'Receptionist', branchId: 'pharm-003', status: 'Active' },
    { id: 'usr-106', name: 'Babirye Sharon', email: 'sharon.b@carerefill.ug', role: 'Nurse', branchId: 'pharm-004', status: 'Pending' }
  ]);

  // 3. Roles and custom permission sets
  const [rolePermissions, setRolePermissions] = useState({
    'Pharmacy Owner': { viewPatients: true, editMedications: true, sendReminders: true, viewReports: true, manageBilling: true },
    'Pharmacist': { viewPatients: true, editMedications: true, sendReminders: true, viewReports: true, manageBilling: false },
    'Nurse': { viewPatients: true, editMedications: false, sendReminders: true, viewReports: false, manageBilling: false },
    'Receptionist': { viewPatients: true, editMedications: false, sendReminders: false, viewReports: false, manageBilling: false }
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'branches' | 'staff' | 'permissions' | 'finance'>('branches');
  const [searchUserQuery, setSearchUserQuery] = useState('');
  
  // Modals / forms
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [branchForm, setBranchForm] = useState({ name: '', address: '', phone: '', status: 'Active' as any });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'Pharmacist' as any, branchId: 'pharm-001' });

  // Handle Branch Switcher click
  const handleActivateBranch = (branchId: string, name: string) => {
    onSelectPharmacy(branchId);
    showToast("Active Workspace Switched", `Now running context under: ${name}`, "success");
  };

  // Add new branch
  const handleCreateBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name || !branchForm.address) return;

    const newBranch: Branch = {
      id: `pharm-00${branches.length + 1}`,
      name: branchForm.name,
      address: branchForm.address,
      phone: branchForm.phone || '+256 700 000 000',
      patientsCount: 0,
      revenue: 'UGX 0',
      status: branchForm.status || 'Active',
      staffCount: 1
    };

    setBranches([...branches, newBranch]);
    showToast("Branch Registered", `${branchForm.name} deployed successfully!`, "success");
    setBranchForm({ name: '', address: '', phone: '', status: 'Active' });
    setShowAddBranchModal(false);
  };

  // Add new staff user
  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) return;

    const newUser: ExecutiveUser = {
      id: `usr-${Date.now().toString().slice(-3)}`,
      name: userForm.name,
      email: userForm.email,
      role: userForm.role,
      branchId: userForm.branchId,
      status: 'Active'
    };

    setUsers([...users, newUser]);
    
    // Update branch staffCount
    setBranches(prev => prev.map(b => b.id === userForm.branchId ? { ...b, staffCount: b.staffCount + 1 } : b));

    showToast("Staff Member Registered", `Credential profiles dispatched to ${userForm.email}`, "success");
    setUserForm({ name: '', email: '', role: 'Pharmacist', branchId: 'pharm-001' });
    setShowAddUserModal(false);
  };

  // Toggle user active status
  const handleToggleUserStatus = (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    setUsers(users.map(u => u.id === userId ? { ...u, status: nextStatus } : u));
    showToast("Credential Status Changed", `User credentials state flagged as ${nextStatus}`, "info");
  };

  // Delete staff user
  const handleDeleteUser = (userId: string, branchId: string) => {
    if (confirm("Are you sure you want to de-register this user from the branch?")) {
      setUsers(users.filter(u => u.id !== userId));
      setBranches(prev => prev.map(b => b.id === branchId ? { ...b, staffCount: Math.max(1, b.staffCount - 1) } : b));
      showToast("User Removed", "User de-registered from corporate logs.", "success");
    }
  };

  // Toggle custom permissions dynamically
  const handleTogglePermission = (role: 'Pharmacy Owner' | 'Pharmacist' | 'Nurse' | 'Receptionist', key: string) => {
    const rolePerms = rolePermissions[role] as any;
    const currentVal = rolePerms[key];
    setRolePermissions({
      ...rolePermissions,
      [role]: {
        ...rolePermissions[role],
        [key]: !currentVal
      }
    });
    showToast("Permissions Matrix Updated", `Updated dynamic security policy for: ${role}`, "success");
  };

  // Charts Mock Data
  const branchRevenueComparison = branches.map(b => ({
    name: b.name.split('(')[0].replace('Chemist', '').replace('Pharmacy', '').trim(),
    patients: b.patientsCount,
    revenue_ugx: parseInt(b.revenue.replace(/[^0-9]/g, ''), 10) || 0
  }));

  const complianceRates = [
    { name: 'Kampala road (A)', compliance: 92, target: 95 },
    { name: 'Arua first check (B)', compliance: 78, target: 95 },
    { name: 'Mbale Elgon (C)', compliance: 85, target: 95 },
    { name: 'Gulu Medical Hub (D)', compliance: 68, target: 95 }
  ];

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      
      {/* EXECUTIVE SUMMARY LEADERBOARD CARD */}
      <div className="bg-slate-905 bg-slate-900 border-2 border-slate-950 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex transform translate-x-8 translate-y-2 select-none pointer-events-none">
          <Building2 className="w-64 h-64 text-brand-green" />
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500 text-slate-950">
                <Briefcase className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#84CC16]">Executive Corporate Suite</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight font-sans">Multi-Branch Pharmacy Owner Platform</h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Monitor clinic adherence rates, configure unified staff permission sets, manage local branch credentials, and analyze regional revenue logs across your enterprise.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddBranchModal(true)}
              className="bg-brand-green hover:bg-emerald-600 px-4 py-2 text-xs font-extrabold uppercase rounded-xl text-white tracking-wider flex items-center gap-2 transition cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add New Branch
            </button>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 px-4 py-2 text-xs font-extrabold uppercase rounded-xl tracking-wider flex items-center gap-2 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Register Staff
            </button>
          </div>
        </div>
      </div>

      {/* QUICK STATS METRIC BANNER */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase font-sans">Total Managed Branches</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600"><Building2 className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl font-black text-gray-900 tracking-tight">{branches.length}</p>
          <p className="text-[10px] text-gray-450 mt-1 font-sans">Across Uganda Regions</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase font-sans">Global Patient Registry</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600"><Users className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl font-black text-gray-900 tracking-tight">
            {branches.reduce((a, b) => a + b.patientsCount, 0)}
          </p>
          <p className="text-[10px] text-gray-450 mt-1 font-sans">Active chronic patient profiles</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase font-sans">Enterprise Revenue (MT)</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600"><CreditCard className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl font-black text-blue-950 tracking-tight">UGX 3,060,005</p>
          <p className="text-[10px] text-gray-450 mt-1 font-sans">Aggregated Monthly Receipts</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase font-sans">Unified Staff List</span>
            <span className="p-1.5 rounded-lg bg-yellow-50 text-yellow-600"><ShieldCheck className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl font-black text-gray-900 tracking-tight">{users.length}</p>
          <p className="text-[10px] text-gray-450 mt-1 font-sans">Active clinician-actors</p>
        </div>
      </div>

      {/* CORE GRAPHICAL REPORT MODULE */}
      <div className="bg-white border rounded-3xl p-6 shadow-3xs grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Branch Adherence & Volume Metrics comparison
          </h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchRevenueComparison} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar yAxisId="left" dataKey="patients" name="Active Patients (headcount)" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="revenue_ugx" name="Revenue (UGX value)" fill="#5DBA0A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/20 border rounded-2xl p-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h5 className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Clinical Compliance Indices</h5>
            
            <div className="space-y-3">
              {complianceRates.map((cr, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-700">
                    <span>{cr.name}</span>
                    <span className={cr.compliance >= 80 ? 'text-emerald-600' : 'text-amber-600'}>{cr.compliance}% Adherence</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${cr.compliance >= 85 ? 'bg-brand-green' : 'bg-amber-500'}`} 
                      style={{ width: `${cr.compliance}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 mt-4 grid grid-cols-2 gap-2 text-center text-[10px] font-mono text-gray-500">
            <div className="bg-white py-1.5 rounded-lg border">
              <span className="block font-black text-xs text-brand-green">83.2%</span>
              Average Adherence
            </div>
            <div className="bg-white py-1.5 rounded-lg border">
              <span className="block font-black text-xs text-[#84CC16]">95.0%</span>
              National Standard
            </div>
          </div>
        </div>
      </div>

      {/* RE-ARCHITECTED NAVIGATION BAR */}
      <div className="flex border-b">
        {[
          { id: 'branches', label: 'Branches Coordinator' },
          { id: 'staff', label: 'Corporate Staff list' },
          { id: 'permissions', label: 'Unified Permissions Matrix' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id 
                ? 'border-brand-green text-slate-950 font-black' 
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CORE VIEWS */}
      {activeTab === 'branches' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map((b) => {
            const isActiveWorkspace = currentPharmacyId === b.id;
            return (
              <div 
                key={b.id} 
                className={`bg-white border p-5 rounded-2xl shadow-3xs flex flex-col justify-between gap-4 transition duration-200 ${
                  isActiveWorkspace ? 'border-brand-green ring-1 ring-brand-green/30 bg-emerald-50/5' : 'hover:border-gray-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-gray-950">{b.name}</h4>
                        {isActiveWorkspace && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md">
                            Active Console
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {b.address}
                      </p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      b.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      b.status === 'Under Maintenance' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 text-center text-xs font-mono text-gray-500">
                    <div className="bg-gray-50 p-2 rounded-xl">
                      <span className="block font-black text-sm text-gray-800">{b.patientsCount}</span>
                      Patients
                    </div>
                    <div className="bg-gray-50 p-2 rounded-xl">
                      <span className="block font-black text-sm text-brand-green">{b.revenue}</span>
                      Rev. (Mo.)
                    </div>
                    <div className="bg-gray-50 p-2 rounded-xl">
                      <span className="block font-black text-sm text-gray-800">{b.staffCount}</span>
                      Staff Count
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-[10px] text-gray-400 font-bold uppercase font-mono">ID: {b.id}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleActivateBranch(b.id, b.name)}
                      disabled={isActiveWorkspace || b.status === 'Suspended'}
                      className={`text-xs px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                        isActiveWorkspace
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-teal-50 hover:bg-teal-100 text-teal-850'
                      }`}
                    >
                      {isActiveWorkspace ? "Currently Active" : "Apply Console Focus"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="bg-white border rounded-2xl overflow-hidden shadow-3xs">
          <div className="bg-gray-50 p-4 border-b flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">Enterprise Clinical Access control</h4>
            
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2 text-gray-400" />
              <input
                type="text"
                placeholder="Search staff names or roles..."
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
                className="w-full bg-white pl-9 pr-3 py-1.5 border border-gray-250 rounded-xl text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Email Coordinates</th>
                  <th className="p-4">Staff Role</th>
                  <th className="p-4">Assigned Branch Workspace</th>
                  <th className="p-4">Credentials Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-800">
                {users.filter(u => 
                  u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) || 
                  u.email.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
                  u.role.toLowerCase().includes(searchUserQuery.toLowerCase())
                ).map((u) => {
                  const branchObj = branches.find(b => b.id === u.branchId);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 font-bold text-slate-900">{u.name}</td>
                      <td className="p-4 font-mono text-slate-500">{u.email}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 font-bold text-gray-800">
                          <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-slate-700">{branchObj?.name || 'Multi-Workspace'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          u.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          u.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.status)}
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-bold text-[10px] cursor-pointer"
                        >
                          {u.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.branchId)}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-md font-bold text-[10px] cursor-pointer"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="bg-white border rounded-2xl p-6 shadow-3xs space-y-6">
          <div className="border-b pb-4">
            <h4 className="text-sm font-semibold text-gray-900">Enterprise Unified Permissions Matrix</h4>
            <p className="text-xs text-gray-400 mt-0.5">Toggle default access policies per clinic staff role globally</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {(['Pharmacy Owner', 'Pharmacist', 'Nurse', 'Receptionist'] as const).map((role) => {
              const perms = rolePermissions[role];
              return (
                <div key={role} className="bg-slate-50 border p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h5 className="font-extrabold text-sm text-slate-900">{role}</h5>
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>

                  <div className="space-y-3 font-sans text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">View Patients Register</span>
                      <input 
                        type="checkbox" 
                        checked={perms.viewPatients}
                        onChange={() => handleTogglePermission(role, 'viewPatients')}
                        className="rounded border-gray-300 text-brand-green focus:ring-brand-green h-4 w-4"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium font-sans">Add/Edit Medications</span>
                      <input 
                        type="checkbox" 
                        checked={perms.editMedications}
                        onChange={() => handleTogglePermission(role, 'editMedications')}
                        className="rounded border-gray-300 text-brand-green focus:ring-brand-green h-4 w-4"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Send Reminders Queue</span>
                      <input 
                        type="checkbox" 
                        checked={perms.sendReminders}
                        onChange={() => handleTogglePermission(role, 'sendReminders')}
                        className="rounded border-gray-300 text-brand-green focus:ring-brand-green h-4 w-4"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Generate Compliance Reports</span>
                      <input 
                        type="checkbox" 
                        checked={perms.viewReports}
                        onChange={() => handleTogglePermission(role, 'viewReports')}
                        className="rounded border-gray-300 text-brand-green focus:ring-brand-green h-4 w-4"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Manage Financial Billing</span>
                      <input 
                        type="checkbox" 
                        checked={perms.manageBilling}
                        onChange={() => handleTogglePermission(role, 'manageBilling')}
                        className="rounded border-gray-300 text-brand-green focus:ring-brand-green h-4 w-4"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BRANCH MODAL */}
      {showAddBranchModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border shadow-2xl relative">
            <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-400" /> Register Corporate Branch Workspace
            </h3>
            <form onSubmit={handleCreateBranchSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-500 font-black uppercase tracking-wider mb-1">Pharmacy/Branch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. City Pharmacy (Branch E - Gulu)"
                  value={branchForm.name}
                  onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                  className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-black uppercase tracking-wider mb-1">Physical Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plot 12 Gulu-Juba Highway"
                  value={branchForm.address}
                  onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                  className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-black uppercase tracking-wider mb-1">Direct Contact Phone</label>
                <input
                  type="text"
                  placeholder="+256 701 445588"
                  value={branchForm.phone}
                  onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                  className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-black uppercase tracking-wider mb-1">Initial Status</label>
                <select
                  value={branchForm.status}
                  onChange={(e) => setBranchForm({ ...branchForm, status: e.target.value as any })}
                  className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="Active">Active Operation</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddBranchModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-green hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Deploy Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STAFF USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border shadow-2xl relative">
            <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-gray-400" /> Add Corporate Staff Credentials
            </h3>
            <form onSubmit={handleCreateUserSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-500 font-black uppercase tracking-wider mb-1">Full Staff Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Juliet Namatovu"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-black uppercase tracking-wider mb-1">Clinical Email *</label>
                <input
                  type="email"
                  required
                  placeholder="juliet.n@carerefill.ug"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-black uppercase tracking-wider mb-1">Corporate Staff Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                  className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="Pharmacist">Chief Pharmacist</option>
                  <option value="Nurse">Standard Nurse</option>
                  <option value="Receptionist">Health Desk Receptionist</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-black uppercase tracking-wider mb-1">Branch Assigned Scope</label>
                <select
                  value={userForm.branchId}
                  onChange={(e) => setUserForm({ ...userForm, branchId: e.target.value })}
                  className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-xs focus:outline-none"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-green hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Provision Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
