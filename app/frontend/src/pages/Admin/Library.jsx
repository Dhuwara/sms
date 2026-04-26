import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { Plus, BookOpen, Download, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClasses, fetchTeachers } from '@/store/slices/classesSlice';
import ConfirmDialog from '@/components/ConfirmDialog';

const statusStyles = {
  active: 'bg-[#D1FAE5] text-[#065F46]',
  overdue: 'bg-[#FEE2E2] text-[#991B1B]',
  returned: 'bg-[#DBEAFE] text-[#1E40AF]',
};

const StatusBadge = ({ status }) => (
  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[status] || statusStyles.returned}`}>{status}</span>
);

const CATEGORIES = ['All', 'Textbook', 'Reference', 'Technology', 'Fiction', 'Non-Fiction'];

const catColors = {
  Textbook:    'bg-[#DBEAFE] text-[#1E40AF]',
  Reference:   'bg-[#EDE9FE] text-[#5B21B6]',
  Technology:  'bg-[#D1FAE5] text-[#065F46]',
  Fiction:     'bg-[#FEF3C7] text-[#92400E]',
  'Non-Fiction':'bg-[#FCE7F3] text-[#9D174D]',
  General:     'bg-[#F1F5F9] text-[#475569]',
};

const Library = () => {
  const dispatch = useDispatch();
  const classes = useSelector(s => s.classes.list);
  const classesStatus = useSelector(s => s.classes.status);
  const staffList = useSelector(s => s.classes.teachers);
  const teachersStatus = useSelector(s => s.classes.teachersStatus);
  const [books, setBooks] = useState([]);
  const [activeTab, setActiveTab] = useState('books');
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', author: '', isbn: '', copies: 1, category: '' });
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [issueRecords, setIssueRecords] = useState([]);
  const [activeCat, setActiveCat] = useState('All');

  // Issue modal state
  const [issuedToType, setIssuedToType] = useState('student');
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [issueForm, setIssueForm] = useState({ bookId: '', studentId: '', staffId: '', dueDate: '' });
  const [issueLoading, setIssueLoading] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [editIssueDueDate, setEditIssueDueDate] = useState('');
  const [editIssueLoading, setEditIssueLoading] = useState(false);

  const fines = issueRecords.filter(r => r.fine > 0);

  const filteredBooks = activeCat === 'All'
    ? books
    : books.filter(b => (b.category || 'General') === activeCat);

  useEffect(() => {
    fetchBooks();
    fetchIssues();
    if (classesStatus === 'idle') dispatch(fetchClasses());
    if (teachersStatus === 'idle') dispatch(fetchTeachers());
  }, [classesStatus, teachersStatus, dispatch]);

  useEffect(() => {
    if (selectedClass) fetchStudentsByClass(selectedClass);
    else setStudents([]);
  }, [selectedClass]);

  const fetchBooks = async () => {
    try {
      const response = await api.get('/api/library/books');
      setBooks(response.data);
    } catch {
      toast.error('Failed to load books');
    }
  };

  const fetchIssues = async () => {
    try {
      const response = await api.get('/api/library/issues');
      setIssueRecords(response.data || []);
    } catch {
      console.error('Failed to load issues');
    }
  };

  const fetchStudentsByClass = async (classId) => {
    try {
      const response = await api.get(`/api/students?classId=${classId}`);
      setStudents(response.data || []);
    } catch {
      console.error('Failed to load students');
    }
  };

  const handleReturn = async (issueId) => {
    try {
      await api.put(`/api/library/issues/${issueId}/return`);
      toast.success('Book returned successfully');
      fetchIssues();
      fetchBooks();
    } catch {
      toast.error('Failed to return book');
    }
  };

  const handleMarkFinePaid = async (issueId) => {
    try {
      await api.put(`/api/library/issues/${issueId}/fine-paid`);
      toast.success('Fine marked as paid');
      fetchIssues();
    } catch {
      toast.error('Failed to update fine status');
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const openAddBook = () => {
    setEditingBook(null);
    setFormData({ title: '', author: '', isbn: '', copies: 1, category: '' });
    setShowAddBookModal(true);
  };

  const openEditBook = (book) => {
    setEditingBook(book);
    setFormData({ title: book.title, author: book.author, isbn: book.isbn || '', copies: book.totalCopies, category: book.category || '' });
    setShowAddBookModal(true);
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingBook) {
        await api.put(`/api/library/books/${editingBook._id}`, {
          title: formData.title,
          author: formData.author,
          isbn: formData.isbn,
          category: formData.category,
          totalCopies: formData.copies,
          availableCopies: editingBook.availableCopies + (formData.copies - editingBook.totalCopies),
        });
        toast.success('Book updated successfully');
      } else {
        await api.post('/api/library/books', formData);
        toast.success('Book added successfully');
      }
      setShowAddBookModal(false);
      setEditingBook(null);
      setFormData({ title: '', author: '', isbn: '', copies: 1, category: '' });
      fetchBooks();
    } catch {
      toast.error(editingBook ? 'Failed to update book' : 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = (book) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Book',
      message: `Are you sure you want to delete "${book.title}"? This cannot be undone.`,
      onConfirm: async () => {
        try {
          await api.delete(`/api/library/books/${book._id}`);
          toast.success('Book deleted');
          fetchBooks();
        } catch {
          toast.error('Failed to delete book');
        } finally {
          setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
        }
      },
    });
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    if (!issueForm.bookId || !issueForm.dueDate) { toast.error('Select a book and due date'); return; }
    if (issuedToType === 'student' && !issueForm.studentId) { toast.error('Select a student'); return; }
    if (issuedToType === 'staff' && !issueForm.staffId) { toast.error('Select a staff member'); return; }
    setIssueLoading(true);
    try {
      await api.post('/api/library/issues', {
        bookId: issueForm.bookId,
        issuedToType,
        studentId: issuedToType === 'student' ? issueForm.studentId : undefined,
        staffId: issuedToType === 'staff' ? issueForm.staffId : undefined,
        dueDate: issueForm.dueDate,
      });
      toast.success('Book issued successfully');
      setShowIssueModal(false);
      setIssueForm({ bookId: '', studentId: '', staffId: '', dueDate: '' });
      setSelectedClass('');
      setStudents([]);
      setIssuedToType('student');
      fetchIssues();
      fetchBooks();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to issue book');
    } finally {
      setIssueLoading(false);
    }
  };

  const openEditIssue = (record) => {
    setEditingIssue(record);
    setEditIssueDueDate(record.dueDate ? record.dueDate.split('T')[0] : '');
  };

  const handleUpdateIssue = async (e) => {
    e.preventDefault();
    setEditIssueLoading(true);
    try {
      await api.put(`/api/library/issues/${editingIssue._id}`, { dueDate: editIssueDueDate });
      toast.success('Due date updated');
      setEditingIssue(null);
      fetchIssues();
    } catch {
      toast.error('Failed to update issue');
    } finally {
      setEditIssueLoading(false);
    }
  };

  const handleDeleteIssue = (record) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Issue Record',
      message: `Delete this issue record for "${record.bookId?.title || 'book'}"? ${record.status === 'returned' ? '' : 'The copy will be returned to available stock.'}`,
      onConfirm: async () => {
        try {
          await api.delete(`/api/library/issues/${record._id}`);
          toast.success('Issue record deleted');
          fetchIssues();
          fetchBooks();
        } catch {
          toast.error('Failed to delete issue record');
        } finally {
          setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
        }
      },
    });
  };

  const handleDownloadReport = async () => {
    try {
      const response = await api.get('/api/library/report');
      const data = response.data || [];

      const rows = data.map(r => ({
        'Book Name': r.bookTitle,
        'Category': r.category,
        'Issued To': r.issuedTo,
        'Type': r.type,
        'Issued Date': r.issuedDate,
        'Due Date': r.dueDate,
        'Returned Date': r.returnedDate || '—',
        'Status': r.status,
        'Fine (₹)': r.fine,
        'Fine Status': r.fineStatus,
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Library Report');
      XLSX.writeFile(wb, `Library_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Report downloaded');
    } catch {
      toast.error('Failed to download report');
    }
  };

  const getIssuedToName = (record) => {
    if (record.issuedToType === 'staff') return record.staffId?.userId?.name || 'Staff';
    return record.studentId?.userId?.name || 'Student';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-[#0F172A]">Library Management</h1>
          <p className="text-[#64748B] mt-1">Books, issue/return & fines</p>
        </div>
        {activeTab === 'books' && (
          <div className="flex flex-wrap gap-3">
            <button onClick={handleDownloadReport} className="flex items-center gap-2 bg-[#10B981] text-white hover:bg-[#059669] px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg font-semibold transition-all shadow-md text-sm sm:text-base">
              <Download size={18} /> Download Excel
            </button>
            <button onClick={openAddBook} className="flex items-center gap-2 bg-[#4F46E5] text-white hover:bg-[#4338CA] px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all shadow-md text-sm sm:text-base">
              <Plus size={20} /> Add Book
            </button>
          </div>
        )}
      </div>

      {/* Stats strip — shown only on books tab */}
      {activeTab === 'books' && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-[#DBEAFE] rounded-xl flex items-center gap-3">
            <BookOpen className="text-[#1E40AF]" size={28} />
            <div><p className="text-xs text-[#1E40AF] font-medium">Total Books</p><p className="text-2xl font-bold text-[#1E40AF]">{books.length}</p></div>
          </div>
          <div className="p-4 bg-[#D1FAE5] rounded-xl flex items-center gap-3">
            <BookOpen className="text-[#065F46]" size={28} />
            <div><p className="text-xs text-[#065F46] font-medium">Currently Issued</p><p className="text-2xl font-bold text-[#065F46]">{issueRecords.filter(r => r.status === 'active').length}</p></div>
          </div>
          <div className="p-4 bg-[#FEE2E2] rounded-xl flex items-center gap-3">
            <BookOpen className="text-[#991B1B]" size={28} />
            <div><p className="text-xs text-[#991B1B] font-medium">Overdue</p><p className="text-2xl font-bold text-[#991B1B]">{issueRecords.filter(r => r.status === 'overdue').length}</p></div>
          </div>
        </div>
      )}

      <div className="flex gap-2 border-b-2 border-[#FCD34D] overflow-x-auto">
        {['books', 'issue', 'fines'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-semibold transition-all capitalize ${activeTab === tab ? 'bg-[#FCD34D] text-[#0F172A] rounded-t-lg' : 'text-[#64748B] hover:text-[#0F172A]'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'books' && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] overflow-hidden">
          {/* Category filter pills */}
          <div className="px-6 py-4 border-b border-[#FCD34D] flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  activeCat === cat
                    ? 'bg-[#4F46E5] text-white shadow-sm'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#FCD34D] hover:text-[#0F172A]'
                }`}
              >
                {cat}
                {cat !== 'All' && (
                  <span className="ml-1.5 text-xs opacity-70">
                    ({books.filter(b => (b.category || 'General') === cat).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FFFBEB]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase tracking-wider">Book Title</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-[#0F172A] uppercase tracking-wider">Available</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-[#0F172A] uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-[#0F172A] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FEF3C7]">
                {filteredBooks.length > 0 ? filteredBooks.map((book) => (
                  <tr key={book._id} className="hover:bg-[#FFFBEB] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] flex items-center justify-center shrink-0">
                          <BookOpen className="text-[#4F46E5]" size={16} />
                        </div>
                        <span className="font-semibold text-[#0F172A] text-sm">{book.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#64748B]">{book.author}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${catColors[book.category] || catColors.General}`}>
                        {book.category || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-full ${
                        book.availableCopies === 0 ? 'bg-[#FEE2E2] text-[#991B1B]' : 'bg-[#D1FAE5] text-[#065F46]'
                      }`}>
                        {book.availableCopies ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-[#64748B]">{book.totalCopies ?? 0}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEditBook(book)} className="p-1.5 rounded-lg bg-[#EDE9FE] text-[#4F46E5] hover:bg-[#DDD6FE] transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDeleteBook(book)} className="p-1.5 rounded-lg bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FECACA] transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#64748B]">
                      No books found{activeCat === 'All' ? '' : ` in "${activeCat}"`}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'issue' && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Issue & Return Tracking</h2>
            <button onClick={() => setShowIssueModal(true)} className="flex items-center gap-2 bg-[#4F46E5] text-white hover:bg-[#4338CA] px-5 py-2 rounded-lg font-semibold transition-all shadow-md">
              <Plus size={18} /> Issue Book
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FFFBEB]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase tracking-wider">Issued To</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase tracking-wider">Book</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase tracking-wider">Issued Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase tracking-wider">Fine</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-[#0F172A] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FEF3C7]">
                {issueRecords.length > 0 ? issueRecords.map((record) => {
                  const hasFine = (record.fine ?? 0) > 0;
                  const finePaid = record.fineStatus === 'paid';
                  return (
                  <tr key={record._id} className="hover:bg-[#FFFBEB] transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#0F172A] text-sm">{getIssuedToName(record)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${record.issuedToType === 'staff' ? 'bg-[#EDE9FE] text-[#5B21B6]' : 'bg-[#DBEAFE] text-[#1E40AF]'}`}>
                        {record.issuedToType === 'staff' ? 'Staff' : 'Student'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#64748B]">{record.bookId?.title || '—'}</td>
                    <td className="px-6 py-4 text-sm text-[#64748B]">{formatDate(record.issuedAt)}</td>
                    <td className="px-6 py-4 text-sm text-[#64748B]">{formatDate(record.dueDate)}</td>
                    <td className="px-6 py-4"><StatusBadge status={record.status} /></td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      {hasFine ? (
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${finePaid ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}>
                          ₹{record.fine} {finePaid ? 'Paid' : 'Unpaid'}
                        </span>
                      ) : <span className="text-[#64748B]">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {record.status !== 'returned' && (
                          <button onClick={() => handleReturn(record._id)} className="text-xs bg-[#4F46E5] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-[#4338CA] transition-colors">Return</button>
                        )}
                        {record.status !== 'returned' && (
                          <button onClick={() => openEditIssue(record)} className="p-1.5 rounded-lg bg-[#EDE9FE] text-[#4F46E5] hover:bg-[#DDD6FE] transition-colors">
                            <Pencil size={14} />
                          </button>
                        )}
                        <button onClick={() => handleDeleteIssue(record)} className="p-1.5 rounded-lg bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FECACA] transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                }) : (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-[#64748B]">No issue records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'fines' && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h2 className="text-2xl font-bold mb-4">Fine Calculation</h2>
          {fines.length === 0 ? (
            <p className="text-center text-[#64748B] py-12">No fines recorded.</p>
          ) : (
            <div className="space-y-3">
              {fines.map((fine) => {
                const name = getIssuedToName(fine);
                const days = fine.status === 'overdue' ? Math.ceil((Date.now() - new Date(fine.dueDate)) / 86400000) : 0;
                const isPaid = fine.fineStatus === 'paid';
                const typeClass = fine.issuedToType === 'staff' ? 'bg-[#EDE9FE] text-[#5B21B6]' : 'bg-[#DBEAFE] text-[#1E40AF]';
                const typeLabel = fine.issuedToType === 'staff' ? 'Staff' : 'Student';
                const dayWord = days === 1 ? 'day' : 'days';
                const overdueText = days > 0 ? ` — ${days} ${dayWord} overdue` : '';
                return (
                  <div key={fine._id} className="p-4 border-2 border-[#FCD34D] rounded-xl flex justify-between items-center hover:bg-[#FFFBEB] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center shrink-0">
                        <BookOpen className="text-[#DC2626]" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-[#0F172A]">{name} <span className={`text-xs px-2 py-0.5 rounded-full ml-1 ${typeClass}`}>{typeLabel}</span></p>
                        <p className="text-sm text-[#64748B]">{fine.bookId?.title || 'Book'}{overdueText}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5">
                      <p className="text-2xl font-bold text-[#DC2626]">₹{fine.fine}</p>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${isPaid ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}>{isPaid ? 'Paid' : 'Unpaid'}</span>
                      {!isPaid && (
                        <button onClick={() => handleMarkFinePaid(fine._id)} className="text-xs bg-[#10B981] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-[#059669] transition-colors mt-0.5">Mark Paid</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Book Modal */}
      {showAddBookModal && (() => {
        const actionLabel = editingBook ? 'Update Book' : 'Add Book';
        const submitLabel = loading ? 'Saving...' : actionLabel;
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-4">{editingBook ? 'Edit Book' : 'Add New Book'}</h2>
              <form onSubmit={handleSaveBook} className="space-y-4">
                <input type="text" placeholder="Book Title" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg" />
                <input type="text" placeholder="Author" required value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg" />
                <input type="text" placeholder="ISBN (optional)" value={formData.isbn} onChange={(e) => setFormData({...formData, isbn: e.target.value})} className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg" />
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg">
                  <option value="">Select Category</option>
                  {CATEGORIES.filter(c => c !== 'All').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <input type="number" placeholder="Total Copies" required min="1" value={formData.copies} onChange={(e) => setFormData({...formData, copies: Number.parseInt(e.target.value, 10)})} className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg" />
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setShowAddBookModal(false); setEditingBook(null); setFormData({ title: '', author: '', isbn: '', copies: 1, category: '' }); }} className="flex-1 bg-gray-200 h-10 rounded-lg font-semibold">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-1 bg-[#4F46E5] text-white h-10 rounded-lg font-semibold">{submitLabel}</button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Issue Book Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-4">Issue Book</h2>
            <form onSubmit={handleIssueBook} className="space-y-4">
              <select required value={issueForm.bookId} onChange={(e) => setIssueForm({...issueForm, bookId: e.target.value})} className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg">
                <option value="">Select Book</option>
                {books.filter(b => (b.availableCopies ?? 0) > 0).map(b => (
                  <option key={b._id} value={b._id}>{b.title} ({b.availableCopies} available)</option>
                ))}
              </select>

              <div className="flex gap-3">
                <button type="button" onClick={() => { setIssuedToType('student'); setIssueForm({...issueForm, staffId: ''}); }} className={`flex-1 py-2 rounded-lg font-semibold border-2 transition-all ${issuedToType === 'student' ? 'bg-[#4F46E5] text-white border-[#4F46E5]' : 'border-[#FCD34D] text-[#64748B]'}`}>Student</button>
                <button type="button" onClick={() => { setIssuedToType('staff'); setIssueForm({...issueForm, studentId: ''}); setSelectedClass(''); }} className={`flex-1 py-2 rounded-lg font-semibold border-2 transition-all ${issuedToType === 'staff' ? 'bg-[#4F46E5] text-white border-[#4F46E5]' : 'border-[#FCD34D] text-[#64748B]'}`}>Staff</button>
              </div>

              {issuedToType === 'student' && (
                <>
                  <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg">
                    <option value="">Select Class</option>
                    {classes.map(c => (
                      <option key={c._id} value={c._id}>{c.name}{c.section ? `-${c.section}` : ''}</option>
                    ))}
                  </select>
                  <select required value={issueForm.studentId} onChange={(e) => setIssueForm({...issueForm, studentId: e.target.value})} className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg" disabled={!selectedClass}>
                    <option value="">{selectedClass ? 'Select Student' : 'Select class first'}</option>
                    {students.map(s => (
                      <option key={s._id} value={s._id}>{s.name} (Roll: {s.roll_no})</option>
                    ))}
                  </select>
                </>
              )}

              {issuedToType === 'staff' && (
                <select required value={issueForm.staffId} onChange={(e) => setIssueForm({...issueForm, staffId: e.target.value})} className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg">
                  <option value="">Select Staff Member</option>
                  {staffList.map(s => (
                    <option key={s._id} value={s._id}>{s.name || s.userId?.name}</option>
                  ))}
                </select>
              )}

              <div>
                <label htmlFor="dueDate" className="block text-sm font-semibold text-[#0F172A] mb-1">Due / Submission Date</label>
                <input id="dueDate" type="date" required value={issueForm.dueDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setIssueForm({...issueForm, dueDate: e.target.value})} className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg" />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowIssueModal(false); setIssueForm({ bookId: '', studentId: '', staffId: '', dueDate: '' }); setSelectedClass(''); setIssuedToType('student'); }} className="flex-1 bg-gray-200 h-10 rounded-lg font-semibold">Cancel</button>
                <button type="submit" disabled={issueLoading} className="flex-1 bg-[#4F46E5] text-white h-10 rounded-lg font-semibold">{issueLoading ? 'Issuing...' : 'Issue Book'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Issue Modal */}
      {editingIssue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <h2 className="text-xl font-bold text-[#0F172A] mb-1">Edit Due Date</h2>
            <p className="text-sm text-[#64748B] mb-4">{editingIssue.bookId?.title}</p>
            <form onSubmit={handleUpdateIssue} className="space-y-4">
              <div>
                <label htmlFor="editDueDate" className="block text-sm font-semibold text-[#0F172A] mb-1">New Due Date</label>
                <input id="editDueDate" type="date" required value={editIssueDueDate} onChange={(e) => setEditIssueDueDate(e.target.value)} className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditingIssue(null)} className="flex-1 bg-gray-200 h-10 rounded-lg font-semibold">Cancel</button>
                <button type="submit" disabled={editIssueLoading} className="flex-1 bg-[#4F46E5] text-white h-10 rounded-lg font-semibold">{editIssueLoading ? 'Saving...' : 'Update'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null })}
      />
    </div>
  );
};

export default Library;
