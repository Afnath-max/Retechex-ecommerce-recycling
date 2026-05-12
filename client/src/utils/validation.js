// Validation utilities for forms

/**
 * Validate name field - only letters and spaces
 * @param {string} name
 * @returns {boolean}
 */
export const validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s]+$/;
  return nameRegex.test(name);
};

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number - Sri Lankan format
 * @param {string} phone
 * @returns {boolean}
 */
export const validatePhone = (phone) => {
  // Sri Lankan phone format: starts with 0 followed by 9 digits (e.g., 0771234567)
  const phoneRegex = /^0\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Check password strength
 * @param {string} password
 * @returns {object} - strength level and message
 */
export const checkPasswordStrength = (password) => {
  let strength = 0;
  const feedback = [];
  
  if (password.length >= 8) {
    strength += 1;
  } else {
    feedback.push('At least 8 characters');
  }
  
  if (/[a-z]/.test(password)) {
    strength += 1;
  } else {
    feedback.push('Lowercase letter');
  }
  
  if (/[A-Z]/.test(password)) {
    strength += 1;
  } else {
    feedback.push('Uppercase letter');
  }
  
  if (/\d/.test(password)) {
    strength += 1;
  } else {
    feedback.push('Number');
  }
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    strength += 1;
  } else {
    feedback.push('Special character');
  }
  
  let level = 'weak';
  let color = 'text-red-600';
  let bgColor = 'bg-red-100';
  
  if (strength >= 4) {
    level = 'strong';
    color = 'text-green-600';
    bgColor = 'bg-green-100';
  } else if (strength >= 3) {
    level = 'medium';
    color = 'text-yellow-600';
    bgColor = 'bg-yellow-100';
  }
  
  return {
    strength,
    level,
    color,
    bgColor,
    feedback: feedback.length > 0 ? `Needs: ${feedback.join(', ')}` : 'Strong password!',
    isValid: strength >= 3
  };
};

/**
 * Validate address fields
 * @param {object} address
 * @returns {object} - validation errors
 */
export const validateAddress = (address) => {
  const errors = {};
  
  if (!address.street || address.street.trim().length < 5) {
    errors.street = 'Street address must be at least 5 characters';
  }
  
  if (!address.city || address.city.trim().length < 2) {
    errors.city = 'City is required';
  }
  
  // Sri Lankan postal code validation (5 digits)
  if (address.postalCode && !/^\d{5}$/.test(address.postalCode)) {
    errors.postalCode = 'Postal code must be 5 digits';
  }
  
  return errors;
};

/**
 * Format currency for Sri Lankan Rupees
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  return `Rs. ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Validate positive number
 * @param {string|number} value
 * @returns {boolean}
 */
export const validatePositiveNumber = (value) => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

/**
 * Validate stock quantity
 * @param {string|number} value
 * @returns {boolean}
 */
export const validateStockQuantity = (value) => {
  const num = Number(value);
  return !isNaN(num) && num >= 0 && Number.isInteger(num);
};
