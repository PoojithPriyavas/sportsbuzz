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

// Top-level component: Logo - Always visible, memoized to prevent unnecessary re-renders
const Logo = React.memo(({ logoRef, buildPath, isTranslating, pathname }) => {
    return (
        <div ref={logoRef} className={styles.logo} style={{ opacity: 1, visibility: 'visible' }}>
            <a href={buildPath("/")} className={styles.logoContent} onClick={() => {
                console.log('[Logo] Clicked', { pathname, time: new Date().toISOString() });
            }}>
                <div className={styles.logoIcon}>
                    <img
                        src="/sportsbuz.png"
                        alt="Sportsbuz Logo"
                        className={styles.logoIconInner}
                        style={{ opacity: 1 }}
                        onLoad={() => {
                            console.log('[Logo] <img> onLoad', {
                                pathname,
                                isTranslating,
                                time: new Date().toISOString(),
                            });
                        }}
                        onError={(e) => {
                            console.error('[Logo] <img> onError', {
                                pathname,
                                isTranslating,
                                error: e?.nativeEvent?.message ?? 'Unknown error',
                                time: new Date().toISOString(),
                            });
                        }}
                    />
                </div>
            </a>
        </div>
    );
});

Logo.displayName = 'Logo';

function HeaderThree({ animationStage, languageValidation }) {
    const [darkMode, setDarkMode] = useState(false);
    const [headerFixed, setHeaderFixed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [isUserChangingLanguage, setIsUserChangingLanguage] = useState(false);
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

    // Use layout effect for GSAP to avoid flicker
    const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

    // Initialize GSAP animation
    useIsomorphicLayoutEffect(() => {
        const hasPlayedAnimation = localStorage.getItem('headerAnimationPlayed') === 'true';
        console.log('[HeaderThree] Init animation', {
            hasPlayedAnimation,
            pathname,
            isTranslating,
            time: new Date().toISOString(),
        });

        // CRITICAL FIX: Set initial states with logo ALWAYS visible
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
            display: hasPlayedAnimation ? 'none' : 'flex',
            pointerEvents: 'none' // Prevent interference with logo
        });

        // CRITICAL FIX: Logo must ALWAYS be visible and interactive
        gsap.set(logoRef.current, {
            position: hasPlayedAnimation ? 'relative' : 'absolute',
            bottom: hasPlayedAnimation ? 'auto' : '2rem',
            left: hasPlayedAnimation ? 'auto' : '2rem',
            opacity: 1, // Always visible
            visibility: 'visible', // Always visible
            x: 0,
            y: hasPlayedAnimation ? 0 : 80,
            pointerEvents: 'auto', // Always interactive
            zIndex: 100 // Ensure it's above other elements
        });

        gsap.set(navigationRef.current, {
            opacity: hasPlayedAnimation ? 1 : 0,
            display: hasPlayedAnimation ? 'flex' : 'none'
        });

        if (!hasPlayedAnimation) {
            setShouldShowAnimation(true);

            try {
                localStorage.setItem('headerAnimationPlayed', 'true');
                document.documentElement.classList.add('header-played');
                console.log('[HeaderThree] Marked headerAnimationPlayed=true');
            } catch (e) {
                console.error('[HeaderThree] Failed to set animation flag', e);
            }

            // Create the main timeline
            const tl = gsap.timeline({
                onComplete: () => {
                    setAnimationComplete(true);
                    console.log('[Logo Timeline] onComplete', {
                        pathname,
                        time: new Date().toISOString(),
                    });
                }
            });

            console.log('[Logo Timeline] Step 1: show loading start');
            tl.to({}, { duration: 2 })
                .call(() => {
                    console.log('[Logo Timeline] Step 1: show loading complete', {
                        time: new Date().toISOString(),
                    });
                })

                // Step 2: Hide loading animation and ensure logo is visible
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
                .call(() => {
                    console.log('[Logo Timeline] Step 2: hide loading & show logo complete', {
                        logoRect: logoRef.current?.getBoundingClientRect(),
                        time: new Date().toISOString(),
                    });
                })

                // Step 3: Wait a moment (1 second)
                .to({}, { duration: 1 })
                .call(() => {
                    console.log('[Logo Timeline] Step 3: wait complete', {
                        time: new Date().toISOString(),
                    });
                })

                // Step 4: Shrink container and move logo to header position
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
                .call(() => {
                    console.log('[Logo Timeline] Step 4: shrink & move logo complete', {
                        logoRect: logoRef.current?.getBoundingClientRect(),
                        time: new Date().toISOString(),
                    });
                })

                // Step 5: Convert logo to relative positioning
                .set(logoRef.current, {
                    position: 'relative',
                    bottom: 'auto',
                    left: 'auto',
                    x: 0,
                    y: 0,
                    opacity: 1,
                    visibility: 'visible'
                })
                .call(() => {
                    console.log('[Logo Timeline] Step 5: position set (relative)', {
                        logoRect: logoRef.current?.getBoundingClientRect(),
                        time: new Date().toISOString(),
                    });
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
                })
                .call(() => {
                    console.log('[Logo Timeline] Step 6: navigation shown, loading hidden', {
                        time: new Date().toISOString(),
                    });
                });

            timelineRef.current = tl;
        } else {
            setShouldShowAnimation(false);
            setAnimationComplete(true);
            console.log('[HeaderThree] Animation already played; final state applied');
        }

        return () => {
            if (timelineRef.current) {
                timelineRef.current.kill();
                console.log('[HeaderThree] Timeline killed on cleanup');
            }
        };
    }, []);

    // Function to reset animation (for development)
    const resetAnimation = () => {
        localStorage.removeItem('headerAnimationPlayed');
        document.documentElement.classList.remove('header-played');
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

        const firstSegment = pathname.replace(/^\//, '').split('/')[0];
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
            if (isValidLanguage && language !== urlLanguage && !isUserChangingLanguage) {
                setLanguage(urlLanguage);
                localStorage.setItem('language', urlLanguage);
            }
        }

        // Respect user-selected sport
        const userSelectedSport = typeof window !== 'undefined' ? localStorage.getItem('selectedSport') : null;

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

    // Start translation after URL reflects pending language
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

    // Load saved language and cached translations
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedLanguage = localStorage.getItem('language');
            const cachedTranslations = localStorage.getItem('cachedTranslations');

            if (savedLanguage && savedLanguage !== language) {
                setLanguage(savedLanguage);
            }

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

        const uniqueList = combinedList.filter((item, index, self) =>
            index === self.findIndex(t => t.hreflang === item.hreflang)
        );

        setFilteredList(uniqueList);

        const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('language') : null;
        if (!savedLanguage && matched.length > 0 && language !== matched[0].hreflang) {
            setLanguage(matched[0].hreflang);
        }
    }, [location, countryCode]);

    // Handle language change
    const handleLanguageChange = async (selectedLanguage) => {
        if (selectedLanguage === language) return;

        setIsUserChangingLanguage(true);
        setPendingLanguage(selectedLanguage);

        setLanguage(selectedLanguage);
        localStorage.setItem('language', selectedLanguage);

        // Ensure animation flag is set
        try {
            localStorage.setItem('headerAnimationPlayed', 'true');
            document.documentElement.classList.add('header-played');
        } catch (e) {}

        setExpandedLanguageSelector(false);
        if (isMobile) {
            setMobileMenuOpen(false);
        }

        const currentPath = pathname;
        const segments = currentPath.split('/').filter(Boolean);
        const currentLangCountry = segments[0]?.split('-')[1] || 'in';
        const newLangCountry = `${selectedLanguage}-${currentLangCountry}`;
        const newPath = segments.length > 1
            ? `/${newLangCountry}/${segments.slice(1).join('/')}`
            : `/${newLangCountry}`;

        console.group('[LanguageChange]');
        console.log('From language:', language);
        console.log('To language:', selectedLanguage);
        console.log('Current pathname:', pathname);

        console.log('Navigating to newPath:', newPath);
        console.groupEnd();

        router.push(newPath);
    };

    // Translate content function
    const translateContent = async (selectedLanguage) => {
        console.time('[translateContent]');
        console.log('[translateContent] Start', { selectedLanguage, pathname, time: new Date().toISOString() });
        try {
            setIsTranslating(true);
            const translations = {};
            const textsToTranslate = [
                'Home', 'Best Betting Apps', 'News', 'Match Schedules',
                'Cricket', 'Football', 'Contact', 'Language', 'Sport'
            ];

            for (let i = 0; i < textsToTranslate.length; i++) {
                console.log('[translateContent] Translating', { index: i, text: textsToTranslate[i] });
                const translated = await translateText([{ text: textsToTranslate[i] }], 'en', selectedLanguage);
                const keys = ['home', 'apps', 'news', 'schedule', 'cricket', 'football', 'contact', 'language', 'sport'];
                translations[keys[i]] = translated[0];
            }

            setTranslatedText(prev => ({
                ...prev,
                ...translations
            }));

            localStorage.setItem('cachedTranslations', JSON.stringify({
                language: selectedLanguage,
                translations: translations
            }));
            console.log('[translateContent] Cached translations updated');
        } catch (error) {
            console.error('Translation error:', error);
        } finally {
            setIsTranslating(false);
            console.timeEnd('[translateContent]');
            console.log('[translateContent] End', { selectedLanguage, time: new Date().toISOString() });
        }
    };

    // Log translation state changes
    useEffect(() => {
        console.log('[HeaderThree] isTranslating changed', { isTranslating, pathname, time: new Date().toISOString() });
    }, [isTranslating, pathname]);

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

    const getCurrentLanguageDisplay = () => {
        const currentLang = filteredList.find(lang => lang.hreflang === language);
        return currentLang ? currentLang.language : 'Language';
    };

    const getCurrentSportDisplay = () => {
        return sport === 'cricket' ? translatedText.cricket : translatedText.football;
    };

    const renderMobileMenu = () => (
        <>
            <div
                className={`${styles.mobileOverlay} ${mobileMenuOpen ? styles.open : ''}`}
                onClick={() => setMobileMenuOpen(false)}
            />

            <div
                ref={sidebarRef}
                className={`${styles.mobileSidebar} ${mobileMenuOpen ? styles.open : ''}`}
            >
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

                <div className={styles.mobileSelectors}>
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
                                    key={lang.hreflang}
                                    className={`${styles.mobileSubmenuItem} ${language === lang.hreflang ? styles.active : ''}`}
                                    onClick={() => handleLanguageChange(lang.hreflang)}
                                >
                                    {lang.language}
                                </div>
                            ))}
                        </div>
                    </div>

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
            <div
                ref={loadingAnimationRef}
                className={`${styles.loadingAnimation} ${shouldShowAnimation ? '' : styles.hidden}`}
                style={{ pointerEvents: 'none' }}
            >
                <div className={styles.loadingIcon}>
                    <div className={styles.mainIcon}>
                        <img
                            src="/sportsbuz.gif"
                            alt="Loading"
                            className={styles.iconInner}
                            onLoad={() => console.log('[LoadingGif] onLoad', { time: new Date().toISOString() })}
                            onError={(e) => console.error('[LoadingGif] onError', { error: e?.nativeEvent?.message ?? 'Unknown', time: new Date().toISOString() })}
                        />
                    </div>
                </div>
            </div>

            <Logo
                logoRef={logoRef}
                buildPath={buildPath}
                isTranslating={isTranslating}
                pathname={pathname}
            />

            <div ref={navigationRef} className={styles.navigation}>
                <div className={styles.mobileTopRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <FeaturedButton />
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

                <div className={styles.leftSection}>
                    <div className={styles.divider}></div>
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

            {renderMobileMenu()}
        </div>
    );
}

export default HeaderThree;