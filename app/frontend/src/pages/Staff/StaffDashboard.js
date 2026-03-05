import React from 'react';
import { 
  User, Calendar, BookOpen, Users, FileText, ClipboardCheck, 
  MessageSquare, DollarSign, FileQuestion, Book, Award, Settings,
  Clock, CheckCircle, XCircle, Bell, Mail, Download, Upload,
  Star, HelpCircle, LogOut, ChevronRight, Building, Briefcase
} from 'lucide-react';

const StaffDashboard = ({ user, module = 'profile' }) => {

  // 1. Staff Profile & Account
  const renderProfile = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Staff Profile & Account</h2>
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-[#FEF3C7] to-[#FEE2E2] rounded-full flex items-center justify-center text-4xl font-bold text-[#0F172A]">
            {user?.full_name?.charAt(0) || 'S'}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#0F172A]">{user?.full_name || 'Staff User'}</h3>
            <p className="text-[#64748B]">Employee ID: EMP-2024-001</p>
            <span className="inline-block mt-2 px-3 py-1 bg-[#10B981] text-white text-xs font-semibold rounded-full">Active</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-[#FEF3C7] rounded-lg">
            <p className="text-sm text-[#64748B]">Role / Designation</p>
            <p className="font-bold text-[#0F172A]">Senior Science Teacher</p>
          </div>
          <div className="p-4 bg-[#FEE2E2] rounded-lg">
            <p className="text-sm text-[#64748B]">Department</p>
            <p className="font-bold text-[#0F172A]">Science Department</p>
          </div>
          <div className="p-4 bg-[#DBEAFE] rounded-lg">
            <p className="text-sm text-[#64748B]">Qualification</p>
            <p className="font-bold text-[#0F172A]">M.Sc Physics, B.Ed</p>
          </div>
          <div className="p-4 bg-[#D1FAE5] rounded-lg">
            <p className="text-sm text-[#64748B]">Experience</p>
            <p className="font-bold text-[#0F172A]">8 Years</p>
          </div>
        </div>

        <div className="border-t border-[#E2E8F0] pt-4">
          <h4 className="font-semibold mb-3">Contact Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="text-[#64748B]" size={18} />
              <span className="text-sm">staff@ajmschool.edu</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="text-[#64748B]" size={18} />
              <span className="text-sm">+91 9876543210</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E2E8F0] pt-4 mt-4">
          <h4 className="font-semibold mb-3">Security Settings</h4>
          <div className="flex gap-3">
            <button className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#4338CA] transition-colors">
              Change Password
            </button>
            <button className="border-2 border-[#4F46E5] text-[#4F46E5] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#EEF2FF] transition-colors">
              Update Contact Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. Attendance Management
  const renderAttendance = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Attendance Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Clock className="text-[#F59E0B]" size={20} />
            Today's Attendance
          </h3>
          <div className="text-center py-4 mb-4 bg-[#FEF3C7] rounded-lg">
            <p className="text-sm text-[#64748B]">Date</p>
            <p className="text-xl font-bold">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="space-y-3">
            <button className="w-full bg-[#10B981] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#059669] transition-colors">
              <CheckCircle size={20} /> Check In - 9:00 AM
            </button>
            <button className="w-full bg-[#DC2626] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#B91C1C] transition-colors">
              <XCircle size={20} /> Check Out
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
              <span className="font-bold text-[#10B981]">5 / 12</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#FEE2E2] rounded-lg">
              <span className="font-medium">Sick Leave</span>
              <span className="font-bold text-[#10B981]">7 / 10</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#DBEAFE] rounded-lg">
              <span className="font-medium">Paid Leave</span>
              <span className="font-bold text-[#10B981]">10 / 15</span>
            </div>
            <button className="w-full bg-[#F59E0B] text-white py-3 rounded-lg font-semibold mt-2 hover:bg-[#D97706] transition-colors">
              Apply for Leave
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Leave Application Status</h3>
        <div className="space-y-3">
          {[
            { date: 'Dec 25-26, 2024', type: 'Casual Leave', reason: 'Personal Work', status: 'Approved' },
            { date: 'Jan 2, 2025', type: 'Sick Leave', reason: 'Medical Appointment', status: 'Pending' },
          ].map((leave, idx) => (
            <div key={idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold">{leave.date}</p>
                <p className="text-sm text-[#64748B]">{leave.type} - {leave.reason}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                leave.status === 'Approved' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEF3C7] text-[#92400E]'
              }`}>{leave.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Attendance History (Last 7 Days)</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Date</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Check In</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Check Out</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: 'Dec 20, 2024', in: '8:55 AM', out: '4:30 PM', status: 'Present' },
                { date: 'Dec 19, 2024', in: '9:02 AM', out: '4:25 PM', status: 'Present' },
                { date: 'Dec 18, 2024', in: '8:50 AM', out: '4:35 PM', status: 'Present' },
                { date: 'Dec 17, 2024', in: '-', out: '-', status: 'Leave' },
                { date: 'Dec 16, 2024', in: '9:10 AM', out: '4:30 PM', status: 'Late' },
              ].map((day, idx) => (
                <tr key={idx} className="border-b border-[#E2E8F0]">
                  <td className="px-4 py-3 text-sm">{day.date}</td>
                  <td className="px-4 py-3 text-sm">{day.in}</td>
                  <td className="px-4 py-3 text-sm">{day.out}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      day.status === 'Present' ? 'bg-[#D1FAE5] text-[#065F46]' : 
                      day.status === 'Late' ? 'bg-[#FEE2E2] text-[#991B1B]' : 
                      'bg-[#DBEAFE] text-[#1E40AF]'
                    }`}>{day.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // 3. Timetable & Scheduling
  const renderTimetable = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Timetable & Scheduling</h2>
      
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">My Class Timetable</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Day</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Period 1<br/><span className="font-normal text-xs">8:30-9:15</span></th>
                <th className="px-4 py-3 text-left font-bold text-sm">Period 2<br/><span className="font-normal text-xs">9:15-10:00</span></th>
                <th className="px-4 py-3 text-left font-bold text-sm">Period 3<br/><span className="font-normal text-xs">10:15-11:00</span></th>
                <th className="px-4 py-3 text-left font-bold text-sm">Period 4<br/><span className="font-normal text-xs">11:00-11:45</span></th>
                <th className="px-4 py-3 text-left font-bold text-sm">Period 5<br/><span className="font-normal text-xs">12:30-1:15</span></th>
              </tr>
            </thead>
            <tbody>
              {[
                { day: 'Monday', p1: 'Grade 5-A', p2: 'Grade 6-B', p3: 'Free', p4: 'Grade 7-A', p5: 'Lab Session' },
                { day: 'Tuesday', p1: 'Grade 6-A', p2: 'Free', p3: 'Grade 5-B', p4: 'Grade 8-A', p5: 'Grade 7-B' },
                { day: 'Wednesday', p1: 'Grade 7-A', p2: 'Grade 5-A', p3: 'Lab Session', p4: 'Free', p5: 'Grade 6-B' },
                { day: 'Thursday', p1: 'Free', p2: 'Grade 8-A', p3: 'Grade 6-A', p4: 'Grade 5-B', p5: 'Grade 7-A' },
                { day: 'Friday', p1: 'Grade 5-A', p2: 'Grade 7-B', p3: 'Free', p4: 'Lab Session', p5: 'Grade 6-A' },
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-[#E2E8F0]">
                  <td className="px-4 py-3 font-semibold">{row.day}</td>
                  <td className={`px-4 py-3 text-sm ${row.p1 === 'Free' ? 'text-[#10B981] font-semibold' : row.p1.includes('Lab') ? 'text-[#7C3AED] font-semibold' : ''}`}>{row.p1}</td>
                  <td className={`px-4 py-3 text-sm ${row.p2 === 'Free' ? 'text-[#10B981] font-semibold' : row.p2.includes('Lab') ? 'text-[#7C3AED] font-semibold' : ''}`}>{row.p2}</td>
                  <td className={`px-4 py-3 text-sm ${row.p3 === 'Free' ? 'text-[#10B981] font-semibold' : row.p3.includes('Lab') ? 'text-[#7C3AED] font-semibold' : ''}`}>{row.p3}</td>
                  <td className={`px-4 py-3 text-sm ${row.p4 === 'Free' ? 'text-[#10B981] font-semibold' : row.p4.includes('Lab') ? 'text-[#7C3AED] font-semibold' : ''}`}>{row.p4}</td>
                  <td className={`px-4 py-3 text-sm ${row.p5 === 'Free' ? 'text-[#10B981] font-semibold' : row.p5.includes('Lab') ? 'text-[#7C3AED] font-semibold' : ''}`}>{row.p5}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Briefcase className="text-[#DC2626]" size={20} />
            Substitution Schedule
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-[#FEE2E2] rounded-lg">
              <p className="font-semibold">Dec 22 - Period 3</p>
              <p className="text-sm text-[#64748B]">Grade 8-B (Covering for Mr. Sharma)</p>
            </div>
            <div className="p-3 bg-[#FEF3C7] rounded-lg">
              <p className="font-semibold">Dec 24 - Period 1</p>
              <p className="text-sm text-[#64748B]">Grade 9-A (Covering for Ms. Gupta)</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <ClipboardCheck className="text-[#7C3AED]" size={20} />
            Exam Duty Schedule
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-[#EDE9FE] rounded-lg">
              <p className="font-semibold">Mid-term Examination</p>
              <p className="text-sm text-[#64748B]">Dec 25 - Hall A - 9:00 AM to 12:00 PM</p>
            </div>
            <div className="p-3 bg-[#DBEAFE] rounded-lg">
              <p className="font-semibold">Science Practical</p>
              <p className="text-sm text-[#64748B]">Dec 28 - Lab 1 - 10:00 AM to 1:00 PM</p>
            </div>
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
  const renderClassManagement = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Class & Student Management</h2>
      
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">My Assigned Classes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Grade 5-A', students: 30, subject: 'Science' },
            { name: 'Grade 6-B', students: 28, subject: 'Science' },
            { name: 'Grade 7-A', students: 32, subject: 'Science' },
            { name: 'Grade 7-B', students: 30, subject: 'Science' },
            { name: 'Grade 8-A', students: 35, subject: 'Physics' },
          ].map((cls, idx) => (
            <div key={idx} className="p-4 border-2 border-[#FCD34D] rounded-lg hover:bg-[#FFFBEB] transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg">{cls.name}</h4>
                <span className="px-2 py-1 bg-[#4F46E5] text-white text-xs rounded-full">{cls.subject}</span>
              </div>
              <p className="text-sm text-[#64748B]">{cls.students} Students</p>
              <div className="mt-3 flex gap-2">
                <button className="text-xs bg-[#10B981] text-white px-3 py-1 rounded font-semibold">Mark Attendance</button>
                <button className="text-xs bg-[#F59E0B] text-white px-3 py-1 rounded font-semibold">View Students</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Student List - Grade 5-A</h3>
          <select className="border-2 border-[#FCD34D] rounded-lg px-3 py-2 text-sm">
            <option>Grade 5-A</option>
            <option>Grade 6-B</option>
            <option>Grade 7-A</option>
            <option>Grade 7-B</option>
            <option>Grade 8-A</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Roll No</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Student Name</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Parent Contact</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Attendance</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { roll: '001', name: 'Rahul Kumar', parent: '+91 98765xxxxx', attendance: '95%' },
                { roll: '002', name: 'Priya Sharma', parent: '+91 98765xxxxx', attendance: '92%' },
                { roll: '003', name: 'Amit Patel', parent: '+91 98765xxxxx', attendance: '88%' },
                { roll: '004', name: 'Sneha Reddy', parent: '+91 98765xxxxx', attendance: '96%' },
                { roll: '005', name: 'Vikram Singh', parent: '+91 98765xxxxx', attendance: '85%' },
              ].map((student, idx) => (
                <tr key={idx} className="border-b border-[#E2E8F0]">
                  <td className="px-4 py-3 text-sm font-semibold">{student.roll}</td>
                  <td className="px-4 py-3 text-sm">{student.name}</td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{student.parent}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      parseInt(student.attendance) >= 90 ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEF3C7] text-[#92400E]'
                    }`}>{student.attendance}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-xs bg-[#4F46E5] text-white px-2 py-1 rounded mr-1">View</button>
                    <button className="text-xs bg-[#F59E0B] text-white px-2 py-1 rounded">Remark</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Add Behavior / Remarks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select className="border-2 border-[#FCD34D] rounded-lg px-3 py-2">
            <option>Select Student</option>
            <option>Rahul Kumar - 5A</option>
            <option>Priya Sharma - 5A</option>
            <option>Amit Patel - 5A</option>
          </select>
          <select className="border-2 border-[#FCD34D] rounded-lg px-3 py-2">
            <option>Remark Type</option>
            <option>Positive - Good Performance</option>
            <option>Positive - Helpful</option>
            <option>Negative - Discipline Issue</option>
            <option>Negative - Homework Not Done</option>
          </select>
        </div>
        <textarea className="w-full mt-4 border-2 border-[#FCD34D] rounded-lg px-3 py-2 h-24" placeholder="Enter detailed remarks..."></textarea>
        <button className="mt-3 bg-[#4F46E5] text-white px-6 py-2 rounded-lg font-semibold">Submit Remark</button>
      </div>
    </div>
  );

  // 5. Academic Management
  const renderAcademic = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Academic Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#FEF3C7] rounded-xl border-2 border-[#F59E0B] text-center">
          <FileText className="mx-auto text-[#F59E0B] mb-2" size={32} />
          <p className="font-bold text-2xl">12</p>
          <p className="text-sm text-[#64748B]">Lesson Plans</p>
        </div>
        <div className="p-4 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981] text-center">
          <BookOpen className="mx-auto text-[#10B981] mb-2" size={32} />
          <p className="font-bold text-2xl">75%</p>
          <p className="text-sm text-[#64748B]">Syllabus Complete</p>
        </div>
        <div className="p-4 bg-[#DBEAFE] rounded-xl border-2 border-[#3B82F6] text-center">
          <ClipboardCheck className="mx-auto text-[#3B82F6] mb-2" size={32} />
          <p className="font-bold text-2xl">8</p>
          <p className="text-sm text-[#64748B]">Assignments Given</p>
        </div>
        <div className="p-4 bg-[#EDE9FE] rounded-xl border-2 border-[#7C3AED] text-center">
          <Book className="mx-auto text-[#7C3AED] mb-2" size={32} />
          <p className="font-bold text-2xl">15</p>
          <p className="text-sm text-[#64748B]">Study Materials</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <FileText className="text-[#F59E0B]" size={20} />
            Lesson Plans
          </h3>
          <div className="space-y-3 mb-4">
            {[
              { title: 'Chapter 5: Force & Motion', class: 'Grade 7-A', date: 'Dec 15' },
              { title: 'Chapter 6: Light & Sound', class: 'Grade 6-B', date: 'Dec 18' },
              { title: 'Chapter 4: Matter & States', class: 'Grade 5-A', date: 'Dec 20' },
            ].map((plan, idx) => (
              <div key={idx} className="p-3 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm">{plan.title}</p>
                  <p className="text-xs text-[#64748B]">{plan.class} • {plan.date}</p>
                </div>
                <button className="text-[#4F46E5] text-sm font-semibold">View</button>
              </div>
            ))}
          </div>
          <button className="w-full bg-[#4F46E5] text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
            <Upload size={18} /> Upload Lesson Plan
          </button>
        </div>

        <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <BookOpen className="text-[#10B981]" size={20} />
            Syllabus Tracking
          </h3>
          <div className="space-y-4">
            {[
              { class: 'Grade 5-A', progress: 80 },
              { class: 'Grade 6-B', progress: 75 },
              { class: 'Grade 7-A', progress: 70 },
              { class: 'Grade 8-A', progress: 65 },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.class}</span>
                  <span className="font-semibold">{item.progress}%</span>
                </div>
                <div className="w-full h-2 bg-[#E2E8F0] rounded-full">
                  <div className={`h-2 rounded-full ${item.progress >= 75 ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`} style={{ width: `${item.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <ClipboardCheck className="text-[#DC2626]" size={20} />
            Homework & Assignments
          </h3>
          <div className="space-y-3 mb-4">
            {[
              { title: 'Force Problems - Set 1', class: 'Grade 7-A', due: 'Dec 22', submissions: '25/32' },
              { title: 'Light Diagram Activity', class: 'Grade 6-B', due: 'Dec 23', submissions: '20/28' },
            ].map((hw, idx) => (
              <div key={idx} className="p-3 border-2 border-[#E2E8F0] rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm">{hw.title}</p>
                    <p className="text-xs text-[#64748B]">{hw.class} • Due: {hw.due}</p>
                  </div>
                  <span className="text-xs bg-[#DBEAFE] text-[#1E40AF] px-2 py-1 rounded-full">{hw.submissions}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full bg-[#10B981] text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
            <Upload size={18} /> Upload Homework
          </button>
        </div>

        <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Book className="text-[#7C3AED]" size={20} />
            Study Materials & Notes
          </h3>
          <div className="space-y-3 mb-4">
            {[
              { title: 'Force & Motion Notes', type: 'PDF', size: '2.5 MB' },
              { title: 'Light & Sound PPT', type: 'PPTX', size: '5.1 MB' },
              { title: 'Practice Questions Bank', type: 'PDF', size: '1.2 MB' },
            ].map((material, idx) => (
              <div key={idx} className="p-3 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#EDE9FE] rounded-lg flex items-center justify-center">
                    <FileText className="text-[#7C3AED]" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{material.title}</p>
                    <p className="text-xs text-[#64748B]">{material.type} • {material.size}</p>
                  </div>
                </div>
                <button className="text-[#4F46E5]"><Download size={18} /></button>
              </div>
            ))}
          </div>
          <button className="w-full bg-[#F59E0B] text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
            <Upload size={18} /> Upload Materials
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Upcoming Exam & Test Schedules</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Exam Name</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Class</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Date</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Time</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Max Marks</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Mid-term Exam', class: 'Grade 5-A', date: 'Dec 25', time: '9:00 AM', marks: 100 },
                { name: 'Class Test - Unit 5', class: 'Grade 7-A', date: 'Dec 22', time: '10:00 AM', marks: 25 },
                { name: 'Practical Exam', class: 'Grade 8-A', date: 'Dec 28', time: '11:00 AM', marks: 50 },
              ].map((exam, idx) => (
                <tr key={idx} className="border-b border-[#E2E8F0]">
                  <td className="px-4 py-3 text-sm font-semibold">{exam.name}</td>
                  <td className="px-4 py-3 text-sm">{exam.class}</td>
                  <td className="px-4 py-3 text-sm">{exam.date}</td>
                  <td className="px-4 py-3 text-sm">{exam.time}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{exam.marks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // 6. Marks & Assessment
  const renderMarks = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Marks & Assessment</h2>
      
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <select className="border-2 border-[#FCD34D] rounded-lg px-4 py-2">
            <option>Select Class</option>
            <option>Grade 5-A</option>
            <option>Grade 6-B</option>
            <option>Grade 7-A</option>
          </select>
          <select className="border-2 border-[#FCD34D] rounded-lg px-4 py-2">
            <option>Select Exam</option>
            <option>Mid-term Exam</option>
            <option>Class Test - Unit 5</option>
            <option>Quarterly Exam</option>
          </select>
          <button className="bg-[#4F46E5] text-white px-6 py-2 rounded-lg font-semibold">Load Students</button>
        </div>

        <h3 className="font-bold mb-4">Enter Marks - Mid-term Exam (Grade 5-A)</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Roll No</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Student Name</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Marks Obtained</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Max Marks</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Grade</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { roll: '001', name: 'Rahul Kumar', marks: 85, max: 100, grade: 'A' },
                { roll: '002', name: 'Priya Sharma', marks: 92, max: 100, grade: 'A+' },
                { roll: '003', name: 'Amit Patel', marks: 78, max: 100, grade: 'B+' },
                { roll: '004', name: 'Sneha Reddy', marks: 88, max: 100, grade: 'A' },
                { roll: '005', name: 'Vikram Singh', marks: '', max: 100, grade: '-' },
              ].map((student, idx) => (
                <tr key={idx} className="border-b border-[#E2E8F0]">
                  <td className="px-4 py-3 text-sm font-semibold">{student.roll}</td>
                  <td className="px-4 py-3 text-sm">{student.name}</td>
                  <td className="px-4 py-3">
                    <input 
                      type="number" 
                      defaultValue={student.marks}
                      placeholder="Enter marks"
                      className="w-24 h-9 px-3 border-2 border-[#FCD34D] rounded-lg text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold">{student.max}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      student.grade === 'A+' ? 'bg-[#D1FAE5] text-[#065F46]' :
                      student.grade === 'A' ? 'bg-[#DBEAFE] text-[#1E40AF]' :
                      student.grade === 'B+' ? 'bg-[#FEF3C7] text-[#92400E]' :
                      'bg-[#E2E8F0] text-[#64748B]'
                    }`}>{student.grade}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-xs bg-[#10B981] text-white px-3 py-1 rounded font-semibold">Save</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex gap-3">
          <button className="bg-[#4F46E5] text-white px-6 py-2 rounded-lg font-semibold">Save All Marks</button>
          <button className="border-2 border-[#4F46E5] text-[#4F46E5] px-6 py-2 rounded-lg font-semibold">Calculate Grades</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
          <h3 className="font-bold mb-4">Grade Calculation Settings</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-[#D1FAE5] rounded-lg">
              <span>A+ Grade</span>
              <span className="font-semibold">90% - 100%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#DBEAFE] rounded-lg">
              <span>A Grade</span>
              <span className="font-semibold">80% - 89%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#FEF3C7] rounded-lg">
              <span>B+ Grade</span>
              <span className="font-semibold">70% - 79%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#FEE2E2] rounded-lg">
              <span>B Grade</span>
              <span className="font-semibold">60% - 69%</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
          <h3 className="font-bold mb-4">Performance Analysis</h3>
          <div className="space-y-4">
            <div className="p-4 bg-[#FEF3C7] rounded-lg">
              <p className="text-sm text-[#64748B]">Class Average</p>
              <p className="text-2xl font-bold">78.5%</p>
            </div>
            <div className="p-4 bg-[#D1FAE5] rounded-lg">
              <p className="text-sm text-[#64748B]">Highest Score</p>
              <p className="text-2xl font-bold">92 / 100</p>
              <p className="text-xs text-[#64748B]">Priya Sharma</p>
            </div>
            <div className="p-4 bg-[#FEE2E2] rounded-lg">
              <p className="text-sm text-[#64748B]">Pass Percentage</p>
              <p className="text-2xl font-bold">96%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Generate Progress Reports</h3>
        <div className="flex flex-wrap gap-4">
          <select className="border-2 border-[#FCD34D] rounded-lg px-4 py-2">
            <option>Select Class</option>
            <option>Grade 5-A</option>
            <option>Grade 6-B</option>
          </select>
          <select className="border-2 border-[#FCD34D] rounded-lg px-4 py-2">
            <option>Report Type</option>
            <option>Individual Report Card</option>
            <option>Class Summary Report</option>
            <option>Performance Analysis</option>
          </select>
          <button className="bg-[#10B981] text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2">
            <Download size={18} /> Generate Report
          </button>
        </div>
      </div>
    </div>
  );

  // 7. Communication Tools
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
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
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
            {[
              { title: 'Staff Meeting Reminder', message: 'All staff meeting on Friday 4 PM in Conference Hall', time: '2 hours ago', priority: 'high' },
              { title: 'Lesson Plan Submission', message: 'Please submit lesson plans for January by Dec 25', time: '1 day ago', priority: 'medium' },
              { title: 'Holiday Notice', message: 'School will remain closed on Dec 25-26 for Christmas', time: '2 days ago', priority: 'low' },
            ].map((msg, idx) => (
              <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                msg.priority === 'high' ? 'bg-[#FEE2E2] border-[#DC2626]' :
                msg.priority === 'medium' ? 'bg-[#FEF3C7] border-[#F59E0B]' :
                'bg-[#F1F5F9] border-[#64748B]'
              }`}>
                <div className="flex justify-between items-start">
                  <p className="font-semibold">{msg.title}</p>
                  <span className="text-xs text-[#64748B]">{msg.time}</span>
                </div>
                <p className="text-sm text-[#64748B] mt-1">{msg.message}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Mail className="text-[#4F46E5]" size={20} />
            Notices & Announcements
          </h3>
          <div className="space-y-3">
            {[
              { title: 'Annual Day Preparations', date: 'Dec 18, 2024' },
              { title: 'Science Exhibition Guidelines', date: 'Dec 15, 2024' },
              { title: 'Updated School Timings', date: 'Dec 10, 2024' },
            ].map((notice, idx) => (
              <div key={idx} className="p-3 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center hover:bg-[#F8FAFC] cursor-pointer">
                <div>
                  <p className="font-semibold text-sm">{notice.title}</p>
                  <p className="text-xs text-[#64748B]">{notice.date}</p>
                </div>
                <ChevronRight className="text-[#64748B]" size={18} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <MessageSquare className="text-[#10B981]" size={20} />
          Send Message to Students / Parents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <select className="border-2 border-[#FCD34D] rounded-lg px-4 py-2">
            <option>Select Class</option>
            <option>Grade 5-A</option>
            <option>Grade 6-B</option>
            <option>Grade 7-A</option>
          </select>
          <select className="border-2 border-[#FCD34D] rounded-lg px-4 py-2">
            <option>Message To</option>
            <option>All Students</option>
            <option>All Parents</option>
            <option>Individual Student</option>
            <option>Individual Parent</option>
          </select>
          <select className="border-2 border-[#FCD34D] rounded-lg px-4 py-2">
            <option>Message Type</option>
            <option>General Announcement</option>
            <option>Homework Reminder</option>
            <option>Performance Update</option>
            <option>Behavior Report</option>
          </select>
          <select className="border-2 border-[#FCD34D] rounded-lg px-4 py-2">
            <option>Send Via</option>
            <option>WhatsApp</option>
            <option>Email</option>
            <option>SMS</option>
            <option>All Channels</option>
          </select>
        </div>
        <textarea className="w-full border-2 border-[#FCD34D] rounded-lg px-4 py-3 h-32" placeholder="Type your message here..."></textarea>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="bg-[#25D366] text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </button>
          <button className="bg-[#EA4335] text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2">
            <Mail size={18} /> Email
          </button>
          <button className="bg-[#4F46E5] text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2">
            <MessageSquare size={18} /> SMS
          </button>
          <button className="bg-[#0F172A] text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2">
            Send to All Channels
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
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
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    conv.via === 'WhatsApp' ? 'bg-[#25D366]/20 text-[#25D366]' : 'bg-[#EA4335]/20 text-[#EA4335]'
                  }`}>{conv.via}</span>
                </div>
                <span className="text-xs text-[#64748B]">{conv.time}</span>
              </div>
              <p className="text-sm text-[#64748B] mt-1">{conv.message}</p>
              <button className="mt-2 text-sm text-[#4F46E5] font-semibold">Reply</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 8. Payroll & Finance
  const renderPayroll = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Payroll & Finance</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981]">
          <p className="text-sm text-[#64748B]">Basic Salary</p>
          <p className="text-2xl font-bold text-[#0F172A]">₹40,000</p>
        </div>
        <div className="p-6 bg-[#FEF3C7] rounded-xl border-2 border-[#F59E0B]">
          <p className="text-sm text-[#64748B]">Allowances</p>
          <p className="text-2xl font-bold text-[#0F172A]">₹8,000</p>
        </div>
        <div className="p-6 bg-[#FEE2E2] rounded-xl border-2 border-[#DC2626]">
          <p className="text-sm text-[#64748B]">Deductions</p>
          <p className="text-2xl font-bold text-[#0F172A]">₹3,000</p>
        </div>
        <div className="p-6 bg-[#DBEAFE] rounded-xl border-2 border-[#3B82F6]">
          <p className="text-sm text-[#64748B]">Net Salary</p>
          <p className="text-2xl font-bold text-[#0F172A]">₹45,000</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Salary Slip - December 2024</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3 text-[#10B981]">Earnings</h4>
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-[#F8FAFC] rounded">
                <span>Basic Salary</span>
                <span className="font-semibold">₹40,000</span>
              </div>
              <div className="flex justify-between p-2 bg-[#F8FAFC] rounded">
                <span>House Rent Allowance</span>
                <span className="font-semibold">₹4,000</span>
              </div>
              <div className="flex justify-between p-2 bg-[#F8FAFC] rounded">
                <span>Transport Allowance</span>
                <span className="font-semibold">₹2,000</span>
              </div>
              <div className="flex justify-between p-2 bg-[#F8FAFC] rounded">
                <span>Medical Allowance</span>
                <span className="font-semibold">₹2,000</span>
              </div>
              <div className="flex justify-between p-2 bg-[#D1FAE5] rounded font-bold">
                <span>Total Earnings</span>
                <span>₹48,000</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-[#DC2626]">Deductions</h4>
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-[#F8FAFC] rounded">
                <span>Provident Fund</span>
                <span className="font-semibold">₹1,800</span>
              </div>
              <div className="flex justify-between p-2 bg-[#F8FAFC] rounded">
                <span>Professional Tax</span>
                <span className="font-semibold">₹200</span>
              </div>
              <div className="flex justify-between p-2 bg-[#F8FAFC] rounded">
                <span>TDS</span>
                <span className="font-semibold">₹1,000</span>
              </div>
              <div className="flex justify-between p-2 bg-[#FEE2E2] rounded font-bold">
                <span>Total Deductions</span>
                <span>₹3,000</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 p-4 bg-[#4F46E5] text-white rounded-lg flex justify-between items-center">
          <div>
            <p className="text-sm opacity-80">Net Payable Amount</p>
            <p className="text-3xl font-bold">₹45,000</p>
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
              {[
                { month: 'December 2024', gross: '₹48,000', deductions: '₹3,000', net: '₹45,000', status: 'Paid' },
                { month: 'November 2024', gross: '₹48,000', deductions: '₹3,000', net: '₹45,000', status: 'Paid' },
                { month: 'October 2024', gross: '₹48,000', deductions: '₹3,000', net: '₹45,000', status: 'Paid' },
              ].map((payment, idx) => (
                <tr key={idx} className="border-b border-[#E2E8F0]">
                  <td className="px-4 py-3 text-sm font-semibold">{payment.month}</td>
                  <td className="px-4 py-3 text-sm">{payment.gross}</td>
                  <td className="px-4 py-3 text-sm text-[#DC2626]">{payment.deductions}</td>
                  <td className="px-4 py-3 text-sm font-bold text-[#10B981]">{payment.net}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-[#D1FAE5] text-[#065F46] rounded-full text-xs font-semibold">{payment.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-[#4F46E5]"><Download size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Reimbursement Claims</h3>
        <div className="space-y-3 mb-4">
          {[
            { title: 'Travel Reimbursement', amount: '₹2,500', date: 'Dec 10, 2024', status: 'Approved' },
            { title: 'Medical Reimbursement', amount: '₹3,000', date: 'Dec 5, 2024', status: 'Pending' },
          ].map((claim, idx) => (
            <div key={idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold">{claim.title}</p>
                <p className="text-sm text-[#64748B]">{claim.date}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{claim.amount}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  claim.status === 'Approved' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEF3C7] text-[#92400E]'
                }`}>{claim.status}</span>
              </div>
            </div>
          ))}
        </div>
        <button className="bg-[#4F46E5] text-white px-6 py-2 rounded-lg font-semibold">Submit New Claim</button>
      </div>
    </div>
  );

  // 9. Leave & Requests
  const renderLeaveRequests = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Leave & Requests</h2>
      
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Apply for Leave</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Leave Type</label>
            <select className="w-full border-2 border-[#FCD34D] rounded-lg px-4 py-2">
              <option>Casual Leave</option>
              <option>Sick Leave</option>
              <option>Paid Leave</option>
              <option>Emergency Leave</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Duration</label>
            <select className="w-full border-2 border-[#FCD34D] rounded-lg px-4 py-2">
              <option>Full Day</option>
              <option>Half Day - Morning</option>
              <option>Half Day - Afternoon</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">From Date</label>
            <input type="date" className="w-full border-2 border-[#FCD34D] rounded-lg px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">To Date</label>
            <input type="date" className="w-full border-2 border-[#FCD34D] rounded-lg px-4 py-2" />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Reason</label>
          <textarea className="w-full border-2 border-[#FCD34D] rounded-lg px-4 py-3 h-24" placeholder="Enter reason for leave..."></textarea>
        </div>
        <button className="mt-4 bg-[#4F46E5] text-white px-6 py-2 rounded-lg font-semibold">Submit Application</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
          <h3 className="font-bold mb-4">Request Timetable Change</h3>
          <div className="space-y-3">
            <select className="w-full border-2 border-[#FCD34D] rounded-lg px-4 py-2">
              <option>Select Day</option>
              <option>Monday</option>
              <option>Tuesday</option>
              <option>Wednesday</option>
            </select>
            <select className="w-full border-2 border-[#FCD34D] rounded-lg px-4 py-2">
              <option>Select Period</option>
              <option>Period 1</option>
              <option>Period 2</option>
              <option>Period 3</option>
            </select>
            <textarea className="w-full border-2 border-[#FCD34D] rounded-lg px-4 py-3 h-20" placeholder="Reason for change..."></textarea>
            <button className="w-full bg-[#F59E0B] text-white py-2 rounded-lg font-semibold">Submit Request</button>
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
          <h3 className="font-bold mb-4">Resource Requests</h3>
          <div className="space-y-3">
            <select className="w-full border-2 border-[#FCD34D] rounded-lg px-4 py-2">
              <option>Select Resource Type</option>
              <option>Projector</option>
              <option>Science Lab</option>
              <option>Computer Lab</option>
              <option>Library Books</option>
              <option>Sports Equipment</option>
            </select>
            <input type="date" className="w-full border-2 border-[#FCD34D] rounded-lg px-4 py-2" placeholder="Required Date" />
            <input type="text" className="w-full border-2 border-[#FCD34D] rounded-lg px-4 py-2" placeholder="Time Slot (e.g., 10:00 AM - 11:00 AM)" />
            <button className="w-full bg-[#10B981] text-white py-2 rounded-lg font-semibold">Request Resource</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Approval Tracking</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Request Type</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Details</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Date</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { type: 'Leave', details: 'Casual Leave - Dec 25-26', date: 'Dec 20, 2024', status: 'Approved' },
                { type: 'Resource', details: 'Projector for Science Demo', date: 'Dec 18, 2024', status: 'Approved' },
                { type: 'Timetable Change', details: 'Period 3 on Wednesday', date: 'Dec 15, 2024', status: 'Rejected' },
                { type: 'Leave', details: 'Sick Leave - Jan 2', date: 'Dec 22, 2024', status: 'Pending' },
              ].map((req, idx) => (
                <tr key={idx} className="border-b border-[#E2E8F0]">
                  <td className="px-4 py-3 text-sm font-semibold">{req.type}</td>
                  <td className="px-4 py-3 text-sm">{req.details}</td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{req.date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      req.status === 'Approved' ? 'bg-[#D1FAE5] text-[#065F46]' :
                      req.status === 'Rejected' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                      'bg-[#FEF3C7] text-[#92400E]'
                    }`}>{req.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // 10. Documents & Resources
  const renderDocuments = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Documents & Resources</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'School Policies', count: 8, icon: FileText, color: '#4F46E5' },
          { title: 'Staff Handbook', count: 1, icon: Book, color: '#10B981' },
          { title: 'Circulars & Notices', count: 15, icon: Bell, color: '#F59E0B' },
          { title: 'Training Materials', count: 12, icon: Award, color: '#7C3AED' },
        ].map((item, idx) => (
          <div key={idx} className="p-4 bg-white rounded-xl border-2 border-[#FCD34D] hover:shadow-md transition-shadow cursor-pointer">
            <item.icon className="mb-3" style={{ color: item.color }} size={28} />
            <h3 className="font-bold">{item.title}</h3>
            <p className="text-sm text-[#64748B]">{item.count} Documents</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">School Policies</h3>
        <div className="space-y-3">
          {[
            { title: 'Code of Conduct for Staff', date: 'Updated: Jan 2024', size: '1.2 MB' },
            { title: 'Leave Policy', date: 'Updated: Feb 2024', size: '850 KB' },
            { title: 'Academic Guidelines', date: 'Updated: Mar 2024', size: '2.1 MB' },
            { title: 'Safety & Security Policy', date: 'Updated: Apr 2024', size: '1.5 MB' },
          ].map((doc, idx) => (
            <div key={idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center hover:bg-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                  <FileText className="text-[#4F46E5]" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{doc.title}</p>
                  <p className="text-xs text-[#64748B]">{doc.date} • {doc.size}</p>
                </div>
              </div>
              <button className="text-[#4F46E5] hover:bg-[#EEF2FF] p-2 rounded-lg transition-colors">
                <Download size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Staff Handbook</h3>
        <div className="p-6 bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2] rounded-lg text-center">
          <Book className="mx-auto text-[#F59E0B] mb-3" size={48} />
          <h4 className="font-bold text-lg mb-2">AJM International Institution - Staff Handbook 2024-25</h4>
          <p className="text-sm text-[#64748B] mb-4">Complete guide for all staff members including policies, procedures, and guidelines.</p>
          <button className="bg-[#4F46E5] text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 mx-auto">
            <Download size={18} /> Download Handbook
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Recent Circulars & Notices</h3>
        <div className="space-y-3">
          {[
            { title: 'Holiday List - January 2025', date: 'Dec 20, 2024', type: 'Circular' },
            { title: 'Annual Day Performance Schedule', date: 'Dec 18, 2024', type: 'Notice' },
            { title: 'Mid-term Exam Guidelines', date: 'Dec 15, 2024', type: 'Circular' },
            { title: 'Parent-Teacher Meeting Schedule', date: 'Dec 12, 2024', type: 'Notice' },
          ].map((item, idx) => (
            <div key={idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-xs text-[#64748B]">{item.date}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                item.type === 'Circular' ? 'bg-[#DBEAFE] text-[#1E40AF]' : 'bg-[#FEF3C7] text-[#92400E]'
              }`}>{item.type}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Training Materials</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Effective Teaching Methods', type: 'Video', duration: '45 mins' },
            { title: 'Classroom Management', type: 'PDF', duration: '20 pages' },
            { title: 'Using Technology in Education', type: 'Video', duration: '30 mins' },
            { title: 'Student Assessment Techniques', type: 'PDF', duration: '35 pages' },
          ].map((material, idx) => (
            <div key={idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                material.type === 'Video' ? 'bg-[#FEE2E2]' : 'bg-[#EDE9FE]'
              }`}>
                {material.type === 'Video' ? 
                  <svg className="text-[#DC2626]" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> :
                  <FileText className="text-[#7C3AED]" size={20} />
                }
              </div>
              <div>
                <p className="font-semibold text-sm">{material.title}</p>
                <p className="text-xs text-[#64748B]">{material.type} • {material.duration}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 11. Performance & Feedback
  const renderPerformance = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Performance & Feedback</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-gradient-to-br from-[#D1FAE5] to-[#A7F3D0] rounded-xl border-2 border-[#10B981]">
          <Award className="text-[#059669] mb-2" size={32} />
          <p className="text-sm text-[#064E3B]">Overall Rating</p>
          <p className="text-3xl font-bold text-[#064E3B]">4.5 / 5.0</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] rounded-xl border-2 border-[#F59E0B]">
          <Star className="text-[#D97706] mb-2" size={32} />
          <p className="text-sm text-[#92400E]">Appraisal Status</p>
          <p className="text-xl font-bold text-[#92400E]">Due: March 2025</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-[#DBEAFE] to-[#BFDBFE] rounded-xl border-2 border-[#3B82F6]">
          <BookOpen className="text-[#1E40AF] mb-2" size={32} />
          <p className="text-sm text-[#1E40AF]">Training Completed</p>
          <p className="text-3xl font-bold text-[#1E40AF]">5 / 6</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Latest Appraisal Report - September 2024</h3>
        <div className="space-y-4">
          {[
            { category: 'Teaching Quality', score: 4.5, comment: 'Excellent classroom management and student engagement.' },
            { category: 'Student Results', score: 4.2, comment: 'Good improvement in student performance metrics.' },
            { category: 'Punctuality', score: 4.8, comment: 'Consistently on time with minimal absences.' },
            { category: 'Professional Development', score: 4.0, comment: 'Actively participates in training programs.' },
            { category: 'Team Collaboration', score: 4.5, comment: 'Great team player and mentor to new staff.' },
          ].map((item, idx) => (
            <div key={idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{item.category}</span>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1,2,3,4,5].map((star) => (
                      <Star 
                        key={star} 
                        size={16} 
                        className={star <= Math.floor(item.score) ? 'text-[#F59E0B] fill-[#F59E0B]' : 'text-[#E2E8F0]'} 
                      />
                    ))}
                  </div>
                  <span className="font-bold text-sm">{item.score}</span>
                </div>
              </div>
              <p className="text-sm text-[#64748B]">{item.comment}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-[#D1FAE5] rounded-lg">
          <p className="font-semibold text-[#065F46]">Overall Assessment: Excellent Performance</p>
          <p className="text-sm text-[#064E3B] mt-1">Continue the great work. Recommended for senior teacher role.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Feedback from Management</h3>
        <div className="space-y-3">
          {[
            { from: 'Principal - Dr. Verma', message: 'Great job organizing the Science Exhibition. Students were very engaged.', date: 'Dec 15, 2024' },
            { from: 'HOD Science - Mr. Singh', message: 'Excellent lesson planning and syllabus completion. Keep it up!', date: 'Dec 10, 2024' },
          ].map((feedback, idx) => (
            <div key={idx} className="p-4 border-l-4 border-[#4F46E5] bg-[#F8FAFC] rounded-r-lg">
              <div className="flex justify-between items-start">
                <p className="font-semibold">{feedback.from}</p>
                <span className="text-xs text-[#64748B]">{feedback.date}</span>
              </div>
              <p className="text-sm text-[#64748B] mt-1">"{feedback.message}"</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Training & Development Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Training Program</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Date</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Duration</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Status</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Certificate</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Modern Teaching Techniques', date: 'Nov 2024', duration: '2 Days', status: 'Completed' },
                { name: 'Digital Classroom Tools', date: 'Oct 2024', duration: '1 Day', status: 'Completed' },
                { name: 'Child Psychology Workshop', date: 'Sep 2024', duration: '3 Days', status: 'Completed' },
                { name: 'First Aid Training', date: 'Jan 2025', duration: '1 Day', status: 'Upcoming' },
              ].map((training, idx) => (
                <tr key={idx} className="border-b border-[#E2E8F0]">
                  <td className="px-4 py-3 text-sm font-semibold">{training.name}</td>
                  <td className="px-4 py-3 text-sm">{training.date}</td>
                  <td className="px-4 py-3 text-sm">{training.duration}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      training.status === 'Completed' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#DBEAFE] text-[#1E40AF]'
                    }`}>{training.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {training.status === 'Completed' && (
                      <button className="text-[#4F46E5]"><Download size={18} /></button>
                    )}
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
        <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Settings className="text-[#64748B]" size={20} />
            Profile Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Display Name</label>
              <input type="text" defaultValue={user?.full_name || 'Staff User'} className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input type="email" defaultValue="staff@ajmschool.edu" className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input type="tel" defaultValue="+91 9876543210" className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2" />
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

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <HelpCircle className="text-[#4F46E5]" size={20} />
          Help Desk / Support
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-[#FEF3C7] rounded-lg">
            <p className="font-semibold">IT Support</p>
            <p className="text-sm text-[#64748B]">For technical issues</p>
            <p className="text-sm font-semibold mt-2">itsupport@ajmschool.edu</p>
          </div>
          <div className="p-4 bg-[#FEE2E2] rounded-lg">
            <p className="font-semibold">HR Department</p>
            <p className="text-sm text-[#64748B]">For HR related queries</p>
            <p className="text-sm font-semibold mt-2">hr@ajmschool.edu</p>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Submit a Support Request</h4>
          <div className="space-y-3">
            <select className="w-full border-2 border-[#FCD34D] rounded-lg px-4 py-2">
              <option>Select Issue Type</option>
              <option>Technical Issue</option>
              <option>Login Problem</option>
              <option>Data Correction</option>
              <option>Feature Request</option>
              <option>Other</option>
            </select>
            <textarea className="w-full border-2 border-[#FCD34D] rounded-lg px-4 py-3 h-24" placeholder="Describe your issue..."></textarea>
            <button className="bg-[#4F46E5] text-white px-6 py-2 rounded-lg font-semibold">Submit Request</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Frequently Asked Questions</h3>
        <div className="space-y-3">
          {[
            { q: 'How do I apply for leave?', a: 'Go to Leave & Requests module, fill in the leave application form with dates and reason, then submit.' },
            { q: 'How can I view my salary slip?', a: 'Navigate to Payroll & Finance section where you can view and download your salary slips.' },
            { q: 'How to upload lesson plans?', a: 'Go to Academic Management, click on "Upload Lesson Plan" button and attach your document.' },
            { q: 'How to message parents?', a: 'Use the Communication Tools module to send messages to parents. All messages are school-monitored.' },
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
          <p className="font-semibold text-[#991B1B]">Logout from Staff Portal</p>
          <p className="text-sm text-[#64748B]">You will be redirected to the login page</p>
        </div>
        <button className="bg-[#DC2626] text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2">
          <LogOut size={18} /> Logout
        </button>
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
    { id: 'leave', name: 'Leave & Requests', icon: FileQuestion, render: renderLeaveRequests },
    { id: 'documents', name: 'Documents', icon: Book, render: renderDocuments },
    { id: 'performance', name: 'Performance', icon: Award, render: renderPerformance },
    { id: 'settings', name: 'Settings', icon: Settings, render: renderSettings },
  ];

  // Render the module based on the prop passed from route
  const currentModule = modules.find(m => m.id === module) || modules[0];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2] rounded-2xl p-6 border-2 border-[#FCD34D]">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] mb-1">Welcome, {user?.full_name}!</h1>
        <p className="text-base text-[#64748B]">Staff Portal - AJM International Institution</p>
      </div>

      <div>
        {currentModule.render()}
      </div>
    </div>
  );
};

export default StaffDashboard;
