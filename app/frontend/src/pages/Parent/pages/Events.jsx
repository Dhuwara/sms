import React from 'react';
import { CalendarDays } from 'lucide-react';

const Events = ({ formatDate }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">School Events & Activities</h2>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <CalendarDays className="text-[#4F46E5]" size={20} />
          School Calendar - December 2024
        </h3>
        <div className="grid grid-cols-7 gap-2 text-center text-sm">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="font-semibold text-[#64748B] py-2">{day}</div>
          ))}
          {[...Array(31)].map((_, i) => {
            const isHoliday = i === 24 || i === 25;
            const isExam = i >= 25 && i <= 30;
            const isEvent = i === 14;
            return (
              <div key={i} className={`p-2 rounded ${isHoliday ? 'bg-[#D1FAE5] text-[#065F46]' :
                isExam ? 'bg-[#FEE2E2] text-[#991B1B]' :
                  isEvent ? 'bg-[#EDE9FE] text-[#7C3AED]' :
                    'bg-[#F8FAFC]'
                }`}>
                {i + 1}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-2"><span className="w-4 h-4 bg-[#D1FAE5] rounded"></span> Holiday</span>
          <span className="flex items-center gap-2"><span className="w-4 h-4 bg-[#FEE2E2] rounded"></span> Exam</span>
          <span className="flex items-center gap-2"><span className="w-4 h-4 bg-[#EDE9FE] rounded"></span> Event</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {[
              { name: 'Mid-Term Examinations', date: 'Dec 26-31', type: 'Exam' },
              { name: 'Annual Day Celebration', date: 'Jan 15, 2025', type: 'Cultural' },
              { name: 'Science Exhibition', date: 'Jan 20, 2025', type: 'Academic' },
              { name: 'Sports Day', date: 'Feb 5, 2025', type: 'Sports' },
            ].map((event, idx) => (
              <div key={idx} className="p-3 border-l-4 border-[#4F46E5] bg-[#F8FAFC] rounded-r-lg">
                <p className="font-semibold">{event.name}</p>
                <p className="text-xs text-[#64748B]">{event.date} • {event.type}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Holidays</h3>
          <div className="space-y-3">
            {[
              { name: 'Christmas', date: 'Dec 25', type: 'Public Holiday' },
              { name: 'New Year', date: 'Jan 1', type: 'Public Holiday' },
              { name: 'Makar Sankranti', date: 'Jan 14', type: 'Regional Holiday' },
              { name: 'Republic Day', date: 'Jan 26', type: 'National Holiday' },
            ].map((holiday, idx) => (
              <div key={idx} className="p-3 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold">{holiday.name}</p>
                  <p className="text-xs text-[#64748B]">{holiday.type}</p>
                </div>
                <span className="px-3 py-1 bg-[#D1FAE5] text-[#065F46] rounded-full text-sm font-semibold">{holiday.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Co-curricular Activities & Student Participation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Science Club', role: 'Member', schedule: 'Every Saturday', status: 'Active' },
            { name: 'Debate Team', role: 'Team Member', schedule: 'Tue & Thu', status: 'Active' },
            { name: 'Cricket Team', role: 'Batsman', schedule: 'Mon & Fri', status: 'Active' },
          ].map((activity, idx) => (
            <div key={idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold">{activity.name}</h4>
                <span className="px-2 py-1 bg-[#D1FAE5] text-[#065F46] rounded-full text-xs font-semibold">{activity.status}</span>
              </div>
              <p className="text-sm text-[#64748B]">Role: {activity.role}</p>
              <p className="text-sm text-[#64748B]">Schedule: {activity.schedule}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;
