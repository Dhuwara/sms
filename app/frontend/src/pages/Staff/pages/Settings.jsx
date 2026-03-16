import React from 'react';
import { Settings as SettingsIcon, User } from 'lucide-react';

const Settings = ({ user }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-[#0F172A]">Settings & Support</h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <SettingsIcon className="text-[#64748B]" size={20} />
          Profile Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Display Name</label>
            <input type="text" defaultValue={user?.full_name || 'Staff User'} className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <input type="email" defaultValue="staff@ajmschool.edu" className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input type="tel" defaultValue="+91 9876543210" className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2" />
          </div>
          <button className="bg-[#4F46E5] text-white px-6 py-2 rounded-lg font-semibold">Update Profile</button>
        </div>
      </div>

      <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <User className="text-[#64748B]" size={20} />
          Security Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Current Password</label>
            <input type="password" placeholder="••••••••" className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">New Password</label>
            <input type="password" placeholder="••••••••" className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Confirm New Password</label>
            <input type="password" placeholder="••••••••" className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2" />
          </div>
          <button className="bg-[#DC2626] text-white px-6 py-2 rounded-lg font-semibold">Change Password</button>
        </div>
      </div>
    </div>


  </div>
);

export default Settings;
