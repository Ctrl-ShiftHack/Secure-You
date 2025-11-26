/**
 * Validation utilities for SecureYou application
 * Includes email, phone, and data format validators
 */

// ============================================
// EMAIL VALIDATION (RFC 5322 Compliant)
// ============================================

/**
 * Validates email format using RFC 5322 compliant regex
 * @param email - Email address to validate
 * @returns boolean - True if valid email format
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  // Comprehensive RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  // Additional checks
  if (email.length > 254) return false; // Max email length per RFC 5321
  if (email.startsWith('.') || email.endsWith('.')) return false;
  if (email.includes('..')) return false; // No consecutive dots
  
  return emailRegex.test(email.trim().toLowerCase());
};

/**
 * Normalizes email to lowercase and trims whitespace
 */
export const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

// ============================================
// BANGLADESHI PHONE VALIDATION
// ============================================

/**
 * Validates Bangladeshi phone numbers
 * Accepts formats: +8801XXXXXXXXX, 8801XXXXXXXXX, 01XXXXXXXXX, 1XXXXXXXXX
 * @param phone - Phone number to validate
 * @returns boolean - True if valid BD phone number
 */
export const isValidBDPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Remove all spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Valid Bangladeshi phone patterns:
  // +8801XXXXXXXXX (13 digits)
  // 8801XXXXXXXXX (12 digits)
  // 01XXXXXXXXX (11 digits)
  // 1XXXXXXXXX (10 digits)
  
  const patterns = [
    /^\+8801[3-9]\d{8}$/,     // +880 1XXX XXX XXX
    /^8801[3-9]\d{8}$/,       // 880 1XXX XXX XXX
    /^01[3-9]\d{8}$/,         // 01XXX XXX XXX
    /^1[3-9]\d{8}$/,          // 1XXX XXX XXX
  ];
  
  return patterns.some(pattern => pattern.test(cleaned));
};

/**
 * Formats Bangladeshi phone to international format: +880 1XXX XXX XXX
 */
export const formatBDPhone = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle different input formats
  let digits = cleaned;
  
  // Remove country code if present
  if (cleaned.startsWith('880')) {
    digits = cleaned.substring(3);
  } else if (cleaned.startsWith('0')) {
    digits = cleaned.substring(1);
  }
  
  // Ensure we have exactly 10 digits (after country code)
  if (digits.length !== 10) {
    return phone; // Return original if format is unclear
  }
  
  // Format as: +880 1XXX XXX XXX
  return `+880 ${digits.substring(0, 4)} ${digits.substring(4, 7)} ${digits.substring(7)}`;
};

/**
 * Normalizes BD phone to E.164 format: +8801XXXXXXXXX
 */
export const normalizeBDPhone = (phone: string): string => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  // Add country code if missing
  if (cleaned.startsWith('880')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    return `+880${cleaned.substring(1)}`;
  } else if (cleaned.startsWith('1') && cleaned.length === 10) {
    return `+880${cleaned}`;
  } else if (cleaned.startsWith('+880')) {
    return cleaned;
  }
  
  return `+880${cleaned}`;
};

/**
 * Get phone validation error message
 */
export const getPhoneErrorMessage = (phone: string): string | null => {
  if (!phone || phone.trim() === '') {
    return 'Phone number is required';
  }
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length < 10) {
    return 'Phone number is too short. Bangladesh numbers have 11 digits (01XXXXXXXXX)';
  }
  
  if (cleaned.length > 13) {
    return 'Phone number is too long';
  }
  
  if (!isValidBDPhone(phone)) {
    return 'Invalid Bangladesh phone number. Format: +880 1XXX XXX XXX or 01XXXXXXXXX';
  }
  
  return null;
};

// ============================================
// DATE & TIME FORMATTING
// ============================================

/**
 * Formats ISO date string to human-readable format
 */
export const formatDate = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
};

/**
 * Formats date to Bangladesh timezone (GMT+6)
 */
export const formatDateBD = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-BD', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
};

/**
 * Get relative time (e.g., "2 hours ago", "just now")
 */
export const getRelativeTime = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return formatDate(isoString);
  } catch {
    return isoString;
  }
};

// ============================================
// GENERAL VALIDATION
// ============================================

/**
 * Validates full name (at least 2 characters, letters and spaces only)
 */
export const isValidName = (name: string): boolean => {
  if (!name || typeof name !== 'string') return false;
  
  const trimmed = name.trim();
  if (trimmed.length < 2) return false;
  
  // Allow letters, spaces, dots, apostrophes, hyphens
  const nameRegex = /^[a-zA-Z\s\.\'\-]+$/;
  return nameRegex.test(trimmed);
};

/**
 * Validates password strength
 */
export const isStrongPassword = (password: string): { valid: boolean; message: string } => {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  
  return { valid: true, message: 'Strong password' };
};

/**
 * Returns password strength level: 'weak', 'medium', or 'strong'
 */
export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (!password) return 'weak';
  
  let strength = 0;
  
  // Length check
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  
  // Character variety checks
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
  
  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
};

/**
 * Sanitize text input (remove special characters that could cause issues)
 */
export const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  return text.trim().replace(/[<>]/g, ''); // Remove angle brackets to prevent XSS
};
