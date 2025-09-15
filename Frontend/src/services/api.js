import axios from 'axios';

// Create axios instance with base URL and default headers
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
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

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized error - clear token and redirect to login
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API functions for buyers
export const buyersApi = {
  // Get all buyers with optional filters
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/buyers', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching buyers:', error);
      throw error;
    }
  },
  
  // Get a single buyer by ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/buyers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching buyer with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new buyer
  create: async (buyerData) => {
    try {
      const response = await apiClient.post('/buyers', buyerData);
      return response.data;
    } catch (error) {
      console.error('Error creating buyer:', error);
      throw error;
    }
  },
  
  // Update an existing buyer
  update: async (id, buyerData) => {
    try {
      const response = await apiClient.put(`/buyers/${id}`, buyerData);
      return response.data;
    } catch (error) {
      console.error(`Error updating buyer with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a buyer
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/buyers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting buyer with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Export buyers to CSV
  exportCSV: async (filters = {}) => {
    try {
      const response = await apiClient.get('/buyers/export-csv', {
        params: filters,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting buyers to CSV:', error);
      throw error;
    }
  },
  
  // Import buyers from CSV
  importCSV: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/buyers/import-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error importing buyers from CSV:', error);
      throw error;
    }
  },
  
  // Get change history for a buyer
  getHistory: async (id) => {
    try {
      const response = await apiClient.get(`/buyers/${id}/history`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching history for buyer with ID ${id}:`, error);
      throw error;
    }
  },
};

export default apiClient;