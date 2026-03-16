import React from 'react';
import { FileText, Book, Bell, Award, Download } from 'lucide-react';

const Documents = ({ documents, formatDate, formatFileSize, handleDownloadDocument }) => {
  const categoryMap = {
    policy: { title: 'School Policies', icon: FileText, color: '#4F46E5' },
    handbook: { title: 'Staff Handbook', icon: Book, color: '#10B981' },
    circular: { title: 'Circulars & Notices', icon: Bell, color: '#F59E0B' },
    training: { title: 'Training Materials', icon: Award, color: '#7C3AED' },
  };
  const categoryCounts = {};
  for (const key of Object.keys(categoryMap)) {
    categoryCounts[key] = documents.filter(d => d.category === key).length;
  }
  const generalDocs = documents.filter(d => !['policy', 'handbook', 'circular', 'training'].includes(d.category));
  if (generalDocs.length > 0) categoryCounts.general = generalDocs.length;

  const policies = documents.filter(d => d.category === 'policy');
  const handbooks = documents.filter(d => d.category === 'handbook');
  const circulars = documents.filter(d => d.category === 'circular');
  const training = documents.filter(d => d.category === 'training');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Documents & Resources</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(categoryMap).map(([key, item], idx) => (
          <div key={idx} className="p-4 bg-white rounded-xl border-2 border-[#FCD34D] hover:shadow-md transition-shadow cursor-pointer">
            <item.icon className="mb-3" style={{ color: item.color }} size={28} />
            <h3 className="font-bold">{item.title}</h3>
            <p className="text-sm text-[#64748B]">{categoryCounts[key] || 0} Documents</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">School Policies</h3>
        <div className="space-y-3">
          {policies.length > 0 ? policies.map((doc, idx) => (
            <div key={doc._id || idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center hover:bg-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                  <FileText className="text-[#4F46E5]" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{doc.title}</p>
                  <p className="text-xs text-[#64748B]">{formatDate(doc.createdAt)} • {formatFileSize(doc.size)}</p>
                </div>
              </div>
              <button onClick={() => handleDownloadDocument(doc)} className="text-[#4F46E5] hover:bg-[#EEF2FF] p-2 rounded-lg transition-colors">
                <Download size={18} />
              </button>
            </div>
          )) : (
            <p className="text-center text-[#64748B] py-4">No policy documents found.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Staff Handbook</h3>
        {handbooks.length > 0 ? (
          <div className="p-6 bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2] rounded-lg text-center">
            <Book className="mx-auto text-[#F59E0B] mb-3" size={48} />
            <h4 className="font-bold text-lg mb-2">{handbooks[0].title}</h4>
            <p className="text-sm text-[#64748B] mb-4">{handbooks[0].description || 'Complete guide for all staff members including policies, procedures, and guidelines.'}</p>
            <button onClick={() => handleDownloadDocument(handbooks[0])} className="bg-[#4F46E5] text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 mx-auto">
              <Download size={18} /> Download Handbook
            </button>
          </div>
        ) : (
          <p className="text-center text-[#64748B] py-4">No handbook uploaded yet.</p>
        )}
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Recent Circulars & Notices</h3>
        <div className="space-y-3">
          {circulars.length > 0 ? circulars.map((item, idx) => (
            <div key={item._id || idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-xs text-[#64748B]">{formatDate(item.createdAt)}</p>
              </div>
              <button onClick={() => handleDownloadDocument(item)} className="text-[#4F46E5] hover:bg-[#EEF2FF] p-2 rounded-lg transition-colors">
                <Download size={18} />
              </button>
            </div>
          )) : (
            <p className="text-center text-[#64748B] py-4">No circulars found.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Training Materials</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {training.length > 0 ? training.map((material, idx) => (
            <div key={material._id || idx} className="p-4 border-2 border-[#E2E8F0] rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#EDE9FE]">
                <FileText className="text-[#7C3AED]" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{material.title}</p>
                <p className="text-xs text-[#64748B]">{formatFileSize(material.size)} • {formatDate(material.createdAt)}</p>
              </div>
              <button onClick={() => handleDownloadDocument(material)} className="text-[#4F46E5] hover:bg-[#EEF2FF] p-2 rounded-lg transition-colors">
                <Download size={18} />
              </button>
            </div>
          )) : (
            <p className="text-center text-[#64748B] py-4 col-span-2">No training materials found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;
