'use client';

import React, { useState, useEffect } from 'react';
import styles from './LiveScoreSection.module.css';
import axios from 'axios';

export default function LiveScores() {
  const [apiResponse, setApiResponse] = useState(null);
  const [matchTypes, setMatchTypes] = useState([]);
  const [activeType, setActiveType] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await axios.get('https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live', {
          headers: {
            'X-RapidAPI-Key': '017dac301bmshe6ef4a628428634p17177bjsnc738cb420a49',
          },
        });

        setApiResponse(res.data);
        
        // Extract match types from filters.matchType
        const filterTypes = res.data.filters?.matchType || [];
        setMatchTypes(filterTypes);
        
        // Set initial active type
        if (filterTypes.length > 0) {
          setActiveType(filterTypes[0]);
        }
      } catch (error) {
        console.error('Failed to fetch live matches:', error);
      }
    };

    fetchMatches();
  }, []);

  const renderCards = () => {
    if (!apiResponse) return null;

    // Find matches for active type
    const typeMatch = apiResponse.typeMatches?.find(
      tm => tm.matchType === activeType
    );
    
    if (!typeMatch) {
      return (
        <div className={styles.card}>
          No live matches for {activeType}
        </div>
      );
    }

    const cards = [];
    let matchCount = 0;

    typeMatch.seriesMatches?.forEach((series, seriesIndex) => {
      if (!series.seriesAdWrapper) return;
      
      const { seriesName, matches } = series.seriesAdWrapper;
      if (!matches) return;

      matches.forEach((match, matchIndex) => {
        matchCount++;
        const info = match.matchInfo;
        const score = match.matchScore;
        const team1 = info.team1;
        const team2 = info.team2;

        cards.push(
          <div key={`match-${info.matchId}`} className={styles.card}>
            <div className={styles.status}>
              <span className={styles.liveDot}></span>
              <span style={{ color: 'red' }}><strong>Live  </strong> </span>
              <strong>{activeType}</strong>
            </div>
            <div className={styles.title}>{seriesName} - {info.matchDesc}</div>

            <div className={styles.teams}>
              <div className={styles.team}>
                <div className={styles.teamInfo}>
                  <img src={`/flags/${team1.teamSName}.png`} alt={team1.teamSName} className={styles.flag} />
                  <span>{team1.teamName}</span>
                </div>
                <strong className={styles.score}>
                  {score?.team1Score?.inngs1?.runs}/{score?.team1Score?.inngs1?.wickets} ({score?.team1Score?.inngs1?.overs})
                </strong>
              </div>
              <div className={styles.team}>
                <div className={styles.teamInfo}>
                  <img src={`/flags/${team2.teamSName}.png`} alt={team2.teamSName} className={styles.flag} />
                  <span>{team2.teamName}</span>
                </div>
                <strong className={styles.score}>
                  {score?.team2Score?.inngs1?.runs}/{score?.team2Score?.inngs1?.wickets} ({score?.team2Score?.inngs1?.overs})
                </strong>
              </div>
            </div>

            <div className={styles.note}>{info.status}</div>
          </div>
        );

        // Insert ad after every 2 matches
        if (matchCount % 2 === 0) {
          cards.push(
            <div key={`ad-${seriesIndex}-${matchIndex}`} className={styles.card}>
              <div className={styles.ad}>Google Ads</div>
            </div>
          );
        }
      });
    });

    return cards.length > 0 ? cards : (
      <div className={styles.card}>No live matches available</div>
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.nav}>
        {matchTypes.map(type => (
          <span
            key={type}
            onClick={() => setActiveType(type)}
            className={activeType === type ? styles.active : ''}
          >
            {type}
          </span>
        ))}
      </div>

      <div className={styles.cardRow}>
        {renderCards()}
      </div>
    </div>
  );
}