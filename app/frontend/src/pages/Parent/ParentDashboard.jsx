import React, { useState, useEffect } from 'react';
import {
  User, Calendar, ClipboardCheck,
  MessageSquare, DollarSign, Award, Settings, Users,
  Clock, CheckCircle, XCircle, Bell, Mail, Download,
  Star, HelpCircle, LogOut, AlertCircle,
  Bus, Heart, Shield, CalendarDays, Phone, MapPin,
  CreditCard, Receipt, GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

const ParentDashboard = ({ user, module = 'profile' }) => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childAttendance, setChildAttendance] = useState({ records: [], summary: { total: 0, present: 0, absent: 0 } });
  const [childGrades, setChildGrades] = useState([]);
  const [childFees, setChildFees] = useState({ fees: [], summary: { totalDue: 0 } });
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [isDenyModalOpen, setIsDenyModalOpen] = useState(false);
  const [denyReason, setDenyReason] = useState('');
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schoolEvents, setSchoolEvents] = useState([]);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await api.get('/api/parent/children');
        const kids = res.data || [];
        setChildren(kids);
        if (kids.length > 0 && !selectedChild) setSelectedChild(kids[0]);
      } catch (err) {
        console.error('Failed to load children:', err);
      }
    };
    fetchChildren();
  }, []);

  useEffect(() => {
    if (!selectedChild?._id) return;
    const fetchChildData = async () => {
      setLoading(true);
      try {
        if (module === 'attendance') {
          const [attRes, leaveRes] = await Promise.all([
            api.get(`/api/parent/children/${selectedChild._id}/attendance`),
            api.get('/api/student-leaves/parent/pending')
          ]);
          console.log(leaveRes, "leaveRes")
          setChildAttendance(attRes.data);
          setPendingLeaves(leaveRes?.data || []);
        }
        if (module === 'academic') {
          const res = await api.get(`/api/parent/children/${selectedChild._id}/grades`);
          setChildGrades(res.data || []);
        }
        if (module === 'fees') {
          const res = await api.get(`/api/parent/children/${selectedChild._id}/fees`);
          setChildFees(res.data);
        }
        if (module === 'communication') {
          try {
            const eventsRes = await api.get('/api/school-events/user-events');
            setSchoolEvents(eventsRes?.data || []);
          } catch { /* events optional */ }
        }
      } catch (err) {
        console.error('Failed to load child data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChildData();
  }, [module, selectedChild]);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getGradeBadge = (grade) => {
    if (grade === 'A+' || grade === 'A') return 'bg-[#D1FAE5] text-[#065F46]';
    if (grade === 'B+' || grade === 'B') return 'bg-[#FEF3C7] text-[#92400E]';
    return 'bg-[#FEE2E2] text-[#991B1B]';
  };

  const handleLeaveAction = async (id, action, reason = '') => {
    setActionLoading(true);
    try {
      await api.put(`/api/student-leaves/parent/action/${id}`, { action, reason });
      toast.success(`Leave ${action === 'approve' ? 'approved' : 'denied'} successfully!`);
      // Refresh pending leaves
      const res = await api.get('/api/student-leaves/parent/pending');
      setPendingLeaves(res.data?.data || []);
      if (action === 'deny') {
        setIsDenyModalOpen(false);
        setDenyReason('');
        setSelectedLeaveId(null);
      }
    } catch (err) {
      console.error('Failed to update leave status:', err);
      toast.error(err.response?.data?.message || 'Failed to update leave status');
    } finally {
      setActionLoading(false);
    }
  };

  const childSelector = () => children.length > 1 ? (
    <div className="mb-4">
      <select
        className="border-2 border-[#FCD34D] rounded-lg px-4 py-2 font-semibold"
        value={selectedChild?._id || ''}
        onChange={(e) => setSelectedChild(children.find(c => c._id === e.target.value))}
      >
        {children.map(c => (
          <option key={c._id} value={c._id}>
            {c.userId?.name || c.firstName + ' ' + c.lastName} — {c.classId?.name || ''} {c.classId?.section || ''}
          </option>
        ))}
      </select>
    </div>
  ) : null;

  // 1. Parent Profile
  const renderProfile = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Parent Profile</h2>
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-[#D1FAE5] to-[#DBEAFE] rounded-full flex items-center justify-center text-4xl font-bold text-[#10B981]">
            {user?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#0F172A]">{user?.name || 'Parent User'}</h3>
            <span className="inline-block mt-2 px-3 py-1 bg-[#10B981] text-white text-xs font-semibold rounded-full">Active Account</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-[#D1FAE5] rounded-lg">
            <p className="text-sm text-[#64748B]">Relation</p>
            <p className="font-bold text-[#0F172A]">Father</p>
          </div>
          <div className="p-4 bg-[#DBEAFE] rounded-lg">
            <p className="text-sm text-[#64748B]">Occupation</p>
            <p className="font-bold text-[#0F172A]">Business Professional</p>
          </div>
        </div>

        <div className="border-t border-[#E2E8F0] pt-4">
          <h4 className="font-semibold mb-3">Contact Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-[#F8FAFC] rounded-lg">
              <Mail className="text-[#64748B]" size={18} />
              <span className="text-sm">{user?.email || 'parent@email.com'}</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-[#F8FAFC] rounded-lg">
              <Phone className="text-[#64748B]" size={18} />
              <span className="text-sm">+91 9876543210</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-[#F8FAFC] rounded-lg col-span-2">
              <MapPin className="text-[#64748B]" size={18} />
              <span className="text-sm">123, Green Park, New Delhi - 110001</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E2E8F0] pt-4 mt-4">
          <h4 className="font-semibold mb-3">Linked Student(s)</h4>
          <div className="space-y-3">
            {children.length > 0 ? children.map((child, idx) => (
              <div key={child._id} className={`p-4 rounded-lg flex justify-between items-center ${idx === 0 ? 'border-2 border-[#FCD34D] bg-[#FFFBEB]' : 'border-2 border-[#E2E8F0]'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${idx === 0 ? 'bg-[#4F46E5]' : 'bg-[#EC4899]'} rounded-full flex items-center justify-center text-white font-bold`}>
                    {(child.userId?.name || child.firstName || '?').charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold">{child.userId?.name || `${child.firstName} ${child.lastName}`}</p>
                    <p className="text-sm text-[#64748B]">{child.classId?.name || 'N/A'} {child.classId?.section || ''} | Roll No: {child.rollNumber || '—'}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-white text-xs rounded-full font-semibold ${idx === 0 ? 'bg-[#10B981]' : 'bg-[#64748B]'}`}>{idx === 0 ? 'Primary' : 'Sibling'}</span>
              </div>
            )) : (
              <>
                <div className="p-4 border-2 border-[#FCD34D] rounded-lg flex justify-between items-center bg-[#FFFBEB]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#4F46E5] rounded-full flex items-center justify-center text-white font-bold">R</div>
                    <div>
                      <p className="font-bold">Rahul Kumar</p>
                      <p className="text-sm text-[#64748B]">Grade 10-A | Roll No: 15</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-[#10B981] text-white text-xs rounded-full font-semibold">Primary</span>
                </div>
                <div className="p-4 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#EC4899] rounded-full flex items-center justify-center text-white font-bold">P</div>
                    <div>
                      <p className="font-bold">Priya Kumar</p>
                      <p className="text-sm text-[#64748B]">Grade 7-B | Roll No: 8</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-[#64748B] text-white text-xs rounded-full font-semibold">Sibling</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-[#E2E8F0] pt-4 mt-4">
          <h4 className="font-semibold mb-3">Login & Security Settings</h4>
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

  // 2. Student Overview
  const renderOverview = () => {
    const child = selectedChild;
    const childName = child?.userId?.name || 'Student';
    const className = child?.classId?.name || 'N/A';
    const section = child?.classId?.section || '';
    const rollNumber = child?.rollNumber || '—';
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#0F172A]" Parent Profile>Student Overview</h2>
        {childSelector()}

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-full flex items-center justify-center text-3xl font-bold text-white">{childName.charAt(0)}</div>
            <div>
              <h3 className="text-2xl font-bold text-[#0F172A]">{childName}</h3>
              <p className="text-[#64748B]">Student ID: {child?.studentId || 'N/A'}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-[#10B981] text-white text-xs font-semibold rounded-full">Active Student</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-[#DBEAFE] rounded-lg">
              <p className="text-sm text-[#64748B]">Class</p>
              <p className="font-bold text-[#0F172A]">{className}</p>
            </div>
            <div className="p-4 bg-[#D1FAE5] rounded-lg">
              <p className="text-sm text-[#64748B]">Section</p>
              <p className="font-bold text-[#0F172A]">{section || 'N/A'}</p>
            </div>
            <div className="p-4 bg-[#FEF3C7] rounded-lg">
              <p className="text-sm text-[#64748B]">Roll Number</p>
              <p className="font-bold text-[#0F172A]">{rollNumber}</p>
            </div>
            <div className="p-4 bg-[#FEE2E2] rounded-lg">
              <p className="text-sm text-[#64748B]">Academic Year</p>
              <p className="font-bold text-[#0F172A]">{(() => { const now = new Date(); const y = now.getFullYear(); const m = now.getMonth() + 1; return m >= 6 ? `${y}-${y + 1}` : `${y - 1}-${y}`; })()}</p>
            </div>
          </div>

          <div className="border-t border-[#E2E8F0] pt-4">
            <h4 className="font-semibold mb-3">Child's Basic Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-[#F8FAFC] rounded-lg">
                <p className="text-sm text-[#64748B]">Date of Birth</p>
                <p className="font-semibold">{child?.dateOfBirth ? formatDate(child.dateOfBirth) : '—'}</p>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-lg">
                <p className="text-sm text-[#64748B]">Blood Group</p>
                <p className="font-semibold">{child?.bloodGroup || '—'}</p>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-lg">
                <p className="text-sm text-[#64748B]">Admission Date</p>
                <p className="font-semibold">{child?.admissionDate ? formatDate(child.admissionDate) : '—'}</p>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-lg">
                <p className="text-sm text-[#64748B]">House</p>
                <p className="font-semibold">{child?.house || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <GraduationCap className="text-[#4F46E5]" size={20} />
            Teacher Details
          </h3>
          <div className="space-y-3">
            <div className="p-4 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center">
              <div>
                <p className="font-bold">Class Teacher</p>
                <p className="text-sm text-[#64748B]">{className} {section}</p>
              </div>
              <button className="text-[#4F46E5] text-sm font-semibold">Message</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981]">
            <p className="text-sm text-[#64748B]">Attendance</p>
            <p className="text-3xl font-bold text-[#065F46]">—</p>
            <p className="text-xs text-[#10B981]">This Month</p>
          </div>
          <div className="p-6 bg-[#DBEAFE] rounded-xl border-2 border-[#3B82F6]">
            <p className="text-sm text-[#64748B]">Class Rank</p>
            <p className="text-3xl font-bold text-[#1E40AF]">—</p>
            <p className="text-xs text-[#3B82F6]">Out of —</p>
          </div>
          <div className="p-6 bg-[#FEF3C7] rounded-xl border-2 border-[#F59E0B]">
            <p className="text-sm text-[#64748B]">Overall Grade</p>
            <p className="text-3xl font-bold text-[#92400E]">—</p>
            <p className="text-xs text-[#F59E0B]">Last Exam</p>
          </div>
        </div>
      </div>
    );
  };

  // 3. Attendance Monitoring
  const renderAttendance = () => {
    const { records, summary } = childAttendance;
    const total = summary?.total || 0;
    const present = summary?.present || 0;
    const absent = summary?.absent || (total - present);
    const pct = total > 0 ? ((present / total) * 100).toFixed(1) : '0.0';
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecord = records.find(r => r.date?.split('T')[0] === todayStr);
    const recentAbsent = records.filter(r => r.status === 'absent').slice(0, 3);

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#0F172A]">Attendance Monitoring</h2>
        {childSelector()}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981]">
            <p className="text-sm text-[#64748B]">Present Days</p>
            <p className="text-3xl font-bold text-[#065F46]">{present}</p>
          </div>
          <div className="p-6 bg-[#FEE2E2] rounded-xl border-2 border-[#DC2626]">
            <p className="text-sm text-[#64748B]">Absent Days</p>
            <p className="text-3xl font-bold text-[#991B1B]">{absent}</p>
          </div>
          <div className="p-6 bg-[#FEF3C7] rounded-xl border-2 border-[#F59E0B]">
            <p className="text-sm text-[#64748B]">Total Days</p>
            <p className="text-3xl font-bold text-[#92400E]">{total}</p>
          </div>
          <div className="p-6 bg-[#DBEAFE] rounded-xl border-2 border-[#3B82F6]">
            <p className="text-sm text-[#64748B]">Attendance %</p>
            <p className="text-3xl font-bold text-[#1E40AF]">{pct}%</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Calendar className="text-[#F59E0B]" size={20} />
            Today's Attendance Status
          </h3>
          {todayRecord ? (
            <div className={`p-4 rounded-lg flex items-center gap-4 ${todayRecord.status === 'present' ? 'bg-[#D1FAE5]' : 'bg-[#FEE2E2]'}`}>
              {todayRecord.status === 'present' ? <CheckCircle className="text-[#10B981]" size={32} /> : <XCircle className="text-[#DC2626]" size={32} />}
              <div>
                <p className={`font-bold text-lg ${todayRecord.status === 'present' ? 'text-[#065F46]' : 'text-[#991B1B]'}`}>{todayRecord.status === 'present' ? 'Present' : 'Absent'}</p>
                <p className="text-sm text-[#64748B]">{formatDate(todayRecord.date)}</p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#F8FAFC] rounded-lg flex items-center gap-4">
              <Clock className="text-[#64748B]" size={32} />
              <div>
                <p className="font-bold text-lg text-[#64748B]">Not Marked Yet</p>
                <p className="text-sm text-[#64748B]">Today's attendance has not been recorded</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Recent Attendance Records</h3>
          {records.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-linear-to-r from-[#DBEAFE] to-[#D1FAE5]">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-sm">Date</th>
                    <th className="px-4 py-3 text-left font-bold text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 15).map((rec, idx) => (
                    <tr key={idx} className="border-b border-[#E2E8F0]">
                      <td className="px-4 py-3 text-sm">{formatDate(rec.date)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${rec.status === 'present' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEE2E2] text-[#991B1B]'
                          }`}>{rec.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[#64748B] text-center py-8">No attendance records found.</p>
          )}
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <CalendarDays className="text-[#4F46E5]" size={20} />
            Pending Student Leave Requests
          </h3>
          {pendingLeaves.length > 0 ? (
            <div className="space-y-4">
              {pendingLeaves.map((leave) => (
                <div key={leave._id} className="p-4 bg-[#F8FAFC] rounded-lg border-2 border-[#E2E8F0]">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-lg text-[#0F172A]">{leave.studentId?.userId?.name || 'Student'}</p>
                      <p className="text-sm text-[#64748B]">Type: <span className="capitalize font-semibold">{leave.leaveType}</span></p>
                      <p className="text-sm text-[#64748B]">Dates: <span className="font-semibold">{formatDate(leave.startDate)} to {formatDate(leave.endDate)}</span></p>
                      <p className="mt-2 text-[#0F172A] italic">"{leave.reason}"</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLeaveAction(leave._id, 'approve')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-[#10B981] text-white font-bold rounded-lg hover:bg-[#059669] transition-colors flex items-center gap-2"
                      >
                        <CheckCircle size={18} /> Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLeaveId(leave._id);
                          setIsDenyModalOpen(true);
                        }}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-[#DC2626] text-white font-bold rounded-lg hover:bg-[#B91C1C] transition-colors flex items-center gap-2"
                      >
                        <XCircle size={18} /> Deny
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#64748B] text-center py-8">No pending leave requests for your children.</p>
          )}
        </div>

        {recentAbsent.length > 0 && (
          <div className="bg-white rounded-xl border-2 border-[#DC2626] p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="text-[#DC2626]" size={20} />
              Absence Notifications
            </h3>
            <div className="space-y-3">
              {recentAbsent.map((rec, idx) => (
                <div key={idx} className="p-4 bg-[#FEE2E2] rounded-lg border-l-4 border-[#DC2626]">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-[#991B1B]">Absent on {formatDate(rec.date)}</p>
                      <p className="text-sm text-[#64748B]">Reason: {rec.reason || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 4. Academic Progress
  const renderAcademic = () => {
    const grades = childGrades;
    const totalMarks = grades.reduce((sum, g) => sum + (g.marks || 0), 0);
    const totalMax = grades.reduce((sum, g) => sum + (g.totalMarks || 100), 0);
    const pct = totalMax > 0 ? ((totalMarks / totalMax) * 100).toFixed(1) : '0.0';

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#0F172A]">Academic Progress</h2>
        {childSelector()}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981]">
            <p className="text-sm text-[#64748B]">Subjects</p>
            <p className="text-2xl font-bold text-[#065F46]">{grades.length}</p>
          </div>
          <div className="p-4 bg-[#DBEAFE] rounded-xl border-2 border-[#3B82F6]">
            <p className="text-sm text-[#64748B]">Total Marks</p>
            <p className="text-2xl font-bold text-[#1E40AF]">{totalMarks} / {totalMax}</p>
          </div>
          <div className="p-4 bg-[#FEF3C7] rounded-xl border-2 border-[#F59E0B]">
            <p className="text-sm text-[#64748B]">Percentage</p>
            <p className="text-2xl font-bold text-[#92400E]">{pct}%</p>
          </div>
          <div className="p-4 bg-[#EDE9FE] rounded-xl border-2 border-[#7C3AED]">
            <p className="text-sm text-[#64748B]">Grade Records</p>
            <p className="text-2xl font-bold text-[#5B21B6]">{grades.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <ClipboardCheck className="text-[#DC2626]" size={20} />
              Homework & Assignments
            </h3>
            <div className="space-y-3">
              <div className="p-4 text-center text-[#64748B]">
                <p>Homework module coming soon</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <GraduationCap className="text-[#7C3AED]" size={20} />
              Test & Exam Schedules
            </h3>
            <div className="space-y-3">
              <div className="p-4 text-center text-[#64748B]">
                <p>Exam schedules coming soon</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Marks, Grades & Report Cards</h3>
            <button className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
              <Download size={16} /> Download Report Card
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-linear-to-r from-[#D1FAE5] to-[#DBEAFE]">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-sm">Subject</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Marks</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Grade</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Term</th>
                </tr>
              </thead>
              <tbody>
                {grades.length > 0 ? grades.map((g, idx) => (
                  <tr key={idx} className="border-b border-[#E2E8F0]">
                    <td className="px-4 py-3 text-sm font-semibold">{g.subjectId?.name || 'Subject'}</td>
                    <td className="px-4 py-3 text-sm">{g.marks || 0}/{g.totalMarks || 100}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getGradeBadge(g.grade || '')}`}>{g.grade || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#64748B]">{g.term || '—'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-[#64748B]">No grade records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {grades.length > 0 && (
            <div className="mt-4 p-4 bg-[#D1FAE5] rounded-lg">
              <p className="font-bold text-[#065F46]">Total: {totalMarks}/{totalMax} | Percentage: {pct}%</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 5. Communication
  const renderCommunication = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Communication</h2>

      {/* Holiday Calendar + School Events — from admin-created calendar events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <CalendarDays className="text-[#F59E0B]" size={20} />
            Holiday Calendar
          </h3>
          <div className="space-y-3">
            {schoolEvents.filter(e => e.eventType === 'holiday').length > 0 ? (
              schoolEvents.filter(e => e.eventType === 'holiday').map((event) => (
                <div key={event._id} className="p-3 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-xs text-[#64748B] capitalize">{event.priority} priority</p>
                  </div>
                  <span className="px-3 py-1 bg-[#D1FAE5] text-[#065F46] rounded-full text-sm font-semibold whitespace-nowrap">
                    {formatDate(event.startDate)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#64748B] text-center py-4">No holidays scheduled</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Bell className="text-[#4F46E5]" size={20} />
            School Events
          </h3>
          <div className="space-y-3">
            {schoolEvents.filter(e => e.eventType !== 'holiday').length > 0 ? (
              schoolEvents.filter(e => e.eventType !== 'holiday').map((event) => {
                const typeColors = {
                  exam: { bg: 'bg-[#FEE2E2]', text: 'text-[#991B1B]' },
                  sports: { bg: 'bg-[#D1FAE5]', text: 'text-[#065F46]' },
                  cultural: { bg: 'bg-[#FED7AA]', text: 'text-[#C2410C]' },
                  academic: { bg: 'bg-[#DBEAFE]', text: 'text-[#1E40AF]' },
                  meeting: { bg: 'bg-[#F3F4F6]', text: 'text-[#374151]' },
                  other: { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]' },
                };
                const c = typeColors[event.eventType] || typeColors.other;
                return (
                  <div key={event._id} className="p-3 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{event.title}</p>
                      <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.bg} ${c.text}`}>
                        {event.eventType}
                      </span>
                    </div>
                    <span className="ml-2 px-3 py-1 bg-[#DBEAFE] text-[#1E40AF] rounded-full text-xs font-semibold whitespace-nowrap">
                      {formatDate(event.startDate)}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-[#64748B] text-center py-4">No upcoming events</p>
            )}
          </div>
        </div>
      </div>

      {/* Communication Channels - WhatsApp, Email, SMS */}
      <div className="bg-linear-to-r from-[#4F46E5] to-[#7C3AED] rounded-xl p-6 text-white">
        <h3 className="font-bold text-xl mb-4">Contact School via Multiple Channels</h3>
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
                <p className="text-xs text-white/80">+91 98765 43210</p>
              </div>
            </div>
            <p className="text-sm text-white/70">Message school on WhatsApp for quick queries</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 cursor-pointer transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#EA4335] rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold">Email</p>
                <p className="text-xs text-white/80">info@ajmschool.edu</p>
              </div>
            </div>
            <p className="text-sm text-white/70">Send detailed emails with attachments</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 cursor-pointer transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold">SMS Alerts</p>
                <p className="text-xs text-white/80">Subscribed</p>
              </div>
            </div>
            <p className="text-sm text-white/70">Receive instant SMS alerts for important updates</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <MessageSquare className="text-[#4F46E5]" size={20} />
          Messages from Teachers
        </h3>
        <div className="space-y-4">
          {[
            { teacher: 'Mr. Sharma (Mathematics)', message: 'Rahul has shown great improvement in problem-solving. Encourage more practice at home.', time: 'Today, 10:30 AM', type: 'positive', via: 'WhatsApp' },
            { teacher: 'Mrs. Gupta (Science)', message: 'Please ensure Rahul completes the lab report by Dec 28. It\'s important for grades.', time: 'Yesterday, 3:15 PM', type: 'info', via: 'Email' },
            { teacher: 'Mrs. Sunita (Class Teacher)', message: 'Parent-Teacher Meeting scheduled for Dec 30. Please confirm your attendance.', time: 'Dec 20, 2024', type: 'important', via: 'SMS' },
          ].map((msg, idx) => (
            <div key={idx} className={`p-4 rounded-lg border-l-4 ${msg.type === 'positive' ? 'bg-[#F0FDF4] border-[#10B981]' :
              msg.type === 'important' ? 'bg-[#FEF3C7] border-[#F59E0B]' :
                'bg-[#F8FAFC] border-[#64748B]'
              }`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{msg.teacher}</p>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${msg.via === 'WhatsApp' ? 'bg-[#25D366]/20 text-[#25D366]' :
                    msg.via === 'Email' ? 'bg-[#EA4335]/20 text-[#EA4335]' :
                      'bg-[#4F46E5]/20 text-[#4F46E5]'
                    }`}>{msg.via}</span>
                </div>
                <span className="text-xs text-[#64748B]">{msg.time}</span>
              </div>
              <p className="text-sm text-[#64748B] mt-2">{msg.message}</p>
              <div className="mt-3 flex gap-2">
                <button className="text-sm bg-[#25D366] text-white px-3 py-1 rounded font-semibold">Reply via WhatsApp</button>
                <button className="text-sm bg-[#EA4335] text-white px-3 py-1 rounded font-semibold">Reply via Email</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Bell className="text-[#DC2626]" size={20} />
          School Announcements & Notices
        </h3>
        <div className="space-y-3">
          {[
            { title: 'Mid-Term Examination Schedule', message: 'Examinations begin from December 26, 2024. Please check the timetable.', time: '2 hours ago', priority: 'high', via: 'SMS' },
            { title: 'Annual Day Celebration', message: 'Annual Day will be celebrated on January 15, 2025. Parents are cordially invited.', time: '1 day ago', priority: 'medium', via: 'Email' },
            { title: 'Winter Vacation Notice', message: 'School will remain closed from January 1-5, 2025 for winter vacation.', time: '2 days ago', priority: 'low', via: 'WhatsApp' },
          ].map((notice, idx) => (
            <div key={idx} className={`p-4 rounded-lg border-l-4 ${notice.priority === 'high' ? 'bg-[#FEE2E2] border-[#DC2626]' :
              notice.priority === 'medium' ? 'bg-[#FEF3C7] border-[#F59E0B]' :
                'bg-[#F1F5F9] border-[#64748B]'
              }`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{notice.title}</p>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${notice.via === 'WhatsApp' ? 'bg-[#25D366]/20 text-[#25D366]' :
                    notice.via === 'Email' ? 'bg-[#EA4335]/20 text-[#EA4335]' :
                      'bg-[#4F46E5]/20 text-[#4F46E5]'
                    }`}>via {notice.via}</span>
                </div>
                <span className="text-xs text-[#64748B]">{notice.time}</span>
              </div>
              <p className="text-sm text-[#64748B] mt-1">{notice.message}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Send Message to School</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <select className="border-2 border-[#FCD34D] rounded-lg px-4 py-2">
            <option>Select Recipient</option>
            <option>Class Teacher</option>
            <option>Subject Teacher</option>
            <option>Principal</option>
            <option>Admin Office</option>
          </select>
          <select className="border-2 border-[#FCD34D] rounded-lg px-4 py-2">
            <option>Regarding</option>
            <option>Academic Query</option>
            <option>Attendance Issue</option>
            <option>Fee Related</option>
            <option>General Inquiry</option>
          </select>
          <select className="border-2 border-[#FCD34D] rounded-lg px-4 py-2">
            <option>Send Via</option>
            <option>WhatsApp</option>
            <option>Email</option>
            <option>In-App Message</option>
          </select>
        </div>
        <textarea className="w-full border-2 border-[#FCD34D] rounded-lg px-4 py-3 h-24" placeholder="Type your message here..."></textarea>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="bg-[#25D366] text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Send via WhatsApp
          </button>
          <button className="bg-[#EA4335] text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2">
            <Mail size={18} /> Send via Email
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border-2 border-[#4F46E5] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Users className="text-[#4F46E5]" size={20} />
            Parent-Teacher Meeting (PTM)
          </h3>
          <div className="p-4 bg-[#EEF2FF] rounded-lg mb-4">
            <p className="font-semibold text-[#4F46E5]">Next PTM: December 30, 2024</p>
            <p className="text-sm text-[#64748B]">Time: 10:00 AM - 1:00 PM</p>
            <p className="text-sm text-[#64748B]">Venue: Main Hall</p>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 bg-[#10B981] text-white py-2 rounded-lg font-semibold text-sm">Confirm Attendance</button>
            <button className="flex-1 border-2 border-[#DC2626] text-[#DC2626] py-2 rounded-lg font-semibold text-sm">Request Reschedule</button>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Star className="text-[#F59E0B]" size={20} />
            Feedback from Teachers
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-[#D1FAE5] rounded-lg">
              <p className="font-semibold text-sm">Academic Performance</p>
              <div className="flex mt-1">
                {[1, 2, 3, 4, 5].map(star => <Star key={star} size={16} className="text-[#F59E0B] fill-[#F59E0B]" />)}
              </div>
              <p className="text-xs text-[#64748B] mt-1">Excellent progress in all subjects</p>
            </div>
            <div className="p-3 bg-[#DBEAFE] rounded-lg">
              <p className="font-semibold text-sm">Behavior & Discipline</p>
              <div className="flex mt-1">
                {[1, 2, 3, 4].map(star => <Star key={star} size={16} className="text-[#F59E0B] fill-[#F59E0B]" />)}
                <Star size={16} className="text-[#E2E8F0]" />
              </div>
              <p className="text-xs text-[#64748B] mt-1">Good behavior, participates actively</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 6. Fees & Payments
  const renderFees = () => {
    const { fees, summary } = childFees;
    const totalDue = summary?.totalDue || 0;
    const totalPaid = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + (f.amount || 0), 0);
    const totalFees = totalPaid + totalDue;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#0F172A]">Fees & Payments</h2>
        {childSelector()}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981]">
            <p className="text-sm text-[#64748B]">Total Fees</p>
            <p className="text-2xl font-bold text-[#065F46]">₹{totalFees.toLocaleString()}</p>
            <p className="text-xs text-[#10B981]">Academic Year</p>
          </div>
          <div className="p-6 bg-[#DBEAFE] rounded-xl border-2 border-[#3B82F6]">
            <p className="text-sm text-[#64748B]">Paid Amount</p>
            <p className="text-2xl font-bold text-[#1E40AF]">₹{totalPaid.toLocaleString()}</p>
            <p className="text-xs text-[#3B82F6]">{totalFees > 0 ? ((totalPaid / totalFees) * 100).toFixed(1) : 0}% Complete</p>
          </div>
          <div className="p-6 bg-[#FEE2E2] rounded-xl border-2 border-[#DC2626]">
            <p className="text-sm text-[#64748B]">Pending Amount</p>
            <p className="text-2xl font-bold text-[#991B1B]">₹{totalDue.toLocaleString()}</p>
            <p className="text-xs text-[#DC2626]">Due</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Fee Structure</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-linear-to-r from-[#FEF3C7] to-[#FEE2E2]">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-sm">Fee Type</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Amount</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Due Date</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {fees.length > 0 ? fees.map((fee, idx) => (
                  <tr key={idx} className="border-b border-[#E2E8F0]">
                    <td className="px-4 py-3 text-sm">{fee.feeType || fee.type || 'Fee'}</td>
                    <td className="px-4 py-3 text-sm font-semibold">₹{(fee.amount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{fee.dueDate ? formatDate(fee.dueDate) : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${fee.status === 'paid' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEE2E2] text-[#991B1B]'
                        }`}>{fee.status === 'paid' ? 'Paid' : 'Pending'}</span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-[#64748B]">No fee records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <CreditCard className="text-[#4F46E5]" size={20} />
              Online Payment
            </h3>
            <div className="p-4 bg-[#FEE2E2] rounded-lg mb-4">
              <p className="text-sm text-[#64748B]">Amount Due</p>
              <p className="text-2xl font-bold text-[#991B1B]">₹{totalDue.toLocaleString()}</p>
            </div>
            <select className="w-full border-2 border-[#FCD34D] rounded-lg px-4 py-2 mb-4">
              <option>Select Fee Type</option>
              {fees.filter(f => f.status !== 'paid').map((f, idx) => (
                <option key={idx}>{f.feeType || f.type || 'Fee'} - ₹{(f.amount || 0).toLocaleString()}</option>
              ))}
              {totalDue > 0 && <option>Pay All Pending - ₹{totalDue.toLocaleString()}</option>}
            </select>

            {/* Payment Methods */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-[#64748B] mb-3">Choose Payment Method</p>
              <div className="grid grid-cols-2 gap-3">
                {/* Razorpay */}
                <button className="p-3 border-2 border-[#3B82F6] rounded-lg hover:bg-[#EFF6FF] transition-all flex flex-col items-center gap-2 group">
                  <div className="w-10 h-10 bg-[#3B82F6] rounded-lg flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                      <path d="M22.436 0H1.564C.7 0 0 .7 0 1.564v20.872C0 23.3.7 24 1.564 24h20.872c.864 0 1.564-.7 1.564-1.564V1.564C24 .7 23.3 0 22.436 0zM7.543 15.957l-2.4-1.3 6.5-11.357 2.4 1.3-6.5 11.357zm8.314 4.5l-2.4-1.3 2.7-4.7 2.4 1.3-2.7 4.7zm1.5-6.2l-2.4-1.3 1.3-2.3 2.4 1.3-1.3 2.3z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-[#3B82F6]">Razorpay</span>
                </button>

                {/* UPI */}
                <button className="p-3 border-2 border-[#10B981] rounded-lg hover:bg-[#ECFDF5] transition-all flex flex-col items-center gap-2 group">
                  <div className="w-10 h-10 bg-[#10B981] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">UPI</span>
                  </div>
                  <span className="text-sm font-semibold text-[#10B981]">UPI Payment</span>
                </button>

                {/* Card */}
                <button className="p-3 border-2 border-[#7C3AED] rounded-lg hover:bg-[#F5F3FF] transition-all flex flex-col items-center gap-2 group">
                  <div className="w-10 h-10 bg-[#7C3AED] rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-[#7C3AED]">Debit/Credit Card</span>
                </button>

                {/* QR Scanner */}
                <button className="p-3 border-2 border-[#F59E0B] rounded-lg hover:bg-[#FFFBEB] transition-all flex flex-col items-center gap-2 group">
                  <div className="w-10 h-10 bg-[#F59E0B] rounded-lg flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                      <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2zM17 17h2v2h-2zM15 19h2v2h-2zM19 19h2v2h-2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-[#F59E0B]">Scan QR Code</span>
                </button>
              </div>
            </div>

            <button className="w-full bg-[#4F46E5] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#4338CA] transition-colors">
              <CreditCard size={18} /> Proceed to Pay
            </button>

            {/* Payment Info */}
            <div className="mt-4 p-3 bg-[#F1F5F9] rounded-lg">
              <p className="text-xs text-[#64748B] text-center">
                Secure payment powered by Razorpay. All transactions are encrypted.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Receipt className="text-[#10B981]" size={20} />
              Receipts & Invoices
            </h3>
            <div className="space-y-3">
              {fees.filter(f => f.status === 'paid').length > 0 ? fees.filter(f => f.status === 'paid').map((receipt, idx) => (
                <div key={idx} className="p-3 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm">{receipt.feeType || receipt.type || 'Fee'}</p>
                    <p className="text-xs text-[#64748B]">{receipt.paidDate ? formatDate(receipt.paidDate) : formatDate(receipt.dueDate)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#10B981]">₹{(receipt.amount || 0).toLocaleString()}</span>
                    <button className="text-[#4F46E5]"><Download size={18} /></button>
                  </div>
                </div>
              )) : (
                <p className="text-center text-[#64748B] py-4">No paid receipts yet.</p>
              )}
            </div>

            {/* QR Code for Payment */}
            <div className="mt-6 p-4 border-2 border-dashed border-[#FCD34D] rounded-lg text-center">
              <h4 className="font-semibold mb-3">Scan to Pay via UPI</h4>
              <div className="w-32 h-32 mx-auto bg-white border-2 border-[#E2E8F0] rounded-lg flex items-center justify-center mb-2">
                <svg viewBox="0 0 24 24" className="w-20 h-20 fill-[#0F172A]">
                  <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2zM17 17h2v2h-2zM15 19h2v2h-2zM19 19h2v2h-2z" />
                </svg>
              </div>
              <p className="text-xs text-[#64748B]">ajmschool@upi</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 7. Behavior & Discipline
  const renderBehavior = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Behavior & Discipline</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981]">
          <Star className="text-[#10B981] mb-2" size={32} />
          <p className="text-sm text-[#64748B]">Behavior Rating</p>
          <p className="text-2xl font-bold text-[#065F46]">Excellent</p>
        </div>
        <div className="p-6 bg-[#DBEAFE] rounded-xl border-2 border-[#3B82F6]">
          <Award className="text-[#3B82F6] mb-2" size={32} />
          <p className="text-sm text-[#64748B]">Positive Remarks</p>
          <p className="text-2xl font-bold text-[#1E40AF]">12</p>
        </div>
        <div className="p-6 bg-[#FEF3C7] rounded-xl border-2 border-[#F59E0B]">
          <AlertCircle className="text-[#F59E0B] mb-2" size={32} />
          <p className="text-sm text-[#64748B]">Areas for Improvement</p>
          <p className="text-2xl font-bold text-[#92400E]">2</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Star className="text-[#10B981]" size={20} />
          Teacher Remarks
        </h3>
        <div className="space-y-4">
          {[
            { teacher: 'Mr. Sharma (Mathematics)', remark: 'Shows excellent problem-solving skills. Always completes homework on time.', date: 'Dec 20, 2024', type: 'positive' },
            { teacher: 'Ms. Verma (English)', remark: 'Active participation in class discussions. Great improvement in writing skills.', date: 'Dec 18, 2024', type: 'positive' },
            { teacher: 'Mrs. Gupta (Science)', remark: 'Good in practical work. Needs to focus more on theory part.', date: 'Dec 15, 2024', type: 'neutral' },
            { teacher: 'Mrs. Sunita (Class Teacher)', remark: 'Helpful to classmates. Takes leadership in group activities.', date: 'Dec 10, 2024', type: 'positive' },
          ].map((item, idx) => (
            <div key={idx} className={`p-4 rounded-lg border-l-4 ${item.type === 'positive' ? 'bg-[#F0FDF4] border-[#10B981]' : 'bg-[#FEF3C7] border-[#F59E0B]'
              }`}>
              <div className="flex justify-between items-start">
                <p className="font-semibold">{item.teacher}</p>
                <span className="text-xs text-[#64748B]">{item.date}</span>
              </div>
              <p className="text-sm text-[#64748B] mt-2">"{item.remark}"</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Behavior Reports</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-linear-to-r from-[#D1FAE5] to-[#DBEAFE]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Category</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Rating</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Teacher Comment</th>
              </tr>
            </thead>
            <tbody>
              {[
                { category: 'Punctuality', rating: 'Excellent', comment: 'Always on time' },
                { category: 'Class Participation', rating: 'Very Good', comment: 'Actively participates in discussions' },
                { category: 'Homework Completion', rating: 'Excellent', comment: 'Consistently completes all assignments' },
                { category: 'Respect for Others', rating: 'Excellent', comment: 'Very respectful to teachers and peers' },
                { category: 'Teamwork', rating: 'Very Good', comment: 'Good team player, helps classmates' },
              ].map((item, idx) => (
                <tr key={idx} className="border-b border-[#E2E8F0]">
                  <td className="px-4 py-3 text-sm font-semibold">{item.category}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.rating === 'Excellent' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#DBEAFE] text-[#1E40AF]'
                      }`}>{item.rating}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{item.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#10B981] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Shield className="text-[#10B981]" size={20} />
          Discipline Notices
        </h3>
        <div className="p-4 bg-[#D1FAE5] rounded-lg text-center">
          <CheckCircle className="text-[#10B981] mx-auto mb-2" size={32} />
          <p className="font-semibold text-[#065F46]">No Discipline Issues</p>
          <p className="text-sm text-[#64748B]">Your child has maintained excellent discipline throughout the year.</p>
        </div>
      </div>
    </div>
  );

  // 8. School Events & Activities
  const renderEvents = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">School Events & Activities</h2>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <CalendarDays className="text-[#4F46E5]" size={20} />
          School Calendar - December 2024
        </h3>
        <div className="grid grid-cols-7 gap-2 text-center text-sm">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="font-semibold text-[#64748B] py-2">{day}</div>
          ))}
          {[...Array(31)].map((_, i) => {
            const isHoliday = i === 24 || i === 25;
            const isExam = i >= 25 && i <= 30;
            const isEvent = i === 14;
            return (
              <div key={i} className={`p-2 rounded ${isHoliday ? 'bg-[#D1FAE5] text-[#065F46]' :
                isExam ? 'bg-[#FEE2E2] text-[#991B1B]' :
                  isEvent ? 'bg-[#EDE9FE] text-[#7C3AED]' :
                    'bg-[#F8FAFC]'
                }`}>
                {i + 1}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-2"><span className="w-4 h-4 bg-[#D1FAE5] rounded"></span> Holiday</span>
          <span className="flex items-center gap-2"><span className="w-4 h-4 bg-[#FEE2E2] rounded"></span> Exam</span>
          <span className="flex items-center gap-2"><span className="w-4 h-4 bg-[#EDE9FE] rounded"></span> Event</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {[
              { name: 'Mid-Term Examinations', date: 'Dec 26-31', type: 'Exam' },
              { name: 'Annual Day Celebration', date: 'Jan 15, 2025', type: 'Cultural' },
              { name: 'Science Exhibition', date: 'Jan 20, 2025', type: 'Academic' },
              { name: 'Sports Day', date: 'Feb 5, 2025', type: 'Sports' },
            ].map((event, idx) => (
              <div key={idx} className="p-3 border-l-4 border-[#4F46E5] bg-[#F8FAFC] rounded-r-lg">
                <p className="font-semibold">{event.name}</p>
                <p className="text-xs text-[#64748B]">{event.date} • {event.type}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Holidays</h3>
          <div className="space-y-3">
            {[
              { name: 'Christmas', date: 'Dec 25', type: 'Public Holiday' },
              { name: 'New Year', date: 'Jan 1', type: 'Public Holiday' },
              { name: 'Makar Sankranti', date: 'Jan 14', type: 'Regional Holiday' },
              { name: 'Republic Day', date: 'Jan 26', type: 'National Holiday' },
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
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Co-curricular Activities & Student Participation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Science Club', role: 'Member', schedule: 'Every Saturday', status: 'Active' },
            { name: 'Debate Team', role: 'Team Member', schedule: 'Tue & Thu', status: 'Active' },
            { name: 'Cricket Team', role: 'Batsman', schedule: 'Mon & Fri', status: 'Active' },
          ].map((activity, idx) => (
            <div key={idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg">
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
    </div>
  );

  // 9. Requests & Approvals
  const renderRequests = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Requests & Approvals</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Leave Request for Child</h3>
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
          <h3 className="font-bold mb-4">Certificate Requests</h3>
          <div className="space-y-3">
            <select className="w-full border-2 border-[#FCD34D] rounded-lg px-4 py-2">
              <option>Select Certificate Type</option>
              <option>Bonafide Certificate</option>
              <option>Character Certificate</option>
              <option>Study Certificate</option>
              <option>Transfer Certificate</option>
            </select>
            <div>
              <label className="block text-sm font-medium mb-1">Purpose</label>
              <input type="text" className="w-full border-2 border-[#FCD34D] rounded-lg px-3 py-2" placeholder="e.g., Scholarship application" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Required By</label>
              <input type="date" className="w-full border-2 border-[#FCD34D] rounded-lg px-3 py-2" />
            </div>
            <button className="w-full bg-[#10B981] text-white py-2 rounded-lg font-semibold">Request Certificate</button>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Transport / Facility Requests</h3>
          <div className="space-y-3">
            <select className="w-full border-2 border-[#FCD34D] rounded-lg px-4 py-2">
              <option>Select Request Type</option>
              <option>Change Bus Route</option>
              <option>Add Transport Service</option>
              <option>Cancel Transport Service</option>
              <option>Facility Request</option>
            </select>
            <div>
              <label className="block text-sm font-medium mb-1">Details</label>
              <textarea className="w-full border-2 border-[#FCD34D] rounded-lg px-3 py-2 h-20" placeholder="Provide details..."></textarea>
            </div>
            <button className="w-full bg-[#F59E0B] text-white py-2 rounded-lg font-semibold">Submit Request</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Request History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-linear-to-r from-[#FEF3C7] to-[#FEE2E2]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Request ID</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Type</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Submitted</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Status</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'REQ-2024-025', type: 'Leave Request', date: 'Dec 20', status: 'Approved' },
                { id: 'REQ-2024-024', type: 'Bonafide Certificate', date: 'Dec 15', status: 'Ready' },
                { id: 'REQ-2024-023', type: 'Bus Route Change', date: 'Dec 10', status: 'Processing' },
              ].map((req, idx) => (
                <tr key={idx} className="border-b border-[#E2E8F0]">
                  <td className="px-4 py-3 text-sm font-semibold">{req.id}</td>
                  <td className="px-4 py-3 text-sm">{req.type}</td>
                  <td className="px-4 py-3 text-sm">{req.date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${req.status === 'Approved' ? 'bg-[#D1FAE5] text-[#065F46]' :
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

  // 10. Transport
  const renderTransport = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Transport</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-[#DBEAFE] rounded-xl border-2 border-[#3B82F6]">
          <Bus className="text-[#3B82F6] mb-2" size={32} />
          <p className="text-sm text-[#64748B]">Bus Number</p>
          <p className="text-2xl font-bold text-[#1E40AF]">DL-01-AB-1234</p>
        </div>
        <div className="p-6 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981]">
          <MapPin className="text-[#10B981] mb-2" size={32} />
          <p className="text-sm text-[#64748B]">Route Number</p>
          <p className="text-2xl font-bold text-[#065F46]">Route 5</p>
        </div>
        <div className="p-6 bg-[#FEF3C7] rounded-xl border-2 border-[#F59E0B]">
          <Clock className="text-[#F59E0B] mb-2" size={32} />
          <p className="text-sm text-[#64748B]">Pickup Time</p>
          <p className="text-2xl font-bold text-[#92400E]">7:30 AM</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Bus Route & Timings</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-linear-to-r from-[#DBEAFE] to-[#D1FAE5]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Stop</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Location</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Morning Pickup</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Evening Drop</th>
              </tr>
            </thead>
            <tbody>
              {[
                { stop: 1, location: 'Green Park Metro', morning: '7:15 AM', evening: '3:45 PM' },
                { stop: 2, location: 'Hauz Khas Market', morning: '7:25 AM', evening: '3:55 PM' },
                { stop: 3, location: 'Safdarjung Enclave (Your Stop)', morning: '7:30 AM', evening: '4:00 PM', highlight: true },
                { stop: 4, location: 'AIIMS Gate', morning: '7:40 AM', evening: '4:10 PM' },
                { stop: 5, location: 'School', morning: '8:00 AM', evening: '3:30 PM' },
              ].map((item, idx) => (
                <tr key={idx} className={`border-b border-[#E2E8F0] ${item.highlight ? 'bg-[#FEF3C7]' : ''}`}>
                  <td className="px-4 py-3 text-sm font-semibold">{item.stop}</td>
                  <td className="px-4 py-3 text-sm">{item.location}</td>
                  <td className="px-4 py-3 text-sm">{item.morning}</td>
                  <td className="px-4 py-3 text-sm">{item.evening}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <User className="text-[#4F46E5]" size={20} />
            Driver Contact (School-Approved)
          </h3>
          <div className="p-4 bg-[#F8FAFC] rounded-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-[#4F46E5] rounded-full flex items-center justify-center text-white text-xl font-bold">RS</div>
              <div>
                <p className="font-bold">Mr. Ramesh Singh</p>
                <p className="text-sm text-[#64748B]">Driver - Route 5</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="text-[#64748B]" size={16} />
                <span className="text-sm">+91 98765 43210</span>
              </div>
              <p className="text-xs text-[#64748B]">Contact only for transport emergencies</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-[#F8FAFC] rounded-lg">
            <p className="font-semibold">Conductor: Mr. Suresh</p>
            <div className="flex items-center gap-2 mt-1">
              <Phone className="text-[#64748B]" size={16} />
              <span className="text-sm">+91 98765 43211</span>
            </div>
          </div>
        </div>


      </div>
    </div>
  );

  // 11. Health & Safety
  const renderHealth = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Health & Safety</h2>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Heart className="text-[#DC2626]" size={20} />
          Medical Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-[#FEE2E2] rounded-lg">
            <p className="text-sm text-[#64748B]">Blood Group</p>
            <p className="font-bold text-[#991B1B]">{selectedChild?.bloodGroup || 'O+'}</p>
          </div>
          <div className="p-4 bg-[#D1FAE5] rounded-lg">
            <p className="text-sm text-[#64748B]">Height</p>
            <p className="font-bold text-[#065F46]">152 cm</p>
          </div>
          <div className="p-4 bg-[#DBEAFE] rounded-lg">
            <p className="text-sm text-[#64748B]">Weight</p>
            <p className="font-bold text-[#1E40AF]">45 kg</p>
          </div>
          <div className="p-4 bg-[#FEF3C7] rounded-lg">
            <p className="text-sm text-[#64748B]">Vision</p>
            <p className="font-bold text-[#92400E]">Normal</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-4 border-2 border-[#E2E8F0] rounded-lg">
            <h4 className="font-semibold mb-2">Known Allergies</h4>
            <p className="text-sm text-[#64748B]">No known allergies</p>
          </div>
          <div className="p-4 border-2 border-[#E2E8F0] rounded-lg">
            <h4 className="font-semibold mb-2">Medical Conditions</h4>
            <p className="text-sm text-[#64748B]">None reported</p>
          </div>
          <div className="p-4 border-2 border-[#E2E8F0] rounded-lg">
            <h4 className="font-semibold mb-2">Regular Medications</h4>
            <p className="text-sm text-[#64748B]">None</p>
          </div>
        </div>
        <button className="mt-4 bg-[#4F46E5] text-white px-4 py-2 rounded-lg font-semibold text-sm">Update Medical Information</button>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#DC2626] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Phone className="text-[#DC2626]" size={20} />
          Emergency Contacts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#FEE2E2] rounded-lg">
            <p className="font-semibold">Primary Contact</p>
            <p className="text-sm">{user?.full_name || 'Parent User'} (Father)</p>
            <p className="text-sm text-[#64748B]">+91 9876543210</p>
          </div>
          <div className="p-4 bg-[#FEF3C7] rounded-lg">
            <p className="font-semibold">Secondary Contact</p>
            <p className="text-sm">Mrs. Kumar (Mother)</p>
            <p className="text-sm text-[#64748B]">+91 9876543211</p>
          </div>
          <div className="p-4 bg-[#DBEAFE] rounded-lg">
            <p className="font-semibold">Emergency Contact</p>
            <p className="text-sm">Mr. Sharma (Uncle)</p>
            <p className="text-sm text-[#64748B]">+91 9876543212</p>
          </div>
          <div className="p-4 bg-[#D1FAE5] rounded-lg">
            <p className="font-semibold">Family Doctor</p>
            <p className="text-sm">Dr. Rajesh Gupta</p>
            <p className="text-sm text-[#64748B]">+91 9876543213</p>
          </div>
        </div>
        <button className="mt-4 border-2 border-[#DC2626] text-[#DC2626] px-4 py-2 rounded-lg font-semibold text-sm">Update Emergency Contacts</button>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <AlertCircle className="text-[#F59E0B]" size={20} />
          Health Alerts
        </h3>
        <div className="space-y-3">
          <div className="p-4 bg-[#D1FAE5] rounded-lg border-l-4 border-[#10B981]">
            <p className="font-semibold text-[#065F46]">Health Checkup Completed</p>
            <p className="text-sm text-[#64748B]">Annual health checkup completed on Nov 15, 2024. All reports normal.</p>
          </div>
          <div className="p-4 bg-[#DBEAFE] rounded-lg border-l-4 border-[#3B82F6]">
            <p className="font-semibold text-[#1E40AF]">Vaccination Reminder</p>
            <p className="text-sm text-[#64748B]">Next vaccination due: Booster dose (Feb 2025)</p>
          </div>
        </div>
      </div>
    </div>
  );

  // 12. Settings & Support
  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Settings & Support</h2>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">


        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Settings className="text-[#64748B]" size={20} />
            Account Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input type="email" defaultValue={user?.email || 'parent@email.com'} className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input type="tel" defaultValue="+91 9876543210" className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2" />
            </div>
            <button className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg font-semibold text-sm">Update Settings</button>
            <button className="w-full border-2 border-[#DC2626] text-[#DC2626] px-4 py-2 rounded-lg font-semibold text-sm">Change Password</button>
          </div>
        </div>
      </div>






    </div>
  );

  const modules = [
    { id: 'profile', name: 'Profile', render: renderProfile },
    { id: 'overview', name: 'Student Overview', render: renderOverview },
    { id: 'attendance', name: 'Attendance', render: renderAttendance },
    { id: 'academic', name: 'Academic Progress', render: renderAcademic },
    { id: 'communication', name: 'Communication', render: renderCommunication },
    { id: 'fees', name: 'Fees', render: renderFees },
    { id: 'behavior', name: 'Behavior', render: renderBehavior },
    { id: 'events', name: 'Events', render: renderEvents },
    { id: 'requests', name: 'Requests', render: renderRequests },
    { id: 'transport', name: 'Transport', render: renderTransport },
    { id: 'health', name: 'Health', render: renderHealth },
    { id: 'settings', name: 'Settings', render: renderSettings },
  ];

  const currentModule = modules.find(m => m.id === module) || modules[0];

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-[#D1FAE5] to-[#DBEAFE] rounded-2xl p-6 border-2 border-[#10B981]">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] mb-1">Welcome, {user?.full_name}!</h1>
        <p className="text-base text-[#64748B]">Parent Portal - AJM International Institution</p>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5]"></div>
        </div>
      )}

      <div>
        {currentModule.render()}
      </div>

      {/* Deny Leave Modal */}
      {isDenyModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b-2 border-[#FEF3C7] flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
                <XCircle className="text-[#DC2626]" size={24} />
                Reason for Denial
              </h3>
              <button onClick={() => setIsDenyModalOpen(false)} className="text-[#94A3B8] hover:text-[#0F172A] transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-[#64748B]">Please provide a reason for denying this leave request. This will be visible to the student.</p>
              <textarea
                required
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                className="w-full px-3 py-2 border-2 border-[#E2E8F0] rounded-xl focus:border-[#4F46E5] focus:outline-hidden transition-colors h-32"
                placeholder="Reason for denial..."
              ></textarea>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDenyModalOpen(false)}
                  className="flex-1 px-4 py-2 border-2 border-[#E2E8F0] text-[#64748B] font-bold rounded-xl hover:bg-[#F8FAFC] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleLeaveAction(selectedLeaveId, 'deny', denyReason)}
                  disabled={actionLoading || !denyReason.trim()}
                  className="flex-1 px-4 py-2 bg-[#DC2626] text-white font-bold rounded-xl hover:bg-[#B91C1C] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
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
    </div>
  );
};

export default ParentDashboard;
