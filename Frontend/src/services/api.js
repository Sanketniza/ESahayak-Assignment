import axios from 'axios';

// Create axios instance with base URL and default headers
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  }
};

export default apiClient;