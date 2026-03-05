import React, { useState } from 'react';
import api from '../utils/api';
import { Send, Mail, MessageSquare, Bell, Megaphone, FileText, Phone } from 'lucide-react';
import { toast } from 'sonner';

const Communication = () => {
  const [activeTab, setActiveTab] = useState('email');
  const [formData, setFormData] = useState({
    recipient_email: '',
    subject: '',
    message: '',
  });
  const [smsForm, setSmsForm] = useState({
    recipient: '',
    message: '',
  });
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    priority: 'normal',
  });
  const [circularForm, setCircularForm] = useState({
    title: '',
    content: '',
    recipients: 'all',
  });
  const [loading, setLoading] = useState(false);

  const announcements = [
    { id: 1, title: 'Annual Sports Day', message: 'Annual sports day scheduled on 15th March', priority: 'high', date: '2024-12-20' },
    { id: 2, title: 'Parent-Teacher Meeting', message: 'PTM scheduled for all classes', priority: 'urgent', date: '2024-12-18' },
    { id: 3, title: 'Holiday Notice', message: 'School closed on 25th December', priority: 'normal', date: '2024-12-15' },
    { id: 4, title: 'Exam Schedule Released', message: 'Mid-term exam schedule published', priority: 'high', date: '2024-12-10' },
    { id: 5, title: 'New Library Books', message: '50 new books added to library', priority: 'low', date: '2024-12-05' },
  ];

  const messages = [
    { from: 'Mrs. Sarah Johnson', to: 'Parent of Rahul Kumar', message: 'Great improvement in mathematics', time: '2 hours ago' },
    { from: 'Mr. John Smith', to: 'Parent of Priya Sharma', message: 'Excellent science project presentation', time: '4 hours ago' },
    { from: 'Parent of Amit Patel', to: 'Ms. Emily Davis', message: 'Request for extra guidance in English', time: '1 day ago' },
    { from: 'Mrs. Jessica Wilson', to: 'Parent of Sneha Reddy', message: 'Hindi speaking skills improving', time: '2 days ago' },
    { from: 'Parent of Vikram Singh', to: 'Mr. Michael Brown', message: 'Thank you for the attention', time: '3 days ago' },
  ];

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/communication/send-email', formData);
      toast.success('Email sent successfully!');
      setFormData({ recipient_email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const handleSmsSubmit = (e) => {
    e.preventDefault();
    toast.success('SMS sent successfully! (Demo)');
    setSmsForm({ recipient: '', message: '' });
  };

  const handleWhatsAppSubmit = (e) => {
    e.preventDefault();
    toast.success('WhatsApp message sent successfully! (Demo)');
  };

  const handleAnnouncementSubmit = (e) => {
    e.preventDefault();
    toast.success('Announcement posted successfully!');
    setAnnouncementForm({ title: '', message: '', priority: 'normal' });
  };

  const handleCircularSubmit = (e) => {
    e.preventDefault();
    toast.success('Circular sent to all recipients!');
    setCircularForm({ title: '', content: '', recipients: 'all' });
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'bg-[#FEE2E2] text-[#991B1B]';
      case 'high': return 'bg-[#FEF3C7] text-[#92400E]';
      case 'normal': return 'bg-[#DBEAFE] text-[#1E40AF]';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-[#0F172A]">Communication & Notifications</h1>
        <p className="text-[#64748B] mt-1">Email, SMS, WhatsApp, Announcements & Messages</p>
      </div>

      <div className="flex gap-2 border-b-2 border-[#FCD34D] overflow-x-auto">
        {['email', 'sms', 'whatsapp', 'announcements', 'circulars', 'messages'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold transition-all capitalize whitespace-nowrap ${activeTab === tab ? 'bg-[#FCD34D] text-[#0F172A] rounded-t-lg' : 'text-[#64748B] hover:text-[#0F172A]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'email' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border-2 border-[#FCD34D] shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-[#4F46E5]/10">
                  <Mail size={24} className="text-[#4F46E5]" />
                </div>
                <h2 className="text-2xl font-semibold text-[#0F172A]">Send Email</h2>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Recipient Email</label>
                  <input
                    type="email"
                    required
                    data-testid="email-recipient-input"
                    value={formData.recipient_email}
                    onChange={(e) => setFormData({ ...formData, recipient_email: e.target.value })}
                    placeholder="student@example.com"
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Subject</label>
                  <input
                    type="text"
                    required
                    data-testid="email-subject-input"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Important announcement"
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Message</label>
                  <textarea
                    required
                    data-testid="email-message-input"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Write your message here..."
                    rows="8"
                    className="w-full px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  data-testid="send-email-button"
                  className="w-full flex items-center justify-center gap-2 bg-[#4F46E5] text-white hover:bg-[#4338CA] h-10 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  {loading ? 'Sending...' : (<><Send size={20} />Send Email</>)}
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border-2 border-[#FCD34D] shadow-sm p-6">
              <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Communication Channels</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg border-2 border-[#10B981] bg-[#D1FAE5]">
                  <p className="font-medium text-[#0F172A]">Email</p>
                  <p className="text-sm text-[#64748B]">Active</p>
                </div>
                <div className="p-3 rounded-lg border-2 border-[#FCD34D]">
                  <p className="font-medium text-[#0F172A]">SMS</p>
                  <p className="text-sm text-[#64748B]">Demo Mode</p>
                </div>
                <div className="p-3 rounded-lg border-2 border-[#FCD34D]">
                  <p className="font-medium text-[#0F172A]">WhatsApp</p>
                  <p className="text-sm text-[#64748B]">Demo Mode</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sms' && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Phone className="text-[#10B981]" size={32} />
            <h2 className="text-2xl font-semibold text-[#0F172A]">Send SMS</h2>
          </div>
          <form onSubmit={handleSmsSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">Recipient Phone</label>
              <input type="tel" required value={smsForm.recipient} onChange={(e) => setSmsForm({...smsForm, recipient: e.target.value})} placeholder="+91 XXXXX XXXXX" className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">Message (160 chars)</label>
              <textarea required value={smsForm.message} onChange={(e) => setSmsForm({...smsForm, message: e.target.value})} maxLength="160" rows="4" className="w-full px-3 py-2 border-2 border-[#FCD34D] rounded-lg" />
              <p className="text-xs text-[#64748B] mt-1">{smsForm.message.length}/160 characters</p>
            </div>
            <button type="submit" className="w-full bg-[#10B981] text-white h-10 rounded-lg font-semibold">Send SMS (Demo)</button>
          </form>
        </div>
      )}

      {activeTab === 'whatsapp' && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="text-[#25D366]" size={32} />
            <h2 className="text-2xl font-semibold text-[#0F172A]">Send WhatsApp Message</h2>
          </div>
          <form onSubmit={handleWhatsAppSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">Recipient WhatsApp</label>
              <input type="tel" required placeholder="+91 XXXXX XXXXX" className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">Message</label>
              <textarea required rows="6" className="w-full px-3 py-2 border-2 border-[#FCD34D] rounded-lg" placeholder="Type your WhatsApp message..." />
            </div>
            <button type="submit" className="w-full bg-[#25D366] text-white h-10 rounded-lg font-semibold">Send WhatsApp (Demo)</button>
          </form>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Megaphone className="text-[#DC2626]" size={32} />
              <h2 className="text-2xl font-semibold text-[#0F172A]">Post Announcement</h2>
            </div>
            <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Title</label>
                <input type="text" required value={announcementForm.title} onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})} className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Message</label>
                <textarea required value={announcementForm.message} onChange={(e) => setAnnouncementForm({...announcementForm, message: e.target.value})} rows="4" className="w-full px-3 py-2 border-2 border-[#FCD34D] rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Priority</label>
                <select value={announcementForm.priority} onChange={(e) => setAnnouncementForm({...announcementForm, priority: e.target.value})} className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg">
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-[#DC2626] text-white h-10 rounded-lg font-semibold">Post Announcement</button>
            </form>
          </div>

          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
            <h3 className="text-xl font-bold mb-4">Recent Announcements</h3>
            <div className="space-y-3">
              {announcements.map(ann => (
                <div key={ann.id} className="p-4 border-2 border-[#FCD34D] rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-[#0F172A]">{ann.title}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ann.priority)}`}>{ann.priority}</span>
                  </div>
                  <p className="text-sm text-[#64748B] mb-2">{ann.message}</p>
                  <p className="text-xs text-[#64748B]">{ann.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'circulars' && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="text-[#F59E0B]" size={32} />
            <h2 className="text-2xl font-semibold text-[#0F172A]">Send Circular</h2>
          </div>
          <form onSubmit={handleCircularSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">Circular Title</label>
              <input type="text" required value={circularForm.title} onChange={(e) => setCircularForm({...circularForm, title: e.target.value})} className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">Content</label>
              <textarea required value={circularForm.content} onChange={(e) => setCircularForm({...circularForm, content: e.target.value})} rows="6" className="w-full px-3 py-2 border-2 border-[#FCD34D] rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">Send To</label>
              <select value={circularForm.recipients} onChange={(e) => setCircularForm({...circularForm, recipients: e.target.value})} className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg">
                <option value="all">All (Students, Teachers, Parents)</option>
                <option value="students">Students Only</option>
                <option value="teachers">Teachers Only</option>
                <option value="parents">Parents Only</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-[#F59E0B] text-white h-10 rounded-lg font-semibold">Send Circular</button>
          </form>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h2 className="text-2xl font-bold mb-4">Parent-Teacher Messages</h2>
          <div className="space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className="p-4 border-2 border-[#FCD34D] rounded-lg hover:bg-[#FFFBEB] transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-[#0F172A]">{msg.from}</p>
                    <p className="text-sm text-[#64748B]">To: {msg.to}</p>
                  </div>
                  <span className="text-xs text-[#64748B]">{msg.time}</span>
                </div>
                <p className="text-sm text-[#64748B]">{msg.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Communication;