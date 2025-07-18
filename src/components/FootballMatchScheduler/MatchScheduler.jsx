// MatchScheduler.jsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import styles from './MatchScheduler.module.css';
import { useGlobalData } from '../Context/ApiContext';

export default function MatchScheduler() {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedDateNumeric, setSelectedDateNumeric] = useState('');
    const [activeLeague, setActiveLeague] = useState('');
    const [dates, setDates] = useState([]);
    const { matchSchedule, fetchMatchSchedules, currentTimezone } = useGlobalData();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initialize dates and fetch initial data
    useEffect(() => {
        const initializeDates = () => {
            try {
                const today = new Date();
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

                    newDates.push({
                        dateObj: date,
                        isoDate: isoDate,
                        numericDate: numericDate
                    });
                }

                setDates(newDates);
                
                const todayIsoDate = today.toISOString().split('T')[0];
                const todayNumericDate = [
                    today.getFullYear(),
                    String(today.getMonth() + 1).padStart(2, '0'),
                    String(today.getDate()).padStart(2, '0')
                ].join('');

                setSelectedDate(todayIsoDate);
                setSelectedDateNumeric(todayNumericDate);
                return todayNumericDate;
            } catch (err) {
                setError('Failed to initialize dates');
                console.error('Date initialization error:', err);
                return null;
            }
        };

        const fetchInitialData = async (date) => {
            if (!date) return;
            setIsLoading(true);
            try {
                await fetchMatchSchedules(date, currentTimezone);
            } catch (err) {
                setError('Failed to fetch initial match data');
                console.error('Initial fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        const numericDate = initializeDates();
        if (numericDate) {
            fetchInitialData(numericDate);
        }
    }, [fetchMatchSchedules, currentTimezone]);

    // Handle date selection
    const handleDateSelect = useCallback(async (isoDate, numericDate) => {
        setIsLoading(true);
        setSelectedDate(isoDate);
        setSelectedDateNumeric(numericDate);
        try {
            await fetchMatchSchedules(numericDate, currentTimezone);
        } catch (err) {
            setError(`Failed to fetch matches for ${isoDate}`);
            console.error('Date selection fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [fetchMatchSchedules, currentTimezone]);

    // Transform API data with better error handling
    const transformMatchData = useCallback(() => {
        if (!matchSchedule?.Stages || !dates.length) return {};

        const transformedData = {};

        try {
            matchSchedule.Stages.forEach(stage => {
                if (!stage?.Events) return;

                stage.Events.forEach(event => {
                    if (!event?.Esd) return;

                    // Get date string in YYYYMMDD format
                    const eventDateStr = event.Esd.toString().substring(0, 8);
                    
                    // Find matching date
                    const dateInfo = dates.find(d => d.numericDate === eventDateStr);
                    if (!dateInfo) {
                        console.warn('No date found for event:', eventDateStr, event);
                        return;
                    }

                    const dateStr = dateInfo.isoDate;

                    if (!transformedData[dateStr]) {
                        transformedData[dateStr] = [];
                    }

                    // Get competition name with fallbacks
                    const competitionName = stage.CompN || stage.Cnm || stage.Snm || 'Unknown Competition';
                    
                    let competition = transformedData[dateStr].find(comp => comp.competition === competitionName);

                    if (!competition) {
                        competition = {
                            competition: competitionName,
                            stage: stage.Snm || '',
                            matches: []
                        };
                        transformedData[dateStr].push(competition);
                    }

                    // Handle team data safely
                    const homeTeam = event.T1?.[0] || { Nm: 'Home Team', Abr: 'HOM' };
                    const awayTeam = event.T2?.[0] || { Nm: 'Away Team', Abr: 'AWY' };

                    competition.matches.push({
                        home: homeTeam.Abr || homeTeam.Nm.substring(0, 3).toUpperCase(),
                        away: awayTeam.Abr || awayTeam.Nm.substring(0, 3).toUpperCase(),
                        homeScore: event.Tr1 ?? '-',
                        awayScore: event.Tr2 ?? '-',
                        status: event.Eps === 'NS' ? 'upcoming' : 'FT',
                        time: event.Esd.toString().substring(8, 10) + ':' + 
                              event.Esd.toString().substring(10, 12)
                    });
                });
            });
        } catch (err) {
            setError('Failed to transform match data');
            console.error('Data transformation error:', err);
        }

        return transformedData;
    }, [matchSchedule, dates]);

    const matchData = transformMatchData();

    const displayMatches = useCallback((date) => {
        if (!date) return [];
        try {
            let matches = matchData[date] || [];
            if (activeLeague && activeLeague !== 'All Leagues') {
                matches = matches.filter((comp) => comp.competition === activeLeague);
            }
            return matches;
        } catch (err) {
            console.error('Display matches error:', err);
            return [];
        }
    }, [matchData, activeLeague]);

    // Get unique leagues with fallback
    const getUniqueLeagues = useCallback(() => {
        try {
            if (!matchSchedule?.Stages) return ['All Leagues'];

            const leagues = new Set(['All Leagues']);
            matchSchedule.Stages.forEach(stage => {
                const leagueName = stage.CompN || stage.Cnm || stage.Snm;
                if (leagueName) {
                    leagues.add(leagueName);
                }
            });
            return Array.from(leagues);
        } catch (err) {
            console.error('League extraction error:', err);
            return ['All Leagues'];
        }
    }, [matchSchedule]);

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <h2>Error Loading Matches</h2>
                <p>{error}</p>
                <button onClick={() => setError(null)}>Try Again</button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Match Schedule</h1>
                <p>Select a date to view matches</p>
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
                        className={`${styles.leagueChip} ${activeLeague === league || (league === 'All Leagues' && activeLeague === '') ? styles.active : ''}`}
                        onClick={() => setActiveLeague(league === 'All Leagues' ? '' : league)}
                    >
                        {league}
                    </div>
                ))}
            </div>

            {isLoading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading matches...</p>
                </div>
            ) : (
                <div className={`${styles.matchesContainer} ${selectedDate ? styles.visible : ''}`}>
                    {displayMatches(selectedDate).length === 0 ? (
                        <div className={styles.noMatches}>
                            <div className={styles.noMatchesIcon}>⚽</div>
                            <p>No matches found for the selected date and league</p>
                        </div>
                    ) : (
                        displayMatches(selectedDate).map((competition, i) => (
                            <div key={i} className={styles.competitionSection}>
                                <div className={styles.competitionHeader}>
                                    <div className={styles.competitionTitle}>{competition.competition}</div>
                                    {competition.stage && (
                                        <div className={styles.competitionStage}>{competition.stage}</div>
                                    )}
                                </div>
                                <div className={styles.matchesGrid}>
                                    {competition.matches.map((match, j) => (
                                        <div key={j} className={styles.matchRow}>
                                            <div className={`${styles.team} ${styles.home}`}>
                                                <div className={styles.teamFlag}>{match.home}</div>
                                                <div className={styles.teamName}>{match.home}</div>
                                            </div>
                                            <div className={styles.matchScore}>
                                                {match.status === 'upcoming' ? (
                                                    <span className={styles.upcomingTime}>{match.time}</span>
                                                ) : (
                                                    `${match.homeScore} - ${match.awayScore}`
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
            )}
        </div>
    );
}