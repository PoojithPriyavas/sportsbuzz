// components/FootballOddsCard.jsx
import React from 'react';
import styles from './SportsOds.module.css';
import { useState, useRef, useEffect } from 'react';
import { useGlobalData } from '../Context/ApiContext';

// Skeleton Loader Component
const SkeletonLoader = ({ styles }) => {
    return (
        <div className={styles.skeletonContainer}>
            {[1, 2,].map((index) => (
                <div key={index} className={styles.skeletonCard}>
                    {/* Header Skeleton */}
                    <div className={styles.skeletonHeader}>
                        <div className={styles.skeletonHeaderContent}>
                            <div className={styles.skeletonPoweredBy}>
                                <div className={styles.skeletonLogoCircle}></div>
                                <div className={styles.skeletonPoweredText}></div>
                            </div>
                            <div className={styles.skeletonDate}></div>
                        </div>
                    </div>

                    {/* Body Skeleton */}
                    <div className={styles.skeletonBody}>
                        {/* League Row */}
                        <div className={styles.skeletonLeagueRow}>
                            <div className={styles.skeletonLeagueTitle}></div>
                        </div>

                        {/* Teams Row */}
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

                        {/* Odds Row */}
                        <div className={styles.skeletonOddsRow}>
                            <div className={styles.skeletonOddButton}></div>
                            <div className={styles.skeletonOddButton}></div>
                            <div className={styles.skeletonOddButton}></div>
                        </div>
                    </div>

                    {/* Footer Skeleton */}
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

export default function BettingCards() {
    const scrollRef = useRef(null);
    const dropdownRef = useRef(null);
    const [paused, setPaused] = useState(false);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [transformedCards, setTransformedCards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [translatedText, setTranslatedText] = useState({
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
        // betSuccess: '✓ Bet Placed Successfully!',
        betSuccess: 'Play responsibly at your own risk',
        team1Win: 'Team 1 Win',
        draw: 'Draw',
        team2Win: 'Team 2 Win',
        potentialProfit: 'Potential Profit'
    });

    const { oneXTournament, oneXAccessToken, fetchOneXEventsIdData, oneXEventDetails, translateText, language } = useGlobalData();
    console.log(oneXEventDetails, "oneXEventDetails")
    useEffect(() => {
        const translateLabels = async () => {
            const [
                bettingOdds, allTournaments, loading, loadingSubtext, noEvents, matchWinner, live,
                vs, enterStake, placeBet, potentialWinnings, selectOdds, betSuccess,
                team1Win, draw, team2Win, potentialProfit
            ] = await Promise.all([
                translateText('Betting Odds', 'en', language),
                translateText('All Tournaments', 'en', language),
                translateText('Loading events...', 'en', language),
                translateText('Please wait while we fetch the latest betting odds', 'en', language),
                translateText('No events available', 'en', language),
                translateText('Match Winner', 'en', language),
                translateText('Live', 'en', language),
                translateText('VS', 'en', language),
                translateText('Enter stake amount', 'en', language),
                translateText('Place Bet', 'en', language),
                translateText('Potential Winnings', 'en', language),
                translateText('Select your odds and enter stake to place your bet', 'en', language),
                // translateText('✓ Bet Placed Successfully!', 'en', language),
                translateText('Play responsibly at your own risk!', 'en', language),
                translateText('Team 1 Win', 'en', language),
                translateText('Draw', 'en', language),
                translateText('Team 2 Win', 'en', language),
                translateText('Potential Profit', 'en', language),
            ]);

            setTranslatedText({
                bettingOdds, allTournaments, loading, loadingSubtext, noEvents, matchWinner, live,
                vs, enterStake, placeBet, potentialWinnings, selectOdds, betSuccess,
                team1Win, draw, team2Win, potentialProfit
            });
        };

        translateLabels();
    }, [language, translateText]);

    const getAllTournaments = () => {
        if (!oneXTournament?.items) return [];
        return oneXTournament.items.map(item => ({
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
            setIsLoading(true);
            fetchOneXEventsIdData(oneXAccessToken, firstTournamentId);
        }
    }, [allTournaments, selectedTournament, oneXAccessToken, fetchOneXEventsIdData]);

    const getTransformedCards = async (events) => {
        if (!Array.isArray(events)) return [];
        const cards = [];

        for (const event of events) {
            const marketData = await fetchMarketData(oneXAccessToken, event.sportEventId);
            cards.push(transformEventToCard(event, marketData));
        }

        return cards;
    };

    useEffect(() => {
        if (oneXEventDetails?.length > 0) {
            console.log("enters this condition. of betting ods")
            setIsLoading(true);
            getTransformedCards(oneXEventDetails).then((cards) => {
                setTransformedCards(cards);
                setIsLoading(false);
            });
        } else {
            console.log("enters the else condition of betting ods")
            setTransformedCards([]);
            setIsLoading(false);
        }
    }, [oneXEventDetails, oneXAccessToken]);

    const handleTournamentChange = (tournamentId) => {
        setIsLoading(true);
        fetchOneXEventsIdData(oneXAccessToken, tournamentId);
        setSelectedTournament(tournamentId);
        setIsDropdownOpen(false);
        setPaused(true);
        setTimeout(() => setPaused(false), 2000);
    };

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

// ... rest of your existing functions (transformEventToCard, fetchMarketData, SportsOddsCard)
function transformEventToCard(event, marketData) {
    // console.log(event.imageOpponent2[0], "eve");
    // console.log(marketData, "market dtaaasd")
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
    const ref = 320;
    try {
        const res = await fetch(`/api/get-onex-odds?ref=${ref}&gameId=${sportEventId}&token=${token}`);
        return res.ok ? await res.json() : null;
    } catch (err) {
        console.error('fetchMarketData error:', err);
        return null;
    }
}

const SportsOddsCard = ({ card, styles, translatedText, onSelectOdd, onBetPlaced }) => {
    // console.log(card, "craddrssdsdsd")
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
                // setTimeout(() => {
                window.open('https://moy.auraodin.com/redirect.aspx?pid=145116&lpid=1119&bid=1650');
                // }, 1000);
            }, 500);
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
        <div className={styles.card}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerRow}>
                    <div className={styles.poweredBy}>
                        {/* <div className={styles.logoCircle}>
                            <span className={styles.logoText}>1X</span>
                        </div> */}
                        <span className={styles.poweredText}>POWERED BY Betlabel</span>
                    </div>
                    <span className={styles.date}>{card.matchInfo}</span>
                </div>
            </div>

            {/* Main */}
            <div className={styles.body}>
                <div className={styles.leagueRow}>
                    <h2 className={styles.league}>{card.matchType}</h2>
                </div>

                <div className={styles.teamsRow}>
                    <div className={styles.teamLeft}>
                        <div className={styles.abbrCircle}>
                            {/* {card.team1.code} */}
                            <img src={`https://nimblecd.com/sfiles/logo_teams/${card.team1.logo}`} alt={card.team1.name} className={styles.teamLogo} />
                        </div>
                        <span className={styles.teamName}>{card.team1.name}</span>
                    </div>

                    <div className={styles.teamRight}>
                        <span className={styles.teamName} style={{ textAlign: "end" }}>{card.team2.name}</span>
                        <div className={styles.abbrCircleRight}>
                            {/* {card.team2.code} */}
                            <img src={`https://nimblecd.com/sfiles/logo_teams/${card.team2.logo}`} alt={card.team2.name} className={styles.teamLogo} />
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
                                <div className={styles.potentialWinLabel} onClick={() => window.open('https://moy.auraodin.com/redirect.aspx?pid=145116&lpid=1119&bid=1650')}>{translatedText.potentialWinnings}</div>
                                <div className={styles.potentialWinAmount}>
                                    ₹{win}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Live */}
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
};