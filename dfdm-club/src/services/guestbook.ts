import api from './api'

export const guestbookAPI = {
  getMessages: () => api.get('/guestbook'),
  getMessage: (id: number) => api.get(`/guestbook/${id}`),
  postMessage: (data: { title?: string; text: string; parentId?: number; images?: string[] }) =>
    api.post('/guestbook', data),
  deleteMessage: (id: number) => api.delete(`/guestbook/${id}`),
  toggleLike: (id: number) => api.post(`/guestbook/${id}/like`),
}
