import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message: error.response?.data?.detail || error.message || 'An unexpected network error occurred.',
      status: error.response?.status || 500,
      raw: error,
    };
    return Promise.reject(customError);
  }
);

export default api;
