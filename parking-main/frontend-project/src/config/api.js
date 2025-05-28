import axios from 'axios';

// API Configuration
export const API_BASE_URL = 'http://localhost:3000/api';

// API Endpoints
export const API_ENDPOINTS = {
  cars: `${API_BASE_URL}/cars`,
  parkingSlots: `${API_BASE_URL}/parkingslots`,
  parkingRecords: `${API_BASE_URL}/parkingrecords`,
  payments: `${API_BASE_URL}/payments`
};

// Create axios instance with session-based authentication
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for session cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      // Don't redirect if this is a login attempt
      if (error.config?.url?.includes('/auth/login')) {
        console.log('Login failed - invalid credentials');
      } else {
        // Session expired or invalid, redirect to login
        console.log('401 Unauthorized - redirecting to login');
        localStorage.removeItem('isLoggedIn');

        // Only redirect if not already on login page
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    }

    return Promise.reject(error);
  }
);
