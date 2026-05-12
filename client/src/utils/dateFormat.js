// Date formatting utilities to handle timezone issues

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Check if valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    // Extract UTC parts to avoid timezone conversion
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    return `${months[month]} ${day}, ${year}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return 'Invalid Date';
  }
};

export const formatTime = (timeString) => {
  if (!timeString) return 'N/A';
  return timeString;
};
