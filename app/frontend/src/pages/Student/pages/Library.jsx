import React from 'react';
import { Library as LibraryIcon, Clock, AlertCircle, DollarSign, BookOpen } from 'lucide-react';

const Library = ({ myLibraryIssues }) => {
  const active = myLibraryIssues.filter(r => r.status === 'active');
  const overdue = myLibraryIssues.filter(r => r.status === 'overdue');
  const dueSoon = active.filter(r => {
    const daysLeft = Math.ceil((new Date(r.dueDate) - Date.now()) / 86400000);
    return daysLeft <= 3 && daysLeft >= 0;
  });
  const totalFine = myLibraryIssues.reduce((sum, r) => sum + (r.fineStatus !== 'paid' ? (r.fine || 0) : 0), 0);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const statusStyle = { active: 'bg-[#D1FAE5] text-[#065F46]', overdue: 'bg-[#FEE2E2] text-[#991B1B]', returned: 'bg-[#DBEAFE] text-[#1E40AF]' };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">My Library</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#DBEAFE] rounded-xl border-2 border-[#3B82F6]">
          <LibraryIcon className="text-[#3B82F6] mb-2" size={24} />
          <p className="text-sm text-[#64748B]">Books Issued</p>
          <p className="text-2xl font-bold text-[#1E40AF]">{active.length}</p>
        </div>
        <div className="p-4 bg-[#FEF3C7] rounded-xl border-2 border-[#F59E0B]">
          <Clock className="text-[#F59E0B] mb-2" size={24} />
          <p className="text-sm text-[#64748B]">Due Soon (3 days)</p>
          <p className="text-2xl font-bold text-[#92400E]">{dueSoon.length}</p>
        </div>
        <div className="p-4 bg-[#FEE2E2] rounded-xl border-2 border-[#DC2626]">
          <AlertCircle className="text-[#DC2626] mb-2" size={24} />
          <p className="text-sm text-[#64748B]">Overdue</p>
          <p className="text-2xl font-bold text-[#991B1B]">{overdue.length}</p>
        </div>
        <div className="p-4 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981]">
          <DollarSign className="text-[#10B981] mb-2" size={24} />
          <p className="text-sm text-[#64748B]">Fine Due</p>
          <p className="text-2xl font-bold text-[#065F46]">₹{totalFine}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#FEF3C7]">
          <h3 className="text-lg font-bold text-[#0F172A]">Issued Books</h3>
        </div>
        {myLibraryIssues.length === 0 ? (
          <div className="p-12 text-center text-[#64748B]">
            <LibraryIcon className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="text-lg font-medium">No books issued</p>
            <p className="text-sm mt-1">Books issued to you will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FFFBEB]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase tracking-wider">Book</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase tracking-wider">Issued On</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase tracking-wider">Fine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FEF3C7]">
                {myLibraryIssues.map((issue) => (
                  <tr key={issue._id} className="hover:bg-[#FFFBEB] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] flex items-center justify-center shrink-0">
                          <BookOpen className="text-[#4F46E5]" size={16} />
                        </div>
                        <span className="font-semibold text-[#0F172A] text-sm">{issue.bookId?.title || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#64748B]">{issue.bookId?.category || '—'}</td>
                    <td className="px-6 py-4 text-sm text-[#64748B]">{fmtDate(issue.issuedAt)}</td>
                    <td className="px-6 py-4 text-sm text-[#64748B]">{fmtDate(issue.dueDate)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyle[issue.status] || statusStyle.returned}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      {issue.fine > 0 ? (
                        <span className={issue.fineStatus === 'paid' ? 'text-[#065F46]' : 'text-[#DC2626]'}>
                          ₹{issue.fine} {issue.fineStatus === 'paid' ? '(Paid)' : '(Unpaid)'}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
