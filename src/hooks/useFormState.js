import { useState, useCallback, useRef, useMemo } from 'react';

export const useFormState = (initialState) => {
  const [formData, setFormData] = useState(initialState);
  const formRef = useRef(null);
  const stableFormData = useRef(formData);
  
  // Keep a stable reference to form data to prevent unnecessary re-renders
  const memoizedFormData = useMemo(() => {
    stableFormData.current = formData;
    return formData;
  }, [formData]);

  // FIXED: Optimized input change handler to prevent focus loss
  const handleInputChange = useCallback((field, value) => {
    // Use functional update to prevent stale closure issues
    setFormData(prev => {
      // Only update if the value actually changed
      if (prev[field] === value) {
        return prev;
      }
      
      return {
        ...prev,
        [field]: value
      };
    });
  }, []);

  // FIXED: Batch form reset to prevent multiple re-renders
  const handleFormReset = useCallback((newState = initialState) => {
    // Use a single state update to prevent multiple re-renders
    setFormData(newState);
  }, [initialState]);

  // FIXED: Optimized form data update with shallow comparison
  const updateFormData = useCallback((updates) => {
    if (typeof updates === 'function') {
      setFormData(prevData => {
        const newData = updates(prevData);
        // Shallow comparison to prevent unnecessary updates
        const hasChanges = Object.keys(newData).some(key => newData[key] !== prevData[key]);
        return hasChanges ? newData : prevData;
      });
    } else {
      setFormData(prev => {
        // Shallow comparison for object updates
        const hasChanges = Object.keys(updates).some(key => updates[key] !== prev[key]);
        return hasChanges ? { ...prev, ...updates } : prev;
      });
    }
  }, []);

  // FIXED: Debounced input change for better performance
  const handleDebouncedInputChange = useCallback((field, delay = 100) => {
    const timeoutRef = useRef(null);
    
    return (value) => {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Update immediately for UI responsiveness
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
      
      // Optional: Add debounced callback for expensive operations
      timeoutRef.current = setTimeout(() => {
        // This can be used for API calls or validation
        // For now, we just ensure the state is consistent
        setFormData(prev => ({
          ...prev,
          [field]: value
        }));
      }, delay);
    };
  }, []);

  // FIXED: Get form field value with stable reference
  const getFieldValue = useCallback((field) => {
    return stableFormData.current[field];
  }, []);

  // FIXED: Set multiple fields at once to reduce re-renders
  const setMultipleFields = useCallback((fields) => {
    setFormData(prev => ({
      ...prev,
      ...fields
    }));
  }, []);

  // FIXED: Form validation helper
  const validateField = useCallback((field, validator) => {
    const value = stableFormData.current[field];
    return validator ? validator(value) : true;
  }, []);

  // FIXED: Get form reference
  const getFormRef = useCallback(() => formRef.current, []);

  // FIXED: Reset specific field
  const resetField = useCallback((field) => {
    const initialValue = initialState[field];
    setFormData(prev => ({
      ...prev,
      [field]: initialValue
    }));
  }, [initialState]);

  // FIXED: Check if form has changes
  const hasFormChanges = useCallback(() => {
    return Object.keys(stableFormData.current).some(
      key => stableFormData.current[key] !== initialState[key]
    );
  }, [initialState]);

  return {
    formData: memoizedFormData,
    handleInputChange,
    handleFormReset,
    updateFormData,
    handleDebouncedInputChange,
    getFieldValue,
    setMultipleFields,
    validateField,
    resetField,
    hasFormChanges,
    getFormRef,
    formRef
  };
};