import { useEffect, useState } from 'react';
import { Plus, Trash2, RefreshCw, UserCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/utils/api';
import ConfirmDialog from '@/components/ConfirmDialog';

const Substitutions = () => {
  const [substitutions, setSubstitutions] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [classList, setClassList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  // Cascading form state
  const [formDate, setFormDate] = useState('');
  const [formClassId, setFormClassId] = useState('');
  const [formPeriods, setFormPeriods] = useState([]);
  const [formSelectedPeriod, setFormSelectedPeriod] = useState(null);
  const [formSubstituteTeacherId, setFormSubstituteTeacherId] = useState('');
  const [formReason, setFormReason] = useState('');
  const [periodsLoading, setPeriodsLoading] = useState(false);

  const fetchSubstitutions = async (date = filterDate) => {
    setLoading(true);
    try {
      const params = date ? `?date=${date}` : '';
      const res = await api.get(`/api/substitutions${params}`);
      setSubstitutions(res.data || []);
    } catch {
      toast.error('Failed to load substitutions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubstitutions();
    api.get('/api/teachers').then(r => setStaffList(r.data || [])).catch(() => {});
    api.get('/api/classes').then(r => setClassList(r.data || [])).catch(() => {});
  }, []);

  const resetForm = () => {
    setFormDate('');
    setFormClassId('');
    setFormPeriods([]);
    setFormSelectedPeriod(null);
    setFormSubstituteTeacherId('');
    setFormReason('');
  };

  // When class changes, fetch periods for the selected date + class
  const handleClassChange = async (classId) => {
    setFormClassId(classId);
    setFormPeriods([]);
    setFormSelectedPeriod(null);
    setFormSubstituteTeacherId('');
    if (!classId || !formDate) return;

    setPeriodsLoading(true);
    try {
      const res = await api.get(`/api/substitutions/periods-by-class?classId=${classId}&date=${formDate}`);
      setFormPeriods(res.data || []);
    } catch {
      toast.error('Failed to load periods');
    } finally {
      setPeriodsLoading(false);
    }
  };

  // When date changes, reset downstream
  const handleDateChange = (date) => {
    setFormDate(date);
    setFormClassId('');
    setFormPeriods([]);
    setFormSelectedPeriod(null);
    setFormSubstituteTeacherId('');
  };

  // When period is selected, auto-fill teacher info
  const handlePeriodChange = (periodIdx) => {
    const period = formPeriods.find(p => p.index === Number(periodIdx));
    setFormSelectedPeriod(period || null);
    setFormSubstituteTeacherId('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formDate || !formClassId || !formSelectedPeriod || !formSubstituteTeacherId) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/api/substitutions', {
        date: formDate,
        classId: formClassId,
        periodIndex: formSelectedPeriod.index,
        periodName: formSelectedPeriod.name,
        originalTeacherId: formSelectedPeriod.teacher?._id,
        substituteTeacherId: formSubstituteTeacherId,
        subject: formSelectedPeriod.subject || '',
        reason: formReason,
      });
      setSubstitutions(prev => [res.data, ...prev]);
      toast.success('Substitution created — teacher will be notified');
      setShowModal(false);
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create substitution');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Substitution',
      message: 'Are you sure you want to delete this substitution?',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await api.delete(`/api/substitutions/${id}`);
          setSubstitutions(prev => prev.filter(s => s._id !== id));
          toast.success('Deleted');
        } catch {
          toast.error('Failed to delete');
        }
      },
    });
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const staffName = (staffObj) => staffObj?.userId?.name || staffObj?.employeeId || '—';

  const statusColors = {
    pending: 'bg-[#FEF3C7] text-[#92400E]',
    accepted: 'bg-[#D1FAE5] text-[#065F46]',
    rejected: 'bg-[#FEE2E2] text-[#991B1B]',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A]">Substitution Management</h1>
          <p className="text-[#64748B] mt-1">Manage teacher substitutions for absent staff</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 bg-[#4F46E5] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#4338CA] transition-colors"
        >
          <Plus size={18} /> Add Substitution
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-[#0F172A] mb-1">Filter by Date</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchSubstitutions(filterDate)}
            className="h-10 px-4 bg-[#4F46E5] text-white rounded-lg font-medium hover:bg-[#4338CA] transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} /> Search
          </button>
          {filterDate && (
            <button
              onClick={() => { setFilterDate(''); fetchSubstitutions(''); }}
              className="h-10 px-4 border border-slate-200 rounded-lg font-medium text-[#64748B] hover:bg-slate-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-[#64748B]">Total Records</p>
          <p className="text-2xl font-bold text-[#0F172A] mt-1">{substitutions.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-[#64748B]">Accepted</p>
          <p className="text-2xl font-bold text-[#10B981] mt-1">{substitutions.filter(s => s.status === 'accepted').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-[#64748B]">Pending</p>
          <p className="text-2xl font-bold text-[#F59E0B] mt-1">{substitutions.filter(s => s.status === 'pending').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-[#64748B]">Rejected</p>
          <p className="text-2xl font-bold text-[#EF4444] mt-1">{substitutions.filter(s => s.status === 'rejected').length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <UserCheck size={20} className="text-[#4F46E5]" />
          <h2 className="text-lg font-semibold text-[#0F172A]">Substitution Records</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : substitutions.length === 0 ? (
          <div className="py-16 text-center text-[#64748B]">No substitution records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8FAFC] border-b border-slate-200">
                <tr>
                  {['Date', 'Period', 'Class', 'Original Teacher', 'Substitute', 'Subject', 'Status', 'Response', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {substitutions.map(s => (
                  <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-[#0F172A]">{formatDate(s.date)}</td>
                    <td className="px-4 py-3 text-sm text-[#64748B]">{s.periodName || `Period ${s.periodIndex + 1}`}</td>
                    <td className="px-4 py-3 text-sm text-[#64748B]">{s.classId?.name} {s.classId?.section}</td>
                    <td className="px-4 py-3 text-sm text-[#64748B]">{staffName(s.originalTeacherId)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#4F46E5]">{staffName(s.substituteTeacherId)}</td>
                    <td className="px-4 py-3 text-sm text-[#64748B]">{s.subject || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[s.status] || statusColors.pending}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#64748B] max-w-[160px] truncate">
                      {s.responseReason || (s.reason ? `Reason: ${s.reason}` : '—')}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(s._id)} className="p-1.5 text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal — Cascading: Date → Class → Period (auto teacher) → Substitute Teacher */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#0F172A]">Add Substitution</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              {/* Step 1: Date */}
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">1. Select Date *</label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={e => handleDateChange(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
                {formDate && (
                  <p className="text-xs text-[#64748B] mt-1">
                    Day: {new Date(formDate).toLocaleDateString('en-US', { weekday: 'long' })}
                  </p>
                )}
              </div>

              {/* Step 2: Class */}
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">2. Select Class *</label>
                <select
                  required
                  disabled={!formDate}
                  value={formClassId}
                  onChange={e => handleClassChange(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] disabled:opacity-50"
                >
                  <option value="">Select class</option>
                  {classList.map(c => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
                </select>
              </div>

              {/* Step 3: Period */}
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">3. Select Period *</label>
                {periodsLoading ? (
                  <div className="flex items-center gap-2 h-10 px-3 text-sm text-[#64748B]">
                    <div className="w-4 h-4 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
                    Loading periods...
                  </div>
                ) : (
                  <select
                    required
                    disabled={!formClassId || formPeriods.length === 0}
                    value={formSelectedPeriod?.index ?? ''}
                    onChange={e => handlePeriodChange(e.target.value)}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] disabled:opacity-50"
                  >
                    <option value="">{formClassId && formPeriods.length === 0 ? 'No periods configured for this day' : 'Select period'}</option>
                    {formPeriods.map(p => (
                      <option key={p.index} value={p.index}>
                        {p.name} ({p.startTime} - {p.endTime}){p.subject ? ` — ${p.subject}` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Auto-filled: Original Teacher */}
              {formSelectedPeriod && (
                <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-[#64748B] uppercase mb-1">Assigned Teacher for this Period</p>
                  <p className="text-sm font-semibold text-[#0F172A]">
                    {formSelectedPeriod.teacher?.name || 'No teacher assigned'}
                  </p>
                  {formSelectedPeriod.subject && (
                    <p className="text-xs text-[#64748B]">Subject: {formSelectedPeriod.subject}</p>
                  )}
                </div>
              )}

              {/* Step 4: Substitute Teacher */}
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">4. Select Substitute Teacher *</label>
                <select
                  required
                  disabled={!formSelectedPeriod}
                  value={formSubstituteTeacherId}
                  onChange={e => setFormSubstituteTeacherId(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] disabled:opacity-50"
                >
                  <option value="">Select substitute teacher</option>
                  {staffList
                    .filter(s => s._id !== formSelectedPeriod?.teacher?._id)
                    .map(s => <option key={s._id} value={s._id}>{s.name || s.userId?.name}</option>)
                  }
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Reason for Substitution (optional)</label>
                <textarea
                  rows={2}
                  value={formReason}
                  onChange={e => setFormReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  placeholder="e.g. Teacher on leave, medical emergency..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 h-10 border border-slate-200 rounded-lg font-medium">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 h-10 bg-[#4F46E5] text-white rounded-lg font-medium disabled:opacity-50">
                  {submitting ? 'Creating...' : 'Create Substitution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default Substitutions;
