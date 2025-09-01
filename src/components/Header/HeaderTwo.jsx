import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import styles from './HeaderTwo.module.css';
import { usePathname } from 'next/navigation';
import { useGlobalData } from '../Context/ApiContext';
import { FaMoon, FaSun, FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import axios from 'axios';

import FeaturedButton from '../FeaturedButton/FeaturedButton';

const HeaderTwo = ({ animationStage }) => {
    const [darkMode, setDarkMode] = useState(false);
    const [headerFixed, setHeaderFixed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState(null);

    // Mobile dropdown states
    const [expandedLanguageSelector, setExpandedLanguageSelector] = useState(false);
    const [expandedSportsSelector, setExpandedSportsSelector] = useState(false);

    // Animation state - FIXED: Initialize with safe defaults for SSR
    const [animationComplete, setAnimationComplete] = useState(false);
    const [shouldShowAnimation, setShouldShowAnimation] = useState(false);
    const [isClient, setIsClient] = useState(false);

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
        upcomingMatches
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

    // Initialize client-side state and check localStorage
    useEffect(() => {
        setIsClient(true);
        const hasPlayedAnimation = localStorage.getItem('headerAnimationPlayed') === 'true';
        setAnimationComplete(hasPlayedAnimation);
        setShouldShowAnimation(!hasPlayedAnimation);
    }, []);

    // Initialize GSAP animation
    useEffect(() => {
        if (!isClient) return; // Wait for client-side hydration

        const hasPlayedAnimation = localStorage.getItem('headerAnimationPlayed');

        if (hasPlayedAnimation) {
            // Animation already played - set final state immediately
            gsap.set(containerRef.current, {
                height: '5rem',
                overflow: 'visible',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1rem'
            });

            // FIXED: Ensure loading animation is completely hidden
            if (loadingAnimationRef.current) {
                gsap.set(loadingAnimationRef.current, {
                    opacity: 0,
                    scale: 0.5,
                    display: 'none',
                    visibility: 'hidden'
                });
                loadingAnimationRef.current.style.display = 'none';
                loadingAnimationRef.current.style.visibility = 'hidden';
            }

            gsap.set(logoRef.current, {
                position: 'relative',
                bottom: 'auto',
                left: 'auto',
                opacity: 1,
                x: 0,
                y: 0,
                visibility: 'visible'
            });

            gsap.set(navigationRef.current, {
                opacity: 1,
                display: 'flex'
            });

            // FIXED: Ensure states are set correctly
            setShouldShowAnimation(false);
            setAnimationComplete(true);

            return; // Exit early if animation already played
        }

        // Animation hasn't played yet - set initial states for animation
        setShouldShowAnimation(true);
        setAnimationComplete(false);

        gsap.set(containerRef.current, {
            height: '100vh',
            overflow: 'hidden',
            display: 'block',
            alignItems: 'stretch',
            justifyContent: 'flex-start',
            padding: '0'
        });

        if (loadingAnimationRef.current) {
            gsap.set(loadingAnimationRef.current, {
                opacity: 1,
                scale: 1,
                display: 'flex',
                visibility: 'visible'
            });
        }

        gsap.set(logoRef.current, {
            position: 'absolute',
            bottom: '2rem',
            left: '2rem',
            opacity: 0,
            x: 0,
            y: 80,
            visibility: 'hidden'
        });

        gsap.set(navigationRef.current, {
            opacity: 0,
            display: 'none'
        });

        // Create the main timeline
        const tl = gsap.timeline({
            onComplete: () => {
                setAnimationComplete(true);
                setShouldShowAnimation(false); // FIXED: Hide animation on complete
                localStorage.setItem('headerAnimationPlayed', 'true');

                // FIXED: Additional cleanup for loading animation
                if (loadingAnimationRef.current) {
                    loadingAnimationRef.current.style.display = 'none';
                    loadingAnimationRef.current.style.visibility = 'hidden';
                }
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
            // FIXED: Properly hide loading animation at the end
            .set(loadingAnimationRef.current, {
                display: 'none',
                visibility: 'hidden'
            });

        timelineRef.current = tl;

        // Cleanup function
        return () => {
            if (timelineRef.current) {
                timelineRef.current.kill();
            }
        };
    }, [isClient]);

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
        const parts = pathname.split('/').filter(part => part !== '');
        const countryCode = parts.length > 0 ? parts[0].toUpperCase() : '';
        const language = parts.length > 1 ? parts[1].toLowerCase() : '';
        return { countryCode, language };
    };

    // Handle URL-based country code and language
    useEffect(() => {
        if (!location || location.length === 0) return;

        const { countryCode: urlCountryCode, language: urlLanguage } = parseUrlPath(pathname);

        // Set language from URL if available and valid
        if (urlLanguage) {
            const isValidLanguage = location.some(loc => loc.hreflang === urlLanguage);
            if (isValidLanguage && language !== urlLanguage) {
                setLanguage(urlLanguage);
                localStorage.setItem('language', urlLanguage);
            }
        }

        // Set sport based on URL country code if available
        if (urlCountryCode) {
            const matchedLocation = location.find(loc => loc.country_code === urlCountryCode);
            if (matchedLocation?.sports) {
                const apiSport = matchedLocation.sports.toLowerCase();
                if (apiSport !== sport) {
                    setSport(apiSport);
                    localStorage.setItem('selectedSport', apiSport);
                }
            }
        }
    }, [pathname, location, language, sport]);

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

    // Load saved language on component mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedLanguage = localStorage.getItem('language');
            if (savedLanguage && savedLanguage !== language) {
                setLanguage(savedLanguage);
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

    useEffect(() => {
        const updateTranslations = async () => {
            try {
                const [home, apps, news, schedule, cricket, football, contact, languageText, sportText] = await Promise.all([
                    translateText('Home', 'en', language),
                    translateText('Best Betting Apps', 'en', language),
                    translateText('News', 'en', language),
                    translateText('Match Schedules', 'en', language),
                    translateText('Cricket', 'en', language),
                    translateText('Football', 'en', language),
                    translateText('Contact', 'en', language),
                    translateText('Language', 'en', language),
                    translateText('Sport', 'en', language),
                ]);

                setTranslatedText(prev => ({
                    ...prev,
                    home, apps, news, schedule, cricket, football, contact,
                    language: languageText,
                    sport: sportText
                }));

                const translatedCategories = await Promise.all(
                    blogCategories.map(async (cat) => {
                        const translatedCatName = await translateText(cat.name, 'en', language);
                        const translatedSubs = await Promise.all(
                            (cat.subcategories || []).map(async (sub) => ({
                                ...sub,
                                name: await translateText(sub.name, 'en', language),
                            }))
                        );
                        return {
                            ...cat,
                            name: translatedCatName,
                            subcategories: translatedSubs,
                        };
                    })
                );
                setTranslatedCategories(translatedCategories);
            } catch (error) {
                console.error('Translation error:', error);
            }
        };

        updateTranslations();
    }, [language, translateText, blogCategories]);

    const handleLanguageChange = (selectedLanguage) => {
        setLanguage(selectedLanguage);
        localStorage.setItem('language', selectedLanguage);
        setExpandedLanguageSelector(false);
        if (isMobile) {
            setMobileMenuOpen(false);
        }
    };

    // Optimized sport change handler with debouncing
    const [isChangingSport, setIsChangingSport] = useState(false);

    const handleSportChange = (selectedSport) => {
        // Prevent multiple rapid sport changes
        if (isChangingSport) return;

        // Set loading state
        setIsChangingSport(true);

        // First update localStorage to ensure consistency
        localStorage.setItem('selectedSport', selectedSport);

        // Close menus immediately for better UX
        setExpandedSportsSelector(false);
        if (isMobile) {
            setMobileMenuOpen(false);
        }

        // Delay the actual sport change to prevent UI freezing
        setTimeout(() => {
            // Then update state
            setSport(selectedSport);
            // Reset loading state after a short delay to ensure UI updates
            setTimeout(() => setIsChangingSport(false), 300);
        }, 50);
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
                    <Link href='/' className={styles.logoContent}>
                        <div className={styles.logoIcon}>
                            <img src="/sportsbuz.png" alt="Sportsbuz Logo" className={styles.logoIconInner} />
                        </div>
                    </Link>
                    <button
                        className={styles.mobileCloseButton}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Mobile Navigation Links */}
                <div className={styles.mobileNavLinks}>
                    <Link
                        href="/"
                        className={`${styles.mobileNavItem} ${pathname === '/' ? styles.active : ''}`}
                        onClick={handleNavItemClick}
                    >
                        {translatedText.home}
                    </Link>

                    {countryCode?.location?.betting_apps === 'Active' && (
                        <Link
                            href="/best-betting-apps/current"
                            className={`${styles.mobileNavItem} ${pathname === '/best-betting-apps/current' ? styles.active : ''}`}
                            onClick={handleNavItemClick}
                        >
                            {translatedText.apps}
                        </Link>
                    )}

                    <Link
                        href="/match-schedules"
                        className={`${styles.mobileNavItem} ${pathname === '/match-schedules' ? styles.active : ''}`}
                        onClick={handleNavItemClick}
                    >
                        {translatedText.schedule}
                    </Link>

                    {/* Mobile Dropdown Categories */}
                    {translatedCategories.filter((cat) => cat.featured === false).map((cat) => (
                        <div key={cat.id} className={styles.mobileDropdown}>
                            <div
                                className={styles.mobileDropdownHeader}
                                onClick={() => toggleCategory(cat.id)}
                            >
                                <Link
                                    href={`/blogs/pages/all-blogs?category=${cat.id}`}
                                    onClick={handleNavItemClick}
                                >
                                    {capitalizeFirstLetter(cat.name)}
                                </Link>
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
                                        <Link
                                            key={sub.id}
                                            href={`/blogs/pages/all-blogs?subcategory=${sub.id}`}
                                            className={styles.mobileSubmenuItem}
                                            onClick={handleNavItemClick}
                                        >
                                            {sub.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    <Link
                        href="/contact"
                        className={`${styles.mobileNavItem} ${pathname === '/contact' ? styles.active : ''}`}
                        onClick={handleNavItemClick}
                    >
                        {translatedText.contact}
                    </Link>

                    {/* Dark Mode Toggle in Mobile Menu */}
                    <div
                        className={styles.mobileNavItem}
                        onClick={toggleDarkMode}
                        style={{ cursor: 'pointer' }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {darkMode ? <FaSun /> : <FaMoon />}
                            {darkMode ? 'Light Mode' : 'Dark Mode'}
                        </span>
                    </div>
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
                                    key={lang.hreflang}
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
                                {isChangingSport && sport !== 'cricket' ? (
                                    <span className={styles.loadingIndicator}>
                                        {/* Loading... */}
                                    </span>
                                ) : (
                                    translatedText.cricket
                                )}
                            </div>
                            <div
                                className={`${styles.mobileSubmenuItem} ${sport === 'football' ? styles.active : ''}`}
                                onClick={() => handleSportChange('football')}
                            >
                                {isChangingSport && sport !== 'football' ? (
                                    <span className={styles.loadingIndicator}>
                                        {/* Loading... */}
                                    </span>
                                ) : (
                                    translatedText.football
                                )}
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
            className={styles.loadingContainer}
        >
            {/* Loading Animation - FIXED: Only show when client-side and conditions are met */}
            {isClient && shouldShowAnimation && !animationComplete && (
                <div
                    ref={loadingAnimationRef}
                    className={styles.loadingAnimation}
                    style={{
                        display: (isClient && shouldShowAnimation && !animationComplete) ? 'flex' : 'none',
                        visibility: (isClient && shouldShowAnimation && !animationComplete) ? 'visible' : 'hidden'
                    }}
                >
                    <div className={styles.loadingIcon}>
                        <div className={styles.mainIcon}>
                            <img src="/sportsbuz.gif" alt="Loading" className={styles.iconInner} />
                        </div>
                    </div>
                </div>
            )}

            {/* SportsBuzz Logo */}
            <div ref={logoRef} className={styles.logo}>
                <Link href='/' className={styles.logoContent}>
                    <div className={styles.logoIcon}>
                        <img src="/sportsbuz.png" alt="Sportsbuz Logo" className={styles.logoIconInner} />
                    </div>
                </Link>
            </div>

            {/* Header Navigation */}
            <div ref={navigationRef} className={styles.navigation}>
                {/* Mobile Top Row - Only visible on mobile/tablet */}
                <div className={styles.mobileTopRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <FeaturedButton />
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
                        <Link href="/" className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`}>
                            {translatedText.home}
                        </Link>

                        {countryCode?.location?.betting_apps === 'Active' && (
                            <Link href="/best-betting-apps/current" className={`${styles.navItem} ${pathname === '/best-betting-apps/current' ? styles.active : ''}`}>
                                {translatedText.apps}
                            </Link>
                        )}

                        <Link href="/match-schedules" className={`${styles.navItem} ${pathname === '/match-schedules' ? styles.active : ''}`}>
                            {translatedText.schedule}
                        </Link>

                        {translatedCategories.filter((cat) => cat.featured === false).map((cat) => (
                            <div key={cat.id} className={styles.dropdown}>
                                <Link
                                    href={`/blogs/pages/all-blogs?category=${cat.id}`}
                                    className={styles.navItem}
                                >
                                    {capitalizeFirstLetter(cat.name)} <FaChevronDown />
                                </Link>

                                {cat.subcategories?.length > 0 && (
                                    <ul className={styles.submenu}>
                                        {cat.subcategories.map((sub) => (
                                            <li key={sub.id}>
                                                <Link
                                                    href={`/blogs/pages/all-blogs?subcategory=${sub.id}`}
                                                    className={styles.submenuItem}
                                                >
                                                    {sub.name}
                                                </Link>
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

                    <div className={styles.sportsSelectorWrapper}>
                        {/* {isChangingSport && (
                            <span className={styles.loadingIndicator}>Loading...</span>
                        )} */}
                        <select
                            className={`${styles.sportsSelector} ${isChangingSport ? styles.disabled : ''}`}
                            value={sport}
                            onChange={(e) => handleSportChange(e.target.value)}
                            disabled={isChangingSport}
                        >
                            <option value="cricket">{translatedText.cricket}</option>
                            <option value="football">{translatedText.football}</option>
                        </select>
                    </div>

                    {/* Dark Mode Toggle Button for Desktop */}
                    <button
                        className={styles.darkModeButton}
                        onClick={toggleDarkMode}
                        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {darkMode ? <FaSun /> : <FaMoon />}
                    </button>

                    <Link href="/contact" className={`${styles.navItem} ${pathname === '/contact' ? styles.active : ''}`}>
                        {translatedText.contact}
                    </Link>
                </div>
            </div>

            {/* Render Mobile Menu */}
            {renderMobileMenu()}
        </div>
    );
};

export default HeaderTwo;