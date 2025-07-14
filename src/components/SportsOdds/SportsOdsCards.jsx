// components/FootballOddsCard.jsx
import React from 'react';
import styles from './SportsOds.module.css';

const SportsOddsCard = ({
    league, date, time, venue,
    team1, team2, team1Abbr, team2Abbr,
    w1Odds, xOdds, w2Odds
}) => {
    return (
        <div className={styles.card}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerRow}>
                    <div className={styles.poweredBy}>
                        <div className={styles.logoCircle}>
                            <span className={styles.logoText}>1X</span>
                        </div>
                        <span className={styles.poweredText}>POWERED BY 1XBET</span>
                    </div>
                    <span className={styles.date}>{date}</span>
                </div>
            </div>

            {/* Main */}
            <div className={styles.body}>
                <div className={styles.leagueRow}>
                    <h2 className={styles.league}>{league}</h2>
                    <span className={styles.venue}>{venue}</span>
                </div>

                {/* Teams & Odds */}
                {/* <div className={styles.teamsOdds}>
                    <div className={styles.teamLeft}>
                        <div className={styles.abbrCircle}>{team1Abbr}</div>
                        <span className={styles.teamName}>{team1}</span>
                    </div>



                    <div className={styles.teamRight}>
                        <span className={styles.teamName}>{team2}</span>
                        <div className={styles.abbrCircleRight}>{team2Abbr}</div>
                    </div>
                </div>
                <div className={styles.odds}>
                    <button className={styles.oddsPrimary}>
                        <div className={styles.oddsLabel}>W1</div>
                        <div>{w1Odds}</div>
                    </button>
                    <button className={styles.oddsNeutral}>
                        <div className={styles.oddsLabel}>X</div>
                        <div>{xOdds}</div>
                    </button>
                    <button className={styles.oddsPrimary}>
                        <div className={styles.oddsLabel}>W2</div>
                        <div>{w2Odds}</div>
                    </button>
                </div> */}

                {/* Teams Row */}
<div className={styles.teamsRow}>
    <div className={styles.teamLeft}>
        <div className={styles.abbrCircle}>{team1Abbr}</div>
        <span className={styles.teamName}>{team1}</span>
    </div>

    <div className={styles.teamRight}>
        <span className={styles.teamName}>{team2}</span>
        <div className={styles.abbrCircleRight}>{team2Abbr}</div>
    </div>
</div>

{/* Odds Centered Below */}
<div className={styles.oddsRow}>
    <button className={styles.oddsPrimary}>
        <div className={styles.oddsLabel}>W1</div>
        <div>{w1Odds}</div>
    </button>
    <button className={styles.oddsNeutral}>
        <div className={styles.oddsLabel}>X</div>
        <div>{xOdds}</div>
    </button>
    <button className={styles.oddsPrimary}>
        <div className={styles.oddsLabel}>W2</div>
        <div>{w2Odds}</div>
    </button>
</div>


                {/* Live */}
                <div className={styles.live}>
                    <div className={styles.livePulse}></div>
                    <span className={styles.liveText}>Live Odds</span>
                </div>
            </div>
        </div>
    );
};

export default SportsOddsCard;
