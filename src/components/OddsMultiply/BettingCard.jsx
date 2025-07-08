// import React, { useState, useRef } from 'react';
import React, { useState, useRef, useEffect } from 'react';

import styles from './BettingCard.module.css';
import { matchCards } from './matchesData'; //




export default function BettingCards() {
    const scrollRef = useRef(null);
    const [paused, setPaused] = useState(false);



    useEffect(() => {
        const container = scrollRef.current;
        if (!container || paused) return;

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
    }, [paused]);

    const handlePause = () => setPaused(true);
    const handleResume = () => setTimeout(() => setPaused(false), 5000);

    return (
        <div className={styles.cardsContainer} ref={scrollRef}>
            {matchCards.map((card, idx) => (
                <BettingCard
                    key={idx}
                    card={card}
                    styles={styles}
                    onSelectOdd={handlePause}
                    onBetPlaced={handleResume}
                />
            ))}
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
        onSelectOdd(); // ✅ pause auto-slide
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
            onBetPlaced(); // ✅ resume after 5 seconds
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
            {/* Provider Header */}
            <div className={styles.providerHeader}>
                <div className={styles.providerLogo}>{card.logo}</div>
                <span>Powered by {card.provider}</span>
            </div>

            {/* Match Header */}
            <div className={styles.matchHeader}>
                {card.isLive && (
                    <div className={styles.liveBadge}>
                        <span className={styles.liveIndicator}></span>Live
                    </div>
                )}
                <div className={styles.matchType}>{card.matchType}</div>
                <div className={styles.matchInfo}>{card.matchInfo}</div>
            </div>

            {/* Teams Section */}
            <div className={styles.teamsSection}>
                {/* Teams Container */}
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

                {/* Odds Section */}
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

                {/* Betting Section */}
                {setSelectedOdd && (
                    // < div className={styles.bettingSection}>
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
                    </div>)}
            </div>

            {/* Bet History */}
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
        </div >
    );
}