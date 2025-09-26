import React, { useState, useEffect } from 'react';
import styles from './BestBettingRecentApps.module.css';
import Head from 'next/head';
import { useGlobalData } from '../Context/ApiContext';
import Link from 'next/link';
import DynamicLink from '../Common/DynamicLink';

export default function BestBettingRecentApps({ bestSections = [] }) {
    const [copiedId, setCopiedId] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const { language } = useGlobalData();
    
    // Using bestSections directly without translation
    const displaySections = bestSections;
    
    // Initialize dark mode from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedDarkMode = localStorage.getItem('darkMode') === 'true';
            setDarkMode(savedDarkMode);
        }
    }, []);

    // Listen for dark mode changes
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'darkMode') {
                setDarkMode(e.newValue === 'true');
            }
        };

        const handleClassChange = () => {
            setDarkMode(document.documentElement.classList.contains('dark-theme'));
        };

        // Listen for localStorage changes
        window.addEventListener('storage', handleStorageChange);
        
        // Listen for direct class changes on document
        const observer = new MutationObserver(handleClassChange);
        observer.observe(document.documentElement, { 
            attributes: true, 
            attributeFilter: ['class'] 
        });

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            observer.disconnect();
        };
    }, []);

    const handleCopy = (code, id) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };
    
    if (displaySections.length === 0) return null;

    return (
        <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
            {/* Card Grid Layout */}
            <div className={styles.cardGrid}>
                {displaySections.map((section) => {
                    const imageUrl = `https://admin.sportsbuz.com${section.best_betting_apps?.[0]?.image || ''}`;
                    const linkPath = `/best-betting-apps/recent/${section.slug}/${encodeURIComponent(section.id)}`;

                    return (
                        <DynamicLink href={linkPath} key={section.id} className={styles.card}>
                            <img
                                className={styles.cardImage}
                                src={imageUrl}
                                alt={section.heading}
                                onError={(e) => {
                                    e.target.src = '/path-to-fallback-image.png'; // Add fallback image if needed
                                }}
                            />
                            <h1 className={styles.heading}>{section.heading}</h1>
                        </DynamicLink>
                    );
                })}
            </div>
        </div>
    );
}

// Helper function to strip HTML from meta description
function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}