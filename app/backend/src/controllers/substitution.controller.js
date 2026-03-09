import Substitution from '../models/Substitution.js';
import Staff from '../models/Staff.js';

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
      .populate('classId', 'name section')
      .populate({ path: 'originalTeacherId', populate: { path: 'userId', select: 'name' } })
      .populate({ path: 'substituteTeacherId', populate: { path: 'userId', select: 'name' } })
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
      .populate('classId', 'name section')
      .populate({ path: 'originalTeacherId', populate: { path: 'userId', select: 'name' } })
      .sort({ date: -1 });

    res.json({ success: true, data: substitutions });
  } catch (err) {
    next(err);
  }
};

// POST /api/substitutions
export const createSubstitution = async (req, res, next) => {
  try {
    const { originalTeacherId, substituteTeacherId, classId, date, periodIndex, subject, reason } = req.body;
    if (!originalTeacherId || !substituteTeacherId || !classId || !date || periodIndex === undefined) {
      return res.status(400).json({ success: false, message: 'originalTeacherId, substituteTeacherId, classId, date, and periodIndex are required' });
    }

    const substitution = await Substitution.create({
      originalTeacherId, substituteTeacherId, classId,
      date: new Date(date), periodIndex, subject, reason,
      createdBy: req.user.userId,
    });

    const populated = await Substitution.findById(substitution._id)
      .populate('classId', 'name section')
      .populate({ path: 'originalTeacherId', populate: { path: 'userId', select: 'name' } })
      .populate({ path: 'substituteTeacherId', populate: { path: 'userId', select: 'name' } });

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// PUT /api/substitutions/:id
export const updateSubstitution = async (req, res, next) => {
  try {
    const substitution = await Substitution.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('classId', 'name section')
      .populate({ path: 'originalTeacherId', populate: { path: 'userId', select: 'name' } })
      .populate({ path: 'substituteTeacherId', populate: { path: 'userId', select: 'name' } });
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
