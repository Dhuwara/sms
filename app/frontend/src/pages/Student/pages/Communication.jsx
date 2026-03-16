import React from 'react';
import { Bell, MessageSquare, CalendarDays, Calendar } from 'lucide-react';

const Communication = ({ announcements, messages, schoolEvents, formatDate, getEventStyle }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Communication & Notices</h2>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Bell className="text-[#DC2626]" size={20} />
          School Announcements
        </h3>
        <div className="space-y-4">
          {announcements.length > 0 ? announcements.map((a, idx) => (
            <div key={idx} className={`p-4 rounded-lg border-l-4 ${a.priority === 'high' || a.priority === 'urgent' ? 'bg-[#FEE2E2] border-[#DC2626]' :
              a.priority === 'normal' ? 'bg-[#FEF3C7] border-[#F59E0B]' :
                'bg-[#F1F5F9] border-[#64748B]'
              }`}>
              <div className="flex justify-between items-start">
                <h4 className="font-semibold">{a.title}</h4>
                <span className="text-xs text-[#64748B]">{formatDate(a.createdAt)}</span>
              </div>
              <p className="text-sm text-[#64748B] mt-1">{a.message}</p>
            </div>
          )) : (
            <p className="text-center text-[#64748B] py-4">No announcements</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="text-[#4F46E5]" size={20} />
            Messages
          </h3>
          <div className="space-y-3">
            {messages.length > 0 ? messages.slice(0, 5).map((msg, idx) => (
              <div key={idx} className="p-3 border-2 border-[#E2E8F0] rounded-lg">
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-sm">{msg.fromUserId?.name || 'Unknown'}</p>
                  <span className="text-xs text-[#64748B]">{formatDate(msg.createdAt)}</span>
                </div>
                <p className="text-sm text-[#64748B] mt-1">{msg.content}</p>
              </div>
            )) : (
              <p className="text-center text-[#64748B] py-4">No messages</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <CalendarDays className="text-[#10B981]" size={20} />
            School Events
          </h3>
          <div className="space-y-3">
            {schoolEvents.length > 0 ? schoolEvents.map((event, idx) => {
              const style = getEventStyle(event.eventType, event.priority);
              return (
                <div key={idx} className={`p-4 rounded-lg border-l-4 ${style.bg} ${style.border}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className={`font-semibold ${style.text}`}>{event.title}</h4>
                      <div className="flex items-center gap-4 mt-2 text-xs text-[#64748B]">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(event.startDate)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                          {event.eventType}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${event.status === 'upcoming' ? 'bg-[#DBEAFE] text-[#1E40AF]' :
                      event.status === 'ongoing' ? 'bg-[#D1FAE5] text-[#065F46]' :
                        event.status === 'completed' ? 'bg-[#F1F5F9] text-[#64748B]' :
                          'bg-[#FEE2E2] text-[#991B1B]'
                      }`}>
                      {event.status}
                    </span>
                  </div>
                </div>
              );
            }) : (
              <div className="p-8 text-center text-[#64748B]">
                <CalendarDays className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-sm">No school events scheduled</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communication;
