import React from 'react';
import styles from './UpcomingMatches.module.css';

export default function UpcomingMatches() {
    return (
        <div className={styles.section}>
            <div className={styles.header}>
                <h4 style={{ color: '#000' }}>Cricket Schedules</h4>
                <a href="#" style={{ textDecoration: 'none' }}>view all</a>
            </div>

            <div className={styles.card}>
                <div className={styles.labels}>
                    <span className={styles.intl}>International</span>
                    <span className={styles.upcoming}>Up Coming</span>
                </div>
                <div className={styles.teams}>
                    Australia <strong>vs</strong> England
                </div>
                <div className={styles.details}>
                    <span>West Indies tour of Ireland, 2025</span><br />
                    <span>📅 12-08-2025</span> &nbsp;
                    <span>⏰ 06:30 AM</span>
                </div>
            </div>
        </div>
    );
}
