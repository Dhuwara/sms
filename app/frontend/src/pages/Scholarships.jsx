import { useEffect, useState } from 'react';
import { Plus, Trash2, Award, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';

const SCHOLARSHIP_TYPES = ['full', 'partial', 'merit', 'need-based'];
const STATUSES = ['pending', 'approved', 'rejected', 'disbursed'];

const STATUS_COLORS = {
  pending:  'bg-[#FEF3C7] text-[#92400E]',
  approved: 'bg-[#D1FAE5] text-[#065F46]',
  rejected: 'bg-[#FEE2E2] text-[#991B1B]',
  disbursed:'bg-[#DBEAFE] text-[#1E40AF]',
};

const EMPTY_FORM = {
  name: '', description: '', amount: '', type: 'partial',
  criteria: '', academicYear: new Date().getFullYear().toString(),
  studentId: '', remarks: '',
};

const Scholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (filterYear) params.set('academicYear', filterYear);
      const res = await api.get(`/api/scholarships?${params}`);
      setScholarships(res.data || []);
    } catch {
      toast.error('Failed to load scholarships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
    api.get('/api/students').then(r => setStudents(r.data || [])).catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/api/scholarships', { ...form, amount: Number(form.amount) });
      setScholarships(prev => [res.data, ...prev]);
      toast.success('Scholarship created');
      setShowModal(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create scholarship');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      const res = await api.put(`/api/scholarships/${id}`, { status });
      setScholarships(prev => prev.map(s => s._id === id ? res.data : s));
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this scholarship record?')) return;
    try {
      await api.delete(`/api/scholarships/${id}`);
      setScholarships(prev => prev.filter(s => s._id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const totalDisbursed = scholarships
    .filter(s => s.status === 'disbursed')
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A]">Scholarship Management</h1>
          <p className="text-[#64748B] mt-1">Award and track student scholarships</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#4F46E5] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#4338CA] transition-colors"
        >
          <Plus size={18} /> Add Scholarship
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-[#64748B]">Total</p>
          <p className="text-2xl font-bold text-[#0F172A] mt-1">{scholarships.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-[#64748B]">Approved</p>
          <p className="text-2xl font-bold text-[#10B981] mt-1">{scholarships.filter(s => s.status === 'approved').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-[#64748B]">Disbursed</p>
          <p className="text-2xl font-bold text-[#4F46E5] mt-1">{scholarships.filter(s => s.status === 'disbursed').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-[#64748B]">Total Amount</p>
          <p className="text-2xl font-bold text-[#0F172A] mt-1">₹{totalDisbursed.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-[#0F172A] mb-1">Status</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
            <option value="">All statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-[#0F172A] mb-1">Academic Year</label>
          <input type="text" value={filterYear} onChange={e => setFilterYear(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" placeholder="e.g. 2025" />
        </div>
        <button onClick={fetchScholarships} className="h-10 px-5 bg-[#4F46E5] text-white rounded-lg font-medium hover:bg-[#4338CA] transition-colors">Search</button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Award size={20} className="text-[#4F46E5]" />
          <h2 className="text-lg font-semibold text-[#0F172A]">Scholarship Records</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : scholarships.length === 0 ? (
          <div className="py-16 text-center text-[#64748B]">No scholarship records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8FAFC] border-b border-slate-200">
                <tr>
                  {['Student', 'Class', 'Scholarship', 'Type', 'Amount', 'Year', 'Status', 'Approved On', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scholarships.map(s => (
                  <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-[#0F172A]">{s.studentId?.userId?.name || '—'}</p>
                      <p className="text-xs text-[#64748B]">{s.studentId?.userId?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#64748B]">{s.classId?.name} {s.classId?.section}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-[#0F172A]">{s.name}</p>
                      {s.criteria && <p className="text-xs text-[#64748B]">{s.criteria}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#64748B] capitalize">{s.type}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#0F172A]">₹{s.amount?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm text-[#64748B]">{s.academicYear}</td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <select
                          value={s.status}
                          disabled={updatingId === s._id}
                          onChange={e => handleStatusChange(s._id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer appearance-none pr-5 ${STATUS_COLORS[s.status]}`}
                        >
                          {STATUSES.map(st => <option key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1)}</option>)}
                        </select>
                        <ChevronDown size={10} className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#64748B]">{formatDate(s.approvedOn)}</td>
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
            <h2 className="text-xl font-bold text-[#0F172A] mb-4">Add Scholarship</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Scholarship Name</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" placeholder="e.g. Merit Excellence Award" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Student</label>
                <select required value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
                  <option value="">Select student</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.class})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">Amount (₹)</label>
                  <input type="number" required min="1" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" placeholder="5000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
                    {SCHOLARSHIP_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">Academic Year</label>
                  <input type="text" required value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" placeholder="2025" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">Criteria (optional)</label>
                  <input type="text" value={form.criteria} onChange={e => setForm({ ...form, criteria: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" placeholder="e.g. 90%+ marks" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Description (optional)</label>
                <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Remarks (optional)</label>
                <textarea rows={2} value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
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

export default Scholarships;
