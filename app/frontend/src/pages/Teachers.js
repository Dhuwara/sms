import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Plus, Edit, Trash2, Eye, Users, BookOpen, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    subject: '',
    qualification: '',
    experience: '',
    assigned_classes: [],
    employee_id: '',
    status: 'active'
  });

  useEffect(() => {
    fetchTeachers();
    fetchClasses();
  }, []);

  const fetchTeachers = async () => {
    // Mock data for demo - in production, fetch from API
    setTeachers([
      { id: '1', name: 'Mrs. Sarah Johnson', email: 'sarah@ajmschool.com', contact: '+91 9876543210', subject: 'Mathematics', qualification: 'M.Sc Mathematics', experience: '8 years', assigned_classes: ['Grade 5-A', 'Grade 4-B'], employee_id: 'T001', status: 'active', workload: 30 },
      { id: '2', name: 'Mr. John Smith', email: 'john@ajmschool.com', contact: '+91 9876543211', subject: 'Science', qualification: 'M.Sc Physics', experience: '6 years', assigned_classes: ['Grade 6-A'], employee_id: 'T002', status: 'active', workload: 25 },
      { id: '3', name: 'Ms. Emily Davis', email: 'emily@ajmschool.com', contact: '+91 9876543212', subject: 'English', qualification: 'M.A English', experience: '10 years', assigned_classes: ['Grade 7-A', 'Grade 6-B'], employee_id: 'T003', status: 'active', workload: 28 },
      { id: '4', name: 'Mr. Michael Brown', email: 'michael@ajmschool.com', contact: '+91 9876543213', subject: 'Social Studies', qualification: 'M.A History', experience: '5 years', assigned_classes: ['Grade 5-B'], employee_id: 'T004', status: 'active', workload: 22 },
      { id: '5', name: 'Mrs. Jessica Wilson', email: 'jessica@ajmschool.com', contact: '+91 9876543214', subject: 'Hindi', qualification: 'M.A Hindi', experience: '7 years', assigned_classes: ['Grade 4-A', 'Grade 5-A'], employee_id: 'T005', status: 'active', workload: 26 },
    ]);
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get('/api/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Failed to load classes');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.success(isEditing ? 'Teacher updated successfully!' : 'Teacher added successfully!');
    setShowModal(false);
    setIsEditing(false);
    setFormData({ name: '', email: '', contact: '', subject: '', qualification: '', experience: '', assigned_classes: [], employee_id: '', status: 'active' });
    fetchTeachers();
  };

  const handleEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setFormData(teacher);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = (teacherId) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      toast.success('Teacher deleted successfully!');
      fetchTeachers();
    }
  };

  const handleView = (teacher) => {
    setSelectedTeacher(teacher);
    setShowViewModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#0F172A]">Teachers Management</h1>
          <p className="text-[#64748B] mt-1">Manage teacher profiles, subjects & workload</p>
        </div>
        <button
          onClick={() => {
            setIsEditing(false);
            setFormData({ name: '', email: '', contact: '', subject: '', qualification: '', experience: '', assigned_classes: [], employee_id: '', status: 'active' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-[#F59E0B] text-white hover:bg-[#D97706] px-6 py-3 rounded-lg font-semibold transition-all shadow-md"
        >
          <Plus size={20} />
          Add Teacher
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="p-6 rounded-xl border-2 border-[#FCD34D] bg-gradient-to-br from-[#FEF3C7] to-white">
          <Users className="text-[#F59E0B] mb-2" size={32} />
          <p className="text-sm text-[#64748B]">Total Teachers</p>
          <p className="text-3xl font-bold text-[#0F172A]">{teachers.length}</p>
        </div>
        <div className="p-6 rounded-xl border-2 border-[#FCD34D] bg-gradient-to-br from-[#FEE2E2] to-white">
          <BookOpen className="text-[#DC2626] mb-2" size={32} />
          <p className="text-sm text-[#64748B]">Subjects Taught</p>
          <p className="text-3xl font-bold text-[#0F172A]">12</p>
        </div>
        <div className="p-6 rounded-xl border-2 border-[#FCD34D] bg-gradient-to-br from-[#D1FAE5] to-white">
          <Calendar className="text-[#10B981] mb-2" size={32} />
          <p className="text-sm text-[#64748B]">Avg Workload</p>
          <p className="text-3xl font-bold text-[#0F172A]">26 hrs/week</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase">Employee ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase">Subject</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase">Assigned Classes</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase">Workload</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-[#FFFBEB] transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-[#0F172A]">{teacher.employee_id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-[#0F172A]">{teacher.name}</td>
                  <td className="px-6 py-4 text-sm text-[#64748B]">{teacher.subject}</td>
                  <td className="px-6 py-4 text-sm text-[#64748B]">
                    {teacher.assigned_classes.map((cls, i) => (
                      <span key={i} className="inline-block bg-[#FEF3C7] px-2 py-1 rounded text-xs mr-1 mb-1">
                        {cls}
                      </span>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex px-2 py-1 bg-[#D1FAE5] text-[#065F46] rounded-full text-xs font-semibold">
                      {teacher.workload} hrs
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#64748B]">{teacher.contact}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleView(teacher)} className="p-2 text-[#4F46E5] hover:bg-[#EEF2FF] rounded-lg transition-colors">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => handleEdit(teacher)} className="p-2 text-[#F59E0B] hover:bg-[#FEF3C7] rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(teacher.id)} className="p-2 text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-6">
              {isEditing ? 'Edit Teacher' : 'Add New Teacher'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Contact *</label>
                  <input
                    type="tel"
                    required
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Subject *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Qualification *</label>
                  <input
                    type="text"
                    required
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Experience *</label>
                  <input
                    type="text"
                    required
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    placeholder="e.g., 5 years"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  >
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="resigned">Resigned</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t-2 border-[#FCD34D]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-[#0F172A] hover:bg-gray-300 h-10 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#F59E0B] text-white hover:bg-[#D97706] h-10 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  {isEditing ? 'Update Teacher' : 'Add Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-6">Teacher Profile</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2] rounded-lg">
                <div className="w-20 h-20 bg-[#F59E0B] text-white rounded-full flex items-center justify-center text-3xl font-bold">
                  {selectedTeacher.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#0F172A]">{selectedTeacher.name}</h3>
                  <p className="text-[#64748B]">{selectedTeacher.subject} Teacher</p>
                  <p className="text-sm text-[#64748B]">ID: {selectedTeacher.employee_id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-[#64748B]">Email</p>
                  <p className="font-semibold">{selectedTeacher.email}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-[#64748B]">Contact</p>
                  <p className="font-semibold">{selectedTeacher.contact}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-[#64748B]">Qualification</p>
                  <p className="font-semibold">{selectedTeacher.qualification}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-[#64748B]">Experience</p>
                  <p className="font-semibold">{selectedTeacher.experience}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg col-span-2">
                  <p className="text-sm text-[#64748B] mb-2">Assigned Classes</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeacher.assigned_classes.map((cls, i) => (
                      <span key={i} className="bg-[#FEF3C7] px-3 py-1 rounded-full text-sm font-semibold">
                        {cls}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowViewModal(false)}
                className="w-full bg-[#F59E0B] text-white hover:bg-[#D97706] h-10 px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
