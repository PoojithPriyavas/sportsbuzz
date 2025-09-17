// utils/hreflangHelper.js

/**
 * Utility functions for handling hreflang tags and URL validation
 */

/**
 * Check if the current page has hreflang tags
 * @returns {boolean} True if hreflang tags are present
 */
export const hasHreflangTags = () => {
  if (typeof window === 'undefined') return false;
  
  const hreflangLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
  const validHreflangLinks = Array.from(hreflangLinks).filter(link => {
    const hreflang = link.getAttribute('hreflang');
    // Validate hreflang format (e.g., en-US, fr-CA)
    return hreflang && /^[a-z]{2}-[A-Z]{2}$/.test(hreflang);
  });
  
  console.log(`Found ${validHreflangLinks.length} valid hreflang tags`);
  return validHreflangLinks.length > 0;
};

/**
 * Validate hreflang format
 * @param {string} hreflang - The hreflang value to validate
 * @returns {boolean} True if format is valid
 */
export const isValidHreflangFormat = (hreflang) => {
  if (!hreflang || typeof hreflang !== 'string') return false;
  
  // Check format: languagecode-countrycode (e.g., en-US, fr-CA)
  const hreflangPattern = /^[a-z]{2}-[A-Z]{2}$/;
  return hreflangPattern.test(hreflang);
};

/**
 * Extract language and country from hreflang
 * @param {string} hreflang - The hreflang value (e.g., "en-US")
 * @returns {Object} Object containing language and country codes
 */
export const parseHreflang = (hreflang) => {
  if (!isValidHreflangFormat(hreflang)) {
    return { language: null, country: null };
  }
  
  const [language, country] = hreflang.split('-');
  return {
    language: language.toLowerCase(),
    country: country.toUpperCase()
  };
};

/**
 * Extract language-country from URL path
 * @param {string} pathname - The URL pathname
 * @returns {Object} Object containing language and country codes
 */
export const extractLanguageCountryFromUrl = (pathname) => {
  if (!pathname) return { language: null, country: null };
  
  // Remove leading slash and split
  const pathParts = pathname.replace(/^\//, '').split('/');
  const firstPart = pathParts[0];
  
  // Check if first part matches language-country format
  const match = firstPart.match(/^([a-z]{2})-([a-z]{2})$/i);
  
  if (match) {
    return {
      language: match[1].toLowerCase(),
      country: match[2].toUpperCase()
    };
  }
  
  return { language: null, country: null };
};

/**
 * Check if URL has language-country format
 * @param {string} pathname - The URL pathname
 * @returns {boolean} True if URL has proper format
 */
export const hasLanguageCountryFormat = (pathname) => {
  const { language, country } = extractLanguageCountryFromUrl(pathname);
  return language !== null && country !== null;
};

/**
 * Generate hreflang value from language and country
 * @param {string} language - Language code (e.g., "en")
 * @param {string} country - Country code (e.g., "US" or "us")
 * @returns {string} Formatted hreflang value (e.g., "en-US")
 */
export const generateHreflang = (language, country) => {
  if (!language || !country) return null;
  
  return `${language.toLowerCase()}-${country.toUpperCase()}`;
};

/**
 * Validate if a language-country combination exists in location data
 * @param {string} language - Language code
 * @param {string} country - Country code
 * @param {Array} locationData - Array of location objects
 * @returns {boolean} True if combination is valid
 */
export const isValidLanguageCountryCombination = (language, country, locationData) => {
  if (!locationData || !Array.isArray(locationData)) return false;
  if (!language || !country) return false;
  
  return locationData.some(location => 
    location.hreflang?.toLowerCase() === language.toLowerCase() &&
    location.country_code?.toLowerCase() === country.toLowerCase()
  );
};

/**
 * Get all hreflang links from the current page
 * @returns {Array} Array of hreflang objects
 */
export const getCurrentPageHreflangLinks = () => {
  if (typeof window === 'undefined') return [];
  
  const hreflangLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
  
  return Array.from(hreflangLinks).map(link => ({
    hreflang: link.getAttribute('hreflang'),
    href: link.getAttribute('href'),
    isValid: isValidHreflangFormat(link.getAttribute('hreflang'))
  })).filter(link => link.isValid);
};

/**
 * Create hreflang URL from base URL and language-country
 * @param {string} baseUrl - Base URL without language-country
 * @param {string} language - Language code
 * @param {string} country - Country code
 * @returns {string} Complete URL with language-country prefix
 */
export const createHreflangUrl = (baseUrl, language, country) => {
  if (!baseUrl || !language || !country) return baseUrl;
  
  // Remove trailing slash from baseUrl
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const hreflangPrefix = generateHreflang(language, country);
  
  return `${cleanBaseUrl}/${hreflangPrefix}`;
};

/**
 * Log hreflang detection status for debugging
 * @param {string} scenario - Current scenario (1 or 2)
 * @param {Object} details - Additional details to log
 */
export const logHreflangStatus = (scenario, details = {}) => {
  const prefix = scenario === '1' ? '🔄 Scenario 1' : '✅ Scenario 2';
  console.group(`${prefix}: Hreflang Status`);
  console.log('Has hreflang tags:', hasHreflangTags());
  console.log('URL format valid:', hasLanguageCountryFormat(details.pathname || ''));
  console.log('Details:', details);
  console.groupEnd();
};