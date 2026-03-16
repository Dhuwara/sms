import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const Profile = ({ user, childrenList, selectedChild, childSelector }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Parent Profile</h2>
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-[#D1FAE5] to-[#DBEAFE] rounded-full flex items-center justify-center text-4xl font-bold text-[#10B981]">
            {user?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#0F172A]">{user?.name || 'Parent User'}</h3>
            <span className="inline-block mt-2 px-3 py-1 bg-[#10B981] text-white text-xs font-semibold rounded-full">Active Account</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-[#D1FAE5] rounded-lg">
            <p className="text-sm text-[#64748B]">Relation</p>
            <p className="font-bold text-[#0F172A]">Father</p>
          </div>
          <div className="p-4 bg-[#DBEAFE] rounded-lg">
            <p className="text-sm text-[#64748B]">Occupation</p>
            <p className="font-bold text-[#0F172A]">Business Professional</p>
          </div>
        </div>

        <div className="border-t border-[#E2E8F0] pt-4">
          <h4 className="font-semibold mb-3">Contact Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-[#F8FAFC] rounded-lg">
              <Mail className="text-[#64748B]" size={18} />
              <span className="text-sm">{user?.email || 'parent@email.com'}</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-[#F8FAFC] rounded-lg">
              <Phone className="text-[#64748B]" size={18} />
              <span className="text-sm">+91 9876543210</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-[#F8FAFC] rounded-lg col-span-2">
              <MapPin className="text-[#64748B]" size={18} />
              <span className="text-sm">123, Green Park, New Delhi - 110001</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E2E8F0] pt-4 mt-4">
          <h4 className="font-semibold mb-3">Linked Student(s)</h4>
          <div className="space-y-3">
            {childrenList.length > 0 ? childrenList.map((child, idx) => (
              <div key={child._id} className={`p-4 rounded-lg flex justify-between items-center ${idx === 0 ? 'border-2 border-[#FCD34D] bg-[#FFFBEB]' : 'border-2 border-[#E2E8F0]'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${idx === 0 ? 'bg-[#4F46E5]' : 'bg-[#EC4899]'} rounded-full flex items-center justify-center text-white font-bold`}>
                    {(child.userId?.name || child.firstName || '?').charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold">{child.userId?.name || `${child.firstName} ${child.lastName}`}</p>
                    <p className="text-sm text-[#64748B]">{child.classId?.name || 'N/A'} {child.classId?.section || ''} | Roll No: {child.rollNumber || '—'}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-white text-xs rounded-full font-semibold ${idx === 0 ? 'bg-[#10B981]' : 'bg-[#64748B]'}`}>{idx === 0 ? 'Primary' : 'Sibling'}</span>
              </div>
            )) : (
              <>
                <div className="p-4 border-2 border-[#FCD34D] rounded-lg flex justify-between items-center bg-[#FFFBEB]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#4F46E5] rounded-full flex items-center justify-center text-white font-bold">R</div>
                    <div>
                      <p className="font-bold">Rahul Kumar</p>
                      <p className="text-sm text-[#64748B]">Grade 10-A | Roll No: 15</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-[#10B981] text-white text-xs rounded-full font-semibold">Primary</span>
                </div>
                <div className="p-4 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#EC4899] rounded-full flex items-center justify-center text-white font-bold">P</div>
                    <div>
                      <p className="font-bold">Priya Kumar</p>
                      <p className="text-sm text-[#64748B]">Grade 7-B | Roll No: 8</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-[#64748B] text-white text-xs rounded-full font-semibold">Sibling</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-[#E2E8F0] pt-4 mt-4">
          <h4 className="font-semibold mb-3">Login & Security Settings</h4>
          <div className="flex gap-3">
            <button className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#4338CA] transition-colors">
              Change Password
            </button>
            <button className="border-2 border-[#4F46E5] text-[#4F46E5] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#EEF2FF] transition-colors">
              Update Contact Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
