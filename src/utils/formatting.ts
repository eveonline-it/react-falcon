/**
 * Formatting utilities for numbers, dates, and other common data types
 */

/**
 * Format a number with thousand separators
 * @param num - The number to format
 * @returns Formatted number string
 */
export const formatNumber = (num: number | string | null | undefined): string => {
  if (num === null || num === undefined) {
    return '0';
  }
  
  const numValue = Number(num);
  if (isNaN(numValue)) {
    return '0';
  }
  
  return numValue.toLocaleString();
};

/**
 * Format a date string or Date object to a readable format
 * @param date - The date to format
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) {
    return 'Unknown';
  }
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Format a date string to a relative time (e.g., "2 hours ago")
 * @param date - The date to format
 * @returns Relative time string
 */
export const formatRelativeTime = (date: string | Date | null | undefined): string => {
  if (!date) {
    return 'Unknown';
  }
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return formatDate(dateObj);
  } catch (error) {
    return 'Unknown';
  }
};

/**
 * Format a percentage value
 * @param value - The percentage value (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number | null | undefined, decimals: number = 1): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  
  return `${Number(value).toFixed(decimals)}%`;
};

/**
 * Format file size in bytes to human-readable format
 * @param bytes - Size in bytes
 * @returns Human-readable file size
 */
export const formatFileSize = (bytes: number | null | undefined): string => {
  if (!bytes || bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

/**
 * Format ISK (EVE Online currency) values
 * @param isk - ISK amount
 * @returns Formatted ISK string
 */
export const formatISK = (isk: number | null | undefined): string => {
  if (!isk || isk === 0) return '0 ISK';
  
  if (isk >= 1000000000) {
    return `${(isk / 1000000000).toFixed(1)}B ISK`;
  } else if (isk >= 1000000) {
    return `${(isk / 1000000).toFixed(1)}M ISK`;
  } else if (isk >= 1000) {
    return `${(isk / 1000).toFixed(1)}K ISK`;
  }
  
  return `${formatNumber(isk)} ISK`;
};