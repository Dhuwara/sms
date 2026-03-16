import React from 'react';
import { Heart, Phone, AlertCircle } from 'lucide-react';

const Health = ({ selectedChild, user, childSelector }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Health & Safety</h2>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Heart className="text-[#DC2626]" size={20} />
          Medical Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-[#FEE2E2] rounded-lg">
            <p className="text-sm text-[#64748B]">Blood Group</p>
            <p className="font-bold text-[#991B1B]">{selectedChild?.bloodGroup || 'O+'}</p>
          </div>
          <div className="p-4 bg-[#D1FAE5] rounded-lg">
            <p className="text-sm text-[#64748B]">Height</p>
            <p className="font-bold text-[#065F46]">152 cm</p>
          </div>
          <div className="p-4 bg-[#DBEAFE] rounded-lg">
            <p className="text-sm text-[#64748B]">Weight</p>
            <p className="font-bold text-[#1E40AF]">45 kg</p>
          </div>
          <div className="p-4 bg-[#FEF3C7] rounded-lg">
            <p className="text-sm text-[#64748B]">Vision</p>
            <p className="font-bold text-[#92400E]">Normal</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-4 border-2 border-[#E2E8F0] rounded-lg">
            <h4 className="font-semibold mb-2">Known Allergies</h4>
            <p className="text-sm text-[#64748B]">No known allergies</p>
          </div>
          <div className="p-4 border-2 border-[#E2E8F0] rounded-lg">
            <h4 className="font-semibold mb-2">Medical Conditions</h4>
            <p className="text-sm text-[#64748B]">None reported</p>
          </div>
          <div className="p-4 border-2 border-[#E2E8F0] rounded-lg">
            <h4 className="font-semibold mb-2">Regular Medications</h4>
            <p className="text-sm text-[#64748B]">None</p>
          </div>
        </div>
        <button className="mt-4 bg-[#4F46E5] text-white px-4 py-2 rounded-lg font-semibold text-sm">Update Medical Information</button>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#DC2626] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Phone className="text-[#DC2626]" size={20} />
          Emergency Contacts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#FEE2E2] rounded-lg">
            <p className="font-semibold">Primary Contact</p>
            <p className="text-sm">{user?.full_name || 'Parent User'} (Father)</p>
            <p className="text-sm text-[#64748B]">+91 9876543210</p>
          </div>
          <div className="p-4 bg-[#FEF3C7] rounded-lg">
            <p className="font-semibold">Secondary Contact</p>
            <p className="text-sm">Mrs. Kumar (Mother)</p>
            <p className="text-sm text-[#64748B]">+91 9876543211</p>
          </div>
          <div className="p-4 bg-[#DBEAFE] rounded-lg">
            <p className="font-semibold">Emergency Contact</p>
            <p className="text-sm">Mr. Sharma (Uncle)</p>
            <p className="text-sm text-[#64748B]">+91 9876543212</p>
          </div>
          <div className="p-4 bg-[#D1FAE5] rounded-lg">
            <p className="font-semibold">Family Doctor</p>
            <p className="text-sm">Dr. Rajesh Gupta</p>
            <p className="text-sm text-[#64748B]">+91 9876543213</p>
          </div>
        </div>
        <button className="mt-4 border-2 border-[#DC2626] text-[#DC2626] px-4 py-2 rounded-lg font-semibold text-sm">Update Emergency Contacts</button>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <AlertCircle className="text-[#F59E0B]" size={20} />
          Health Alerts
        </h3>
        <div className="space-y-3">
          <div className="p-4 bg-[#D1FAE5] rounded-lg border-l-4 border-[#10B981]">
            <p className="font-semibold text-[#065F46]">Health Checkup Completed</p>
            <p className="text-sm text-[#64748B]">Annual health checkup completed on Nov 15, 2024. All reports normal.</p>
          </div>
          <div className="p-4 bg-[#DBEAFE] rounded-lg border-l-4 border-[#3B82F6]">
            <p className="font-semibold text-[#1E40AF]">Vaccination Reminder</p>
            <p className="text-sm text-[#64748B]">Next vaccination due: Booster dose (Feb 2025)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Health;
