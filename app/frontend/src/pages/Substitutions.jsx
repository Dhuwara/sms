import { useEffect, useState } from 'react';
import { Plus, Trash2, RefreshCw, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';

const EMPTY_FORM = {
  originalTeacherId: '',
  substituteTeacherId: '',
  classId: '',
  date: '',
  periodIndex: '',
  subject: '',
  reason: '',
};

const Substitutions = () => {
  const [substitutions, setSubstitutions] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [classList, setClassList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

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

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/api/substitutions', {
        ...form,
        periodIndex: Number(form.periodIndex),
      });
      setSubstitutions(prev => [res.data, ...prev]);
      toast.success('Substitution created');
      setShowModal(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create substitution');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this substitution?')) return;
    try {
      await api.delete(`/api/substitutions/${id}`);
      setSubstitutions(prev => prev.filter(s => s._id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const staffName = (staffObj) => staffObj?.userId?.name || staffObj?.employeeId || '—';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A]">Substitution Management</h1>
          <p className="text-[#64748B] mt-1">Manage teacher substitutions for absent staff</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-[#64748B]">Total Records</p>
          <p className="text-2xl font-bold text-[#0F172A] mt-1">{substitutions.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-[#64748B]">Confirmed</p>
          <p className="text-2xl font-bold text-[#10B981] mt-1">{substitutions.filter(s => s.status === 'confirmed').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-[#64748B]">Pending</p>
          <p className="text-2xl font-bold text-[#F59E0B] mt-1">{substitutions.filter(s => s.status === 'pending').length}</p>
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
                  {['Date', 'Period', 'Class', 'Original Teacher', 'Substitute', 'Subject', 'Reason', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {substitutions.map(s => (
                  <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-[#0F172A]">{formatDate(s.date)}</td>
                    <td className="px-4 py-3 text-sm text-[#64748B]">Period {s.periodIndex + 1}</td>
                    <td className="px-4 py-3 text-sm text-[#64748B]">{s.classId?.name} {s.classId?.section}</td>
                    <td className="px-4 py-3 text-sm text-[#64748B]">{staffName(s.originalTeacherId)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#4F46E5]">{staffName(s.substituteTeacherId)}</td>
                    <td className="px-4 py-3 text-sm text-[#64748B]">{s.subject || '—'}</td>
                    <td className="px-4 py-3 text-sm text-[#64748B] max-w-[140px] truncate">{s.reason || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.status === 'confirmed' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEF3C7] text-[#92400E]'}`}>
                        {s.status}
                      </span>
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

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#0F172A] mb-4">Add Substitution</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">Date</label>
                  <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">Period No.</label>
                  <input type="number" required min="1" max="10" value={form.periodIndex} onChange={e => setForm({ ...form, periodIndex: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" placeholder="e.g. 1" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Class</label>
                <select required value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
                  <option value="">Select class</option>
                  {classList.map(c => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Absent Teacher</label>
                <select required value={form.originalTeacherId} onChange={e => setForm({ ...form, originalTeacherId: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
                  <option value="">Select teacher</option>
                  {staffList.map(s => <option key={s._id} value={s._id}>{s.name || s.userId?.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Substitute Teacher</label>
                <select required value={form.substituteTeacherId} onChange={e => setForm({ ...form, substituteTeacherId: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
                  <option value="">Select teacher</option>
                  {staffList.filter(s => s._id !== form.originalTeacherId).map(s => <option key={s._id} value={s._id}>{s.name || s.userId?.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Subject (optional)</label>
                <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" placeholder="e.g. Mathematics" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Reason (optional)</label>
                <textarea rows={2} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" placeholder="Reason for absence..." />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }} className="flex-1 h-10 border border-slate-200 rounded-lg font-medium">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 h-10 bg-[#4F46E5] text-white rounded-lg font-medium disabled:opacity-50">{submitting ? 'Saving...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Substitutions;
