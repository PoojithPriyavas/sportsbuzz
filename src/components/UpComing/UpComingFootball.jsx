'use client';

import { useEffect, useState } from 'react';
import styles from './UpComingFootBall.module.css';
import { useGlobalData } from '../Context/ApiContext';

// Utility to format match date
function formatDate(esd) {
    const raw = esd?.toString();
    if (!raw || raw.length !== 14) return '';

    const year = raw.slice(0, 4);
    const month = raw.slice(4, 6);
    const day = raw.slice(6, 8);
    const hour = parseInt(raw.slice(8, 10));
    const minute = raw.slice(10, 12);

    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    const timeString = `${hour12}:${minute.padStart(2, '0')} ${period}`;

    const matchDate = new Date(year, month - 1, day);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    matchDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);

    if (matchDate.getTime() === today.getTime()) {
        return `Today ${timeString}`;
    } else if (matchDate.getTime() === tomorrow.getTime()) {
        return `Tomorrow ${timeString}`;
    } else {
        return `${day}/${month}/${year} ${timeString}`;
    }
}

export default function UpcomingFootballMatches() {
    const { upcoming } = useGlobalData();
    const [selectedLeague, setSelectedLeague] = useState('All');

    // Prepare league names
    const allLeagues = upcoming?.Stages?.map(stage => stage?.Cnm).filter(Boolean) || [];
    const uniqueLeagues = Array.from(new Set(allLeagues));
    const topLeagues = uniqueLeagues.slice(0, 5);
    const otherLeagues = uniqueLeagues.slice(5);

    return (
        <>
            {/* Match Cards */}
            <div className={styles.header}>
                <h4>Football Schedules</h4>
                <a href="#">view all</a>
            </div>
            <div className={styles.cardsContainer}>
                {upcoming?.Stages
                    ?.filter(stage => selectedLeague === 'All' || stage?.Cnm === selectedLeague)
                    ?.flatMap(stage =>
                        stage?.Events?.map((event, eventIdx) => ({
                            event,
                            stage,
                        }))
                    )
                    .slice(0, 4) 
                    .map(({ event, stage }, index) => {
                        const team1 = event.T1?.[0];
                        const team2 = event.T2?.[0];

                        const status = event.Eps;
                        const isFinished = status === 'FT';
                        const isLive = status === 'LIVE';

                        const matchStatusStyle = isFinished
                            ? { background: '#95a5a6' }
                            : isLive
                                ? { background: 'red' }
                                : { background: '#3498db' };

                        return (
                            <div key={index} className={styles.matchCard}>
                                {/* League info */}
                                <div className={styles.leagueHeader}>
                                    <div className={styles.leagueName}>{stage?.Cnm || 'League'}</div>
                                    <div className={styles.subLeague}>Group • {stage?.Snm}</div>
                                </div>

                                {/* Teams and scores */}
                                <div className={styles.matchContent}>
                                    <div className={styles.teamsContainer}>
                                        <div className={styles.team}>
                                            <div className={styles.teamLogo}>
                                                <img
                                                    src={`https://lsm-static-prod.livescore.com/medium/${team1?.Img}`}
                                                    alt={team1?.Nm}
                                                    className={styles.logoImage}
                                                />
                                            </div>
                                            <div className={styles.teamName}>{team1?.Nm}</div>
                                        </div>

                                        <div className={styles.scoreSection}>
                                            <div className={styles.score}>{event.Tr1 ?? '-'}</div>
                                            <div className={styles.vs}>VS</div>
                                            <div className={styles.score}>{event.Tr2 ?? '-'}</div>
                                        </div>

                                        <div className={styles.team}>
                                            <div className={styles.teamLogo}>
                                                <img
                                                    src={`https://lsm-static-prod.livescore.com/medium/${team2?.Img}`}
                                                    alt={team2?.Nm}
                                                    className={styles.logoImage}
                                                />
                                            </div>
                                            <div className={styles.teamName}>{team2?.Nm}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Match time & status */}
                                <div className={styles.matchInfo}>
                                    <div className={styles.matchTime}>{formatDate(event.Esd)}</div>
                                    <div className={styles.matchStatus} style={matchStatusStyle}>
                                        {isLive && <span className={styles.liveIndicator}></span>}
                                        {status}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
            </div>

        </>
    );
}
