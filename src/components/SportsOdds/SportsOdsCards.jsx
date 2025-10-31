// components/FootballOddsCard.jsx - OPTIMIZED VERSION
import React from 'react';
import styles from './SportsOds.module.css';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useGlobalData } from '../Context/ApiContext';
import bettingOddsTranslations from './bettingOdds.json';

// Cache configuration
const CACHE_CONFIG = {
    DURATION: 5 * 60 * 1000,
    TRANSLATION_DURATION: 24 * 60 * 60 * 1000,
    KEYS: {
        TOURNAMENT: 'betting_selectedTournament',
        CARDS: 'betting_transformedCards',
        TIMESTAMP: 'betting_cacheTimestamp',
        EVENT_DETAILS: 'betting_eventDetails',
        TRANSLATIONS: 'betting_translations_'
    }
};

// Cache utility functions
const CacheManager = {
    set: (key, value) => {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('Cache set failed:', e);
        }
    },
    
    get: (key) => {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.warn('Cache get failed:', e);
            return null;
        }
    },
    
    remove: (key) => {
        try {
            sessionStorage.removeItem(key);
        } catch (e) {
            console.warn('Cache remove failed:', e);
        }
    },
    
    isValid: (timestamp, customDuration) => {
        if (!timestamp) return false;
        const duration = customDuration || CACHE_CONFIG.DURATION;
        return Date.now() - timestamp < duration;
    },
    
    clear: () => {
        Object.values(CACHE_CONFIG.KEYS).forEach(key => {
            CacheManager.remove(key);
        });
    }
};

// Translation Manager
const TranslationManager = {
    defaultTexts: {
        bettingOdds: 'Betting Odds',
        allTournaments: 'All Tournaments',
        loading: 'Loading events...',
        loadingSubtext: 'Please wait while we fetch the latest betting odds',
        noEvents: 'No events available',
        matchWinner: 'Match Winner',
        live: 'Live',
        vs: 'VS',
        enterStake: 'Enter stake amount',
        placeBet: 'Place Bet',
        potentialWinnings: 'Potential Winnings',
        selectOdds: 'Select your odds and enter stake to place your bet',
        betSuccess: 'Play responsibly at your own risk',
        team1Win: 'Team 1 Win',
        draw: 'Draw',
        team2Win: 'Team 2 Win',
        potentialProfit: 'Potential Profit'
    },

    getCacheKey: (language) => {
        return `${CACHE_CONFIG.KEYS.TRANSLATIONS}${language}`;
    },

    loadFromCache: (language) => {
        const cacheKey = TranslationManager.getCacheKey(language);
        const cached = CacheManager.get(cacheKey);
        
        if (cached && CacheManager.isValid(cached.timestamp, CACHE_CONFIG.TRANSLATION_DURATION)) {
            return cached.translations;
        }
        
        return null;
    },

    saveToCache: (language, translations) => {
        const cacheKey = TranslationManager.getCacheKey(language);
        CacheManager.set(cacheKey, {
            translations,
            timestamp: Date.now()
        });
    },

    getFromJSON: (language) => {
        const translationEntry = bettingOddsTranslations.find(
            entry => entry.hreflang === language
        );
        
        if (translationEntry) {
            return translationEntry.translatedText;
        }
        
        return null;
    },

    translate: async (language, translateTextFn) => {
        if (language === 'en') {
            return TranslationManager.defaultTexts;
        }

        const cached = TranslationManager.loadFromCache(language);
        if (cached) {
            return cached;
        }

        const jsonTranslations = TranslationManager.getFromJSON(language);
        if (jsonTranslations) {
            TranslationManager.saveToCache(language, jsonTranslations);
            return jsonTranslations;
        }

        try {
            const translationPromises = Object.entries(TranslationManager.defaultTexts).map(
                async ([key, text]) => {
                    const translated = await translateTextFn(text, 'en', language);
                    return [key, translated];
                }
            );

            const translatedEntries = await Promise.all(translationPromises);
            const translations = Object.fromEntries(translatedEntries);

            TranslationManager.saveToCache(language, translations);

            return translations;
        } catch (error) {
            console.error('Translation failed, using defaults:', error);
            return TranslationManager.defaultTexts;
        }
    }
};

// Skeleton Loader Component
const SkeletonLoader = ({ styles }) => {
    return (
        <div className={styles.skeletonContainer}>
            {[1, 2].map((index) => (
                <div key={index} className={styles.skeletonCard}>
                    <div className={styles.skeletonHeader}>
                        <div className={styles.skeletonHeaderContent}>
                            <div className={styles.skeletonPoweredBy}>
                                <div className={styles.skeletonLogoCircle}></div>
                                <div className={styles.skeletonPoweredText}></div>
                            </div>
                            <div className={styles.skeletonDate}></div>
                        </div>
                    </div>
                    <div className={styles.skeletonBody}>
                        <div className={styles.skeletonLeagueRow}>
                            <div className={styles.skeletonLeagueTitle}></div>
                        </div>
                        <div className={styles.skeletonTeamsRow}>
                            <div className={styles.skeletonTeamLeft}>
                                <div className={styles.skeletonTeamCircle}></div>
                                <div className={styles.skeletonTeamName}></div>
                            </div>
                            <div className={styles.skeletonTeamRight}>
                                <div className={styles.skeletonTeamName}></div>
                                <div className={styles.skeletonTeamCircle}></div>
                            </div>
                        </div>
                        <div className={styles.skeletonOddsRow}>
                            <div className={styles.skeletonOddButton}></div>
                            <div className={styles.skeletonOddButton}></div>
                            <div className={styles.skeletonOddButton}></div>
                        </div>
                    </div>
                    <div className={styles.skeletonFooter}>
                        <div className={styles.skeletonFooterText}></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Loading Message Component
const LoadingMessage = ({ message, subMessage, styles }) => {
    return (
        <div className={styles.loadingMessage}>
            <div className={styles.loadingSpinner}></div>
            <div className={styles.loadingText}>{message}</div>
            <div className={styles.loadingSubtext}>{subMessage}</div>
        </div>
    );
};

// Market data fetch with caching
async function fetchMarketData(token, sportEventId) {
    const cacheKey = `market_${sportEventId}`;
    const cached = CacheManager.get(cacheKey);
    
    if (cached && CacheManager.isValid(cached.timestamp)) {
        return cached.data;
    }

    const ref = 320;
    try {
        const res = await fetch(`/api/get-onex-odds?ref=${ref}&gameId=${sportEventId}&token=${token}`);
        const data = res.ok ? await res.json() : null;
        
        if (data) {
            CacheManager.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
        }
        
        return data;
    } catch (err) {
        console.error('fetchMarketData error:', err);
        return null;
    }
}

// Transform event to card format
function transformEventToCard(event, marketData) {
    const safeEvent = event || {};
    const isLive = Boolean(safeEvent.waitingLive) || Number(safeEvent.period) > 0;

    const startDateSec = Number(safeEvent.startDate);
    const startDate = Number.isFinite(startDateSec) ? new Date(startDateSec * 1000) : null;

    const defaultOdds = [
        { label: 'W1', value: 2.1 },
        { label: 'X', value: 3.2 },
        { label: 'W2', value: 2.8 }
    ];

    let odds = defaultOdds;

    if (marketData?.items?.length) {
        const desired = ['W1', 'X', 'W2'];
        odds = marketData.items
            .filter(item => desired.includes(item?.displayMulti?.en))
            .map(item => ({
                label: item?.displayMulti?.en ?? '—',
                value: Number(item?.oddsMarket) || null
            }))
            .filter(o => o.label && o.value);
        if (odds.length === 0) {
            odds = defaultOdds;
        }
    }

    const team1Name = safeEvent.opponent1NameLocalization || 'Team 1';
    const team2Name = safeEvent.opponent2NameLocalization || 'Team 2';

    const team1Logo = Array.isArray(safeEvent.imageOpponent1) ? safeEvent.imageOpponent1[0] : null;
    const team2Logo = Array.isArray(safeEvent.imageOpponent2) ? safeEvent.imageOpponent2[0] : null;

    return {
        id: safeEvent.sportEventId || safeEvent.id || Math.random().toString(36).slice(2),
        logo: '🏆',
        provider: '22bet',
        isLive,
        matchType: safeEvent.tournamentNameLocalization || 'Tournament',
        matchInfo: startDate ? `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()}` : 'Time TBD',
        team1: {
            code: team1Name?.slice(0, 3)?.toUpperCase() || 'T1',
            name: team1Name,
            logo: team1Logo
        },
        team2: {
            code: team2Name?.slice(0, 3)?.toUpperCase() || 'T2',
            name: team2Name,
            logo: team2Logo
        },
        oddsTitle: 'Match Winner',
        odds,
        link: safeEvent.link || null
    };
}

export default function BettingCards() {
    const scrollRef = useRef(null);
    const dropdownRef = useRef(null);
    const [paused, setPaused] = useState(false);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [transformedCards, setTransformedCards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastFetchTime, setLastFetchTime] = useState(0);
    const [translatedText, setTranslatedText] = useState(TranslationManager.defaultTexts);
    console.log(transformedCards, "transformedCards")
    // 🔥 FIX #1: Use ref to track initialization instead of state
    const isInitialized = useRef(false);
    const processingRef = useRef(false); // Prevent concurrent processing
    const hasFetchedRef = useRef(false); // Track if we've made initial API call
    const loadingTimeoutRef = useRef(null); // Timeout for loading state

    const { oneXTournament, oneXAccessToken, fetchOneXEventsIdData, oneXEventDetails, translateText, language } = useGlobalData();

    // Memoize tournaments list
    const allTournaments = useMemo(() => {
        if (!oneXTournament?.items) return [];
        return oneXTournament.items.map(item => ({
            id: item.tournamentId,
            name: item.tournamentNameLocalization,
            image: item.tournamentImage
        }));
    }, [oneXTournament]);

    // 🔥 FIX #2: Stabilize getTransformedCards with proper dependencies
    const getTransformedCards = useCallback(async (events, token) => {
        if (!Array.isArray(events) || !token) return [];

        const normalizeEvent = (detail) => {
            // Try common shapes first, then fallback to raw detail
            return detail?.items?.[0] || detail?.data?.items?.[0] || detail?.event || detail;
        };

        const cards = await Promise.all(
            events.map(async (detail) => {
                try {
                    const event = normalizeEvent(detail);
                    if (!event || !event.sportEventId) {
                        return null;
                    }
                    const marketData = await fetchMarketData(token, event.sportEventId).catch(() => null);
                    return transformEventToCard(event, marketData);
                } catch (e) {
                    console.warn('Skipping bad event detail:', e);
                    return null;
                }
            })
        );

        return cards.filter(Boolean);
    }, []); // No dependencies needed since params are passed directly

    // 🔥 FIX #3: Optimize translation loading
    useEffect(() => {
        let isMounted = true;

        const loadTranslations = async () => {
            try {
                const translations = await TranslationManager.translate(language, translateText);
                
                if (isMounted) {
                    setTranslatedText(translations);
                }
            } catch (error) {
                console.error('Failed to load translations:', error);
                if (isMounted) {
                    setTranslatedText(TranslationManager.defaultTexts);
                }
            }
        };

        loadTranslations();

        return () => {
            isMounted = false;
        };
    }, [language, translateText]);

    // 🔥 FIX #4: Single initialization effect with proper cache handling
    useEffect(() => {
        // Don't run if already initialized OR missing required data
        if (isInitialized.current || !oneXAccessToken || allTournaments.length === 0) {
            return;
        }

        const initializeData = async () => {
            console.log('🔄 Initializing betting data...');
            
            // Check cache first
            const cachedTournament = CacheManager.get(CACHE_CONFIG.KEYS.TOURNAMENT);
            const cachedCards = CacheManager.get(CACHE_CONFIG.KEYS.CARDS);
            const cachedTimestamp = CacheManager.get(CACHE_CONFIG.KEYS.TIMESTAMP);

            // If cache is valid AND has data, use it
            if (CacheManager.isValid(cachedTimestamp) && cachedCards && cachedCards.length > 0) {
                console.log('✓ Loading betting data from cache');
                setSelectedTournament(cachedTournament || allTournaments[0].id);
                setTransformedCards(cachedCards);
                setIsLoading(false);
                setLastFetchTime(cachedTimestamp);
                isInitialized.current = true;
                hasFetchedRef.current = true;
                return;
            }

            // No valid cache - fetch fresh data
            console.log('⟳ Cache invalid/empty - fetching fresh betting data');
            const firstTournamentId = allTournaments[0].id;
            setSelectedTournament(firstTournamentId);
            setIsLoading(true);
            
            // Set a timeout to prevent infinite loading
            loadingTimeoutRef.current = setTimeout(() => {
                console.warn('⚠️ Loading timeout - no data received after 15 seconds');
                setIsLoading(false);
                hasFetchedRef.current = true;
            }, 15000); // 15 second timeout
            
            try {
                await fetchOneXEventsIdData(oneXAccessToken, firstTournamentId);
                hasFetchedRef.current = true;
            } catch (error) {
                console.error('Failed to fetch events:', error);
                setIsLoading(false);
            }
            
            isInitialized.current = true;
        };

        initializeData();

        // Cleanup timeout on unmount
        return () => {
            if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
            }
        };
    }, [allTournaments, oneXAccessToken, fetchOneXEventsIdData]);

    // 🔥 FIX #5: Process events only when needed with debouncing
    useEffect(() => {
        console.log('📊 Event details changed:', {
            hasDetails: !!oneXEventDetails,
            detailsLength: oneXEventDetails?.length || 0,
            isProcessing: processingRef.current,
            hasFetched: hasFetchedRef.current
        });

        // If fetched empty, try cache fallback before showing "no events"
        if ((!oneXEventDetails || oneXEventDetails.length === 0) && hasFetchedRef.current) {
            const cachedEventDetails = CacheManager.get(CACHE_CONFIG.KEYS.EVENT_DETAILS);
            if (Array.isArray(cachedEventDetails) && cachedEventDetails.length > 0) {
                console.log('🔁 Using cached event details fallback');
                (async () => {
                    setIsLoading(true);
                    try {
                        const cards = await getTransformedCards(cachedEventDetails, oneXAccessToken);
                        const timestamp = Date.now();
                        setTransformedCards(cards);
                        setLastFetchTime(timestamp);
                        CacheManager.set(CACHE_CONFIG.KEYS.CARDS, cards);
                        CacheManager.set(CACHE_CONFIG.KEYS.TIMESTAMP, timestamp);
                    } catch (err) {
                        console.error('Cached events processing failed:', err);
                        setTransformedCards([]);
                    } finally {
                        setIsLoading(false);
                    }
                })();
                return;
            }

            console.log('⚠️ No event details available after fetch');
            setTransformedCards([]);
            setIsLoading(false);

            if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
                loadingTimeoutRef.current = null;
            }
            return;
        }

        // If nothing fetched yet, let the loading continue
        if (!oneXEventDetails || oneXEventDetails.length === 0) {
            // If nothing fetched yet, let the loading continue
            return;
        }

        if (processingRef.current) {
            console.log('⏸️ Already processing, skipping...');
            return;
        }

        if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
            loadingTimeoutRef.current = null;
        }

        processingRef.current = true;

        const processEvents = async () => {
            console.log('⟳ Processing event details');
            setIsLoading(true);

            try {
                const cards = await getTransformedCards(oneXEventDetails, oneXAccessToken);
                const timestamp = Date.now();

                console.log(`✓ Processed ${cards.length} cards`);

                setTransformedCards(cards);
                setLastFetchTime(timestamp);

                CacheManager.set(CACHE_CONFIG.KEYS.CARDS, cards);
                CacheManager.set(CACHE_CONFIG.KEYS.TOURNAMENT, selectedTournament);
                CacheManager.set(CACHE_CONFIG.KEYS.TIMESTAMP, timestamp);
                CacheManager.set(CACHE_CONFIG.KEYS.EVENT_DETAILS, oneXEventDetails);
            } catch (error) {
                console.error('Error processing events:', error);
            } finally {
                setIsLoading(false);
                processingRef.current = false;
            }
        };

        processEvents();
    }, [oneXEventDetails, oneXAccessToken, getTransformedCards, selectedTournament]);

    // 🔥 FIX #6: Debounced tournament change handler
    const handleTournamentChange = useCallback((tournamentId) => {
        const now = Date.now();
        const MIN_INTERVAL = 1000;

        if (now - lastFetchTime < MIN_INTERVAL) {
            console.log('⏸ Debouncing tournament change');
            return;
        }

        console.log('⟳ Changing tournament to:', tournamentId);
        
        // Clear relevant cache
        CacheManager.remove(CACHE_CONFIG.KEYS.CARDS);
        CacheManager.remove(CACHE_CONFIG.KEYS.EVENT_DETAILS);
        
        setIsLoading(true);
        setSelectedTournament(tournamentId);
        setIsDropdownOpen(false);
        setPaused(true);
        
        fetchOneXEventsIdData(oneXAccessToken, tournamentId);
        
        setTimeout(() => setPaused(false), 2000);
    }, [lastFetchTime, oneXAccessToken, fetchOneXEventsIdData]);

    // Get selected tournament name
    const selectedTournamentName = useMemo(() => {
        if (!selectedTournament || selectedTournament === 'all') {
            return translatedText.allTournaments;
        }
        const selected = allTournaments.find(t => t.id === selectedTournament);
        return selected?.name || translatedText.allTournaments;
    }, [selectedTournament, allTournaments, translatedText.allTournaments]);

    // Auto-scroll effect
    useEffect(() => {
        const container = scrollRef.current;
        if (!container || paused || transformedCards.length === 0 || isLoading) return;

        let scrollAmount = 0;
        const cardWidth = 340;
        const interval = setInterval(() => {
            scrollAmount = (scrollAmount + cardWidth) % container.scrollWidth;
            container.scrollTo({ left: scrollAmount, behavior: 'smooth' });
        }, 4000);

        return () => clearInterval(interval);
    }, [paused, transformedCards, isLoading]);

    // Click outside dropdown handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={styles.bettingContainer}>
            <div className={styles.headerSection}>
                <h2 className={styles.pageTitle}>{translatedText.bettingOdds}</h2>
                <div className={styles.filterContainer}>
                    <div className={styles.customDropdown} ref={dropdownRef}>
                        <div className={styles.dropdownHeader} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                            <div className={styles.selectedOption}>
                                {!selectedTournament || selectedTournament === 'all' ? (
                                    <>
                                        <div className={styles.allTeamsIcon}>🏆</div>
                                        <span>{translatedText.allTournaments}</span>
                                    </>
                                ) : (
                                    <span>{selectedTournamentName}</span>
                                )}
                            </div>
                            <div className={`${styles.dropdownArrow} ${isDropdownOpen ? styles.open : ''}`}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="6,9 12,15 18,9"></polyline>
                                </svg>
                            </div>
                        </div>

                        {isDropdownOpen && (
                            <div className={styles.dropdownOptions}>
                                <div
                                    className={`${styles.dropdownOption} ${selectedTournament === 'all' ? styles.selected : ''}`}
                                    onClick={() => handleTournamentChange('all')}
                                >
                                    <div className={styles.allTeamsIcon}>🏆</div>
                                    <span>{translatedText.allTournaments}</span>
                                </div>
                                {allTournaments.map(t => (
                                    <div
                                        key={t.id}
                                        className={`${styles.dropdownOption} ${selectedTournament === t.id ? styles.selected : ''}`}
                                        onClick={() => handleTournamentChange(t.id)}
                                    >
                                        <span>{t.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.cardsContainer} ref={scrollRef}>
                {isLoading ? (
                    <SkeletonLoader styles={styles} />
                ) : transformedCards.length > 0 ? (
                    transformedCards.slice(0, 4).map((card, idx) => (
                        <SportsOddsCard
                            key={card.id || idx}
                            card={card}
                            styles={styles}
                            translatedText={translatedText}
                            onSelectOdd={() => setPaused(true)}
                            onBetPlaced={() => setTimeout(() => setPaused(false), 5000)}
                        />
                    ))
                ) : (
                    <LoadingMessage
                        message={translatedText.noEvents}
                        subMessage="Try selecting a different tournament"
                        styles={styles}
                    />
                )}
            </div>
        </div>
    );
}

const SportsOddsCard = React.memo(({ card, styles, translatedText, onSelectOdd, onBetPlaced }) => {
    const [selectedOdd, setSelectedOdd] = useState(null);
    const [betAmount, setBetAmount] = useState('');
    const [win, setWin] = useState('0.00');
    const [success, setSuccess] = useState(false);
    const [showBettingSection, setShowBettingSection] = useState(false);

    const handleSelect = useCallback((odd) => {
        setSelectedOdd(odd);
        setShowBettingSection(true);
        onSelectOdd();
        if (betAmount) {
            const winnings = parseFloat(betAmount) * odd.value;
            setWin(winnings.toFixed(2));
        }
    }, [betAmount, onSelectOdd]);

    const handleAmount = useCallback((e) => {
        const amount = e.target.value;
        if (amount < 0) return;
        setBetAmount(amount);
        if (selectedOdd) {
            const winnings = parseFloat(amount || 0) * selectedOdd.value;
            setWin(winnings.toFixed(2));
        }
    }, [selectedOdd]);

    const placeBet = useCallback(() => {
        if (selectedOdd && betAmount > 0) {
            setSuccess(true);
            onBetPlaced();
            setTimeout(() => {
                setSelectedOdd(null);
                setBetAmount('');
                setWin('0.00');
                setSuccess(false);
                setShowBettingSection(false);
                window.open('https://moy.auraodin.com/redirect.aspx?pid=145116&lpid=1119&bid=1650');
            }, 500);
        }
    }, [selectedOdd, betAmount, onBetPlaced]);

    const getOddLabel = useCallback((type) => {
        switch (type) {
            case 'W1': return translatedText.team1Win;
            case 'X': return translatedText.draw;
            case 'W2': return translatedText.team2Win;
            default: return type;
        }
    }, [translatedText]);

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.headerRow}>
                    <div className={styles.poweredBy}>
                        <span className={styles.poweredText}>POWERED BY Betlabel</span>
                    </div>
                    <span className={styles.date}>{card.matchInfo}</span>
                </div>
            </div>

            <div className={styles.body}>
                <div className={styles.leagueRow}>
                    <h2 className={styles.league}>{card.matchType}</h2>
                </div>

                <div className={styles.teamsRow}>
                    <div className={styles.teamLeft}>
                        <div className={styles.abbrCircle}>
                             {card.team1.logo ? (
                                <img src={`https://nimblecd.com/sfiles/logo_teams/${card.team1.logo}`} alt={card.team1.name} className={styles.teamLogo} />
                            ) : (
                                <div style={{
                                    height: '3rem',
                                    width: '3rem',
                                    background: 'linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px dashed #d0d0d0',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <span style={{ fontSize: '1.5rem', color: '#9e9e9e' }}>⚽</span>
                                </div>
                            )}
                        </div>
                        <span className={styles.teamName}>{card.team1.name}</span>
                    </div>

                    <div className={styles.teamRight}>
                        <span className={styles.teamName} style={{ textAlign: "end" }}>{card.team2.name}</span>
                        <div className={styles.abbrCircleRight}>
                             {card.team2.logo ? (
                                <img src={`https://nimblecd.com/sfiles/logo_teams/${card.team2.logo}`} alt={card.team2.name} className={styles.teamLogo} />
                            ) : (
                                <div style={{
                                    height: '3rem',
                                    width: '3rem',
                                    background: 'linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px dashed #d0d0d0',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <span style={{ fontSize: '1.5rem', color: '#9e9e9e' }}>⚽</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.oddsRow}>
                    {card.odds.map((odd, idx) => (
                        <div
                            key={idx}
                            className={`${styles.oddButton} ${selectedOdd?.label === odd.label ? styles.selected : ''}`}
                            onClick={() => handleSelect(odd)}
                        >
                            <div className={styles.oddLabel}>{odd.label}</div>
                            <div className={styles.oddValue}>{odd.value}</div>
                        </div>
                    ))}
                </div>

                {selectedOdd && (
                    <div className={`${styles.bettingSection} ${showBettingSection ? styles.show : ''}`}>
                        <div className={styles.betInputContainer}>
                            <input
                                type="number"
                                min="1"
                                step="0.01"
                                placeholder={translatedText.enterStake}
                                className={styles.betInput}
                                value={betAmount}
                                onChange={handleAmount}
                            />
                            <button
                                className={styles.placeBetBtn}
                                onClick={placeBet}
                                disabled={!selectedOdd || !betAmount}
                            >
                                {translatedText.placeBet}
                            </button>
                        </div>

                        {selectedOdd && betAmount && (
                            <div className={styles.potentialWin}>
                                <div 
                                    className={styles.potentialWinLabel} 
                                    onClick={() => window.open('https://moy.auraodin.com/redirect.aspx?pid=145116&lpid=1119&bid=1650')}
                                >
                                    {translatedText.potentialWinnings}
                                </div>
                                <div className={styles.potentialWinAmount}>
                                    ₹{win}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {card.isLive && (
                    <div className={styles.live}>
                        <div className={styles.livePulse}></div>
                        <span className={styles.liveText}>{translatedText.live}</span>
                    </div>
                )}
            </div>
            
            <div className={styles.betHistory}>
                {success ? (
                    <span style={{ color: '#22c55e' }}>
                        {translatedText.betSuccess}<br />
                        ₹{betAmount} on {getOddLabel(selectedOdd.label)} • {translatedText.potentialProfit}: ₹{(parseFloat(win) - parseFloat(betAmount)).toFixed(2)}
                    </span>
                ) : (
                    translatedText.selectOdds
                )}
            </div>
        </div>
    );
});