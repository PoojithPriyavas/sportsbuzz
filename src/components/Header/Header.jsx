'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';
import { FaMoon } from 'react-icons/fa';
import { FaChevronDown } from 'react-icons/fa';
import { useGlobalData } from '../Context/ApiContext';
import Link from 'next/link';

export default function Header() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const { blogCategories = [] } = useGlobalData();

  useEffect(() => {
    const handleScroll = () => {
      if (!visible && window.scrollY > 20) {
        setVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visible]);

  const showCategories = pathname === '/blogs/pages/all-blogs';

  return (
    <header className={`${styles.header} ${visible ? styles.visible : ''}`}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <img src="/sportsbuz.png" alt="COD HATCH" className={styles.logoImg} />
          <span className={styles.separator}>|</span>
          <nav className={styles.nav}>
            <a href="/" className={`${styles.navItem} ${styles.active}`}>Home</a>
            <a href="/best-betting-apps" className={styles.navItem}>Best Betting Apps</a>
            <a href="#" className={styles.navItem}>News</a>

            {showCategories &&
              blogCategories.map((cat) => (
                <div key={cat.id} className={styles.dropdown}>
                  <a href="#" className={styles.navItem}>
                    {cat.name} <span><FaChevronDown /></span>
                  </a>

                  {cat.subcategories && cat.subcategories.length > 0 && (
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
          <select className={styles.languageSelector}>
            <option>English</option>
            <option>Hindi</option>
          </select>
          <button className={styles.darkModeToggle}><FaMoon /></button>
        </div>
      </div>
    </header>
  );
}
