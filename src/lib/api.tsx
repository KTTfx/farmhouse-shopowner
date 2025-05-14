
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include token with every request
apiClient.interceptors.request.use(
  (config) => {
    console.log("Making request to:", config.url);
    const token = localStorage.getItem('shopToken');
    if (token) {
      console.log("Including token in request");
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Received 401 unauthorized, clearing token");
      localStorage.removeItem('shopToken');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
