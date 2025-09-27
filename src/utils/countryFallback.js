/**
 * Utility functions for handling country code fallbacks
 */

// Find Sri Lanka data from locations API response
const findSriLankaFromLocations = (locationsData) => {
  if (!locationsData || !Array.isArray(locationsData) || locationsData.length === 0) {
    // If no locations data available, use hardcoded fallback as last resort
    return {
      id: 17,
      country: "Sri Lanka",
      language: "English",
      hreflang: "en",
      country_code: "LK",
      betting_apps: "Inactive",
      sports: "Cricket"
    };
  }

  // Find Sri Lanka in the locations data
  const sriLanka = locationsData.find(location => 
    location.country_code === "LK"
  );

  // If Sri Lanka is found, return it
  if (sriLanka) {
    return sriLanka;
  }

  // If Sri Lanka is not found in the locations data, return the first location as fallback
  return locationsData[0];
};

// Format Sri Lanka data to match get-country-code API response format
const formatSriLankaData = (sriLankaLocation) => {
  return {
    country_code: sriLankaLocation.country_code,
    location: {
      id: sriLankaLocation.id,
      country: sriLankaLocation.country,
      language: sriLankaLocation.language,
      hreflang: sriLankaLocation.hreflang,
      country_code: sriLankaLocation.country_code,
      betting_apps: sriLankaLocation.betting_apps,
      sports: sriLankaLocation.sports
    }
  };
};

// Cache for locations data to avoid repeated API calls
let cachedLocationsData = null;

// Fetch locations data from API
const fetchLocationsData = async () => {
  if (cachedLocationsData) {
    return cachedLocationsData;
  }

  try {
    const response = await fetch('https://admin.sportsbuz.com/api/locations');
    
    if (!response.ok) {
      throw new Error(`Locations API failed: ${response.status}`);
    }
    
    const data = await response.json();
    cachedLocationsData = data;
    return data;
  } catch (error) {
    console.error('Failed to fetch locations data:', error);
    return null;
  }
};

// Process country code API response with fallback to Sri Lanka data from locations API
export const processCountryCodeResponse = async (response) => {
  // If we have a valid response, use it
  if (response && response.country_code) {
    return response;
  }
  
  // Otherwise, fetch locations data and use Sri Lanka as fallback
  const locationsData = await fetchLocationsData();
  const sriLankaLocation = findSriLankaFromLocations(locationsData);
  return formatSriLankaData(sriLankaLocation);
};

// Handle country code API error with Sri Lanka fallback from locations API
export const handleCountryCodeError = async (error) => {
  console.error('Failed to fetch country code:', error);
  
  // Fetch locations data and use Sri Lanka as fallback
  const locationsData = await fetchLocationsData();
  const sriLankaLocation = findSriLankaFromLocations(locationsData);
  return formatSriLankaData(sriLankaLocation);
};

// Synchronous version of processCountryCodeResponse for middleware
export const processCountryCodeResponseSync = (response, locationsData) => {
  // If we have a valid response, use it
  if (response && response.country_code) {
    return response;
  }
  
  // Otherwise, use Sri Lanka as fallback from provided locations data
  const sriLankaLocation = findSriLankaFromLocations(locationsData);
  return formatSriLankaData(sriLankaLocation);
};

// Synchronous version of handleCountryCodeError for middleware
export const handleCountryCodeErrorSync = (error, locationsData) => {
  console.error('Failed to fetch country code:', error);
  
  // Use Sri Lanka as fallback from provided locations data
  const sriLankaLocation = findSriLankaFromLocations(locationsData);
  return formatSriLankaData(sriLankaLocation);
};

// Legacy fallback data for backward compatibility
export const sriLankaFallbackData = {
  country_code: "LK",
  location: {
    id: 17,
    country: "Sri Lanka",
    language: "English",
    hreflang: "en",
    country_code: "LK",
    betting_apps: "Inactive",
    sports: "Cricket"
  }
};