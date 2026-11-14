import api from './api'

export const statsAPI = {
  getStats: () => api.get('/stats'),
  updateStats: (data: Record<string, number>) => api.put('/stats', data),
}
