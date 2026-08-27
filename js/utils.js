/* ==========================================================================
   MIRCHI PURE - PRODUCTION UTILITIES
   XSS Sanitization, Input Validation, Debounce, Currency Formatter
   ========================================================================== */

/**
 * Escape HTML characters to prevent XSS vulnerability
 * @param {string} str 
 * @returns {string}
 */
export function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Debounce utility for input handlers (e.g. search)
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
export function debounce(func, wait = 250) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Indian Mobile Number Validator (10 digits starting with 6-9)
 * @param {string} phone 
 * @returns {boolean}
 */
export function validatePhone(phone) {
  const clean = phone.replace(/[\s\-\+\(\)]/g, '');
  const indianMobileRegex = /^(?:0|\+?91)?([6-9]\d{9})$/;
  return indianMobileRegex.test(clean);
}

/**
 * Indian Pincode Validator (6 digits)
 * @param {string} pincode 
 * @returns {boolean}
 */
export function validatePincode(pincode) {
  const clean = pincode.trim();
  return /^\d{6}$/.test(clean);
}

/**
 * INR Currency Formatter
 * @param {number} amount 
 * @returns {string}
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}
