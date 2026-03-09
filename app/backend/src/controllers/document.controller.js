import path from 'path';
import fs from 'fs';
import Document from '../models/Document.js';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'documents');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// GET /api/documents — list documents (filtered by visibility for non-admin)
export const getDocuments = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (req.user.role !== 'admin') {
      filter.visibility = { $in: ['all', req.user.role] };
    }
    const documents = await Document.find(filter)
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: documents });
  } catch (err) { next(err); }
};

// POST /api/documents — upload a document (admin only)
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const { title, category, description, visibility } = req.body;
    const doc = await Document.create({
      title: title || req.file.originalname,
      category: category || 'general',
      description,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user.userId,
      visibility: visibility || 'all',
    });
    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// GET /api/documents/:id/download — download a document
export const downloadDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    const filePath = path.join(UPLOAD_DIR, doc.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }
    res.download(filePath, doc.originalName);
  } catch (err) { next(err); }
};

// DELETE /api/documents/:id — delete a document (admin only)
export const deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    const filePath = path.join(UPLOAD_DIR, doc.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await Document.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) { next(err); }
};
