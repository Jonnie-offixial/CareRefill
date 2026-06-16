import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Building2, 
  Users, 
  MessageSquare, 
  CalendarDays, 
  Plus, 
  Edit2, 
  Trash2, 
  UserCheck, 
  RefreshCw, 
  Sparkles, 
  Mail, 
  CheckCircle, 
  X,
  AlertCircle,
  Database
} from 'lucide-react';

interface Pharmacy {
  pharmacy_id: string;
  pharmacy_name: string;
  address: string;
  phone_number: string;
  color_theme: string;
  created_at: string;
}

interface User {
  user_id?: string;
  full_name: string;
  email: string;
  role: string;
  pharmacy_id: string;
  created_at?: string;
}

interface AdminPanelProps {
  currentUser: any;
  onUserUpdate: (updatedUser: any) => void;
  onRefreshAllData: () => void;
}

export default function AdminPanel({ currentUser, onUserUpdate, onRefreshAllData }: AdminPanelProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pharmacy Modal state
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [editingRx, setEditingRx] = useState<Pharmacy | null>(null);
  const [rxForm, setRxForm] = useState({
    pharmacy_id: '',
    pharmacy_name: '',
    address: '',
    phone_number: '',
    color_theme: 'teal',
    status: 'Active',
    plan_tier: 'Standard',
    message_limit: 1000
  });
  const [rxError, setRxError] = useState<string | null>(null);
  const [rxSuccess, setRxSuccess] = useState<string | null>(null);

  // User promotion state
  const [updatingUserEmail, setUpdatingUserEmail] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('Staff');

  // Load Admin stats
  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setError(null);
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed loading system stats.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Unable to connect to administration APIs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, [currentUser]);

  // Handle identity Switch
  const assumeVianneIdentity = () => {
    const adminUser = {
      name: "Vianne Jonny",
      email: "viannejonny@gmail.com",
      pharmacy_id: "pharm-001",
      role: "Admin",
      mode: "Super Admin Mode"
    };
    onUserUpdate(adminUser);
    localStorage.setItem('supabase_user_session', JSON.stringify(adminUser));
  };

  // Open Rx creation or edit modal
  const handleOpenRxModal = (rx: Pharmacy | null = null) => {
    setRxError(null);
    setRxSuccess(null);
    if (rx) {
      setEditingRx(rx);
      setRxForm({
        pharmacy_id: rx.pharmacy_id,
        pharmacy_name: rx.pharmacy_name,
        address: rx.address,
        phone_number: rx.phone_number,
        color_theme: rx.color_theme,
        status: (rx as any).status || 'Active',
        plan_tier: (rx as any).plan_tier || 'Standard',
        message_limit: (rx as any).message_limit || 1000
      });
    } else {
      setEditingRx(null);
      setRxForm({
        pharmacy_id: `pharm-${Math.floor(100 + Math.random() * 900)}`,
        pharmacy_name: '',
        address: '',
        phone_number: '',
        color_theme: 'teal',
        status: 'Active',
        plan_tier: 'Standard',
        message_limit: 1000
      });
    }
    setIsRxModalOpen(true);
  };

  // Submit Rx form
  const handleRxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRxError(null);
    setRxSuccess(null);

    const isEdit = !!editingRx;
    const endpoint = isEdit ? `/api/admin/pharmacies/${editingRx.pharmacy_id}` : '/api/admin/pharmacies';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rxForm)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Workspace update failed");
      }

      setRxSuccess(isEdit ? "Pharmacy coordinates saved!" : "New pharmacy workspace deployed!");
      setTimeout(() => {
        setIsRxModalOpen(false);
        fetchAdminStats();
        onRefreshAllData(); // reset lists
      }, 1500);
    } catch (err: any) {
      setRxError(err.message);
    }
  };

  // Delete Pharmacy
  const handleRxDelete = async (pharmacyId: string) => {
    if (!confirm(`Are you absolutely sure you want to delete ${pharmacyId}? This will delete all patient records, medications, and templates belonging to this tenant.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/pharmacies/${pharmacyId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAdminStats();
        onRefreshAllData();
      } else {
        const err = await res.json();
        alert(err.error || "Purging pharmacy failed");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Change user role
  const handleRoleUpdate = async (email: string, role: string) => {
    try {
      const res = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      });
      if (res.ok) {
        fetchAdminStats();
      } else {
        const err = await res.json();
        alert(err.error || "User role elevation failed");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingUserEmail(null);
    }
  };

  const isAdmin = currentUser?.email?.toLowerCase() === 'viannejonny@gmail.com' || currentUser?.role === 'Admin';

  return (
    <div className="space-y-6">
      
      {/* 1. ADMIN ROLE HEADER BAR */}
      <div className="bg-slate-900 border-2 border-slate-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex transform translate-x-12 translate-y-2 select-none pointer-events-none">
          <Shield className="w-64 h-64 text-teal-300" />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-teal-500 text-slate-950">
                <Shield className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-teal-300">SYSTEM ADMINISTRATIVE DECK</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Super-Admin Tenant Control Panel</h2>
            <p className="text-xs text-slate-350 max-w-xl text-slate-300">
              Configure cross-tenant settings, register new clinical pharmacy branches, manage pharmacist access lists, and view platform metrics globally.
            </p>
          </div>

          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 shrink-0 space-y-3 bg-slate-800">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isAdmin ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <p className="text-xs font-bold font-sans">
                Logged In: <span className="text-teal-300 font-mono">{currentUser?.email || "No session"}</span>
              </p>
            </div>
            
            {isAdmin ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-lg p-2 text-center flex items-center gap-2 justify-center">
                <CheckCircle className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-wider">viannejonny@gmail.com Recognized</span>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] text-slate-300 leading-snug">
                  Viewing in standard pharmacist role. Switch identity to test admin views.
                </p>
                <button
                  onClick={assumeVianneIdentity}
                  className="w-full bg-teal-600 hover:bg-teal-500 transition text-slate-950 py-1.5 px-3 rounded-lg text-xs font-black tracking-wide flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  Assume Admin (viannejonny@gmail.com)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl py-24 text-center border border-gray-100 flex flex-col items-center justify-center gap-4 shadow-3xs">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs text-gray-500 font-medium font-sans">Compiling global SaaS records...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl text-xs flex items-center gap-3 font-medium">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <p className="font-bold text-sm">Administration API Error</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* 2. PLATFORM ANALYTICS GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs hover:border-teal-500/20 transition-all">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-400 font-sans uppercase">Global Workspaces</span>
                <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                  <Building2 className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-black text-gray-900 tracking-tight">{stats?.totalPharmacies || 0}</p>
              <p className="text-[10px] text-gray-400 mt-1 font-sans">Active Multitenant Branches</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs hover:border-indigo-500/20 transition-all">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-400 font-sans uppercase">Global Patients</span>
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-black text-indigo-950 tracking-tight">{stats?.totalPatients || 0}</p>
              <div className="flex items-center gap-2 mt-1 text-[10px] font-sans">
                <span className="text-emerald-600 font-bold">{stats?.activePatients || 0} Active</span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-400">{stats?.inactivePatients || 0} Inactive</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs hover:border-blue-500/20 transition-all">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-400 font-sans uppercase">Reminders Sent</span>
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <MessageSquare className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-black text-gray-900 tracking-tight">{stats?.totalReminders || 0}</p>
              <p className="text-[10px] text-gray-400 mt-1 font-sans">Total SMS & WhatsApp Alerts</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs hover:border-amber-500/20 transition-all">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-400 font-sans uppercase">SaaS Satisfaction</span>
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-500">
                  <CheckCircle className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-black text-gray-900 tracking-tight">{stats?.averageRating || "5.0"}/5</p>
              <p className="text-[10px] text-gray-400 mt-1 font-sans">From {stats?.totalFeedback || 0} Patient reviews</p>
            </div>

          </div>

          {/* 3. MULTI-TENANT WORKSPACE MANAGEMENT PANEL */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-3xs overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-gray-950 flex items-center gap-1.5 font-sans">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  Pharmacy Branch Directories ({stats?.pharmacies?.length || 0})
                </h3>
                <p className="text-xs text-gray-405 text-gray-400 mt-0.5 font-sans">
                  These represent physical pharmacies utilizing the outreach SaaS program.
                </p>
              </div>

              <button
                onClick={() => handleOpenRxModal(null)}
                className="bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition shadow-sm shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Deploy New Branch
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-705 border-collapse">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-bold">IDs</th>
                    <th className="p-4 font-bold">Pharmacy Name</th>
                    <th className="p-4 font-bold">Location</th>
                    <th className="p-4 font-bold">Coordinates Phone</th>
                    <th className="p-4 font-bold text-center">Theme</th>
                    <th className="p-4 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats?.pharmacies && stats.pharmacies.length > 0 ? (
                    stats.pharmacies.map((rx: Pharmacy) => (
                      <tr key={rx.pharmacy_id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 font-mono font-bold text-slate-500">{rx.pharmacy_id}</td>
                        <td className="p-4">
                          <p className="font-extrabold text-gray-950">{rx.pharmacy_name}</p>
                          <p className="text-[10px] text-gray-400">Created: {rx.created_at ? new Date(rx.created_at).toLocaleDateString() : 'Seeded Default'}</p>
                        </td>
                        <td className="p-4 text-gray-600 font-sans">{rx.address}</td>
                        <td className="p-4 text-gray-600 font-mono">{rx.phone_number}</td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black uppercase rounded-sm border ${
                            rx.color_theme === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : rx.color_theme === 'indigo' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                            : 'bg-teal-50 text-teal-700 border-teal-200'
                          }`}>
                            {rx.color_theme}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenRxModal(rx)}
                              className="p-1.5 rounded-lg border border-gray-200 hover:bg-slate-100 text-gray-600 transition cursor-pointer"
                              title="Edit Pharmacy"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRxDelete(rx.pharmacy_id)}
                              disabled={stats.pharmacies.length <= 1}
                              className="p-1.5 rounded-lg border border-rose-100 hover:bg-rose-50 text-rose-600 transition disabled:opacity-30 cursor-pointer"
                              title="Delete Branch"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400 font-medium">No pharmacy branches loaded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. USER & ACCESS PRIVILEGES TABLE */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-3xs overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-950 flex items-center gap-1.5 font-sans">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                Staff Access & Role Management Directory
              </h3>
              <p className="text-xs text-gray-400 mt-0.5 font-sans">
                Elevate or modify roles of registered user credentials to grant administrative clearances programmatically.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse text-slate-650">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-bold">User Metadata</th>
                    <th className="p-4 font-bold">Email Coordinates</th>
                    <th className="p-4 font-bold">Assigned Workspace ID</th>
                    <th className="p-4 font-bold">Current Privilege Level</th>
                    <th className="p-4 text-right font-bold">Elevate privileges</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats?.users && stats.users.length > 0 ? (
                    stats.users.map((u: User, idx: number) => (
                      <tr key={u.email + idx} className="hover:bg-slate-50/50 transition">
                        <td className="p-4">
                          <p className="font-extrabold text-gray-950">{u.full_name || u.email.split('@')[0]}</p>
                          <p className="text-[10px] text-gray-400">Database account ID: {u.user_id || 'Seeded'}</p>
                        </td>
                        <td className="p-4 font-mono font-medium text-slate-600">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                            {u.email}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-550">{u.pharmacy_id || 'pharm-001'}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold rounded-md ${
                            u.role === 'Admin' ? 'bg-rose-50 text-rose-700 border border-rose-150' 
                            : u.role === 'Pharmacist' ? 'bg-indigo-50 text-indigo-700 border border-indigo-150'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {u.role === 'Admin' && <Shield className="w-2.5 h-2.5 shrink-0" />}
                            {u.role || 'Staff'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {updatingUserEmail === u.email ? (
                            <div className="flex items-center justify-end gap-1">
                              <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="bg-white border rounded-lg p-1 text-[11px] font-sans focus:outline-none"
                              >
                                <option value="Staff">Staff</option>
                                <option value="Pharmacist">Pharmacist</option>
                                <option value="Admin">Admin</option>
                              </select>
                              <button
                                onClick={() => handleRoleUpdate(u.email, selectedRole)}
                                className="bg-emerald-600 text-white font-bold p-1 rounded-md text-[10px] cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setUpdatingUserEmail(null)}
                                className="bg-gray-200 text-gray-700 p-1 rounded-md text-[10px] cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setUpdatingUserEmail(u.email);
                                setSelectedRole(u.role || 'Staff');
                              }}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition py-1 px-2 hover:bg-indigo-50/50 rounded-lg cursor-pointer"
                            >
                              Elevate Role
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400 font-medium">No local user directories loaded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      )}

      {/* ========================================== */}
      {/* 5. COMFORTABLE MODAL - REGISTER / EDIT PHARMACY */}
      {/* ========================================== */}
      {isRxModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center">
              <div>
                <h4 className="text-sm font-extrabold font-sans flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-teal-400" />
                  {editingRx ? "Configure Workspace Coordinates" : "Provision Multi-Tenant Branch"}
                </h4>
                <p className="text-[10px] text-slate-300 font-sans mt-0.5">SaaS Infrastructure Coordinator</p>
              </div>
              <button
                onClick={() => setIsRxModalOpen(false)}
                className="text-white/70 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRxSubmit} className="p-6 space-y-4 font-sans text-xs">
              
              {rxError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  {rxError}
                </div>
              )}

              {rxSuccess && (
                <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-3 rounded-xl flex items-center gap-1.5 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  {rxSuccess}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-gray-700 block uppercase tracking-wider text-[9px]">Pharmacy tenant ID</label>
                <input
                  type="text"
                  required
                  disabled={!!editingRx}
                  value={rxForm.pharmacy_id}
                  onChange={(e) => setRxForm({ ...rxForm, pharmacy_id: e.target.value })}
                  placeholder="pharm-xxx"
                  className="w-full text-slate-900 border border-gray-250 p-2 text-xs rounded-xl focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 block uppercase tracking-wider text-[9px]">SaaS Corporate Name</label>
                <input
                  type="text"
                  required
                  value={rxForm.pharmacy_name}
                  onChange={(e) => setRxForm({ ...rxForm, pharmacy_name: e.target.value })}
                  placeholder="e.g. Kampala Central Chemists"
                  className="w-full text-slate-900 border border-gray-250 p-2 text-xs rounded-xl focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 block uppercase tracking-wider text-[9px]">Physical Location / Address</label>
                <input
                  type="text"
                  required
                  value={rxForm.address}
                  onChange={(e) => setRxForm({ ...rxForm, address: e.target.value })}
                  placeholder="e.g. Plot 24 Jinja Highway"
                  className="w-full text-slate-900 border border-gray-250 p-2 text-xs rounded-xl focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 block uppercase tracking-wider text-[9px]">SaaS SMS Alert Dispatch Number</label>
                <input
                  type="text"
                  required
                  value={rxForm.phone_number}
                  onChange={(e) => setRxForm({ ...rxForm, phone_number: e.target.value })}
                  placeholder="e.g. +256 701 999888"
                  className="w-full text-slate-900 border border-gray-250 p-2 text-xs rounded-xl focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 block uppercase tracking-wider text-[9px]">Enterprise Brand Color Theme</label>
                <select
                  value={rxForm.color_theme}
                  onChange={(e) => setRxForm({ ...rxForm, color_theme: e.target.value })}
                  className="w-full text-slate-900 border border-gray-250 p-2 text-xs rounded-xl focus:ring-1 focus:ring-slate-900 focus:outline-none"
                >
                  <option value="teal">Community Teal (Default)</option>
                  <option value="emerald">Surgical Emerald</option>
                  <option value="indigo">Clinical Indigo</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 block uppercase tracking-wider text-[9px]">SaaS Tenant status</label>
                <select
                  value={rxForm.status}
                  onChange={(e) => setRxForm({ ...rxForm, status: e.target.value })}
                  className="w-full text-slate-900 border border-gray-250 p-2 text-xs rounded-xl focus:ring-1 focus:ring-slate-900 focus:outline-none"
                >
                  <option value="Active">Active / On-Board</option>
                  <option value="Suspended">Suspended / Decommissioned</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block uppercase tracking-wider text-[9px]">SaaS subscription Tier</label>
                  <select
                    value={rxForm.plan_tier}
                    onChange={(e) => setRxForm({ ...rxForm, plan_tier: e.target.value })}
                    className="w-full text-slate-900 border border-gray-250 p-2 text-xs rounded-xl focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  >
                    <option value="Standard">Standard ($19/mo)</option>
                    <option value="Professional">Professional ($49/mo)</option>
                    <option value="Enterprise">Enterprise ($149/mo)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block uppercase tracking-wider text-[9px]">Monthly Messages limit</label>
                  <input
                    type="number"
                    value={rxForm.message_limit}
                    onChange={(e) => setRxForm({ ...rxForm, message_limit: parseInt(e.target.value) || 1000 })}
                    className="w-full text-slate-900 border border-gray-250 p-2 text-xs rounded-xl focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsRxModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-750 font-bold py-2 px-4 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-slate-850 text-white font-black py-2 px-4 rounded-xl cursor-pointer"
                >
                  {editingRx ? "Save Branch details" : "Deploy SaaS Branch"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
