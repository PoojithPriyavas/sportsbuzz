import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  parseUrlPath, 
  formatCountryData, 
  isValidLanguageCountry,
  getDefaultLanguageForCountry,
  buildUrlWithLanguageCountry
} from '@/utils/countryLanguageUtils';

export const useLanguageCountry = (locationsData) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [countryData, setCountryData] = useState(null);
  const [language, setLanguage] = useState('en');
  
  // Parse URL on mount and when URL changes
  useEffect(() => {
    if (!router.isReady || !locationsData) return;
    
    const { hreflang, countryCode } = parseUrlPath(router.asPath);
    
    // If URL has valid language-country format
    if (hreflang && countryCode) {
      handleExistingUrl(hreflang, countryCode);
    } else {
      // If URL doesn't have language-country format, detect user's location
      detectUserLocation();
    }
  }, [router.isReady, router.asPath, locationsData]);
  
  // Handle URL that already has language-country format
  const handleExistingUrl = async (hreflang, countryCode) => {
    setIsLoading(true);
    
    // Check if the language exists in our data
    const isLanguageValid = locationsData.some(location => 
      location.hreflang === hreflang
    );
    
    // Check if the country exists in our data
    const isCountryValid = locationsData.some(location => 
      location.country_code === countryCode
    );
    
    // If language is valid, set it
    if (isLanguageValid) {
      setLanguage(hreflang);
    }
    
    // If country is valid, set its data
    if (isCountryValid) {
      // Find country data in locations
      const countryInfo = locationsData.find(location => 
        location.country_code === countryCode
      );
      
      if (countryInfo) {
        setCountryData({
          country_code: countryInfo.country_code,
          location: { ...countryInfo }
        });
      }
    } else {
      // If country is invalid, use Sri Lanka as fallback
      const fallbackData = formatCountryData(null, locationsData);
      setCountryData(fallbackData);
      
      // Update URL with fallback country but keep the language if valid
      const newHreflang = isLanguageValid ? hreflang : fallbackData.location.hreflang;
      const newUrl = buildUrlWithLanguageCountry(
        newHreflang, 
        fallbackData.country_code, 
        router.asPath
      );
      
      router.replace(newUrl, undefined, { shallow: true });
    }
    
    setIsLoading(false);
  };
  
  // Detect user's location from API
  const detectUserLocation = async () => {
    setIsLoading(true);
    
    try {
      // Call the country code API
      const response = await fetch('https://admin.sportsbuz.com/api/get-country-code/');
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Format the country data
      const formattedData = formatCountryData(data, locationsData);
      setCountryData(formattedData);
      
      // Set language from country data
      setLanguage(formattedData.location.hreflang);
      
      // Update URL with detected location
      const newUrl = buildUrlWithLanguageCountry(
        formattedData.location.hreflang,
        formattedData.country_code,
        router.asPath
      );
      
      router.replace(newUrl, undefined, { shallow: true });
      
    } catch (error) {
      console.error('Failed to get user location:', error);
      
      // Use Sri Lanka as fallback
      const fallbackData = formatCountryData(null, locationsData);
      setCountryData(fallbackData);
      setLanguage(fallbackData.location.hreflang);
      
      // Update URL with fallback location
      const newUrl = buildUrlWithLanguageCountry(
        fallbackData.location.hreflang,
        fallbackData.country_code,
        router.asPath
      );
      
      router.replace(newUrl, undefined, { shallow: true });
    }
    
    setIsLoading(false);
  };
  
  // Handle language change from UI
  const handleLanguageChange = (newLanguage) => {
    if (!countryData) return;
    
    // Check if the language is valid
    const isLanguageValid = locationsData.some(location => 
      location.hreflang === newLanguage
    );
    
    if (isLanguageValid) {
      setLanguage(newLanguage);
      
      // Update URL with new language
      const newUrl = buildUrlWithLanguageCountry(
        newLanguage,
        countryData.country_code,
        router.asPath
      );
      
      router.push(newUrl, undefined, { shallow: true });
    }
  };
  
  // Handle country change from UI
  const handleCountryChange = (newCountryCode) => {
    // Check if the country is valid
    const isCountryValid = locationsData.some(location => 
      location.country_code === newCountryCode
    );
    
    if (isCountryValid) {
      // Get default language for the new country
      const defaultLanguage = getDefaultLanguageForCountry(newCountryCode, locationsData);
      
      // Find country data in locations
      const countryInfo = locationsData.find(location => 
        location.country_code === newCountryCode
      );
      
      if (countryInfo) {
        setCountryData({
          country_code: countryInfo.country_code,
          location: { ...countryInfo }
        });
        
        setLanguage(defaultLanguage);
        
        // Update URL with new country and its default language
        const newUrl = buildUrlWithLanguageCountry(
          defaultLanguage,
          newCountryCode,
          router.asPath
        );
        
        router.push(newUrl, undefined, { shallow: true });
      }
    }
  };
  
  return {
    isLoading,
    countryData,
    language,
    handleLanguageChange,
    handleCountryChange
  };
};