'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';
import { FaMoon, FaChevronDown } from 'react-icons/fa';
import { useGlobalData } from '../Context/ApiContext';
import Link from 'next/link';

export default function Header() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const { blogCategories = [], language, setLanguage, translateText } = useGlobalData();

  const [translatedLabels, setTranslatedLabels] = useState({
    home: 'Home',
    bestApps: 'Best Betting Apps',
    news: 'News',
  });

  const showCategories = pathname === '/blogs/pages/all-blogs';

  // 🌐 Translate labels when language changes
  useEffect(() => {
    const translateLabels = async () => {
      try {
        const [home, bestApps, news] = await Promise.all([
          translateText('Home', 'en', language),
          translateText('Best Betting Apps', 'en', language),
          translateText('News', 'en', language),
        ]);

        setTranslatedLabels({
          home,
          bestApps,
          news,
        });
      } catch (error) {
        console.error('Translation failed:', error);
        // fallback
        setTranslatedLabels({
          home: 'Home',
          bestApps: 'Best Betting Apps',
          news: 'News',
        });
      }
    };

    translateLabels();
  }, [language]);

  return (
    <header className={`${styles.header}`}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <img src="/sportsbuz.png" alt="COD HATCH" className={styles.logoImg} />
          <span className={styles.separator}>|</span>
          <nav className={styles.nav}>
            <a href="/" className={`${styles.navItem} ${styles.active}`}>
              {translatedLabels.home}
            </a>
            <a href="/best-betting-apps" className={styles.navItem}>
              {translatedLabels.bestApps}
            </a>
            <a href="#" className={styles.navItem}>
              {translatedLabels.news}
            </a>

            {showCategories &&
              blogCategories.map((cat) => (
                <div key={cat.id} className={styles.dropdown}>
                  <a href="#" className={styles.navItem}>
                    {cat.name} <span><FaChevronDown /></span>
                  </a>
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

        <div className={styles.rightSection}>
          <select
            className={styles.languageSelector}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="ml">Malayalam</option>
          </select>
          <button className={styles.darkModeToggle}><FaMoon /></button>
        </div>
      </div>
    </header>
  );
}
