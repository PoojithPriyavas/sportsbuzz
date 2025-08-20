import React, { useState, useEffect } from 'react';
import styles from './BestBettingRecentApps.module.css';
import Head from 'next/head';
import { useGlobalData } from '../Context/ApiContext';
import Link from 'next/link';
import DynamicLink from '../Common/DynamicLink';

export default function BestBettingRecentApps({ bestSections = [] }) {
    const [copiedId, setCopiedId] = useState(null);
    const { translateText, language } = useGlobalData();
    const [translatedSections, setTranslatedSections] = useState([]);
    
    // Translate sections
    useEffect(() => {
        const translateSections = async () => {
            const translated = await Promise.all(
                bestSections.map(async (section) => {
                    const translatedHeading = await translateText(section.heading || '', 'en', language);
                    
                    // Translate the first app's data if needed (for the card display)
                    let translatedFirstApp = null;
                    if (section.best_betting_apps?.length > 0) {
                        translatedFirstApp = {
                            ...section.best_betting_apps[0],
                            // Add any translated fields if needed
                        };
                    }

                    return {
                        ...section,
                        heading: translatedHeading,
                        best_betting_apps: translatedFirstApp ? 
                            [translatedFirstApp, ...section.best_betting_apps.slice(1)] : 
                            section.best_betting_apps
                    };
                })
            );

            setTranslatedSections(translated);
        };

        if (bestSections.length > 0) {
            translateSections();
        }
    }, [bestSections, language, translateText]);

    const handleCopy = (code, id) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    // Use translated sections if available, otherwise fall back to original
    const displaySections = translatedSections.length > 0 ? translatedSections : bestSections;
console.log(displaySections,"disp section")
    if (displaySections.length === 0) return null;

    return (
        <>
            {/* SEO Meta from the first section */}
            {/* <Head>
                <title>{displaySections[0]?.metatitle}</title>
                <meta name="description" content={stripHtml(displaySections[0]?.meta_description)} />
            </Head> */}

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
        </>
    );
}

// Helper function to strip HTML from meta description
function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}