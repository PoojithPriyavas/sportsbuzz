'use client';
import { useEffect, useState } from 'react';
// import styles from './LoadingScreen.module.css';

export default function TestHeader() {
    const [phase, setPhase] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timeline = [2000, 1200, 1500, 800];
        let time = 500;

        const startSequence = () => {
            setVisible(true);

            setTimeout(() => setPhase(1), timeline[0]);
            setTimeout(() => setPhase(2), timeline[0] + timeline[1]);
            setTimeout(() => setPhase(3), timeline[0] + timeline[1] + timeline[2]);
            setTimeout(() => setPhase(4), timeline[0] + timeline[1] + timeline[2] + timeline[3]);

            // Enable page scroll after animation
            setTimeout(() => {
                document.body.style.overflow = 'auto';
            }, 5000);
        };

        const delay = setTimeout(startSequence, time);
        return () => clearTimeout(delay);
    }, []);

    return (
        <>
            <div
                className={`
                    ${styles.loadingContainer}
                    ${phase >= 2 ? styles.shrinking : ''}
                    ${phase >= 3 ? styles.header : ''}
                `}
                onClick={() => phase === 0 && setPhase(1)}
            >
                <img
                    className={`${styles.bgVideo} ${phase >= 2 ? styles.fading : ''}`}
                   src='/sportsbuz.gif'
                >
                    
                </img>

                {/* Loader */}
                <div className={`${styles.loader} ${phase >= 1 ? styles.hidden : ''}`}>
                    <div className={styles.logoIcon}></div>
                </div>

                {/* Logo */}
                <div className={`${styles.logoContainer} ${phase >= 1 ? styles.visible : ''}`}>
                    <div className={styles.logoIconSmall}></div>
                    <div className={styles.logoText}>
                        <span className={styles.sports}>Sports</span>
                        <span className={styles.buzz}>buzz</span>
                    </div>
                </div>

                {/* Navigation */}
                <div className={`${styles.navContainer} ${phase >= 4 ? styles.visible : ''}`}>
                    <div className={styles.navSeparator}></div>
                    <nav className={styles.navItems}>
                        <a href="#" className={styles.navItem}>Home</a>
                        <a href="#" className={styles.navItem}>Best Betting Apps</a>
                        <a href="#" className={styles.navItem}>Match Schedules</a>
                        <a href="#" className={styles.navItem}>News</a>
                        <a href="#" className={`${styles.navItem} ${styles.dropdown}`}>FOOTBALL</a>
                        <a href="#" className={`${styles.navItem} ${styles.dropdown}`}>CRICKET</a>
                    </nav>
                </div>

                <div className={`${styles.navControls} ${phase >= 4 ? styles.visible : ''}`}>
                    <select className={styles.languageSelector}>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                    </select>
                    <button className={styles.themeToggle}>🌙</button>
                </div>
            </div>

            {/* Main Content */}
            {/* <div className={`${styles.content} ${phase >= 3 ? styles.visible : ''}`}>
                <h1>Welcome to SportsBuzz</h1>
                <p>
                    Experience the ultimate sports platform with real-time updates, live scores, and comprehensive coverage of your favorite sports.
                </p>
            </div> */}
        </>
    );
}
