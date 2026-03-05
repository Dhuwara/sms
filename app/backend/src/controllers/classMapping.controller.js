import ClassMapping from '../models/ClassMapping.js';
import Class from '../models/Class.js';

export const getMapping = async (req, res, next) => {
  try {
    const { classId, academicYear } = req.params;
    const mapping = await ClassMapping.findOne({ classId, academicYear });
    if (!mapping) return res.status(404).json({ success: false, message: 'No mapping found' });
    res.json({ success: true, data: mapping });
  } catch (err) {
    next(err);
  }
};

export const saveMapping = async (req, res, next) => {
  try {
    const { classId, academicYear, classTeacher, subjectTeachers, students } = req.body;
    const mapping = await ClassMapping.findOneAndUpdate(
      { classId, academicYear },
      {
        classTeacher: classTeacher || null,
        subjectTeachers: subjectTeachers || {},
        students: students || [],
      },
      { upsert: true, new: true }
    );
    // Keep Class.staffId in sync
    await Class.findByIdAndUpdate(classId, { staffId: classTeacher || null });
    res.json({ success: true, data: mapping });
  } catch (err) {
    next(err);
  }
};
