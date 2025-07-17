import styles from './CricketDashboard.module.css';

const CricketDashboard = ({ cricketDetails }) => {
  if (!cricketDetails || !cricketDetails.matchInfo) {
    return <div>Loading match data...</div>;
  }

  const {
    matchInfo = {},
    venueInfo = {}
  } = cricketDetails;

  // Provide fallback empty objects for nested properties
  const {
    series = {},
    team1 = {},
    team2 = {},
    umpire1 = {},
    umpire2 = {},
    umpire3 = {},
    referee = {},
    tossResults = {},
    result = {},
    venue = {},
    status = "",
    playersOfTheMatch = [],
    matchTeamInfo = [],
    matchDescription = "",
    matchFormat = "",
    matchStartTimestamp = 0,
    matchCompleteTimestamp = 0
  } = matchInfo;

  // Format date with fallback
  const matchDate = matchStartTimestamp 
    ? new Date(matchStartTimestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : "Date not available";

  // Determine match status
  const isMatchComplete = matchInfo.complete || false;
  const isMatchInProgress = matchInfo.state === 'inprogress';

  // Get playing XI for each team with fallbacks
  const getPlayingXI = (team = {}) => {
    return (team.playerDetails || []).filter(player => !player?.substitute);
  };

  const team1PlayingXI = getPlayingXI(team1);
  const team2PlayingXI = getPlayingXI(team2);

  // Determine batting and bowling teams with fallbacks
  const currentInning = matchTeamInfo[0] || {}; 
  const battingTeam = currentInning.battingTeamId === team1?.id ? team1 : team2;
  const bowlingTeam = currentInning.bowlingTeamId === team1?.id ? team1 : team2;

  // Determine winner if match is complete
  const winnerTeam = result?.winningTeam 
    ? (result.winningTeam === team1?.name ? team1 : team2) 
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.seriesTitle}>{series?.name || "Series Name Not Available"}</div>
        <div className={styles.matchTitle}>
          {matchDescription || "Match"} - {matchFormat || "Format"}
        </div>
        <div className={styles.statusContainer}>
          <span className={styles.statusIndicator}></span>
          <span className={styles.statusText}>
            {isMatchComplete ? 'Match Complete' : 
             isMatchInProgress ? status || 'Match in progress' : 'Match Yet to Begin'}
          </span>
        </div>
      </div>

      <div className={styles.matchInfo}>
        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>Date</div>
          <div className={styles.infoValue}>{matchDate}</div>
        </div>
        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>Format</div>
          <div className={styles.infoValue}>{matchFormat || "Not specified"}</div>
        </div>
        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>Toss</div>
          <div className={styles.infoValue}>
            {tossResults?.tossWinnerName 
              ? `${tossResults.tossWinnerName} won, chose to ${tossResults.decision?.toLowerCase() || "play"}` 
              : "Toss information not available"}
          </div>
        </div>
        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>Venue</div>
          <div className={styles.infoValue}>{venue?.name || "Venue not specified"}</div>
        </div>
      </div>

      {team1?.name && team2?.name && (
        <div className={styles.teamsContainer}>
          <div className={`${styles.teamCard} ${battingTeam?.id === team1?.id ? styles.battingTeam : ''}`}>
            <div className={styles.teamShort}>{team1?.shortName || "T1"}</div>
            <div className={styles.teamName}>{team1?.name || "Team 1"}</div>
            <div className={styles.teamStatus}>
              {battingTeam?.id === team1?.id ? 'Batting' : 'Bowling'}
            </div>
          </div>

          <div className={styles.vsDivider}>VS</div>

          <div className={`${styles.teamCard} ${battingTeam?.id === team2?.id ? styles.battingTeam : ''} ${winnerTeam && winnerTeam.id === team2?.id ? styles.winner : ''}`}>
            <div className={styles.teamShort}>{team2?.shortName || "T2"}</div>
            <div className={styles.teamName}>{team2?.name || "Team 2"}</div>
            {winnerTeam && winnerTeam.id === team2?.id ? (
              <div className={styles.winnerText}>🏆 Winner</div>
            ) : (
              <div className={styles.teamStatus}>
                {battingTeam?.id === team2?.id ? 'Batting' : 'Bowling'}
              </div>
            )}
          </div>
        </div>
      )}

      {isMatchComplete && winnerTeam && (
        <div className={styles.resultCard}>
          <div className={styles.resultText}>{winnerTeam?.name || "Team"} Won</div>
          {result?.winMargin && (
            <div className={styles.resultMargin}>
              by {result.winByRuns ? `${result.winMargin} runs` : `${result.winMargin} wickets`}
            </div>
          )}
        </div>
      )}

      {playersOfTheMatch?.length > 0 && (
        <div className={styles.playerOfMatch}>
          <h3 className={styles.pomHeader}>🏆 Player of the Match</h3>
          <div className={styles.playerName}>{playersOfTheMatch[0]?.name || "Not announced"}</div>
          <div className={styles.playerTeam}>{playersOfTheMatch[0]?.teamName || ""}</div>
        </div>
      )}

      <div className={styles.squadsContainer}>
        {team1?.name && (
          <div className={styles.squadCard}>
            <div className={styles.squadHeader}>{team1?.name || "Team 1"} Squad</div>
            <div className={styles.playerGrid}>
              {team1PlayingXI.map((player, index) => (
                <div key={index} className={`${styles.playerItem} ${player?.captain ? styles.captain : ''} ${player?.keeper ? styles.keeper : ''}`}>
                  <div className={styles.playerNameRole}>
                    <span className={styles.playerNameItem}>
                      {player?.name || "Player"}{player?.captain ? ' (C)' : ''}
                    </span>
                    <span className={styles.playerRole}>{player?.role || ""}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {team2?.name && (
          <div className={styles.squadCard}>
            <div className={styles.squadHeader}>{team2?.name || "Team 2"} Squad</div>
            <div className={styles.playerGrid}>
              {team2PlayingXI.map((player, index) => (
                <div key={index} className={`${styles.playerItem} ${player?.captain ? styles.captain : ''} ${player?.keeper ? styles.keeper : ''}`}>
                  <div className={styles.playerNameRole}>
                    <span className={styles.playerNameItem}>
                      {player?.name || "Player"}{player?.captain ? ' (C)' : ''}
                    </span>
                    <span className={styles.playerRole}>{player?.role || ""}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.venueInfo}>
        <div className={styles.venueHeader}>🏟️ Venue Information</div>
        <div className={styles.venueDetails}>
          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>Stadium</div>
            <div className={styles.infoValue}>{venue?.name || "Not specified"}</div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>Location</div>
            <div className={styles.infoValue}>
              {venue?.city || ""}{venue?.city && venue?.country ? ', ' : ''}{venue?.country || ""}
            </div>
          </div>
          {venueInfo?.capacity && (
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>Capacity</div>
              <div className={styles.infoValue}>{venueInfo.capacity}</div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.matchOfficials}>
        <div className={styles.officialsHeader}>👨‍⚖️ Match Officials</div>
        <div className={styles.officialsGrid}>
          {umpire1?.name && (
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>Umpire 1</div>
              <div className={styles.infoValue}>{umpire1.name}</div>
            </div>
          )}
          {umpire2?.name && (
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>Umpire 2</div>
              <div className={styles.infoValue}>{umpire2.name}</div>
            </div>
          )}
          {umpire3?.name && (
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>3rd Umpire</div>
              <div className={styles.infoValue}>{umpire3.name}</div>
            </div>
          )}
          {referee?.name && (
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>Match Referee</div>
              <div className={styles.infoValue}>{referee.name}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CricketDashboard;