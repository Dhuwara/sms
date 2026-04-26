import { useEffect, useState, useCallback } from 'react';
import {
  LayoutDashboard, School, LogOut, ShieldCheck, Search,
  Pause, Play, Ban, Edit, Eye, X, ChevronDown, RefreshCw,
  Users, GraduationCap, Building2, TrendingUp, AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSuperAdmin, saApi } from '../../context/SuperAdminContext';
import { useNavigate } from 'react-router-dom';

const PLANS = ['free', 'basic', 'premium', 'enterprise'];
const PLAN_COLORS = {
  free: 'bg-[#F1F5F9] text-[#475569]',
  basic: 'bg-[#DBEAFE] text-[#1E40AF]',
  premium: 'bg-[#EDE9FE] text-[#5B21B6]',
  enterprise: 'bg-[#D1FAE5] text-[#065F46]',
};
const STATUS_COLORS = {
  active: 'bg-[#D1FAE5] text-[#065F46]',
  paused: 'bg-[#FEF3C7] text-[#92400E]',
  suspended: 'bg-[#FEE2E2] text-[#991B1B]',
  expired: 'bg-[#F1F5F9] text-[#475569]',
};

const Badge = ({ label, colorClass }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${colorClass}`}>{label}</span>
);

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-[#94A3B8] text-sm">{label}</p>
      <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
    </div>
  </div>
);

// ─── School Detail / Edit Modal ────────────────────────────────────────────────
const SchoolModal = ({ school, onClose, onRefresh }) => {
  const [tab, setTab] = useState('info');
  const [subForm, setSubForm] = useState({
    plan: school.subscription?.plan || 'free',
    billingCycle: school.subscription?.billingCycle || 'monthly',
    startDate: school.subscription?.startDate ? school.subscription.startDate.split('T')[0] : '',
    endDate: school.subscription?.endDate ? school.subscription.endDate.split('T')[0] : '',
    maxStudents: school.subscription?.maxStudents || 500,
    maxStaff: school.subscription?.maxStaff || 50,
  });
  const [actionReason, setActionReason] = useState('');
  const [actionModal, setActionModal] = useState(null); // 'pause' | 'resume' | 'suspend'
  const [saving, setSaving] = useState(false);

  const subStatus = school.subscription?.status || 'active';

  const handleSaveSub = async () => {
    setSaving(true);
    try {
      await saApi.put(`/api/superadmin/schools/${school._id}/subscription`, subForm);
      toast.success('Subscription updated');
      onRefresh();
    } catch {
      toast.error('Failed to update subscription');
    } finally {
      setSaving(false);
    }
  };

  const handleAction = async (action) => {
    setSaving(true);
    try {
      await saApi.post(`/api/superadmin/schools/${school._id}/${action}`, { reason: actionReason });
      toast.success(`School ${action}d successfully`);
      setActionModal(null);
      setActionReason('');
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} school`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1E293B] rounded-2xl border border-[#334155] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#334155]">
          <div>
            <h2 className="text-xl font-bold text-white">{school.name}</h2>
            <p className="text-[#94A3B8] text-sm">{school.city}, {school.state}</p>
          </div>
          <button onClick={onClose} className="text-[#475569] hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4">
          {['info', 'subscription', 'actions'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg capitalize transition-colors ${tab === t ? 'bg-[#4F46E5] text-white' : 'text-[#94A3B8] hover:text-white hover:bg-[#334155]'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {tab === 'info' && (
            <div className="space-y-3">
              {[
                ['School Name', school.name],
                ['Type', school.schoolType],
                ['City', school.city],
                ['State', school.state],
                ['Phone', school.phone || '—'],
                ['Email', school.email || '—'],
                ['Admin', school.adminUser ? `${school.adminUser.name} (${school.adminUser.email})` : '—'],
                ['Students', school.studentCount ?? '—'],
                ['Staff', school.staffCount ?? '—'],
                ['Registered', school.createdAt ? new Date(school.createdAt).toLocaleDateString('en-IN') : '—'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between py-2 border-b border-[#334155]">
                  <span className="text-[#94A3B8] text-sm">{label}</span>
                  <span className="text-white text-sm font-medium">{val}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 border-b border-[#334155]">
                <span className="text-[#94A3B8] text-sm">Status</span>
                <Badge label={subStatus} colorClass={STATUS_COLORS[subStatus] || STATUS_COLORS.active} />
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#94A3B8] text-sm">Plan</span>
                <Badge label={school.subscription?.plan || 'free'} colorClass={PLAN_COLORS[school.subscription?.plan] || PLAN_COLORS.free} />
              </div>
            </div>
          )}

          {tab === 'subscription' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Plan</label>
                  <select
                    value={subForm.plan}
                    onChange={e => setSubForm({ ...subForm, plan: e.target.value })}
                    className="w-full h-10 px-3 bg-[#0F172A] border border-[#334155] rounded-lg text-white text-sm focus:outline-none focus:border-[#4F46E5]"
                  >
                    {PLANS.map(p => <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Billing Cycle</label>
                  <select
                    value={subForm.billingCycle}
                    onChange={e => setSubForm({ ...subForm, billingCycle: e.target.value })}
                    className="w-full h-10 px-3 bg-[#0F172A] border border-[#334155] rounded-lg text-white text-sm focus:outline-none focus:border-[#4F46E5]"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Start Date</label>
                  <input type="date" value={subForm.startDate} onChange={e => setSubForm({ ...subForm, startDate: e.target.value })}
                    className="w-full h-10 px-3 bg-[#0F172A] border border-[#334155] rounded-lg text-white text-sm focus:outline-none focus:border-[#4F46E5]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">End Date</label>
                  <input type="date" value={subForm.endDate} onChange={e => setSubForm({ ...subForm, endDate: e.target.value })}
                    className="w-full h-10 px-3 bg-[#0F172A] border border-[#334155] rounded-lg text-white text-sm focus:outline-none focus:border-[#4F46E5]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Max Students</label>
                  <input type="number" min="1" value={subForm.maxStudents} onChange={e => setSubForm({ ...subForm, maxStudents: e.target.value })}
                    className="w-full h-10 px-3 bg-[#0F172A] border border-[#334155] rounded-lg text-white text-sm focus:outline-none focus:border-[#4F46E5]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Max Staff</label>
                  <input type="number" min="1" value={subForm.maxStaff} onChange={e => setSubForm({ ...subForm, maxStaff: e.target.value })}
                    className="w-full h-10 px-3 bg-[#0F172A] border border-[#334155] rounded-lg text-white text-sm focus:outline-none focus:border-[#4F46E5]" />
                </div>
              </div>
              <button
                onClick={handleSaveSub}
                disabled={saving}
                className="w-full h-10 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-semibold text-sm disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Subscription'}
              </button>
            </div>
          )}

          {tab === 'actions' && (
            <div className="space-y-3">
              {subStatus !== 'paused' && subStatus !== 'suspended' && (
                <button
                  onClick={() => setActionModal('pause')}
                  className="w-full flex items-center gap-3 p-4 bg-[#FEF3C7]/10 border border-[#F59E0B]/30 rounded-xl text-[#F59E0B] hover:bg-[#FEF3C7]/20 transition-colors"
                >
                  <Pause size={18} />
                  <div className="text-left">
                    <p className="font-semibold text-sm">Pause Subscription</p>
                    <p className="text-xs opacity-70">School users cannot log in while paused</p>
                  </div>
                </button>
              )}
              {subStatus === 'paused' && (
                <button
                  onClick={() => handleAction('resume')}
                  disabled={saving}
                  className="w-full flex items-center gap-3 p-4 bg-[#D1FAE5]/10 border border-[#10B981]/30 rounded-xl text-[#10B981] hover:bg-[#D1FAE5]/20 transition-colors disabled:opacity-50"
                >
                  <Play size={18} />
                  <div className="text-left">
                    <p className="font-semibold text-sm">Resume Subscription</p>
                    <p className="text-xs opacity-70">Restore full access for school users</p>
                  </div>
                </button>
              )}
              {subStatus !== 'suspended' && (
                <button
                  onClick={() => setActionModal('suspend')}
                  className="w-full flex items-center gap-3 p-4 bg-[#FEE2E2]/10 border border-[#EF4444]/30 rounded-xl text-[#EF4444] hover:bg-[#FEE2E2]/20 transition-colors"
                >
                  <Ban size={18} />
                  <div className="text-left">
                    <p className="font-semibold text-sm">Suspend School</p>
                    <p className="text-xs opacity-70">Permanently block access until manually unsuspended</p>
                  </div>
                </button>
              )}
              {subStatus === 'suspended' && (
                <button
                  onClick={() => handleAction('resume')}
                  disabled={saving}
                  className="w-full flex items-center gap-3 p-4 bg-[#D1FAE5]/10 border border-[#10B981]/30 rounded-xl text-[#10B981] hover:bg-[#D1FAE5]/20 transition-colors disabled:opacity-50"
                >
                  <Play size={18} />
                  <div className="text-left">
                    <p className="font-semibold text-sm">Unsuspend School</p>
                    <p className="text-xs opacity-70">Restore access for this school</p>
                  </div>
                </button>
              )}
              {school.subscription?.pauseReason && (
                <div className="p-3 bg-[#334155] rounded-lg text-sm text-[#94A3B8]">
                  <span className="font-semibold text-white">Pause reason: </span>{school.subscription.pauseReason}
                </div>
              )}
              {school.subscription?.suspendReason && (
                <div className="p-3 bg-[#334155] rounded-lg text-sm text-[#94A3B8]">
                  <span className="font-semibold text-white">Suspend reason: </span>{school.subscription.suspendReason}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reason modal for pause / suspend */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-white font-bold capitalize">{actionModal} School</h3>
            <textarea
              rows={3}
              placeholder={`Reason for ${actionModal} (optional)`}
              value={actionReason}
              onChange={e => setActionReason(e.target.value)}
              className="w-full px-3 py-2 bg-[#0F172A] border border-[#334155] rounded-lg text-white text-sm resize-none focus:outline-none focus:border-[#4F46E5]"
            />
            <div className="flex gap-3">
              <button onClick={() => { setActionModal(null); setActionReason(''); }}
                className="flex-1 h-10 border border-[#334155] rounded-lg text-[#94A3B8] text-sm hover:bg-[#334155]">
                Cancel
              </button>
              <button
                onClick={() => handleAction(actionModal)}
                disabled={saving}
                className={`flex-1 h-10 rounded-lg text-white text-sm font-semibold disabled:opacity-50 transition-colors ${actionModal === 'pause' ? 'bg-[#F59E0B] hover:bg-[#D97706]' : 'bg-[#EF4444] hover:bg-[#DC2626]'}`}
              >
                {saving ? 'Processing...' : `Confirm ${actionModal.charAt(0).toUpperCase() + actionModal.slice(1)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Dashboard ────────────────────────────────────────────────────────────
const SuperAdminDashboard = () => {
  const { superAdmin, logout } = useSuperAdmin();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [schools, setSchools] = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await saApi.get('/api/superadmin/stats');
      setStats(res.data.data);
    } catch {
      toast.error('Failed to load stats');
    }
  }, []);

  const fetchSchools = useCallback(async () => {
    setSchoolsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterStatus) params.set('status', filterStatus);
      if (filterPlan) params.set('plan', filterPlan);
      const res = await saApi.get(`/api/superadmin/schools?${params}`);
      setSchools(res.data.data);
    } catch {
      toast.error('Failed to load schools');
    } finally {
      setSchoolsLoading(false);
    }
  }, [search, filterStatus, filterPlan]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { if (activeTab === 'schools') fetchSchools(); }, [activeTab, fetchSchools]);

  const handleLogout = async () => {
    await logout();
    navigate('/superadmin/login');
  };

  const subStatus = (school) => school.subscription?.status || 'active';

  return (
    <div className="min-h-screen bg-[#0F172A] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1E293B] border-r border-[#334155] flex flex-col shrink-0">
        <div className="p-6 border-b border-[#334155]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#4F46E5] rounded-lg flex items-center justify-center">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Super Admin</p>
              <p className="text-[#475569] text-xs">{superAdmin?.name}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { key: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { key: 'schools', icon: School, label: 'Schools' },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === key ? 'bg-[#4F46E5] text-white' : 'text-[#94A3B8] hover:text-white hover:bg-[#334155]'}`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#334155]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-[#94A3B8] hover:text-white hover:bg-[#334155] transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-[#0F172A] border-b border-[#334155] px-8 py-4 flex items-center justify-between">
          <h1 className="text-white font-bold text-lg capitalize">
            {activeTab === 'overview' ? 'Dashboard Overview' : 'School Management'}
          </h1>
          <button
            onClick={() => { fetchStats(); if (activeTab === 'schools') fetchSchools(); }}
            className="flex items-center gap-2 text-[#94A3B8] hover:text-white text-sm transition-colors"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* ── Overview Tab ── */}
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard icon={Building2} label="Total Schools" value={stats?.totalSchools} color="bg-[#4F46E5]" />
                <StatCard icon={TrendingUp} label="Active" value={stats?.activeSchools} color="bg-[#10B981]" />
                <StatCard icon={Pause} label="Paused" value={stats?.pausedSchools} color="bg-[#F59E0B]" />
                <StatCard icon={Ban} label="Suspended" value={stats?.suspendedSchools} color="bg-[#EF4444]" />
                <StatCard icon={GraduationCap} label="Total Students" value={stats?.totalStudents} color="bg-[#8B5CF6]" />
                <StatCard icon={Users} label="Total Staff" value={stats?.totalStaff} color="bg-[#06B6D4]" />
              </div>

              {stats?.planCounts?.length > 0 && (
                <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-6">
                  <h2 className="text-white font-bold mb-4">Schools by Plan</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {PLANS.map(plan => {
                      const count = stats.planCounts.find(p => p._id === plan)?.count || 0;
                      return (
                        <div key={plan} className="bg-[#0F172A] rounded-lg p-4 text-center">
                          <p className="text-2xl font-bold text-white">{count}</p>
                          <Badge label={plan} colorClass={PLAN_COLORS[plan]} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-6">
                <h2 className="text-white font-bold mb-2">Quick Actions</h2>
                <p className="text-[#94A3B8] text-sm mb-4">Go to the Schools tab to manage individual school subscriptions.</p>
                <button
                  onClick={() => setActiveTab('schools')}
                  className="px-5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  View All Schools →
                </button>
              </div>
            </>
          )}

          {/* ── Schools Tab ── */}
          {activeTab === 'schools' && (
            <>
              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                  <input
                    type="text"
                    placeholder="Search schools..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && fetchSchools()}
                    className="w-full h-10 pl-9 pr-4 bg-[#1E293B] border border-[#334155] rounded-lg text-white text-sm placeholder-[#475569] focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="h-10 px-3 bg-[#1E293B] border border-[#334155] rounded-lg text-[#94A3B8] text-sm focus:outline-none focus:border-[#4F46E5]"
                >
                  <option value="">All Statuses</option>
                  {['active', 'paused', 'suspended', 'expired'].map(s => (
                    <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                <select
                  value={filterPlan}
                  onChange={e => setFilterPlan(e.target.value)}
                  className="h-10 px-3 bg-[#1E293B] border border-[#334155] rounded-lg text-[#94A3B8] text-sm focus:outline-none focus:border-[#4F46E5]"
                >
                  <option value="">All Plans</option>
                  {PLANS.map(p => (
                    <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
                <button
                  onClick={fetchSchools}
                  className="h-10 px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Search
                </button>
              </div>

              {/* Table */}
              <div className="bg-[#1E293B] rounded-xl border border-[#334155] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#0F172A] border-b border-[#334155]">
                      <tr>
                        {['School', 'City', 'Plan', 'Status', 'Students', 'Staff', 'Registered', 'Actions'].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#475569] uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#334155]">
                      {schoolsLoading ? (
                        <tr>
                          <td colSpan={8} className="px-5 py-12 text-center">
                            <div className="w-8 h-8 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin mx-auto" />
                          </td>
                        </tr>
                      ) : schools.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-5 py-12 text-center text-[#475569]">No schools found</td>
                        </tr>
                      ) : schools.map(school => (
                        <tr key={school._id} className="hover:bg-[#334155]/30 transition-colors">
                          <td className="px-5 py-4">
                            <p className="text-white font-semibold text-sm">{school.name}</p>
                            <p className="text-[#475569] text-xs">{school.schoolType}</p>
                          </td>
                          <td className="px-5 py-4 text-sm text-[#94A3B8]">{school.city}</td>
                          <td className="px-5 py-4">
                            <Badge label={school.subscription?.plan || 'free'} colorClass={PLAN_COLORS[school.subscription?.plan] || PLAN_COLORS.free} />
                          </td>
                          <td className="px-5 py-4">
                            <Badge label={subStatus(school)} colorClass={STATUS_COLORS[subStatus(school)] || STATUS_COLORS.active} />
                          </td>
                          <td className="px-5 py-4 text-sm text-[#94A3B8]">{school.studentCount}</td>
                          <td className="px-5 py-4 text-sm text-[#94A3B8]">{school.staffCount}</td>
                          <td className="px-5 py-4 text-sm text-[#94A3B8]">
                            {school.createdAt ? new Date(school.createdAt).toLocaleDateString('en-IN') : '—'}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              {subStatus(school) === 'active' && (
                                <button
                                  onClick={() => { setSelectedSchool(school); }}
                                  title="Manage"
                                  className="p-1.5 text-[#F59E0B] hover:bg-[#F59E0B]/10 rounded-lg transition-colors"
                                >
                                  <Pause size={15} />
                                </button>
                              )}
                              {subStatus(school) === 'paused' && (
                                <button
                                  onClick={() => setSelectedSchool(school)}
                                  title="Resume"
                                  className="p-1.5 text-[#10B981] hover:bg-[#10B981]/10 rounded-lg transition-colors"
                                >
                                  <Play size={15} />
                                </button>
                              )}
                              {subStatus(school) === 'suspended' && (
                                <button
                                  onClick={() => setSelectedSchool(school)}
                                  title="Manage"
                                  className="p-1.5 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                                >
                                  <AlertTriangle size={15} />
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedSchool(school)}
                                title="View / Edit"
                                className="p-1.5 text-[#4F46E5] hover:bg-[#4F46E5]/10 rounded-lg transition-colors"
                              >
                                <Eye size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="text-[#475569] text-xs">{schools.length} school{schools.length !== 1 ? 's' : ''} shown</p>
            </>
          )}
        </div>
      </main>

      {selectedSchool && (
        <SchoolModal
          school={selectedSchool}
          onClose={() => setSelectedSchool(null)}
          onRefresh={() => { fetchSchools(); fetchStats(); setSelectedSchool(null); }}
        />
      )}
    </div>
  );
};

export default SuperAdminDashboard;
