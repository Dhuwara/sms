import React, { useState, useEffect } from 'react';
import {
  User, Calendar, BookOpen, FileText,
  MessageSquare, DollarSign, Library, Settings,
  Clock, CheckCircle, XCircle, Bell, Mail, Download,
  HelpCircle, Receipt, Trophy, FileQuestion,
  AlertCircle, GraduationCap, Calculator, CalendarDays
} from 'lucide-react';
import api from '../../utils/api';

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
  const [scholarships, setScholarships] = useState([]);
  const [schoolEvents, setSchoolEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null)

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
        if (module === 'profile' || module === 'timetable' || module === 'subjects') {
          console.log(user,"hitssinside")
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
        }
        if (module === 'attendance') {
          const attRes = await api.get('/api/student/me/attendance');
          console.log(attRes,"resspspspssp")
          setAttendanceData(attRes.data);
        }
        
        if (module === 'exams') {
          console.log("hotsssserererer")
          const [examsRes, resultsRes] = await Promise.all([
            api.get('/api/exams'),
            api.get('/api/exams/my-results'),
          ]);
          console.log(examsRes.data,"examReaarr")
          setExams(examsRes.data);
          setExamResults(resultsRes.data);
        }
        if (module === 'fees') {
          const feesRes = await api.get('/api/student/fees');
          setFeesData(feesRes.data);
        }
        if (module === 'homework') {
          const hwRes = await api.get('/api/homework/my-homework');
          setHomeworkData(hwRes.data);
        }
        if (module === 'activities') {
          const schRes = await api.get('/api/scholarships/my');
          setScholarships(schRes.data || []);
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
      alert(`Failed to download file: ${error.response?.data?.message || error.message}`);
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

  const classInfo = scheduleData?.class;

  // 1. Student Profile
  const renderProfile = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Student Profile</h2>
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-[#DBEAFE] to-[#EDE9FE] rounded-full flex items-center justify-center text-4xl font-bold text-[#4F46E5]">
            {user?.name?.charAt(0) || "S"}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#0F172A]">
              {user?.name || "Student User"}
            </h3>
            <p className="text-[#64748B]">
              Student ID: {user?.studentId || user?.email || "—"}
            </p>
            <span className="inline-block mt-2 px-3 py-1 bg-[#10B981] text-white text-xs font-semibold rounded-full">
              Active Student
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-[#DBEAFE] rounded-lg">
            <p className="text-sm text-[#64748B]">Class</p>
            <p className="font-bold text-[#0F172A]">{classInfo?.name || "—"}</p>
          </div>
          <div className="p-4 bg-[#D1FAE5] rounded-lg">
            <p className="text-sm text-[#64748B]">Section</p>
            <p className="font-bold text-[#0F172A]">
              {classInfo?.section ? `Section ${classInfo.section}` : "—"}
            </p>
          </div>
          <div className="p-4 bg-[#FEF3C7] rounded-lg">
            <p className="text-sm text-[#64748B]">Roll Number</p>
            <p className="font-bold text-[#0F172A]">
              {classInfo?.roomNumber || "—"}
            </p>
          </div>
          <div className="p-4 bg-[#FEE2E2] rounded-lg">
            <p className="text-sm text-[#64748B]">Academic Year</p>
            <p className="font-bold text-[#0F172A]">{getAcademicYear()}</p>
          </div>
        </div>

        <div className="border-t border-[#E2E8F0] pt-4">
          <h4 className="font-semibold mb-3">Personal Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-[#F8FAFC] rounded-lg">
              <p className="text-sm text-[#64748B]">Date of Birth</p>
              <p className="font-semibold">
                {userInfo?.dateOfBirth ? formatDate(userInfo.dateOfBirth) : "—"}
              </p>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-lg">
              <p className="text-sm text-[#64748B]">Gender</p>
              <p className="font-semibold">
                {userInfo?.gender
                  ? userInfo.gender.charAt(0).toUpperCase() +
                  userInfo.gender.slice(1)
                  : "—"}
              </p>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-lg">
              <p className="text-sm text-[#64748B]">Student Type</p>
              <p className="font-semibold">
                {userInfo?.studentType === "hosteller"
                  ? "Hosteller"
                  : "Day Scholar"}
              </p>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-lg">
              <p className="text-sm text-[#64748B]">Address</p>
              <p className="font-semibold">{userInfo?.address || "—"}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E2E8F0] pt-4 mt-4">
          <h4 className="font-semibold mb-3">Contact Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-[#F8FAFC] rounded-lg">
              <Mail className="text-[#64748B]" size={18} />
              <span className="text-sm">{userInfo?.email || "—"}</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-[#F8FAFC] rounded-lg">
              <User className="text-[#64748B]" size={18} />
              <span className="text-sm">
                {userInfo?.parentContact || "—"} (Parent)
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E2E8F0] pt-4 mt-4">
          <h4 className="font-semibold mb-3">Security Settings</h4>
          <button className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#4338CA] transition-colors">
            Change Password
          </button>
        </div>
      </div>
    </div>
  );

  // 2. Attendance
  const renderAttendance = () => {
    const { records, summary } = attendanceData;
    const percentage = summary.total > 0 ? ((summary.present / summary.total) * 100).toFixed(1) : '0.0';
    const todayRecord = records.find(r => new Date(r.date).toDateString() === new Date().toDateString());
    
    // Determine attendance status and colors
    const attendanceStatus = parseFloat(percentage) >= 75 ? 'good' : parseFloat(percentage) >= 60 ? 'warning' : 'critical';
    const attendanceColors = {
      good: { bg: 'bg-[#D1FAE5]', border: 'border-[#10B981]', text: 'text-[#065F46]', subtext: 'text-[#10B981]' },
      warning: { bg: 'bg-[#FEF3C7]', border: 'border-[#F59E0B]', text: 'text-[#92400E]', subtext: 'text-[#F59E0B]' },
      critical: { bg: 'bg-[#FEE2E2]', border: 'border-[#DC2626]', text: 'text-[#991B1B]', subtext: 'text-[#DC2626]' }
    };
    const colors = attendanceColors[attendanceStatus];

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#0F172A]">Attendance</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981]">
            <p className="text-sm text-[#64748B]">Total Present</p>
            <p className="text-3xl font-bold text-[#065F46]">{summary.present}</p>
            <p className="text-xs text-[#10B981]">Days</p>
          </div>
          <div className="p-6 bg-[#FEE2E2] rounded-xl border-2 border-[#DC2626]">
            <p className="text-sm text-[#64748B]">Total Absent</p>
            <p className="text-3xl font-bold text-[#991B1B]">{summary.absent}</p>
            <p className="text-xs text-[#DC2626]">Days</p>
          </div>
          <div className="p-6 bg-[#FEF3C7] rounded-xl border-2 border-[#F59E0B]">
            <p className="text-sm text-[#64748B]">Late Arrivals</p>
            <p className="text-3xl font-bold text-[#92400E]">{summary.late}</p>
            <p className="text-xs text-[#F59E0B]">Days</p>
          </div>
          <div className={`p-6 ${colors.bg} rounded-xl border-2 ${colors.border}`}>
            <p className="text-sm text-[#64748B]">Attendance %</p>
            <p className={`text-3xl font-bold ${colors.text}`}>{percentage}%</p>
            <p className={`text-xs ${colors.subtext}`}>{attendanceStatus === 'good' ? 'Excellent' : attendanceStatus === 'warning' ? 'Needs Improvement' : 'Critical'}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Calendar className="text-[#F59E0B]" size={20} />
            Today's Attendance Status
          </h3>
          {todayRecord ? (
            <div className={`p-4 ${todayRecord.status === 'present' ? 'bg-[#D1FAE5]' : todayRecord.status === 'late' ? 'bg-[#FEF3C7]' : 'bg-[#FEE2E2]'} rounded-lg flex items-center gap-4`}>
              {todayRecord.status === 'present' ? <CheckCircle className="text-[#10B981]" size={32} /> : todayRecord.status === 'late' ? <Clock className="text-[#F59E0B]" size={32} /> : <XCircle className="text-[#DC2626]" size={32} />}
              <div>
                <p className="font-bold text-lg capitalize">{todayRecord.status}</p>
                <p className="text-sm text-[#64748B]">{formatDate(todayRecord.date)}</p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#F8FAFC] rounded-lg flex items-center gap-4">
              <Clock className="text-[#64748B]" size={32} />
              <div>
                <p className="font-bold text-lg text-[#64748B]">Not Marked Yet</p>
                <p className="text-sm text-[#64748B]">{formatDate(new Date())}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Recent Attendance Records</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-linear-to-r from-[#DBEAFE] to-[#EDE9FE]">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-sm">Date</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.slice(0, 20).map((r, idx) => (
                  <tr key={idx} className="border-b border-[#E2E8F0]">
                    <td className="px-4 py-3 text-sm">{formatDate(r.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${r.status === 'present' ? 'bg-[#D1FAE5] text-[#065F46]' :
                          r.status === 'late' ? 'bg-[#FEF3C7] text-[#92400E]' :
                            'bg-[#FEE2E2] text-[#991B1B]'
                        }`}>{r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr><td colSpan={2} className="px-4 py-8 text-center text-[#64748B]">No attendance records found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
            <h3 className="font-bold mb-4">Leave Request</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input type="date" className="border-2 border-[#FCD34D] rounded-lg px-3 py-2" />
                <input type="date" className="border-2 border-[#FCD34D] rounded-lg px-3 py-2" />
              </div>
              <textarea className="w-full border-2 border-[#FCD34D] rounded-lg px-3 py-2 h-20" placeholder="Reason for leave..."></textarea>
              <button className="w-full bg-[#4F46E5] text-white py-2 rounded-lg font-semibold">Submit Leave Request</button>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="text-[#DC2626]" size={20} />
              Attendance Alerts
            </h3>
            <div className="space-y-3">
              {parseFloat(percentage) < 75 ? (
                <div className="p-3 bg-[#FEE2E2] rounded-lg border-l-4 border-[#DC2626]">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="text-[#DC2626]" size={16} />
                    <p className="font-semibold text-sm text-[#991B1B]">Low Attendance Warning</p>
                  </div>
                  <p className="text-xs text-[#64748B]">Your attendance is {percentage}%, which is below the required 75%. This may affect your exam eligibility.</p>
                  <p className="text-xs text-[#64748B] mt-1">Please improve your attendance to avoid academic consequences.</p>
                </div>
              ) : (
                <div className="p-3 bg-[#D1FAE5] rounded-lg border-l-4 border-[#10B981]">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="text-[#10B981]" size={16} />
                    <p className="font-semibold text-sm text-[#065F46]">Good Attendance</p>
                  </div>
                  <p className="text-xs text-[#64748B]">Your attendance is {percentage}%, which meets the required 75%. Keep up the good work!</p>
                  <p className="text-xs text-[#64748B] mt-1">Maintaining good attendance is important for academic success.</p>
                </div>
              )}
              <div className="p-3 bg-[#FEF3C7] rounded-lg border-l-4 border-[#F59E0B]">
                <p className="font-semibold text-sm">Attendance Summary</p>
                <p className="text-xs text-[#64748B]">{summary.present} present, {summary.absent} absent, {summary.late} late out of {summary.total} days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 3. Timetable & Schedule
  const renderTimetable = () => {
    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const periods = periodConfig?.periods || [];
    const schedule = timetableData?.schedule || {};

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#0F172A]">Timetable & Schedule</h2>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Class Timetable - {classInfo?.name || ''} {classInfo?.section ? `Section ${classInfo.section}` : ''}</h3>
          {periods.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-linear-to-r from-[#DBEAFE] to-[#EDE9FE]">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-sm">Day</th>
                    {periods.filter((p, i, arr) => {
                      const dayPeriods = arr.filter(pp => (pp.day || 'Monday') === 'Monday');
                      return i < (dayPeriods.length || arr.length);
                    }).map((p, i) => (
                      <th key={i} className="px-4 py-3 text-left font-bold text-sm">
                        {p.name}<br /><span className="font-normal text-xs">{p.startTime}-{p.endTime}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day, idx) => {
                    const dayPeriods = periods.filter(p => (p.day || 'Monday') === day);
                    const daySchedule = schedule[day] || [];
                    return (
                      <tr key={idx} className="border-b border-[#E2E8F0]">
                        <td className="px-4 py-3 font-semibold">{day}</td>
                        {dayPeriods.map((p, pi) => {
                          const entry = daySchedule[pi];
                          const subj = entry?.subject || p.subject || (p.type !== 'class' && p.type !== 'lab' ? p.type.charAt(0).toUpperCase() + p.type.slice(1) : '—');
                          return <td key={pi} className="px-4 py-3 text-sm">{subj}</td>;
                        })}
                        {dayPeriods.length === 0 && <td className="px-4 py-3 text-sm text-[#64748B]" colSpan={6}>No periods configured</td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-[#64748B]">
              <p>No timetable configured yet. Please check back later.</p>
            </div>
          )}
        </div>

        {/* <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <GraduationCap className="text-[#DC2626]" size={20} />
            Upcoming Exams
          </h3>
          {exams.length > 0 || examResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-linear-to-r from-[#FEE2E2] to-[#FEF3C7]">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-sm">Date</th>
                    <th className="px-4 py-3 text-left font-bold text-sm">Subject</th>
                    <th className="px-4 py-3 text-left font-bold text-sm">Time</th>
                    <th className="px-4 py-3 text-left font-bold text-sm">Duration</th>
                    <th className="px-4 py-3 text-left font-bold text-sm">Max Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.filter(e => new Date(e.date) >= new Date()).slice(0, 10).map((exam, idx) => (
                    <tr key={idx} className="border-b border-[#E2E8F0]">
                      <td className="px-4 py-3 text-sm font-semibold">{formatDate(exam.date)}</td>
                      <td className="px-4 py-3 text-sm">{exam.subject}</td>
                      <td className="px-4 py-3 text-sm">{formatTime(exam.startTime)}</td>
                      <td className="px-4 py-3 text-sm">{exam.period ? `${exam.period} mins` : '—'}</td>
                      <td className="px-4 py-3 text-sm font-semibold">{exam.maxScore || 100}</td>
                    </tr>
                  ))}
                  {exams.filter(e => new Date(e.date) >= new Date()).length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-[#64748B]">No upcoming exams</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-[#64748B] py-4">No exam schedule available</p>
          )}
        </div> */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
            <h3 className="font-bold mb-4">Holiday Calendar</h3>
            <div className="space-y-3">
              {[
                { date: 'Jan 1', name: 'New Year', type: 'Public Holiday' },
                { date: 'Jan 14', name: 'Makar Sankranti', type: 'Regional Holiday' },
                { date: 'Jan 26', name: 'Republic Day', type: 'National Holiday' },
                { date: 'Aug 15', name: 'Independence Day', type: 'National Holiday' },
              ].map((holiday, idx) => (
                <div key={idx} className="p-3 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{holiday.name}</p>
                    <p className="text-xs text-[#64748B]">{holiday.type}</p>
                  </div>
                  <span className="px-3 py-1 bg-[#D1FAE5] text-[#065F46] rounded-full text-sm font-semibold">{holiday.date}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
            <h3 className="font-bold mb-4">School Events</h3>
            <div className="space-y-3">
              {[
                { name: 'Annual Day Celebration', date: 'Jan 15', type: 'Cultural' },
                { name: 'Science Exhibition', date: 'Jan 20', type: 'Academic' },
                { name: 'Sports Day', date: 'Feb 5', type: 'Sports' },
                { name: 'Parent-Teacher Meeting', date: 'Feb 10', type: 'Meeting' },
              ].map((event, idx) => (
                <div key={idx} className="p-3 border-l-4 border-[#4F46E5] bg-[#F8FAFC] rounded-r-lg">
                  <p className="font-semibold">{event.name}</p>
                  <p className="text-xs text-[#64748B]">{event.date} - {event.type}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 4. Subjects & Learning
  const renderSubjects = () => {
    const subjects = scheduleData?.subjects || [];
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#EF4444', '#14B8A6'];

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#0F172A]">Subjects & Learning</h2>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Subject List</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.length > 0 ? subjects.map((subject, idx) => {
              const color = COLORS[idx % COLORS.length];
              const teacherName = subject.staffId?.userId?.name || '—';
              return (
                <div key={idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                      <BookOpen size={20} style={{ color }} />
                    </div>
                    <div>
                      <h4 className="font-bold">{subject.name}</h4>
                      <p className="text-xs text-[#64748B]">{subject.code || '—'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-[#64748B] mb-3">Teacher: {teacherName}</p>
                  <div className="flex gap-2">
                    <button className="flex-1 text-xs bg-[#F8FAFC] text-[#4F46E5] py-2 rounded font-semibold hover:bg-[#EEF2FF]">Syllabus</button>
                    <button className="flex-1 text-xs bg-[#4F46E5] text-white py-2 rounded font-semibold hover:bg-[#4338CA]">Materials</button>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-3 p-8 text-center text-[#64748B]">
                <p>No subjects found for your class</p>
              </div>
            )}
            {subjects.length === 0 && classInfo?.subjects?.map((subName, idx) => {
              const color = COLORS[idx % COLORS.length];
              return (
                <div key={idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                      <BookOpen size={20} style={{ color }} />
                    </div>
                    <div>
                      <h4 className="font-bold">{subName}</h4>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 text-xs bg-[#F8FAFC] text-[#4F46E5] py-2 rounded font-semibold hover:bg-[#EEF2FF]">Syllabus</button>
                    <button className="flex-1 text-xs bg-[#4F46E5] text-white py-2 rounded font-semibold hover:bg-[#4338CA]">Materials</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // 5. Homework & Assignments (stub - no backend yet)
  const renderHomework = () => {
    const today = new Date().toDateString();
    const pending = homeworkData.filter(h => !h.submission && h.status === 'active');
    const dueToday = homeworkData.filter(h => new Date(h.dueDate).toDateString() === today && !h.submission);
    const submitted = homeworkData.filter(h => h.submission?.status === 'submitted');
    const graded = homeworkData.filter(h => h.submission?.status === 'graded');

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#0F172A]">Homework & Assignments</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-[#FEE2E2] rounded-xl border-2 border-[#DC2626]">
            <p className="text-sm text-[#64748B]">Pending</p>
            <p className="text-2xl font-bold text-[#991B1B]">{pending.length}</p>
          </div>
          <div className="p-4 bg-[#FEF3C7] rounded-xl border-2 border-[#F59E0B]">
            <p className="text-sm text-[#64748B]">Due Today</p>
            <p className="text-2xl font-bold text-[#92400E]">{dueToday.length}</p>
          </div>
          <div className="p-4 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981]">
            <p className="text-sm text-[#64748B]">Submitted</p>
            <p className="text-2xl font-bold text-[#065F46]">{submitted.length}</p>
          </div>
          <div className="p-4 bg-[#DBEAFE] rounded-xl border-2 border-[#3B82F6]">
            <p className="text-sm text-[#64748B]">Graded</p>
            <p className="text-2xl font-bold text-[#1E40AF]">{graded.length}</p>
          </div>
        </div>

        {homeworkData.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-12 text-center text-[#64748B]">
            <FileText className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-lg font-medium">No homework assigned yet</p>
            <p className="text-sm mt-1">Your assignments will appear here once available</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#FEF3C7]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Files</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {homeworkData.map((hw, i) => {
                    const isOverdue = !hw.submission && new Date(hw.dueDate) < new Date() && hw.status === 'active';
                    const statusLabel = hw.submission?.status || (isOverdue ? 'overdue' : 'pending');
                    const statusClasses = {
                      graded: 'bg-[#DBEAFE] text-[#1E40AF]',
                      submitted: 'bg-[#D1FAE5] text-[#065F46]',
                      overdue: 'bg-[#FEE2E2] text-[#991B1B]',
                    };
                    const statusClass = statusClasses[statusLabel] || 'bg-[#FEF3C7] text-[#92400E]';
                    return (
                      <tr key={hw._id || i} className="hover:bg-[#FFFBEB]">
                        <td className="px-6 py-4 font-semibold text-[#0F172A]">{hw.title}</td>
                        <td className="px-6 py-4 text-sm text-[#64748B]">{hw.subjectId?.name || hw.subject || '—'}</td>
                        <td className="px-6 py-4 text-sm">{formatDate(hw.dueDate)}</td>
                        <td className="px-6 py-4">
                          {hw.attachments && hw.attachments.length > 0 ? (
                            <div className="space-y-1">
                              {hw.attachments.map((file, fileIndex) => (
                                <button
                                  key={fileIndex}
                                  onClick={() => handleDownloadFile(hw._id, file.filename, file.originalName)}
                                  className="flex items-center gap-2 text-sm text-[#4F46E5] hover:text-[#6366F1] hover:underline"
                                  title={`Download ${file.originalName}`}
                                >
                                  <Download size={14} />
                                  <span className="truncate max-w-30">{file.originalName}</span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-[#94A3B8]">No files</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClass}`}>{statusLabel}</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold">{hw.submission?.grade || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 6. Exams & Results
  const renderExams = () => {
    const upcomingExams = exams.filter(e => new Date(e.date) >= new Date());
    const results = examResults || [];
    const totalMarks = results.reduce((sum, r) => sum + (r.marks || 0), 0);
    const totalMax = results.reduce((sum, r) => sum + (r.examId?.maxScore || 100), 0);
    const overallPercentage = totalMax > 0 ? ((totalMarks / totalMax) * 100).toFixed(1) : 0;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#0F172A]">Exams & Results</h2>

        {upcomingExams.length > 0 && (
          <div className="bg-linear-to-r from-[#FEF3C7] to-[#FEE2E2] rounded-xl p-6 border-2 border-[#FCD34D]">
            <h3 className="font-bold text-lg mb-2">Upcoming Examination</h3>
            <p className="text-[#64748B]">{upcomingExams[0].examType} - {upcomingExams[0].subject}</p>
            <p className="text-sm text-[#64748B] mt-2">Date: <span className="font-bold text-[#DC2626]">{formatDate(upcomingExams[0].date)}</span></p>
          </div>
        )}

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Exam Schedules</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-linear-to-r from-[#DBEAFE] to-[#EDE9FE]">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-sm">Date</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Subject</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Type</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Time</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Max Marks</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam, idx) => (
                  <tr key={idx} className="border-b border-[#E2E8F0]">
                    <td className="px-4 py-3 text-sm font-semibold">{formatDate(exam.date)}</td>
                    <td className="px-4 py-3 text-sm">{exam.subject}</td>
                    <td className="px-4 py-3 text-sm">{exam.examType}</td>
                    <td className="px-4 py-3 text-sm">{formatTime(exam.startTime)} - {formatTime(exam.endTime)}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{exam.maxScore || 100}</td>
                  </tr>
                ))}
                {exams.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-[#64748B]">No exams scheduled</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
            <h3 className="font-bold mb-4">Exam Results</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-linear-to-r from-[#D1FAE5] to-[#DBEAFE]">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-sm">Subject</th>
                    <th className="px-4 py-3 text-left font-bold text-sm">Exam Type</th>
                    <th className="px-4 py-3 text-left font-bold text-sm">Marks Obtained</th>
                    <th className="px-4 py-3 text-left font-bold text-sm">Max Marks</th>
                    <th className="px-4 py-3 text-left font-bold text-sm">Percentage</th>
                    <th className="px-4 py-3 text-left font-bold text-sm">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, idx) => {
                    const maxScore = result.examId?.maxScore || 100;
                    const pct = maxScore > 0 ? ((result.marks / maxScore) * 100).toFixed(0) : 0;
                    return (
                      <tr key={idx} className="border-b border-[#E2E8F0]">
                        <td className="px-4 py-3 text-sm font-semibold">{result.examId?.subject || '—'}</td>
                        <td className="px-4 py-3 text-sm">{result.examId?.examType || '—'}</td>
                        <td className="px-4 py-3 text-sm">{result.marks}</td>
                        <td className="px-4 py-3 text-sm">{maxScore}</td>
                        <td className="px-4 py-3 text-sm">{pct}%</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getGradeBadge(result.grade)}`}>{result.grade}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-[#D1FAE5] rounded-lg flex justify-between items-center">
              <div>
                <p className="font-bold text-lg text-[#065F46]">Total: {totalMarks} / {totalMax}</p>
                <p className="text-sm text-[#064E3B]">Overall Percentage: {overallPercentage}%</p>
              </div>
              <button className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                <Download size={18} /> Download Report Card
              </button>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Calculator className="text-[#F59E0B]" size={20} />
              Performance Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Subject-wise Performance</h4>
                <div className="space-y-3">
                  {results.map((r, idx) => {
                    const maxScore = r.examId?.maxScore || 100;
                    const pct = maxScore > 0 ? Math.round((r.marks / maxScore) * 100) : 0;
                    return (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{r.examId?.subject || '—'}</span>
                          <span className="font-semibold">{pct}%</span>
                        </div>
                        <div className="w-full h-3 bg-[#E2E8F0] rounded-full">
                          <div className={`h-3 rounded-full ${pct >= 90 ? 'bg-[#10B981]' : pct >= 80 ? 'bg-[#3B82F6]' : pct >= 60 ? 'bg-[#F59E0B]' : 'bg-[#DC2626]'
                            }`} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="p-4 bg-[#F8FAFC] rounded-lg">
                <h4 className="font-semibold mb-3">Overall Statistics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between p-2 bg-white rounded">
                    <span>Total Exams</span>
                    <span className="font-bold text-[#4F46E5]">{results.length}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white rounded">
                    <span>Overall Percentage</span>
                    <span className="font-bold text-[#10B981]">{overallPercentage}%</span>
                  </div>
                  {results.length > 0 && (() => {
                    const sorted = [...results].sort((a, b) => (b.marks / (b.examId?.maxScore || 100)) - (a.marks / (a.examId?.maxScore || 100)));
                    return (
                      <>
                        <div className="flex justify-between p-2 bg-white rounded">
                          <span>Strongest Subject</span>
                          <span className="font-bold">{sorted[0]?.examId?.subject || '—'}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-white rounded">
                          <span>Needs Improvement</span>
                          <span className="font-bold text-[#F59E0B]">{sorted[sorted.length - 1]?.examId?.subject || '—'}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 7. Communication & Notices
  const renderCommunication = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Communication & Notices</h2>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Bell className="text-[#DC2626]" size={20} />
          School Announcements
        </h3>
        <div className="space-y-4">
          {announcements.length > 0 ? announcements.map((a, idx) => (
            <div key={idx} className={`p-4 rounded-lg border-l-4 ${a.priority === 'high' || a.priority === 'urgent' ? 'bg-[#FEE2E2] border-[#DC2626]' :
                a.priority === 'normal' ? 'bg-[#FEF3C7] border-[#F59E0B]' :
                  'bg-[#F1F5F9] border-[#64748B]'
              }`}>
              <div className="flex justify-between items-start">
                <h4 className="font-semibold">{a.title}</h4>
                <span className="text-xs text-[#64748B]">{formatDate(a.createdAt)}</span>
              </div>
              <p className="text-sm text-[#64748B] mt-1">{a.message}</p>
            </div>
          )) : (
            <p className="text-center text-[#64748B] py-4">No announcements</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="text-[#4F46E5]" size={20} />
            Messages
          </h3>
          <div className="space-y-3">
            {messages.length > 0 ? messages.slice(0, 5).map((msg, idx) => (
              <div key={idx} className="p-3 border-2 border-[#E2E8F0] rounded-lg">
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-sm">{msg.fromUserId?.name || 'Unknown'}</p>
                  <span className="text-xs text-[#64748B]">{formatDate(msg.createdAt)}</span>
                </div>
                <p className="text-sm text-[#64748B] mt-1">{msg.content}</p>
              </div>
            )) : (
              <p className="text-center text-[#64748B] py-4">No messages</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
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
                          {formatDate(event.startDate)}
                          {event.endDate && ` - ${formatDate(event.endDate)}`}
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
    </div>
  );

  // 8. Fees & Payments
  const renderFees = () => {
    const { fees, summary } = feesData;
    const totalFees = summary.totalDue + summary.totalPaid;
    const paidPercentage = totalFees > 0 ? ((summary.totalPaid / totalFees) * 100).toFixed(1) : '0.0';
    const pendingFees = fees.filter(f => f.status !== 'paid');
    const paidFees = fees.filter(f => f.status === 'paid');

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#0F172A]">Fees & Payments</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981]">
            <p className="text-sm text-[#64748B]">Total Fees</p>
            <p className="text-2xl font-bold text-[#065F46]">{totalFees > 0 ? `₹${totalFees.toLocaleString()}` : '₹0'}</p>
            <p className="text-xs text-[#10B981]">Annual {getAcademicYear()}</p>
          </div>
          <div className="p-6 bg-[#DBEAFE] rounded-xl border-2 border-[#3B82F6]">
            <p className="text-sm text-[#64748B]">Paid</p>
            <p className="text-2xl font-bold text-[#1E40AF]">{summary.totalPaid > 0 ? `₹${summary.totalPaid.toLocaleString()}` : '₹0'}</p>
            <p className="text-xs text-[#3B82F6]">{paidPercentage}% Complete</p>
          </div>
          <div className="p-6 bg-[#FEE2E2] rounded-xl border-2 border-[#DC2626]">
            <p className="text-sm text-[#64748B]">Pending</p>
            <p className="text-2xl font-bold text-[#991B1B]">{summary.totalDue > 0 ? `₹${summary.totalDue.toLocaleString()}` : '₹0'}</p>
            <p className="text-xs text-[#DC2626]">{pendingFees.length > 0 ? `Due: ${formatDate(pendingFees[0].dueDate)}` : 'All Clear'}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Fee Records - Academic Year {getAcademicYear()}</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-linear-to-r from-[#FEF3C7] to-[#FEE2E2]">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-sm">Description</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Amount</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Due Date</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee, idx) => (
                  <tr key={idx} className="border-b border-[#E2E8F0]">
                    <td className="px-4 py-3 text-sm">{fee.description || '—'}</td>
                    <td className="px-4 py-3 text-sm font-semibold">₹{fee.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(fee.dueDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${fee.status === 'paid' ? 'bg-[#D1FAE5] text-[#065F46]' :
                          fee.status === 'overdue' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                            'bg-[#FEF3C7] text-[#92400E]'
                        }`}>{fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}</span>
                    </td>
                  </tr>
                ))}
                {fees.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-[#64748B]">No fee records found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {paidFees.length > 0 && (
          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Receipt className="text-[#10B981]" size={20} />
              Payment History
            </h3>
            <div className="space-y-3">
              {paidFees.map((receipt, idx) => (
                <div key={idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{receipt.description || 'Payment'}</p>
                    <p className="text-sm text-[#64748B]">Paid on {formatDate(receipt.paidAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#10B981]">₹{receipt.amount?.toLocaleString()}</span>
                    <button className="text-[#4F46E5]"><Download size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 9. Library (stub - will wire in Tier 1.4)
  const renderLibrary = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Library</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#DBEAFE] rounded-xl border-2 border-[#3B82F6]">
          <Library className="text-[#3B82F6] mb-2" size={24} />
          <p className="text-sm text-[#64748B]">Books Issued</p>
          <p className="text-2xl font-bold text-[#1E40AF]">0</p>
        </div>
        <div className="p-4 bg-[#FEF3C7] rounded-xl border-2 border-[#F59E0B]">
          <Clock className="text-[#F59E0B] mb-2" size={24} />
          <p className="text-sm text-[#64748B]">Due Soon</p>
          <p className="text-2xl font-bold text-[#92400E]">0</p>
        </div>
        <div className="p-4 bg-[#FEE2E2] rounded-xl border-2 border-[#DC2626]">
          <AlertCircle className="text-[#DC2626] mb-2" size={24} />
          <p className="text-sm text-[#64748B]">Overdue</p>
          <p className="text-2xl font-bold text-[#991B1B]">0</p>
        </div>
        <div className="p-4 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981]">
          <DollarSign className="text-[#10B981] mb-2" size={24} />
          <p className="text-sm text-[#64748B]">Fine Due</p>
          <p className="text-2xl font-bold text-[#065F46]">₹0</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-12 text-center text-[#64748B]">
        <Library className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-lg font-medium">Library module coming soon</p>
        <p className="text-sm mt-1">Your issued books and library activity will appear here</p>
      </div>
    </div>
  );

  // 10. Activities & Scholarships
  const renderActivities = () => {
    const STATUS_COLORS = {
      pending:  'bg-[#FEF3C7] text-[#92400E]',
      approved: 'bg-[#D1FAE5] text-[#065F46]',
      rejected: 'bg-[#FEE2E2] text-[#991B1B]',
      disbursed:'bg-[#DBEAFE] text-[#1E40AF]',
    };
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#0F172A]">Activities & Scholarships</h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Trophy className="text-[#F59E0B]" size={20} />
            <h3 className="font-semibold text-[#0F172A]">My Scholarships</h3>
          </div>
          {scholarships.length === 0 ? (
            <div className="p-12 text-center text-[#64748B]">
              <Trophy className="mx-auto mb-4 text-gray-300" size={48} />
              <p className="text-lg font-medium">No scholarships yet</p>
              <p className="text-sm mt-1">Scholarships awarded to you will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {scholarships.map(s => (
                <div key={s._id} className="px-6 py-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#0F172A]">{s.name}</p>
                    {s.description && <p className="text-sm text-[#64748B] mt-0.5">{s.description}</p>}
                    {s.criteria && <p className="text-xs text-[#94A3B8] mt-0.5">Criteria: {s.criteria}</p>}
                    <p className="text-xs text-[#94A3B8] mt-1">Year: {s.academicYear} · Type: {s.type}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-[#4F46E5]">₹{s.amount?.toLocaleString('en-IN')}</p>
                    <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[s.status] || ''}`}>
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 11. Requests & Forms (stub)
  const renderRequests = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Requests & Forms</h2>
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-12 text-center text-[#64748B]">
        <FileQuestion className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-lg font-medium">Requests module coming soon</p>
        <p className="text-sm mt-1">You will be able to request certificates, documents, and more</p>
      </div>
    </div>
  );

  // 12. Settings
  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Settings</h2>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Settings className="text-[#64748B]" size={20} />
          Account Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <input type="email" defaultValue={user?.email || ''} className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2" readOnly />
          </div>
          <button className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg font-semibold text-sm">Change Password</button>
        </div>
      </div>
{/* 
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <HelpCircle className="text-[#4F46E5]" size={20} />
          Help & Support
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-[#FEF3C7] rounded-lg">
            <p className="font-semibold">IT Help Desk</p>
            <p className="text-sm text-[#64748B]">For login & technical issues</p>
          </div>
          <div className="p-4 bg-[#DBEAFE] rounded-lg">
            <p className="font-semibold">Academic Support</p>
            <p className="text-sm text-[#64748B]">For academic queries</p>
          </div>
        </div>
      </div> */}
    </div>
  );

  const modules = [
    { id: 'profile', name: 'Profile', render: renderProfile },
    { id: 'attendance', name: 'Attendance', render: renderAttendance },
    { id: 'timetable', name: 'Timetable', render: renderTimetable },
    { id: 'subjects', name: 'Subjects', render: renderSubjects },
    { id: 'homework', name: 'Homework', render: renderHomework },
    { id: 'exams', name: 'Exams', render: renderExams },
    { id: 'communication', name: 'Communication', render: renderCommunication },
    { id: 'fees', name: 'Fees', render: renderFees },
    { id: 'library', name: 'Library', render: renderLibrary },
    { id: 'activities', name: 'Activities', render: renderActivities },
    { id: 'requests', name: 'Requests', render: renderRequests },
    { id: 'settings', name: 'Settings', render: renderSettings },
  ];

  const currentModule = modules.find(m => m.id === module) || modules[0];

  return (
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
          {currentModule.render()}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
