import api from './api'

export const authAPI = {
  register: (data: { username: string; password: string; confirmPassword: string; qq: string; phone: string }) =>
    api.post('/auth/register', data),
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data),
  resetPassword: (data: { username: string; phone: string; qq: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: { username?: string; avatar?: string }) =>
    api.put('/auth/profile', data),
  changePassword: (data: { qq: string; phone: string; newPassword: string }) =>
    api.put('/auth/security/password', data),
  changeQQ: (data: { oldQQ: string; newQQ: string }) =>
    api.put('/auth/security/qq', data),
  changePhone: (data: { oldPhone: string; newPhone: string }) =>
    api.put('/auth/security/phone', data),
  getProfile: (id: number) => api.get(`/auth/profile/${id}`),
  logout: () => api.post('/auth/logout'),
  getUsers: () => api.get('/auth/users'),
  searchUsers: (username: string) => api.get('/auth/users/search', { params: { username } }),
  setUserTitle: (id: number, title: string) => api.put(`/auth/users/${id}/title`, { title }),
}
