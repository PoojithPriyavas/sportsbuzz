/**
 * Utility functions for handling country code fallbacks
 */

// Sri Lanka fallback data for when location is not found
export const sriLankaFallbackData = {
  country_code: "LK",
  location: {
    id: 17,
    country: "Sri Lanka",
    language: "English",
    hreflang: "en",
    country_code: "LK",
    betting_apps: "Active",
    sports: "Cricket"
  }
};

/**
 * Process country code API response with fallback to Sri Lanka data
 * @param {Object} response - The API response from get-country-code endpoint
 * @returns {Object} The country data, using Sri Lanka as fallback if needed
 */
export const processCountryCodeResponse = (response) => {
  // Check if the response contains an error about location not found
  if (response && response.error && response.error.includes("Location not found")) {
    console.log('🇱🇰 Using Sri Lanka as fallback due to location not found');
    return sriLankaFallbackData;
  }
  
  // Check if response is empty or invalid
  if (!response || !response.country_code) {
    console.log('🇱🇰 Using Sri Lanka as fallback due to invalid response');
    return sriLankaFallbackData;
  }
  
  // Otherwise return the original response
  return response;
};

/**
 * Handle country code API error with Sri Lanka fallback
 * @param {Error} error - The error that occurred
 * @returns {Object} Sri Lanka fallback data
 */
export const handleCountryCodeError = (error) => {
  console.error('Failed to fetch country code:', error);
  console.log('🇱🇰 Using Sri Lanka as fallback due to error');
  return sriLankaFallbackData;
};