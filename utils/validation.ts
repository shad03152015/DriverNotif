/**
 * Validation utility functions for form inputs
 */

export const validateEmail = (email: string): string | undefined => {
  if (!email) {
    return 'Email is required';
  }

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }

  return undefined;
};

export const validateRequired = (value: string, fieldName: string): string | undefined => {
  if (!value || value.trim().length === 0) {
    return `${fieldName} is required`;
  }
  return undefined;
};

export const validateMinLength = (value: string, minLength: number, fieldName: string): string | undefined => {
  if (value && value.trim().length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return undefined;
};

export const validateDate = (dateString: string): string | undefined => {
  if (!dateString) {
    return 'Date is required';
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'Invalid date format';
  }

  return undefined;
};

export const validateBirthdate = (dateString: string): string | undefined => {
  const dateError = validateDate(dateString);
  if (dateError) return dateError;

  const date = new Date(dateString);
  const today = new Date();

  if (date > today) {
    return 'Birthdate cannot be in the future';
  }

  return undefined;
};

export const validateLicenseExpiry = (dateString: string): string | undefined => {
  const dateError = validateDate(dateString);
  if (dateError) return dateError;

  const date = new Date(dateString);
  const today = new Date();

  if (date < today) {
    return 'License expiry date cannot be in the past';
  }

  return undefined;
};

export const formatPhoneNumber = (value: string): string => {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX
  if (numbers.length === 0) return '';
  if (numbers.length <= 3) return `(${numbers}`;
  if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
  return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
};

export const validateFileSize = (sizeInBytes: number, maxSizeInMB: number = 5): string | undefined => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (sizeInBytes > maxSizeInBytes) {
    return `Photo must be under ${maxSizeInMB}MB`;
  }
  return undefined;
};

export const validateFileType = (fileType: string, allowedTypes: string[] = ['image/jpeg', 'image/jpg', 'image/png']): string | undefined => {
  if (!allowedTypes.includes(fileType.toLowerCase())) {
    return 'Only JPG and PNG files are allowed';
  }
  return undefined;
};
