import ClassMapping from '../models/ClassMapping.js';
import Class from '../models/Class.js';
import Staff from '../models/Staff.js';
import Student from "../models/Student.js";

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

export const getAssignedStudents = async (req, res, next) => {
  try {
    const { academicYear } = req.params;
    const mappings = await ClassMapping.find({ academicYear }).select('students');
    const studentIds = mappings.flatMap((m) => m.students.map((id) => id.toString()));
    res.json({ success: true, data: [...new Set(studentIds)] });
  } catch (err) {
    next(err);
  }
};

export const saveMapping = async (req, res, next) => {
  try {
    const { classId, academicYear, classTeacher, subjectTeachers, students } =
      req.body;

    const oldMapping = await ClassMapping.findOne({
      classId,
      academicYear,
    }).select("classTeacher students");

    const oldTeacherId = oldMapping?.classTeacher?.toString();
    const newTeacherId = classTeacher || null;

    if (oldTeacherId && oldTeacherId !== newTeacherId?.toString()) {
      await Staff.findByIdAndUpdate(oldTeacherId, {
        $pull: { classesAssigned: classId },
      });
    }

    if (newTeacherId && newTeacherId.toString() !== oldTeacherId) {
      await Staff.findByIdAndUpdate(newTeacherId, {
        $addToSet: { classesAssigned: classId },
      });
    }

    const mapping = await ClassMapping.findOneAndUpdate(
      { classId, academicYear },
      {
        classTeacher: newTeacherId,
        subjectTeachers: subjectTeachers || {},
        students: students || [],
      },
      { upsert: true, new: true },
    );

    await Class.findByIdAndUpdate(classId, {
      staffId: newTeacherId,
    });

    const oldStudents = oldMapping?.students?.map((id) => id.toString()) || [];
    const newStudents = students || [];

    const removedStudents = oldStudents.filter(
      (id) => !newStudents.includes(id),
    );

    const addedStudents = newStudents.filter((id) => !oldStudents.includes(id));

    if (addedStudents.length > 0) {
      await Student.updateMany(
        { _id: { $in: addedStudents } },
        { $set: { classId } },
      );
    }

    if (removedStudents.length > 0) {
      await Student.updateMany(
        { _id: { $in: removedStudents } },
        { $unset: { classId: 1 } },
      );
    }

    res.json({
      success: true,
      message: "Class mapping saved successfully",
      data: mapping,
    });
  } catch (err) {
    next(err);
  }
};
