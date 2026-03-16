import React from 'react';
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const Attendance = ({ attendanceData, studentLeaves, setIsLeaveModalOpen, formatDate }) => {
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

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">My Leave Requests</h3>
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#4338CA] transition-colors"
            >
              Apply for Leave
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FFFBEB]">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-[#92400E]">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-[#92400E]">Dates</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-[#92400E]">Parent Approval</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-[#92400E]">Staff Approval</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-[#92400E]">Overall Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FEF3C7]">
                {studentLeaves.map((leave) => (
                  <tr key={leave._id}>
                    <td className="px-4 py-3 text-sm font-medium capitalize">{leave.leaveType}</td>
                    <td className="px-4 py-3 text-xs text-[#64748B]">
                      {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${leave.parentApproval.status === 'approved' ? 'bg-[#D1FAE5] text-[#065F46]' :
                        leave.parentApproval.status === 'denied' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                          'bg-[#F3F4F6] text-[#64748B]'
                        }`}>
                        {leave.parentApproval.status}
                      </span>
                      {leave.parentApproval.reason && (
                        <p className="text-[10px] text-[#991B1B] mt-0.5 italic">" {leave.parentApproval.reason} "</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${leave.staffApproval.status === 'approved' ? 'bg-[#D1FAE5] text-[#065F46]' :
                        leave.staffApproval.status === 'denied' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                          'bg-[#F3F4F6] text-[#64748B]'
                        }`}>
                        {leave.staffApproval.status}
                      </span>
                      {leave.staffApproval.reason && (
                        <p className="text-[10px] text-[#991B1B] mt-0.5 italic">" {leave.staffApproval.reason} "</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${leave.status === 'approved' ? 'bg-[#D1FAE5] text-[#065F46]' :
                        leave.status === 'denied' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                          'bg-[#FEF3C7] text-[#92400E]'
                        }`}>
                        {leave.status.replace('_', ' ').charAt(0).toUpperCase() + leave.status.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
                {studentLeaves.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#64748B]">
                      No leave requests submitted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
  );
};

export default Attendance;
