import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: config.apiUrl,
  headers: config.defaultHeaders
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Handle authentication errors
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        // Save current location for redirect after login
        localStorage.setItem('redirectUrl', window.location.pathname);
        window.location.href = '/login';
        return Promise.reject({ msg: 'Please log in to continue.' });
      }

      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error:', error.request);
      return Promise.reject({ msg: 'Network error occurred. Please check your connection.' });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request Error:', error.message);
      return Promise.reject({ msg: 'An error occurred while making the request.' });
    }
  }
);

export default api;
