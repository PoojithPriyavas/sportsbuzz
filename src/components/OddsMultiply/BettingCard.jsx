import React, { useState, useRef, useEffect } from 'react';
import styles from './BettingCard.module.css';
import { useGlobalData } from '../Context/ApiContext';

export default function BettingCards() {
    const scrollRef = useRef(null);
    const dropdownRef = useRef(null);
    const [paused, setPaused] = useState(false);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const { tournament, accessToken, fetchEventsIdData, eventDetails } = useGlobalData();

    const getAllTournaments = () => {
        if (!tournament || !tournament.items) return [];
        return tournament.items.map(item => ({
            id: item.tournamentId,
            name: item.tournamentNameLocalization,
            image: item.tournamentImage
        }));
    };

    const allTournaments = getAllTournaments();

    // Set first tournament as initial selection
    useEffect(() => {
        if (!selectedTournament && allTournaments.length > 0) {
            const firstTournamentId = allTournaments[0].id;
            setSelectedTournament(firstTournamentId);
            fetchEventsIdData(accessToken, firstTournamentId);
        }
    }, [allTournaments, selectedTournament, accessToken, fetchEventsIdData]);

    const filteredTournaments = !selectedTournament || selectedTournament === 'all'
        ? allTournaments
        : allTournaments.filter(t => t.id === selectedTournament);

    const getTournamentImage = (imageName) => {
        if (!imageName) return '/images/tournaments/default-tournament.png';
        return `/images/tournaments/${imageName}`;
    };

    const transformEventToCard = (event) => {
        const isLive = event.waitingLive || event.period > 0;
        const startDate = new Date(event.startDate * 1000);

        return {
            id: event.sportEventId,
            logo: '🏆',
            provider: '22bet',
            isLive: isLive,
            matchType: event.tournamentNameLocalization || 'Tournament',
            matchInfo: `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()}`,
            team1: {
                code: event.opponent1NameLocalization ? event.opponent1NameLocalization.substring(0, 3).toUpperCase() : 'T1',
                name: event.opponent1NameLocalization || 'Team 1',
                image: event.imageOpponent1?.[0] || 'defaultlogo.png'
            },
            team2: {
                code: event.opponent2NameLocalization ? event.opponent2NameLocalization.substring(0, 3).toUpperCase() : 'T2',
                name: event.opponent2NameLocalization || 'Team 2',
                image: event.imageOpponent2?.[0] || 'defaultlogo.png'
            },
            oddsTitle: 'Match Winner',
            odds: [
                { label: 'W1', value: 2.1 },
                { label: 'X', value: 3.2 },
                { label: 'W2', value: 2.8 }
            ],
            link: event.link
        };
    };

    const getTransformedCards = () => {
        if (!eventDetails || !Array.isArray(eventDetails)) return [];
        return eventDetails.map(event => transformEventToCard(event));
    };

    const transformedCards = getTransformedCards();

    const handleTournamentChange = (tournamentId) => {
        fetchEventsIdData(accessToken, tournamentId);
        setSelectedTournament(tournamentId);
        setIsDropdownOpen(false);
        setPaused(true);
        setTimeout(() => setPaused(false), 2000);
    };

    const getSelectedTournamentName = () => {
        if (!selectedTournament || selectedTournament === 'all') return 'All Tournaments';
        const tournament = allTournaments.find(t => t.id === selectedTournament);
        return tournament ? tournament.name : 'Select Tournament';
    };

    useEffect(() => {
        const container = scrollRef.current;
        if (!container || paused || transformedCards.length === 0) return;

        let scrollAmount = 0;
        const cardWidth = 340;
        const interval = setInterval(() => {
            if (container.scrollWidth - container.clientWidth === scrollAmount) {
                scrollAmount = 0;
            } else {
                scrollAmount += cardWidth;
            }

            container.scrollTo({
                left: scrollAmount,
                behavior: 'smooth',
            });
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
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handlePause = () => setPaused(true);
    const handleResume = () => setTimeout(() => setPaused(false), 5000);

    return (
        <div className={styles.bettingContainer}>
            <div className={styles.headerSection}>
                <h2 className={styles.pageTitle}>Betting Odds</h2>
                <div className={styles.filterContainer}>
                    <div className={styles.customDropdown} ref={dropdownRef}>
                        <div
                            className={styles.dropdownHeader}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <div className={styles.selectedOption}>
                                {!selectedTournament || selectedTournament === 'all' ? (
                                    <>
                                        <div className={styles.allTeamsIcon}>🏆</div>
                                        <span>All Tournaments</span>
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
                                    <span>All Tournaments</span>
                                </div>
                                {allTournaments.map((tournament) => (
                                    <div
                                        key={tournament.id}
                                        className={`${styles.dropdownOption} ${selectedTournament === tournament.id ? styles.selected : ''}`}
                                        onClick={() => handleTournamentChange(tournament.id)}
                                    >
                                        <span>{tournament.name}</span>
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
                            onSelectOdd={handlePause}
                            onBetPlaced={handleResume}
                        />
                    ))
                ) : (
                    <div className={styles.noDataMessage}>
                        {eventDetails ? 'No events available' : 'Loading events...'}
                    </div>
                )}
            </div>
        </div>
    );
}

function BettingCard({ card, styles, onSelectOdd, onBetPlaced }) {
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
            case 'W1': return 'Team 1 Win';
            case 'X': return 'Draw';
            case 'W2': return 'Team 2 Win';
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
                        <span className={styles.liveIndicator}></span>Live
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
                    <div className={styles.vs}>VS</div>
                    <div className={styles.team}>
                        <div className={`${styles.teamLogo} ${styles.away}`}>{card.team2.code}</div>
                        <div className={styles.teamName}>{card.team2.name}</div>
                    </div>
                </div>

                <div className={styles.oddsSection}>
                    <div className={styles.oddsTitle}>{card.oddsTitle}</div>
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
                                placeholder="Enter stake amount"
                                className={styles.betInput}
                                value={betAmount}
                                onChange={handleAmount}
                            />
                            <button
                                className={styles.placeBetBtn}
                                onClick={placeBet}
                                disabled={!selectedOdd || !betAmount}
                            >
                                Place Bet
                            </button>
                        </div>

                        {selectedOdd && betAmount && (
                            <div className={styles.potentialWin}>
                                <div className={styles.potentialWinLabel}>Potential Winnings</div>
                                <div className={styles.potentialWinAmount}>
                                    <span className={styles.currency}>₹</span>{win}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className={styles.betHistory}>
                {success ? (
                    <span style={{ color: '#22c55e' }}>
                        ✓ Bet Placed Successfully!<br />
                        ₹{betAmount} on {getOddLabel(selectedOdd.label)} • Potential Profit: ₹{(parseFloat(win) - parseFloat(betAmount)).toFixed(2)}
                    </span>
                ) : (
                    'Select your odds and enter stake to place your bet'
                )}
            </div>
        </div>
    );
}
