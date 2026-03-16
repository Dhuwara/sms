import React from 'react';
import { Clock, Calendar, CheckCircle, XCircle, ClipboardCheck, GraduationCap } from 'lucide-react';

const Attendance = ({
  todayAttendance,
  handleCheckIn,
  handleCheckOut,
  leaveBalance,
  openLeaveModal,
  myLeaves,
  attendanceHistory,
  showLeaveModal,
  setShowLeaveModal,
  leaveForm,
  setLeaveForm,
  staffList,
  handleApplyLeave,
  leaveSubmitting,
  pendingApprovals,
  handleApproveReject,
  pendingStudentLeaves,
  handleStudentLeaveAction,
  studentActionLoading,
  setSelectedStudentLeaveId,
  setIsStudentDenyModalOpen,
  formatTime,
  formatDate,
  formatWorkingHours,
}) => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">
        Attendance Management
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Clock className="text-[#F59E0B]" size={20} />
            Today's Attendance
          </h3>
          <div className="text-center py-4 mb-4 bg-[#FEF3C7] rounded-lg">
            <p className="text-sm text-[#64748B]">Date</p>
            <p className="text-xl font-bold">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {todayAttendance?.checkIn && (
            <div className="mb-4 p-4 bg-[#DBEAFE] rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-[#1E40AF]">
                  Check In Time
                </span>
                <span className="text-lg font-bold text-[#1E40AF]">
                  {formatTime(todayAttendance.checkIn)}
                </span>
              </div>
              {todayAttendance?.checkOut && (
                <>
                  <div className="flex justify-between items-center mb-2 pt-2 border-t border-[#BFDBFE]">
                    <span className="text-sm font-medium text-[#1E40AF]">
                      Check Out Time
                    </span>
                    <span className="text-lg font-bold text-[#1E40AF]">
                      {formatTime(todayAttendance.checkOut)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#BFDBFE]">
                    <span className="text-sm font-medium text-[#059669]">
                      Total Hours Worked
                    </span>
                    <span className="text-lg font-bold text-[#059669]">
                      {formatWorkingHours(todayAttendance.workingHours)}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleCheckIn}
              disabled={!!todayAttendance?.checkIn}
              className="w-full bg-[#10B981] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#059669] transition-colors disabled:bg-[#6B7280] disabled:cursor-not-allowed"
            >
              <CheckCircle size={20} />{" "}
              {todayAttendance?.checkIn ? "Checked In \u2713" : "Check In"}
            </button>
            <button
              onClick={handleCheckOut}
              disabled={
                !todayAttendance?.checkIn || !!todayAttendance?.checkOut
              }
              className="w-full bg-[#DC2626] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#B91C1C] transition-colors disabled:bg-[#6B7280] disabled:cursor-not-allowed"
            >
              <XCircle size={20} />{" "}
              {todayAttendance?.checkOut ? "Checked Out \u2713" : "Check Out"}
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
              <span className="font-bold text-[#10B981]">
                {leaveBalance.casual.remaining} / {leaveBalance.casual.total}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#FEE2E2] rounded-lg">
              <span className="font-medium">Sick Leave</span>
              <span className="font-bold text-[#10B981]">
                {leaveBalance.sick.remaining} / {leaveBalance.sick.total}
              </span>
            </div>
            <button
              onClick={openLeaveModal}
              className="w-full bg-[#F59E0B] text-white py-3 rounded-lg font-semibold mt-2 hover:bg-[#D97706] transition-colors"
            >
              Apply for Leave
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Leave Application Status</h3>
        <div className="space-y-3">
          {myLeaves.length > 0 ? (
            myLeaves.map((leave, idx) => (
              <div
                key={idx}
                className="p-4 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center"
              >
                <div className="flex-1">
                  <p className="font-semibold">
                    {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                  </p>
                  <p className="text-sm text-[#64748B]">
                    {leave.leaveType.charAt(0).toUpperCase() +
                      leave.leaveType.slice(1)}{" "}
                    Leave - {leave.reason}
                  </p>
                  {leave.status === 'rejected' && leave.rejectionReason && (
                    <p className="text-xs text-[#DC2626] mt-1">
                      Reason: {leave.rejectionReason}
                    </p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${leave.status === "approved"
                    ? "bg-[#D1FAE5] text-[#065F46]"
                    : leave.status === "rejected"
                      ? "bg-[#FEE2E2] text-[#991B1B]"
                      : "bg-[#FEF3C7] text-[#92400E]"
                    }`}
                >
                  {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-[#64748B] py-4">
              No leave applications yet
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Attendance History (Last 7 Days)</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Date</th>
                <th className="px-4 py-3 text-left font-bold text-sm">
                  Check In
                </th>
                <th className="px-4 py-3 text-left font-bold text-sm">
                  Check Out
                </th>
                <th className="px-4 py-3 text-left font-bold text-sm">Hours</th>
                <th className="px-4 py-3 text-left font-bold text-sm">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {attendanceHistory.length > 0 ? (
                attendanceHistory.map((day, idx) => (
                  <tr key={idx} className="border-b border-[#E2E8F0]">
                    <td className="px-4 py-3 text-sm">
                      {formatDate(day.date)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatTime(day.checkIn)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatTime(day.checkOut)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatWorkingHours(day.workingHours)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${day.status === "present"
                          ? "bg-[#D1FAE5] text-[#065F46]"
                          : day.status === "late"
                            ? "bg-[#FEE2E2] text-[#991B1B]"
                            : "bg-[#DBEAFE] text-[#1E40AF]"
                          }`}
                      >
                        {day.status.charAt(0).toUpperCase() +
                          day.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-3 text-center text-[#64748B]"
                  >
                    No attendance records
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-3xl  w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-[#0F172A]">
              Apply for Leave
            </h2>

            <div className="mb-6 p-4 bg-[#FEF3C7] rounded-lg">
              <p className="text-sm text-[#64748B] mb-2">Available Leaves:</p>
              <div className="flex gap-4">
                <div>
                  <p className="font-bold text-[#10B981]">
                    {leaveBalance.casual.remaining}
                  </p>
                  <p className="text-xs text-[#64748B]">Casual Leaves</p>
                </div>
                <div>
                  <p className="font-bold text-[#10B981]">
                    {leaveBalance.sick.remaining}
                  </p>
                  <p className="text-xs text-[#64748B]">Sick Leaves</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div>
                <label
                  htmlFor="leaveType"
                  className="block text-sm font-medium text-[#0F172A] mb-2"
                >
                  Leave Type
                </label>
                <select
                  id="leaveType"
                  value={leaveForm.leaveType}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, leaveType: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:border-[#F59E0B]"
                >
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-[#0F172A] mb-2"
                >
                  Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={leaveForm.startDate}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, startDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:border-[#F59E0B]"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-[#0F172A] mb-2"
                >
                  End Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={leaveForm.endDate}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, endDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:border-[#F59E0B]"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-[#0F172A] mb-2"
                >
                  Reason
                </label>
                <textarea
                  id="reason"
                  value={leaveForm.reason}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, reason: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:border-[#F59E0B]"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-3">
                  Select Approvers (Staff & Admin)
                </label>
                <div className="border-2 border-[#FCD34D] rounded-lg p-3 max-h-48 overflow-y-auto bg-[#FFFBEB]">
                  {staffList && staffList.length > 0 ? (
                    staffList.map((approver) => {
                      const approverId = approver._id;
                      const approverName = approver.name || "Unknown";
                      const approverType = approver.type || "staff";
                      const checkboxId = `approver-${approverId}`;
                      return (
                        <div
                          key={approverId}
                          className="flex items-center gap-2 p-2 hover:bg-[#FEF3C7] rounded border-b border-[#F3E8FF] last:border-b-0"
                        >
                          <input
                            id={checkboxId}
                            type="checkbox"
                            checked={leaveForm.approvers.includes(approverId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setLeaveForm({
                                  ...leaveForm,
                                  approvers: [
                                    ...leaveForm.approvers,
                                    approverId,
                                  ],
                                });
                              } else {
                                setLeaveForm({
                                  ...leaveForm,
                                  approvers: leaveForm.approvers.filter(
                                    (id) => id !== approverId,
                                  ),
                                });
                              }
                            }}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <label
                            htmlFor={checkboxId}
                            className="flex flex-col cursor-pointer flex-1"
                          >
                            <span className="text-sm text-[#0F172A] font-medium">
                              {approverName}
                            </span>
                            <span className="text-xs text-[#64748B]">
                              {approverType === "admin"
                                ? "\uD83D\uDC64 Admin"
                                : "\uD83D\uDC68\u200D\uD83C\uDFEB Staff"}
                            </span>
                          </label>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-[#64748B] py-2 text-center">
                      Loading approvers...
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-[#FCD34D] text-[#0F172A] rounded-lg font-semibold hover:bg-[#FEF3C7] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={leaveSubmitting}
                  className="flex-1 px-4 py-2 bg-[#10B981] text-white rounded-lg font-semibold hover:bg-[#059669] transition-colors disabled:bg-[#6B7280]"
                >
                  {leaveSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Pending Approvals - Leave requests from others that need your action */}
      <div className="bg-white rounded-xl border-2 border-[#4F46E5] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <ClipboardCheck className="text-[#4F46E5]" size={20} />
          Pending Leave Approvals ({pendingApprovals.length})
        </h3>
        {pendingApprovals.length > 0 ? (
          <div className="space-y-4">
            {pendingApprovals.map((leave) => (
              <div key={leave._id} className="p-4 border-2 border-[#FCD34D] rounded-lg bg-[#FFFBEB]">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold">{leave.staffId?.userId?.name || 'Staff Member'}</p>
                    <p className="text-sm text-[#64748B]">{leave.staffId?.userId?.email || ''}</p>
                  </div>
                  <span className="px-2 py-1 bg-[#FEF3C7] text-[#92400E] rounded-full text-xs font-semibold capitalize">{leave.leaveType} Leave</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div><span className="text-[#64748B]">From:</span> <span className="font-semibold">{formatDate(leave.startDate)}</span></div>
                  <div><span className="text-[#64748B]">To:</span> <span className="font-semibold">{formatDate(leave.endDate)}</span></div>
                </div>
                <p className="text-sm text-[#64748B] mb-3"><span className="font-semibold">Reason:</span> {leave.reason}</p>
                <div className="flex gap-3">
                  <button onClick={() => handleApproveReject(leave._id, 'approve')} className="flex-1 bg-[#10B981] text-white py-2 rounded-lg font-semibold text-sm hover:bg-[#059669] transition-colors">Approve</button>
                  <button onClick={() => handleApproveReject(leave._id, 'reject')} className="flex-1 bg-[#DC2626] text-white py-2 rounded-lg font-semibold text-sm hover:bg-[#B91C1C] transition-colors">Reject</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-[#64748B]">
            <CheckCircle className="mx-auto mb-2 text-[#10B981]" size={32} />
            <p>No pending leave approvals</p>
          </div>
        )}
      </div>

      {/* Student Leave Approvals - Parent approved student leaves that need class teacher action */}
      <div className="bg-white rounded-xl border-2 border-[#10B981] p-6 mt-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <GraduationCap className="text-[#10B981]" size={20} />
          Student Leave Approvals ({pendingStudentLeaves.length})
        </h3>
        {pendingStudentLeaves.length > 0 ? (
          <div className="space-y-4">
            {pendingStudentLeaves.map((leave) => (
              <div key={leave._id} className="p-4 border-2 border-[#D1FAE5] rounded-lg bg-[#F0FDF4]">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold">{leave.studentId?.userId?.name || 'Student'}</p>
                    <p className="text-sm text-[#64748B]">Class Teacher Approval Needed</p>
                  </div>
                  <span className="px-2 py-1 bg-[#D1FAE5] text-[#065F46] rounded-full text-xs font-semibold capitalize">{leave.leaveType} Leave</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div><span className="text-[#64748B]">From:</span> <span className="font-semibold">{formatDate(leave.startDate)}</span></div>
                  <div><span className="text-[#64748B]">To:</span> <span className="font-semibold">{formatDate(leave.endDate)}</span></div>
                </div>
                <p className="text-sm text-[#64748B] mb-1"><span className="font-semibold">Reason:</span> {leave.reason}</p>
                <p className="text-xs text-[#10B981] font-semibold mb-3">{"\u2713"} Approved by Parent</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleStudentLeaveAction(leave._id, 'approve')}
                    disabled={studentActionLoading}
                    className="flex-1 bg-[#10B981] text-white py-2 rounded-lg font-semibold text-sm hover:bg-[#059669] transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStudentLeaveId(leave._id);
                      setIsStudentDenyModalOpen(true);
                    }}
                    disabled={studentActionLoading}
                    className="flex-1 bg-[#DC2626] text-white py-2 rounded-lg font-semibold text-sm hover:bg-[#B91C1C] transition-colors"
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-[#64748B]">
            <CheckCircle className="mx-auto mb-2 text-[#10B981]" size={32} />
            <p>No student leave approvals pending</p>
          </div>
        )}
      </div>
    </div>
  );

export default Attendance;
