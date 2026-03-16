import React from 'react';

const Timetable = ({ timetableData, periodConfig, scheduleData, schoolEvents, formatDate, getAcademicYear }) => {
  const classInfo = scheduleData?.class;
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = periodConfig?.periods || [];
  const schedule = timetableData?.schedule || {};

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Timetable & Schedule</h2>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Class Timetable - {classInfo?.name || ''} {classInfo?.section ? `Section ${classInfo.section}` : ''}</h3>
        {periods.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-linear-to-r from-[#DBEAFE] to-[#EDE9FE]">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-sm">Day</th>
                  {periods.filter((p, i, arr) => {
                    const dayPeriods = arr.filter(pp => (pp.day || 'Monday') === 'Monday');
                    return i < (dayPeriods.length || arr.length);
                  }).map((p, i) => (
                    <th key={i} className="px-4 py-3 text-left font-bold text-sm">
                      {p.name}<br /><span className="font-normal text-xs">{p.startTime}-{p.endTime}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day, idx) => {
                  const dayPeriods = periods.filter(p => (p.day || 'Monday') === day);
                  const daySchedule = schedule[day] || [];
                  return (
                    <tr key={idx} className="border-b border-[#E2E8F0]">
                      <td className="px-4 py-3 font-semibold">{day}</td>
                      {dayPeriods.map((p, pi) => {
                        const entry = daySchedule[pi];
                        const subj = entry?.subject || p.subject || (p.type !== 'class' && p.type !== 'lab' ? p.type.charAt(0).toUpperCase() + p.type.slice(1) : '—');
                        return <td key={pi} className="px-4 py-3 text-sm">{subj}</td>;
                      })}
                      {dayPeriods.length === 0 && <td className="px-4 py-3 text-sm text-[#64748B]" colSpan={6}>No periods configured</td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-[#64748B]">
            <p>No timetable configured yet. Please check back later.</p>
          </div>
        )}
      </div>

      {/* <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <GraduationCap className="text-[#DC2626]" size={20} />
          Upcoming Exams
        </h3>
        {exams.length > 0 || examResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-linear-to-r from-[#FEE2E2] to-[#FEF3C7]">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-sm">Date</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Subject</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Time</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Duration</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Max Marks</th>
                </tr>
              </thead>
              <tbody>
                {exams.filter(e => new Date(e.date) >= new Date()).slice(0, 10).map((exam, idx) => (
                  <tr key={idx} className="border-b border-[#E2E8F0]">
                    <td className="px-4 py-3 text-sm font-semibold">{formatDate(exam.date)}</td>
                    <td className="px-4 py-3 text-sm">{exam.subject}</td>
                    <td className="px-4 py-3 text-sm">{formatTime(exam.startTime)}</td>
                    <td className="px-4 py-3 text-sm">{exam.period ? `${exam.period} mins` : '—'}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{exam.maxScore || 100}</td>
                  </tr>
                ))}
                {exams.filter(e => new Date(e.date) >= new Date()).length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-[#64748B]">No upcoming exams</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-[#64748B] py-4">No exam schedule available</p>
        )}
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Holiday Calendar — shows admin events with eventType = holiday */}
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Holiday Calendar</h3>
          <div className="space-y-3">
            {schoolEvents.filter(e => e.eventType === 'holiday').length > 0 ? (
              schoolEvents.filter(e => e.eventType === 'holiday').map((event) => (
                <div key={event._id} className="p-3 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-xs text-[#64748B] capitalize">{event.priority} priority</p>
                  </div>
                  <span className="px-3 py-1 bg-[#D1FAE5] text-[#065F46] rounded-full text-sm font-semibold whitespace-nowrap">
                    {formatDate(event.startDate)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#64748B] text-center py-4">No holidays scheduled</p>
            )}
          </div>
        </div>

        {/* School Events — shows non-holiday admin events */}
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">School Events</h3>
          <div className="space-y-3">
            {schoolEvents.filter(e => e.eventType !== 'holiday').length > 0 ? (
              schoolEvents.filter(e => e.eventType !== 'holiday').map((event) => {
                const typeColors = {
                  exam: { bg: 'bg-[#FEE2E2]', text: 'text-[#991B1B]' },
                  sports: { bg: 'bg-[#D1FAE5]', text: 'text-[#065F46]' },
                  cultural: { bg: 'bg-[#FED7AA]', text: 'text-[#C2410C]' },
                  academic: { bg: 'bg-[#DBEAFE]', text: 'text-[#1E40AF]' },
                  meeting: { bg: 'bg-[#F3F4F6]', text: 'text-[#374151]' },
                  other: { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]' },
                };
                const c = typeColors[event.eventType] || typeColors.other;
                return (
                  <div key={event._id} className={`p-3 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{event.title}</p>
                      <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.bg} ${c.text}`}>
                        {event.eventType}
                      </span>
                    </div>
                    <span className="ml-2 px-3 py-1 bg-[#DBEAFE] text-[#1E40AF] rounded-full text-xs font-semibold whitespace-nowrap">
                      {formatDate(event.startDate)}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-[#64748B] text-center py-4">No upcoming events</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Timetable;
