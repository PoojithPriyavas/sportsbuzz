'use client';

import React, { useState, useEffect } from 'react';
import styles from './LiveScoreSection.module.css';
import axios from 'axios';

export default function LiveScores() {
  const [apiResponse, setApiResponse] = useState(null);
  const [matchTypes, setMatchTypes] = useState([]);
  const [activeType, setActiveType] = useState('');
  const [teamImages, setTeamImages] = useState({});

  const rapidApiKey = '017dac301bmshe6ef4a628428634p17177bjsnc738cb420a49';

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await axios.get('https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live', {
          headers: { 'X-RapidAPI-Key': rapidApiKey },
        });

        setApiResponse(res.data);
        const filterTypes = res.data.filters?.matchType || [];
        setMatchTypes(filterTypes);

        if (filterTypes.length > 0) {
          setActiveType(filterTypes[0]);
        }

        const imageIds = new Set();
        res.data.typeMatches?.forEach(type =>
          type.seriesMatches?.forEach(series => {
            const matches = series.seriesAdWrapper?.matches || [];
            matches.forEach(match => {
              const t1 = match.matchInfo?.team1?.imageId;
              const t2 = match.matchInfo?.team2?.imageId;
              if (t1) imageIds.add(t1);
              if (t2) imageIds.add(t2);
            });
          })
        );

        const newTeamImages = {};
        await Promise.all(
          Array.from(imageIds).map(async id => {
            try {
              const response = await axios.get(
                `https://cricbuzz-cricket.p.rapidapi.com/img/v1/i1/c${id}/i.jpg`,
                {
                  headers: { 'X-RapidAPI-Key': rapidApiKey },
                  responseType: 'blob',
                }
              );
              const imageURL = URL.createObjectURL(response.data);
              newTeamImages[id] = imageURL;
            } catch (err) {
              console.error('Failed to fetch image for ID:', id, err);
            }
          })
        );
        setTeamImages(newTeamImages);

      } catch (error) {
        console.error('Failed to fetch live matches:', error);
      }
    };

    fetchMatches();
  }, []);

  const renderCards = () => {
    if (!apiResponse) return null;

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

        const team1Img = teamImages[team1.imageId];
        const team2Img = teamImages[team2.imageId];

        cards.push(
          <div key={`match-${info.matchId}`} className={styles.card}>
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
                    <img
                      src={team1Img}
                      alt={team1.teamSName}
                      className={styles.flag}
                    />
                  )}
                  <span>{team1.teamName}</span>
                </div>
                <strong className={styles.score}>
                  {score?.team1Score?.inngs1?.runs}/{score?.team1Score?.inngs1?.wickets} ({score?.team1Score?.inngs1?.overs})
                </strong>
              </div>
              <div className={styles.team}>
                <div className={styles.teamInfo}>
                  {team2Img && (
                    <img
                      src={team2Img}
                      alt={team2.teamSName}
                      className={styles.flag}
                    />
                  )}
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
