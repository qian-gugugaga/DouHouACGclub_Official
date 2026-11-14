import api from './api'

export const fanworksAPI = {
  getWorks: () => api.get('/fanworks'),
  getMyWorks: () => api.get('/fanworks/mine'),
  submitWork: (data: { tag1: string; tag2: string; cn?: string; images: string[]; text: string }) =>
    api.post('/fanworks', data),
  deleteWork: (id: number) => api.delete(`/fanworks/${id}`),
  getPending: () => api.get('/fanworks/pending'),
  approve: (id: number) => api.put(`/fanworks/${id}/approve`),
  reject: (id: number) => api.put(`/fanworks/${id}/reject`),
}
