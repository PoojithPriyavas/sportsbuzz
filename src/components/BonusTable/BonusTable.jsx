import React from 'react';
import styles from './BonusTable.module.css';

export default function BonusTable() {
    return (
        <div className={styles.table}>
            {[1, 2, 3].map((_, i) => (
                <div className={styles.row} key={i}>
                    <div className={styles.site}>
                        <img src="/parimatch.png" alt="Parimatch" />
                    </div>
                    <div className={styles.features}>
                        <ul>
                            <li>Fast and anonymous crypto payments.</li>
                            <li>100 free spins on signup with no deposit required.</li>
                            <li>Sportsbook covers 40+ sports with competitive odds</li>
                        </ul>
                    </div>
                    <div className={styles.bonus}>
                        <div className={styles.label}>HUGE DEPOSIT BONUS</div>
                        <div className={styles.amount}><strong>700 %</strong> WELCOME BONUS</div>
                        <div className={styles.limit}>UP TO ₹50,000</div>
                        <div className={styles.stars}>⭐⭐⭐⭐⭐</div>
                        <div className={styles.review}>! Review</div>
                    </div>
                    <div className={styles.actions}>
                        <button className={styles.getBtn}>GET BONUS</button>
                        <button className={styles.codeBtn}>Sports Code</button>
                    </div>
                </div>
            ))}
        </div>
    );
}
