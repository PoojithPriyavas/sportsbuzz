'use client';

import { useEffect, useState } from 'react';
import styles from './Loader.module.css';
import { usePathname } from 'next/navigation';
import { useGlobalData } from '../Context/ApiContext';
import { FaMoon, FaSun, FaChevronDown } from 'react-icons/fa';
import Link from 'next/link';
import axios from 'axios';

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
  } = useGlobalData();

  console.log(location, "loc")

  const [translatedCategories, setTranslatedCategories] = useState(blogCategories);
  const [translatedText, setTranslatedText] = useState({
    home: 'Home',
    apps: 'Best Betting Apps',
    news: 'News',
  });

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
      const [home, apps, news] = await Promise.all([
        translateText('Home', 'en', language),
        translateText('Best Betting Apps', 'en', language),
        translateText('News', 'en', language),
      ]);

      setTranslatedText({ home, apps, news });

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
              <Link href="/best-betting-apps" className={`${styles.navItem} ${pathname === '/best-betting-apps' ? styles.active : ''}`}>{translatedText.apps}</Link>
              <Link href="/match-schedules" className={`${styles.navItem} ${pathname === '/match-schedules' ? styles.active : ''}`}>Match Schedules</Link>
              <Link href="/news" className={`${styles.navItem} ${pathname === '/news' ? styles.active : ''}`}>{translatedText.news}</Link>

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

          <select
            className={styles.languageSelector}
            value={language}
            onChange={handleLanguageChange}
          >
            <>
              <option value='en' >English</option>
              {location.map((lang) => (
                <option value={lang.hreflang}>{lang.language}</option>
              ))
              }
            </>

          </select>

          <button className={styles.darkModeToggle} onClick={toggleDarkMode}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>
      </div>
    </div>
  );
}
