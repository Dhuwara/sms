import mongoose from 'mongoose';

const componentSchema = new mongoose.Schema({
  name:   { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, default: null },
}, { _id: false });

const feeStructureSchema = new mongoose.Schema({
  standard:     { type: String, required: true },  // e.g. 'LKG', 'UKG', '1', '11'
  classId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null }, // only for 11 & 12
  academicYear: { type: String, required: true },  // e.g. '2025-26'
  totalFees:    { type: Number, required: true },
  components:   { type: [componentSchema], default: [] },
}, { timestamps: true });

feeStructureSchema.index({ standard: 1, academicYear: 1, classId: 1 }, { unique: true });

export default mongoose.model('FeeStructure', feeStructureSchema);
