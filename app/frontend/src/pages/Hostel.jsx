import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Plus, Building } from 'lucide-react';
import { toast } from 'sonner';

const Hostel = () => {
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    room_no: '',
    capacity: 2,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get('/api/hostel/rooms');
      setRooms(response.data);
    } catch (error) {
      toast.error('Failed to load hostel rooms');
    }
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