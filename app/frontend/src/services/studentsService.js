import api from '../utils/api';

export const fetchStudentsApi = (params = '') =>
  api.get(`/api/students${params}`).then(r => r.data);
