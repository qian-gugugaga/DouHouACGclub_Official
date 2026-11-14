import api from './api'

export const adminAPI = {
  createMonthly: (data: { title: string; publish_date: string; cover: string; content: string; images: string[] }) =>
    api.post('/monthly', data),
  updateMonthly: (id: number, data: { title?: string; publish_date?: string; cover?: string; content?: string; images?: string[] }) =>
    api.put(`/monthly/${id}`, data),
  deleteMonthly: (id: number) => api.delete(`/monthly/${id}`),
  createActivity: (data: { title: string; event_date: string; description: string; status: string }) =>
    api.post('/activities', data),
  updateActivity: (id: number, data: { title?: string; event_date?: string; description?: string; status?: string }) =>
    api.put(`/activities/${id}`, data),
  deleteActivity: (id: number) => api.delete(`/activities/${id}`),
  createAnnouncement: (data: { content: string }) => api.post('/announcements', data),
  updateAnnouncement: (id: number, data: { content: string }) => api.put(`/announcements/${id}`, data),
  deleteAnnouncement: (id: number) => api.delete(`/announcements/${id}`),
  updateStats: (data: Record<string, number>) => api.put('/stats', data),
}
