import React, { useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

const Settings = ({ user, setShowPasswordModal }) => {
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/api/auth/update-profile', {
        name: form.name,
        email: form.email,
        phone: form.phone,
      });
      await refreshUser();
      toast.success('Settings updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Settings & Support</h2>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <SettingsIcon className="text-[#64748B]" size={20} />
            Account Settings
          </h3>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2 focus:outline-none focus:border-[#FCD34D]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2 focus:outline-none focus:border-[#FCD34D]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2 focus:outline-none focus:border-[#FCD34D]"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update Settings'}
            </button>
          </form>
          <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="w-full border-2 border-[#DC2626] text-[#DC2626] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#FEE2E2] transition-colors"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
