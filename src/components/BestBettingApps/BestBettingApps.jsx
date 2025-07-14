import React, { useEffect, useState } from 'react';
import styles from './BestBettingApps.module.css';
import Head from 'next/head';
import { useGlobalData } from '../Context/ApiContext';

export default function BettingAppsTable() {
    const [copiedId, setCopiedId] = useState(null);
    const { sections, translateText, language } = useGlobalData();
    const [staticLabels, setStaticLabels] = useState({
        Rank: 'Rank',
        Site: 'Site',
        Features: 'Features',
        'Welcome Bonus': 'Welcome Bonus',
        'Bet Now': 'Bet Now',
        'Read Review': 'Read Review',
        'GET BONUS': 'GET BONUS',
        'Copied!': 'Copied!'
    });

    useEffect(() => {
        const translateStaticLabels = async () => {
            if (language === 'en') {
                setStaticLabels({
                    Rank: 'Rank',
                    Site: 'Site',
                    Features: 'Features',
                    'Welcome Bonus': 'Welcome Bonus',
                    'Bet Now': 'Bet Now',
                    'Read Review': 'Read Review',
                    'GET BONUS': 'GET BONUS',
                    'Copied!': 'Copied!'
                });
                return;
            }

            const keys = [
                'Rank',
                'Site',
                'Features',
                'Welcome Bonus',
                'Bet Now',
                'Read Review',
                'GET BONUS',
                'Copied!'
            ];

            const translations = await Promise.all(
                keys.map(key => translateText(key, 'en', language))
            );

            const updatedLabels = {};
            keys.forEach((key, index) => {
                updatedLabels[key] = translations[index];
            });

            setStaticLabels(updatedLabels);
        };

        translateStaticLabels();
    }, [language, translateText]);

    const handleCopy = (code, id) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    if (sections.length === 0) return null;

    return (
        <>
            <Head>
                <title>{sections[0]?.metatitle}</title>
                <meta name="description" content={stripHtml(sections[0]?.meta_description)} />
            </Head>

            {sections.map(section => (
                <div className={styles.wrapper} key={section.id}>
                    <h1 className={styles.heading}>{section.heading}</h1>

                    {section.best_betting_apps?.length > 0 && (
                        <table className={styles.table}>
                            <thead>
                                <tr className={styles.headerRow}>
                                    <th>{staticLabels['Rank']}</th>
                                    <th>{staticLabels['Site']}</th>
                                    <th>{staticLabels['Features']}</th>
                                    <th>{staticLabels['Welcome Bonus']}</th>
                                    <th>{staticLabels['Bet Now']}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {section.best_betting_apps.map(app => (
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
                                                {staticLabels['Read Review']}
                                            </button>
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
                                                {staticLabels['GET BONUS']}
                                            </a>
                                            <button
                                                className={styles.codeBtn}
                                                onClick={() => handleCopy(app.referall_code, app.id)}
                                            >
                                                {copiedId === app.id ? staticLabels['Copied!'] : app.referall_code}
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

function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}