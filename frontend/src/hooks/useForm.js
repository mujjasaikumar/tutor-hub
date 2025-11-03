import { useState, useCallback } from 'react';

/**
 * Custom hook for form state management and validation
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationSchema - Validation rules
 * @returns {Object} Form state and handlers
 */
export const useForm = (initialValues, validationSchema = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }, []);

  const validate = useCallback(() => {
    if (!validationSchema) return true;
    
    const newErrors = {};
    let isValid = true;
    
    Object.keys(validationSchema).forEach(field => {
      const rules = validationSchema[field];
      const value = values[field];
      
      if (rules.required && !value) {
        newErrors[field] = rules.requiredMessage || `${field} is required`;
        isValid = false;
      }
      
      if (rules.minLength && value && value.length < rules.minLength) {
        newErrors[field] = rules.minLengthMessage || `${field} must be at least ${rules.minLength} characters`;
        isValid = false;
      }
      
      if (rules.maxLength && value && value.length > rules.maxLength) {
        newErrors[field] = rules.maxLengthMessage || `${field} must be at most ${rules.maxLength} characters`;
        isValid = false;
      }
      
      if (rules.pattern && value && !rules.pattern.test(value)) {
        newErrors[field] = rules.patternMessage || `Invalid ${field} format`;
        isValid = false;
      }
      
      if (rules.custom && value) {
        const customError = rules.custom(value, values);
        if (customError) {
          newErrors[field] = customError;
          isValid = false;
        }
      }
    });
    
    setErrors(newErrors);
    return isValid;
  }, [values, validationSchema]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setFieldValue = useCallback((field, value) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const setFieldError = useCallback((field, error) => {
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    reset,
    setValues,
    setFieldValue,
    setFieldError,
    setErrors
  };
};
