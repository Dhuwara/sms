import React, { useEffect, useState } from 'react';
import api from '@/utils/api';
import { Plus, Pencil, Trash2, X, Check, Clock, Search, Download } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClasses } from '@/store/slices/classesSlice';
import ConfirmDialog from '@/components/ConfirmDialog';

const STANDARDS = ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const HIGHER = new Set(['11', '12']);

const getDefaultAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const startYear = month >= 6 ? year : year - 1;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
};

// Roman numeral → Arabic for grades 1–12
const ROMAN = { I:1, II:2, III:3, IV:4, V:5, VI:6, VII:7, VIII:8, IX:9, X:10, XI:11, XII:12 };

// Parse the grade part after "Grade " — handles digits ("12") and Roman ("XII")
const parseGradePart = (part) => {
  const up = part.toUpperCase();
  if (ROMAN[up] !== undefined) return String(ROMAN[up]);
  if (/^\d+$/.test(part)) return part;
  return part;
};

// Normalize any class name to the standard key stored in FeeStructure
// e.g. "Grade 12" → "12", "Grade XII" → "12", "LKG" → "LKG"
const toStandard = (name = '') => {
  const parts = name.trim().split(/\s+/);          // split on whitespace
  if (parts.length >= 2 && parts[0].toLowerCase() === 'grade') {
    return parseGradePart(parts[1]);
  }
  return parts[0];                                 // LKG, UKG, etc.
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const Fees = () => {
  const dispatch = useDispatch();
  const classes = useSelector(s => s.classes.list);
  const classesStatus = useSelector(s => s.classes.status);
  const [activeTab, setActiveTab] = useState('structure');
  const [feeStructures, setFeeStructures] = useState([]);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [structureForm, setStructureForm] = useState({
    standard: '', classId: '', academicYear: getDefaultAcademicYear(), totalFees: '', components: [],
  });
  const [structureLoading, setStructureLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  // Student Fees tab state
  const [sfSelectedClass, setSfSelectedClass] = useState('');
  const [sfFeeStructures, setSfFeeStructures] = useState([]);
  const [sfSelectedStructure, setSfSelectedStructure] = useState('');
  const [sfStudentFees, setSfStudentFees] = useState([]);
  const [sfLoading, setSfLoading] = useState(false);
  const [sfTogglingMap, setSfTogglingMap] = useState({});

  useEffect(() => {
    fetchFeeStructures();
    if (classesStatus === 'idle') dispatch(fetchClasses());
  }, [classesStatus, dispatch]);

  const fetchFeeStructures = async () => {
    try {
      const response = await api.get('/api/fee-structure');
      setFeeStructures(response.data || []);
    } catch {
      toast.error('Failed to load fee structures');
    }
  };

  const openAddStructure = () => {
    setEditingStructure(null);
    setStructureForm({ standard: '', classId: '', academicYear: getDefaultAcademicYear(), totalFees: '', components: [] });
    setShowStructureModal(true);
  };

  const openEditStructure = (s) => {
    setEditingStructure(s);
    setStructureForm({
      standard: s.standard,
      classId: s.classId?._id || s.classId || '',
      academicYear: s.academicYear,
      totalFees: s.totalFees,
      components: s.components.map(c => ({ name: c.name, amount: c.amount, dueDate: c.dueDate ? new Date(c.dueDate).toISOString().split('T')[0] : '', _key: `${c.name}-${c.amount}` })),
    });
    setShowStructureModal(true);
  };

  const handleStructureSubmit = async (e) => {
    e.preventDefault();
    if (!structureForm.standard || !structureForm.academicYear || !structureForm.totalFees) {
      toast.error('Standard, academic year and total fees are required');
      return;
    }
    if (HIGHER.has(structureForm.standard) && !structureForm.classId) {
      toast.error('Please select a class section for Grade 11 or 12');
      return;
    }
    setStructureLoading(true);
    const cleanComponents = structureForm.components
      .filter(c => c.name && c.amount)
      .map(({ name, amount, dueDate }) => ({ name, amount: Number(amount), dueDate: dueDate || null }));

    try {
      if (editingStructure) {
        // Direct update by _id — no upsert, preserves standard/classId/year
        await api.put(`/api/fee-structure/${editingStructure._id}`, {
          totalFees: Number(structureForm.totalFees),
          components: cleanComponents,
        });
        toast.success('Fee structure updated');
      } else {
        await api.put('/api/fee-structure', {
          standard: structureForm.standard,
          classId: HIGHER.has(structureForm.standard) && structureForm.classId ? structureForm.classId : null,
          academicYear: structureForm.academicYear,
          totalFees: Number(structureForm.totalFees),
          components: cleanComponents,
        });
        toast.success('Fee structure created');
      }
      setShowStructureModal(false);
      fetchFeeStructures();
    } catch {
      toast.error('Failed to save fee structure');
    } finally {
      setStructureLoading(false);
    }
  };

  const handleDeleteStructure = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Fee Structure',
      message: 'Are you sure you want to delete this fee structure?',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await api.delete(`/api/fee-structure/${id}`);
          toast.success('Fee structure deleted');
          fetchFeeStructures();
        } catch {
          toast.error('Failed to delete');
        }
      },
    });
  };

  const addComponent = () => {
    setStructureForm(prev => ({
      ...prev,
      components: [...prev.components, { name: '', amount: '', dueDate: '', _key: String(Date.now()) }],
    }));
  };

  const updateComponent = (idx, field, value) => {
    setStructureForm(prev => {
      const updated = [...prev.components];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, components: updated };
    });
  };

  const removeComponent = (idx) => {
    setStructureForm(prev => ({ ...prev, components: prev.components.filter((_, i) => i !== idx) }));
  };

  const componentTotal = structureForm.components.reduce((s, c) => s + (Number(c.amount) || 0), 0);

  let submitLabel = 'Save Structure';
  if (structureLoading) submitLabel = 'Saving...';
  else if (editingStructure) submitLabel = 'Update Structure';

  // For 11/12: only show sections of the matching grade
  const filteredClasses = HIGHER.has(structureForm.standard)
    ? classes.filter(c => toStandard(c.name) === structureForm.standard)
    : [];

  const getDisplayName = (s) => {
    if (!s.classId) return `Standard ${s.standard}`;
    const cls = s.classId;
    const section = cls.section ? ` — Section ${cls.section}` : '';
    return `Grade ${s.standard}${section}`;
  };

  // ── Student Fees Tab Logic ──────────────────────────────────────────────────

  const handleClassChange = async (classId) => {
    setSfSelectedClass(classId);
    setSfSelectedStructure('');
    setSfStudentFees([]);
    setSfFeeStructures([]);
    if (!classId) return;
    try {
      const res = await api.get(`/api/fees/fee-structures-by-class/${classId}`);
      setSfFeeStructures(res.data || []);
    } catch {
      toast.error('Failed to load fee structures for class');
    }
  };

  const handleStructureChange = async (structureId) => {
    setSfSelectedStructure(structureId);
    setSfStudentFees([]);
    if (!structureId || !sfSelectedClass) return;
    setSfLoading(true);
    try {
      const res = await api.get(`/api/fees/student-fees?classId=${sfSelectedClass}&feeStructureId=${structureId}`);
      setSfStudentFees(res.data || []);
    } catch {
      toast.error('Failed to load student fees');
    } finally {
      setSfLoading(false);
    }
  };

  const handleTogglePayment = async (studentId, componentName, currentStatus) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    const key = `${studentId}-${componentName}`;
    setSfTogglingMap(prev => ({ ...prev, [key]: true }));
    try {
      await api.put('/api/fees/student-fees/toggle', {
        studentId,
        feeStructureId: sfSelectedStructure,
        componentName,
        status: newStatus,
      });
      // Update local state
      setSfStudentFees(prev => prev.map(s => {
        if (s.studentId !== studentId) return s;
        let totalPaid = 0;
        let totalComponentAmount = 0;
        const components = s.components.map(c => {
          const updated = c.name === componentName ? { ...c, status: newStatus, paidAt: newStatus === 'paid' ? new Date().toISOString() : null } : c;
          totalComponentAmount += updated.amount;
          if (updated.status === 'paid') totalPaid += updated.amount;
          return updated;
        });
        return { ...s, components, totalPaid, totalPending: totalComponentAmount - totalPaid };
      }));
      toast.success(`${componentName} marked as ${newStatus}`);
    } catch {
      toast.error('Failed to update payment status');
    } finally {
      setSfTogglingMap(prev => ({ ...prev, [key]: false }));
    }
  };

  // Get the selected structure object for displaying component headers
  const selectedStructureObj = sfFeeStructures.find(s => s._id === sfSelectedStructure);

  const handleExportExcel = () => {
    if (!sfStudentFees.length || !selectedStructureObj) return;
    const cls = classes.find(c => c._id === sfSelectedClass);
    const className = cls ? `${cls.name}${cls.section ? `-${cls.section}` : ''}` : 'class';

    const rows = sfStudentFees.map(s => {
      const row = { 'Student Name': s.name, 'Roll No': s.rollNumber || '' };
      s.components.forEach(c => {
        row[c.name] = c.status === 'paid' ? 'Paid' : 'Pending';
      });
      row['Total Paid'] = s.totalPaid;
      row['Total Pending'] = s.totalPending;
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student Fees');
    XLSX.writeFile(wb, `${className}-fees-${selectedStructureObj.academicYear}.xlsx`);
    toast.success('Excel exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#0F172A]">Fees & Finance Management</h1>
          <p className="text-[#64748B] mt-1">Standard-wise fee structure management</p>
        </div>
        {activeTab === 'structure' && (
          <button onClick={openAddStructure} className="flex items-center gap-2 bg-[#4F46E5] text-white hover:bg-[#4338CA] px-6 py-3 rounded-lg font-semibold transition-all shadow-md">
            <Plus size={20} /> Add Structure
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('structure')}
          className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${activeTab === 'structure' ? 'bg-white text-[#4F46E5] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}`}
        >
          Fee Structure
        </button>
        <button
          onClick={() => setActiveTab('studentFees')}
          className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${activeTab === 'studentFees' ? 'bg-white text-[#4F46E5] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}`}
        >
          Student Fees
        </button>
      </div>

      {/* ── Fee Structure Tab ────────────────────────────────────────────── */}
      {activeTab === 'structure' && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h2 className="text-2xl font-bold mb-4">Class-wise Fee Structure</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-linear-to-r from-[#FEF3C7] to-[#FEE2E2]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Standard / Class</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Academic Year</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Fee Components</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Total Fees</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {feeStructures.length > 0 ? feeStructures.map((s) => (
                  <tr key={s._id} className="hover:bg-[#FFFBEB]">
                    <td className="px-6 py-4 font-semibold text-[#0F172A]">{getDisplayName(s)}</td>
                    <td className="px-6 py-4 text-sm text-[#64748B]">{s.academicYear}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {s.components.length > 0 ? s.components.map((c) => (
                          <span key={c.name} className="px-2 py-0.5 bg-[#EEF2FF] text-[#4F46E5] text-xs rounded-full font-medium">
                            {c.name}: ₹{c.amount.toLocaleString()}{c.dueDate ? ` (Due: ${formatDate(c.dueDate)})` : ''}
                          </span>
                        )) : <span className="text-xs text-[#94A3B8]">No components</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#0F172A]">₹{s.totalFees.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEditStructure(s)} className="p-1.5 text-[#4F46E5] hover:bg-[#EEF2FF] rounded-lg transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDeleteStructure(s._id)} className="p-1.5 text-[#EF4444] hover:bg-[#FEE2E2] rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#64748B]">
                      No fee structures configured yet. Click "Add Structure" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Student Fees Tab ─────────────────────────────────────────────── */}
      {activeTab === 'studentFees' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Student Fee Payments</h2>
              {sfStudentFees.length > 0 && (
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 bg-[#10B981] text-white hover:bg-[#059669] px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-md"
                >
                  <Download size={16} /> Export Excel
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold text-[#0F172A] mb-1">Select Class</label>
                <select
                  value={sfSelectedClass}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg"
                >
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={c._id} value={c._id}>{c.name}{c.section ? ` - ${c.section}` : ''}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold text-[#0F172A] mb-1">Select Fee Structure</label>
                <select
                  value={sfSelectedStructure}
                  onChange={(e) => handleStructureChange(e.target.value)}
                  disabled={!sfSelectedClass}
                  className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg disabled:opacity-50"
                >
                  <option value="">Select Fee Structure</option>
                  {sfFeeStructures.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.standard} — {s.academicYear} — ₹{s.totalFees.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          {sfStudentFees.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-4">
                <p className="text-sm text-[#64748B]">Total Students</p>
                <p className="text-3xl font-bold text-[#0F172A]">{sfStudentFees.length}</p>
              </div>
              <div className="bg-white rounded-xl border-2 border-[#10B981] p-4">
                <p className="text-sm text-[#64748B]">Fully Paid</p>
                <p className="text-3xl font-bold text-[#10B981]">
                  {sfStudentFees.filter(s => s.totalPending === 0).length}
                </p>
              </div>
              <div className="bg-white rounded-xl border-2 border-[#EF4444] p-4">
                <p className="text-sm text-[#64748B]">With Pending Fees</p>
                <p className="text-3xl font-bold text-[#EF4444]">
                  {sfStudentFees.filter(s => s.totalPending > 0).length}
                </p>
              </div>
            </div>
          )}

          {/* Student Fees Table */}
          {sfLoading ? (
            <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-12 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-[#4F46E5] border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-[#64748B]">Loading student fees...</p>
            </div>
          ) : sfStudentFees.length > 0 ? (
            <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-linear-to-r from-[#FEF3C7] to-[#FEE2E2]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-[#0F172A] uppercase sticky left-0 bg-[#FEF3C7]">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Roll No</th>
                      {selectedStructureObj?.components.map(c => (
                        <th key={c.name} className="px-4 py-3 text-center text-xs font-bold text-[#0F172A] uppercase min-w-[120px]">
                          <div>{c.name}</div>
                          <div className="font-normal text-[#64748B]">₹{c.amount.toLocaleString()}</div>
                          {c.dueDate && <div className="font-normal text-[#EF4444] text-[10px]">Due: {formatDate(c.dueDate)}</div>}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center text-xs font-bold text-[#0F172A] uppercase">Total Paid</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-[#0F172A] uppercase">Pending</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sfStudentFees.map((student) => (
                      <tr key={student.studentId} className="hover:bg-[#FFFBEB]">
                        <td className="px-4 py-3 font-semibold text-[#0F172A] sticky left-0 bg-white">{student.name}</td>
                        <td className="px-4 py-3 text-sm text-[#64748B]">{student.rollNumber || '—'}</td>
                        {student.components.map(c => {
                          const key = `${student.studentId}-${c.name}`;
                          const isToggling = sfTogglingMap[key];
                          return (
                            <td key={c.name} className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleTogglePayment(student.studentId, c.name, c.status)}
                                disabled={isToggling}
                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                  c.status === 'paid'
                                    ? 'bg-[#D1FAE5] text-[#065F46] hover:bg-[#A7F3D0]'
                                    : 'bg-[#FEE2E2] text-[#991B1B] hover:bg-[#FECACA]'
                                } ${isToggling ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                              >
                                {isToggling ? (
                                  <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full"></div>
                                ) : c.status === 'paid' ? (
                                  <Check size={12} />
                                ) : (
                                  <Clock size={12} />
                                )}
                                {c.status === 'paid' ? 'Paid' : 'Pending'}
                              </button>
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-center font-bold text-[#10B981]">₹{student.totalPaid.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center font-bold">
                          <span className={student.totalPending > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}>
                            ₹{student.totalPending.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : sfSelectedStructure && !sfLoading ? (
            <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-12 text-center">
              <Search size={40} className="mx-auto text-[#94A3B8] mb-3" />
              <p className="text-[#64748B]">No students found for this class.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-12 text-center">
              <Search size={40} className="mx-auto text-[#94A3B8] mb-3" />
              <p className="text-[#64748B]">Select a class and fee structure to view student fee status.</p>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Fee Structure Modal */}
      {showStructureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-[#0F172A]">
                {editingStructure ? 'Edit Fee Structure' : 'Add Fee Structure'}
              </h2>
              <button onClick={() => setShowStructureModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleStructureSubmit} className="space-y-4">
              {/* Standard — locked when editing */}
              <div>
                <label htmlFor="fs-standard" className="block text-sm font-semibold text-[#0F172A] mb-1">Standard</label>
                {editingStructure ? (
                  <div className="w-full h-10 px-3 border-2 border-[#E2E8F0] rounded-lg bg-[#F8FAFC] flex items-center text-sm text-[#64748B]">
                    {structureForm.standard === 'LKG' || structureForm.standard === 'UKG'
                      ? structureForm.standard
                      : `Grade ${structureForm.standard}`}
                  </div>
                ) : (
                  <select
                    id="fs-standard"
                    required
                    value={structureForm.standard}
                    onChange={(e) => setStructureForm({ ...structureForm, standard: e.target.value, classId: '' })}
                    className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg"
                  >
                    <option value="">Select Standard</option>
                    {STANDARDS.map(s => (
                      <option key={s} value={s}>{s === 'LKG' || s === 'UKG' ? s : `Grade ${s}`}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Section selector — only for Grade 11 & 12, locked when editing */}
              {HIGHER.has(structureForm.standard) && (
                <div>
                  <label htmlFor="fs-class" className="block text-sm font-semibold text-[#0F172A] mb-1">
                    Section <span className="font-normal text-[#64748B]">(for Grade {structureForm.standard})</span>
                  </label>
                  {editingStructure ? (
                    <div className="w-full h-10 px-3 border-2 border-[#E2E8F0] rounded-lg bg-[#F8FAFC] flex items-center text-sm text-[#64748B]">
                      {structureForm.classId
                        ? (classes.find(c => c._id === structureForm.classId)?.section || 'Selected')
                        : 'All sections'}
                    </div>
                  ) : (
                    <select
                      id="fs-class"
                      required
                      value={structureForm.classId}
                      onChange={(e) => setStructureForm({ ...structureForm, classId: e.target.value })}
                      className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg"
                    >
                      <option value="">Select Section</option>
                      {filteredClasses.map(c => (
                        <option key={c._id} value={c._id}>Section {c.section || c.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Academic Year — locked when editing */}
              <div>
                <label htmlFor="fs-year" className="block text-sm font-semibold text-[#0F172A] mb-1">Academic Year</label>
                {editingStructure ? (
                  <div className="w-full h-10 px-3 border-2 border-[#E2E8F0] rounded-lg bg-[#F8FAFC] flex items-center text-sm text-[#64748B]">
                    {structureForm.academicYear}
                  </div>
                ) : (
                  <input
                    id="fs-year"
                    type="text"
                    placeholder="e.g. 2025-26"
                    required
                    value={structureForm.academicYear}
                    onChange={(e) => setStructureForm({ ...structureForm, academicYear: e.target.value })}
                    className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg"
                  />
                )}
              </div>

              {/* Total Fees */}
              <div>
                <label htmlFor="fs-total" className="block text-sm font-semibold text-[#0F172A] mb-1">Total Annual Fees (₹)</label>
                <input
                  id="fs-total"
                  type="number"
                  placeholder="e.g. 50000"
                  required
                  min="0"
                  value={structureForm.totalFees}
                  onChange={(e) => setStructureForm({ ...structureForm, totalFees: e.target.value })}
                  className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg"
                />
              </div>

              {/* Dynamic Components */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-[#0F172A]">Fee Components</span>
                  <button type="button" onClick={addComponent} className="text-xs text-[#4F46E5] font-semibold hover:underline flex items-center gap-1">
                    <Plus size={13} /> Add Component
                  </button>
                </div>

                {structureForm.components.length === 0 && (
                  <p className="text-xs text-[#94A3B8] py-2">No components. Click "Add Component" to add items like Term 1 Fee, Book Fee, etc.</p>
                )}

                <div className="space-y-2">
                  {structureForm.components.map((c, idx) => (
                    <div key={c._key} className="space-y-1">
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="e.g. Term 1 Fee"
                          value={c.name}
                          onChange={(e) => updateComponent(idx, 'name', e.target.value)}
                          className="flex-1 h-9 px-3 border-2 border-[#FCD34D] rounded-lg text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Amount"
                          min="0"
                          value={c.amount}
                          onChange={(e) => updateComponent(idx, 'amount', e.target.value)}
                          className="w-28 h-9 px-3 border-2 border-[#FCD34D] rounded-lg text-sm"
                        />
                        <button type="button" onClick={() => removeComponent(idx)} className="p-1.5 text-[#EF4444] hover:bg-[#FEE2E2] rounded-lg transition-colors">
                          <X size={15} />
                        </button>
                      </div>
                      <div className="pl-0">
                        <input
                          type="date"
                          value={c.dueDate || ''}
                          onChange={(e) => updateComponent(idx, 'dueDate', e.target.value)}
                          className="w-full h-8 px-3 border-2 border-[#E2E8F0] rounded-lg text-xs text-[#64748B]"
                          placeholder="Due Date"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {structureForm.components.length > 0 && (
                  <div className={`mt-2 p-2 rounded-lg text-sm font-medium ${
                    componentTotal === Number(structureForm.totalFees)
                      ? 'bg-[#D1FAE5] text-[#065F46]'
                      : 'bg-[#FEF3C7] text-[#92400E]'
                  }`}>
                    Components total: ₹{componentTotal.toLocaleString()}
                    {componentTotal !== Number(structureForm.totalFees) && Number(structureForm.totalFees) > 0 && (
                      <span className="ml-2 text-xs">
                        (differs by ₹{Math.abs(Number(structureForm.totalFees) - componentTotal).toLocaleString()})
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowStructureModal(false)} className="flex-1 bg-gray-200 h-10 rounded-lg font-semibold">Cancel</button>
                <button type="submit" disabled={structureLoading} className="flex-1 bg-[#4F46E5] text-white h-10 rounded-lg font-semibold">
                  {submitLabel}
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

export default Fees;
