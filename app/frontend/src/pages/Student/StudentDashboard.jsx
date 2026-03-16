import { useState, useEffect } from 'react';
import {
  Lock, X, CalendarDays
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/utils/api';
import Profile from './pages/Profile';
import Attendance from './pages/Attendance';
import Timetable from './pages/Timetable';
import OnlineClasses from './pages/OnlineClasses';
import Homework from './pages/Homework';
import Exams from './pages/Exams';
import Communication from './pages/Communication';
import Fees from './pages/Fees';
import Library from './pages/Library';
import Activities from './pages/Activities';
import Requests from './pages/Requests';

const StudentDashboard = ({ user, module = 'profile' }) => {
  const [attendanceData, setAttendanceData] = useState({ records: [], summary: { total: 0, present: 0, absent: 0, late: 0 } });
  const [scheduleData, setScheduleData] = useState({ class: null, subjects: [] });
  const [timetableData, setTimetableData] = useState(null);
  const [periodConfig, setPeriodConfig] = useState(null);
  const [exams, setExams] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [feesData, setFeesData] = useState({ fees: [], summary: { totalDue: 0, totalPaid: 0 } });
  const [announcements, setAnnouncements] = useState([]);
  const [messages, setMessages] = useState([]);
  const [homeworkData, setHomeworkData] = useState([]);
  const [lessonPlansData, setLessonPlansData] = useState([]);
  const [studyMaterialsData, setStudyMaterialsData] = useState([]);
  const [onlineClasses, setOnlineClasses] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [awards, setAwards] = useState([]);
  const [schoolEvents, setSchoolEvents] = useState([]);
  const [studentLeaves, setStudentLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [myLibraryIssues, setMyLibraryIssues] = useState([]);

  // Password Change State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Leave Request State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    leaveType: 'casual'
  });
  const [leaveLoading, setLeaveLoading] = useState(false);

  const getAcademicYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    return month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (module === 'profile' || module === 'timetable' || module === 'online-classes') {
          console.log(user, "hitssinside")
          const schedRes = await api.get("/api/student/me/schedule");
          const userData = await api.get("api/student/me/info");

          setScheduleData(schedRes.data);
          setUserInfo(userData.data.student)
          if (schedRes.data?.class?._id) {
            try {
              console.log("beforeee")
              const pcRes = await api.get(`/api/timetable/periods/${schedRes.data.class._id}/${getAcademicYear()}`);
              console.log("Afterrr")
              console.log("Period config response:", pcRes)
              setPeriodConfig(pcRes.data);
              const ttRes = await api.get(`/api/timetable/${schedRes.data.class._id}/${getAcademicYear()}`);
              console.log("Timetable response:", ttRes)
              setTimetableData(ttRes.data);
            } catch (error) {
              console.error('Error fetching timetable:', error);
              console.error('Error response:', error.response);
              console.error('Error status:', error.response?.status);
            }
          }
          // Fetch school events for Holiday Calendar + School Events panels
          try {
            const eventsRes = await api.get('/api/school-events/user-events');

            setSchoolEvents(eventsRes?.data || []);
          } catch { /* events optional */ }
        }
        if (module === 'online-classes') {
          try {
            const ocRes = await api.get('/api/online-classes/my-classes');
            setOnlineClasses(ocRes.data?.data || ocRes.data || []);
          } catch (e) {
            console.error('Online classes fetch error:', e);
          }
        }
        if (module === 'attendance') {
          const [attRes, leaveRes] = await Promise.all([
            api.get('/api/student/me/attendance'),
            api.get('/api/student-leaves/my-leaves')
          ]);
          setAttendanceData(attRes.data);
          setStudentLeaves(leaveRes?.data || []);
        }

        if (module === 'exams') {
          console.log("hotsssserererer")
          const [examsRes, resultsRes] = await Promise.all([
            api.get('/api/exams'),
            api.get('/api/exams/my-results'),
          ]);
          console.log(examsRes.data, "examReaarr")
          setExams(examsRes.data);
          setExamResults(resultsRes.data);
        }
        if (module === 'fees') {
          const feesRes = await api.get('/api/student/fees');
          setFeesData(feesRes.data);
        }
        if (module === 'homework') {
          // Fetch homework
          try {
            const hwRes = await api.get('/api/homework/my-homework');
            console.log(hwRes.data, "hwRes.data");
            setHomeworkData(hwRes.data?.data || hwRes.data || []);
          } catch (e) { console.error('Homework fetch error:', e); }

          // Fetch lesson plans
          try {
            const lpRes = await api.get('/api/lesson-plans/my-plans');
            console.log(lpRes.data, "lpRes.data");
            setLessonPlansData(lpRes.data || []);
          } catch (e) { console.error('Lesson plans fetch error:', e); }

          // Fetch study materials
          try {
            const smRes = await api.get('/api/study-materials/my-materials');
            console.log(smRes.data, "smRes.data");
            setStudyMaterialsData(smRes?.data || []);
          } catch (e) { console.error('Study materials fetch error:', e); }
        }
        if (module === 'activities') {
          const [schRes, awardRes] = await Promise.all([
            api.get('/api/scholarships/my'),
            api.get('/api/awards/my'),
          ]);
          setScholarships(schRes.data || []);
          setAwards(awardRes.data || []);
        }
        if (module === 'communication') {
          try {
            const [annRes, msgRes, eventsRes] = await Promise.all([
              api.get('/api/communication/announcements'),
              api.get('/api/communication/messages'),
              api.get('/api/school-events/user-events'),
            ]);
            setAnnouncements(annRes.data || []);
            setMessages(msgRes.data || []);
            setSchoolEvents(eventsRes.data || []);
          } catch { /* no messages yet */ }
        }
        if (module === 'library') {
          try {
            const libRes = await api.get('/api/library/my-issues');
            setMyLibraryIssues(libRes.data || []);
          } catch { console.error('Library fetch error'); }
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [module]);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (t) => {
    if (!t) return '—';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${ampm}`;
  };

  const handleDownloadFile = async (homeworkId, filename, originalName) => {
    try {
      console.log('Downloading file:', { homeworkId, filename, originalName });
      const response = await api.get(`/api/homework/${homeworkId}/attachments/${filename}`, {
        responseType: 'blob'
      });

      // Create a blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      console.error('Error response:', error.response);
      toast.error(`Failed to download file: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDownloadLessonPlan = async (planId, originalName) => {
    try {
      const response = await api.get(`/api/lesson-plans/${planId}/download`, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = originalName || 'lesson-plan';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download lesson plan');
    }
  };

  const handleDownloadStudyMaterial = async (materialId, originalName) => {
    try {
      const response = await api.get(`/api/study-materials/${materialId}/download`, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = originalName || 'study-material';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download study material');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await api.post('/api/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (response.data.success) {
        toast.success("Password changed successfully!");
        setIsPasswordModalOpen(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setLeaveLoading(true);
    try {
      console.log(leaveForm, "leaveForm")
      await api.post('/api/student-leaves/apply', leaveForm);
      toast.success("Leave application submitted successfully!");
      setIsLeaveModalOpen(false);
      setLeaveForm({ startDate: '', endDate: '', reason: '', leaveType: 'casual' });

      // Refresh leaves
      const res = await api.get('/api/student-leaves/my-leaves');
      setStudentLeaves(res.data?.data || []);
    } catch (error) {
      console.error('Leave application error:', error);
      toast.error(error.response?.data?.message || "Failed to submit leave application");
    } finally {
      setLeaveLoading(false);
    }
  };

  const getGradeBadge = (grade) => {
    if (grade === 'A+') return 'bg-[#D1FAE5] text-[#065F46]';
    if (grade === 'A') return 'bg-[#DBEAFE] text-[#1E40AF]';
    if (grade === 'B+' || grade === 'B') return 'bg-[#FEF3C7] text-[#92400E]';
    return 'bg-[#FEE2E2] text-[#991B1B]';
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

  const renderModule = () => {
    switch (module) {
      case 'profile': return <Profile userInfo={userInfo} scheduleData={scheduleData} timetableData={timetableData} periodConfig={periodConfig} schoolEvents={schoolEvents} setIsPasswordModalOpen={setIsPasswordModalOpen} formatDate={formatDate} getAcademicYear={getAcademicYear} />;
      case 'attendance': return <Attendance attendanceData={attendanceData} studentLeaves={studentLeaves} setIsLeaveModalOpen={setIsLeaveModalOpen} formatDate={formatDate} />;
      case 'timetable': return <Timetable timetableData={timetableData} periodConfig={periodConfig} scheduleData={scheduleData} schoolEvents={schoolEvents} formatDate={formatDate} getAcademicYear={getAcademicYear} />;
      case 'online-classes': return <OnlineClasses onlineClasses={onlineClasses} scheduleData={scheduleData} />;
      case 'homework': return <Homework homeworkData={homeworkData} lessonPlansData={lessonPlansData} studyMaterialsData={studyMaterialsData} handleDownloadFile={handleDownloadFile} handleDownloadLessonPlan={handleDownloadLessonPlan} handleDownloadStudyMaterial={handleDownloadStudyMaterial} formatDate={formatDate} />;
      case 'exams': return <Exams exams={exams} examResults={examResults} formatDate={formatDate} formatTime={formatTime} getGradeBadge={getGradeBadge} getAcademicYear={getAcademicYear} />;
      case 'communication': return <Communication announcements={announcements} messages={messages} schoolEvents={schoolEvents} formatDate={formatDate} getEventStyle={getEventStyle} />;
      case 'fees': return <Fees feesData={feesData} getAcademicYear={getAcademicYear} formatDate={formatDate} />;
      case 'library': return <Library myLibraryIssues={myLibraryIssues} />;
      case 'activities': return <Activities scholarships={scholarships} awards={awards} />;
      case 'requests': return <Requests />;
      default: return <Profile userInfo={userInfo} scheduleData={scheduleData} timetableData={timetableData} periodConfig={periodConfig} schoolEvents={schoolEvents} setIsPasswordModalOpen={setIsPasswordModalOpen} formatDate={formatDate} getAcademicYear={getAcademicYear} />;
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="bg-linear-to-r from-[#DBEAFE] to-[#EDE9FE] rounded-2xl p-6 border-2 border-[#4F46E5]">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] mb-1">Welcome, {user?.name}!</h1>
          <p className="text-base text-[#64748B]">Student Portal - AJM International Institution</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4F46E5]"></div>
          </div>
        ) : (
          <div>
            {renderModule()}
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border-2 border-[#4F46E5] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-linear-to-r from-[#DBEAFE] to-[#EDE9FE] px-6 py-4 flex justify-between items-center border-b border-[#E2E8F0]">
              <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
                <Lock className="text-[#4F46E5]" size={20} />
                Change Password
              </h2>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-2 hover:bg-white/50 rounded-full transition-colors"
              >
                <X size={20} className="text-[#64748B]" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#64748B] mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border-2 border-[#E2E8F0] rounded-xl focus:border-[#4F46E5] focus:outline-hidden transition-colors"
                    placeholder="Enter current password"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#64748B] mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border-2 border-[#E2E8F0] rounded-xl focus:border-[#4F46E5] focus:outline-hidden transition-colors"
                    placeholder="Minimum 6 characters"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#64748B] mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border-2 border-[#E2E8F0] rounded-xl focus:border-[#4F46E5] focus:outline-hidden transition-colors"
                    placeholder="Re-enter new password"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 px-4 py-2 border-2 border-[#E2E8F0] text-[#64748B] font-bold rounded-xl hover:bg-[#F8FAFC] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 px-4 py-2 bg-[#4F46E5] text-white font-bold rounded-xl hover:bg-[#4338CA] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {passwordLoading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Request Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b-2 border-[#FEF3C7] flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
                <CalendarDays className="text-[#4F46E5]" size={24} />
                Apply for Leave
              </h3>
              <button onClick={() => setIsLeaveModalOpen(false)} className="text-[#94A3B8] hover:text-[#0F172A] transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#64748B] mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-[#E2E8F0] rounded-xl focus:border-[#4F46E5] focus:outline-hidden transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#64748B] mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-[#E2E8F0] rounded-xl focus:border-[#4F46E5] focus:outline-hidden transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#64748B] mb-1">Leave Type</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-[#E2E8F0] rounded-xl focus:border-[#4F46E5] focus:outline-hidden transition-colors"
                >
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#64748B] mb-1">Reason</label>
                <textarea
                  required
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-[#E2E8F0] rounded-xl focus:border-[#4F46E5] focus:outline-hidden transition-colors h-24"
                  placeholder="Detailed reason for leave..."
                ></textarea>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="flex-1 px-4 py-2 border-2 border-[#E2E8F0] text-[#64748B] font-bold rounded-xl hover:bg-[#F8FAFC] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={leaveLoading}
                  className="flex-1 px-4 py-2 bg-[#4F46E5] text-white font-bold rounded-xl hover:bg-[#4338CA] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {leaveLoading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentDashboard;
