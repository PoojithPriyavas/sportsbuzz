'use client';

import { useEffect, useState, useCallback } from 'react';
import styles from './MatchScheduler.module.css';
import { useGlobalData } from '../Context/ApiContext';
import { useRouter } from 'next/navigation';

// Spinner Loader Component
const Spinner = ({ size = 'medium', text = 'Loading...' }) => {
    const sizeClasses = {
        small: styles.spinnerSmall,
        medium: styles.spinnerMedium,
        large: styles.spinnerLarge
    };

    return (
        <div className={styles.spinnerContainer}>
            <div className={`${styles.spinner} ${sizeClasses[size]}`}>
                <div className={styles.spinnerCircle}></div>
            </div>
            {text && <p className={styles.spinnerText}>{text}</p>}
        </div>
    );
};

export default function MatchScheduler() {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedDateNumeric, setSelectedDateNumeric] = useState('');
    const [activeLeague, setActiveLeague] = useState('');
    const [dates, setDates] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoadingMatches, setIsLoadingMatches] = useState(false);

    const {
        matchSchedule,
        fetchMatchSchedules,
        currentTimezone,
        countryCode,
        translateText,
        language,
        fetchFootballDetails,
        fetchFootBallLineUp
    } = useGlobalData();

    const router = useRouter();

    const [translatedText, setTranslatedText] = useState({
        matchSchedule: 'Match Schedule',
        selectDate: 'Select a date to view matches',
        loadingTimezone: 'Loading timezone...',
        loadingMatches: 'Loading matches...',
        noMatches: 'No matches found for the selected date and league',
        allLeagues: 'All Leagues'
    });

    useEffect(() => {
        const translateLabels = async () => {
            const [
                matchSchedule,
                selectDate,
                loadingTimezone,
                loadingMatches,
                noMatches,
                allLeagues
            ] = await Promise.all([
                translateText('Match Schedule', 'en', language),
                translateText('Select a date to view matches', 'en', language),
                translateText('Loading timezone...', 'en', language),
                translateText('Loading matches...', 'en', language),
                translateText('No matches found for the selected date and league', 'en', language),
                translateText('All Leagues', 'en', language)
            ]);

            setTranslatedText({
                matchSchedule,
                selectDate,
                loadingTimezone,
                loadingMatches,
                noMatches,
                allLeagues
            });
        };

        translateLabels();
    }, [language, translateText]);

    const getInitialDate = useCallback(() => {
        if (typeof window !== 'undefined') {
            const savedDate = localStorage.getItem('matchScheduler_selectedDate');
            if (savedDate) {
                const parsedDate = new Date(savedDate);
                if (!isNaN(parsedDate.getTime())) {
                    return parsedDate;
                }
            }
        }
        return new Date();
    }, []);

    useEffect(() => {
        if (isInitialized || currentTimezone === '+0.00' || !countryCode.country_code) {
            return;
        }

        const today = new Date();
        const initialSelectedDate = getInitialDate();
        const newDates = [];

        for (let i = -1; i < 13; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            const isoDate = date.toISOString().split('T')[0];
            const numericDate = [
                date.getFullYear(),
                String(date.getMonth() + 1).padStart(2, '0'),
                String(date.getDate()).padStart(2, '0')
            ].join('');

            newDates.push({ dateObj: date, isoDate, numericDate });
        }

        setDates(newDates);

        const initialIsoDate = initialSelectedDate.toISOString().split('T')[0];
        const initialNumericDate = [
            initialSelectedDate.getFullYear(),
            String(initialSelectedDate.getMonth() + 1).padStart(2, '0'),
            String(initialSelectedDate.getDate()).padStart(2, '0')
        ].join('');

        setSelectedDate(initialIsoDate);
        setSelectedDateNumeric(initialNumericDate);
        setIsInitialized(true);

        setIsLoadingMatches(true);
        fetchMatchSchedules(initialNumericDate, currentTimezone).finally(() => {
            setIsLoadingMatches(false);
        });
    }, [currentTimezone, countryCode.country_code, isInitialized, fetchMatchSchedules, getInitialDate]);

    const handleDateSelect = useCallback((isoDate, numericDate) => {
        setSelectedDate(isoDate);
        setSelectedDateNumeric(numericDate);
        if (typeof window !== 'undefined') {
            localStorage.setItem('matchScheduler_selectedDate', isoDate);
        }

        setIsLoadingMatches(true);
        fetchMatchSchedules(numericDate, currentTimezone).finally(() => {
            setIsLoadingMatches(false);
        });
    }, [fetchMatchSchedules, currentTimezone]);

    const transformMatchData = useCallback(() => {
        if (!matchSchedule?.Stages || !dates.length) return {};

        const transformedData = {};

        matchSchedule.Stages.forEach(stage => {
            if (!stage.Events) return;

            stage.Events.forEach(event => {
                if (!event.Esd) return;

                const eventDateStr = event.Esd.toString().substring(0, 8);
                const dateInfo = dates.find(d => d.numericDate === eventDateStr);
                if (!dateInfo) return;

                const dateStr = dateInfo.isoDate;

                if (!transformedData[dateStr]) {
                    transformedData[dateStr] = [];
                }

                const competitionName = stage.CompN || stage.Cnm;
                if (!competitionName) return;

                let competition = transformedData[dateStr].find(comp => comp.competition === competitionName);

                if (!competition) {
                    competition = {
                        competition: competitionName,
                        stage: stage.Snm || '',
                        matches: []
                    };
                    transformedData[dateStr].push(competition);
                }

                if (!event.T1?.[0] || !event.T2?.[0]) return;

                competition.matches.push({
                    eid: event.Eid,
                    home: event.T1[0].Abr || event.T1[0].Nm.substring(0, 3).toUpperCase(),
                    away: event.T2[0].Abr || event.T2[0].Nm.substring(0, 3).toUpperCase(),
                    homeScore: event.Tr1 ?? null,
                    awayScore: event.Tr2 ?? null,
                    status: event.Eps === 'NS' ? 'upcoming' : 'FT',
                    time: event.Esd.toString().substring(8, 10) + ':' + event.Esd.toString().substring(10, 12)
                });
            });
        });

        return transformedData;
    }, [matchSchedule, dates]);

    const matchData = transformMatchData();

    const displayMatches = useCallback((date) => {
        if (!date) return [];
        let matches = matchData[date] || [];
        if (activeLeague && activeLeague !== translatedText.allLeagues) {
            matches = matches.filter((comp) => comp.competition === activeLeague);
        }
        return matches;
    }, [matchData, activeLeague, translatedText.allLeagues]);

    const getUniqueLeagues = useCallback(() => {
        if (!matchSchedule?.Stages) return [translatedText.allLeagues];
        const leagues = new Set([translatedText.allLeagues]);
        matchSchedule.Stages.forEach(stage => {
            const leagueName = stage.CompN || stage.Cnm;
            if (leagueName) leagues.add(leagueName);
        });
        return Array.from(leagues);
    }, [matchSchedule, translatedText.allLeagues]);

    const handleMatchClick = async (eid) => {
        await Promise.all([
            fetchFootballDetails(eid),
            fetchFootBallLineUp(eid)
        ]);
        router.push(`/football-match-details/${eid}`);
    };

    if (currentTimezone === '+0.00' || !countryCode.country_code) {
        return (
            <div className={styles.header}>
                <h1>{translatedText.matchSchedule}</h1>
                <Spinner size="large" text={translatedText.loadingTimezone} />
            </div>
        );
    }

    return (
        <div>
            <div className={styles.header}>
                <h1>{translatedText.matchSchedule}</h1>
                <p>{translatedText.selectDate}</p>
            </div>

            <div className={styles.dateSliderContainer}>
                <div className={styles.dateSlider}>
                    {dates.length > 0 ? (
                        dates.map((date, idx) => {
                            const dayName = date.dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                            const dayNum = date.dateObj.getDate();
                            const monthName = date.dateObj.toLocaleDateString('en-US', { month: 'short' });
                            return (
                                <div
                                    key={idx}
                                    className={`${styles.dateCard} ${selectedDate === date.isoDate ? styles.active : ''}`}
                                    onClick={() => handleDateSelect(date.isoDate, date.numericDate)}
                                >
                                    <div className={styles.day}>{dayName}</div>
                                    <div className={styles.date}>{dayNum}</div>
                                    <div className={styles.month}>{monthName}</div>
                                </div>
                            );
                        })
                    ) : (
                        <div>Loading dates...</div>
                    )}
                </div>
            </div>

            <div className={styles.leagueFilter}>
                {getUniqueLeagues().map((league) => (
                    <div
                        key={league}
                        className={`${styles.leagueChip} ${activeLeague === league || (league === translatedText.allLeagues && activeLeague === '') ? styles.active : ''}`}
                        onClick={() => setActiveLeague(league === translatedText.allLeagues ? '' : league)}
                    >
                        {league}
                    </div>
                ))}
            </div>

            <div className={`${styles.matchesContainer} ${selectedDate ? styles.visible : ''}`}>
                {isLoadingMatches ? (
                    <Spinner size="large" text={translatedText.loadingMatches} />
                ) : displayMatches(selectedDate).length === 0 ? (
                    <div className={styles.noMatches}>
                        <div className={styles.noMatchesIcon}>⚽</div>
                        <p>{translatedText.noMatches}</p>
                    </div>
                ) : (
                    displayMatches(selectedDate).map((competition, i) => (
                        <div key={i} className={styles.competitionSection}>
                            <div className={styles.competitionHeader}>
                                <div className={styles.competitionTitle}>{competition.competition}</div>
                                <div className={styles.competitionStage}>{competition.stage}</div>
                            </div>
                            <div className={styles.matchesGrid}>
                                {competition.matches.map((match, j) => (
                                    <div
                                        key={j}
                                        className={styles.matchRow}
                                        onClick={() => handleMatchClick(match.eid)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyPress={(e) => e.key === 'Enter' && handleMatchClick(match.eid)}
                                    >
                                        <div className={`${styles.team} ${styles.home}`}>
                                            <div className={styles.teamFlag}>{match.home}</div>
                                            <div className={styles.teamName}>{match.home}</div>
                                        </div>
                                        <div className={styles.matchScore}>
                                            {match.status === 'upcoming' ? (
                                                <span className={styles.upcomingTime}>{match.time}</span>
                                            ) : (
                                                `${match.homeScore ?? '-'} - ${match.awayScore ?? '-'}`
                                            )}
                                        </div>
                                        <div className={`${styles.team} ${styles.away}`}>
                                            <div className={styles.teamFlag}>{match.away}</div>
                                            <div className={styles.teamName}>{match.away}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
