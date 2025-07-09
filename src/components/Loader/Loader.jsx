'use client';
import { useEffect, useState } from 'react';
import styles from './Loader.module.css';
import { usePathname } from 'next/navigation';
import { useGlobalData } from '../Context/ApiContext';
import { FaMoon, FaSun, FaChevronDown } from 'react-icons/fa';
import Link from 'next/link';

export default function LoadingScreen({ onFinish }) {
  const [phase, setPhase] = useState('loading'); // loading → shrink → complete
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('English');

  const pathname = usePathname();
  const { blogCategories = [] } = useGlobalData();
  const showCategories = pathname === '/blogs/pages/all-blogs';

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setPhase('shrink');
    }, 1000); // GIF stays for 4.5s

    const timer2 = setTimeout(() => {
      setPhase('complete');
      onFinish();
    }, 1400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const handleLanguageChange = (e) => setLanguage(e.target.value);

  return (
    <div className={`${styles.loaderWrapper} ${styles[phase]} ${darkMode ? styles.darkMode : ''}`}>
      {/* Centered GIF */}
      <img src="/sportsbuz.gif" alt="Loading" className={styles.loaderGif} />

      {/* Header */}
      <div className={styles.headerContainer}>
        <div className={styles.leftSection}>
          <img src="/sportsbuz.png" alt="Sportsbuz Logo" className={styles.logo} />

          <div className={styles.navSection}>
            <span className={styles.separator}>|</span>
            <nav className={styles.nav}>
              <Link href="/" className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`}>Home</Link>
              <Link href="/best-betting-apps" className={`${styles.navItem} ${pathname === '/best-betting-apps' ? styles.active : ''}`}>Best Betting Apps</Link>
              <Link href="/news" className={styles.navItem}>News</Link>

              {blogCategories.map((cat) => (
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
            <option value="Hindi">Hindi</option>
          </select>

          <button className={styles.darkModeToggle} onClick={toggleDarkMode}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>
      </div>
    </div>
  );
}
