import React, { useEffect, useState } from 'react';
import api from '@/utils/api';
import { Plus, Building } from 'lucide-react';
import { toast } from 'sonner';

const Hostel = () => {
  const [rooms, setRooms] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [activeTab, setActiveTab] = useState('rooms');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    room_no: '',
    capacity: 2,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRooms();
    fetchAllocations();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get('/api/hostel/rooms');
      setRooms(response.data);
    } catch (error) {
      toast.error('Failed to load hostel rooms');
    }
  };

  const fetchAllocations = async () => {
    try {
      const response = await api.get('/api/hostel/allocations');
      setAllocations(response.data || []);
    } catch (error) {
      console.error('Failed to load allocations:', error);
    }
  };

  const handleVacate = async (allocationId) => {
    try {
      await api.delete(`/api/hostel/allocations/${allocationId}`);
      toast.success('Student vacated successfully');
      fetchAllocations();
      fetchRooms();
    } catch (error) {
      toast.error('Failed to vacate student');
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/hostel/rooms', formData);
      toast.success('Room added successfully');
      setShowModal(false);
      setFormData({ room_no: '', capacity: 2 });
      fetchRooms();
    } catch (error) {
      toast.error('Failed to add room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-semibold text-[#0F172A]">Hostel</h1>
          <p className="text-[#64748B] mt-1">Manage hostel rooms and capacity</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          data-testid="add-room-button"
          className="flex items-center gap-2 bg-[#4F46E5] text-white hover:bg-[#4338CA] h-10 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Add Room
        </button>
      </div>

      <div className="flex gap-2 border-b-2 border-[#FCD34D]">
        {['rooms', 'allocations'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-semibold transition-all capitalize ${activeTab === tab ? 'bg-[#FCD34D] text-[#0F172A] rounded-t-lg' : 'text-[#64748B] hover:text-[#0F172A]'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'rooms' && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {rooms.length === 0 ? (
          <div className="col-span-full text-center py-12 text-[#64748B]">
            No hostel rooms found. Add your first room!
          </div>
        ) : (
          rooms.map((room, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-[#10B981]/10">
                  <Building size={24} className="text-[#10B981]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#0F172A] mb-1">Room {room.room_no}</h3>
                  <p className="text-sm text-[#64748B]">Capacity: {room.capacity}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      )}

      {activeTab === 'allocations' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-2xl font-semibold text-[#0F172A] mb-4">Student Allocations</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Check-in</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allocations.length > 0 ? allocations.map((alloc, i) => (
                  <tr key={alloc._id || i} className="hover:bg-[#F8FAFC]">
                    <td className="px-6 py-4 font-semibold text-[#0F172A]">{alloc.studentId?.userId?.name || 'Student'}</td>
                    <td className="px-6 py-4 text-sm">Room {alloc.roomId?.roomNumber || alloc.roomId?.room_no || '—'}</td>
                    <td className="px-6 py-4 text-sm text-[#64748B]">{formatDate(alloc.checkInDate)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${alloc.status === 'active' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#E2E8F0] text-[#64748B]'}`}>{alloc.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      {alloc.status === 'active' && (
                        <button onClick={() => handleVacate(alloc._id)} className="text-xs bg-[#DC2626] text-white px-3 py-1 rounded font-semibold">Vacate</button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-[#64748B]">No allocations found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-semibold text-[#0F172A] mb-4">Add New Room</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Room Number</label>
                <input
                  type="text"
                  required
                  value={formData.room_no}
                  onChange={(e) => setFormData({ ...formData, room_no: e.target.value })}
                  placeholder="e.g., 101"
                  className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Capacity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 h-10 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#4F46E5] text-white hover:bg-[#4338CA] h-10 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hostel;