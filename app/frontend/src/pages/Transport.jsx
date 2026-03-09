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
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetchRoutes();
    fetchAssignments();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/api/transport/routes');
      setRoutes(response.data);
    } catch (error) {
      toast.error('Failed to load transport routes');
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await api.get('/api/transport/assignments');
      setAssignments(response.data || []);
    } catch (error) {
      console.error('Failed to load assignments:', error);
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
                {assignments.length > 0 ? assignments.map((assign, i) => (
                  <tr key={assign._id || i} className="hover:bg-[#FFFBEB]">
                    <td className="px-6 py-4 font-semibold text-[#0F172A]">{assign.studentId?.userId?.name || 'Student'}</td>
                    <td className="px-6 py-4"><span className="inline-flex px-3 py-1 bg-[#FEF3C7] text-[#92400E] rounded-full text-xs font-semibold">{assign.routeId?.routeNumber || assign.routeId?.route_number || '—'}</span></td>
                    <td className="px-6 py-4 text-sm text-[#64748B]">{assign.pickupPoint || '—'}</td>
                    <td className="px-6 py-4 text-sm">{assign.pickupTime || '—'}</td>
                    <td className="px-6 py-4 text-sm">{assign.dropTime || '—'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-[#64748B]">No assignments found.</td></tr>
                )}
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
                  {routes.length > 0 ? routes.map((route, i) => {
                    const routeAssignments = assignments.filter(a => a.routeId?._id === route._id);
                    return (
                    <tr key={route._id || i} className="hover:bg-[#FFFBEB]">
                      <td className="px-6 py-4 font-semibold text-[#0F172A]">{route.route_number || route.routeNumber}</td>
                      <td className="px-6 py-4 text-sm">{route.distance || '—'}</td>
                      <td className="px-6 py-4 font-semibold text-[#0F172A]">₹{route.fee || 0}</td>
                      <td className="px-6 py-4 text-sm">{routeAssignments.length}</td>
                      <td className="px-6 py-4 font-bold text-[#10B981]">₹{((route.fee || 0) * routeAssignments.length).toLocaleString()}</td>
                    </tr>
                    );
                  }) : (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-[#64748B]">No routes found.</td></tr>
                  )}
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