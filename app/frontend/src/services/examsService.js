import api from '../utils/api';

export const fetchExamsApi = (params = '') =>
  api.get(`/api/exams${params}`).then(r => r.data);
export const createExamApi = (data) => api.post('/api/exams', data).then(r => r.data);
export const updateExamApi = (id, data) => api.put(`/api/exams/${id}`, data).then(r => r.data);
export const deleteExamApi = (id) => api.delete(`/api/exams/${id}`).then(r => r.data);
export const fetchExamResultsApi = (examId) =>
  api.get(`/api/exams/${examId}/results`).then(r => r.data);
export const saveMarksApi = (examId, records) =>
  api.post(`/api/exams/${examId}/results/bulk`, { records }).then(r => r.data);
export const fetchClassSubjectsApi = (classId) =>
  api.get(`/api/exams/class-subjects/${classId}`).then(r => r.data);
