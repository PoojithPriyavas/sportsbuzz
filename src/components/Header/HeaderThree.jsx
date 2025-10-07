import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import styles from './HeaderTwo.module.css';
import { usePathname, useRouter } from 'next/navigation';
import { useGlobalData } from '../Context/ApiContext';
import { FaMoon, FaSun, FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import axios from 'axios';
import { usePathHelper } from '@/hooks/usePathHelper';

import FeaturedButton from '../FeaturedButton/FeaturedButton';


import DynamicLink from '../Common/DynamicLink';

function getCookie(name) {
    if (typeof document === 'undefined') return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        try {
            return JSON.parse(decodeURIComponent(parts.pop().split(';').shift()));
        } catch (error) {
            console.error('Error parsing cookie:', error);
            return null;
        }
    }
    return null;
}

// Top-level component: Logo
const Logo = React.memo(({ logoRef, buildPath, isTranslating, isNavigating, isLogoLoaded }) => {
    // Add render-time logging
    console.log('[Logo] render', {
        isTranslating,
        isNavigating,
        isLogoLoaded
    });

    // Mount/unmount logs
    useEffect(() => {
        console.log('[Logo] mounted', {
            isTranslating,
            isNavigating
        });
        return () => {
            console.log('[Logo] unmounted');
        };
    }, [isTranslating, isNavigating]);

    const handleImgLoad = () => {
        console.log('[Logo] image loaded: /sportsbuz.png');
    };

    const handleImgError = (e) => {
        console.error('[Logo] image load error', e?.target?.src);
    };

    // Force visible when translating or navigating
    const forceVisible = isTranslating || isNavigating;

    return (
        <div
            ref={logoRef}
            className={styles.logo}
            data-translating={String(isTranslating)}
            data-navigating={String(isNavigating)}
            style={{
                // keep logo above overlays
                zIndex: 1000,
                opacity: 1,
                visibility: 'visible',
                position: 'relative'
            }}
        >
            <DynamicLink
                href="/"
                className={styles.logoContent}
                onClick={() => console.log('[Logo] click -> navigating to home')}
            >
                <div className={styles.logoIcon} style={{ zIndex: 1000 }}>
                    <img
                        src="/sportsbuz.png"
                        alt="Sportsbuz Logo"
                        className={styles.logoIconInner}
                        style={{
                            // always visible; do not allow any hidden/opacity effects to hide it
                            opacity: 1,
                            visibility: 'visible',
                            display: 'block',
                            zIndex: 1000,
                            // small safeguard to keep dimensions stable
                            transform: 'translateZ(0)'
                        }}
                        onLoad={handleImgLoad}
                        onError={handleImgError}
                    />
                </div>
            </DynamicLink>
        </div>
    );
});

function HeaderThree({ animationStage, languageValidation }) {
    // console.log(animationStage, "animationStage value");
    const [darkMode, setDarkMode] = useState(false);
    const [headerFixed, setHeaderFixed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState(null);
    // Add isTranslating state
    const [isTranslating, setIsTranslating] = useState(false);
    // New: track navigation state for logging and forcing logo visibility
    const [isNavigating, setIsNavigating] = useState(false);
    // New: track if logo image was successfully preloaded
    const [isLogoLoaded, setIsLogoLoaded] = useState(false);
    // New: track when the user is actively changing language to prevent URL effect from overriding
    const [isUserChangingLanguage, setIsUserChangingLanguage] = useState(false);
    // New: hold the selected language until the URL updates
    const [pendingLanguage, setPendingLanguage] = useState(null);
    const router = useRouter();

    // Use the usePathHelper hook
    const { pathPrefix, buildPath } = usePathHelper();

    // Add a function to generate URLs efficiently
    const getUrl = (path) => {
        return buildPath(path);
    };

    // Mobile dropdown states
    const [expandedLanguageSelector, setExpandedLanguageSelector] = useState(false);
    const [expandedSportsSelector, setExpandedSportsSelector] = useState(false);

    // Animation state
    const [animationComplete, setAnimationComplete] = useState(false);
    const [shouldShowAnimation, setShouldShowAnimation] = useState(false);

    // GSAP refs
    const containerRef = useRef(null);
    const loadingAnimationRef = useRef(null);
    const logoRef = useRef(null);
    const navigationRef = useRef(null);
    const sidebarRef = useRef(null);

    // Timeline ref
    const timelineRef = useRef(null);

    const pathname = usePathname();
    const {
        blogCategories,
        translateText,
        setLanguage,
        language,
        location,
        countryCode,
        sport,
        setSport,
        apiResponse,
        blogs,
        sections,
        matchTypes,
        teamImages,
        upcomingMatches,
        countryCodeCookie,
        setCountryCodeCookie,
        hreflang,
        locationData,
        setLocationData,
        countryData,
        setCountryData,
        setHreflang,
        country,
        setCountry
    } = useGlobalData();
    console.log(blogCategories, "blog categories in header")

    // Initialize dark mode from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedDarkMode = localStorage.getItem('darkMode') === 'true';
            setDarkMode(savedDarkMode);
            // Apply theme immediately
            if (savedDarkMode) {
                document.documentElement.classList.add('dark-theme');
            } else {
                document.documentElement.classList.remove('dark-theme');
            }
        }
    }, []);

    // Handle dark mode toggle
    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);

        // Save to localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('darkMode', newDarkMode.toString());
        }

        // Apply theme to document
        if (newDarkMode) {
            document.documentElement.classList.add('dark-theme');
        } else {
            document.documentElement.classList.remove('dark-theme');
        }

        // Close mobile menu if open
        if (isMobile) {
            setMobileMenuOpen(false);
        }
    };

    useEffect(() => {
        // Get data from cookies after component mounts
        const locationCookie = getCookie('locationData');
        const countryCookie = getCookie('countryData');

        setLocationData(locationCookie);
        setCountryData(countryCookie);

        // Set initial values based on cookie data
        if (locationData?.filtered_locations?.length > 0) {
            const firstLocation = locationData.filtered_locations[0];
            setCountry(firstLocation.country);
            setHreflang(firstLocation.hreflang);
        }
    }, []);

    const hreflangTags = locationData?.hreflang_tags || [];
    const filteredLocations = locationData?.filtered_locations || [];

    // Ensure header final state CSS applies on initial paint if animation has already played
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const played = localStorage.getItem('headerAnimationPlayed') === 'true';
            if (played) {
                document.documentElement.classList.add('header-played');
            }
        }
    }, []);

    // Preload the logo image to avoid flicker on route changes and log status
    useEffect(() => {
        console.log('[Logo] preload start');
        const img = new Image();
        img.src = '/sportsbuz.png';
        img.onload = () => {
            setIsLogoLoaded(true);
            console.log('[Logo] preload complete');
        };
        img.onerror = (err) => {
            console.error('[Logo] preload error', err);
        };
    }, []);

    // Track route changes and log navigation stages
    useEffect(() => {
        console.log('[Router] pathname changed', { pathname });
        // Navigation completed when pathname updates
        setIsNavigating(false);
    }, [pathname]);

    // Handle navigation start
    const handleNavigationStart = (url) => {
        setIsNavigating(true);
        console.log('[Router] navigation start', { url });
    };

    // Initialize GSAP animation
    useIsomorphicLayoutEffect(() => {
        const hasPlayedAnimation = localStorage.getItem('headerAnimationPlayed') === 'true';
        // Set initial states IMMEDIATELY to prevent flash
        gsap.set(containerRef.current, {
            height: hasPlayedAnimation ? '5rem' : '100vh',
            overflow: hasPlayedAnimation ? 'visible' : 'hidden',
            display: hasPlayedAnimation ? 'flex' : 'block',
            alignItems: hasPlayedAnimation ? 'center' : 'stretch',
            justifyContent: hasPlayedAnimation ? 'space-between' : 'flex-start',
            padding: hasPlayedAnimation ? '0 1rem' : '0'
        });

        gsap.set(loadingAnimationRef.current, {
            opacity: hasPlayedAnimation ? 0 : 1,
            scale: hasPlayedAnimation ? 0.5 : 1,
            display: hasPlayedAnimation ? 'none' : 'flex'
        });

        // Keep the logo visible immediately; allow position animation only for first run
        gsap.set(logoRef.current, {
            position: hasPlayedAnimation ? 'relative' : 'absolute',
            bottom: hasPlayedAnimation ? 'auto' : '2rem',
            left: hasPlayedAnimation ? 'auto' : '2rem',
            opacity: 1, // ensure visible
            x: 0,
            y: hasPlayedAnimation ? 0 : 80
            // removed visibility toggle to prevent hidden logo on route changes
        });
        console.log('[GSAP] initial state applied to logo', { hasPlayedAnimation });

        gsap.set(navigationRef.current, {
            opacity: hasPlayedAnimation ? 1 : 0,
            display: hasPlayedAnimation ? 'flex' : 'none'
        });

        if (!hasPlayedAnimation) {
            setShouldShowAnimation(true);

            // Mark animation as played immediately to avoid overlay/logo hidden on next routes
            try {
                localStorage.setItem('headerAnimationPlayed', 'true');
                document.documentElement.classList.add('header-played');
            } catch (e) { }

            // Create the main timeline
            const tl = gsap.timeline({
                onComplete: () => {
                    setAnimationComplete(true);
                    // NOTE: we already set headerAnimationPlayed earlier to prevent re-runs across navigation
                    // localStorage.setItem('headerAnimationPlayed', 'true');
                }
            });

            // Step 1: Show loading animation (1 second)
            tl.to({}, { duration: 2 })

                // Step 2: Hide loading animation and show logo (0.5 seconds)
                .to(loadingAnimationRef.current, {
                    opacity: 0,
                    scale: 0.75,
                    duration: 0.75,
                    ease: "power2.inOut"
                })
                .to(logoRef.current, {
                    opacity: 1,
                    y: 0,
                    visibility: 'visible',
                    duration: 0.75,
                    ease: "power2.out"
                }, "-=0.3")

                // Step 3: Wait a moment then start transition (1 second wait)
                .to({}, { duration: 1 })

                // Step 4: Shrink container and move logo to header position (1.5 seconds)
                .to(containerRef.current, {
                    height: '5rem',
                    duration: 1.5,
                    ease: "power2.inOut"
                })
                .to(logoRef.current, {
                    bottom: '50%',
                    left: '1rem',
                    y: '50%',
                    duration: 1.5,
                    ease: "power2.inOut"
                }, "-=1.5")

                // Step 5: Convert logo to relative positioning after animation
                .set(logoRef.current, {
                    position: 'relative',
                    bottom: 'auto',
                    left: 'auto',
                    x: 0,
                    y: 0
                })

                // Step 6: Show navigation and set final states
                .set(containerRef.current, {
                    overflow: 'visible',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 1rem'
                })
                .set(navigationRef.current, {
                    display: 'flex'
                })
                .to(navigationRef.current, {
                    opacity: 1,
                    duration: 0.75,
                    ease: "power2.out"
                })
                .set(loadingAnimationRef.current, {
                    display: 'none'
                });

            timelineRef.current = tl;
            tl.eventCallback('onStart', () => {
                console.log('[GSAP] timeline started for logo/header');
            });
            tl.eventCallback('onComplete', () => {
                console.log('[GSAP] timeline completed for logo/header');
                setAnimationComplete(true);
            });
        } else {
            // Animation already played - already set to final state above
            setShouldShowAnimation(false);
            setAnimationComplete(true);
        }

        // Cleanup function
        return () => {
            if (timelineRef.current) {
                timelineRef.current.kill();
            }
        };
    }, []);

    // Function to reset animation (for development)
    const resetAnimation = () => {
        localStorage.removeItem('headerAnimationPlayed');
        window.location.reload();
    };

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Function to parse URL path for country code and language
    const parseUrlPath = (pathname) => {
        if (!pathname) return { countryCode: '', language: '' };

        // Extract the first segment of the path (e.g., "en-lk" from "/en-lk/some/path")
        const firstSegment = pathname.replace(/^\//, '').split('/')[0];

        // Check if it matches the format: language-countrycode
        const match = firstSegment.match(/^([a-z]{2})-([a-z]{2})$/i);

        if (match) {
            return {
                language: match[1].toLowerCase(),
                countryCode: match[2].toLowerCase()
            };
        }

        return { countryCode: '', language: '' };
    };

    // Handle URL-based country code and language
    useEffect(() => {
        if (!location || location.length === 0) return;

        const { countryCode: urlCountryCode, language: urlLanguage } = parseUrlPath(pathname);

        // Set language from URL if available and valid
        if (urlLanguage) {
            const isValidLanguage = location.some(loc => loc.hreflang === urlLanguage);
            // Only set language from URL if it's valid, differs from current, and user isn't in the middle of changing it
            if (isValidLanguage && language !== urlLanguage && !isUserChangingLanguage) {
                setLanguage(urlLanguage);
                localStorage.setItem('language', urlLanguage);
            }
        }

        // Respect user-selected sport: only set from URL if no user choice
        const userSelectedSport = typeof window !== 'undefined' ? localStorage.getItem('selectedSport') : null;

        // Set sport based on URL country code only if user hasn't manually selected one
        if (urlCountryCode && !userSelectedSport) {
            const matchedLocation = location.find(loc => loc.country_code.toLowerCase() === urlCountryCode);
            if (matchedLocation?.sports) {
                const apiSport = matchedLocation.sports.toLowerCase();
                if (apiSport !== sport) {
                    setSport(apiSport);
                    localStorage.setItem('selectedSport', apiSport);
                }
            }
        }
    }, [pathname, location, language, isUserChangingLanguage]);

    // New: Start translation only after the URL reflects the pending language
    useEffect(() => {
        if (!isUserChangingLanguage || !pendingLanguage) return;

        const { language: urlLanguage } = parseUrlPath(pathname);
        if (urlLanguage === pendingLanguage) {
            translateContent(pendingLanguage)
                .catch(error => {
                    console.error('Translation error:', error);
                })
                .finally(() => {
                    setIsUserChangingLanguage(false);
                });
            setPendingLanguage(null);
        }
    }, [pathname, isUserChangingLanguage, pendingLanguage]);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mobileMenuOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [mobileMenuOpen]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen]);

    const [translatedCategories, setTranslatedCategories] = useState(blogCategories);

    // Add this useEffect
    useEffect(() => {
        setTranslatedCategories(blogCategories);
    }, [blogCategories]);
    const [translatedText, setTranslatedText] = useState({
        home: 'Home',
        apps: 'Best Betting Apps',
        news: 'News',
        schedule: 'Match Schedules',
        cricket: 'Cricket',
        football: 'Football',
        contact: 'Contact Us',
        language: 'Language',
        sport: 'Sport'
    });
    const [filteredList, setFilteredList] = useState([]);

    // Load saved language and cached translations on component mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedLanguage = localStorage.getItem('language');
            const cachedTranslations = localStorage.getItem('cachedTranslations');

            if (savedLanguage && savedLanguage !== language) {
                setLanguage(savedLanguage);
            }

            // If we have cached translations for the current language, use them immediately
            if (cachedTranslations) {
                try {
                    const parsed = JSON.parse(cachedTranslations);
                    if (parsed.language === language) {
                        setTranslatedText(prev => ({
                            ...prev,
                            ...parsed.translations
                        }));
                    }
                } catch (error) {
                    console.error('Error parsing cached translations:', error);
                }
            }
        }
    }, []);

    // Filter languages based on country code
    useEffect(() => {
        if (!location || !countryCode) return;

        const matched = location.filter(
            item => item.country_code === countryCode.country_code
        );

        const otherLanguages = location.filter(
            item => item.country_code !== countryCode.country_code
        );

        const combinedList = matched.length > 0
            ? [...matched, ...otherLanguages]
            : [...location.filter(item => item.country_code === 'IN'), ...otherLanguages];

        // Remove duplicates based on hreflang
        const uniqueList = combinedList.filter((item, index, self) =>
            index === self.findIndex(t => t.hreflang === item.hreflang)
        );

        setFilteredList(uniqueList);

        // Set language if not already set
        const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('language') : null;
        if (!savedLanguage && matched.length > 0 && language !== matched[0].hreflang) {
            setLanguage(matched[0].hreflang);
        }
    }, [location, countryCode]);

    // Add this function to handle URL updates
    const updateUrlWithLanguage = (selectedLanguage) => {
        const currentPath = pathname;
        const segments = currentPath.split('/').filter(Boolean);

        // Get the current country code from the URL
        const currentLangCountry = segments[0]?.split('-')[1] || 'in'; // default to 'in' if not found

        // Create the new language-country code
        const newLangCountry = `${selectedLanguage}-${currentLangCountry}`;

        // Reconstruct the URL
        const newPath = segments.length > 1
            ? `/${newLangCountry}/${segments.slice(1).join('/')}`
            : `/${newLangCountry}`;

        // Use router to update the URL immediately
        router.push(newPath);
    };


    // Updated handleLanguageChange function
    const handleLanguageChange = async (selectedLanguage) => {
        if (selectedLanguage === language) return;

        // Mark that the user is changing the language to prevent URL effect from overriding
        setIsUserChangingLanguage(true);
        setPendingLanguage(selectedLanguage);

        // Immediately update UI state (dropdown selection)
        setLanguage(selectedLanguage);
        localStorage.setItem('language', selectedLanguage);

        // Ensure next route doesn't rerun intro animation which hides the logo
        try {
            localStorage.setItem('headerAnimationPlayed', 'true');
            document.documentElement.classList.add('header-played');
        } catch (e) { }

        // Close dropdowns
        setExpandedLanguageSelector(false);
        if (isMobile) {
            setMobileMenuOpen(false);
        }

        // Prepare URL update
        const currentPath = pathname;
        const segments = currentPath.split('/').filter(Boolean);
        const currentLangCountry = segments[0]?.split('-')[1] || 'in';
        const newLangCountry = `${selectedLanguage}-${currentLangCountry}`;
        const newPath = segments.length > 1
            ? `/${newLangCountry}/${segments.slice(1).join('/')}`
            : `/${newLangCountry}`;

        // Set navigating state for visibility/logging and push route
        setIsNavigating(true);
        console.log('[Router] route push start', { newPath });
        router.push(newPath);
    };

    // Separate translation logic into its own function
    const translateContent = async (selectedLanguage) => {
        try {
            console.log('[Translate] start', { selectedLanguage });
            setIsTranslating(true);

            const translations = {};

            // Translate Home
            const homeTranslation = await translateText([{ text: 'Home' }], 'en', selectedLanguage);
            translations.home = homeTranslation[0];

            // Translate Best Betting Apps
            const appsTranslation = await translateText([{ text: 'Best Betting Apps' }], 'en', selectedLanguage);
            translations.apps = appsTranslation[0];

            // Translate News
            const newsTranslation = await translateText([{ text: 'News' }], 'en', selectedLanguage);
            translations.news = newsTranslation[0];

            // Translate Match Schedules
            const scheduleTranslation = await translateText([{ text: 'Match Schedules' }], 'en', selectedLanguage);
            translations.schedule = scheduleTranslation[0];

            // Translate Cricket
            const cricketTranslation = await translateText([{ text: 'Cricket' }], 'en', selectedLanguage);
            translations.cricket = cricketTranslation[0];

            // Translate Football
            const footballTranslation = await translateText([{ text: 'Football' }], 'en', selectedLanguage);
            translations.football = footballTranslation[0];

            // Translate Contact
            const contactTranslation = await translateText([{ text: 'Contact' }], 'en', selectedLanguage);
            translations.contact = contactTranslation[0];

            // Translate Language
            const languageTranslation = await translateText([{ text: 'Language' }], 'en', selectedLanguage);
            translations.language = languageTranslation[0];

            // Translate Sport
            const sportTranslation = await translateText([{ text: 'Sport' }], 'en', selectedLanguage);
            translations.sport = sportTranslation[0];

            console.log('[Translate] translations fetched', { selectedLanguage, translations });

            // Update state with all translations
            setTranslatedText(prev => ({
                ...prev,
                ...translations
            }));

            // Cache translations in localStorage
            localStorage.setItem('cachedTranslations', JSON.stringify({
                language: selectedLanguage,
                translations: translations
            }));
            console.log('[Translate] state updated and cached', { selectedLanguage });
        } catch (error) {
            console.error('Translation error:', error);
        } finally {
            setIsTranslating(false);
            console.log('[Translate] end', { selectedLanguage });
        }
    };

    const handleSportChange = (selectedSport) => {
        setSport(selectedSport);
        localStorage.setItem('selectedSport', selectedSport);
        setExpandedSportsSelector(false);
        if (isMobile) {
            setMobileMenuOpen(false);
        }
    };

    const capitalizeFirstLetter = (text) =>
        text?.charAt(0).toUpperCase() + text?.slice(1).toLowerCase();

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const handleNavItemClick = () => {
        if (isMobile) {
            setMobileMenuOpen(false);
        }
    };

    const toggleCategory = (categoryId) => {
        setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    };

    const toggleLanguageSelector = () => {
        setExpandedLanguageSelector(!expandedLanguageSelector);
        setExpandedSportsSelector(false);
    };

    const toggleSportsSelector = () => {
        setExpandedSportsSelector(!expandedSportsSelector);
        setExpandedLanguageSelector(false);
    };

    // Function to get current language display name
    const getCurrentLanguageDisplay = () => {
        const currentLang = filteredList.find(lang => lang.hreflang === language);
        return currentLang ? currentLang.language : 'Language';
    };

    // Function to get current sport display name
    const getCurrentSportDisplay = () => {
        return sport === 'cricket' ? translatedText.cricket : translatedText.football;
    };

    const renderMobileMenu = () => (
        <>
            {/* Mobile Overlay */}
            <div
                className={`${styles.mobileOverlay} ${mobileMenuOpen ? styles.open : ''}`}
                onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Sidebar */}
            <div
                ref={sidebarRef}
                className={`${styles.mobileSidebar} ${mobileMenuOpen ? styles.open : ''}`}
            >
                {/* Mobile Header */}
                <div className={styles.mobileHeader}>
                    <a href={buildPath("/")} className={styles.logoContent}>
                        <div className={styles.logoIcon}>
                            <img src="/sportsbuz.png" alt="Sportsbuz Logo" className={styles.logoIconInner} />
                        </div>
                    </a>
                    <button
                        className={styles.mobileCloseButton}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Mobile Navigation Links */}
                <div className={styles.mobileNavLinks}>
                    <a
                        href={buildPath("/")}
                        className={`${styles.mobileNavItem} ${pathname === `${pathPrefix}/` ? styles.active : ''}`}
                        onClick={handleNavItemClick}
                    >
                        {translatedText.home}
                    </a>

                    {countryCode?.location?.betting_apps == 'Active' && (
                        <a
                            href={buildPath("/best-betting-apps/current")}
                            className={`${styles.mobileNavItem} ${pathname === `${pathPrefix}/best-betting-apps/current` ? styles.active : ''}`}
                            onClick={handleNavItemClick}
                        >
                            {translatedText.apps}
                        </a>
                    )}

                    <a
                        href={buildPath("/match-schedules")}
                        className={`${styles.mobileNavItem} ${pathname === `${pathPrefix}/match-schedules` ? styles.active : ''}`}
                        onClick={handleNavItemClick}
                    >
                        {translatedText.schedule}
                    </a>

                    {/* Mobile Dropdown Categories */}
                    {translatedCategories.filter((cat) => cat.featured === false).map((cat) => (
                        <div key={cat.id} className={styles.mobileDropdown}>
                            <div
                                className={styles.mobileDropdownHeader}
                                onClick={() => toggleCategory(cat.id)}
                            >
                                <a
                                    href={buildPath(`/blogs/pages/all-blogs?category=${cat.id}`)}
                                    onClick={handleNavItemClick}
                                >
                                    {capitalizeFirstLetter(cat.name)}
                                </a>
                                {cat.subcategories?.length > 0 && (
                                    <FaChevronDown
                                        style={{
                                            transform: expandedCategory === cat.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.2s ease'
                                        }}
                                    />
                                )}
                            </div>

                            {cat.subcategories?.length > 0 && (
                                <div className={`${styles.mobileSubmenu} ${expandedCategory === cat.id ? styles.open : ''}`}>
                                    {cat.subcategories.map((sub) => (
                                        <a
                                            key={sub.id}
                                            href={buildPath(`/blogs/pages/all-blogs?subcategory=${sub.id}`)}
                                            className={styles.mobileSubmenuItem}
                                            onClick={handleNavItemClick}
                                        >
                                            {sub.name}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    <a
                        href={buildPath("/contact")}
                        className={`${styles.mobileNavItem} ${pathname === `${pathPrefix}/contact` ? styles.active : ''}`}
                        onClick={handleNavItemClick}
                    >
                        {translatedText.contact}
                    </a>
                </div>

                {/* Mobile Dropdown-style Selectors */}
                <div className={styles.mobileSelectors}>
                    {/* Language Dropdown */}
                    <div className={styles.mobileDropdown}>
                        <div
                            className={styles.mobileDropdownHeader}
                            onClick={toggleLanguageSelector}
                        >
                            <span>{translatedText.language}: {getCurrentLanguageDisplay()}</span>
                            <FaChevronDown
                                style={{
                                    transform: expandedLanguageSelector ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s ease'
                                }}
                            />
                        </div>
                        <div className={`${styles.mobileSubmenu} ${expandedLanguageSelector ? styles.open : ''}`}>
                            {filteredList.map((lang) => (
                                <div
                                    className={`${styles.mobileSubmenuItem} ${language === lang.hreflang ? styles.active : ''}`}
                                    onClick={() => handleLanguageChange(lang.hreflang)}
                                >
                                    {lang.language}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sports Dropdown */}
                    <div className={styles.mobileDropdown}>
                        <div
                            className={styles.mobileDropdownHeader}
                            onClick={toggleSportsSelector}
                        >
                            <span>{translatedText.sport}: {getCurrentSportDisplay()}</span>
                            <FaChevronDown
                                style={{
                                    transform: expandedSportsSelector ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s ease'
                                }}
                            />
                        </div>
                        <div className={`${styles.mobileSubmenu} ${expandedSportsSelector ? styles.open : ''}`}>
                            <div
                                className={`${styles.mobileSubmenuItem} ${sport === 'cricket' ? styles.active : ''}`}
                                onClick={() => handleSportChange('cricket')}
                            >
                                {translatedText.cricket}
                            </div>
                            <div
                                className={`${styles.mobileSubmenuItem} ${sport === 'football' ? styles.active : ''}`}
                                onClick={() => handleSportChange('football')}
                            >
                                {translatedText.football}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Debug button to reset animation (remove in production) */}
                {process.env.NODE_ENV === 'development' && (
                    <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: '1rem' }}>
                        <button
                            onClick={resetAnimation}
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                color: 'white',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Reset Animation (Dev Only)
                        </button>
                    </div>
                )}
            </div>
        </>
    );

    return (
        <div
            ref={containerRef}
            className={`${styles.loadingContainer} ${headerFixed ? styles.fixedHeader : ''}`}
        >
            {/* Loading Animation - Only show during initial animation */}
            <div
                ref={loadingAnimationRef}
                className={`${styles.loadingAnimation} ${shouldShowAnimation ? '' : styles.hidden}`}
            >
                <div className={styles.loadingIcon}>
                    <div className={styles.mainIcon}>
                        <img src="/sportsbuz.gif" alt="Loading" className={styles.iconInner} />
                    </div>
                </div>
            </div>

            {/* SportsBuzz Logo */}
            <Logo logoRef={logoRef} buildPath={buildPath} isTranslating={isTranslating} isNavigating={isNavigating} isLogoLoaded={isLogoLoaded} />

            {/* Header Navigation */}
            <div ref={navigationRef} className={styles.navigation}>
                {/* Mobile Top Row - Only visible on mobile/tablet */}
                <div className={styles.mobileTopRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <FeaturedButton />
                        {/* Dark Mode Toggle Button for Mobile Top Row */}
                        <button
                            className={styles.darkModeButton}
                            onClick={toggleDarkMode}
                            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {darkMode ? <FaSun /> : <FaMoon />}
                        </button>
                        <button
                            className={styles.mobileMenuButton}
                            onClick={toggleMobileMenu}
                        >
                            <FaBars />
                        </button>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <div className={styles.leftSection}>
                    <div className={styles.divider}></div>
                    {/* Navigation Links */}
                    <div className={styles.navLinks}>
                        <a href={buildPath("/")} className={`${styles.navItem} ${pathname === `${pathPrefix}/` ? styles.active : ''}`}>
                            {translatedText.home}
                        </a>

                        {countryCode?.location?.betting_apps == 'Active' && (
                            <a href={buildPath("/best-betting-apps/current")} className={`${styles.navItem} ${pathname === `${pathPrefix}/best-betting-apps/current` ? styles.active : ''}`}>
                                {translatedText.apps}
                            </a>
                        )}

                        <a href={buildPath("/match-schedules")} className={`${styles.navItem} ${pathname === `${pathPrefix}/match-schedules` ? styles.active : ''}`}>
                            {translatedText.schedule}
                        </a>

                        {translatedCategories.filter((cat) => cat.featured === false).map((cat) => (
                            <div key={cat.id} className={styles.dropdown}>
                                <a
                                    href={buildPath(`/blogs/pages/all-blogs?category=${cat.id}`)}
                                    className={styles.navItem}
                                >
                                    {capitalizeFirstLetter(cat.name)} <FaChevronDown />
                                </a>

                                {cat.subcategories?.length > 0 && (
                                    <ul className={styles.submenu}>
                                        {cat.subcategories.map((sub) => (
                                            <li key={sub.id}>
                                                <a
                                                    href={buildPath(`/blogs/pages/all-blogs?subcategory=${sub.id}`)}
                                                    className={styles.submenuItem}
                                                >
                                                    {sub.name}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}

                        <FeaturedButton />
                    </div>
                </div>

                {/* Desktop Right Section */}
                <div className={styles.rightSection}>

                    <select
                        className={styles.languageSelector}
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                    >
                        {filteredList.map((lang) => (
                            <option key={lang.hreflang} value={lang.hreflang}>
                                {lang.language}
                            </option>
                        ))}
                    </select>

                    <select
                        className={styles.sportsSelector}
                        value={sport}
                        onChange={(e) => handleSportChange(e.target.value)}
                    >
                        <option value="cricket">{translatedText.cricket}</option>
                        <option value="football">{translatedText.football}</option>
                    </select>

                    {/* Dark Mode Toggle Button for Desktop */}
                    <button
                        className={styles.darkModeButton}
                        onClick={toggleDarkMode}
                        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {darkMode ? <FaSun /> : <FaMoon />}
                    </button>

                    <a href={buildPath("/contact")} className={`${styles.navItem} ${pathname === `${pathPrefix}/contact` ? styles.active : ''}`}>
                        {translatedText.contact}
                    </a>
                </div>
            </div>

            {/* Mobile Menu */}
            {renderMobileMenu()}
        </div>
    );
};

export default HeaderThree;

// Use layout effect on the client to avoid visible flicker / hidden state issues
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;