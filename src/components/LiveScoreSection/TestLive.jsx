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

                {/* Match time skeleton */}
                <div className={styles.matchTime}>
                    <div className={styles.skeleton} style={{
                        width: '100px',
                        height: '12px',
                        backgroundColor: '#e0e0e0',
                        margin: '0 auto'
                    }}></div>
                </div>
            </div>
        </div>
    );
}

function SkeletonFilterBar() {
    return (
        <div className={styles.leagueSelector}>
            <span className={styles.selectedLeague}>
                <div className={styles.skeleton} style={{
                    width: '40px',
                    height: '16px',
                    backgroundColor: '#e0e0e0'
                }}></div>
            </span>
            {Array.from({ length: 4 }).map((_, index) => (
                <span key={index} className={styles.leagueItem}>
                    <div className={styles.skeleton} style={{
                        width: index % 2 === 0 ? '60px' : '80px',
                        height: '16px',
                        backgroundColor: '#e0e0e0'
                    }}></div>
                </span>
            ))}
            <div className={styles.skeleton} style={{
                width: '120px',
                height: '30px',
                backgroundColor: '#e0e0e0',
                borderRadius: '4px'
            }}></div>
        </div>
    );
}

export default function TestLive() {
    const { stages, language, translateText, fetchFootballDetails, fetchFootBallLineUp, setMatchTeams } = useGlobalData();
    const [selectedLeague, setSelectedLeague] = useState('All');
    const [translatedStages, setTranslatedStages] = useState([]);
    const [dateLabels, setDateLabels] = useState({ today: 'Today', tomorrow: 'Tomorrow' });
    const [isTranslating, setIsTranslating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Use the dynamic router instead of regular router
    const { pushDynamic, buildPath, pathPrefix } = useDynamicRouter();

    // Keep track of what's been translated
    const [translationProgress, setTranslationProgress] = useState({});

    // ✅ Updated handleMatchClick to pass team names to the global context
    const handleMatchClick = async (eid, team1Name, team2Name) => {
        // Set the team names in the global context before navigation
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

            // First translate just the date labels for immediate display using batch translation
            const dateTextsToTranslate = [
                { text: 'Today', to: language },
                { text: 'Tomorrow', to: language },
                { text: 'All', to: language },
                { text: 'Other Leagues', to: language }
            ];
            
            const dateTranslations = await translateText(dateTextsToTranslate, 'en', language);
            
            setDateLabels({ 
                today: dateTranslations[0], 
                tomorrow: dateTranslations[1],
                all: dateTranslations[2],
                otherLeagues: dateTranslations[3]
            });

            // Collect all texts that need translation
            const allTextsToTranslate = [];
            const textMappings = new Map(); // To track which index corresponds to which stage/event

            // Add league and subleague names
            stages.Stages.forEach((stage, stageIndex) => {
                const stageKey = `${stage.Sid}_${stage.Cid}`;
                
                // Skip if already translated
                if (translationProgress[stageKey]) return;
                
                // Add league name
                if (stage.Cnm) {
                    const leagueIndex = allTextsToTranslate.length;
                    allTextsToTranslate.push({ text: stage.Cnm, to: language });
                    textMappings.set(`league_${stageKey}`, leagueIndex);
                }
                
                // Add subleague name
                if (stage.Snm) {
                    const subleagueIndex = allTextsToTranslate.length;
                    allTextsToTranslate.push({ text: stage.Snm, to: language });
                    textMappings.set(`subleague_${stageKey}`, subleagueIndex);
                }
                
                // Add team names and statuses for each event
                (stage.Events || []).forEach((event, eventIndex) => {
                    const eventKey = `${stageKey}_${event.Eid}`;
                    const team1 = event.T1?.[0];
                    const team2 = event.T2?.[0];
                    
                    if (team1?.Nm) {
                        const team1Index = allTextsToTranslate.length;
                        allTextsToTranslate.push({ text: team1.Nm, to: language });
                        textMappings.set(`team1_${eventKey}`, team1Index);
                    }
                    
                    if (team2?.Nm) {
                        const team2Index = allTextsToTranslate.length;
                        allTextsToTranslate.push({ text: team2.Nm, to: language });
                        textMappings.set(`team2_${eventKey}`, team2Index);
                    }
                    
                    if (event.Eps) {
                        const statusIndex = allTextsToTranslate.length;
                        allTextsToTranslate.push({ text: event.Eps, to: language });
                        textMappings.set(`status_${eventKey}`, statusIndex);
                    }
                });
            });
            
            // If there's nothing to translate, we're done
            if (allTextsToTranslate.length === 0) {
                setIsTranslating(false);
                return;
            }
            
            // Translate everything in one batch
            const allTranslations = await translateText(allTextsToTranslate, 'en', language);
            
            // Process the translations and update the state
            const newTranslatedStages = [];
            
            stages.Stages.forEach((stage) => {
                const stageKey = `${stage.Sid}_${stage.Cid}`;
                
                // Skip if already translated
                if (translationProgress[stageKey]) {
                    const existingStage = translatedStages.find(s => s.Sid === stage.Sid);
                    if (existingStage) {
                        newTranslatedStages.push(existingStage);
                    }
                    return;
                }
                
                // Get translated league and subleague names
                const translatedLeague = textMappings.has(`league_${stageKey}`) 
                    ? allTranslations[textMappings.get(`league_${stageKey}`)] 
                    : stage.Cnm || '';
                    
                const translatedSubLeague = textMappings.has(`subleague_${stageKey}`) 
                    ? allTranslations[textMappings.get(`subleague_${stageKey}`)] 
                    : stage.Snm || '';
                
                // Process events
                const translatedEvents = (stage.Events || []).map(event => {
                    const eventKey = `${stageKey}_${event.Eid}`;
                    const team1 = event.T1?.[0];
                    const team2 = event.T2?.[0];
                    
                    const translatedTeam1 = textMappings.has(`team1_${eventKey}`) 
                        ? allTranslations[textMappings.get(`team1_${eventKey}`)] 
                        : team1?.Nm || '';
                        
                    const translatedTeam2 = textMappings.has(`team2_${eventKey}`) 
                        ? allTranslations[textMappings.get(`team2_${eventKey}`)] 
                        : team2?.Nm || '';
                        
                    const translatedStatus = textMappings.has(`status_${eventKey}`) 
                        ? allTranslations[textMappings.get(`status_${eventKey}`)] 
                        : event.Eps || '';
                    
                    return {
                        ...event,
                        translatedTeam1,
                        translatedTeam2,
                        translatedStatus,
                    };
                });
                
                // Add the translated stage
                newTranslatedStages.push({
                    ...stage,
                    translatedLeague,
                    translatedSubLeague,
                    translatedEvents
                });
                
                // Mark this stage as fully translated
                setTranslationProgress(prev => ({
                    ...prev,
                    [stageKey]: true
                }));
            });
            
            // Update the state with all translated stages
            setTranslatedStages(prev => {
                // Keep any stages that were already translated but not in the new batch
                const existingStages = prev.filter(prevStage => 
                    !newTranslatedStages.some(newStage => newStage.Sid === prevStage.Sid)
                );
                return [...existingStages, ...newTranslatedStages];
            });
            
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
                    {dateLabels.all || 'All'}
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
                        <option value="All">{dateLabels.otherLeagues || 'Other Leagues'}</option>
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
                                    onClick={() => handleMatchClick(event.Eid, event.translatedTeam1, event.translatedTeam2)}
                                >
                                    <div className={styles.leagueHeader}>
                                        <div className={styles.leagueName}>{stage.translatedLeague}</div>
                                        {stage.translatedSubLeague && (
                                            <div className={styles.subLeague}>{stage.translatedSubLeague}</div>
                                        )}
                                    </div>

                                    <div className={styles.matchContent}>
                                        <div className={styles.teamsContainer}>
                                            <div className={styles.team}>
                                                <div className={styles.teamLogo}>
                                                    {team1?.Abr || team1?.Nm?.substring(0, 3).toUpperCase()}
                                                </div>
                                                <div className={styles.teamName}>{event.translatedTeam1}</div>
                                            </div>

                                            <div className={styles.scoreSection}>
                                                <div className={styles.score}>
                                                    {event.Tr1 !== undefined ? event.Tr1 : '-'}
                                                </div>
                                                <div className={styles.vs}>VS</div>
                                                <div className={styles.score}>
                                                    {event.Tr2 !== undefined ? event.Tr2 : '-'}
                                                </div>
                                            </div>

                                            <div className={styles.team}>
                                                <div className={styles.teamLogo}>
                                                    {team2?.Abr || team2?.Nm?.substring(0, 3).toUpperCase()}
                                                </div>
                                                <div className={styles.teamName}>{event.translatedTeam2}</div>
                                            </div>
                                        </div>

                                        <div className={styles.matchTime}>
                                            <span className={styles.matchStatus} style={matchStatusStyle}>
                                                {status}
                                            </span>
                                            <span className={styles.dateTime}>
                                                {formatDate(event.Esd, dateLabels)}
                                            </span>
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