import React from 'react';

const Requests = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F172A]">Requests & Approvals</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Leave Request for Child</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">From Date</label>
                <input type="date" className="w-full border-2 border-[#FCD34D] rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">To Date</label>
                <input type="date" className="w-full border-2 border-[#FCD34D] rounded-lg px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reason</label>
              <textarea className="w-full border-2 border-[#FCD34D] rounded-lg px-3 py-2 h-20" placeholder="Enter reason..."></textarea>
            </div>
            <button className="w-full bg-[#4F46E5] text-white py-2 rounded-lg font-semibold">Submit Request</button>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Certificate Requests</h3>
          <div className="space-y-3">
            <select className="w-full border-2 border-[#FCD34D] rounded-lg px-4 py-2">
              <option>Select Certificate Type</option>
              <option>Bonafide Certificate</option>
              <option>Character Certificate</option>
              <option>Study Certificate</option>
              <option>Transfer Certificate</option>
            </select>
            <div>
              <label className="block text-sm font-medium mb-1">Purpose</label>
              <input type="text" className="w-full border-2 border-[#FCD34D] rounded-lg px-3 py-2" placeholder="e.g., Scholarship application" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Required By</label>
              <input type="date" className="w-full border-2 border-[#FCD34D] rounded-lg px-3 py-2" />
            </div>
            <button className="w-full bg-[#10B981] text-white py-2 rounded-lg font-semibold">Request Certificate</button>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h3 className="font-bold mb-4">Transport / Facility Requests</h3>
          <div className="space-y-3">
            <select className="w-full border-2 border-[#FCD34D] rounded-lg px-4 py-2">
              <option>Select Request Type</option>
              <option>Change Bus Route</option>
              <option>Add Transport Service</option>
              <option>Cancel Transport Service</option>
              <option>Facility Request</option>
            </select>
            <div>
              <label className="block text-sm font-medium mb-1">Details</label>
              <textarea className="w-full border-2 border-[#FCD34D] rounded-lg px-3 py-2 h-20" placeholder="Provide details..."></textarea>
            </div>
            <button className="w-full bg-[#F59E0B] text-white py-2 rounded-lg font-semibold">Submit Request</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h3 className="font-bold mb-4">Request History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-linear-to-r from-[#FEF3C7] to-[#FEE2E2]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-sm">Request ID</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Type</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Submitted</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Status</th>
                <th className="px-4 py-3 text-left font-bold text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'REQ-2024-025', type: 'Leave Request', date: 'Dec 20', status: 'Approved' },
                { id: 'REQ-2024-024', type: 'Bonafide Certificate', date: 'Dec 15', status: 'Ready' },
                { id: 'REQ-2024-023', type: 'Bus Route Change', date: 'Dec 10', status: 'Processing' },
              ].map((req, idx) => (
                <tr key={idx} className="border-b border-[#E2E8F0]">
                  <td className="px-4 py-3 text-sm font-semibold">{req.id}</td>
                  <td className="px-4 py-3 text-sm">{req.type}</td>
                  <td className="px-4 py-3 text-sm">{req.date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${req.status === 'Approved' ? 'bg-[#D1FAE5] text-[#065F46]' :
                      req.status === 'Ready' ? 'bg-[#DBEAFE] text-[#1E40AF]' :
                        'bg-[#FEF3C7] text-[#92400E]'
                      }`}>{req.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {req.status === 'Ready' && <button className="text-xs bg-[#4F46E5] text-white px-3 py-1 rounded font-semibold">Download</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Requests;
