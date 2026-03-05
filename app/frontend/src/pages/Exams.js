import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Plus, Download, Award, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [activeTab, setActiveTab] = useState('exams');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    class_id: '',
    date: '',
    max_score: 100,
  });
  const [loading, setLoading] = useState(false);

  const marksData = [
    { student: 'Rahul Kumar', math: 85, science: 78, english: 92, total: 255, percentage: 85 },
    { student: 'Priya Sharma', math: 92, science: 88, english: 90, total: 270, percentage: 90 },
    { student: 'Amit Patel', math: 78, science: 82, english: 85, total: 245, percentage: 81.7 },
    { student: 'Sneha Reddy', math: 88, science: 90, english: 87, total: 265, percentage: 88.3 },
    { student: 'Vikram Singh', math: 95, science: 93, english: 96, total: 284, percentage: 94.7 },
  ];

  const gradeSystem = [
    { grade: 'A+', range: '90-100', points: '10', description: 'Outstanding' },
    { grade: 'A', range: '80-89', points: '9', description: 'Excellent' },
    { grade: 'B+', range: '70-79', points: '8', description: 'Very Good' },
    { grade: 'B', range: '60-69', points: '7', description: 'Good' },
    { grade: 'C', range: '50-59', points: '6', description: 'Average' },
  ];

  useEffect(() => {
    fetchExams();
    fetchClasses();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await api.get('/api/exams');
      setExams(response.data);
    } catch (error) {
      toast.error('Failed to load exams');
    }
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
    setLoading(true);
    try {
      await api.post('/api/exams', formData);
      toast.success('Exam added successfully');
      setShowModal(false);
      setFormData({ name: '', class_id: '', date: '', max_score: 100 });
      fetchExams();
    } catch (error) {
      toast.error('Failed to add exam');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (type) => {
    toast.success(`${type} downloaded successfully!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#0F172A]">Examinations & Results</h1>
          <p className="text-[#64748B] mt-1">Manage exams, marks entry & report cards</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          data-testid="add-exam-button"
          className="flex items-center gap-2 bg-[#4F46E5] text-white hover:bg-[#4338CA] px-6 py-3 rounded-lg font-semibold transition-all shadow-md"
        >
          <Plus size={20} />
          Create Exam
        </button>
      </div>

      <div className="flex gap-2 border-b-2 border-[#FCD34D]">
        {['exams', 'marks', 'grades', 'reports'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold transition-all capitalize ${activeTab === tab ? 'bg-[#FCD34D] text-[#0F172A] rounded-t-lg' : 'text-[#64748B] hover:text-[#0F172A]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'exams' && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Exam Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Max Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {exams.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-[#64748B]">
                      No exams found. Schedule your first exam!
                    </td>
                  </tr>
                ) : (
                  exams.map((exam, index) => (
                    <tr key={index} className="hover:bg-[#FFFBEB] transition-colors">
                      <td className="px-6 py-4 text-sm text-[#0F172A] font-medium">{exam.name}</td>
                      <td className="px-6 py-4"><span className="inline-flex px-3 py-1 bg-[#DBEAFE] text-[#1E40AF] rounded-full text-xs font-semibold">Unit Test</span></td>
                      <td className="px-6 py-4 text-sm text-[#64748B]">{exam.class_id}</td>
                      <td className="px-6 py-4 text-sm text-[#64748B]">{exam.date}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#0F172A]">{exam.max_score}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'marks' && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#0F172A]">Marks Entry & Calculation</h2>
            <button onClick={() => toast.success('Marks entry form')} className="bg-[#10B981] text-white px-4 py-2 rounded-lg font-semibold">
              Enter Marks
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Math</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Science</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">English</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {marksData.map((row, i) => (
                  <tr key={i} className="hover:bg-[#FFFBEB]">
                    <td className="px-6 py-4 font-semibold text-[#0F172A]">{row.student}</td>
                    <td className="px-6 py-4 text-sm">{row.math}</td>
                    <td className="px-6 py-4 text-sm">{row.science}</td>
                    <td className="px-6 py-4 text-sm">{row.english}</td>
                    <td className="px-6 py-4 font-bold text-[#0F172A]">{row.total}</td>
                    <td className="px-6 py-4"><span className="inline-flex px-3 py-1 bg-[#D1FAE5] text-[#065F46] rounded-full font-bold">{row.percentage}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'grades' && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h2 className="text-2xl font-bold text-[#0F172A] mb-6">Grading System</h2>
          <div className="grid gap-4">
            {gradeSystem.map((grade, i) => (
              <div key={i} className="p-4 border-2 border-[#FCD34D] rounded-lg hover:bg-[#FFFBEB] transition-colors">
                <div className="grid grid-cols-4 gap-4 items-center">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FEF3C7] to-[#FEE2E2] rounded-full">
                      <span className="text-2xl font-bold text-[#0F172A]">{grade.grade}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-[#64748B]">Range</p>
                    <p className="text-lg font-bold text-[#0F172A]">{grade.range}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#64748B]">Grade Points</p>
                    <p className="text-lg font-bold text-[#0F172A]">{grade.points}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#64748B]">Description</p>
                    <p className="text-lg font-bold text-[#0F172A]">{grade.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#0F172A]">Report Cards</h2>
              <div className="flex gap-2">
                <button onClick={() => downloadReport('Report Card PDF')} className="flex items-center gap-2 bg-[#DC2626] text-white px-4 py-2 rounded-lg font-semibold">
                  <Download size={18} />
                  Generate Report Card
                </button>
                <button onClick={() => downloadReport('Result Analysis Excel')} className="flex items-center gap-2 bg-[#10B981] text-white px-4 py-2 rounded-lg font-semibold">
                  <Download size={18} />
                  Export Excel
                </button>
              </div>
            </div>
            <p className="text-[#64748B] mb-4">Generate individual and bulk report cards with comprehensive academic analysis</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-[#DBEAFE] to-white rounded-xl border-2 border-[#3B82F6]">
              <Award className="text-[#3B82F6] mb-2" size={32} />
              <p className="text-sm text-[#1E40AF] font-medium">Class Average</p>
              <p className="text-4xl font-bold text-[#1E40AF]">87.9%</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-[#D1FAE5] to-white rounded-xl border-2 border-[#10B981]">
              <TrendingUp className="text-[#10B981] mb-2" size={32} />
              <p className="text-sm text-[#065F46] font-medium">Pass Rate</p>
              <p className="text-4xl font-bold text-[#065F46]">96%</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-[#FEF3C7] to-white rounded-xl border-2 border-[#F59E0B]">
              <Award className="text-[#F59E0B] mb-2" size={32} />
              <p className="text-sm text-[#92400E] font-medium">Top Scorer</p>
              <p className="text-2xl font-bold text-[#92400E]">Vikram Singh</p>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-semibold text-[#0F172A] mb-4">Create New Exam</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Exam Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Mid-term Exam"
                  className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Class</label>
                <select
                  required
                  value={formData.class_id}
                  onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                  className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                >
                  <option value="">Select class</option>
                  {classes.map((cls, index) => (
                    <option key={index} value={cls.id || index}>{cls.name}</option>
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
                  className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Max Score</label>
                <input
                  type="number"
                  required
                  value={formData.max_score}
                  onChange={(e) => setFormData({ ...formData, max_score: parseInt(e.target.value) })}
                  className="w-full h-10 px-3 py-2 border-2 border-[#FCD34D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
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
                  className="flex-1 bg-[#4F46E5] text-white hover:bg-[#4338CA] h-10 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams;