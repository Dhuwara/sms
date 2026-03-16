import React from 'react';

const Fees = ({ selectedChild, childFees, childSelector, formatDate }) => {
  const { fees, summary } = childFees;
  const totalDue = summary?.totalDue || 0;
  const totalPaid = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + (f.amount || 0), 0);
  const totalFees = totalPaid + totalDue;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Fees & Payments</h2>
      {childSelector()}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981]">
          <p className="text-sm text-[#64748B]">Total Fees</p>
          <p className="text-2xl font-bold text-[#065F46]">₹{totalFees.toLocaleString()}</p>
          <p className="text-xs text-[#10B981]">Academic Year</p>
        </div>
        <div className="p-6 bg-[#DBEAFE] rounded-xl border-2 border-[#3B82F6]">
          <p className="text-sm text-[#64748B]">Paid Amount</p>
          <p className="text-2xl font-bold text-[#1E40AF]">₹{totalPaid.toLocaleString()}</p>
          <p className="text-xs text-[#3B82F6]">{totalFees > 0 ? ((totalPaid / totalFees) * 100).toFixed(1) : 0}% Complete</p>
        </div>
        <div className="p-6 bg-[#FEE2E2] rounded-xl border-2 border-[#DC2626]">
          <p className="text-sm text-[#64748B]">Pending Amount</p>
          <p className="text-2xl font-bold text-[#991B1B]">₹{totalDue.toLocaleString()}</p>
          <p className="text-xs text-[#DC2626]">Due</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Fee Structure</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-linear-to-r from-[#FEF3C7] to-[#FEE2E2]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Fee Type</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Amount</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Due Date</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.length > 0 ? fees.map((fee, idx) => (
                <tr key={idx} className="border-b border-[#E2E8F0]">
                  <td className="px-4 py-3 text-sm">{fee.feeType || fee.type || 'Fee'}</td>
                  <td className="px-4 py-3 text-sm font-semibold">₹{(fee.amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">{fee.dueDate ? formatDate(fee.dueDate) : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${fee.status === 'paid' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEE2E2] text-[#991B1B]'
                      }`}>{fee.status === 'paid' ? 'Paid' : 'Pending'}</span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-[#64748B]">No fee records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Fees;
