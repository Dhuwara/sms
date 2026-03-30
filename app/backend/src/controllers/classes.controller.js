import Class from '../models/Class.js';
import Staff from '../models/Staff.js';
import ClassMapping from '../models/ClassMapping.js';

const toFlat = (cls) => ({
  _id: cls._id,
  name: cls.name,
  section: cls.section,
  gradeLevel: cls.gradeLevel,
  capacity: cls.capacity ?? 40,
  roomNumber: cls.roomNumber || '',
  subjects: cls.subjects || [],
  classTeacher: cls.staffId
    ? { _id: cls.staffId._id, name: cls.staffId.userId?.name || '' }
    : null,
  createdAt: cls.createdAt,
});

const populateClass = (query) =>
  query.populate({ path: 'staffId', populate: { path: 'userId', select: 'name' } });

export const getClasses = async (req, res, next) => {
  try {
    const schoolId = req.user.schoolId;
    const classes = await populateClass(Class.find({ schoolId }).sort({ createdAt: -1 }));
    res.json({ success: true, data: classes.map(toFlat) });
  } catch (err) {
    next(err);
  }
};

export const createClass = async (req, res, next) => {
  try {
    const { name, section, gradeLevel, staffId, capacity, roomNumber, subjects } = req.body;
    const schoolId = req.user.schoolId;
    if (!name || !section) {
      return res.status(400).json({ success: false, message: 'Name and section are required' });
    }
    const sectionUpper = section.toUpperCase();
    const existing = await Class.findOne({ name, section: sectionUpper, schoolId });
    if (existing) {
      return res.status(400).json({ success: false, message: `Section ${sectionUpper} already exists for ${name}` });
    }
    const cls = await Class.create({
      name,
      section: sectionUpper,
      gradeLevel,
      staffId: staffId || undefined,
      capacity: capacity || 40,
      roomNumber: roomNumber || '',
      subjects: subjects || [],
      schoolId,
    });
    if (staffId) {
      await Staff.findByIdAndUpdate(staffId, { $addToSet: { classesAssigned: cls._id } });
    }
    const populated = await populateClass(Class.findById(cls._id));
    res.status(201).json({ success: true, data: toFlat(populated) });
  } catch (err) {
    next(err);
  }
};

export const updateClass = async (req, res, next) => {
  try {
    const { name, section, gradeLevel, staffId, capacity, roomNumber, subjects } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (section !== undefined) update.section = section;
    if (gradeLevel !== undefined) update.gradeLevel = gradeLevel;
    if (staffId !== undefined) update.staffId = staffId || null;
    if (capacity !== undefined) update.capacity = capacity;
    if (roomNumber !== undefined) update.roomNumber = roomNumber;
    if (subjects !== undefined) update.subjects = subjects;

    if (staffId !== undefined) {
      const old = await Class.findById(req.params.id).select('staffId');
      const oldStaffId = old?.staffId?.toString();
      const newStaffId = staffId || null;
      if (oldStaffId && oldStaffId !== newStaffId?.toString()) {
        await Staff.findByIdAndUpdate(oldStaffId, { $pull: { classesAssigned: old._id } });
      }
      if (newStaffId && newStaffId.toString() !== oldStaffId) {
        await Staff.findByIdAndUpdate(newStaffId, { $addToSet: { classesAssigned: req.params.id } });
      }
      // Sync classTeacher in all ClassMapping records for this class
      await ClassMapping.updateMany(
        { classId: req.params.id },
        { classTeacher: newStaffId }
      );
    }

    const cls = await populateClass(
      Class.findByIdAndUpdate(req.params.id, update, { new: true })
    );
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, data: toFlat(cls) });
  } catch (err) {
    next(err);
  }
};

export const deleteClass = async (req, res, next) => {
  try {
    const cls = await Class.findByIdAndDelete(req.params.id);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    if (cls.staffId) {
      await Staff.findByIdAndUpdate(cls.staffId, { $pull: { classesAssigned: cls._id } });
    }
    res.json({ success: true, message: 'Class deleted' });
  } catch (err) {
    next(err);
  }
};
