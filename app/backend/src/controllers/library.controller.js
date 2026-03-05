import Book from '../models/Book.js';
import BookIssue from '../models/BookIssue.js';

const FINE_PER_DAY = 10;

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

export const getIssues = async (req, res, next) => {
  try {
    const { status, studentId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (studentId) filter.studentId = studentId;

    // Auto-update overdue records
    await BookIssue.updateMany(
      { status: 'active', dueDate: { $lt: new Date() } },
      { status: 'overdue' }
    );

    const issues = await BookIssue.find(filter)
      .populate('bookId', 'title author')
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name' } })
      .sort({ issuedAt: -1 });

    res.json({ success: true, data: issues });
  } catch (err) {
    next(err);
  }
};

export const issueBook = async (req, res, next) => {
  try {
    const { bookId, studentId, dueDate } = req.body;
    const book = await Book.findById(bookId);
    if (!book || book.availableCopies < 1) {
      return res.status(400).json({ success: false, message: 'Book not available' });
    }
    const issue = await BookIssue.create({ bookId, studentId, dueDate: new Date(dueDate) });
    await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: -1 } });
    res.status(201).json({ success: true, data: issue });
  } catch (err) {
    next(err);
  }
};

export const returnBook = async (req, res, next) => {
  try {
    const issue = await BookIssue.findById(req.params.id);
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
    await Book.findByIdAndUpdate(issue.bookId, { $inc: { availableCopies: 1 } });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};
