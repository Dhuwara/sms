import React from 'react';
import { Download, GraduationCap } from 'lucide-react';

const Academic = ({ selectedChild, childGrades, childExams, childSelector, formatDate, getGradeBadge }) => {
  const grades = childGrades;
  const totalMarks = grades.reduce((sum, g) => sum + (g.marks || 0), 0);
  const totalMax = grades.reduce((sum, g) => sum + (g.totalMarks || 100), 0);
  const pct = totalMax > 0 ? ((totalMarks / totalMax) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Academic Progress</h2>
      {childSelector()}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981]">
          <p className="text-sm text-[#64748B]">Subjects</p>
          <p className="text-2xl font-bold text-[#065F46]">{grades.length}</p>
        </div>
        <div className="p-4 bg-[#DBEAFE] rounded-xl border-2 border-[#3B82F6]">
          <p className="text-sm text-[#64748B]">Total Marks</p>
          <p className="text-2xl font-bold text-[#1E40AF]">{totalMarks} / {totalMax}</p>
        </div>
        <div className="p-4 bg-[#FEF3C7] rounded-xl border-2 border-[#F59E0B]">
          <p className="text-sm text-[#64748B]">Percentage</p>
          <p className="text-2xl font-bold text-[#92400E]">{pct}%</p>
        </div>
        <div className="p-4 bg-[#EDE9FE] rounded-xl border-2 border-[#7C3AED]">
          <p className="text-sm text-[#64748B]">Grade Records</p>
          <p className="text-2xl font-bold text-[#5B21B6]">{grades.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <GraduationCap className="text-[#7C3AED]" size={20} />
          Test & Exam Schedule
        </h3>
        {childExams.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#EDE9FE]">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-sm">Exam</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Subject</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Date</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Time</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Max Score</th>
                </tr>
              </thead>
              <tbody>
                {childExams.map((exam, idx) => (
                  <tr key={exam._id || idx} className="border-b border-[#E2E8F0]">
                    <td className="px-4 py-3 text-sm font-semibold">{exam.examType}</td>
                    <td className="px-4 py-3 text-sm">{exam.subject}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(exam.date)}</td>
                    <td className="px-4 py-3 text-sm">{exam.startTime} – {exam.endTime}</td>
                    <td className="px-4 py-3 text-sm">{exam.maxScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[#64748B] text-center py-6">No exam schedules found for this class.</p>
        )}
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Marks, Grades & Report Cards</h3>
          <button className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
            <Download size={16} /> Download Report Card
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-linear-to-r from-[#D1FAE5] to-[#DBEAFE]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Subject</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Marks</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Grade</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Term</th>
              </tr>
            </thead>
            <tbody>
              {grades.length > 0 ? grades.map((g, idx) => (
                <tr key={idx} className="border-b border-[#E2E8F0]">
                  <td className="px-4 py-3 text-sm font-semibold">{g.subjectId?.name || 'Subject'}</td>
                  <td className="px-4 py-3 text-sm">{g.marks || 0}/{g.totalMarks || 100}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getGradeBadge(g.grade || '')}`}>{g.grade || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{g.term || '—'}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-[#64748B]">No grade records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {grades.length > 0 && (
          <div className="mt-4 p-4 bg-[#D1FAE5] rounded-lg">
            <p className="font-bold text-[#065F46]">Total: {totalMarks}/{totalMax} | Percentage: {pct}%</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Academic;
