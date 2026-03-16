import api from '../utils/api';

export const fetchPTMsApi = () => api.get('/api/ptm').then(r => r.data);
export const createPTMApi = (data) => api.post('/api/ptm', data).then(r => r.data);
export const deletePTMApi = (id) => api.delete(`/api/ptm/${id}`).then(r => r.data);
export const fetchAnnouncementsApi = (audience = '') =>
  api.get(`/api/communication/announcements${audience ? `?audience=${audience}` : ''}`).then(r => r.data);
export const fetchSchoolEventsApi = () =>
  api.get('/api/school-events/user-events').then(r => r.data);
export const sendEmailApi = (payload) =>
  api.post('/api/communication/send-email', payload).then(r => r.data);
