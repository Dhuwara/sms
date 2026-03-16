import { useState, useEffect, useRef } from 'react';
import api from '@/utils/api';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPTMs, createPTM, deletePTM, fetchAnnouncements as fetchAnnouncementsAction, fetchSchoolEvents } from '@/store/slices/communicationSlice';
import { fetchClasses } from '@/store/slices/classesSlice';
import {
  Calendar, CheckCircle, XCircle, Check
} from 'lucide-react';

import Profile from './pages/Profile';
import Attendance from './pages/Attendance';
import Timetable from './pages/Timetable';
import Classes from './pages/Classes';
import Academic from './pages/Academic';
import Marks from './pages/Marks';
import Communication from './pages/Communication';
import Payroll from './pages/Payroll';
import Library from './pages/Library';
import Documents from './pages/Documents';
import Settings from './pages/Settings';

const StaffDashboard = ({ user, module = 'profile' }) => {
  const dispatch = useDispatch();
  const commClasses = useSelector(s => s.classes.list);
  const commAnnouncements = useSelector(s => s.communication.announcements);
  const ptmList = useSelector(s => s.communication.ptmList);
  const schoolEvents = useSelector(s => s.communication.schoolEvents);

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
  const [pendingStudentLeaves, setPendingStudentLeaves] = useState([]);
  const [myLibraryIssues, setMyLibraryIssues] = useState([]);
  const [isStudentDenyModalOpen, setIsStudentDenyModalOpen] = useState(false);
  const [studentDenyReason, setStudentDenyReason] = useState('');
  const [selectedStudentLeaveId, setSelectedStudentLeaveId] = useState(null);
  const [studentActionLoading, setStudentActionLoading] = useState(false);

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
  const [commContacts, setCommContacts] = useState([]);
  const [commForm, setCommForm] = useState({ classId: '', messageTo: 'all_parents', selectedParentIdx: '', messageType: 'announcement', sendVia: 'whatsapp', message: '' });
  const [commSending, setCommSending] = useState(false);

  // PTM State
  const [ptmForm, setPtmForm] = useState({ title: '', date: '', time: '', venue: '', targetAudience: 'all', classIds: [], notes: '' });
  const ptmLoading = useSelector(s => s.communication.ptmStatus) === 'loading';

  // Academic Content State
  const [academicClasses, setAcademicClasses] = useState([]);
  const [lessonPlans, setLessonPlans] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [classHomework, setClassHomework] = useState([]);
  const [onlineClasses, setOnlineClasses] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);

  // Forms & Modals for Academic Content
  const [showLessonPlanModal, setShowLessonPlanModal] = useState(false);
  const [lessonPlanForm, setLessonPlanForm] = useState({ title: '', classId: '', subject: '', date: '', file: null });
  const [lessonPlanSubmitting, setLessonPlanSubmitting] = useState(false);

  const [showStudyMaterialModal, setShowStudyMaterialModal] = useState(false);
  const [studyMaterialForm, setStudyMaterialForm] = useState({ title: '', subject: '', description: '', file: null });
  const [studyMaterialSubmitting, setStudyMaterialSubmitting] = useState(false);

  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [homeworkForm, setHomeworkForm] = useState({ title: '', description: '', subject: '', dueDate: '', files: [] });
  const [homeworkSubmitting, setHomeworkSubmitting] = useState(false);

  const [showOnlineClassModal, setShowOnlineClassModal] = useState(false);
  const [onlineClassForm, setOnlineClassForm] = useState({ title: '', platform: 'Google Meet', link: '', date: '', time: '', subject: '', classId: '' });
  const [onlineClassSubmitting, setOnlineClassSubmitting] = useState(false);

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  // Academic class selection
  const [selectedAcademicClass, setSelectedAcademicClass] = useState('');

  // Marks & Assessment State
  const [timetableAssignments, setTimetableAssignments] = useState([]);
  const [marksClassId, setMarksClassId] = useState('');
  const [marksExams, setMarksExams] = useState([]);
  const [marksExamId, setMarksExamId] = useState('');
  const [marksStudents, setMarksStudents] = useState([]);
  const [marksEntries, setMarksEntries] = useState({});
  const [marksLoading, setMarksLoading] = useState(false);
  const [marksSaving, setMarksSaving] = useState(false);
  const [marksLoaded, setMarksLoaded] = useState(false);
  const [marksAnalysis, setMarksAnalysis] = useState(null);

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
    lessonPlans: false,
    studyMaterials: false,
    classHomework: false,
    onlineClasses: false,
  });

  useEffect(() => {
    fetchStaffData();
  }, [user?.id]);

  useEffect(() => {
    if (module === 'attendance') {
      console.log('Attendance module loaded, fetching data...');
      fetchingRef.current = { ...fetchingRef.current, today: false, history: false, balance: false, leaves: false, staff: false };

      fetchTodayAttendance();
      fetchAttendanceHistory();
      fetchLeaveBalance();
      fetchMyLeaves();
      fetchStaffList();
      fetchPendingStudentLeaves();
    }
  }, [module]);

  useEffect(() => {
    if (module === 'timetable') {
      console.log('Timetable module loaded, fetching data...');
      fetchingRef.current = { ...fetchingRef.current, timetable: false, substitutions: false, examDuties: false };

      fetchMyTimetable();
      fetchSubstitutions();
      fetchExamDuties();
      fetchSchoolEventsData();
    }
    if (module === 'leave') {
      fetchingRef.current = { ...fetchingRef.current, balance: false, leaves: false, staff: false, approvals: false };
      fetchLeaveBalance();
      fetchMyLeaves();
      fetchStaffList();
      fetchPendingApprovals();
      fetchPendingStudentLeaves();
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
      fetchingRef.current = { ...fetchingRef.current, lessonPlans: false, examDuties: false, studyMaterials: false, classHomework: false, onlineClasses: false };
      fetchExamDuties();
      fetchLessonPlans('');
      fetchStudyMaterials('');
      fetchClassHomework('');
      fetchOnlineClasses('');
      api.get('/api/staff/my-academic-classes')
        .then(res => setAcademicClasses(res.data?.data || res.data || []))
        .catch(() => setAcademicClasses([]));
    }
    if (module === 'marks') {
      api.get('/api/staff/timetable-assignments')
        .then(res => setTimetableAssignments(res.data || []))
        .catch(() => toast.error('Failed to load timetable assignments'));
    }
    if (module === 'communication') {
      fetchCommClasses();
      fetchAnnouncements();
      fetchPtmList();
      fetchSchoolEventsData();
    }
    if (module === 'library') {
      api.get('/api/library/my-issues')
        .then(res => setMyLibraryIssues(res.data || []))
        .catch(() => {});
    }
  }, [module]);

  // Re-fetch academic content when selected class changes
  useEffect(() => {
    if (module !== 'academic') return;
    fetchingRef.current._academicClassId = selectedAcademicClass;
    fetchingRef.current.lessonPlans = false;
    fetchingRef.current.studyMaterials = false;
    fetchingRef.current.classHomework = false;
    fetchingRef.current.onlineClasses = false;

    fetchLessonPlans(selectedAcademicClass);
    fetchStudyMaterials(selectedAcademicClass);
    fetchClassHomework(selectedAcademicClass);
    fetchOnlineClasses(selectedAcademicClass);
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
        console.log("hitsstudentsss")
        const response = await api.get(`/api/staff/classes/${selectedClassForStudents}/students`);
        console.log(response, "responseee")
        setClassStudents(response.data || []);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load students');
      }
    };
    fetchStudents();
  }, [selectedClassForStudents]);

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
      const attendanceData = response.data?.data || response.data || null;
      console.log('Today Attendance Data:', attendanceData);
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
      console.log(response, "reponseee")
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
    if (fetchingRef.current.leaves) return;
    fetchingRef.current.leaves = true;
    try {
      const response = await api.get('/api/staff/my-leaves');
      console.log(response, "pepeepp")
      setMyLeaves(response?.data || []);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      fetchingRef.current.leaves = false;
    }
  };

  const fetchStaffList = async () => {
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
  const fetchLessonPlans = async (classId) => {
    if (fetchingRef.current.lessonPlans) return;
    fetchingRef.current.lessonPlans = true;
    try {
      const params = classId ? `?classId=${classId}` : '';
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
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Lesson Plan',
      message: 'Are you sure you want to delete this lesson plan? This action cannot be undone.',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await api.delete(`/api/lesson-plans/${id}`);
          setLessonPlans((prev) => prev.filter((lp) => lp._id !== id));
          toast.success('Lesson plan deleted');
        } catch (error) {
          toast.error('Failed to delete lesson plan');
        }
      }
    });
  };

  const fetchStudyMaterials = async (classId) => {
    if (fetchingRef.current.studyMaterials) return;
    fetchingRef.current.studyMaterials = true;
    try {
      const params = classId ? `?classId=${classId}` : '';
      const response = await api.get(`/api/study-materials${params}`);
      setStudyMaterials(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching study materials:', error);
    } finally {
      fetchingRef.current.studyMaterials = false;
    }
  };

  const fetchClassHomework = async (classId) => {
    if (fetchingRef.current.classHomework) return;
    fetchingRef.current.classHomework = true;
    try {
      const params = classId ? `?classId=${classId}` : '';
      const response = await api.get(`/api/homework/my-assigned${params}`);
      setClassHomework(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching homework:', error);
    } finally {
      fetchingRef.current.classHomework = false;
    }
  };

  const fetchOnlineClasses = async (classId) => {
    console.log(classId, "classId")
    if (!classId) return;
    if (fetchingRef.current.onlineClasses) return;
    fetchingRef.current.onlineClasses = true;
    try {
      const response = await api.get(`/api/online-classes/class/${classId}`);
      console.log(response, "response")
      setOnlineClasses(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching online classes:', error);
    } finally {
      fetchingRef.current.onlineClasses = false;
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
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Study Material',
      message: 'Are you sure you want to delete this study material? This action cannot be undone.',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await api.delete(`/api/study-materials/${id}`);
          setStudyMaterials((prev) => prev.filter((m) => m._id !== id));
          toast.success('Study material deleted');
        } catch (error) {
          toast.error('Failed to delete study material');
        }
      }
    });
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
    if (!homeworkForm.title || !homeworkForm.subject || !homeworkForm.dueDate || !selectedAcademicClass) {
      toast.error('Title, subject, class, and due date are required');
      return;
    }
    setHomeworkSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', homeworkForm.title);
      fd.append('description', homeworkForm.description);
      fd.append('classId', selectedAcademicClass);
      fd.append('subject', homeworkForm.subject);
      fd.append('dueDate', homeworkForm.dueDate);
      for (const file of homeworkForm.files) fd.append('files', file);
      await api.post('/api/homework', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Homework assigned');
      setShowHomeworkModal(false);
      setHomeworkForm({ title: '', description: '', subject: '', dueDate: '', files: [] });
      fetchClassHomework(selectedAcademicClass);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create homework');
    } finally {
      setHomeworkSubmitting(false);
    }
  };

  const handleDeleteHomework = async (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Homework',
      message: 'Are you sure you want to delete this homework assignment? Students will no longer see it.',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await api.delete(`/api/homework/${id}`);
          setClassHomework((prev) => prev.filter((h) => h._id !== id));
          toast.success('Homework deleted');
        } catch (error) {
          toast.error('Failed to delete homework');
        }
      }
    });
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

  const fetchPendingStudentLeaves = async () => {
    try {
      const response = await api.get('/api/student-leaves/staff/pending');
      setPendingStudentLeaves(response.data || []);
    } catch (error) {
      console.error('Error fetching pending student leaves:', error);
    }
  };

  const handleStudentLeaveAction = async (id, action, reason = '') => {
    setStudentActionLoading(true);
    try {
      await api.put(`/api/student-leaves/staff/action/${id}`, { action, reason });
      toast.success(`Student leave ${action === 'approve' ? 'approved' : 'denied'} successfully`);
      fetchPendingStudentLeaves();
      if (action === 'deny') {
        setIsStudentDenyModalOpen(false);
        setStudentDenyReason('');
        setSelectedStudentLeaveId(null);
      }
    } catch (err) {
      console.error('Failed to update student leave status:', err);
      toast.error(err.response?.data?.message || 'Failed to update student leave status');
    } finally {
      setStudentActionLoading(false);
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

  const handleDownloadSalarySlip = (payment) => {
    if (!payment) {
      toast.error('Salary data not found');
      return;
    }

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const filename = `Salary-Slip-${monthNames[payment.month - 1]}-${payment.year}.pdf`;

    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.backgroundColor = 'white';
    element.style.color = '#0F172A';
    element.style.fontFamily = 'Arial, sans-serif';

    const e = payment.earnings || {};
    const d = payment.deductions || {};

    element.innerHTML = `
      <div style="text-align: center; border-bottom: 3px solid #FCD34D; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px;">${staffData?.userId?.name || 'Staff Member'}</h1>
        <p style="margin: 5px 0; color: #64748B;">Staff ID: ${staffData?.employeeId || 'N/A'}</p>
        <h2 style="margin: 20px 0 0; color: #4F46E5;">Salary Slip: ${monthNames[payment.month - 1]} ${payment.year}</h2>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
        <div>
          <h3 style="color: #10B981; border-bottom: 1px solid #E2E8F0; padding-bottom: 10px;">Earnings</h3>
          <div style="display: flex; justify-content: space-between; padding: 8px 0;"><span>Basic Salary</span> <b>₹${(e.basicSalary || 0).toLocaleString()}</b></div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0;"><span>HRA</span> <b>₹${(e.hra || 0).toLocaleString()}</b></div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0;"><span>Transport Allowance</span> <b>₹${(e.transportAllowance || 0).toLocaleString()}</b></div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0;"><span>Medical Allowance</span> <b>₹${(e.medicalAllowance || 0).toLocaleString()}</b></div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-top: 1px solid #E2E8F0; font-weight: bold;"><span>Gross Salary</span> <span>₹${(payment.grossSalary || 0).toLocaleString()}</span></div>
        </div>

        <div>
          <h3 style="color: #DC2626; border-bottom: 1px solid #E2E8F0; padding-bottom: 10px;">Deductions</h3>
          <div style="display: flex; justify-content: space-between; padding: 8px 0;"><span>Provident Fund</span> <b>₹${(d.providentFund || 0).toLocaleString()}</b></div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0;"><span>Professional Tax</span> <b>₹${(d.professionalTax || 0).toLocaleString()}</b></div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0;"><span>TDS</span> <b>₹${(d.tds || 0).toLocaleString()}</b></div>
          <div style="height: 38px;"></div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-top: 1px solid #E2E8F0; font-weight: bold;"><span>Total Deductions</span> <span>₹${(payment.totalDeductions || 0).toLocaleString()}</span></div>
        </div>
      </div>

      <div style="background-color: #4F46E5; color: white; padding: 20px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <p style="margin: 0; opacity: 0.8; font-size: 14px;">Net Payable Amount</p>
          <p style="margin: 0; font-size: 32px; font-weight: bold;">₹${(payment.netSalary || 0).toLocaleString()}</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; font-size: 14px;">Status: <b>${payment.status.toUpperCase()}</b></p>
          <p style="margin: 5px 0 0; font-size: 12px; opacity: 0.7;">Payment Date: ${payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>

      <div style="margin-top: 50px; border-top: 1px solid #E2E8F0; padding-top: 20px; color: #64748B; font-size: 12px; text-align: center;">
        <p>This is a computer generated salary slip and does not require a physical signature.</p>
        <p>© ${new Date().getFullYear()} School Management System</p>
      </div>
    `;

    document.body.appendChild(element);

    const opt = {
      margin: 10,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      document.body.removeChild(element);
      toast.success('Salary slip downloaded');
    });
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

  const handleDownloadDocument = async (doc) => {
    try {
      const response = await api.get(`/api/documents/${doc._id}/download`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: doc.mimeType || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.originalName || doc.title || 'document');
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

  const handleOnlineClassSubmit = async (e) => {
    e.preventDefault();
    setOnlineClassSubmitting(true);
    try {
      const payload = {
        title: onlineClassForm.title,
        platform: onlineClassForm.platform,
        meetingLink: onlineClassForm.link,
        date: onlineClassForm.date,
        time: onlineClassForm.time,
        subject: onlineClassForm.subject,
        classId: selectedAcademicClass
      };
      await api.post('/api/online-classes', payload);
      toast.success('Online class scheduled successfully');
      setShowOnlineClassModal(false);
      setOnlineClassForm({ title: '', platform: 'Google Meet', link: '', date: '', time: '', subject: '', classId: '' });
      fetchOnlineClasses(selectedAcademicClass);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule online class');
    } finally {
      setOnlineClassSubmitting(false);
    }
  };

  const handleDeleteOnlineClass = async (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Online Class',
      message: 'Are you sure you want to delete this online class? This action cannot be undone.',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await api.delete(`/api/online-classes/${id}`);
          toast.success('Online class deleted successfully');
          setOnlineClasses((prev) => prev.filter((oc) => oc._id !== id));
        } catch (error) {
          toast.error('Failed to delete online class');
        }
      }
    });
  };

  const formatTime = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

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
      const assignment = timetableAssignments.find(a => {
        const aId = a.classId?._id || a.classId;
        return String(aId) === String(classId);
      });
      const taughtSubjects = (assignment?.subjects || []).map(s => s.toLowerCase());
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
      setMarksStudents(students);
      const entries = {};
      results.forEach(r => {
        const sid = r.studentId?._id || r.studentId;
        if (sid) entries[sid] = String(r.marks);
      });
      setMarksEntries(entries);
      setMarksLoaded(true);
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

      const scored = results;
      const values = scored.map(r => r.marks);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const highest = Math.max(...values);
      const lowest = Math.min(...values);
      const highestStudent = marksStudents.find(s => marksEntries[s._id] === String(highest));
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
        subject: selectedExam?.subject || '',
        examType: selectedExam?.examType || '',
      });
    } catch {
      toast.error('Failed to save marks');
    } finally {
      setMarksSaving(false);
    }
  };

  // Communication Functions
  const fetchCommClasses = () => dispatch(fetchClasses());
  const fetchSchoolEventsData = () => dispatch(fetchSchoolEvents());
  const fetchAnnouncements = () => dispatch(fetchAnnouncementsAction('staff'));
  const fetchPtmList = () => dispatch(fetchPTMs());

  const handlePtmSubmit = async (e) => {
    e.preventDefault();
    const { title, date, time, venue, targetAudience, classIds, notes } = ptmForm;
    if (!title || !date || !time || !venue) { toast.error('Title, date, time and venue are required'); return; }
    if (targetAudience === 'class' && classIds.length === 0) { toast.error('Select at least one class'); return; }
    try {
      await dispatch(createPTM({ title, date, time, venue, targetAudience, classIds, notes })).unwrap();
      toast.success('PTM scheduled successfully');
      setPtmForm({ title: '', date: '', time: '', venue: '', targetAudience: 'all', classIds: [], notes: '' });
    } catch (err) {
      toast.error(err?.message || 'Failed to schedule PTM');
    }
  };

  const handleDeletePtm = async (id) => {
    try {
      await dispatch(deletePTM(id)).unwrap();
      toast.success('PTM deleted');
    } catch { toast.error('Failed to delete PTM'); }
  };

  const togglePtmClass = (classId) => {
    setPtmForm(prev => ({
      ...prev,
      classIds: prev.classIds.includes(classId)
        ? prev.classIds.filter(id => id !== classId)
        : [...prev.classIds, classId],
    }));
  };

  const fetchCommContacts = async (classId) => {
    if (!classId) { setCommContacts([]); return; }
    try {
      const res = await api.get(`/api/communication/class-contacts/${classId}`);
      setCommContacts(res.data || []);
      console.log(res, "Resssss")
    } catch { setCommContacts([]); }
  };

  const handleCommClassChange = (classId) => {
    setCommForm(prev => ({ ...prev, classId }));
    fetchCommContacts(classId);
  };

  const handleSendMessage = async (channel) => {
    const { classId, messageTo, selectedParentIdx, messageType, message } = commForm;
    if (!classId) { toast.error('Please select a class'); return; }
    if (!message.trim()) { toast.error('Please enter a message'); return; }
    if (messageTo === 'individual_parent' && selectedParentIdx === '') { toast.error('Please select a parent'); return; }

    const targets = messageTo === 'individual_parent'
      ? [commContacts[Number(selectedParentIdx)]]
      : commContacts;
    const phones = targets.map(c => c.parentPhone).filter(Boolean);

    if ((channel === 'whatsapp' || channel === 'sms') && phones.length === 0) {
      toast.error('No parent phone numbers found for this class');
      return;
    }

    setCommSending(true);
    try {
      const results = [];

      if (channel === 'email' || channel === 'all') {
        const recipientType = messageTo === 'individual_parent' ? 'single' : 'class-parents';
        const toEmail = messageTo === 'individual_parent'
          ? commContacts[Number(selectedParentIdx)]?.parentEmail
          : undefined;
        if (recipientType === 'single' && !toEmail) {
          toast.error('No email address for the selected parent');
        } else {
          const res = await api.post('/api/communication/send-email', {
            recipientType,
            ...(toEmail ? { toEmail } : { classId }),
            subject: messageType,
            body: message,
          });
          results.push(res.data?.message || 'Email sent');
        }
      }
      if ((channel === 'sms' || channel === 'all') && phones.length > 0) {
        await api.post('/api/communication/send-sms', { recipients: phones, message });
        results.push(`SMS sent to ${phones.length} parent(s)`);
      }
      if ((channel === 'whatsapp' || channel === 'all') && phones.length > 0) {
        await api.post('/api/communication/send-whatsapp', { recipients: phones, message });
        results.push(`WhatsApp sent to ${phones.length} parent(s)`);
      }
      if (results.length > 0) toast.success(results.join(', '));
      setCommForm(prev => ({ ...prev, message: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setCommSending(false);
    }
  };

  const renderModule = () => {
    switch (module) {
      case 'profile':
        return <Profile staffData={staffData} user={user} showPasswordModal={showPasswordModal} setShowPasswordModal={setShowPasswordModal} showContactModal={showContactModal} setShowContactModal={setShowContactModal} passwordForm={passwordForm} setPasswordForm={setPasswordForm} handleChangePassword={handleChangePassword} contactForm={contactForm} setContactForm={setContactForm} handleUpdateContact={handleUpdateContact} submitting={submitting} />;
      case 'attendance':
        return <Attendance todayAttendance={todayAttendance} handleCheckIn={handleCheckIn} handleCheckOut={handleCheckOut} leaveBalance={leaveBalance} openLeaveModal={openLeaveModal} myLeaves={myLeaves} attendanceHistory={attendanceHistory} showLeaveModal={showLeaveModal} setShowLeaveModal={setShowLeaveModal} leaveForm={leaveForm} setLeaveForm={setLeaveForm} staffList={staffList} handleApplyLeave={handleApplyLeave} leaveSubmitting={leaveSubmitting} pendingApprovals={pendingApprovals} handleApproveReject={handleApproveReject} pendingStudentLeaves={pendingStudentLeaves} handleStudentLeaveAction={handleStudentLeaveAction} studentActionLoading={studentActionLoading} setSelectedStudentLeaveId={setSelectedStudentLeaveId} setIsStudentDenyModalOpen={setIsStudentDenyModalOpen} formatTime={formatTime} formatDate={formatDate} formatWorkingHours={formatWorkingHours} />;
      case 'timetable':
        return <Timetable myTimetable={myTimetable} staffData={staffData} substitutions={substitutions} examDuties={examDuties} schoolEvents={schoolEvents} formatDate={formatDate} onSubstitutionUpdate={(id, updated) => setSubstitutions(prev => prev.map(s => s._id === id ? updated : s))} />;
      case 'classes':
        return <Classes classDetail={classDetail} staffData={staffData} handleOpenMarkAttendance={handleOpenMarkAttendance} selectedClassForStudents={selectedClassForStudents} classStudents={classStudents} />;
      case 'academic':
        return <Academic staffData={staffData} academicClasses={academicClasses} selectedAcademicClass={selectedAcademicClass} setSelectedAcademicClass={setSelectedAcademicClass} lessonPlans={lessonPlans} setLessonPlans={setLessonPlans} studyMaterials={studyMaterials} setStudyMaterials={setStudyMaterials} classHomework={classHomework} setClassHomework={setClassHomework} onlineClasses={onlineClasses} setOnlineClasses={setOnlineClasses} examDuties={examDuties} showStudyMaterialModal={showStudyMaterialModal} setShowStudyMaterialModal={setShowStudyMaterialModal} studyMaterialForm={studyMaterialForm} setStudyMaterialForm={setStudyMaterialForm} handleUploadStudyMaterial={handleUploadStudyMaterial} studyMaterialSubmitting={studyMaterialSubmitting} showHomeworkModal={showHomeworkModal} setShowHomeworkModal={setShowHomeworkModal} homeworkForm={homeworkForm} setHomeworkForm={setHomeworkForm} handleCreateHomework={handleCreateHomework} homeworkSubmitting={homeworkSubmitting} classSubjects={classSubjects} showOnlineClassModal={showOnlineClassModal} setShowOnlineClassModal={setShowOnlineClassModal} onlineClassForm={onlineClassForm} setOnlineClassForm={setOnlineClassForm} handleOnlineClassSubmit={handleOnlineClassSubmit} onlineClassSubmitting={onlineClassSubmitting} handleDownloadLessonPlan={handleDownloadLessonPlan} handleDeleteLessonPlan={handleDeleteLessonPlan} handleDeleteHomework={handleDeleteHomework} handleDownloadStudyMaterial={handleDownloadStudyMaterial} handleDeleteStudyMaterial={handleDeleteStudyMaterial} handleDeleteOnlineClass={handleDeleteOnlineClass} setLessonPlanForm={setLessonPlanForm} setShowLessonPlanModal={setShowLessonPlanModal} formatDate={formatDate} formatFileSize={formatFileSize} formatHHmm={formatHHmm} />;
      case 'marks':
        return <Marks marksClassId={marksClassId} handleMarksClassChange={handleMarksClassChange} marksExamId={marksExamId} setMarksExamId={setMarksExamId} marksExams={marksExams} marksLoading={marksLoading} marksLoaded={marksLoaded} marksStudents={marksStudents} marksEntries={marksEntries} setMarksEntries={setMarksEntries} setMarksLoaded={setMarksLoaded} setMarksStudents={setMarksStudents} setMarksAnalysis={setMarksAnalysis} marksSaving={marksSaving} marksAnalysis={marksAnalysis} handleLoadStudents={handleLoadStudents} handleSaveAllMarks={handleSaveAllMarks} marksCalcGrade={marksCalcGrade} timetableAssignments={timetableAssignments} />;
      case 'communication':
        return <Communication commAnnouncements={commAnnouncements} commClasses={commClasses} commForm={commForm} setCommForm={setCommForm} handleCommClassChange={handleCommClassChange} commContacts={commContacts} commSending={commSending} handleSendMessage={handleSendMessage} ptmForm={ptmForm} setPtmForm={setPtmForm} handlePtmSubmit={handlePtmSubmit} ptmLoading={ptmLoading} ptmList={ptmList} handleDeletePtm={handleDeletePtm} togglePtmClass={togglePtmClass} />;
      case 'payroll':
        return <Payroll latestSalary={latestSalary} payrollHistory={payrollHistory} reimbursements={reimbursements} showReimbursementModal={showReimbursementModal} setShowReimbursementModal={setShowReimbursementModal} reimbursementForm={reimbursementForm} setReimbursementForm={setReimbursementForm} handleSubmitReimbursement={handleSubmitReimbursement} reimbursementSubmitting={reimbursementSubmitting} handleDownloadSalarySlip={handleDownloadSalarySlip} formatDate={formatDate} />;
      case 'library':
        return <Library myLibraryIssues={myLibraryIssues} />;
      case 'documents':
        return <Documents documents={documents} formatDate={formatDate} formatFileSize={formatFileSize} handleDownloadDocument={handleDownloadDocument} />;
      case 'settings':
        return <Settings user={user} />;
      default:
        return <Profile staffData={staffData} user={user} showPasswordModal={showPasswordModal} setShowPasswordModal={setShowPasswordModal} showContactModal={showContactModal} setShowContactModal={setShowContactModal} passwordForm={passwordForm} setPasswordForm={setPasswordForm} handleChangePassword={handleChangePassword} contactForm={contactForm} setContactForm={setContactForm} handleUpdateContact={handleUpdateContact} submitting={submitting} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2] rounded-2xl p-6 border-2 border-[#FCD34D]">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] mb-1">Welcome, {user?.name}!</h1>
        <p className="text-base text-[#64748B]">Staff Portal - AJM International Institution</p>
      </div>

      <div>
        {renderModule()}
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
                  {(academicClasses.length > 0 ? academicClasses : staffData?.classesAssigned || []).map(c => (
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

      {/* Student Deny Leave Modal */}
      {isStudentDenyModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b-2 border-[#FEF3C7] flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
                <XCircle className="text-[#DC2626]" size={24} />
                Student Leave Denial
              </h3>
              <button
                onClick={() => setIsStudentDenyModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#0F172A] transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-[#64748B]">Please provide a reason for denying this student's leave request. This will be visible to the student.</p>
              <textarea
                required
                value={studentDenyReason}
                onChange={(e) => setStudentDenyReason(e.target.value)}
                className="w-full px-3 py-2 border-2 border-[#E2E8F0] rounded-xl focus:border-[#4F46E5] focus:outline-hidden transition-colors h-32"
                placeholder="Reason for denial..."
              ></textarea>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsStudentDenyModalOpen(false)}
                  className="flex-1 px-4 py-2 border-2 border-[#E2E8F0] text-[#64748B] font-bold rounded-xl hover:bg-[#F8FAFC] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStudentLeaveAction(selectedStudentLeaveId, 'deny', studentDenyReason)}
                  disabled={studentActionLoading || !studentDenyReason.trim()}
                  className="flex-1 px-4 py-2 bg-[#DC2626] text-white font-bold rounded-xl hover:bg-[#B91C1C] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {studentActionLoading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Confirm Denial'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default StaffDashboard;
