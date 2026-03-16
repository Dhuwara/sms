import { useEffect, useState } from 'react';
import { Plus, Trash2, Award, ChevronDown, Trophy, Medal } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/utils/api';
import ConfirmDialog from '@/components/ConfirmDialog';

const SCHOLARSHIP_TYPES = ['full', 'partial', 'merit', 'need-based'];
const STATUSES = ['pending', 'approved', 'rejected', 'disbursed'];
const AWARD_CATEGORIES = ['academic', 'sports', 'arts', 'science', 'leadership', 'community', 'other'];

const STATUS_COLORS = {
  pending:  'bg-[#FEF3C7] text-[#92400E]',
  approved: 'bg-[#D1FAE5] text-[#065F46]',
  rejected: 'bg-[#FEE2E2] text-[#991B1B]',
  disbursed:'bg-[#DBEAFE] text-[#1E40AF]',
};

const CATEGORY_COLORS = {
  academic:   'bg-[#DBEAFE] text-[#1E40AF]',
  sports:     'bg-[#D1FAE5] text-[#065F46]',
  arts:       'bg-[#EDE9FE] text-[#5B21B6]',
  science:    'bg-[#FEF3C7] text-[#92400E]',
  leadership: 'bg-[#FEE2E2] text-[#991B1B]',
  community:  'bg-[#CFFAFE] text-[#155E75]',
  other:      'bg-[#F1F5F9] text-[#475569]',
};

const EMPTY_SCHOLARSHIP_FORM = {
  name: '', description: '', amount: '', type: 'partial',
  criteria: '', academicYear: new Date().getFullYear().toString(),
  studentId: '', remarks: '',
};

const EMPTY_AWARD_FORM = {
  title: '', description: '', category: 'academic',
  awardDate: '', academicYear: new Date().getFullYear().toString(),
  studentId: '', position: '', eventName: '', remarks: '',
};

const Scholarships = () => {
  const [activeTab, setActiveTab] = useState('scholarships');
  const [students, setStudents] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  // Scholarship State
  const [scholarships, setScholarships] = useState([]);
  const [schLoading, setSchLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [showSchModal, setShowSchModal] = useState(false);
  const [schForm, setSchForm] = useState(EMPTY_SCHOLARSHIP_FORM);
  const [schSubmitting, setSchSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // Award State
  const [awards, setAwards] = useState([]);
  const [awardLoading, setAwardLoading] = useState(true);
  const [awardFilterCategory, setAwardFilterCategory] = useState('');
  const [awardFilterYear, setAwardFilterYear] = useState('');
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [awardForm, setAwardForm] = useState(EMPTY_AWARD_FORM);
  const [awardSubmitting, setAwardSubmitting] = useState(false);

  const fetchScholarships = async () => {
    setSchLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (filterYear) params.set('academicYear', filterYear);
      const res = await api.get(`/api/scholarships?${params}`);
      setScholarships(res.data || []);
    } catch {
      toast.error('Failed to load scholarships');
    } finally {
      setSchLoading(false);
    }
  };

  const fetchAwards = async () => {
    setAwardLoading(true);
    try {
      const params = new URLSearchParams();
      if (awardFilterCategory) params.set('category', awardFilterCategory);
      if (awardFilterYear) params.set('academicYear', awardFilterYear);
      const res = await api.get(`/api/awards?${params}`);
      setAwards(res.data || []);
    } catch {
      toast.error('Failed to load awards');
    } finally {
      setAwardLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
    fetchAwards();
    api.get('/api/students').then(r => setStudents(r.data || [])).catch(() => {});
  }, []);

  // --- Scholarship Handlers ---
  const handleCreateScholarship = async (e) => {
    e.preventDefault();
    setSchSubmitting(true);
    try {
      const res = await api.post('/api/scholarships', { ...schForm, amount: Number(schForm.amount) });
      setScholarships(prev => [res.data, ...prev]);
      toast.success('Scholarship created');
      setShowSchModal(false);
      setSchForm(EMPTY_SCHOLARSHIP_FORM);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create scholarship');
    } finally {
      setSchSubmitting(false);
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

  const handleDeleteScholarship = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Scholarship',
      message: 'Are you sure you want to delete this scholarship record? This action cannot be undone.',
      variant: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await api.delete(`/api/scholarships/${id}`);
          setScholarships(prev => prev.filter(s => s._id !== id));
          toast.success('Deleted');
        } catch {
          toast.error('Failed to delete');
        }
      }
    });
  };

  // --- Award Handlers ---
  const handleCreateAward = async (e) => {
    e.preventDefault();
    setAwardSubmitting(true);
    try {
      const res = await api.post('/api/awards', awardForm);
      setAwards(prev => [res.data, ...prev]);
      toast.success('Award created');
      setShowAwardModal(false);
      setAwardForm(EMPTY_AWARD_FORM);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create award');
    } finally {
      setAwardSubmitting(false);
    }
  };

  const handleDeleteAward = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Award',
      message: 'Are you sure you want to delete this award record? This action cannot be undone.',
      variant: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await api.delete(`/api/awards/${id}`);
          setAwards(prev => prev.filter(a => a._id !== id));
          toast.success('Deleted');
        } catch {
          toast.error('Failed to delete');
        }
      }
    });
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
          <h1 className="text-3xl font-bold text-[#0F172A]">Scholarships & Awards</h1>
          <p className="text-[#64748B] mt-1">Manage student scholarships, prizes and awards</p>
        </div>
        <button
          onClick={() => activeTab === 'scholarships' ? setShowSchModal(true) : setShowAwardModal(true)}
          className="flex items-center gap-2 bg-[#4F46E5] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#4338CA] transition-colors"
        >
          <Plus size={18} /> {activeTab === 'scholarships' ? 'Add Scholarship' : 'Add Award'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F1F5F9] p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('scholarships')}
          className={`px-5 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 ${activeTab === 'scholarships' ? 'bg-white text-[#4F46E5] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}`}
        >
          <Award size={16} /> Scholarships
        </button>
        <button
          onClick={() => setActiveTab('awards')}
          className={`px-5 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 ${activeTab === 'awards' ? 'bg-white text-[#4F46E5] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}`}
        >
          <Trophy size={16} /> Prizes & Awards
        </button>
      </div>

      {/* ===== SCHOLARSHIPS TAB ===== */}
      {activeTab === 'scholarships' && (
        <>
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
            {schLoading ? (
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
                          <button onClick={() => handleDeleteScholarship(s._id)} className="p-1.5 text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors">
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
        </>
      )}

      {/* ===== AWARDS TAB ===== */}
      {activeTab === 'awards' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-[#64748B]">Total Awards</p>
              <p className="text-2xl font-bold text-[#0F172A] mt-1">{awards.length}</p>
            </div>
            {['academic', 'sports', 'arts'].map(cat => (
              <div key={cat} className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-[#64748B] capitalize">{cat}</p>
                <p className="text-2xl font-bold text-[#0F172A] mt-1">{awards.filter(a => a.category === cat).length}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#0F172A] mb-1">Category</label>
              <select value={awardFilterCategory} onChange={e => setAwardFilterCategory(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
                <option value="">All categories</option>
                {AWARD_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#0F172A] mb-1">Academic Year</label>
              <input type="text" value={awardFilterYear} onChange={e => setAwardFilterYear(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" placeholder="e.g. 2025" />
            </div>
            <button onClick={fetchAwards} className="h-10 px-5 bg-[#4F46E5] text-white rounded-lg font-medium hover:bg-[#4338CA] transition-colors">Search</button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <Trophy size={20} className="text-[#F59E0B]" />
              <h2 className="text-lg font-semibold text-[#0F172A]">Award & Prize Records</h2>
            </div>
            {awardLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : awards.length === 0 ? (
              <div className="py-16 text-center text-[#64748B]">No award records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F8FAFC] border-b border-slate-200">
                    <tr>
                      {['Student', 'Class', 'Award Title', 'Category', 'Event', 'Position', 'Date', 'Year', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {awards.map(a => (
                      <tr key={a._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-[#0F172A]">{a.studentId?.userId?.name || '—'}</p>
                          <p className="text-xs text-[#64748B]">{a.studentId?.userId?.email}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#64748B]">{a.classId?.name} {a.classId?.section}</td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-[#0F172A]">{a.title}</p>
                          {a.description && <p className="text-xs text-[#64748B]">{a.description}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${CATEGORY_COLORS[a.category] || ''}`}>
                            {a.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#64748B]">{a.eventName || '—'}</td>
                        <td className="px-4 py-3">
                          {a.position ? (
                            <span className="flex items-center gap-1 text-sm font-semibold text-[#F59E0B]">
                              <Medal size={14} /> {a.position}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#64748B]">{formatDate(a.awardDate)}</td>
                        <td className="px-4 py-3 text-sm text-[#64748B]">{a.academicYear}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDeleteAward(a._id)} className="p-1.5 text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors">
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
        </>
      )}

      {/* Scholarship Create Modal */}
      {showSchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#0F172A] mb-4">Add Scholarship</h2>
            <form onSubmit={handleCreateScholarship} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Scholarship Name</label>
                <input type="text" required value={schForm.name} onChange={e => setSchForm({ ...schForm, name: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" placeholder="e.g. Merit Excellence Award" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Student</label>
                <select required value={schForm.studentId} onChange={e => setSchForm({ ...schForm, studentId: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
                  <option value="">Select student</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.class})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">Amount (₹)</label>
                  <input type="number" required min="1" value={schForm.amount} onChange={e => setSchForm({ ...schForm, amount: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" placeholder="5000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">Type</label>
                  <select value={schForm.type} onChange={e => setSchForm({ ...schForm, type: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
                    {SCHOLARSHIP_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">Academic Year</label>
                  <input type="text" required value={schForm.academicYear} onChange={e => setSchForm({ ...schForm, academicYear: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" placeholder="2025" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">Criteria (optional)</label>
                  <input type="text" value={schForm.criteria} onChange={e => setSchForm({ ...schForm, criteria: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" placeholder="e.g. 90%+ marks" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Description (optional)</label>
                <textarea rows={2} value={schForm.description} onChange={e => setSchForm({ ...schForm, description: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Remarks (optional)</label>
                <textarea rows={2} value={schForm.remarks} onChange={e => setSchForm({ ...schForm, remarks: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowSchModal(false); setSchForm(EMPTY_SCHOLARSHIP_FORM); }} className="flex-1 h-10 border border-slate-200 rounded-lg font-medium">Cancel</button>
                <button type="submit" disabled={schSubmitting} className="flex-1 h-10 bg-[#4F46E5] text-white rounded-lg font-medium disabled:opacity-50">{schSubmitting ? 'Saving...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Award Create Modal */}
      {showAwardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#0F172A] mb-4">Add Prize / Award</h2>
            <form onSubmit={handleCreateAward} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Award Title</label>
                <input type="text" required value={awardForm.title} onChange={e => setAwardForm({ ...awardForm, title: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" placeholder="e.g. Best Science Project" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Student</label>
                <select required value={awardForm.studentId} onChange={e => setAwardForm({ ...awardForm, studentId: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
                  <option value="">Select student</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.class})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">Category</label>
                  <select value={awardForm.category} onChange={e => setAwardForm({ ...awardForm, category: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
                    {AWARD_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">Position / Prize</label>
                  <input type="text" value={awardForm.position} onChange={e => setAwardForm({ ...awardForm, position: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" placeholder="e.g. 1st Place, Gold Medal" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">Award Date</label>
                  <input type="date" required value={awardForm.awardDate} onChange={e => setAwardForm({ ...awardForm, awardDate: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">Academic Year</label>
                  <input type="text" required value={awardForm.academicYear} onChange={e => setAwardForm({ ...awardForm, academicYear: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" placeholder="2025" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Event Name (optional)</label>
                <input type="text" value={awardForm.eventName} onChange={e => setAwardForm({ ...awardForm, eventName: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" placeholder="e.g. Inter-School Science Fair 2025" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Description (optional)</label>
                <textarea rows={2} value={awardForm.description} onChange={e => setAwardForm({ ...awardForm, description: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Remarks (optional)</label>
                <textarea rows={2} value={awardForm.remarks} onChange={e => setAwardForm({ ...awardForm, remarks: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAwardModal(false); setAwardForm(EMPTY_AWARD_FORM); }} className="flex-1 h-10 border border-slate-200 rounded-lg font-medium">Cancel</button>
                <button type="submit" disabled={awardSubmitting} className="flex-1 h-10 bg-[#4F46E5] text-white rounded-lg font-medium disabled:opacity-50">{awardSubmitting ? 'Saving...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default Scholarships;
