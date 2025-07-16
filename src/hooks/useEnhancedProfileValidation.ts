
import { useState } from 'react';

interface ValidationErrors {
  [key: string]: string;
}

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
  message: string;
}

interface ValidationRules {
  [key: string]: ValidationRule[];
}

const validationRules: ValidationRules = {
  full_name: [
    { required: true, message: 'Full name is required' },
    { minLength: 2, message: 'Full name must be at least 2 characters' },
    { maxLength: 100, message: 'Full name must be less than 100 characters' }
  ],
  username: [
    { minLength: 3, message: 'Username must be at least 3 characters' },
    { maxLength: 30, message: 'Username must be less than 30 characters' },
    { pattern: /^[a-zA-Z0-9_-]+$/, message: 'Username can only contain letters, numbers, underscores, and hyphens' }
  ],
  email: [
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' }
  ],
  website: [
    { pattern: /^https?:\/\/.+/, message: 'Website must start with http:// or https://' }
  ],
  github_url: [
    { pattern: /^https:\/\/github\.com\/.+/, message: 'Please enter a valid GitHub URL' }
  ],
  linkedin_url: [
    { pattern: /^https:\/\/(www\.)?linkedin\.com\/.+/, message: 'Please enter a valid LinkedIn URL' }
  ],
  twitter_url: [
    { pattern: /^https:\/\/(www\.)?(twitter\.com|x\.com)\/.+/, message: 'Please enter a valid Twitter/X URL' }
  ],
  phone_number: [
    { pattern: /^\+?[\d\s\-\(\)]{10,}$/, message: 'Please enter a valid phone number' }
  ],
  bio: [
    { maxLength: 500, message: 'Bio must be less than 500 characters' }
  ]
};

export const useEnhancedProfileValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = (fieldName: string, value: string): string => {
    const rules = validationRules[fieldName];
    if (!rules) return '';

    for (const rule of rules) {
      if (rule.required && !value.trim()) {
        return rule.message;
      }
      
      if (value && rule.minLength && value.length < rule.minLength) {
        return rule.message;
      }
      
      if (value && rule.maxLength && value.length > rule.maxLength) {
        return rule.message;
      }
      
      if (value && rule.pattern && !rule.pattern.test(value)) {
        return rule.message;
      }
      
      if (value && rule.custom && !rule.custom(value)) {
        return rule.message;
      }
    }
    
    return '';
  };

  const validateForm = (data: Record<string, string>): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    
    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, data[field] || '');
      if (error) {
        newErrors[field] = error;
      }
    });
    
    setErrors(newErrors);
    return newErrors;
  };

  const clearFieldError = (fieldName: string) => {
    setErrors(prev => {
      const { [fieldName]: _, ...rest } = prev;
      return rest;
    });
  };

  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    validateField,
    validateForm,
    clearFieldError,
    hasErrors,
    setErrors
  };
};
