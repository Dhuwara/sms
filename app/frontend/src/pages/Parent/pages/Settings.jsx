import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings = ({ user }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Settings & Support</h2>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">


        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <SettingsIcon className="text-[#64748B]" size={20} />
            Account Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input type="email" defaultValue={user?.email || 'parent@email.com'} className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input type="tel" defaultValue="+91 9876543210" className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2" />
            </div>
            <button className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg font-semibold text-sm">Update Settings</button>
            <button className="w-full border-2 border-[#DC2626] text-[#DC2626] px-4 py-2 rounded-lg font-semibold text-sm">Change Password</button>
          </div>
        </div>
      </div>






    </div>
  );
};

export default Settings;
