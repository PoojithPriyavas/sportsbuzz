'use client';

import { useEffect, useState } from 'react';
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
            {/* League header skeleton */}
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

            {/* Teams and scores skeleton */}
            <div className={styles.matchContent}>
                <div className={styles.teamsContainer}>
                    {/* Home team skeleton */}
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

                    {/* Score section skeleton */}
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

                    {/* Away team skeleton */}
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

            {/* Match info skeleton */}
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
    const { stages, language, translateText, fetchFootballDetails, fetchFootBallLineUp } = useGlobalData();
    const [selectedLeague, setSelectedLeague] = useState('All');
    const [translatedStages, setTranslatedStages] = useState([]);
    const [dateLabels, setDateLabels] = useState({ today: 'Today', tomorrow: 'Tomorrow' });
    const [isTranslating, setIsTranslating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    // Use the dynamic router instead of regular router
    const { pushDynamic, buildPath, pathPrefix } = useDynamicRouter();

    // Keep track of what's been translated
    const [translationProgress, setTranslationProgress] = useState({});

    // ✅ Updated handleMatchClick to use dynamic routing
    const handleMatchClick = async (eid) => {
        await Promise.all([
            fetchFootballDetails(eid),
            fetchFootBallLineUp(eid)
        ]);
        
        // Use pushDynamic instead of router.push
        await pushDynamic(`/football-match-details/${eid}`);
    };

    useEffect(() => {
        const translateStageData = async () => {
            if (!stages?.Stages) {
                setIsLoading(true);
                return;
            }

            setIsLoading(false);
            setIsTranslating(true);

            // First translate just the date labels for immediate display
            const [today, tomorrow] = await Promise.all([
                translateText('Today', 'en', language),
                translateText('Tomorrow', 'en', language),
            ]);
            setDateLabels({ today, tomorrow });

            // Then process stages incrementally
            for (const stage of stages.Stages) {
                const stageKey = `${stage.Sid}_${stage.Cid}`;

                // Skip if already translated
                if (translationProgress[stageKey]) continue;

                const translatedLeague = await translateText(stage.Cnm || '', 'en', language);
                const translatedSubLeague = stage.Snm
                    ? await translateText(stage.Snm, 'en', language)
                    : '';

                // Update with just this stage's league info first
                setTranslatedStages(prev => {
                    const existingIndex = prev.findIndex(s => s.Sid === stage.Sid);
                    if (existingIndex >= 0) {
                        const updated = [...prev];
                        updated[existingIndex] = {
                            ...updated[existingIndex],
                            translatedLeague,
                            translatedSubLeague
                        };
                        return updated;
                    }
                    return [
                        ...prev,
                        {
                            ...stage,
                            translatedLeague,
                            translatedSubLeague,
                            translatedEvents: [] // Events will be added later
                        }
                    ];
                });

                // Then translate events one by one
                const translatedEvents = [];
                for (const event of stage.Events || []) {
                    const team1 = event.T1?.[0];
                    const team2 = event.T2?.[0];

                    const [translatedTeam1, translatedTeam2, translatedStatus] = await Promise.all([
                        team1?.Nm ? translateText(team1.Nm, 'en', language) : '',
                        team2?.Nm ? translateText(team2.Nm, 'en', language) : '',
                        event.Eps ? translateText(event.Eps, 'en', language) : ''
                    ]);

                    translatedEvents.push({
                        ...event,
                        translatedTeam1,
                        translatedTeam2,
                        translatedStatus,
                    });

                    // Update with newly translated event
                    setTranslatedStages(prev => prev.map(s =>
                        s.Sid === stage.Sid
                            ? { ...s, translatedEvents: [...translatedEvents] }
                            : s
                    ));
                }

                // Mark this stage as fully translated
                setTranslationProgress(prev => ({
                    ...prev,
                    [stageKey]: true
                }));
            }

            setIsTranslating(false);
        };

        translateStageData();
    }, [stages, language]);

    // Recreate filtered league lists
    const allLeagues = translatedStages.map(stage => stage.translatedLeague).filter(Boolean);
    const uniqueLeagues = Array.from(new Set(allLeagues));
    const topLeagues = uniqueLeagues.slice(0, 5);
    const otherLeagues = uniqueLeagues.slice(5);

    // Show skeleton loader when loading or no data
    if (isLoading || !stages?.Stages) {
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

    return (
        <>
            {/* Filter Bar */}
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

            {/* Match Cards */}
            <div className={styles.cardsContainer}>
                {translatedStages
                    .filter(stage => selectedLeague === 'All' || stage.translatedLeague === selectedLeague)
                    .map((stage, stageIdx) =>
                        stage.translatedEvents.map((event, eventIdx) => {
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
                                    key={`${stageIdx}-${eventIdx}`}
                                    className={styles.matchCard}
                                    onClick={() => handleMatchClick(event.Eid)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {/* League info */}
                                    <div className={styles.leagueHeader}>
                                        <div className={styles.leagueName}>{stage.translatedLeague}</div>
                                        <div className={styles.subLeague}>Group • {stage.translatedSubLeague}</div>
                                    </div>

                                    {/* Teams and scores */}
                                    <div className={styles.matchContent}>
                                        <div className={styles.teamsContainer}>
                                            <div className={styles.team}>
                                                <div className={styles.teamLogo}>
                                                    <img
                                                        src={`https://lsm-static-prod.livescore.com/medium/${team1?.Img}`}
                                                        alt={event.translatedTeam1}
                                                        className={styles.logoImage}
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
                                                    />
                                                </div>
                                                <div className={styles.teamName}>{event.translatedTeam2}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Match time & status */}
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