'use client';

import React, { useEffect, useState } from 'react';
import styles from './MatchCard.module.css';
import Field from './Field';
import TeamLineup from './TeamLineup';
import { useGlobalData } from '../Context/ApiContext';

const MatchCard = () => {
  const { footBallMatchDetails, lineUp, translateText, language, matchTeams } = useGlobalData();
  console.log(footBallMatchDetails,"football match details")

  const [translatedText, setTranslatedText] = useState({
    stadium: 'Stadium',
    city: 'City',
    date: 'Date',
    time: 'Time',
    country: 'Country',
    league: 'League',
    vs: 'VS',
    coach: 'Coach',
    lineup: 'Lineup',
    substitutions: 'Substitutions',
    noSubs: 'No substitutions',
    formation: 'Formation',
    totalPlayers: 'Total Players',
    subs: 'Substitutes',
    matchStatus: 'Match Status',
    completed: 'Completed',
    loading: 'Loading...',
    noTeamData: 'No team data available',
    noMatchData: 'Match data not available'
  });

  useEffect(() => {
    const translateLabels = async () => {
      try {
        // Translate each text individually
        const translations = {
          stadium: await translateText('Stadium', 'en', language),
          city: await translateText('City', 'en', language),
          date: await translateText('Date', 'en', language),
          time: await translateText('Time', 'en', language),
          country: await translateText('Country', 'en', language),
          league: await translateText('League', 'en', language),
          vs: await translateText('VS', 'en', language),
          coach: await translateText('Coach', 'en', language),
          lineup: await translateText('Lineup', 'en', language),
          substitutions: await translateText('Substitutions', 'en', language),
          noSubs: await translateText('No substitutions', 'en', language),
          formation: await translateText('Formation', 'en', language),
          totalPlayers: await translateText('Total Players', 'en', language),
          subs: await translateText('Substitutes', 'en', language),
          matchStatus: await translateText('Match Status', 'en', language),
          completed: await translateText('Completed', 'en', language),
          loading: await translateText('Loading...', 'en', language),
          noTeamData: await translateText('No team data available', 'en', language),
          noMatchData: await translateText('Match data not available', 'en', language)
        };

        // Update translations in state
        setTranslatedText(prev => ({
          ...prev,
          ...translations
        }));

        // Cache translations
        localStorage.setItem('matchCardTranslations', JSON.stringify({
          language,
          translations
        }));

      } catch (error) {
        console.error('Error translating match card labels:', error);
      }
    };

    // Check for cached translations first
    const cachedTranslations = localStorage.getItem('matchCardTranslations');
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

  // Show loading state initially
  if (!footBallMatchDetails || !lineUp) {
    console.log("enters this if condition in the match detaials")
    return (
      <div className={styles.matchCard}>
        <div className={styles.noDataSection}>
          <div className={styles.loadingIcon}>⏳</div>
          <h2>{translatedText.loading}</h2>
          <p>Please wait while we fetch the match information...</p>
        </div>
      </div>
    );
  }

  const stadiumName = footBallMatchDetails?.Vnm || 'Unknown Stadium';
  const country = footBallMatchDetails?.VCnm || 'Unknown Country';
  const city = footBallMatchDetails?.Vcy || '';
  const matchTimestamp = footBallMatchDetails?.Esd;

  const formattedDateTime = matchTimestamp
    ? new Date(
        matchTimestamp
          .toString()
          .replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})\d{2}$/, '$1-$2-$3T$4:$5:00')
      ).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    : 'Unknown Time';

  const processTeamData = (teamData, teamNumber) => {
    const players = teamData.Ps || [];
    const formation = teamData.Fo?.join('-') ;
    const substitutions = lineUp.Subs?.[teamNumber] || [];

    const getPlayerName = (player) => {
      if (player.Snm) return player.Snm;
      if (player.Fn && player.Ln) return `${player.Fn} ${player.Ln}`;
      if (player.Ln) return player.Ln;
      if (player.Fn) return player.Fn;
      return 'Unknown Player';
    };

    const coachData = players.find(p => p.Pon === 'COACH');
    const coach = coachData ? `${coachData.Fn || ''} ${coachData.Ln || ''}`.trim() : 'Unknown Coach';

    const processPlayersByPosition = (position) =>
      players
        .filter(p => p.Pon === position && p.Pos !== 10)
        .map(p => ({
          number: p.Snu,
          name: getPlayerName(p),
          subTime: p.Mo ? `${p.Mo}'` : undefined
        }));

    const substitutes = players
      .filter(p => p.Pon === 'SUBSTITUTE_PLAYER')
      .map(p => ({
        number: p.Snu,
        name: getPlayerName(p),
        used: p.Mo ? `${p.Mo}'` : undefined
      }));

    const processedSubstitutions = substitutions
      .filter(sub => sub.Min)
      .map(sub => {
        const outgoingPlayer = players.find(
          p =>
            (p.Aid === sub.AIDo || p.Pid === sub.IDo) &&
            (p.Pon !== 'SUBSTITUTE_PLAYER' || p.Mo)
        );

        const incomingPlayer = players.find(
          p =>
            (p.Aid === sub.Aid || p.Pid === sub.ID) &&
            p.Pon === 'SUBSTITUTE_PLAYER'
        );

        return {
          time: `${sub.Min}'`,
          out: outgoingPlayer ? getPlayerName(outgoingPlayer) : 'Unknown Player',
          in: incomingPlayer ? getPlayerName(incomingPlayer) : 'Unknown Player'
        };
      })
      .filter(sub => sub.out !== 'Unknown Player' && sub.in !== 'Unknown Player');

    // Use passed team names or fall back to default
    const teamName = teamNumber === 1 
      ? matchTeams?.team1 || `Team A`
      : matchTeams?.team2 || `Team B`;

    return {
      name: teamName,
      coach,
      color: teamNumber === 1 ? 'red' : 'blue',
      formation,
      players: {
        goalkeeper: processPlayersByPosition('GOALKEEPER'),
        defenders: processPlayersByPosition('DEFENDER'),
        midfielders: processPlayersByPosition('MIDFIELDER'),
        forwards: processPlayersByPosition('FORWARD')
      },
      substitutes,
      substitutions: processedSubstitutions
    };
  };

  const teamA = lineUp.Lu?.find(team => team.Tnb === 1);
  const teamB = lineUp.Lu?.find(team => team.Tnb === 2);

  const processedTeamA = teamA ? processTeamData(teamA, 1) : null;
  const processedTeamB = teamB ? processTeamData(teamB, 2) : null;

  // Show no team data available message
  if (!processedTeamA || !processedTeamB) {
    return (
      <div className={styles.matchCard}>
        <div className={styles.matchHeader}>
          <div className={styles.matchInfo}>
            <div className={styles.matchInfoRow}>
              <div className={styles.stadiumInfo}>
                <div className={styles.stadiumName}>🏟️ {stadiumName}</div>
                {city && <div>{translatedText.city}: {city}</div>}
              </div>
              <div className={styles.matchDetails}>
                <div className={styles.matchDate}>📅 {translatedText.date}: {formattedDateTime.split(',')[0]}</div>
                <div>⏰ {translatedText.time}: {formattedDateTime.split(',')[1]?.trim()}</div>
              </div>
              <div className={styles.countryInfo}>
                <div>🌍 {translatedText.country}: {country}</div>
                <div>{translatedText.league}</div>
              </div>
            </div>
          </div>

          <div className={styles.teamsScore}>
            <div className={styles.team}>
              <div className={styles.teamBadge}>🔴</div>
              <div className={styles.teamName}>{matchTeams?.team1 || 'Team A'}</div>
              <div>{translatedText.coach}: Unknown Coach</div>
            </div>
            <div className={styles.vs}>{translatedText.vs}</div>
            <div className={styles.team}>
              <div className={styles.teamBadge}>🔵</div>
              <div className={styles.teamName}>{matchTeams?.team2 || 'Team B'}</div>
              <div>{translatedText.coach}: Unknown Coach</div>
            </div>
          </div>
        </div>

        <div className={styles.noDataSection}>
          <div className={styles.noDataIcon}>❌</div>
          <h2>{translatedText.noTeamData}</h2>
          <p>Team lineups and player information could not be loaded for this match.</p>
          <p>This might be due to:</p>
          <ul className={styles.reasonsList}>
            <li>Match data not yet available</li>
            <li>Incomplete team information</li>
            <li>Network connectivity issues</li>
            <li>Data source temporarily unavailable</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.matchCard}>
      <div className={styles.matchHeader}>
        <div className={styles.matchInfo}>
          <div className={styles.matchInfoRow}>
            <div className={styles.stadiumInfo}>
              <div className={styles.stadiumName}>🏟️ {stadiumName}</div>
              {city && <div>{translatedText.city}: {city}</div>}
            </div>
            <div className={styles.matchDetails}>
              <div className={styles.matchDate}>📅 {translatedText.date}: {formattedDateTime.split(',')[0]}</div>
              <div>⏰ {translatedText.time}: {formattedDateTime.split(',')[1]?.trim()}</div>
            </div>
            <div className={styles.countryInfo}>
              <div>🌍 {translatedText.country}: {country}</div>
              <div>{translatedText.league}</div>
            </div>
          </div>
        </div>

        <div className={styles.teamsScore}>
          <div className={styles.team}>
            <div className={styles.teamBadge}>🔴</div>
            <div className={styles.teamName}>{processedTeamA.name}</div>
            <div>{translatedText.coach}: {processedTeamA.coach}</div>
          </div>
          <div className={styles.vs}>{translatedText.vs}</div>
          <div className={styles.team}>
            <div className={styles.teamBadge}>🔵</div>
            <div className={styles.teamName}>{processedTeamB.name}</div>
            <div>{translatedText.coach}: {processedTeamB.coach}</div>
          </div>
        </div>
      </div>

      <div className={styles.fieldContainer}>
        <Field teamA={processedTeamA} teamB={processedTeamB} />
      </div>

      <div className={styles.lineupsSection}>
        <h3>📋 {translatedText.lineup}</h3>
        <div className={styles.lineupsContainer}>
          <TeamLineup team={processedTeamA} />
          <TeamLineup team={processedTeamB} />
        </div>
      </div>

      <div className={styles.substitutions}>
        <h3>⚽ {translatedText.substitutions}</h3>
        <div className={styles.subsContainer}>
          <div className={styles.teamSubs}>
            <h4>🔴 {processedTeamA.name} {translatedText.subs}</h4>
            {processedTeamA.substitutions.length > 0 ? (
              processedTeamA.substitutions.map((sub, index) => (
                <div key={index} className={styles.subItem}>
                  <span className={styles.subTime}>{sub.time}</span>
                  <span>{sub.out}</span>
                  <span className={styles.subArrow}>↔</span>
                  <span>{sub.in}</span>
                </div>
              ))
            ) : (
              <div style={{ color: '#5d5656' }}>{translatedText.noSubs}</div>
            )}
          </div>
          <div className={styles.teamSubs}>
            <h4>🔵 {processedTeamB.name} {translatedText.subs}</h4>
            {processedTeamB.substitutions.length > 0 ? (
              processedTeamB.substitutions.map((sub, index) => (
                <div key={index} className={styles.subItem}>
                  <span className={styles.subTime}>{sub.time}</span>
                  <span>{sub.out}</span>
                  <span className={styles.subArrow}>↔</span>
                  <span>{sub.in}</span>
                </div>
              ))
            ) : (
              <div style={{ color: '#5d5656' }}>{translatedText.noSubs}</div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.matchStats}>
        <h3>📊 {translatedText.matchStatus}</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>{translatedText.formation}</div>
            <div className={styles.statValue}>{processedTeamA.formation} vs {processedTeamB.formation}</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>{translatedText.totalPlayers}</div>
            <div className={styles.statValue}>22</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>{translatedText.subs}</div>
            <div className={styles.statValue}>
              {processedTeamA.substitutions.length + processedTeamB.substitutions.length} Changes
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>{translatedText.matchStatus}</div>
            <div className={styles.statValue}>{translatedText.completed}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;