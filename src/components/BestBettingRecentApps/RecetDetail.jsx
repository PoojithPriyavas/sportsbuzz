'use client';

import React, { useEffect, useState } from 'react';
import styles from './RecentDetail.module.css';
import Head from 'next/head';
import { useGlobalData } from '../Context/ApiContext';
import { useRouter } from 'next/router';

export default function RecentAppsDetails({ bestSections = [], sectionId }) {
    console.log(sectionId, "best sections id")
    // const router = useRouter();
    // const sectionId = router.query.id;
    const [isMobile, setIsMobile] = useState(false);

    const [copiedId, setCopiedId] = useState(null);
    const { translateText, language } = useGlobalData();

    const [translatedSections, setTranslatedSections] = useState([]);
    const [staticLabels, setStaticLabels] = useState({
        Rank: 'Rank',
        Site: 'Site',
        Features: 'Features',
        'Welcome Bonus': 'Welcome Bonus',
        'Bet Now': 'Bet Now',
        'Read Review': 'Read Review',
        'GET BONUS': 'GET BONUS',
        'Copied!': 'Copied!',
    });
    // Check if mobile view
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Translate static UI labels
    useEffect(() => {
        const translateStaticLabels = async () => {
            if (language === 'en') return;

            const keys = Object.keys(staticLabels);
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

    // Translate dynamic sections
    useEffect(() => {
        const translateSections = async () => {
            const translated = await Promise.all(
                bestSections.map(async (section) => {
                    const translatedHeading = await translateText(section.heading || '', 'en', language);
                    const translatedDescription = await translateText(section.description || '', 'en', language, true);

                    const translatedApps = await Promise.all(
                        (section.best_betting_apps || [])
                            .sort((a, b) => a.order_by - b.order_by)
                            .map(async (app) => {
                                const translatedFeatures = await translateText(app.features || '', 'en', language, true);
                                const translatedBonus = await translateText(app.welcome_bonus || '', 'en', language, true);

                                return {
                                    ...app,
                                    features: translatedFeatures,
                                    welcome_bonus: translatedBonus,
                                };
                            })
                    );
                    console.log(translatedApps, "hsgdhgsd")
                    return {
                        ...section,
                        heading: translatedHeading,
                        description: translatedDescription,
                        best_betting_apps: translatedApps,
                    };
                })
            );

            setTranslatedSections(translated);
        };

        if (bestSections.length > 0 && sectionId) {
            translateSections();
        }
    }, [bestSections, language, translateText, sectionId]);

    const handleCopy = (code, id) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    // Match only the section with the same ID from URL
    const matchedSection = translatedSections.find(
        (section) => String(section.id) === String(sectionId)
    );

    console.log(matchedSection, "trabdkdkd")

    if (!matchedSection) {
        return <div className={styles.wrapper}>No section found for ID: {sectionId}</div>;
    }

    const renderMobileCards = (apps) => (
        <>
            <div className={styles.mobileContainer}>
                {[...apps].map((app) => (
                    <div className={styles.mobileCard} key={app.id}>
                        <div className={styles.mobileHeader}>
                            <div className={styles.mobileRank}>#{app.order_by}</div>
                            <img
                                src={`https://admin.sportsbuz.com${app.image}`}
                                alt="Betting App"
                                className={styles.mobileLogo}
                            />
                            <div className={styles.mobileStars}>
                                {'⭐'.repeat(app.rating)}
                            </div>
                        </div>

                        <div className={styles.mobileContent}>
                            <div className={styles.mobileSection}>
                                <h4>{staticLabels.Features}:</h4>
                                <div dangerouslySetInnerHTML={{ __html: app.features }} />
                            </div>

                            <div className={styles.mobileSection}>
                                <h4>{staticLabels['Welcome Bonus']}:</h4>
                                <div
                                    className={styles.mobileBonusAmount}
                                    dangerouslySetInnerHTML={{ __html: app.welcome_bonus }}
                                />
                            </div>
                        </div>

                        <div className={styles.mobileActions}>
                            <a
                                className={styles.mobileGetBtn}
                                href={app.referal_link}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {staticLabels['GET BONUS']}
                            </a>
                            <button
                                className={styles.mobileCodeBtn}
                                onClick={() => handleCopy(app.referall_code, app.id)}
                            >
                                {copiedId === app.id ? staticLabels['Copied!'] : app.referall_code}
                            </button>
                            <button
                                className={styles.mobileReviewBtn}
                                onClick={() =>
                                    window.open(app.review_link, '_blank', 'noopener,noreferrer')
                                }
                            >
                                {staticLabels['Read Review']}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div
                className={styles.description}
                dangerouslySetInnerHTML={{ __html: matchedSection.description }}
            />
        </>
    );

    // Desktop Table View
    const renderDesktopTable = (apps) => (
        <>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr className={styles.headerRow}>
                            <th>{staticLabels.Rank}</th>
                            <th>{staticLabels.Site}</th>
                            <th>{staticLabels.Features}</th>
                            <th>{staticLabels['Welcome Bonus']}</th>
                            <th>{staticLabels['Bet Now']}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...apps]
                            .sort((a, b) => a.order_by - b.order_by)
                            .map((app) => (
                                <tr className={styles.bodyRow} key={app.id}>
                                    <td className={styles.rankCell}>
                                        <div className={styles.rankBadge}>#{app.order_by}</div>
                                    </td>
                                    <td className={styles.site}>
                                        <img
                                            src={`https://admin.sportsbuz.com${app.image}`}
                                            alt="Betting App"
                                        />
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
                                            onClick={() =>
                                                window.open(app.review_link, '_blank', 'noopener,noreferrer')
                                            }
                                        >
                                            {staticLabels['Read Review']}
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
            </div>
            <div
                className={styles.description}
                dangerouslySetInnerHTML={{ __html: matchedSection.description }}
            />
        </>
    );

    return (
        <>
            <div className={styles.wrapper}>
                {matchedSection.best_betting_apps?.length > 0 && (
                    <>
                        {isMobile
                            ? renderMobileCards(matchedSection.best_betting_apps)
                            : renderDesktopTable(matchedSection.best_betting_apps)
                        }
                    </>
                )}
            </div>
        </>
    );
}

function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}