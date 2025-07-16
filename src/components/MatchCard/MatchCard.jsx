import React from 'react';
import styles from './MatchCard.module.css';
import Field from './Field';
import TeamLineup from './TeamLineup';
import { useGlobalData } from '../Context/ApiContext';

const MatchCard = () => {
    const { footBallMatchDetails, lineUp } = useGlobalData();
    if (!footBallMatchDetails || !lineUp) return <div>Loading...</div>;
    console.log(footBallMatchDetails, "football match");
    console.log(lineUp, "line up");
    // Extract and format match details
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
            hour12: false,
        })
        : 'Unknown Time';

    const referee = footBallMatchDetails?.Refs?.[0]?.Nm || 'N/A';
    const refereeCountry = footBallMatchDetails?.Refs?.[0]?.Cn || '';

    // Function to process team data from API response
    const processTeamData = (teamData, teamNumber) => {
        const players = teamData.Ps || [];
        const formation = teamData.Fo?.join('-') || '4-3-3';
        const substitutions = lineUp.Subs?.[teamNumber] || [];

        // Find coach
        const coachData = players.find(p => p.Pon === "COACH");
        const coach = coachData ? `${coachData.Fn || ''} ${coachData.Ln || ''}`.trim() : 'Unknown Coach';

        // Process players by position
        const processPlayersByPosition = (position) => {
            return players
                .filter(p => p.Pon === position && p.Pos !== 10) // Exclude coach
                .map(p => ({
                    number: p.Snu,
                    name: getPlayerName(p),
                    subTime: p.Mo ? `${p.Mo}'` : undefined
                }));
        };

        // Helper function to get player name
        const getPlayerName = (player) => {
            if (player.Snm) return player.Snm;
            if (player.Fn && player.Ln) return `${player.Fn} ${player.Ln}`;
            if (player.Ln) return player.Ln;
            if (player.Fn) return player.Fn;
            return 'Unknown Player';
        };

        // Process substitutes
        const substitutes = players
            .filter(p => p.Pon === "SUBSTITUTE_PLAYER")
            .map(p => ({
                number: p.Snu,
                name: getPlayerName(p),
                used: p.Mo ? `${p.Mo}'` : undefined
            }));

        // Process substitutions with better player matching
        const processedSubstitutions = substitutions
            .filter(sub => sub.Min) // Filter out invalid substitutions
            .map(sub => {
                // Find outgoing player (either in starting lineup or substitutes that were used)
                const outgoingPlayer = players.find(p =>
                    (p.Aid === sub.AIDo || p.Pid === sub.IDo) &&
                    (p.Pon !== "SUBSTITUTE_PLAYER" || p.Mo)
                );

                // Find incoming player (should be in substitutes)
                const incomingPlayer = players.find(p =>
                    (p.Aid === sub.Aid || p.Pid === sub.ID) &&
                    p.Pon === "SUBSTITUTE_PLAYER"
                );

                return {
                    time: `${sub.Min}'`,
                    out: outgoingPlayer ? getPlayerName(outgoingPlayer) : 'Unknown Player',
                    in: incomingPlayer ? getPlayerName(incomingPlayer) : 'Unknown Player'
                };
            })
            .filter(sub => sub.out !== 'Unknown Player' && sub.in !== 'Unknown Player'); // Filter out unknown substitutions

        return {
            name: `Team ${teamNumber === 1 ? 'A' : 'B'}`,
            coach,
            color: teamNumber === 1 ? 'red' : 'blue',
            formation,
            players: {
                goalkeeper: processPlayersByPosition("GOALKEEPER"),
                defenders: processPlayersByPosition("DEFENDER"),
                midfielders: processPlayersByPosition("MIDFIELDER"),
                forwards: processPlayersByPosition("FORWARD")
            },
            substitutes,
            substitutions: processedSubstitutions
        };
    };

    // Get team data from API response
    const teamA = lineUp.Lu?.find(team => team.Tnb === 1);
    const teamB = lineUp.Lu?.find(team => team.Tnb === 2);

    const processedTeamA = teamA ? processTeamData(teamA, 1) : null;
    const processedTeamB = teamB ? processTeamData(teamB, 2) : null;

    if (!processedTeamA || !processedTeamB) return <div>Loading team data...</div>;

    return (
        <div className={styles.matchCard}>
            <div className={styles.matchHeader}>
                <div className={styles.matchInfo}>
                    <div className={styles.stadiumInfo}>
                        <div className={styles.stadiumName}>🏟️ {stadiumName}</div>
                        {city && <div>City: {city}</div>}
                    </div>
                    <div className={styles.matchDetails}>
                        <div className={styles.matchDate}>📅 {formattedDateTime.split(',')[0]}</div>
                        <div>⏰ {formattedDateTime.split(',')[1]?.trim()}</div>
                    </div>
                    <div className={styles.countryInfo}>
                        <div>🌍 {country}</div>
                        <div>Championship League</div>
                    </div>
                </div>

                {/* TEAM DETAILS */}
                <div className={styles.teamsScore}>
                    <div className={styles.team}>
                        <div className={styles.teamBadge}>🔴</div>
                        <div className={styles.teamName}>{processedTeamA.name}</div>
                        <div>Coach: {processedTeamA.coach}</div>
                    </div>
                    <div className={styles.vs}>VS</div>
                    <div className={styles.team}>
                        <div className={styles.teamBadge}>🔵</div>
                        <div className={styles.teamName}>{processedTeamB.name}</div>
                        <div>Coach: {processedTeamB.coach}</div>
                    </div>
                </div>
            </div>

            <Field teamA={processedTeamA} teamB={processedTeamB} />

            <div className={styles.lineupsSection}>
                <h3>📋 Team Lineups</h3>
                <div className={styles.lineupsContainer}>
                    <TeamLineup team={processedTeamA} />
                    <TeamLineup team={processedTeamB} />
                </div>
            </div>

            <div className={styles.substitutions}>
                <h3>⚽ Match Substitutions</h3>
                <div className={styles.subsContainer}>
                    <div className={styles.teamSubs}>
                        <h4>🔴 {processedTeamA.name} Substitutions</h4>
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
                            <div style={{ color: '#5d5656' }}>No substitutions</div>
                        )}
                    </div>
                    <div className={styles.teamSubs}>
                        <h4>🔵 {processedTeamB.name} Substitutions</h4>
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
                            <div style={{ color: '#5d5656' }}>No substitutions</div>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.matchStats}>
                <h3>📊 Match Information</h3>
                <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                        <div className={styles.statLabel}>Formation</div>
                        <div className={styles.statValue}>{processedTeamA.formation} vs {processedTeamB.formation}</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statLabel}>Total Players</div>
                        <div className={styles.statValue}>22 Players</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statLabel}>Substitutions</div>
                        <div className={styles.statValue}>
                            {processedTeamA.substitutions.length + processedTeamB.substitutions.length} Changes
                        </div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statLabel}>Match Status</div>
                        <div className={styles.statValue}>Completed</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchCard;