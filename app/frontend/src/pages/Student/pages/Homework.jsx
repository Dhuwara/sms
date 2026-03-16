import React from 'react';
import { FileText, Download, Library } from 'lucide-react';

const Homework = ({ homeworkData, lessonPlansData, studyMaterialsData, handleDownloadFile, handleDownloadLessonPlan, handleDownloadStudyMaterial, formatDate }) => {
  const today = new Date().toDateString();
  const pending = homeworkData.filter(h => !h.submission && h.status === 'active');
  const dueToday = homeworkData.filter(h => new Date(h.dueDate).toDateString() === today && !h.submission);
  const submitted = homeworkData.filter(h => h.submission?.status === 'submitted');
  const graded = homeworkData.filter(h => h.submission?.status === 'graded');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Homework & Assignments</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#FEE2E2] rounded-xl border-2 border-[#DC2626]">
          <p className="text-sm text-[#64748B]">Pending</p>
          <p className="text-2xl font-bold text-[#991B1B]">{pending.length}</p>
        </div>
        <div className="p-4 bg-[#FEF3C7] rounded-xl border-2 border-[#F59E0B]">
          <p className="text-sm text-[#64748B]">Due Today</p>
          <p className="text-2xl font-bold text-[#92400E]">{dueToday.length}</p>
        </div>
        <div className="p-4 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981]">
          <p className="text-sm text-[#64748B]">Submitted</p>
          <p className="text-2xl font-bold text-[#065F46]">{submitted.length}</p>
        </div>
        <div className="p-4 bg-[#DBEAFE] rounded-xl border-2 border-[#3B82F6]">
          <p className="text-sm text-[#64748B]">Graded</p>
          <p className="text-2xl font-bold text-[#1E40AF]">{graded.length}</p>
        </div>
      </div>

      {homeworkData.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-12 text-center text-[#64748B]">
          <FileText className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-lg font-medium">No homework assigned yet</p>
          <p className="text-sm mt-1">Your assignments will appear here once available</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FEF3C7]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Files</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {homeworkData.map((hw, i) => {
                  const isOverdue = !hw.submission && new Date(hw.dueDate) < new Date() && hw.status === 'active';
                  const statusLabel = hw.submission?.status || (isOverdue ? 'overdue' : 'pending');
                  const statusClasses = {
                    graded: 'bg-[#DBEAFE] text-[#1E40AF]',
                    submitted: 'bg-[#D1FAE5] text-[#065F46]',
                    overdue: 'bg-[#FEE2E2] text-[#991B1B]',
                  };
                  const statusClass = statusClasses[statusLabel] || 'bg-[#FEF3C7] text-[#92400E]';
                  return (
                    <tr key={hw._id || i} className="hover:bg-[#FFFBEB]">
                      <td className="px-6 py-4 font-semibold text-[#0F172A]">{hw.title}</td>
                      <td className="px-6 py-4 text-sm text-[#64748B]">{hw.subjectId?.name || hw.subject || '—'}</td>
                      <td className="px-6 py-4 text-sm">{formatDate(hw.dueDate)}</td>
                      <td className="px-6 py-4">
                        {hw.attachments && hw.attachments.length > 0 ? (
                          <div className="space-y-1">
                            {hw.attachments.map((file, fileIndex) => (
                              <button
                                key={fileIndex}
                                onClick={() => handleDownloadFile(hw._id, file.filename, file.originalName)}
                                className="flex items-center gap-2 text-sm text-[#4F46E5] hover:text-[#6366F1] hover:underline"
                                title={`Download ${file.originalName}`}
                              >
                                <Download size={14} />
                                <span className="truncate max-w-30">{file.originalName}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-[#94A3B8]">No files</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClass}`}>{statusLabel}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">{hw.submission?.grade || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lesson Plans */}
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <FileText className="text-[#F59E0B]" size={20} />
          Lesson Plans
        </h3>
        {lessonPlansData.length > 0 ? (
          <div className="space-y-3">
            {lessonPlansData.map((plan) => (
              <div key={plan._id} className="p-4 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center hover:bg-[#FFFBEB] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{plan.title}</p>
                  <p className="text-sm text-[#64748B]">
                    {plan.subject} • {formatDate(plan.date)}
                  </p>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Uploaded by: {plan.uploadedBy?.userId?.name || 'Teacher'}
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadLessonPlan(plan._id, plan.originalName)}
                  className="ml-3 flex items-center gap-1 text-sm text-[#4F46E5] hover:text-[#4338CA] font-semibold hover:underline"
                >
                  <Download size={16} /> Download
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#64748B] text-center py-4">No lesson plans available for your class</p>
        )}
      </div>

      {/* Study Materials */}
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Library className="text-[#7C3AED]" size={20} />
          Study Materials
        </h3>
        {studyMaterialsData.length > 0 ? (
          <div className="space-y-3">
            {studyMaterialsData.map((mat) => (
              <div key={mat._id} className="p-4 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center hover:bg-[#FFFBEB] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{mat.title}</p>
                  <p className="text-sm text-[#64748B]">
                    {mat.subject}{mat.description ? ` — ${mat.description}` : ''}
                  </p>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Uploaded by: {mat.uploadedBy?.userId?.name || 'Teacher'}
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadStudyMaterial(mat._id, mat.originalName)}
                  className="ml-3 flex items-center gap-1 text-sm text-[#4F46E5] hover:text-[#4338CA] font-semibold hover:underline"
                >
                  <Download size={16} /> Download
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#64748B] text-center py-4">No study materials available for your class</p>
        )}
      </div>
    </div>
  );
};

export default Homework;
