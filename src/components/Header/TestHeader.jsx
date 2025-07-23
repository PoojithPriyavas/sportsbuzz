import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Zap } from 'lucide-react';
import styles from './TestHeader.module.css';
import { usePathname } from 'next/navigation';
import { useGlobalData } from '../Context/ApiContext';
import { FaMoon, FaSun, FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import axios from 'axios';
import LiveScores from '../LiveScoreSection/LiveScoreSection';
import BonusTable from '../BonusTable/BonusTable';
import AutoSlider from '../AutoSlider/AutoSlider';
import TopNewsSection from '../NewsSection/TopNews';
import BlogSection from '../BlogsSection/BlogsSection';
import HeroCarousal from '../HeroCarousal/Carousal';
import TestLive from '../LiveScoreSection/TestLive';
import BettingCard from '../OddsMultiply/BettingCard';
import UpcomingFootballMatches from '../UpComing/UpComingFootball';
import UpcomingMatches from '../UpComing/UpComingMatches';
import SportsOddsList from '../SportsOdds/SportsOdsList';
import JoinTelegramButton from '../JoinTelegram/JoinTelegramButton';
import FooterTwo from '../Footer/Footer';
import FeaturedButton from '../FeaturedButton/FeaturedButton';

function TestHeader({ onFinish }) {
    const [animationStage, setAnimationStage] = useState('loading');
    const [phase, setPhase] = useState('loading');
    const [darkMode, setDarkMode] = useState(false);
    const [loadingComplete, setLoadingComplete] = useState(false);
    const [headerFixed, setHeaderFixed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    
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

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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

    useEffect(() => {
        const timer1 = setTimeout(() => setAnimationStage('logoReveal'), 2000);
        const timer2 = setTimeout(() => setAnimationStage('transition'), 3500);
        const timer3 = setTimeout(() => {
            setAnimationStage('header');
            setLoadingComplete(true);
            
            // Use GSAP to make header fixed after a short delay
            setTimeout(() => {
                makeHeaderFixed();
            }, 500);
        }, 5000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, []);

    const makeHeaderFixed = () => {
        const tl = gsap.timeline({
            onComplete: () => {
                setHeaderFixed(true);
            }
        });

        // Animate the header to fixed position
        tl.to(loadingContainerRef.current, {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            duration: 0.5,
            ease: "power2.out"
        })
        // Add padding top to main content to compensate for fixed header
        .to(mainContentRef.current, {
            paddingTop: '5rem',
            duration: 0.5,
            ease: "power2.out"
        }, 0); // Start at the same time as header animation
    };

    const [translatedCategories, setTranslatedCategories] = useState(blogCategories);
    const [translatedText, setTranslatedText] = useState({
        home: 'Home',
        apps: 'Best Betting Apps',
        news: 'News',
        schedule: 'Match Schedules',
        cricket: 'Cricket',
        football: 'Football',
        contact: 'Contact'
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

    // Loading animation effects
    useEffect(() => {
        const timer1 = setTimeout(() => setPhase('shrink'), 1000);
        const timer2 = setTimeout(() => {
            setPhase('complete');
            onFinish();
        }, 1400);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [onFinish]);

    // Update translations when language changes
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
                    translateText('contact', 'en', language),
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

    return (
        <>
            <div
                ref={loadingContainerRef}
                className={`${styles.loadingContainer} ${styles[animationStage]} ${headerFixed ? styles.fixedHeader : ''}`}
            >
                <div
                    className={`${styles.loadingAnimation} ${styles[animationStage]}`}
                >
                    <div className={styles.loadingIcon}>
                        <div className={styles.mainIcon}>
                            <img src="/sportsbuz.gif" alt="Loading" className={styles.iconInner} />
                        </div>
                    </div>
                </div>

                <div
                    className={`${styles.logo} ${styles[animationStage]}`}
                >
                    <div className={styles.logoContent}>
                        <div className={styles.logoIcon}>
                            <img src="/sportsbuz.png" alt="Sportsbuz Logo" className={styles.logoIconInner} />
                        </div>

                        {/* <div className={styles.logoText}>

                        </div> */}
                    </div>
                </div>

                {/* Desktop Navigation */}
                <div className={`${styles.navigation} ${animationStage === 'header' ? styles.visible : ''} ${styles.desktopNav}`}>
                    <nav className={styles.navList}>
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

                        <Link href="/contact" className={`${styles.navItem} ${pathname === '/contact' ? styles.active : ''}`}>
                            {translatedText.contact}
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

                        <FeaturedButton />
                    </nav>
                </div>

                {/* Mobile Navigation */}
                <div className={`${styles.mobileNavContainer} ${animationStage === 'header' ? styles.visible : ''}`}>
                    <div className={styles.mobileNavContent}>
                        <FeaturedButton />
                        <button 
                            className={styles.hamburgerButton}
                            onClick={toggleMobileMenu}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
                        </button>
                    </div>
                </div>

                {/* Mobile Sidebar */}
                <div 
                    className={`${styles.mobileSidebar} ${mobileMenuOpen ? styles.open : ''}`}
                    ref={sidebarRef}
                >
                    <div className={styles.sidebarContent}>
                        <div className={styles.sidebarHeader}>
                            <button 
                                className={styles.closeButton}
                                onClick={toggleMobileMenu}
                                aria-label="Close menu"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <nav className={styles.sidebarNav}>
                            <Link 
                                href="/" 
                                className={`${styles.sidebarNavItem} ${pathname === '/' ? styles.active : ''}`}
                                onClick={handleNavItemClick}
                            >
                                {translatedText.home}
                            </Link>

                            {countryCode?.location?.betting_apps === 'Active' && (
                                <Link 
                                    href="/best-betting-apps/current" 
                                    className={`${styles.sidebarNavItem} ${pathname === '/best-betting-apps/current' ? styles.active : ''}`}
                                    onClick={handleNavItemClick}
                                >
                                    {translatedText.apps}
                                </Link>
                            )}

                            <Link 
                                href="/match-schedules" 
                                className={`${styles.sidebarNavItem} ${pathname === '/match-schedules' ? styles.active : ''}`}
                                onClick={handleNavItemClick}
                            >
                                {translatedText.schedule}
                            </Link>

                            <Link 
                                href="/contact" 
                                className={`${styles.sidebarNavItem} ${pathname === '/contact' ? styles.active : ''}`}
                                onClick={handleNavItemClick}
                            >
                                {translatedText.contact}
                            </Link>

                            {translatedCategories.map((cat) => (
                                <div key={cat.id} className={styles.sidebarDropdown}>
                                    <Link
                                        href={`/blogs/pages/all-blogs?category=${cat.id}`}
                                        className={styles.sidebarNavItem}
                                        onClick={handleNavItemClick}
                                    >
                                        {capitalizeFirstLetter(cat.name)} <FaChevronDown />
                                    </Link>

                                    {cat.subcategories?.length > 0 && (
                                        <div className={styles.sidebarSubmenu}>
                                            {cat.subcategories.map((sub) => (
                                                <Link
                                                    key={sub.id}
                                                    href={`/blogs/pages/all-blogs?subcategory=${sub.id}`}
                                                    className={styles.sidebarSubmenuItem}
                                                    onClick={handleNavItemClick}
                                                >
                                                    {sub.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className={styles.sidebarSelectors}>
                                <div className={styles.selectorGroup}>
                                    <label className={styles.selectorLabel}>Language</label>
                                    <select
                                        className={styles.sidebarSelector}
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

                                <div className={styles.selectorGroup}>
                                    <label className={styles.selectorLabel}>Sport</label>
                                    <select
                                        className={styles.sidebarSelector}
                                        value={sport}
                                        onChange={handleSportChange}
                                    >
                                        <option value="cricket">{translatedText.cricket}</option>
                                        <option value="football">{translatedText.football}</option>
                                    </select>
                                </div>
                            </div>
                        </nav>
                    </div>
                </div>

                {/* Mobile Overlay */}
                {mobileMenuOpen && <div className={styles.mobileOverlay} onClick={toggleMobileMenu}></div>}
            </div>

            {/* Only render main content after loading is complete */}
            {loadingComplete && (
                <>
                    <div
                        ref={mainContentRef}
                        className={`${styles.mainContent} ${styles.visible}`}
                    >
                        <div className={styles.contentContainer}>

                            {sport === 'cricket' ? (
                                <>
                                    <LiveScores apiResponse={apiResponse} matchTypes={matchTypes} teamImages={teamImages} />
                                </>
                            ) : (
                                <TestLive />
                            )}
                            <HeroCarousal />

                            <div className={styles.fourColumnRow}>
                                <div className={styles.leftThreeColumns}>
                                    {countryCode?.location?.betting_apps === 'Active' && (
                                        <BonusTable sections={sections} />
                                    )}
                                    <div className={styles.twoSplitRow}>
                                        <div className={styles.leftSplit}>

                                            {sport === 'cricket' ? (
                                                <>
                                                    <UpcomingMatches upcomingMatches={upcomingMatches} />
                                                </>
                                            ) : (
                                                <UpcomingFootballMatches />
                                            )}
                                            <SportsOddsList />

                                            <TopNewsSection />

                                        </div>
                                        <div className={styles.centerSplit}>
                                            <BlogSection blogs={blogs} />
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.fourthColumn}>

                                    <BettingCard />
                                    <JoinTelegramButton />
                                    <AutoSlider />
                                    {sport === 'cricket' ? (
                                        <>
                                            <UpcomingMatches upcomingMatches={upcomingMatches} />
                                        </>
                                    ) : (
                                        <UpcomingFootballMatches />
                                    )}

                                </div>
                            </div>

                        </div>
                    </div>
                    <FooterTwo />
                </>
            )}

        </>
    );
}

export default TestHeader;