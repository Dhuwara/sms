import React from 'react';
import { Download, Calculator } from 'lucide-react';

const Exams = ({ exams, examResults, formatDate, formatTime, getGradeBadge, getAcademicYear }) => {
  const upcomingExams = exams.filter(e => new Date(e.date) >= new Date());
  const results = examResults || [];
  const totalMarks = results.reduce((sum, r) => sum + (r.marks || 0), 0);
  const totalMax = results.reduce((sum, r) => sum + (r.examId?.maxScore || 100), 0);
  const overallPercentage = totalMax > 0 ? ((totalMarks / totalMax) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Exams & Results</h2>

      {upcomingExams.length > 0 && (
        <div className="bg-linear-to-r from-[#FEF3C7] to-[#FEE2E2] rounded-xl p-6 border-2 border-[#FCD34D]">
          <h3 className="font-bold text-lg mb-2">Upcoming Examination</h3>
          <p className="text-[#64748B]">{upcomingExams[0].examType} - {upcomingExams[0].subject}</p>
          <p className="text-sm text-[#64748B] mt-2">Date: <span className="font-bold text-[#DC2626]">{formatDate(upcomingExams[0].date)}</span></p>
        </div>
      )}

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Exam Schedules</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-linear-to-r from-[#DBEAFE] to-[#EDE9FE]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Date</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Subject</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Type</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Time</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Max Marks</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam, idx) => (
                <tr key={idx} className="border-b border-[#E2E8F0]">
                  <td className="px-4 py-3 text-sm font-semibold">{formatDate(exam.date)}</td>
                  <td className="px-4 py-3 text-sm">{exam.subject}</td>
                  <td className="px-4 py-3 text-sm">{exam.examType}</td>
                  <td className="px-4 py-3 text-sm">{formatTime(exam.startTime)} - {formatTime(exam.endTime)}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{exam.maxScore || 100}</td>
                </tr>
              ))}
              {exams.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-[#64748B]">No exams scheduled</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {results.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Exam Results</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-linear-to-r from-[#D1FAE5] to-[#DBEAFE]">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-sm">Subject</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Exam Type</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Marks Obtained</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Max Marks</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Percentage</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Grade</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, idx) => {
                  const maxScore = result.examId?.maxScore || 100;
                  const pct = maxScore > 0 ? ((result.marks / maxScore) * 100).toFixed(0) : 0;
                  return (
                    <tr key={idx} className="border-b border-[#E2E8F0]">
                      <td className="px-4 py-3 text-sm font-semibold">{result.examId?.subject || '—'}</td>
                      <td className="px-4 py-3 text-sm">{result.examId?.examType || '—'}</td>
                      <td className="px-4 py-3 text-sm">{result.marks}</td>
                      <td className="px-4 py-3 text-sm">{maxScore}</td>
                      <td className="px-4 py-3 text-sm">{pct}%</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getGradeBadge(result.grade)}`}>{result.grade}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-[#D1FAE5] rounded-lg flex justify-between items-center">
            <div>
              <p className="font-bold text-lg text-[#065F46]">Total: {totalMarks} / {totalMax}</p>
              <p className="text-sm text-[#064E3B]">Overall Percentage: {overallPercentage}%</p>
            </div>
            <button className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
              <Download size={18} /> Download Report Card
            </button>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Calculator className="text-[#F59E0B]" size={20} />
            Performance Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Subject-wise Performance</h4>
              <div className="space-y-3">
                {results.map((r, idx) => {
                  const maxScore = r.examId?.maxScore || 100;
                  const pct = maxScore > 0 ? Math.round((r.marks / maxScore) * 100) : 0;
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{r.examId?.subject || '—'}</span>
                        <span className="font-semibold">{pct}%</span>
                      </div>
                      <div className="w-full h-3 bg-[#E2E8F0] rounded-full">
                        <div className={`h-3 rounded-full ${pct >= 90 ? 'bg-[#10B981]' : pct >= 80 ? 'bg-[#3B82F6]' : pct >= 60 ? 'bg-[#F59E0B]' : 'bg-[#DC2626]'
                          }`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-4 bg-[#F8FAFC] rounded-lg">
              <h4 className="font-semibold mb-3">Overall Statistics</h4>
              <div className="space-y-3">
                <div className="flex justify-between p-2 bg-white rounded">
                  <span>Total Exams</span>
                  <span className="font-bold text-[#4F46E5]">{results.length}</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded">
                  <span>Overall Percentage</span>
                  <span className="font-bold text-[#10B981]">{overallPercentage}%</span>
                </div>
                {results.length > 0 && (() => {
                  const sorted = [...results].sort((a, b) => (b.marks / (b.examId?.maxScore || 100)) - (a.marks / (a.examId?.maxScore || 100)));
                  return (
                    <>
                      <div className="flex justify-between p-2 bg-white rounded">
                        <span>Strongest Subject</span>
                        <span className="font-bold">{sorted[0]?.examId?.subject || '—'}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-white rounded">
                        <span>Needs Improvement</span>
                        <span className="font-bold text-[#F59E0B]">{sorted[sorted.length - 1]?.examId?.subject || '—'}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams;
