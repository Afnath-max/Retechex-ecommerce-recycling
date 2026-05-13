import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_BASE_URL = API_URL.replace(/\/api\/?$/, '');
const PRODUCTS_CACHE_TTL = 45 * 1000;
const PRODUCTS_STALE_TTL = 5 * 60 * 1000;
const PRIVATE_CACHE_TTL = 30 * 1000;
const PRIVATE_STALE_TTL = 2 * 60 * 1000;
const productsMemoryCache = new Map();
const privateMemoryCache = new Map();
let backendWarmupPromise = null;

// Create axios instance (⚠️ no global Content-Type here)
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

const getProductsCacheKey = (params = {}) =>
  JSON.stringify(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .sort(([a], [b]) => a.localeCompare(b))
  );

const readProductsCache = (params = {}, { allowStale = false } = {}) => {
  const key = getProductsCacheKey(params);
  const maxAge = allowStale ? PRODUCTS_STALE_TTL : PRODUCTS_CACHE_TTL;
  const cached = productsMemoryCache.get(key);
  if (cached && Date.now() - cached.timestamp < maxAge) {
    return cached.data;
  }

  try {
    const raw =
      sessionStorage.getItem(`products:${key}`) ||
      localStorage.getItem(`products:${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp >= maxAge) return null;
    productsMemoryCache.set(key, parsed);
    return parsed.data;
  } catch {
    return null;
  }
};

const writeProductsCache = (params = {}, data) => {
  const key = getProductsCacheKey(params);
  const cacheableData = {
    data: data.data,
    status: data.status,
    statusText: data.statusText,
  };
  const value = { timestamp: Date.now(), data: cacheableData };
  productsMemoryCache.set(key, value);

  try {
    sessionStorage.setItem(`products:${key}`, JSON.stringify(value));
    localStorage.setItem(`products:${key}`, JSON.stringify(value));
  } catch {
    // Storage may be unavailable in private modes; memory cache still helps.
  }
};

const clearProductsCache = () => {
  productsMemoryCache.clear();
  try {
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith('products:'))
      .forEach((key) => sessionStorage.removeItem(key));
    Object.keys(localStorage)
      .filter((key) => key.startsWith('products:'))
      .forEach((key) => localStorage.removeItem(key));
  } catch {}
};

const getCacheScope = () => {
  try {
    const token = localStorage.getItem('token') || 'guest';
    let hash = 0;
    for (let index = 0; index < token.length; index += 1) {
      hash = (hash << 5) - hash + token.charCodeAt(index);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  } catch {
    return 'guest';
  }
};

const getPrivateCacheKey = (url, params = {}) =>
  JSON.stringify({
    scope: getCacheScope(),
    url,
    params: Object.entries(params || {})
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .sort(([a], [b]) => a.localeCompare(b)),
  });

const readPrivateCache = (url, params = {}, { allowStale = false } = {}) => {
  const key = getPrivateCacheKey(url, params);
  const maxAge = allowStale ? PRIVATE_STALE_TTL : PRIVATE_CACHE_TTL;
  const cached = privateMemoryCache.get(key);
  if (cached && Date.now() - cached.timestamp < maxAge) return cached.data;

  try {
    const raw = sessionStorage.getItem(`private:${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp >= maxAge) return null;
    privateMemoryCache.set(key, parsed);
    return parsed.data;
  } catch {
    return null;
  }
};

const writePrivateCache = (url, params = {}, response) => {
  const key = getPrivateCacheKey(url, params);
  const value = {
    timestamp: Date.now(),
    data: {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    },
  };
  privateMemoryCache.set(key, value);

  try {
    sessionStorage.setItem(`private:${key}`, JSON.stringify(value));
  } catch {}
};

export const clearPrivateCache = () => {
  privateMemoryCache.clear();
  try {
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith('private:'))
      .forEach((key) => sessionStorage.removeItem(key));
  } catch {}
};

const networkCachedGet = async (url, config = {}) => {
  const params = config.params || {};
  const response = await api.get(url, config);
  writePrivateCache(url, params, response);
  return response;
};

const cachedGet = (url, config = {}) => {
  const params = config.params || {};
  const cached = readPrivateCache(url, params);
  if (cached) return Promise.resolve(cached);

  const stale = readPrivateCache(url, params, { allowStale: true });
  if (stale) {
    networkCachedGet(url, config).catch(() => null);
    return Promise.resolve(stale);
  }

  return networkCachedGet(url, config);
};

const networkProductsRequest = async (params = {}) => {
  const response = await api.get('/products', { params });
  writeProductsCache(params, response);
  return response;
};

const normalizeOrderParams = (params = {}) => {
  if (!params?.orderStatus || params.status) return params;
  const { orderStatus, ...rest } = params;
  return { ...rest, status: orderStatus };
};

const scheduleIdle = (task) => {
  if (typeof window === 'undefined') return;
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(task, { timeout: 2500 });
  } else {
    window.setTimeout(task, 800);
  }
};

export const warmBackend = () => {
  if (backendWarmupPromise) return backendWarmupPromise;

  backendWarmupPromise = fetch(`${API_BASE_URL}/health`, {
    method: 'GET',
    cache: 'no-store',
  }).catch(() => null);

  return backendWarmupPromise;
};

export const prefetchProducts = (params = {}) => {
  if (readProductsCache(params)) return Promise.resolve();
  return networkProductsRequest(params).catch(() => null);
};

export const warmPublicData = () => {
  warmBackend();
  scheduleIdle(() => {
    prefetchProducts();
  });
};

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
      clearPrivateCache();
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
  getMe: () => cachedGet('/auth/me'),
  
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: () => api.post('/auth/resend-otp'),
  
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),

  
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data, {
      headers: isFormData(data) ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    clearPrivateCache();
    return response;
  },

  changePassword: (data) => api.put('/auth/change-password', data),
};

// Products API
export const productsAPI = {
  getAll: async (params = {}) => {
    const cached = readProductsCache(params);
    if (cached) return cached;

    const stale = readProductsCache(params, { allowStale: true });
    if (stale) {
      networkProductsRequest(params).catch(() => null);
      return stale;
    }

    return networkProductsRequest(params);
  },
  getById: (id) => cachedGet(`/products/${id}`),
  create: async (data) => {
    const response = await api.post('/products', data);
    clearProductsCache();
    clearPrivateCache();
    return response;
  },
  update: async (id, data) => {
    const response = await api.put(`/products/${id}`, data);
    clearProductsCache();
    clearPrivateCache();
    return response;
  },
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    clearProductsCache();
    clearPrivateCache();
    return response;
  },
  updateStock: async (id, data) => {
    const response = await api.patch(`/products/${id}/stock`, data);
    clearProductsCache();
    clearPrivateCache();
    return response;
  },
  getLowStock: (threshold) =>
    cachedGet('/products/alerts/low-stock', { params: { threshold } }),
};

// Cart API
export const cartAPI = {
  get: () => cachedGet('/cart'),
  add: async (data) => {
    const response = await api.post('/cart', data);
    clearPrivateCache();
    return response;
  },
  updateItem: async (productId, data) => {
    const response = await api.patch(`/cart/items/${productId}`, data);
    clearPrivateCache();
    return response;
  },
  removeItem: async (productId) => {
    const response = await api.delete(`/cart/items/${productId}`);
    clearPrivateCache();
    return response;
  },
  clear: async () => {
    const response = await api.delete('/cart');
    clearPrivateCache();
    return response;
  },
};

// Orders API
export const ordersAPI = {
  create: async (data) => {
    const response = await api.post('/orders', data);
    clearPrivateCache();
    return response;
  },
  getMy: (params) => cachedGet('/orders/my', { params }),
  getById: (id) => cachedGet(`/orders/${id}`),
  cancel: async (id) => {
    const response = await api.patch(`/orders/${id}/cancel`);
    clearPrivateCache();
    return response;
  },
  getAll: (params) => cachedGet('/orders/all/list', { params: normalizeOrderParams(params) }),
  updateStatus: async (id, data) => {
    const response = await api.patch(`/orders/${id}/status`, data);
    clearPrivateCache();
    return response;
  },
  updateAddress: async (id, data) => {
    const response = await api.patch(`/orders/${id}/address`, data);
    clearPrivateCache();
    return response;
  },
  downloadPDF: (orderId) =>
    api.get(`/orders/${orderId}/pdf`, { responseType: 'blob' }),
  delete: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    clearPrivateCache();
    return response;
  }, // ⬅️ ADDED
};

// Appointments API
export const appointmentsAPI = {
  create: async (data) => {
    const response = await api.post('/appointments', data);
    clearPrivateCache();
    return response;
  },
  getMy: (params) => cachedGet('/appointments/my', { params }),
  getById: (id) => cachedGet(`/appointments/${id}`),
  update: async (id, data) => {
    const response = await api.patch(`/appointments/${id}`, data);
    clearPrivateCache();
    return response;
  },
  cancel: async (id) => {
    const response = await api.patch(`/appointments/${id}/cancel`);
    clearPrivateCache();
    return response;
  },
  getAll: (params) => cachedGet('/appointments/all/list', { params }),
  updateStatus: async (id, data) => {
    const response = await api.patch(`/appointments/${id}/status`, data);
    clearPrivateCache();
    return response;
  },
  downloadReport: (params) =>
    api.get('/appointments/report/pdf', {
      params,
      responseType: 'blob',
    }),
  delete: async (id) => {
    const response = await api.delete(`/appointments/${id}`);
    clearPrivateCache();
    return response;
  }, // ⬅️ ADDED
};

// Wishlist API
export const wishlistAPI = {
  get: () => cachedGet('/wishlist'),
  add: async (productId) => {
    const response = await api.post('/wishlist', { productId });
    clearPrivateCache();
    return response;
  },
  remove: async (productId) => {
    const response = await api.delete(`/wishlist/${productId}`);
    clearPrivateCache();
    return response;
  },
  check: (productId) => cachedGet(`/wishlist/check/${productId}`),
};

// Admin API
export const adminAPI = {
  getUsers: (params) => cachedGet('/admin/users', { params }),
  createStaff: async (data) => {
    const response = await api.post('/admin/staff', data);
    clearPrivateCache();
    return response;
  },
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    clearPrivateCache();
    return response;
  },
  updateUserRole: async (id, role) => {
    const response = await api.patch(`/admin/users/${id}/role`, { role });
    clearPrivateCache();
    return response;
  },
  getDashboardStats: () => cachedGet('/admin/dashboard/stats'),
  getRevenueTrend: (period) =>
    cachedGet('/admin/dashboard/revenue-trend', { params: { period } }),
  getOrderDistribution: () => cachedGet('/admin/dashboard/order-distribution'),
  getTopProducts: (limit) =>
    cachedGet('/admin/dashboard/top-products', { params: { limit } }),
  getDiscounts: () => cachedGet('/admin/discounts'),
  createDiscount: async (data) => {
    const response = await api.post('/admin/discounts', data);
    clearPrivateCache();
    return response;
  },
  createBulkDiscount: async (data) => {
    const response = await api.post('/admin/discounts/bulk', data);
    clearPrivateCache();
    return response;
  },
  updateDiscount: async (id, data) => {
    const response = await api.put(`/admin/discounts/${id}`, data);
    clearPrivateCache();
    return response;
  },
  deleteDiscount: async (id) => {
    const response = await api.delete(`/admin/discounts/${id}`);
    clearPrivateCache();
    return response;
  },
  downloadSummaryReport: () =>
    api.get('/admin/report/summary/pdf', { responseType: 'blob' }),
};

// Staff API
export const staffAPI = {
  getDashboardStats: () => cachedGet('/staff/dashboard/stats'),
};

export async function adminListContactMessages({ page = 1, limit = 20, q = '' } = {}) {
  const response = await cachedGet('/contact', { params: { page, limit, q } });
  return response.data;
}

// Contact API
export const contactAPI = {
  // Admin list (GET /api/contact?page=&limit=&q=)
  getAll: ({ page = 1, limit = 20, q = '' } = {}) =>
    cachedGet('/contact', { params: { page, limit, q } }),

  create: async (payload) => {
    const response = await api.post('/contact', payload);
    clearPrivateCache();
    return response;
  },
};

export default api;
