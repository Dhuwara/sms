import React, { useState, useEffect } from 'react';
import { XCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/utils/api';
import Profile from './pages/Profile';
import Overview from './pages/Overview';
import Attendance from './pages/Attendance';
import Academic from './pages/Academic';
import Communication from './pages/Communication';
import Fees from './pages/Fees';
import Behavior from './pages/Behavior';
import Events from './pages/Events';
import Requests from './pages/Requests';
import Transport from './pages/Transport';
import Health from './pages/Health';
import Settings from './pages/Settings';
import Activities from './pages/Activities';

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
  const [childExams, setChildExams] = useState([]);
  const [ptmSchedules, setPtmSchedules] = useState([]);
  const [overviewStats, setOverviewStats] = useState({ attendancePct: null, overallGrade: null });
  const [sendMsgForm, setSendMsgForm] = useState({ subject: '', body: '' });
  const [sendMsgLoading, setSendMsgLoading] = useState(false);
  const [childScholarships, setChildScholarships] = useState([]);
  const [childAwards, setChildAwards] = useState([]);

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
        if (module === 'overview') {
          try {
            const [attRes, gradesRes] = await Promise.all([
              api.get(`/api/parent/children/${selectedChild._id}/attendance`),
              api.get(`/api/parent/children/${selectedChild._id}/grades`),
            ]);
            const att = attRes.data?.summary || {};
            const total = att.total || 0;
            const present = att.present || 0;
            const pct = total > 0 ? ((present / total) * 100).toFixed(1) : null;
            const grades = gradesRes.data || [];
            const lastGrade = grades.length > 0 ? grades[grades.length - 1].grade : null;
            setOverviewStats({ attendancePct: pct, overallGrade: lastGrade });
          } catch { /* ignore */ }
        }
        if (module === 'academic') {
          const rawClassId = selectedChild.classId?._id ?? selectedChild.classId;
          const [gradesRes, examsRes] = await Promise.all([
            api.get(`/api/parent/children/${selectedChild._id}/grades`),
            rawClassId ? api.get(`/api/exams?classId=${rawClassId}`) : Promise.resolve({ data: [] }),
          ]);
          setChildGrades(gradesRes.data || []);
          setChildExams(examsRes.data?.data || examsRes.data || []);
        }
        if (module === 'fees') {
          const res = await api.get(`/api/parent/children/${selectedChild._id}/fees`);
          setChildFees(res.data);
        }
        if (module === 'communication') {
          try {
            const [eventsRes, ptmRes] = await Promise.all([
              api.get('/api/school-events/user-events'),
              api.get('/api/ptm/parent'),
            ]);
            setSchoolEvents(eventsRes?.data || []);
            setPtmSchedules(ptmRes.data?.data || ptmRes.data || []);
          } catch { /* optional */ }
        }
        if (module === 'activities') {
          try {
            const [schRes, awardRes] = await Promise.all([
              api.get(`/api/scholarships/child/${selectedChild._id}`),
              api.get(`/api/awards/child/${selectedChild._id}`),
            ]);
            setChildScholarships(schRes.data?.data || schRes.data || []);
            setChildAwards(awardRes.data?.data || awardRes.data || []);
          } catch { /* optional */ }
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

  const handleSendMessageToSchool = async (e) => {
    e.preventDefault();
    if (!sendMsgForm.subject.trim() || !sendMsgForm.body.trim()) {
      toast.error('Please fill in subject and message');
      return;
    }
    setSendMsgLoading(true);
    try {
      const res = await api.post('/api/communication/send-email', {
        recipientType: 'admin',
        subject: sendMsgForm.subject,
        body: sendMsgForm.body,
      });
      toast.success(res.data?.message || 'Message sent to school!');
      setSendMsgForm({ subject: '', body: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSendMsgLoading(false);
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

  const renderModule = () => {
    switch (module) {
      case 'profile': return <Profile user={user} childrenList={children} selectedChild={selectedChild} childSelector={childSelector} />;
      case 'overview': return <Overview selectedChild={selectedChild} overviewStats={overviewStats} childSelector={childSelector} formatDate={formatDate} />;
      case 'attendance': return <Attendance selectedChild={selectedChild} childAttendance={childAttendance} pendingLeaves={pendingLeaves} handleLeaveAction={handleLeaveAction} setIsDenyModalOpen={setIsDenyModalOpen} setSelectedLeaveId={setSelectedLeaveId} actionLoading={actionLoading} loading={loading} childSelector={childSelector} formatDate={formatDate} />;
      case 'academic': return <Academic selectedChild={selectedChild} childGrades={childGrades} childExams={childExams} childSelector={childSelector} formatDate={formatDate} getGradeBadge={getGradeBadge} />;
      case 'communication': return <Communication schoolEvents={schoolEvents} ptmSchedules={ptmSchedules} sendMsgForm={sendMsgForm} setSendMsgForm={setSendMsgForm} sendMsgLoading={sendMsgLoading} handleSendMessage={handleSendMessageToSchool} formatDate={formatDate} />;
      case 'fees': return <Fees selectedChild={selectedChild} childFees={childFees} childSelector={childSelector} formatDate={formatDate} />;
      case 'behavior': return <Behavior selectedChild={selectedChild} childSelector={childSelector} />;
      case 'events': return <Events formatDate={formatDate} />;
      case 'requests': return <Requests />;
      case 'transport': return <Transport selectedChild={selectedChild} childSelector={childSelector} />;
      case 'health': return <Health selectedChild={selectedChild} user={user} childSelector={childSelector} />;
      case 'activities': return <Activities scholarships={childScholarships} awards={childAwards} selectedChild={selectedChild} childSelector={childSelector} />;
      case 'settings': return <Settings user={user} />;
      default: return <Profile user={user} childrenList={children} selectedChild={selectedChild} childSelector={childSelector} />;
    }
  };

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
        {renderModule()}
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
