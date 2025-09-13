import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

// Create context
const AuthContext = createContext(null);

// API URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        // Set auth token header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Get user data
        const res = await axios.get(`${API_URL}/auth/me`);
        setUser(res.data.data);
      } catch (err) {
        console.error('Error loading user:', err);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, userData);
      
      // Save token to local storage
      localStorage.setItem('token', res.data.token);
      
      // Set auth token header
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      // Set user
      setUser(res.data.data.user);
      
      return res.data;
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message || 
        'Registration failed. Please try again.'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Login user
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      // Save token to local storage
      localStorage.setItem('token', res.data.token);
      
      // Set auth token header
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      // Set user
      setUser(res.data.data.user);
      
      return res.data;
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        'Invalid credentials. Please try again.'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout user
  const logout = async () => {
    setLoading(true);
    try {
      await axios.get(`${API_URL}/auth/logout`);
    } catch (err) {
      console.error('Logout error:', err);
      // Continue logout even if API call fails
    } finally {
      // Remove token from local storage
      localStorage.removeItem('token');
      
      // Remove auth header
      delete axios.defaults.headers.common['Authorization'];
      
      // Clear user
      setUser(null);
      setLoading(false);
    }
  };
  
  // Check if token is expired
  const isTokenExpired = () => {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    try {
      const decoded = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch (err) {
      return true;
    }
  };
  
  // Check if user is admin
  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        isTokenExpired,
        isAdmin,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;