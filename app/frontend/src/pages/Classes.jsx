import React, { useEffect, useRef, useState } from 'react';
import { Plus, Edit, Trash2, Users, X, ChevronDown, Save, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';

const STANDARDS = ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

const ROMAN_MAP = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const toRoman = (n) => ROMAN_MAP[Number(n)] || n;
const ROMAN_TO_NUM = Object.fromEntries(ROMAN_MAP.slice(1).map((r, i) => [r, String(i + 1)]));

const formatStandard = (raw, fmt) => {
  if (raw === 'LKG' || raw === 'UKG') return raw;
  return fmt === 'roman' ? toRoman(raw) : raw;
};

const buildClassName = (standard, config) => {
  const display = formatStandard(standard, config.standardFormat);
  return config.prefix ? `${config.prefix} ${display}` : display;
};

const parseStandard = (name, config) => {
  let stripped = name;
  if (config.prefix && name.startsWith(`${config.prefix} `)) {
    stripped = name.slice(config.prefix.length + 1);
  }
  if (stripped === 'LKG' || stripped === 'UKG') return stripped;
  if (ROMAN_TO_NUM[stripped]) return ROMAN_TO_NUM[stripped];
  if (/^\d+$/.test(stripped)) return stripped;
  // backward compat: old names like "Grade 1" or "Grade I"
  if (stripped.startsWith('Grade ')) {
    const after = stripped.slice(6);
    return ROMAN_TO_NUM[after] || after;
  }
  return 'LKG';
};

const EMPTY_CLASS_FORM = {
  standard: 'LKG',
  section: '',
  capacity: '',
  roomNumber: '',
  subjects: [],
  staffId: '',
};

const EMPTY_SUBJECT_FORM = { name: '', code: '', description: '' };

const getAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

const getAvailableStudents = (studentList) =>
  studentList.filter((s) => s.status !== 'Graduated');

const getAssignedStudents = (mappingData, studentList) => {
  if (!mappingData?.students?.length) return [];
  const ids = new Set(mappingData.students.map((id) => id.toString()));
  return studentList.filter((s) => ids.has(s._id.toString()));
};

const getUnassignedStudents = (mappingData, studentList, globalAssignedIds) => {
  const currentIds = new Set((mappingData?.students || []).map((id) => id.toString()));
  const globalIds = new Set(globalAssignedIds || []);
  return getAvailableStudents(studentList).filter((s) => {
    const id = s._id.toString();
    return !currentIds.has(id) && !globalIds.has(id);
  });
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const PERIOD_TYPES = [
  { value: 'class', label: 'Class', rowBg: '', badge: 'bg-[#FEF3C7] text-[#92400E]' },
  { value: 'break', label: 'Break', rowBg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-800' },
  { value: 'lunch', label: 'Lunch', rowBg: 'bg-red-50', badge: 'bg-red-100 text-red-800' },
  { value: 'sports', label: 'Sports', rowBg: 'bg-green-50', badge: 'bg-green-100 text-green-800' },
  { value: 'lab', label: 'Lab', rowBg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-800' },
  { value: 'assembly', label: 'Assembly', rowBg: 'bg-purple-50', badge: 'bg-purple-100 text-purple-800' },
];

const initScheduleDraft = (periods, existingSchedule) => {
  const draft = {};
  DAYS.forEach((day) => {
    draft[day] = (periods || []).map((p, i) => {
      const entry = existingSchedule?.[day]?.[i];
      const saved = typeof entry === 'object' ? (entry?.subject || '') : (entry || '');
      return saved || p.subject || '';
    });
  });
  return draft;
};

const initDayDraft = (periods, tt, day) =>
  (periods || []).map((_, i) => ({
    subject: tt?.schedule?.[day]?.[i]?.subject || '',
    teacher: tt?.schedule?.[day]?.[i]?.teacher?.toString() || '',
  }));

const Classes = () => {
  const [activeTab, setActiveTab] = useState('classes');
  const [classes, setClasses] = useState([]);
  const [dbSubjects, setDbSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classConfig, setClassConfig] = useState({ prefix: '', standardFormat: 'number', sectionFormat: 'ABC' });

  // Class modal
  const [showClassModal, setShowClassModal] = useState(false);
  const [classForm, setClassForm] = useState(EMPTY_CLASS_FORM);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classErrors, setClassErrors] = useState({});
  const [classLoading, setClassLoading] = useState(false);

  // Subject modal
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState(EMPTY_SUBJECT_FORM);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjectErrors, setSubjectErrors] = useState({});
  const [subjectLoading, setSubjectLoading] = useState(false);

  // Subject multiselect in class form
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);
  const subjectDropdownRef = useRef(null);

  // Mapping tab
  const [mappingClassId, setMappingClassId] = useState('');
  const [mappingData, setMappingData] = useState(null);
  const [mappingEditMode, setMappingEditMode] = useState(false);
  const [mappingSaving, setMappingSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [globalAssignedStudentIds, setGlobalAssignedStudentIds] = useState([]);

  // Timetable tab
  const [ttTab, setTtTab] = useState('periods');
  const [ttPeriodClassId, setTtPeriodClassId] = useState('');
  const [periodConfig, setPeriodConfig] = useState(null);
  const [periodDraft, setPeriodDraft] = useState([]);
  const [ttEditMode, setTtEditMode] = useState(false);
  const [ttClassId, setTtClassId] = useState('');
  const [timetable, setTimetable] = useState(null);
  const [scheduleDraft, setScheduleDraft] = useState({});
  const [ttScheduleEditMode, setTtScheduleEditMode] = useState(false);
  const [ttLoading, setTtLoading] = useState(false);
  const [ttPeriodDay, setTtPeriodDay] = useState('Monday');
  const [dayDraft, setDayDraft] = useState([]);
  const [ttPeriodTimetable, setTtPeriodTimetable] = useState(null);
  const [ttDaySaving, setTtDaySaving] = useState(false);
  const [ttDayEditMode, setTtDayEditMode] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchTeachers();
    fetchClassConfig();
    fetchStudents();
    fetchGlobalAssignedStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/api/students');
      setStudents(res.data);
    } catch {
      console.error('Failed to load students');
    }
  };

  const fetchGlobalAssignedStudents = async () => {
    try {
      const res = await api.get(`/api/classmapping/assigned-students/${getAcademicYear()}`);
      setGlobalAssignedStudentIds(res.data);
    } catch {
      console.error('Failed to load assigned students');
    }
  };

  const fetchClassConfig = async () => {
    try {
      const res = await api.get('/api/class-config');
      const { prefix, standardFormat, sectionFormat } = res.data;
      setClassConfig({ prefix: prefix || '', standardFormat: standardFormat || 'number', sectionFormat: sectionFormat || 'ABC' });
    } catch {
      // keep defaults
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(e.target)) {
        setSubjectDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/api/classes');
      setClasses(res.data);
    } catch {
      toast.error('Failed to load classes');
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/api/admin/subjects');
      const seen = new Set();
      setDbSubjects(res.data.filter((s) => {
        if (seen.has(s.name)) return false;
        seen.add(s.name);
        return true;
      }));
    } catch {
      console.error('Failed to load subjects');
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/api/teachers');
      setTeachers(res.data);
    } catch {
      console.error('Failed to load teachers');
    }
  };

  // ─── Class CRUD ──────────────────────────────────────────────────────────────

  const validateClass = () => {
    const errors = {};
    if (!classForm.section.trim()) errors.section = 'Section is required';
    if (!classForm.capacity) errors.capacity = 'Capacity is required';
    if (!classForm.roomNumber.trim()) errors.roomNumber = 'Room number is required';
    setClassErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    if (!validateClass()) return;
    setClassLoading(true);
    try {
      const name = buildClassName(classForm.standard, classConfig);
      const payload = {
        name,
        section: classForm.section,
        capacity: Number(classForm.capacity),
        roomNumber: classForm.roomNumber,
        subjects: classForm.subjects,
        staffId: classForm.staffId || undefined,
      };
      if (selectedClass) {
        await api.put(`/api/classes/${selectedClass._id}`, payload);
        toast.success('Class updated successfully!');
      } else {
        await api.post('/api/classes', payload);
        toast.success('Class added successfully!');
      }
      setShowClassModal(false);
      setSelectedClass(null);
      setClassForm(EMPTY_CLASS_FORM);
      setClassErrors({});
      fetchClasses();
    } catch {
      toast.error(selectedClass ? 'Failed to update class' : 'Failed to add class');
    } finally {
      setClassLoading(false);
    }
  };

  const handleEditClass = (cls) => {
    const standard = parseStandard(cls.name, classConfig);

    setSelectedClass(cls);
    setClassForm({
      standard,
      section: cls.section || '',
      capacity: cls.capacity || '',
      roomNumber: cls.roomNumber || '',
      subjects: cls.subjects || [],
      staffId: cls.classTeacher?._id || '',
    });
    setClassErrors({});
    setShowClassModal(true);
  };

  const handleDeleteClass = async (id) => {
    if (!globalThis.confirm('Are you sure you want to delete this class?')) return;
    try {
      await api.delete(`/api/classes/${id}`);
      toast.success('Class deleted successfully!');
      fetchClasses();
    } catch {
      toast.error('Failed to delete class');
    }
  };

  const toggleSubjectForClass = (subjectName) => {
    const updated = classForm.subjects.includes(subjectName)
      ? classForm.subjects.filter((s) => s !== subjectName)
      : [...classForm.subjects, subjectName];
    setClassForm({ ...classForm, subjects: updated });
  };

  // ─── Subject CRUD ─────────────────────────────────────────────────────────────

  const validateSubject = () => {
    const errors = {};
    if (!subjectForm.name.trim()) errors.name = 'Subject name is required';
    if (!subjectForm.code.trim()) errors.code = 'Subject code is required';
    setSubjectErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    if (!validateSubject()) return;
    setSubjectLoading(true);
    try {
      if (selectedSubject) {
        await api.put(`/api/admin/subjects/${selectedSubject._id}`, subjectForm);
        toast.success('Subject updated successfully!');
      } else {
        await api.post('/api/admin/subjects', subjectForm);
        toast.success('Subject added successfully!');
      }
      setShowSubjectModal(false);
      setSelectedSubject(null);
      setSubjectForm(EMPTY_SUBJECT_FORM);
      setSubjectErrors({});
      fetchSubjects();
    } catch {
      toast.error(selectedSubject ? 'Failed to update subject' : 'Failed to add subject');
    } finally {
      setSubjectLoading(false);
    }
  };

  const handleEditSubject = (subj) => {
    setSelectedSubject(subj);
    setSubjectForm({ name: subj.name || '', code: subj.code || '', description: subj.description || '' });
    setSubjectErrors({});
    setShowSubjectModal(true);
  };

  const handleDeleteSubject = async (id) => {
    if (!globalThis.confirm('Are you sure you want to delete this subject?')) return;
    try {
      await api.delete(`/api/admin/subjects/${id}`);
      toast.success('Subject deleted successfully!');
      fetchSubjects();
    } catch {
      toast.error('Failed to delete subject');
    }
  };

  // ─── Mapping ──────────────────────────────────────────────────────────────────

  const handleMappingClassChange = async (classId) => {
    setMappingClassId(classId);
    setMappingEditMode(false);
    if (!classId) { setMappingData(null); return; }
    try {
      const res = await api.get(`/api/classmapping/${classId}/${getAcademicYear()}`);
      const m = res.data;
      setMappingData({
        classTeacher: m.classTeacher || '',
        subjectTeachers: m.subjectTeachers ? Object.fromEntries(Object.entries(m.subjectTeachers)) : {},
        students: m.students ? m.students.map((s) => (typeof s === 'object' ? s._id : s)) : [],
      });
    } catch {
      setMappingData({ classTeacher: '', subjectTeachers: {}, students: [] });
    }
  };

  const handleStudentToggle = (studentId) => {
    setMappingData((prev) => {
      const current = prev?.students || [];
      const exists = current.some((id) => id.toString() === studentId.toString());
      return {
        ...prev,
        students: exists
          ? current.filter((id) => id.toString() !== studentId.toString())
          : [...current, studentId],
      };
    });
  };

  const handleSaveMapping = async () => {
    if (!mappingClassId) return;
    setMappingSaving(true);
    try {
      await api.post('/api/classmapping/save', {
        classId: mappingClassId,
        academicYear: getAcademicYear(),
        classTeacher: mappingData?.classTeacher || null,
        subjectTeachers: mappingData?.subjectTeachers || {},
        students: mappingData?.students || [],
      });
      toast.success('Class mapping saved!');
      setMappingEditMode(false);
      fetchClasses();
      fetchGlobalAssignedStudents();
    } catch {
      toast.error('Failed to save mapping');
    } finally {
      setMappingSaving(false);
    }
  };

  const mappingClassInfo = classes.find((c) => c._id === mappingClassId);

  // ─── Timetable ───────────────────────────────────────────────────────────────

  const handleTtPeriodClassChange = async (classId) => {
    setTtPeriodClassId(classId);
    setTtEditMode(false);
    setTtDayEditMode(false);
    if (!classId) { setPeriodConfig(null); setPeriodDraft([]); setTtPeriodTimetable(null); setDayDraft([]); return; }
    const configRes = await api.get(`/api/timetable/periods/${classId}/${getAcademicYear()}`);
    const ttRes = await api.get(`/api/timetable/${classId}/${getAcademicYear()}`);
    const config = configRes.data;
    const tt = ttRes.data;
    setPeriodConfig(config);
    setPeriodDraft(config.periods || []);
    setTtPeriodTimetable(tt);
    setDayDraft(initDayDraft(config.periods || [], tt, ttPeriodDay));
  };

  const handleAddPeriod = () => {
    const classCount = periodDraft.filter((p) => p.type === 'class').length;
    setPeriodDraft((prev) => [
      ...prev,
      { name: `Period ${classCount + 1}`, startTime: '09:00', endTime: '10:00', type: 'class', day: ttPeriodDay, subject: '', teacher: '' },
    ]);
  };

  const handleRemovePeriod = (i) => setPeriodDraft((prev) => prev.filter((_, idx) => idx !== i));

  const handlePeriodChange = (i, field, value) =>
    setPeriodDraft((prev) => prev.map((p, idx) => {
      if (idx !== i) return p;
      const updated = { ...p, [field]: value };
      if (field === 'subject') updated.teacher = '';
      if (field === 'type' && value !== 'class' && value !== 'lab' && value !== 'sports') {
        updated.subject = '';
        updated.teacher = null;
      }
      return updated;
    }));

  const handleSavePeriodConfig = async () => {
    setTtLoading(true);
    try {
      const res = await api.post('/api/timetable/periods', {
        classId: ttPeriodClassId,
        academicYear: getAcademicYear(),
        periods: periodDraft,
      });
      setPeriodConfig(res.data);
      setPeriodDraft(res.data.periods || []);
      setDayDraft(initDayDraft(res.data.periods || [], ttPeriodTimetable, ttPeriodDay));
      setTtEditMode(false);
      toast.success('Period configuration saved!');
    } catch {
      toast.error('Failed to save period configuration');
    } finally {
      setTtLoading(false);
    }
  };

  const handleTtPeriodDayChange = (day) => {
    setTtPeriodDay(day);
    setTtDayEditMode(false);
    setDayDraft(initDayDraft(periodDraft, ttPeriodTimetable, day));
  };

  const handleDayDraftChange = (i, field, value) => {
    setDayDraft((prev) => prev.map((entry, idx) => {
      if (idx !== i) return entry;
      const updated = { ...entry, [field]: value };
      if (field === 'subject') updated.teacher = '';
      return updated;
    }));
  };

  const handleSaveDaySchedule = async () => {
    setTtDaySaving(true);
    try {
      const daySchedule = (periodDraft || []).map((_, i) => ({
        periodIndex: i,
        subject: dayDraft[i]?.subject || '',
        teacher: dayDraft[i]?.teacher || null,
      }));
      const newSchedule = { ...(ttPeriodTimetable?.schedule || {}), [ttPeriodDay]: daySchedule };
      const res = await api.post('/api/timetable', {
        classId: ttPeriodClassId,
        academicYear: getAcademicYear(),
        schedule: newSchedule,
      });
      setTtPeriodTimetable(res.data);
      setTtDayEditMode(false);
      toast.success(`${ttPeriodDay} schedule saved!`);
    } catch {
      toast.error('Failed to save schedule');
    } finally {
      setTtDaySaving(false);
    }
  };

  const handleTtClassChange = async (classId) => {
    setTtClassId(classId);
    setTtScheduleEditMode(false);
    if (!classId) { setPeriodConfig(null); setTimetable(null); setScheduleDraft({}); return; }
    let config = null;
    try {
      const configRes = await api.get(`/api/timetable/periods/${classId}/${getAcademicYear()}`);
      config = configRes.data;
      setPeriodConfig(config);
    } catch {
      config = { periods: [] };
      setPeriodConfig(config);
    }
    try {
      const ttRes = await api.get(`/api/timetable/${classId}/${getAcademicYear()}`);
      setTimetable(ttRes.data);
      setScheduleDraft(initScheduleDraft(config?.periods || [], ttRes.data.schedule));
    } catch {
      setTimetable({ schedule: {} });
      setScheduleDraft(initScheduleDraft(config?.periods || [], {}));
    }
  };

  const handleScheduleChange = (day, i, value) => {
    setScheduleDraft((prev) => {
      const dayArr = [...(prev[day] || [])];
      dayArr[i] = value;
      return { ...prev, [day]: dayArr };
    });
  };

  const handleSaveTimetable = async () => {
    setTtLoading(true);
    try {
      const schedule = {};
      DAYS.forEach((day) => {
        schedule[day] = (periodConfig?.periods || []).map((_, i) => ({
          periodIndex: i,
          subject: scheduleDraft[day]?.[i] || '',
        }));
      });
      await api.post('/api/timetable', { classId: ttClassId, academicYear: getAcademicYear(), schedule });
      toast.success('Timetable saved!');
      setTtScheduleEditMode(false);
    } catch {
      toast.error('Failed to save timetable');
    } finally {
      setTtLoading(false);
    }
  };

  const assignedStudents = getAssignedStudents(mappingData, students);
  const unassignedStudents = getUnassignedStudents(mappingData, students, globalAssignedStudentIds);

  let classSubmitLabel = selectedClass ? 'Update Class' : 'Add Class';
  if (classLoading) classSubmitLabel = 'Saving...';

  let subjectSubmitLabel = selectedSubject ? 'Update Subject' : 'Add Subject';
  if (subjectLoading) subjectSubmitLabel = 'Saving...';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#0F172A]">Academic Management</h1>
          <p className="text-[#64748B] mt-1">Classes, Subjects, Timetable & Mapping</p>
        </div>
        {(activeTab === 'classes' || activeTab === 'subjects') && (
          <button
            onClick={() => {
              if (activeTab === 'classes') {
                setSelectedClass(null);
                setClassForm(EMPTY_CLASS_FORM);
                setClassErrors({});
                setShowClassModal(true);
              } else {
                setSelectedSubject(null);
                setSubjectForm(EMPTY_SUBJECT_FORM);
                setSubjectErrors({});
                setShowSubjectModal(true);
              }
            }}
            className="flex items-center gap-2 bg-[#4F46E5] text-white hover:bg-[#4338CA] px-6 py-3 rounded-lg font-semibold transition-all shadow-md"
          >
            <Plus size={20} />
            {activeTab === 'classes' ? 'Add Class' : 'Add Subject'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b-2 border-[#FCD34D]">
        {[
          { key: 'classes', label: 'Classes' },
          { key: 'subjects', label: 'Subjects' },
          { key: 'timetable', label: 'Timetable' },
          { key: 'mapping', label: 'Class Mapping' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-6 py-3 font-semibold transition-all ${activeTab === key
                ? 'bg-[#FCD34D] text-[#0F172A] rounded-t-lg'
                : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Classes Tab ── */}
      {activeTab === 'classes' && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
                <tr>
                  <th className="px-6 py-4 text-center text-xs font-bold text-[#0F172A] uppercase">S.No</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase">Class Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase">Section</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase">Class Teacher</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-[#0F172A] uppercase">Capacity</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase">Room</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-[#0F172A] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {classes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[#64748B]">
                      No classes found. Add your first class!
                    </td>
                  </tr>
                ) : (
                  classes.map((cls, index) => (
                    <tr key={cls._id} className="hover:bg-[#FFFBEB] transition-colors">
                      <td className="px-6 py-4 text-sm text-center text-[#64748B]">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#0F172A]">{cls.name}</td>
                      <td className="px-6 py-4 text-sm text-[#64748B]">{cls.section}</td>
                      <td className="px-6 py-4 text-sm text-[#64748B]">{cls.classTeacher?.name || '—'}</td>
                      <td className="px-6 py-4 text-sm text-center text-[#64748B]">{cls.capacity || '—'}</td>
                      <td className="px-6 py-4 text-sm text-[#64748B]">{cls.roomNumber || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEditClass(cls)} className="p-2 text-[#F59E0B] hover:bg-[#FEF3C7] rounded-lg transition-colors">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDeleteClass(cls._id)} className="p-2 text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Subjects Tab ── */}
      {activeTab === 'subjects' && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
                <tr>
                  <th className="px-6 py-4 text-center text-xs font-bold text-[#0F172A] uppercase">S.No</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase">Subject Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase">Code</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase">Description</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-[#0F172A] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dbSubjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#64748B]">
                      No subjects found. Add your first subject!
                    </td>
                  </tr>
                ) : (
                  dbSubjects.map((subj, index) => (
                    <tr key={subj._id} className="hover:bg-[#FFFBEB] transition-colors">
                      <td className="px-6 py-4 text-sm text-center text-[#64748B]">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#0F172A]">{subj.name}</td>
                      <td className="px-6 py-4 text-sm text-[#64748B] uppercase">{subj.code || '—'}</td>
                      <td className="px-6 py-4 text-sm text-[#64748B] capitalize">{subj.description || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEditSubject(subj)} className="p-2 text-[#F59E0B] hover:bg-[#FEF3C7] rounded-lg transition-colors">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDeleteSubject(subj._id)} className="p-2 text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Timetable Tab ── */}
      {activeTab === 'timetable' && (
        <div className="space-y-4">
          {/* Sub-tabs */}
          <div className="flex gap-1 border-b-2 border-[#FCD34D]">
            {[{ key: 'periods', label: 'Period Setup' }, { key: 'schedule', label: 'Weekly Schedule' }].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTtTab(key)}
                className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors ${ttTab === key ? 'bg-[#FCD34D] text-[#0F172A]' : 'text-[#64748B] hover:bg-[#FEF3C7] hover:text-[#0F172A]'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Period Setup ── */}
          {ttTab === 'periods' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <label htmlFor="tt-period-cls" className="text-sm font-medium text-[#0F172A]">Class:</label>
                  <select
                    id="tt-period-cls"
                    value={ttPeriodClassId}
                    onChange={(e) => handleTtPeriodClassChange(e.target.value)}
                    className="h-9 px-3 border-2 border-[#FCD34D] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>{cls.name} — Section {cls.section}</option>
                    ))}
                  </select>
                </div>
                {!ttEditMode && ttPeriodClassId && (
                  <button
                    type="button"
                    onClick={() => setTtEditMode(true)}
                    className="flex items-center gap-2 border-2 border-[#FCD34D] text-[#0F172A] hover:bg-[#FEF3C7] px-4 py-1.5 rounded-lg font-semibold text-sm transition-colors"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                )}
              </div>

              {ttPeriodClassId ? (
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border-2 border-[#FCD34D] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-linear-to-r from-[#FEF3C7] to-[#FEE2E2]">
                          <tr>
                            <th className="px-4 py-3 text-center text-xs font-bold text-[#0F172A] uppercase w-12">S.No</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Period Name</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Start Time</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">End Time</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Day</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Subject</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Teacher</th>
                            {ttEditMode && <th className="px-4 py-3 text-center text-xs font-bold text-[#0F172A] uppercase w-14">Del</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {periodDraft.length === 0 ? (
                            <tr>
                              <td colSpan={ttEditMode ? 9 : 8} className="px-4 py-10 text-center text-[#64748B]">
                                {ttEditMode ? 'Click "+ Add Period" below to start.' : 'No periods configured. Click Edit to add.'}
                              </td>
                            </tr>
                          ) : (
                            periodDraft.map((p, i) => {
                              const typeInfo = PERIOD_TYPES.find((t) => t.value === p.type) || PERIOD_TYPES[0];
                              const subjectOptions = classes.find((c) => c._id === ttPeriodClassId)?.subjects || [];
                              const filteredTeachers = teachers.filter((t) => t.subjects?.includes(p.subject));
                              return (
                                <tr key={i} className={`${typeInfo.rowBg} transition-all`}>
                                  <td className="px-4 py-3 text-sm text-center text-[#64748B]">{i + 1}</td>
                                  <td className="px-4 py-3">
                                    {ttEditMode ? (
                                      <input type="text" value={p.name} onChange={(e) => handlePeriodChange(i, 'name', e.target.value)} className="w-full h-8 px-2 border border-[#FCD34D] rounded text-sm focus:outline-none" />
                                    ) : (
                                      <span className="text-sm font-medium text-[#0F172A]">{p.name}</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    {ttEditMode ? (
                                      <input type="time" value={p.startTime} onChange={(e) => handlePeriodChange(i, 'startTime', e.target.value)} className="h-8 px-2 border border-[#FCD34D] rounded text-sm focus:outline-none" />
                                    ) : (
                                      <span className="text-sm text-[#64748B]">{p.startTime}</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    {ttEditMode ? (
                                      <input type="time" value={p.endTime} onChange={(e) => handlePeriodChange(i, 'endTime', e.target.value)} className="h-8 px-2 border border-[#FCD34D] rounded text-sm focus:outline-none" />
                                    ) : (
                                      <span className="text-sm text-[#64748B]">{p.endTime}</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    {ttEditMode ? (
                                      <select value={p.day || 'Monday'} onChange={(e) => handlePeriodChange(i, 'day', e.target.value)} className="h-8 px-2 border border-[#FCD34D] rounded text-sm focus:outline-none">
                                        {DAYS.map((d) => <option key={d} value={d}>{d.slice(0, 3)}</option>)}
                                      </select>
                                    ) : (
                                      <span className="text-sm text-[#64748B]">{p.day || 'Monday'}</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    {ttEditMode ? (
                                      <select value={p.type} onChange={(e) => handlePeriodChange(i, 'type', e.target.value)} className="h-8 px-2 border border-[#FCD34D] rounded text-sm focus:outline-none">
                                        {PERIOD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                      </select>
                                    ) : (
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.badge}`}>{typeInfo.label}</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    {p.type === 'class' || p.type === 'lab' || p.type === 'sports' ? (
                                      ttEditMode ? (
                                        <select value={p.subject || ''} onChange={(e) => handlePeriodChange(i, 'subject', e.target.value)} className="h-8 px-2 border border-[#FCD34D] rounded text-sm focus:outline-none">
                                          <option value="">Select Subject</option>
                                          {subjectOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                      ) : (
                                        <span className="text-sm text-[#64748B]">{p.subject || '-'}</span>
                                      )
                                    ) : (
                                      <span className="text-sm text-[#94A3B8]">—</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    {p.type === 'class' || p.type === 'lab' || p.type === 'sports' ? (
                                      ttEditMode ? (
                                        <select value={p.teacher || ''} onChange={(e) => handlePeriodChange(i, 'teacher', e.target.value)} className="h-8 px-2 border border-[#FCD34D] rounded text-sm focus:outline-none" disabled={!p.subject}>
                                          <option value="">{p.subject ? 'Select Teacher' : 'Select subject first'}</option>
                                          {filteredTeachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                                        </select>
                                      ) : (
                                        <span className="text-sm text-[#64748B]">{teachers.find((t) => t._id === p.teacher)?.name || '-'}</span>
                                      )
                                    ) : (
                                      <span className="text-sm text-[#94A3B8]">—</span>
                                    )}
                                  </td>
                                  {ttEditMode && (
                                    <td className="px-4 py-3 text-center">
                                      <button type="button" onClick={() => handleRemovePeriod(i)} className="text-[#DC2626] hover:text-red-700 p-1"><X size={15} /></button>
                                    </td>
                                  )}
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                    {ttEditMode && (
                      <div className="px-4 py-4 border-t-2 border-[#FCD34D] flex items-center justify-between flex-wrap gap-3">
                        <button type="button" onClick={handleAddPeriod} className="flex items-center gap-2 border-2 border-dashed border-[#FCD34D] text-[#F59E0B] hover:bg-[#FEF3C7] px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                          <Plus size={15} />
                          Add Period
                        </button>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => { setPeriodDraft(periodConfig?.periods || []); setTtEditMode(false); }} className="border-2 border-gray-300 text-[#64748B] hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                            Cancel
                          </button>
                          <button type="button" onClick={handleSavePeriodConfig} disabled={ttLoading} className="flex items-center gap-2 bg-[#F59E0B] text-white hover:bg-[#D97706] px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
                            <Save size={14} />
                            {ttLoading ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {periodDraft.length > 0 && !ttEditMode && (
                    <div className="bg-white rounded-xl border-2 border-[#FCD34D] shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between px-4 pt-3 pb-0 border-b-2 border-[#FCD34D]">
                        <div className="flex items-center gap-1 overflow-x-auto">
                          {DAYS.map((day) => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => handleTtPeriodDayChange(day)}
                              className={`px-4 py-2 text-xs font-semibold rounded-t-lg whitespace-nowrap transition-colors ${ttPeriodDay === day ? 'bg-[#FCD34D] text-[#0F172A]' : 'text-[#64748B] hover:bg-[#FEF3C7] hover:text-[#0F172A]'
                                }`}
                            >
                              {day.slice(0, 3)}
                            </button>
                          ))}
                        </div>
                        {!ttDayEditMode && (
                          <button type="button" onClick={() => setTtDayEditMode(true)} className="flex items-center gap-1.5 border-2 border-[#FCD34D] text-[#0F172A] hover:bg-[#FEF3C7] px-3 py-1 rounded-lg text-xs font-semibold transition-colors mb-0.5 shrink-0">
                            <Pencil size={11} />
                            Edit
                          </button>
                        )}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-linear-to-r from-[#FEF3C7] to-[#FEE2E2]">
                            <tr>
                              <th className="px-4 py-3 text-center text-xs font-bold text-[#0F172A] uppercase w-12">S.No</th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Period Name</th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Time</th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Type</th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Subject</th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Teacher</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {periodDraft.filter((p) => (p.day || 'Monday') === ttPeriodDay).map((p) => {
                              const actualIndex = periodDraft.indexOf(p);
                              const typeInfo = PERIOD_TYPES.find((t) => t.value === p.type) || PERIOD_TYPES[0];
                              const needsAssignment = p.type === 'class' || p.type === 'lab';
                              const entry = dayDraft[actualIndex] || { subject: '', teacher: '' };
                              const subjectOptions = classes.find((c) => c._id === ttPeriodClassId)?.subjects || [];
                              return (
                                <tr key={actualIndex} className={`${typeInfo.rowBg} transition-all`}>
                                  <td className="px-4 py-3 text-sm text-center text-[#64748B]">{actualIndex + 1}</td>
                                  <td className="px-4 py-3 text-sm font-medium text-[#0F172A]">{p.name}</td>
                                  <td className="px-4 py-3 text-sm text-[#64748B]">{p.startTime}–{p.endTime}</td>
                                  <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.badge}`}>{typeInfo.label}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    {needsAssignment && ttDayEditMode ? (
                                      <select value={entry.subject} onChange={(e) => handleDayDraftChange(actualIndex, 'subject', e.target.value)} className="h-8 px-2 border border-[#FCD34D] rounded text-sm focus:outline-none">
                                        <option value="">Select Subject</option>
                                        {subjectOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                                      </select>
                                    ) : (
                                      <span className={`text-sm ${entry.subject ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`}>{entry.subject || '—'}</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    {needsAssignment && ttDayEditMode ? (
                                      <select value={entry.teacher} onChange={(e) => handleDayDraftChange(actualIndex, 'teacher', e.target.value)} className="h-8 px-2 border border-[#FCD34D] rounded text-sm focus:outline-none" disabled={!entry.subject}>
                                        <option value="">{entry.subject ? 'Select Teacher' : 'Select subject first'}</option>
                                        {teachers.filter((t) => t.subjects?.includes(entry.subject)).map((t) => (
                                          <option key={t._id} value={t._id}>{t.name}</option>
                                        ))}
                                      </select>
                                    ) : (
                                      <span className={`text-sm ${entry.teacher ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`}>
                                        {entry.teacher ? (teachers.find((t) => t._id?.toString() === entry.teacher)?.name || '—') : '—'}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      {ttDayEditMode && (
                        <div className="px-4 py-4 border-t-2 border-[#FCD34D] flex items-center justify-end gap-3">
                          <button type="button" onClick={() => { setDayDraft(initDayDraft(periodDraft, ttPeriodTimetable, ttPeriodDay)); setTtDayEditMode(false); }} className="border-2 border-gray-300 text-[#64748B] hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                            Cancel
                          </button>
                          <button type="button" onClick={handleSaveDaySchedule} disabled={ttDaySaving} className="flex items-center gap-2 bg-[#F59E0B] text-white hover:bg-[#D97706] px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
                            <Save size={14} />
                            {ttDaySaving ? 'Saving...' : `Save ${ttPeriodDay}`}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-12 text-center text-[#64748B]">
                  <p>Select a class to view or configure its period schedule</p>
                </div>
              )}
            </div>
          )}

          {/* ── Weekly Schedule ── */}
          {ttTab === 'schedule' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <label htmlFor="tt-cls" className="text-sm font-medium text-[#0F172A]">Class:</label>
                  <select
                    id="tt-cls"
                    value={ttClassId}
                    onChange={(e) => handleTtClassChange(e.target.value)}
                    className="h-9 px-3 border-2 border-[#FCD34D] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>{cls.name} — Section {cls.section}</option>
                    ))}
                  </select>
                </div>
              </div>

              {ttClassId && periodConfig?.periods?.length > 0 ? (
                <div className="bg-white rounded-xl border-2 border-[#FCD34D] shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-linear-to-r from-[#FEF3C7] to-[#FEE2E2]">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-[#0F172A] uppercase min-w-28">Day</th>
                          {periodConfig.periods.map((p, i) => {
                            const typeInfo = PERIOD_TYPES.find((t) => t.value === p.type) || PERIOD_TYPES[0];
                            return (
                              <th key={i} className={`px-4 py-3 text-center text-xs font-bold text-[#0F172A] uppercase min-w-32 ${typeInfo.rowBg}`}>
                                {p.name}
                                <div className="text-[10px] font-normal text-[#64748B] mt-0.5">{p.startTime}–{p.endTime}</div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {DAYS.map((day) => (
                          <tr key={day} className="hover:bg-[#FFFBEB]">
                            <td className="px-4 py-3 font-semibold text-sm text-[#0F172A]">{day}</td>
                            {periodConfig.periods.map((p, i) => {
                              const typeInfo = PERIOD_TYPES.find((t) => t.value === p.type) || PERIOD_TYPES[0];
                              if (p.type !== 'class' && p.type !== 'lab') {
                                return (
                                  <td key={i} className={`px-3 py-3 text-center text-xs font-semibold text-[#64748B] ${typeInfo.rowBg}`}>
                                    {typeInfo.label}
                                  </td>
                                );
                              }
                              const entry = timetable?.schedule?.[day]?.[i];
                              const subj = entry?.subject || '—';
                              const teacherName = entry?.teacher
                                ? (teachers.find((t) => t._id?.toString() === entry.teacher?.toString())?.name || '—')
                                : '—';
                              if (p.type === 'lab') {
                                return (
                                  <td key={i} className={`px-3 py-3 text-center text-xs ${typeInfo.rowBg}`}>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.badge}`}>{typeInfo.label}</span>
                                    {entry?.subject && <div className="text-[#0F172A] text-xs mt-1">{subj}</div>}
                                    {entry?.subject && <div className="text-[#64748B] text-xs">{teacherName}</div>}
                                  </td>
                                );
                              }
                              return (
                                <td key={i} className="px-3 py-3 text-center">
                                  <div className="text-sm font-medium text-[#0F172A]">{subj}</div>
                                  {entry?.subject && <div className="text-xs text-[#64748B] mt-0.5">{teacherName}</div>}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : ttClassId ? (
                <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-8 text-center text-[#64748B]">
                  <p className="font-medium">No period configuration found for this class.</p>
                  <p className="text-sm mt-1">Set up period times in the "Period Setup" tab first.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-12 text-center text-[#64748B]">
                  <p>Select a class to view or edit its weekly schedule</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Mapping Tab ── */}
      {activeTab === 'mapping' && (
        <div className="space-y-6">
          {/* Class selector */}
          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="m-class" className="block text-sm font-medium text-[#0F172A] mb-2">Select Class *</label>
                <select
                  id="m-class"
                  value={mappingClassId}
                  onChange={(e) => handleMappingClassChange(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name} — Section {cls.section}{cls.capacity ? ` (Capacity: ${cls.capacity})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setMappingEditMode(!mappingEditMode)}
                  disabled={!mappingClassId}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${mappingEditMode
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-[#4F46E5] hover:bg-[#4338CA] text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {mappingEditMode ? 'View Mode' : 'Edit Mode'}
                </button>
              </div>
            </div>
          </div>

          {mappingClassId ? (
            <>
              {/* Student Assignment */}
              <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-[#0F172A] mb-4">
                  Student Assignment ({assignedStudents.length}/{mappingClassInfo?.capacity || '—'})
                </h3>
                {mappingEditMode ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-[#64748B] mb-3">Available Students</p>
                      <div className="border-2 border-gray-200 rounded-lg p-3 h-64 overflow-y-auto">
                        {unassignedStudents.length === 0 ? (
                          <div className="text-center text-[#64748B] py-8">
                            <Users className="mx-auto mb-2 text-gray-400" size={32} />
                            <p className="text-sm">No available students</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {unassignedStudents.map((student) => (
                              <label key={student._id} className="flex items-center gap-3 p-2 hover:bg-[#FFFBEB] rounded-lg cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={false}
                                  onChange={() => handleStudentToggle(student._id)}
                                  className="accent-[#4F46E5] h-4 w-4"
                                />
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-[#0F172A]">{student.name}</div>
                                  {student.rollNumber && <div className="text-xs text-[#64748B]">Roll No: {student.rollNumber}</div>}
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#64748B] mb-3">Assigned Students</p>
                      <div className="border-2 border-green-200 rounded-lg p-3 h-64 overflow-y-auto bg-green-50">
                        {assignedStudents.length === 0 ? (
                          <div className="text-center text-[#64748B] py-8">
                            <Users className="mx-auto mb-2 text-gray-400" size={32} />
                            <p className="text-sm">No students assigned</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {assignedStudents.map((student) => (
                              <div key={student._id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-green-300">
                                <div>
                                  <div className="text-sm font-medium text-[#0F172A]">{student.name}</div>
                                  {student.rollNumber && <div className="text-xs text-[#64748B]">Roll No: {student.rollNumber}</div>}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleStudentToggle(student._id)}
                                  className="text-[#DC2626] hover:text-red-700 p-1"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    {assignedStudents.length === 0 ? (
                      <div className="text-center text-[#64748B] py-8">
                        <Users className="mx-auto mb-4 text-gray-400" size={48} />
                        <p className="text-lg font-medium">No students assigned to this class</p>
                        <p className="text-sm mt-1">Switch to edit mode to assign students</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {assignedStudents.map((student) => (
                          <div key={student._id} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="h-10 w-10 rounded-full bg-[#4F46E5] flex items-center justify-center text-white font-semibold mr-3 text-sm shrink-0">
                              {student.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-[#0F172A]">{student.name}</div>
                              {student.rollNumber && <div className="text-xs text-[#64748B]">Roll No: {student.rollNumber}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {mappingEditMode && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveMapping}
                    disabled={mappingSaving}
                    className="bg-[#4F46E5] text-white hover:bg-[#4338CA] px-6 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
                  >
                    {mappingSaving ? 'Saving...' : 'Save Class Mapping'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-12 text-center">
              <Users className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-lg font-medium text-[#64748B]">Select a class to manage mapping</p>
              <p className="text-sm text-[#64748B] mt-1">Choose a class from the dropdown above to assign teachers and students</p>
            </div>
          )}
        </div>
      )}

      {/* ── Add/Edit Class Modal ── */}
      {showClassModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-6">
              {selectedClass ? 'Edit Class' : 'Add New Class'}
            </h2>
            <form onSubmit={handleClassSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="c-standard" className="block text-sm font-medium text-[#0F172A] mb-2">Standard *</label>
                  <select
                    id="c-standard"
                    value={classForm.standard}
                    onChange={(e) => setClassForm({ ...classForm, standard: e.target.value })}
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  >
                    {STANDARDS.map((s) => (
                      <option key={s} value={s}>{formatStandard(s, classConfig.standardFormat)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="c-section" className="block text-sm font-medium text-[#0F172A] mb-2">Section *</label>
                  <input
                    id="c-section"
                    type="text"
                    value={classForm.section}
                    onChange={(e) => { setClassForm({ ...classForm, section: e.target.value }); setClassErrors({ ...classErrors, section: '' }); }}
                    placeholder="e.g., A"
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />
                  {classErrors.section && <p className="text-red-500 text-xs mt-1">{classErrors.section}</p>}
                </div>

                <div>
                  <label htmlFor="c-capacity" className="block text-sm font-medium text-[#0F172A] mb-2">Capacity *</label>
                  <input
                    id="c-capacity"
                    type="number"
                    min="1"
                    value={classForm.capacity}
                    onChange={(e) => { setClassForm({ ...classForm, capacity: e.target.value }); setClassErrors({ ...classErrors, capacity: '' }); }}
                    placeholder="e.g., 40"
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />
                  {classErrors.capacity && <p className="text-red-500 text-xs mt-1">{classErrors.capacity}</p>}
                </div>

                <div>
                  <label htmlFor="c-room" className="block text-sm font-medium text-[#0F172A] mb-2">Room Number *</label>
                  <input
                    id="c-room"
                    type="text"
                    value={classForm.roomNumber}
                    onChange={(e) => { setClassForm({ ...classForm, roomNumber: e.target.value }); setClassErrors({ ...classErrors, roomNumber: '' }); }}
                    placeholder="e.g., Room 101"
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />
                  {classErrors.roomNumber && <p className="text-red-500 text-xs mt-1">{classErrors.roomNumber}</p>}
                </div>

                <div>
                  <label htmlFor="c-teacher" className="block text-sm font-medium text-[#0F172A] mb-2">Class Teacher</label>
                  <select
                    id="c-teacher"
                    value={classForm.staffId}
                    onChange={(e) => setClassForm({ ...classForm, staffId: e.target.value })}
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  >
                    <option value="">Select Teacher</option>
                    {teachers
                      .filter((t) => {
                        const isAssignedToOtherClass = classes.some(
                          (cls) => cls.classTeacher?._id === t._id && cls._id !== selectedClass?._id
                        );
                        return !isAssignedToOtherClass;
                      })
                      .map((t) => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Subjects</label>
                  <div className="relative" ref={subjectDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setSubjectDropdownOpen((o) => !o)}
                      className="w-full min-h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg cursor-pointer flex flex-wrap gap-1 items-center focus:outline-none text-left"
                    >
                      {classForm.subjects.length === 0 ? (
                        <span className="text-gray-400 text-sm">Select subjects...</span>
                      ) : (
                        classForm.subjects.map((s) => (
                          <span key={s} className="flex items-center gap-1 bg-[#FEF3C7] text-[#0F172A] text-xs px-2 py-0.5 rounded-full">
                            {s}
                            <button
                              type="button"
                              onClick={(ev) => { ev.stopPropagation(); toggleSubjectForClass(s); }}
                              className="hover:text-[#DC2626]"
                            >
                              <X size={10} />
                            </button>
                          </span>
                        ))
                      )}
                      <ChevronDown size={16} className="ml-auto text-gray-400 shrink-0" />
                    </button>
                    {subjectDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white border-2 border-[#FCD34D] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {dbSubjects.length === 0 ? (
                          <p className="px-4 py-3 text-sm text-gray-500">No subjects found. Add subjects first.</p>
                        ) : (
                          dbSubjects.map((subj) => (
                            <label key={subj._id} className="flex items-center gap-3 px-4 py-2 hover:bg-[#FFFBEB] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={classForm.subjects.includes(subj.name)}
                                onChange={() => toggleSubjectForClass(subj.name)}
                                className="accent-[#F59E0B]"
                              />
                              <span className="text-sm text-[#0F172A]">{subj.name}</span>
                            </label>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t-2 border-[#FCD34D]">
                <button
                  type="button"
                  onClick={() => { setShowClassModal(false); setClassErrors({}); }}
                  className="flex-1 bg-gray-200 text-[#0F172A] hover:bg-gray-300 h-10 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={classLoading}
                  className="flex-1 bg-[#4F46E5] text-white hover:bg-[#4338CA] h-10 px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {classSubmitLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add/Edit Subject Modal ── */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-6">
              {selectedSubject ? 'Edit Subject' : 'Add New Subject'}
            </h2>
            <form onSubmit={handleSubjectSubmit} className="space-y-4">
              <div>
                <label htmlFor="sj-name" className="block text-sm font-medium text-[#0F172A] mb-2">Subject Name *</label>
                <input
                  id="sj-name"
                  type="text"
                  value={subjectForm.name}
                  onChange={(e) => { setSubjectForm({ ...subjectForm, name: e.target.value }); setSubjectErrors({ ...subjectErrors, name: '' }); }}
                  placeholder="e.g., Mathematics"
                  className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                />
                {subjectErrors.name && <p className="text-red-500 text-xs mt-1">{subjectErrors.name}</p>}
              </div>
              <div>
                <label htmlFor="sj-code" className="block text-sm font-medium text-[#0F172A] mb-2">Subject Code *</label>
                <input
                  id="sj-code"
                  type="text"
                  value={subjectForm.code}
                  onChange={(e) => { setSubjectForm({ ...subjectForm, code: e.target.value }); setSubjectErrors({ ...subjectErrors, code: '' }); }}
                  placeholder="e.g., MATH101"
                  className="uppercase w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                />
                {subjectErrors.code && <p className="text-red-500 text-xs mt-1">{subjectErrors.code}</p>}
              </div>
              <div>
                <label htmlFor="sj-desc" className="block text-sm font-medium text-[#0F172A] mb-2">Description</label>
                <input
                  id="sj-desc"
                  type="text"
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                  placeholder="Brief description"
                  className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t-2 border-[#FCD34D]">
                <button
                  type="button"
                  onClick={() => { setShowSubjectModal(false); setSubjectErrors({}); }}
                  className="flex-1 bg-gray-200 text-[#0F172A] hover:bg-gray-300 h-10 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={subjectLoading}
                  className="flex-1 bg-[#4F46E5] text-white hover:bg-[#4338CA] h-10 px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {subjectSubmitLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;
