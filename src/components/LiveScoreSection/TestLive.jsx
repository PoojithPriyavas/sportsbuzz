'use client';

import styles from './TestLive.module.css';
import { useGlobalData } from '../Context/ApiContext';
import { useEffect, useState } from 'react';

// Utility to format date
function formatDate(esd) {
    const raw = esd?.toString();
    if (!raw || raw.length !== 14) return '';
    const year = raw.slice(0, 4);
    const month = raw.slice(4, 6);
    const day = raw.slice(6, 8);
    const hour = raw.slice(8, 10);
    const minute = raw.slice(10, 12);
    return `${day}/${month}/${year} ${hour}:${minute}`;
}

export default function TestLive() {
    const { stages } = useGlobalData();

    return (
        <div className={styles.cardsContainer}>
            {stages?.Stages?.map((stage, stageIdx) =>
                stage?.Events?.map((event, eventIdx) => {
                    const team1 = event.T1?.[0];
                    const team2 = event.T2?.[0];

                    const status = event.Eps;
                    const isFinished = status === 'FT';
                    const isLive = status === 'LIVE';
                    const isUpcoming = status === 'NS' || status === 'UPCOMING';

                    const matchStatusStyle = isFinished
                        ? { background: '#95a5a6' }
                        : isLive
                            ? { background: 'red' }
                            : { background: '#3498db' };

                    return (
                        <div key={`${stageIdx}-${eventIdx}`} className={styles.matchCard}>
                            {/* League info */}
                            <div className={styles.leagueHeader}>
                                <div className={styles.leagueName}>{stage?.Cnm || 'League'}</div>
                                <div className={styles.subLeague}>Group • {stage?.Snm}</div>
                            </div>

                            {/* Teams and scores */}
                            <div className={styles.matchContent}>
                                <div className={styles.teamsContainer}>
                                    <div className={styles.team}>
                                        <div className={`${styles.teamLogo} ${styles.home}`}>
                                            {team1?.Abr || team1?.Nm?.slice(0, 3)}
                                        </div>
                                        <div className={styles.teamName}>{team1?.Nm}</div>
                                    </div>

                                    <div className={styles.scoreSection}>
                                        <div className={styles.score}>{event.Tr1 ?? '-'}</div>
                                        <div className={styles.vs}>VS</div>
                                        <div className={styles.score}>{event.Tr2 ?? '-'}</div>
                                    </div>

                                    <div className={styles.team}>
                                        <div className={`${styles.teamLogo} ${styles.away}`}>
                                            {team2?.Abr || team2?.Nm?.slice(0, 3)}
                                        </div>
                                        <div className={styles.teamName}>{team2?.Nm}</div>
                                    </div>
                                </div>

                                {/* Upcoming match details */}
                                {isUpcoming && (
                                    <div className={styles.upcomingDetails}>
                                        <div className={styles.kickoffTime}>
                                            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
                                                {formatDate(event.Esd)?.split(' ')[1]}
                                            </span>
                                            <span style={{ fontSize: '12px', color: '#7f8c8d', marginLeft: '5px' }}>GMT</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Match time & status */}
                            <div className={styles.matchInfo}>
                                <div className={styles.matchTime}>{formatDate(event.Esd)}</div>
                                <div className={styles.matchStatus} style={matchStatusStyle}>
                                    {isLive ? <span className={styles.liveIndicator}></span> : null}
                                    {status}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
