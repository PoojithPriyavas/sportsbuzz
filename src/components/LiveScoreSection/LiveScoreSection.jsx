'use client';

import React, { useContext, useState, useEffect } from 'react';
import styles from './LiveScoreSection.module.css';
import { useGlobalData } from '../Context/ApiContext';
import Link from 'next/link';
import DynamicLink from '../Common/DynamicLink';

export default function LiveScores({ apiResponse = [], matchTypes = [], teamImages = [] }) {
  const [activeType, setActiveType] = useState('');

  // Function to check if a match type has data
  const hasMatchData = (matchType) => {
    if (!apiResponse || !matchType) return false;

    const typeMatch = apiResponse.typeMatches?.find(
      tm => tm.matchType === matchType
    );

    if (!typeMatch) return false;

    // Check if there are any matches in any series
    const hasMatches = typeMatch.seriesMatches?.some(series =>
      series.seriesAdWrapper?.matches && series.seriesAdWrapper.matches.length > 0
    );

    return hasMatches;
  };

  // Auto-select filter with data
  useEffect(() => {
    if (matchTypes.length > 0) {
      // First, try to find a match type with data
      const typeWithData = matchTypes.find(type => hasMatchData(type));

      if (typeWithData) {
        setActiveType(typeWithData);
      } else {
        // If no match type has data, select the first one
        setActiveType(matchTypes[0]);
      }
    }
  }, [matchTypes, apiResponse]);

  const renderCards = () => {
    if (!apiResponse || !activeType) return null;

    const typeMatch = apiResponse.typeMatches?.find(
      tm => tm.matchType === activeType
    );

    if (!typeMatch) {
      return <div className={styles.card}>No live matches for {activeType}</div>;
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

        const team1Img = teamImages[team1.imageId];
        const team2Img = teamImages[team2.imageId];

        cards.push(
          <DynamicLink href={`/cricket-match-details/${info.matchId}`} key={`match-${info.matchId}`}>
            <div className={styles.card}>
              <div className={styles.status}>
                <span className={styles.liveDot}></span>
                <span style={{ color: 'red' }}><strong>Live </strong></span>
                <strong>{activeType}</strong>
              </div>
              <div className={styles.title}>{seriesName} - {info.matchDesc}</div>

              <div className={styles.teams}>
                <div className={styles.team}>
                  <div className={styles.teamInfo}>
                    {team1Img && (
                      <img src={team1Img} alt={team1.teamSName} className={styles.flag} />
                    )}
                    <span>{team1.teamName}</span>
                  </div>
                  {score?.team1Score?.inngs1?.runs != null &&
                    score?.team1Score?.inngs1?.wickets != null &&
                    score?.team1Score?.inngs1?.overs != null && (
                      <strong className={styles.score}>
                        {score.team1Score.inngs1.runs}/{score.team1Score.inngs1.wickets} ({score.team1Score.inngs1.overs})
                      </strong>
                    )}
                </div>
                <div className={styles.team}>
                  <div className={styles.teamInfo}>
                    {team2Img && (
                      <img src={team2Img} alt={team2.teamSName} className={styles.flag} />
                    )}
                    <span>{team2.teamName}</span>
                  </div>
                  {score?.team2Score?.inngs1?.runs != null &&
                    score?.team2Score?.inngs1?.wickets != null &&
                    score?.team2Score?.inngs1?.overs != null && (
                      <strong className={styles.score}>
                        {score.team2Score.inngs1.runs}/{score.team2Score.inngs1.wickets} ({score.team2Score.inngs1.overs})
                      </strong>
                    )}
                </div>
              </div>

              <div className={styles.note}>{info.status}</div>
            </div>
          </DynamicLink>
        );

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
            title={hasMatchData(type) ? `${type} - Has live matches` : `${type} - No live matches`}
          >
            {type}
            {/* {hasMatchData(type) && (
              <span style={{
                marginLeft: '0.5rem',
                color: '#10b981',
                fontSize: '0.7rem'
              }}>
                ●
              </span>
            )} */}
          </span>
        ))}
      </div>

      <div className={styles.cardRow}>
        {renderCards()}
      </div>
    </div>
  );
}