import React from 'react';
import styles from './TeamLineup.module.css';

const TeamLineup = ({ team }) => {
  const emojiMap = {
    goalkeeper: "🥅",
    defenders: "🛡️",
    midfielders: "⚽",
    forwards: "🎯"
  };

  return (
    <div className={styles.teamLineup}>
      <h4>{team.color === 'red' ? '🔴' : '🔵'} {team.name} - Starting XI</h4>
      <div className={styles.lineupFormation}>{team.formation}</div>
      
      {Object.entries(team.players).map(([position, players]) => (
        <div key={position} className={styles.positionGroup}>
          <div className={styles.positionTitle}>
            {emojiMap[position]} {position.charAt(0).toUpperCase() + position.slice(1)}
          </div>
          {players.map(player => (
            <div key={player.number} className={styles.playerLineup}>
              <span className={styles.jerseyNumber}>{player.number}</span>
              <span className={styles.playerInfo}>{player.name}</span>
              {player.subTime && <span className={styles.subIndicator}>↔ {player.subTime}</span>}
            </div>
          ))}
        </div>
      ))}

      <div className={styles.substitutesSection}>
        <div className={styles.subsTitle}>🔄 Substitutes</div>
        <div className={styles.substituteList}>
          {team.substitutes.map(player => (
            <div key={player.number} className={styles.substituteItem}>
              <span className={styles.jerseyNumber}>{player.number}</span>
              <span className={styles.playerInfo}>{player.name}</span>
              {player.used && <span className={styles.subUsed}>Used {player.used}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamLineup;