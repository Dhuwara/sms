import Attendance from '../models/Attendance.js';
import ClassMapping from '../models/ClassMapping.js';
import Student from '../models/Student.js';

export const getAttendance = async (req, res, next) => {
  try {
    const { classId, date } = req.query;
    const filter = {};

    if (classId) filter.classId = classId;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(filter)
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name' } })
      .populate('classId', 'name section')
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    res.json({ success: true, data: attendance });
  } catch (err) {
    next(err);
  }
};

export const markAttendance = async (req, res, next) => {
  try {
    const { classId, date, records } = req.body;
    // records: [{ studentId, status }]

    if (!classId || !date || !records || records.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid data' });
    }

    const attendanceRecords = await Promise.all(
      records.map((record) =>
        Attendance.findOneAndUpdate(
          { studentId: record.studentId, date: new Date(date) },
          {
            studentId: record.studentId,
            classId,
            date: new Date(date),
            status: record.status,
            markedBy: req.user.userId,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
      )
    );

    res.status(201).json({ success: true, data: attendanceRecords });
  } catch (err) {
    next(err);
  }
};

export const updateAttendance = async (req, res, next) => {
  try {
    const { status } = req.body;
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    res.json({ success: true, data: attendance });
  } catch (err) {
    next(err);
  }
};

export const getClassStudents = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;

    // Get students in the class
    const mapping = await ClassMapping.findOne({ classId }).select('students');
    const studentIds = mapping?.students || [];

    const students = await Student.find({ _id: { $in: studentIds } })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    // Get attendance for these students on the given date
    let attendance = [];
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      attendance = await Attendance.find({
        studentId: { $in: studentIds },
        date: { $gte: startDate, $lte: endDate },
      });
    }

    // Combine students with their attendance status
    const result = students.map((student) => {
      const attendanceRecord = attendance.find((a) => a.studentId.toString() === student._id.toString());
      return {
        _id: student._id,
        name: student.userId?.name,
        rollNumber: student.rollNumber,
        status: attendanceRecord?.status || null,
      };
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getAttendanceReport = async (req, res, next) => {
  try {
    const { classId, startDate, endDate } = req.query;

    if (!classId || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const records = await Attendance.find({
      classId,
      date: { $gte: start, $lte: end },
    })
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name' } })
      .sort({ date: 1, studentId: 1 });

    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
};
