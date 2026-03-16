import React from 'react';
import { Bus, MapPin, Clock, User, Phone } from 'lucide-react';

const Transport = ({ selectedChild, childSelector }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Transport</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-[#DBEAFE] rounded-xl border-2 border-[#3B82F6]">
          <Bus className="text-[#3B82F6] mb-2" size={32} />
          <p className="text-sm text-[#64748B]">Bus Number</p>
          <p className="text-2xl font-bold text-[#1E40AF]">DL-01-AB-1234</p>
        </div>
        <div className="p-6 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981]">
          <MapPin className="text-[#10B981] mb-2" size={32} />
          <p className="text-sm text-[#64748B]">Route Number</p>
          <p className="text-2xl font-bold text-[#065F46]">Route 5</p>
        </div>
        <div className="p-6 bg-[#FEF3C7] rounded-xl border-2 border-[#F59E0B]">
          <Clock className="text-[#F59E0B] mb-2" size={32} />
          <p className="text-sm text-[#64748B]">Pickup Time</p>
          <p className="text-2xl font-bold text-[#92400E]">7:30 AM</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Bus Route & Timings</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-linear-to-r from-[#DBEAFE] to-[#D1FAE5]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Stop</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Location</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Morning Pickup</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Evening Drop</th>
              </tr>
            </thead>
            <tbody>
              {[
                { stop: 1, location: 'Green Park Metro', morning: '7:15 AM', evening: '3:45 PM' },
                { stop: 2, location: 'Hauz Khas Market', morning: '7:25 AM', evening: '3:55 PM' },
                { stop: 3, location: 'Safdarjung Enclave (Your Stop)', morning: '7:30 AM', evening: '4:00 PM', highlight: true },
                { stop: 4, location: 'AIIMS Gate', morning: '7:40 AM', evening: '4:10 PM' },
                { stop: 5, location: 'School', morning: '8:00 AM', evening: '3:30 PM' },
              ].map((item, idx) => (
                <tr key={idx} className={`border-b border-[#E2E8F0] ${item.highlight ? 'bg-[#FEF3C7]' : ''}`}>
                  <td className="px-4 py-3 text-sm font-semibold">{item.stop}</td>
                  <td className="px-4 py-3 text-sm">{item.location}</td>
                  <td className="px-4 py-3 text-sm">{item.morning}</td>
                  <td className="px-4 py-3 text-sm">{item.evening}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <User className="text-[#4F46E5]" size={20} />
            Driver Contact (School-Approved)
          </h3>
          <div className="p-4 bg-[#F8FAFC] rounded-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-[#4F46E5] rounded-full flex items-center justify-center text-white text-xl font-bold">RS</div>
              <div>
                <p className="font-bold">Mr. Ramesh Singh</p>
                <p className="text-sm text-[#64748B]">Driver - Route 5</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="text-[#64748B]" size={16} />
                <span className="text-sm">+91 98765 43210</span>
              </div>
              <p className="text-xs text-[#64748B]">Contact only for transport emergencies</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-[#F8FAFC] rounded-lg">
            <p className="font-semibold">Conductor: Mr. Suresh</p>
            <div className="flex items-center gap-2 mt-1">
              <Phone className="text-[#64748B]" size={16} />
              <span className="text-sm">+91 98765 43211</span>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default Transport;
