import axios from "axios";

// Use the backend port 5004 in development (backend runs on 5004 in this project)
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5004/api" : "/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// attach Authorization header if token present in localStorage
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;