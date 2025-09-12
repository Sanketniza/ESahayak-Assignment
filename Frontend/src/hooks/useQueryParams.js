import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Custom hook for managing URL query parameters
 * Provides functions to get, set, and remove query parameters with URL sync
 */
export const useQueryParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get all query params as an object
  const getAllParams = useCallback(() => {
    const params = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  // Get a specific query param by key
  const getParam = useCallback((key, defaultValue = '') => {
    return searchParams.get(key) || defaultValue;
  }, [searchParams]);

  // Set a query param
  const setParam = useCallback((key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === undefined || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // Set multiple query params at once
  const setParams = useCallback((paramsObj) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(paramsObj).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // Remove a query param
  const removeParam = useCallback((key) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(key);
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // Reset all query params
  const resetParams = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  return {
    searchParams,
    getAllParams,
    getParam,
    setParam,
    setParams,
    removeParam,
    resetParams
  };
};