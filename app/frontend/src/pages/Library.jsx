import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Plus, BookOpen, Download, Search } from 'lucide-react';
import { toast } from 'sonner';

const Library = () => {
  const [books, setBooks] = useState([]);
  const [activeTab, setActiveTab] = useState('books');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', author: '', copies: 1, category: '' });
  const [loading, setLoading] = useState(false);

  const issueRecords = [
    { student: 'Rahul Kumar', book: 'Mathematics for Class 5', issued: '2024-12-01', due: '2024-12-15', status: 'Active' },
    { student: 'Priya Sharma', book: 'Science Experiments', issued: '2024-12-05', due: '2024-12-19', status: 'Active' },
    { student: 'Amit Patel', book: 'English Grammar', issued: '2024-11-28', due: '2024-12-12', status: 'Overdue' },
    { student: 'Sneha Reddy', book: 'Indian History', issued: '2024-12-10', due: '2024-12-24', status: 'Active' },
    { student: 'Vikram Singh', book: 'Computer Basics', issued: '2024-12-08', due: '2024-12-22', status: 'Active' },
  ];

  const categories = ['Textbook', 'Reference', 'Technology', 'Fiction', 'Non-Fiction'];
  const fines = [
    { student: 'Amit Patel', book: 'English Grammar', days: 3, fine: 30, status: 'Unpaid' },
    { student: 'Rahul Kumar', book: 'Mathematics', days: 1, fine: 10, status: 'Paid' },
  ];

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await api.get('/api/library/books');
      setBooks(response.data);
    } catch (error) {
      toast.error('Failed to load books');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/library/books', formData);
      toast.success('Book added successfully');
      setShowModal(false);
      setFormData({ title: '', author: '', copies: 1, category: '' });
      fetchBooks();
    } catch (error) {
      toast.error('Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#0F172A]">Library Management</h1>
          <p className="text-[#64748B] mt-1">Books, categories, issue/return & fines</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#4F46E5] text-white hover:bg-[#4338CA] px-6 py-3 rounded-lg font-semibold transition-all shadow-md">
          <Plus size={20} /> Add Book
        </button>
      </div>

      <div className="flex gap-2 border-b-2 border-[#FCD34D]">
        {['books', 'categories', 'issue', 'fines', 'reports'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-semibold transition-all capitalize ${activeTab === tab ? 'bg-[#FCD34D] text-[#0F172A] rounded-t-lg' : 'text-[#64748B] hover:text-[#0F172A]'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'books' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book, i) => (
            <div key={i} className="p-6 rounded-xl border-2 border-[#FCD34D] bg-white shadow-sm hover:shadow-lg transition-all">
              <BookOpen className="text-[#4F46E5] mb-3" size={32} />
              <h3 className="text-lg font-bold text-[#0F172A] mb-1">{book.title}</h3>
              <p className="text-sm text-[#64748B] mb-2">by {book.author}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#64748B]">{book.category || 'General'}</span>
                <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-[#D1FAE5] text-[#065F46]">{book.copies} copies</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, i) => (
            <div key={i} className="p-6 rounded-xl border-2 border-[#FCD34D] bg-gradient-to-br from-[#FEF3C7] to-white text-center hover:shadow-lg transition-all">
              <BookOpen className="text-[#F59E0B] mx-auto mb-2" size={32} />
              <p className="font-bold text-[#0F172A]">{cat}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'issue' && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h2 className="text-2xl font-bold mb-4">Issue & Return Tracking</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Book</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Issued Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {issueRecords.map((record, i) => (
                  <tr key={i} className="hover:bg-[#FFFBEB]">
                    <td className="px-6 py-4 font-semibold text-[#0F172A]">{record.student}</td>
                    <td className="px-6 py-4 text-sm text-[#64748B]">{record.book}</td>
                    <td className="px-6 py-4 text-sm">{record.issued}</td>
                    <td className="px-6 py-4 text-sm">{record.due}</td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 text-xs font-semibold rounded-full ${record.status === 'Active' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}>{record.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'fines' && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h2 className="text-2xl font-bold mb-4">Fine Calculation</h2>
          <div className="space-y-3">
            {fines.map((fine, i) => (
              <div key={i} className="p-4 border-2 border-[#FCD34D] rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold text-[#0F172A]">{fine.student}</p>
                  <p className="text-sm text-[#64748B]">{fine.book} - {fine.days} days overdue</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-[#DC2626]">₹{fine.fine}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${fine.status === 'Paid' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}>{fine.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Library Reports</h2>
            <button onClick={() => toast.success('Library report downloaded')} className="flex items-center gap-2 bg-[#10B981] text-white px-4 py-2 rounded-lg font-semibold">
              <Download size={18} /> Download Report
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#DBEAFE] rounded-xl"><p className="text-sm text-[#1E40AF]">Total Books</p><p className="text-4xl font-bold text-[#1E40AF]">{books.length}</p></div>
            <div className="p-6 bg-[#D1FAE5] rounded-xl"><p className="text-sm text-[#065F46]">Books Issued</p><p className="text-4xl font-bold text-[#065F46]">{issueRecords.length}</p></div>
            <div className="p-6 bg-[#FEE2E2] rounded-xl"><p className="text-sm text-[#991B1B]">Overdue</p><p className="text-4xl font-bold text-[#991B1B]">{issueRecords.filter(r => r.status === 'Overdue').length}</p></div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-4">Add New Book</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Book Title" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg" />
              <input type="text" placeholder="Author" required value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg" />
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg">
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <input type="number" placeholder="Copies" required min="1" value={formData.copies} onChange={(e) => setFormData({...formData, copies: parseInt(e.target.value)})} className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 h-10 rounded-lg font-semibold">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 bg-[#4F46E5] text-white h-10 rounded-lg font-semibold">Add Book</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;