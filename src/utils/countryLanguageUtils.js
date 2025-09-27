/**
 * Utility functions for handling country and language data
 */

// Default fallback country (Sri Lanka)
export const getDefaultCountry = (locationsData) => {
  if (!locationsData || !Array.isArray(locationsData)) {
    return null;
  }
  
  // Find Sri Lanka in the locations data
  const sriLanka = locationsData.find(location => 
    location.country_code === "LK"
  );
  
  return sriLanka || null;
};

// Format country data from API to a consistent structure
export const formatCountryData = (countryData, locationsData) => {
  // If valid country data is provided, use it
  if (countryData && countryData.country_code) {
    return countryData;
  }
  
  // Otherwise use Sri Lanka as fallback
  const sriLanka = getDefaultCountry(locationsData);
  if (sriLanka) {
    return {
      country_code: sriLanka.country_code,
      location: {
        id: sriLanka.id,
        country: sriLanka.country,
        language: sriLanka.language,
        hreflang: sriLanka.hreflang,
        country_code: sriLanka.country_code,
        betting_apps: sriLanka.betting_apps,
        sports: sriLanka.sports
      }
    };
  }
  
  // Ultimate fallback if locations data is not available
  return {
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
};

// Check if a language-country combination is valid
export const isValidLanguageCountry = (hreflang, countryCode, locationsData) => {
  if (!locationsData || !Array.isArray(locationsData)) {
    return false;
  }
  
  // Check if the language exists in the locations data
  const languageExists = locationsData.some(location => 
    location.hreflang === hreflang
  );
  
  // Check if the country exists in the locations data
  const countryExists = locationsData.some(location => 
    location.country_code === countryCode
  );
  
  return languageExists && countryExists;
};

// Get default language for a country
export const getDefaultLanguageForCountry = (countryCode, locationsData) => {
  if (!locationsData || !Array.isArray(locationsData)) {
    return 'en';
  }
  
  const countryData = locationsData.find(location => 
    location.country_code === countryCode
  );
  
  return countryData ? countryData.hreflang : 'en';
};

// Parse URL path to extract language and country code
export const parseUrlPath = (pathname) => {
  if (!pathname) return { hreflang: null, countryCode: null };
  
  // Remove leading slash and get first segment
  const pathParts = pathname.replace(/^\//, '').split('/');
  const firstPart = pathParts[0];
  
  // Check if it matches the format: hreflang-countrycode
  const match = firstPart.match(/^([a-z]{2})-([a-z]{2})$/i);
  
  if (match) {
    return {
      hreflang: match[1].toLowerCase(),
      countryCode: match[2].toUpperCase()
    };
  }
  
  return { hreflang: null, countryCode: null };
};

// Build URL with language and country code
export const buildUrlWithLanguageCountry = (hreflang, countryCode, pathname) => {
  // Remove any existing language-country prefix
  const cleanPath = pathname.replace(/^\/[a-z]{2}-[a-z]{2}(\/|$)/i, '/');
  
  // Construct new path with language-country prefix
  return `/${hreflang.toLowerCase()}-${countryCode.toLowerCase()}${cleanPath}`;
};

// Get all available languages from locations data
export const getAllAvailableLanguages = (locationsData) => {
  if (!locationsData || !Array.isArray(locationsData)) {
    return [];
  }
  
  // Create a map to store unique languages
  const languageMap = new Map();
  
  locationsData.forEach(location => {
    if (location.hreflang && !languageMap.has(location.hreflang)) {
      languageMap.set(location.hreflang, {
        hreflang: location.hreflang,
        language: location.language
      });
    }
  });
  
  return Array.from(languageMap.values());
};

// Get all available countries from locations data
export const getAllAvailableCountries = (locationsData) => {
  if (!locationsData || !Array.isArray(locationsData)) {
    return [];
  }
  
  // Create a map to store unique countries
  const countryMap = new Map();
  
  locationsData.forEach(location => {
    if (location.country_code && !countryMap.has(location.country_code)) {
      countryMap.set(location.country_code, {
        country_code: location.country_code,
        country: location.country
      });
    }
  });
  
  return Array.from(countryMap.values());
};