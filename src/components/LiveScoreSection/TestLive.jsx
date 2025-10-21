'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import styles from './TestLive.module.css';
import { useGlobalData } from '../Context/ApiContext';
import { useDynamicRouter } from '@/hooks/useDynamicRouter';

// ✅ Modified date formatter that accepts translated strings
function formatDate(esd, labels = { today: 'Today', tomorrow: 'Tomorrow' }) {
    const raw = esd?.toString();
    if (!raw || raw.length !== 14) return '';

    const year = raw.slice(0, 4);
    const month = raw.slice(4, 6);
    const day = raw.slice(6, 8);
    const hour = parseInt(raw.slice(8, 10));
    const minute = raw.slice(10, 12);

    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    const timeString = `${hour12}:${minute.padStart(2, '0')} ${period}`;

    const matchDate = new Date(year, month - 1, day);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    matchDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);

    if (matchDate.getTime() === today.getTime()) {
        return `${labels.today} ${timeString}`;
    } else if (matchDate.getTime() === tomorrow.getTime()) {
        return `${labels.tomorrow} ${timeString}`;
    } else {
        return `${day}/${month}/${year} ${timeString}`;
    }
}

// Skeleton Card Component
function SkeletonCard() {
    return (
        <div className={styles.matchCard} style={{ pointerEvents: 'none' }}>
            <div className={styles.leagueHeader}>
                <div className={styles.leagueName}>
                    <div className={styles.skeleton} style={{
                        width: '80%',
                        height: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)'
                    }}></div>
                </div>
                <div className={styles.subLeague}>
                    <div className={styles.skeleton} style={{
                        width: '60%',
                        height: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.15)'
                    }}></div>
                </div>
            </div>

            <div className={styles.matchContent}>
                <div className={styles.teamsContainer}>
                    <div className={styles.team}>
                        <div className={styles.teamLogo}>
                            <div className={styles.skeleton} style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: '#e0e0e0'
                            }}></div>
                        </div>
                        <div className={styles.skeleton} style={{
                            width: '60px',
                            height: '13px',
                            backgroundColor: '#e0e0e0',
                            marginTop: '8px'
                        }}></div>
                    </div>

                    <div className={styles.scoreSection}>
                        <div className={styles.skeleton} style={{
                            width: '30px',
                            height: '33px',
                            backgroundColor: '#e0e0e0',
                            margin: '0 15px'
                        }}></div>
                        <div className={styles.vs} style={{ color: '#bbb' }}>VS</div>
                        <div className={styles.skeleton} style={{
                            width: '30px',
                            height: '33px',
                            backgroundColor: '#e0e0e0',
                            margin: '0 15px'
                        }}></div>
                    </div>

                    <div className={styles.team}>
                        <div className={styles.teamLogo}>
                            <div className={styles.skeleton} style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: '#e0e0e0'
                            }}></div>
                        </div>
                        <div className={styles.skeleton} style={{
                            width: '60px',
                            height: '13px',
                            backgroundColor: '#e0e0e0',
                            marginTop: '8px'
                        }}></div>
                    </div>
                </div>
            </div>

            <div className={styles.matchInfo}>
                <div className={styles.skeleton} style={{
                    width: '80px',
                    height: '12px',
                    backgroundColor: '#e0e0e0'
                }}></div>
                <div className={styles.skeleton} style={{
                    width: '60px',
                    height: '20px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '20px'
                }}></div>
            </div>
        </div>
    );
}

// Skeleton Filter Bar Component
function SkeletonFilterBar() {
    return (
        <div className={styles.leagueSelector}>
            <div className={styles.skeleton} style={{
                width: '30px',
                height: '16px',
                backgroundColor: '#e0e0e0'
            }}></div>
            {Array.from({ length: 4 }).map((_, index) => (
                <div
                    key={index}
                    className={styles.skeleton}
                    style={{
                        width: `${60 + (index * 10)}px`,
                        height: '16px',
                        backgroundColor: '#e0e0e0'
                    }}
                ></div>
            ))}
            <div className={styles.skeleton} style={{
                width: '100px',
                height: '30px',
                backgroundColor: '#e0e0e0',
                borderRadius: '6px'
            }}></div>
        </div>
    );
}

export default function TestLive() {

    const { stages, language, translateText, fetchFootballDetails, fetchFootBallLineUp, setMatchTeams, debugTranslateText } = useGlobalData();

    const [selectedLeague, setSelectedLeague] = useState('');
    const [translatedStages, setTranslatedStages] = useState([]);
    const [dateLabels, setDateLabels] = useState({ today: 'Today', tomorrow: 'Tomorrow' });
    const [staticTexts, setStaticTexts] = useState({ group: 'Group' });
    const [isTranslating, setIsTranslating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Track previous language to detect changes
    const previousLanguage = useRef(language);

    // Track if initial load is complete
    const initialLoadComplete = useRef(false);

    // Cache for translations to avoid duplicate API calls
    const translationCache = useRef(new Map());
    
    // Track if this is the first mount
    const isFirstMount = useRef(true);

    const { pushDynamic } = useDynamicRouter();

    const handleMatchClick = async (eid, team1Name, team2Name) => {
        if (setMatchTeams) {
            setMatchTeams({
                team1: team1Name,
                team2: team2Name
            });
        }

        await Promise.all([
            fetchFootballDetails(eid),
            fetchFootBallLineUp(eid)
        ]);

        await pushDynamic(`/football-match-details/${eid}`);
    };

    // ✅ USEEFFECT #1: Initialize translated stages with original data (runs once on mount)
    useEffect(() => {
        console.log("🔵 useEffect #1: Initialize stages");

        if (!stages?.Stages) {
            setIsLoading(true);
            return;
        }

        // Only initialize if not done yet
        if (!initialLoadComplete.current) {
            const initialStages = stages.Stages.map(stage => ({
                ...stage,
                translatedLeague: stage.Cnm || '',
                translatedSubLeague: stage.Snm || '',
                translatedEvents: (stage.Events || []).map(event => {
                    const team1 = event.T1?.[0];
                    const team2 = event.T2?.[0];
                    return {
                        ...event,
                        translatedTeam1: team1?.Nm || '',
                        translatedTeam2: team2?.Nm || '',
                        translatedStatus: event.Eps || ''
                    };
                })
            }));

            setTranslatedStages(initialStages);
            setIsLoading(false);
            initialLoadComplete.current = true;
        }
    }, [stages]);

    // ✅ USEEFFECT #2: Handle language changes and translate ALL data in one batch
    useEffect(() => {
        console.log("🟢 useEffect #2: Language change detected", language);

        const translateStageData = async () => {
            // Guard: Don't run if no data or it's the initial language
            if (!stages?.Stages || !initialLoadComplete.current) return;

            // Check if language actually changed OR if this is first mount with non-English language
            const languageChanged = previousLanguage.current !== language;
            const needsInitialTranslation = isFirstMount.current && language !== 'en';
            
            console.log('🟢 Language changed?', languageChanged, 'from', previousLanguage.current, 'to', language);
            console.log('🟢 First mount needs translation?', needsInitialTranslation);

            // Skip if no change and not first mount needing translation
            if (!languageChanged && !needsInitialTranslation) return;

            // Mark first mount as complete
            isFirstMount.current = false;

            // Update ref to track current language and clear cache
            previousLanguage.current = language;
            translationCache.current.clear(); // Clear cache for new language
            setIsTranslating(true);

            try {
                // ✅ Check localStorage for cached translations first
                const cacheKey = `football_translations_${language}`;
                const cachedData = typeof window !== 'undefined' 
                    ? localStorage.getItem(cacheKey) 
                    : null;

                if (cachedData) {
                    try {
                        const parsed = JSON.parse(cachedData);
                        const cacheAge = Date.now() - parsed.timestamp;
                        
                        // Use cache if less than 1 hour old
                        if (cacheAge < 60 * 60 * 1000) {
                            console.log('🟢 Using cached translations from localStorage');
                            setDateLabels(parsed.dateLabels);
                            setStaticTexts(parsed.staticTexts);
                            
                            // Restore translation cache
                            parsed.translationCache.forEach(([key, value]) => {
                                translationCache.current.set(key, value);
                            });
                            
                            // Build translated stages from cache
                            const cachedStages = stages.Stages.map(stage => {
                                const translatedLeague = translationCache.current.get(`${stage.Cnm}_en_${language}`) || stage.Cnm || '';
                                const translatedSubLeague = stage.Snm
                                    ? (translationCache.current.get(`${stage.Snm}_en_${language}`) || stage.Snm)
                                    : '';

                                const translatedEvents = (stage.Events || []).map(event => {
                                    const team1 = event.T1?.[0];
                                    const team2 = event.T2?.[0];

                                    return {
                                        ...event,
                                        translatedTeam1: team1?.Nm
                                            ? (translationCache.current.get(`${team1.Nm}_en_${language}`) || team1.Nm)
                                            : '',
                                        translatedTeam2: team2?.Nm
                                            ? (translationCache.current.get(`${team2.Nm}_en_${language}`) || team2.Nm)
                                            : '',
                                        translatedStatus: event.Eps
                                            ? (translationCache.current.get(`${event.Eps}_en_${language}`) || event.Eps)
                                            : ''
                                    };
                                });

                                return {
                                    ...stage,
                                    translatedLeague,
                                    translatedSubLeague,
                                    translatedEvents
                                };
                            });
                            
                            setTranslatedStages(cachedStages);
                            setIsTranslating(false);
                            return; // Exit early with cached data
                        }
                    } catch (parseError) {
                        console.warn('Failed to parse cached translations:', parseError);
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
                    const translated = await debugTranslateText(text, fromLang, toLang);
                    translationCache.current.set(cacheKey, translated);
                    return translated;
                };

                // ✅ Step 1: Translate all static texts ONCE
                const [today, tomorrow, group] = await Promise.all([
                    translateWithCache('Today', 'en', language),
                    translateWithCache('Tomorrow', 'en', language),
                    translateWithCache('Group', 'en', language)
                ]);

                setDateLabels({ today, tomorrow });
                setStaticTexts({ group });

                // ✅ Step 2: Collect all unique texts to translate
                const uniqueLeagues = new Set();
                const uniqueSubLeagues = new Set();
                const uniqueTeams = new Set();
                const uniqueStatuses = new Set();

                stages.Stages.forEach(stage => {
                    if (stage.Cnm) uniqueLeagues.add(stage.Cnm);
                    if (stage.Snm) uniqueSubLeagues.add(stage.Snm);

                    (stage.Events || []).forEach(event => {
                        const team1 = event.T1?.[0];
                        const team2 = event.T2?.[0];

                        if (team1?.Nm) uniqueTeams.add(team1.Nm);
                        if (team2?.Nm) uniqueTeams.add(team2.Nm);
                        if (event.Eps) uniqueStatuses.add(event.Eps);
                    });
                });

                // ✅ Step 3: Translate all unique texts in parallel
                console.log('🟢 Translating:', {
                    leagues: uniqueLeagues.size,
                    subLeagues: uniqueSubLeagues.size,
                    teams: uniqueTeams.size,
                    statuses: uniqueStatuses.size
                });

                await Promise.all([
                    ...Array.from(uniqueLeagues).map(text => translateWithCache(text, 'en', language)),
                    ...Array.from(uniqueSubLeagues).map(text => translateWithCache(text, 'en', language)),
                    ...Array.from(uniqueTeams).map(text => translateWithCache(text, 'en', language)),
                    ...Array.from(uniqueStatuses).map(text => translateWithCache(text, 'en', language))
                ]);

                // ✅ Step 4: Build translated stages using cached translations
                const fullyTranslatedStages = stages.Stages.map(stage => {
                    const translatedLeague = translationCache.current.get(`${stage.Cnm}_en_${language}`) || stage.Cnm || '';
                    const translatedSubLeague = stage.Snm
                        ? (translationCache.current.get(`${stage.Snm}_en_${language}`) || stage.Snm)
                        : '';

                    const translatedEvents = (stage.Events || []).map(event => {
                        const team1 = event.T1?.[0];
                        const team2 = event.T2?.[0];

                        return {
                            ...event,
                            translatedTeam1: team1?.Nm
                                ? (translationCache.current.get(`${team1.Nm}_en_${language}`) || team1.Nm)
                                : '',
                            translatedTeam2: team2?.Nm
                                ? (translationCache.current.get(`${team2.Nm}_en_${language}`) || team2.Nm)
                                : '',
                            translatedStatus: event.Eps
                                ? (translationCache.current.get(`${event.Eps}_en_${language}`) || event.Eps)
                                : ''
                        };
                    });

                    return {
                        ...stage,
                        translatedLeague,
                        translatedSubLeague,
                        translatedEvents
                    };
                });

                // ✅ SINGLE STATE UPDATE - Only updates once after all translations complete
                console.log('🟢 All translations complete, updating state once');
                console.log('🟢 Cache size:', translationCache.current.size, 'translations');
                setTranslatedStages(fullyTranslatedStages);

                // ✅ Save translations to localStorage
                try {
                    const cacheData = {
                        language,
                        dateLabels: { today, tomorrow },
                        staticTexts: { group },
                        translationCache: Array.from(translationCache.current.entries()),
                        timestamp: Date.now()
                    };
                    localStorage.setItem(`football_translations_${language}`, JSON.stringify(cacheData));
                    console.log('🟢 Translations cached to localStorage');
                } catch (storageError) {
                    console.warn('Failed to cache translations to localStorage:', storageError);
                }

            } catch (error) {
                console.error('Translation error:', error);
            } finally {
                setIsTranslating(false);
            }
        };

        translateStageData();
    }, [language]); // ✅ Only depend on language, not stages or translateText

    // ✅ USEEFFECT #3: Manage selected league (merged #3 and #4 logic)
    useEffect(() => {
        console.log("🟡 useEffect #3: Manage selected league");

        if (!Array.isArray(translatedStages) || translatedStages.length === 0) return;

        // Helper: Get all unique leagues
        const leagues = Array.from(
            new Set(
                translatedStages
                    .map(stage => stage.translatedLeague)
                    .filter(Boolean)
            )
        );

        // Helper: Check if a league has events
        const hasEvents = (league) =>
            translatedStages.some(
                s =>
                    s.translatedLeague === league &&
                    Array.isArray(s.translatedEvents) &&
                    s.translatedEvents.length > 0
            );

        // Helper: Get first league with events
        const getFirstLeagueWithEvents = () => {
            const stageWithEvents = translatedStages.find(
                s => Array.isArray(s.translatedEvents) && s.translatedEvents.length > 0
            );
            return stageWithEvents?.translatedLeague || 'All';
        };

        // Priority 1: Restore from localStorage (only on initial load)
        const saved = typeof window !== 'undefined'
            ? localStorage.getItem('footballSelectedLeague')
            : null;

        if (saved && leagues.includes(saved) && (saved === 'All' || hasEvents(saved))) {
            if (selectedLeague !== saved) {
                console.log('🟡 Restoring saved league:', saved);
                setSelectedLeague(saved);
            }
            return;
        }

        // Priority 2: Fix invalid selection (league no longer exists after translation)
        if (selectedLeague && selectedLeague !== 'All' && !leagues.includes(selectedLeague)) {
            const newLeague = getFirstLeagueWithEvents();
            console.log('🟡 Invalid league selection, switching to:', newLeague);
            setSelectedLeague(newLeague);
            return;
        }

        // Priority 3: Auto-select if nothing is selected
        if (!selectedLeague) {
            const newLeague = getFirstLeagueWithEvents();
            console.log('🟡 Auto-selecting first league:', newLeague);
            setSelectedLeague(newLeague);
        }
    }, [translatedStages]); // ✅ Only depend on translatedStages

    // ✅ USEEFFECT #4: Persist selected league to localStorage
    useEffect(() => {
        console.log("🟣 useEffect #4: Persist to localStorage", selectedLeague);

        if (selectedLeague && typeof window !== 'undefined') {
            localStorage.setItem('footballSelectedLeague', selectedLeague);
        }
    }, [selectedLeague]);

    // Show skeleton loader only on initial load
    if (isLoading || translatedStages.length === 0) {
        return (
            <>
                <SkeletonFilterBar />
                <div className={styles.cardsContainer}>
                    {Array.from({ length: 6 }).map((_, index) => (
                        <SkeletonCard key={index} />
                    ))}
                </div>
            </>
        );
    }

    const allLeagues = translatedStages.map(stage => stage.translatedLeague).filter(Boolean);
    const uniqueLeagues = Array.from(new Set(allLeagues));
    const topLeagues = uniqueLeagues.slice(0, 5);
    const otherLeagues = uniqueLeagues.slice(5);

    return (
        <>
            {isTranslating && (
                <div style={{
                    position: 'fixed',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    zIndex: 1000
                }}>
                    Translating...
                </div>
            )}

            <div className={styles.leagueSelector}>
                <span
                    onClick={() => setSelectedLeague('All')}
                    className={selectedLeague === 'All' ? styles.selectedLeague : styles.leagueItem}
                >
                    All
                </span>

                {topLeagues.map((league) => (
                    <span
                        key={league}
                        onClick={() => setSelectedLeague(league)}
                        className={selectedLeague === league ? styles.selectedLeague : styles.leagueItem}
                    >
                        {league}
                    </span>
                ))}

                {otherLeagues.length > 0 && (
                    <select
                        onChange={(e) => setSelectedLeague(e.target.value)}
                        value={selectedLeague}
                        className={styles.leagueDropdown}
                    >
                        <option value="All">Other Leagues</option>
                        {otherLeagues.map((league) => (
                            <option key={league} value={league}>
                                {league}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div className={styles.cardsContainer}>
                {translatedStages
                    .filter(stage => selectedLeague === 'All' || stage.translatedLeague === selectedLeague)
                    .map((stage) =>
                        stage.translatedEvents?.map((event) => {
                            const team1 = event.T1?.[0];
                            const team2 = event.T2?.[0];

                            const status = event.translatedStatus;
                            const isFinished = status.toLowerCase().includes('ft');
                            const isLive = status.toLowerCase().includes('live');

                            const matchStatusStyle = isFinished
                                ? { background: '#95a5a6' }
                                : isLive
                                    ? { background: 'red' }
                                    : { background: '#3498db' };

                            return (
                                <div
                                    key={event.Eid}
                                    className={styles.matchCard}
                                    onClick={() => handleMatchClick(event.Eid, event.translatedTeam1, event.translatedTeam2)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className={styles.leagueHeader}>
                                        <div className={styles.leagueName}>{stage.translatedLeague}</div>
                                        <div className={styles.subLeague}>{staticTexts.group} • {stage.translatedSubLeague}</div>
                                    </div>

                                    <div className={styles.matchContent}>
                                        <div className={styles.teamsContainer}>
                                            <div className={styles.team}>
                                                <div className={styles.teamLogo}>
                                                    <img
                                                        src={`https://lsm-static-prod.livescore.com/medium/${team1?.Img}`}
                                                        alt={event.translatedTeam1}
                                                        className={styles.logoImage}
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                </div>
                                                <div className={styles.teamName}>{event.translatedTeam1}</div>
                                            </div>

                                            <div className={styles.scoreSection}>
                                                <div className={styles.score}>{event.Tr1 ?? '-'}</div>
                                                <div className={styles.vs}>VS</div>
                                                <div className={styles.score}>{event.Tr2 ?? '-'}</div>
                                            </div>

                                            <div className={styles.team}>
                                                <div className={styles.teamLogo}>
                                                    <img
                                                        src={`https://lsm-static-prod.livescore.com/medium/${team2?.Img}`}
                                                        alt={event.translatedTeam2}
                                                        className={styles.logoImage}
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                </div>
                                                <div className={styles.teamName}>{event.translatedTeam2}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.matchInfo}>
                                        <div className={styles.matchTime}>{formatDate(event.Esd, dateLabels)}</div>
                                        <div className={styles.matchStatus} style={matchStatusStyle}>
                                            {isLive && <span className={styles.liveIndicator}></span>}
                                            {status}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
            </div>
        </>
    );
}