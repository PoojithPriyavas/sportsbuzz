import React from 'react';
import styles from './BonusTable.module.css';

export default function BonusTable() {
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
                    {[1, 2, 3].map((_, i) => (
                        <tr className={styles.bodyRow} key={i}>
                            <td className={styles.site}>
                                <img src="/parimatch.png" alt="Parimatch" />
                            </td>
                            <td className={styles.features}>
                                <ul>
                                    <li>Fast and anonymous crypto payments.</li>
                                    <li>100 free spins on signup with no deposit required.</li>
                                    <li>Sportsbook covers 40+ sports with competitive odds</li>
                                </ul>
                            </td>
                            <td className={styles.bonus}>
                                <div className={styles.label}>HUGE DEPOSIT BONUS</div>
                                <div className={styles.amount}><strong>700 %</strong> WELCOME BONUS</div>
                                <div className={styles.limit}>UP TO ₹50,000</div>
                                <div className={styles.stars}>⭐⭐⭐⭐⭐</div>
                                <div className={styles.review}>! Review</div>
                            </td>
                            <td className={styles.actions}>
                                <button className={styles.getBtn}>GET BONUS</button>
                                <button className={styles.codeBtn}>Sports Code</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
