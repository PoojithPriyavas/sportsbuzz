import React, { useState } from 'react';
import styles from './BestBettingRecentApps.module.css';
import Head from 'next/head';
import { useGlobalData } from '../Context/ApiContext';
import Link from 'next/link';

export default function BestBettingRecentApps() {
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
                    const linkPath = `/best-betting-apps/recent/${encodeURIComponent(section.id)}`;

                    return (
                        <Link href={linkPath} key={section.id} className={styles.card}>
                            <img
                                className={styles.cardImage}
                                src={imageUrl}
                                alt={section.heading}
                            />
                            <h1 className={styles.heading}>{section.heading}</h1>
                        </Link>
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
