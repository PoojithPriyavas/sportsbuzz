'use client';

import React, { useState } from 'react';
import axios from 'axios';
import styles from './UpComingMatches.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faClock, faFilter } from '@fortawesome/free-solid-svg-icons';

export default function UpcomingMatches({ upcomingMatches = [] }) {
    const [filter, setFilter] = useState('all');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Get unique match types for filter options
    const matchTypes = ['all', ...new Set(upcomingMatches.map(match => match.type))];

    // Filter matches based on selected filter
    const filteredMatches = filter === 'all'
        ? upcomingMatches
        : upcomingMatches.filter(match => match.type === filter);

    return (
        <div className={styles.section}>
            <div className={styles.header}>
                <h4 style={{ color: '#000' }}>Cricket Schedules</h4>
                <div className={styles.filterContainer}>
                    <button
                        className={styles.filterButton}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <FontAwesomeIcon icon={faFilter} /> Filter
                    </button>
                    {isDropdownOpen && (
                        <div className={styles.dropdown}>
                            {matchTypes.map(type => (
                                <div
                                    key={type}
                                    className={`${styles.dropdownItem} ${filter === type ? styles.active : ''}`}
                                    onClick={() => {
                                        setFilter(type);
                                        setIsDropdownOpen(false);
                                    }}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.matchesContainer}>
                {filteredMatches.length > 0 ? (
                    filteredMatches.map(match => (
                        <div key={match.matchId} className={styles.card}>
                            <div className={styles.labels}>
                                <span className={styles.intl}>{match.type}</span>
                                <span className={styles.upcoming}>Upcoming</span>
                            </div>
                            <div className={styles.teams}>
                                {match.team1} <strong>vs</strong> {match.team2}
                            </div>
                            <div className={styles.details}>
                                <span>{match.seriesName}</span><br /><br />
                                <span><FontAwesomeIcon icon={faCalendar} /> {match.dateStr}</span>&nbsp;&nbsp;
                                <span><FontAwesomeIcon icon={faClock} /> {match.timeStr}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.noMatches}>No matches found for the selected filter</div>
                )}
            </div>
        </div>
    );
}