import React from 'react';
import { Calendar, CheckCircle, XCircle, Clock, CalendarDays, AlertCircle } from 'lucide-react';

const Attendance = ({ selectedChild, childAttendance, pendingLeaves, handleLeaveAction, setIsDenyModalOpen, setSelectedLeaveId, actionLoading, loading, childSelector, formatDate }) => {
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

export default Attendance;
