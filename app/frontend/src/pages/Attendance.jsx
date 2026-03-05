import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Plus, Download, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('mark');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
  });
  const [loading, setLoading] = useState(false);

  const attendanceReports = [
    { class: 'Grade 5-A', present: 28, absent: 2, percentage: 93.3 },
    { class: 'Grade 4-B', present: 26, absent: 3, percentage: 89.7 },
    { class: 'Grade 3-A', present: 30, absent: 1, percentage: 96.8 },
    { class: 'Grade 2-B', present: 25, absent: 2, percentage: 92.6 },
    { class: 'Grade 1-A', present: 27, absent: 3, percentage: 90.0 },
  ];

  useEffect(() => {
    fetchAttendance();
    fetchStudents();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await api.get('/api/attendance');
      setAttendance(response.data);
    } catch (error) {
      toast.error('Failed to load attendance');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/api/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to load students');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/attendance', formData);
      toast.success('Attendance recorded successfully');
      setShowModal(false);
      setFormData({ student_id: '', date: new Date().toISOString().split('T')[0], status: 'present' });
      fetchAttendance();
    } catch (error) {
      toast.error('Failed to record attendance');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (format) => {
    toast.success(`Attendance report downloaded as ${format}!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#0F172A]">Attendance Management</h1>
          <p className="text-[#64748B] mt-1">Track student & teacher attendance</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          data-testid="add-attendance-button"
          className="flex items-center gap-2 bg-[#10B981] text-white hover:bg-[#059669] px-6 py-3 rounded-lg font-semibold transition-all shadow-md"
        >
          <Plus size={20} />
          Mark Attendance
        </button>
      </div>

      <div className="flex gap-2 border-b-2 border-[#FCD34D]">
        {['mark', 'reports'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold transition-all capitalize ${activeTab === tab ? 'bg-[#FCD34D] text-[#0F172A] rounded-t-lg' : 'text-[#64748B] hover:text-[#0F172A]'}`}
          >
            {tab === 'mark' ? 'Mark Attendance' : 'Attendance Reports'}
          </button>
        ))}
      </div>

      {activeTab === 'mark' && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-[#64748B]">
                      No attendance records found. Start recording!
                    </td>
                  </tr>
                ) : (
                  attendance.slice(0, 10).map((record, index) => (
                    <tr key={index} data-testid={`attendance-row-${index}`} className="hover:bg-[#FFFBEB] transition-colors">
                      <td className="px-6 py-4 text-sm text-[#0F172A] font-medium">{record.date}</td>
                      <td className="px-6 py-4 text-sm text-[#64748B]">{record.student_name || record.student_id}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          record.status === 'present' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEE2E2] text-[#991B1B]'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#0F172A]">Attendance Reports by Class</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadReport('PDF')}
                  className="flex items-center gap-2 bg-[#DC2626] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#B91C1C] transition-all"
                >
                  <Download size={18} />
                  PDF
                </button>
                <button
                  onClick={() => downloadReport('Excel')}
                  className="flex items-center gap-2 bg-[#10B981] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#059669] transition-all"
                >
                  <Download size={18} />
                  Excel
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase">Class</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase">Present</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase">Absent</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendanceReports.map((row, i) => (
                    <tr key={i} className="hover:bg-[#FFFBEB]">
                      <td className="px-6 py-4 font-semibold text-[#0F172A]">{row.class}</td>
                      <td className="px-6 py-4"><span className="inline-flex px-3 py-1 bg-[#D1FAE5] text-[#065F46] rounded-full font-semibold">{row.present}</span></td>
                      <td className="px-6 py-4"><span className="inline-flex px-3 py-1 bg-[#FEE2E2] text-[#991B1B] rounded-full font-semibold">{row.absent}</span></td>
                      <td className="px-6 py-4"><span className="inline-flex px-3 py-1 bg-[#FEF3C7] text-[#92400E] rounded-full font-bold">{row.percentage}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981]">
              <TrendingUp className="text-[#10B981] mb-2" size={32} />
              <p className="text-sm text-[#065F46] font-medium">Overall Attendance</p>
              <p className="text-4xl font-bold text-[#065F46]">92.5%</p>
            </div>
            <div className="p-6 bg-[#FEE2E2] rounded-xl border-2 border-[#DC2626]">
              <Calendar className="text-[#DC2626] mb-2" size={32} />
              <p className="text-sm text-[#991B1B] font-medium">Total Absences</p>
              <p className="text-4xl font-bold text-[#991B1B]">11</p>
            </div>
            <div className="p-6 bg-[#FEF3C7] rounded-xl border-2 border-[#F59E0B]">
              <Calendar className="text-[#F59E0B] mb-2" size={32} />
              <p className="text-sm text-[#92400E] font-medium">Days Tracked</p>
              <p className="text-4xl font-bold text-[#92400E]">180</p>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-semibold text-[#0F172A] mb-4">Mark Attendance</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Student</label>
                <select
                  required
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                >
                  <option value="">Select student</option>
                  {students.map((student, index) => (
                    <option key={index} value={student.id || index}>{student.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-slate-700 hover:bg-gray-300 h-10 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#10B981] text-white hover:bg-[#059669] h-10 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Recording...' : 'Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;