import ClassConfig from '../models/ClassConfig.js';

export const getClassConfig = async (req, res, next) => {
  try {
    const config = await ClassConfig.findOne();
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
      {},
      { prefix: prefix ?? '', standardFormat: standardFormat || 'number', sectionFormat: sectionFormat || 'ABC' },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
};
