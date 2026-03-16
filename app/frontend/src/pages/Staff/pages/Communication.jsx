import React from 'react';
import { Bell, Mail, MessageSquare, Calendar, ChevronRight, XCircle } from 'lucide-react';

const Communication = ({
  commAnnouncements,
  commClasses,
  commForm,
  setCommForm,
  handleCommClassChange,
  commContacts,
  commSending,
  handleSendMessage,
  ptmForm,
  setPtmForm,
  handlePtmSubmit,
  ptmLoading,
  ptmList,
  handleDeletePtm,
  togglePtmClass,
}) => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Communication Tools</h2>

      {/* Communication Channels - WhatsApp, Email, SMS */}
      <div className="bg-gradient-to-r from-[#10B981] to-[#059669] rounded-xl p-6 text-white">
        <h3 className="font-bold text-xl mb-4">Send Notifications via Multiple Channels</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 cursor-pointer transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">WhatsApp</p>
                <p className="text-xs text-white/80">Instant messaging</p>
              </div>
            </div>
            <p className="text-sm text-white/70">Send instant messages to parents via WhatsApp</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 cursor-pointer transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#EA4335] rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold">Email</p>
                <p className="text-xs text-white/80">Detailed communication</p>
              </div>
            </div>
            <p className="text-sm text-white/70">Send detailed emails with attachments</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 cursor-pointer transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#4F46E5] rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold">SMS</p>
                <p className="text-xs text-white/80">Quick alerts</p>
              </div>
            </div>
            <p className="text-sm text-white/70">Send quick SMS alerts to parents</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Bell className="text-[#DC2626]" size={20} />
            Messages from Management
          </h3>
          <div className="space-y-3">
            {commAnnouncements.filter(a => a.priority === 'high' || a.priority === 'urgent').length === 0 && commAnnouncements.length === 0 ? (
              <p className="text-sm text-[#64748B] text-center py-4">No messages from management</p>
            ) : (
              commAnnouncements.slice(0, 5).map((msg, idx) => (
                <div key={msg._id || idx} className={`p-4 rounded-lg border-l-4 ${msg.priority === 'high' || msg.priority === 'urgent' ? 'bg-[#FEE2E2] border-[#DC2626]' :
                  msg.priority === 'normal' ? 'bg-[#FEF3C7] border-[#F59E0B]' :
                    'bg-[#F1F5F9] border-[#64748B]'
                  }`}>
                  <div className="flex justify-between items-start">
                    <p className="font-semibold">{msg.title}</p>
                    <span className="text-xs text-[#64748B]">{new Date(msg.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-[#64748B] mt-1">{msg.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Mail className="text-[#4F46E5]" size={20} />
            Notices & Announcements
          </h3>
          <div className="space-y-3">
            {commAnnouncements.length === 0 ? (
              <p className="text-sm text-[#64748B] text-center py-4">No announcements</p>
            ) : (
              commAnnouncements.slice(0, 5).map((notice, idx) => (
                <div key={notice._id || idx} className="p-3 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center hover:bg-[#F8FAFC] cursor-pointer">
                  <div>
                    <p className="font-semibold text-sm">{notice.title}</p>
                    <p className="text-xs text-[#64748B]">{new Date(notice.createdAt).toLocaleDateString()}</p>
                  </div>
                  <ChevronRight className="text-[#64748B]" size={18} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <MessageSquare className="text-[#10B981]" size={20} />
          Send Message to Students / Parents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <select
            className="border-2 border-[#FCD34D] rounded-lg px-4 py-2"
            value={commForm.classId}
            onChange={(e) => handleCommClassChange(e.target.value)}
          >
            <option value="">Select Class</option>
            {commClasses.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <select
            className="border-2 border-[#FCD34D] rounded-lg px-4 py-2"
            value={commForm.messageTo}
            onChange={(e) => setCommForm(prev => ({ ...prev, messageTo: e.target.value, selectedParentIdx: '' }))}
          >
            <option value="all_parents">All Parents</option>
            <option value="individual_parent">Individual Parent</option>
          </select>
          <select
            className="border-2 border-[#FCD34D] rounded-lg px-4 py-2"
            value={commForm.messageType}
            onChange={(e) => setCommForm(prev => ({ ...prev, messageType: e.target.value }))}
          >
            <option value="announcement">General Announcement</option>
            <option value="homework">Homework Reminder</option>
            <option value="performance">Performance Update</option>
            <option value="behavior">Behavior Report</option>
          </select>
          <select
            className="border-2 border-[#FCD34D] rounded-lg px-4 py-2"
            value={commForm.sendVia}
            onChange={(e) => setCommForm(prev => ({ ...prev, sendVia: e.target.value }))}
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="all">All Channels</option>
          </select>
        </div>
        {commForm.messageTo === 'individual_parent' && commForm.classId && commContacts.length > 0 && (
          <select
            className="border-2 border-[#FCD34D] rounded-lg px-4 py-2 mb-4 w-full md:w-1/2"
            value={commForm.selectedParentIdx}
            onChange={(e) => setCommForm(prev => ({ ...prev, selectedParentIdx: e.target.value }))}
          >
            <option value="">Select Parent</option>
            {commContacts.map((c, idx) => (
              <option key={idx} value={idx}>
                {c.parentName || 'Parent'} ({c.studentName}'s parent)
              </option>
            ))}
          </select>
        )}
        {/* Individual parent selected — show student details & contact info */}
        {commForm.messageTo === 'individual_parent' && commForm.selectedParentIdx !== '' && commContacts[Number(commForm.selectedParentIdx)] && (() => {
          const sel = commContacts[Number(commForm.selectedParentIdx)];
          return (
            <div className="mb-4 p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#64748B] mb-1">Student Details</p>
                  <p className="font-semibold text-[#0F172A]">{sel.studentName}</p>
                  <p className="text-sm text-[#64748B]">Class: {sel.className || '\u2014'} {sel.rollNumber ? `| Roll No: ${sel.rollNumber}` : ''}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B] mb-1">Parent: {sel.parentName || '\u2014'}</p>
                  {(commForm.sendVia === 'email' || commForm.sendVia === 'all') && (
                    <p className="text-sm flex items-center gap-1.5 mt-1">
                      <Mail size={14} className="text-[#EA4335]" />
                      <span className="font-medium text-[#0F172A]">{sel.parentEmail || 'No email available'}</span>
                    </p>
                  )}
                  {(commForm.sendVia === 'whatsapp' || commForm.sendVia === 'sms' || commForm.sendVia === 'all') && (
                    <p className="text-sm flex items-center gap-1.5 mt-1">
                      {commForm.sendVia === 'whatsapp' ? (
                        <span className="w-3.5 h-3.5 bg-[#25D366] rounded-full inline-flex items-center justify-center flex-shrink-0">
                          <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                        </span>
                      ) : commForm.sendVia === 'sms' ? (
                        <MessageSquare size={14} className="text-[#4F46E5] flex-shrink-0" />
                      ) : (
                        <span className="flex items-center gap-1 flex-shrink-0">
                          <span className="w-3.5 h-3.5 bg-[#25D366] rounded-full inline-flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                          </span>
                          <MessageSquare size={14} className="text-[#4F46E5]" />
                        </span>
                      )}
                      <span className="font-medium text-[#0F172A]">{sel.parentPhone || 'No phone available'}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
        {commForm.classId && commContacts.length > 0 && commForm.messageTo === 'all_parents' && (
          <p className="text-xs text-[#64748B] mb-2">{commContacts.length} parent contact(s) found for this class</p>
        )}
        <textarea
          className="w-full border-2 border-[#FCD34D] rounded-lg px-4 py-3 h-32"
          placeholder="Type your message here..."
          value={commForm.message}
          onChange={(e) => setCommForm(prev => ({ ...prev, message: e.target.value }))}
        ></textarea>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="bg-[#25D366] text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
            disabled={commSending}
            onClick={() => handleSendMessage('whatsapp')}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </button>
          <button
            className="bg-[#EA4335] text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
            disabled={commSending}
            onClick={() => handleSendMessage('email')}
          >
            <Mail size={18} /> Email
          </button>
          <button
            className="bg-[#4F46E5] text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
            disabled={commSending}
            onClick={() => handleSendMessage('sms')}
          >
            <MessageSquare size={18} /> SMS
          </button>
          <button
            className="bg-[#0F172A] text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
            disabled={commSending}
            onClick={() => handleSendMessage('all')}
          >
            Send to All Channels
          </button>
        </div>
      </div>

      {/* <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Recent Conversations</h3>
          <div className="space-y-3">
            {[
              { parent: 'Mr. Kumar (Rahul\'s Father)', message: 'Thank you for the update on Rahul\'s progress.', time: 'Today, 10:30 AM', via: 'WhatsApp' },
              { parent: 'Mrs. Sharma (Priya\'s Mother)', message: 'Can we schedule a meeting to discuss Priya\'s performance?', time: 'Yesterday, 4:15 PM', via: 'Email' },
            ].map((conv, idx) => (
              <div key={idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{conv.parent}</p>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${conv.via === 'WhatsApp' ? 'bg-[#25D366]/20 text-[#25D366]' : 'bg-[#EA4335]/20 text-[#EA4335]'
                      }`}>{conv.via}</span>
                  </div>
                  <span className="text-xs text-[#64748B]">{conv.time}</span>
                </div>
                <p className="text-sm text-[#64748B] mt-1">{conv.message}</p>
                <button className="mt-2 text-sm text-[#4F46E5] font-semibold">Reply</button>
              </div>
            ))}
          </div>
        </div> */}

      {/* PTM Scheduling */}
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Calendar className="text-[#4F46E5]" size={20} />
          Schedule Parent-Teacher Meeting (PTM)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form */}
          <form onSubmit={handlePtmSubmit} className="space-y-3">
            <div>
              <label htmlFor="ptm-title" className="block text-xs font-semibold text-[#64748B] mb-1">Title</label>
              <input
                id="ptm-title"
                type="text"
                className="w-full border-2 border-[#FCD34D] rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. Term 1 PTM"
                value={ptmForm.title}
                onChange={e => setPtmForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ptm-date" className="block text-xs font-semibold text-[#64748B] mb-1">Date</label>
                <input
                  id="ptm-date"
                  type="date"
                  className="w-full border-2 border-[#FCD34D] rounded-lg px-3 py-2 text-sm"
                  value={ptmForm.date}
                  onChange={e => setPtmForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="ptm-time" className="block text-xs font-semibold text-[#64748B] mb-1">Time</label>
                <input
                  id="ptm-time"
                  type="time"
                  className="w-full border-2 border-[#FCD34D] rounded-lg px-3 py-2 text-sm"
                  value={ptmForm.time}
                  onChange={e => setPtmForm(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label htmlFor="ptm-venue" className="block text-xs font-semibold text-[#64748B] mb-1">Venue</label>
              <input
                id="ptm-venue"
                type="text"
                className="w-full border-2 border-[#FCD34D] rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. School Auditorium"
                value={ptmForm.venue}
                onChange={e => setPtmForm(prev => ({ ...prev, venue: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="ptm-audience" className="block text-xs font-semibold text-[#64748B] mb-1">Target Audience</label>
              <select
                id="ptm-audience"
                className="w-full border-2 border-[#FCD34D] rounded-lg px-3 py-2 text-sm"
                value={ptmForm.targetAudience}
                onChange={e => setPtmForm(prev => ({ ...prev, targetAudience: e.target.value, classIds: [] }))}
              >
                <option value="all">All Parents</option>
                <option value="class">Specific Classes</option>
              </select>
            </div>
            {ptmForm.targetAudience === 'class' && commClasses.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[#64748B] mb-1">Select Classes</p>
                <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto border-2 border-[#FCD34D] rounded-lg p-2">
                  {commClasses.map(c => (
                    <label key={c._id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ptmForm.classIds.includes(c._id)}
                        onChange={() => togglePtmClass(c._id)}
                        className="accent-[#4F46E5]"
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label htmlFor="ptm-notes" className="block text-xs font-semibold text-[#64748B] mb-1">Notes (optional)</label>
              <textarea
                id="ptm-notes"
                className="w-full border-2 border-[#FCD34D] rounded-lg px-3 py-2 text-sm h-20 resize-none"
                placeholder="Additional details for parents..."
                value={ptmForm.notes}
                onChange={e => setPtmForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <button
              type="submit"
              disabled={ptmLoading}
              className="w-full bg-[#4F46E5] text-white py-2 rounded-lg font-semibold text-sm disabled:opacity-50"
            >
              {ptmLoading ? 'Scheduling...' : 'Schedule PTM'}
            </button>
          </form>

          {/* List */}
          <div>
            <p className="text-xs font-semibold text-[#64748B] mb-3">Scheduled PTMs</p>
            {ptmList.length === 0 ? (
              <p className="text-sm text-[#64748B] text-center py-8">No PTMs scheduled yet</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {ptmList.map(ptm => (
                  <div key={ptm._id} className="p-4 border-2 border-[#E2E8F0] rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#0F172A] truncate">{ptm.title}</p>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          {new Date(ptm.date).toLocaleDateString()} at {ptm.time} &bull; {ptm.venue}
                        </p>
                        <p className="text-xs text-[#64748B]">
                          Audience: {ptm.targetAudience === 'all' ? 'All Parents' : `${ptm.classIds?.length || 0} class(es)`}
                        </p>
                        {ptm.notes && <p className="text-xs text-[#64748B] mt-1 italic">{ptm.notes}</p>}
                      </div>
                      <button
                        onClick={() => handleDeletePtm(ptm._id)}
                        className="ml-3 text-[#DC2626] hover:text-[#B91C1C] flex-shrink-0"
                        title="Delete PTM"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

export default Communication;
