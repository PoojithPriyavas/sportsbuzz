'use client';

import { useEffect, useState } from 'react';
import styles from './Loader.module.css';
import { usePathname } from 'next/navigation';
import { useGlobalData } from '../Context/ApiContext';
import { FaMoon, FaChevronDown } from 'react-icons/fa';
import Link from 'next/link';

export default function LoadingScreen({ onFinish }) {
  const [phase, setPhase] = useState('loading');
  const [loadingComplete, setLoadingComplete] = useState(false);
  const pathname = usePathname();
  const { blogCategories = [] } = useGlobalData();
  const showCategories = pathname === '/blogs/pages/all-blogs';

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('logoPhase'), 2000),
      setTimeout(() => setPhase('shrink'), 3000),
      setTimeout(() => {
        onFinish();
        setLoadingComplete(true);
      }, 4000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onFinish]);

  return (
    <div
      className={`${styles.loaderWrapper} ${styles[phase]} ${
        loadingComplete ? styles.loaded : ''
      }`}
    >
      {/* Optional video */}
      <video
        autoPlay
        muted
        loop
        className={styles.videoElement}
        style={{ opacity: phase === 'loading' ? 1 : 0 }}
      >
        <source src="/background-video.mp4" type="video/mp4" />
      </video>

      <img src="/sportsbuz.gif" alt="Loading" className={styles.loaderGif} />

      <img
        src="/sportsbuz.png"
        alt="Logo"
        className={styles.logo}
        style={{ opacity: 1 }}
      />

      {/* Navigation */}
      <div
        className={styles.navSection}
        style={{
          opacity: loadingComplete ? 1 : 0,
          transition: 'opacity 0.6s ease-in-out',
          visibility: loadingComplete ? 'visible' : 'hidden',
        }}
      >
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

      <div
        className={styles.rightSection}
        style={{
          opacity: loadingComplete ? 1 : 0,
          transition: 'opacity 0.6s ease-in-out',
          visibility: loadingComplete ? 'visible' : 'hidden',
        }}
      >
        <select className={styles.languageSelector}>
          <option>English</option>
          <option>Hindi</option>
        </select>
        <button className={styles.darkModeToggle}><FaMoon /></button>
      </div>
    </div>
  );
}
