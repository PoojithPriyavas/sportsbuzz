// MatchScheduler.jsx
'use client';

import { useEffect, useState } from 'react';
import styles from './MatchScheduler.module.css';
import { useGlobalData } from '../Context/ApiContext';

export default function MatchScheduler() {
    const [selectedDate, setSelectedDate] = useState(null);
    const [activeLeague, setActiveLeague] = useState('');
    const [dates, setDates] = useState([]);
    const { matchSchedule } = useGlobalData();

    useEffect(() => {
        const today = new Date();
        const newDates = [];
        for (let i = -1; i < 13; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            newDates.push(date);
        }
        setDates(newDates);
        setSelectedDate(today.toISOString().split('T')[0]);
    }, []);

    // Transform API data into the format we need
    const transformMatchData = () => {
        if (!matchSchedule?.Stages) return {};
        
        const transformedData = {};
        
        matchSchedule.Stages.forEach(stage => {
            stage.Events.forEach(event => {
                // Convert timestamp to YYYY-MM-DD format
                const eventDate = new Date(event.Esd.toString().replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
                const dateStr = eventDate.toISOString().split('T')[0];
                
                if (!transformedData[dateStr]) {
                    transformedData[dateStr] = [];
                }
                
                // Find if competition already exists for this date
                let competition = transformedData[dateStr].find(comp => comp.competition === stage.CompN || comp.competition === stage.Cnm);
                
                if (!competition) {
                    competition = {
                        competition: stage.CompN || stage.Cnm,
                        stage: stage.Snm,
                        matches: []
                    };
                    transformedData[dateStr].push(competition);
                }
                
                // Add match to competition
                competition.matches.push({
                    home: event.T1[0].Abr || event.T1[0].Nm.substring(0, 3).toUpperCase(),
                    away: event.T2[0].Abr || event.T2[0].Nm.substring(0, 3).toUpperCase(),
                    homeScore: null, // API doesn't provide scores in the sample
                    awayScore: null, // API doesn't provide scores in the sample
                    status: event.Eps === 'NS' ? 'upcoming' : 'FT', // Simplified status
                    time: event.Esd.toString().substring(8, 10) + ':' + event.Esd.toString().substring(10, 12) // Extract time from timestamp
                });
            });
        });
        
        return transformedData;
    };

    const matchData = transformMatchData();

    const displayMatches = (date) => {
        let matches = matchData[date] || [];
        if (activeLeague) {
            matches = matches.filter((comp) => comp.competition === activeLeague);
        }
        return matches;
    };

    // Get unique leagues for filter
    const getUniqueLeagues = () => {
        if (!matchSchedule?.Stages) return ['All Leagues'];
        
        const leagues = new Set(['All Leagues']);
        matchSchedule.Stages.forEach(stage => {
            leagues.add(stage.CompN || stage.Cnm);
        });
        return Array.from(leagues);
    };

    return (
        <div>
            <div className={styles.header}>
                <h1>Match Schedule</h1>
                <p>Select a date to view matches</p>
            </div>

            <div className={styles.dateSliderContainer}>
                <div className={styles.dateSlider}>
                    {dates.map((date, idx) => {
                        const dateStr = date.toISOString().split('T')[0];
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                        const dayNum = date.getDate();
                        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                        return (
                            <div
                                key={idx}
                                className={`${styles.dateCard} ${selectedDate === dateStr ? styles.active : ''}`}
                                onClick={() => setSelectedDate(dateStr)}
                            >
                                <div className={styles.day}>{dayName}</div>
                                <div className={styles.date}>{dayNum}</div>
                                <div className={styles.month}>{monthName}</div>
                            </div>
                        );
                    })}
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
                                            {match.status === 'upcoming' ? 'VS' : `${match.homeScore} - ${match.awayScore}`}
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