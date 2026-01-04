/**
 * CLIENTE API
 * Configuración centralizada de Axios para comunicación con backend
 */

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ===============================
// INSTANCIA AXIOS
// ===============================
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ===============================
// INTERCEPTOR REQUEST
// ===============================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===============================
// INTERCEPTOR RESPONSE
// ===============================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem("accessToken", accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// ===============================
// AUTH SERVICE
// ===============================
export const authService = {
  login: (username, password) =>
    api.post("/auth/login", { username, password }).then((r) => r.data),

  logout: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    await api.post("/auth/logout", { refreshToken });
    localStorage.clear();
  },

  getMe: () => api.get("/auth/me").then((r) => r.data),
};

// ===============================
// BOOKING SERVICE
// ===============================
export const bookingService = {
  create: (data) => api.post("/bookings", data).then((r) => r.data),

  getMyBookings: (params = {}) =>
    api.get("/bookings/my-bookings", { params }).then((r) => r.data),

  complete: (id, amount, notes) =>
    api.put(`/bookings/${id}/complete`, { amount, notes }).then((r) => r.data),

  cancel: (id) =>
    api.put(`/bookings/${id}/cancel`).then((r) => r.data),

  confirm: (token) =>
    api.put(`/bookings/confirm/${token}`).then((r) => r.data),

  reject: (token) =>
    api.put(`/bookings/reject/${token}`).then((r) => r.data),
};

// ===============================
// PROFESSIONAL SERVICE
// ===============================
export const professionalService = {
  getAll: () => api.get("/professionals").then((r) => r.data),
};

// ===============================
// SERVICE SERVICE (CATÁLOGO)
// ===============================
export const serviceService = {
  getAll: (activeOnly = true) =>
    api.get("/services", { params: { activeOnly } }).then((r) => r.data),

  getById: (id) =>
    api.get(`/services/${id}`).then((r) => r.data),
};

// ===============================
// PAYMENT SERVICE
// ===============================
export const paymentService = {
  getTodayEarnings: () =>
    api.get("/payments/today").then(r => r.data),

  getMonthEarnings: (year, month) =>
    api.get("/payments/month", {
      params: { year, month },
    }).then(r => r.data),

  getHistory: (params = {}) =>
    api.get("/payments/history", { params }).then(r => r.data),

  getMonthlyStats: (year) =>
    api.get("/payments/monthly-stats", {
      params: { year },
    }).then(r => r.data),

  getTopServices: (limit = 10) =>
    api.get("/payments/top-services", {
      params: { limit },
    }).then(r => r.data),
};


// ===============================
// DEFAULT EXPORT
// ===============================
export default api;
