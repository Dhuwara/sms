import React from 'react';
import { Mail, User } from 'lucide-react';

const Profile = ({
  staffData,
  user,
  showPasswordModal,
  setShowPasswordModal,
  showContactModal,
  setShowContactModal,
  passwordForm,
  setPasswordForm,
  handleChangePassword,
  contactForm,
  setContactForm,
  handleUpdateContact,
  submitting,
}) => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">
        Staff Profile & Account
      </h2>
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-[#FEF3C7] to-[#FEE2E2] rounded-full flex items-center justify-center text-4xl font-bold text-[#0F172A]">
            {staffData?.userId?.name?.charAt(0) || "S"}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#0F172A]">
              {staffData?.userId?.name || "Staff User"}
            </h3>
            <p className="text-[#64748B]">
              Employee ID: {staffData?.employeeId || "N/A"}
            </p>
            <span
              className={`inline-block mt-2 px-3 py-1 text-white text-xs font-semibold rounded-full ${staffData?.status === "active" ? "bg-[#10B981]" : "bg-[#F59E0B]"
                }`}
            >
              {staffData?.status?.charAt(0).toUpperCase() +
                staffData?.status?.slice(1) || "N/A"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-[#FEF3C7] rounded-lg">
            <p className="text-sm text-[#64748B]">Subjects Taught</p>
            <p className="font-bold text-[#0F172A]">
              {staffData?.subjectsTaught?.join(", ") || "N/A"}
            </p>
          </div>
          <div className="p-4 bg-[#FEE2E2] rounded-lg">
            <p className="text-sm text-[#64748B]">Classes Assigned</p>
            <p className="font-bold text-[#0F172A]">
              {staffData?.classesAssigned?.length || 0} Classes
            </p>
          </div>
          <div className="p-4 bg-[#DBEAFE] rounded-lg">
            <p className="text-sm text-[#64748B]">Qualification</p>
            <p className="font-bold text-[#0F172A]">
              {staffData?.qualificationDegree
                ? `${staffData.qualificationDegree} ${staffData.qualificationSpecialization || ""}`
                : "N/A"}
            </p>
          </div>
          <div className="p-4 bg-[#D1FAE5] rounded-lg">
            <p className="text-sm text-[#64748B]">Experience</p>
            <p className="font-bold text-[#0F172A]">
              {staffData?.experience || "N/A"}
            </p>
          </div>
        </div>

        <div className="border-t border-[#E2E8F0] pt-4">
          <h4 className="font-semibold mb-3">Contact Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="text-[#64748B]" size={18} />
              <span className="text-sm">{user?.email || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="text-[#64748B]" size={18} />
              <span className="text-sm">{staffData?.contact || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E2E8F0] pt-4 mt-4">
          <h4 className="font-semibold mb-3">Security Settings</h4>
          <div className="flex gap-3">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#4338CA] transition-colors"
            >
              Change Password
            </button>
            <button
              onClick={() => setShowContactModal(true)}
              className="border-2 border-[#4F46E5] text-[#4F46E5] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#EEF2FF] transition-colors"
            >
              Update Contact Info
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-[#0F172A] mb-4">
              Change Password
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder="Enter current password"
                  className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Enter new password"
                  className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirm new password"
                  className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-gray-200 text-[#0F172A] hover:bg-gray-300 h-10 px-4 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#4F46E5] text-white hover:bg-[#4338CA] h-10 px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                >
                  {submitting ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Update Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-[#0F172A] mb-4">
              Update Contact Information
            </h3>
            <form onSubmit={handleUpdateContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  value={contactForm.contact}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, contact: e.target.value })
                  }
                  placeholder="Enter contact number"
                  className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 bg-gray-200 text-[#0F172A] hover:bg-gray-300 h-10 px-4 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#4F46E5] text-white hover:bg-[#4338CA] h-10 px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                >
                  {submitting ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

export default Profile;
