export const calculateTimeDuration = (dateString: string): string => {
  const startDate = new Date(dateString);
  const now = new Date();
  
  if (isNaN(startDate.getTime())) {
    return 'Unknown';
  }
  
  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  let days = now.getDate() - startDate.getDate();
  
  // Adjust for negative days
  if (days < 0) {
    months--;
    const daysInPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += daysInPrevMonth;
  }
  
  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }
  
  // Build the result string
  const parts: string[] = [];
  
  if (years > 0) {
    parts.push(`${years} year${years !== 1 ? 's' : ''}`);
  }
  if (months > 0) {
    parts.push(`${months} month${months !== 1 ? 's' : ''}`);
  }
  if (days > 0 || parts.length === 0) {
    parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  }
  
  // Return only the first two most significant parts for brevity
  return parts.slice(0, 2).join(', ') + ' ago';
};

export const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return date.toLocaleDateString('en-US', options || defaultOptions);
};

export const getYearFromDate = (dateString: string): number | null => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return null;
  }
  return date.getFullYear();
};

export const getDaysSince = (dateString: string): number => {
  const startDate = new Date(dateString);
  const now = new Date();
  
  if (isNaN(startDate.getTime())) {
    return 0;
  }
  
  const diffTime = Math.abs(now.getTime() - startDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};