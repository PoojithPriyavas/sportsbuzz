// hooks/useLanguageValidation.js
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useGlobalData } from '@/components/Context/ApiContext';

export const useLanguageValidation = (locationDataHome, resolvedUrl) => {
    const router = useRouter();
    const [isValidating, setIsValidating] = useState(false);
    const [hasHreflangTags, setHasHreflangTags] = useState(false);
    const {language, setLanguage, setValidatedLocationData} = useGlobalData();
    
    // Add a ref to track user-initiated navigation
    const isUserInitiatedNavigation = useRef(false);
    const navigationTimeout = useRef(null);
    const previousLanguage = useRef(language);

    // Check if current page has hreflang tags (Scenario 2)
    const checkHreflangTags = () => {
        if (typeof window === 'undefined') return false;
        
        const hreflangLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
        return hreflangLinks.length > 0;
    };

    // Extract language and country from URL (format: languagecode-countrycode)
    const getUrlParts = () => {
        if (!resolvedUrl) return { countryPart: null, langPart: null };
        
        console.log("🔍 DEBUG - getUrlParts resolvedUrl:", resolvedUrl);
        const locationParts = resolvedUrl.replace(/^,?\//, '').split('/');
        console.log("🔍 DEBUG - locationParts:", locationParts);
        const [langPart, countryPart] = locationParts[0].split('-');
        console.log("🔍 DEBUG - extracted parts:", { langPart, countryPart });
        return { countryPart, langPart };
    };

    const { countryPart, langPart } = getUrlParts();
    console.log("🔍 DEBUG - Final URL parts:", { countryPart, langPart });

    // Function to check if user is accessing from root domain (sportsbuz.com/)
    const isRootDomainAccess = () => {
        const currentPath = resolvedUrl.replace(/^\//, '');
        // Check if it's exactly root or has no language-country format
        return currentPath === '' || !(/^[a-z]{2}-[a-z]{2}/.test(currentPath));
    };

    // Function to get user's location from API
    const getUserLocation = async () => {
        // Check if data is already available before making API call
        if (countryDataHome?.country_code) {
            return countryDataHome.country_code;
        }
        
        // Check cookies/cache before API call
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

    // NEW: Function to validate hreflang against location API response
    const validateHreflangInLocationData = (languageTag) => {
        if (!locationDataHome || !Array.isArray(locationDataHome)) {
            console.error('Location data is not available for hreflang validation');
            return false;
        }

        const isHreflangSupported = locationDataHome.some(location => 
            location.hreflang?.toLowerCase() === languageTag?.toLowerCase()
        );

        console.log(`🔍 Validating hreflang '${languageTag}' against location API:`, isHreflangSupported);
        return isHreflangSupported;
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

    // SCENARIO 1: Handle URLs without hreflang tags (only for root domain access)
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
            // Fallback to default en-lk (Sri Lanka)
            const pathParts = resolvedUrl.replace(/^\//, '').split('/');
            pathParts.shift();
            const remainingPath = pathParts.length > 0 ? '/' + pathParts.join('/') : '';
            router.replace(`/en-lk${remainingPath}`);
        }
    };

    // SCENARIO 2: Handle URLs with hreflang tags (validate against location API)
    const handleUrlWithHreflang = () => {
        console.log('✅ Scenario 2: URL with hreflang tags - validating against location API');
        console.log('🔍 DEBUG - countryPart:', countryPart, 'langPart:', langPart);
        console.log('🔍 DEBUG - isUserInitiatedNavigation:', isUserInitiatedNavigation.current);
        console.log('🔍 DEBUG - previousLanguage:', previousLanguage.current, 'currentLanguage:', language);
        
        // Validate the hreflang format (languagecode-countrycode)
        if (!countryPart || !langPart) {
            console.error('🔍 DEBUG - Invalid hreflang format in URL - missing parts');
            return false;
        }

        // Check if this is a language change initiated from HeaderThree
        // by comparing the URL language with the global language state
        const isLanguageChangeFromHeader = langPart === language && previousLanguage.current !== language;
        
        if (isLanguageChangeFromHeader) {
            console.log('🔍 Language change detected from HeaderThree, allowing to proceed');
            previousLanguage.current = language;
            return true;
        }

        // NEW: First check if the hreflang exists in location API response
        const isHreflangInLocationData = validateHreflangInLocationData(langPart);
        
        if (!isHreflangInLocationData) {
            // Only revert if this is NOT a user-initiated navigation
            if (!isUserInitiatedNavigation.current) {
                console.warn(`⚠️ Hreflang '${langPart}' not found in location API response, reverting to previous value`);
                
                // Get the previous language value from global context
                const revertLanguage = previousLanguage.current || 'en'; // fallback to 'en' if no previous language
                
                // Construct new path with previous language
                const pathParts = resolvedUrl.replace(/^\//, '').split('/');
                pathParts[0] = `${revertLanguage}-${countryPart.toLowerCase()}`;
                const newPath = '/' + pathParts.join('/');
                
                console.log(`🔄 Reverting to previous language '${revertLanguage}': ${newPath}`);
                router.replace(newPath);
                return false;
            } else {
                console.log(`🔍 User-initiated navigation detected, allowing invalid hreflang '${langPart}' to proceed`);
                // Reset the flag after processing
                isUserInitiatedNavigation.current = false;
                // Clear any pending timeout
                if (navigationTimeout.current) {
                    clearTimeout(navigationTimeout.current);
                    navigationTimeout.current = null;
                }
            }
        }

        // Update previous language reference
        previousLanguage.current = langPart;

        // Then validate if the language-country combination exists in our data
        const isValid = validateLanguageForCountry(countryPart, langPart);
        console.log('🔍 DEBUG - validateLanguageForCountry result:', isValid);
        
        if (isValid) {
            console.log(`✅ Valid hreflang combination: ${langPart}-${countryPart}`);
            setLanguage(langPart);
            createAndStoreValidatedLocationData(countryPart, langPart);
            return true;
        } else {
            // Only revert if this is NOT a user-initiated navigation
            if (!isUserInitiatedNavigation.current && !isLanguageChangeFromHeader) {
                console.error(`❌ Invalid hreflang combination: ${langPart}-${countryPart}`);
                
                // Get the previous language value from global context
                const revertLanguage = previousLanguage.current || 'en'; // fallback to 'en' if no previous language
                
                // Construct new path with previous language
                const pathParts = resolvedUrl.replace(/^\//, '').split('/');
                pathParts[0] = `${revertLanguage}-${countryPart.toLowerCase()}`;
                const newPath = '/' + pathParts.join('/');
                
                console.log(`🔄 Reverting to previous language '${revertLanguage}': ${newPath}`);
                router.replace(newPath);
                return false;
            } else {
                console.log(`🔍 User-initiated navigation or header change detected, allowing invalid combination to proceed`);
                // Reset the flag after processing
                isUserInitiatedNavigation.current = false;
                // Clear any pending timeout
                if (navigationTimeout.current) {
                    clearTimeout(navigationTimeout.current);
                    navigationTimeout.current = null;
                }
            }
        }

        return true;
    };

    // Main validation effect
    useEffect(() => {
        const validateCurrentLanguage = async () => {
            if (!locationDataHome || isValidating) {
                console.log("🔍 DEBUG - Skipping validation:", { locationDataHome: !!locationDataHome, isValidating });
                return;
            }
    
            setIsValidating(true);
            console.log("🔍 DEBUG - Starting validation for resolvedUrl:", resolvedUrl);
    
            // Check if this is a root domain access
            const isRootAccess = isRootDomainAccess();
            console.log("🔍 DEBUG - isRootAccess:", isRootAccess);
    
            // Check if page has hreflang tags
            const hasHreflang = checkHreflangTags();
            setHasHreflangTags(hasHreflang);
            console.log("🔍 DEBUG - hasHreflang:", hasHreflang);
    
            // Get current path without leading slash
            const currentPath = resolvedUrl.replace(/^\//, '');
            console.log("🔍 DEBUG - currentPath:", currentPath);
            
            // Special handling for blog-details URLs
            const isBlogDetailsUrl = currentPath.includes('/blog-details/');
            console.log("🔍 DEBUG - isBlogDetailsUrl:", isBlogDetailsUrl);
            
            // Check if URL already has language-country format
            // For blog-details, be more lenient with the format check
            let hasLanguageCountryFormat;
            if (isBlogDetailsUrl) {
                // More specific regex for blog-details URLs
                hasLanguageCountryFormat = /^[a-z]{2}-[a-z]{2}\/blog-details\//.test(currentPath);
                console.log("🔍 DEBUG - Blog details format check:", hasLanguageCountryFormat);
            } else {
                hasLanguageCountryFormat = /^[a-z]{2}-[a-z]{2}/.test(currentPath);
                console.log("🔍 DEBUG - Regular format check:", hasLanguageCountryFormat);
            }
    
            console.log("🔍 DEBUG - Final hasLanguageCountryFormat:", hasLanguageCountryFormat);
    
            // NEW LOGIC: Only apply location-based redirection for root domain access
            if (isRootAccess && !hasLanguageCountryFormat && !isBlogDetailsUrl) {
                // SCENARIO 1: Root domain access without hreflang format - use location API
                console.log("🔍 DEBUG - Scenario 1: Root access without format, using location API");
                await handleUrlWithoutHreflang();
            } else if (hasLanguageCountryFormat) {
                // SCENARIO 2: Has hreflang format - validate against location API
                console.log("🔍 DEBUG - Scenario 2: Has hreflang format, validating against location API");
                const isValid = handleUrlWithHreflang();
                console.log("🔍 DEBUG - handleUrlWithHreflang result:", isValid);
            } else if (isBlogDetailsUrl) {
                console.log("🔍 DEBUG - Blog details URL, skipping validation");
            } else {
                console.log("🔍 DEBUG - Non-root access without proper format, allowing to proceed");
            }
    
            setIsValidating(false);
        };
    
        // Add a small delay to ensure DOM is ready for hreflang tag checking
        const timer = setTimeout(validateCurrentLanguage, 100);
        return () => clearTimeout(timer);
        
    }, [router.asPath, locationDataHome]);

    // Track language changes to detect HeaderThree initiated changes
    useEffect(() => {
        if (language && language !== previousLanguage.current) {
            console.log('🔍 Language changed in global context:', previousLanguage.current, '->', language);
        }
    }, [language]);

    // Helper functions for manual changes
    const handleLanguageChange = (newLanguageTag) => {
        // Set flag to indicate this is a user-initiated navigation
        isUserInitiatedNavigation.current = true;
        
        // Set a timeout to reset the flag in case navigation doesn't happen
        navigationTimeout.current = setTimeout(() => {
            isUserInitiatedNavigation.current = false;
            navigationTimeout.current = null;
        }, 2000); // Reset after 2 seconds
        
        // NEW: Validate against location API response first
        const isHreflangInLocationData = validateHreflangInLocationData(newLanguageTag);
        
        if (!isHreflangInLocationData) {
            console.log(`Error: Language '${newLanguageTag}' is not available in location API response. Using default "en".`);
            const newPath = constructNewPath(countryPart, 'en', resolvedUrl);
            router.push(newPath);
            return;
        }

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
        getUserLocation, // Expose for external use if needed
        validateHreflangInLocationData // NEW: Expose the new validation function
    };
};