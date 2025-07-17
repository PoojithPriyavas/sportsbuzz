import styles from './CricketDashboard.module.css';

const CricketDashboard = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.seriesTitle}>Global Super League 2025</div>
        <div className={styles.matchTitle}>9th Match - T20</div>
        <div className={styles.statusContainer}>
          <span className={styles.statusIndicator}></span>
          <span className={styles.statusText}>Match Complete</span>
        </div>
      </div>

      <div className={styles.matchInfo}>
        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>Date</div>
          <div className={styles.infoValue}>July 17, 2025</div>
        </div>
        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>Format</div>
          <div className={styles.infoValue}>T20 League</div>
        </div>
        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>Toss</div>
          <div className={styles.infoValue}>HBH won, chose to bat</div>
        </div>
        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>Venue</div>
          <div className={styles.infoValue}>Providence Stadium</div>
        </div>
      </div>

      <div className={styles.teamsContainer}>
        <div className={styles.teamCard}>
          <div className={styles.teamShort}>HBH</div>
          <div className={styles.teamName}>Hobart Hurricanes</div>
          <div className={styles.teamStatus}>Batting First</div>
        </div>

        <div className={styles.vsDivider}>VS</div>

        <div className={`${styles.teamCard} ${styles.winner}`}>
          <div className={styles.teamShort}>GAW</div>
          <div className={styles.teamName}>Guyana Amazon Warriors</div>
          <div className={styles.winnerText}>🏆 Winner</div>
        </div>
      </div>

      <div className={styles.resultCard}>
        <div className={styles.resultText}>Guyana Amazon Warriors Won</div>
        <div className={styles.resultMargin}>by 4 wickets</div>
      </div>

      <div className={styles.playerOfMatch}>
        <h3 className={styles.pomHeader}>🏆 Player of the Match</h3>
        <div className={styles.playerName}>Gudakesh Motie</div>
        <div className={styles.playerTeam}>Guyana Amazon Warriors</div>
      </div>

      <div className={styles.squadsContainer}>
        <div className={styles.squadCard}>
          <div className={styles.squadHeader}>Hobart Hurricanes Squad</div>
          <div className={styles.playerGrid}>
            {hurricanesSquad.map((player, index) => (
              <div key={index} className={`${styles.playerItem} ${player.captain ? styles.captain : ''} ${player.keeper ? styles.keeper : ''}`}>
                <div className={styles.playerNameRole}>
                  <span className={styles.playerNameItem}>{player.name}</span>
                  <span className={styles.playerRole}>{player.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.squadCard}>
          <div className={styles.squadHeader}>Guyana Amazon Warriors Squad</div>
          <div className={styles.playerGrid}>
            {warriorsSquad.map((player, index) => (
              <div key={index} className={`${styles.playerItem} ${player.captain ? styles.captain : ''} ${player.keeper ? styles.keeper : ''}`}>
                <div className={styles.playerNameRole}>
                  <span className={styles.playerNameItem}>{player.name}</span>
                  <span className={styles.playerRole}>{player.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.venueInfo}>
        <div className={styles.venueHeader}>🏟️ Venue Information</div>
        <div className={styles.venueDetails}>
          {venueDetails.map((detail, index) => (
            <div key={index} className={styles.infoCard}>
              <div className={styles.infoLabel}>{detail.label}</div>
              <div className={styles.infoValue}>{detail.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.matchOfficials}>
        <div className={styles.officialsHeader}>👨‍⚖️ Match Officials</div>
        <div className={styles.officialsGrid}>
          {officials.map((official, index) => (
            <div key={index} className={styles.infoCard}>
              <div className={styles.infoLabel}>{official.label}</div>
              <div className={styles.infoValue}>{official.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Data
const hurricanesSquad = [
  { name: 'Ben McDermott (C)', role: 'WK-Batsman', captain: true },
  { name: 'Bhanuka Rajapaksa', role: 'WK-Batsman' },
  { name: 'Macalister Wright', role: 'Batsman' },
  { name: 'Jake Doran', role: 'WK-Batsman' },
  { name: 'Nikhil Chaudhary', role: 'Bowling AR' },
  { name: 'Mohammad Nabi', role: 'Bowling AR' },
  { name: 'Odean Smith', role: 'Bowling AR' },
  { name: 'Fabian Allen', role: 'Batting AR' },
  { name: 'Usama Mir', role: 'Bowler' },
  { name: 'Jackson Bird', role: 'Bowler' },
  { name: 'Billy Stanlake', role: 'Bowler' }
];

const warriorsSquad = [
  { name: 'Imran Tahir (C)', role: 'Bowler', captain: true },
  { name: 'Rahmanullah Gurbaz', role: 'WK-Batsman', keeper: true },
  { name: 'Evin Lewis', role: 'Batsman' },
  { name: 'Johnson Charles', role: 'WK-Batsman' },
  { name: 'Moeen Ali', role: 'Batting AR' },
  { name: 'Shimron Hetmyer', role: 'Batsman' },
  { name: 'Sherfane Rutherford', role: 'Batting AR' },
  { name: 'Romario Shepherd', role: 'Bowling AR' },
  { name: 'David Wiese', role: 'Batting AR' },
  { name: 'Dwaine Pretorius', role: 'Bowling AR' },
  { name: 'Gudakesh Motie', role: 'Bowling AR' }
];

const venueDetails = [
  { label: 'Stadium', value: 'Providence Stadium' },
  { label: 'Location', value: 'Guyana, West Indies' },
  { label: 'Capacity', value: '15,000' },
  { label: 'Established', value: '2006' }
];

const officials = [
  { label: 'Umpire 1', name: 'Chris Wright' },
  { label: 'Umpire 2', name: 'Christopher Taylor' },
  { label: '3rd Umpire', name: 'Carl Tuckett' },
  { label: 'Match Referee', name: 'Michael Ragoonath' }
];

export default CricketDashboard;