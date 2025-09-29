import React, { useState, useEffect } from 'react';
import styles from './TeamLineup.module.css';
import { useGlobalData } from '../Context/ApiContext';

const TeamLineup = ({ team }) => {
  const { language, translateText } = useGlobalData();
  const [translatedText, setTranslatedText] = useState({
    startingXI: 'Starting XI',
    goalkeeper: 'Goalkeeper',
    defenders: 'Defenders',
    midfielders: 'Midfielders',
    forwards: 'Forwards',
    substitutes: 'Substitutes',
    used: 'Used'
  });

  useEffect(() => {
    const translateLabels = async () => {
      // Create an array of text objects for batch translation
      const textsToTranslate = [
        { text: 'Starting XI', to: language },
        { text: 'Goalkeeper', to: language },
        { text: 'Defenders', to: language },
        { text: 'Midfielders', to: language },
        { text: 'Forwards', to: language },
        { text: 'Substitutes', to: language },
        { text: 'Used', to: language }
      ];
      
      // Get translations in a single API call
      const translations = await translateText(textsToTranslate, 'en', language);
      
      // Update state with the translated texts
      setTranslatedText({
        startingXI: translations[0],
        goalkeeper: translations[1],
        defenders: translations[2],
        midfielders: translations[3],
        forwards: translations[4],
        substitutes: translations[5],
        used: translations[6]
      });
    };

    translateLabels();
  }, [language, translateText]);

  const emojiMap = {
    goalkeeper: "🥅",
    defenders: "🛡️",
    midfielders: "⚽",
    forwards: "🎯"
  };

  const getPositionName = (position) => {
    switch(position) {
      case 'goalkeeper': return translatedText.goalkeeper;
      case 'defenders': return translatedText.defenders;
      case 'midfielders': return translatedText.midfielders;
      case 'forwards': return translatedText.forwards;
      default: return position.charAt(0).toUpperCase() + position.slice(1);
    }
  };

  return (
    <div className={styles.teamLineup}>
      <h4>{team.color === 'red' ? '🔴' : '🔵'} {team.name} - {translatedText.startingXI}</h4>
      <div className={styles.lineupFormation}>{team.formation}</div>
      
      {Object.entries(team.players).map(([position, players]) => (
        <div key={position} className={styles.positionGroup}>
          <div className={styles.positionTitle}>
            {emojiMap[position]} {getPositionName(position)}
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
        <div className={styles.subsTitle}>🔄 {translatedText.substitutes}</div>
        <div className={styles.substituteList}>
          {team.substitutes.map(player => (
            <div key={player.number} className={styles.substituteItem}>
              <span className={styles.jerseyNumber}>{player.number}</span>
              <span className={styles.playerInfo}>{player.name}</span>
              {player.used && <span className={styles.subUsed}>{translatedText.used} {player.used}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamLineup;