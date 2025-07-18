// MatchScheduler.jsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import styles from './MatchScheduler.module.css';
import { useGlobalData } from '../Context/ApiContext';

export default function MatchScheduler() {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedDateNumeric, setSelectedDateNumeric] = useState(''); // New state for numeric format
    const [activeLeague, setActiveLeague] = useState('');
    const [dates, setDates] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false); // Add initialization flag
    const { matchSchedule, fetchMatchSchedules, currentTimezone } = useGlobalData();
    console.log(matchSchedule, "match schedule")

    // Initialize dates only once
    useEffect(() => {
        if (isInitialized) return; // Prevent re-initialization
        
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
        setIsInitialized(true);

        // Fetch data for today initially in YYYYMMDD format
        fetchMatchSchedules(todayNumericDate, currentTimezone);
    }, [isInitialized, fetchMatchSchedules, currentTimezone]); // Only depend on isInitialized

    // Handle date selection
    const handleDateSelect = useCallback((isoDate, numericDate) => {
        setSelectedDate(isoDate);
        setSelectedDateNumeric(numericDate);
        fetchMatchSchedules(numericDate, currentTimezone); // Pass numeric format to API
    }, [fetchMatchSchedules, currentTimezone]);

    // Transform API data
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
        if (activeLeague && activeLeague !== 'All Leagues') {
            matches = matches.filter((comp) => comp.competition === activeLeague);
        }
        return matches;
    }, [matchData, activeLeague]);

    console.log(matchSchedule,"matchschedulessssssssss")
    
    // Get unique leagues
    const getUniqueLeagues = useCallback(() => {
        if (!matchSchedule?.Stages) return ['All Leagues'];

        const leagues = new Set(['All Leagues']);
        matchSchedule.Stages.forEach(stage => {
            const leagueName = stage.CompN || stage.Cnm;
            if (leagueName) {
                leagues.add(leagueName);
            }
        });
        return Array.from(leagues);
    }, [matchSchedule]);

    return (
        <div>
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
                                <div className={styles.competitionStage}>{competition.stage}</div>
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