import React, { useEffect, useState } from 'react';
import styles from './BestBettingApps.module.css';
import Head from 'next/head';
import CustomAxios from '../utilities/CustomAxios';
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
            {/* Use the first section for SEO meta */}
            <Head>
                <title>{bestSections[0]?.metatitle}</title>
                <meta name="description" content={stripHtml(bestSections[0]?.meta_description)} />
            </Head>

            {bestSections.map((section) => (
                <div className={styles.wrapper} key={section.id}>
                    <h2 className={styles.heading}>{section.heading}</h2>

                    {section.best_betting_apps?.length > 0 && (
                        <table className={styles.table}>
                            <thead>
                                <tr className={styles.headerRow}>
                                    <th>Rank</th>
                                    <th>Site</th>
                                    <th>Features</th>
                                    <th>Welcome Bonus</th>
                                    <th>Bet Now</th>
                                </tr>
                            </thead>
                            <tbody>
                                {section.best_betting_apps.map((app) => (
                                    <tr className={styles.bodyRow} key={app.id}>
                                        <td style={{ color: "black", fontSize: "25px" }}><strong>#{app.id}</strong></td>
                                        <td className={styles.site}>
                                            <img src={`https://admin.sportsbuz.com${app.image}`} alt="Betting App" />
                                        </td>
                                        <td
                                            className={styles.features}
                                            dangerouslySetInnerHTML={{ __html: app.features }}
                                        />
                                        <td className={styles.bonus}>
                                            <div
                                                className={styles.amount}
                                                dangerouslySetInnerHTML={{ __html: app.welcome_bonus }}
                                            />
                                            <button
                                                className={styles.codeBtn}
                                                onClick={() => window.open(app.review_link, '_blank', 'noopener,noreferrer')}
                                            >
                                                Read Review
                                            </button>

                                            {/* <div className={styles.stars}>{'⭐'.repeat(app.rating)}</div>
                                             */}
                                            <div className={styles.stars}>
                                                {Array.from({ length: 5 }, (_, index) => {
                                                    const ratingValue = index + 1;
                                                    if (app.rating >= ratingValue) {
                                                        return <span key={index} className={styles.full}>★</span>;
                                                    } else if (app.rating >= ratingValue - 0.5) {
                                                        return <span key={index} className={styles.half}>★</span>;
                                                    } else {
                                                        return <span key={index} className={styles.empty}>★</span>;
                                                    }
                                                })}
                                            </div>

                                        </td>
                                        <td className={styles.actions}>
                                            <a
                                                className={styles.getBtn}
                                                href={app.referal_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                GET BONUS
                                            </a>
                                            <button
                                                className={styles.codeBtn}
                                                onClick={() => handleCopy(app.referall_code, app.id)}
                                            >
                                                {copiedId === app.id ? 'Copied!' : app.referall_code}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    <div
                        className={styles.description}
                        dangerouslySetInnerHTML={{ __html: section.description }}
                    />
                </div>
            ))}
        </>
    );
}

// Helper to clean meta description
function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}
