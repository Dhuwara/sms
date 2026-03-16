import React from 'react';
import { FileQuestion } from 'lucide-react';

const Requests = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Requests & Forms</h2>
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-12 text-center text-[#64748B]">
        <FileQuestion className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-lg font-medium">Requests module coming soon</p>
        <p className="text-sm mt-1">You will be able to request certificates, documents, and more</p>
      </div>
    </div>
  );
};

export default Requests;
