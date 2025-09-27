

'use client';

import { useEffect, useState } from 'react';
import styles from './UpComingFootBall.module.css';
import { useGlobalData } from '../Context/ApiContext';
import { useRouter } from 'next/router';
import { useDynamicRouter } from '@/hooks/useDynamicRouter';

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

// Get just the time
function getTime(esd) {
    const raw = esd?.toString();
    if (!raw || raw.length !== 14) return '';

    const hour = parseInt(raw.slice(8, 10));
    const minute = raw.slice(10, 12);

    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;

    return `${hour12}:${minute} ${period}`;
}
export default function UpcomingFootballMatches() {
    const { upcoming, fetchFootBallLineUp, fetchFootballDetails } = useGlobalData();

    // console.log(upcoming, "upcoming values")
    const [selectedLeague, setSelectedLeague] = useState('All');
    const { pushDynamic, buildPath, pathPrefix } = useDynamicRouter();
    // console.log(upcoming, "up ckaskjdjsd")
    // Prepare league names
    const allLeagues = upcoming?.Stages?.map(stage => stage?.Cnm).filter(Boolean) || [];
    const uniqueLeagues = Array.from(new Set(allLeagues));
    const router = useRouter();
    // Group matches by league
    const groupedMatches = {};
    upcoming?.Stages
        ?.filter(stage => selectedLeague === 'All' || stage?.Cnm === selectedLeague)
        ?.forEach(stage => {
            const leagueKey = stage?.Cnm;
            if (!groupedMatches[leagueKey]) {
                groupedMatches[leagueKey] = {
                    stage: stage,
                    matches: []
                };
            }
            stage?.Events?.forEach(event => {
                groupedMatches[leagueKey].matches.push(event);
            });
        });

    const handleMatchClick = async (eid) => {
        await Promise.all([
            fetchFootballDetails(eid),
            fetchFootBallLineUp(eid)
        ]);
        pushDynamic(`/football-match-details/${eid}`);
    };

    return (
        <div className={styles["football-matches-container"]}>
            {/* Header */}
            <div className={styles["football-matches-header"]}>
                <h4 className={styles["football-matches-title"]}>Football Schedules</h4>
                <a href="#" className={styles["football-matches-view-all"]}>view all</a>
            </div>

            {/* Match List */}
            <div className={styles["football-matches-list"]}>
                {Object.entries(groupedMatches).map(([leagueName, { stage, matches }]) => (
                    <div key={leagueName}>
                        {matches.slice(0, 3).map((event, index) => {
                            const team1 = event.T1?.[0];
                            const team2 = event.T2?.[0];
                            const status = event.Eps;
                            const isFinished = status === 'FT';
                            const isLive = status === 'LIVE';

                            return (
                                <div key={index} style={{ cursor: 'pointer' }} className={styles["football-match-item"]} onClick={() => handleMatchClick(event.Eid)}>
                                    {/* League Info */}
                                    {index === 0 && (
                                        <div className={styles["football-league-section"]}>
                                            <div className={styles["football-league-info"]}>
                                                <div className={styles["football-league-icon"]}>⚽</div>
                                                <div>
                                                    <div className={styles["football-league-title"]}>{stage?.Snm}</div>
                                                    <div className={styles["football-league-subtitle"]}>{stage?.Cnm}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Match Row */}
                                    <div className={styles["football-match-row"]}>
                                        {/* Time */}
                                        <div className={styles["football-time-section"]}>
                                            <div className={styles["football-time"]}>
                                                {isFinished ? '00:' + getTime(event.Esd).split(':')[1] : getTime(event.Esd)}
                                            </div>
                                            <div className={`${styles["football-status"]} ${isLive ? styles["live"] : ""} ${isFinished ? styles["finished"] : ""}`}>
                                                {isFinished ? 'FT' : (isLive ? 'LIVE' : '-')}
                                            </div>
                                        </div>

                                        {/* Teams */}
                                        <div className={styles["football-teams-section"]}>
                                            <div className={styles["football-team-row"]}>
                                                <div className={styles["football-team-logo"]}>
                                                    {team1?.Nm?.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div className={styles["football-team-name"]}>{team1?.Nm}</div>
                                            </div>
                                            <div className={styles["football-team-row"]}>
                                                <div className={styles["football-team-logo"]}>
                                                    {team2?.Nm?.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div className={styles["football-team-name"]}>{team2?.Nm}</div>
                                            </div>
                                        </div>

                                        {/* Score */}
                                        <div className={styles["football-score-section"]}>
                                            <div className={styles["football-score"]}>
                                                {event.Tr1 ?? '-'}
                                            </div>
                                            <div className={styles["football-score"]}>
                                                {event.Tr2 ?? '-'}
                                            </div>
                                        </div>

                                        {/* Favorite Icon */}
                                        <div className={styles["football-favorite-icon"]}>⭐</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>

    );
}