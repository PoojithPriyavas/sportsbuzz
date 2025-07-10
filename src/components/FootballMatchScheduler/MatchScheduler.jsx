// MatchScheduler.jsx
'use client';

import { useEffect, useState } from 'react';
import styles from './MatchScheduler.module.css';

const matchData = {
    '2025-07-08': [
        {
            competition: 'FIFA Club World Cup',
            stage: 'Final Stage',
            matches: [
                { home: 'FLU', away: 'POL', homeScore: 0, awayScore: 0, status: 'FT', time: "90'" },
                { home: 'CHE', away: 'SWE', homeScore: 2, awayScore: 3, status: 'FT', time: "90'" },
            ],
        },
    ],
    '2025-07-09': [
        {
            competition: "Women's EURO",
            stage: 'Group C',
            matches: [
                { home: 'ENG', away: 'NED', homeScore: 4, awayScore: 0, status: 'FT', time: "90'" },
            ],
        },
    ],
    '2025-07-10': [
        {
            competition: 'Champions League',
            stage: 'Semi Final',
            matches: [
                { home: 'BAR', away: 'MAN', homeScore: 2, awayScore: 1, status: 'FT', time: "90'" },
                { home: 'LIV', away: 'PSG', homeScore: 3, awayScore: 2, status: 'FT', time: "90'" },
            ],
        },
        {
            competition: 'Premier League',
            stage: 'Regular Season',
            matches: [
                { home: 'ARS', away: 'CHE', homeScore: 1, awayScore: 0, status: 'FT', time: "90'" },
            ],
        },
    ],
    '2025-07-11': [
        {
            competition: 'La Liga',
            stage: 'Regular Season',
            matches: [
                { home: 'MAD', away: 'BAR', homeScore: 2, awayScore: 3, status: 'FT', time: "90'" },
                { home: 'ATM', away: 'SEV', homeScore: 1, awayScore: 1, status: 'FT', time: "90'" },
            ],
        },
    ],
    '2025-07-12': [
        {
            competition: 'Champions League',
            stage: 'Final',
            matches: [
                { home: 'BAR', away: 'LIV', homeScore: null, awayScore: null, status: 'upcoming', time: '20:00' },
                { home: 'MAN', away: 'PSG', homeScore: null, awayScore: null, status: 'upcoming', time: '22:30' },
            ],
        },
    ],
    '2025-07-13': [
        {
            competition: 'Premier League',
            stage: 'Regular Season',
            matches: [
                { home: 'ARS', away: 'MAN', homeScore: null, awayScore: null, status: 'upcoming', time: '15:00' },
                { home: 'CHE', away: 'LIV', homeScore: null, awayScore: null, status: 'upcoming', time: '17:30' },
            ],
        },
    ],
};

export default function MatchScheduler() {
    const [selectedDate, setSelectedDate] = useState(null);
    const [activeLeague, setActiveLeague] = useState('');
    const [dates, setDates] = useState([]);

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

    const displayMatches = (date) => {
        let matches = matchData[date] || [];
        if (activeLeague) {
            matches = matches.filter((comp) => comp.competition === activeLeague);
        }
        return matches;
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
                {['All Leagues', 'FIFA Club World Cup', "Women's EURO", 'Champions League', 'Premier League', 'La Liga'].map((league) => (
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
                                        {/* <div className={styles.matchTime}>{match.time}</div> */}
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
