import React, { useEffect, useState } from 'react';
import styles from './BestBettingApps.module.css';

export default function BettingAppsTable() {
    const [bettingApps, setBettingApps] = useState([]);
    const [copiedId, setCopiedId] = useState(null);
    useEffect(() => {
        const fetchBettingApps = async () => {
            try {
                const res = await fetch(
                    'https://admin.sportsbuz.com/api/best-betting-headings?country_code=in'
                );
                const data = await res.json();
                if (Array.isArray(data) && data[0]?.best_betting_apps) {
                    setBettingApps(data[0].best_betting_apps);
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

    return (
        <div className={styles.wrapper}>
            <table className={styles.table}>
                <thead>
                    <tr className={styles.headerRow}>
                        <th>Site</th>
                        <th>Features</th>
                        <th>Welcome Bonus</th>
                        <th>Bet Now</th>
                    </tr>
                </thead>
                <tbody>
                    {bettingApps.map((app, i) => (
                        <tr className={styles.bodyRow} key={app.id}>
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
                                <div className={styles.stars}>{'⭐'.repeat(app.rating)}</div>
                                <a
                                    className={styles.review}
                                    href={app.review_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    ! Review
                                </a>
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
        </div>
    );
}
