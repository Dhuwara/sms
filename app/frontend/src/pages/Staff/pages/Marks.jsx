import React from 'react';

const GRADE_COLOR = {
  'A+': 'bg-[#D1FAE5] text-[#065F46]',
  'A': 'bg-[#DBEAFE] text-[#1E40AF]',
  'B+': 'bg-[#EDE9FE] text-[#5B21B6]',
  'B': 'bg-[#FEF3C7] text-[#92400E]',
  'C': 'bg-[#FFE4E6] text-[#9F1239]',
  'D': 'bg-[#F1F5F9] text-[#475569]',
  'F': 'bg-[#FEE2E2] text-[#991B1B]',
};

const Marks = ({
  marksClassId,
  handleMarksClassChange,
  marksExamId,
  setMarksExamId,
  marksExams,
  marksLoading,
  marksLoaded,
  marksStudents,
  marksEntries,
  setMarksEntries,
  setMarksLoaded,
  setMarksStudents,
  setMarksAnalysis,
  marksSaving,
  marksAnalysis,
  handleLoadStudents,
  handleSaveAllMarks,
  marksCalcGrade,
  timetableAssignments,
}) => {
  const selectedExam = marksExams.find(e => e._id === marksExamId);
  const maxScore = selectedExam?.maxScore || 100;
  const assignedClasses = timetableAssignments.map(a => a.classId).filter(Boolean);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Marks & Assessment</h2>

      {/* Selection Panel */}
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-semibold text-[#64748B] mb-1">Class</label>
            <select
              value={marksClassId}
              onChange={e => handleMarksClassChange(e.target.value)}
              className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            >
              <option value="">Select class</option>
              {assignedClasses.map(c => (
                <option key={c._id} value={c._id}>{c.name} {c.section}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs font-semibold text-[#64748B] mb-1">Exam</label>
            <select
              value={marksExamId}
              onChange={e => { setMarksExamId(e.target.value); setMarksLoaded(false); setMarksStudents([]); setMarksEntries({}); setMarksAnalysis(null); }}
              disabled={!marksClassId}
              className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] disabled:opacity-50"
            >
              <option value="">Select exam</option>
              {marksExams.map(e => (
                <option key={e._id} value={e._id}>{e.examType} — {e.subject} ({new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })})</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleLoadStudents}
              disabled={!marksClassId || !marksExamId || marksLoading}
              className="h-10 bg-[#4F46E5] text-white px-6 rounded-lg font-semibold disabled:opacity-50 flex items-center gap-2"
            >
              {marksLoading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Loading...</> : 'Load Students'}
            </button>
          </div>
        </div>

        {selectedExam && (
          <div className="flex gap-4 text-sm bg-[#F8FAFC] rounded-lg px-4 py-2 border border-slate-200">
            <span><span className="text-[#64748B]">Subject:</span> <span className="font-semibold text-[#4F46E5]">{selectedExam.subject}</span></span>
            <span><span className="text-[#64748B]">Max Marks:</span> <span className="font-semibold">{selectedExam.maxScore}</span></span>
            <span><span className="text-[#64748B]">Session:</span> <span className="font-semibold">{selectedExam.session}</span></span>
          </div>
        )}
      </div>

      {/* Marks Entry Table */}
      {marksLoaded && marksStudents.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0F172A]">
              Enter Marks — {selectedExam?.examType} · {selectedExam?.subject}
            </h3>
            <span className="text-sm text-[#64748B]">{marksStudents.length} students</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FEF3C7]">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-sm text-[#0F172A]">Roll No</th>
                  <th className="px-4 py-3 text-left font-bold text-sm text-[#0F172A]">Student Name</th>
                  <th className="px-4 py-3 text-left font-bold text-sm text-[#0F172A]">Marks Obtained</th>
                  <th className="px-4 py-3 text-left font-bold text-sm text-[#0F172A]">Max Marks</th>
                  <th className="px-4 py-3 text-left font-bold text-sm text-[#0F172A]">%</th>
                  <th className="px-4 py-3 text-left font-bold text-sm text-[#0F172A]">Grade</th>
                </tr>
              </thead>
              <tbody>
                {marksStudents.map(student => {
                  const raw = marksEntries[student._id];
                  const marks = raw !== '' && raw !== undefined ? Number(raw) : null;
                  const pct = marks !== null && !isNaN(marks) ? ((marks / maxScore) * 100).toFixed(0) : '\u2014';
                  const grade = marks !== null && !isNaN(marks) ? marksCalcGrade(marks, maxScore) : '\u2014';
                  return (
                    <tr key={student._id} className="border-b border-[#E2E8F0] hover:bg-[#FFFBEB]">
                      <td className="px-4 py-3 text-sm font-semibold text-[#64748B]">{student.roll_no || '\u2014'}</td>
                      <td className="px-4 py-3 text-sm font-medium text-[#0F172A]">{student.name}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          max={maxScore}
                          value={raw ?? ''}
                          placeholder="\u2014"
                          onChange={e => setMarksEntries(prev => ({ ...prev, [student._id]: e.target.value }))}
                          className="w-24 h-9 px-3 border-2 border-[#FCD34D] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#64748B]">{maxScore}</td>
                      <td className="px-4 py-3 text-sm text-[#64748B]">{pct}{pct !== '\u2014' ? '%' : ''}</td>
                      <td className="px-4 py-3">
                        {grade !== '\u2014' ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${GRADE_COLOR[grade] || 'bg-[#E2E8F0] text-[#64748B]'}`}>{grade}</span>
                        ) : (
                          <span className="text-[#94A3B8] text-xs">{'\u2014'}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-5">
            <button
              onClick={handleSaveAllMarks}
              disabled={marksSaving}
              className="bg-[#4F46E5] text-white px-8 py-2.5 rounded-lg font-semibold disabled:opacity-50 flex items-center gap-2"
            >
              {marksSaving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : 'Save All Marks'}
            </button>
          </div>
        </div>
      )}

      {marksLoaded && marksStudents.length === 0 && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-8 text-center text-[#64748B]">
          No students found in this class.
        </div>
      )}

      {/* Performance Analysis — shown after save */}
      {marksAnalysis && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold text-[#0F172A] mb-4">
            Performance Analysis — {marksAnalysis.examType} · {marksAnalysis.subject}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-[#FEF3C7] rounded-xl text-center">
              <p className="text-xs text-[#64748B] mb-1">Class Average</p>
              <p className="text-2xl font-bold text-[#0F172A]">{marksAnalysis.avg}</p>
              <p className="text-xs text-[#64748B]">{marksAnalysis.avgPct}%</p>
            </div>
            <div className="p-4 bg-[#D1FAE5] rounded-xl text-center">
              <p className="text-xs text-[#64748B] mb-1">Highest Score</p>
              <p className="text-2xl font-bold text-[#065F46]">{marksAnalysis.highest} / {marksAnalysis.maxScore}</p>
              <p className="text-xs text-[#64748B] truncate">{marksAnalysis.highestStudentName}</p>
            </div>
            <div className="p-4 bg-[#FEE2E2] rounded-xl text-center">
              <p className="text-xs text-[#64748B] mb-1">Lowest Score</p>
              <p className="text-2xl font-bold text-[#991B1B]">{marksAnalysis.lowest} / {marksAnalysis.maxScore}</p>
            </div>
            <div className="p-4 bg-[#DBEAFE] rounded-xl text-center">
              <p className="text-xs text-[#64748B] mb-1">Pass Rate</p>
              <p className="text-2xl font-bold text-[#1E40AF]">{marksAnalysis.passRate}%</p>
              <p className="text-xs text-[#64748B]">{marksAnalysis.passCount} / {marksAnalysis.total}</p>
            </div>
          </div>

          <h4 className="font-semibold text-[#0F172A] mb-3 text-sm">Grade Distribution</h4>
          <div className="flex flex-wrap gap-2">
            {['A+', 'A', 'B+', 'B', 'C', 'D', 'F'].map(g => (
              marksAnalysis.gradeDist[g] ? (
                <div key={g} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${GRADE_COLOR[g]}`}>
                  <span className="font-bold">{g}</span>
                  <span className="font-semibold">{marksAnalysis.gradeDist[g]}</span>
                  <span className="text-xs opacity-70">student{marksAnalysis.gradeDist[g] > 1 ? 's' : ''}</span>
                </div>
              ) : null
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Marks;
