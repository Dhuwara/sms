import PeriodConfig from '../models/PeriodConfig.js';
import Timetable from '../models/Timetable.js';

export const getPeriodConfig = async (req, res, next) => {
  try {
    const { classId, academicYear } = req.params;
    const config = await PeriodConfig.findOne({ classId, academicYear, schoolId: req.user.schoolId });
    res.json({ success: true, data: config || { classId, academicYear, periods: [] } });
  } catch (err) {
    next(err);
  }
};

export const savePeriodConfig = async (req, res, next) => {
  try {
    const { classId, academicYear, periods } = req.body;
    const cleanedPeriods = (periods || []).map((p) => {
      if (p.type !== 'class' && p.type !== 'lab' && p.type !== 'sports') {
        return { ...p, subject: '', teacher: null };
      }
      return p;
    });
    const config = await PeriodConfig.findOneAndUpdate(
      { classId, academicYear, schoolId: req.user.schoolId },
      { periods: cleanedPeriods, schoolId: req.user.schoolId },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
};

export const getTimetable = async (req, res, next) => {
  try {
    const { classId, academicYear } = req.params;
    const tt = await Timetable.findOne({ classId, academicYear, schoolId: req.user.schoolId });
    res.json({ success: true, data: tt || { classId, academicYear, schedule: {} } });
  } catch (err) {
    next(err);
  }
};

export const saveTimetable = async (req, res, next) => {
  try {
    const { classId, academicYear, schedule } = req.body;
    const tt = await Timetable.findOneAndUpdate(
      { classId, academicYear, schoolId: req.user.schoolId },
      { schedule: schedule || {}, schoolId: req.user.schoolId },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: tt });
  } catch (err) {
    next(err);
  }
};
