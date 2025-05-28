// Utility functions for formatting data

/**
 * Format money amounts to be more readable
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency symbol (default: 'RWF')
 * @returns {string} Formatted money string
 */
export const formatMoney = (amount, currency = 'RWF') => {
  if (!amount || amount === 0) return `0 ${currency}`;
  
  const num = Number(amount);
  
  // For amounts >= 1 million, show in millions (M)
  if (num >= 1000000) {
    const millions = (num / 1000000).toFixed(1);
    return `${millions}M ${currency}`;
  }
  
  // For amounts >= 1 thousand, show in thousands (K)
  if (num >= 1000) {
    const thousands = (num / 1000).toFixed(1);
    return `${thousands}K ${currency}`;
  }
  
  // For smaller amounts, show normally with commas
  return `${num.toLocaleString()} ${currency}`;
};

/**
 * Format money for detailed display (like in tables)
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency symbol (default: 'RWF')
 * @returns {string} Formatted money string with full number
 */
export const formatMoneyDetailed = (amount, currency = 'RWF') => {
  if (!amount || amount === 0) return `0 ${currency}`;
  
  const num = Number(amount);
  return `${num.toLocaleString()} ${currency}`;
};

/**
 * Format money for cards/dashboard (compact format)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted money string without currency
 */
export const formatMoneyCompact = (amount) => {
  if (!amount || amount === 0) return '0';
  
  const num = Number(amount);
  
  // For amounts >= 1 million, show in millions (M)
  if (num >= 1000000) {
    const millions = (num / 1000000).toFixed(1);
    return `${millions}M`;
  }
  
  // For amounts >= 1 thousand, show in thousands (K)
  if (num >= 1000) {
    const thousands = (num / 1000).toFixed(1);
    return `${thousands}K`;
  }
  
  // For smaller amounts, show normally
  return num.toLocaleString();
};

/**
 * Format percentage values
 * @param {number} value - The percentage value
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value) => {
  if (!value || value === 0) return '0%';
  return `${Math.round(value)}%`;
};

/**
 * Format duration in minutes to human readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration string
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes === 0) return '0m';
  
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}m`;
  }
  
  return `${minutes}m`;
};
