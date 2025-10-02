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
      try {
        // Translate each text individually
        const translations = {
          startingXI: await translateText('Starting XI', 'en', language),
          goalkeeper: await translateText('Goalkeeper', 'en', language),
          defenders: await translateText('Defenders', 'en', language),
          midfielders: await translateText('Midfielders', 'en', language),
          forwards: await translateText('Forwards', 'en', language),
          substitutes: await translateText('Substitutes', 'en', language),
          used: await translateText('Used', 'en', language)
        };

        // Update translations in state
        setTranslatedText(prev => ({
          ...prev,
          ...translations
        }));

        // Cache translations
        localStorage.setItem('teamLineupTranslations', JSON.stringify({
          language: language,
          translations: translations
        }));

      } catch (error) {
        console.error('Error translating team lineup labels:', error);
      }
    };

    // Check for cached translations first
    const cachedTranslations = localStorage.getItem('teamLineupTranslations');
    if (cachedTranslations) {
      try {
        const parsed = JSON.parse(cachedTranslations);
        if (parsed.language === language) {
          setTranslatedText(prev => ({
            ...prev,
            ...parsed.translations
          }));
        } else {
          // Language changed, update translations
          translateLabels();
        }
      } catch (error) {
        console.error('Error parsing cached translations:', error);
        translateLabels();
      }
    } else {
      translateLabels();
    }
  }, [language, translateText]);

  // Position emojis mapping
  const emojiMap = {
    goalkeeper: "🧤",
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