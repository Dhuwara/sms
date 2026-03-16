import React from 'react';
import { Download } from 'lucide-react';

const Payroll = ({
  latestSalary,
  payrollHistory,
  reimbursements,
  showReimbursementModal,
  setShowReimbursementModal,
  reimbursementForm,
  setReimbursementForm,
  handleSubmitReimbursement,
  reimbursementSubmitting,
  handleDownloadSalarySlip,
  formatDate,
}) => {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const sal = latestSalary;
  const e = sal?.earnings || {};
  const d = sal?.deductions || {};
  const allowances = (e.hra || 0) + (e.transportAllowance || 0) + (e.medicalAllowance || 0) + (e.otherAllowances || 0);
  const slipTitle = sal ? `Salary Slip - ${monthNames[sal.month - 1]} ${sal.year}` : 'Salary Slip';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Payroll & Finance</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981]">
          <p className="text-sm text-[#64748B]">Basic Salary</p>
          <p className="text-2xl font-bold text-[#0F172A]">{"\u20B9"}{(e.basicSalary || 0).toLocaleString()}</p>
        </div>
        <div className="p-6 bg-[#FEF3C7] rounded-xl border-2 border-[#F59E0B]">
          <p className="text-sm text-[#64748B]">Allowances</p>
          <p className="text-2xl font-bold text-[#0F172A]">{"\u20B9"}{allowances.toLocaleString()}</p>
        </div>
        <div className="p-6 bg-[#FEE2E2] rounded-xl border-2 border-[#DC2626]">
          <p className="text-sm text-[#64748B]">Deductions</p>
          <p className="text-2xl font-bold text-[#0F172A]">{"\u20B9"}{(sal?.totalDeductions || 0).toLocaleString()}</p>
        </div>
        <div className="p-6 bg-[#DBEAFE] rounded-xl border-2 border-[#3B82F6]">
          <p className="text-sm text-[#64748B]">Net Salary</p>
          <p className="text-2xl font-bold text-[#0F172A]">{"\u20B9"}{(sal?.netSalary || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">{slipTitle}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3 text-[#10B981]">Earnings</h4>
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-[#F8FAFC] rounded">
                <span>Basic Salary</span>
                <span className="font-semibold">{"\u20B9"}{(e.basicSalary || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2 bg-[#F8FAFC] rounded">
                <span>House Rent Allowance</span>
                <span className="font-semibold">{"\u20B9"}{(e.hra || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2 bg-[#F8FAFC] rounded">
                <span>Transport Allowance</span>
                <span className="font-semibold">{"\u20B9"}{(e.transportAllowance || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2 bg-[#F8FAFC] rounded">
                <span>Medical Allowance</span>
                <span className="font-semibold">{"\u20B9"}{(e.medicalAllowance || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2 bg-[#D1FAE5] rounded font-bold">
                <span>Total Earnings</span>
                <span>{"\u20B9"}{(sal?.grossSalary || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-[#DC2626]">Deductions</h4>
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-[#F8FAFC] rounded">
                <span>Provident Fund</span>
                <span className="font-semibold">{"\u20B9"}{(d.providentFund || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2 bg-[#F8FAFC] rounded">
                <span>Professional Tax</span>
                <span className="font-semibold">{"\u20B9"}{(d.professionalTax || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2 bg-[#F8FAFC] rounded">
                <span>TDS</span>
                <span className="font-semibold">{"\u20B9"}{(d.tds || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2 bg-[#FEE2E2] rounded font-bold">
                <span>Total Deductions</span>
                <span>{"\u20B9"}{(sal?.totalDeductions || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 p-4 bg-[#4F46E5] text-white rounded-lg flex justify-between items-center">
          <div>
            <p className="text-sm opacity-80">Net Payable Amount</p>
            <p className="text-3xl font-bold">{"\u20B9"}{(sal?.netSalary || 0).toLocaleString()}</p>
          </div>
          <button onClick={() => handleDownloadSalarySlip(sal)} className="bg-white text-[#4F46E5] px-6 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-slate-50 transition-colors">
            <Download size={18} /> Download Slip
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Payment History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Month</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Gross Salary</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Deductions</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Net Salary</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Status</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Slip</th>
              </tr>
            </thead>
            <tbody>
              {payrollHistory.length > 0 ? payrollHistory.map((payment, idx) => (
                <tr key={payment._id || idx} className="border-b border-[#E2E8F0]">
                  <td className="px-4 py-3 text-sm font-semibold">{monthNames[payment.month - 1]} {payment.year}</td>
                  <td className="px-4 py-3 text-sm">{"\u20B9"}{(payment.grossSalary || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-[#DC2626]">{"\u20B9"}{(payment.totalDeductions || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-bold text-[#10B981]">{"\u20B9"}{(payment.netSalary || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${payment.status === 'paid' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEF3C7] text-[#92400E]'}`}>{payment.status === 'paid' ? 'Paid' : 'Pending'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDownloadSalarySlip(payment)} className="text-[#4F46E5] hover:bg-indigo-50 p-2 rounded-full transition-colors">
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-[#64748B]">No payment history found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Reimbursement Claims</h3>
        <div className="space-y-3 mb-4">
          {reimbursements.length > 0 ? reimbursements.map((claim, idx) => (
            <div key={claim._id || idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold">{claim.title}</p>
                <p className="text-sm text-[#64748B]">{formatDate(claim.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{"\u20B9"}{(claim.amount || 0).toLocaleString()}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${claim.status === 'approved' ? 'bg-[#D1FAE5] text-[#065F46]' : claim.status === 'rejected' ? 'bg-[#FEE2E2] text-[#991B1B]' : 'bg-[#FEF3C7] text-[#92400E]'
                  }`}>{claim.status}</span>
              </div>
            </div>
          )) : (
            <p className="text-center text-[#64748B] py-4">No reimbursement claims found.</p>
          )}
        </div>
        <button onClick={() => setShowReimbursementModal(true)} className="bg-[#4F46E5] text-white px-6 py-2 rounded-lg font-semibold">Submit New Claim</button>
      </div>

      {showReimbursementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-4">Submit Reimbursement</h2>
            <form onSubmit={handleSubmitReimbursement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Title</label>
                <input type="text" required value={reimbursementForm.title} onChange={(ev) => setReimbursementForm({ ...reimbursementForm, title: ev.target.value })} placeholder="e.g., Travel Reimbursement" className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Amount ({"\u20B9"})</label>
                <input type="number" required min="1" value={reimbursementForm.amount} onChange={(ev) => setReimbursementForm({ ...reimbursementForm, amount: ev.target.value })} className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Description</label>
                <textarea value={reimbursementForm.description} onChange={(ev) => setReimbursementForm({ ...reimbursementForm, description: ev.target.value })} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowReimbursementModal(false)} className="flex-1 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 h-10 px-4 py-2 rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={reimbursementSubmitting} className="flex-1 bg-[#4F46E5] text-white hover:bg-[#4338CA] h-10 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">{reimbursementSubmitting ? 'Submitting...' : 'Submit Claim'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
