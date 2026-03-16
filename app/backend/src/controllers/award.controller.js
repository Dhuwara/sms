import Award from '../models/Award.js';
import Student from '../models/Student.js';

const populate = (q) => q
  .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } })
  .populate('classId', 'name section');

// GET /api/awards?academicYear=&category=&studentId=
export const getAwards = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.studentId) filter.studentId = req.query.studentId;

    const awards = await populate(Award.find(filter).sort({ awardDate: -1 }));
    res.json({ success: true, data: awards });
  } catch (err) {
    next(err);
  }
};

// GET /api/awards/my — student views their own awards
export const getMyAwards = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const awards = await populate(Award.find({ studentId: student._id }).sort({ awardDate: -1 }));
    res.json({ success: true, data: awards });
  } catch (err) {
    next(err);
  }
};

// GET /api/awards/child/:studentId — parent views child's awards
export const getChildAwards = async (req, res, next) => {
  try {
    const awards = await populate(
      Award.find({ studentId: req.params.studentId }).sort({ awardDate: -1 })
    );
    res.json({ success: true, data: awards });
  } catch (err) {
    next(err);
  }
};

// POST /api/awards
export const createAward = async (req, res, next) => {
  try {
    const { title, description, category, awardDate, academicYear, studentId, classId, position, eventName, remarks } = req.body;
    if (!title || !awardDate || !academicYear || !studentId) {
      return res.status(400).json({ success: false, message: 'title, awardDate, academicYear, and studentId are required' });
    }
    const award = await Award.create({
      title, description, category, awardDate, academicYear,
      studentId, classId, position, eventName, remarks,
      createdBy: req.user.userId,
    });
    const populated = await populate(Award.findById(award._id));
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// PUT /api/awards/:id
export const updateAward = async (req, res, next) => {
  try {
    const award = await populate(
      Award.findByIdAndUpdate(req.params.id, req.body, { new: true })
    );
    if (!award) return res.status(404).json({ success: false, message: 'Award not found' });
    res.json({ success: true, data: award });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/awards/:id
export const deleteAward = async (req, res, next) => {
  try {
    const a = await Award.findByIdAndDelete(req.params.id);
    if (!a) return res.status(404).json({ success: false, message: 'Award not found' });
    res.json({ success: true, message: 'Award deleted' });
  } catch (err) {
    next(err);
  }
};
