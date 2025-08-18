import { useState, useCallback, useRef } from 'react';

export const useFormState = (initialState) => {
  const [formData, setFormData] = useState(initialState);
  const formRef = useRef(null);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleFormReset = useCallback((newState = initialState) => {
    setFormData(newState);
  }, [initialState]);

  const updateFormData = useCallback((updates) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  const getFormRef = useCallback(() => formRef.current, []);

  return {
    formData,
    handleInputChange,
    handleFormReset,
    updateFormData,
    getFormRef,
    formRef
  };
};

