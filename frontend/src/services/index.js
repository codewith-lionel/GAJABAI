import api from './api';

// Auth services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me')
};

// Admin services
export const adminService = {
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  getProducts: () => api.get('/admin/products'),
  updateProductPricing: (id, data) => api.put(`/admin/products/${id}/pricing`, data),
  getBargainAnalytics: () => api.get('/admin/bargains/analytics')
};

// Seller services
export const sellerService = {
  getProducts: () => api.get('/seller/products'),
  createProduct: (data) => api.post('/seller/products', data),
  updateProduct: (id, data) => api.put(`/seller/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/seller/products/${id}`),
  getBargains: () => api.get('/seller/bargains'),
  acceptBargain: (id) => api.put(`/seller/bargains/${id}/accept`),
  rejectBargain: (id) => api.put(`/seller/bargains/${id}/reject`),
  counterBargain: (id, data) => api.put(`/seller/bargains/${id}/counter`, data)
};

// Buyer services
export const buyerService = {
  getProducts: () => api.get('/products'),
  getProduct: (id) => api.get(`/products/${id}`),
  createBargain: (data) => api.post('/bargains', data),
  getMyBargains: () => api.get('/bargains/my-bargains'),
  counterOffer: (id, data) => api.put(`/bargains/${id}/counter`, data),
  createOrder: (data) => api.post('/orders', data)
};
