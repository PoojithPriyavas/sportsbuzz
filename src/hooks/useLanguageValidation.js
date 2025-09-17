// hooks/useLanguageValidation.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useGlobalData } from '@/components/Context/ApiContext';

export const useLanguageValidation = (locationDataHome, resolvedUrl) => {
    const router = useRouter();
    const [isValidating, setIsValidating] = useState(false);
    const [hasHreflangTags, setHasHreflangTags] = useState(false);
    const {setLanguage, setValidatedLocationData} = useGlobalData();

    // Check if current page has hreflang tags (Scenario 2)
    const checkHreflangTags = () => {
        if (typeof window === 'undefined') return false;
        
        const hreflangLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
        return hreflangLinks.length > 0;
    };

    // Extract language and country from URL (format: languagecode-countrycode)
    const getUrlParts = () => {
        if (!resolvedUrl) return { countryPart: null, langPart: null };
        
        const locationParts = resolvedUrl.replace(/^,?\//, '').split('/');
        const [langPart, countryPart] = locationParts[0].split('-');
        return { countryPart, langPart };
    };

    const { countryPart, langPart } = getUrlParts();

    // Function to get user's location from API
    const getUserLocation = async () => {
        try {
            const response = await fetch('https://admin.sportsbuz.com/api/get-country-code/');
            if (!response.ok) {
                throw new Error(`API call failed: ${response.status}`);
            }
            const data = await response.json();
            return data.country_code || data.countryCode;
        } catch (error) {
            console.error('Failed to get user location:', error);
            // Return fallback location (Sri Lanka)
            return 'LK';
        }
    };

    // Function to get default language for a country
    const getDefaultLanguageForCountry = (countryCode) => {
        if (!locationDataHome || !Array.isArray(locationDataHome)) {
            return 'en'; // fallback language
        }

        const countryLanguages = locationDataHome.filter(location => 
            location.country_code?.toLowerCase() === countryCode?.toLowerCase()
        );

        return countryLanguages.length > 0 ? countryLanguages[0].hreflang : 'en';
    };

    // Function to check if language code exists in the system
    const isLanguageCodeAvailable = (languageCode) => {
        if (!locationDataHome || !Array.isArray(locationDataHome)) {
            return false;
        }

        return locationDataHome.some(location => 
            location.hreflang?.toLowerCase() === languageCode?.toLowerCase()
        );
    };

    // Function to validate if language is supported for the country
    const validateLanguageForCountry = (countryCode, languageTag) => {
        if (!locationDataHome || !Array.isArray(locationDataHome)) {
            console.error('Location data is not available or invalid');
            return false;
        }

        const countryExists = locationDataHome.some(location => 
            location.country_code?.toLowerCase() === countryCode?.toLowerCase()
        );

        if (!countryExists) {
            console.error(`Country code '${countryCode}' not found in location data`);
            return false;
        }

        const isLanguageSupported = locationDataHome.some(location => 
            location.country_code?.toLowerCase() === countryCode?.toLowerCase() && 
            location.hreflang?.toLowerCase() === languageTag?.toLowerCase()
        );

        return isLanguageSupported;
    };

    // Function to construct new path (format: languagecode-countrycode)
    const constructNewPath = (countryCode, newLanguageTag, currentUrl) => {
        const pathParts = currentUrl.replace(/^\//, '').split('/');
        pathParts[0] = `${newLanguageTag.toLowerCase()}-${countryCode.toLowerCase()}`;
        return '/' + pathParts.join('/');
    };

    // Function to create and store validated location data object
    const createAndStoreValidatedLocationData = (countryCode, languageTag) => {
        if (!locationDataHome || !Array.isArray(locationDataHome)) {
            return;
        }

        const matchingLocation = locationDataHome.find(location => 
            location.country_code?.toLowerCase() === countryCode?.toLowerCase() && 
            location.hreflang?.toLowerCase() === languageTag?.toLowerCase()
        );

        if (matchingLocation) {
            const validatedLocationObject = {
                country_code: matchingLocation.country_code,
                location: matchingLocation
            };

            setValidatedLocationData(validatedLocationObject);
            return validatedLocationObject;
        }

        return null;
    };

    // SCENARIO 1: Handle URLs without hreflang tags
    const handleUrlWithoutHreflang = async () => {
        console.log('🔄 Scenario 1: URL without hreflang tags - calling location API');
        
        try {
            // Get user's current location from API
            const detectedCountryCode = await getUserLocation();
            const defaultLanguage = getDefaultLanguageForCountry(detectedCountryCode);
            
            // Extract remaining path after the first part
            const pathParts = resolvedUrl.replace(/^\//, '').split('/');
            pathParts.shift(); // Remove the first part (which might be incomplete)
            const remainingPath = pathParts.length > 0 ? '/' + pathParts.join('/') : '';
            
            // Construct the new URL with detected location
            const newUrl = `/${defaultLanguage}-${detectedCountryCode.toLowerCase()}${remainingPath}`;
            
            console.log(`📍 Detected location: ${detectedCountryCode}, redirecting to: ${newUrl}`);
            
            // Perform 302 temporary redirect
            router.replace(newUrl);
            
        } catch (error) {
            console.error('Error in Scenario 1:', error);
            // Fallback to default en-in
            const pathParts = resolvedUrl.replace(/^\//, '').split('/');
            pathParts.shift();
            const remainingPath = pathParts.length > 0 ? '/' + pathParts.join('/') : '';
            router.replace(`/en-in${remainingPath}`);
        }
    };

    // SCENARIO 2: Handle URLs with hreflang tags
    const handleUrlWithHreflang = () => {
        console.log('✅ Scenario 2: URL with hreflang tags - using existing implementation');
        
        // Validate the hreflang format (languagecode-countrycode)
        if (!countryPart || !langPart) {
            console.error('Invalid hreflang format in URL');
            return false;
        }

        // Validate if the language-country combination exists in our data
        const isValid = validateLanguageForCountry(countryPart, langPart);
        
        if (isValid) {
            console.log(`✅ Valid hreflang combination: ${langPart}-${countryPart}`);
            setLanguage(langPart);
            createAndStoreValidatedLocationData(countryPart, langPart);
            return true;
        } else {
            console.error(`❌ Invalid hreflang combination: ${langPart}-${countryPart}`);
            return false;
        }
    };

    // Main validation effect
    useEffect(() => {
        const validateCurrentLanguage = async () => {
            if (!locationDataHome || isValidating) {
                return;
            }

            setIsValidating(true);

            // Check if page has hreflang tags
            const hasHreflang = checkHreflangTags();
            setHasHreflangTags(hasHreflang);

            // Get current path without leading slash
            const currentPath = resolvedUrl.replace(/^\//, '');
            
            // Check if URL already has language-country format
            const hasLanguageCountryFormat = /^[a-z]{2}-[a-z]{2}/.test(currentPath);

            if (hasHreflang && hasLanguageCountryFormat) {
                // SCENARIO 2: Has hreflang tags and proper format
                const isValid = handleUrlWithHreflang();
                if (!isValid) {
                    // If validation fails, fall back to Scenario 1
                    await handleUrlWithoutHreflang();
                }
            } else {
                // SCENARIO 1: No hreflang tags or improper format
                await handleUrlWithoutHreflang();
            }

            setIsValidating(false);
        };

        // Add a small delay to ensure DOM is ready for hreflang tag checking
        const timer = setTimeout(validateCurrentLanguage, 100);
        return () => clearTimeout(timer);
        
    }, [router.asPath, locationDataHome]);

    // Helper functions for manual changes
    const handleLanguageChange = (newLanguageTag) => {
        const languageExists = isLanguageCodeAvailable(newLanguageTag);
        
        if (languageExists) {
            const newPath = constructNewPath(countryPart, newLanguageTag, resolvedUrl);
            router.push(newPath);
        } else {
            console.log(`Error: Language '${newLanguageTag}' is not available. Using default "en".`);
            const newPath = constructNewPath(countryPart, 'en', resolvedUrl);
            router.push(newPath);
        }
    };

    const handleCountryChange = async (newCountryCode) => {
        const countryExists = locationDataHome?.some(location => 
            location.country_code?.toLowerCase() === newCountryCode?.toLowerCase()
        );

        if (countryExists) {
            const defaultLanguage = getDefaultLanguageForCountry(newCountryCode);
            if (defaultLanguage) {
                const newPath = constructNewPath(newCountryCode, defaultLanguage, resolvedUrl);
                router.push(newPath);
            }
        } else {
            console.error(`Error: Country '${newCountryCode.toUpperCase()}' is not supported.`);
        }
    };

    // Get supported languages for current country
    const getSupportedLanguagesForCountry = () => {
        if (!locationDataHome || !Array.isArray(locationDataHome)) {
            return [];
        }

        return locationDataHome
            .filter(location => location.country_code?.toLowerCase() === countryPart?.toLowerCase())
            .map(location => ({
                hreflang: location.hreflang,
                language: location.language
            }));
    };

    // Get all available languages in the system
    const getAllAvailableLanguages = () => {
        if (!locationDataHome || !Array.isArray(locationDataHome)) {
            return [];
        }

        const uniqueLanguages = locationDataHome.reduce((acc, location) => {
            const langKey = location.hreflang?.toLowerCase();
            if (langKey && !acc.find(item => item.hreflang === langKey)) {
                acc.push({
                    hreflang: location.hreflang,
                    language: location.language
                });
            }
            return acc;
        }, []);

        return uniqueLanguages;
    };

    // Get all available countries
    const getAllAvailableCountries = () => {
        if (!locationDataHome || !Array.isArray(locationDataHome)) {
            return [];
        }

        const uniqueCountries = locationDataHome.reduce((acc, location) => {
            const countryKey = location.country_code?.toLowerCase();
            if (countryKey && !acc.find(item => item.country_code === countryKey)) {
                acc.push({
                    country_code: countryKey,
                    country: location.country
                });
            }
            return acc;
        }, []);

        return uniqueCountries;
    };

    return {
        countryPart,
        langPart,
        isValidating,
        hasHreflangTags,
        handleLanguageChange,
        handleCountryChange,
        getSupportedLanguagesForCountry: getSupportedLanguagesForCountry(),
        getAllAvailableCountries: getAllAvailableCountries(),
        getAllAvailableLanguages: getAllAvailableLanguages(),
        validateLanguageForCountry,
        constructNewPath,
        createAndStoreValidatedLocationData,
        isLanguageCodeAvailable,
        getUserLocation // Expose for external use if needed
    };
};