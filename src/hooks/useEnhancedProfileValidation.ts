
import { useState, useCallback } from 'react';

export interface ValidationErrors {
  [key: string]: string;
}

export interface UseEnhancedProfileValidationReturn {
  errors: ValidationErrors;
  validateField: (field: string, value: string) => string;
  validateForm: (formData: Record<string, any>) => ValidationErrors;
  setFieldError: (field: string, error: string) => void;
  clearFieldError: (field: string) => void;
  clearAllErrors: () => void;
  hasErrors: boolean;
}

export const useEnhancedProfileValidation = (): UseEnhancedProfileValidationReturn => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const isValidUrl = useCallback((url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  const isValidEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validateField = useCallback((field: string, value: string): string => {
    const trimmedValue = value.trim();

    switch (field) {
      case 'full_name':
        if (!trimmedValue) {
          return 'Full name is required';
        }
        if (trimmedValue.length < 2) {
          return 'Full name must be at least 2 characters';
        }
        if (trimmedValue.length > 100) {
          return 'Full name must be less than 100 characters';
        }
        break;

      case 'username':
        if (trimmedValue && trimmedValue.length < 3) {
          return 'Username must be at least 3 characters';
        }
        if (trimmedValue && trimmedValue.length > 30) {
          return 'Username must be less than 30 characters';
        }
        if (trimmedValue && !/^[a-zA-Z0-9_-]+$/.test(trimmedValue)) {
          return 'Username can only contain letters, numbers, underscores, and hyphens';
        }
        break;

      case 'bio':
        if (trimmedValue && trimmedValue.length > 500) {
          return 'Bio must be less than 500 characters';
        }
        break;

      case 'email':
        if (trimmedValue && !isValidEmail(trimmedValue)) {
          return 'Please enter a valid email address';
        }
        break;

      case 'phone_number':
        if (trimmedValue && !/^\+?[\d\s\-\(\)]{10,}$/.test(trimmedValue)) {
          return 'Please enter a valid phone number (at least 10 digits)';
        }
        break;

      case 'website':
      case 'github_url':
      case 'linkedin_url':
      case 'twitter_url':
        if (trimmedValue && !isValidUrl(trimmedValue)) {
          return 'Please enter a valid URL (including http:// or https://)';
        }
        break;

      case 'location':
        if (trimmedValue && trimmedValue.length > 100) {
          return 'Location must be less than 100 characters';
        }
        break;

      case 'company':
        if (trimmedValue && trimmedValue.length > 100) {
          return 'Company name must be less than 100 characters';
        }
        break;

      default:
        return '';
    }

    return '';
  }, [isValidUrl, isValidEmail]);

  const validateForm = useCallback((formData: Record<string, any>): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const error = validateField(key, value);
        if (error) {
          newErrors[key] = error;
        }
      }
    });

    setErrors(newErrors);
    return newErrors;
  }, [validateField]);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    validateField,
    validateForm,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    hasErrors
  };
};
