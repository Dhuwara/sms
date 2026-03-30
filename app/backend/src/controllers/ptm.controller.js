import PTM from '../models/PTM.js';
import Parent from '../models/Parent.js';
import Student from '../models/Student.js';
import ClassMapping from '../models/ClassMapping.js';
import { sendWhatsAppBulk } from '../utils/whatsapp.js';

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
      schoolId: req.user.schoolId,
    });

    // WhatsApp: Notify parents about PTM (fire-and-forget)
    const dateStr = new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const notifyPtmParents = async () => {
      let studentFilter = { status: 'active' };
      if (targetAudience === 'class' && classIds?.length > 0) {
        const mappings = await Promise.all(classIds.map(cid => ClassMapping.findOne({ classId: cid }).select('students')));
        const allStudentIds = mappings.flatMap(m => m?.students || []);
        studentFilter._id = { $in: allStudentIds };
      }
      const students = await Student.find(studentFilter).select('parentId');
      const parentIds = [...new Set(students.map(s => s.parentId).filter(Boolean).map(String))];
      if (parentIds.length === 0) return;

      const parents = await Parent.find({ _id: { $in: parentIds } }).populate('userId', 'name phone');
      const recipients = parents
        .filter(p => p.userId?.phone)
        .map(p => ({
          phone: p.userId.phone,
          message: `Dear ${p.userId.name || 'Parent'},\n\nParent-Teacher Meeting scheduled:\n\n📋 ${title}\n📅 Date: ${dateStr}\n🕐 Time: ${time}\n📍 Venue: ${venue}\n\nYour presence is important for your child's progress.\n\n- School Management`,
        }));
      await sendWhatsAppBulk(recipients);
    };
    notifyPtmParents().catch(err => console.error('PTM WhatsApp alert failed:', err.message));

    res.status(201).json({ success: true, data: ptm });
  } catch (err) {
    next(err);
  }
};

export const getPTMs = async (req, res, next) => {
  try {
    const ptms = await PTM.find({ schoolId: req.user.schoolId })
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
      schoolId: req.user.schoolId,
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
