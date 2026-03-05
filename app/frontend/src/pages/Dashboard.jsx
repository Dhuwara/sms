import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Users, BookOpen, GraduationCap, DollarSign, UserPlus, Calendar, Bell, MessageSquare, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_students: 0,
    total_classes: 0,
    total_teachers: 0,
    total_staff: 0,
    pending_fees: 0,
    present_today: 0,
    absent_today: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  
  const [studentForm, setStudentForm] = useState({
    name: '',
    dob: '',
    gender: 'male',
    parent_contact: '',
    address: '',
    class: '',
    roll_no: '',
    status: 'active'
  });

  const [teacherForm, setTeacherForm] = useState({
    name: '',
    subject: '',
    contact: '',
    email: ''
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    priority: 'normal'
  });

  useEffect(() => {
    fetchStats();
    fetchRecentActivities();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    // Mock recent activities - in production, fetch from API
    setRecentActivities([
      { id: 1, type: 'success', message: '5 new students added today', time: '2 hours ago' },
      { id: 2, type: 'info', message: 'Attendance marked for Grade 5-A', time: '3 hours ago' },
      { id: 3, type: 'warning', message: '15 fee payments pending', time: '5 hours ago' },
      { id: 4, type: 'success', message: 'Mid-term exam results published', time: '1 day ago' },
      { id: 5, type: 'info', message: 'Parent-teacher meeting scheduled', time: '2 days ago' },
    ]);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/students', studentForm);
      toast.success('Student added successfully!');
      setShowAddStudent(false);
      setStudentForm({ name: '', dob: '', gender: 'male', parent_contact: '', address: '', class: '', roll_no: '', status: 'active' });
      fetchStats();
      navigate('/students');
    } catch (error) {
      toast.error('Failed to add student');
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    toast.success('Teacher added successfully! (Demo)');
    setShowAddTeacher(false);
    setTeacherForm({ name: '', subject: '', contact: '', email: '' });
  };

  const handleAnnouncement = async (e) => {
    e.preventDefault();
    toast.success('Announcement sent successfully! (Demo)');
    setShowAnnouncement(false);
    setAnnouncementForm({ title: '', message: '', priority: 'normal' });
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.total_students,
      icon: Users,
      color: 'text-[#DC2626]',
      bg: 'bg-[#FEE2E2]',
      trend: '+5 this week'
    },
    {
      title: 'Total Classes',
      value: stats.total_classes,
      icon: BookOpen,
      color: 'text-[#F59E0B]',
      bg: 'bg-[#FEF3C7]',
      trend: '8 sections'
    },
    {
      title: 'Total Teachers',
      value: stats.total_teachers,
      icon: GraduationCap,
      color: 'text-[#10B981]',
      bg: 'bg-[#D1FAE5]',
      trend: '3 new this month'
    },
    {
      title: 'Pending Fees',
      value: `₹${stats.pending_fees || 0}`,
      icon: DollarSign,
      color: 'text-[#DC2626]',
      bg: 'bg-[#FEE2E2]',
      trend: '15 students'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F59E0B]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2] rounded-2xl p-8 border-2 border-[#FCD34D]">
        <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-2">
          Welcome back, {user?.full_name}! 👋
        </h1>
        <p className="text-lg text-[#64748B]">
          Here's what's happening in AJM International Institution today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              data-testid={`stat-${stat.title.toLowerCase().replace(' ', '-')}`}
              className="p-6 rounded-xl border-2 border-[#FCD34D] bg-white shadow-sm hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <Icon size={28} className={stat.color} />
                </div>
                <TrendingUp size={20} className="text-green-500" />
              </div>
              <h3 className="text-sm font-medium text-[#64748B] mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-[#0F172A] mb-2">{stat.value}</p>
              <p className="text-xs text-[#64748B]">{stat.trend}</p>
            </div>
          );
        })}
      </div>

      {/* Attendance Summary */}
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
          <Calendar className="text-[#F59E0B]" size={28} />
          Today's Attendance Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#D1FAE5] rounded-lg">
            <p className="text-sm text-[#064E3B] font-medium">Present</p>
            <p className="text-3xl font-bold text-[#10B981]">142</p>
          </div>
          <div className="p-4 bg-[#FEE2E2] rounded-lg">
            <p className="text-sm text-[#7F1D1D] font-medium">Absent</p>
            <p className="text-3xl font-bold text-[#DC2626]">8</p>
          </div>
          <div className="p-4 bg-[#FEF3C7] rounded-lg">
            <p className="text-sm text-[#78350F] font-medium">Attendance Rate</p>
            <p className="text-3xl font-bold text-[#F59E0B]">94.7%</p>
          </div>
        </div>
      </div>

      {/* Fee Collection Summary */}
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
          <DollarSign className="text-[#10B981]" size={28} />
          Fee Collection Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-[#D1FAE5] rounded-lg">
            <p className="text-sm text-[#064E3B] font-medium">Collected</p>
            <p className="text-2xl font-bold text-[#10B981]">₹4,50,000</p>
          </div>
          <div className="p-4 bg-[#FEF3C7] rounded-lg">
            <p className="text-sm text-[#78350F] font-medium">Pending</p>
            <p className="text-2xl font-bold text-[#F59E0B]">₹75,000</p>
          </div>
          <div className="p-4 bg-[#FEE2E2] rounded-lg">
            <p className="text-sm text-[#7F1D1D] font-medium">Overdue</p>
            <p className="text-2xl font-bold text-[#DC2626]">₹25,000</p>
          </div>
          <div className="p-4 bg-[#E0E7FF] rounded-lg">
            <p className="text-sm text-[#312E81] font-medium">Total Expected</p>
            <p className="text-2xl font-bold text-[#4F46E5]">₹5,50,000</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="p-6 rounded-xl border-2 border-[#FCD34D] bg-white shadow-sm">
          <h2 className="text-2xl font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
            <Bell className="text-[#DC2626]" size={28} />
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => setShowAddStudent(true)}
              data-testid="quick-add-student"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2] hover:shadow-md transition-all text-[#0F172A] font-semibold"
            >
              <UserPlus size={20} className="text-[#DC2626]" />
              Add New Student
            </button>
            <button
              onClick={() => setShowAddTeacher(true)}
              data-testid="quick-add-teacher"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2] hover:shadow-md transition-all text-[#0F172A] font-semibold"
            >
              <GraduationCap size={20} className="text-[#F59E0B]" />
              Add New Teacher
            </button>
            <button
              onClick={() => navigate('/attendance')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2] hover:shadow-md transition-all text-[#0F172A] font-semibold"
            >
              <Calendar size={20} className="text-[#10B981]" />
              Record Attendance
            </button>
            <button
              onClick={() => setShowAnnouncement(true)}
              data-testid="quick-announcement"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2] hover:shadow-md transition-all text-[#0F172A] font-semibold"
            >
              <MessageSquare size={20} className="text-[#4F46E5]" />
              Send Announcement
            </button>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="p-6 rounded-xl border-2 border-[#FCD34D] bg-white shadow-sm">
          <h2 className="text-2xl font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
            <AlertCircle className="text-[#F59E0B]" size={28} />
            Recent Activities & Alerts
          </h2>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="mt-1">
                  {activity.type === 'success' && <CheckCircle size={18} className="text-green-500" />}
                  {activity.type === 'warning' && <AlertCircle size={18} className="text-yellow-500" />}
                  {activity.type === 'info' && <Bell size={18} className="text-blue-500" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#0F172A]">{activity.message}</p>
                  <p className="text-xs text-[#64748B] mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-4">Add New Student</h2>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Student Name *</label>
                  <input
                    type="text"
                    required
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={studentForm.dob}
                    onChange={(e) => setStudentForm({ ...studentForm, dob: e.target.value })}
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Gender *</label>
                  <select
                    value={studentForm.gender}
                    onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })}
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={studentForm.roll_no}
                    onChange={(e) => setStudentForm({ ...studentForm, roll_no: e.target.value })}
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    placeholder="e.g., A001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Class *</label>
                  <input
                    type="text"
                    required
                    value={studentForm.class}
                    onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    placeholder="e.g., Grade 5-A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Parent Contact *</label>
                  <input
                    type="tel"
                    required
                    value={studentForm.parent_contact}
                    onChange={(e) => setStudentForm({ ...studentForm, parent_contact: e.target.value })}
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Address *</label>
                <textarea
                  required
                  value={studentForm.address}
                  onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  rows="3"
                  placeholder="Enter full address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Status *</label>
                <select
                  value={studentForm.status}
                  onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value })}
                  className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                >
                  <option value="active">Active</option>
                  <option value="graduated">Graduated</option>
                  <option value="transferred">Transferred</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddStudent(false)}
                  className="flex-1 bg-gray-200 text-[#0F172A] hover:bg-gray-300 h-10 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#DC2626] text-white hover:bg-[#B91C1C] h-10 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Teacher Modal */}
      {showAddTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-4">Add New Teacher</h2>
            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Teacher Name *</label>
                <input
                  type="text"
                  required
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                  className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Subject *</label>
                <input
                  type="text"
                  required
                  value={teacherForm.subject}
                  onChange={(e) => setTeacherForm({ ...teacherForm, subject: e.target.value })}
                  className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Contact Number *</label>
                <input
                  type="tel"
                  required
                  value={teacherForm.contact}
                  onChange={(e) => setTeacherForm({ ...teacherForm, contact: e.target.value })}
                  className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={teacherForm.email}
                  onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                  className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddTeacher(false)}
                  className="flex-1 bg-gray-200 text-[#0F172A] hover:bg-gray-300 h-10 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#F59E0B] text-white hover:bg-[#D97706] h-10 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Add Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnouncement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-4">Send Announcement</h2>
            <form onSubmit={handleAnnouncement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  placeholder="Announcement title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Message *</label>
                <textarea
                  required
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  rows="4"
                  placeholder="Enter announcement message"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Priority *</label>
                <select
                  value={announcementForm.priority}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
                  className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAnnouncement(false)}
                  className="flex-1 bg-gray-200 text-[#0F172A] hover:bg-gray-300 h-10 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#4F46E5] text-white hover:bg-[#4338CA] h-10 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Send Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;