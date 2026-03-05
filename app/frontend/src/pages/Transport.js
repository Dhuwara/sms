import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Plus, Bus, Download, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const Transport = () => {
  const [routes, setRoutes] = useState([]);
  const [activeTab, setActiveTab] = useState('routes');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ route_number: '', driver: '' });
  const [loading, setLoading] = useState(false);

  const studentAssignments = [
    { student: 'Rahul Kumar', route: 'R-101', stop: 'Sector 5', pickup: '7:30 AM', drop: '3:00 PM' },
    { student: 'Priya Sharma', route: 'R-102', stop: 'Mall Road', pickup: '7:45 AM', drop: '3:15 PM' },
    { student: 'Amit Patel', route: 'R-103', stop: 'City Center', pickup: '8:00 AM', drop: '3:30 PM' },
    { student: 'Sneha Reddy', route: 'R-104', stop: 'Park Street', pickup: '7:40 AM', drop: '3:10 PM' },
    { student: 'Vikram Singh', route: 'R-105', stop: 'Station Road', pickup: '7:50 AM', drop: '3:20 PM' },
  ];

  const transportFees = [
    { route: 'R-101', distance: '5 km', monthly: 3000, students: 35 },
    { route: 'R-102', distance: '7 km', monthly: 3500, students: 30 },
    { route: 'R-103', distance: '10 km', monthly: 4000, students: 28 },
    { route: 'R-104', distance: '6 km', monthly: 3200, students: 32 },
    { route: 'R-105', distance: '8 km', monthly: 3800, students: 29 },
  ];

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/api/transport/routes');
      setRoutes(response.data);
    } catch (error) {
      toast.error('Failed to load transport routes');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/transport/routes', formData);
      toast.success('Route added successfully');
      setShowModal(false);
      setFormData({ route_number: '', driver: '' });
      fetchRoutes();
    } catch (error) {
      toast.error('Failed to add route');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#0F172A]">Transport Management</h1>
          <p className="text-[#64748B] mt-1">Routes, drivers, student assignments & fees</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#F59E0B] text-white hover:bg-[#D97706] px-6 py-3 rounded-lg font-semibold transition-all shadow-md">
          <Plus size={20} /> Add Route
        </button>
      </div>

      <div className="flex gap-2 border-b-2 border-[#FCD34D]">
        {['routes', 'assignments', 'fees'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-semibold transition-all capitalize ${activeTab === tab ? 'bg-[#FCD34D] text-[#0F172A] rounded-t-lg' : 'text-[#64748B] hover:text-[#0F172A]'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'routes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route, i) => (
            <div key={i} className="p-6 rounded-xl border-2 border-[#FCD34D] bg-white shadow-sm hover:shadow-lg transition-all">
              <Bus className="text-[#F59E0B] mb-3" size={32} />
              <h3 className="text-xl font-bold text-[#0F172A] mb-2">Route {route.route_number}</h3>
              <div className="space-y-2 text-sm">
                <p className="text-[#64748B]">Driver: {route.driver}</p>
                <p className="text-[#64748B]">Vehicle: {route.vehicle_no || 'DL-01-XX-1234'}</p>
                <span className="inline-flex px-3 py-1 bg-[#D1FAE5] text-[#065F46] rounded-full text-xs font-semibold">{route.capacity || 40} Seats</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
          <h2 className="text-2xl font-bold mb-4">Student-Bus Assignment</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Stop</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Pickup</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Drop</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {studentAssignments.map((assign, i) => (
                  <tr key={i} className="hover:bg-[#FFFBEB]">
                    <td className="px-6 py-4 font-semibold text-[#0F172A]">{assign.student}</td>
                    <td className="px-6 py-4"><span className="inline-flex px-3 py-1 bg-[#FEF3C7] text-[#92400E] rounded-full text-xs font-semibold">{assign.route}</span></td>
                    <td className="px-6 py-4 text-sm text-[#64748B]">{assign.stop}</td>
                    <td className="px-6 py-4 text-sm">{assign.pickup}</td>
                    <td className="px-6 py-4 text-sm">{assign.drop}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'fees' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Transport Fee Tracking</h2>
              <button onClick={() => toast.success('Transport report downloaded')} className="flex items-center gap-2 bg-[#10B981] text-white px-4 py-2 rounded-lg font-semibold">
                <Download size={18} /> Export Report
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Route</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Distance</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Monthly Fee</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Students</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A] uppercase">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transportFees.map((fee, i) => (
                    <tr key={i} className="hover:bg-[#FFFBEB]">
                      <td className="px-6 py-4 font-semibold text-[#0F172A]">{fee.route}</td>
                      <td className="px-6 py-4 text-sm">{fee.distance}</td>
                      <td className="px-6 py-4 font-semibold text-[#0F172A]">₹{fee.monthly}</td>
                      <td className="px-6 py-4 text-sm">{fee.students}</td>
                      <td className="px-6 py-4 font-bold text-[#10B981]">₹{(fee.monthly * fee.students).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-4">Add New Route</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Route Number (e.g., R-101)" required value={formData.route_number} onChange={(e) => setFormData({...formData, route_number: e.target.value})} className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg" />
              <input type="text" placeholder="Driver Name" required value={formData.driver} onChange={(e) => setFormData({...formData, driver: e.target.value})} className="w-full h-10 px-3 border-2 border-[#FCD34D] rounded-lg" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 h-10 rounded-lg font-semibold">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 bg-[#F59E0B] text-white h-10 rounded-lg font-semibold">Add Route</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transport;