import React, { useEffect, useState } from 'react';
import { Mail, Phone, User, MessageSquare, Calendar, CheckCircle2 } from 'lucide-react';
import api from '@/utils/api';
import { toast } from 'sonner';

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    api.get('/api/enquiry')
      .then(res => setEnquiries(res.data))
      .catch(() => toast.error('Failed to load enquiries'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleContacted = async (e, id) => {
    e.stopPropagation();
    setTogglingId(id);
    try {
      const res = await api.patch(`/api/enquiry/${id}/contacted`);
      setEnquiries(prev => prev.map(enq => enq._id === id ? res.data : enq));
    } catch {
      toast.error('Failed to update status');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Enquiries</h1>
          <p className="text-sm text-[#64748B] mt-1">Demo requests from the landing page</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-[#FCD34D] text-[#0F172A] text-sm font-bold px-4 py-1.5 rounded-full">
            {enquiries.length} total
          </span>
          <span className="bg-[#D1FAE5] text-[#065F46] text-sm font-bold px-4 py-1.5 rounded-full">
            {enquiries.filter(e => e.contacted).length} contacted
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#64748B]">Loading...</div>
        ) : enquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#64748B]">
            <MessageSquare size={40} className="mb-3 opacity-30" />
            <p className="font-medium">No enquiries yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FFFBEB] border-b-2 border-[#FCD34D]">
                  <th className="text-left px-5 py-3 font-semibold text-[#0F172A]">Name</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#0F172A]">Email</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#0F172A]">Phone</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#0F172A]">Date</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#0F172A]">Message</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#0F172A]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {enquiries.map((enq) => (
                  <tr key={enq._id} className={`transition-colors ${enq.contacted ? 'bg-[#F0FDF4]' : 'hover:bg-[#FFFBEB]'}`}>
                    <td className="px-5 py-3 font-medium text-[#0F172A]">
                      <span className="flex items-center gap-2">
                        <User size={15} className="text-[#64748B] shrink-0" />
                        {enq.name}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#64748B]">
                      <a href={`mailto:${enq.email}`} className="flex items-center gap-1.5 hover:text-[#4F46E5]">
                        <Mail size={14} className="shrink-0" />
                        {enq.email}
                      </a>
                    </td>
                    <td className="px-5 py-3 text-[#64748B]">
                      {enq.phone ? (
                        <a href={`tel:${enq.phone}`} className="flex items-center gap-1.5 hover:text-[#4F46E5]">
                          <Phone size={14} className="shrink-0" />
                          {enq.phone}
                        </a>
                      ) : (
                        <span className="text-[#CBD5E1]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[#64748B] whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="shrink-0" />
                        {new Date(enq.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#64748B] max-w-xs">
                      <button
                        onClick={() => setSelected(enq)}
                        className="text-left truncate block max-w-xs hover:text-[#0F172A] underline underline-offset-2 decoration-dotted"
                      >
                        {enq.message}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={(e) => handleToggleContacted(e, enq._id)}
                        disabled={togglingId === enq._id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all disabled:opacity-50 ${
                          enq.contacted
                            ? 'bg-[#D1FAE5] text-[#065F46] hover:bg-[#A7F3D0]'
                            : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#FCD34D] hover:text-[#0F172A]'
                        }`}
                      >
                        <CheckCircle2 size={14} />
                        {enq.contacted ? 'Contacted' : 'Mark Contacted'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6 max-w-lg w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#0F172A]">Enquiry from {selected.name}</h3>
            <div className="text-sm space-y-1 text-[#64748B]">
              <p><span className="font-medium text-[#0F172A]">Email:</span> {selected.email}</p>
              <p><span className="font-medium text-[#0F172A]">Phone:</span> {selected.phone || '—'}</p>
              <p><span className="font-medium text-[#0F172A]">Date:</span> {new Date(selected.createdAt).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-4 text-sm text-[#0F172A] whitespace-pre-wrap border border-[#E2E8F0]">
              {selected.message}
            </div>
            <div className="flex gap-3">
              <a
                href={`mailto:${selected.email}`}
                className="flex-1 text-center bg-[#4F46E5] text-white py-2 rounded-lg font-semibold text-sm hover:bg-[#4338CA]"
              >
                Reply via Email
              </a>
              <button
                onClick={() => setSelected(null)}
                className="flex-1 bg-[#F1F5F9] text-[#64748B] py-2 rounded-lg font-semibold text-sm hover:bg-[#E2E8F0]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Enquiries;
