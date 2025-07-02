'use client';

import React, { useState, useEffect } from 'react';
import styles from './LiveScoreSection.module.css';
import axios from 'axios';

export default function LiveScores() {
  const [matchData, setMatchData] = useState([]);
  const [matchTypes, setMatchTypes] = useState([]);
  const [activeType, setActiveType] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await axios.get('https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live', {
          headers: {
            'X-RapidAPI-Key': '28acac3c58mshd83e0915f78a287p129875jsna833d4039a3e',
          },
        });

        const data = res.data.typeMatches || [];
        setMatchData(data);
        const types = data.map(item => item.matchType);
        setMatchTypes(types);
        setActiveType(types[0]);
      } catch (error) {
        console.error('Failed to fetch live matches:', error);
      }
    };

    fetchMatches();
  }, []);

  const renderCards = () => {
    const currentType = matchData.find(type => type.matchType === activeType);
    if (!currentType) return null;

    const cards = [];

    currentType.seriesMatches.forEach((series, seriesIndex) => {
      const seriesName = series.seriesAdWrapper?.seriesName || '';
      const matches = series.seriesAdWrapper?.matches || [];

      matches.forEach((match, matchIndex) => {
        const info = match.matchInfo;
        const score = match.matchScore;
        const team1 = info.team1;
        const team2 = info.team2;

        cards.push(
          <div key={`match-${info.matchId}`} className={styles.card}>
            <div className={styles.status}>
              <span className={styles.liveDot}></span>
              <span style={{ color: 'red' }}><strong>Live  </strong> </span>
              {/* <strong>{info.state}</strong> - {info.matchFormat} */}
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

        if ((cards.length + 1) % 3 === 0) {
          cards.push(
            <div key={`ad-${seriesIndex}-${matchIndex}`} className={styles.card}>
              <div className={styles.ad}>Google Ads</div>
            </div>
          );
        }
      });
    });

    return cards;
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
