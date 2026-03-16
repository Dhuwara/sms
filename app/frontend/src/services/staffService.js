import api from '../utils/api';

export const fetchStaffClassesApi = () => api.get('/api/staff/classes').then(r => r.data);
export const fetchStaffApi = () => api.get('/api/staff').then(r => r.data);
export const fetchAdminStatsApi = () => api.get('/api/admin/stats').then(r => r.data);
