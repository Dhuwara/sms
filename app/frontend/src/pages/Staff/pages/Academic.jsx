import React from 'react';
import { FileText, BookOpen, ClipboardCheck, Book, Upload, Download, XCircle, Video, Plus } from 'lucide-react';

const Academic = ({
  staffData,
  academicClasses,
  selectedAcademicClass,
  setSelectedAcademicClass,
  lessonPlans,
  setLessonPlans,
  studyMaterials,
  setStudyMaterials,
  classHomework,
  setClassHomework,
  onlineClasses,
  setOnlineClasses,
  examDuties,
  showStudyMaterialModal,
  setShowStudyMaterialModal,
  studyMaterialForm,
  setStudyMaterialForm,
  handleUploadStudyMaterial,
  studyMaterialSubmitting,
  showHomeworkModal,
  setShowHomeworkModal,
  homeworkForm,
  setHomeworkForm,
  handleCreateHomework,
  homeworkSubmitting,
  classSubjects,
  showOnlineClassModal,
  setShowOnlineClassModal,
  onlineClassForm,
  setOnlineClassForm,
  handleOnlineClassSubmit,
  onlineClassSubmitting,
  handleDownloadLessonPlan,
  handleDeleteLessonPlan,
  handleDeleteHomework,
  handleDownloadStudyMaterial,
  handleDeleteStudyMaterial,
  handleDeleteOnlineClass,
  setLessonPlanForm,
  setShowLessonPlanModal,
  formatDate,
  formatFileSize,
  formatHHmm,
}) => {
  const assignedClasses = academicClasses?.length > 0 ? academicClasses : (staffData?.classesAssigned || []);
  const selectedClassObj = assignedClasses.find(c => c._id === selectedAcademicClass);

  const handleClassChange = (classId) => {
    setSelectedAcademicClass(classId);
    setLessonPlans([]);
    setStudyMaterials([]);
    setClassHomework([]);
    setOnlineClasses([]);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Academic Management</h2>

      {/* Class Selector */}
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-4 flex items-center gap-3">
        <span className="font-semibold text-[#0F172A]">Select Class:</span>
        {assignedClasses.length === 0 ? (
          <span className="text-sm text-[#64748B]">No classes assigned</span>
        ) : (
          <select
            value={selectedAcademicClass}
            onChange={(e) => handleClassChange(e.target.value)}
            className="flex-1 max-w-xs px-4 py-2 border-2 border-[#FCD34D] rounded-lg text-sm font-semibold focus:outline-none focus:border-[#4F46E5] transition-colors"
          >
            <option value="">All Classes</option>
            {assignedClasses.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name} {cls.section}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#FEF3C7] rounded-xl border-2 border-[#F59E0B] text-center">
          <FileText className="mx-auto text-[#F59E0B] mb-2" size={32} />
          <p className="font-bold text-2xl">{lessonPlans.length}</p>
          <p className="text-sm text-[#64748B]">Lesson Plans</p>
        </div>
        <div className="p-4 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981] text-center">
          <BookOpen className="mx-auto text-[#10B981] mb-2" size={32} />
          <p className="font-bold text-2xl">{classHomework.length}</p>
          <p className="text-sm text-[#64748B]">Assignments Given</p>
        </div>
        <div className="p-4 bg-[#DBEAFE] rounded-xl border-2 border-[#3B82F6] text-center">
          <ClipboardCheck className="mx-auto text-[#3B82F6] mb-2" size={32} />
          <p className="font-bold text-2xl">{classHomework.reduce((sum, h) => sum + (h.submissionCount || 0), 0)}</p>
          <p className="text-sm text-[#64748B]">Submissions</p>
        </div>
        <div className="p-4 bg-[#EDE9FE] rounded-xl border-2 border-[#7C3AED] text-center">
          <Book className="mx-auto text-[#7C3AED] mb-2" size={32} />
          <p className="font-bold text-2xl">{studyMaterials.length}</p>
          <p className="text-sm text-[#64748B]">Study Materials</p>
        </div>
      </div>

      {/* Lesson Plans */}
      <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <FileText className="text-[#F59E0B]" size={20} />
          Lesson Plans {selectedClassObj ? `\u2014 ${selectedClassObj.name} ${selectedClassObj.section}` : ''}
        </h3>
        <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-2">
          {lessonPlans.length > 0 ? lessonPlans.map((plan) => (
            <div key={plan._id} className="p-3 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center bg-white hover:border-[#CBD5E1] transition-colors">
              <div>
                <p className="font-semibold text-sm">{plan.title}</p>
                <p className="text-xs text-[#64748B]">
                  {plan.classId?.name} {plan.classId?.section} • {plan.subject} • {new Date(plan.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleDownloadLessonPlan(plan._id, plan.originalName)} className="text-[#4F46E5] text-sm font-semibold hover:underline">View</button>
                <button onClick={() => handleDeleteLessonPlan(plan._id)} className="text-red-500 text-sm font-semibold hover:underline">Delete</button>
              </div>
            </div>
          )) : (
            <p className="text-sm text-[#64748B] text-center py-4">No lesson plans {selectedAcademicClass ? 'for this class' : ''} yet.</p>
          )}
        </div>
        <button
          onClick={() => {
            setLessonPlanForm({ title: '', classId: selectedAcademicClass, subject: '', date: '', file: null });
            setShowLessonPlanModal(true);
          }}
          className="w-full bg-[#4F46E5] text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#4338CA] transition-colors"
        >
          <Upload size={18} /> Upload Lesson Plan
        </button>
      </div>

      {/* Homework & Study Materials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <ClipboardCheck className="text-[#DC2626]" size={20} />
            Homework & Assignments {selectedClassObj ? `\u2014 ${selectedClassObj.name} ${selectedClassObj.section}` : ''}
          </h3>
          <div className="space-y-3 mb-4 max-h-[260px] overflow-y-auto pr-1">
            {classHomework.length > 0 ? classHomework.map((hw) => (
              <div key={hw._id} className="p-3 border-2 border-[#E2E8F0] rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm">{hw.title}</p>
                    <p className="text-xs text-[#64748B]">{hw.classId?.name} {hw.classId?.section} • Due: {formatDate(hw.dueDate)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-[#DBEAFE] text-[#1E40AF] px-2 py-1 rounded-full">{hw.submissionCount || 0} submissions</span>
                    <button onClick={() => handleDeleteHomework(hw._id)} className="text-red-400 hover:text-red-600"><XCircle size={16} /></button>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-sm text-[#64748B] text-center py-4">No homework {selectedAcademicClass ? 'for this class' : ''} yet.</p>
            )}
          </div>
          <button
            onClick={() => setShowHomeworkModal(true)}
            disabled={!selectedAcademicClass}
            className="w-full bg-[#10B981] text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={18} /> Assign Homework
          </button>
          {!selectedAcademicClass && <p className="text-xs text-[#64748B] text-center mt-1">Select a class to assign homework</p>}
        </div>

        <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Book className="text-[#7C3AED]" size={20} />
            Study Materials & Notes {selectedClassObj ? `\u2014 ${selectedClassObj.name} ${selectedClassObj.section}` : ''}
          </h3>
          <div className="space-y-3 mb-4 max-h-[260px] overflow-y-auto pr-1">
            {studyMaterials.length > 0 ? studyMaterials.map((material) => (
              <div key={material._id} className="p-3 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#EDE9FE] rounded-lg flex items-center justify-center">
                    <FileText className="text-[#7C3AED]" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{material.title}</p>
                    <p className="text-xs text-[#64748B]">{material.subject} • {formatFileSize(material.size)}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleDownloadStudyMaterial(material._id, material.originalName)} className="text-[#4F46E5] p-1"><Download size={16} /></button>
                  <button onClick={() => handleDeleteStudyMaterial(material._id)} className="text-red-400 hover:text-red-600 p-1"><XCircle size={16} /></button>
                </div>
              </div>
            )) : (
              <p className="text-sm text-[#64748B] text-center py-4">No study materials {selectedAcademicClass ? 'for this class' : ''} yet.</p>
            )}
          </div>
          <button
            onClick={() => setShowStudyMaterialModal(true)}
            disabled={!selectedAcademicClass}
            className="w-full bg-[#F59E0B] text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={18} /> Upload Materials
          </button>
          {!selectedAcademicClass && <p className="text-xs text-[#64748B] text-center mt-1">Select a class to upload materials</p>}
        </div>
      </div>

      {/* Online Classes */}
      <div className="p-6 bg-white rounded-xl border-2 border-[#FCD34D]">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Video className="text-[#EF4444]" size={20} />
          Online Classes {selectedClassObj ? `\u2014 ${selectedClassObj.name} ${selectedClassObj.section}` : ''}
        </h3>
        <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-2">
          {onlineClasses.length > 0 ? onlineClasses.map((oc) => (
            <div key={oc._id} className="p-3 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center bg-white hover:border-[#CBD5E1] transition-colors">
              <div className="flex-1 min-w-0 pr-4">
                <p className="font-semibold text-sm truncate">{oc.title} ({oc.platform})</p>
                <p className="text-xs text-[#64748B]">
                  {oc.subject} • {new Date(oc.date).toLocaleDateString()} at {oc.time}
                </p>
                <a href={oc.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs text-[#4F46E5] hover:underline truncate inline-block max-w-full">
                  {oc.meetingLink}
                </a>
              </div>
              <div className="flex gap-2 whitespace-nowrap">
                <button onClick={() => handleDeleteOnlineClass(oc._id)} className="text-red-500 text-sm font-semibold hover:underline">Delete</button>
              </div>
            </div>
          )) : (
            <p className="text-sm text-[#64748B] text-center py-4">No online classes scheduled {selectedAcademicClass ? 'for this class' : ''} yet.</p>
          )}
        </div>
        <button
          onClick={() => {
            setOnlineClassForm({ title: '', platform: 'Google Meet', link: '', date: '', time: '', subject: '', classId: selectedAcademicClass });
            setShowOnlineClassModal(true);
          }}
          disabled={!selectedAcademicClass}
          className="w-full py-3 bg-white border-2 border-[#EF4444] text-[#EF4444] hover:bg-[#FEF2F2] font-bold rounded-xl transition-colors disabled:opacity-50 disabled:border-[#E2E8F0] disabled:text-[#94A3B8] disabled:hover:bg-white flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Schedule Online Class
        </button>
      </div>

      {/* Exam Invigilator Duties */}
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">My Invigilator Duties</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Exam Name</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Subject</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Class</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Date</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Time</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Max Marks</th>
              </tr>
            </thead>
            <tbody>
              {examDuties.length > 0 ? examDuties.map((exam, idx) => (
                <tr key={exam._id || idx} className="border-b border-[#E2E8F0]">
                  <td className="px-4 py-3 text-sm font-semibold">{exam.examType}</td>
                  <td className="px-4 py-3 text-sm">{exam.subject}</td>
                  <td className="px-4 py-3 text-sm">{exam.classId?.name} {exam.classId?.section}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(exam.date)}</td>
                  <td className="px-4 py-3 text-sm">{formatHHmm(exam.startTime)} – {formatHHmm(exam.endTime)}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{exam.maxScore}</td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-[#64748B] text-sm">No invigilator duties assigned yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Study Material Upload Modal */}
      {showStudyMaterialModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-[#0F172A] mb-4">Upload Study Material — {selectedClassObj?.name} {selectedClassObj?.section}</h2>
            <form onSubmit={handleUploadStudyMaterial} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Title</label>
                <input type="text" required value={studyMaterialForm.title} onChange={(ev) => setStudyMaterialForm({ ...studyMaterialForm, title: ev.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Subject</label>
                <input type="text" required value={studyMaterialForm.subject} onChange={(ev) => setStudyMaterialForm({ ...studyMaterialForm, subject: ev.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Description (optional)</label>
                <textarea value={studyMaterialForm.description} onChange={(ev) => setStudyMaterialForm({ ...studyMaterialForm, description: ev.target.value })} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">File (max 20MB)</label>
                <input type="file" required onChange={(ev) => setStudyMaterialForm({ ...studyMaterialForm, file: ev.target.files[0] })} className="w-full border-2 border-[#E2E8F0] rounded-lg px-3 py-2 text-sm  " />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowStudyMaterialModal(false)} className="flex-1 h-10 border border-slate-200 rounded-lg font-medium">Cancel</button>
                <button type="submit" disabled={studyMaterialSubmitting} className="flex-1 h-10 bg-[#F59E0B] text-white rounded-lg font-medium disabled:opacity-50">{studyMaterialSubmitting ? 'Uploading...' : 'Upload'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Homework Modal */}
      {showHomeworkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-[#0F172A] mb-4">Assign Homework — {selectedClassObj?.name} {selectedClassObj?.section}</h2>
            <form onSubmit={handleCreateHomework} className="space-y-4">
              <div>
                <label className="block text-sm font-medium teLxt-[#0F172A] mb-1">Title</label>
                <input type="text" required value={homeworkForm.title} onChange={(ev) => setHomeworkForm({ ...homeworkForm, title: ev.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Subject</label>
                {classSubjects.length > 0 ? (
                  <select required value={homeworkForm.subject} onChange={(ev) => setHomeworkForm({ ...homeworkForm, subject: ev.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
                    <option value="">Select subject</option>
                    {classSubjects.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                  </select>
                ) : (
                  <input type="text" required placeholder="e.g. Mathematics" value={homeworkForm.subject} onChange={(ev) => setHomeworkForm({ ...homeworkForm, subject: ev.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Description (optional)</label>
                <textarea value={homeworkForm.description} onChange={(ev) => setHomeworkForm({ ...homeworkForm, description: ev.target.value })} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Due Date</label>
                <input type="date" required value={homeworkForm.dueDate} onChange={(ev) => setHomeworkForm({ ...homeworkForm, dueDate: ev.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Attachments (optional, max 5 files, 20MB each)</label>
                <input type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png" onChange={(ev) => setHomeworkForm({ ...homeworkForm, files: Array.from(ev.target.files) })} className="w-full border-2 border-[#E2E8F0] rounded-lg px-3 py-2 text-sm" />
                {homeworkForm.files.length > 0 && (
                  <p className="text-xs text-[#10B981] mt-1">{homeworkForm.files.length} file(s) selected</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowHomeworkModal(false)} className="flex-1 h-10 border border-slate-200 rounded-lg font-medium">Cancel</button>
                <button type="submit" disabled={homeworkSubmitting} className="flex-1 h-10 bg-[#10B981] text-white rounded-lg font-medium disabled:opacity-50">{homeworkSubmitting ? 'Saving...' : 'Assign'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Online Class Modal */}
      {showOnlineClassModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-[#0F172A] mb-4">Schedule Online Class — {selectedClassObj?.name} {selectedClassObj?.section}</h2>
            <form onSubmit={handleOnlineClassSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Title</label>
                <input type="text" required value={onlineClassForm.title} onChange={(ev) => setOnlineClassForm({ ...onlineClassForm, title: ev.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">Platform</label>
                  <select required value={onlineClassForm.platform} onChange={(ev) => setOnlineClassForm({ ...onlineClassForm, platform: ev.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
                    <option value="Google Meet">Google Meet</option>
                    <option value="Teams">Teams</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Webex">Webex</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">Subject</label>
                  {classSubjects.length > 0 ? (
                    <select required value={onlineClassForm.subject} onChange={(ev) => setOnlineClassForm({ ...onlineClassForm, subject: ev.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
                      <option value="">Select subject</option>
                      {classSubjects.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                    </select>
                  ) : (
                    <input type="text" required placeholder="Subject" value={onlineClassForm.subject} onChange={(ev) => setOnlineClassForm({ ...onlineClassForm, subject: ev.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1">Meeting Link</label>
                <input type="url" required placeholder="https://..." value={onlineClassForm.link} onChange={(ev) => setOnlineClassForm({ ...onlineClassForm, link: ev.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">Date</label>
                  <input type="date" required value={onlineClassForm.date} onChange={(ev) => setOnlineClassForm({ ...onlineClassForm, date: ev.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">Time</label>
                  <input type="time" required value={onlineClassForm.time} onChange={(ev) => setOnlineClassForm({ ...onlineClassForm, time: ev.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowOnlineClassModal(false)} className="flex-1 h-10 border border-slate-200 rounded-lg font-medium">Cancel</button>
                <button type="submit" disabled={onlineClassSubmitting} className="flex-1 h-10 bg-[#EF4444] text-white rounded-lg font-medium disabled:opacity-50 hover:bg-[#DC2626]">{onlineClassSubmitting ? 'Saving...' : 'Schedule'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Academic;
