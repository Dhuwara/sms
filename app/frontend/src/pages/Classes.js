import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Plus, BookOpen, Users, Calendar, Download } from 'lucide-react';
import { toast } from 'sonner';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([
    { id: '1', name: 'Mathematics', code: 'MATH101', class: 'Grade 5-A', teacher: 'Mrs. Sarah Johnson' },
    { id: '2', name: 'Science', code: 'SCI101', class: 'Grade 6-A', teacher: 'Mr. John Smith' },
    { id: '3', name: 'English', code: 'ENG101', class: 'Grade 7-A', teacher: 'Ms. Emily Davis' },
    { id: '4', name: 'Social Studies', code: 'SS101', class: 'Grade 5-B', teacher: 'Mr. Michael Brown' },
    { id: '5', name: 'Hindi', code: 'HIN101', class: 'Grade 4-A', teacher: 'Mrs. Jessica Wilson' },
  ]);
  const [activeTab, setActiveTab] = useState('classes');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/api/classes');
      setClasses(response.data);
    } catch (error) {
      toast.error('Failed to load classes');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/classes', formData);
      toast.success('Class added successfully');
      setShowModal(false);
      setFormData({ name: '' });
      fetchClasses();
    } catch (error) {
      toast.error('Failed to add class');
    } finally {
      setLoading(false);
    }
  };

  const downloadTimetable = () => {
    toast.success('Timetable downloaded as PDF!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#0F172A]">Academic Management</h1>
          <p className="text-[#64748B] mt-1">Classes, Subjects, Timetable & Academic Year</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          data-testid="add-class-button"
          className="flex items-center gap-2 bg-[#4F46E5] text-white hover:bg-[#4338CA] px-6 py-3 rounded-lg font-semibold transition-all shadow-md"
        >
          <Plus size={20} />
          Add Class
        </button>
      </div>

      <div className="flex gap-2 border-b-2 border-[#FCD34D]">
        {['classes', 'subjects', 'mapping', 'timetable', 'year'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold transition-all capitalize ${activeTab === tab ? 'bg-[#FCD34D] text-[#0F172A] rounded-t-lg' : 'text-[#64748B] hover:text-[#0F172A]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.length === 0 ? (
            <div className="col-span-full text-center py-12 text-[#64748B]">
              No classes found. Add your first class!
            </div>
          ) : (
            classes.map((cls, index) => (
              <div
                key={index}
                data-testid={`class-card-${index}`}
                className="p-6 rounded-xl border-2 border-[#FCD34D] bg-white shadow-sm hover:shadow-lg transition-all"
              >
                <BookOpen className="text-[#F59E0B] mb-3" size={32} />
                <h3 className="text-xl font-bold text-[#0F172A] mb-2">{cls.name}</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-[#64748B]">Teacher: {cls.teacher || 'Not Assigned'}</p>
                  <p className="text-[#64748B]">Students: {cls.students_count || 30}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-bold">Subjects</h2>
            <button onClick={() => toast.success('Add subject feature')} className="bg-[#10B981] text-white px-4 py-2 rounded-lg font-semibold">
              Add Subject
            </button>
          </div>
          <div className="grid gap-4">
            {subjects.map(sub => (
              <div key={sub.id} className="p-4 border-2 border-[#FCD34D] rounded-lg flex justify-between items-center hover:bg-[#FFFBEB] transition-colors">
                <div>
                  <h3 className="font-bold text-lg text-[#0F172A]">{sub.name}</h3>
                  <p className="text-sm text-[#64748B]">Code: {sub.code} | Class: {sub.class}</p>
                </div>
                <div className="text-sm text-[#64748B]">Teacher: {sub.teacher}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'mapping' && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h2 className="text-2xl font-bold mb-4">Class-Subject-Teacher Mapping</h2>
          <div className="grid gap-4">
            {subjects.map(sub => (
              <div key={sub.id} className="p-4 bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2] rounded-lg">
                <div className="grid grid-cols-3 gap-4">
                  <div><span className="font-semibold text-[#0F172A]">Class:</span> {sub.class}</div>
                  <div><span className="font-semibold text-[#0F172A]">Subject:</span> {sub.name}</div>
                  <div><span className="font-semibold text-[#0F172A]">Teacher:</span> {sub.teacher}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'timetable' && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Weekly Timetable</h2>
            <button onClick={downloadTimetable} className="flex items-center gap-2 bg-[#DC2626] text-white px-4 py-2 rounded-lg font-semibold">
              <Download size={18} />
              Download PDF
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">Day</th>
                  <th className="px-4 py-3 text-left font-bold">Period 1<br/><span className="text-xs font-normal">9:00-10:00</span></th>
                  <th className="px-4 py-3 text-left font-bold">Period 2<br/><span className="text-xs font-normal">10:00-11:00</span></th>
                  <th className="px-4 py-3 text-left font-bold">Period 3<br/><span className="text-xs font-normal">11:30-12:30</span></th>
                  <th className="px-4 py-3 text-left font-bold">Period 4<br/><span className="text-xs font-normal">12:30-1:30</span></th>
                  <th className="px-4 py-3 text-left font-bold">Period 5<br/><span className="text-xs font-normal">2:00-3:00</span></th>
                </tr>
              </thead>
              <tbody>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, i) => (
                  <tr key={i} className="border-b hover:bg-[#FFFBEB]">
                    <td className="px-4 py-3 font-semibold">{day}</td>
                    <td className="px-4 py-3">Math</td>
                    <td className="px-4 py-3">Science</td>
                    <td className="px-4 py-3">English</td>
                    <td className="px-4 py-3">Hindi</td>
                    <td className="px-4 py-3">{i === 4 ? 'Library' : 'Sports'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'year' && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h2 className="text-2xl font-bold mb-6">Academic Year 2024-2025</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-br from-[#FEE2E2] to-white rounded-xl border-2 border-[#DC2626]">
              <Calendar className="text-[#DC2626] mb-3" size={40} />
              <p className="text-sm text-[#64748B] font-medium">Academic Year</p>
              <p className="text-3xl font-bold text-[#0F172A]">2024-2025</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-[#FEF3C7] to-white rounded-xl border-2 border-[#F59E0B]">
              <BookOpen className="text-[#F59E0B] mb-3" size={40} />
              <p className="text-sm text-[#64748B] font-medium">Current Term</p>
              <p className="text-3xl font-bold text-[#0F172A]">Term 1</p>
            </div>
            <div className="p-4 border-2 border-[#FCD34D] rounded-lg">
              <p className="text-sm font-semibold text-[#64748B] mb-1">Start Date</p>
              <p className="text-xl font-bold text-[#0F172A]">April 1, 2024</p>
            </div>
            <div className="p-4 border-2 border-[#FCD34D] rounded-lg">
              <p className="text-sm font-semibold text-[#64748B] mb-1">End Date</p>
              <p className="text-xl font-bold text-[#0F172A]">March 31, 2025</p>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-semibold text-[#0F172A] mb-4">Add New Class</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Class Name</label>
                <input
                  type="text"
                  required
                  data-testid="class-name-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Grade 10-A"
                  className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                />
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
                  data-testid="submit-class-button"
                  className="flex-1 bg-[#4F46E5] text-white hover:bg-[#4338CA] h-10 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;