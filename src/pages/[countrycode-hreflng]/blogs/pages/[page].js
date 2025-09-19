import { useState, useEffect } from "react";
import Header from "@/components/Loader/Loader";
import BlogsPage from "@/components/BlogsSection/BlogPage";
import LiveScores from "@/components/LiveScoreSection/LiveScoreSection";
import Head from "next/head";
import { useGlobalData } from "@/components/Context/ApiContext";
import FooterTwo from "@/components/Footer/Footer";
import HeaderTwo from "@/components/Header/HeaderTwo";
import { useRouter } from "next/router";
import { useLanguageValidation } from "@/hooks/useLanguageValidation";
import { fetchBlogsSSR } from "@/lib/ftechBlogsSSR";

import axios from 'axios';
import HeaderThree from "@/components/Header/HeaderThree";
export async function getServerSideProps({ req, query, resolvedUrl }) {
    let blogs = [];
    let countryDataHome = null;
    let locationDataHome = null;

    try {
        const [countryRes, locationRes] = await Promise.all([
            fetch('https://admin.sportsbuz.com/api/get-country-code/')
                .then(async (response) => {
                    if (!response.ok) {
                        throw new Error(`Country API failed: ${response.status} ${response.statusText}`);
                    }
                    const data = await response.json();
                    return { data, headers: response.headers, status: response.status, url: response.url };
                })
                .catch((error) => {
                    console.error('Error fetching country data:', error);
                    return null;
                }),

            fetch('https://admin.sportsbuz.com/api/locations/')
                .then(async (response) => {
                    if (!response.ok) {
                        throw new Error(`Location API failed: ${response.status} ${response.statusText}`);
                    }
                    const data = await response.json();
                    return { data, headers: response.headers, status: response.status, url: response.url };
                })
                .catch((error) => {
                    console.error('Error fetching location data:', error);
                    return null;
                })
        ]);

        countryDataHome = countryRes?.data || null;
        locationDataHome = locationRes?.data || null;

        const {
            category: categoryIdParam,
            subcategory: subcategoryIdParam,
            search: searchTerm = ''
        } = query;

        try {
            blogs = await fetchBlogsSSR({
                countryCode: countryDataHome?.country_code || 'IN',
                search: searchTerm,
                category: categoryIdParam ? parseInt(categoryIdParam, 10) : null,
                subcategory: subcategoryIdParam ? parseInt(subcategoryIdParam, 10) : null,
            });
        } catch (blogError) {
            console.error('Error fetching blogs:', blogError);
            blogs = []; // Keep empty array as fallback
        }

        // Debug logs (remove in production)
        // console.log('=== API RESPONSE DATA ===');
        // console.log('Country Data:', JSON.stringify(countryDataHome, null, 2));
        // console.log('Location Data:', JSON.stringify(locationDataHome, null, 2));
        // console.log('Country Response Headers:', countryRes ? Object.fromEntries(countryRes.headers) : 'N/A');
        // console.log('Location Response Headers:', locationRes ? Object.fromEntries(locationRes.headers) : 'N/A');

    } catch (error) {
        console.error("API Error Details:", {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
    }

    return {
        props: {
            blogs,
            countryDataHome,
            locationDataHome,
            resolvedUrl,
            isLocalhost: process.env.NODE_ENV === 'development'
        }
    };
}

export default function BlogPages({
    blogs,
    countryDataHome,
    locationDataHome,
    supportedLanguages,
    supportedCountries,
    resolvedUrl,
    isLocalhost,
}) {
    const languageValidation = useLanguageValidation(locationDataHome, resolvedUrl);
    const router = useRouter();
    const [isValidating, setIsValidating] = useState(false);
    const baseUrl = isLocalhost ? 'http://localhost:3000' : 'https://www.sportsbuz.com';
    const countryCode = countryDataHome?.country_code || 'IN';

    const locationParts = resolvedUrl.replace(/^,?\//, '').split('/');
    const [countryPart, langPart] = locationParts[0].split('-'); // Fixed: country comes first, then language
    // console.log(countryPart, 'c',langPart,"lge")

    // console.log(locationDataHome, "locationDataHome data");
    // console.log(resolvedUrl, "resolved url blogs data");

    const [loading, setLoading] = useState(true);
    const [animationStage, setAnimationStage] = useState('loading');
    const [showOtherDivs, setShowOtherDivs] = useState(false);
    const [hasAnimatedIn, setHasAnimatedIn] = useState(false);

    // // Function to get default language for a country (first available language)
    // const getDefaultLanguageForCountry = (countryCode) => {
    //     if (!locationDataHome || !Array.isArray(locationDataHome)) {
    //         return null;
    //     }

    //     const countryLanguages = locationDataHome.filter(location => 
    //         location.country_code?.toLowerCase() === countryCode?.toLowerCase()
    //     );

    //     return countryLanguages.length > 0 ? countryLanguages[0].hreflang : null;
    // };

    // // Function to validate if language is supported for the country
    // const validateLanguageForCountry = (countryCode, languageTag) => {
    //     if (!locationDataHome || !Array.isArray(locationDataHome)) {
    //         console.error('Location data is not available or invalid');
    //         return false;
    //     }

    //     // First check if country code exists in locationDataHome
    //     const countryExists = locationDataHome.some(location => 
    //         location.country_code?.toLowerCase() === countryCode?.toLowerCase()
    //     );

    //     if (!countryExists) {
    //         console.error(`Country code '${countryCode}' not found in location data`);
    //         return false;
    //     }

    //     // Then check if the language is supported for that country
    //     const isLanguageSupported = locationDataHome.some(location => 
    //         location.country_code?.toLowerCase() === countryCode?.toLowerCase() && 
    //         location.hreflang?.toLowerCase() === languageTag?.toLowerCase()
    //     );

    //     return isLanguageSupported;
    // };

    // // Function to construct new path with updated language or country
    // const constructNewPath = (countryCode, newLanguageTag, currentUrl) => {
    //     const pathParts = currentUrl.replace(/^\//, '').split('/');

    //     // Replace the first part (country-language) with new country-language combination
    //     pathParts[0] = `${countryCode.toLowerCase()}-${newLanguageTag.toLowerCase()}`;

    //     return '/' + pathParts.join('/');
    // };

    // // Function to get supported languages for current country
    // const getSupportedLanguagesForCountry = (countryCode) => {
    //     if (!locationDataHome || !Array.isArray(locationDataHome)) {
    //         return [];
    //     }

    //     return locationDataHome
    //         .filter(location => location.country_code?.toLowerCase() === countryCode?.toLowerCase())
    //         .map(location => ({
    //             hreflang: location.hreflang,
    //             language: location.language
    //         }));
    // };

    // // Language validation effect - triggers on URL change
    // useEffect(() => {
    //     const validateCurrentLanguage = () => {
    //         if (!countryPart || !langPart || !locationDataHome || isValidating) {
    //             return;
    //         }

    //         setIsValidating(true);

    //         // Validate if the current country code and language combination is supported
    //         const isValidCombination = validateLanguageForCountry(countryPart, langPart);

    //         if (isValidCombination) {
    //             // Show success alert
    //             console.log('Validation successful:', countryPart, '-', langPart);
    //             alert(`Success: Language '${langPart}' is supported for country '${countryPart.toUpperCase()}'. Page loaded successfully!`);
    //         } else {
    //             // Show error alert and optionally redirect to default language
    //             console.error('Validation failed:', countryPart, '-', langPart);
    //             alert(`Error: Language '${langPart}' is not supported for country '${countryPart.toUpperCase()}'. Redirecting to default language.`);

    //             // Get default language for the country (first available language)
    //             const defaultLanguage = getDefaultLanguageForCountry(countryPart);

    //             if (defaultLanguage) {
    //                 const newPath = constructNewPath(countryPart, defaultLanguage, resolvedUrl);
    //                 router.replace(newPath); // Use replace instead of push to avoid back button issues
    //             } else {
    //                 // If country doesn't exist, redirect to a default country-language combination
    //                 console.error(`No languages found for country '${countryPart}'. Redirecting to default.`);
    //                 router.replace('/in-en/blogs/pages/all-blogs'); // Default fallback
    //             }
    //         }

    //         setIsValidating(false);
    //     };

    //     // Validate when component mounts or when URL changes
    //     validateCurrentLanguage();
    // }, [router.asPath, countryPart, langPart, locationDataHome]); // Updated dependencies

    // // Function to manually handle language change (for UI components)
    // const handleLanguageChange = (newLanguageTag) => {
    //     // Validate if the new language tag is supported for the current country
    //     const isLanguageSupported = validateLanguageForCountry(countryPart, newLanguageTag);

    //     if (isLanguageSupported) {
    //         // Create new path with the updated language
    //         const newPath = constructNewPath(countryPart, newLanguageTag, resolvedUrl);

    //         // Navigate to the new path (this will trigger the useEffect validation)
    //         router.push(newPath);
    //     } else {
    //         // Show error alert
    //         alert(`Error: Language '${newLanguageTag}' is not supported for country '${countryPart.toUpperCase()}'. Please select a supported language.`);
    //     }
    // };

    // // Function to manually handle country change (for UI components)
    // const handleCountryChange = (newCountryCode) => {
    //     // First check if country exists
    //     const countryExists = locationDataHome?.some(location => 
    //         location.country_code?.toLowerCase() === newCountryCode?.toLowerCase()
    //     );

    //     if (countryExists) {
    //         // Get default language for the new country
    //         const defaultLanguage = getDefaultLanguageForCountry(newCountryCode);

    //         if (defaultLanguage) {
    //             const newPath = constructNewPath(newCountryCode, defaultLanguage, resolvedUrl);
    //             router.push(newPath);
    //         }
    //     } else {
    //         alert(`Error: Country '${newCountryCode.toUpperCase()}' is not supported. Please select a supported country.`);
    //     }
    // };

    // // Get supported languages for the current country for UI display
    // const supportedLanguagesForCountry = getSupportedLanguagesForCountry(countryPart);

    // // Get all available countries for UI display
    // const getAllAvailableCountries = () => {
    //     if (!locationDataHome || !Array.isArray(locationDataHome)) {
    //         return [];
    //     }

    //     // Get unique countries
    //     const uniqueCountries = locationDataHome.reduce((acc, location) => {
    //         const countryKey = location.country_code?.toLowerCase();
    //         if (countryKey && !acc.find(item => item.country_code === countryKey)) {
    //             acc.push({
    //                 country_code: countryKey,
    //                 country: location.country
    //             });
    //         }
    //         return acc;
    //     }, []);

    //     return uniqueCountries;
    // };

    // const availableCountries = getAllAvailableCountries();

    // Animation effects
    useEffect(() => {
        // Check if animation has been played before (only in browser environment)
        if (typeof window !== 'undefined') {
            const hasPlayedAnimation = localStorage.getItem('headerAnimationPlayed');

            if (!hasPlayedAnimation) {
                // First time - play the full animation sequence
                const timer1 = setTimeout(() => setAnimationStage('logoReveal'), 2000);
                const timer2 = setTimeout(() => setAnimationStage('transition'), 3500);
                const timer3 = setTimeout(() => setAnimationStage('header'), 5000);
                const timer4 = setTimeout(() => setShowOtherDivs(true), 6500);

                return () => {
                    clearTimeout(timer1);
                    clearTimeout(timer2);
                    clearTimeout(timer3);
                    clearTimeout(timer4);
                };
            } else {
                // Animation already played - go directly to header and show content immediately
                setAnimationStage('header');
                setShowOtherDivs(true);
                setLoading(false);
            }
        }
    }, []);

    // Original loading timer (keeping for compatibility)
    useEffect(() => {
        const timer1 = setTimeout(() => setLoading(false), 3000);
        return () => clearTimeout(timer1);
    }, []);

    useEffect(() => {
        if (showOtherDivs) {
            const timeout = setTimeout(() => setHasAnimatedIn(true), 50);
            return () => clearTimeout(timeout);
        }
    }, [showOtherDivs]);

    return (
        <>
            <Head>
                <title>Sports Buzz | Blogs</title>
                <meta name="description" content="Explore the latest sports blogs, match analysis, and breaking sports news curated for fans worldwide." />
                <meta name="keywords" content="sports blogs, football news, cricket updates, match analysis, sports buzz" />
                <meta name="author" content="Sports Buzz" />

                {locationDataHome && Array.isArray(locationDataHome) && locationDataHome.map(({ hreflang, country_code }) => {
                    {/* console.log(hreflang, "href lang"); */ }
                    const href = `${baseUrl}/${hreflang}-${country_code.toLowerCase()}/blogs/pages/all-blogs`;
                    const fullHrefLang = `${hreflang}-${country_code}`;

                    return (
                        <link
                            key={fullHrefLang}
                            rel="alternate"
                            href={href}
                            hreflang={fullHrefLang}
                        />
                    );
                })}

                <link rel="alternate" href={`${baseUrl}/blogs/pages/all-blogs`} hreflang="x-default" />

                {/* Open Graph (Facebook, LinkedIn) */}
                <meta property="og:title" content="Sports Buzz | Blogs" />
                <meta property="og:description" content="Stay updated with the latest sports blogs and match breakdowns from around the world." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.sportsbuz.com/blogs/pages/all-blogs" />
                <meta property="og:image" content="https://www.sportsbuz.com/images/social-preview.jpg" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Sports Buzz | Blogs" />
                <meta name="twitter:description" content="Latest sports blogs, news and insights — only on Sports Buzz." />
                <meta name="twitter:image" content="https://www.sportsbuz.com/images/social-preview.jpg" />

                <link rel="canonical" href={`${baseUrl}${resolvedUrl}`} />
            </Head>

            <HeaderThree animationStage={animationStage} />
            <div className='container'>
                <BlogsPage blogs={blogs} />
            </div>
            <FooterTwo />

            {/* Optional: Language and Country selectors for testing */}
            {/* {process.env.NODE_ENV === 'development' && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: '#f0f0f0',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    minWidth: '250px'
                }}>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Current: {countryPart?.toUpperCase()}-{langPart?.toUpperCase()}</label>
                    </div>
                    
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Change Country: </label>
                        <select 
                            value={countryPart || ''} 
                            onChange={(e) => handleCountryChange(e.target.value)}
                            style={{ width: '100%', padding: '5px' }}
                        >
                            <option value="">Select Country</option>
                            {availableCountries.map((country, index) => (
                                <option key={index} value={country.country_code}>
                                    {country.country} ({country.country_code.toUpperCase()})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Change Language: </label>
                        <select 
                            value={langPart || ''} 
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            style={{ width: '100%', padding: '5px' }}
                        >
                            <option value="">Select Language</option>
                            {supportedLanguagesForCountry.map((lang, index) => (
                                <option key={index} value={lang.hreflang}>
                                    {lang.language} ({lang.hreflang})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )} */}
        </>
    )
}