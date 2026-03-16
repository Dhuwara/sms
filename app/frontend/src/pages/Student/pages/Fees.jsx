import React from 'react';
import { Receipt, Download } from 'lucide-react';

const Fees = ({ feesData, getAcademicYear, formatDate }) => {
  const { fees, summary } = feesData;
  const totalFees = summary.totalDue + summary.totalPaid;
  const paidPercentage = totalFees > 0 ? ((summary.totalPaid / totalFees) * 100).toFixed(1) : '0.0';
  const pendingFees = fees.filter(f => f.status !== 'paid');
  const paidFees = fees.filter(f => f.status === 'paid');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Fees & Payments</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981]">
          <p className="text-sm text-[#64748B]">Total Fees</p>
          <p className="text-2xl font-bold text-[#065F46]">{totalFees > 0 ? `₹${totalFees.toLocaleString()}` : '₹0'}</p>
          <p className="text-xs text-[#10B981]">Annual {getAcademicYear()}</p>
        </div>
        <div className="p-6 bg-[#DBEAFE] rounded-xl border-2 border-[#3B82F6]">
          <p className="text-sm text-[#64748B]">Paid</p>
          <p className="text-2xl font-bold text-[#1E40AF]">{summary.totalPaid > 0 ? `₹${summary.totalPaid.toLocaleString()}` : '₹0'}</p>
          <p className="text-xs text-[#3B82F6]">{paidPercentage}% Complete</p>
        </div>
        <div className="p-6 bg-[#FEE2E2] rounded-xl border-2 border-[#DC2626]">
          <p className="text-sm text-[#64748B]">Pending</p>
          <p className="text-2xl font-bold text-[#991B1B]">{summary.totalDue > 0 ? `₹${summary.totalDue.toLocaleString()}` : '₹0'}</p>
          <p className="text-xs text-[#DC2626]">{pendingFees.length > 0 ? `Due: ${formatDate(pendingFees[0].dueDate)}` : 'All Clear'}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Fee Records - Academic Year {getAcademicYear()}</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-linear-to-r from-[#FEF3C7] to-[#FEE2E2]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Description</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Amount</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Due Date</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee, idx) => (
                <tr key={idx} className="border-b border-[#E2E8F0]">
                  <td className="px-4 py-3 text-sm">{fee.description || '—'}</td>
                  <td className="px-4 py-3 text-sm font-semibold">₹{fee.amount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(fee.dueDate)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${fee.status === 'paid' ? 'bg-[#D1FAE5] text-[#065F46]' :
                      fee.status === 'overdue' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                        'bg-[#FEF3C7] text-[#92400E]'
                      }`}>{fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}</span>
                  </td>
                </tr>
              ))}
              {fees.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-[#64748B]">No fee records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {paidFees.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Receipt className="text-[#10B981]" size={20} />
            Payment History
          </h3>
          <div className="space-y-3">
            {paidFees.map((receipt, idx) => (
              <div key={idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold">{receipt.description || 'Payment'}</p>
                  <p className="text-sm text-[#64748B]">Paid on {formatDate(receipt.paidAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#10B981]">₹{receipt.amount?.toLocaleString()}</span>
                  <button className="text-[#4F46E5]"><Download size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;
