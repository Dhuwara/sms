import React, { useState } from 'react';
import { Calendar, Briefcase, ClipboardCheck, Check, X, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/utils/api';

const Timetable = ({
  myTimetable,
  staffData,
  substitutions,
  examDuties,
  schoolEvents,
  formatDate,
  onSubstitutionUpdate,
}) => {
  const [respondingId, setRespondingId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleAccept = async (subId) => {
    setRespondingId(subId);
    try {
      const res = await api.put(`/api/substitutions/${subId}/respond`, { status: 'accepted' });
      toast.success('Substitution accepted');
      if (onSubstitutionUpdate) onSubstitutionUpdate(subId, res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept');
    } finally {
      setRespondingId(null);
    }
  };

  const handleReject = async () => {
    if (!showRejectModal) return;
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setRespondingId(showRejectModal);
    try {
      const res = await api.put(`/api/substitutions/${showRejectModal}/respond`, {
        status: 'rejected',
        responseReason: rejectReason.trim(),
      });
      toast.success('Substitution rejected');
      if (onSubstitutionUpdate) onSubstitutionUpdate(showRejectModal, res.data);
      setShowRejectModal(null);
      setRejectReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setRespondingId(null);
    }
  };

  const statusColors = {
    pending: { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', border: 'border-[#FCD34D]' },
    accepted: { bg: 'bg-[#D1FAE5]', text: 'text-[#065F46]', border: 'border-[#10B981]' },
    rejected: { bg: 'bg-[#FEE2E2]', text: 'text-[#991B1B]', border: 'border-[#EF4444]' },
  };

  return (
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
                        const isMyPeriod = entry?.teacher?.toString() === staffData?._id?.toString();
                        return (
                          <td key={idx} className="px-4 py-3 text-sm">
                            {isMyPeriod ? (entry?.subject || '-') : '-'}
                          </td>
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
            {substitutions && substitutions.length > 0 ? substitutions.map((sub) => {
              const colors = statusColors[sub.status] || statusColors.pending;
              const isPending = sub.status === 'pending';
              const isResponding = respondingId === sub._id;
              return (
                <div key={sub._id} className={`p-3 rounded-lg border-2 ${colors.border} ${colors.bg}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-[#0F172A]">
                        {new Date(sub.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} — {sub.periodName || `Period ${sub.periodIndex + 1}`}
                      </p>
                      <p className="text-sm text-[#64748B]">{sub.classId?.name} {sub.classId?.section}</p>
                      {sub.subject && <p className="text-sm text-[#64748B]">Subject: {sub.subject}</p>}
                      {sub.reason && <p className="text-xs text-[#64748B]">Reason: {sub.reason}</p>}
                      <p className="text-xs text-[#64748B] mt-1">
                        Replacing: {sub.originalTeacherId?.userId?.name || '—'}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${colors.text} ${colors.bg}`}>
                      {sub.status}
                    </span>
                  </div>

                  {/* Accept / Reject buttons for pending substitutions */}
                  {isPending && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-[#E2E8F0]">
                      <button
                        onClick={() => handleAccept(sub._id)}
                        disabled={isResponding}
                        className="flex-1 flex items-center justify-center gap-1 h-9 bg-[#10B981] text-white rounded-lg text-sm font-semibold hover:bg-[#059669] transition-colors disabled:opacity-50"
                      >
                        {isResponding ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check size={16} />
                        )}
                        Accept
                      </button>
                      <button
                        onClick={() => { setShowRejectModal(sub._id); setRejectReason(''); }}
                        disabled={isResponding}
                        className="flex-1 flex items-center justify-center gap-1 h-9 bg-[#EF4444] text-white rounded-lg text-sm font-semibold hover:bg-[#DC2626] transition-colors disabled:opacity-50"
                      >
                        <X size={16} />
                        Reject
                      </button>
                    </div>
                  )}

                  {/* Show response reason for already responded */}
                  {sub.status === 'rejected' && sub.responseReason && (
                    <div className="mt-2 pt-2 border-t border-[#E2E8F0] flex items-start gap-1">
                      <MessageSquare size={14} className="text-[#991B1B] mt-0.5 shrink-0" />
                      <p className="text-xs text-[#991B1B]">Rejection reason: {sub.responseReason}</p>
                    </div>
                  )}
                </div>
              );
            }) : (
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
      {/* Holiday Calendar + School Events — from admin-created calendar events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Calendar className="text-[#F59E0B]" size={20} />
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
            <Briefcase className="text-[#4F46E5]" size={20} />
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

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-[#0F172A] mb-3">Reject Substitution</h3>
            <p className="text-sm text-[#64748B] mb-3">Please provide a reason for rejecting this substitution.</p>
            <textarea
              rows={3}
              autoFocus
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF4444] text-sm"
              placeholder="e.g. Already have a class at that time, personal commitment..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowRejectModal(null); setRejectReason(''); }}
                className="flex-1 h-10 border border-slate-200 rounded-lg font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={respondingId === showRejectModal}
                className="flex-1 h-10 bg-[#EF4444] text-white rounded-lg font-semibold text-sm hover:bg-[#DC2626] disabled:opacity-50"
              >
                {respondingId === showRejectModal ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
