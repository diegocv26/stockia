import { api } from './client.js';

// create/update reciben FormData (multipart). Axios pone el boundary solo.
export const productsApi = {
  list: (params) => api.get('/products', { params }).then((r) => r.data), // { products, pagination }
  lowStock: (limit = 10) => api.get('/products/low-stock', { params: { limit } }).then((r) => r.data), // { products, total }
  get: (id) => api.get(`/products/${id}`).then((r) => r.data.product),
  create: (formData) => api.post('/products', formData).then((r) => r.data.product),
  update: (id, formData) => api.put(`/products/${id}`, formData).then((r) => r.data.product),
  remove: (id) => api.delete(`/products/${id}`).then(() => true),
  restore: (id) => api.patch(`/products/${id}/restore`).then((r) => r.data.product),
  adjustStock: (id, data) => api.post(`/products/${id}/adjust-stock`, data).then((r) => r.data.product),
};
