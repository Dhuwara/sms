import React from 'react';
import { Video } from 'lucide-react';

const OnlineClasses = ({ onlineClasses, scheduleData }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Online Classes</h2>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Video className="text-[#EF4444]" size={24} />
          My Scheduled Classes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {onlineClasses.length > 0 ? onlineClasses.map((oc) => (
            <div key={oc._id} className="p-4 border-2 border-[#E2E8F0] rounded-lg hover:shadow-md transition-shadow bg-[#F8FAFC]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#FEE2E2]">
                  <Video size={20} className="text-[#DC2626]" />
                </div>
                <div className="min-w-0 pr-2">
                  <h4 className="font-bold truncate">{oc.title}</h4>
                  <p className="text-xs text-[#64748B]">{oc.platform}</p>
                </div>
              </div>
              <div className="space-y-1 mb-4">
                <p className="text-sm font-semibold">Subject: <span className="text-[#64748B] font-normal">{oc.subject}</span></p>
                <p className="text-sm font-semibold">Teacher: <span className="text-[#64748B] font-normal">{oc.staffId?.userId?.name || '—'}</span></p>
                <p className="text-sm font-semibold">Date & Time: <span className="text-[#64748B] font-normal">{new Date(oc.date).toLocaleDateString()} at {oc.time}</span></p>
              </div>
              <a
                href={oc.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2 bg-[#EF4444] text-white font-bold rounded-lg hover:bg-[#DC2626] transition-colors"
              >
                <Video size={16} /> Join Class
              </a>
            </div>
          )) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 p-8 text-center bg-white border-2 border-[#E2E8F0] border-dashed rounded-lg">
              <Video className="mx-auto text-[#94A3B8] mb-3" size={32} />
              <p className="text-[#64748B] font-medium">No online classes scheduled at the moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnlineClasses;
