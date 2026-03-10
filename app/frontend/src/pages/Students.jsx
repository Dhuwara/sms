import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Plus, Edit, Trash2, Eye, Search, Filter, X } from 'lucide-react';
import { toast } from 'sonner';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: 'male',
    parent_contact: '',
    address: '',
    studentType: 'dayScholar',
    password: '',
    parent_name: '',
    parent_email: '',
    parent_password: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.dob) errors.dob = 'Date of birth is required';
    if (!formData.parent_contact.trim()) errors.parent_contact = 'Contact number is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, statusFilter]);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/api/students');
      setStudents(response.data);
    } catch (error) {
      toast.error('Failed to load students');
    }
  };

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.roll_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter);
    }

    setFilteredStudents(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEditing && selectedStudent) {
        await api.put(`/api/students/${selectedStudent._id}`, formData);
        toast.success('Student updated successfully');
      } else {
        await api.post('/api/students', formData);
        toast.success('Student added successfully');
      }
      setShowModal(false);
      setFormData({ name: '', dob: '', gender: 'male', parent_contact: '', address: '', studentType: 'dayScholar', password: '', parent_name: '', parent_email: '', parent_password: '', status: 'active' });
      setFormErrors({});
      setIsEditing(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (error) {
      toast.error(isEditing ? 'Failed to update student' : 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name || '',
      dob: student.dob || '',
      gender: student.gender || 'male',
      parent_contact: student.parent_contact || '',
      address: student.address || '',
      studentType: student.studentType || 'dayScholar',
      password: '',
      parent_name: student.parent_name || '',
      parent_email: student.parent_email || '',
      parent_password: '',
      status: student.status || 'active'
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.delete(`/api/students/${studentId}`);
        toast.success('Student deleted successfully');
        fetchStudents();
      } catch (error) {
        toast.error('Failed to delete student');
      }
    }
  };

  const handleView = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-[#D1FAE5] text-[#065F46]';
      case 'graduated': return 'bg-[#DBEAFE] text-[#1E40AF]';
      case 'transferred': return 'bg-[#FEE2E2] text-[#991B1B]';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#0F172A]">Students Management</h1>
          <p className="text-[#64748B] mt-1">Manage student records and profiles</p>
        </div>
        <button
          onClick={() => {
            setIsEditing(false);
            setSelectedStudent(null);
            setFormData({ name: '', dob: '', gender: 'male', parent_contact: '', address: '', studentType: 'dayScholar', password: '', parent_name: '', parent_email: '', parent_password: '', status: 'active' });
            setFormErrors({});
            setShowModal(true);
          }}
          data-testid="add-student-button"
          className="flex items-center gap-2 bg-[#DC2626] text-white hover:bg-[#B91C1C] px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
        >
          <Plus size={20} />
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, roll no, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-4 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="graduated">Graduated</option>
              <option value="transferred">Transferred</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase tracking-wider">Roll No</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase tracking-wider">Class</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase tracking-wider">DOB</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase tracking-wider">Parent Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-[#64748B]">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-lg font-medium">No students found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => (
                  <tr key={student.id || index} data-testid={`student-row-${index}`} className="hover:bg-[#FFFBEB] transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-[#0F172A]">{student.roll_no || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-[#0F172A]">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-[#64748B]">{student.class || 'Not Assigned'}</td>
                    <td className="px-6 py-4 text-sm text-[#64748B]">{student.dob}</td>
                    <td className="px-6 py-4 text-sm text-[#64748B]">{student.parent_contact}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status || 'active')}`}>
                        {(student.status || 'active').charAt(0).toUpperCase() + (student.status || 'active').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(student)}
                          className="p-2 text-[#4F46E5] hover:bg-[#EEF2FF] rounded-lg transition-colors"
                          title="View Profile"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(student)}
                          className="p-2 text-[#F59E0B] hover:bg-[#FEF3C7] rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(student._id)}
                          className="p-2 text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#0F172A]">
                {isEditing ? 'Edit Student' : 'Add New Student'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setIsEditing(false);
                  setSelectedStudent(null);
                  setFormErrors({});
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-[#FEF3C7] p-4 rounded-lg">
                <h3 className="font-semibold text-[#0F172A] mb-3">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setFormErrors({ ...formErrors, name: '' }); }}
                      className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                      placeholder="Enter full name"
                    />
                    {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">Date of Birth *</label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => { setFormData({ ...formData, dob: e.target.value }); setFormErrors({ ...formErrors, dob: '' }); }}
                      className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    />
                    {formErrors.dob && <p className="text-red-500 text-xs mt-1">{formErrors.dob}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">Gender *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">Student Type *</label>
                    <select
                      value={formData.studentType}
                      onChange={(e) => setFormData({ ...formData, studentType: e.target.value })}
                      className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    >
                      <option value="dayScholar">Day Scholar</option>
                      <option value="hosteller">Hosteller</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                      placeholder={isEditing ? 'Leave blank to keep current' : 'Default: Student@123'}
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
                      <option value="graduated">Graduated</option>
                      <option value="transferred">Transferred</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-[#FEE2E2] p-4 rounded-lg">
                <h3 className="font-semibold text-[#0F172A] mb-3">Parent/Guardian Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">Parent Name</label>
                    <input
                      type="text"
                      value={formData.parent_name}
                      onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                      className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                      placeholder="Father/Mother name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">Contact Number *</label>
                    <input
                      type="tel"
                      value={formData.parent_contact}
                      onChange={(e) => { setFormData({ ...formData, parent_contact: e.target.value }); setFormErrors({ ...formErrors, parent_contact: '' }); }}
                      className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                      placeholder="+91 XXXXX XXXXX"
                    />
                    {formErrors.parent_contact && <p className="text-red-500 text-xs mt-1">{formErrors.parent_contact}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">Parent Email</label>
                    <input
                      type="email"
                      value={formData.parent_email}
                      onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                      className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                      placeholder="parent@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">Parent Password</label>
                    <input
                      type="password"
                      value={formData.parent_password}
                      onChange={(e) => setFormData({ ...formData, parent_password: e.target.value })}
                      className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                      placeholder={isEditing ? 'Leave blank to keep current' : 'Default: Parent@123'}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Address *</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => { setFormData({ ...formData, address: e.target.value }); setFormErrors({ ...formErrors, address: '' }); }}
                  className="w-full px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  rows="3"
                  placeholder="Enter full residential address"
                />
                {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
              </div>
              
              <div className="flex gap-3 pt-4 border-t-2 border-[#FCD34D]">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setIsEditing(false);
                    setSelectedStudent(null);
                    setFormErrors({});
                  }}
                  className="flex-1 bg-gray-200 text-[#0F172A] hover:bg-gray-300 h-10 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#DC2626] text-white hover:bg-[#B91C1C] h-10 px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : isEditing ? 'Update Student' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {showViewModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#0F172A]">Student Profile</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2] rounded-lg">
                <div className="w-20 h-20 bg-[#DC2626] text-white rounded-full flex items-center justify-center text-3xl font-bold">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#0F172A]">{selectedStudent.name}</h3>
                  <p className="text-[#64748B]">{selectedStudent.class} • Roll No: {selectedStudent.roll_no || 'N/A'}</p>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full mt-2 ${getStatusColor(selectedStudent.status || 'active')}`}>
                    {(selectedStudent.status || 'active').charAt(0).toUpperCase() + (selectedStudent.status || 'active').slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-[#64748B] mb-1">Date of Birth</p>
                  <p className="text-base font-semibold text-[#0F172A]">{selectedStudent.dob}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-[#64748B] mb-1">Gender</p>
                  <p className="text-base font-semibold text-[#0F172A] capitalize">{selectedStudent.gender}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-[#64748B] mb-1">Student Type</p>
                  <p className="text-base font-semibold text-[#0F172A]">{selectedStudent.studentType === 'hosteller' ? 'Hosteller' : 'Day Scholar'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-[#64748B] mb-1">Parent Contact</p>
                  <p className="text-base font-semibold text-[#0F172A]">{selectedStudent.parent_contact}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-[#64748B] mb-1">Parent Name</p>
                  <p className="text-base font-semibold text-[#0F172A]">{selectedStudent.parent_name || 'Not provided'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                  <p className="text-sm text-[#64748B] mb-1">Address</p>
                  <p className="text-base font-semibold text-[#0F172A]">{selectedStudent.address}</p>
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

export default Students;