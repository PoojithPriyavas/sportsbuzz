import React, { useState, useRef, useEffect } from 'react';
import styles from './BettingCard.module.css';
import { useGlobalData } from '../Context/ApiContext';
import { useRouter } from 'next/router';

export default function BettingCards() {
    const scrollRef = useRef(null);
    const dropdownRef = useRef(null);
    const inactivityTimerRef = useRef(null);
    const previousLanguage = useRef(null);
    
    const [paused, setPaused] = useState(false);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [transformedCards, setTransformedCards] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [translatedText, setTranslatedText] = useState({
        bettingOdds: 'Betting Odds',
        allTournaments: 'All Tournaments',
        loading: 'Loading events...',
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
    });

    const { tournament, accessToken, fetchEventsIdData, eventDetails, translateText, language } = useGlobalData();

    const startInactivityTimer = () => {
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
        }
        inactivityTimerRef.current = setTimeout(() => {
            setPaused(false);
        }, 10000);
    };

    const handleUserActivity = () => {
        setPaused(true);
        startInactivityTimer();
    };

    const handleBetCompletion = () => {
        setPaused(true);
        startInactivityTimer();
    };

    useEffect(() => {
        return () => {
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
            }
        };
    }, []);

    // Translate UI labels
    useEffect(() => {
        const translateLabels = async () => {
            // Check if language actually changed
            if (previousLanguage.current === language) return;
            previousLanguage.current = language;

            const [
                bettingOdds, allTournaments, loading, noEvents, matchWinner, live,
                vs, enterStake, placeBet, potentialWinnings, selectOdds, betSuccess,
                team1Win, draw, team2Win, potentialProfit
            ] = await Promise.all([
                translateText('Betting Odds', 'en', language),
                translateText('All Tournaments', 'en', language),
                translateText('Loading events...', 'en', language),
                translateText('No events available', 'en', language),
                translateText('Match Winner', 'en', language),
                translateText('Live', 'en', language),
                translateText('VS', 'en', language),
                translateText('Enter stake amount', 'en', language),
                translateText('Place Bet', 'en', language),
                translateText('Potential Winnings', 'en', language),
                translateText('Select your odds and enter stake to place your bet', 'en', language),
                translateText('Play responsibly at your own risk!', 'en', language),
                translateText('Team 1 Win', 'en', language),
                translateText('Draw', 'en', language),
                translateText('Team 2 Win', 'en', language),
                translateText('Potential Profit', 'en', language),
            ]);

            setTranslatedText({
                bettingOdds, allTournaments, loading, noEvents, matchWinner, live,
                vs, enterStake, placeBet, potentialWinnings, selectOdds, betSuccess,
                team1Win, draw, team2Win, potentialProfit
            });
        };

        translateLabels();
    }, [language, translateText]);

    const getAllTournaments = () => {
        if (!tournament?.items) return [];
        return tournament.items.map(item => ({
            id: item.tournamentId,
            name: item.tournamentNameLocalization,
            image: item.tournamentImage
        }));
    };

    const allTournaments = getAllTournaments();

    const getSelectedTournamentName = () => {
        if (!selectedTournament || selectedTournament === 'all') {
            return translatedText.allTournaments;
        }
        const selected = allTournaments.find(t => t.id === selectedTournament);
        return selected?.name || translatedText.allTournaments;
    };

    useEffect(() => {
        if (!selectedTournament && allTournaments.length > 0) {
            const firstTournamentId = allTournaments[0].id;
            setSelectedTournament(firstTournamentId);
            fetchEventsIdData(accessToken, firstTournamentId);
        }
    }, [allTournaments, selectedTournament, accessToken, fetchEventsIdData]);

    const getTransformedCards = async (events) => {
        if (!Array.isArray(events)) return [];
        const cards = [];

        for (const event of events) {
            const marketData = await fetchMarketData(accessToken, event.sportEventId);
            const baseCard = transformEventToCard(event, marketData);
            
            // Add translated fields initialized with original values
            cards.push({
                ...baseCard,
                translatedMatchType: baseCard.matchType,
                translatedTeam1Name: baseCard.team1.name,
                translatedTeam2Name: baseCard.team2.name,
                translatedOddsTitle: baseCard.oddsTitle
            });
        }

        return cards;
    };

    // Initialize cards with original data
    useEffect(() => {
        if (eventDetails) {
            setIsLoading(true);
            getTransformedCards(eventDetails).then(cards => {
                setTransformedCards(cards);
                setIsLoading(false);
            });
        } else {
            setTransformedCards([]);
        }
    }, [eventDetails, accessToken]);

    // Translate card content when language changes
    useEffect(() => {
        const translateCardContent = async () => {
            if (!transformedCards || transformedCards.length === 0) return;
            if (previousLanguage.current === language) return;

            // Translate each card incrementally
            for (let cardIdx = 0; cardIdx < transformedCards.length; cardIdx++) {
                const card = transformedCards[cardIdx];

                const [translatedMatchType, translatedTeam1Name, translatedTeam2Name, translatedOddsTitle] = 
                    await Promise.all([
                        card.matchType ? translateText(card.matchType, 'en', language) : card.matchType,
                        card.team1.name ? translateText(card.team1.name, 'en', language) : card.team1.name,
                        card.team2.name ? translateText(card.team2.name, 'en', language) : card.team2.name,
                        card.oddsTitle ? translateText(card.oddsTitle, 'en', language) : card.oddsTitle
                    ]);

                // Update this specific card
                setTransformedCards(prev => {
                    const updated = [...prev];
                    if (updated[cardIdx]) {
                        updated[cardIdx] = {
                            ...updated[cardIdx],
                            translatedMatchType,
                            translatedTeam1Name,
                            translatedTeam2Name,
                            translatedOddsTitle
                        };
                    }
                    return updated;
                });
            }
        };

        translateCardContent();
    }, [transformedCards.length, language, translateText]);

    const handleTournamentChange = (tournamentId) => {
        setIsLoading(true);
        fetchEventsIdData(accessToken, tournamentId).then(() => {
            setIsLoading(false);
        });
        setSelectedTournament(tournamentId);
        setIsDropdownOpen(false);
        handleUserActivity();
    };

    // Auto-scroll effect
    useEffect(() => {
        const container = scrollRef.current;
        if (!container || paused || transformedCards.length === 0) return;

        let scrollAmount = 0;
        const cardWidth = 340;
        const interval = setInterval(() => {
            scrollAmount = (scrollAmount + cardWidth) % container.scrollWidth;
            container.scrollTo({ left: scrollAmount, behavior: 'smooth' });
        }, 4000);

        return () => clearInterval(interval);
    }, [paused, transformedCards]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function SkeletonCard() {
        return (
            <div className={styles.skeletonCard}>
                <div className={`${styles.skeleton} ${styles.skeletonProvider}`}></div>
                <div className={`${styles.skeleton} ${styles.skeletonMatchHeader}`}></div>

                <div className={styles.teamsSection}>
                    <div className={styles.teamsContainer}>
                        <div className={styles.skeletonTeam}>
                            <div className={`${styles.skeleton} ${styles.skeletonTeamLogo}`}></div>
                            <div className={`${styles.skeleton} ${styles.skeletonTeamName}`}></div>
                        </div>
                        <div className={`${styles.skeleton} ${styles.skeletonVS}`}></div>
                        <div className={styles.skeletonTeam}>
                            <div className={`${styles.skeleton} ${styles.skeletonTeamLogo}`}></div>
                            <div className={`${styles.skeleton} ${styles.skeletonTeamName}`}></div>
                        </div>
                    </div>

                    <div className={styles.oddsSection}>
                        <div className={`${styles.skeleton} ${styles.skeletonOddsTitle}`}></div>
                        <div className={styles.oddsContainer}>
                            <div className={`${styles.skeleton} ${styles.skeletonOddButton}`}></div>
                            <div className={`${styles.skeleton} ${styles.skeletonOddButton}`}></div>
                            <div className={`${styles.skeleton} ${styles.skeletonOddButton}`}></div>
                        </div>
                    </div>

                    <div className={`${styles.bettingSection} ${styles.show}`}>
                        <div className={styles.betInputContainer}>
                            <div className={`${styles.skeleton} ${styles.skeletonBetInput}`}></div>
                            <div className={`${styles.skeleton} ${styles.skeletonBetButton}`}></div>
                        </div>
                        <div className={`${styles.skeleton} ${styles.skeletonPotentialWin}`}></div>
                    </div>
                </div>

                <div className={`${styles.skeleton} ${styles.skeletonBetHistory}`}></div>
            </div>
        );
    }

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
                                    <span>{getSelectedTournamentName()}</span>
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
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : transformedCards.length > 0 ? (
                    transformedCards.map((card, idx) => (
                        <BettingCard
                            key={card.id || idx}
                            card={card}
                            styles={styles}
                            translatedText={translatedText}
                            onSelectOdd={handleUserActivity}
                            onBetPlaced={handleBetCompletion}
                        />
                    ))
                ) : (
                    <div className={styles.noDataMessage}>
                        {eventDetails ? translatedText.noEvents : translatedText.loading}
                    </div>
                )}
            </div>
        </div>
    );
}

function transformEventToCard(event, marketData) {
    const isLive = event.waitingLive || event.period > 0;
    const startDate = new Date(event.startDate * 1000);
    const defaultOdds = [
        { label: 'W1', value: 2.1 },
        { label: 'X', value: 3.2 },
        { label: 'W2', value: 2.8 }
    ];

    let odds = defaultOdds;

    if (marketData?.items?.length) {
        const desired = ['W1', 'X', 'W2'];
        odds = marketData.items
            .filter(item => desired.includes(item.displayMulti?.en))
            .map(item => ({
                label: item.displayMulti.en,
                value: item.oddsMarket
            }));
    }

    return {
        id: event.sportEventId,
        logo: '🏆',
        provider: '22bet',
        isLive,
        matchType: event.tournamentNameLocalization || 'Tournament',
        matchInfo: `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()}`,
        team1: {
            code: event.opponent1NameLocalization?.slice(0, 3).toUpperCase() || 'T1',
            name: event.opponent1NameLocalization || 'Team 1',
            logo: event.imageOpponent1[0]
        },
        team2: {
            code: event.opponent2NameLocalization?.slice(0, 3).toUpperCase() || 'T2',
            name: event.opponent2NameLocalization || 'Team 2',
            logo: event.imageOpponent2[0]
        },
        oddsTitle: 'Match Winner',
        odds,
        link: event.link
    };
}

async function fetchMarketData(token, sportEventId) {
    const ref = 151;
    try {
        const res = await fetch(`/api/get-odds?ref=${ref}&gameId=${sportEventId}&token=${token}`);
        return res.ok ? await res.json() : null;
    } catch (err) {
        console.error('fetchMarketData error:', err);
        return null;
    }
}

function BettingCard({ card, styles, translatedText, onSelectOdd, onBetPlaced }) {
    const [selectedOdd, setSelectedOdd] = useState(null);
    const [betAmount, setBetAmount] = useState('');
    const [win, setWin] = useState('0.00');
    const [success, setSuccess] = useState(false);
    const [showBettingSection, setShowBettingSection] = useState(false);

    const handleSelect = (odd) => {
        setSelectedOdd(odd);
        setShowBettingSection(true);
        onSelectOdd();
        if (betAmount) calculateWin(betAmount, odd.value);
    };

    const handleAmount = (e) => {
        const amount = e.target.value;
        if (amount < 0) return;
        setBetAmount(amount);
        if (selectedOdd) calculateWin(amount, selectedOdd.value);
    };

    const calculateWin = (amount, oddValue) => {
        const winnings = parseFloat(amount || 0) * oddValue;
        setWin(winnings.toFixed(2));
    };

    const placeBet = () => {
        if (selectedOdd && betAmount > 0) {
            setSuccess(true);
            onBetPlaced();

            setTimeout(() => {
                setSelectedOdd(null);
                setBetAmount('');
                setWin('0.00');
                setSuccess(false);
                setShowBettingSection(false);
                window.open('https://moy.auraodin.com/redirect.aspx?pid=145116&lpid=17&bid=1484', '_blank');
            }, 500);
        }
    };

    const potentialClick = () => {
        window.open('https://moy.auraodin.com/redirect.aspx?pid=145116&lpid=17&bid=1484', '_blank');

        setTimeout(() => {
            setSelectedOdd(null);
            setBetAmount('');
            setWin('0.00');
            setSuccess(false);
            setShowBettingSection(false);
        }, 500);
    };

    const getOddLabel = (type) => {
        switch (type) {
            case 'W1': return translatedText.team1Win;
            case 'X': return translatedText.draw;
            case 'W2': return translatedText.team2Win;
            default: return type;
        }
    };

    return (
        <div className={styles.bettingCard}>
            <div className={styles.providerHeader}>
                <div className={styles.providerLogo}>{card.logo}</div>
                <span>Powered by {card.provider}</span>
            </div>

            <div className={styles.matchHeader}>
                {card.isLive && (
                    <div className={styles.liveBadge}>
                        <span className={styles.liveIndicator}></span>{translatedText.live}
                    </div>
                )}
                <div className={styles.matchType}>{card.translatedMatchType}</div>
                <div className={styles.matchInfo}>{card.matchInfo}</div>
            </div>

            <div className={styles.teamsSection}>
                <div className={styles.teamsContainer}>
                    <div className={styles.team}>
                        <div className={styles.teamLogo}>
                            <img src={`https://nimblecd.com/sfiles/logo_teams/${card.team1.logo}`} alt={card.team1.name} className={styles.teamLogoImg} />
                        </div>
                        <div className={styles.teamName}>{card.translatedTeam1Name}</div>
                    </div>
                    <div className={styles.vs}>{translatedText.vs}</div>
                    <div className={styles.team}>
                        <div className={`${styles.teamLogo} ${styles.away}`}>
                            <img src={`https://nimblecd.com/sfiles/logo_teams/${card.team2.logo}`} alt={card.team2.name} className={styles.teamLogoImg} />
                        </div>
                        <div className={styles.teamName}>{card.translatedTeam2Name}</div>
                    </div>
                </div>

                <div className={styles.oddsSection}>
                    <div className={styles.oddsTitle}>{card.translatedOddsTitle}</div>
                    <div className={styles.oddsContainer}>
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

                        {betAmount && parseFloat(betAmount) > 0 && (
                            <div className={styles.potentialWin} style={{ cursor: 'pointer' }}>
                                <div className={styles.potentialWinLabel} onClick={() => potentialClick()}>
                                    {translatedText.potentialWinnings}
                                </div>
                                <div className={styles.potentialWinAmount}>₹{win}</div>
                            </div>
                        )}
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
}