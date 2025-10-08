/**
 * Convert 24-hour time format to 12-hour format
 * @param {string} time24 - Time in 24-hour format (HH:MM or HH:MM:SS)
 * @returns {string} - Time in 12-hour format (h:mm AM/PM)
 */
export const formatTime12Hour = (time24) => {
  if (!time24) return '';
  
  // Handle both HH:MM and HH:MM:SS formats
  const time = time24.split(':');
  const hours = parseInt(time[0], 10);
  const minutes = time[1];
  
  if (isNaN(hours) || hours < 0 || hours > 23) {
    return time24; // Return original if invalid
  }
  
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  
  return `${displayHours}:${minutes} ${period}`;
};

/**
 * Convert 12-hour time format to 24-hour format for database storage
 * @param {string} time12 - Time in 12-hour format (h:mm AM/PM)
 * @returns {string} - Time in 24-hour format (HH:MM)
 */
export const formatTime24Hour = (time12) => {
  if (!time12) return '';
  
  const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return time12; // Return original if invalid format
  
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  
  if (period === 'AM' && hours === 12) {
    hours = 0;
  } else if (period === 'PM' && hours !== 12) {
    hours += 12;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

/**
 * Format duration in minutes to readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted duration (e.g., "1 hour", "30 minutes", "1.5 hours")
 */
export const formatDuration = (minutes) => {
  if (!minutes) return '';
  
  if (minutes === 30) return '30 minutes';
  if (minutes === 60) return '1 hour';
  if (minutes === 90) return '1.5 hours';
  if (minutes === 120) return '2 hours';
  
  // Handle other durations
  if (minutes < 60) {
    return `${minutes} minutes`;
  } else {
    const hours = minutes / 60;
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }
};
