import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String },
  category: { type: String, default: 'General' },
  totalCopies: { type: Number, default: 1 },
  availableCopies: { type: Number, default: 1 },
}, { timestamps: true });

export default mongoose.model('Book', bookSchema);
