import React from 'react';
import SportsOdsCard from './SportsOdsCards';
import styles from './SportsOdsLIst.module.css';

const matches = [
  {
    league: "La Liga",
    date: "Tomorrow 9:00 PM",
    venue: "Camp Nou",
    team1: "FC Barcelona",
    team2: "Real Madrid",
    team1Abbr: "BAR",
    team2Abbr: "RMA",
    w1Odds: "2.00",
    xOdds: "3.50",
    w2Odds: "2.75"
  },
  {
    league: "Premier League",
    date: "Today 3:00 PM",
    venue: "Old Trafford",
    team1: "Manchester United",
    team2: "Manchester City",
    team1Abbr: "MUN",
    team2Abbr: "MCI",
    w1Odds: "3.20",
    xOdds: "3.10",
    w2Odds: "2.40"
  },
  // Add other matches...
];

const SportsOddsList = () => {
  return (
    <div className={styles.container}>
      <div className={styles.cardsWrapper}>
        {matches.map((match, index) => (
          <SportsOdsCard key={index} {...match} />
        ))}
      </div>
    </div>
  );
};

export default SportsOddsList;
