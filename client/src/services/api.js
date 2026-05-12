import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance (⚠️ no global Content-Type here)
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Small helper to check FormData
const isFormData = (data) =>
  typeof FormData !== 'undefined' && data instanceof FormData;

// Auth API
export const authAPI = {
  // ✅ Sends multipart only when data is FormData (for profile photo upload)
  register: (data) =>
    api.post('/auth/register', data, {
      headers: isFormData(data) ? { 'Content-Type': 'multipart/form-data' } : {},
    }),

  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: () => api.post('/auth/resend-otp'),
  
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),

  
  updateProfile: (data) =>
    api.put('/auth/profile', data, {
      headers: isFormData(data) ? { 'Content-Type': 'multipart/form-data' } : {},
    }),

  changePassword: (data) => api.put('/auth/change-password', data),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  updateStock: (id, data) => api.patch(`/products/${id}/stock`, data),
  getLowStock: (threshold) =>
    api.get('/products/alerts/low-stock', { params: { threshold } }),
};

// Cart API
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart', data),
  updateItem: (productId, data) =>
    api.patch(`/cart/items/${productId}`, data),
  removeItem: (productId) => api.delete(`/cart/items/${productId}`),
  clear: () => api.delete('/cart'),
};

// Orders API
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getMy: (params) => api.get('/orders/my', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.patch(`/orders/${id}/cancel`),
  getAll: (params) => api.get('/orders/all/list', { params }),
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
  updateAddress: (id, data) => api.patch(`/orders/${id}/address`, data),
  downloadPDF: (orderId) =>
    api.get(`/orders/${orderId}/pdf`, { responseType: 'blob' }),
  delete: (id) => api.delete(`/orders/${id}`), // ⬅️ ADDED
};

// Appointments API
export const appointmentsAPI = {
  create: (data) => api.post('/appointments', data),
  getMy: (params) => api.get('/appointments/my', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  update: (id, data) => api.patch(`/appointments/${id}`, data),
  cancel: (id) => api.patch(`/appointments/${id}/cancel`),
  getAll: (params) => api.get('/appointments/all/list', { params }),
  updateStatus: (id, data) => api.patch(`/appointments/${id}/status`, data),
  downloadReport: (params) =>
    api.get('/appointments/report/pdf', {
      params,
      responseType: 'blob',
    }),
  delete: (id) => api.delete(`/appointments/${id}`), // ⬅️ ADDED
};

// Wishlist API
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist', { productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
  check: (productId) => api.get(`/wishlist/check/${productId}`),
};

// Admin API
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  createStaff: (data) => api.post('/admin/staff', data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateUserRole: (id, role) =>
    api.patch(`/admin/users/${id}/role`, { role }),
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getRevenueTrend: (period) =>
    api.get('/admin/dashboard/revenue-trend', { params: { period } }),
  getOrderDistribution: () => api.get('/admin/dashboard/order-distribution'),
  getTopProducts: (limit) =>
    api.get('/admin/dashboard/top-products', { params: { limit } }),
  getDiscounts: () => api.get('/admin/discounts'),
  createDiscount: (data) => api.post('/admin/discounts', data),
  createBulkDiscount: (data) => api.post('/admin/discounts/bulk', data),
  updateDiscount: (id, data) => api.put(`/admin/discounts/${id}`, data),
  deleteDiscount: (id) => api.delete(`/admin/discounts/${id}`),
  downloadSummaryReport: () =>
    api.get('/admin/report/summary/pdf', { responseType: 'blob' }),
};

// Staff API
export const staffAPI = {
  getDashboardStats: () => api.get('/staff/dashboard/stats'),
};

export async function adminListContactMessages({ page = 1, limit = 20, q = '' } = {}) {
  const params = new URLSearchParams({ page, limit, q });
  const res = await fetch(`/api/contact?${params.toString()}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok || !data?.success) {
    throw new Error(data?.message || 'Failed to fetch contact messages');
  }
  return data;
}

// Contact API
export const contactAPI = {
  // Admin list (GET /api/contact?page=&limit=&q=)
  getAll: ({ page = 1, limit = 20, q = '' } = {}) =>
    api.get('/contact', { params: { page, limit, q } }),

  // (Optional) Public submit if you wire the form to backend:
  // create: (payload) => api.post('/contact', payload),
};

export default api;