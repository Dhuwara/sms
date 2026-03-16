import React from 'react';
import { Mail, User } from 'lucide-react';

const Profile = ({ userInfo, scheduleData, timetableData, periodConfig, schoolEvents, setIsPasswordModalOpen, formatDate, getAcademicYear }) => {
  const classInfo = scheduleData?.class;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Student Profile</h2>
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-[#DBEAFE] to-[#EDE9FE] rounded-full flex items-center justify-center text-4xl font-bold text-[#4F46E5]">
            {userInfo?.name?.charAt(0) || "S"}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#0F172A]">
              {userInfo?.name || "Student User"}
            </h3>
            <p className="text-[#64748B]">
              Student ID: {userInfo?.studentId || userInfo?.email || "—"}
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
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#4338CA] transition-colors"
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
