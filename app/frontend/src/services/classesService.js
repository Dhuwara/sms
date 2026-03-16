import api from '../utils/api';

export const fetchClassesApi = () => api.get('/api/classes').then(r => r.data);
export const fetchTeachersApi = () => api.get('/api/teachers').then(r => r.data);
export const fetchSubjectsApi = () => api.get('/api/admin/subjects').then(r => r.data);
export const createClassApi = (data) => api.post('/api/classes', data).then(r => r.data);
export const updateClassApi = (id, data) => api.put(`/api/classes/${id}`, data).then(r => r.data);
export const deleteClassApi = (id) => api.delete(`/api/classes/${id}`).then(r => r.data);
