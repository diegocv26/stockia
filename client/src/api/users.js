import { api } from './client.js';

export const usersApi = {
  list: () => api.get('/users').then((r) => r.data.users),
  create: (body) => api.post('/users', body).then((r) => r.data.user),
  update: ({ id, ...body }) => api.patch(`/users/${id}`, body).then((r) => r.data.user),
};
