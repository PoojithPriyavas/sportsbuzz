'use client'; // Optional: only if you plan to add client-only behavior

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './UpComingMatches.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faClock } from '@fortawesome/free-solid-svg-icons';

export default function UpcomingMatches({upcomingMatches=[]}) {
    // const [matches, setMatches] = useState([]);

    // useEffect(() => {
    //     async function fetchData() {
    //         try {
    //             const res = await axios.get('https://cricbuzz-cricket.p.rapidapi.com/matches/v1/upcoming', {
    //                 headers: {
    //                     'X-RapidAPI-Key': '017dac301bmshe6ef4a628428634p17177bjsnc738cb420a49',
    //                 },
    //             });

    //             const upcoming = [];

    //             res.data.typeMatches.forEach(typeBlock => {
    //                 const matchType = typeBlock.matchType;

    //                 typeBlock.seriesMatches.forEach(seriesWrapper => {
    //                     const series = seriesWrapper.seriesAdWrapper;
    //                     if (series?.matches && Array.isArray(series.matches)) {
    //                         series.matches.forEach(match => {
    //                             const info = match.matchInfo;

    //                             const date = new Date(Number(info.startDate));
    //                             const dateStr = date.toISOString().split('T')[0];
    //                             const timeStr = date.toISOString().split('T')[1].slice(0, 5);

    //                             upcoming.push({
    //                                 matchId: info.matchId,
    //                                 type: matchType,
    //                                 team1: info.team1.teamName,
    //                                 team2: info.team2.teamName,
    //                                 seriesName: series.seriesName,
    //                                 dateStr,
    //                                 timeStr,
    //                             });
    //                         });
    //                     }
    //                 });

    //             });

    //             setMatches(upcoming);
    //         } catch (error) {
    //             console.error('Failed to fetch upcoming matches:', error);
    //         }
    //     }

    //     fetchData();
    // }, []);

    return (
        <div className={styles.section}>
            <div className={styles.header}>
                <h4 style={{ color: '#000' }}>Cricket Schedules</h4>
                <a href="#" style={{ textDecoration: 'none' }}>view all</a>
            </div>

            {upcomingMatches.map(match => (
                <div key={match.matchId} className={styles.card}>
                    <div className={styles.labels}>
                        <span className={styles.intl}>{match.type}</span>
                        <span className={styles.upcoming}>Upcoming</span>
                    </div>
                    <div className={styles.teams}>
                        {match.team1} <strong>vs</strong> {match.team2}
                    </div>
                    <div className={styles.details}>
                        <span>{match.seriesName}</span><br /><br/>
                        <span><FontAwesomeIcon icon={faCalendar} /> {match.dateStr}</span>&nbsp;&nbsp;
                        <span><FontAwesomeIcon icon={faClock} /> {match.timeStr}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
