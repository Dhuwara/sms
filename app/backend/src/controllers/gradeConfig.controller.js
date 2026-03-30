import GradeConfig from '../models/GradeConfig.js';

const DEFAULT_GRADES = [
  { label: 'A+', minPercent: 90, maxPercent: 100, points: 10 },
  { label: 'A',  minPercent: 80, maxPercent: 89,  points: 9  },
  { label: 'B+', minPercent: 70, maxPercent: 79,  points: 8  },
  { label: 'B',  minPercent: 60, maxPercent: 69,  points: 7  },
  { label: 'C',  minPercent: 50, maxPercent: 59,  points: 6  },
  { label: 'D',  minPercent: 40, maxPercent: 49,  points: 5  },
  { label: 'E',  minPercent: 35, maxPercent: 39,  points: 4  },
  { label: 'F',  minPercent: 0,  maxPercent: 34,  points: 0  },
];

export const getGradeConfig = async (req, res, next) => {
  try {
    const config = await GradeConfig.findOne({ schoolId: req.user.schoolId });
    res.json({ success: true, data: config ? config.grades : DEFAULT_GRADES });
  } catch (err) {
    next(err);
  }
};

export const saveGradeConfig = async (req, res, next) => {
  try {
    const { grades } = req.body;
    if (!Array.isArray(grades) || grades.length === 0) {
      return res.status(400).json({ success: false, message: 'grades array is required' });
    }
    const config = await GradeConfig.findOneAndUpdate(
      { schoolId: req.user.schoolId },
      { grades, schoolId: req.user.schoolId },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: config.grades });
  } catch (err) {
    next(err);
  }
};

// Helper used by exam controller — returns grade label for a percentage
export const resolveGrade = async (schoolId, percent) => {
  const config = await GradeConfig.findOne({ schoolId }).lean();
  const grades = config?.grades?.length ? config.grades : DEFAULT_GRADES;
  for (const g of grades) {
    if (percent >= g.minPercent && percent <= g.maxPercent) return g.label;
  }
  return 'F';
};
