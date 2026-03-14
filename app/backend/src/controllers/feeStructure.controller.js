import FeeStructure from '../models/FeeStructure.js';
import Class from '../models/Class.js';

// Roman numeral → Arabic for grades 1–12
const ROMAN = { I:1, II:2, III:3, IV:4, V:5, VI:6, VII:7, VIII:8, IX:9, X:10, XI:11, XII:12 };

const parseGradePart = (part) => {
  const up = part.toUpperCase();
  if (ROMAN[up] !== undefined) return String(ROMAN[up]);
  if (/^\d+$/.test(part)) return part;
  return part;
};

// Normalize Class.name → standard key stored in FeeStructure
// handles "Grade 12", "Grade XII", "LKG", "UKG", etc.
const normalizeStandard = (className) => {
  const parts = className.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0].toLowerCase() === 'grade') {
    return parseGradePart(parts[1]);
  }
  return parts[0];
};

// GET /api/fee-structure?year=2025-26  (admin)
export const getAllFeeStructures = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.year) filter.academicYear = req.query.year;
    const structures = await FeeStructure.find(filter)
      .populate('classId', 'name section')
      .sort({ standard: 1 });
    res.json({ success: true, data: structures });
  } catch (err) {
    next(err);
  }
};

// PUT /api/fee-structure  (admin — create/upsert new)
export const upsertFeeStructure = async (req, res, next) => {
  try {
    const { standard, classId, academicYear, totalFees, components } = req.body;
    if (!standard || !academicYear || totalFees == null) {
      return res.status(400).json({ success: false, message: 'standard, academicYear and totalFees are required' });
    }
    if (components && !Array.isArray(components)) {
      return res.status(400).json({ success: false, message: 'components must be an array' });
    }

    const query = { standard, academicYear, classId: classId || null };
    const update = { $set: { standard, academicYear, classId: classId || null, totalFees, components: components || [] } };
    const doc = await FeeStructure.findOneAndUpdate(query, update, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    });
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

// PUT /api/fee-structure/:id  (admin — update existing by _id)
export const updateFeeStructure = async (req, res, next) => {
  try {
    const { totalFees, components } = req.body;
    if (totalFees == null) {
      return res.status(400).json({ success: false, message: 'totalFees is required' });
    }
    const doc = await FeeStructure.findByIdAndUpdate(
      req.params.id,
      { $set: { totalFees, components: components || [] } },
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Fee structure not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/fee-structure/:id  (admin)
export const deleteFeeStructure = async (req, res, next) => {
  try {
    const doc = await FeeStructure.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Fee structure not found' });
    res.json({ success: true, message: 'Fee structure deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/fee-structure/class/:classId  (parent / student / admin)
export const getFeeStructureForClass = async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.classId);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });

    const standard = normalizeStandard(cls.name);

    // For 11 & 12: try class-specific record first, then fall back to standard-wide
    let structure = await FeeStructure.findOne({ standard, classId: req.params.classId });
    if (!structure) {
      structure = await FeeStructure.findOne({ standard, classId: null });
    }
    if (!structure) {
      return res.status(404).json({ success: false, message: 'No fee structure configured for this class' });
    }
    res.json({ success: true, data: structure });
  } catch (err) {
    next(err);
  }
};
