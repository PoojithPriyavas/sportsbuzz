// components/SportsOdsMegaPari.jsx
import React from 'react';
import styles from './SportsOds.module.css';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useGlobalData } from '../Context/ApiContext';
import bettingOddsTranslations from './bettingOdds.json'; // Import the JSON file

// Cache configuration
const CACHE_CONFIG = {
    DURATION: 5 * 60 * 1000, // 5 minutes
    TRANSLATION_DURATION: 24 * 60 * 60 * 1000, // 24 hours for translations
    KEYS: {
        TOURNAMENT: 'megapari_selectedTournament',
        CARDS: 'megapari_transformedCards',
        TIMESTAMP: 'megapari_cacheTimestamp',
        EVENT_DETAILS: 'megapari_eventDetails',
        TRANSLATIONS: 'megapari_translations_'
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

// Translation Manager - Centralized translation with JSON and caching
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
            console.log(`✓ Loaded translations from cache for language: ${language}`);
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
        console.log(`✓ Saved translations to cache for language: ${language}`);
    },

    // Get translations from JSON file by language code
    getFromJSON: (language) => {
        const translationEntry = bettingOddsTranslations.find(
            entry => entry.hreflang === language
        );

        if (translationEntry) {
            console.log(`✓ Loaded translations from JSON for language: ${language}`);
            return translationEntry.translatedText;
        }

        return null;
    },

    translate: async (language, translateTextFn) => {
        // Return default English if language is 'en'
        if (language === 'en') {
            return TranslationManager.defaultTexts;
        }

        // Try to load from cache first
        const cached = TranslationManager.loadFromCache(language);
        if (cached) {
            return cached;
        }

        // Try to get from JSON file
        const jsonTranslations = TranslationManager.getFromJSON(language);
        if (jsonTranslations) {
            // Save to cache for faster subsequent access
            TranslationManager.saveToCache(language, jsonTranslations);
            return jsonTranslations;
        }

        // If not in JSON, fetch translations via API
        console.log(`⟳ Fetching translations via API for language: ${language}`);

        try {
            const translationPromises = Object.entries(TranslationManager.defaultTexts).map(
                async ([key, text]) => {
                    const translated = await translateTextFn(text, 'en', language);
                    return [key, translated];
                }
            );

            const translatedEntries = await Promise.all(translationPromises);
            const translations = Object.fromEntries(translatedEntries);

            // Save to cache
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
    const cacheKey = `megapari_market_${sportEventId}`;
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
    const normalized = normalizeEventDetail(event);
    const isLive = normalized.waitingLive || (normalized.period > 0);
    const startMs = typeof normalized.startDate === 'number'
        ? (normalized.startDate > 1e12 ? normalized.startDate : normalized.startDate * 1000)
        : Date.now();
    const startDate = new Date(startMs);

    const defaultOdds = [
        { label: 'W1', value: 2.1 },
        { label: 'X', value: 3.2 },
        { label: 'W2', value: 2.8 }
    ];

    let odds = defaultOdds;

    if (marketData?.items?.length) {
        const desired = ['W1', 'X', 'W2'];
        odds = marketData.items
            .filter(item => {
                const label = item.displayMulti?.en || item.displayName?.en || item.name || item.marketLabel;
                return desired.includes(label);
            })
            .map(item => ({
                label: item.displayMulti?.en || item.displayName?.en || item.name || item.marketLabel,
                value: item.oddsMarket ?? item.odds ?? item.price ?? null
            }))
            .filter(o => o.value !== null);

        if (odds.length === 0) odds = defaultOdds;
    }

    const team1Name = normalized.opponent1NameLocalization || 'Team 1';
    const team2Name = normalized.opponent2NameLocalization || 'Team 2';
    const team1Logo = Array.isArray(normalized.imageOpponent1) ? normalized.imageOpponent1[0] : null;
    const team2Logo = Array.isArray(normalized.imageOpponent2) ? normalized.imageOpponent2[0] : null;

    return {
        id: normalized.sportEventId,
        logo: '🏆',
        provider: 'Megapari',
        isLive,
        matchType: normalized.tournamentNameLocalization || 'Tournament',
        matchInfo: `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()}`,
        team1: {
            code: (team1Name || 'T1').slice(0, 3).toUpperCase(),
            name: team1Name,
            logo: team1Logo
        },
        team2: {
            code: (team2Name || 'T2').slice(0, 3).toUpperCase(),
            name: team2Name,
            logo: team2Logo
        },
        oddsTitle: 'Match Winner',
        odds,
        link: normalized.link
    };
}

export default function SportsOdsMegaPari() {
    const scrollRef = useRef(null);
    const dropdownRef = useRef(null);
    const [paused, setPaused] = useState(false);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [transformedCards, setTransformedCards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastFetchTime, setLastFetchTime] = useState(0);
    const [dataInitialized, setDataInitialized] = useState(false);
    const [translatedText, setTranslatedText] = useState(TranslationManager.defaultTexts);
    const [translationsLoading, setTranslationsLoading] = useState(false);

    const { oneXTournament, oneXAccessToken, fetchOneXEventsIdData, oneXEventDetails, translateText, language, 
            // ADD: use scoped context APIs
            fetchOneXEventsIdDataScoped, oneXEventDetailsScoped } = useGlobalData();

    // Memoize tournaments list
    const allTournaments = useMemo(() => {
        if (!oneXTournament?.items) return [];
        return oneXTournament.items.map(item => ({
            id: item.tournamentId,
            name: item.tournamentNameLocalization,
            image: item.tournamentImage
        }));
    }, [oneXTournament]);

    // Optimized translation effect with JSON priority and caching
    useEffect(() => {
        let isMounted = true;

        const loadTranslations = async () => {
            setTranslationsLoading(true);

            try {
                const translations = await TranslationManager.translate(language, translateText);

                if (isMounted) {
                    setTranslatedText(translations);
                    setTranslationsLoading(false);
                }
            } catch (error) {
                console.error('Failed to load translations:', error);
                if (isMounted) {
                    setTranslatedText(TranslationManager.defaultTexts);
                    setTranslationsLoading(false);
                }
            }
        };

        loadTranslations();

        return () => {
            isMounted = false;
        };
    }, [language, translateText]);

    // Get transformed cards with caching
    const getTransformedCards = useCallback(async (events) => {
        if (!Array.isArray(events)) return [];
    
        const cards = await Promise.all(
            events
                .map(e => normalizeEventDetail(e))
                .filter(e => !!e.sportEventId)
                .map(async (normalized) => {
                    const marketData = await fetchMarketData(oneXAccessToken, normalized.sportEventId);
                    return transformEventToCard(normalized, marketData);
                })
        );
    
        return cards.filter(card => !!card.id && !!card.team1?.name && !!card.team2?.name);
    }, [oneXAccessToken]);

    // Initialize data from cache or fetch fresh
    useEffect(() => {
        if (dataInitialized) return;

        const cachedTournament = CacheManager.get(CACHE_CONFIG.KEYS.TOURNAMENT);
        const cachedCards = CacheManager.get(CACHE_CONFIG.KEYS.CARDS);
        const cachedTimestamp = CacheManager.get(CACHE_CONFIG.KEYS.TIMESTAMP);

        // Check if cache is valid
        if (CacheManager.isValid(cachedTimestamp) && cachedCards && cachedTournament) {
            console.log('✓ Loading Megapari data from cache');
            setSelectedTournament(cachedTournament);
            setTransformedCards(cachedCards);
            setIsLoading(false);
            setDataInitialized(true);
            setLastFetchTime(cachedTimestamp);
            return;
        }

        // Cache invalid or missing - fetch fresh data
        if (allTournaments.length > 0 && oneXAccessToken) {
            console.log('⟳ Cache invalid or missing - fetching fresh Megapari data');
            const firstTournamentId = allTournaments[0].id;
            setSelectedTournament(firstTournamentId);
            setIsLoading(true);
            fetchOneXEventsIdDataScoped(oneXAccessToken, firstTournamentId, 'megapari');
            setDataInitialized(true);
        }
    }, [allTournaments, oneXAccessToken, fetchOneXEventsIdDataScoped, dataInitialized]);

    // Process event details when they change
    useEffect(() => {
        const run = async () => {
            const scopedDetails = oneXEventDetailsScoped?.megapari;
            const hasLiveData = Array.isArray(scopedDetails) && scopedDetails.length > 0;

            if (!hasLiveData) {
                const cachedDetails = CacheManager.get(CACHE_CONFIG.KEYS.EVENT_DETAILS);
                const cachedTimestamp = CacheManager.get(CACHE_CONFIG.KEYS.TIMESTAMP);

                if (cachedDetails && CacheManager.isValid(cachedTimestamp)) {
                    const cards = await getTransformedCards(cachedDetails);
                    setTransformedCards(cards);
                    setIsLoading(false);
                    return;
                }

                setTransformedCards([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);

            const cards = await getTransformedCards(scopedDetails);
            const timestamp = Date.now();

            setTransformedCards(cards);
            setIsLoading(false);
            setLastFetchTime(timestamp);

            // Save to cache
            CacheManager.set(CACHE_CONFIG.KEYS.CARDS, cards);
            CacheManager.set(CACHE_CONFIG.KEYS.TOURNAMENT, selectedTournament);
            CacheManager.set(CACHE_CONFIG.KEYS.TIMESTAMP, timestamp);
            CacheManager.set(CACHE_CONFIG.KEYS.EVENT_DETAILS, scopedDetails);
        };

        run();
    }, [oneXEventDetailsScoped, getTransformedCards, selectedTournament]);

    // Tournament change handler with debouncing
    const handleTournamentChange = useCallback((tournamentId) => {
        const now = Date.now();
        const MIN_INTERVAL = 1000; // 1 second debounce

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

        // Use scoped fetch to avoid cross-component updates
        fetchOneXEventsIdDataScoped(oneXAccessToken, tournamentId, 'megapari');

        setTimeout(() => setPaused(false), 2000);
    }, [lastFetchTime, oneXAccessToken, fetchOneXEventsIdDataScoped]);

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
                window.open('https://sportsbuzww.megapari-600325.net/');
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
                        <span className={styles.poweredText}>POWERED BY Megapari</span>
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
                                    onClick={() => window.open('https://sportsbuzww.megapari-600325.net/')}
                                >
                                    {translatedText.potentialWinnings}
                                </div>
                                <div className={styles.potentialWinAmount}>
                                    {win}
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
                        {betAmount} on {getOddLabel(selectedOdd.label)} • {translatedText.potentialProfit}: {(parseFloat(win) - parseFloat(betAmount)).toFixed(2)}
                    </span>
                ) : (
                    translatedText.selectOdds
                )}
            </div>
        </div>
    );
});

function normalizeEventDetail(raw) {
    const sportEventId = raw.sportEventId || raw.id || raw.Eid || raw.gameId || raw.eventId;
    const tournamentNameLocalization =
        raw.tournamentNameLocalization || raw.tournamentName || raw.leagueName || raw.categoryName || raw.competitionName || 'Tournament';

    const opp1Name =
        raw.opponent1NameLocalization ||
        raw.opponent1Name ||
        raw.opponent1?.name ||
        raw.homeName ||
        raw.homeTeamName ||
        raw.team1 ||
        raw.team1Name ||
        raw.home?.name ||
        null;

    const opp2Name =
        raw.opponent2NameLocalization ||
        raw.opponent2Name ||
        raw.opponent2?.name ||
        raw.awayName ||
        raw.awayTeamName ||
        raw.team2 ||
        raw.team2Name ||
        raw.away?.name ||
        null;

    const imageOpponent1 =
        Array.isArray(raw.imageOpponent1) ? raw.imageOpponent1 :
        raw.opponent1?.image ? [raw.opponent1.image] :
        raw.homeLogo ? [raw.homeLogo] :
        raw.team1Logo ? [raw.team1Logo] :
        [];

    const imageOpponent2 =
        Array.isArray(raw.imageOpponent2) ? raw.imageOpponent2 :
        raw.opponent2?.image ? [raw.opponent2.image] :
        raw.awayLogo ? [raw.awayLogo] :
        raw.team2Logo ? [raw.team2Logo] :
        [];

    const startDate =
        typeof raw.startDate === 'number' ? raw.startDate :
        typeof raw.ts === 'number' ? raw.ts :
        typeof raw.start_time === 'number' ? raw.start_time :
        null;

    const waitingLive = !!raw.waitingLive;
    const period = typeof raw.period === 'number' ? raw.period : 0;
    const link = raw.link || raw.url || null;

    return {
        sportEventId,
        tournamentNameLocalization,
        opponent1NameLocalization: opp1Name || 'Team 1',
        opponent2NameLocalization: opp2Name || 'Team 2',
        imageOpponent1,
        imageOpponent2,
        startDate,
        waitingLive,
        period,
        link
    };
}