import axios from 'axios';

// Base URL is read from environment variable or defaults to local FastAPI server
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Helper function to extract user-friendly error messages from FastAPI responses.
 * Handles FastAPI string details (e.g. "Insufficient stock", "Product not found")
 * and Pydantic validation error lists (HTTP 422).
 */
export const getErrorMessage = (error) => {
  if (error.response && error.response.data) {
    const detail = error.response.data.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail)) {
      return detail
        .map((err) => {
          const field = Array.isArray(err.loc) ? err.loc[err.loc.length - 1] : 'field';
          return `${field}: ${err.msg}`;
        })
        .join('; ');
    }
    return JSON.stringify(detail);
  }
  if (error.request) {
    return `Cannot connect to FastAPI backend at ${API_BASE_URL}. Please ensure the backend server is running.`;
  }
  return error.message || 'An unexpected error occurred';
};

// --- Backend API Endpoints (matching main.py) ---

// 1. Health check (GET /)
export const checkHealth = () => api.get('/');

// 2. Products
export const getProducts = () => api.get('/products');
export const getProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.patch(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/delete/${id}`); // Note actual backend route: /delete/{product_id}

// 3. Sales
export const createSale = (data) => api.post('/sales', data);

// 4. Analytics
export const getRevenue = () => api.get('/analytics/revenue');
export const getSalesReport = () => api.get('/analytics/sales-report');
export const getSalesStatistics = () => api.get('/analytics/sales-statistics');

export default api;
