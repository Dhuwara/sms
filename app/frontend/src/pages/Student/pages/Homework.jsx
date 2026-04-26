import React, { useState } from 'react';
import { FileText, Download, Library, Upload, X, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const Homework = ({
  homeworkData,
  lessonPlansData,
  studyMaterialsData,
  handleDownloadFile,
  handleDownloadLessonPlan,
  handleDownloadStudyMaterial,
  handleSubmitHomework,
  submittingId,
  formatDate,
}) => {
  const [submitModal, setSubmitModal] = useState(null); // { hwId, hwTitle, isResubmit }
  const [selectedFile, setSelectedFile] = useState(null);

  const today = new Date().toDateString();
  const pending = homeworkData.filter(h => !h.submission && h.status === 'active');
  const dueToday = homeworkData.filter(h => new Date(h.dueDate).toDateString() === today && !h.submission);
  const submitted = homeworkData.filter(h => h.submission && (h.submission.status === 'submitted' || h.submission.status === 'late'));
  const graded = homeworkData.filter(h => h.submission?.status === 'graded');

  const openSubmitModal = (hw, isResubmit = false) => {
    setSelectedFile(null);
    setSubmitModal({ hwId: hw._id, hwTitle: hw.title, isResubmit });
  };

  const handleConfirmSubmit = async () => {
    if (!selectedFile) return;
    const ok = await handleSubmitHomework(submitModal.hwId, selectedFile);
    if (ok) {
      setSubmitModal(null);
      setSelectedFile(null);
    }
  };

  const formatSubmittedAt = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">Homework & Assignments</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
          <div className="space-y-4">
            {homeworkData.map((hw, i) => {
              const isOverdue = !hw.submission && new Date(hw.dueDate) < new Date() && hw.status === 'active';
              const sub = hw.submission;
              const isLate = sub?.status === 'late';
              const isGraded = sub?.status === 'graded';

              return (
                <div key={hw._id || i} className="border-2 border-[#E2E8F0] rounded-xl p-4 hover:border-[#FCD34D] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-bold text-[#0F172A]">{hw.title}</p>
                        {!sub && isOverdue && (
                          <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-[#FEE2E2] text-[#991B1B]">
                            <AlertTriangle size={10} /> Overdue
                          </span>
                        )}
                        {sub && !isLate && !isGraded && (
                          <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-[#D1FAE5] text-[#065F46]">
                            <CheckCircle size={10} /> On Time
                          </span>
                        )}
                        {sub && isLate && !isGraded && (
                          <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-[#FEF3C7] text-[#92400E]">
                            <Clock size={10} /> Late
                          </span>
                        )}
                        {isGraded && (
                          <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-[#DBEAFE] text-[#1E40AF]">
                            <CheckCircle size={10} /> Graded
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#64748B]">
                        {hw.subject} &bull; Due: {formatDate(hw.dueDate)}
                        {sub && <span className="ml-2 text-xs text-[#94A3B8]">Submitted: {formatSubmittedAt(sub.submittedAt)}</span>}
                      </p>
                      {hw.description && <p className="text-sm text-[#64748B] mt-1">{hw.description}</p>}

                      {/* Assignment files to download */}
                      {hw.attachments?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {hw.attachments.map((file, fi) => (
                            <button
                              key={fi}
                              onClick={() => handleDownloadFile(hw._id, file.filename, file.originalName)}
                              className="flex items-center gap-1 text-xs text-[#4F46E5] hover:underline bg-[#EEF2FF] px-2 py-1 rounded-lg"
                            >
                              <Download size={12} />
                              {file.originalName}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Submitted file info */}
                      {sub?.submissionFile?.originalName && (
                        <p className="mt-2 text-xs text-[#64748B] flex items-center gap-1">
                          <FileText size={12} />
                          Submitted: <span className="font-medium text-[#0F172A]">{sub.submissionFile.originalName}</span>
                        </p>
                      )}

                      {/* Grade */}
                      {isGraded && sub.grade && (
                        <p className="mt-1 text-sm font-semibold text-[#1E40AF]">Grade: {sub.grade}{sub.remarks && <span className="font-normal text-[#64748B] ml-2">— {sub.remarks}</span>}</p>
                      )}
                    </div>

                    {/* Submit button — hidden once submitted */}
                    <div className="shrink-0">
                      {!sub && hw.status === 'active' && (
                        <button
                          onClick={() => openSubmitModal(hw, false)}
                          disabled={submittingId === hw._id}
                          className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white text-sm font-semibold rounded-lg hover:bg-[#4338CA] disabled:opacity-50 transition-colors"
                        >
                          <Upload size={14} /> Submit
                        </button>
                      )}
                      {sub && !isGraded && (
                        <span className="flex items-center gap-1.5 px-3 py-2 bg-[#D1FAE5] text-[#065F46] text-xs font-semibold rounded-lg">
                          <CheckCircle size={13} /> Submitted
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit Modal */}
      {submitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#0F172A]">
                {submitModal.isResubmit ? 'Re-submit' : 'Submit'} Assignment
              </h2>
              <button onClick={() => setSubmitModal(null)} className="text-[#94A3B8] hover:text-[#0F172A]">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-[#64748B] mb-4">{submitModal.hwTitle}</p>
            {submitModal.isResubmit && (
              <p className="text-xs text-[#F59E0B] bg-[#FEF3C7] rounded-lg px-3 py-2 mb-4">Your previous submission will be replaced.</p>
            )}
            <div className="border-2 border-dashed border-[#E2E8F0] rounded-xl p-4 text-center mb-4">
              <input
                type="file"
                id="submission-file"
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.txt,.zip"
                onChange={(e) => setSelectedFile(e.target.files[0] || null)}
              />
              <label htmlFor="submission-file" className="cursor-pointer">
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2 text-[#4F46E5] font-medium">
                    <FileText size={18} />
                    <span className="text-sm truncate max-w-[260px]">{selectedFile.name}</span>
                  </div>
                ) : (
                  <div className="text-[#94A3B8]">
                    <Upload className="mx-auto mb-2" size={28} />
                    <p className="text-sm font-medium">Click to choose file</p>
                    <p className="text-xs mt-1">PDF, Word, Excel, PPT, images — max 20 MB</p>
                  </div>
                )}
              </label>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSubmitModal(null)}
                className="flex-1 h-10 border border-slate-200 rounded-lg font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={!selectedFile || submittingId === submitModal.hwId}
                className="flex-1 h-10 bg-[#4F46E5] text-white rounded-lg font-medium text-sm disabled:opacity-50 hover:bg-[#4338CA] transition-colors"
              >
                {submittingId === submitModal.hwId ? 'Submitting...' : 'Submit'}
              </button>
            </div>
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
