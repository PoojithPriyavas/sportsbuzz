import React, { useState, useEffect, useRef } from 'react';
import styles from './HeaderTwo.module.css';
import { usePathname } from 'next/navigation';
import { useGlobalData } from '../Context/ApiContext';
import { FaMoon, FaSun, FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import axios from 'axios';

import FeaturedButton from '../FeaturedButton/FeaturedButton';

const HeaderTwo = ({ animationStage }) => {
    const [phase, setPhase] = useState('loading');
    const [darkMode, setDarkMode] = useState(false);
    const [loadingComplete, setLoadingComplete] = useState(false);
    const [headerFixed, setHeaderFixed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState(null);
    
    // New state to track if animation should play
    const [shouldPlayAnimation, setShouldPlayAnimation] = useState(false);
    const [currentAnimationStage, setCurrentAnimationStage] = useState('header');

    // GSAP refs
    const loadingContainerRef = useRef(null);
    const mainContentRef = useRef(null);
    const sidebarRef = useRef(null);

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

    // Check if animation should play on component mount
    useEffect(() => {
        const hasPlayedAnimation = localStorage.getItem('headerAnimationPlayed');
        
        if (!hasPlayedAnimation) {
            // First time - play the full animation
            setShouldPlayAnimation(true);
            setCurrentAnimationStage('loading');
            
            // Animation sequence
            setTimeout(() => {
                setCurrentAnimationStage('logoReveal');
            }, 1000);
            
            setTimeout(() => {
                setCurrentAnimationStage('transition');
            }, 2500);
            
            setTimeout(() => {
                setCurrentAnimationStage('header');
                // Mark animation as played
                localStorage.setItem('headerAnimationPlayed', 'true');
            }, 4000);
        } else {
            // Animation already played - go directly to header
            setShouldPlayAnimation(false);
            setCurrentAnimationStage('header');
        }
    }, []);

    // Function to parse URL path for country code and language
    const parseUrlPath = (pathname) => {
        const parts = pathname.split('/').filter(part => part !== '');
        const countryCode = parts.length > 0 ? parts[0].toUpperCase() : '';
        const language = parts.length > 1 ? parts[1].toLowerCase() : '';
        return { countryCode, language };
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
        contact: 'Contact Us'
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
                const [home, apps, news, schedule, cricket, football, contact] = await Promise.all([
                    translateText('Home', 'en', language),
                    translateText('Best Betting Apps', 'en', language),
                    translateText('News', 'en', language),
                    translateText('Match Schedules', 'en', language),
                    translateText('Cricket', 'en', language),
                    translateText('Football', 'en', language),
                    translateText('Contact', 'en', language),
                ]);

                setTranslatedText(prev => ({
                    ...prev,
                    home, apps, news, schedule, cricket, football, contact
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

    const handleLanguageChange = (e) => {
        const selected = e.target.value;
        setLanguage(selected);
        localStorage.setItem('language', selected);
        if (isMobile) {
            setMobileMenuOpen(false);
        }
    };

    const handleSportChange = (e) => {
        const newSport = e.target.value;
        setSport(newSport);
        localStorage.setItem('selectedSport', newSport);
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

    // Function to reset animation (you can call this if needed)
    const resetAnimation = () => {
        localStorage.removeItem('headerAnimationPlayed');
        window.location.reload();
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
                    <div className={styles.logoContent}>
                        <div className={styles.logoIcon}>
                            <img src="/sportsbuz.png" alt="Sportsbuz Logo" className={styles.logoIconInner} />
                        </div>
                    </div>
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
                    {translatedCategories.map((cat) => (
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
                </div>

                {/* Mobile Selectors */}
                <div className={styles.mobileSelectors}>
                    <div className={styles.mobileSelectorGroup}>
                        <label className={styles.mobileSelectorLabel}>Language</label>
                        <select
                            className={styles.mobileSelector}
                            value={language}
                            onChange={handleLanguageChange}
                        >
                            {filteredList.map((lang) => (
                                <option key={lang.hreflang} value={lang.hreflang}>
                                    {lang.language}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.mobileSelectorGroup}>
                        <label className={styles.mobileSelectorLabel}>Sport</label>
                        <select
                            className={styles.mobileSelector}
                            value={sport}
                            onChange={handleSportChange}
                        >
                            <option value="cricket">{translatedText.cricket}</option>
                            <option value="football">{translatedText.football}</option>
                        </select>
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
        <div className={`${styles.loadingContainer} ${styles[currentAnimationStage]}`}>
            {/* Loading Animation in Center - Only show if animation should play */}
            {shouldPlayAnimation && (
                <div className={`${styles.loadingAnimation} ${styles[currentAnimationStage]}`}>
                    <div className={styles.loadingIcon}>
                        {/* Main Loading Icon */}
                        <div className={styles.mainIcon}>
                            <img src="/sportsbuz.gif" alt="Loading" className={styles.iconInner} />
                        </div>
                    </div>
                </div>
            )}

            {/* SportsBuzz Logo (Bottom Left during loading or header position) */}
            <div className={`${styles.logo} ${styles[currentAnimationStage]}`}>
                <div className={styles.logoContent}>
                    {/* Logo Icon */}
                    <div className={styles.logoIcon}>
                        <img src="/sportsbuz.png" alt="Sportsbuz Logo" className={styles.logoIconInner} />
                    </div>
                </div>
            </div>

            {/* Header Navigation (Final Stage) */}
            <div className={`${styles.navigation} ${styles[currentAnimationStage]}`}>
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

                        {translatedCategories.map((cat) => (
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
                        onChange={handleLanguageChange}
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
                        onChange={handleSportChange}
                    >
                        <option value="cricket">{translatedText.cricket}</option>
                        <option value="football">{translatedText.football}</option>
                    </select>
                    
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