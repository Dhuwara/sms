import PTM from '../models/PTM.js';
import Parent from '../models/Parent.js';
import Student from '../models/Student.js';

export const createPTM = async (req, res, next) => {
  try {
    const { title, date, time, venue, targetAudience, classIds, notes } = req.body;
    if (!title || !date || !time || !venue) {
      return res.status(400).json({ success: false, message: 'title, date, time and venue are required' });
    }
    const ptm = await PTM.create({
      title, date, time, venue,
      targetAudience: targetAudience || 'all',
      classIds: targetAudience === 'class' ? (classIds || []) : [],
      notes: notes || '',
      createdBy: req.user.userId,
    });
    res.status(201).json({ success: true, data: ptm });
  } catch (err) {
    next(err);
  }
};

export const getPTMs = async (req, res, next) => {
  try {
    const ptms = await PTM.find({})
      .populate('classIds', 'name section')
      .populate('createdBy', 'name')
      .sort({ date: 1 });
    res.json({ success: true, data: ptms });
  } catch (err) {
    next(err);
  }
};

export const getPTMsForParent = async (req, res, next) => {
  try {
    const parent = await Parent.findOne({ userId: req.user.userId });
    if (!parent) return res.json({ success: true, data: [] });

    const children = await Student.find({ _id: { $in: parent.children } });
    const childClassIds = children.map(c => c.classId).filter(Boolean);

    const ptms = await PTM.find({
      $or: [
        { targetAudience: 'all' },
        { targetAudience: 'class', classIds: { $in: childClassIds } },
      ],
    })
      .populate('classIds', 'name section')
      .sort({ date: 1 });

    res.json({ success: true, data: ptms });
  } catch (err) {
    next(err);
  }
};

export const deletePTM = async (req, res, next) => {
  try {
    const ptm = await PTM.findByIdAndDelete(req.params.id);
    if (!ptm) return res.status(404).json({ success: false, message: 'PTM not found' });
    res.json({ success: true, message: 'PTM deleted' });
  } catch (err) {
    next(err);
  }
};
