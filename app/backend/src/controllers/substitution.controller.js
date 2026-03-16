import Substitution from '../models/Substitution.js';
import Staff from '../models/Staff.js';
import PeriodConfig from '../models/PeriodConfig.js';
import Timetable from '../models/Timetable.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const POPULATE_FIELDS = [
  { path: 'classId', select: 'name section' },
  { path: 'originalTeacherId', populate: { path: 'userId', select: 'name' } },
  { path: 'substituteTeacherId', populate: { path: 'userId', select: 'name' } },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const getDefaultAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const startYear = month >= 6 ? year : year - 1;
  return `${startYear}-${String(startYear + 1)}`;
};

const getDayName = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
};

// ── Admin CRUD ───────────────────────────────────────────────────────────────

// GET /api/substitutions?date=&classId=
export const getSubstitutions = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.date) {
      const d = new Date(req.query.date);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      filter.date = { $gte: start, $lte: end };
    }
    if (req.query.classId) filter.classId = req.query.classId;

    const substitutions = await Substitution.find(filter)
      .populate(POPULATE_FIELDS)
      .sort({ date: -1, periodIndex: 1 });

    res.json({ success: true, data: substitutions });
  } catch (err) {
    next(err);
  }
};

// GET /api/substitutions/my-duties — staff: their substitute duties
export const getMySubstituteDuties = async (req, res, next) => {
  try {
    const staff = await Staff.findOne({ userId: req.user.userId });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff profile not found' });

    const substitutions = await Substitution.find({ substituteTeacherId: staff._id })
      .populate(POPULATE_FIELDS)
      .sort({ date: -1 });

    res.json({ success: true, data: substitutions });
  } catch (err) {
    next(err);
  }
};

// POST /api/substitutions
export const createSubstitution = async (req, res, next) => {
  try {
    const { originalTeacherId, substituteTeacherId, classId, date, periodIndex, periodName, subject, reason } = req.body;
    if (!originalTeacherId || !substituteTeacherId || !classId || !date || periodIndex === undefined) {
      return res.status(400).json({ success: false, message: 'originalTeacherId, substituteTeacherId, classId, date, and periodIndex are required' });
    }

    const substitution = await Substitution.create({
      originalTeacherId, substituteTeacherId, classId,
      date: new Date(date), periodIndex, periodName, subject, reason,
      status: 'pending',
      createdBy: req.user.userId,
    });

    const populated = await Substitution.findById(substitution._id).populate(POPULATE_FIELDS);

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// PUT /api/substitutions/:id
export const updateSubstitution = async (req, res, next) => {
  try {
    const substitution = await Substitution.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate(POPULATE_FIELDS);
    if (!substitution) return res.status(404).json({ success: false, message: 'Substitution not found' });
    res.json({ success: true, data: substitution });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/substitutions/:id
export const deleteSubstitution = async (req, res, next) => {
  try {
    const sub = await Substitution.findByIdAndDelete(req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: 'Substitution not found' });
    res.json({ success: true, message: 'Substitution deleted' });
  } catch (err) {
    next(err);
  }
};

// ── Cascading data endpoints ─────────────────────────────────────────────────

// GET /api/substitutions/periods-by-class?classId=xxx&date=2026-03-16
// Returns periods for that class on that day-of-week with teacher info from Timetable
export const getPeriodsByClassAndDate = async (req, res, next) => {
  try {
    const { classId, date } = req.query;
    if (!classId || !date) {
      return res.status(400).json({ success: false, message: 'classId and date are required' });
    }

    const dayName = getDayName(date);
    console.log(dayName,"dayname")
    console.log(classId,"classId")
    const academicYear = getDefaultAcademicYear();
        console.log(academicYear, "academicYear");

    // Get period structure (names, times, types) from PeriodConfig
    const config = await PeriodConfig.findOne({ classId, academicYear });
    console.log(config,"configg")
    if (!config) return res.json({ success: true, data: [] });

    // Get timetable schedule for actual teacher/subject assignments
    const timetable = await Timetable.findOne({ classId, academicYear });
    const daySchedule = timetable?.schedule?.[dayName] || [];

    // Filter periods for the selected day, only class/lab/sports types
    const dayPeriods = config.periods
      .filter(p => p.day === dayName && p.type !== 'break' && p.type !== 'lunch' && p.type !== 'assembly')
      .map(p => {
        const periodIdx = config.periods.indexOf(p);
        // Find matching timetable entry by periodIndex
        const ttEntry = daySchedule.find(e => e.periodIndex === periodIdx);
        return {
          index: periodIdx,
          name: p.name,
          startTime: p.startTime,
          endTime: p.endTime,
          // Use timetable assignment if available, otherwise fall back to PeriodConfig
          subject: ttEntry?.subject || p.subject || '',
          teacher: ttEntry?.teacher || p.teacher || null,
          type: p.type,
        };
      });

    // Populate teacher names
    const teacherIds = dayPeriods.map(p => p.teacher).filter(Boolean);
    const staffDocs = await Staff.find({ _id: { $in: teacherIds } }).populate('userId', 'name');
    const staffMap = {};
    for (const s of staffDocs) {
      staffMap[s._id.toString()] = { _id: s._id, name: s.userId?.name || s.employeeId || 'Unknown' };
    }

    const result = dayPeriods.map(p => ({
      ...p,
      teacher: p.teacher ? staffMap[p.teacher.toString()] || null : null,
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// ── Staff respond to substitution ────────────────────────────────────────────

// PUT /api/substitutions/:id/respond  { status: 'accepted'|'rejected', responseReason: '...' }
export const respondToSubstitution = async (req, res, next) => {
  try {
    const { status, responseReason } = req.body;
    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'status must be accepted or rejected' });
    }

    const staff = await Staff.findOne({ userId: req.user.userId });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff profile not found' });

    const substitution = await Substitution.findById(req.params.id);
    if (!substitution) return res.status(404).json({ success: false, message: 'Substitution not found' });

    if (substitution.substituteTeacherId.toString() !== staff._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not the assigned substitute teacher' });
    }

    if (substitution.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'This substitution has already been responded to' });
    }

    substitution.status = status;
    substitution.responseReason = responseReason || '';
    substitution.respondedAt = new Date();
    await substitution.save();

    const populated = await Substitution.findById(substitution._id).populate(POPULATE_FIELDS);

    // Notify all admins about the teacher's response
    const teacherName = populated.substituteTeacherId?.userId?.name || 'A teacher';
    const dateStr = new Date(substitution.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const className = populated.classId ? `${populated.classId.name} ${populated.classId.section || ''}`.trim() : '';

    const admins = await User.find({ role: 'admin' }).select('_id');
    if (admins.length) {
      const notifDocs = admins.map(a => ({
        userId: a._id,
        title: `Substitution ${status === 'accepted' ? 'Accepted' : 'Rejected'}`,
        message: `${teacherName} has ${status} the substitution for ${className}${substitution.subject ? ` (${substitution.subject})` : ''} on ${dateStr}.${responseReason ? ` Reason: ${responseReason}` : ''}`,
        type: status === 'accepted' ? 'success' : 'error',
      }));
      await Notification.insertMany(notifDocs);
    }

    res.json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};
