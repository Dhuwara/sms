import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { toast } from 'sonner';
import {
  User, Calendar, BookOpen, Users, FileText, ClipboardCheck,
  MessageSquare, DollarSign, FileQuestion, Book, Award, Settings,
  Clock, CheckCircle, XCircle, Bell, Mail, Download, Upload,
  Star, HelpCircle, LogOut, ChevronRight, Building, Briefcase, Check, CalendarDays
} from 'lucide-react';

const StaffDashboard = ({ user, module = 'profile' }) => {

  const [staffData, setStaffData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [contactForm, setContactForm] = useState({ contact: '' });
  const [submitting, setSubmitting] = useState(false);
  const [classDetail, SetClassDetail] = useState(null);
  const [selectedClassForStudents, setSelectedClassForStudents] = useState('');
  const [classStudents, setClassStudents] = useState([]);
  const [schoolEvents, setSchoolEvents] = useState([]);

  // Attendance & Leave State
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({ casual: { total: 15, used: 0, remaining: 15 }, sick: { total: 5, used: 0, remaining: 5 } });
  const [myLeaves, setMyLeaves] = useState([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ leaveType: 'casual', startDate: '', endDate: '', reason: '', approvers: [] });
  const [staffList, setStaffList] = useState([]);
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState([]);

  // Attendance Marking State (for Class & Student Management)
  const [showMarkAttendanceModal, setShowMarkAttendanceModal] = useState(false);
  const [attendanceClassId, setAttendanceClassId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStudents, setAttendanceStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Timetable & Scheduling State
  const [myTimetable, setMyTimetable] = useState([]);
  const [substitutions, setSubstitutions] = useState([]);
  const [examDuties, setExamDuties] = useState([]);

  // Payroll State
  const [latestSalary, setLatestSalary] = useState(null);
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [reimbursements, setReimbursements] = useState([]);
  const [showReimbursementModal, setShowReimbursementModal] = useState(false);
  const [reimbursementForm, setReimbursementForm] = useState({ title: '', amount: '', description: '' });
  const [reimbursementSubmitting, setReimbursementSubmitting] = useState(false);

  // Documents State
  const [documents, setDocuments] = useState([]);

  // Communication State
  const [commClasses, setCommClasses] = useState([]);
  const [commContacts, setCommContacts] = useState([]);
  const [commForm, setCommForm] = useState({ classId: '', messageTo: 'all_parents', selectedParentIdx: '', messageType: 'announcement', sendVia: 'whatsapp', message: '' });
  const [commSending, setCommSending] = useState(false);
  const [commAnnouncements, setCommAnnouncements] = useState([]);

  // Lesson Plans State
  const [lessonPlans, setLessonPlans] = useState([]);
  const [showLessonPlanModal, setShowLessonPlanModal] = useState(false);
  const [lessonPlanForm, setLessonPlanForm] = useState({ title: '', classId: '', subject: '', date: '', file: null });
  const [lessonPlanSubmitting, setLessonPlanSubmitting] = useState(false);

  // Academic class selection
  const [selectedAcademicClass, setSelectedAcademicClass] = useState('');
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [classHomework, setClassHomework] = useState([]);
  const [showStudyMaterialModal, setShowStudyMaterialModal] = useState(false);
  const [studyMaterialForm, setStudyMaterialForm] = useState({ title: '', subject: '', description: '', file: null });
  const [studyMaterialSubmitting, setStudyMaterialSubmitting] = useState(false);
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [homeworkForm, setHomeworkForm] = useState({ title: '', description: '', subject: '', dueDate: '', files: [], classId: '' });
  const [homeworkSubmitting, setHomeworkSubmitting] = useState(false);
  const [classSubjects, setClassSubjects] = useState([]);

  // Marks & Assessment State
  const [timetableAssignments, setTimetableAssignments] = useState([]);
  const [marksClassId, setMarksClassId] = useState('');
  const [marksExams, setMarksExams] = useState([]);
  const [marksExamId, setMarksExamId] = useState('');
  const [marksStudents, setMarksStudents] = useState([]);
  const [marksEntries, setMarksEntries] = useState({}); // { studentId: marks string }
  const [marksLoading, setMarksLoading] = useState(false);
  const [marksSaving, setMarksSaving] = useState(false);
  const [marksLoaded, setMarksLoaded] = useState(false);
  const [marksAnalysis, setMarksAnalysis] = useState(null);

  // Real-time performance analysis calculation
  const calculatePerformanceAnalysis = (entries, students, maxScore, exam) => {
    const validEntries = Object.entries(entries).filter(([_, marks]) => marks && marks.trim() !== '');
    
    if (validEntries.length === 0) {
      setMarksAnalysis(null);
      return;
    }

    const values = validEntries.map(([_, marks]) => parseFloat(marks)).filter(m => !isNaN(m));
    
    if (values.length === 0) {
      setMarksAnalysis(null);
      return;
    }

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const highest = Math.max(...values);
    const lowest = Math.min(...values);
    const highestStudentId = validEntries.find(([_, marks]) => parseFloat(marks) === highest)?.[0];
    const highestStudent = students.find(s => s._id === highestStudentId);
    const passCount = values.filter(m => (m / maxScore) * 100 >= 35).length;
    const gradeDist = {};
    values.forEach(m => {
      const g = marksCalcGrade(m, maxScore);
      gradeDist[g] = (gradeDist[g] || 0) + 1;
    });

    setMarksAnalysis({
      avg: avg.toFixed(1),
      avgPct: ((avg / maxScore) * 100).toFixed(1),
      highest,
      highestStudentName: highestStudent?.name || '—',
      lowest,
      passCount,
      total: values.length,
      passRate: ((passCount / values.length) * 100).toFixed(0),
      maxScore,
      gradeDist,
      subject: exam?.subject || '',
      examType: exam?.examType || '',
    });
  };

  // Request tracking to prevent duplicate simultaneous requests
  const fetchingRef = useRef({
    today: false,
    history: false,
    balance: false,
    leaves: false,
    staff: false,
    timetable: false,
    substitutions: false,
    examDuties: false,
    approvals: false,
    salary: false,
    payrollHistory: false,
    reimbursements: false,
    documents: false,
    lessonPlans: false
  });

  useEffect(() => {
    fetchStaffData();
  }, [user?.id]);

  useEffect(() => {
    if (module === 'attendance') {
      // Reset request tracking flags to allow fresh fetch
      fetchingRef.current = { ...fetchingRef.current, today: false, history: false, balance: false, leaves: false, staff: false };

      fetchTodayAttendance();
      fetchAttendanceHistory();
      fetchLeaveBalance();
      fetchMyLeaves();
      fetchStaffList();
    }
  }, [module]);

  useEffect(() => {
    if (module === 'timetable') {
      // Reset request tracking flags
      fetchingRef.current = { ...fetchingRef.current, timetable: false, substitutions: false, examDuties: false };

      fetchMyTimetable();
      fetchSubstitutions();
      fetchExamDuties();
    }
    if (module === 'leave') {
      fetchingRef.current = { ...fetchingRef.current, balance: false, leaves: false, staff: false, approvals: false };
      fetchLeaveBalance();
      fetchMyLeaves();
      fetchStaffList();
      fetchPendingApprovals();
    }
    if (module === 'payroll') {
      fetchingRef.current = { ...fetchingRef.current, salary: false, payrollHistory: false, reimbursements: false };
      fetchLatestSalary();
      fetchPayrollHistory();
      fetchReimbursements();
    }
    if (module === 'documents') {
      fetchingRef.current = { ...fetchingRef.current, documents: false };
      fetchDocuments();
    }
    if (module === 'academic') {
      fetchingRef.current = { ...fetchingRef.current, lessonPlans: false, examDuties: false };
      fetchExamDuties();
      // Fetch all (no class filter) initially; class-filtered fetch triggered by selectedAcademicClass
      fetchLessonPlans();
      fetchStudyMaterials('');
      fetchClassHomework('');
    }
    if (module === 'marks') {
      api.get('/api/staff/timetable-assignments')
        .then(res => setTimetableAssignments(res.data || []))
        .catch(() => toast.error('Failed to load timetable assignments'));
    }
    if (module === 'communication') {
      fetchCommClasses();
      fetchAnnouncements();
      fetchSchoolEvents();
    }
  }, [module]);

  // Re-fetch academic content when selected class changes
  useEffect(() => {
    if (module !== 'academic') return;
    fetchingRef.current._academicClassId = selectedAcademicClass;
    fetchingRef.current.lessonPlans = false;
    fetchLessonPlans();
    fetchStudyMaterials(selectedAcademicClass);
    fetchClassHomework(selectedAcademicClass);
    fetchClassSubjects(selectedAcademicClass);
  }, [selectedAcademicClass]); // eslint-disable-line react-hooks/exhaustive-deps

  // Set default selected class when classDetail or staffData is loaded
  useEffect(() => {
    if (classDetail && staffData && !selectedClassForStudents) {
      const ctClasses = classDetail.filter(c => c.staffId === staffData._id);
      if (ctClasses.length > 0) {
        setSelectedClassForStudents(ctClasses[0]._id);
      }
    }
  }, [classDetail, staffData, selectedClassForStudents]);

  // Fetch students when the selected class changes
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClassForStudents) {
        setClassStudents([]);
        return;
      }
      try {
        const response = await api.get(`/api/staff/classes/${selectedClassForStudents}/students`);
        setClassStudents(response.data || []);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load students');
      }
    };
    fetchStudents();
  }, [selectedClassForStudents]);

  // Fetch homework for selected class when in Classes module
  useEffect(() => {
    if (module === 'classes' && selectedClassForStudents) {
      fetchClassHomework(selectedClassForStudents);
    }
  }, [module, selectedClassForStudents]);

  const fetchStaffData = async () => {
    if (!user?.id) return;
    try {
      const response = await api.get(`/api/staff/profile/${user.id}`);
      const classResponse = await api.get(`/api/staff/classes/`);
      SetClassDetail(classResponse.data);
      setStaffData(response.data);
      setContactForm({ contact: response.data?.contact || '' });
      
    } catch (error) {
      console.error('Error fetching staff data:', error);
      toast.error('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/api/staff/change-password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    if (!contactForm.contact) {
      toast.error('Please enter contact information');
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/api/staff/update-profile`, { contact: contactForm.contact });
      toast.success('Contact information updated successfully');
      setShowContactModal(false);
      fetchStaffData();
    } catch (error) {
      toast.error('Failed to update contact information');
    } finally {
      setSubmitting(false);
    }
  };

  // Attendance & Leave Functions
  const fetchTodayAttendance = async () => {
    if (fetchingRef.current.today) return;
    fetchingRef.current.today = true;
    try {
      const response = await api.get('/api/staff/my-attendance/today');
      // Handle different response formats
      const attendanceData = response.data?.data || response.data || null;
      setTodayAttendance(attendanceData);
    } catch (error) {
      console.error('Error fetching today attendance:', error);
      setTodayAttendance(null);
    } finally {
      fetchingRef.current.today = false;
    }
  };

  const fetchAttendanceHistory = async () => {
    if (fetchingRef.current.history) return;
    fetchingRef.current.history = true;
    try {
      const response = await api.get('/api/staff/my-attendance/history');
      setAttendanceHistory(response?.data || []);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
    } finally {
      fetchingRef.current.history = false;
    }
  };

  const fetchLeaveBalance = async () => {
    if (fetchingRef.current.balance) return;
    fetchingRef.current.balance = true;
    try {
      const response = await api.get('/api/staff/my-leaves/balance');
      setLeaveBalance(response?.data || { casual: { total: 15, used: 0, remaining: 15 }, sick: { total: 5, used: 0, remaining: 5 } });
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    } finally {
      fetchingRef.current.balance = false;
    }
  };

  const fetchMyLeaves = async () => {
    // Skip if already fetching to prevent duplicate requests
    if (fetchingRef.current.leaves) return;

    fetchingRef.current.leaves = true;
    try {
      const response = await api.get('/api/staff/my-leaves');
      setMyLeaves(response?.data || []);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      fetchingRef.current.leaves = false;
    }
  };

  const fetchStaffList = async () => {
    // Skip if already fetching
    if (fetchingRef.current.staff) return;

    fetchingRef.current.staff = true;
    try {
      const response = await api.get('/api/staff/approvers');
      const staffData = response.data?.data || response.data || [];
      setStaffList(Array.isArray(staffData) ? staffData : []);
    } catch (error) {
      console.error('Error fetching approvers:', error);
      toast.error('Failed to load approvers list');
      setStaffList([]);
    } finally {
      fetchingRef.current.staff = false;
    }
  };

  // Lesson Plans Functions
  const fetchLessonPlans = async () => {
    if (fetchingRef.current.lessonPlans) return;
    fetchingRef.current.lessonPlans = true;
    try {
      const params = fetchingRef.current._academicClassId ? `?classId=${fetchingRef.current._academicClassId}` : '';
      const response = await api.get(`/api/lesson-plans${params}`);
      setLessonPlans(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching lesson plans:', error);
      toast.error('Failed to load lesson plans');
    } finally {
      fetchingRef.current.lessonPlans = false;
    }
  };

  const handleCreateLessonPlan = async (e) => {
    e.preventDefault();
    if (!lessonPlanForm.title || !lessonPlanForm.classId || !lessonPlanForm.subject || !lessonPlanForm.date || !lessonPlanForm.file) {
      toast.error('All fields including a file are required');
      return;
    }

    setLessonPlanSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', lessonPlanForm.title);
      formData.append('classId', lessonPlanForm.classId);
      formData.append('subject', lessonPlanForm.subject);
      formData.append('date', lessonPlanForm.date);
      formData.append('file', lessonPlanForm.file);

      const response = await api.post('/api/lesson-plans', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newPlan = response.data?.data || response.data;
      setLessonPlans((prev) => [newPlan, ...prev]);
      toast.success('Lesson plan uploaded successfully');
      setShowLessonPlanModal(false);
      setLessonPlanForm({ title: '', classId: '', subject: '', date: '', file: null });
    } catch (error) {
      console.error('Error uploading lesson plan:', error);
      toast.error(error.response?.data?.message || 'Failed to upload lesson plan');
    } finally {
      setLessonPlanSubmitting(false);
    }
  };

  const handleDeleteLessonPlan = async (id) => {
    if (!window.confirm('Delete this lesson plan?')) return;
    try {
      await api.delete(`/api/lesson-plans/${id}`);
      setLessonPlans((prev) => prev.filter((lp) => lp._id !== id));
      toast.success('Lesson plan deleted');
    } catch (error) {
      toast.error('Failed to delete lesson plan');
    }
  };

  const fetchStudyMaterials = async (classId) => {
    try {
      const params = classId ? `?classId=${classId}` : '';
      const response = await api.get(`/api/study-materials${params}`);
      setStudyMaterials(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching study materials:', error);
    }
  };

  const fetchClassHomework = async (classId) => {
    try {
      const params = classId ? `?classId=${classId}` : '';
      const response = await api.get(`/api/homework/my-assigned${params}`);
      setClassHomework(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching homework:', error);
    }
  };

  const fetchClassSubjects = async (classId) => {
    if (!classId) { setClassSubjects([]); return; }
    try {
      const response = await api.get(`/api/staff/subjects?classId=${classId}`);
      setClassSubjects(response.data?.data || response.data || []);
    } catch {
      setClassSubjects([]);
    }
  };

  const handleUploadStudyMaterial = async (e) => {
    e.preventDefault();
    if (!studyMaterialForm.title || !studyMaterialForm.subject || !studyMaterialForm.file || !selectedAcademicClass) {
      toast.error('Title, subject, class, and file are required');
      return;
    }
    setStudyMaterialSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', studyMaterialForm.title);
      formData.append('subject', studyMaterialForm.subject);
      formData.append('description', studyMaterialForm.description);
      formData.append('classId', selectedAcademicClass);
      formData.append('file', studyMaterialForm.file);
      await api.post('/api/study-materials', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Study material uploaded');
      setShowStudyMaterialModal(false);
      setStudyMaterialForm({ title: '', subject: '', description: '', file: null });
      fetchStudyMaterials(selectedAcademicClass);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload study material');
    } finally {
      setStudyMaterialSubmitting(false);
    }
  };

  const handleDeleteStudyMaterial = async (id) => {
    if (!window.confirm('Delete this study material?')) return;
    try {
      await api.delete(`/api/study-materials/${id}`);
      setStudyMaterials((prev) => prev.filter((m) => m._id !== id));
      toast.success('Study material deleted');
    } catch (error) {
      toast.error('Failed to delete study material');
    }
  };

  const handleDownloadStudyMaterial = async (id, originalName) => {
    try {
      const response = await api.get(`/api/study-materials/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName || `study-material-${id}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      toast.error('Failed to download study material');
    }
  };

  const handleCreateHomework = async (e) => {
    e.preventDefault();
    const targetClassId = homeworkForm.classId || selectedAcademicClass;
    if (!homeworkForm.title || !homeworkForm.subject || !homeworkForm.dueDate || !targetClassId) {
      toast.error('Title, subject, class, and due date are required');
      return;
    }
    setHomeworkSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', homeworkForm.title);
      fd.append('description', homeworkForm.description);
      fd.append('classId', targetClassId);
      fd.append('subject', homeworkForm.subject);
      fd.append('dueDate', homeworkForm.dueDate);
      for (const file of homeworkForm.files) fd.append('files', file);
      await api.post('/api/homework', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Homework assigned');
      setShowHomeworkModal(false);
      setHomeworkForm({ title: '', description: '', subject: '', dueDate: '', files: [], classId: '' });
      fetchClassHomework(targetClassId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create homework');
    } finally {
      setHomeworkSubmitting(false);
    }
  };

  const handleOpenHomeworkForClass = (cls) => {
    setSelectedClassForStudents(cls._id);
    setHomeworkForm(prev => ({ ...prev, classId: cls._id }));
    fetchClassSubjects(cls._id);
    setShowHomeworkModal(true);
  };

  const handleDeleteHomework = async (id) => {
    if (!window.confirm('Delete this homework?')) return;
    try {
      await api.delete(`/api/homework/${id}`);
      setClassHomework((prev) => prev.filter((h) => h._id !== id));
      toast.success('Homework deleted');
    } catch (error) {
      toast.error('Failed to delete homework');
    }
  };

  const handleDownloadLessonPlan = async (id, originalName) => {
    try {
      const response = await api.get(`/api/lesson-plans/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName || `lesson-plan-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const fetchPendingApprovals = async () => {
    if (fetchingRef.current.approvals) return;
    fetchingRef.current.approvals = true;
    try {
      const response = await api.get('/api/staff/leave-approvals');
      setPendingApprovals(response?.data || []);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    } finally {
      fetchingRef.current.approvals = false;
    }
  };

  const handleApproveReject = async (leaveId, action) => {
    try {
      await api.put(`/api/staff/leaves/${leaveId}/action`, { action });
      toast.success(`Leave ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      fetchPendingApprovals();
    } catch (error) {
      console.error('Error processing leave:', error);
      toast.error(`Failed to ${action} leave`);
    }
  };

  // Payroll fetch functions
  const fetchLatestSalary = async () => {
    if (fetchingRef.current.salary) return;
    fetchingRef.current.salary = true;
    try {
      const response = await api.get('/api/payroll/my-salary');
      setLatestSalary(response?.data || null);
    } catch (error) {
      console.error('Error fetching salary:', error);
    } finally {
      fetchingRef.current.salary = false;
    }
  };

  const fetchPayrollHistory = async () => {
    if (fetchingRef.current.payrollHistory) return;
    fetchingRef.current.payrollHistory = true;
    try {
      const response = await api.get('/api/payroll/my-history');
      setPayrollHistory(response?.data || []);
    } catch (error) {
      console.error('Error fetching payroll history:', error);
    } finally {
      fetchingRef.current.payrollHistory = false;
    }
  };

  const fetchReimbursements = async () => {
    if (fetchingRef.current.reimbursements) return;
    fetchingRef.current.reimbursements = true;
    try {
      const response = await api.get('/api/payroll/reimbursements');
      setReimbursements(response?.data || []);
    } catch (error) {
      console.error('Error fetching reimbursements:', error);
    } finally {
      fetchingRef.current.reimbursements = false;
    }
  };

  const handleSubmitReimbursement = async (e) => {
    e.preventDefault();
    setReimbursementSubmitting(true);
    try {
      await api.post('/api/payroll/reimbursements', {
        title: reimbursementForm.title,
        amount: parseFloat(reimbursementForm.amount),
        description: reimbursementForm.description,
      });
      toast.success('Reimbursement claim submitted');
      setShowReimbursementModal(false);
      setReimbursementForm({ title: '', amount: '', description: '' });
      fetchReimbursements();
    } catch (error) {
      toast.error('Failed to submit reimbursement');
    } finally {
      setReimbursementSubmitting(false);
    }
  };

  // Documents fetch
  const fetchDocuments = async () => {
    if (fetchingRef.current.documents) return;
    fetchingRef.current.documents = true;
    try {
      const response = await api.get('/api/documents');
      setDocuments(response?.data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      fetchingRef.current.documents = false;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownloadDocument = async (docId) => {
    try {
      const response = await api.get(`/api/documents/${docId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const handleCheckIn = async () => {
    try {
      const response = await api.post('/api/staff/my-attendance/checkin');
      const attendanceData = response.data?.data || response.data;
      toast.success('Checked in successfully at ' + formatTime(attendanceData.checkIn));
      setTodayAttendance(attendanceData);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      const response = await api.post('/api/staff/my-attendance/checkout');
      const attendanceData = response.data?.data || response.data;
      const hours = Math.floor((attendanceData.workingHours || 0) / 60);
      const mins = (attendanceData.workingHours || 0) % 60;
      toast.success(`Checked out successfully. Hours worked: ${hours}h ${mins}m`);
      setTodayAttendance(attendanceData);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check out');
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!leaveForm.leaveType || !leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason || leaveForm.approvers.length === 0) {
      toast.error('Please fill all fields and select at least one approver');
      return;
    }

    setLeaveSubmitting(true);
    try {
      await api.post('/api/staff/my-leaves/apply', leaveForm);
      toast.success('Leave application submitted successfully');
      setShowLeaveModal(false);
      setLeaveForm({ leaveType: 'casual', startDate: '', endDate: '', reason: '', approvers: [] });

      // Reset request tracking and fetch updated data
      fetchingRef.current.leaves = false;
      fetchingRef.current.balance = false;
      await fetchMyLeaves();
      await fetchLeaveBalance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply leave');
    } finally {
      setLeaveSubmitting(false);
    }
  };

  const openLeaveModal = async () => {
    await fetchStaffList();
    setShowLeaveModal(true);
  };

  // Timetable & Scheduling Fetch Functions
  const fetchMyTimetable = async () => {
    if (fetchingRef.current.timetable) return;
    fetchingRef.current.timetable = true;
    try {
      const response = await api.get('/api/staff/my-timetable');
      setMyTimetable(response?.data || []);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setMyTimetable([]);
    } finally {
      fetchingRef.current.timetable = false;
    }
  };

  const fetchSubstitutions = async () => {
    if (fetchingRef.current.substitutions) return;
    fetchingRef.current.substitutions = true;
    try {
      const response = await api.get('/api/substitutions/my-duties');
      setSubstitutions(response.data || []);
    } catch (error) {
      console.error('Error fetching substitutions:', error);
      setSubstitutions([]);
    } finally {
      fetchingRef.current.substitutions = false;
    }
  };

  const fetchExamDuties = async () => {
    if (fetchingRef.current.examDuties) return;
    fetchingRef.current.examDuties = true;
    try {
      const response = await api.get(`/api/exams${staffData?._id ? `?invigilatorId=${staffData._id}` : ''}`);
      setExamDuties(response?.data || []);
    } catch (error) {
      console.error('Error fetching exam duties:', error);
      setExamDuties([]);
    } finally {
      fetchingRef.current.examDuties = false;
    }
  };

  // Attendance Marking Handlers
  const handleOpenMarkAttendance = async (classId) => {
    setAttendanceClassId(classId);
    setAttendanceDate(new Date().toISOString().split('T')[0]);
    setShowMarkAttendanceModal(true);
    await loadMarkAttendanceStudents(classId, new Date().toISOString().split('T')[0]);
  };

  const loadMarkAttendanceStudents = async (classId, date) => {
    try {
      setAttendanceLoading(true);
      const response = await api.get(`/api/attendance/class/${classId}?date=${date}`);
      setAttendanceStudents(response.data || []);
      const attendanceObj = {};
      response.data?.forEach((student) => {
        attendanceObj[student._id] = student.status || 'absent';
      });
      setAttendanceRecords(attendanceObj);
    } catch (error) {
      toast.error('Failed to load students for attendance');
      setAttendanceStudents([]);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleAttendanceDateChange = async (date) => {
    setAttendanceDate(date);
    if (attendanceClassId) {
      await loadMarkAttendanceStudents(attendanceClassId, date);
    }
  };

  const handleAttendanceRecordChange = (studentId, status) => {
    setAttendanceRecords({
      ...attendanceRecords,
      [studentId]: status,
    });
  };

  const handleMarkAllPresentRecords = () => {
    const updated = {};
    attendanceStudents.forEach((student) => {
      updated[student._id] = 'present';
    });
    setAttendanceRecords(updated);
    toast.success('All marked as present');
  };

  const handleSaveAttendanceRecords = async () => {
    if (!attendanceClassId) {
      toast.error('Please select a class');
      return;
    }

    const records = attendanceStudents.map((student) => ({
      studentId: student._id,
      status: attendanceRecords[student._id] || 'absent',
    }));

    setAttendanceLoading(true);
    try {
      await api.post('/api/attendance', {
        classId: attendanceClassId,
        date: attendanceDate,
        records,
      });
      toast.success('Attendance saved successfully');
      setShowMarkAttendanceModal(false);
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Failed to save attendance');
    } finally {
      setAttendanceLoading(false);
    }
  };

  // 1. Staff Profile & Account
  const renderProfile = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">
        Staff Profile & Account
      </h2>
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-[#FEF3C7] to-[#FEE2E2] rounded-full flex items-center justify-center text-4xl font-bold text-[#0F172A]">
            {staffData?.userId?.name?.charAt(0) || "S"}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#0F172A]">
              {staffData?.userId?.name || "Staff User"}
            </h3>
            <p className="text-[#64748B]">
              Employee ID: {staffData?.employeeId || "N/A"}
            </p>
            <span
              className={`inline-block mt-2 px-3 py-1 text-white text-xs font-semibold rounded-full ${staffData?.status === "active" ? "bg-[#10B981]" : "bg-[#F59E0B]"
                }`}
            >
              {staffData?.status?.charAt(0).toUpperCase() +
                staffData?.status?.slice(1) || "N/A"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-[#FEF3C7] rounded-lg">
            <p className="text-sm text-[#64748B]">Subjects Taught</p>
            <p className="font-bold text-[#0F172A]">
              {staffData?.subjectsTaught?.join(", ") || "N/A"}
            </p>
          </div>
          <div className="p-4 bg-[#FEE2E2] rounded-lg">
            <p className="text-sm text-[#64748B]">Classes Assigned</p>
            <p className="font-bold text-[#0F172A]">
              {staffData?.classesAssigned?.length || 0} Classes
            </p>
          </div>
          <div className="p-4 bg-[#DBEAFE] rounded-lg">
            <p className="text-sm text-[#64748B]">Qualification</p>
            <p className="font-bold text-[#0F172A]">
              {staffData?.qualificationDegree
                ? `${staffData.qualificationDegree} ${staffData.qualificationSpecialization || ""}`
                : "N/A"}
            </p>
          </div>
          <div className="p-4 bg-[#D1FAE5] rounded-lg">
            <p className="text-sm text-[#64748B]">Experience</p>
            <p className="font-bold text-[#0F172A]">
              {staffData?.experience || "N/A"}
            </p>
          </div>
        </div>

        <div className="border-t border-[#E2E8F0] pt-4">
          <h4 className="font-semibold mb-3">Contact Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="text-[#64748B]" size={18} />
              <span className="text-sm">{user?.email || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="text-[#64748B]" size={18} />
              <span className="text-sm">{staffData?.contact || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E2E8F0] pt-4 mt-4">
          <h4 className="font-semibold mb-3">Security Settings</h4>
          <div className="flex gap-3">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#4338CA] transition-colors"
            >
              Change Password
            </button>
            <button
              onClick={() => setShowContactModal(true)}
              className="border-2 border-[#4F46E5] text-[#4F46E5] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#EEF2FF] transition-colors"
            >
              Update Contact Info
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-[#0F172A] mb-4">
              Change Password
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder="Enter current password"
                  className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Enter new password"
                  className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirm new password"
                  className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-gray-200 text-[#0F172A] hover:bg-gray-300 h-10 px-4 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#4F46E5] text-white hover:bg-[#4338CA] h-10 px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                >
                  {submitting ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Update Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-[#0F172A] mb-4">
              Update Contact Information
            </h3>
            <form onSubmit={handleUpdateContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  value={contactForm.contact}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, contact: e.target.value })
                  }
                  placeholder="Enter contact number"
                  className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 bg-gray-200 text-[#0F172A] hover:bg-gray-300 h-10 px-4 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#4F46E5] text-white hover:bg-[#4338CA] h-10 px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                >
                  {submitting ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // 2. Attendance Management
  const formatTime = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Converts "HH:mm" string (from Exam model) to "9:00 AM" format
  const formatHHmm = (hhmm) => {
    if (!hhmm) return '—';
    const [h, m] = hhmm.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return hhmm;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatWorkingHours = (minutes) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m / 8h 0m`;
  };

  const renderAttendance = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">
        Attendance Management
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Clock className="text-[#F59E0B]" size={20} />
            Today's Attendance
          </h3>
          <div className="text-center py-4 mb-4 bg-[#FEF3C7] rounded-lg">
            <p className="text-sm text-[#64748B]">Date</p>
            <p className="text-xl font-bold">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {todayAttendance?.checkIn && (
            <div className="mb-4 p-4 bg-[#DBEAFE] rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-[#1E40AF]">
                  Check In Time
                </span>
                <span className="text-lg font-bold text-[#1E40AF]">
                  {formatTime(todayAttendance.checkIn)}
                </span>
              </div>
              {todayAttendance?.checkOut && (
                <>
                  <div className="flex justify-between items-center mb-2 pt-2 border-t border-[#BFDBFE]">
                    <span className="text-sm font-medium text-[#1E40AF]">
                      Check Out Time
                    </span>
                    <span className="text-lg font-bold text-[#1E40AF]">
                      {formatTime(todayAttendance.checkOut)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#BFDBFE]">
                    <span className="text-sm font-medium text-[#059669]">
                      Total Hours Worked
                    </span>
                    <span className="text-lg font-bold text-[#059669]">
                      {formatWorkingHours(todayAttendance.workingHours)}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleCheckIn}
              disabled={!!todayAttendance?.checkIn}
              className="w-full bg-[#10B981] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#059669] transition-colors disabled:bg-[#6B7280] disabled:cursor-not-allowed"
            >
              <CheckCircle size={20} />{" "}
              {todayAttendance?.checkIn ? "Checked In ✓" : "Check In"}
            </button>
            <button
              onClick={handleCheckOut}
              disabled={
                !todayAttendance?.checkIn || !!todayAttendance?.checkOut
              }
              className="w-full bg-[#DC2626] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#B91C1C] transition-colors disabled:bg-[#6B7280] disabled:cursor-not-allowed"
            >
              <XCircle size={20} />{" "}
              {todayAttendance?.checkOut ? "Checked Out ✓" : "Check Out"}
            </button>
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Calendar className="text-[#F59E0B]" size={20} />
            Leave Balance
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-[#FEF3C7] rounded-lg">
              <span className="font-medium">Casual Leave</span>
              <span className="font-bold text-[#10B981]">
                {leaveBalance.casual.remaining} / {leaveBalance.casual.total}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#FEE2E2] rounded-lg">
              <span className="font-medium">Sick Leave</span>
              <span className="font-bold text-[#10B981]">
                {leaveBalance.sick.remaining} / {leaveBalance.sick.total}
              </span>
            </div>
            <button
              onClick={openLeaveModal}
              className="w-full bg-[#F59E0B] text-white py-3 rounded-lg font-semibold mt-2 hover:bg-[#D97706] transition-colors"
            >
              Apply for Leave
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Leave Application Status</h3>
        <div className="space-y-3">
          {myLeaves.length > 0 ? (
            myLeaves.map((leave, idx) => (
              <div
                key={idx}
                className="p-4 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center"
              >
                <div className="flex-1">
                  <p className="font-semibold">
                    {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                  </p>
                  <p className="text-sm text-[#64748B]">
                    {leave.leaveType.charAt(0).toUpperCase() +
                      leave.leaveType.slice(1)}{" "}
                    Leave - {leave.reason}
                  </p>
                  {leave.status === 'rejected' && leave.rejectionReason && (
                    <p className="text-xs text-[#DC2626] mt-1">
                      Reason: {leave.rejectionReason}
                    </p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${leave.status === "approved"
                    ? "bg-[#D1FAE5] text-[#065F46]"
                    : leave.status === "rejected"
                      ? "bg-[#FEE2E2] text-[#991B1B]"
                      : "bg-[#FEF3C7] text-[#92400E]"
                    }`}
                >
                  {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-[#64748B] py-4">
              No leave applications yet
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Attendance History (Last 7 Days)</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Date</th>
                <th className="px-4 py-3 text-left font-bold text-sm">
                  Check In
                </th>
                <th className="px-4 py-3 text-left font-bold text-sm">
                  Check Out
                </th>
                <th className="px-4 py-3 text-left font-bold text-sm">Hours</th>
                <th className="px-4 py-3 text-left font-bold text-sm">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {attendanceHistory.length > 0 ? (
                attendanceHistory.map((day, idx) => (
                  <tr key={idx} className="border-b border-[#E2E8F0]">
                    <td className="px-4 py-3 text-sm">
                      {formatDate(day.date)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatTime(day.checkIn)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatTime(day.checkOut)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatWorkingHours(day.workingHours)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${day.status === "present"
                          ? "bg-[#D1FAE5] text-[#065F46]"
                          : day.status === "late"
                            ? "bg-[#FEE2E2] text-[#991B1B]"
                            : "bg-[#DBEAFE] text-[#1E40AF]"
                          }`}
                      >
                        {day.status.charAt(0).toUpperCase() +
                          day.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-3 text-center text-[#64748B]"
                  >
                    No attendance records
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-3xl  w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-[#0F172A]">
              Apply for Leave
            </h2>

            <div className="mb-6 p-4 bg-[#FEF3C7] rounded-lg">
              <p className="text-sm text-[#64748B] mb-2">Available Leaves:</p>
              <div className="flex gap-4">
                <div>
                  <p className="font-bold text-[#10B981]">
                    {leaveBalance.casual.remaining}
                  </p>
                  <p className="text-xs text-[#64748B]">Casual Leaves</p>
                </div>
                <div>
                  <p className="font-bold text-[#10B981]">
                    {leaveBalance.sick.remaining}
                  </p>
                  <p className="text-xs text-[#64748B]">Sick Leaves</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div>
                <label
                  htmlFor="leaveType"
                  className="block text-sm font-medium text-[#0F172A] mb-2"
                >
                  Leave Type
                </label>
                <select
                  id="leaveType"
                  value={leaveForm.leaveType}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, leaveType: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:border-[#F59E0B]"
                >
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-[#0F172A] mb-2"
                >
                  Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={leaveForm.startDate}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, startDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:border-[#F59E0B]"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-[#0F172A] mb-2"
                >
                  End Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={leaveForm.endDate}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, endDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:border-[#F59E0B]"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-[#0F172A] mb-2"
                >
                  Reason
                </label>
                <textarea
                  id="reason"
                  value={leaveForm.reason}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, reason: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:border-[#F59E0B]"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-3">
                  Select Approvers (Staff & Admin)
                </label>
                <div className="border-2 border-[#FCD34D] rounded-lg p-3 max-h-48 overflow-y-auto bg-[#FFFBEB]">
                  {staffList && staffList.length > 0 ? (
                    staffList.map((approver) => {
                      const approverId = approver._id;
                      const approverName = approver.name || "Unknown";
                      const approverType = approver.type || "staff";
                      const checkboxId = `approver-${approverId}`;
                      return (
                        <div
                          key={approverId}
                          className="flex items-center gap-2 p-2 hover:bg-[#FEF3C7] rounded border-b border-[#F3E8FF] last:border-b-0"
                        >
                          <input
                            id={checkboxId}
                            type="checkbox"
                            checked={leaveForm.approvers.includes(approverId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setLeaveForm({
                                  ...leaveForm,
                                  approvers: [
                                    ...leaveForm.approvers,
                                    approverId,
                                  ],
                                });
                              } else {
                                setLeaveForm({
                                  ...leaveForm,
                                  approvers: leaveForm.approvers.filter(
                                    (id) => id !== approverId,
                                  ),
                                });
                              }
                            }}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <label
                            htmlFor={checkboxId}
                            className="flex flex-col cursor-pointer flex-1"
                          >
                            <span className="text-sm text-[#0F172A] font-medium">
                              {approverName}
                            </span>
                            <span className="text-xs text-[#64748B]">
                              {approverType === "admin"
                                ? "👤 Admin"
                                : "👨‍🏫 Staff"}
                            </span>
                          </label>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-[#64748B] py-2 text-center">
                      Loading approvers...
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-[#FCD34D] text-[#0F172A] rounded-lg font-semibold hover:bg-[#FEF3C7] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={leaveSubmitting}
                  className="flex-1 px-4 py-2 bg-[#10B981] text-white rounded-lg font-semibold hover:bg-[#059669] transition-colors disabled:bg-[#6B7280]"
                >
                  {leaveSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Pending Approvals - Leave requests from others that need your action */}
      <div className="bg-white rounded-xl border-2 border-[#4F46E5] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <ClipboardCheck className="text-[#4F46E5]" size={20} />
          Pending Leave Approvals ({pendingApprovals.length})
        </h3>
        {pendingApprovals.length > 0 ? (
          <div className="space-y-4">
            {pendingApprovals.map((leave) => (
              <div key={leave._id} className="p-4 border-2 border-[#FCD34D] rounded-lg bg-[#FFFBEB]">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold">{leave.staffId?.userId?.name || 'Staff Member'}</p>
                    <p className="text-sm text-[#64748B]">{leave.staffId?.userId?.email || ''}</p>
                  </div>
                  <span className="px-2 py-1 bg-[#FEF3C7] text-[#92400E] rounded-full text-xs font-semibold capitalize">{leave.leaveType} Leave</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div><span className="text-[#64748B]">From:</span> <span className="font-semibold">{formatDate(leave.startDate)}</span></div>
                  <div><span className="text-[#64748B]">To:</span> <span className="font-semibold">{formatDate(leave.endDate)}</span></div>
                </div>
                <p className="text-sm text-[#64748B] mb-3"><span className="font-semibold">Reason:</span> {leave.reason}</p>
                <div className="flex gap-3">
                  <button onClick={() => handleApproveReject(leave._id, 'approve')} className="flex-1 bg-[#10B981] text-white py-2 rounded-lg font-semibold text-sm hover:bg-[#059669] transition-colors">Approve</button>
                  <button onClick={() => handleApproveReject(leave._id, 'reject')} className="flex-1 bg-[#DC2626] text-white py-2 rounded-lg font-semibold text-sm hover:bg-[#B91C1C] transition-colors">Reject</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-[#64748B]">
            <CheckCircle className="mx-auto mb-2 text-[#10B981]" size={32} />
            <p>No pending leave approvals</p>
          </div>
        )}
      </div>

    </div>
  );

  // 3. Timetable & Scheduling
  const renderTimetable = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Timetable & Scheduling</h2>

      {myTimetable && myTimetable.length > 0 ? myTimetable.map((tt, ttIdx) => {
        // Get unique period slots from the first day that has data (all days share the same period structure)
        const sampleDay = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].find((d) => tt.schedule?.[d]?.length > 0);
        const allSlots = sampleDay ? tt.schedule[sampleDay] : [];
        // Filter out break/lunch/assembly — only show class/lab/sports periods
        const classSlotIndices = allSlots.map((s, i) => ({ ...s, _idx: i })).filter((s) => s.type !== 'break' && s.type !== 'lunch' && s.type !== 'assembly');
        return (
        <div key={ttIdx} className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">{tt.className} - {tt.section}</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-sm">Day</th>
                  {classSlotIndices.length > 0 ? classSlotIndices.map((slot, idx) => (
                    <th key={idx} className="px-4 py-3 text-left font-bold text-sm">{slot.name}<br /><span className="font-normal text-xs">{slot.startTime}-{slot.endTime}</span></th>
                  )) : (
                    <th className="px-4 py-3 text-left font-bold text-sm">Periods not configured</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                  <tr key={day} className="border-b border-[#E2E8F0]">
                    <td className="px-4 py-3 font-semibold">{day}</td>
                    {tt.schedule?.[day]?.length > 0 ? classSlotIndices.map((slot, idx) => {
                      const entry = tt.schedule[day]?.[slot._idx];
                      return (
                        <td key={idx} className="px-4 py-3 text-sm">{entry?.subject || '-'}</td>
                      );
                    }) : (
                      <td colSpan={classSlotIndices.length || 1} className="px-4 py-3 text-sm text-[#64748B]">No schedule</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        );
      }) : (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6 text-center text-[#64748B]">
          <p>No timetable assigned yet</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Briefcase className="text-[#DC2626]" size={20} />
            Substitution Schedule
          </h3>
          <div className="space-y-3">
            {substitutions && substitutions.length > 0 ? substitutions.map((sub) => (
              <div key={sub._id} className="p-3 bg-[#FEE2E2] rounded-lg">
                <p className="font-semibold">{new Date(sub.date).toLocaleDateString()} - Period {sub.periodIndex + 1}</p>
                <p className="text-sm text-[#64748B]">{sub.classId?.name} {sub.classId?.section}</p>
                {sub.subject && <p className="text-sm text-[#64748B]">Subject: {sub.subject}</p>}
                {sub.reason && <p className="text-xs text-[#64748B]">Reason: {sub.reason}</p>}
              </div>
            )) : (
              <p className="text-sm text-[#64748B]">No substitution duties scheduled</p>
            )}
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <ClipboardCheck className="text-[#7C3AED]" size={20} />
            Exam Duty Schedule
          </h3>
          <div className="space-y-3">
            {examDuties && examDuties.length > 0 ? examDuties.map((exam) => (
              <div key={exam._id} className="p-3 bg-[#EDE9FE] rounded-lg">
                <p className="font-semibold">{exam.examType}</p>
                <p className="text-sm text-[#64748B]">{exam.subject} - {exam.classId?.name} {exam.classId?.section}</p>
                <p className="text-sm text-[#64748B]">{new Date(exam.date).toLocaleDateString()} - {exam.startTime} to {exam.endTime}</p>
                {exam.session && <p className="text-xs text-[#64748B]">Session: {exam.session}</p>}
              </div>
            )) : (
              <p className="text-sm text-[#64748B]">No exam duties scheduled</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Calendar className="text-[#F59E0B]" size={20} />
          Extra Classes & Events
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#FEF3C7] rounded-lg border-l-4 border-[#F59E0B]">
            <p className="font-semibold">Doubt Clearing Session</p>
            <p className="text-sm text-[#64748B]">Saturday, 10:00 AM</p>
            <p className="text-xs text-[#64748B]">Grade 7-A & 7-B</p>
          </div>
          <div className="p-4 bg-[#D1FAE5] rounded-lg border-l-4 border-[#10B981]">
            <p className="font-semibold">Science Exhibition Prep</p>
            <p className="text-sm text-[#64748B]">Dec 23, 3:00 PM</p>
            <p className="text-xs text-[#64748B]">Lab 2</p>
          </div>
          <div className="p-4 bg-[#FEE2E2] rounded-lg border-l-4 border-[#DC2626]">
            <p className="font-semibold">Parent-Teacher Meeting</p>
            <p className="text-sm text-[#64748B]">Dec 30, 10:00 AM</p>
            <p className="text-xs text-[#64748B]">Main Hall</p>
          </div>
        </div>
      </div>
    </div>
  );

  // 4. Class & Student Management
  const renderClassManagement = () => {
    const classesForStaff = (classDetail || []).filter(c => c.staffId === staffData?._id);
    const selectedClassObj = classesForStaff.find(c => c._id === selectedClassForStudents);
    const classesHomework = module === 'classes' && selectedClassForStudents ? classHomework : [];

    return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Class & Student Management</h2>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">My Assigned Classes</h3>
        <p className="text-sm text-[#64748B] mb-4">Select a class to view students and assign homework</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {classDetail?.map((cls, idx) => {
            const isSelected = selectedClassForStudents === cls._id;
            return (
            <div
              key={idx}
              onClick={() => setSelectedClassForStudents(cls._id)}
              className={`p-4 border-2 rounded-lg transition-colors cursor-pointer ${isSelected ? 'border-[#4F46E5] bg-[#EEF2FF]' : 'border-[#FCD34D] hover:bg-[#FFFBEB]'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg">{cls.name} {cls.section}</h4>
              </div>
              <p className="text-sm text-[#64748B]">{cls.students ?? '—'} Students</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleOpenMarkAttendance(cls._id); }}
                  className="cursor-pointer text-xs bg-[#10B981] text-white px-3 py-1 rounded font-semibold hover:bg-[#059669] transition-colors"
                >
                  Mark Attendance
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleOpenHomeworkForClass(cls); }}
                  className="cursor-pointer text-xs bg-[#4F46E5] text-white px-3 py-1 rounded font-semibold hover:bg-[#4338CA] transition-colors"
                >
                  Set Homework
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {selectedClassObj && (
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <ClipboardCheck className="text-[#DC2626]" size={20} />
          Homework & Assignments — {selectedClassObj.name} {selectedClassObj.section}
        </h3>
        <div className="space-y-3 mb-4 max-h-[200px] overflow-y-auto pr-1">
          {classesHomework.length > 0 ? classesHomework.map((hw) => (
            <div key={hw._id} className="p-3 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center bg-white hover:border-[#CBD5E1] transition-colors">
              <div>
                <p className="font-semibold text-sm">{hw.title}</p>
                <p className="text-xs text-[#64748B]">Due: {formatDate(hw.dueDate)} • {hw.submissionCount || 0} submissions</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDeleteHomework(hw._id)} className="text-red-400 hover:text-red-600"><XCircle size={16} /></button>
              </div>
            </div>
          )) : (
            <p className="text-sm text-[#64748B] text-center py-4">No homework assigned yet. Use &quot;Set Homework&quot; on a class card above.</p>
          )}
        </div>
        <button
          onClick={() => handleOpenHomeworkForClass(selectedClassObj)}
          className="w-full bg-[#10B981] text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#059669] transition-colors"
        >
          <Upload size={18} /> Add Assignment
        </button>
      </div>
      )}

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">
            Student List
            {(() => {
              const ctClasses = (classDetail || []).filter(c => c.staffId === staffData?._id);
              const currentClass = ctClasses.find(c => c._id === selectedClassForStudents) || ctClasses[0];
              return currentClass ? ` - ${currentClass.name} ${currentClass.section}` : '';
            })()}
          </h3>
          {/* <select
            className="border-2 border-[#FCD34D] rounded-lg px-3 py-2 text-sm max-w-[200px]"
            value={selectedClassForStudents}
            onChange={(e) => setSelectedClassForStudents(e.target.value)}
          >
            {classDetail && staffData && classDetail.filter(c => c.staffId === staffData._id).map((c) => (
              <option key={c._id} value={c._id}>{c.name} {c.section}</option>
            ))}
            {(!classDetail || !staffData || classDetail.filter(c => c.staffId === staffData._id).length === 0) && (
              <option value="">No Classes Assigned</option>
            )}
          </select> */}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Roll No</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Student Name</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Parent Contact</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.length > 0 ? classStudents.map((student, idx) => (
                <tr key={idx} className="border-b border-[#E2E8F0] hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold">{student.rollNumber || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm">{student.userId?.name || student.name || 'Unknown'}</td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{student.parentContact || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-[#E2E8F0] text-[#64748B]">
                      --%
                    </span>
                  </td>
                 
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#64748B]">
                    No students found for this class.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  );
  };

  // 5. Academic Management
  const renderAcademic = () => {
    const assignedClasses = staffData?.classesAssigned || [];
    const selectedClassObj = assignedClasses.find(c => c._id === selectedAcademicClass);

    const handleClassChange = (classId) => {
      setSelectedAcademicClass(classId);
      setLessonPlans([]);
      setStudyMaterials([]);
      setClassHomework([]);
    };

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#0F172A]">Academic Management</h2>

        {/* Class Selector */}
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-4 flex flex-wrap items-center gap-3">
          <span className="font-semibold text-[#0F172A]">Select Class:</span>
          {assignedClasses.length === 0 ? (
            <span className="text-sm text-[#64748B]">No classes assigned</span>
          ) : (
            <>
              <button
                onClick={() => handleClassChange('')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${!selectedAcademicClass ? 'bg-[#4F46E5] text-white' : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'}`}
              >
                All Classes
              </button>
              {assignedClasses.map((cls) => (
                <button
                  key={cls._id}
                  onClick={() => handleClassChange(cls._id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${selectedAcademicClass === cls._id ? 'bg-[#4F46E5] text-white' : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'}`}
                >
                  {cls.name} {cls.section}
                </button>
              ))}
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-[#FEF3C7] rounded-xl border-2 border-[#F59E0B] text-center">
            <FileText className="mx-auto text-[#F59E0B] mb-2" size={32} />
            <p className="font-bold text-2xl">{lessonPlans.length}</p>
            <p className="text-sm text-[#64748B]">Lesson Plans</p>
          </div>
          <div className="p-4 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981] text-center">
            <BookOpen className="mx-auto text-[#10B981] mb-2" size={32} />
            <p className="font-bold text-2xl">{classHomework.length}</p>
            <p className="text-sm text-[#64748B]">Assignments Given</p>
          </div>
          <div className="p-4 bg-[#DBEAFE] rounded-xl border-2 border-[#3B82F6] text-center">
            <ClipboardCheck className="mx-auto text-[#3B82F6] mb-2" size={32} />
            <p className="font-bold text-2xl">{classHomework.reduce((sum, h) => sum + (h.submissionCount || 0), 0)}</p>
            <p className="text-sm text-[#64748B]">Submissions</p>
          </div>
          <div className="p-4 bg-[#EDE9FE] rounded-xl border-2 border-[#7C3AED] text-center">
            <Book className="mx-auto text-[#7C3AED] mb-2" size={32} />
            <p className="font-bold text-2xl">{studyMaterials.length}</p>
            <p className="text-sm text-[#64748B]">Study Materials</p>
          </div>
        </div>

        {/* Lesson Plans */}
        <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <FileText className="text-[#F59E0B]" size={20} />
            Lesson Plans {selectedClassObj ? `— ${selectedClassObj.name} ${selectedClassObj.section}` : ''}
          </h3>
          <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-2">
            {lessonPlans.length > 0 ? lessonPlans.map((plan) => (
              <div key={plan._id} className="p-3 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center bg-white hover:border-[#CBD5E1] transition-colors">
                <div>
                  <p className="font-semibold text-sm">{plan.title}</p>
                  <p className="text-xs text-[#64748B]">
                    {plan.classId?.name} {plan.classId?.section} • {plan.subject} • {new Date(plan.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDownloadLessonPlan(plan._id, plan.originalName)} className="text-[#4F46E5] text-sm font-semibold hover:underline">View</button>
                  <button onClick={() => handleDeleteLessonPlan(plan._id)} className="text-red-500 text-sm font-semibold hover:underline">Delete</button>
                </div>
              </div>
            )) : (
              <p className="text-sm text-[#64748B] text-center py-4">No lesson plans {selectedAcademicClass ? 'for this class' : ''} yet.</p>
            )}
          </div>
          <button
            onClick={() => {
              setLessonPlanForm({ title: '', classId: selectedAcademicClass, subject: '', date: '', file: null });
              setShowLessonPlanModal(true);
            }}
            className="w-full bg-[#4F46E5] text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#4338CA] transition-colors"
          >
            <Upload size={18} /> Upload Lesson Plan
          </button>
        </div>

        {/* Homework & Study Materials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <ClipboardCheck className="text-[#DC2626]" size={20} />
              Homework & Assignments {selectedClassObj ? `— ${selectedClassObj.name} ${selectedClassObj.section}` : ''}
            </h3>
            <div className="space-y-3 mb-4 max-h-[260px] overflow-y-auto pr-1">
              {classHomework.length > 0 ? classHomework.map((hw) => (
                <div key={hw._id} className="p-3 border-2 border-[#E2E8F0] rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm">{hw.title}</p>
                      <p className="text-xs text-[#64748B]">{hw.classId?.name} {hw.classId?.section} • Due: {formatDate(hw.dueDate)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-[#DBEAFE] text-[#1E40AF] px-2 py-1 rounded-full">{hw.submissionCount || 0} submissions</span>
                      <button onClick={() => handleDeleteHomework(hw._id)} className="text-red-400 hover:text-red-600"><XCircle size={16} /></button>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-[#64748B] text-center py-4">No homework {selectedAcademicClass ? 'for this class' : ''} yet.</p>
              )}
            </div>
            <button
              onClick={() => {
                setHomeworkForm(prev => ({ ...prev, classId: selectedAcademicClass }));
                setShowHomeworkModal(true);
              }}
              disabled={!selectedAcademicClass}
              className="w-full bg-[#10B981] text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload size={18} /> Assign Homework
            </button>
            {!selectedAcademicClass && <p className="text-xs text-[#64748B] text-center mt-1">Select a class to assign homework</p>}
          </div>

          <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Book className="text-[#7C3AED]" size={20} />
              Study Materials & Notes {selectedClassObj ? `— ${selectedClassObj.name} ${selectedClassObj.section}` : ''}
            </h3>
            <div className="space-y-3 mb-4 max-h-[260px] overflow-y-auto pr-1">
              {studyMaterials.length > 0 ? studyMaterials.map((material) => (
                <div key={material._id} className="p-3 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#EDE9FE] rounded-lg flex items-center justify-center">
                      <FileText className="text-[#7C3AED]" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{material.title}</p>
                      <p className="text-xs text-[#64748B]">{material.subject} • {formatFileSize(material.size)}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleDownloadStudyMaterial(material._id, material.originalName)} className="text-[#4F46E5] p-1"><Download size={16} /></button>
                    <button onClick={() => handleDeleteStudyMaterial(material._id)} className="text-red-400 hover:text-red-600 p-1"><XCircle size={16} /></button>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-[#64748B] text-center py-4">No study materials {selectedAcademicClass ? 'for this class' : ''} yet.</p>
              )}
            </div>
            <button
              onClick={() => setShowStudyMaterialModal(true)}
              disabled={!selectedAcademicClass}
              className="w-full bg-[#F59E0B] text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload size={18} /> Upload Materials
            </button>
            {!selectedAcademicClass && <p className="text-xs text-[#64748B] text-center mt-1">Select a class to upload materials</p>}
          </div>
        </div>

        {/* Exam Invigilator Duties */}
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">My Invigilator Duties</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-sm">Exam Name</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Subject</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Class</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Date</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Time</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Max Marks</th>
                </tr>
              </thead>
              <tbody>
                {examDuties.length > 0 ? examDuties.map((exam, idx) => (
                  <tr key={exam._id || idx} className="border-b border-[#E2E8F0]">
                    <td className="px-4 py-3 text-sm font-semibold">{exam.examType}</td>
                    <td className="px-4 py-3 text-sm">{exam.subject}</td>
                    <td className="px-4 py-3 text-sm">{exam.classId?.name} {exam.classId?.section}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(exam.date)}</td>
                    <td className="px-4 py-3 text-sm">{formatHHmm(exam.startTime)} – {formatHHmm(exam.endTime)}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{exam.maxScore}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-[#64748B] text-sm">No invigilator duties assigned yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Study Material Upload Modal */}
        {showStudyMaterialModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-[#0F172A] mb-4">Upload Study Material — {selectedClassObj?.name} {selectedClassObj?.section}</h2>
              <form onSubmit={handleUploadStudyMaterial} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">Title</label>
                  <input type="text" required value={studyMaterialForm.title} onChange={(ev) => setStudyMaterialForm({ ...studyMaterialForm, title: ev.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">Subject</label>
                  <input type="text" required value={studyMaterialForm.subject} onChange={(ev) => setStudyMaterialForm({ ...studyMaterialForm, subject: ev.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">Description (optional)</label>
                  <textarea value={studyMaterialForm.description} onChange={(ev) => setStudyMaterialForm({ ...studyMaterialForm, description: ev.target.value })} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">File (max 20MB)</label>
                  <input type="file" required onChange={(ev) => setStudyMaterialForm({ ...studyMaterialForm, file: ev.target.files[0] })} className="w-full border-2 border-[#E2E8F0] rounded-lg px-3 py-2 text-sm  " />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowStudyMaterialModal(false)} className="flex-1 h-10 border border-slate-200 rounded-lg font-medium">Cancel</button>
                  <button type="submit" disabled={studyMaterialSubmitting} className="flex-1 h-10 bg-[#F59E0B] text-white rounded-lg font-medium disabled:opacity-50">{studyMaterialSubmitting ? 'Uploading...' : 'Upload'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 6. Marks & Assessment — helpers
  const marksCalcGrade = (marks, maxScore) => {
    const pct = (marks / (maxScore || 100)) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C';
    if (pct >= 35) return 'D';
    return 'F';
  };

  const GRADE_COLOR = {
    'A+': 'bg-[#D1FAE5] text-[#065F46]',
    'A':  'bg-[#DBEAFE] text-[#1E40AF]',
    'B+': 'bg-[#EDE9FE] text-[#5B21B6]',
    'B':  'bg-[#FEF3C7] text-[#92400E]',
    'C':  'bg-[#FFE4E6] text-[#9F1239]',
    'D':  'bg-[#F1F5F9] text-[#475569]',
    'F':  'bg-[#FEE2E2] text-[#991B1B]',
  };

  const handleMarksClassChange = async (classId) => {
    setMarksClassId(classId);
    setMarksExamId('');
    setMarksExams([]);
    setMarksStudents([]);
    setMarksEntries({});
    setMarksLoaded(false);
    setMarksAnalysis(null);
    if (!classId) return;
    try {
      const examsRes = await api.get(`/api/exams?classId=${classId}`);
      const allExams = examsRes.data || [];
      // Get subjects this staff teaches for this class from timetable assignments
      const assignment = timetableAssignments.find(a => {
        const aId = a.classId?._id || a.classId;
        return String(aId) === String(classId);
      });
      const taughtSubjects = (assignment?.subjects || []).map(s => s.toLowerCase());
      // Filter exams to subjects from the timetable; fall back to all exams if none found
      const filtered = taughtSubjects.length > 0
        ? allExams.filter(e => taughtSubjects.includes((e.subject || '').toLowerCase()))
        : allExams;
      setMarksExams(filtered);
    } catch {
      toast.error('Failed to load exams');
    }
  };

  const handleLoadStudents = async () => {
    if (!marksClassId || !marksExamId) {
      toast.error('Please select a class and an exam first');
      return;
    }
    setMarksLoading(true);
    setMarksLoaded(false);
    setMarksAnalysis(null);
    try {
      const [studentsRes, resultsRes] = await Promise.all([
        api.get(`/api/students?classId=${marksClassId}`),
        api.get(`/api/exams/${marksExamId}/results`),
      ]);
      const students = studentsRes.data || [];
      const results = resultsRes.data || [];
      const selectedExam = marksExams.find(e => e._id === marksExamId);
      const maxScore = selectedExam?.maxScore || 100;
      
      setMarksStudents(students);
      // Pre-fill entries from existing results
      const entries = {};
      results.forEach(r => {
        const sid = r.studentId?._id || r.studentId;
        if (sid) entries[sid] = String(r.marks);
      });
      setMarksEntries(entries);
      setMarksLoaded(true);
      
      // Calculate performance analysis for existing marks
      calculatePerformanceAnalysis(entries, students, maxScore, selectedExam);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setMarksLoading(false);
    }
  };

  const handleSaveAllMarks = async () => {
    const selectedExam = marksExams.find(e => e._id === marksExamId);
    const maxScore = selectedExam?.maxScore || 100;
    const results = marksStudents
      .filter(s => marksEntries[s._id] !== '' && marksEntries[s._id] !== undefined)
      .map(s => ({
        studentId: s._id,
        marks: Number(marksEntries[s._id]),
      }))
      .filter(r => !isNaN(r.marks) && r.marks >= 0 && r.marks <= maxScore);

    if (results.length === 0) {
      toast.error('No valid marks to save');
      return;
    }
    setMarksSaving(true);
    try {
      await api.post(`/api/exams/${marksExamId}/results/bulk`, { results });
      toast.success(`Saved marks for ${results.length} student(s)`);

      // Use the unified performance analysis function
      calculatePerformanceAnalysis(marksEntries, marksStudents, maxScore, selectedExam);
    } catch {
      toast.error('Failed to save marks');
    } finally {
      setMarksSaving(false);
    }
  };

  // 6. Marks & Assessment
  const renderMarks = () => {
    const selectedExam = marksExams.find(e => e._id === marksExamId);
    const maxScore = selectedExam?.maxScore || 100;
    const assignedClasses = timetableAssignments.map(a => a.classId).filter(Boolean);

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#0F172A]">Marks & Assessment</h2>

        {/* Selection Panel */}
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-semibold text-[#64748B] mb-1">Class</label>
              <select
                value={marksClassId}
                onChange={e => handleMarksClassChange(e.target.value)}
                className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                <option value="">Select class</option>
                {assignedClasses.map(c => (
                  <option key={c._id} value={c._id}>{c.name} {c.section}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs font-semibold text-[#64748B] mb-1">Exam</label>
              <select
                value={marksExamId}
                onChange={e => { setMarksExamId(e.target.value); setMarksLoaded(false); setMarksStudents([]); setMarksEntries({}); setMarksAnalysis(null); }}
                disabled={!marksClassId}
                className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] disabled:opacity-50"
              >
                <option value="">Select exam</option>
                {marksExams.map(e => (
                  <option key={e._id} value={e._id}>{e.examType} — {e.subject} ({new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })})</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleLoadStudents}
                disabled={!marksClassId || !marksExamId || marksLoading}
                className="h-10 bg-[#4F46E5] text-white px-6 rounded-lg font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                {marksLoading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Loading...</> : 'Load Students'}
              </button>
            </div>
          </div>

          {selectedExam && (
            <div className="flex gap-4 text-sm bg-[#F8FAFC] rounded-lg px-4 py-2 border border-slate-200">
              <span><span className="text-[#64748B]">Subject:</span> <span className="font-semibold text-[#4F46E5]">{selectedExam.subject}</span></span>
              <span><span className="text-[#64748B]">Max Marks:</span> <span className="font-semibold">{selectedExam.maxScore}</span></span>
              <span><span className="text-[#64748B]">Session:</span> <span className="font-semibold">{selectedExam.session}</span></span>
            </div>
          )}
        </div>

        {/* Marks Entry Table */}
        {marksLoaded && marksStudents.length > 0 && (
          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#0F172A]">
                Enter Marks — {selectedExam?.examType} · {selectedExam?.subject}
              </h3>
              <span className="text-sm text-[#64748B]">{marksStudents.length} students</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#FEF3C7]">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-sm text-[#0F172A]">Roll No</th>
                    <th className="px-4 py-3 text-left font-bold text-sm text-[#0F172A]">Student Name</th>
                    <th className="px-4 py-3 text-left font-bold text-sm text-[#0F172A]">Marks Obtained</th>
                    <th className="px-4 py-3 text-left font-bold text-sm text-[#0F172A]">Max Marks</th>
                    <th className="px-4 py-3 text-left font-bold text-sm text-[#0F172A]">%</th>
                    <th className="px-4 py-3 text-left font-bold text-sm text-[#0F172A]">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {marksStudents.map(student => {
                    const raw = marksEntries[student._id];
                    const marks = raw !== '' && raw !== undefined ? Number(raw) : null;
                    const pct = marks !== null && !isNaN(marks) ? ((marks / maxScore) * 100).toFixed(0) : '—';
                    const grade = marks !== null && !isNaN(marks) ? marksCalcGrade(marks, maxScore) : '—';
                    return (
                      <tr key={student._id} className="border-b border-[#E2E8F0] hover:bg-[#FFFBEB]">
                        <td className="px-4 py-3 text-sm font-semibold text-[#64748B]">{student.roll_no || '—'}</td>
                        <td className="px-4 py-3 text-sm font-medium text-[#0F172A]">{student.name}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            max={maxScore}
                            value={raw ?? ''}
                            placeholder="—"
                            onChange={e => {
                              const newEntries = { ...marksEntries, [student._id]: e.target.value };
                              setMarksEntries(newEntries);
                              calculatePerformanceAnalysis(newEntries, marksStudents, maxScore, selectedExam);
                            }}
                            className="w-24 h-9 px-3 border-2 border-[#FCD34D] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-[#64748B]">{maxScore}</td>
                        <td className="px-4 py-3 text-sm text-[#64748B]">{pct}{pct !== '—' ? '%' : ''}</td>
                        <td className="px-4 py-3">
                          {grade !== '—' ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${GRADE_COLOR[grade] || 'bg-[#E2E8F0] text-[#64748B]'}`}>{grade}</span>
                          ) : (
                            <span className="text-[#94A3B8] text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-5">
              <button
                onClick={handleSaveAllMarks}
                disabled={marksSaving}
                className="bg-[#4F46E5] text-white px-8 py-2.5 rounded-lg font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                {marksSaving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : 'Save All Marks'}
              </button>
            </div>
          </div>
        )}

        {marksLoaded && marksStudents.length === 0 && (
          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-8 text-center text-[#64748B]">
            No students found in this class.
          </div>
        )}

        {/* Performance Analysis — shown in real-time as marks are entered */}
        {marksAnalysis && (
          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
            <h3 className="font-bold text-[#0F172A] mb-4">
              Performance Analysis — {marksAnalysis.examType} · {marksAnalysis.subject}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-[#FEF3C7] rounded-xl text-center">
                <p className="text-xs text-[#64748B] mb-1">Class Average</p>
                <p className="text-2xl font-bold text-[#0F172A]">{marksAnalysis.avg}</p>
                <p className="text-xs text-[#64748B]">{marksAnalysis.avgPct}%</p>
              </div>
              <div className="p-4 bg-[#D1FAE5] rounded-xl text-center">
                <p className="text-xs text-[#64748B] mb-1">Highest Score</p>
                <p className="text-2xl font-bold text-[#065F46]">{marksAnalysis.highest} / {marksAnalysis.maxScore}</p>
                <p className="text-xs text-[#64748B] truncate">{marksAnalysis.highestStudentName}</p>
              </div>
              <div className="p-4 bg-[#FEE2E2] rounded-xl text-center">
                <p className="text-xs text-[#64748B] mb-1">Lowest Score</p>
                <p className="text-2xl font-bold text-[#991B1B]">{marksAnalysis.lowest} / {marksAnalysis.maxScore}</p>
              </div>
              <div className="p-4 bg-[#DBEAFE] rounded-xl text-center">
                <p className="text-xs text-[#64748B] mb-1">Pass Rate</p>
                <p className="text-2xl font-bold text-[#1E40AF]">{marksAnalysis.passRate}%</p>
                <p className="text-xs text-[#64748B]">{marksAnalysis.passCount} / {marksAnalysis.total}</p>
              </div>
            </div>

            <h4 className="font-semibold text-[#0F172A] mb-3 text-sm">Grade Distribution</h4>
            <div className="flex flex-wrap gap-2">
              {['A+', 'A', 'B+', 'B', 'C', 'D', 'F'].map(g => (
                marksAnalysis.gradeDist[g] ? (
                  <div key={g} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${GRADE_COLOR[g]}`}>
                    <span className="font-bold">{g}</span>
                    <span className="font-semibold">{marksAnalysis.gradeDist[g]}</span>
                    <span className="text-xs opacity-70">student{marksAnalysis.gradeDist[g] > 1 ? 's' : ''}</span>
                  </div>
                ) : null
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 7. Communication Tools — data fetching & handlers
  const fetchCommClasses = async () => {
    try {
      const res = await api.get('/api/staff/classes');
      setCommClasses(res.data || []);
    } catch { /* ignore */ }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/api/communication/announcements?audience=staff');
      setCommAnnouncements(res.data || []);
    } catch { /* ignore */ }
  };

  const fetchCommContacts = async (classId) => {
    if (!classId) { setCommContacts([]); return; }
    try {
      const res = await api.get(`/api/communication/class-contacts/${classId}`);
      setCommContacts(res.data || []);
    } catch { setCommContacts([]); }
  };

  const fetchSchoolEvents = async () => {
    try {
      const res = await api.get('/api/school-events/user-events');
      setSchoolEvents(res.data || []);
    } catch { /* ignore */ }
  };

  const getEventStyle = (eventType, priority) => {
    const eventColors = {
      holiday: { bg: 'bg-[#E0E7FF]', border: 'border-[#6366F1]', text: 'text-[#4338CA]' },
      exam: { bg: 'bg-[#FEE2E2]', border: 'border-[#DC2626]', text: 'text-[#991B1B]' },
      sports: { bg: 'bg-[#D1FAE5]', border: 'border-[#10B981]', text: 'text-[#065F46]' },
      cultural: { bg: 'bg-[#FED7AA]', border: 'border-[#FB923C]', text: 'text-[#C2410C]' },
      academic: { bg: 'bg-[#DBEAFE]', border: 'border-[#3B82F6]', text: 'text-[#1E40AF]' },
      meeting: { bg: 'bg-[#F3F4F6]', border: 'border-[#6B7280]', text: 'text-[#374151]' },
      other: { bg: 'bg-[#FEF3C7]', border: 'border-[#F59E0B]', text: 'text-[#92400E]' }
    };
    
    const baseStyle = eventColors[eventType] || eventColors.other;
    
    if (priority === 'high') {
      return {
        ...baseStyle,
        bg: 'bg-[#FEE2E2]',
        border: 'border-[#DC2626]',
        text: 'text-[#991B1B]'
      };
    }
    
    return baseStyle;
  };

  const handleCommClassChange = (classId) => {
    setCommForm(prev => ({ ...prev, classId }));
    fetchCommContacts(classId);
  };

  const handleSendMessage = async (channel) => {
    const { classId, messageTo, selectedParentIdx, message } = commForm;
    if (!classId) { toast.error('Please select a class'); return; }
    if (!message.trim()) { toast.error('Please enter a message'); return; }
    if (messageTo === 'individual_parent' && selectedParentIdx === '') { toast.error('Please select a parent'); return; }

    let targets = commContacts;
    if (messageTo === 'individual_parent') {
      targets = [commContacts[Number(selectedParentIdx)]];
    }
    const emails = targets.map(c => c.parentEmail).filter(Boolean);
    const phones = targets.map(c => c.parentPhone).filter(Boolean);

    if ((channel === 'email' || channel === 'all') && emails.length === 0) {
      toast.error('No parent email addresses found for this class');
      if (channel === 'email') return;
    }
    if ((channel === 'whatsapp' || channel === 'sms' || channel === 'all') && phones.length === 0) {
      toast.error('No parent phone numbers found for this class');
      if (channel !== 'all') return;
    }

    setCommSending(true);
    try {
      const results = [];
      if (channel === 'email' || channel === 'all') {
        if (emails.length > 0) {
          await api.post('/api/communication/send-email', { recipients: emails, subject: commForm.messageType, message });
          results.push(`Email sent to ${emails.length} parent(s)`);
        }
      }
      if (channel === 'sms' || channel === 'all') {
        if (phones.length > 0) {
          await api.post('/api/communication/send-sms', { recipients: phones, message });
          results.push(`SMS sent to ${phones.length} parent(s)`);
        }
      }
      if (channel === 'whatsapp' || channel === 'all') {
        if (phones.length > 0) {
          await api.post('/api/communication/send-whatsapp', { recipients: phones, message });
          results.push(`WhatsApp sent to ${phones.length} parent(s)`);
        }
      }
      toast.success(results.join(', ') || 'Messages sent!');
      setCommForm(prev => ({ ...prev, message: '' }));
    } catch {
      toast.error('Failed to send message');
    } finally {
      setCommSending(false);
    }
  };

    const renderCommunication = () => (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#0F172A]">Communication Tools</h2>

        {/* Communication Channels - WhatsApp, Email, SMS */}
        <div className="bg-gradient-to-r from-[#10B981] to-[#059669] rounded-xl p-6 text-white">
          <h3 className="font-bold text-xl mb-4">Send Notifications via Multiple Channels</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 cursor-pointer transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold">WhatsApp</p>
                  <p className="text-xs text-white/80">Instant messaging</p>
                </div>
              </div>
              <p className="text-sm text-white/70">Send instant messages to parents via WhatsApp</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 cursor-pointer transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#EA4335] rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold">Email</p>
                  <p className="text-xs text-white/80">Detailed communication</p>
                </div>
              </div>
              <p className="text-sm text-white/70">Send detailed emails with attachments</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 cursor-pointer transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#4F46E5] rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold">SMS</p>
                  <p className="text-xs text-white/80">Quick alerts</p>
                </div>
              </div>
              <p className="text-sm text-white/70">Send quick SMS alerts to parents</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Bell className="text-[#DC2626]" size={20} />
              Messages from Management
            </h3>
            <div className="space-y-3">
              {commAnnouncements.filter(a => a.priority === 'high' || a.priority === 'urgent').length === 0 && commAnnouncements.length === 0 ? (
                <p className="text-sm text-[#64748B] text-center py-4">No messages from management</p>
              ) : (
                commAnnouncements.slice(0, 5).map((msg, idx) => (
                  <div key={msg._id || idx} className={`p-4 rounded-lg border-l-4 ${msg.priority === 'high' || msg.priority === 'urgent' ? 'bg-[#FEE2E2] border-[#DC2626]' :
                    msg.priority === 'normal' ? 'bg-[#FEF3C7] border-[#F59E0B]' :
                      'bg-[#F1F5F9] border-[#64748B]'
                    }`}>
                    <div className="flex justify-between items-start">
                      <p className="font-semibold">{msg.title}</p>
                      <span className="text-xs text-[#64748B]">{new Date(msg.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-[#64748B] mt-1">{msg.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <CalendarDays className="text-[#10B981]" size={20} />
              School Events
            </h3>
            <div className="space-y-3">
              {schoolEvents.length > 0 ? schoolEvents.map((event, idx) => {
                const style = getEventStyle(event.eventType, event.priority);
                return (
                  <div key={idx} className={`p-4 rounded-lg border-l-4 ${style.bg} ${style.border}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className={`font-semibold ${style.text}`}>{event.title}</h4>
                        <p className="text-sm text-[#64748B] mt-1">{event.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-[#64748B]">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(event.startDate).toLocaleDateString()}
                            {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString()}`}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <FileText size={12} />
                              {event.location}
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                            {event.eventType}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        event.status === 'upcoming' ? 'bg-[#DBEAFE] text-[#1E40AF]' :
                        event.status === 'ongoing' ? 'bg-[#D1FAE5] text-[#065F46]' :
                        event.status === 'completed' ? 'bg-[#F1F5F9] text-[#64748B]' :
                        'bg-[#FEE2E2] text-[#991B1B]'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                );
              }) : (
                <div className="p-8 text-center text-[#64748B]">
                  <CalendarDays className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-sm">No school events scheduled</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="text-[#10B981]" size={20} />
            Send Message to Students / Parents
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <select
              className="border-2 border-[#FCD34D] rounded-lg px-4 py-2"
              value={commForm.classId}
              onChange={(e) => handleCommClassChange(e.target.value)}
            >
              <option value="">Select Class</option>
              {commClasses.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <select
              className="border-2 border-[#FCD34D] rounded-lg px-4 py-2"
              value={commForm.messageTo}
              onChange={(e) => setCommForm(prev => ({ ...prev, messageTo: e.target.value, selectedParentIdx: '' }))}
            >
              <option value="all_parents">All Parents</option>
              <option value="individual_parent">Individual Parent</option>
            </select>
            <select
              className="border-2 border-[#FCD34D] rounded-lg px-4 py-2"
              value={commForm.messageType}
              onChange={(e) => setCommForm(prev => ({ ...prev, messageType: e.target.value }))}
            >
              <option value="announcement">General Announcement</option>
              <option value="homework">Homework Reminder</option>
              <option value="performance">Performance Update</option>
              <option value="behavior">Behavior Report</option>
            </select>
            <select
              className="border-2 border-[#FCD34D] rounded-lg px-4 py-2"
              value={commForm.sendVia}
              onChange={(e) => setCommForm(prev => ({ ...prev, sendVia: e.target.value }))}
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="all">All Channels</option>
            </select>
          </div>
          {commForm.messageTo === 'individual_parent' && commForm.classId && commContacts.length > 0 && (
            <select
              className="border-2 border-[#FCD34D] rounded-lg px-4 py-2 mb-4 w-full md:w-1/2"
              value={commForm.selectedParentIdx}
              onChange={(e) => setCommForm(prev => ({ ...prev, selectedParentIdx: e.target.value }))}
            >
              <option value="">Select Parent</option>
              {commContacts.map((c, idx) => (
                <option key={idx} value={idx}>
                  {c.parentName || 'Parent'} ({c.studentName}'s parent)
                </option>
              ))}
            </select>
          )}
          {/* Individual parent selected — show student details & contact info */}
          {commForm.messageTo === 'individual_parent' && commForm.selectedParentIdx !== '' && commContacts[Number(commForm.selectedParentIdx)] && (() => {
            const sel = commContacts[Number(commForm.selectedParentIdx)];
            return (
              <div className="mb-4 p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#64748B] mb-1">Student Details</p>
                    <p className="font-semibold text-[#0F172A]">{sel.studentName}</p>
                    <p className="text-sm text-[#64748B]">Class: {sel.className || '—'} {sel.rollNumber ? `| Roll No: ${sel.rollNumber}` : ''}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B] mb-1">Parent: {sel.parentName || '—'}</p>
                    {(commForm.sendVia === 'email' || commForm.sendVia === 'all') && (
                      <p className="text-sm flex items-center gap-1.5 mt-1">
                        <Mail size={14} className="text-[#EA4335]" />
                        <span className="font-medium text-[#0F172A]">{sel.parentEmail || 'No email available'}</span>
                      </p>
                    )}
                    {(commForm.sendVia === 'whatsapp' || commForm.sendVia === 'sms' || commForm.sendVia === 'all') && (
                      <p className="text-sm flex items-center gap-1.5 mt-1">
                        {commForm.sendVia === 'whatsapp' ? (
                          <span className="w-3.5 h-3.5 bg-[#25D366] rounded-full inline-flex items-center justify-center flex-shrink-0">
                            <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                          </span>
                        ) : commForm.sendVia === 'sms' ? (
                          <MessageSquare size={14} className="text-[#4F46E5] flex-shrink-0" />
                        ) : (
                          <span className="flex items-center gap-1 flex-shrink-0">
                            <span className="w-3.5 h-3.5 bg-[#25D366] rounded-full inline-flex items-center justify-center">
                              <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                            </span>
                            <MessageSquare size={14} className="text-[#4F46E5]" />
                          </span>
                        )}
                        <span className="font-medium text-[#0F172A]">{sel.parentPhone || 'No phone available'}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
          {commForm.classId && commContacts.length > 0 && commForm.messageTo === 'all_parents' && (
            <p className="text-xs text-[#64748B] mb-2">{commContacts.length} parent contact(s) found for this class</p>
          )}
          <textarea
            className="w-full border-2 border-[#FCD34D] rounded-lg px-4 py-3 h-32"
            placeholder="Type your message here..."
            value={commForm.message}
            onChange={(e) => setCommForm(prev => ({ ...prev, message: e.target.value }))}
          ></textarea>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="bg-[#25D366] text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
              disabled={commSending}
              onClick={() => handleSendMessage('whatsapp')}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </button>
            <button
              className="bg-[#EA4335] text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
              disabled={commSending}
              onClick={() => handleSendMessage('email')}
            >
              <Mail size={18} /> Email
            </button>
            <button
              className="bg-[#4F46E5] text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
              disabled={commSending}
              onClick={() => handleSendMessage('sms')}
            >
              <MessageSquare size={18} /> SMS
            </button>
            <button
              className="bg-[#0F172A] text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
              disabled={commSending}
              onClick={() => handleSendMessage('all')}
            >
              Send to All Channels
            </button>
          </div>
        </div>

        {/* <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Recent Conversations</h3>
          <div className="space-y-3">
            {[
              { parent: 'Mr. Kumar (Rahul\'s Father)', message: 'Thank you for the update on Rahul\'s progress.', time: 'Today, 10:30 AM', via: 'WhatsApp' },
              { parent: 'Mrs. Sharma (Priya\'s Mother)', message: 'Can we schedule a meeting to discuss Priya\'s performance?', time: 'Yesterday, 4:15 PM', via: 'Email' },
            ].map((conv, idx) => (
              <div key={idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{conv.parent}</p>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${conv.via === 'WhatsApp' ? 'bg-[#25D366]/20 text-[#25D366]' : 'bg-[#EA4335]/20 text-[#EA4335]'
                      }`}>{conv.via}</span>
                  </div>
                  <span className="text-xs text-[#64748B]">{conv.time}</span>
                </div>
                <p className="text-sm text-[#64748B] mt-1">{conv.message}</p>
                <button className="mt-2 text-sm text-[#4F46E5] font-semibold">Reply</button>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    );

  // 8. Payroll & Finance
  const renderPayroll = () => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const sal = latestSalary;
    const e = sal?.earnings || {};
    const d = sal?.deductions || {};
    const allowances = (e.hra || 0) + (e.transportAllowance || 0) + (e.medicalAllowance || 0) + (e.otherAllowances || 0);
    const slipTitle = sal ? `Salary Slip - ${monthNames[sal.month - 1]} ${sal.year}` : 'Salary Slip';

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#0F172A]">Payroll & Finance</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981]">
            <p className="text-sm text-[#64748B]">Basic Salary</p>
            <p className="text-2xl font-bold text-[#0F172A]">₹{(e.basicSalary || 0).toLocaleString()}</p>
          </div>
          <div className="p-6 bg-[#FEF3C7] rounded-xl border-2 border-[#F59E0B]">
            <p className="text-sm text-[#64748B]">Allowances</p>
            <p className="text-2xl font-bold text-[#0F172A]">₹{allowances.toLocaleString()}</p>
          </div>
          <div className="p-6 bg-[#FEE2E2] rounded-xl border-2 border-[#DC2626]">
            <p className="text-sm text-[#64748B]">Deductions</p>
            <p className="text-2xl font-bold text-[#0F172A]">₹{(sal?.totalDeductions || 0).toLocaleString()}</p>
          </div>
          <div className="p-6 bg-[#DBEAFE] rounded-xl border-2 border-[#3B82F6]">
            <p className="text-sm text-[#64748B]">Net Salary</p>
            <p className="text-2xl font-bold text-[#0F172A]">₹{(sal?.netSalary || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">{slipTitle}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-[#10B981]">Earnings</h4>
              <div className="space-y-2">
                <div className="flex justify-between p-2 bg-[#F8FAFC] rounded">
                  <span>Basic Salary</span>
                  <span className="font-semibold">₹{(e.basicSalary || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 bg-[#F8FAFC] rounded">
                  <span>House Rent Allowance</span>
                  <span className="font-semibold">₹{(e.hra || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 bg-[#F8FAFC] rounded">
                  <span>Transport Allowance</span>
                  <span className="font-semibold">₹{(e.transportAllowance || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 bg-[#F8FAFC] rounded">
                  <span>Medical Allowance</span>
                  <span className="font-semibold">₹{(e.medicalAllowance || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 bg-[#D1FAE5] rounded font-bold">
                  <span>Total Earnings</span>
                  <span>₹{(sal?.grossSalary || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-[#DC2626]">Deductions</h4>
              <div className="space-y-2">
                <div className="flex justify-between p-2 bg-[#F8FAFC] rounded">
                  <span>Provident Fund</span>
                  <span className="font-semibold">₹{(d.providentFund || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 bg-[#F8FAFC] rounded">
                  <span>Professional Tax</span>
                  <span className="font-semibold">₹{(d.professionalTax || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 bg-[#F8FAFC] rounded">
                  <span>TDS</span>
                  <span className="font-semibold">₹{(d.tds || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 bg-[#FEE2E2] rounded font-bold">
                  <span>Total Deductions</span>
                  <span>₹{(sal?.totalDeductions || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-[#4F46E5] text-white rounded-lg flex justify-between items-center">
            <div>
              <p className="text-sm opacity-80">Net Payable Amount</p>
              <p className="text-3xl font-bold">₹{(sal?.netSalary || 0).toLocaleString()}</p>
            </div>
            <button className="bg-white text-[#4F46E5] px-6 py-2 rounded-lg font-semibold flex items-center gap-2">
              <Download size={18} /> Download Slip
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Payment History</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-sm">Month</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Gross Salary</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Deductions</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Net Salary</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Status</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Slip</th>
                </tr>
              </thead>
              <tbody>
                {payrollHistory.length > 0 ? payrollHistory.map((payment, idx) => (
                  <tr key={payment._id || idx} className="border-b border-[#E2E8F0]">
                    <td className="px-4 py-3 text-sm font-semibold">{monthNames[payment.month - 1]} {payment.year}</td>
                    <td className="px-4 py-3 text-sm">₹{(payment.grossSalary || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-[#DC2626]">₹{(payment.totalDeductions || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-bold text-[#10B981]">₹{(payment.netSalary || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${payment.status === 'paid' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEF3C7] text-[#92400E]'}`}>{payment.status === 'paid' ? 'Paid' : 'Pending'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-[#4F46E5]"><Download size={18} /></button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-[#64748B]">No payment history found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Reimbursement Claims</h3>
          <div className="space-y-3 mb-4">
            {reimbursements.length > 0 ? reimbursements.map((claim, idx) => (
              <div key={claim._id || idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold">{claim.title}</p>
                  <p className="text-sm text-[#64748B]">{formatDate(claim.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{(claim.amount || 0).toLocaleString()}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${claim.status === 'approved' ? 'bg-[#D1FAE5] text-[#065F46]' : claim.status === 'rejected' ? 'bg-[#FEE2E2] text-[#991B1B]' : 'bg-[#FEF3C7] text-[#92400E]'
                    }`}>{claim.status}</span>
                </div>
              </div>
            )) : (
              <p className="text-center text-[#64748B] py-4">No reimbursement claims found.</p>
            )}
          </div>
          <button onClick={() => setShowReimbursementModal(true)} className="bg-[#4F46E5] text-white px-6 py-2 rounded-lg font-semibold">Submit New Claim</button>
        </div>

        {showReimbursementModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-4">Submit Reimbursement</h2>
              <form onSubmit={handleSubmitReimbursement} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Title</label>
                  <input type="text" required value={reimbursementForm.title} onChange={(ev) => setReimbursementForm({ ...reimbursementForm, title: ev.target.value })} placeholder="e.g., Travel Reimbursement" className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Amount (₹)</label>
                  <input type="number" required min="1" value={reimbursementForm.amount} onChange={(ev) => setReimbursementForm({ ...reimbursementForm, amount: ev.target.value })} className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Description</label>
                  <textarea value={reimbursementForm.description} onChange={(ev) => setReimbursementForm({ ...reimbursementForm, description: ev.target.value })} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowReimbursementModal(false)} className="flex-1 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 h-10 px-4 py-2 rounded-lg font-medium transition-colors">Cancel</button>
                  <button type="submit" disabled={reimbursementSubmitting} className="flex-1 bg-[#4F46E5] text-white hover:bg-[#4338CA] h-10 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">{reimbursementSubmitting ? 'Submitting...' : 'Submit Claim'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };



  // 10. Documents & Resources
  const renderDocuments = () => {
    const categoryMap = {
      policy: { title: 'School Policies', icon: FileText, color: '#4F46E5' },
      handbook: { title: 'Staff Handbook', icon: Book, color: '#10B981' },
      circular: { title: 'Circulars & Notices', icon: Bell, color: '#F59E0B' },
      training: { title: 'Training Materials', icon: Award, color: '#7C3AED' },
    };
    const categoryCounts = {};
    for (const key of Object.keys(categoryMap)) {
      categoryCounts[key] = documents.filter(d => d.category === key).length;
    }
    const generalDocs = documents.filter(d => !['policy', 'handbook', 'circular', 'training'].includes(d.category));
    if (generalDocs.length > 0) categoryCounts.general = generalDocs.length;

    const policies = documents.filter(d => d.category === 'policy');
    const handbooks = documents.filter(d => d.category === 'handbook');
    const circulars = documents.filter(d => d.category === 'circular');
    const training = documents.filter(d => d.category === 'training');

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#0F172A]">Documents & Resources</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(categoryMap).map(([key, item], idx) => (
            <div key={idx} className="p-4 bg-white rounded-xl border-2 border-[#FCD34D] hover:shadow-md transition-shadow cursor-pointer">
              <item.icon className="mb-3" style={{ color: item.color }} size={28} />
              <h3 className="font-bold">{item.title}</h3>
              <p className="text-sm text-[#64748B]">{categoryCounts[key] || 0} Documents</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">School Policies</h3>
          <div className="space-y-3">
            {policies.length > 0 ? policies.map((doc, idx) => (
              <div key={doc._id || idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center hover:bg-[#F8FAFC]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                    <FileText className="text-[#4F46E5]" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{doc.title}</p>
                    <p className="text-xs text-[#64748B]">{formatDate(doc.createdAt)} • {formatFileSize(doc.size)}</p>
                  </div>
                </div>
                <button onClick={() => handleDownloadDocument(doc._id)} className="text-[#4F46E5] hover:bg-[#EEF2FF] p-2 rounded-lg transition-colors">
                  <Download size={18} />
                </button>
              </div>
            )) : (
              <p className="text-center text-[#64748B] py-4">No policy documents found.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Staff Handbook</h3>
          {handbooks.length > 0 ? (
            <div className="p-6 bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2] rounded-lg text-center">
              <Book className="mx-auto text-[#F59E0B] mb-3" size={48} />
              <h4 className="font-bold text-lg mb-2">{handbooks[0].title}</h4>
              <p className="text-sm text-[#64748B] mb-4">{handbooks[0].description || 'Complete guide for all staff members including policies, procedures, and guidelines.'}</p>
              <button onClick={() => handleDownloadDocument(handbooks[0]._id)} className="bg-[#4F46E5] text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 mx-auto">
                <Download size={18} /> Download Handbook
              </button>
            </div>
          ) : (
            <p className="text-center text-[#64748B] py-4">No handbook uploaded yet.</p>
          )}
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Recent Circulars & Notices</h3>
          <div className="space-y-3">
            {circulars.length > 0 ? circulars.map((item, idx) => (
              <div key={item._id || idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-xs text-[#64748B]">{formatDate(item.createdAt)}</p>
                </div>
                <button onClick={() => handleDownloadDocument(item._id)} className="text-[#4F46E5] hover:bg-[#EEF2FF] p-2 rounded-lg transition-colors">
                  <Download size={18} />
                </button>
              </div>
            )) : (
              <p className="text-center text-[#64748B] py-4">No circulars found.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Training Materials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {training.length > 0 ? training.map((material, idx) => (
              <div key={material._id || idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#EDE9FE]">
                  <FileText className="text-[#7C3AED]" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{material.title}</p>
                  <p className="text-xs text-[#64748B]">{formatFileSize(material.size)} • {formatDate(material.createdAt)}</p>
                </div>
                <button onClick={() => handleDownloadDocument(material._id)} className="text-[#4F46E5] hover:bg-[#EEF2FF] p-2 rounded-lg transition-colors">
                  <Download size={18} />
                </button>
              </div>
            )) : (
              <p className="text-center text-[#64748B] py-4 col-span-2">No training materials found.</p>
            )}
          </div>
        </div>
      </div>
    );
  };



  // 12. Settings & Support
  const renderSettings = () => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#0F172A]">Settings & Support</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Settings className="text-[#64748B]" size={20} />
            Profile Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Display Name</label>
              <input 
                type="text" 
                defaultValue={ user?.name || 'Staff User'} 
                placeholder={loading ? 'Loading...' : 'Enter display name'}
                disabled={loading}
                className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2 disabled:opacity-50" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input 
                type="email" 
                defaultValue={ user?.email || 'staff@ajmschool.edu'} 
                placeholder={loading ? 'Loading...' : 'Enter email address'}
                disabled={loading}
                className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2 disabled:opacity-50" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input 
                type="tel" 
                defaultValue={staffData?.contact } 
                placeholder={loading ? 'Loading...' : 'Enter phone number'}
                disabled={loading}
                className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2 disabled:opacity-50" 
              />
              {!loading && !staffData?.contact && (
                <p className="text-xs text-[#64748B] mt-1">Contact information not available in profile</p>
              )}
            </div>
            <button className="bg-[#4F46E5] text-white px-6 py-2 rounded-lg font-semibold">Update Profile</button>
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <User className="text-[#64748B]" size={20} />
            Security Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Current Password</label>
              <input type="password" placeholder="••••••••" className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <input type="password" placeholder="••••••••" className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <input type="password" placeholder="••••••••" className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2" />
            </div>
            <button className="bg-[#DC2626] text-white px-6 py-2 rounded-lg font-semibold">Change Password</button>
          </div>
        </div>
      </div>


    </div>
  );

  const modules = [
    { id: 'profile', name: 'Profile', icon: User, render: renderProfile },
    { id: 'attendance', name: 'Attendance', icon: Calendar, render: renderAttendance },
    { id: 'timetable', name: 'Timetable', icon: BookOpen, render: renderTimetable },
    { id: 'classes', name: 'Classes', icon: Users, render: renderClassManagement },
    { id: 'academic', name: 'Academic', icon: FileText, render: renderAcademic },
    { id: 'marks', name: 'Marks', icon: ClipboardCheck, render: renderMarks },
    { id: 'communication', name: 'Communication', icon: MessageSquare, render: renderCommunication },
    { id: 'payroll', name: 'Payroll', icon: DollarSign, render: renderPayroll },
    { id: 'documents', name: 'Documents & Resources', icon: Book, render: renderDocuments },
    { id: 'settings', name: 'Settings', icon: Settings, render: renderSettings },
  ];

  // Render the module based on the prop passed from route
  const currentModule = modules.find(m => m.id === module) || modules[0];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2] rounded-2xl p-6 border-2 border-[#FCD34D]">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] mb-1">Welcome, {user?.name}!</h1>
        <p className="text-base text-[#64748B]">Staff Portal - AJM International Institution</p>
      </div>

      <div>
        {currentModule.render()}
      </div>

      {showLessonPlanModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border-2 border-[#FCD34D]">
            <h2 className="text-xl font-bold mb-4">Upload Lesson Plan</h2>
            <form onSubmit={handleCreateLessonPlan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={lessonPlanForm.title}
                  onChange={(e) => setLessonPlanForm({ ...lessonPlanForm, title: e.target.value })}
                  className="w-full border-2 border-[#E2E8F0] rounded-lg px-3 py-2"
                  placeholder="e.g. Chapter 4: Matter & States"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Class</label>
                <select
                  required
                  value={lessonPlanForm.classId}
                  onChange={(e) => setLessonPlanForm({ ...lessonPlanForm, classId: e.target.value })}
                  className="w-full border-2 border-[#E2E8F0] rounded-lg px-3 py-2"
                >
                  <option value="">Select Class</option>
                  {(staffData?.classesAssigned || []).map(c => (
                    <option key={c._id} value={c._id}>{c.name} {c.section}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={lessonPlanForm.subject}
                  onChange={(e) => setLessonPlanForm({ ...lessonPlanForm, subject: e.target.value })}
                  className="w-full border-2 border-[#E2E8F0] rounded-lg px-3 py-2"
                  placeholder="e.g. Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={lessonPlanForm.date}
                  onChange={(e) => setLessonPlanForm({ ...lessonPlanForm, date: e.target.value })}
                  className="w-full border-2 border-[#E2E8F0] rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Document (PDF/Word)</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setLessonPlanForm({ ...lessonPlanForm, file: e.target.files[0] })}
                  className="w-full border-2 border-[#E2E8F0] rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setShowLessonPlanModal(false)}
                  className="px-4 py-2 text-sm font-semibold border-2 border-[#E2E8F0] rounded-lg hover:bg-gray-50 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={lessonPlanSubmitting}
                  className="px-4 py-2 text-sm font-semibold bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors disabled:opacity-50"
                >
                  {lessonPlanSubmitting ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showHomeworkModal && (() => {
        const hwClassId = homeworkForm.classId || selectedAcademicClass;
        const hwClassObj = (staffData?.classesAssigned || classDetail || []).find(c => c._id === hwClassId);
        return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-[#0F172A] mb-4">Assign Homework — {hwClassObj?.name || ''} {hwClassObj?.section || ''}</h2>
            <form onSubmit={handleCreateHomework} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Title</label>
                <input type="text" required value={homeworkForm.title} onChange={(ev) => setHomeworkForm({ ...homeworkForm, title: ev.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Subject</label>
                {classSubjects.length > 0 ? (
                  <select required value={homeworkForm.subject} onChange={(ev) => setHomeworkForm({ ...homeworkForm, subject: ev.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
                    <option value="">Select subject</option>
                    {classSubjects.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                  </select>
                ) : (
                  <input type="text" required placeholder="e.g. Mathematics" value={homeworkForm.subject} onChange={(ev) => setHomeworkForm({ ...homeworkForm, subject: ev.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Description (optional)</label>
                <textarea value={homeworkForm.description} onChange={(ev) => setHomeworkForm({ ...homeworkForm, description: ev.target.value })} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Due Date</label>
                <input type="date" required value={homeworkForm.dueDate} onChange={(ev) => setHomeworkForm({ ...homeworkForm, dueDate: ev.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Attachments (optional, max 5 files, 20MB each)</label>
                <input type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png" onChange={(ev) => setHomeworkForm({ ...homeworkForm, files: Array.from(ev.target.files) })} className="w-full border-2 border-[#E2E8F0] rounded-lg px-3 py-2 text-sm" />
                {homeworkForm.files.length > 0 && (
                  <p className="text-xs text-[#10B981] mt-1">{homeworkForm.files.length} file(s) selected</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowHomeworkModal(false)} className="flex-1 h-10 border border-slate-200 rounded-lg font-medium">Cancel</button>
                <button type="submit" disabled={homeworkSubmitting} className="flex-1 h-10 bg-[#10B981] text-white rounded-lg font-medium disabled:opacity-50">{homeworkSubmitting ? 'Saving...' : 'Assign'}</button>
              </div>
            </form>
          </div>
        </div>
        );
      })()}

      {showMarkAttendanceModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 border-2 border-[#FCD34D] max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#0F172A]">Mark Attendance</h2>
              <button onClick={() => setShowMarkAttendanceModal(false)} className="text-gray-500 hover:text-gray-700">
                <XCircle size={24} />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-[#0F172A]">Select Date:</label>
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-[#F59E0B]" />
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => handleAttendanceDateChange(e.target.value)}
                    className="h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleMarkAllPresentRecords}
                  className="flex items-center gap-2 px-4 py-2 bg-[#10B981] text-white hover:bg-[#059669] rounded-lg font-semibold"
                >
                  <Check size={18} />
                  Mark All Present
                </button>
                <button
                  onClick={handleSaveAttendanceRecords}
                  disabled={attendanceLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-[#4F46E5] text-white hover:bg-[#4338CA] rounded-lg font-semibold disabled:opacity-50"
                >
                  {attendanceLoading ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white rounded-xl border-2 border-[#E2E8F0] shadow-sm">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2] sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A]">Roll No</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A]">Student Name</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-[#0F172A]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendanceLoading && attendanceStudents.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-[#64748B]">Loading students...</td>
                    </tr>
                  ) : attendanceStudents.length > 0 ? (
                    attendanceStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-[#FFFBEB]">
                        <td className="px-6 py-4 text-sm font-semibold text-[#0F172A]">{student.rollNumber || '-'}</td>
                        <td className="px-6 py-4 text-sm text-[#0F172A]">{student.name}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => handleAttendanceRecordChange(student._id, 'present')}
                              className={`flex items-center gap-1 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${attendanceRecords[student._id] === 'present'
                                ? 'bg-[#10B981] text-white'
                                : 'bg-gray-200 text-[#0F172A] hover:bg-gray-300'
                                }`}
                            >
                              <CheckCircle size={16} />
                              Present
                            </button>
                            <button
                              onClick={() => handleAttendanceRecordChange(student._id, 'absent')}
                              className={`flex items-center gap-1 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${attendanceRecords[student._id] === 'absent'
                                ? 'bg-[#DC2626] text-white'
                                : 'bg-gray-200 text-[#0F172A] hover:bg-gray-300'
                                }`}
                            >
                              <XCircle size={16} />
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-[#64748B]">No students found in this class.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StaffDashboard;
