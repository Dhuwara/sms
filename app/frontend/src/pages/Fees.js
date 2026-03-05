import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Plus, Download, DollarSign, Receipt, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const Fees = () => {
  const [feeTypes, setFeeTypes] = useState([]);
  const [feeRecords, setFeeRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('structure');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', amount: 0, due_date: '', description: '' });
  const [loading, setLoading] = useState(false);

  const classWiseFees = [
    { class: 'Grade 1-A', tuition: 15000, transport: 3000, library: 500, sports: 2000, total: 20500 },
    { class: 'Grade 2-B', tuition: 16000, transport: 3000, library: 500, sports: 2000, total: 21500 },
    { class: 'Grade 3-A', tuition: 17000, transport: 3500, library: 600, sports: 2500, total: 23600 },
    { class: 'Grade 4-B', tuition: 18000, transport: 3500, library: 600, sports: 2500, total: 24600 },
    { class: 'Grade 5-A', tuition: 20000, transport: 4000, library: 700, sports: 3000, total: 27700 },
  ];

  const scholarships = [
    { name: 'Merit Scholarship', discount: '50%', criteria: 'Above 90% marks' },
    { name: 'Sports Quota', discount: '30%', criteria: 'State level player' },
    { name: 'Sibling Discount', discount: '20%', criteria: '2+ siblings' },
    { name: 'Financial Aid', discount: '40%', criteria: 'Income < 3 LPA' },
  ];

  useEffect(() => {
    fetchFeeTypes();
    fetchFeeRecords();
  }, []);

  const fetchFeeTypes = async () => {
    try {
      const response = await api.get('/api/fees/types');
      setFeeTypes(response.data);
    } catch (error) {
      toast.error('Failed to load fee types');
    }
  };

  const fetchFeeRecords = async () => {
    try {
      const response = await api.get('/api/fees/records');
      setFeeRecords(response.data);
    } catch (error) {
      console.error('Failed to load fee records');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/fees/types', formData);
      toast.success('Fee type added successfully');
      setShowModal(false);
      setFormData({ name: '', amount: 0, due_date: '', description: '' });
      fetchFeeTypes();
    } catch (error) {
      toast.error('Failed to add fee type');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = () => toast.success('Receipt downloaded as PDF!');
  const downloadInvoice = () => toast.success('Invoice downloaded as PDF!');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#0F172A]">Fees & Finance Management</h1>
          <p className="text-[#64748B] mt-1">Fee structure, payments, scholarships & receipts</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#10B981] text-white hover:bg-[#059669] px-6 py-3 rounded-lg font-semibold transition-all shadow-md">
          <Plus size={20} /> Add Fee Type
        </button>
      </div>

      <div className="flex gap-2 border-b-2 border-[#FCD34D]">
        {['structure', 'payments', 'scholarships', 'receipts'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-semibold transition-all capitalize ${activeTab === tab ? 'bg-[#FCD34D] text-[#0F172A] rounded-t-lg' : 'text-[#64748B] hover:text-[#0F172A]'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'structure' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
            <h2 className="text-2xl font-bold mb-4">Class-wise Fee Structure</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Tuition</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Transport</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Library</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Sports</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {classWiseFees.map((row, i) => (
                    <tr key={i} className="hover:bg-[#FFFBEB]">
                      <td className="px-6 py-4 font-semibold text-[#0F172A]">{row.class}</td>
                      <td className="px-6 py-4 text-sm">₹{row.tuition.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm">₹{row.transport.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm">₹{row.library.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm">₹{row.sports.toLocaleString()}</td>
                      <td className="px-6 py-4 font-bold text-[#0F172A]">₹{row.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
              <h3 className="text-xl font-bold mb-4">Fee Types</h3>
              <div className="space-y-3">
                {feeTypes.map((fee, i) => (
                  <div key={i} className="p-4 rounded-xl border-2 border-[#FCD34D] bg-gradient-to-r from-[#FEF3C7] to-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-[#0F172A]">{fee.name}</h4>
                        <p className="text-xs text-[#64748B] mt-1">{fee.description}</p>
                      </div>
                      <span className="text-lg font-bold text-[#10B981]">₹{fee.amount}</span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-2">Due: {fee.due_date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981]">
              <DollarSign className="text-[#10B981] mb-2" size={32} />
              <p className="text-sm text-[#065F46] font-medium">Total Collected</p>
              <p className="text-3xl font-bold text-[#065F46]">₹4,50,000</p>
            </div>
            <div className="p-6 bg-[#FEF3C7] rounded-xl border-2 border-[#F59E0B]">
              <TrendingUp className="text-[#F59E0B] mb-2" size={32} />
              <p className="text-sm text-[#92400E] font-medium">Pending</p>
              <p className="text-3xl font-bold text-[#92400E]">₹75,000</p>
            </div>
            <div className="p-6 bg-[#FEE2E2] rounded-xl border-2 border-[#DC2626]">
              <DollarSign className="text-[#DC2626] mb-2" size={32} />
              <p className="text-sm text-[#991B1B] font-medium">Overdue</p>
              <p className="text-3xl font-bold text-[#991B1B]">₹25,000</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Payment Tracking</h2>
              <button onClick={() => toast.success('Payment report downloaded')} className="flex items-center gap-2 bg-[#10B981] text-white px-4 py-2 rounded-lg font-semibold">
                <Download size={18} /> Export Excel
              </button>
            </div>
            <div className="space-y-3">
              {feeRecords.slice(0, 5).map((record, i) => (
                <div key={i} className="p-4 rounded-xl border-2 border-[#FCD34D] flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-[#0F172A]">Student ID: {record.student_id}</p>
                    <p className="text-sm text-[#64748B]">Fee Type: {record.fee_type_id}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${record.status === 'paid' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}>
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scholarships' && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h2 className="text-2xl font-bold mb-6">Scholarships & Discounts</h2>
          <div className="grid gap-4">
            {scholarships.map((scholarship, i) => (
              <div key={i} className="p-6 border-2 border-[#FCD34D] rounded-lg hover:bg-[#FFFBEB] transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-[#0F172A]">{scholarship.name}</h3>
                    <p className="text-sm text-[#64748B] mt-1">Criteria: {scholarship.criteria}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex px-4 py-2 bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2] rounded-full text-xl font-bold text-[#0F172A]">
                      {scholarship.discount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'receipts' && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h2 className="text-2xl font-bold mb-6">Receipts & Invoices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border-2 border-[#FCD34D] rounded-lg text-center">
              <Receipt className="text-[#10B981] mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-[#0F172A] mb-2">Generate Receipt</h3>
              <p className="text-sm text-[#64748B] mb-4">Generate payment receipt for students</p>
              <button onClick={downloadReceipt} className="bg-[#10B981] text-white px-6 py-2 rounded-lg font-semibold">Download Receipt</button>
            </div>
            <div className="p-6 border-2 border-[#FCD34D] rounded-lg text-center">
              <Receipt className="text-[#DC2626] mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-[#0F172A] mb-2">Generate Invoice</h3>
              <p className="text-sm text-[#64748B] mb-4">Generate pending fee invoice</p>
              <button onClick={downloadInvoice} className="bg-[#DC2626] text-white px-6 py-2 rounded-lg font-semibold">Download Invoice</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-4">Add Fee Type</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Fee Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg" />
              <input type="number" placeholder="Amount" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})} className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg" />
              <input type="date" required value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg" />
              <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border-2 border-[#FCD34D] rounded-lg" rows="3" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 h-10 rounded-lg font-semibold">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 bg-[#10B981] text-white h-10 rounded-lg font-semibold">Add Fee Type</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;