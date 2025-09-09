/**
 * Utility functions for timezone conversion and time formatting
 */

/**
 * Converts a timestamp to the venue's timezone
 * @param {string|number} timestamp - Unix timestamp in milliseconds
 * @param {string} venueTimezone - Timezone offset in format '+01:00'
 * @returns {Date} - Date object adjusted to venue timezone
 */
export const convertToVenueTime = (timestamp, venueTimezone) => {
  if (!timestamp || !venueTimezone) return new Date();
  
  // Parse the timestamp to a Date object
  const date = new Date(parseInt(timestamp));
  
  // Parse the venue timezone offset
  const offsetMatch = venueTimezone.match(/([+-])(\d{2}):(\d{2})/);
  if (!offsetMatch) return date;
  
  const [_, sign, hours, minutes] = offsetMatch;
  const offsetHours = parseInt(hours);
  const offsetMinutes = parseInt(minutes);
  const totalOffsetMinutes = (sign === '+' ? 1 : -1) * (offsetHours * 60 + offsetMinutes);
  
  // Get the local timezone offset in minutes
  const localOffset = date.getTimezoneOffset();
  
  // Calculate the difference between local and venue timezone
  const diffMinutes = totalOffsetMinutes + localOffset;
  
  // Adjust the date by the difference
  date.setMinutes(date.getMinutes() + diffMinutes);
  
  return date;
};

/**
 * Formats a date object to a readable string
 * @param {Date} date - Date object to format
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted date string
 */
export const formatMatchTime = (date, options = {}) => {
  const {
    showDate = true,
    showTime = true,
    dateFormat = 'short', // 'short', 'medium', 'long'
    timeFormat = '12h', // '12h', '24h'
  } = options;
  
  if (!date || !(date instanceof Date)) return 'Invalid date';
  
  let result = '';
  
  // Format date part
  if (showDate) {
    switch (dateFormat) {
      case 'short':
        result += date.toLocaleDateString(undefined, { 
          day: 'numeric', 
          month: 'short' 
        });
        break;
      case 'medium':
        result += date.toLocaleDateString(undefined, { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        });
        break;
      case 'long':
        result += date.toLocaleDateString(undefined, { 
          weekday: 'short',
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        });
        break;
      default:
        result += date.toLocaleDateString();
    }
  }
  
  // Add separator if showing both date and time
  if (showDate && showTime) {
    result += ' • ';
  }
  
  // Format time part
  if (showTime) {
    if (timeFormat === '24h') {
      result += date.toLocaleTimeString(undefined, { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
    } else {
      result += date.toLocaleTimeString(undefined, { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true
      });
    }
  }
  
  return result;
};

/**
 * Gets the match state with appropriate styling
 * @param {string} state - Current match state (e.g., 'Live', 'Stumps', 'Complete')
 * @returns {Object} - Object with text and style properties
 */
export const getMatchStateDisplay = (state) => {
  if (!state) return { text: 'Unknown', style: {} };
  
  const lowerState = state.toLowerCase();
  
  if (lowerState === 'live' || lowerState.includes('progress')) {
    return { 
      text: 'LIVE', 
      style: { color: '#e74c3c' } 
    };
  }
  
  if (lowerState === 'stumps' || lowerState.includes('stumps')) {
    return { 
      text: 'Stumps', 
      style: { color: '#f39c12' } 
    };
  }
  
  if (lowerState === 'complete' || lowerState.includes('complete')) {
    return { 
      text: 'Completed', 
      style: { color: '#2ecc71' } 
    };
  }
  
  // Default case
  return { 
    text: state, 
    style: {} 
  };
};