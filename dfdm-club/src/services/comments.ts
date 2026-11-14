import api from './api'

export const commentsAPI = {
  getComments: (targetType: string, targetId: number) =>
    api.get(`/comments/${targetType}/${targetId}`),
  postComment: (data: { targetType: string; targetId: number; text: string; parentId?: number }) =>
    api.post('/comments', data),
}
