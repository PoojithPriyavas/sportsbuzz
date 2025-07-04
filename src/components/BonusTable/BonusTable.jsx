import React, { useEffect, useState } from 'react';
import styles from './BonusTable.module.css';
import Head from 'next/head';

export default function BonusTable() {
    const [sections, setSections] = useState([]);
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        const fetchBettingApps = async () => {
            try {
                const res = await fetch(
                    'https://admin.sportsbuz.com/api/best-betting-headings?country_code=in&filter_by=current_month'
                );

                const data = await res.json();
                if (Array.isArray(data)) {
                    setSections(data);
                }
            } catch (error) {
                console.error('Error fetching betting apps:', error);
            }
        };

        fetchBettingApps();
    }, []);

    const handleCopy = (code, id) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    if (sections.length === 0) return null;

    return (
        <>
            {/* Use the first section for SEO meta */}
            <Head>
                <title>{sections[0]?.metatitle}</title>
                <meta name="description" content={stripHtml(sections[0]?.meta_description)} />
            </Head>

            {sections.map((section) => (
                <div className={styles.wrapper} key={section.id}>
                    {/* <h2 className={styles.heading}>{section.heading}</h2> */}

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
                                        <td style={{ color: "black" }}><strong>#{app.id}</strong></td>
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

                                            <div className={styles.stars}>{'⭐'.repeat(app.rating)}</div>
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
                                                {copiedId === app.id ? 'Copied!' : 'Copy Code'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
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
