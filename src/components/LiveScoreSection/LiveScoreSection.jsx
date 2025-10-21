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
  
  // Track if this is the first mount
  const isFirstMount = useRef(true);
  
  // Track if initial load is complete
  const initialLoadComplete = useRef(false);
  
  // Cache for translations
  const translationCache = useRef(new Map());

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

    // Only initialize if translatedData is empty and not done yet
    if (translatedData.length === 0 && !initialLoadComplete.current) {
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
      initialLoadComplete.current = true;
    }
  }, [apiResponse]);

  // Handle translations when language changes
  useEffect(() => {
    const translateMatchData = async () => {
      if (!apiResponse?.typeMatches || !initialLoadComplete.current) return;

      // Check if language actually changed OR if this is first mount with non-English language
      const languageChanged = previousLanguage.current !== language;
      const needsInitialTranslation = isFirstMount.current && language !== 'en';

      console.log('🟢 [LiveScore] Language changed?', languageChanged, 'from', previousLanguage.current, 'to', language);
      console.log('🟢 [LiveScore] First mount needs translation?', needsInitialTranslation);

      // Skip if no change and not first mount needing translation
      if (!languageChanged && !needsInitialTranslation) return;

      // Mark first mount as complete
      isFirstMount.current = false;

      previousLanguage.current = language;
      translationCache.current.clear(); // Clear cache for new language
      setIsTranslating(true);

      try {
        // ✅ Check localStorage for cached translations first
        const cacheKey = `cricket_translations_${language}`;
        const cachedData = typeof window !== 'undefined' 
          ? localStorage.getItem(cacheKey) 
          : null;

        if (cachedData) {
          try {
            const parsed = JSON.parse(cachedData);
            const cacheAge = Date.now() - parsed.timestamp;
            
            // Use cache if less than 1 hour old
            if (cacheAge < 60 * 60 * 1000) {
              console.log('🟢 [LiveScore] Using cached translations from localStorage');
              
              // Restore translation cache
              parsed.translationCache.forEach(([key, value]) => {
                translationCache.current.set(key, value);
              });
              
              // Build translated data from cache
              const cachedTranslatedData = apiResponse.typeMatches.map(typeMatch => {
                const translatedMatchType = translationCache.current.get(`${typeMatch.matchType}_en_${language}`) || typeMatch.matchType;

                return {
                  matchType: typeMatch.matchType,
                  translatedMatchType,
                  seriesMatches: (typeMatch.seriesMatches || []).map(series => {
                    const seriesName = series.seriesAdWrapper?.seriesName || '';
                    const translatedSeriesName = seriesName
                      ? (translationCache.current.get(`${seriesName}_en_${language}`) || seriesName)
                      : '';

                    return {
                      ...series,
                      translatedSeriesName,
                      matches: (series.seriesAdWrapper?.matches || []).map(match => {
                        const info = match.matchInfo;
                        return {
                          ...match,
                          translatedTeam1Name: info?.team1?.teamName
                            ? (translationCache.current.get(`${info.team1.teamName}_en_${language}`) || info.team1.teamName)
                            : '',
                          translatedTeam2Name: info?.team2?.teamName
                            ? (translationCache.current.get(`${info.team2.teamName}_en_${language}`) || info.team2.teamName)
                            : '',
                          translatedMatchDesc: info?.matchDesc
                            ? (translationCache.current.get(`${info.matchDesc}_en_${language}`) || info.matchDesc)
                            : '',
                          translatedStatus: info?.status
                            ? (translationCache.current.get(`${info.status}_en_${language}`) || info.status)
                            : ''
                        };
                      })
                    };
                  })
                };
              });
              
              setTranslatedData(cachedTranslatedData);
              setIsTranslating(false);
              return; // Exit early with cached data
            }
          } catch (parseError) {
            console.warn('[LiveScore] Failed to parse cached translations:', parseError);
          }
        }

        // ✅ Helper function to translate with caching
        const translateWithCache = async (text, fromLang, toLang) => {
          if (!text) return '';

          const cacheKey = `${text}_${fromLang}_${toLang}`;

          // Return cached translation if exists
          if (translationCache.current.has(cacheKey)) {
            return translationCache.current.get(cacheKey);
          }

          // Translate and cache the result
          const translated = await translateText(text, fromLang, toLang);
          translationCache.current.set(cacheKey, translated);
          return translated;
        };

        // ✅ Collect all unique texts to translate
        const uniqueMatchTypes = new Set();
        const uniqueSeriesNames = new Set();
        const uniqueTeamNames = new Set();
        const uniqueMatchDescs = new Set();
        const uniqueStatuses = new Set();

        apiResponse.typeMatches.forEach(typeMatch => {
          if (typeMatch.matchType) uniqueMatchTypes.add(typeMatch.matchType);

          (typeMatch.seriesMatches || []).forEach(series => {
            const seriesName = series.seriesAdWrapper?.seriesName;
            if (seriesName) uniqueSeriesNames.add(seriesName);

            (series.seriesAdWrapper?.matches || []).forEach(match => {
              const info = match.matchInfo;
              if (info?.team1?.teamName) uniqueTeamNames.add(info.team1.teamName);
              if (info?.team2?.teamName) uniqueTeamNames.add(info.team2.teamName);
              if (info?.matchDesc) uniqueMatchDescs.add(info.matchDesc);
              if (info?.status) uniqueStatuses.add(info.status);
            });
          });
        });

        console.log('🟢 [LiveScore] Translating:', {
          matchTypes: uniqueMatchTypes.size,
          series: uniqueSeriesNames.size,
          teams: uniqueTeamNames.size,
          descs: uniqueMatchDescs.size,
          statuses: uniqueStatuses.size
        });

        // ✅ Translate all unique texts in parallel
        await Promise.all([
          ...Array.from(uniqueMatchTypes).map(text => translateWithCache(text, 'en', language)),
          ...Array.from(uniqueSeriesNames).map(text => translateWithCache(text, 'en', language)),
          ...Array.from(uniqueTeamNames).map(text => translateWithCache(text, 'en', language)),
          ...Array.from(uniqueMatchDescs).map(text => translateWithCache(text, 'en', language)),
          ...Array.from(uniqueStatuses).map(text => translateWithCache(text, 'en', language))
        ]);

        // ✅ Build fully translated data using cached translations
        const fullyTranslatedData = apiResponse.typeMatches.map(typeMatch => {
          const translatedMatchType = translationCache.current.get(`${typeMatch.matchType}_en_${language}`) || typeMatch.matchType;

          return {
            matchType: typeMatch.matchType,
            translatedMatchType,
            seriesMatches: (typeMatch.seriesMatches || []).map(series => {
              const seriesName = series.seriesAdWrapper?.seriesName || '';
              const translatedSeriesName = seriesName
                ? (translationCache.current.get(`${seriesName}_en_${language}`) || seriesName)
                : '';

              return {
                ...series,
                translatedSeriesName,
                matches: (series.seriesAdWrapper?.matches || []).map(match => {
                  const info = match.matchInfo;
                  return {
                    ...match,
                    translatedTeam1Name: info?.team1?.teamName
                      ? (translationCache.current.get(`${info.team1.teamName}_en_${language}`) || info.team1.teamName)
                      : '',
                    translatedTeam2Name: info?.team2?.teamName
                      ? (translationCache.current.get(`${info.team2.teamName}_en_${language}`) || info.team2.teamName)
                      : '',
                    translatedMatchDesc: info?.matchDesc
                      ? (translationCache.current.get(`${info.matchDesc}_en_${language}`) || info.matchDesc)
                      : '',
                    translatedStatus: info?.status
                      ? (translationCache.current.get(`${info.status}_en_${language}`) || info.status)
                      : ''
                  };
                })
              };
            })
          };
        });

        console.log('🟢 [LiveScore] All translations complete, updating state once');
        console.log('🟢 [LiveScore] Cache size:', translationCache.current.size, 'translations');
        setTranslatedData(fullyTranslatedData);

        // ✅ Save translations to localStorage
        try {
          const cacheData = {
            language,
            translationCache: Array.from(translationCache.current.entries()),
            timestamp: Date.now()
          };
          localStorage.setItem(`cricket_translations_${language}`, JSON.stringify(cacheData));
          console.log('🟢 [LiveScore] Translations cached to localStorage');
        } catch (storageError) {
          console.warn('[LiveScore] Failed to cache translations to localStorage:', storageError);
        }

      } catch (error) {
        console.error('[LiveScore] Translation error:', error);
      } finally {
        setIsTranslating(false);
      }
    };

    translateMatchData();
  }, [language]); // Only depend on language

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
      {isTranslating && (
        <div style={{
          position: 'fixed',
          top: '60px',
          right: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px',
          zIndex: 1000
        }}>
          Translating Cricket...
        </div>
      )}

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