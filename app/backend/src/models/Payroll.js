import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  earnings: {
    basicSalary: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    transportAllowance: { type: Number, default: 0 },
    medicalAllowance: { type: Number, default: 0 },
    otherAllowances: { type: Number, default: 0 },
  },
  deductions: {
    providentFund: { type: Number, default: 0 },
    professionalTax: { type: Number, default: 0 },
    tds: { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 },
  },
  grossSalary: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },
  netSalary: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  paidOn: { type: Date },
}, { timestamps: true });

payrollSchema.index({ staffId: 1, month: 1, year: 1 }, { unique: true });

payrollSchema.pre('save', function (next) {
  const e = this.earnings;
  this.grossSalary = (e.basicSalary || 0) + (e.hra || 0) + (e.transportAllowance || 0) + (e.medicalAllowance || 0) + (e.otherAllowances || 0);
  const d = this.deductions;
  this.totalDeductions = (d.providentFund || 0) + (d.professionalTax || 0) + (d.tds || 0) + (d.otherDeductions || 0);
  this.netSalary = this.grossSalary - this.totalDeductions;
  next();
});

export default mongoose.model('Payroll', payrollSchema);
