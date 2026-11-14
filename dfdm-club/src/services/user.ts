import api from './api'

export const userAPI = {
  getProfile: (id: number) => api.get(`/auth/profile/${id}`),
  getUsers: () => api.get('/auth/users'),
  searchUsers: (username: string) => api.get('/auth/users/search', { params: { username } }),
  setUserTitle: (id: number, title: string) => api.put(`/auth/users/${id}/title`, { title }),
}
