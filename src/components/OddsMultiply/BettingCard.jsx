import React, { useState, useRef, useEffect } from 'react';
import styles from './BettingCard.module.css';
import { useGlobalData } from '../Context/ApiContext';

export default function BettingCards() {
    const scrollRef = useRef(null);
    const dropdownRef = useRef(null);
    const [paused, setPaused] = useState(false);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [transformedCards, setTransformedCards] = useState([]);
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
        betSuccess: '✓ Bet Placed Successfully!',
        team1Win: 'Team 1 Win',
        draw: 'Draw',
        team2Win: 'Team 2 Win',
        potentialProfit: 'Potential Profit'
    });

    const { tournament, accessToken, fetchEventsIdData, eventDetails, translateText, language } = useGlobalData();

    useEffect(() => {
        const translateLabels = async () => {
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
                translateText('✓ Bet Placed Successfully!', 'en', language),
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

    // Add the missing getSelectedTournamentName function
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
            cards.push(transformEventToCard(event, marketData));
        }

        return cards;
    };

    useEffect(() => {
        if (eventDetails?.length > 0) {
            getTransformedCards(eventDetails).then(setTransformedCards);
        } else {
            setTransformedCards([]);
        }
    }, [eventDetails, accessToken]);

    const handleTournamentChange = (tournamentId) => {
        fetchEventsIdData(accessToken, tournamentId);
        setSelectedTournament(tournamentId);
        setIsDropdownOpen(false);
        setPaused(true);
        setTimeout(() => setPaused(false), 2000);
    };

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
                {transformedCards.length > 0 ? (
                    transformedCards.map((card, idx) => (
                        <BettingCard
                            key={card.id || idx}
                            card={card}
                            styles={styles}
                            translatedText={translatedText}
                            onSelectOdd={() => setPaused(true)}
                            onBetPlaced={() => setTimeout(() => setPaused(false), 5000)}
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
            name: event.opponent1NameLocalization || 'Team 1'
        },
        team2: {
            code: event.opponent2NameLocalization?.slice(0, 3).toUpperCase() || 'T2',
            name: event.opponent2NameLocalization || 'Team 2'
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
            }, 3000);
        }
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
                <div className={styles.matchType}>{card.matchType}</div>
                <div className={styles.matchInfo}>{card.matchInfo}</div>
            </div>

            <div className={styles.teamsSection}>
                <div className={styles.teamsContainer}>
                    <div className={styles.team}>
                        <div className={styles.teamLogo}>{card.team1.code}</div>
                        <div className={styles.teamName}>{card.team1.name}</div>
                    </div>
                    <div className={styles.vs}>{translatedText.vs}</div>
                    <div className={styles.team}>
                        <div className={`${styles.teamLogo} ${styles.away}`}>{card.team2.code}</div>
                        <div className={styles.teamName}>{card.team2.name}</div>
                    </div>
                </div>

                <div className={styles.oddsSection}>
                    <div className={styles.oddsTitle}>{translatedText.matchWinner}</div>
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

                        {selectedOdd && betAmount && (
                            <div className={styles.potentialWin}>
                                <div className={styles.potentialWinLabel}>{translatedText.potentialWinnings}</div>
                                <div className={styles.potentialWinAmount}>
                                    ₹{win}
                                </div>
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