import axios from 'axios';

const API_BASE_URL ='http://localhost:3000/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shopToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiration without auto-logout
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error is due to an invalid token (401 Unauthorized)
    if (error.response && error.response.status === 401) {
      // Don't automatically logout on the auth endpoints
      const isAuthEndpoint = 
        error.config.url.includes('/auth/login') || 
        error.config.url.includes('/auth/register');
      
      if (!isAuthEndpoint) {
        console.log('API Error: Unauthorized. This might be logged during normal auth flow.');
        // We'll let the context handle the logout, don't remove token here
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;