'use client';

import React from 'react';
import styles from './Header.module.css';
import { FaMoon } from 'react-icons/fa';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <img src="/logo.png" alt="COD HATCH" className={styles.logoImg} />
          <span className={styles.logoText}>Logo</span>
          <span className={styles.separator}>|</span>
          <nav className={styles.nav}>
            <a href="#" className={`${styles.navItem} ${styles.active}`}>Home</a>
            <a href="#" className={styles.navItem}>Best Betting Apps</a>
            <a href="#" className={styles.navItem}>News</a>
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
