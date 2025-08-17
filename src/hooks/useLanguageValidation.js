// hooks/useLanguageValidation.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useGlobalData } from '@/components/Context/ApiContext';

export const useLanguageValidation = (locationDataHome, resolvedUrl) => {
    console.log(locationDataHome,"loc in lang val")
    const router = useRouter();
    const [isValidating, setIsValidating] = useState(false);
    const {setLanguage, setValidatedLocationData} = useGlobalData(); // Added setValidatedLocationData

    // Extract language and country from URL (now in format: languagecode-countrycode)
    const getUrlParts = () => {
        if (!resolvedUrl) return { countryPart: null, langPart: null };
        
        const locationParts = resolvedUrl.replace(/^,?\//, '').split('/');
        const [langPart, countryPart] = locationParts[0].split('-'); // Swapped order
        return { countryPart, langPart };
    };

    const { countryPart, langPart } = getUrlParts();

    // Function to get default language for a country
    const getDefaultLanguageForCountry = (countryCode) => {
        if (!locationDataHome || !Array.isArray(locationDataHome)) {
            return null;
        }

        const countryLanguages = locationDataHome.filter(location => 
            location.country_code?.toLowerCase() === countryCode?.toLowerCase()
        );

        return countryLanguages.length > 0 ? countryLanguages[0].hreflang : null;
    };

    // NEW: Function to check if language code exists anywhere in the response
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

        // First check if country code exists
        const countryExists = locationDataHome.some(location => 
            location.country_code?.toLowerCase() === countryCode?.toLowerCase()
        );

        if (!countryExists) {
            console.error(`Country code '${countryCode}' not found in location data`);
            return false;
        }

        // Then check if the language is supported for that country
        const isLanguageSupported = locationDataHome.some(location => 
            location.country_code?.toLowerCase() === countryCode?.toLowerCase() && 
            location.hreflang?.toLowerCase() === languageTag?.toLowerCase()
        );

        return isLanguageSupported;
    };

    // Function to construct new path (now in format: languagecode-countrycode)
    const constructNewPath = (countryCode, newLanguageTag, currentUrl) => {
        const pathParts = currentUrl.replace(/^\//, '').split('/');
        pathParts[0] = `${newLanguageTag.toLowerCase()}-${countryCode.toLowerCase()}`; // Swapped order
        return '/' + pathParts.join('/');
    };

    // Function to create and store validated location data object
    const createAndStoreValidatedLocationData = (countryCode, languageTag) => {
        if (!locationDataHome || !Array.isArray(locationDataHome)) {
            return;
        }

        // Find the matching location data
        const matchingLocation = locationDataHome.find(location => 
            location.country_code?.toLowerCase() === countryCode?.toLowerCase() && 
            location.hreflang?.toLowerCase() === languageTag?.toLowerCase()
        );

        if (matchingLocation) {
            const validatedLocationObject = {
                country_code: matchingLocation.country_code,
                location: matchingLocation
            };

            console.log('✅ Created validated location data:', validatedLocationObject);
            
            // Store it in the global context
            setValidatedLocationData(validatedLocationObject);
            
            return validatedLocationObject;
        }

        return null;
    };

    // Main validation effect
    useEffect(() => {
        const validateCurrentLanguage = () => {
            if (!locationDataHome || isValidating) {
                return;
            }

            // Add a guard to prevent processing if already on en-in
            const currentPath = resolvedUrl.replace(/^\//, '');
            if (currentPath.startsWith('en-in') && (!countryPart || !langPart)) {
                return; // Don't process if we're already on the default path
            }

            // If no country or language parts, redirect to default
            if (!countryPart || !langPart) {
                console.log('Missing country or language part, redirecting to default');
                
                // Extract remaining path after the first part
                const pathParts = resolvedUrl.replace(/^\//, '').split('/');
                pathParts.shift(); // Remove the first part (which might be incomplete)
                const remainingPath = pathParts.length > 0 ? '/' + pathParts.join('/') : '';
                
                router.replace('/en-in' + remainingPath);
                return;
            }

            setIsValidating(true);

            // First check if country exists in our data
            const countryExists = locationDataHome.some(location => 
                location.country_code?.toLowerCase() === countryPart?.toLowerCase()
            );

            if (!countryExists) {
                console.error(`❌ Country code '${countryPart}' not found. Redirecting to default country 'in'.`);
                // alert(`Error: Country '${countryPart.toUpperCase()}' is not supported. Redirecting to India (IN) with English.`);
                
                // Extract remaining path after the language-country part
                const pathParts = resolvedUrl.replace(/^\//, '').split('/');
                pathParts.shift(); // Remove the first part (language-country)
                const remainingPath = pathParts.length > 0 ? '/' + pathParts.join('/') : '';
                
                router.replace('/en-in' + remainingPath);
                setIsValidating(false);
                return;
            }

            // UPDATED: Check if language code exists anywhere in the response
            const languageExists = isLanguageCodeAvailable(langPart);
            
            if (languageExists) {
                console.log('✅ Language code validation successful:', langPart);
                
                // Set the language using the provided language code
                setLanguage(langPart);
                
                // Try to create validated location data if the combination exists
                const matchingLocation = locationDataHome.find(location => 
                    location.country_code?.toLowerCase() === countryPart?.toLowerCase() && 
                    location.hreflang?.toLowerCase() === langPart?.toLowerCase()
                );
                
                if (matchingLocation) {
                    createAndStoreValidatedLocationData(countryPart, langPart);
                }
                
                // Optionally show success alert only in development
                if (process.env.NODE_ENV === 'development') {
                    console.log(`Success: Language '${langPart}' is available in the system.`)
                }
            } else {
                console.error('❌ Language code not found in system:', langPart, 'Using default "en"');
                console.error(`Error: Language '${langPart}' is not available in the system. Using default language "en".`)
                
                // Use "en" as default and redirect with the same country
                const newPath = constructNewPath(countryPart, 'en', resolvedUrl);
                router.replace(newPath);
            }

            setIsValidating(false);
        };

        validateCurrentLanguage();
    }, [router.asPath, countryPart, langPart, locationDataHome]);

    // Helper functions for manual changes
    const handleLanguageChange = (newLanguageTag) => {
        // UPDATED: Check if language exists anywhere in the system
        const languageExists = isLanguageCodeAvailable(newLanguageTag);
        
        if (languageExists) {
            const newPath = constructNewPath(countryPart, newLanguageTag, resolvedUrl);
            router.push(newPath);
        } else {
            console.log(`Error: Language '${newLanguageTag}' is not available in the system. Using default "en".`)
            // Use "en" as fallback
            const newPath = constructNewPath(countryPart, 'en', resolvedUrl);
            router.push(newPath);
        }
    };

    const handleCountryChange = (newCountryCode) => {
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
            // alert(`Error: Country '${newCountryCode.toUpperCase()}' is not supported.`);
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

    // NEW: Get all available languages in the system
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
        handleLanguageChange,
        handleCountryChange,
        getSupportedLanguagesForCountry: getSupportedLanguagesForCountry(),
        getAllAvailableCountries: getAllAvailableCountries(),
        getAllAvailableLanguages: getAllAvailableLanguages(), // NEW: Added this
        validateLanguageForCountry,
        constructNewPath,
        createAndStoreValidatedLocationData,
        isLanguageCodeAvailable // NEW: Expose this function
    };
};