import React, { useEffect, useState } from 'react';
import api from '@/utils/api';
import { Plus, Edit, Trash2, Download, FileText, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClasses } from '@/store/slices/classesSlice';
import ConfirmDialog from '@/components/ConfirmDialog';

const EXAM_TYPES = ['CAT-1', 'CAT-2', 'Quarterly', 'Half Yearly', 'Revision-1', 'Revision-2', 'Annual'];

const DEFAULT_GRADE_RULES = [
  { label: 'A+', minPercent: 90, maxPercent: 100, points: 10 },
  { label: 'A',  minPercent: 80, maxPercent: 89,  points: 9  },
  { label: 'B+', minPercent: 70, maxPercent: 79,  points: 8  },
  { label: 'B',  minPercent: 60, maxPercent: 69,  points: 7  },
  { label: 'C',  minPercent: 50, maxPercent: 59,  points: 6  },
  { label: 'D',  minPercent: 40, maxPercent: 49,  points: 5  },
  { label: 'E',  minPercent: 35, maxPercent: 39,  points: 4  },
  { label: 'F',  minPercent: 0,  maxPercent: 34,  points: 0  },
];

const calcGradeFromRules = (percent, rules) => {
  for (const g of rules) {
    if (percent >= g.minPercent && percent <= g.maxPercent) return g.label;
  }
  return '-';
};

const Exams = () => {
  const dispatch = useDispatch();
  const classes = useSelector(s => s.classes.list);
  const classesStatus = useSelector(s => s.classes.status);

  const [activeTab, setActiveTab] = useState('Exam Settings');
  const [gradeRules, setGradeRules] = useState(DEFAULT_GRADE_RULES);

  useEffect(() => {
    if (classesStatus === 'idle') dispatch(fetchClasses());
    api.get('/api/grade-config').then(res => {
      if (res.data?.data?.length) setGradeRules(res.data.data);
    }).catch(() => {});
  }, [classesStatus, dispatch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-4xl font-bold text-[#0F172A]">Exam Management</h1>
        <p className="text-[#64748B] mt-1">Manage exams, marks, grades, and generate reports</p>
      </div>

      <div className="flex gap-1 border-b-2 border-[#FCD34D] overflow-x-auto">
        {['Exam Settings', 'Marks', 'Grades', 'Reports'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors ${
              activeTab === tab
                ? 'bg-[#FCD34D] text-[#0F172A]'
                : 'text-[#64748B] hover:bg-[#FEF3C7] hover:text-[#0F172A]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Exam Settings' && <ExamSettingsTab classes={classes} />}
      {activeTab === 'Marks' && <MarksTab classes={classes} gradeRules={gradeRules} />}
      {activeTab === 'Grades' && <GradesTab gradeRules={gradeRules} setGradeRules={setGradeRules} classes={classes} />}
      {activeTab === 'Reports' && <ReportsTab classes={classes} gradeRules={gradeRules} />}
    </div>
  );
};

// ─── Exam Settings Tab ──────────────────────────────────────────────────────

const ExamSettingsTab = ({ classes }) => {
  const [exams, setExams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [staff, setStaff] = useState([]);

  // Filter state
  const [filterStandard, setFilterStandard] = useState('');
  const [filterSection, setFilterSection] = useState('');

  const uniqueStandards = [...new Set(classes.map(c => c.name).filter(Boolean))].sort();
  const sectionsForStandard = filterStandard
    ? [...new Set(classes.filter(c => c.name === filterStandard).map(c => c.section).filter(Boolean))].sort()
    : [];
  const filteredExams = exams.filter(e => {
    if (filterStandard && e.classId?.name !== filterStandard) return false;
    if (filterSection && e.classId?.section !== filterSection) return false;
    return true;
  });

  // For the new bulk schedule form
  const [scheduleForm, setScheduleForm] = useState({
    examType: 'CAT-1',
    classId: '',
  });
  const [subjectRows, setSubjectRows] = useState([]);

  // For single exam edit
  const [formData, setFormData] = useState({
    examType: 'CAT-1',
    classId: '',
    subject: '',
    date: '',
    startTime: '09:00',
    duration: 60,
    session: 'Forenoon',
    invigilatorId: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExams();
    fetchStaff();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await api.get('/api/exams');
      const examsData = Array.isArray(response.data) ? response.data : [];
      setExams(examsData.filter(e => e && e._id));
    } catch (error) {
      console.error('Error loading exams:', error);
      toast.error('Failed to load exams');
      setExams([]);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await api.get('/api/staff');
      setStaff(response.data || []);
    } catch (error) {
      console.error('Error loading staff:', error);
      toast.error('Failed to load staff');
    }
  };

  const handleScheduleClassChange = async (classId) => {
    setScheduleForm({ ...scheduleForm, classId });
    if (classId) {
      try {
        const response = await api.get(`/api/exams/class-subjects/${classId}`);
        const fetchedSubjects = response.data || [];
        setSubjects(fetchedSubjects);
        // Initialize subject rows
        const rows = fetchedSubjects.map(subj => ({
          subjectId: subj._id,
          subjectName: subj.name,
          date: '',
          startTime: '09:00',
          duration: 60,
          session: 'Forenoon',
          invigilatorId: '',
        }));
        setSubjectRows(rows);
      } catch (error) {
        console.error('Error loading subjects:', error);
        toast.error('Failed to load subjects');
        setSubjects([]);
        setSubjectRows([]);
      }
    } else {
      setSubjects([]);
      setSubjectRows([]);
    }
  };

  const handleSubjectRowChange = (index, field, value) => {
    const updatedRows = [...subjectRows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };
    setSubjectRows(updatedRows);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleForm.classId) {
      toast.error('Please select a class');
      return;
    }
    const rowsWithDate = subjectRows.filter(row => row.date);
    if (rowsWithDate.length === 0) {
      toast.error('Please fill in dates for at least one subject');
      return;
    }
    setLoading(true);
    try {
      const examsToCreate = rowsWithDate.map(row => ({
        examType: scheduleForm.examType,
        classId: scheduleForm.classId,
        subject: row.subjectName,
        date: row.date,
        startTime: row.startTime,
        endTime: calculateEndTime(row.startTime, row.duration),
        duration: Number(row.duration),
        session: row.session,
        invigilatorId: row.invigilatorId || undefined,
      }));
      await Promise.all(examsToCreate.map(exam => api.post('/api/exams', exam)));
      toast.success(`Created ${examsToCreate.length} exam(s) successfully`);
      setShowModal(false);
      resetScheduleForm();
      fetchExams();
    } catch (error) {
      console.error('Error creating exams:', error);
      toast.error('Failed to create exams');
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = async (classId) => {
    setFormData({ ...formData, classId, subjectId: '' });
    if (classId) {
      try {
        const response = await api.get(`/api/exams/class-subjects/${classId}`);
        setSubjects(response.data || []);
      } catch (error) {
        toast.error('Failed to load subjects');
        setSubjects([]);
      }
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.classId) errors.classId = 'Class is required';
    if (!formData.subject) errors.subject = 'Subject is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.startTime) errors.startTime = 'Start time is required';
    if (!formData.duration || formData.duration <= 0) errors.duration = 'Duration must be greater than 0';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const endTime = calculateEndTime(formData.startTime, formData.duration);
      const submitData = {
        ...formData,
        endTime,
        duration: Number(formData.duration),
        invigilatorId: formData.invigilatorId || undefined,
      };
      if (isEditing && selectedExam) {
        await api.put(`/api/exams/${selectedExam._id}`, submitData);
        toast.success('Exam updated successfully');
      } else {
        await api.post('/api/exams', submitData);
        toast.success('Exam created successfully');
      }
      setShowModal(false);
      fetchExams();
      resetForm();
    } catch (error) {
      toast.error(isEditing ? 'Failed to update exam' : 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (examId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Exam',
      message: 'Are you sure you want to delete this exam?',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await api.delete(`/api/exams/${examId}`);
          toast.success('Exam deleted');
          fetchExams();
        } catch {
          toast.error('Failed to delete exam');
        }
      },
    });
  };

  const handleEdit = (exam) => {
    if (!exam.classId || !exam.subject) {
      toast.error('Cannot edit: Missing class or subject data');
      return;
    }
    // Calculate duration from startTime and endTime
    const [startHours, startMins] = exam.startTime.split(':').map(Number);
    const [endHours, endMins] = exam.endTime.split(':').map(Number);
    const startTotalMins = startHours * 60 + startMins;
    const endTotalMins = endHours * 60 + endMins;
    const duration = endTotalMins - startTotalMins;

    setSelectedExam(exam);
    setFormData({
      examType: exam.examType,
      classId: exam.classId._id,
      subject: exam.subject,
      date: exam.date ? exam.date.split('T')[0] : '',
      startTime: exam.startTime,
      duration: duration,
      session: exam.session || 'Forenoon',
      invigilatorId: exam.invigilatorId?._id || '',
    });
    api.get(`/api/exams/class-subjects/${exam.classId._id}`)
      .then(res => setSubjects(res.data || []))
      .catch(() => setSubjects([]));
    setIsEditing(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      examType: 'CAT-1',
      classId: '',
      subject: '',
      date: '',
      startTime: '09:00',
      duration: 60,
      session: 'Forenoon',
      invigilatorId: '',
    });
    setFormErrors({});
    setIsEditing(false);
    setSelectedExam(null);
  };

  const calculateEndTime = (startTime, duration) => {
    const [hours, mins] = startTime.split(':').map(Number);
    const totalMins = hours * 60 + mins + Number(duration);
    const endHours = Math.floor(totalMins / 60);
    const endMins = totalMins % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
  };

  const resetScheduleForm = () => {
    setScheduleForm({
      examType: 'CAT-1',
      classId: '',
    });
    setSubjectRows([]);
    setSubjects([]);
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => {
          resetForm();
          resetScheduleForm();
          setShowModal(true);
        }}
        className="flex items-center gap-2 bg-[#DC2626] text-white hover:bg-[#B91C1C] px-6 py-3 rounded-lg font-semibold"
      >
        <Plus size={20} />
        Add Exam Schedule
      </button>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-semibold text-[#64748B] mb-1">Standard</label>
          <select
            value={filterStandard}
            onChange={e => { setFilterStandard(e.target.value); setFilterSection(''); }}
            className="h-10 px-3 border-2 border-[#FCD34D] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
          >
            <option value="">All Standards</option>
            {uniqueStandards.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#64748B] mb-1">Section</label>
          <select
            value={filterSection}
            onChange={e => setFilterSection(e.target.value)}
            disabled={!filterStandard}
            className="h-10 px-3 border-2 border-[#FCD34D] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] disabled:opacity-50"
          >
            <option value="">All Sections</option>
            {sectionsForStandard.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {(filterStandard || filterSection) && (
          <button
            onClick={() => { setFilterStandard(''); setFilterSection(''); }}
            className="h-10 px-4 border-2 border-[#E2E8F0] rounded-lg text-sm text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
          >
            Clear
          </button>
        )}
        {(filterStandard || filterSection) && (
          <p className="text-sm text-[#64748B] self-end pb-1">
            Showing <span className="font-semibold text-[#0F172A]">{filteredExams.length}</span> exam{filteredExams.length !== 1 ? 's' : ''}
            {filterStandard && <> for <span className="font-semibold text-[#0F172A]">{filterStandard}{filterSection ? `-${filterSection}` : ''}</span></>}
          </p>
        )}
      </div>

      {filteredExams.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] shadow-sm px-6 py-12 text-center text-[#64748B]">
          {exams.length === 0 ? 'No exams scheduled' : 'No exams found for the selected filters'}
        </div>
      ) : (
        <div className="space-y-6">
          {EXAM_TYPES.filter(type => filteredExams.some(e => e.examType === type)).map(type => {
            const group = filteredExams.filter(e => e.examType === type);
            return (
              <div key={type} className="bg-white rounded-xl border-2 border-[#FCD34D] shadow-sm overflow-hidden">
                <div className="px-6 py-3 bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2] flex items-center justify-between">
                  <h3 className="font-bold text-[#0F172A] text-sm uppercase tracking-wide">{type}</h3>
                  <span className="text-xs font-semibold text-[#64748B] bg-white px-2 py-0.5 rounded-full border border-[#E2E8F0]">
                    {group.length} exam{group.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#FFFBEB] border-b border-[#FCD34D]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-[#64748B] uppercase">Class</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-[#64748B] uppercase">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-[#64748B] uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-[#64748B] uppercase">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-[#64748B] uppercase">Session</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-[#64748B] uppercase">Invigilator</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-[#64748B] uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {group.map((exam) => (
                        <tr key={exam._id} className="hover:bg-[#FFFBEB]">
                          <td className="px-6 py-4 text-sm text-[#0F172A]">{exam.classId ? `${exam.classId.name}-${exam.classId.section}` : 'N/A'}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-[#0F172A]">{exam.subject || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-[#64748B]">{exam.date ? exam.date.split('T')[0] : 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-[#64748B]">{exam.startTime} - {exam.endTime}</td>
                          <td className="px-6 py-4 text-sm text-[#64748B]">{exam.session || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-[#64748B]">{exam.invigilatorId?.userId?.name || 'N/A'}</td>
                          <td className="px-6 py-4 flex gap-2">
                            <button onClick={() => handleEdit(exam)} className="p-2 text-[#F59E0B] hover:bg-[#FEF3C7] rounded-lg">
                              <Edit size={18} />
                            </button>
                            <button onClick={() => handleDelete(exam._id)} className="p-2 text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#0F172A]">
                {isEditing ? 'Edit Exam' : 'Add Exam Schedule'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                  resetScheduleForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">Exam Type *</label>
                    <select
                      value={formData.examType}
                      onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                      className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    >
                      {EXAM_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">Class *</label>
                    <select
                      value={formData.classId}
                      onChange={(e) => handleClassChange(e.target.value)}
                      className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    >
                      <option value="">Select class</option>
                      {classes.map((cls) => (
                        <option key={cls._id} value={cls._id}>{cls.name}-{cls.section}</option>
                      ))}
                    </select>
                    {formErrors.classId && <p className="text-red-500 text-xs mt-1">{formErrors.classId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">Subject *</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B] "
                    >
                      <option value="">Select subject</option>
                      {subjects.map((subj) => (
                        <option key={subj._id} value={subj.name}>{subj.name}</option>
                      ))}
                    </select>
                    {formErrors.subject && <p className="text-red-500 text-xs mt-1">{formErrors.subject}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">Date *</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    />
                    {formErrors.date && <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">Start Time *</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    />
                    {formErrors.startTime && <p className="text-red-500 text-xs mt-1">{formErrors.startTime}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">Duration (minutes) *</label>
                    <input
                      type="number"
                      min="30"
                      step="30"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                      className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">End Time (Auto-calculated)</label>
                    <input
                      type="time"
                      value={calculateEndTime(formData.startTime, formData.duration)}
                      disabled
                      className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">Session *</label>
                    <select
                      value={formData.session}
                      onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                      className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    >
                      <option value="Forenoon">Forenoon</option>
                      <option value="Afternoon">Afternoon</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">Invigilator</label>
                    <select
                      value={formData.invigilatorId}
                      onChange={(e) => setFormData({ ...formData, invigilatorId: e.target.value })}
                      className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    >
                      <option value="">Select invigilator (optional)</option>
                      {staff.map((s) => (
                        <option key={s._id} value={s._id}>{s.userId?.name || 'N/A'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t-2 border-[#FCD34D]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-200 text-[#0F172A] hover:bg-gray-300 h-10 px-4 py-2 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#DC2626] text-white hover:bg-[#B91C1C] h-10 px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Update'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">Exam Type *</label>
                    <select
                      value={scheduleForm.examType}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, examType: e.target.value })}
                      className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    >
                      {EXAM_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">Class *</label>
                    <select
                      value={scheduleForm.classId}
                      onChange={(e) => handleScheduleClassChange(e.target.value)}
                      className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    >
                      <option value="">Select class</option>
                      {classes.map((cls) => (
                        <option key={cls._id} value={cls._id}>{cls.name}-{cls.section}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {subjectRows.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-2 border-[#FCD34D] rounded-lg overflow-hidden">
                      <thead className="bg-[#FEF3C7]">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-bold text-[#0F172A]">Subject</th>
                          <th className="px-4 py-2 text-left text-xs font-bold text-[#0F172A]">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-bold text-[#0F172A]">Start Time</th>
                          <th className="px-4 py-2 text-left text-xs font-bold text-[#0F172A]">Duration (min)</th>
                          <th className="px-4 py-2 text-left text-xs font-bold text-[#0F172A]">End Time</th>
                          <th className="px-4 py-2 text-left text-xs font-bold text-[#0F172A]">Session</th>
                          <th className="px-4 py-2 text-left text-xs font-bold text-[#0F172A]">Invigilator</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {subjectRows.map((row, idx) => (
                          <tr key={row.subjectId} className="hover:bg-[#FFFBEB]">
                            <td className="px-4 py-2 text-sm font-semibold text-[#0F172A]">{row.subjectName}</td>
                            <td className="px-4 py-2">
                              <input
                                type="date"
                                value={row.date}
                                onChange={(e) => handleSubjectRowChange(idx, 'date', e.target.value)}
                                className="w-full h-8 px-2 border-2 border-[#FCD34D] rounded text-sm"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="time"
                                value={row.startTime}
                                onChange={(e) => handleSubjectRowChange(idx, 'startTime', e.target.value)}
                                className="w-full h-8 px-2 border-2 border-[#FCD34D] rounded text-sm"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                min="30"
                                step="30"
                                value={row.duration}
                                onChange={(e) => handleSubjectRowChange(idx, 'duration', Number(e.target.value))}
                                className="w-full h-8 px-2 border-2 border-[#FCD34D] rounded text-sm"
                              />
                            </td>
                            <td className="px-4 py-2 text-sm font-semibold text-[#0F172A]">
                              {calculateEndTime(row.startTime, row.duration)}
                            </td>
                            <td className="px-4 py-2">
                              <select
                                value={row.session}
                                onChange={(e) => handleSubjectRowChange(idx, 'session', e.target.value)}
                                className="w-full h-8 px-2 border-2 border-[#FCD34D] rounded text-sm"
                              >
                                <option value="Forenoon">Forenoon</option>
                                <option value="Afternoon">Afternoon</option>
                              </select>
                            </td>
                            <td className="px-4 py-2">
                              <select
                                value={row.invigilatorId}
                                onChange={(e) => handleSubjectRowChange(idx, 'invigilatorId', e.target.value)}
                                className="w-full h-8 px-2 border-2 border-[#FCD34D] rounded text-sm"
                              >
                                <option value="">Select</option>
                                {staff.map((s) => (
                                  <option key={s._id} value={s._id}>{s.userId?.name || 'N/A'}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t-2 border-[#FCD34D]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetScheduleForm();
                    }}
                    className="flex-1 bg-gray-200 text-[#0F172A] hover:bg-gray-300 h-10 px-4 py-2 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#DC2626] text-white hover:bg-[#B91C1C] h-10 px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Create Schedules'}
                  </button>
                </div>
              </form>
            )}
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

// ─── Marks Tab ──────────────────────────────────────────────────────────────

const MarksTab = ({ classes, gradeRules }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(false);

  const handleClassSelect = async (classId) => {
    setSelectedClass(classId);
    setSelectedExam('');
    if (classId) {
      try {
        const stuRes = await api.get(`/api/students?classId=${classId}`);
        setStudents(stuRes.data);

        const examsRes = await api.get(`/api/exams?classId=${classId}`);
        setExams(examsRes.data || []);

        setMarks({});
      } catch (error) {
        toast.error('Failed to load class data');
      }
    }
  };

  const handleExamSelect = async (examId) => {
    setSelectedExam(examId);
    // Load existing marks for this exam
    if (examId) {
      try {
        const resultsRes = await api.get(`/api/exams/${examId}/results`);
        const existingMarks = {};
        resultsRes.data?.forEach((result) => {
          const sid = result.studentId?._id || result.studentId;
          if (sid != null) existingMarks[sid] = result.marks ?? '';
        });
        setMarks(existingMarks);
      } catch (error) {
        console.error('Error loading exam results:', error);
        setMarks({});
      }
    } else {
      setMarks({});
    }
  };

  const calculateGrade = (marksValue) => {
    if (marksValue === undefined || marksValue === null || marksValue === '') return '-';
    const examObj = exams.find(e => e._id === selectedExam);
    const maxScore = examObj?.maxScore || 100;
    const pct = (Number(marksValue) / maxScore) * 100;
    return calcGradeFromRules(pct, gradeRules);
  };

  const handleMarkChange = (studentId, value) => {
    setMarks({
      ...marks,
      [studentId]: value,
    });
  };

  const handleSaveMarks = async () => {
    if (!selectedExam) {
      toast.error('Please select an exam');
      return;
    }
    if (Object.keys(marks).length === 0) {
      toast.error('No marks to save');
      return;
    }
    setLoading(true);
    try {
      // Convert marks object to array for bulkAddResults endpoint
      const marksArray = Object.entries(marks)
        .filter(([, value]) => value !== '')
        .map(([studentId, value]) => ({
          studentId,
          marks: Number(value),
        }));

      if (marksArray.length === 0) {
        toast.error('Please enter at least one mark');
        setLoading(false);
        return;
      }

      await api.post(`/api/exams/${selectedExam}/results/bulk`, { results: marksArray });
      toast.success('Marks saved successfully');
      // Reload marks to show saved data
      handleExamSelect(selectedExam);
    } catch (error) {
      console.error('Error saving marks:', error);
      toast.error('Failed to save marks');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedClass) {
    return (
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <label className="block text-sm font-medium text-[#0F172A] mb-3">Select Class</label>
        <select
          value={selectedClass}
          onChange={(e) => handleClassSelect(e.target.value)}
          className="w-full md:w-1/3 h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg"
        >
          <option value="">Select class</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>{cls.name}-{cls.section}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-4 space-y-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedClass('')}
            className="px-4 py-2 border-2 border-[#FCD34D] text-[#0F172A] hover:bg-[#FEF3C7] rounded-lg font-semibold"
          >
            Change Class
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-2">Select Exam</label>
          <select
            value={selectedExam}
            onChange={(e) => handleExamSelect(e.target.value)}
            className="w-full md:w-1/2 h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg"
          >
            <option value="">Select exam</option>
            {exams.filter(exam => new Date(exam.date) < new Date()).map((exam) => (
              <option key={exam._id} value={exam._id}>
                {exam.subject} - {exam.examType} ({new Date(exam.date).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedExam && (
        <div className="flex items-center gap-4">
          <button
            onClick={handleSaveMarks}
            disabled={loading || Object.keys(marks).length === 0}
            className="px-6 py-2 bg-[#DC2626] text-white hover:bg-[#B91C1C] rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Marks'}
          </button>
        </div>
      )}

      {selectedExam ? (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A]">Student</th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-[#0F172A]">Marks</th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-[#0F172A]">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => {
                  const markValue = marks[student._id] || '';
                  const grade = calculateGrade(markValue);
                  return (
                    <tr key={student._id} className="hover:bg-[#FFFBEB]">
                      <td className="px-6 py-4 text-sm font-semibold text-[#0F172A]">{student.name}</td>
                      <td className="px-4 py-4 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={markValue}
                          onChange={(e) => handleMarkChange(student._id, e.target.value)}
                          placeholder="0"
                          className="w-20 h-8 px-2 py-1 border-2 border-[#FCD34D] rounded text-center text-sm"
                        />
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-semibold text-[#0F172A]">{grade}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6 text-center">
          <p className="text-[#64748B]">Select an exam to enter marks</p>
        </div>
      )}
    </div>
  );
};

// ─── Grades Tab ──────────────────────────────────────────────────────────────

const EMPTY_GRADE_ROW = { label: '', minPercent: '', maxPercent: '', points: '' };

const GradesTab = ({ gradeRules, setGradeRules, classes }) => {
  const [draft, setDraft] = useState(gradeRules.map(g => ({ ...g })));
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newRow, setNewRow] = useState(EMPTY_GRADE_ROW);
  const [editIdx, setEditIdx] = useState(null);

  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [completedExams, setCompletedExams] = useState([]);
  const [allResults, setAllResults] = useState({});
  const [loadingGrades, setLoadingGrades] = useState(false);

  useEffect(() => { setDraft(gradeRules.map(g => ({ ...g }))); }, [gradeRules]);

  const isExamPast = (exam) => {
    const d = new Date(exam.date);
    const [h, m] = (exam.endTime || '23:59').split(':').map(Number);
    d.setHours(h, m, 0, 0);
    return d < new Date();
  };

  const handleGradeClassSelect = async (classId) => {
    setSelectedClass(classId);
    setCompletedExams([]);
    setAllResults({});
    setStudents([]);
    if (!classId) return;
    setLoadingGrades(true);
    try {
      const [stuRes, examsRes] = await Promise.all([
        api.get(`/api/students?classId=${classId}`),
        api.get(`/api/exams?classId=${classId}`),
      ]);
      const stuList = stuRes.data || [];
      const pastExams = (examsRes.data || []).filter(isExamPast);
      setStudents(stuList);
      const results = {};
      for (const exam of pastExams) {
        try {
          const res = await api.get(`/api/exams/${exam._id}/results`);
          results[exam._id] = res.data || [];
        } catch {
          results[exam._id] = [];
        }
      }
      const examsWithMarks = pastExams.filter(e => results[e._id]?.length > 0);
      setCompletedExams(examsWithMarks);
      setAllResults(results);
    } catch {
      toast.error('Failed to load grade data');
    } finally {
      setLoadingGrades(false);
    }
  };

  const handleSave = async () => {
    const validated = draft.map(g => ({
      label: g.label.trim(),
      minPercent: Number(g.minPercent),
      maxPercent: Number(g.maxPercent),
      points: Number(g.points),
    }));
    if (validated.some(g => !g.label || isNaN(g.minPercent) || isNaN(g.maxPercent))) {
      toast.error('All fields are required for each grade');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post('/api/grade-config', { grades: validated });
      setGradeRules(res.data.data);
      toast.success('Grade configuration saved');
    } catch {
      toast.error('Failed to save grade configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (idx) => {
    setDraft(draft.filter((_, i) => i !== idx));
  };

  const handleAddRow = () => {
    if (!newRow.label.trim() || newRow.minPercent === '' || newRow.maxPercent === '') {
      toast.error('Label, min % and max % are required');
      return;
    }
    setDraft([...draft, { label: newRow.label.trim(), minPercent: Number(newRow.minPercent), maxPercent: Number(newRow.maxPercent), points: Number(newRow.points) || 0 }]);
    setNewRow(EMPTY_GRADE_ROW);
    setShowForm(false);
  };

  const handleEditCell = (idx, field, value) => {
    setDraft(draft.map((g, i) => i === idx ? { ...g, [field]: value } : g));
  };

  return (
    <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A]">Grade Configuration</h2>
          <p className="text-sm text-[#64748B] mt-1">Define your school's grading system. All exam grades will use this.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowForm(true); setNewRow(EMPTY_GRADE_ROW); }}
            className="flex items-center gap-2 bg-[#4F46E5] text-white hover:bg-[#4338CA] px-4 py-2 rounded-lg font-semibold text-sm"
          >
            <Plus size={16} /> Add Grade
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#DC2626] text-white hover:bg-[#B91C1C] px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Grade</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Min %</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Max %</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Points</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {draft.map((g, idx) => (
              <tr key={idx} className="hover:bg-[#FFFBEB]">
                <td className="px-4 py-3">
                  {editIdx === idx ? (
                    <input value={g.label} onChange={e => handleEditCell(idx, 'label', e.target.value)}
                      className="w-20 h-8 px-2 border border-[#FCD34D] rounded text-sm" />
                  ) : (
                    <span className="font-bold text-[#0F172A]">{g.label}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editIdx === idx ? (
                    <input type="number" value={g.minPercent} onChange={e => handleEditCell(idx, 'minPercent', e.target.value)}
                      className="w-20 h-8 px-2 border border-[#FCD34D] rounded text-sm" />
                  ) : (
                    <span className="text-sm text-[#64748B]">{g.minPercent}%</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editIdx === idx ? (
                    <input type="number" value={g.maxPercent} onChange={e => handleEditCell(idx, 'maxPercent', e.target.value)}
                      className="w-20 h-8 px-2 border border-[#FCD34D] rounded text-sm" />
                  ) : (
                    <span className="text-sm text-[#64748B]">{g.maxPercent}%</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editIdx === idx ? (
                    <input type="number" value={g.points} onChange={e => handleEditCell(idx, 'points', e.target.value)}
                      className="w-20 h-8 px-2 border border-[#FCD34D] rounded text-sm" />
                  ) : (
                    <span className="text-sm text-[#0F172A]">{g.points}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {editIdx === idx ? (
                      <button onClick={() => setEditIdx(null)} className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                        <Save size={16} />
                      </button>
                    ) : (
                      <button onClick={() => setEditIdx(idx)} className="p-1.5 text-[#F59E0B] hover:bg-[#FEF3C7] rounded">
                        <Edit size={16} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(idx)} className="p-1.5 text-[#DC2626] hover:bg-[#FEE2E2] rounded">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="bg-[#FEF3C7] p-4 rounded-lg border border-[#FCD34D]">
          <p className="font-semibold text-[#0F172A] mb-3">Add New Grade</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-[#64748B] mb-1 block">Grade Label *</label>
              <input value={newRow.label} onChange={e => setNewRow({ ...newRow, label: e.target.value })}
                placeholder="e.g. A+" className="w-full h-9 px-3 border border-[#FCD34D] rounded text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#64748B] mb-1 block">Min % *</label>
              <input type="number" value={newRow.minPercent} onChange={e => setNewRow({ ...newRow, minPercent: e.target.value })}
                placeholder="0" className="w-full h-9 px-3 border border-[#FCD34D] rounded text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#64748B] mb-1 block">Max % *</label>
              <input type="number" value={newRow.maxPercent} onChange={e => setNewRow({ ...newRow, maxPercent: e.target.value })}
                placeholder="100" className="w-full h-9 px-3 border border-[#FCD34D] rounded text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#64748B] mb-1 block">Points</label>
              <input type="number" value={newRow.points} onChange={e => setNewRow({ ...newRow, points: e.target.value })}
                placeholder="0" className="w-full h-9 px-3 border border-[#FCD34D] rounded text-sm" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleAddRow} className="bg-[#DC2626] text-white hover:bg-[#B91C1C] px-4 py-1.5 rounded text-sm font-semibold">Add</button>
            <button onClick={() => setShowForm(false)} className="bg-gray-200 text-[#0F172A] hover:bg-gray-300 px-4 py-1.5 rounded text-sm font-semibold">Cancel</button>
          </div>
        </div>
      )}

      <div className="border-t-2 border-[#FCD34D] pt-4 space-y-4">
        <h3 className="text-lg font-bold text-[#0F172A]">Student Grades</h3>
        <div>
          <label htmlFor="grades-class-select" className="block text-sm font-medium text-[#0F172A] mb-2">Select Class</label>
          <select
            id="grades-class-select"
            value={selectedClass}
            onChange={(e) => handleGradeClassSelect(e.target.value)}
            className="w-full md:w-1/3 h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg"
          >
            <option value="">Select class</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>{cls.name}-{cls.section}</option>
            ))}
          </select>
        </div>

        {loadingGrades && (
          <p className="text-sm text-[#64748B]">Loading grades...</p>
        )}

        {selectedClass && !loadingGrades && completedExams.length === 0 && (
          <p className="text-sm text-[#64748B]">No completed exams with marks found for this class.</p>
        )}

        {completedExams.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-linear-to-r from-[#FEF3C7] to-[#FEE2E2]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#0F172A]">Student</th>
                  {completedExams.map((exam) => (
                    <th key={exam._id} className="px-4 py-3 text-center text-xs font-bold text-[#0F172A]">
                      {exam.subject}
                      <div className="font-normal text-[#64748B]">{exam.examType} · {new Date(exam.date).toLocaleDateString()}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.filter((student) =>
                  completedExams.some((exam) =>
                    allResults[exam._id]?.some((r) => r.studentId?._id?.toString() === student._id?.toString())
                  )
                ).map((student) => (
                  <tr key={student._id} className="hover:bg-[#FFFBEB]">
                    <td className="px-4 py-3 text-sm font-semibold text-[#0F172A]">{student.name}</td>
                    {completedExams.map((exam) => {
                      const result = allResults[exam._id]?.find(
                        (r) => r.studentId?._id?.toString() === student._id?.toString()
                      );
                      return (
                        <td key={exam._id} className="px-4 py-3 text-center">
                          {result ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E]">
                              {result.grade || calcGradeFromRules((result.marks / (exam.maxScore || 100)) * 100, gradeRules)}
                            </span>
                          ) : (
                            <span className="text-[#94A3B8] text-sm">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Reports Tab ────────────────────────────────────────────────────────────

const ReportsTab = ({ classes }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentResults, setStudentResults] = useState({});

  const handleClassSelect = async (classId) => {
    setSelectedClass(classId);
    if (classId) {
      try {
        const res = await api.get(`/api/students?classId=${classId}`);
        setStudents(res.data);

        // Load all exams for the class and aggregate results by student
        const examsRes = await api.get(`/api/exams?classId=${classId}`);
        const exams = examsRes.data || [];

        const results = {};
        res.data.forEach(student => {
          results[student._id] = [];
        });

        // Fetch results for each exam
        for (const exam of exams) {
          try {
            const resultsRes = await api.get(`/api/exams/${exam._id}/results`);
            resultsRes.data?.forEach((result) => {
              if (results[result.studentId._id]) {
                results[result.studentId._id].push({
                  subject: exam.subject,
                  marks: result.marks,
                  grade: result.grade,
                  maxScore: exam.maxScore || 100,
                  examType: exam.examType,
                });
              }
            });
          } catch {
            // Skip if results can't be fetched for this exam
          }
        }
        setStudentResults(results);
      } catch (error) {
        toast.error('Failed to load students');
      }
    }
  };

  const generatePDF = (student) => {
    const element = document.getElementById(`report-${student._id}`);
    if (!element) {
      toast.error('Report not found');
      return;
    }

    const opt = {
      margin: 10,
      filename: `${student.name}-report-card.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
    };

    html2pdf().set(opt).from(element).save();
    toast.success('PDF downloaded');
  };

  const exportExcel = async () => {
    if (!selectedClass) {
      toast.error('Select a class first');
      return;
    }

    try {
      const wb = XLSX.utils.book_new();
      const className = classes.find(c => c._id === selectedClass)?.name || 'Class';

      // ── Sheet 1: Full class report (all students × all exams) ──
      const detailRows = [];
      students.forEach((student) => {
        const results = studentResults[student._id] || [];
        if (results.length === 0) {
          detailRows.push({
            'Student Name': student.name,
            'Roll No': student.roll_no || 'N/A',
            'Subject': '—',
            'Exam Type': '—',
            'Marks Obtained': '—',
            'Max Score': '—',
            'Percentage': '—',
            'Grade': '—',
          });
        } else {
          results.forEach((result) => {
            const percentage = ((result.marks / result.maxScore) * 100).toFixed(1);
            detailRows.push({
              'Student Name': student.name,
              'Roll No': student.roll_no || 'N/A',
              'Subject': result.subject,
              'Exam Type': result.examType,
              'Marks Obtained': result.marks,
              'Max Score': result.maxScore,
              'Percentage': `${percentage}%`,
              'Grade': result.grade || '-',
            });
          });
        }
      });

      const wsDetail = XLSX.utils.json_to_sheet(detailRows);
      wsDetail['!cols'] = [
        { wch: 22 }, { wch: 10 }, { wch: 20 }, { wch: 14 },
        { wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 8 },
      ];
      XLSX.utils.book_append_sheet(wb, wsDetail, 'Class Report');

      // ── Sheet 2: Summary (one row per student — total marks & average %) ──
      const summaryRows = students.map((student) => {
        const results = studentResults[student._id] || [];
        const totalMarks = results.reduce((s, r) => s + (r.marks || 0), 0);
        const totalMax = results.reduce((s, r) => s + (r.maxScore || 0), 0);
        const avg = totalMax > 0 ? ((totalMarks / totalMax) * 100).toFixed(1) : '—';
        return {
          'Student Name': student.name,
          'Roll No': student.roll_no || 'N/A',
          'Exams Taken': results.length,
          'Total Marks': totalMarks || '—',
          'Total Max': totalMax || '—',
          'Overall %': totalMax > 0 ? `${avg}%` : '—',
        };
      });

      const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
      wsSummary['!cols'] = [
        { wch: 22 }, { wch: 10 }, { wch: 13 }, { wch: 13 }, { wch: 12 }, { wch: 12 },
      ];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

      XLSX.writeFile(wb, `${className}-class-report.xlsx`);
      toast.success('Class report exported');
    } catch (error) {
      toast.error('Failed to export excel');
    }
  };

  if (!selectedClass) {
    return (
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <label className="block text-sm font-medium text-[#0F172A] mb-3">Select Class</label>
        <select
          value={selectedClass}
          onChange={(e) => handleClassSelect(e.target.value)}
          className="w-full md:w-1/3 h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg"
        >
          <option value="">Select class</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>{cls.name}-{cls.section}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSelectedClass('')}
          className="px-4 py-2 border-2 border-[#FCD34D] text-[#0F172A] hover:bg-[#FEF3C7] rounded-lg font-semibold"
        >
          Change Class
        </button>
        <button
          onClick={exportExcel}
          className="flex items-center gap-2 px-6 py-2 bg-[#10B981] text-white hover:bg-[#059669] rounded-lg font-semibold"
        >
          <Download size={18} />
          Export Excel
        </button>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A]">Student</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A]">Roll No</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.filter((student) => studentResults[student._id]?.length > 0).length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-[#64748B]">
                    No reports available yet. Add marks for students first.
                  </td>
                </tr>
              ) : (
                students.filter((student) => studentResults[student._id]?.length > 0).map((student) => (
                  <tr key={student._id} className="hover:bg-[#FFFBEB]">
                    <td className="px-6 py-4 text-sm font-semibold text-[#0F172A]">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-[#64748B]">{student.roll_no || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedStudent(selectedStudent === student._id ? null : student._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white hover:bg-[#4338CA] rounded-lg text-sm"
                      >
                        <FileText size={16} />
                        {selectedStudent === student._id ? 'Hide' : 'View'} Report
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStudent && (
        <div className="space-y-4">
          {students
            .filter((s) => s._id === selectedStudent)
            .map((student) => (
              <div key={student._id}>
                <div
                  id={`report-${student._id}`}
                  className="bg-white rounded-xl border-2 border-[#FCD34D] p-8 space-y-6"
                >
                  <div className="text-center border-b-2 border-[#FCD34D] pb-4">
                    <h1 className="text-3xl font-bold text-[#0F172A]">Report Card</h1>
                    <p className="text-[#64748B] mt-2">Academic Year 2025-2026</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[#64748B]">Student Name</p>
                      <p className="text-lg font-bold text-[#0F172A]">{student.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#64748B]">Roll Number</p>
                      <p className="text-lg font-bold text-[#0F172A]">{student.roll_no || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#64748B]">Class</p>
                      <p className="text-lg font-bold text-[#0F172A]">{student.class || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#64748B]">Status</p>
                      <p className="text-lg font-bold text-[#0F172A] capitalize">{student.status}</p>
                    </div>
                  </div>

                  {studentResults[student._id]?.length > 0 && (
                    <div className="border-t-2 border-[#FCD34D] pt-6">
                      <h2 className="text-xl font-bold text-[#0F172A] mb-4">Subject-wise Results</h2>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-[#FEF3C7] border-b-2 border-[#FCD34D]">
                            <tr>
                              <th className="px-4 py-3 text-left font-bold text-[#0F172A]">Subject</th>
                              <th className="px-4 py-3 text-center font-bold text-[#0F172A]">Exam Type</th>
                              <th className="px-4 py-3 text-center font-bold text-[#0F172A]">Marks Obtained</th>
                              <th className="px-4 py-3 text-center font-bold text-[#0F172A]">Out of</th>
                              <th className="px-4 py-3 text-center font-bold text-[#0F172A]">Percentage</th>
                              <th className="px-4 py-3 text-center font-bold text-[#0F172A]">Grade</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {studentResults[student._id]?.map((result) => {
                              const percentage = ((result.marks / result.maxScore) * 100).toFixed(2);
                              return (
                                <tr key={`${student._id}-${result.subject}-${result.examType}`} className="hover:bg-[#FFFBEB]">
                                  <td className="px-4 py-3 font-semibold text-[#0F172A]">{result.subject}</td>
                                  <td className="px-4 py-3 text-center text-[#64748B]">{result.examType}</td>
                                  <td className="px-4 py-3 text-center font-semibold text-[#0F172A]">{result.marks}</td>
                                  <td className="px-4 py-3 text-center text-[#64748B]">{result.maxScore}</td>
                                  <td className="px-4 py-3 text-center font-semibold text-[#0F172A]">{percentage}%</td>
                                  <td className="px-4 py-3 text-center font-bold text-lg text-[#DC2626]">{result.grade || '-'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="border-t-2 border-[#FCD34D] pt-4">
                    <p className="text-sm text-[#64748B] mb-3">Generated on: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                <button
                  onClick={() => generatePDF(student)}
                  className="flex items-center gap-2 bg-[#DC2626] text-white hover:bg-[#B91C1C] px-6 py-3 rounded-lg font-semibold mt-4"
                >
                  <Download size={18} />
                  Download as PDF
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Exams;
