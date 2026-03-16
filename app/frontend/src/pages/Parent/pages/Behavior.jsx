import React from 'react';
import { Star, Award, AlertCircle, Shield, CheckCircle } from 'lucide-react';

const Behavior = ({ selectedChild, childSelector }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Behavior & Discipline</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-[#D1FAE5] rounded-xl border-2 border-[#10B981]">
          <Star className="text-[#10B981] mb-2" size={32} />
          <p className="text-sm text-[#64748B]">Behavior Rating</p>
          <p className="text-2xl font-bold text-[#065F46]">Excellent</p>
        </div>
        <div className="p-6 bg-[#DBEAFE] rounded-xl border-2 border-[#3B82F6]">
          <Award className="text-[#3B82F6] mb-2" size={32} />
          <p className="text-sm text-[#64748B]">Positive Remarks</p>
          <p className="text-2xl font-bold text-[#1E40AF]">12</p>
        </div>
        <div className="p-6 bg-[#FEF3C7] rounded-xl border-2 border-[#F59E0B]">
          <AlertCircle className="text-[#F59E0B] mb-2" size={32} />
          <p className="text-sm text-[#64748B]">Areas for Improvement</p>
          <p className="text-2xl font-bold text-[#92400E]">2</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Star className="text-[#10B981]" size={20} />
          Teacher Remarks
        </h3>
        <div className="space-y-4">
          {[
            { teacher: 'Mr. Sharma (Mathematics)', remark: 'Shows excellent problem-solving skills. Always completes homework on time.', date: 'Dec 20, 2024', type: 'positive' },
            { teacher: 'Ms. Verma (English)', remark: 'Active participation in class discussions. Great improvement in writing skills.', date: 'Dec 18, 2024', type: 'positive' },
            { teacher: 'Mrs. Gupta (Science)', remark: 'Good in practical work. Needs to focus more on theory part.', date: 'Dec 15, 2024', type: 'neutral' },
            { teacher: 'Mrs. Sunita (Class Teacher)', remark: 'Helpful to classmates. Takes leadership in group activities.', date: 'Dec 10, 2024', type: 'positive' },
          ].map((item, idx) => (
            <div key={idx} className={`p-4 rounded-lg border-l-4 ${item.type === 'positive' ? 'bg-[#F0FDF4] border-[#10B981]' : 'bg-[#FEF3C7] border-[#F59E0B]'
              }`}>
              <div className="flex justify-between items-start">
                <p className="font-semibold">{item.teacher}</p>
                <span className="text-xs text-[#64748B]">{item.date}</span>
              </div>
              <p className="text-sm text-[#64748B] mt-2">"{item.remark}"</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Behavior Reports</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-linear-to-r from-[#D1FAE5] to-[#DBEAFE]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Category</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Rating</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Teacher Comment</th>
              </tr>
            </thead>
            <tbody>
              {[
                { category: 'Punctuality', rating: 'Excellent', comment: 'Always on time' },
                { category: 'Class Participation', rating: 'Very Good', comment: 'Actively participates in discussions' },
                { category: 'Homework Completion', rating: 'Excellent', comment: 'Consistently completes all assignments' },
                { category: 'Respect for Others', rating: 'Excellent', comment: 'Very respectful to teachers and peers' },
                { category: 'Teamwork', rating: 'Very Good', comment: 'Good team player, helps classmates' },
              ].map((item, idx) => (
                <tr key={idx} className="border-b border-[#E2E8F0]">
                  <td className="px-4 py-3 text-sm font-semibold">{item.category}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.rating === 'Excellent' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#DBEAFE] text-[#1E40AF]'
                      }`}>{item.rating}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{item.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#10B981] p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Shield className="text-[#10B981]" size={20} />
          Discipline Notices
        </h3>
        <div className="p-4 bg-[#D1FAE5] rounded-lg text-center">
          <CheckCircle className="text-[#10B981] mx-auto mb-2" size={32} />
          <p className="font-semibold text-[#065F46]">No Discipline Issues</p>
          <p className="text-sm text-[#64748B]">Your child has maintained excellent discipline throughout the year.</p>
        </div>
      </div>
    </div>
  );
};

export default Behavior;
