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

            // If no country or language parts, redirect to default
            if (!countryPart || !langPart) {
                console.log('Missing country or language part, redirecting to default');
                const remainingPath = resolvedUrl.substring(resolvedUrl.indexOf('/', 1)) || '';
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
                const remainingPath = resolvedUrl.substring(resolvedUrl.indexOf('/', 1)) || '';
                router.replace('/en-in' + remainingPath);
                setIsValidating(false);
                return;
            }

            const isValidCombination = validateLanguageForCountry(countryPart, langPart);
            
            if (isValidCombination) {
                console.log('✅ Language validation successful:', langPart, '-', countryPart);
                
                // Find the matching location data to get the exact hreflang
                const matchingLocation = locationDataHome.find(location => 
                    location.country_code?.toLowerCase() === countryPart?.toLowerCase() && 
                    location.hreflang?.toLowerCase() === langPart?.toLowerCase()
                );
                
                // Set the language using the hreflang from the matching location
                if (matchingLocation) {
                    setLanguage(matchingLocation.hreflang);
                    
                    // Create and store the validated location data object
                    createAndStoreValidatedLocationData(countryPart, langPart);
                }
                
                // Optionally show success alert only in development
                if (process.env.NODE_ENV === 'development') {
                    // alert(`Success: Language '${langPart}' is supported for country '${countryPart.toUpperCase()}'.`);
                    console.log(`Success: Language '${langPart}' is supported for country '${countryPart.toUpperCase()}'.`)
                }
            } else {
                console.error('❌ Language validation failed:', langPart, '-', countryPart);
                // alert(`Error: Language '${langPart}' is not supported for country '${countryPart.toUpperCase()}'. Redirecting to default language.`);
                console.error(`Error: Language '${langPart}' is not supported for country '${countryPart.toUpperCase()}'. Redirecting to default language.`)
                
                const defaultLanguage = getDefaultLanguageForCountry(countryPart);
                
                if (defaultLanguage) {
                    const newPath = constructNewPath(countryPart, defaultLanguage, resolvedUrl);
                    router.replace(newPath);
                } else {
                    console.error(`No languages found for country '${countryPart}'. Redirecting to default.`);
                    const remainingPath = resolvedUrl.substring(resolvedUrl.indexOf('/', 1)) || '';
                    router.replace('/en-in' + remainingPath);
                }
            }

            setIsValidating(false);
        };

        validateCurrentLanguage();
    }, [router.asPath, countryPart, langPart, locationDataHome]);

    // Helper functions for manual changes
    const handleLanguageChange = (newLanguageTag) => {
        const isLanguageSupported = validateLanguageForCountry(countryPart, newLanguageTag);
        
        if (isLanguageSupported) {
            const newPath = constructNewPath(countryPart, newLanguageTag, resolvedUrl);
            router.push(newPath);
        } else {
            // alert(`Error: Language '${newLanguageTag}' is not supported for country '${countryPart.toUpperCase()}'.`);
            console.log(`Error: Language '${newLanguageTag}' is not supported for country '${countryPart.toUpperCase()}'.`)
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
        validateLanguageForCountry,
        constructNewPath,
        createAndStoreValidatedLocationData // Expose this function if needed elsewhere
    };
};