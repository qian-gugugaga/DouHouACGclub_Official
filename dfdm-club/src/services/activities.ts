import api from './api'

export const activitiesAPI = {
  getActivities: () => api.get('/activities'),
  getActivity: (id: number) => api.get(`/activities/${id}`),
  createActivity: (data: { title: string; event_date: string; description: string; status: string }) =>
    api.post('/activities', data),
  updateActivity: (id: number, data: { title?: string; event_date?: string; description?: string; status?: string }) =>
    api.put(`/activities/${id}`, data),
  deleteActivity: (id: number) => api.delete(`/activities/${id}`),
}
