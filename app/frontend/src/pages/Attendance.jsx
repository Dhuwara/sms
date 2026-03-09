import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Plus, Download, Calendar, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const Attendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/api/classes');
      setClasses(response.data || []);
    } catch (error) {
      toast.error('Failed to load classes');
    }
  };

  const handleClassSelect = async (classId) => {
    setSelectedClass(classId);
    if (classId) {
      await loadStudents(classId);
    }
  };

  const loadStudents = async (classId) => {
    try {
      const response = await api.get(`/api/attendance/class/${classId}?date=${selectedDate}`);
      setStudents(response.data || []);
      const attendanceObj = {};
      response.data?.forEach((student) => {
        attendanceObj[student._id] = student.status || 'absent';
      });
      setAttendance(attendanceObj);
    } catch (error) {
      toast.error('Failed to load students');
      setStudents([]);
    }
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    if (selectedClass) {
      try {
        const response = await api.get(`/api/attendance/class/${selectedClass}?date=${date}`);
        setStudents(response.data || []);
        const attendanceObj = {};
        response.data?.forEach((student) => {
          attendanceObj[student._id] = student.status || 'absent';
        });
        setAttendance(attendanceObj);
      } catch (error) {
        toast.error('Failed to load attendance');
      }
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance({
      ...attendance,
      [studentId]: status,
    });
  };

  const handleMarkAllPresent = () => {
    const updated = {};
    students.forEach((student) => {
      updated[student._id] = 'present';
    });
    setAttendance(updated);
    toast.success('All marked as present');
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass) {
      toast.error('Please select a class');
      return;
    }

    const records = students.map((student) => ({
      studentId: student._id,
      status: attendance[student._id] || 'absent',
    }));

    setLoading(true);
    try {
      await api.post('/api/attendance', {
        classId: selectedClass,
        date: selectedDate,
        records,
      });
      toast.success('Attendance saved successfully');
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Failed to save attendance');
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = async () => {
    if (!selectedClass) {
      toast.error('Select a class first');
      return;
    }

    try {
      const data = students.map((student) => ({
        'Roll No': student.rollNumber || '-',
        'Name': student.name,
        'Date': selectedDate,
        'Status': (attendance[student._id] || 'absent').toUpperCase(),
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      ws['!cols'] = [
        { wch: 12 },
        { wch: 20 },
        { wch: 12 },
        { wch: 12 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

      const className = classes.find(c => c._id === selectedClass)?.name;
      XLSX.writeFile(wb, `${className}-attendance-${selectedDate}.xlsx`);
      toast.success('Excel exported');
    } catch (error) {
      toast.error('Failed to export excel');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-[#0F172A]">Attendance Management</h1>
        <p className="text-[#64748B] mt-1">Mark and manage student attendance</p>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-2">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => handleClassSelect(e.target.value)}
              className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
            >
              <option value="">Select class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>{cls.name}-{cls.section}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-2">Select Date</label>
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-[#F59E0B]" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="flex-1 h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
              />
            </div>
          </div>
        </div>

        {selectedClass && (
          <div className="flex gap-3 pt-4 border-t-2 border-[#FCD34D]">
            <button
              onClick={handleMarkAllPresent}
              className="flex items-center gap-2 px-4 py-2 bg-[#10B981] text-white hover:bg-[#059669] rounded-lg font-semibold"
            >
              <Check size={18} />
              Mark All Present
            </button>
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-[#6366F1] text-white hover:bg-[#4F46E5] rounded-lg font-semibold"
            >
              <Download size={18} />
              Export Excel
            </button>
            <button
              onClick={handleSaveAttendance}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-[#DC2626] text-white hover:bg-[#B91C1C] rounded-lg font-semibold disabled:opacity-50 ml-auto"
            >
              <Plus size={18} />
              {loading ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        )}
      </div>

      {selectedClass && students.length > 0 ? (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A]">Roll No</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A]">Student Name</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-[#0F172A]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-[#FFFBEB]">
                    <td className="px-6 py-4 text-sm font-semibold text-[#0F172A]">{student.rollNumber || '-'}</td>
                    <td className="px-6 py-4 text-sm text-[#0F172A]">{student.name}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleAttendanceChange(student._id, 'present')}
                          className={`flex items-center gap-1 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                            attendance[student._id] === 'present'
                              ? 'bg-[#10B981] text-white'
                              : 'bg-gray-200 text-[#0F172A] hover:bg-gray-300'
                          }`}
                        >
                          <Check size={16} />
                          Present
                        </button>
                        <button
                          onClick={() => handleAttendanceChange(student._id, 'absent')}
                          className={`flex items-center gap-1 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                            attendance[student._id] === 'absent'
                              ? 'bg-[#DC2626] text-white'
                              : 'bg-gray-200 text-[#0F172A] hover:bg-gray-300'
                          }`}
                        >
                          <X size={16} />
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : selectedClass ? (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6 text-center">
          <p className="text-[#64748B]">No students found for this class</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6 text-center">
          <p className="text-[#64748B]">Select a class to view students</p>
        </div>
      )}
    </div>
  );
};

export default Attendance;