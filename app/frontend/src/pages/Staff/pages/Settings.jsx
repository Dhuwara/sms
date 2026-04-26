import React, { useState } from 'react';
import { Settings as SettingsIcon, User } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

const eyeOpen = (onClick) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 absolute bottom-2.5 right-3 cursor-pointer text-[#64748B]" onClick={onClick}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const eyeClosed = (onClick) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 absolute bottom-2.5 right-3 cursor-pointer text-[#64748B]" onClick={onClick}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

const Settings = ({ user }) => {
  const { refreshUser } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [profileSaving, setProfileSaving] = useState(false);

  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await api.put('/api/auth/update-profile', {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      });
      await refreshUser();
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.newPass.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setPwSaving(true);
    try {
      await api.post('/api/auth/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      });
      toast.success('Password changed successfully');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Settings & Support</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <SettingsIcon className="text-[#64748B]" size={20} />
            Profile Settings
          </h3>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label htmlFor="staffName" className="block text-sm font-medium mb-2">Display Name</label>
              <input
                id="staffName"
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2 focus:outline-none focus:border-[#FCD34D]"
              />
            </div>
            <div>
              <label htmlFor="staffEmail" className="block text-sm font-medium mb-2">Email Address</label>
              <input
                id="staffEmail"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2 focus:outline-none focus:border-[#FCD34D]"
              />
            </div>
            <div>
              <label htmlFor="staffPhone" className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                id="staffPhone"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2 focus:outline-none focus:border-[#FCD34D]"
              />
            </div>
            <button
              type="submit"
              disabled={profileSaving}
              className="bg-[#4F46E5] text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
            >
              {profileSaving ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>

        <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <User className="text-[#64748B]" size={20} />
            Security Settings
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="currentPw" className="block text-sm font-medium mb-2">Current Password</label>
              <div className="relative">
                <input
                  id="currentPw"
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#FCD34D]"
                />
                {showCurrent ? eyeOpen(() => setShowCurrent(false)) : eyeClosed(() => setShowCurrent(true))}
              </div>
            </div>
            <div>
              <label htmlFor="newPw" className="block text-sm font-medium mb-2">New Password</label>
              <div className="relative">
                <input
                  id="newPw"
                  type={showNew ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={passwords.newPass}
                  onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                  className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#FCD34D]"
                />
                {showNew ? eyeOpen(() => setShowNew(false)) : eyeClosed(() => setShowNew(true))}
              </div>
            </div>
            <div>
              <label htmlFor="confirmPw" className="block text-sm font-medium mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  id="confirmPw"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#FCD34D]"
                />
                {showConfirm ? eyeOpen(() => setShowConfirm(false)) : eyeClosed(() => setShowConfirm(true))}
              </div>
            </div>
            <button
              type="submit"
              disabled={pwSaving}
              className="bg-[#DC2626] text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
            >
              {pwSaving ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
