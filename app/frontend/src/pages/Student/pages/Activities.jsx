import React from 'react';
import { Trophy, Medal } from 'lucide-react';

const STATUS_COLORS = {
  pending: 'bg-[#FEF3C7] text-[#92400E]',
  approved: 'bg-[#D1FAE5] text-[#065F46]',
  rejected: 'bg-[#FEE2E2] text-[#991B1B]',
  disbursed: 'bg-[#DBEAFE] text-[#1E40AF]',
};

const CATEGORY_COLORS = {
  academic:   'bg-[#DBEAFE] text-[#1E40AF]',
  sports:     'bg-[#D1FAE5] text-[#065F46]',
  arts:       'bg-[#EDE9FE] text-[#5B21B6]',
  science:    'bg-[#FEF3C7] text-[#92400E]',
  leadership: 'bg-[#FEE2E2] text-[#991B1B]',
  community:  'bg-[#CFFAFE] text-[#155E75]',
  other:      'bg-[#F1F5F9] text-[#475569]',
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const Activities = ({ scholarships, awards }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Activities & Achievements</h2>

      {/* Scholarships */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Trophy className="text-[#F59E0B]" size={20} />
          <h3 className="font-semibold text-[#0F172A]">My Scholarships</h3>
        </div>
        {scholarships.length === 0 ? (
          <div className="p-12 text-center text-[#64748B]">
            <Trophy className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="text-lg font-medium">No scholarships yet</p>
            <p className="text-sm mt-1">Scholarships awarded to you will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {scholarships.map(s => (
              <div key={s._id} className="px-6 py-4 flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-[#0F172A]">{s.name}</p>
                  {s.description && <p className="text-sm text-[#64748B] mt-0.5">{s.description}</p>}
                  {s.criteria && <p className="text-xs text-[#94A3B8] mt-0.5">Criteria: {s.criteria}</p>}
                  <p className="text-xs text-[#94A3B8] mt-1">Year: {s.academicYear} · Type: {s.type}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-[#4F46E5]">₹{s.amount?.toLocaleString('en-IN')}</p>
                  <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[s.status] || ''}`}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Awards & Prizes */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Medal className="text-[#7C3AED]" size={20} />
          <h3 className="font-semibold text-[#0F172A]">My Awards & Prizes</h3>
        </div>
        {awards.length === 0 ? (
          <div className="p-12 text-center text-[#64748B]">
            <Medal className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="text-lg font-medium">No awards yet</p>
            <p className="text-sm mt-1">Awards and prizes will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {awards.map(a => (
              <div key={a._id} className="px-6 py-4 flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-[#0F172A]">{a.title}</p>
                  {a.eventName && <p className="text-sm text-[#64748B] mt-0.5">{a.eventName}</p>}
                  {a.description && <p className="text-xs text-[#94A3B8] mt-0.5">{a.description}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${CATEGORY_COLORS[a.category] || ''}`}>
                      {a.category}
                    </span>
                    <span className="text-xs text-[#94A3B8]">{formatDate(a.awardDate)} · {a.academicYear}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {a.position && (
                    <span className="flex items-center gap-1 text-sm font-bold text-[#F59E0B]">
                      <Medal size={16} /> {a.position}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;
