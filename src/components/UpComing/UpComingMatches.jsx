'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './UpComingMatches.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faClock, faFilter } from '@fortawesome/free-solid-svg-icons';
import { useGlobalData } from '../Context/ApiContext';
import { useRouter } from 'next/navigation';
import DynamicLink from '../Common/DynamicLink';

export default function UpcomingMatches({ upcomingMatches = [] }) {
    const { language, translateText } = useGlobalData();
    const [filter, setFilter] = useState('all');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [translatedText, setTranslatedText] = useState({
        cricketSchedules: 'Cricket Schedules',
        filter: 'Filter',
        all: 'all',
        upcoming: 'Upcoming',
        vs: 'vs',
        noMatches: 'No matches found for the selected filter'
    });
    const router = useRouter();

    useEffect(() => {
        const translateLabels = async () => {
            // Create an array of text objects for batch translation
            const textsToTranslate = [
                { text: 'Cricket Schedules', to: language },
                { text: 'Filter', to: language },
                { text: 'all', to: language },
                { text: 'Upcoming', to: language },
                { text: 'vs', to: language },
                { text: 'No matches found for the selected filter', to: language }
            ];

            // Get translations in a single API call
            const translations = await translateText(textsToTranslate, 'en', language);

            // Update state with the translated texts
            setTranslatedText({
                cricketSchedules: translations[0],
                filter: translations[1],
                all: translations[2],
                upcoming: translations[3],
                vs: translations[4],
                noMatches: translations[5]
            });
        };

        translateLabels();
    }, [language, translateText]);

    // Get unique match types for filter options
    const matchTypes = [translatedText.all, ...new Set(upcomingMatches.map(match => match.type))];

    // Filter matches based on selected filter
    const filteredMatches = filter === translatedText.all
        ? upcomingMatches
        : upcomingMatches.filter(match => match.type === filter);

    return (
        <div className={styles.section}>
            <div className={styles.header}>
                <h4 className={styles.cricketMatchesTitle}>{translatedText.cricketSchedules}</h4>
                <div className={styles.filterContainer}>
                    <button
                        className={styles.filterButton}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <FontAwesomeIcon icon={faFilter} /> {translatedText.filter}
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
                                    {type === translatedText.all ? type : type.charAt(0).toUpperCase() + type.slice(1)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.matchesContainer}>
                {filteredMatches.length > 0 ? (
                    filteredMatches.map(match => (
                        <DynamicLink href={`/cricket-match-details/${match.matchId}`}>
                            <div key={match.matchId} className={styles.card} >
                                <div className={styles.labels}>
                                    <span className={styles.intl}>{match.type}</span>
                                    <span className={styles.upcoming}>{translatedText.upcoming}</span>
                                </div>
                                <div className={styles.teams}>
                                    {match.team1} <strong>{translatedText.vs}</strong> {match.team2}
                                </div>
                                <div className={styles.details}>
                                    <span>{match.seriesName}</span><br /><br />
                                    <span><FontAwesomeIcon icon={faCalendar} /> {match.dateStr}</span>&nbsp;&nbsp;
                                    <span><FontAwesomeIcon icon={faClock} /> {match.timeStr}</span>
                                </div>
                            </div>
                        </DynamicLink>

                    ))
                ) : (
                    <div className={styles.noMatches}>{translatedText.noMatches}</div>
                )}
            </div>
        </div>
    );
}