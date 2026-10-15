import axios from 'axios';

export const AUTH_KEY = 'fd_auth';

export function getStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
  } catch {
    return null;
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000,
});

// Attach the JWT to every request that goes through the gateway.
api.interceptors.request.use((config) => {
  const token = getStoredAuth()?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the gateway rejects the token, tell the app to sign the user out.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    if (err.response?.status === 401 && !url.includes('/users/login')) {
      window.dispatchEvent(new Event('fd:unauthorized'));
    }
    return Promise.reject(err);
  },
);

/** Turns any axios error into a message a customer can read. */
export function errorMessage(err, fallback = 'Something went wrong') {
  if (!err) return fallback;
  if (err.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.';
  const res = err.response;
  if (!res) return 'Cannot reach the server. Check that the API Gateway is running on port 8080.';

  const data = res.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (data?.error && typeof data.error === 'string') return data.error;
  if (data && typeof data === 'object') {
    const parts = Object.values(data).filter((v) => typeof v === 'string');
    if (parts.length) return parts.join(', ');
  }
  if (res.status === 503) return 'A backend service is unavailable. Check that it is registered in Eureka.';
  if (res.status === 401) return 'Your session has expired. Please sign in again.';
  return `${fallback} (HTTP ${res.status})`;
}

// ---- Endpoints (all go through the API Gateway on /api/**) ----
export const endpoints = {
  // user-service
  register: (body) => api.post('/api/users/register', body),
  login: (body) => api.post('/api/users/login', body),

  // restaurant-service
  restaurants: () => api.get('/api/restaurants'),
  restaurant: (id) => api.get(`/api/restaurants/${id}`),
  menu: (id) => api.get(`/api/restaurants/${id}/items`),
  createRestaurant: (body) => api.post('/api/restaurants', body),
  addFoodItem: (restaurantId, body) => api.post(`/api/restaurants/${restaurantId}/items`, body),

  // order-service
  placeOrder: (body) => api.post('/api/orders', body),
  order: (id) => api.get(`/api/orders/${id}`),

  // payment-service (record is created asynchronously via Kafka)
  payment: (orderId) => api.get(`/api/payments/order/${orderId}`),
  selectPaymentMethod: (orderId, paymentMethod, amount) =>
    api.post(`/api/payments/order/${orderId}/method`, { paymentMethod, amount }),

  // delivery-service
  delivery: (orderId) => api.get(`/api/delivery/order/${orderId}`),
  updateDelivery: (orderId, status) => api.put(`/api/delivery/order/${orderId}/status`, null, { params: { status } }),

  // notification-service
  notifications: (orderId) => api.get(`/api/notifications/order/${orderId}`),
};
