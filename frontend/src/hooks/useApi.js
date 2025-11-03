import { useState, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Custom hook for handling API calls with loading and error states
 * @returns {Object} { loading, error, execute }
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiFunction, options = {}) => {
    const {
      onSuccess,
      onError,
      showSuccessToast = false,
      showErrorToast = true,
      successMessage = 'Operation successful',
    } = options;

    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction();
      
      if (showSuccessToast) {
        toast.success(successMessage);
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'An error occurred';
      setError(errorMessage);
      
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute };
};
