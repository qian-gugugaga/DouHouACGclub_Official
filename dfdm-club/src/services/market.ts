import api from './api'

export const marketAPI = {
  getItems: () => api.get('/market'),
  getMyItems: () => api.get('/market/mine'),
  createItem: (data: { title: string; price: string; qq: string; tag: string; ip: string; images: string[]; text: string }) =>
    api.post('/market', data),
  deleteItem: (id: number) => api.delete(`/market/${id}`),
  getPending: () => api.get('/market/pending'),
  approve: (id: number) => api.put(`/market/${id}/approve`),
  reject: (id: number) => api.put(`/market/${id}/reject`),
}
