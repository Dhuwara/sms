import React from 'react';

const Classes = ({
  classDetail,
  staffData,
  handleOpenMarkAttendance,
  selectedClassForStudents,
  classStudents,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Class & Student Management</h2>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">My Assigned Classes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {classDetail?.map((cls, idx) => (
            <div key={idx} className="p-4 border-2 border-[#FCD34D] rounded-lg hover:bg-[#FFFBEB] transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg">{cls.name}</h4>
              </div>
              <p className="text-sm text-[#64748B]">{cls.students} Students</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleOpenMarkAttendance(cls._id)}
                  className="text-xs bg-[#10B981] text-white px-3 py-1 rounded font-semibold hover:bg-[#059669] transition-colors"
                >
                  Mark Attendance
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">
            Student List
            {(() => {
              const ctClasses = (classDetail || []).filter(c => c.staffId === staffData?._id);
              const currentClass = ctClasses.find(c => c._id === selectedClassForStudents) || ctClasses[0];
              return currentClass ? ` - ${currentClass.name} ${currentClass.section}` : '';
            })()}
          </h3>
          {/* <select
            className="border-2 border-[#FCD34D] rounded-lg px-3 py-2 text-sm max-w-[200px]"
            value={selectedClassForStudents}
            onChange={(e) => setSelectedClassForStudents(e.target.value)}
          >
            {classDetail && staffData && classDetail.filter(c => c.staffId === staffData._id).map((c) => (
              <option key={c._id} value={c._id}>{c.name} {c.section}</option>
            ))}
            {(!classDetail || !staffData || classDetail.filter(c => c.staffId === staffData._id).length === 0) && (
              <option value="">No Classes Assigned</option>
            )}
          </select> */}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Roll No</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Student Name</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Parent Contact</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.length > 0 ? classStudents.map((student, idx) => (
                <tr key={idx} className="border-b border-[#E2E8F0] hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold">{student.rollNumber || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm">{student.userId?.name || student.name || 'Unknown'}</td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{student.parentContact || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-[#E2E8F0] text-[#64748B]">
                      --%
                    </span>
                  </td>

                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#64748B]">
                    No students found for this class.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  );
};

export default Classes;
