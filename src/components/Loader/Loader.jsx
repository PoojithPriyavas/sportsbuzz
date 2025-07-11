'use client';
import { useEffect, useState } from 'react';
import styles from './Loader.module.css';
import { usePathname } from 'next/navigation';
import { useGlobalData } from '../Context/ApiContext';
import { FaMoon, FaSun, FaChevronDown } from 'react-icons/fa';
import Link from 'next/link';

export default function LoadingScreen({ onFinish }) {
  const [phase, setPhase] = useState('loading');
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('English');
  const pathname = usePathname();
  const { blogCategories = [], translateText, setLanguage: setGlobalLanguage } = useGlobalData();
  const [translatedCategories, setTranslatedCategories] = useState(blogCategories);

  console.log(blogCategories, "blog categories")
  const showCategories = pathname === '/blogs/pages/all-blogs';

  const [translatedText, setTranslatedText] = useState({
    home: 'Home',
    apps: 'Best Betting Apps',
    news: 'News',
  });

  const languageMap = {
    English: 'en',
    Malayalam: 'ml',
  };

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
      if (language === 'Malayalam') {
        const [home, apps, news] = await Promise.all([
          translateText('Home', 'en', 'ml'),
          translateText('Best Betting Apps', 'en', 'ml'),
          translateText('News', 'en', 'ml'),
        ]);
        setTranslatedText({ home, apps, news });

        // Translate blogCategories
        const translatedCategories = await Promise.all(
          blogCategories.map(async (cat) => {
            const translatedCatName = await translateText(cat.name, 'en', 'ml');
            const translatedSubs = await Promise.all(
              (cat.subcategories || []).map(async (sub) => ({
                ...sub,
                name: await translateText(sub.name, 'en', 'ml'),
              }))
            );
            return {
              ...cat,
              name: translatedCatName,
              subcategories: translatedSubs,
            };
          })
        );
        // Update state (optional — if `blogCategories` is state, you can store locally)
        setTranslatedCategories(translatedCategories);
      } else {
        setTranslatedText({
          home: 'Home',
          apps: 'Best Betting Apps',
          news: 'News',
        });
        setTranslatedCategories(blogCategories); // fallback to original
      }
    };

    updateTranslations();
    setGlobalLanguage(language === 'Malayalam' ? 'ml' : 'en');
  }, [language, translateText, blogCategories]);


  const toggleDarkMode = () => setDarkMode(!darkMode);
  const handleLanguageChange = (e) => setLanguage(e.target.value);

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
              <Link href="/news" className={styles.navItem}>{translatedText.news}</Link>

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
          <select className={styles.languageSelector} value={language} onChange={handleLanguageChange}>
            <option value="English">English</option>
            <option value="Malayalam">Malayalam</option>
          </select>

          <button className={styles.darkModeToggle} onClick={toggleDarkMode}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>
      </div>
    </div>
  );
}