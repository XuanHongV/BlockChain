import axios from 'axios';

// const API_BASE_URL = import.meta.env.VITE_API_URL;

const VERCEL_APP_DOMAIN = 'https://block-chain-indol.vercel.app'; // <--- Domain Vercel của bạn
const API_BASE_URL = `${VERCEL_APP_DOMAIN}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    // Nếu token hết hạn → tự động logout
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
