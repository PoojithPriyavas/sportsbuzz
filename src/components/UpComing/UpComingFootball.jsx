'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import styles from './UpComingFootBall.module.css';
import { useGlobalData } from '../Context/ApiContext';
import { useRouter } from 'next/router';
import { useDynamicRouter } from '@/hooks/useDynamicRouter';

// Constants for filter keys
const FILTER_ALL = 'ALL';

// Translation keys mapping
const TRANSLATION_KEYS = {
    footballSchedules: 'Football Schedules',
    viewAll: 'view all',
    today: 'Today',
    tomorrow: 'Tomorrow',
    all: 'All',
    live: 'LIVE',
    finished: 'FT'
};

// Utility to format time from ESD
const getTime = (esd) => {
    const raw = esd?.toString();
    if (!raw || raw.length !== 14) return '';

    const hour = parseInt(raw.slice(8, 10), 10);
    const minute = raw.slice(10, 12);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;

    return `${hour12}:${minute} ${period}`;
};

// Utility to format match date
const formatDate = (esd, labels = { today: 'Today', tomorrow: 'Tomorrow' }) => {
    const raw = esd?.toString();
    if (!raw || raw.length !== 14) return '';

    const year = raw.slice(0, 4);
    const month = raw.slice(4, 6);
    const day = raw.slice(6, 8);
    const hour = parseInt(raw.slice(8, 10), 10);
    const minute = raw.slice(10, 12);

    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    const timeString = `${hour12}:${minute.padStart(2, '0')} ${period}`;

    const matchDate = new Date(year, parseInt(month, 10) - 1, day);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Reset times for comparison
    [matchDate, today, tomorrow].forEach(d => d.setHours(0, 0, 0, 0));

    if (matchDate.getTime() === today.getTime()) {
        return `${labels.today} ${timeString}`;
    }
    if (matchDate.getTime() === tomorrow.getTime()) {
        return `${labels.tomorrow} ${timeString}`;
    }
    return `${day}/${month}/${year} ${timeString}`;
};

export default function UpcomingFootballMatches() {
    const { upcoming, fetchFootBallLineUp, fetchFootballDetails, language, translateText } = useGlobalData();
    const [selectedLeague, setSelectedLeague] = useState(FILTER_ALL);
    const { pushDynamic } = useDynamicRouter();
    const [isTranslating, setIsTranslating] = useState(false);
    
    const [translatedText, setTranslatedText] = useState({
        footballSchedules: TRANSLATION_KEYS.footballSchedules,
        viewAll: TRANSLATION_KEYS.viewAll,
        today: TRANSLATION_KEYS.today,
        tomorrow: TRANSLATION_KEYS.tomorrow,
        all: TRANSLATION_KEYS.all,
        live: TRANSLATION_KEYS.live,
        finished: TRANSLATION_KEYS.finished
    });

    // Handle translations
    useEffect(() => {
        const translateLabels = async () => {
            if (!translateText || !language) return;
            
            setIsTranslating(true);
            
            try {
                const textsToTranslate = Object.values(TRANSLATION_KEYS).map(text => ({
                    text,
                    to: language
                }));
                
                const translations = await translateText(textsToTranslate, 'en', language);
                
                setTranslatedText({
                    footballSchedules: translations[0] || TRANSLATION_KEYS.footballSchedules,
                    viewAll: translations[1] || TRANSLATION_KEYS.viewAll,
                    today: translations[2] || TRANSLATION_KEYS.today,
                    tomorrow: translations[3] || TRANSLATION_KEYS.tomorrow,
                    all: translations[4] || TRANSLATION_KEYS.all,
                    live: translations[5] || TRANSLATION_KEYS.live,
                    finished: translations[6] || TRANSLATION_KEYS.finished
                });
            } catch (error) {
                console.error('Translation error:', error);
            } finally {
                setIsTranslating(false);
            }
        };

        translateLabels();
    }, [language, translateText]);

    // Memoize grouped matches to avoid recalculation on every render
    const groupedMatches = useMemo(() => {
        if (!upcoming?.Stages) return {};

        const groups = {};
        
        upcoming.Stages
            .filter(stage => selectedLeague === FILTER_ALL || stage?.Cnm === selectedLeague)
            .forEach(stage => {
                const leagueKey = stage?.Cnm;
                if (!leagueKey) return;

                if (!groups[leagueKey]) {
                    groups[leagueKey] = {
                        stage,
                        matches: []
                    };
                }
                
                if (stage?.Events) {
                    groups[leagueKey].matches.push(...stage.Events);
                }
            });

        return groups;
    }, [upcoming, selectedLeague]);

    // Memoize match click handler
    const handleMatchClick = useCallback(async (eid) => {
        if (!eid) return;
        
        try {
            await Promise.all([
                fetchFootballDetails(eid),
                fetchFootBallLineUp(eid)
            ]);
            pushDynamic(`/football-match-details/${eid}`);
        } catch (error) {
            console.error('Error loading match details:', error);
        }
    }, [fetchFootballDetails, fetchFootBallLineUp, pushDynamic]);

    // Render match item component
    const MatchItem = useCallback(({ event, isFirstInLeague, stage }) => {
        const team1 = event.T1?.[0];
        const team2 = event.T2?.[0];
        const status = event.Eps;
        const isFinished = status === 'FT';
        const isLive = status === 'LIVE';

        return (
            <div 
                className={styles["football-match-item"]} 
                onClick={() => handleMatchClick(event.Eid)}
                style={{ cursor: 'pointer' }}
            >
                {/* League Info - show only for first match */}
                {isFirstInLeague && (
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
                            {isFinished ? translatedText.finished : (isLive ? translatedText.live : '-')}
                        </div>
                    </div>

                    {/* Teams */}
                    <div className={styles["football-teams-section"]}>
                        <div className={styles["football-team-row"]}>
                            <div className={styles["football-team-logo"]}>
                                {team1?.Nm?.slice(0, 2).toUpperCase() || '--'}
                            </div>
                            <div className={styles["football-team-name"]}>{team1?.Nm || 'TBD'}</div>
                        </div>
                        <div className={styles["football-team-row"]}>
                            <div className={styles["football-team-logo"]}>
                                {team2?.Nm?.slice(0, 2).toUpperCase() || '--'}
                            </div>
                            <div className={styles["football-team-name"]}>{team2?.Nm || 'TBD'}</div>
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
    }, [handleMatchClick, translatedText]);

    return (
        <div className={styles["football-matches-container"]} 
        // style={{ opacity: isTranslating ? 0.6 : 1, transition: 'opacity 0.3s' }}
        >
            {/* Header */}
            <div className={styles["football-matches-header"]}>
                <h4 className={styles["football-matches-title"]}>{translatedText.footballSchedules}</h4>
                <a href="#" className={styles["football-matches-view-all"]}>{translatedText.viewAll}</a>
            </div>

            {/* Match List */}
            <div className={styles["football-matches-list"]}>
                {Object.entries(groupedMatches).length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                        No matches available
                    </div>
                ) : (
                    Object.entries(groupedMatches).map(([leagueName, { stage, matches }]) => (
                        <div key={leagueName}>
                            {matches.slice(0, 3).map((event, index) => (
                                <MatchItem
                                    key={event.Eid || index}
                                    event={event}
                                    isFirstInLeague={index === 0}
                                    stage={stage}
                                />
                            ))}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}