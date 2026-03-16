import React, { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { Send, Mail, MessageSquare, Bell, Megaphone, FileText, Phone, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClasses } from '@/store/slices/classesSlice';
import { fetchPTMs, createPTM, deletePTM } from '@/store/slices/communicationSlice';

const STANDARDS = ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

const Communication = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const classes = useSelector(s => s.classes.list);
  const ptmList = useSelector(s => s.communication.ptmList);
  const ptmStatus = useSelector(s => s.communication.ptmStatus);

  const [activeTab, setActiveTab] = useState('email');
  const [emailForm, setEmailForm] = useState({
    recipientType: 'single',
    toEmail: '',
    classId: '',
    standard: '',
    subject: '',
    body: '',
  });
  const [specificClassId, setSpecificClassId] = useState('');
  const [specificStudents, setSpecificStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [smsForm, setSmsForm] = useState({ recipient: '', message: '' });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '', priority: 'normal' });
  const [circularForm, setCircularForm] = useState({ title: '', content: '', recipients: 'all' });
  const [loading, setLoading] = useState(false);
  const [ptmForm, setPtmForm] = useState({ title: '', date: '', time: '', venue: '', targetAudience: 'all', classIds: [], notes: '' });
  const ptmLoading = ptmStatus === 'loading';

  useEffect(() => {
    if (s => s.classes.status !== 'succeeded') dispatch(fetchClasses());
  }, []);

  useEffect(() => {
    if (activeTab === 'ptm') dispatch(fetchPTMs());
  }, [activeTab]);

  const handlePtmSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createPTM(ptmForm)).unwrap();
      toast.success('PTM scheduled successfully!');
      setPtmForm({ title: '', date: '', time: '', venue: '', targetAudience: 'all', classIds: [], notes: '' });
    } catch (err) {
      toast.error(err?.message || 'Failed to schedule PTM');
    }
  };

  const handleDeletePtm = async (id) => {
    try {
      await dispatch(deletePTM(id)).unwrap();
      toast.success('PTM deleted');
    } catch {
      toast.error('Failed to delete PTM');
    }
  };

  const togglePtmClass = (classId) => {
    setPtmForm(prev => ({
      ...prev,
      classIds: prev.classIds.includes(classId)
        ? prev.classIds.filter(id => id !== classId)
        : [...prev.classIds, classId],
    }));
  };

  const handleSpecificClassChange = async (classId) => {
    setSpecificClassId(classId);
    setSpecificStudents([]);
    setSelectedStudentIds(new Set());
    if (!classId) return;
    setLoadingStudents(true);
    try {
      const res = await api.get(`/api/communication/class-contacts/${classId}`);
      setSpecificStudents(res.data?.data || res.data || []);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };

  const toggleStudent = (studentId) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const toggleAllStudents = () => {
    if (selectedStudentIds.size === specificStudents.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(specificStudents.map(s => s.studentId)));
    }
  };

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
      if (emailForm.recipientType === 'specific-students-parents' && selectedStudentIds.size === 0) {
        toast.error('Please select at least one student');
        setLoading(false);
        return;
      }
      const payload = {
        recipientType: emailForm.recipientType,
        subject: emailForm.subject,
        body: emailForm.body,
        ...(emailForm.recipientType === 'single' && { toEmail: emailForm.toEmail }),
        ...(emailForm.recipientType === 'class-parents' && { classId: emailForm.classId }),
        ...(emailForm.recipientType === 'standard-parents' && { standard: emailForm.standard }),
        ...(emailForm.recipientType === 'specific-students-parents' && { studentIds: [...selectedStudentIds] }),
      };
      const res = await api.post('/api/communication/send-email', payload);
      toast.success(res.data?.message || 'Email sent successfully!');
      setEmailForm({ recipientType: 'single', toEmail: '', classId: '', standard: '', subject: '', body: '' });
      setSpecificClassId('');
      setSpecificStudents([]);
      setSelectedStudentIds(new Set());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
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
        {['email','ptm'].map(tab => (
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
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">From</label>
                  <input
                    type="text"
                    readOnly
                    value={user ? `${user.name} <${user.email}>` : ''}
                    className="w-full h-10 px-3 py-2 border-2 border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-[#64748B]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Send To</label>
                  <select
                    value={emailForm.recipientType}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, recipientType: e.target.value }))}
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  >
                    <option value="single">Single Recipient (email address)</option>
                    <option value="class-parents">All Parents of a Class</option>
                    <option value="standard-parents">All Parents of a Standard</option>
                    <option value="all-parents">All Parents</option>
                    <option value="all-staff">All Staff</option>
                    <option value="specific-students-parents">Specific Students' Parents</option>
                  </select>
                </div>

                {emailForm.recipientType === 'single' && (
                  <div>
                    <label htmlFor="email-to" className="block text-sm font-medium text-[#0F172A] mb-2">Recipient Email</label>
                    <input
                      id="email-to"
                      type="email"
                      required
                      data-testid="email-recipient-input"
                      value={emailForm.toEmail}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, toEmail: e.target.value }))}
                      placeholder="recipient@example.com"
                      className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                    />
                  </div>
                )}

                {emailForm.recipientType === 'class-parents' && (
                  <div>
                    <label htmlFor="email-class" className="block text-sm font-medium text-[#0F172A] mb-2">Select Class</label>
                    <select
                      id="email-class"
                      required
                      value={emailForm.classId}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, classId: e.target.value }))}
                      className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                    >
                      <option value="">Select Class</option>
                      {classes.map(c => (
                        <option key={c._id} value={c._id}>{c.name} {c.section}</option>
                      ))}
                    </select>
                  </div>
                )}

                {emailForm.recipientType === 'standard-parents' && (
                  <div>
                    <label htmlFor="email-standard" className="block text-sm font-medium text-[#0F172A] mb-2">Select Standard</label>
                    <select
                      id="email-standard"
                      required
                      value={emailForm.standard}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, standard: e.target.value }))}
                      className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                    >
                      <option value="">Select Standard</option>
                      {STANDARDS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}

                {emailForm.recipientType === 'specific-students-parents' && (
                  <div>
                    <label htmlFor="specific-class" className="block text-sm font-medium text-[#0F172A] mb-2">Select Class</label>
                    <select
                      id="specific-class"
                      value={specificClassId}
                      onChange={(e) => handleSpecificClassChange(e.target.value)}
                      className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] mb-3"
                    >
                      <option value="">Select Class</option>
                      {classes.map(c => (
                        <option key={c._id} value={c._id}>{c.name} {c.section}</option>
                      ))}
                    </select>

                    {loadingStudents && (
                      <p className="text-sm text-[#64748B] py-2">Loading students...</p>
                    )}

                    {!loadingStudents && specificStudents.length > 0 && (
                      <div className="border-2 border-[#FCD34D] rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-[#FFFBEB] border-b border-[#FCD34D]">
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-[#0F172A]">
                            <input
                              type="checkbox"
                              checked={selectedStudentIds.size === specificStudents.length}
                              onChange={toggleAllStudents}
                              className="w-4 h-4 accent-[#4F46E5]"
                            />
                            Select All ({specificStudents.length} students)
                          </label>
                          {selectedStudentIds.size > 0 && (
                            <span className="text-xs text-[#4F46E5] font-medium">{selectedStudentIds.size} selected</span>
                          )}
                        </div>
                        <div className="max-h-48 overflow-y-auto divide-y divide-[#F1F5F9]">
                          {specificStudents.map(s => (
                            <label key={s.studentId} aria-label={s.studentName} className="flex items-center gap-3 px-4 py-2 hover:bg-[#F8FAFC] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedStudentIds.has(s.studentId)}
                                onChange={() => toggleStudent(s.studentId)}
                                className="w-4 h-4 accent-[#4F46E5] shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#0F172A] truncate">{s.studentName}</p>
                                <p className="text-xs text-[#64748B]">
                                  {s.rollNumber ? `Roll: ${s.rollNumber} · ` : ''}
                                  Parent: {s.parentName || '—'}
                                  {s.parentEmail ? ` (${s.parentEmail})` : ' (no email)'}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {!loadingStudents && specificClassId && specificStudents.length === 0 && (
                      <p className="text-sm text-[#64748B] py-2">No students found in this class.</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Subject</label>
                  <input
                    type="text"
                    required
                    data-testid="email-subject-input"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Important announcement"
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Message</label>
                  <textarea
                    required
                    data-testid="email-message-input"
                    value={emailForm.body}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, body: e.target.value }))}
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
                {/* <div className="p-3 rounded-lg border-2 border-[#FCD34D]">
                  <p className="font-medium text-[#0F172A]">SMS</p>
                  <p className="text-sm text-[#64748B]">Demo Mode</p>
                </div>
                <div className="p-3 rounded-lg border-2 border-[#FCD34D]">
                  <p className="font-medium text-[#0F172A]">WhatsApp</p>
                  <p className="text-sm text-[#64748B]">Demo Mode</p>
                </div> */}
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

      {activeTab === 'ptm' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Schedule PTM form */}
          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-[#4F46E5]/10">
                <Users size={24} className="text-[#4F46E5]" />
              </div>
              <h2 className="text-2xl font-semibold text-[#0F172A]">Schedule PTM</h2>
            </div>
            <form onSubmit={handlePtmSubmit} className="space-y-4">
              <div>
                <label htmlFor="ptm-title" className="block text-sm font-medium text-[#0F172A] mb-2">Title</label>
                <input id="ptm-title" type="text" required value={ptmForm.title} onChange={e => setPtmForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Term 1 Parent-Teacher Meeting" className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ptm-date" className="block text-sm font-medium text-[#0F172A] mb-2">Date</label>
                  <input id="ptm-date" type="date" required value={ptmForm.date} onChange={e => setPtmForm(p => ({ ...p, date: e.target.value }))} className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
                </div>
                <div>
                  <label htmlFor="ptm-time" className="block text-sm font-medium text-[#0F172A] mb-2">Time</label>
                  <input id="ptm-time" type="text" required value={ptmForm.time} onChange={e => setPtmForm(p => ({ ...p, time: e.target.value }))} placeholder="e.g. 10:00 AM – 1:00 PM" className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
                </div>
              </div>
              <div>
                <label htmlFor="ptm-venue" className="block text-sm font-medium text-[#0F172A] mb-2">Venue</label>
                <input id="ptm-venue" type="text" required value={ptmForm.venue} onChange={e => setPtmForm(p => ({ ...p, venue: e.target.value }))} placeholder="e.g. Main Hall" className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
              </div>
              <div>
                <label htmlFor="ptm-audience" className="block text-sm font-medium text-[#0F172A] mb-2">For</label>
                <select id="ptm-audience" value={ptmForm.targetAudience} onChange={e => setPtmForm(p => ({ ...p, targetAudience: e.target.value, classIds: [] }))} className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
                  <option value="all">All Parents</option>
                  <option value="class">Specific Classes</option>
                </select>
              </div>
              {ptmForm.targetAudience === 'class' && (
                <div>
                  <p className="block text-sm font-medium text-[#0F172A] mb-2">Select Classes</p>
                  <div className="border-2 border-[#FCD34D] rounded-lg max-h-40 overflow-y-auto divide-y divide-[#F1F5F9]">
                    {classes.map(c => (
                      <label key={c._id} className="flex items-center gap-3 px-4 py-2 hover:bg-[#FFFBEB] cursor-pointer">
                        <input type="checkbox" checked={ptmForm.classIds.includes(c._id)} onChange={() => togglePtmClass(c._id)} className="w-4 h-4 accent-[#4F46E5]" />
                        <span className="text-sm">{c.name} {c.section}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label htmlFor="ptm-notes" className="block text-sm font-medium text-[#0F172A] mb-2">Notes (optional)</label>
                <textarea id="ptm-notes" value={ptmForm.notes} onChange={e => setPtmForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Additional information for parents..." className="w-full px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] resize-none" />
              </div>
              <button type="submit" disabled={ptmLoading} className="w-full flex items-center justify-center gap-2 bg-[#4F46E5] text-white hover:bg-[#4338CA] h-10 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50">
                {ptmLoading ? 'Scheduling...' : <><Users size={18} /> Schedule PTM</>}
              </button>
            </form>
          </div>

          {/* Existing PTMs */}
          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
            <h3 className="text-xl font-bold mb-4">Scheduled PTMs</h3>
            {ptmList.length === 0 ? (
              <p className="text-[#64748B] text-center py-8">No PTM scheduled yet.</p>
            ) : (
              <div className="space-y-4">
                {ptmList.map(ptm => (
                  <div key={ptm._id} className="p-4 border-2 border-[#E2E8F0] rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-[#0F172A]">{ptm.title}</p>
                      <button onClick={() => handleDeletePtm(ptm._id)} className="text-[#DC2626] hover:bg-[#FEE2E2] p-1 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-[#64748B]"><span className="font-medium text-[#0F172A]">Date:</span> {new Date(ptm.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <p className="text-sm text-[#64748B]"><span className="font-medium text-[#0F172A]">Time:</span> {ptm.time}</p>
                    <p className="text-sm text-[#64748B]"><span className="font-medium text-[#0F172A]">Venue:</span> {ptm.venue}</p>
                    {ptm.targetAudience === 'class' && ptm.classIds?.length > 0 && (
                      <p className="text-xs text-[#4F46E5] mt-1 font-medium">
                        Classes: {ptm.classIds.map(c => `${c.name} ${c.section || ''}`).join(', ')}
                      </p>
                    )}
                    {ptm.targetAudience === 'all' && <p className="text-xs text-[#10B981] mt-1 font-medium">For all parents</p>}
                    {ptm.notes && <p className="text-xs text-[#64748B] mt-1 italic">"{ptm.notes}"</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Communication;