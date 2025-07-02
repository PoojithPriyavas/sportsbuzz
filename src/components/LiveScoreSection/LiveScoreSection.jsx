import React from 'react';
import styles from './LiveScoreSection.module.css';

const matches = [
  {
    id: 1,
    status: 'Live',
    type: 'International',
    title: 'ICC World Test Championship Final 2025',
    team1: { name: 'Australia', score: '212/3 (19.6)' },
    team2: { name: 'South Africa', score: '211/8 (19.6)' },
    note: 'Day 3: Stumps - South Africa need 69 runs',
  },
  {
    id: 2,
    status: 'Live',
    type: 'International',
    title: 'ICC World Test Championship Final 2025',
    team1: { name: 'Australia', score: '212/3 (19.6)' },
    team2: { name: 'South Africa', score: '211/8 (19.6)' },
    note: 'Day 3: Stumps - South Africa need 69 runs',
  },
  {
    id: 3,
    status: 'Live',
    type: 'International',
    title: 'ICC World Test Championship Final 2025',
    team1: { name: 'Australia', score: '212/3 (19.6)' },
    team2: { name: 'South Africa', score: '211/8 (19.6)' },
    note: 'Day 3: Stumps - South Africa need 69 runs',
  },
  {
    id: 4,
    status: 'Live',
    type: 'International',
    title: 'ICC World Test Championship Final 2025',
    team1: { name: 'Australia', score: '212/3 (19.6)' },
    team2: { name: 'South Africa', score: '211/8 (19.6)' },
    note: 'Day 3: Stumps - South Africa need 69 runs',
  },
];

export default function LiveScores() {
  const renderCards = () => {
    const cards = [];

    matches.forEach((match, index) => {
      cards.push(
        <div key={`match-${match.id}`} className={styles.card}>
          <div className={styles.status}>
            <span className={styles.liveDot}></span>
            <strong>{match.status}</strong> - {match.type}
          </div>
          <div className={styles.title}>{match.title}</div>
          <div className={styles.teams}>
            <div className={styles.team}>
              <div className={styles.teamInfo}>
                <img src="/team1.png" alt="Team 1" className={styles.flag} />
                <span>{match.team1.name}</span>
              </div>
              <strong className={styles.score}>{match.team1.score}</strong>
            </div>
            <div className={styles.team}>
              <div className={styles.teamInfo}>
                <img src="/team2.png" alt="Team 2" className={styles.flag} />
                <span>{match.team2.name}</span>
              </div>
              <strong className={styles.score}>{match.team2.score}</strong>
            </div>
          </div>

          <div className={styles.note}>{match.note}</div>
        </div>
      );

      // Insert ad card after every 2 match cards
      if ((index + 1) % 2 === 0) {
        cards.push(
          <div key={`ad-${index}`} className={styles.card}>
            <div className={styles.ad}>Google Ads</div>
          </div>
        );
      }
    });

    return cards;
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.nav}>
        <span className={styles.active}>Matches (6)</span>
        <span>International</span>
        <span>League</span>
        <span>Domestic</span>
        <span>Women</span>
      </div>

      <div className={styles.cardRow}>
        {renderCards()}
      </div>
    </div>
  );
}
