'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import styles from './LiveScoreSection.module.css';
import { useGlobalData } from '../Context/ApiContext';
import DynamicLink from '../Common/DynamicLink';
import { convertToVenueTime, formatMatchTime, getMatchStateDisplay } from '../../utils/TimeZoneUtils';

export default function LiveScores({ apiResponse = [], matchTypes = [], teamImages = [] }) {
  const { language, translateText } = useGlobalData();
  
  const [activeType, setActiveType] = useState('');
  const [translatedData, setTranslatedData] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Track previous language to detect changes
  const previousLanguage = useRef(language);

  // Function to check if a match type has data
  const hasMatchData = (matchType) => {
    if (!apiResponse || !matchType) return false;

    const typeMatch = apiResponse.typeMatches?.find(
      tm => tm.matchType === matchType
    );

    if (!typeMatch) return false;

    const hasMatches = typeMatch.seriesMatches?.some(series =>
      series.seriesAdWrapper?.matches && series.seriesAdWrapper.matches.length > 0
    );

    return hasMatches;
  };

  // Initialize translatedData with original data on first load
  useEffect(() => {
    if (!apiResponse?.typeMatches) return;

    // Only initialize if translatedData is empty
    if (translatedData.length === 0) {
      const initialData = apiResponse.typeMatches.map(typeMatch => ({
        matchType: typeMatch.matchType,
        translatedMatchType: typeMatch.matchType,
        seriesMatches: (typeMatch.seriesMatches || []).map(series => ({
          ...series,
          translatedSeriesName: series.seriesAdWrapper?.seriesName || '',
          matches: (series.seriesAdWrapper?.matches || []).map(match => ({
            ...match,
            translatedTeam1Name: match.matchInfo?.team1?.teamName || '',
            translatedTeam2Name: match.matchInfo?.team2?.teamName || '',
            translatedMatchDesc: match.matchInfo?.matchDesc || '',
            translatedStatus: match.matchInfo?.status || ''
          }))
        }))
      }));
      setTranslatedData(initialData);
    }
  }, [apiResponse]);

  // Handle translations when language changes
  useEffect(() => {
    const translateMatchData = async () => {
      if (!apiResponse?.typeMatches || translatedData.length === 0) return;

      // Check if language actually changed
      const languageChanged = previousLanguage.current !== language;
      if (!languageChanged) return;

      previousLanguage.current = language;
      setIsTranslating(true);

      // Translate each type match incrementally
      for (let typeIdx = 0; typeIdx < apiResponse.typeMatches.length; typeIdx++) {
        const typeMatch = apiResponse.typeMatches[typeIdx];

        // Translate match type
        const translatedMatchType = await translateText(typeMatch.matchType || '', 'en', language);

        // Update match type
        setTranslatedData(prev => {
          const updated = [...prev];
          if (updated[typeIdx]) {
            updated[typeIdx] = {
              ...updated[typeIdx],
              translatedMatchType
            };
          }
          return updated;
        });

        // Translate each series
        const seriesMatches = typeMatch.seriesMatches || [];
        for (let seriesIdx = 0; seriesIdx < seriesMatches.length; seriesIdx++) {
          const series = seriesMatches[seriesIdx];
          const seriesName = series.seriesAdWrapper?.seriesName || '';

          // Translate series name
          const translatedSeriesName = seriesName 
            ? await translateText(seriesName, 'en', language)
            : '';

          // Update series name
          setTranslatedData(prev => {
            const updated = [...prev];
            if (updated[typeIdx]?.seriesMatches?.[seriesIdx]) {
              updated[typeIdx].seriesMatches[seriesIdx] = {
                ...updated[typeIdx].seriesMatches[seriesIdx],
                translatedSeriesName
              };
            }
            return updated;
          });

          // Translate each match in the series
          const matches = series.seriesAdWrapper?.matches || [];
          for (let matchIdx = 0; matchIdx < matches.length; matchIdx++) {
            const match = matches[matchIdx];
            const info = match.matchInfo;

            const [translatedTeam1Name, translatedTeam2Name, translatedMatchDesc, translatedStatus] = 
              await Promise.all([
                info?.team1?.teamName ? translateText(info.team1.teamName, 'en', language) : '',
                info?.team2?.teamName ? translateText(info.team2.teamName, 'en', language) : '',
                info?.matchDesc ? translateText(info.matchDesc, 'en', language) : '',
                info?.status ? translateText(info.status, 'en', language) : ''
              ]);

            // Update this specific match
            setTranslatedData(prev => {
              const updated = [...prev];
              if (updated[typeIdx]?.seriesMatches?.[seriesIdx]?.matches?.[matchIdx]) {
                updated[typeIdx].seriesMatches[seriesIdx].matches[matchIdx] = {
                  ...updated[typeIdx].seriesMatches[seriesIdx].matches[matchIdx],
                  translatedTeam1Name,
                  translatedTeam2Name,
                  translatedMatchDesc,
                  translatedStatus
                };
              }
              return updated;
            });
          }
        }
      }

      setIsTranslating(false);
    };

    translateMatchData();
  }, [apiResponse, language, translateText]);

  // Keep a valid activeType when language changes or data updates
  useEffect(() => {
    if (!matchTypes || matchTypes.length === 0) return;

    const saved = typeof window !== 'undefined' ? localStorage.getItem('liveScoreActiveType') : null;
    const isSavedValid = saved && matchTypes.includes(saved) && hasMatchData(saved);

    const defaultType = matchTypes.find(t => hasMatchData(t)) || matchTypes[0] || '';

    if (!activeType || !matchTypes.includes(activeType) || !hasMatchData(activeType)) {
      setActiveType(isSavedValid ? saved : defaultType);
    }
  }, [matchTypes, apiResponse]);

  // Persist the selected type
  useEffect(() => {
    if (activeType && typeof window !== 'undefined') {
      localStorage.setItem('liveScoreActiveType', activeType);
    }
  }, [activeType]);

  function renderCards() {
    if (!translatedData || translatedData.length === 0 || !activeType) return null;

    const typeMatch = translatedData.find(
      tm => tm.matchType === activeType
    );

    if (!typeMatch) {
      return <div className={styles.card}>No live matches for {activeType}</div>;
    }

    const cards = [];

    typeMatch.seriesMatches?.forEach((series, seriesIndex) => {
      if (!series.matches) return;

      const seriesName = series.translatedSeriesName;

      series.matches.forEach((match, matchIndex) => {
        const info = match.matchInfo;
        const score = match.matchScore;
        const team1 = info.team1;
        const team2 = info.team2;
        const venueInfo = info.venueInfo;

        // Convert match time to venue timezone
        const matchDate = info.startDate ?
          convertToVenueTime(info.startDate, venueInfo?.timezone || '+00:00') :
          null;

        // Format match time
        const formattedMatchTime = matchDate ?
          formatMatchTime(matchDate, { dateFormat: 'medium', timeFormat: '12h' }) :
          '';

        // Get match state display
        const matchState = getMatchStateDisplay(info.state || 'Unknown');

        const team1Img = teamImages[team1.imageId];
        const team2Img = teamImages[team2.imageId];

        cards.push(
          <DynamicLink href={`/cricket-match-details/${info.matchId}`} key={`match-${info.matchId}`}>
            <div className={styles.card}>
              <div className={styles.status}>
                <span style={matchState.style}>
                  <span className={styles.liveDot}></span>
                  <strong style={{paddingLeft:'5px'}}>{matchState.text}</strong>
                </span>
                <strong>{typeMatch.translatedMatchType}</strong>
                {formattedMatchTime && (
                  <span className={styles.matchTime}>
                    {venueInfo?.timezone && (
                      <span className={styles.timezone} title={`Venue timezone: ${venueInfo.timezone}`}>🕒</span>
                    )}
                    {formattedMatchTime}
                  </span>
                )}
              </div>
              <div className={styles.title}>{seriesName} - {match.translatedMatchDesc}</div>

              <div className={styles.teams}>
                <div className={styles.team}>
                  <div className={styles.teamInfo}>
                    {team1Img && (
                      <img src={team1Img} alt={team1.teamSName} className={styles.flag} loading="lazy" decoding="async" />
                    )}
                    <span>{match.translatedTeam1Name}</span>
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
                      <img src={team2Img} alt={team2.teamSName} className={styles.flag} loading="lazy" decoding="async" />
                    )}
                    <span>{match.translatedTeam2Name}</span>
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

              <div className={styles.note}>{match.translatedStatus}</div>
            </div>
          </DynamicLink>
        );
      });
    });

    return cards.length > 0 ? cards : (
      <div className={styles.card}>No live matches available</div>
    );
  }

  // Use useMemo so cards are only recomputed when translatedData or activeType changes
  const cardsMemo = useMemo(() => renderCards(), [translatedData, activeType, teamImages]);

  // Show loading state only on initial load
  if (translatedData.length === 0) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.nav}>
          {matchTypes.map(type => (
            <span key={type} className={styles.skeleton} style={{
              width: '60px',
              height: '16px',
              backgroundColor: '#e0e0e0',
              display: 'inline-block',
              margin: '0 8px'
            }}></span>
          ))}
        </div>
        <div className={styles.cardRow}>
          <div className={styles.card}>Loading matches...</div>
        </div>
      </div>
    );
  }

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
          </span>
        ))}
      </div>

      <div className={styles.cardRow}>
        {cardsMemo}
      </div>
    </div>
  );
}