import styles from './CricketDashboard.module.css';
import { convertToVenueTime, formatMatchTime } from '../../utils/TimeZoneUtils';

const CricketDashboard = ({ cricketDetails }) => {
  console.log(cricketDetails, "cricket data")
  
  // Check if there's no data at all
  if (!cricketDetails) {
    return (
      <div className={styles.noDataContainer}>
        <div className={styles.noDataContent}>
          <div className={styles.noDataIcon}>🏏</div>
          <div className={styles.noDataText}>No data found</div>
          <div className={styles.noDataSubtext}>Cricket match information is not available</div>
        </div>
      </div>
    );
  }

  // Extract data from the new structure
  const {
    matchid,
    seriesid,
    seriesname = "Series Name Not Available",
    matchdesc = "Match",
    matchformat = "Format",
    startdate = 0,
    enddate = 0,
    state = "",
    status = "",
    team1 = {},
    team2 = {},
    umpire1 = {},
    umpire2 = {},
    umpire3 = {},
    referee = {},
    venueinfo = {},
    currbatteamid = 0,
    tossstatus = "",
    shortstatus = "",
    matchtype = "",
    daynight = false
  } = cricketDetails;

  // Format date with fallback using timezone conversion
  const venueTimezone = venueinfo?.timezone || '+00:00';
  const matchDateObj = startdate ? convertToVenueTime(startdate, venueTimezone) : null;
  const matchDate = matchDateObj 
    ? formatMatchTime(matchDateObj, { dateFormat: 'long', showTime: true, timeFormat: '12h' })
    : "Date not available";
    
  // Add timezone information to display
  const timezoneInfo = venueinfo?.timezone ? `(${venueinfo.timezone})` : '';

  // Determine match status
  const isMatchComplete = state === 'Complete' || shortstatus === 'Complete';
  const isMatchInProgress = state === 'In Progress' || state === 'Stumps' || state === 'Live';

  // Determine batting team
  const battingTeam = currbatteamid === team1?.teamid ? team1 : 
                     currbatteamid === team2?.teamid ? team2 : null;
  const bowlingTeam = currbatteamid === team1?.teamid ? team2 : 
                      currbatteamid === team2?.teamid ? team1 : null;

  // Parse toss information
  const parseTossInfo = (tossStatus) => {
    if (!tossStatus) return "Toss information not available";
    
    // Handle format like "Warwickshire opt to bowl"
    const parts = tossStatus.split(' opt to ');
    if (parts.length === 2) {
      return `${parts[0]} won, chose to ${parts[1]}`;
    }
    
    return tossStatus;
  };

  const tossInfo = parseTossInfo(tossstatus);

  // For now, we'll show placeholder data for squads since they're not in the new structure
  // This would need to be fetched from a separate endpoint
  const team1PlayingXI = [];
  const team2PlayingXI = [];

  // Winner determination would need additional data from match result
  const winnerTeam = null; // This would come from match result data

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.seriesTitle}>{seriesname}</div>
        <div className={styles.matchTitle}>
          {matchdesc} - {matchformat}
        </div>
        <div className={styles.matchDateTime}>
          <span className={styles.calendarIcon}>🗓️</span> {matchDate}
          {timezoneInfo && <span className={styles.timezoneInfo} title={`Venue timezone: ${venueinfo.timezone}`}>{timezoneInfo}</span>}
        </div>
        <div className={styles.statusContainer}>
          <span className={styles.statusIndicator}></span>
          <span className={styles.statusText}>
            {isMatchComplete ? 'Match Complete' : 
             isMatchInProgress ? status || state || 'Match in progress' : 'Match Yet to Begin'}
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
          <div className={styles.infoValue}>{matchformat || "Not specified"}</div>
        </div>
        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>Toss</div>
          <div className={styles.infoValue}>{tossInfo}</div>
        </div>
        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>Venue</div>
          <div className={styles.infoValue}>{venueinfo?.ground || "Venue not specified"}</div>
        </div>
      </div>

      {team1?.teamname && team2?.teamname && (
        <div className={styles.teamsContainer}>
          <div className={`${styles.teamCard} ${battingTeam?.teamid === team1?.teamid ? styles.battingTeam : ''}`}>
            <div className={styles.teamShort}>{team1?.teamsname || "T1"}</div>
            <div className={styles.teamName}>{team1?.teamname || "Team 1"}</div>
            <div className={styles.teamStatus}>
              {battingTeam?.teamid === team1?.teamid ? 'Batting' : 
               bowlingTeam?.teamid === team1?.teamid ? 'Bowling' : 'Yet to Play'}
            </div>
          </div>

          <div className={styles.vsDivider}>VS</div>

          <div className={`${styles.teamCard} ${battingTeam?.teamid === team2?.teamid ? styles.battingTeam : ''} ${winnerTeam && winnerTeam.teamid === team2?.teamid ? styles.winner : ''}`}>
            <div className={styles.teamShort}>{team2?.teamsname || "T2"}</div>
            <div className={styles.teamName}>{team2?.teamname || "Team 2"}</div>
            {winnerTeam && winnerTeam.teamid === team2?.teamid ? (
              <div className={styles.winnerText}>🏆 Winner</div>
            ) : (
              <div className={styles.teamStatus}>
                {battingTeam?.teamid === team2?.teamid ? 'Batting' : 
                 bowlingTeam?.teamid === team2?.teamid ? 'Bowling' : 'Yet to Play'}
              </div>
            )}
          </div>
        </div>
      )}

      {isMatchComplete && winnerTeam && (
        <div className={styles.resultCard}>
          <div className={styles.resultText}>{winnerTeam?.teamname || "Team"} Won</div>
          {/* Result margin would come from additional match result data */}
        </div>
      )}

      {/* Player of the Match section - would need additional data */}
      {/* This section is commented out as the data is not available in the new structure */}
      {/*
      {playersOfTheMatch?.length > 0 && (
        <div className={styles.playerOfMatch}>
          <h3 className={styles.pomHeader}>🏆 Player of the Match</h3>
          <div className={styles.playerName}>{playersOfTheMatch[0]?.name || "Not announced"}</div>
          <div className={styles.playerTeam}>{playersOfTheMatch[0]?.teamName || ""}</div>
        </div>
      )}Squad information not available in current data structure. This would need to be fetched from a separate endpoint.
      */}

      {/* Squad information would need to be fetched from a separate endpoint */}
      {/* This section shows placeholder message since squad data is not in the new structure */}
      <div className={styles.squadsContainer}>
        <div className={styles.squadCard}>
          <div className={styles.squadHeader}>Team Squads</div>
          <div className={styles.noSquadData}>
            Squad information not available
          </div>
        </div>
      </div>

      <div className={styles.venueInfo}>
        <div className={styles.venueHeader}>🏟️ Venue Information</div>
        <div className={styles.venueDetails}>
          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>Stadium</div>
            <div className={styles.infoValue}>{venueinfo?.ground || "Not specified"}</div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>Location</div>
            <div className={styles.infoValue}>
              {venueinfo?.city || ""}{venueinfo?.city && venueinfo?.country ? ', ' : ''}{venueinfo?.country || ""}
            </div>
          </div>
          {venueinfo?.capacity && (
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>Capacity</div>
              <div className={styles.infoValue}>{venueinfo.capacity}</div>
            </div>
          )}
          {venueinfo?.established && (
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>Established</div>
              <div className={styles.infoValue}>{venueinfo.established}</div>
            </div>
          )}
          {venueinfo?.ends && (
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>Ends</div>
              <div className={styles.infoValue}>{venueinfo.ends}</div>
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
              <div className={styles.infoValue}>{umpire1.name} ({umpire1.country})</div>
            </div>
          )}
          {umpire2?.name && (
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>Umpire 2</div>
              <div className={styles.infoValue}>{umpire2.name} ({umpire2.country})</div>
            </div>
          )}
          {umpire3?.name && (
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>3rd Umpire</div>
              <div className={styles.infoValue}>{umpire3.name} ({umpire3.country})</div>
            </div>
          )}
          {referee?.name && (
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>Match Referee</div>
              <div className={styles.infoValue}>{referee.name} ({referee.country})</div>
            </div>
          )}
        </div>
      </div>

      {/* Additional match information from new structure */}
      <div className={styles.additionalInfo}>
        <div className={styles.additionalHeader}>📋 Additional Information</div>
        <div className={styles.venueDetails}>
          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>Match Type</div>
            <div className={styles.infoValue}>{matchtype || "Not specified"}</div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>Day/Night</div>
            <div className={styles.infoValue}>{daynight ? "Yes" : "No"}</div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>Series Duration</div>
            <div className={styles.infoValue}>
              {cricketDetails.seriesstartdt && cricketDetails.seriesenddt 
                ? `${new Date(cricketDetails.seriesstartdt).toLocaleDateString()} - ${new Date(cricketDetails.seriesenddt).toLocaleDateString()}`
                : "Not specified"
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CricketDashboard;