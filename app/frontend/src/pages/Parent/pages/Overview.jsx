import React from 'react';
import { GraduationCap } from 'lucide-react';

const Overview = ({ selectedChild, overviewStats, childSelector, formatDate }) => {
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
              <p className="font-semibold">{child?.createdAt ? formatDate(child.createdAt) : '—'}</p>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-lg">
              <p className="text-sm text-[#64748B]">Student Type</p>
              <p className="font-semibold capitalize">{child?.studentType || '—'}</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981]">
          <p className="text-sm text-[#64748B]">Attendance</p>
          <p className="text-3xl font-bold text-[#065F46]">{overviewStats.attendancePct === null ? '—' : `${overviewStats.attendancePct}%`}</p>
          <p className="text-xs text-[#10B981]">Overall</p>
        </div>
        <div className="p-6 bg-[#FEF3C7] rounded-xl border-2 border-[#F59E0B]">
          <p className="text-sm text-[#64748B]">Overall Grade</p>
          <p className="text-3xl font-bold text-[#92400E]">{overviewStats.overallGrade || '—'}</p>
          <p className="text-xs text-[#F59E0B]">Last Exam</p>
        </div>
      </div>
    </div>
  );
};

export default Overview;
