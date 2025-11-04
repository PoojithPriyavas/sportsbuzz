'use client';
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import CustomAxios from '../utilities/CustomAxios';
import axios from 'axios';
import { fetchTournaments } from '@/pages/api/get-tournaments';
import { fetchOneXTournaments } from '@/pages/api/get-onex-tournaments';
import { fetchEventsIds } from '@/pages/api/get-events';
import { fetchOneXEventsIds } from '@/pages/api/get-onex-events';
import { fetchSportEventDetails } from '@/pages/api/get-teamnames';
import { fetchOneXSportEventDetails } from '@/pages/api/get-onex-teamnames';
import { countryTimezones } from '../utilities/CountryTimezones';
import { useCallback } from 'react';
import { parseUrlPath } from '../utilities/ParseUrl';
import { usePathname } from 'next/navigation';
import { sriLankaFallbackData, processCountryCodeResponse } from '@/utils/countryFallback';


const DataContext = createContext();


export const DataProvider = ({ children, countryDataHome }) => {
    // Data caching state
    const [dataCache, setDataCache] = useState({
        cricket: {
            matches: null,
            upcomingMatches: null,
            types: null,
            teamImages: {}
        },
        football: {
            liveMatches: null,
            upcomingMatches: null
        }
    });
    const [initialDataLoaded, setInitialDataLoaded] = useState(false);

    const [blogCategories, setBlogCategories] = useState([]);
    const [recentBlogs, setrecentBlogs] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [blogsForPage, setBlogsForPage] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalBlogs, setTotalBlogs] = useState(0);
    const [nextUrl, setNextUrl] = useState(null);
    const [prevUrl, setPrevUrl] = useState(null);
    const [sections, setSections] = useState([]);
    const [bestSections, setBestSections] = useState([]);
    // const [sport, setSport] = useState('cricket');
    const [country, setCountry] = useState('India');
    const [countryCodeCookie, setCountryCodeCookie] = useState('in')
    const [hreflang, setHreflang] = useState('en');
    const [locationData, setLocationData] = useState(null);
    const [countryData, setCountryData] = useState(null);
    const [validatedLocationData, setValidatedLocationData] = useState(null);
    // console.log(validatedLocationData, "validated location data")
    const [matchTeams, setMatchTeams] = useState(null);
    const pathname = usePathname();
    // console.log(pathname, "path name")
    // const isUrlCountryPresent = pathname?.replace(/^,?\//, '').split('-');
    // console.log(isUrlCountryPresent[1], "is url")

    //  TIME ZONE IMPLEMENTATION
    const [banners, setBanners] = useState([]);
    const [bannerLoading, setBannerLoading] = useState(true);

    const [currentTimezone, setCurrentTimezone] = useState('+0.00');
    
    // Translation cache to avoid repeat API calls
    const [translationCache, setTranslationCache] = useState({});
    const translationCacheRef = useRef({});

    const getTimezoneByCountryCode = (code) => {
        // console.log(code, "code in country data")
        const country = countryTimezones.find(item => item[0] === code);
        // console.log(country, "countrydfdfgdfgd")
        return country ? country[1] : '+0.00';
    };

    // GET COUNTRY CODE API IMPLEMENTATION

    const [countryCode, setCountryCode] = useState({});



    const getCountryCode = async () => {
        try {
            if (validatedLocationData && validatedLocationData.country_code) {
                // Use validated location data if available
                setCountryCode(validatedLocationData);
                setCurrentTimezone(getTimezoneByCountryCode(validatedLocationData.country_code));
            } else {
                // Fetch locations data first
                const locationsRes = await fetch('https://admin.sportsbuz.com/api/locations');
                let locationsData = [];

                if (locationsRes.ok) {
                    locationsData = await locationsRes.json();
                }

                // Then fetch country code
                const response = await fetch('https://admin.sportsbuz.com/api/get-country-code');

                // Check if the response is successful
                if (!response.ok) {
                    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
                }

                // Parse the JSON response
                const data = await response.json();

                // Process the response with fallback logic using locations data
                const countryData = data && data.country_code ?
                    data :
                    processCountryCodeResponse(data, locationsData);

                setCountryCode(countryData);
                setCurrentTimezone(getTimezoneByCountryCode(countryData.country_code));
            }
        } catch (error) {
            console.error('Failed to fetch country code:', error);

            // Fetch locations data for fallback
            try {
                const locationsRes = await fetch('https://admin.sportsbuz.com/api/locations');

                if (locationsRes.ok) {
                    const locationsData = await locationsRes.json();

                    // Find Sri Lanka in locations data
                    const sriLankaLocation = locationsData.find(location =>
                        location.country_code === "LK"
                    ) || locationsData[0];

                    // Format Sri Lanka data to match get-country-code API response
                    const fallbackData = {
                        country_code: sriLankaLocation.country_code,
                        location: { ...sriLankaLocation }
                    };

                    setCountryCode(fallbackData);
                    setCurrentTimezone(getTimezoneByCountryCode(fallbackData.country_code));
                    return;
                }
            } catch (fallbackError) {
                console.error('Failed to fetch locations data for fallback:', fallbackError);
            }

            // Ultimate fallback to static data if everything else fails
            // console.log('Using Sri Lanka as fallback due to error:', error);
            setCountryCode(sriLankaFallbackData);
            setCurrentTimezone(getTimezoneByCountryCode(sriLankaFallbackData.country_code));
        }
    };

    // useEffect to call getCountryCode when validatedLocationData changes
    useEffect(() => {
        // Only call API if no country data is available from props or cache
        if (!validatedLocationData && !countryDataHome) {
            getCountryCode();
        } else if (validatedLocationData) {
            setCountryCode(validatedLocationData);
            setCurrentTimezone(getTimezoneByCountryCode(validatedLocationData.country_code));
        } else if (countryDataHome) {
            setCountryCode(countryDataHome);
            setCurrentTimezone(getTimezoneByCountryCode(countryDataHome.country_code));
        }
    }, [validatedLocationData, countryDataHome]);

    // FETCH LOCATION

    const [location, setLocation] = useState([]);

    const fetchLocation = async () => {
        try {
            const res = await axios.get('https://admin.sportsbuz.com/api/locations');
            setLocation(res.data || []);
        } catch (error) {
            console.error('Failed to fetch locations:', error);
        }
    };


    // TRANSLATION API IMPLEMENTATION
    
// translation codes in apiContext
    const [language, setLanguage] = useState('en');

    // Replace the translateText function in ApiContext with this updated version

    const debugTranslateText = async (textInput, from = 'en', toLang = language) => {
        const langMap = {
            English: 'en',
            Malayalam: 'ml',
        };
        const to = langMap[toLang] || toLang;
        const fromCode = langMap[from] || from;

        // If source and target languages are the same, return the input as is
        if (fromCode === to) {
            if (typeof textInput === 'object' && textInput !== null && !Array.isArray(textInput)) {
                // Handle grouped texts
                const result = {};
                Object.entries(textInput).forEach(([key, value]) => {
                    result[key] = Array.isArray(value) ? value.map(item => typeof item === 'string' ? item : item.text) : value;
                });
                return result;
            } else if (Array.isArray(textInput)) {
                // Handle array of texts
                return textInput.map(item => item.text || item);
            } else {
                // Handle single text
                return textInput;
            }
        }

        try {
            // Handle different input formats
            if (typeof textInput === 'object' && textInput !== null && !Array.isArray(textInput)) {
                // New format: Handle grouped texts (for header, categories, subcategories)
                const response = await axios.post('/api/translate', {
                    textGroups: textInput,
                    from: fromCode,
                    to,
                });
                return response.data;
            } else if (Array.isArray(textInput)) {
                // Batch translation
                const texts = textInput.map(item => ({
                    text: typeof item === 'string' ? item : item.text
                }));
                const response = await axios.post('/api/debug/debug-translate', {
                    texts,
                    from: fromCode,
                    to,
                });
                return response.data;
            } else {
                // Single text translation
                const response = await axios.post('/api/debug/debug-translate', {
                    text: textInput,
                    from: fromCode,
                    to,
                });
                return response.data;
            }
        } catch (error) {
            console.error('Translation error:', error);
            // Return original text(s) in case of error
            if (typeof textInput === 'object' && textInput !== null && !Array.isArray(textInput)) {
                // Handle grouped texts
                const result = {};
                Object.entries(textInput).forEach(([key, value]) => {
                    result[key] = Array.isArray(value) ? value.map(item => typeof item === 'string' ? item : item.text) : value;
                });
                return result;
            } else if (Array.isArray(textInput)) {
                // Handle array of texts
                return textInput.map(item => item.text || item);
            } else {
                // Handle single text
                return textInput;
            }
        }
    };


    const translateText = async (textInput, from = 'en', toLang = language) => {
        const langMap = {
            English: 'en',
            Malayalam: 'ml',
        };
        const to = langMap[toLang] || toLang;
        const fromCode = langMap[from] || from;

        // If source and target languages are the same, return the input as is
        if (fromCode === to) {
            if (typeof textInput === 'object' && textInput !== null && !Array.isArray(textInput)) {
                // Handle grouped texts
                const result = {};
                Object.entries(textInput).forEach(([key, value]) => {
                    result[key] = Array.isArray(value) ? value.map(item => typeof item === 'string' ? item : item.text) : value;
                });
                return result;
            } else if (Array.isArray(textInput)) {
                // Handle array of texts
                return textInput.map(item => item.text || item);
            } else {
                // Handle single text
                return textInput;
            }
        }

        // Get cache key for this language pair
        const cacheKey = `${fromCode}-${to}`;
        if (!translationCacheRef.current[cacheKey]) {
            translationCacheRef.current[cacheKey] = {};
            // Try to load from localStorage if available
            if (typeof window !== 'undefined') {
                try {
                    const savedCache = localStorage.getItem(`translation-cache-${cacheKey}`);
                    if (savedCache) {
                        translationCacheRef.current[cacheKey] = JSON.parse(savedCache);
                    }
                } catch (e) {
                    console.warn('Failed to load translation cache from localStorage', e);
                }
            }
        }

        try {
            // Handle different input formats
            if (typeof textInput === 'object' && textInput !== null && !Array.isArray(textInput)) {
                // New format: Handle grouped texts (for header, categories, subcategories)
                const textGroups = { ...textInput };
                const uncachedGroups = {};
                let allCached = true;
                
                // Check what we already have in cache
                Object.entries(textGroups).forEach(([key, values]) => {
                    if (Array.isArray(values)) {
                        const uncachedValues = [];
                        const cachedResults = [];
                        
                        values.forEach((item, index) => {
                            const text = typeof item === 'string' ? item : item.text;
                            if (text && translationCacheRef.current[cacheKey][text]) {
                                cachedResults[index] = translationCacheRef.current[cacheKey][text];
                            } else {
                                uncachedValues.push({ text, index });
                                allCached = false;
                            }
                        });
                        
                        if (uncachedValues.length > 0) {
                            uncachedGroups[key] = uncachedValues.map(item => item.text);
                        }
                        
                        // Store the cached results and their positions
                        textGroups[key] = { cachedResults, originalValues: values };
                    } else {
                        // Handle non-array values
                        if (values && translationCacheRef.current[cacheKey][values]) {
                            textGroups[key] = translationCacheRef.current[cacheKey][values];
                        } else {
                            uncachedGroups[key] = values;
                            allCached = false;
                        }
                    }
                });
                
                // If everything was cached, return the cached results
                if (allCached) {
                    const result = {};
                    Object.entries(textGroups).forEach(([key, value]) => {
                        if (value && value.cachedResults && value.originalValues) {
                            // Reconstruct the array from cached results
                            result[key] = value.originalValues.map((_, i) => 
                                value.cachedResults[i] || value.originalValues[i]);
                        } else {
                            result[key] = value;
                        }
                    });
                    return result;
                }
                
                // Only send uncached items to the API
                const response = await axios.post('/api/translate', {
                    textGroups: uncachedGroups,
                    from: fromCode,
                    to,
                });
                
                // Merge API results with cached results and update cache
                const apiResults = response.data || {};
                const result = {};
                
                Object.entries(textGroups).forEach(([key, value]) => {
                    if (value && value.cachedResults && value.originalValues) {
                        // Handle arrays with some cached items
                        const apiResultsForKey = apiResults[key] || [];
                        const uncachedForKey = uncachedGroups[key] || [];
                        const mergedResults = [...value.originalValues];
                        
                        // Map uncached values back to their original positions
                        let apiIndex = 0;
                        value.originalValues.forEach((originalItem, i) => {
                            const originalText = typeof originalItem === 'string' ? originalItem : originalItem.text;
                            if (!value.cachedResults[i] && originalText) {
                                if (apiResultsForKey[apiIndex]) {
                                    mergedResults[i] = apiResultsForKey[apiIndex];
                                    // Update cache
                                    translationCacheRef.current[cacheKey][originalText] = apiResultsForKey[apiIndex];
                                    apiIndex++;
                                }
                            } else {
                                mergedResults[i] = value.cachedResults[i];
                            }
                        });
                        
                        result[key] = mergedResults;
                    } else if (apiResults[key]) {
                        // Handle non-array or fully uncached arrays
                        result[key] = apiResults[key];
                        // Update cache for non-array values
                        if (typeof textInput[key] === 'string') {
                            translationCacheRef.current[cacheKey][textInput[key]] = apiResults[key];
                        }
                    } else {
                        // Use cached value
                        result[key] = value;
                    }
                });
                
                // Save updated cache to localStorage
                if (typeof window !== 'undefined') {
                    try {
                        localStorage.setItem(
                            `translation-cache-${cacheKey}`, 
                            JSON.stringify(translationCacheRef.current[cacheKey])
                        );
                    } catch (e) {
                        console.warn('Failed to save translation cache to localStorage', e);
                    }
                }
                
                return result;
            } else if (Array.isArray(textInput)) {
                // Batch translation with caching
                const textsToTranslate = [];
                const cachedTranslations = [];
                const originalIndices = [];
                
                // Check what we already have in cache
                textInput.forEach((item, index) => {
                    const text = typeof item === 'string' ? item : item.text;
                    if (text && translationCacheRef.current[cacheKey][text]) {
                        cachedTranslations[index] = translationCacheRef.current[cacheKey][text];
                    } else if (text) {
                        textsToTranslate.push({ text });
                        originalIndices.push(index);
                    } else {
                        // Handle null/undefined items
                        cachedTranslations[index] = item;
                    }
                });
                
                // If everything was cached, return the cached results
                if (textsToTranslate.length === 0) {
                    return textInput.map((_, i) => cachedTranslations[i] || textInput[i]);
                }
                
                // Only send uncached items to the API
                const response = await axios.post('/api/translate', {
                    texts: textsToTranslate,
                    from: fromCode,
                    to,
                });
                
                // Merge API results with cached results
                const apiResults = response.data || [];
                const result = [...textInput]; // Create a copy to preserve original structure
                
                // Place API results in their original positions
                apiResults.forEach((translation, i) => {
                    const originalIndex = originalIndices[i];
                    result[originalIndex] = translation;
                    
                    // Update cache
                    const originalText = typeof textInput[originalIndex] === 'string' 
                        ? textInput[originalIndex] 
                        : textInput[originalIndex]?.text;
                    if (originalText) {
                        translationCacheRef.current[cacheKey][originalText] = translation;
                    }
                });
                
                // Fill in cached translations
                textInput.forEach((_, i) => {
                    if (cachedTranslations[i]) {
                        result[i] = cachedTranslations[i];
                    }
                });
                
                // Save updated cache to localStorage
                if (typeof window !== 'undefined') {
                    try {
                        localStorage.setItem(
                            `translation-cache-${cacheKey}`, 
                            JSON.stringify(translationCacheRef.current[cacheKey])
                        );
                    } catch (e) {
                        console.warn('Failed to save translation cache to localStorage', e);
                    }
                }
                
                return result;
            } else {
                // Single text translation with caching
                if (textInput && translationCacheRef.current[cacheKey][textInput]) {
                    return translationCacheRef.current[cacheKey][textInput];
                }
                
                const response = await axios.post('/api/translate', {
                    text: textInput,
                    from: fromCode,
                    to,
                });
                
                const translation = response.data;
                
                // Update cache
                if (textInput && translation) {
                    translationCacheRef.current[cacheKey][textInput] = translation;
                    
                    // Save to localStorage
                    if (typeof window !== 'undefined') {
                        try {
                            localStorage.setItem(
                                `translation-cache-${cacheKey}`, 
                                JSON.stringify(translationCacheRef.current[cacheKey])
                            );
                        } catch (e) {
                            console.warn('Failed to save translation cache to localStorage', e);
                        }
                    }
                }
                
                return translation;
            }
        } catch (error) {
            console.error('Translation error:', error);
            // Return original text(s) in case of error
            if (typeof textInput === 'object' && textInput !== null && !Array.isArray(textInput)) {
                // Handle grouped texts
                const result = {};
                Object.entries(textInput).forEach(([key, value]) => {
                    result[key] = Array.isArray(value) ? value.map(item => typeof item === 'string' ? item : item.text) : value;
                });
                return result;
            } else if (Array.isArray(textInput)) {
                // Handle array of texts
                return textInput.map(item => item.text || item);
            } else {
                // Handle single text
                return textInput;
            }
        }
    };


    const headerCategoryTranslateFunction = async (textInput, from = 'en', toLang = language) => {
        const langMap = {
            English: 'en',
            Malayalam: 'ml',
        };
        const to = langMap[toLang] || toLang;
        const fromCode = langMap[from] || from;

        // If source and target languages are the same, return the input as is
        if (fromCode === to) {
            if (typeof textInput === 'object' && textInput !== null && !Array.isArray(textInput)) {
                // Handle grouped texts
                const result = {};
                Object.entries(textInput).forEach(([key, value]) => {
                    result[key] = Array.isArray(value) ? value.map(item => typeof item === 'string' ? item : item.text) : value;
                });
                return result;
            } else if (Array.isArray(textInput)) {
                // Handle array of texts
                return textInput.map(item => item.text || item);
            } else {
                // Handle single text
                return textInput;
            }
        }

        // Get cache key for this language pair
        const cacheKey = `header-categories-${fromCode}-${to}`;
        let translationCache = {};
        
        // Try to load from localStorage if available
        if (typeof window !== 'undefined') {
            try {
                const savedCache = localStorage.getItem(cacheKey);
                if (savedCache) {
                    translationCache = JSON.parse(savedCache);
                }
            } catch (e) {
                console.warn('Failed to load header categories translation cache from localStorage', e);
            }
        }

        try {
            // This function is specifically for header categories and subcategories
            // It expects an object with 'categories' and 'subcategories' arrays
            if (typeof textInput !== 'object' || textInput === null || Array.isArray(textInput)) {
                console.warn('headerCategoryTranslateFunction expects an object with categories and subcategories');
                return textInput;
            }

            // Check if we have all translations in cache
            const uncachedItems = {};
            let allCached = true;
            
            Object.entries(textInput).forEach(([key, values]) => {
                if (!Array.isArray(values)) return;
                
                const uncachedTexts = values.filter(item => {
                    const text = typeof item === 'string' ? item : item.text;
                    return !translationCache[text];
                }).map(item => typeof item === 'string' ? item : item.text);
                
                if (uncachedTexts.length > 0) {
                    uncachedItems[key] = uncachedTexts.map(text => ({ text }));
                    allCached = false;
                }
            });

            // If everything is cached, return from cache
            if (allCached) {
                console.log('[Translation] Using cached header categories translations');
                const result = {};
                Object.entries(textInput).forEach(([key, values]) => {
                    if (Array.isArray(values)) {
                        result[key] = values.map(item => {
                            const text = typeof item === 'string' ? item : item.text;
                            return translationCache[text] || text;
                        });
                    } else {
                        result[key] = values;
                    }
                });
                return result;
            }

            // Make a single API call for all uncached items
            console.log('[Translation] Making API call for header categories:', Object.keys(uncachedItems));
            const response = await axios.post('/api/translate', {
                textGroups: uncachedItems,
                from: fromCode,
                to,
            });

            const translatedGroups = response.data || {};
            
            // Update cache with new translations
            Object.entries(translatedGroups).forEach(([key, translatedValues]) => {
                const originalValues = uncachedItems[key];
                if (Array.isArray(originalValues) && Array.isArray(translatedValues)) {
                    originalValues.forEach((item, idx) => {
                        const text = item.text;
                        if (text && translatedValues[idx]) {
                            translationCache[text] = translatedValues[idx];
                        }
                    });
                }
            });
            
            // Save updated cache to localStorage
            if (typeof window !== 'undefined') {
                try {
                    localStorage.setItem(cacheKey, JSON.stringify(translationCache));
                } catch (e) {
                    console.warn('Failed to save header categories translation cache to localStorage', e);
                }
            }
            
            // Build final result using cache
            const result = {};
            Object.entries(textInput).forEach(([key, values]) => {
                if (Array.isArray(values)) {
                    result[key] = values.map(item => {
                        const text = typeof item === 'string' ? item : item.text;
                        return translationCache[text] || text;
                    });
                } else {
                    result[key] = values;
                }
            });
            
            return result;
        } catch (error) {
            console.error('Header categories translation error:', error);
            // Return original text(s) in case of error
            const result = {};
            Object.entries(textInput).forEach(([key, value]) => {
                result[key] = Array.isArray(value) ? value.map(item => typeof item === 'string' ? item : item.text) : value;
            });
            return result;
        }
    };

    const translateHeaders = async (textInput, from = 'en', toLang = language) => {
        const langMap = {
            English: 'en',
            Malayalam: 'ml',
        };
        const to = langMap[toLang] || toLang;
        const fromCode = langMap[from] || from;

        // If source and target languages are the same, return the input as is
        if (fromCode === to) {
            if (typeof textInput === 'object' && textInput !== null && !Array.isArray(textInput)) {
                // Handle grouped texts
                const result = {};
                Object.entries(textInput).forEach(([key, value]) => {
                    result[key] = Array.isArray(value) ? value.map(item => typeof item === 'string' ? item : item.text) : value;
                });
                return result;
            } else if (Array.isArray(textInput)) {
                // Handle array of texts
                return textInput.map(item => item.text || item);
            } else {
                // Handle single text
                return textInput;
            }
        }

        // Get cache key for this language pair
        const cacheKey = `${fromCode}-${to}`;
        if (!translationCacheRef.current[cacheKey]) {
            translationCacheRef.current[cacheKey] = {};
            // Try to load from localStorage if available
            if (typeof window !== 'undefined') {
                try {
                    const savedCache = localStorage.getItem(`translation-cache-${cacheKey}`);
                    if (savedCache) {
                        translationCacheRef.current[cacheKey] = JSON.parse(savedCache);
                    }
                } catch (e) {
                    console.warn('Failed to load translation cache from localStorage', e);
                }
            }
        }

        try {
            // Handle different input formats
            if (typeof textInput === 'object' && textInput !== null && !Array.isArray(textInput)) {
                // Check if this is a categories/subcategories object
                if (textInput.categories || textInput.subcategories) {
                    // Use the dedicated function for header categories
                    return await headerCategoryTranslateFunction(textInput, fromCode, to);
                }
                // Otherwise use the general translateText for other objects
                return await translateText(textInput, fromCode, to);
            } else if (Array.isArray(textInput)) {
                // Batch translation with de-duplication and order mapping
                const originalTexts = textInput
                    .map(item => (typeof item === 'string' ? item : item?.text))
                    .filter(Boolean);

                // De-duplicate texts to translate
                const uniqueTexts = [];
                const seen = new Set();
                for (const t of originalTexts) {
                    if (!seen.has(t)) {
                        uniqueTexts.push(t);
                        seen.add(t);
                    }
                }

                // Check cache for each unique text
                const textsToTranslate = [];
                const translationMap = {};

                uniqueTexts.forEach(text => {
                    if (translationCacheRef.current[cacheKey][text]) {
                        translationMap[text] = translationCacheRef.current[cacheKey][text];
                    } else {
                        textsToTranslate.push({ text });
                    }
                });

                // If all texts are cached, use cache only
                if (textsToTranslate.length === 0) {
                    return originalTexts.map(t => translationMap[t] ?? t);
                }

                // Only send uncached texts to API
                const response = await axios.post('/api/translate', {
                    texts: textsToTranslate,
                    from: fromCode,
                    to,
                });

                const translatedNew = response.data || [];
                
                // Update translation map with new translations
                textsToTranslate.forEach((item, idx) => {
                    const originalText = item.text;
                    const translation = translatedNew[idx];
                    if (originalText && translation) {
                        translationMap[originalText] = translation;
                        // Update cache
                        translationCacheRef.current[cacheKey][originalText] = translation;
                    }
                });

                // Save updated cache to localStorage
                if (typeof window !== 'undefined') {
                    try {
                        localStorage.setItem(
                            `translation-cache-${cacheKey}`, 
                            JSON.stringify(translationCacheRef.current[cacheKey])
                        );
                    } catch (e) {
                        console.warn('Failed to save translation cache to localStorage', e);
                    }
                }

                // Map back to original order/length
                return originalTexts.map(t => translationMap[t] ?? t);
            } else {
                // Single text translation - use the same caching logic as translateText
                return await translateText(textInput, fromCode, to);
            }
        } catch (error) {
            console.error('Translation error:', error);
            // Return original text(s) in case of error
            if (typeof textInput === 'object' && textInput !== null && !Array.isArray(textInput)) {
                // Handle grouped texts
                const result = {};
                Object.entries(textInput).forEach(([key, value]) => {
                    result[key] = Array.isArray(value) ? value.map(item => typeof item === 'string' ? item : item.text) : value;
                });
                return result;
            } else if (Array.isArray(textInput)) {
                // Handle array of texts
                return textInput.map(item => item.text || item);
            } else {
                // Handle single text
                return textInput;
            }
        }
    };

    //Fetch side banners

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                setBannerLoading(true);
                const response = await axios.get('https://admin.sportsbuz.com/api/side-banners', {
                    params: {
                        country_code: countryCode?.location?.id
                    }
                });
                const data = response.data;
                const countryWiseSideBanner = data.filter(data => data.location === countryCode?.location?.id)
                // console.log(countryWiseSideBanner, "country wise side banner")
                setBanners(countryWiseSideBanner);
            } catch (error) {
                console.error('Error fetching side banners:', error);
                throw error;
            } finally {
                setBannerLoading(false);
            }
        };
        fetchBanners();
    }, [countryCode]);

    const oddBanners = banners.filter((item, i) => (item.order_by % 2 !== 0));
    const activeOddBanners = oddBanners.filter(i => i.is_active === 'Active');

    const evenBanners = banners.filter((item, i) => (item.order_by % 2 === 0));
    const activeEvenBanners = evenBanners.filter(i => i.is_active === 'Active')

    // // LANGUAGE BASED ON THE URL

    // useEffect(() => {
    //     const { countryCode: urlCountryCode, language: urlLanguage } = parseUrlPath(pathname);

    //     // Only proceed if we have values from URL
    //     if (urlCountryCode || urlLanguage) {
    //         // Set language from URL if available and valid
    //         if (urlLanguage) {
    //             const isValidLanguage = location.some(loc => loc.hreflang === urlLanguage);
    //             if (isValidLanguage) {
    //                 setLanguage(urlLanguage);
    //                 localStorage.setItem('language', urlLanguage);
    //             }
    //         }

    //         // Set country code from URL if available
    //         if (urlCountryCode) {
    //             const matchedLocation = location.find(loc => loc.country_code === urlCountryCode);
    //             if (matchedLocation) {
    //                 setCountryCode({
    //                     country_code: urlCountryCode,
    //                     location: matchedLocation
    //                 });
    //             }
    //         }
    //     }
    // }, [pathname, location]);


    //SPORT CHANGE CONDITION

    const [sport, setSport] = useState('cricket');

    // Initialize sport from localStorage on client-side only
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedSport = localStorage.getItem('selectedSport');
            if (savedSport) {
                setSport(savedSport);
            }
        }
    }, []);

    // Add this effect to update sport when country code changes, but only if user hasn't manually selected a sport
    useEffect(() => {
        if (countryCode?.location?.sports) {
            const apiSport = countryCode.location.sports.toLowerCase();
            const userSelectedSport = localStorage.getItem('selectedSport');

            // Only update sport based on country if user hasn't manually selected a sport
            // or if this is the first load (no user selection yet)
            if (!userSelectedSport && apiSport !== sport) {
                setSport(apiSport);
                localStorage.setItem('selectedSport', apiSport);
            }
        }
    }, [countryCode]);

    // Handle sport changes and load sport-specific data
    useEffect(() => {
        if (!initialDataLoaded) return; // Skip during initial load

        console.log(`Sport changed to: ${sport}`);

        // Load sport-specific data based on current sport
        if (sport === 'cricket') {
            // Check if we have cached data
            if (!dataCache.cricket.matches) {
                fetchMatches();
            }
            if (!dataCache.cricket.upcomingMatches) {
                fetchUpcomingMatches();
            }
        } else if (sport === 'football') {
            // Check if we have cached data
            if (!dataCache.football.liveMatches) {
                liveFootBall();
            }
            if (!dataCache.football.upcomingMatches) {
                upcomingFootBall();
            }
        }
    }, [sport, initialDataLoaded]);

    // SETTINGS-API IMPLEMENTATION
    const [settings, setSettings] = useState([]);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('https://admin.sportsbuz.com/api/settings');
            setSettings(response.data);
        } catch (error) {
            console.error('Error fetching blog categories:', error);
        }
    };

    //-------------------22-BET SECTION-------------------//

    // TOURNAMENT API IMPLEMENTATION

    const [tournament, setTournament] = useState([]);

    const fetchTournamentsData = async (token) => {
        try {
            const data = await fetchTournaments(token);
            setTournament(data);
        } catch (err) {
            console.error('Failed to fetch tournaments:', err);
        }
    };

    // TOKEN ACCESSING PART

    const [accessToken, setAccessToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchToken = async () => {
        try {
            const res = await fetch('/api/get-token');
            const data = await res.json();
            if (res.ok) {
                setAccessToken(data.access_token);
                // console.log(data.access_token, "token")
                fetchTournamentsData(data.access_token);
            } else {
                console.error('Token error:', data.error);
            }
        } catch (err) {
            console.error('Request failed:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchToken();
        const interval = setInterval(() => {
            console.log('Refreshing token...');
            fetchToken();
        }, 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // TEAM NAME FETCHING

    const [eventDetails, setEventDetails] = useState([]);

    const fetchEventDetailsForAllIds = async (token, eventIds) => {
        try {
            const detailPromises = eventIds.map(eventId =>
                fetchSportEventDetails({ token, eventId })
            );

            const results = await Promise.all(detailPromises);

            const validDetails = results.filter(detail => detail !== null);

            setEventDetails(validDetails);
        } catch (error) {
            console.error('Error fetching all event details:', error);
            setEventDetails([]);
        }
    };

    // TEAM EVENT FETCHING

    const [eventIds, setEventIds] = useState([]);

    const fetchEventsIdData = async (token, id) => {
        try {
            const data = await fetchEventsIds({ token, id });

            if (data && data.items) {
                setEventIds(data.items);
                await fetchEventDetailsForAllIds(token, data.items);
            } else {
                setEventIds([]);
                console.warn("No event IDs returned");
            }
        } catch (err) {
            console.error('Failed to fetch event IDs:', err);
        }
    };

    // FETCH GAME MARKET

    async function fetchMarketData(token, sportEventId) {
        try {
            const response = await fetch(`/api/get-odds?sportEventId=${sportEventId}&token=${token}`);
            if (!response.ok) {
                throw new Error('Failed to fetch market data');
            }
            const data = await response.json();
            return data;
        } catch (err) {
            console.error('fetchMarketData error:', err);
            return null;
        }
    }

    //-------------------END--->22-BET SECTION-------------------//

    //-------------------ONE-X BET SECTION----------------------//

    // TOURNAMENT API IMPLEMENTATION
    const [oneXTournament, setOneXTournament] = useState([]);

    const fetchOneXTournamentsData = async (token) => {
        // console.log("calls trnmnt")
        try {
            const data = await fetchOneXTournaments(token);
            setOneXTournament(data);
        } catch (err) {
            console.error('Failed to fetch tournaments:', err);
        }
    };

    // TOKEN ACCESSING PART

    const [oneXAccessToken, setOneXAccessToken] = useState(null);
    const [oneXLoading, setOneXLoading] = useState(true);

    const fetchOneXToken = async () => {
        try {
            const res = await fetch('/api/get-token-onex');
            const data = await res.json();
            if (res.ok) {
                console.log("enters the response ok condition")
                setOneXAccessToken(data.access_token);
                // console.log(data.access_token, "token")
                fetchOneXTournamentsData(data.access_token);
            } else {
                console.error('Token error:', data.error);
            }
        } catch (err) {
            console.error('Request failed:', err);
        } finally {
            setOneXLoading(false);
        }
    };

    useEffect(() => {
        fetchOneXToken();
        const interval = setInterval(() => {
            console.log('Refreshing one-x token...');
            fetchOneXToken();
        }, 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // TEAM NAME FETCHING

    const [oneXEventDetails, setOneXEventDetails] = useState([]);

    const fetchOneXEventDetailsForAllIds = async (token, eventIds) => {
        try {
            const detailPromises = eventIds.map(eventId =>
                fetchOneXSportEventDetails({ token, eventId })
            );

            const results = await Promise.all(detailPromises);
            console.log(results, "results of betx")
            const validDetails = results.filter(detail => detail !== null);

            setOneXEventDetails(validDetails);
        } catch (error) {
            console.error('Error fetching all event details:', error);
            setOneXEventDetails([]);
        }
    };

    // TEAM EVENT FETCHING

    const [oneXEventIds, setOneXEventIds] = useState([]);

    const fetchOneXEventsIdData = async (token, id) => {
        // console.log("calls id ")
        try {
            const data = await fetchOneXEventsIds({ token, id });

            if (data && data.items) {
                setOneXEventIds(data.items);
                await fetchOneXEventDetailsForAllIds(token, data.items);
            } else {
                setOneXEventIds([]);
                console.warn("No event IDs returned");
            }
        } catch (err) {
            console.error('Failed to fetch event IDs:', err);
        }
    };

    // FETCH GAME MARKET

    async function fetchOneXMarketData(token, sportEventId) {
        try {
            const response = await fetch(`/api/get-onex-odds?sportEventId=${sportEventId}&token=${token}`);
            if (!response.ok) {
                throw new Error('Failed to fetch market data');
            }
            const data = await response.json();
            return data;
        } catch (err) {
            console.error('fetchMarketData error:', err);
            return null;
        }
    }

    // Scoped One-X event state and fetchers to avoid cross-component updates
    const [oneXEventDetailsScoped, setOneXEventDetailsScoped] = useState({});
    const [oneXEventIdsScoped, setOneXEventIdsScoped] = useState({});

    const fetchOneXEventDetailsForAllIdsScoped = async (token, eventIds, scope) => {
        try {
            const detailPromises = eventIds.map(eventId =>
                fetchOneXSportEventDetails({ token, eventId })
            );
            const results = await Promise.all(detailPromises);
            const validDetails = results.filter(detail => detail !== null);
            setOneXEventDetailsScoped(prev => ({ ...prev, [scope]: validDetails }));
        } catch (error) {
            console.error('Error fetching scoped event details:', error);
            setOneXEventDetailsScoped(prev => ({ ...prev, [scope]: [] }));
        }
    };

    console.log(oneXEventDetailsScoped.megapari, "scoped event details")
    const fetchOneXEventsIdDataScoped = async (token, id, scope) => {
        try {
            const data = await fetchOneXEventsIds({ token, id });
            if (data && data.items) {
                setOneXEventIdsScoped(prev => ({ ...prev, [scope]: data.items }));
                await fetchOneXEventDetailsForAllIdsScoped(token, data.items, scope);
            } else {
                setOneXEventIdsScoped(prev => ({ ...prev, [scope]: [] }));
                console.warn("No event IDs returned (scoped)");
            }
        } catch (err) {
            console.error('Failed to fetch scoped event IDs:', err);
            setOneXEventIdsScoped(prev => ({ ...prev, [scope]: [] }));
        }
    };





    //-------------------END--->ONE-X BET SECTION----------------------//

    // FOOTBALL MATCH DETAILS API IMPLEMENTATION

    const [footBallMatchDetails, setFootballMatchDetails] = useState([]);

    const fetchFootballDetails = async (id) => {
        try {
            const response = await axios.get(`/api/get-football-match-details?Eid=${id}`);
            setFootballMatchDetails(response.data);
        } catch (error) {
            console.error('Error fetching football match details:', error);
        }
    };

    // FOOTBALL LINE UP DETAILS API IMPLEMENTATION

    const [lineUp, setLineUp] = useState([]);

    const fetchFootBallLineUp = async (id) => {
        try {
            const response = await axios.get(`/api/get-football-line-up?Eid=${id}`);
            setLineUp(response.data);
        } catch (error) {
            console.error('Error fetching football line up:', error);
        }
    };

    // FETCH MATCH SCHEDULE BY DATE

    const [matchSchedule, setMatchSchedule] = useState([]);

    async function fetchMatchSchedules(Date, Timezone) {
        // console.log("calls fetch match", Date)
        try {
            const response = await fetch(`/api/get-match-schedule-by-date?Date=${Date}&Timezone=${Timezone}`);
            if (!response.ok) {
                throw new Error('Failed to fetch match schedule');
            }
            const data = await response.json();
            setMatchSchedule(data)
            return data;
        } catch (err) {
            console.error('fetchMatchSchedules error:', err);
            return null;
        }
    }



    // BLOG SECTION

    const fetchBlogCategories = async () => {
        try {
            const response = await axios.get('https://admin.sportsbuz.com/api/blog-categories');
            setBlogCategories(response.data);
        } catch (error) {
            console.error('Error fetching blog categories:', error);
        }
    };

    const fetchRecentBlogs = async () => {
        try {
            const response = await axios.get('https://admin.sportsbuz.com/api/recent-posts');
            setrecentBlogs(response.data);
        } catch (error) {
            console.error('Error fetching recent blogs:', error);
        }
    };

    const fetchBlogsForPage = useCallback(async ({
        countryCodeParam = countryCode?.country_code,
        search = '',
        category = null,
        subcategory = null,
        page = 1
    } = {}) => {
        console.log("fetch blogs is being called in home and stored in the ")
        // Don't fetch if no country code
        if (!countryCodeParam) {
            console.warn('No country code available for fetching blogs');
            return;
        }

        // Add a check to prevent using outdated country code
        if (validatedLocationData &&
            validatedLocationData.country_code &&
            validatedLocationData.country_code !== countryCodeParam) {
            console.log('ApiContext: Skipping fetch with outdated country code', {
                requested: countryCodeParam,
                current: validatedLocationData.country_code
            });
            return;
        }

        setIsLoading(true);

        try {
            const params = {
                country_code: countryCodeParam,
                // page: page
            };

            if (search && search.trim()) {
                params.search = search.trim();
            }

            if (category) {
                params.category_id = category;
            }

            if (subcategory) {
                params.subcategory_id = subcategory;
            }

            console.log('ApiContext: Fetching blogs with params:', params);

            const response = await axios.get('https://admin.sportsbuz.com/api/get-blogs', {
                params,
            });

            // Update all blog-related state
            const data = response.data;
            setBlogsForPage(data.results || []);
            setTotalBlogs(data.count || 0);
            setNextUrl(data.next || null);
            setPrevUrl(data.previous || null);

            console.log('ApiContext: Blogs fetched successfully:', data.results?.length || 0, 'blogs');

        } catch (error) {
            console.error('Failed to fetch blogs:', error);
            // Reset state on error
            fetchBlogsForPage([]);
            setTotalBlogs(0);
            setNextUrl(null);
            setPrevUrl(null);
        } finally {
            setIsLoading(false);
        }
    }, [countryCode?.country_code, validatedLocationData]);


    const fetchBlogs = useCallback(async ({
        countryCodeParam = countryCode?.country_code,
        search = '',
        category = null,
        subcategory = null,
        page = 1
    } = {}) => {
        console.log("fetch blogs is being called in home and stored in the ")
        // Don't fetch if no country code
        if (!countryCodeParam) {
            console.warn('No country code available for fetching blogs');
            return;
        }

        // Add a check to prevent using outdated country code
        if (validatedLocationData &&
            validatedLocationData.country_code &&
            validatedLocationData.country_code !== countryCodeParam) {
            console.log('ApiContext: Skipping fetch with outdated country code', {
                requested: countryCodeParam,
                current: validatedLocationData.country_code
            });
            return;
        }

        setIsLoading(true);

        try {
            const params = {
                country_code: countryCodeParam,
                // page: page
            };

            if (search && search.trim()) {
                params.search = search.trim();
            }

            if (category) {
                params.category_id = category;
            }

            if (subcategory) {
                params.subcategory_id = subcategory;
            }

            console.log('ApiContext: Fetching blogs with params:', params);

            const response = await axios.get('https://admin.sportsbuz.com/api/get-blogs', {
                params,
            });

            // Update all blog-related state
            const data = response.data;
            setBlogs(data.results || []);
            setTotalBlogs(data.count || 0);
            setNextUrl(data.next || null);
            setPrevUrl(data.previous || null);

            console.log('ApiContext: Blogs fetched successfully:', data.results?.length || 0, 'blogs');

        } catch (error) {
            console.error('Failed to fetch blogs:', error);
            // Reset state on error
            setBlogs([]);
            setTotalBlogs(0);
            setNextUrl(null);
            setPrevUrl(null);
        } finally {
            setIsLoading(false);
        }
    }, [countryCode?.country_code, validatedLocationData]);



    // BETTING TABLE DATA - API IMPLEMENTATIONS

    const fetchBettingApps = async (countryCodeParam = countryCode.country_code) => {
        // console.log(countryCodeParam, "c param")
        // console.log("called the betting apps")
        if (!countryCodeParam) {
            console.error('No country code available for fetching betting apps');
            return;
        }

        try {
            // console.log('Fetching betting apps for country code:', countryCodeParam);
            const response = await axios.get('https://admin.sportsbuz.com/api/best-betting-headings', {
                params: {
                    country_code: countryCodeParam,
                    filter_by: 'current_month'
                },
            });

            const data = response.data;
            // console.log(response, "sections data")
            if (Array.isArray(data.results)) {
                setSections(data.results);
                // console.log("enters the if condition", data.results)
            } else {
                console.warn('Expected an array, but received:', data);
            }
        } catch (error) {
            console.error('Error fetching best betting headings:', error);
        }
    };

    const fetchBestBettingAppsPrevious = async (countryCodeParam = countryCode.country_code) => {
        if (!countryCodeParam) {
            console.warn('No country code available for fetching previous betting apps');
            return;
        }

        try {
            const response = await axios.get('https://admin.sportsbuz.com/api/best-betting-headings', {
                params: {
                    country_code: countryCodeParam,
                    filter_by: 'previous_month'
                },
            });

            const data = response.data;

            if (Array.isArray(data.results)) {
                setBestSections(data.results);
            } else {
                console.warn('Expected an array, but received:', data);
            }
        } catch (error) {
            console.error('Error fetching best betting headings (previous):', error);
        }
    };

    // CRICKET LIVE SCORE SECTION

    const rapidApiKey = process.env.NEXT_PUBLIC_FOOTBALL_RAPID_API_KEY;

    const [apiResponse, setApiResponse] = useState(null);
    const [matchTypes, setMatchTypes] = useState([]);
    console.log(matchTypes, "match types")
    const [teamImages, setTeamImages] = useState({});

    const fetchMatches = async () => {
        console.log("enters the matches api")
        try {
            // Check if we already have cached data
            if (dataCache.cricket.matches) {
                console.log('enters the if condition')
                // console.log('Using cached cricket matches data');
                setApiResponse(dataCache.cricket.matches.apiResponse);
                setMatchTypes(dataCache.cricket.matches.matchTypes);
                setTeamImages(dataCache.cricket.matches.teamImages);
                return;
            }

            const res = await axios.get('https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live', {
                headers: { 'X-RapidAPI-Key': rapidApiKey },
            });
            console.log(res.data, "api respone data")

            setApiResponse(res.data);

            const filterTypes = res.data.filters?.matchType || [];
            setMatchTypes(filterTypes);

            const imageIds = new Set();
            res.data.typeMatches?.forEach(type =>
                type.seriesMatches?.forEach(series => {
                    const matches = series.seriesAdWrapper?.matches || [];
                    // console.log(matches, "matches")
                    matches.forEach(match => {
                        const t1 = match.matchInfo?.team1?.imageId;
                        const t2 = match.matchInfo?.team2?.imageId;
                        if (t1) imageIds.add(t1);
                        if (t2) imageIds.add(t2);
                    });
                })
            );

            const newTeamImages = {};
            await Promise.all(
                Array.from(imageIds).map(async id => {
                    try {
                        const response = await axios.get(
                            `https://cricbuzz-cricket.p.rapidapi.com/img/v1/i1/c${id}/i.jpg`,
                            {
                                headers: { 'X-RapidAPI-Key': rapidApiKey },
                                responseType: 'blob',
                            }
                        );
                        const imageURL = URL.createObjectURL(response.data);
                        newTeamImages[id] = imageURL;
                    } catch (err) {
                        console.error('Failed to fetch image for ID:', id, err);
                    }
                })
            );
            setTeamImages(newTeamImages);

            // Cache the data
            setDataCache(prev => ({
                ...prev,
                cricket: {
                    ...prev.cricket,
                    matches: {
                        apiResponse: res.data,
                        matchTypes: filterTypes,
                        teamImages: newTeamImages
                    }
                }
            }));

            // console.log('Cricket matches data fetched and cached');
        } catch (error) {
            console.error('Failed to fetch live matches:', error);
        }
    };
    console.log(apiResponse, "api response tt")
    // CRICKET MATCH DETAILS SECTION

    const [cricketDetails, setCricketDetails] = useState([]);

    const getCricketDetails = async (id) => {
        console.log(id, "getting match id ")
        try {
            const response = await axios.get(`/api/get-cricket-match-details?matchId=${id}`)
            setCricketDetails(response.data)
        } catch (error) {
            console.error('error fetching cricket match details :', error)
        }
    }

    // CRICKET UPCOMING MATCH SECTION 

    const [upcomingMatches, setUpcomingMatches] = useState([]);

    const fetchUpcomingMatches = async () => {
        // console.log('Fetching upcoming cricket matches...');
        try {
            // Check if we already have cached data
            if (dataCache.cricket.upcomingMatches) {
                // console.log('Using cached upcoming cricket matches data');
                setUpcomingMatches(dataCache.cricket.upcomingMatches);
                return;
            }

            const res = await axios.get('https://cricbuzz-cricket.p.rapidapi.com/matches/v1/upcoming', {
                headers: {
                    'X-RapidAPI-Key': rapidApiKey,
                },
            });

            const upcoming = [];

            res.data.typeMatches.forEach(typeBlock => {
                const matchType = typeBlock.matchType;

                typeBlock.seriesMatches.forEach(seriesWrapper => {
                    const series = seriesWrapper.seriesAdWrapper;
                    if (series?.matches && Array.isArray(series.matches)) {
                        series.matches.forEach(match => {
                            const info = match.matchInfo;

                            const date = new Date(Number(info.startDate));
                            const dateStr = date.toISOString().split('T')[0];
                            const timeStr = date.toISOString().split('T')[1].slice(0, 5);

                            upcoming.push({
                                matchId: info.matchId,
                                type: matchType,
                                team1: info.team1.teamName,
                                team2: info.team2.teamName,
                                seriesName: series.seriesName,
                                dateStr,
                                timeStr,
                            });
                        });
                    }
                });
            });

            setUpcomingMatches(upcoming);

            // Cache the data
            setDataCache(prev => ({
                ...prev,
                cricket: {
                    ...prev.cricket,
                    upcomingMatches: upcoming
                }
            }));

            // console.log('Upcoming cricket matches data fetched and cached');
        } catch (error) {
            console.error('Failed to fetch upcoming matches:', error);
        }
    };

    // FOOTBALL LIVE SCORE SECTION
    const [stages, setStages] = useState([]);
    console.log(stages, "stages in apicontext")
    const liveFootBall = async () => {
        // console.log('Fetching live football matches...');
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0].replace(/-/g, '');

        try {
            // Check if we already have cached data
            if (dataCache.football.liveMatches) {
                // console.log('Using cached live football matches data');
                setStages(dataCache.football.liveMatches);
                return;
            }

            const options = {
                method: 'GET',
                url: 'https://livescore6.p.rapidapi.com/matches/v2/list-by-date',
                params: {
                    Category: 'soccer',
                    Date: formattedDate,
                    Timezone: currentTimezone
                },
                headers: {
                    'X-RapidAPI-Key': process.env.NEXT_PUBLIC_FOOTBALL_RAPID_API_KEY,
                }
            };

            const response = await axios.request(options);
            setStages(response.data);

            // Cache the data
            setDataCache(prev => ({
                ...prev,
                football: {
                    ...prev.football,
                    liveMatches: response.data
                }
            }));

            // console.log('Live football matches data fetched and cached');
        } catch (error) {
            console.error('Error fetching football matches:', error);
        }
    };

    // FOOTBALL UPCOMING MATCHES SECTION

    const [upcoming, setUpcoming] = useState([]);
    const upcomingFootBall = async () => {
        // console.log('Fetching upcoming football matches...');
        try {
            // Check if we already have cached data
            if (dataCache.football.upcomingMatches) {
                // console.log('Using cached upcoming football matches data');
                setUpcoming(dataCache.football.upcomingMatches);
                return;
            }

            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);

            const formattedDate = tomorrow.toISOString().split('T')[0].replace(/-/g, '');

            const options = {
                method: 'GET',
                url: 'https://livescore6.p.rapidapi.com/matches/v2/list-by-date',
                params: {
                    Category: 'soccer',
                    Date: formattedDate,
                    Timezone: currentTimezone
                },
                headers: {
                    'X-RapidAPI-Key': process.env.NEXT_PUBLIC_FOOTBALL_RAPID_API_KEY,
                }
            };

            const response = await axios.request(options);
            setUpcoming(response.data);

            // Cache the data
            setDataCache(prev => ({
                ...prev,
                football: {
                    ...prev.football,
                    upcomingMatches: response.data
                }
            }));

            // console.log('Upcoming football matches data fetched and cached');
        } catch (error) {
            console.error('Error fetching upcoming football matches:', error);
        }
    };

    // NEWS SECTION
    const [news, setNews] = useState([]);

    const fetchNews = useCallback(async () => {
        const options = {
            method: 'GET',
            url: 'https://cricbuzz-cricket.p.rapidapi.com/news/v1/index',
            headers: {
                'X-RapidAPI-Key': 'c3c1b4d9edmshb8fad382c23df43p14e64fjsn1f9d11ef49e1',
            },
        };

        try {
            const response = await axios.request(options);
            const newData = response.data;
            console.log(newData, "news Data")
            // Only set state if changed
            setNews((prev) => {
                return JSON.stringify(prev) === JSON.stringify(newData) ? prev : newData;
            });
        } catch (error) {
            console.error('Error fetching news:', error);
        }
    }, []);

    //// NEWS DETAIL SECTION 

    const [selectedNews, setSelectedNews] = useState(null);

    const fetchNewsDetails = async (id) => {
        // console.log(id, "click id")
        try {
            const response = await axios.get(
                `https://cricbuzz-cricket.p.rapidapi.com/news/v1/detail/${id}`,
                {
                    headers: {
                        'X-RapidAPI-Key': process.env.NEXT_PUBLIC_FOOTBALL_RAPID_API_KEY,
                    },
                }
            );
            setSelectedNews(response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching news details:", error);
        }
    };
    // useEffect(() => {
    //     console.log('effect ran')
    //     let called = false;

    //     if (!called) {
    //         console.log("called the infinite")
    //         fetchNews();
    //         called = true;
    //     }

    //     return () => {
    //         called = true;
    //     };
    // }, []);

    // Initial data loading effect

    // Load initial data only once
    useEffect(() => {
        if (!initialDataLoaded) {
            // Load non-sport specific data
            fetchBlogCategories();
            // fetchRecentBlogs();
            fetchLocation();
            getCountryCode();
            fetchSettings();

            // Load sport-specific data based on current sport
            if (sport === 'cricket') {
                fetchMatches();
                fetchUpcomingMatches();
            } else if (sport === 'football') {
                liveFootBall();
                upcomingFootBall();
            }

            setInitialDataLoaded(true);
        }
    }, [initialDataLoaded]);

    useEffect(() => {
        if (!news.length) {
            fetchNews();
        }
    }, []);


    useEffect(() => {
        if (countryCode?.country_code) {
            // console.log('Country code available, fetching initial blogs:', countryCode.country_code);
            fetchBlogs({ countryCodeParam: countryCode.country_code });
            fetchBettingApps(countryCode.country_code);
            fetchBestBettingAppsPrevious(countryCode.country_code);
        } else if (countryDataHome?.country_code) {
            console.log('Country code available from SSR, fetching initial blogs:', countryDataHome.country_code);
            fetchBlogs({ countryCodeParam: countryDataHome.country_code });
            fetchBettingApps(countryDataHome.country_code);
            fetchBestBettingAppsPrevious(countryDataHome.country_code);
        }
    }, [countryCode?.country_code, countryDataHome?.country_code]);


    return (
        <DataContext.Provider
            value={{
                blogCategories,
                recentBlogs,
                blogs,
                setBlogs,
                blogsForPage,
                setBlogsForPage,
                isLoading,
                totalBlogs,
                nextUrl,
                prevUrl,
                fetchBlogs,
                fetchBlogsForPage,
                fetchBettingApps,
                sections,
                setSections,
                bestSections,
                apiResponse,
                matchTypes,
                teamImages,
                upcomingMatches,
                stages,
                upcoming,
                news,
                selectedNews,
                fetchNewsDetails,
                language,
                setLanguage,
                translateText,
                debugTranslateText,
                tournament,
                oneXTournament,
                accessToken,
                oneXAccessToken,
                fetchEventsIdData,
                fetchOneXEventsIdData,
                eventIds,
                oneXEventIds,
                eventDetails,
                oneXEventDetails,
                fetchMarketData,
                fetchOneXMarketData,
                oneXEventDetailsScoped,
                oneXEventIdsScoped,
                fetchOneXEventsIdDataScoped,
                location,
                fetchFootballDetails,
                footBallMatchDetails,
                fetchFootBallLineUp,
                lineUp,
                countryCode,
                getCricketDetails,
                cricketDetails,
                sport,
                setSport,
                matchSchedule,
                setMatchSchedule,
                fetchMatchSchedules,
                currentTimezone,
                settings,
                countryCodeCookie,
                setCountryCodeCookie,
                hreflang,
                locationData,
                setLocationData,
                countryData,
                setCountryData,
                setHreflang,
                country,
                setCountry,
                setValidatedLocationData,
                matchTeams,
                setMatchTeams,
                activeOddBanners,
                activeEvenBanners,
                bannerLoading,
                translateHeaders
            }}>
            {children}
        </DataContext.Provider>
    );
};

export const useGlobalData = () => useContext(DataContext);