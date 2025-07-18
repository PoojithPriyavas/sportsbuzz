'use client';

import { useEffect, useState } from 'react';
import styles from './Loader.module.css';
import { usePathname } from 'next/navigation';
import { useGlobalData } from '../Context/ApiContext';
import { FaMoon, FaSun, FaChevronDown } from 'react-icons/fa';
import Link from 'next/link';
import axios from 'axios';
import FeaturedButton from '../FeaturedButton/FeaturedButton';

export default function LoadingScreen({ onFinish }) {
  const [phase, setPhase] = useState('loading');
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();

  const {
    blogCategories = [],
    translateText,
    setLanguage,
    language,
    location,
    countryCode,
    sport,
    setSport,
  } = useGlobalData();

  // Helper function to get initial sport from localStorage or country settings
  const getInitialSport = () => {
    // First check localStorage
    if (typeof window !== 'undefined') {
      const savedSport = localStorage.getItem('selectedSport');
      if (savedSport) {
        return savedSport;
      }
    }

    // Fallback to country settings or default
    return countryCode?.location?.sports?.toLowerCase() || 'cricket';
  };

  const [selectedSport, setSelectedSport] = useState(getInitialSport());

  const [translatedCategories, setTranslatedCategories] = useState(blogCategories);
  const [translatedText, setTranslatedText] = useState({
    home: 'Home',
    apps: 'Best Betting Apps',
    news: 'News',
    schedule: 'Match Schedules',
    cricket: 'Cricket',
    football: 'Football'
  });

  // COUNTRY CODE BASED LANGUAGE FILTERING 

  // const [filteredList, setFilteredList] = useState([]);

  // useEffect(() => {
  //   if (!location || !countryCode) return;

  //   const matched = location.filter(
  //     item => item.country_code === countryCode.country_code
  //   );

  //   const otherLanguages = location.filter(
  //     item => item.country_code !== countryCode.country_code
  //   );

  //   if (matched.length > 0) {
  //     const combinedList = [...matched, ...otherLanguages];
  //     setFilteredList(combinedList);

  //     if (language !== matched[0].hreflang) {
  //       setLanguage(matched[0].hreflang);
  //     }

  //   } else {
  //     const fallback = location.filter(item => item.country_code === 'IN');
  //     const otherLanguagesForFallback = location.filter(item => item.country_code !== 'IN');

  //     const combinedFallback = [...fallback, ...otherLanguagesForFallback];
  //     setFilteredList(combinedFallback);

  //     if (fallback.length > 0 && language !== fallback[0].hreflang) {
  //       setLanguage(fallback[0].hreflang);
  //     }

  //   }
  // }, [location, countryCode]);

  //

  // Add this useEffect to load saved language on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage && savedLanguage !== language) {
        setLanguage(savedLanguage);
      }
    }
  }, []); // Run only once on mount

  // Update the COUNTRY CODE BASED LANGUAGE FILTERING section
  const [filteredList, setFilteredList] = useState([]);

  useEffect(() => {
    if (!location || !countryCode) return;

    const matched = location.filter(
      item => item.country_code === countryCode.country_code
    );

    const otherLanguages = location.filter(
      item => item.country_code !== countryCode.country_code
    );

    if (matched.length > 0) {
      const combinedList = [...matched, ...otherLanguages];

      // Remove duplicates based on hreflang
      const uniqueList = combinedList.filter((item, index, self) =>
        index === self.findIndex(t => t.hreflang === item.hreflang)
      );

      setFilteredList(uniqueList);

      // Check if saved language exists, otherwise use matched language
      const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('language') : null;
      if (savedLanguage && uniqueList.some(lang => lang.hreflang === savedLanguage)) {
        if (language !== savedLanguage) {
          setLanguage(savedLanguage);
        }
      } else if (language !== matched[0].hreflang) {
        setLanguage(matched[0].hreflang);
      }

    } else {
      const fallback = location.filter(item => item.country_code === 'IN');
      const otherLanguagesForFallback = location.filter(item => item.country_code !== 'IN');

      const combinedFallback = [...fallback, ...otherLanguagesForFallback];

      // Remove duplicates based on hreflang
      const uniqueFallback = combinedFallback.filter((item, index, self) =>
        index === self.findIndex(t => t.hreflang === item.hreflang)
      );

      setFilteredList(uniqueFallback);

      // Check if saved language exists, otherwise use fallback language
      const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('language') : null;
      if (savedLanguage && uniqueFallback.some(lang => lang.hreflang === savedLanguage)) {
        if (language !== savedLanguage) {
          setLanguage(savedLanguage);
        }
      } else if (fallback.length > 0 && language !== fallback[0].hreflang) {
        setLanguage(fallback[0].hreflang);
      }
    }
  }, [location, countryCode]); // Removed 'language' from dependencies to avoid infinite loop


  useEffect(() => {
    const timer1 = setTimeout(() => {
      setPhase('shrink');
    }, 1000);

    const timer2 = setTimeout(() => {
      setPhase('complete');
      onFinish();
    }, 1400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  useEffect(() => {
    const updateTranslations = async () => {
      const [home, apps, news, schedule, cricket, football] = await Promise.all([
        translateText('Home', 'en', language),
        translateText('Best Betting Apps', 'en', language),
        translateText('News', 'en', language),
        translateText('Match Schedules', 'en', language),
        translateText('Cricket', 'en', language),
        translateText('Football', 'en', language)
      ]);

      setTranslatedText({ home, apps, news, schedule, cricket, football });

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
    };

    updateTranslations();
  }, [language, translateText, blogCategories]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleLanguageChange = (e) => {
    const selected = e.target.value;
    setLanguage(selected);
    localStorage.setItem('language', selected);
  };

  // Initialize sport from localStorage or country settings
  useEffect(() => {
    const initialSport = getInitialSport();
    setSport(initialSport);
    setSelectedSport(initialSport);
  }, [countryCode, setSport]);

  const handleSportChange = (e) => {
    const selectedSport = e.target.value;
    setSport(selectedSport);
    setSelectedSport(selectedSport);

    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedSport', selectedSport);
    }
  };

  return (
    <div className={`${styles.loaderWrapper} ${styles[phase]} ${darkMode ? styles.darkMode : ''}`}>
      <img src="/sportsbuz.gif" alt="Loading" className={styles.loaderGif} />

      <div className={styles.headerContainer}>
        <div className={styles.leftSection}>
          <img src="/sportsbuz.png" alt="Sportsbuz Logo" className={styles.logo} />

          <div className={styles.navSection}>
            <span className={styles.separator}>|</span>
            <nav className={styles.nav}>
              <Link href="/" className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`}>{translatedText.home}</Link>
              {countryCode.location?.betting_apps == 'Active' && (
                <Link href="/best-betting-apps" className={`${styles.navItem} ${pathname === '/best-betting-apps' ? styles.active : ''}`}>{translatedText.apps}</Link>
              )}
              <Link href="/match-schedules" className={`${styles.navItem} ${pathname === '/match-schedules' ? styles.active : ''}`}>{translatedText.schedule}</Link>
              <Link href="/news-page" className={`${styles.navItem} ${pathname === '/news-page' ? styles.active : ''}`}>{translatedText.news}</Link>

              {translatedCategories.map((cat) => (
                <div key={cat.id} className={styles.dropdown}>
                  <span className={styles.navItem}>
                    {cat.name} <FaChevronDown />
                  </span>
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

            </nav>
          </div>
        </div>

        <div className={styles.rightSection}>
          {/* <select
            className={styles.languageSelector}
            value={language}
            onChange={handleLanguageChange}
          >
            <>
              {filteredList.map((lang) => (
                <option key={lang.hreflang} value={lang.hreflang}>{lang.language}</option>
              ))}
            </>
          </select> */}
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

          {/* Sports Dropdown with persistence */}
          <select
            className={styles.sportsSelector}
            value={sport}
            onChange={handleSportChange}
          >
            <option value="cricket">{translatedText.cricket}</option>
            <option value="football">{translatedText.football}</option>
          </select>
          {/* <button className={styles.darkModeToggle} onClick={toggleDarkMode}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </button> */}

          <FeaturedButton />
        </div>
      </div>
    </div>
  );
}