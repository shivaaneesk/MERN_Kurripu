import axios from "axios";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5004/api" : "/api";

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;