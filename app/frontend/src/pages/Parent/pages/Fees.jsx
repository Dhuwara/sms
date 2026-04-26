import React, { useState, useEffect, useCallback } from 'react';
// import { toast } from 'sonner'; // Uncomment when Razorpay is re-enabled
import api from '@/utils/api';

// ── Razorpay Integration (commented out for future use) ──────────────────────
// const loadRazorpayScript = () => {
//   return new Promise((resolve) => {
//     if (document.getElementById('razorpay-script')) {
//       resolve(true);
//       return;
//     }
//     const script = document.createElement('script');
//     script.id = 'razorpay-script';
//     script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//     script.onload = () => resolve(true);
//     script.onerror = () => resolve(false);
//     document.body.appendChild(script);
//   });
// };
// ─────────────────────────────────────────────────────────────────────────────

const Fees = ({ selectedChild, childFees, childSelector, formatDate }) => {
  const [feeDetails, setFeeDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchFeeDetails = useCallback(async () => {
    if (!selectedChild?._id) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/payments/fee-details/${selectedChild._id}`);
      setFeeDetails(res.data);
    } catch (err) {
      console.error('Failed to fetch fee details:', err.response?.data || err.message);
      setFeeDetails(null);
    } finally {
      setLoading(false);
    }
  }, [selectedChild?._id]);

  useEffect(() => {
    fetchFeeDetails();
  }, [fetchFeeDetails]);

  // ── Razorpay Payment Handler (commented out for future use) ────────────────
  // const handlePayNow = async (componentName, amount) => {
  //   if (!feeDetails?.feeStructure?._id) return;
  //   setPayingComponent(componentName);
  //   try {
  //     const loaded = await loadRazorpayScript();
  //     if (!loaded) {
  //       toast.error('Failed to load payment gateway. Please check your internet connection.');
  //       setPayingComponent(null);
  //       return;
  //     }
  //     const orderRes = await api.post('/api/payments/create-order', {
  //       studentId: selectedChild._id,
  //       feeStructureId: feeDetails.feeStructure._id,
  //       componentName,
  //     });
  //     const orderData = orderRes.data;
  //     const options = {
  //       key: orderData.keyId,
  //       amount: orderData.amount,
  //       currency: orderData.currency,
  //       name: 'School Management System',
  //       description: `${componentName} — ${orderData.studentName}`,
  //       order_id: orderData.orderId,
  //       handler: async (response) => {
  //         try {
  //           await api.post('/api/payments/verify', {
  //             razorpayOrderId: response.razorpay_order_id,
  //             razorpayPaymentId: response.razorpay_payment_id,
  //             razorpaySignature: response.razorpay_signature,
  //           });
  //           toast.success(`${componentName} paid successfully!`);
  //           fetchFeeDetails();
  //         } catch (err) {
  //           toast.error(err.response?.data?.message || 'Payment verification failed. Contact school admin.');
  //         }
  //       },
  //       prefill: {
  //         name: selectedChild.userId?.name || '',
  //         email: selectedChild.userId?.email || '',
  //       },
  //       theme: { color: '#4F46E5' },
  //       modal: { ondismiss: () => { setPayingComponent(null); } },
  //     };
  //     const rzp = new window.Razorpay(options);
  //     rzp.on('payment.failed', (response) => {
  //       toast.error(`Payment failed: ${response.error.description}`);
  //       setPayingComponent(null);
  //     });
  //     rzp.open();
  //   } catch (err) {
  //     toast.error(err.response?.data?.message || 'Failed to initiate payment');
  //   } finally {
  //     setPayingComponent(null);
  //   }
  // };
  // ─────────────────────────────────────────────────────────────────────────────

  // Use new fee-details data if available, otherwise fall back to old childFees
  const hasFeeDetails = feeDetails && feeDetails.feeStructure;

  const totalFees = hasFeeDetails
    ? feeDetails.feeStructure.totalFees
    : (childFees.fees || []).filter(f => f.status === 'paid').reduce((s, f) => s + (f.amount || 0), 0) + (childFees.summary?.totalDue || 0);

  const totalPaid = hasFeeDetails
    ? feeDetails.totalPaid
    : (childFees.fees || []).filter(f => f.status === 'paid').reduce((s, f) => s + (f.amount || 0), 0);

  const totalPending = hasFeeDetails
    ? feeDetails.totalPending
    : (childFees.summary?.totalDue || 0);

  const components = hasFeeDetails ? feeDetails.components : [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Fees & Payments</h2>
      {childSelector()}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981]">
          <p className="text-sm text-[#64748B]">Total Fees</p>
          <p className="text-2xl font-bold text-[#065F46]">₹{totalFees.toLocaleString()}</p>
          <p className="text-xs text-[#10B981]">{hasFeeDetails ? feeDetails.feeStructure.academicYear : 'Academic Year'}</p>
        </div>
        <div className="p-6 bg-[#DBEAFE] rounded-xl border-2 border-[#3B82F6]">
          <p className="text-sm text-[#64748B]">Paid Amount</p>
          <p className="text-2xl font-bold text-[#1E40AF]">₹{totalPaid.toLocaleString()}</p>
          <p className="text-xs text-[#3B82F6]">{totalFees > 0 ? ((totalPaid / totalFees) * 100).toFixed(1) : 0}% Complete</p>
        </div>
        <div className="p-6 bg-[#FEE2E2] rounded-xl border-2 border-[#DC2626]">
          <p className="text-sm text-[#64748B]">Pending Amount</p>
          <p className="text-2xl font-bold text-[#991B1B]">₹{totalPending.toLocaleString()}</p>
          <p className="text-xs text-[#DC2626]">Due</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Fee Structure</h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-[#4F46E5] border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-linear-to-r from-[#FEF3C7] to-[#FEE2E2]">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-sm">Fee Type</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Amount</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Due Date</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Status</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Action</th>
                </tr>
              </thead>
              <tbody >
                {components.length > 0 ? components.map((comp, idx) => (
                  <tr key={idx} className="border-b border-[#E2E8F0]">
                    <td className="px-4 py-3 text-sm">{comp.name}</td>
                    <td className="px-4 py-3 text-sm font-semibold">₹{(comp.amount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{comp.dueDate ? formatDate(comp.dueDate) : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${comp.status === 'paid' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEE2E2] text-[#991B1B]'
                        }`}>{comp.status === 'paid' ? 'Paid' : 'Pending'}</span>
                    </td>
                    <td className="px-4 py-3">
                      {comp.status === 'paid' ? (
                        <span className="text-xs text-[#64748B]">
                          {comp.paidAt ? formatDate(comp.paidAt) : 'Paid'}
                        </span>
                      ) : (
                        <span className="text-xs text-[#94A3B8]">Contact school office</span>
                      )}
                      {/* ── Razorpay Pay Now button (commented out for future use) ──
                      {comp.canPay ? (
                        <button
                          onClick={() => handlePayNow(comp.name, comp.amount)}
                          disabled={payingComponent === comp.name}
                          className="px-4 py-1.5 bg-[#4F46E5] text-white text-xs font-semibold rounded-lg hover:bg-[#4338CA] transition-all disabled:opacity-50 disabled:cursor-wait"
                        >
                          {payingComponent === comp.name ? 'Processing...' : 'Pay Now'}
                        </button>
                      ) : (
                        <span className="text-xs text-[#94A3B8]">Pay previous term first</span>
                      )}
                      ── */}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-[#64748B]">No fee structure found for this class.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Fees;
