import api from './api'

export const uploadAPI = {
  uploadImages: (images: string[]) => api.post('/upload', { images }),
}
