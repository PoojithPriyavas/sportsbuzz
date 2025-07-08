import React, { useState } from 'react';
import styles from './BestBettingRecentApps.module.css';
import Head from 'next/head';
import { useGlobalData } from '../Context/ApiContext';

export default function BettingAppsTable() {
    const [copiedId, setCopiedId] = useState(null);
    const { bestSections } = useGlobalData();

    const handleCopy = (code, id) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    if (bestSections.length === 0) return null;

    return (
        <>
            {/* SEO Meta from the first section */}
            <Head>
                <title>{bestSections[0]?.metatitle}</title>
                <meta name="description" content={stripHtml(bestSections[0]?.meta_description)} />
            </Head>

            {/* Card Grid Layout */}
            <div className={styles.cardGrid}>
                {bestSections.map((section) => {
                    const imageUrl = `https://admin.sportsbuz.com${section.best_betting_apps[0]?.image}`;
                    console.log("Image URL:", imageUrl); // 👈 This logs the image URL

                    return (
                        <div className={styles.card} key={section.id}>
                            <img
                                className={styles.cardImage}
                                src={imageUrl}
                                alt={section.heading}
                            />

                            <h1 className={styles.heading}>{section.heading}</h1>
                        </div>
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