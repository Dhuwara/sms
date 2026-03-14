import mongoose from 'mongoose';
import Notification from './models/Notification.js';
import Student from './models/Student.js';
import Staff from './models/Staff.js';
import ClassMapping from './models/ClassMapping.js';

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Bulk-insert notifications; silently swallows errors so streams never crash */
const pushNotifs = async (userIds, title, message, type = 'info') => {
  const ids = [...new Set(userIds.filter(Boolean).map(String))];
  if (!ids.length) return;
  try {
    await Notification.insertMany(ids.map(uid => ({ userId: uid, title, message, type })));
  } catch { /* non-critical */ }
};

/** Returns all student userIds enrolled in a given classId (any academic year) */
const getClassStudentUserIds = async (classId) => {
  try {
    const mappings = await ClassMapping.find({ classId }).select('students');
    const studentIds = mappings.flatMap(m => m.students);
    if (!studentIds.length) return [];
    const students = await Student.find({ _id: { $in: studentIds } }).select('userId');
    return students.map(s => s.userId?.toString()).filter(Boolean);
  } catch { return []; }
};

/** Returns the userId string for a Staff document */
const getStaffUserId = async (staffId) => {
  try {
    const staff = await Staff.findById(staffId).select('userId');
    return staff?.userId?.toString() || null;
  } catch { return null; }
};

/** Collect all unique teacher userIds mentioned in a timetable schedule */
const getTeacherUserIdsFromSchedule = async (schedule) => {
  if (!schedule) return [];
  const staffIds = [];
  for (const day of Object.values(schedule)) {
    if (!Array.isArray(day)) continue;
    for (const period of day) {
      if (period.teacher) staffIds.push(period.teacher.toString());
    }
  }
  const unique = [...new Set(staffIds)];
  const staffDocs = await Staff.find({ _id: { $in: unique } }).select('userId');
  return staffDocs.map(s => s.userId?.toString()).filter(Boolean);
};

// ── Watcher factory ────────────────────────────────────────────────────────────

const watch = (Model, pipeline, options, handler) => {
  const modelName = Model.modelName;
  try {
    const stream = Model.watch(pipeline, { fullDocument: 'updateLookup', ...options });
    stream.on('change', async (change) => {
      try { await handler(change); } catch { /* handler error must not kill stream */ }
    });
    stream.on('error', (err) => {
      console.warn(`[ChangeStream] ${modelName} stream error:`, err.message);
    });
    console.log(`[ChangeStream] Watching ${modelName}`);
  } catch (err) {
    console.warn(`[ChangeStream] Could not watch ${modelName}:`, err.message);
  }
};

// ── Stream definitions ─────────────────────────────────────────────────────────

const watchTimetable = () => {
  const Timetable = mongoose.model('Timetable');
  watch(
    Timetable,
    [{ $match: { operationType: { $in: ['insert', 'update', 'replace'] } } }],
    {},
    async (change) => {
      const doc = change.fullDocument;
      if (!doc?.schedule) return;
      const userIds = await getTeacherUserIdsFromSchedule(doc.schedule);
      if (userIds.length) {
        await pushNotifs(userIds, 'Timetable Updated', 'Your class timetable has been updated. Please check your schedule.', 'info');
      }
    }
  );
};

const watchSubstitution = () => {
  const Substitution = mongoose.model('Substitution');
  watch(
    Substitution,
    [{ $match: { operationType: 'insert' } }],
    {},
    async (change) => {
      const doc = change.fullDocument;
      if (!doc?.substituteTeacherId) return;
      const userId = await getStaffUserId(doc.substituteTeacherId);
      if (userId) {
        const dateStr = doc.date ? new Date(doc.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
        await pushNotifs(
          [userId],
          'Substitution Assigned',
          `You have been assigned as a substitute teacher${doc.subject ? ` for ${doc.subject}` : ''}${dateStr ? ` on ${dateStr}` : ''}.`,
          'warning'
        );
      }
    }
  );
};

const watchExam = () => {
  const Exam = mongoose.model('Exam');
  watch(
    Exam,
    [{ $match: { operationType: { $in: ['insert', 'update', 'replace'] } } }],
    {},
    async (change) => {
      const doc = change.fullDocument;
      if (!doc) return;
      const dateStr = doc.date ? new Date(doc.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

      // Notify invigilator (staff)
      if (doc.invigilatorId) {
        const userId = await getStaffUserId(doc.invigilatorId);
        if (userId) {
          await pushNotifs(
            [userId],
            'Exam Invigilator Assignment',
            `You have been assigned as invigilator for ${doc.examType} — ${doc.subject}${dateStr ? ` on ${dateStr}` : ''}.`,
            'info'
          );
        }
      }

      // Notify all students in the class
      if (doc.classId) {
        const studentUserIds = await getClassStudentUserIds(doc.classId);
        if (studentUserIds.length) {
          const verb = change.operationType === 'insert' ? 'scheduled' : 'updated';
          await pushNotifs(
            studentUserIds,
            `Exam ${verb.charAt(0).toUpperCase() + verb.slice(1)}: ${doc.examType}`,
            `${doc.examType} for ${doc.subject} has been ${verb}${dateStr ? ` on ${dateStr}` : ''}. Time: ${doc.startTime || ''} – ${doc.endTime || ''}.`,
            'info'
          );
        }
      }
    }
  );
};

const watchAttendance = () => {
  const Attendance = mongoose.model('Attendance');
  watch(
    Attendance,
    [{ $match: { operationType: { $in: ['insert', 'update', 'replace'] } } }],
    {},
    async (change) => {
      const doc = change.fullDocument;
      if (!doc?.studentId) return;
      const student = await Student.findById(doc.studentId).select('userId');
      if (!student?.userId) return;
      const statusMap = { present: 'Present ✓', absent: 'Absent ✗', late: 'Late', 'half-day': 'Half Day' };
      const typeMap = { present: 'success', absent: 'error', late: 'warning', 'half-day': 'warning' };
      const label = statusMap[doc.status] || doc.status;
      const dateStr = doc.date ? new Date(doc.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
      await pushNotifs(
        [student.userId.toString()],
        'Attendance Marked',
        `Your attendance for ${dateStr} has been marked as ${label}.`,
        typeMap[doc.status] || 'info'
      );
    }
  );
};

const watchHomework = () => {
  const Homework = mongoose.model('Homework');
  watch(
    Homework,
    [{ $match: { operationType: 'insert' } }],
    {},
    async (change) => {
      const doc = change.fullDocument;
      if (!doc?.classId) return;
      const studentUserIds = await getClassStudentUserIds(doc.classId);
      if (!studentUserIds.length) return;
      const dueStr = doc.dueDate ? new Date(doc.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
      await pushNotifs(
        studentUserIds,
        `New Homework: ${doc.subject}`,
        `New homework "${doc.title}" has been assigned for ${doc.subject}${dueStr ? `. Due: ${dueStr}` : ''}.`,
        'info'
      );
    }
  );
};

const watchOnlineClass = () => {
  const OnlineClass = mongoose.model('OnlineClass');
  watch(
    OnlineClass,
    [{ $match: { operationType: 'insert' } }],
    {},
    async (change) => {
      const doc = change.fullDocument;
      if (!doc?.classId) return;
      const studentUserIds = await getClassStudentUserIds(doc.classId);
      if (!studentUserIds.length) return;
      const dateStr = doc.date ? new Date(doc.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
      await pushNotifs(
        studentUserIds,
        `Online Class: ${doc.subject}`,
        `An online class "${doc.title}" for ${doc.subject} has been scheduled on ${doc.platform}${dateStr ? ` on ${dateStr}` : ''}${doc.time ? ` at ${doc.time}` : ''}.`,
        'info'
      );
    }
  );
};

const watchBookIssue = () => {
  const BookIssue = mongoose.model('BookIssue');
  // Watch for status changes to 'overdue' so students/staff get real-time fine alerts
  watch(
    BookIssue,
    [{ $match: { operationType: 'update', 'updateDescription.updatedFields.status': 'overdue' } }],
    {},
    async (change) => {
      const doc = change.fullDocument;
      if (!doc) return;
      let userId = null;
      if (doc.issuedToType === 'staff' && doc.staffId) {
        userId = await getStaffUserId(doc.staffId);
      } else if (doc.studentId) {
        const student = await Student.findById(doc.studentId).select('userId');
        userId = student?.userId?.toString() || null;
      }
      if (userId) {
        await pushNotifs(
          [userId],
          'Library Book Overdue',
          `A book issued to you is now overdue. A fine of ₹${doc.fine || 0} has been applied. Please return it as soon as possible.`,
          'warning'
        );
      }
    }
  );
};

// ── Entry point ────────────────────────────────────────────────────────────────

export const startChangeStreams = () => {
  // Change streams require a MongoDB replica set.
  // If not available, watchers silently fail — app continues normally.
  watchTimetable();
  watchSubstitution();
  watchExam();
  watchAttendance();
  watchHomework();
  watchOnlineClass();
  watchBookIssue();
};
