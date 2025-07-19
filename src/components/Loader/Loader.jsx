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
  };

  const handleSportChange = (e) => {
    const newSport = e.target.value;
    setSport(newSport);
    localStorage.setItem('selectedSport', newSport);
  };

  const capitalizeFirstLetter = (text) =>
    text?.charAt(0).toUpperCase() + text?.slice(1).toLowerCase();


  return (
    <div className={`${styles.loaderWrapper} ${styles[phase]} ${darkMode ? styles.darkMode : ''}`}>
      <img src="/sportsbuz.gif" alt="Loading" className={styles.loaderGif} />

      <div className={styles.headerContainer}>
        <div className={styles.leftSection}>
          <img src="/sportsbuz.png" alt="Sportsbuz Logo" className={styles.logo} />

          <div className={styles.navSection}>
            <span className={styles.separator}>|</span>
            <nav className={styles.nav}>
              <Link href="/" className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`}>
                {translatedText.home}
              </Link>

              {countryCode?.location?.betting_apps === 'Active' && (
                <Link href="/best-betting-apps" className={`${styles.navItem} ${pathname === '/best-betting-apps' ? styles.active : ''}`}>
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
                  <span className={styles.navItem}>
                    {capitalizeFirstLetter(cat.name)} <FaChevronDown />
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
        </div>
      </div>
    </div>
  );
}