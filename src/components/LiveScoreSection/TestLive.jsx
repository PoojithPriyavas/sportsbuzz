'use client';

import { useEffect, useState, useRef } from 'react';
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

    const { stages, language, debugTranslateText, fetchFootballDetails, fetchFootBallLineUp, setMatchTeams } = useGlobalData();

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

    // Global cache for ALL translations across all leagues
    const translationCache = useRef(new Map());

    // Track which leagues have been translated for each language
    const translatedLeagues = useRef(new Map()); // Map<language, Set<leagueName>>

    const { pushDynamic } = useDynamicRouter();

    const handleMatchClick = async (eid, team1Name, team2Name) => {
        try {
            console.log("enters the match click code", { eid, team1Name, team2Name });

            if (setMatchTeams) {
                setMatchTeams({ team1: team1Name, team2: team2Name });
            }

            const detailsPromise = typeof fetchFootballDetails === 'function' ? fetchFootballDetails(eid) : Promise.resolve();
            const lineupPromise = typeof fetchFootBallLineUp === 'function' ? fetchFootBallLineUp(eid) : Promise.resolve();

            // Navigate immediately; don’t block on data fetching
            await pushDynamic(`/football-match-details/${eid}`);

            // Let the data calls complete in the background
            await Promise.allSettled([detailsPromise, lineupPromise]);
        } catch (error) {
            console.error('handleMatchClick error:', error);
            // Try to navigate anyway as a fallback
            try {
                await pushDynamic(`/football-match-details/${eid}`);
            } catch (navError) {
                console.error('Navigation fallback failed:', navError);
            }
        }
    };

    // ✅ USEEFFECT #1: Initialize with original data (runs once on mount)
    useEffect(() => {
        console.log("🔵 useEffect #1: Initialize stages");

        if (!stages?.Stages) {
            setIsLoading(true);
            return;
        }

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

    // ✅ USEEFFECT #2: Translate static texts when language changes
    useEffect(() => {
        console.log("🟢 useEffect #2: Language change - translate static texts", language);

        const translateStaticTexts = async () => {
            if (!initialLoadComplete.current) return;

            const languageChanged = previousLanguage.current !== language;
            if (!languageChanged) return;

            previousLanguage.current = language;

            try {
                // ✅ Helper function to translate with caching
                const translateWithCache = async (text, fromLang, toLang) => {
                    if (!text) return '';

                    const cacheKey = `${text}_${fromLang}_${toLang}`;

                    if (translationCache.current.has(cacheKey)) {
                        return translationCache.current.get(cacheKey);
                    }

                    const translated = await debugTranslateText(text, fromLang, toLang);
                    translationCache.current.set(cacheKey, translated);
                    return translated;
                };

                // Only translate static texts (Today, Tomorrow, Group)
                const [today, tomorrow, group] = await Promise.all([
                    translateWithCache('Today', 'en', language),
                    translateWithCache('Tomorrow', 'en', language),
                    translateWithCache('Group', 'en', language)
                ]);

                setDateLabels({ today, tomorrow });
                setStaticTexts({ group });

                // Clear translated leagues tracker for new language
                translatedLeagues.current.set(language, new Set());

            } catch (error) {
                console.error('Static text translation error:', error);
            }
        };

        translateStaticTexts();
    }, [language]);

    // ✅ USEEFFECT #3: Translate selected league's data only
    useEffect(() => {
        console.log("🟡 useEffect #3: Translate selected league", selectedLeague);

        const translateSelectedLeague = async () => {
            if (!initialLoadComplete.current || !selectedLeague || selectedLeague === 'All') return;

            // Check if this league has already been translated for current language
            const currentLanguageLeagues = translatedLeagues.current.get(language) || new Set();
            if (currentLanguageLeagues.has(selectedLeague)) {
                console.log('🟡 League already translated, using cache:', selectedLeague);
                return;
            }

            setIsTranslating(true);

            try {
                // ✅ Helper function to translate with caching
                const translateWithCache = async (text, fromLang, toLang) => {
                    if (!text) return '';

                    const cacheKey = `${text}_${fromLang}_${toLang}`;

                    if (translationCache.current.has(cacheKey)) {
                        return translationCache.current.get(cacheKey);
                    }

                    const translated = await debugTranslateText(text, fromLang, toLang);
                    translationCache.current.set(cacheKey, translated);
                    return translated;
                };

                // Find stages for selected league (using ORIGINAL league name)
                const leagueStages = stages.Stages.filter(stage => stage.Cnm === selectedLeague);

                if (leagueStages.length === 0) return;

                // Collect unique texts from selected league only
                const uniqueLeagues = new Set();
                const uniqueSubLeagues = new Set();
                const uniqueTeams = new Set();
                const uniqueStatuses = new Set();

                leagueStages.forEach(stage => {
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

                console.log('🟡 Translating selected league:', {
                    league: selectedLeague,
                    subLeagues: uniqueSubLeagues.size,
                    teams: uniqueTeams.size,
                    statuses: uniqueStatuses.size
                });

                // Translate all unique texts for this league
                await Promise.all([
                    ...Array.from(uniqueLeagues).map(text => translateWithCache(text, 'en', language)),
                    ...Array.from(uniqueSubLeagues).map(text => translateWithCache(text, 'en', language)),
                    ...Array.from(uniqueTeams).map(text => translateWithCache(text, 'en', language)),
                    ...Array.from(uniqueStatuses).map(text => translateWithCache(text, 'en', language))
                ]);

                // Update only the translated stages for this league
                setTranslatedStages(prevStages => {
                    return prevStages.map(stage => {
                        // Only update stages from the selected league
                        if (stage.Cnm !== selectedLeague) {
                            return stage;
                        }

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
                });

                // Mark this league as translated for current language
                currentLanguageLeagues.add(selectedLeague);
                translatedLeagues.current.set(language, currentLanguageLeagues);

                console.log('🟡 League translation complete:', selectedLeague);

            } catch (error) {
                console.error('League translation error:', error);
            } finally {
                setIsTranslating(false);
            }
        };

        translateSelectedLeague();
    }, [selectedLeague, language, stages]);

    // ✅ USEEFFECT #4: Manage selected league
    useEffect(() => {
        console.log("🟣 useEffect #4: Manage selected league");

        if (!Array.isArray(translatedStages) || translatedStages.length === 0) return;

        // Get all unique leagues (use ORIGINAL names for consistency)
        const leagues = Array.from(
            new Set(
                stages.Stages.map(stage => stage.Cnm).filter(Boolean)
            )
        );

        const hasEvents = (league) =>
            stages.Stages.some(
                s => s.Cnm === league && Array.isArray(s.Events) && s.Events.length > 0
            );

        const getFirstLeagueWithEvents = () => {
            const stageWithEvents = stages.Stages.find(
                s => Array.isArray(s.Events) && s.Events.length > 0
            );
            return stageWithEvents?.Cnm || 'All';
        };

        // Restore from localStorage
        const saved = typeof window !== 'undefined'
            ? localStorage.getItem('footballSelectedLeague')
            : null;

        if (saved && leagues.includes(saved) && (saved === 'All' || hasEvents(saved))) {
            if (selectedLeague !== saved) {
                console.log('🟣 Restoring saved league:', saved);
                setSelectedLeague(saved);
            }
            return;
        }

        // Fix invalid selection
        if (selectedLeague && selectedLeague !== 'All' && !leagues.includes(selectedLeague)) {
            const newLeague = getFirstLeagueWithEvents();
            console.log('🟣 Invalid league selection, switching to:', newLeague);
            setSelectedLeague(newLeague);
            return;
        }

        // Auto-select if nothing is selected
        if (!selectedLeague) {
            const newLeague = getFirstLeagueWithEvents();
            console.log('🟣 Auto-selecting first league:', newLeague);
            setSelectedLeague(newLeague);
        }
    }, [translatedStages, stages]);

    // ✅ USEEFFECT #5: Persist selected league to localStorage
    useEffect(() => {
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

    // Get leagues using ORIGINAL names for consistency
    const allLeagues = stages.Stages.map(stage => stage.Cnm).filter(Boolean);
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
                    .filter(stage => selectedLeague === 'All' || stage.Cnm === selectedLeague)
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
                                                        // alt={event.translatedTeam1}
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
                                                        // alt={event.translatedTeam2}
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