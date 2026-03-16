import React from 'react';
import { Users, Bell, Mail } from 'lucide-react';

const Communication = ({ schoolEvents, ptmSchedules, sendMsgForm, setSendMsgForm, sendMsgLoading, handleSendMessage, formatDate }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Communication</h2>

      {/* Parent-Teacher Meeting — dynamic from backend */}
      <div className="bg-white rounded-xl border-2 border-[#4F46E5] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Users className="text-[#4F46E5]" size={20} />
          Parent-Teacher Meeting (PTM)
        </h3>
        {ptmSchedules.length > 0 ? (
          <div className="space-y-3">
            {ptmSchedules.map((ptm) => (
              <div key={ptm._id} className="p-4 bg-[#EEF2FF] rounded-lg border-l-4 border-[#4F46E5]">
                <p className="font-semibold text-[#4F46E5] text-lg">{ptm.title}</p>
                <p className="text-sm text-[#64748B] mt-1">
                  <span className="font-medium text-[#0F172A]">Date:</span> {formatDate(ptm.date)}
                </p>
                <p className="text-sm text-[#64748B]">
                  <span className="font-medium text-[#0F172A]">Time:</span> {ptm.time}
                </p>
                <p className="text-sm text-[#64748B]">
                  <span className="font-medium text-[#0F172A]">Venue:</span> {ptm.venue}
                </p>
                {ptm.notes && <p className="text-sm text-[#64748B] mt-1 italic">"{ptm.notes}"</p>}
                {ptm.targetAudience === 'class' && ptm.classIds?.length > 0 && (
                  <p className="text-xs text-[#4F46E5] mt-2 font-medium">
                    Classes: {ptm.classIds.map(c => `${c.name} ${c.section || ''}`).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-[#F8FAFC] rounded-lg text-center">
            <p className="text-[#64748B]">No PTM scheduled at the moment.</p>
            <p className="text-xs text-[#94A3B8] mt-1">You will be notified when a meeting is scheduled.</p>
          </div>
        )}
      </div>

      {/* School Announcements */}
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Bell className="text-[#DC2626]" size={20} />
          School Announcements & Notices
        </h3>
        <div className="space-y-3">
          {schoolEvents.length > 0 ? schoolEvents.slice(0, 5).map((event) => (
            <div key={event._id} className="p-4 rounded-lg border-l-4 bg-[#F8FAFC] border-[#64748B]">
              <div className="flex justify-between items-start">
                <p className="font-semibold">{event.title}</p>
                <span className="text-xs text-[#64748B]">{formatDate(event.startDate)}</span>
              </div>
              {event.description && <p className="text-sm text-[#64748B] mt-1">{event.description}</p>}
            </div>
          )) : (
            <p className="text-sm text-[#64748B] text-center py-4">No announcements at the moment.</p>
          )}
        </div>
      </div>

      {/* Send Message to School — real email */}
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Mail className="text-[#4F46E5]" size={20} />
          Send Message to School
        </h3>
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div>
            <label htmlFor="msg-subject" className="block text-sm font-medium text-[#0F172A] mb-2">Subject</label>
            <input
              id="msg-subject"
              type="text"
              required
              value={sendMsgForm.subject}
              onChange={(e) => setSendMsgForm(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="e.g. Query about attendance"
              className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>
          <div>
            <label htmlFor="msg-body" className="block text-sm font-medium text-[#0F172A] mb-2">Message</label>
            <textarea
              id="msg-body"
              required
              value={sendMsgForm.body}
              onChange={(e) => setSendMsgForm(prev => ({ ...prev, body: e.target.value }))}
              placeholder="Type your message here..."
              rows={5}
              className="w-full px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={sendMsgLoading}
            className="bg-[#4F46E5] text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#4338CA] transition-colors disabled:opacity-50"
          >
            <Mail size={18} /> {sendMsgLoading ? 'Sending...' : 'Send to School'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Communication;
