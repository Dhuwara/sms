import React, { useEffect, useState } from 'react';
import { DollarSign, Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/utils/api';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const EMPTY_FORM = {
  staffId: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  earnings: { basicSalary: 0, hra: 0, transportAllowance: 0, medicalAllowance: 0, otherAllowances: 0 },
  deductions: { providentFund: 0, professionalTax: 0, tds: 0, otherDeductions: 0 },
  status: 'pending',
};

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  useEffect(() => {
    fetchPayrolls();
    fetchStaff();
  }, []);

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterMonth) params.month = filterMonth;
      if (filterYear) params.year = filterYear;
      const res = await api.get('/api/payroll', { params });
      setPayrolls(res.data || []);
    } catch {
      toast.error('Failed to load payrolls');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await api.get('/api/staff');
      setStaffList(res.data || []);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [filterMonth, filterYear]);

  const openCreate = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingId(p._id);
    setFormData({
      staffId: p.staffId?._id || p.staffId,
      month: p.month,
      year: p.year,
      earnings: { ...EMPTY_FORM.earnings, ...p.earnings },
      deductions: { ...EMPTY_FORM.deductions, ...p.deductions },
      status: p.status,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.staffId) { toast.error('Select a staff member'); return; }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/api/payroll/${editingId}`, formData);
        toast.success('Payroll updated');
      } else {
        await api.post('/api/payroll', formData);
        toast.success('Payroll created');
      }
      setShowModal(false);
      fetchPayrolls();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save payroll');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this payroll record?')) return;
    try {
      await api.delete(`/api/payroll/${id}`);
      toast.success('Payroll deleted');
      fetchPayrolls();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const calcGross = (e) => (e.basicSalary || 0) + (e.hra || 0) + (e.transportAllowance || 0) + (e.medicalAllowance || 0) + (e.otherAllowances || 0);
  const calcDed = (d) => (d.providentFund || 0) + (d.professionalTax || 0) + (d.tds || 0) + (d.otherDeductions || 0);

  const updateEarning = (key, val) => setFormData({ ...formData, earnings: { ...formData.earnings, [key]: Number(val) || 0 } });
  const updateDeduction = (key, val) => setFormData({ ...formData, deductions: { ...formData.deductions, [key]: Number(val) || 0 } });

  const gross = calcGross(formData.earnings);
  const ded = calcDed(formData.deductions);
  const net = gross - ded;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#0F172A]">Payroll Management</h1>
          <p className="text-[#64748B] mt-1">Manage staff salary and payments</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-[#F59E0B] text-white hover:bg-[#D97706] px-5 py-2.5 rounded-lg font-semibold transition-colors">
          <Plus size={18} />
          Add Payroll
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-4 shadow-sm flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-[#0F172A]">Month:</label>
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="h-9 px-3 border-2 border-[#FCD34D] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]">
            <option value="">All</option>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-[#0F172A]">Year:</label>
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="h-9 px-3 border-2 border-[#FCD34D] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]">
            <option value="">All</option>
            {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Staff</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Month/Year</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-[#0F172A] uppercase">Gross</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-[#0F172A] uppercase">Deductions</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-[#0F172A] uppercase">Net Salary</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-[#0F172A] uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-[#0F172A] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-[#64748B]">Loading...</td></tr>
              ) : payrolls.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-[#64748B]">No payroll records found</td></tr>
              ) : payrolls.map((p) => (
                <tr key={p._id} className="hover:bg-[#FFFBEB] transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-[#0F172A]">{p.staffId?.userId?.name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{MONTHS[p.month - 1]} {p.year}</td>
                  <td className="px-4 py-3 text-sm text-right text-[#0F172A]">₹{(p.grossSalary || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-[#DC2626]">₹{(p.totalDeductions || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-[#10B981]">₹{(p.netSalary || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.status === 'paid' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEF3C7] text-[#92400E]'}`}>
                      {p.status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-[#FEF3C7] text-[#F59E0B] transition-colors" title="Edit">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg hover:bg-[#FEE2E2] text-[#DC2626] transition-colors" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#0F172A]">{editingId ? 'Edit Payroll' : 'Add Payroll'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>

            <div className="space-y-5">
              {/* Staff, Month, Year */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Staff *</label>
                  <select value={formData.staffId} onChange={(e) => setFormData({ ...formData, staffId: e.target.value })} disabled={!!editingId} className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B] disabled:bg-gray-50">
                    <option value="">Select Staff</option>
                    {staffList.map((s) => <option key={s._id} value={s._id}>{s.userId?.name || s._id}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Month *</label>
                  <select value={formData.month} onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })} className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]">
                    {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Year *</label>
                  <input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })} className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]" />
                </div>
              </div>

              {/* Earnings */}
              <div>
                <h3 className="text-sm font-bold text-[#10B981] uppercase mb-3">Earnings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    ['basicSalary', 'Basic Salary'],
                    ['hra', 'HRA'],
                    ['transportAllowance', 'Transport Allowance'],
                    ['medicalAllowance', 'Medical Allowance'],
                    ['otherAllowances', 'Other Allowances'],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-[#64748B] mb-1">{label}</label>
                      <input type="number" min="0" value={formData.earnings[key]} onChange={(e) => updateEarning(key, e.target.value)} className="w-full h-9 px-3 border-2 border-[#FCD34D] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h3 className="text-sm font-bold text-[#DC2626] uppercase mb-3">Deductions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    ['providentFund', 'Provident Fund'],
                    ['professionalTax', 'Professional Tax'],
                    ['tds', 'TDS'],
                    ['otherDeductions', 'Other Deductions'],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-[#64748B] mb-1">{label}</label>
                      <input type="number" min="0" value={formData.deductions[key]} onChange={(e) => updateDeduction(key, e.target.value)} className="w-full h-9 px-3 border-2 border-[#FCD34D] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2] rounded-lg">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#64748B]">Gross Salary</span>
                  <span className="font-semibold text-[#0F172A]">₹{gross.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#64748B]">Total Deductions</span>
                  <span className="font-semibold text-[#DC2626]">- ₹{ded.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-[#FCD34D]">
                  <span className="font-bold text-[#0F172A]">Net Salary</span>
                  <span className="font-bold text-[#10B981]">₹{net.toLocaleString()}</span>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]">
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 text-[#0F172A] hover:bg-gray-300 h-10 px-4 py-2 rounded-lg font-semibold transition-colors">
                  Cancel
                </button>
                <button type="button" onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-[#F59E0B] text-white hover:bg-[#D97706] h-10 px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50">
                  <Save size={16} />
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
