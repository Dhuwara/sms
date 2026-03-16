import Scholarship from '../models/Scholarship.js';
import Student from '../models/Student.js';

const populate = (q) => q
  .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } })
  .populate('classId', 'name section');

// GET /api/scholarships?academicYear=&status=&studentId=
export const getScholarships = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.studentId) filter.studentId = req.query.studentId;

    const scholarships = await populate(
      Scholarship.find(filter).sort({ createdAt: -1 })
    );
    res.json({ success: true, data: scholarships });
  } catch (err) {
    next(err);
  }
};

// GET /api/scholarships/my — student views their own scholarships
export const getMyScholarships = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const scholarships = await populate(
      Scholarship.find({ studentId: student._id }).sort({ createdAt: -1 })
    );
    res.json({ success: true, data: scholarships });
  } catch (err) {
    next(err);
  }
};

// GET /api/scholarships/child/:studentId — parent views child's scholarships
export const getChildScholarships = async (req, res, next) => {
  try {
    const scholarships = await populate(
      Scholarship.find({ studentId: req.params.studentId }).sort({ createdAt: -1 })
    );
    res.json({ success: true, data: scholarships });
  } catch (err) {
    next(err);
  }
};

// POST /api/scholarships
export const createScholarship = async (req, res, next) => {
  try {
    const { name, description, amount, type, criteria, academicYear, studentId, classId, remarks } = req.body;
    if (!name || !amount || !academicYear || !studentId) {
      return res.status(400).json({ success: false, message: 'name, amount, academicYear, and studentId are required' });
    }
    const scholarship = await Scholarship.create({
      name, description, amount, type, criteria, academicYear,
      studentId, classId, remarks, createdBy: req.user.userId,
    });
    const populated = await populate(Scholarship.findById(scholarship._id));
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// PUT /api/scholarships/:id
export const updateScholarship = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.status === 'approved' && !updates.approvedOn) {
      updates.approvedOn = new Date();
      updates.approvedBy = req.user.userId;
    }
    if (updates.status === 'disbursed' && !updates.disbursedOn) {
      updates.disbursedOn = new Date();
    }
    const scholarship = await populate(
      Scholarship.findByIdAndUpdate(req.params.id, updates, { new: true })
    );
    if (!scholarship) return res.status(404).json({ success: false, message: 'Scholarship not found' });
    res.json({ success: true, data: scholarship });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/scholarships/:id
export const deleteScholarship = async (req, res, next) => {
  try {
    const s = await Scholarship.findByIdAndDelete(req.params.id);
    if (!s) return res.status(404).json({ success: false, message: 'Scholarship not found' });
    res.json({ success: true, message: 'Scholarship deleted' });
  } catch (err) {
    next(err);
  }
};
