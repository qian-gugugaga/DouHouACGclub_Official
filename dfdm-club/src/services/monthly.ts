import api from './api'

export const monthlyAPI = {
  getIssues: () => api.get('/monthly'),
  createIssue: (data: { title: string; publish_date: string; cover: string; content: string; images: string[] }) =>
    api.post('/monthly', data),
  updateIssue: (id: number, data: { title?: string; publish_date?: string; cover?: string; content?: string; images?: string[] }) =>
    api.put(`/monthly/${id}`, data),
  deleteIssue: (id: number) => api.delete(`/monthly/${id}`),
}
