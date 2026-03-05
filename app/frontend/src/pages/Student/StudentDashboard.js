import React from 'react';
import { 
  User, Calendar, BookOpen, FileText, ClipboardCheck, 
  MessageSquare, DollarSign, Library, Award, Settings,
  Clock, CheckCircle, XCircle, Bell, Mail, Download, Upload,
  Star, HelpCircle, LogOut, ChevronRight, ExternalLink, Video,
  CreditCard, Receipt, Search, Trophy, Medal, FileQuestion,
  AlertCircle, Play, BookMarked, GraduationCap, Calculator
} from 'lucide-react';

const StudentDashboard = ({ user, module = 'profile' }) => {

  // 1. Student Profile
  const renderProfile = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Student Profile</h2>
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-[#DBEAFE] to-[#EDE9FE] rounded-full flex items-center justify-center text-4xl font-bold text-[#4F46E5]">
            {user?.full_name?.charAt(0) || 'S'}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#0F172A]">{user?.full_name || 'Student User'}</h3>
            <p className="text-[#64748B]">Student ID: STU-2024-001</p>
            <span className="inline-block mt-2 px-3 py-1 bg-[#10B981] text-white text-xs font-semibold rounded-full">Active Student</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-[#DBEAFE] rounded-lg">
            <p className="text-sm text-[#64748B]">Class</p>
            <p className="font-bold text-[#0F172A]">Grade 10-A</p>
          </div>
          <div className="p-4 bg-[#D1FAE5] rounded-lg">
            <p className="text-sm text-[#64748B]">Section</p>
            <p className="font-bold text-[#0F172A]">Section A</p>
          </div>
          <div className="p-4 bg-[#FEF3C7] rounded-lg">
            <p className="text-sm text-[#64748B]">Roll Number</p>
            <p className="font-bold text-[#0F172A]">15</p>
          </div>
          <div className="p-4 bg-[#FEE2E2] rounded-lg">
            <p className="text-sm text-[#64748B]">Academic Year</p>
            <p className="font-bold text-[#0F172A]">2024-25</p>
          </div>
        </div>

        <div className="border-t border-[#E2E8F0] pt-4">
          <h4 className="font-semibold mb-3">Personal Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-[#F8FAFC] rounded-lg">
              <p className="text-sm text-[#64748B]">Date of Birth</p>
              <p className="font-semibold">15 March 2010</p>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-lg">
              <p className="text-sm text-[#64748B]">Gender</p>
              <p className="font-semibold">Male</p>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-lg">
              <p className="text-sm text-[#64748B]">Blood Group</p>
              <p className="font-semibold">O+</p>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-lg">
              <p className="text-sm text-[#64748B]">Admission Date</p>
              <p className="font-semibold">01 April 2020</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E2E8F0] pt-4 mt-4">
          <h4 className="font-semibold mb-3">Contact Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-[#F8FAFC] rounded-lg">
              <Mail className="text-[#64748B]" size={18} />
              <span className="text-sm">student@ajmschool.edu</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-[#F8FAFC] rounded-lg">
              <User className="text-[#64748B]" size={18} />
              <span className="text-sm">+91 9876543210 (Parent)</span>
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
  const renderAttendance = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Attendance</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981]">
          <p className="text-sm text-[#64748B]">Total Present</p>
          <p className="text-3xl font-bold text-[#065F46]">156</p>
          <p className="text-xs text-[#10B981]">Days</p>
        </div>
        <div className="p-6 bg-[#FEE2E2] rounded-xl border-2 border-[#DC2626]">
          <p className="text-sm text-[#64748B]">Total Absent</p>
          <p className="text-3xl font-bold text-[#991B1B]">8</p>
          <p className="text-xs text-[#DC2626]">Days</p>
        </div>
        <div className="p-6 bg-[#FEF3C7] rounded-xl border-2 border-[#F59E0B]">
          <p className="text-sm text-[#64748B]">Late Arrivals</p>
          <p className="text-3xl font-bold text-[#92400E]">4</p>
          <p className="text-xs text-[#F59E0B]">Days</p>
        </div>
        <div className="p-6 bg-[#DBEAFE] rounded-xl border-2 border-[#3B82F6]">
          <p className="text-sm text-[#64748B]">Attendance %</p>
          <p className="text-3xl font-bold text-[#1E40AF]">95.2%</p>
          <p className="text-xs text-[#3B82F6]">Overall</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Calendar className="text-[#F59E0B]" size={20} />
          Today's Attendance Status
        </h3>
        <div className="p-4 bg-[#D1FAE5] rounded-lg flex items-center gap-4">
          <CheckCircle className="text-[#10B981]" size={32} />
          <div>
            <p className="font-bold text-lg text-[#065F46]">Present</p>
            <p className="text-sm text-[#64748B]">December 24, 2024 - Marked at 8:45 AM</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Monthly Attendance Report - December 2024</h3>
        <div className="grid grid-cols-7 gap-2 text-center text-sm">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="font-semibold text-[#64748B] py-2">{day}</div>
          ))}
          {[...Array(31)].map((_, i) => {
            const status = i < 24 ? (i === 7 || i === 14 || i === 21 ? 'holiday' : i === 10 ? 'absent' : 'present') : 'future';
            return (
              <div key={i} className={`p-2 rounded ${
                status === 'present' ? 'bg-[#D1FAE5] text-[#065F46]' :
                status === 'absent' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                status === 'holiday' ? 'bg-[#E2E8F0] text-[#64748B]' :
                'bg-[#F8FAFC] text-[#94A3B8]'
              }`}>
                {i + 1}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex gap-4 text-sm">
          <span className="flex items-center gap-2"><span className="w-4 h-4 bg-[#D1FAE5] rounded"></span> Present</span>
          <span className="flex items-center gap-2"><span className="w-4 h-4 bg-[#FEE2E2] rounded"></span> Absent</span>
          <span className="flex items-center gap-2"><span className="w-4 h-4 bg-[#E2E8F0] rounded"></span> Holiday</span>
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
            <div className="p-3 bg-[#FEE2E2] rounded-lg border-l-4 border-[#DC2626]">
              <p className="font-semibold text-sm">Low Attendance Warning</p>
              <p className="text-xs text-[#64748B]">Attendance below 75% may affect exam eligibility</p>
            </div>
            <div className="p-3 bg-[#FEF3C7] rounded-lg border-l-4 border-[#F59E0B]">
              <p className="font-semibold text-sm">Leave Balance</p>
              <p className="text-xs text-[#64748B]">You have 5 casual leaves remaining</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 3. Timetable & Schedule
  const renderTimetable = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Timetable & Schedule</h2>
      
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Class Timetable - Grade 10-A</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#DBEAFE] to-[#EDE9FE]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Day</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Period 1<br/><span className="font-normal text-xs">8:30-9:15</span></th>
                <th className="px-4 py-3 text-left font-bold text-sm">Period 2<br/><span className="font-normal text-xs">9:15-10:00</span></th>
                <th className="px-4 py-3 text-left font-bold text-sm">Period 3<br/><span className="font-normal text-xs">10:15-11:00</span></th>
                <th className="px-4 py-3 text-left font-bold text-sm">Period 4<br/><span className="font-normal text-xs">11:00-11:45</span></th>
                <th className="px-4 py-3 text-left font-bold text-sm">Period 5<br/><span className="font-normal text-xs">12:30-1:15</span></th>
                <th className="px-4 py-3 text-left font-bold text-sm">Period 6<br/><span className="font-normal text-xs">1:15-2:00</span></th>
              </tr>
            </thead>
            <tbody>
              {[
                { day: 'Monday', p1: 'Mathematics', p2: 'English', p3: 'Science', p4: 'Hindi', p5: 'Social Studies', p6: 'Computer' },
                { day: 'Tuesday', p1: 'English', p2: 'Science', p3: 'Mathematics', p4: 'Physical Ed.', p5: 'Hindi', p6: 'Art' },
                { day: 'Wednesday', p1: 'Science', p2: 'Mathematics', p3: 'English', p4: 'Computer', p5: 'Social Studies', p6: 'Hindi' },
                { day: 'Thursday', p1: 'Hindi', p2: 'Social Studies', p3: 'Science Lab', p4: 'Science Lab', p5: 'Mathematics', p6: 'English' },
                { day: 'Friday', p1: 'Mathematics', p2: 'Hindi', p3: 'English', p4: 'Science', p5: 'Art', p6: 'Physical Ed.' },
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-[#E2E8F0]">
                  <td className="px-4 py-3 font-semibold">{row.day}</td>
                  <td className="px-4 py-3 text-sm">{row.p1}</td>
                  <td className="px-4 py-3 text-sm">{row.p2}</td>
                  <td className="px-4 py-3 text-sm">{row.p3}</td>
                  <td className="px-4 py-3 text-sm">{row.p4}</td>
                  <td className="px-4 py-3 text-sm">{row.p5}</td>
                  <td className="px-4 py-3 text-sm">{row.p6}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <GraduationCap className="text-[#DC2626]" size={20} />
          Exam Timetable - Mid-Term Examination
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#FEE2E2] to-[#FEF3C7]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Date</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Subject</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Time</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Duration</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Max Marks</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: 'Dec 26, 2024', subject: 'Mathematics', time: '9:00 AM', duration: '3 hrs', marks: 100 },
                { date: 'Dec 27, 2024', subject: 'English', time: '9:00 AM', duration: '3 hrs', marks: 100 },
                { date: 'Dec 28, 2024', subject: 'Science', time: '9:00 AM', duration: '3 hrs', marks: 100 },
                { date: 'Dec 30, 2024', subject: 'Social Studies', time: '9:00 AM', duration: '3 hrs', marks: 100 },
                { date: 'Dec 31, 2024', subject: 'Hindi', time: '9:00 AM', duration: '3 hrs', marks: 100 },
              ].map((exam, idx) => (
                <tr key={idx} className="border-b border-[#E2E8F0]">
                  <td className="px-4 py-3 text-sm font-semibold">{exam.date}</td>
                  <td className="px-4 py-3 text-sm">{exam.subject}</td>
                  <td className="px-4 py-3 text-sm">{exam.time}</td>
                  <td className="px-4 py-3 text-sm">{exam.duration}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{exam.marks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Holiday Calendar</h3>
          <div className="space-y-3">
            {[
              { date: 'Dec 25', name: 'Christmas', type: 'Public Holiday' },
              { date: 'Jan 1', name: 'New Year', type: 'Public Holiday' },
              { date: 'Jan 14', name: 'Makar Sankranti', type: 'Regional Holiday' },
              { date: 'Jan 26', name: 'Republic Day', type: 'National Holiday' },
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
              { name: 'Annual Day Celebration', date: 'Jan 15, 2025', type: 'Cultural' },
              { name: 'Science Exhibition', date: 'Jan 20, 2025', type: 'Academic' },
              { name: 'Sports Day', date: 'Feb 5, 2025', type: 'Sports' },
              { name: 'Parent-Teacher Meeting', date: 'Feb 10, 2025', type: 'Meeting' },
            ].map((event, idx) => (
              <div key={idx} className="p-3 border-l-4 border-[#4F46E5] bg-[#F8FAFC] rounded-r-lg">
                <p className="font-semibold">{event.name}</p>
                <p className="text-xs text-[#64748B]">{event.date} • {event.type}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // 4. Subjects & Learning (with Online Class Links - IMPORTANT)
  const renderSubjects = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Subjects & Learning</h2>
      
      {/* Online Classes Section - MOST IMPORTANT */}
      <div className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-xl p-6 text-white">
        <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
          <Video size={24} />
          Live Online Classes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { subject: 'Mathematics', teacher: 'Mr. Sharma', time: '10:00 AM', status: 'Live Now', link: '#' },
            { subject: 'Science', teacher: 'Mrs. Gupta', time: '11:30 AM', status: 'Starting Soon', link: '#' },
            { subject: 'English', teacher: 'Ms. Verma', time: '2:00 PM', status: 'Scheduled', link: '#' },
          ].map((cls, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold">{cls.subject}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  cls.status === 'Live Now' ? 'bg-[#DC2626] animate-pulse' : 
                  cls.status === 'Starting Soon' ? 'bg-[#F59E0B]' : 'bg-white/20'
                }`}>{cls.status}</span>
              </div>
              <p className="text-sm text-white/80">{cls.teacher}</p>
              <p className="text-sm text-white/80 mb-3">{cls.time}</p>
              <a 
                href={cls.link} 
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-sm transition-all ${
                  cls.status === 'Live Now' 
                    ? 'bg-white text-[#4F46E5] hover:bg-white/90' 
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <Play size={16} /> {cls.status === 'Live Now' ? 'Join Now' : 'Join Class'}
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Subject List</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Mathematics', code: 'MATH101', teacher: 'Mr. Sharma', color: '#3B82F6' },
            { name: 'English', code: 'ENG101', teacher: 'Ms. Verma', color: '#10B981' },
            { name: 'Science', code: 'SCI101', teacher: 'Mrs. Gupta', color: '#F59E0B' },
            { name: 'Social Studies', code: 'SST101', teacher: 'Mr. Patel', color: '#8B5CF6' },
            { name: 'Hindi', code: 'HIN101', teacher: 'Mrs. Singh', color: '#EC4899' },
            { name: 'Computer Science', code: 'CS101', teacher: 'Mr. Kumar', color: '#06B6D4' },
          ].map((subject, idx) => (
            <div key={idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${subject.color}20` }}>
                  <BookOpen size={20} style={{ color: subject.color }} />
                </div>
                <div>
                  <h4 className="font-bold">{subject.name}</h4>
                  <p className="text-xs text-[#64748B]">{subject.code}</p>
                </div>
              </div>
              <p className="text-sm text-[#64748B] mb-3">Teacher: {subject.teacher}</p>
              <div className="flex gap-2">
                <button className="flex-1 text-xs bg-[#F8FAFC] text-[#4F46E5] py-2 rounded font-semibold hover:bg-[#EEF2FF]">Syllabus</button>
                <button className="flex-1 text-xs bg-[#4F46E5] text-white py-2 rounded font-semibold hover:bg-[#4338CA]">Materials</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <BookMarked className="text-[#7C3AED]" size={20} />
            Study Materials
          </h3>
          <div className="space-y-3">
            {[
              { title: 'Quadratic Equations Notes', subject: 'Mathematics', type: 'PDF', size: '2.5 MB' },
              { title: 'Chemical Reactions Video', subject: 'Science', type: 'Video', size: '45 mins' },
              { title: 'English Grammar Guide', subject: 'English', type: 'PDF', size: '1.8 MB' },
              { title: 'World War II Summary', subject: 'Social Studies', type: 'PDF', size: '3.2 MB' },
            ].map((material, idx) => (
              <div key={idx} className="p-3 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    material.type === 'Video' ? 'bg-[#FEE2E2]' : 'bg-[#EDE9FE]'
                  }`}>
                    {material.type === 'Video' ? <Play className="text-[#DC2626]" size={20} /> : <FileText className="text-[#7C3AED]" size={20} />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{material.title}</p>
                    <p className="text-xs text-[#64748B]">{material.subject} • {material.size}</p>
                  </div>
                </div>
                <button className="text-[#4F46E5]"><Download size={18} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <FileText className="text-[#10B981]" size={20} />
            Lesson Plans
          </h3>
          <div className="space-y-3">
            {[
              { chapter: 'Chapter 5: Quadratic Equations', subject: 'Mathematics', progress: 80 },
              { chapter: 'Chapter 3: Chemical Reactions', subject: 'Science', progress: 65 },
              { chapter: 'Chapter 8: Tenses', subject: 'English', progress: 90 },
              { chapter: 'Chapter 4: Indian Freedom Struggle', subject: 'Social Studies', progress: 50 },
            ].map((plan, idx) => (
              <div key={idx} className="p-3 border-2 border-[#E2E8F0] rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-sm">{plan.chapter}</p>
                  <span className="text-xs text-[#64748B]">{plan.progress}%</span>
                </div>
                <p className="text-xs text-[#64748B] mb-2">{plan.subject}</p>
                <div className="w-full h-2 bg-[#E2E8F0] rounded-full">
                  <div className={`h-2 rounded-full ${plan.progress >= 75 ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`} style={{ width: `${plan.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recorded Classes Section */}
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Video className="text-[#DC2626]" size={20} />
          Recorded Classes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Algebra Basics', subject: 'Mathematics', duration: '45 mins', date: 'Dec 20' },
            { title: 'Photosynthesis', subject: 'Science', duration: '40 mins', date: 'Dec 19' },
            { title: 'Essay Writing', subject: 'English', duration: '35 mins', date: 'Dec 18' },
            { title: 'Ancient History', subject: 'Social Studies', duration: '50 mins', date: 'Dec 17' },
          ].map((video, idx) => (
            <div key={idx} className="border-2 border-[#E2E8F0] rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-24 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] flex items-center justify-center">
                <Play className="text-white" size={32} />
              </div>
              <div className="p-3">
                <h4 className="font-semibold text-sm">{video.title}</h4>
                <p className="text-xs text-[#64748B]">{video.subject}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-[#64748B]">{video.duration}</span>
                  <span className="text-xs text-[#64748B]">{video.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 5. Homework & Assignments
  const renderHomework = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Homework & Assignments</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#FEE2E2] rounded-xl border-2 border-[#DC2626]">
          <p className="text-sm text-[#64748B]">Pending</p>
          <p className="text-2xl font-bold text-[#991B1B]">3</p>
        </div>
        <div className="p-4 bg-[#FEF3C7] rounded-xl border-2 border-[#F59E0B]">
          <p className="text-sm text-[#64748B]">Due Today</p>
          <p className="text-2xl font-bold text-[#92400E]">1</p>
        </div>
        <div className="p-4 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981]">
          <p className="text-sm text-[#64748B]">Submitted</p>
          <p className="text-2xl font-bold text-[#065F46]">12</p>
        </div>
        <div className="p-4 bg-[#DBEAFE] rounded-xl border-2 border-[#3B82F6]">
          <p className="text-sm text-[#64748B]">Graded</p>
          <p className="text-2xl font-bold text-[#1E40AF]">10</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Pending Assignments</h3>
        <div className="space-y-4">
          {[
            { title: 'Quadratic Equations - Exercise 5.3', subject: 'Mathematics', teacher: 'Mr. Sharma', due: 'Dec 24, 2024', priority: 'high' },
            { title: 'Essay on Environmental Conservation', subject: 'English', teacher: 'Ms. Verma', due: 'Dec 26, 2024', priority: 'medium' },
            { title: 'Science Lab Report - Photosynthesis', subject: 'Science', teacher: 'Mrs. Gupta', due: 'Dec 28, 2024', priority: 'medium' },
          ].map((hw, idx) => (
            <div key={idx} className={`p-4 border-2 rounded-lg ${
              hw.priority === 'high' ? 'border-[#DC2626] bg-[#FEF2F2]' : 'border-[#FCD34D]'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold">{hw.title}</h4>
                  <p className="text-sm text-[#64748B]">{hw.subject} • {hw.teacher}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  hw.priority === 'high' ? 'bg-[#DC2626] text-white' : 'bg-[#F59E0B] text-white'
                }`}>
                  {hw.priority === 'high' ? 'Due Today!' : 'Upcoming'}
                </span>
              </div>
              <div className="flex justify-between items-center mt-3">
                <p className="text-sm"><Clock className="inline mr-1" size={14} /> Due: {hw.due}</p>
                <button className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                  <Upload size={16} /> Submit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Submitted Assignments & Teacher Feedback</h3>
        <div className="space-y-4">
          {[
            { title: 'Linear Equations Worksheet', subject: 'Mathematics', submitted: 'Dec 20', grade: 'A', feedback: 'Excellent work! All solutions are correct.' },
            { title: 'Book Review - To Kill a Mockingbird', subject: 'English', submitted: 'Dec 18', grade: 'A-', feedback: 'Good analysis. Work on conclusion paragraph.' },
            { title: 'Chemistry Lab Report', subject: 'Science', submitted: 'Dec 15', grade: 'B+', feedback: 'Good observations. Include more detailed analysis.' },
          ].map((assignment, idx) => (
            <div key={idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold">{assignment.title}</h4>
                  <p className="text-sm text-[#64748B]">{assignment.subject} • Submitted: {assignment.submitted}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-lg font-bold ${
                  assignment.grade.startsWith('A') ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEF3C7] text-[#92400E]'
                }`}>{assignment.grade}</span>
              </div>
              <div className="mt-3 p-3 bg-[#F8FAFC] rounded-lg">
                <p className="text-sm"><span className="font-semibold">Teacher Feedback:</span> {assignment.feedback}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 6. Exams & Results
  const renderExams = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Exams & Results</h2>
      
      <div className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2] rounded-xl p-6 border-2 border-[#FCD34D]">
        <h3 className="font-bold text-lg mb-2">Upcoming Examination</h3>
        <p className="text-[#64748B]">Mid-Term Examination - December 2024</p>
        <p className="text-sm text-[#64748B] mt-2">Starts in: <span className="font-bold text-[#DC2626]">2 Days</span></p>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Exam Schedules</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#DBEAFE] to-[#EDE9FE]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Date</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Subject</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Time</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Room</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Max Marks</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: 'Dec 26', subject: 'Mathematics', time: '9:00 AM - 12:00 PM', room: 'Hall A', marks: 100 },
                { date: 'Dec 27', subject: 'English', time: '9:00 AM - 12:00 PM', room: 'Hall A', marks: 100 },
                { date: 'Dec 28', subject: 'Science', time: '9:00 AM - 12:00 PM', room: 'Hall B', marks: 100 },
                { date: 'Dec 30', subject: 'Social Studies', time: '9:00 AM - 12:00 PM', room: 'Hall A', marks: 100 },
                { date: 'Dec 31', subject: 'Hindi', time: '9:00 AM - 12:00 PM', room: 'Hall B', marks: 100 },
              ].map((exam, idx) => (
                <tr key={idx} className="border-b border-[#E2E8F0]">
                  <td className="px-4 py-3 text-sm font-semibold">{exam.date}</td>
                  <td className="px-4 py-3 text-sm">{exam.subject}</td>
                  <td className="px-4 py-3 text-sm">{exam.time}</td>
                  <td className="px-4 py-3 text-sm">{exam.room}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{exam.marks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Previous Exam Results - Quarterly Examination</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#D1FAE5] to-[#DBEAFE]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Subject</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Marks Obtained</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Max Marks</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Percentage</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Grade</th>
              </tr>
            </thead>
            <tbody>
              {[
                { subject: 'Mathematics', marks: 92, max: 100, percentage: 92, grade: 'A+' },
                { subject: 'English', marks: 85, max: 100, percentage: 85, grade: 'A' },
                { subject: 'Science', marks: 88, max: 100, percentage: 88, grade: 'A' },
                { subject: 'Social Studies', marks: 78, max: 100, percentage: 78, grade: 'B+' },
                { subject: 'Hindi', marks: 82, max: 100, percentage: 82, grade: 'A' },
              ].map((result, idx) => (
                <tr key={idx} className="border-b border-[#E2E8F0]">
                  <td className="px-4 py-3 text-sm font-semibold">{result.subject}</td>
                  <td className="px-4 py-3 text-sm">{result.marks}</td>
                  <td className="px-4 py-3 text-sm">{result.max}</td>
                  <td className="px-4 py-3 text-sm">{result.percentage}%</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      result.grade === 'A+' ? 'bg-[#D1FAE5] text-[#065F46]' :
                      result.grade === 'A' ? 'bg-[#DBEAFE] text-[#1E40AF]' :
                      'bg-[#FEF3C7] text-[#92400E]'
                    }`}>{result.grade}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-[#D1FAE5] rounded-lg flex justify-between items-center">
          <div>
            <p className="font-bold text-lg text-[#065F46]">Total: 425 / 500</p>
            <p className="text-sm text-[#064E3B]">Overall Percentage: 85% | Grade: A</p>
          </div>
          <button className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
            <Download size={18} /> Download Report Card
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Calculator className="text-[#F59E0B]" size={20} />
          Performance Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Subject-wise Performance</h4>
            <div className="space-y-3">
              {[
                { subject: 'Mathematics', score: 92 },
                { subject: 'Science', score: 88 },
                { subject: 'English', score: 85 },
                { subject: 'Hindi', score: 82 },
                { subject: 'Social Studies', score: 78 },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.subject}</span>
                    <span className="font-semibold">{item.score}%</span>
                  </div>
                  <div className="w-full h-3 bg-[#E2E8F0] rounded-full">
                    <div className={`h-3 rounded-full ${
                      item.score >= 90 ? 'bg-[#10B981]' : item.score >= 80 ? 'bg-[#3B82F6]' : 'bg-[#F59E0B]'
                    }`} style={{ width: `${item.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 bg-[#F8FAFC] rounded-lg">
            <h4 className="font-semibold mb-3">Overall Statistics</h4>
            <div className="space-y-3">
              <div className="flex justify-between p-2 bg-white rounded">
                <span>Class Rank</span>
                <span className="font-bold text-[#4F46E5]">5th out of 35</span>
              </div>
              <div className="flex justify-between p-2 bg-white rounded">
                <span>Improvement from Last Exam</span>
                <span className="font-bold text-[#10B981]">+5%</span>
              </div>
              <div className="flex justify-between p-2 bg-white rounded">
                <span>Strongest Subject</span>
                <span className="font-bold">Mathematics</span>
              </div>
              <div className="flex justify-between p-2 bg-white rounded">
                <span>Needs Improvement</span>
                <span className="font-bold text-[#F59E0B]">Social Studies</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
          {[
            { title: 'Mid-Term Exam Schedule Released', message: 'The mid-term examination will begin from December 26, 2024. Please check the exam timetable.', time: '2 hours ago', priority: 'high' },
            { title: 'Annual Day Participation', message: 'Students interested in participating in Annual Day cultural programs may register by Dec 28.', time: '1 day ago', priority: 'medium' },
            { title: 'Winter Vacation Notice', message: 'School will remain closed from January 1-5, 2025 for winter vacation.', time: '2 days ago', priority: 'low' },
          ].map((announcement, idx) => (
            <div key={idx} className={`p-4 rounded-lg border-l-4 ${
              announcement.priority === 'high' ? 'bg-[#FEE2E2] border-[#DC2626]' :
              announcement.priority === 'medium' ? 'bg-[#FEF3C7] border-[#F59E0B]' :
              'bg-[#F1F5F9] border-[#64748B]'
            }`}>
              <div className="flex justify-between items-start">
                <h4 className="font-semibold">{announcement.title}</h4>
                <span className="text-xs text-[#64748B]">{announcement.time}</span>
              </div>
              <p className="text-sm text-[#64748B] mt-1">{announcement.message}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="text-[#4F46E5]" size={20} />
            Messages from Teachers
          </h3>
          <div className="space-y-3">
            {[
              { teacher: 'Mr. Sharma (Mathematics)', message: 'Please complete the practice problems before the exam.', time: 'Today, 10:30 AM' },
              { teacher: 'Mrs. Gupta (Science)', message: 'Lab report submission extended to Dec 28.', time: 'Yesterday, 3:15 PM' },
              { teacher: 'Ms. Verma (English)', message: 'Great essay! Keep up the good work.', time: 'Dec 20, 2024' },
            ].map((msg, idx) => (
              <div key={idx} className="p-3 border-2 border-[#E2E8F0] rounded-lg">
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-sm">{msg.teacher}</p>
                  <span className="text-xs text-[#64748B]">{msg.time}</span>
                </div>
                <p className="text-sm text-[#64748B] mt-1">{msg.message}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <FileText className="text-[#10B981]" size={20} />
            Notices & Circulars
          </h3>
          <div className="space-y-3">
            {[
              { title: 'Exam Hall Rules', date: 'Dec 20, 2024', type: 'Circular' },
              { title: 'Parent-Teacher Meeting Schedule', date: 'Dec 18, 2024', type: 'Notice' },
              { title: 'Sports Day Registration', date: 'Dec 15, 2024', type: 'Notice' },
              { title: 'Library Timings Update', date: 'Dec 12, 2024', type: 'Circular' },
            ].map((notice, idx) => (
              <div key={idx} className="p-3 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center hover:bg-[#F8FAFC] cursor-pointer">
                <div>
                  <p className="font-semibold text-sm">{notice.title}</p>
                  <p className="text-xs text-[#64748B]">{notice.date}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  notice.type === 'Circular' ? 'bg-[#DBEAFE] text-[#1E40AF]' : 'bg-[#FEF3C7] text-[#92400E]'
                }`}>{notice.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#DC2626] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <AlertCircle className="text-[#DC2626]" size={20} />
          Important Alerts
        </h3>
        <div className="space-y-3">
          <div className="p-4 bg-[#FEE2E2] rounded-lg flex items-start gap-3">
            <AlertCircle className="text-[#DC2626] flex-shrink-0" size={20} />
            <div>
              <p className="font-semibold text-[#991B1B]">Exam Starting Soon!</p>
              <p className="text-sm text-[#64748B]">Your mid-term examination begins in 2 days. Make sure to prepare well.</p>
            </div>
          </div>
          <div className="p-4 bg-[#FEF3C7] rounded-lg flex items-start gap-3">
            <AlertCircle className="text-[#F59E0B] flex-shrink-0" size={20} />
            <div>
              <p className="font-semibold text-[#92400E]">Pending Assignment</p>
              <p className="text-sm text-[#64748B]">You have 1 assignment due today. Submit before deadline.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 8. Fees & Payments
  const renderFees = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Fees & Payments</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981]">
          <p className="text-sm text-[#64748B]">Total Fees</p>
          <p className="text-2xl font-bold text-[#065F46]">₹85,000</p>
          <p className="text-xs text-[#10B981]">Annual 2024-25</p>
        </div>
        <div className="p-6 bg-[#DBEAFE] rounded-xl border-2 border-[#3B82F6]">
          <p className="text-sm text-[#64748B]">Paid</p>
          <p className="text-2xl font-bold text-[#1E40AF]">₹60,000</p>
          <p className="text-xs text-[#3B82F6]">70.5% Complete</p>
        </div>
        <div className="p-6 bg-[#FEE2E2] rounded-xl border-2 border-[#DC2626]">
          <p className="text-sm text-[#64748B]">Pending</p>
          <p className="text-2xl font-bold text-[#991B1B]">₹25,000</p>
          <p className="text-xs text-[#DC2626]">Due: Jan 15, 2025</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Fee Structure - Academic Year 2024-25</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Fee Type</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Amount</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Due Date</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { type: 'Tuition Fee (Q1)', amount: '₹20,000', due: 'Apr 15, 2024', status: 'Paid' },
                { type: 'Tuition Fee (Q2)', amount: '₹20,000', due: 'Jul 15, 2024', status: 'Paid' },
                { type: 'Tuition Fee (Q3)', amount: '₹20,000', due: 'Oct 15, 2024', status: 'Paid' },
                { type: 'Tuition Fee (Q4)', amount: '₹20,000', due: 'Jan 15, 2025', status: 'Pending' },
                { type: 'Lab Fee', amount: '₹3,000', due: 'Apr 15, 2024', status: 'Paid' },
                { type: 'Library Fee', amount: '₹2,000', due: 'Jan 15, 2025', status: 'Pending' },
              ].map((fee, idx) => (
                <tr key={idx} className="border-b border-[#E2E8F0]">
                  <td className="px-4 py-3 text-sm">{fee.type}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{fee.amount}</td>
                  <td className="px-4 py-3 text-sm">{fee.due}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      fee.status === 'Paid' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEE2E2] text-[#991B1B]'
                    }`}>{fee.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <CreditCard className="text-[#4F46E5]" size={20} />
          Online Payment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Pay Pending Fees</h4>
            <div className="p-4 bg-[#FEE2E2] rounded-lg mb-4">
              <p className="text-sm text-[#64748B]">Amount Due</p>
              <p className="text-2xl font-bold text-[#991B1B]">₹25,000</p>
            </div>
            <div className="space-y-3">
              <select className="w-full border-2 border-[#FCD34D] rounded-lg px-4 py-2">
                <option>Select Fee Type</option>
                <option>Tuition Fee (Q4) - ₹20,000</option>
                <option>Library Fee - ₹2,000</option>
                <option>Pay All Pending - ₹25,000</option>
              </select>
              <button className="w-full bg-[#4F46E5] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
                <CreditCard size={18} /> Pay Now
              </button>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Payment Methods</h4>
            <div className="space-y-2">
              {['Credit/Debit Card', 'Net Banking', 'UPI', 'Wallet'].map((method, idx) => (
                <div key={idx} className="p-3 border-2 border-[#E2E8F0] rounded-lg flex items-center gap-3 hover:bg-[#F8FAFC] cursor-pointer">
                  <input type="radio" name="payment" className="accent-[#4F46E5]" />
                  <span className="font-medium">{method}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Receipt className="text-[#10B981]" size={20} />
          Payment Receipts
        </h3>
        <div className="space-y-3">
          {[
            { id: 'REC-2024-003', amount: '₹20,000', date: 'Oct 15, 2024', type: 'Tuition Fee Q3' },
            { id: 'REC-2024-002', amount: '₹20,000', date: 'Jul 15, 2024', type: 'Tuition Fee Q2' },
            { id: 'REC-2024-001', amount: '₹23,000', date: 'Apr 15, 2024', type: 'Tuition Fee Q1 + Lab Fee' },
          ].map((receipt, idx) => (
            <div key={idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold">{receipt.id}</p>
                <p className="text-sm text-[#64748B]">{receipt.type} • {receipt.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#10B981]">{receipt.amount}</span>
                <button className="text-[#4F46E5]"><Download size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 9. Library
  const renderLibrary = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Library</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#DBEAFE] rounded-xl border-2 border-[#3B82F6]">
          <Library className="text-[#3B82F6] mb-2" size={24} />
          <p className="text-sm text-[#64748B]">Books Issued</p>
          <p className="text-2xl font-bold text-[#1E40AF]">3</p>
        </div>
        <div className="p-4 bg-[#FEF3C7] rounded-xl border-2 border-[#F59E0B]">
          <Clock className="text-[#F59E0B] mb-2" size={24} />
          <p className="text-sm text-[#64748B]">Due Soon</p>
          <p className="text-2xl font-bold text-[#92400E]">1</p>
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

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Currently Issued Books</h3>
        <div className="space-y-4">
          {[
            { title: 'Advanced Mathematics', author: 'R.D. Sharma', issued: 'Dec 10, 2024', due: 'Dec 24, 2024', status: 'Due Today' },
            { title: 'Physics for Class 10', author: 'H.C. Verma', issued: 'Dec 15, 2024', due: 'Dec 29, 2024', status: 'Active' },
            { title: 'English Literature', author: 'William Shakespeare', issued: 'Dec 18, 2024', due: 'Jan 1, 2025', status: 'Active' },
          ].map((book, idx) => (
            <div key={idx} className={`p-4 border-2 rounded-lg ${
              book.status === 'Due Today' ? 'border-[#F59E0B] bg-[#FFFBEB]' : 'border-[#E2E8F0]'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold">{book.title}</h4>
                  <p className="text-sm text-[#64748B]">by {book.author}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  book.status === 'Due Today' ? 'bg-[#F59E0B] text-white' : 'bg-[#D1FAE5] text-[#065F46]'
                }`}>{book.status}</span>
              </div>
              <div className="mt-3 flex gap-4 text-sm text-[#64748B]">
                <span>Issued: {book.issued}</span>
                <span>Due: {book.due}</span>
              </div>
              <button className="mt-3 text-sm text-[#4F46E5] font-semibold">Renew Book</button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Search className="text-[#4F46E5]" size={20} />
          Search Books
        </h3>
        <div className="flex gap-3 mb-4">
          <input type="text" placeholder="Search by title, author, or subject..." className="flex-1 border-2 border-[#FCD34D] rounded-lg px-4 py-2" />
          <button className="bg-[#4F46E5] text-white px-6 py-2 rounded-lg font-semibold">Search</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Chemistry Handbook', author: 'O.P. Tandon', available: true },
            { title: 'History of India', author: 'Bipan Chandra', available: true },
            { title: 'Hindi Grammar', author: 'Kamta Prasad Guru', available: false },
          ].map((book, idx) => (
            <div key={idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg">
              <h4 className="font-semibold">{book.title}</h4>
              <p className="text-sm text-[#64748B]">by {book.author}</p>
              <div className="mt-3 flex justify-between items-center">
                <span className={`text-xs font-semibold ${book.available ? 'text-[#10B981]' : 'text-[#DC2626]'}`}>
                  {book.available ? 'Available' : 'Not Available'}
                </span>
                {book.available && <button className="text-xs bg-[#4F46E5] text-white px-3 py-1 rounded font-semibold">Reserve</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 10. Activities & Achievements
  const renderActivities = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Activities & Achievements</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] rounded-xl border-2 border-[#F59E0B]">
          <Trophy className="text-[#D97706] mb-2" size={32} />
          <p className="text-sm text-[#92400E]">Total Achievements</p>
          <p className="text-3xl font-bold text-[#92400E]">8</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-[#DBEAFE] to-[#BFDBFE] rounded-xl border-2 border-[#3B82F6]">
          <Medal className="text-[#1E40AF] mb-2" size={32} />
          <p className="text-sm text-[#1E40AF]">Certificates</p>
          <p className="text-3xl font-bold text-[#1E40AF]">5</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-[#D1FAE5] to-[#A7F3D0] rounded-xl border-2 border-[#10B981]">
          <Award className="text-[#059669] mb-2" size={32} />
          <p className="text-sm text-[#064E3B]">Activities Joined</p>
          <p className="text-3xl font-bold text-[#064E3B]">6</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Co-curricular Activities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Science Club', role: 'Member', schedule: 'Every Saturday', status: 'Active' },
            { name: 'Debate Team', role: 'Team Member', schedule: 'Tuesday & Thursday', status: 'Active' },
            { name: 'Art & Craft', role: 'Participant', schedule: 'Wednesday', status: 'Active' },
            { name: 'Music Band', role: 'Guitarist', schedule: 'Friday', status: 'Active' },
          ].map((activity, idx) => (
            <div key={idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold">{activity.name}</h4>
                <span className="px-2 py-1 bg-[#D1FAE5] text-[#065F46] rounded-full text-xs font-semibold">{activity.status}</span>
              </div>
              <p className="text-sm text-[#64748B]">Role: {activity.role}</p>
              <p className="text-sm text-[#64748B]">Schedule: {activity.schedule}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Sports Participation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { sport: 'Cricket', level: 'School Team', position: 'Batsman', events: 5 },
            { sport: 'Athletics', level: 'Inter-school', position: '100m Sprint', events: 3 },
          ].map((sport, idx) => (
            <div key={idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg">
              <h4 className="font-bold text-lg">{sport.sport}</h4>
              <div className="mt-2 space-y-1">
                <p className="text-sm"><span className="text-[#64748B]">Level:</span> {sport.level}</p>
                <p className="text-sm"><span className="text-[#64748B]">Position:</span> {sport.position}</p>
                <p className="text-sm"><span className="text-[#64748B]">Events Participated:</span> {sport.events}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Award className="text-[#F59E0B]" size={20} />
          Certificates & Awards
        </h3>
        <div className="space-y-4">
          {[
            { title: 'First Prize - Science Exhibition', event: 'Inter-school Science Fair', date: 'Nov 2024', type: 'Award' },
            { title: 'Best Speaker Award', event: 'Annual Debate Competition', date: 'Oct 2024', type: 'Award' },
            { title: 'Certificate of Excellence', event: 'Mathematics Olympiad', date: 'Sep 2024', type: 'Certificate' },
            { title: 'Participation Certificate', event: 'District Cricket Tournament', date: 'Aug 2024', type: 'Certificate' },
          ].map((cert, idx) => (
            <div key={idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  cert.type === 'Award' ? 'bg-[#FEF3C7]' : 'bg-[#DBEAFE]'
                }`}>
                  {cert.type === 'Award' ? <Trophy className="text-[#F59E0B]" size={24} /> : <Medal className="text-[#3B82F6]" size={24} />}
                </div>
                <div>
                  <h4 className="font-bold">{cert.title}</h4>
                  <p className="text-sm text-[#64748B]">{cert.event} • {cert.date}</p>
                </div>
              </div>
              <button className="text-[#4F46E5] flex items-center gap-1 text-sm font-semibold">
                <Download size={16} /> Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 11. Requests & Forms
  const renderRequests = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Requests & Forms</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Leave Application</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">From Date</label>
                <input type="date" className="w-full border-2 border-[#FCD34D] rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">To Date</label>
                <input type="date" className="w-full border-2 border-[#FCD34D] rounded-lg px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reason</label>
              <textarea className="w-full border-2 border-[#FCD34D] rounded-lg px-3 py-2 h-20" placeholder="Enter reason..."></textarea>
            </div>
            <button className="w-full bg-[#4F46E5] text-white py-2 rounded-lg font-semibold">Submit Request</button>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Bonafide / ID Card Request</h3>
          <div className="space-y-3">
            <select className="w-full border-2 border-[#FCD34D] rounded-lg px-4 py-2">
              <option>Select Request Type</option>
              <option>Bonafide Certificate</option>
              <option>ID Card (New)</option>
              <option>ID Card (Duplicate)</option>
            </select>
            <div>
              <label className="block text-sm font-medium mb-1">Purpose</label>
              <input type="text" className="w-full border-2 border-[#FCD34D] rounded-lg px-3 py-2" placeholder="Enter purpose..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Additional Notes</label>
              <textarea className="w-full border-2 border-[#FCD34D] rounded-lg px-3 py-2 h-16" placeholder="Any additional details..."></textarea>
            </div>
            <button className="w-full bg-[#10B981] text-white py-2 rounded-lg font-semibold">Submit Request</button>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Certificate Requests</h3>
          <div className="space-y-3">
            <select className="w-full border-2 border-[#FCD34D] rounded-lg px-4 py-2">
              <option>Select Certificate Type</option>
              <option>Character Certificate</option>
              <option>Transfer Certificate</option>
              <option>Migration Certificate</option>
              <option>Study Certificate</option>
            </select>
            <div>
              <label className="block text-sm font-medium mb-1">Required For</label>
              <input type="text" className="w-full border-2 border-[#FCD34D] rounded-lg px-3 py-2" placeholder="e.g., School admission, Scholarship..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Required By Date</label>
              <input type="date" className="w-full border-2 border-[#FCD34D] rounded-lg px-3 py-2" />
            </div>
            <button className="w-full bg-[#F59E0B] text-white py-2 rounded-lg font-semibold">Submit Request</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Request History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Request ID</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Type</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Submitted Date</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Status</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'REQ-2024-015', type: 'Leave Application', date: 'Dec 20, 2024', status: 'Approved' },
                { id: 'REQ-2024-014', type: 'Bonafide Certificate', date: 'Dec 15, 2024', status: 'Ready' },
                { id: 'REQ-2024-013', type: 'ID Card Duplicate', date: 'Dec 10, 2024', status: 'Processing' },
                { id: 'REQ-2024-012', type: 'Leave Application', date: 'Nov 25, 2024', status: 'Approved' },
              ].map((req, idx) => (
                <tr key={idx} className="border-b border-[#E2E8F0]">
                  <td className="px-4 py-3 text-sm font-semibold">{req.id}</td>
                  <td className="px-4 py-3 text-sm">{req.type}</td>
                  <td className="px-4 py-3 text-sm">{req.date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      req.status === 'Approved' ? 'bg-[#D1FAE5] text-[#065F46]' :
                      req.status === 'Ready' ? 'bg-[#DBEAFE] text-[#1E40AF]' :
                      'bg-[#FEF3C7] text-[#92400E]'
                    }`}>{req.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {req.status === 'Ready' && <button className="text-xs bg-[#4F46E5] text-white px-3 py-1 rounded font-semibold">Download</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // 12. Settings & Support
  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Settings & Support</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Settings className="text-[#64748B]" size={20} />
            Profile Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Display Name</label>
              <input type="text" defaultValue={user?.full_name || 'Student User'} className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input type="email" defaultValue="student@ajmschool.edu" className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2" />
            </div>
            <button className="bg-[#4F46E5] text-white px-6 py-2 rounded-lg font-semibold">Update Profile</button>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <User className="text-[#64748B]" size={20} />
            Change Password
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

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <HelpCircle className="text-[#4F46E5]" size={20} />
          Help & Support
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-[#FEF3C7] rounded-lg">
            <p className="font-semibold">IT Help Desk</p>
            <p className="text-sm text-[#64748B]">For login & technical issues</p>
            <p className="text-sm font-semibold mt-2">helpdesk@ajmschool.edu</p>
          </div>
          <div className="p-4 bg-[#DBEAFE] rounded-lg">
            <p className="font-semibold">Academic Support</p>
            <p className="text-sm text-[#64748B]">For academic queries</p>
            <p className="text-sm font-semibold mt-2">academic@ajmschool.edu</p>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Submit a Query</h4>
          <div className="space-y-3">
            <select className="w-full border-2 border-[#FCD34D] rounded-lg px-4 py-2">
              <option>Select Query Type</option>
              <option>Technical Issue</option>
              <option>Academic Query</option>
              <option>Fee Related</option>
              <option>Other</option>
            </select>
            <textarea className="w-full border-2 border-[#FCD34D] rounded-lg px-4 py-3 h-24" placeholder="Describe your query..."></textarea>
            <button className="bg-[#4F46E5] text-white px-6 py-2 rounded-lg font-semibold">Submit Query</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Frequently Asked Questions</h3>
        <div className="space-y-3">
          {[
            { q: 'How can I join online classes?', a: 'Go to Subjects & Learning section, find your class in the Live Online Classes section, and click "Join Now" when the class is live.' },
            { q: 'How to pay fees online?', a: 'Navigate to Fees & Payments, select the fee type, choose payment method, and complete the payment.' },
            { q: 'How to submit assignments?', a: 'Go to Homework & Assignments, find the pending assignment, and click the Submit button to upload your work.' },
            { q: 'How to request a certificate?', a: 'Go to Requests & Forms, select the certificate type, fill in the details, and submit your request.' },
          ].map((faq, idx) => (
            <div key={idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg">
              <p className="font-semibold text-sm">{faq.q}</p>
              <p className="text-sm text-[#64748B] mt-1">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-[#FEE2E2] rounded-xl border-2 border-[#DC2626] flex justify-between items-center">
        <div>
          <p className="font-semibold text-[#991B1B]">Logout from Student Portal</p>
          <p className="text-sm text-[#64748B]">You will be redirected to the login page</p>
        </div>
        <button className="bg-[#DC2626] text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2">
          <LogOut size={18} /> Logout
        </button>
      </div>
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
      <div className="bg-gradient-to-r from-[#DBEAFE] to-[#EDE9FE] rounded-2xl p-6 border-2 border-[#4F46E5]">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] mb-1">Welcome, {user?.full_name}!</h1>
        <p className="text-base text-[#64748B]">Student Portal - AJM International Institution</p>
      </div>

      <div>
        {currentModule.render()}
      </div>
    </div>
  );
};

export default StudentDashboard;
