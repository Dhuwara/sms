import React, { useEffect, useRef, useState } from 'react';
import api from '../utils/api';
import { Plus, Edit, Trash2, Eye, Users, BookOpen, Calendar, X, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

const DEGREE_SPECIALIZATIONS = {
  'B.Tech': ['Computer Science', 'Electronics & Communication', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Information Technology'],
  'M.Tech': ['Computer Science', 'Electronics & Communication', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering'],
  'B.Sc': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Statistics'],
  'M.Sc': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Statistics'],
  'B.Ed': ['Primary Education', 'Secondary Education', 'Special Education'],
  'M.Ed': ['Primary Education', 'Secondary Education', 'Curriculum & Instruction'],
  'B.A': ['English', 'Hindi', 'History', 'Geography', 'Political Science', 'Economics', 'Sociology'],
  'M.A': ['English', 'Hindi', 'History', 'Geography', 'Political Science', 'Economics', 'Sociology'],
  'B.Com': ['Commerce', 'Accounting', 'Finance', 'Business Studies'],
  'M.Com': ['Commerce', 'Accounting', 'Finance'],
  'MBA': ['Business Administration', 'Finance', 'Marketing', 'Human Resources', 'Operations'],
  'Ph.D': ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'English', 'Education', 'History'],
};

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  contact: '',
  subjects: [],
  qualificationDegree: '',
  qualificationSpecialization: '',
  experience: '',
  assigned_classes: [],
  status: 'active',
};

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [dbSubjects, setDbSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);
  const subjectDropdownRef = useRef(null);

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!isEditing && !formData.password.trim()) errors.loginErr = 'This field is required';
    if (!formData.contact.trim()) errors.contact = 'Contact is required';
    if (formData.subjects.length === 0) errors.subjects = 'At least one area of expertise is required';
    if (!formData.qualificationDegree) errors.qualificationDegree = 'Degree is required';
    if (!formData.qualificationSpecialization) errors.qualificationSpecialization = 'Specialization is required';
    if (!formData.experience.trim()) errors.experience = 'Experience is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(e.target)) {
        setSubjectDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/api/teachers');
      setTeachers(response.data);
    } catch {
      toast.error('Failed to load teachers');
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/api/admin/subjects');
      const seen = new Set();
      const unique = response.data.filter((s) => {
        if (seen.has(s.name)) return false;
        seen.add(s.name);
        return true;
      });
      setDbSubjects(unique);
    } catch {
      console.error('Failed to load subjects');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEditing && selectedTeacher) {
        await api.put(`/api/teachers/${selectedTeacher._id}`, formData);
        toast.success('Teacher updated successfully!');
      } else {
        await api.post('/api/teachers', formData);
        toast.success('Teacher added successfully!');
      }
      setShowModal(false);
      setIsEditing(false);
      setFormErrors({});
      setFormData(EMPTY_FORM);
      fetchTeachers();
    } catch {
      toast.error(isEditing ? 'Failed to update teacher' : 'Failed to add teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.name || '',
      email: teacher.email || '',
      contact: teacher.contact || '',
      subjects: teacher.subjects || [],
      qualificationDegree: teacher.qualificationDegree || '',
      qualificationSpecialization: teacher.qualificationSpecialization || '',
      experience: teacher.experience || '',
      assigned_classes: teacher.assigned_classes || [],
      status: teacher.status || 'active',
    });
    setFormErrors({});
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (teacherId) => {
    if (globalThis.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await api.delete(`/api/teachers/${teacherId}`);
        toast.success('Teacher deleted successfully!');
        fetchTeachers();
      } catch {
        toast.error('Failed to delete teacher');
      }
    }
  };

  const handleView = (teacher) => {
    setSelectedTeacher(teacher);
    setShowViewModal(true);
  };

  const toggleSubject = (subjectName) => {
    const current = formData.subjects;
    const updated = current.includes(subjectName)
      ? current.filter((s) => s !== subjectName)
      : [...current, subjectName];
    setFormData({ ...formData, subjects: updated });
    setFormErrors({ ...formErrors, subjects: '' });
  };

  const handleDegreeChange = (degree) => {
    setFormData({ ...formData, qualificationDegree: degree, qualificationSpecialization: '' });
    setFormErrors({ ...formErrors, qualificationDegree: '', qualificationSpecialization: '' });
  };

  const specializationOptions = DEGREE_SPECIALIZATIONS[formData.qualificationDegree] || [];
  let submitLabel = 'Add Teacher';
  if (loading) submitLabel = 'Saving...';
  else if (isEditing) submitLabel = 'Update Teacher';

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
            setSelectedTeacher(null);
            setFormData(EMPTY_FORM);
            setFormErrors({});
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
                <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase">Area of Expertise</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase">Assigned Classes</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase">Qualification</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#0F172A] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teachers.map((teacher) => (
                <tr key={teacher._id} className="hover:bg-[#FFFBEB] transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-[#0F172A]">{teacher.employee_id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-[#0F172A]">{teacher.name}</td>
                  <td className="px-6 py-4 text-sm text-[#64748B]">
                    <div className="flex flex-wrap gap-1">
                      {(teacher.subjects || []).map((s) => (
                        <span key={s} className="inline-block bg-[#FEF3C7] px-2 py-0.5 rounded text-xs">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#64748B]">
                    {(teacher.assigned_classes || []).map((cls) => (
                      <span key={cls._id || cls} className="inline-block bg-[#FEF3C7] px-2 py-1 rounded text-xs mr-1 mb-1">
                        {cls.name ? `${cls.name} - ${cls.section}` : cls}
                      </span>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#64748B]">{teacher.qualification || '—'}</td>
                  <td className="px-6 py-4 text-sm text-[#64748B]">{teacher.contact}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleView(teacher)} className="p-2 text-[#4F46E5] hover:bg-[#EEF2FF] rounded-lg transition-colors">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => handleEdit(teacher)} className="p-2 text-[#F59E0B] hover:bg-[#FEF3C7] rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(teacher._id)} className="p-2 text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors">
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
                {/* Full Name */}
                <div>
                  <label htmlFor="t-name" className="block text-sm font-medium text-[#0F172A] mb-2">Full Name *</label>
                  <input
                    id="t-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setFormErrors({ ...formErrors, name: '' }); }}
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="t-email" className="block text-sm font-medium text-[#0F172A] mb-2">Email *</label>
                  <input
                    id="t-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setFormErrors({ ...formErrors, email: '' }); }}
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="t-pass" className="block text-sm font-medium text-[#0F172A] mb-2">
                    {isEditing ? 'New Password' : 'Password *'}
                  </label>
                  <input
                    id="t-pass"
                    type="password"
                    value={formData.password}
                    onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setFormErrors({ ...formErrors, loginErr: '' }); }}
                    placeholder={isEditing ? 'Leave blank to keep current' : ''}
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />
                  {formErrors.loginErr && <p className="text-red-500 text-xs mt-1">{formErrors.loginErr}</p>}
                </div>

                {/* Contact */}
                <div>
                  <label htmlFor="t-contact" className="block text-sm font-medium text-[#0F172A] mb-2">Contact *</label>
                  <input
                    id="t-contact"
                    type="tel"
                    value={formData.contact}
                    onChange={(e) => { setFormData({ ...formData, contact: e.target.value }); setFormErrors({ ...formErrors, contact: '' }); }}
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />
                  {formErrors.contact && <p className="text-red-500 text-xs mt-1">{formErrors.contact}</p>}
                </div>

                {/* Area of Expertise — multi-select from DB subjects */}
                <div className="md:col-span-2">
                  <label htmlFor="t-subjects" className="block text-sm font-medium text-[#0F172A] mb-2">Area of Expertise *</label>
                  <div className="relative" ref={subjectDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setSubjectDropdownOpen((o) => !o)}
                      className="w-full min-h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg cursor-pointer flex flex-wrap gap-1 items-center focus:outline-none text-left"
                    >
                      {formData.subjects.length === 0 ? (
                        <span className="text-gray-400 text-sm">Select subjects...</span>
                      ) : (
                        formData.subjects.map((s) => (
                          <span key={s} className="flex items-center gap-1 bg-[#FEF3C7] text-[#0F172A] text-xs px-2 py-0.5 rounded-full">
                            {s}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); toggleSubject(s); }}
                              className="hover:text-[#DC2626]"
                            >
                              <X size={10} />
                            </button>
                          </span>
                        ))
                      )}
                      <ChevronDown size={16} className="ml-auto text-gray-400 shrink-0" />
                    </button>

                    {subjectDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white border-2 border-[#FCD34D] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {dbSubjects.length === 0 ? (
                          <p className="px-4 py-3 text-sm text-gray-500">No subjects found. Add subjects first.</p>
                        ) : (
                          dbSubjects.map((subj) => (
                            <label key={subj._id} className="flex items-center gap-3 px-4 py-2 hover:bg-[#FFFBEB] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.subjects.includes(subj.name)}
                                onChange={() => toggleSubject(subj.name)}
                                className="accent-[#F59E0B]"
                              />
                              <span className="text-sm text-[#0F172A]">{subj.name}</span>
                            </label>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  {formErrors.subjects && <p className="text-red-500 text-xs mt-1">{formErrors.subjects}</p>}
                </div>

                {/* Qualification — Degree */}
                <div>
                  <label htmlFor="t-degree" className="block text-sm font-medium text-[#0F172A] mb-2">Degree *</label>
                  <select
                    id="t-degree"
                    value={formData.qualificationDegree}
                    onChange={(e) => handleDegreeChange(e.target.value)}
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  >
                    <option value="">Select degree...</option>
                    {Object.keys(DEGREE_SPECIALIZATIONS).map((deg) => (
                      <option key={deg} value={deg}>{deg}</option>
                    ))}
                  </select>
                  {formErrors.qualificationDegree && <p className="text-red-500 text-xs mt-1">{formErrors.qualificationDegree}</p>}
                </div>

                {/* Qualification — Specialization */}
                <div>
                  <label htmlFor="t-spec" className="block text-sm font-medium text-[#0F172A] mb-2">Specialization *</label>
                  <select
                    id="t-spec"
                    value={formData.qualificationSpecialization}
                    onChange={(e) => { setFormData({ ...formData, qualificationSpecialization: e.target.value }); setFormErrors({ ...formErrors, qualificationSpecialization: '' }); }}
                    disabled={!formData.qualificationDegree}
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select specialization...</option>
                    {specializationOptions.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                  {formErrors.qualificationSpecialization && <p className="text-red-500 text-xs mt-1">{formErrors.qualificationSpecialization}</p>}
                </div>

                {/* Experience */}
                <div>
                  <label htmlFor="t-exp" className="block text-sm font-medium text-[#0F172A] mb-2">Experience *</label>
                  <input
                    id="t-exp"
                    type="text"
                    value={formData.experience}
                    onChange={(e) => { setFormData({ ...formData, experience: e.target.value }); setFormErrors({ ...formErrors, experience: '' }); }}
                    className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    placeholder="e.g., 5 years"
                  />
                  {formErrors.experience && <p className="text-red-500 text-xs mt-1">{formErrors.experience}</p>}
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="t-status" className="block text-sm font-medium text-[#0F172A] mb-2">Status *</label>
                  <select
                    id="t-status"
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
                  onClick={() => { setShowModal(false); setFormErrors({}); }}
                  className="flex-1 bg-gray-200 text-[#0F172A] hover:bg-gray-300 h-10 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#F59E0B] text-white hover:bg-[#D97706] h-10 px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {submitLabel}
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
                  <p className="text-[#64748B]">{(selectedTeacher.subjects || []).join(', ') || selectedTeacher.subject} Teacher</p>
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
                  <p className="font-semibold">{selectedTeacher.qualification || '—'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-[#64748B]">Experience</p>
                  <p className="font-semibold">{selectedTeacher.experience}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg col-span-2">
                  <p className="text-sm text-[#64748B] mb-2">Area of Expertise</p>
                  <div className="flex flex-wrap gap-2">
                    {(selectedTeacher.subjects || []).map((s) => (
                      <span key={s} className="bg-[#FEF3C7] px-3 py-1 rounded-full text-sm font-semibold">{s}</span>
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
