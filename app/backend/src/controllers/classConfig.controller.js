import ClassConfig from '../models/ClassConfig.js';

export const getClassConfig = async (req, res, next) => {
  try {
    const config = await ClassConfig.findOne({ schoolId: req.user.schoolId });
    if (!config) return res.status(404).json({ success: false, message: 'No class config found' });
    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
};

export const upsertClassConfig = async (req, res, next) => {
  try {
    const { prefix, standardFormat, sectionFormat } = req.body;
    const config = await ClassConfig.findOneAndUpdate(
      { schoolId: req.user.schoolId },
      { prefix: prefix ?? '', standardFormat: standardFormat || 'number', sectionFormat: sectionFormat || 'ABC', schoolId: req.user.schoolId },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
};
