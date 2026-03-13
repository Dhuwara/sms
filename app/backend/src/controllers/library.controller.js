import Book from '../models/Book.js';
import BookIssue from '../models/BookIssue.js';
import Student from '../models/Student.js';
import Staff from '../models/Staff.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const FINE_PER_DAY = 10;

// ── Notification helper ────────────────────────────────────────────────────────
const notify = async (userId, title, message, type = 'info') => {
  try {
    await Notification.create({ userId, title, message, type });
  } catch { /* notification failure must never break main flow */ }
};

const notifyAdmins = async (title, message, type = 'info') => {
  try {
    const admins = await User.find({ role: 'admin' }).select('_id');
    if (admins.length > 0) {
      await Notification.insertMany(admins.map(a => ({ userId: a._id, title, message, type })));
    }
  } catch { /* non-critical */ }
};

// ── Books ─────────────────────────────────────────────────────────────────────

export const getBooks = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } },
    ];
    const books = await Book.find(filter).sort({ title: 1 });
    res.json({ success: true, data: books });
  } catch (err) {
    next(err);
  }
};

export const createBook = async (req, res, next) => {
  try {
    const { title, author, copies, category, isbn } = req.body;
    if (!title || !author) return res.status(400).json({ success: false, message: 'Title and author are required' });
    const book = await Book.create({ title, author, isbn, category, totalCopies: copies || 1, availableCopies: copies || 1 });
    res.status(201).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

export const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

export const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, message: 'Book deleted' });
  } catch (err) {
    next(err);
  }
};

// ── Issues ────────────────────────────────────────────────────────────────────

const recalcOverdueFines = async () => {
  const overdueIssues = await BookIssue.find({ status: 'active', dueDate: { $lt: new Date() } });
  for (const issue of overdueIssues) {
    const days = Math.ceil((Date.now() - new Date(issue.dueDate)) / (1000 * 60 * 60 * 24));
    await BookIssue.findByIdAndUpdate(issue._id, { status: 'overdue', fine: days * FINE_PER_DAY });
  }
  const stillOverdue = await BookIssue.find({ status: 'overdue', fineStatus: 'unpaid' });
  for (const issue of stillOverdue) {
    const days = Math.ceil((Date.now() - new Date(issue.dueDate)) / (1000 * 60 * 60 * 24));
    if (days > 0) await BookIssue.findByIdAndUpdate(issue._id, { fine: days * FINE_PER_DAY });
  }
};

export const getIssues = async (req, res, next) => {
  try {
    const { status, studentId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (studentId) filter.studentId = studentId;

    await recalcOverdueFines();

    const issues = await BookIssue.find(filter)
      .populate('bookId', 'title author category')
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name' } })
      .populate({ path: 'staffId', populate: { path: 'userId', select: 'name' } })
      .sort({ issuedAt: -1 });

    res.json({ success: true, data: issues });
  } catch (err) {
    next(err);
  }
};

export const issueBook = async (req, res, next) => {
  try {
    const { bookId, studentId, staffId, issuedToType, dueDate } = req.body;
    if (!bookId || !dueDate) return res.status(400).json({ success: false, message: 'bookId and dueDate are required' });
    if (issuedToType === 'staff' && !staffId) return res.status(400).json({ success: false, message: 'staffId is required for staff' });
    if (issuedToType !== 'staff' && !studentId) return res.status(400).json({ success: false, message: 'studentId is required for student' });

    const book = await Book.findById(bookId);
    if (!book || book.availableCopies < 1) {
      return res.status(400).json({ success: false, message: 'Book not available' });
    }

    const issueData = {
      bookId,
      issuedToType: issuedToType || 'student',
      dueDate: new Date(dueDate),
    };

    let recipientUserId = null;
    if (issuedToType === 'staff') {
      issueData.staffId = staffId;
      const staffDoc = await Staff.findById(staffId).select('userId');
      recipientUserId = staffDoc?.userId;
    } else {
      issueData.studentId = studentId;
      const studentDoc = await Student.findById(studentId).select('userId');
      recipientUserId = studentDoc?.userId;
    }

    const issue = await BookIssue.create(issueData);
    await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: -1 } });

    const dueDateStr = new Date(dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    if (recipientUserId) {
      await notify(
        recipientUserId,
        `Book Issued: ${book.title}`,
        `"${book.title}" has been issued to you. Please return by ${dueDateStr}.`,
        'info'
      );
    }

    res.status(201).json({ success: true, data: issue });
  } catch (err) {
    next(err);
  }
};

export const returnBook = async (req, res, next) => {
  try {
    const issue = await BookIssue.findById(req.params.id)
      .populate('bookId', 'title')
      .populate({ path: 'studentId', select: 'userId' })
      .populate({ path: 'staffId', select: 'userId' });

    if (!issue || issue.status === 'returned') {
      return res.status(400).json({ success: false, message: 'Issue record not found or already returned' });
    }
    const returnedAt = new Date();
    let fine = 0;
    if (returnedAt > issue.dueDate) {
      const days = Math.ceil((returnedAt - issue.dueDate) / (1000 * 60 * 60 * 24));
      fine = days * FINE_PER_DAY;
    }
    const updated = await BookIssue.findByIdAndUpdate(
      req.params.id,
      { status: 'returned', returnedAt, fine },
      { new: true }
    );
    await Book.findByIdAndUpdate(issue.bookId?._id || issue.bookId, { $inc: { availableCopies: 1 } });

    const recipientUserId = issue.issuedToType === 'staff'
      ? issue.staffId?.userId
      : issue.studentId?.userId;

    const bookTitle = issue.bookId?.title || 'Book';
    if (recipientUserId) {
      const msg = fine > 0
        ? `"${bookTitle}" returned. A fine of ₹${fine} has been applied.`
        : `"${bookTitle}" returned successfully. Thank you!`;
      await notify(recipientUserId, `Book Returned: ${bookTitle}`, msg, fine > 0 ? 'warning' : 'success');
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const markFinePaid = async (req, res, next) => {
  try {
    const issue = await BookIssue.findById(req.params.id)
      .populate('bookId', 'title')
      .populate({ path: 'studentId', select: 'userId' })
      .populate({ path: 'staffId', select: 'userId' });

    if (!issue) return res.status(404).json({ success: false, message: 'Issue record not found' });
    const updated = await BookIssue.findByIdAndUpdate(req.params.id, { fineStatus: 'paid' }, { new: true });

    const recipientUserId = issue.issuedToType === 'staff'
      ? issue.staffId?.userId
      : issue.studentId?.userId;

    if (recipientUserId) {
      await notify(
        recipientUserId,
        'Library Fine Cleared',
        `Your fine of ₹${issue.fine} for "${issue.bookId?.title || 'Book'}" has been marked as paid.`,
        'success'
      );
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const getMyIssues = async (req, res, next) => {
  try {
    const userId = req.user.userId;   // JWT stores { userId, role }
    const role = req.user.role;
    let filter = {};

    if (role === 'student') {
      const student = await Student.findOne({ userId });
      if (!student) return res.json({ success: true, data: [] });
      filter.studentId = student._id;
      filter.issuedToType = 'student';
    } else if (role === 'staff') {
      const staff = await Staff.findOne({ userId });
      if (!staff) return res.json({ success: true, data: [] });
      filter.staffId = staff._id;
      filter.issuedToType = 'staff';
    } else {
      return res.json({ success: true, data: [] });
    }

    // Recalculate fines for this user's records
    const overdueOwn = await BookIssue.find({ ...filter, status: 'active', dueDate: { $lt: new Date() } });
    for (const issue of overdueOwn) {
      const days = Math.ceil((Date.now() - new Date(issue.dueDate)) / (1000 * 60 * 60 * 24));
      await BookIssue.findByIdAndUpdate(issue._id, { status: 'overdue', fine: days * FINE_PER_DAY });
    }
    const stillOverdueOwn = await BookIssue.find({ ...filter, status: 'overdue', fineStatus: 'unpaid' });
    for (const issue of stillOverdueOwn) {
      const days = Math.ceil((Date.now() - new Date(issue.dueDate)) / (1000 * 60 * 60 * 24));
      if (days > 0) await BookIssue.findByIdAndUpdate(issue._id, { fine: days * FINE_PER_DAY });
    }

    const issues = await BookIssue.find(filter)
      .populate('bookId', 'title author category')
      .sort({ issuedAt: -1 });

    res.json({ success: true, data: issues });
  } catch (err) {
    next(err);
  }
};

export const getLibraryReport = async (req, res, next) => {
  try {
    const issues = await BookIssue.find()
      .populate('bookId', 'title author category')
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name' } })
      .populate({ path: 'staffId', populate: { path: 'userId', select: 'name' } })
      .sort({ issuedAt: -1 });

    const reportData = issues.map(issue => {
      const issuedToName = issue.issuedToType === 'staff'
        ? (issue.staffId?.userId?.name || 'Staff')
        : (issue.studentId?.userId?.name || 'Student');

      return {
        bookTitle: issue.bookId?.title || '',
        category: issue.bookId?.category || '',
        issuedTo: issuedToName,
        type: issue.issuedToType === 'staff' ? 'Staff' : 'Student',
        issuedDate: issue.issuedAt ? new Date(issue.issuedAt).toLocaleDateString('en-IN') : '',
        dueDate: issue.dueDate ? new Date(issue.dueDate).toLocaleDateString('en-IN') : '',
        returnedDate: issue.returnedAt ? new Date(issue.returnedAt).toLocaleDateString('en-IN') : '',
        status: issue.status,
        fine: issue.fine || 0,
        fineStatus: issue.fineStatus,
      };
    });

    res.json({ success: true, data: reportData });
  } catch (err) {
    next(err);
  }
};
