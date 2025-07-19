import React from 'react';
import styles from './Field.module.css';

const Field = ({ teamA, teamB }) => {
    console.log(teamA,"consol")
    const handlePlayerClick = (playerName, position) => {
        alert(`Player: ${playerName}\nPosition: ${position}`);
    };

    // Function to render players in specific formations - now horizontal
    const renderFormationLine = (players, teamClass, position, isTeam2 = false) => {
        return players.map((player, index) => {
            const totalPlayers = players.length;

            // Calculate vertical position within the team's half
            const containerHeight = 500; // Approximate height of team formation container
            const spacing = containerHeight / (totalPlayers + 1);
            const topPosition = spacing * (index + 1);

            // Calculate horizontal position based on position type and team
            let leftPosition;
            if (isTeam2) {
                // Team 2 (right side) - positions from right to left
                if (position === 'defenders') {
                    leftPosition = '80%'; // Team 2 defenders close to their goal (right side)
                } else if (position === 'midfielders') {
                    leftPosition = '60%'; // Team 2 midfielders in their half
                } else if (position === 'forwards') {
                    leftPosition = '20%'; // Team 2 forwards attack toward left
                }
            } else {
                // Team 1 (left side) - positions from left to right
                if (position === 'defenders') {
                    leftPosition = '20%'; // Team 1 defenders close to their goal (left side)
                } else if (position === 'midfielders') {
                    leftPosition = '40%'; // Team 1 midfielders in their half
                } else if (position === 'forwards') {
                    leftPosition = '80%'; // Team 1 forwards attack toward right
                }
            }

            const style = {
                position: 'absolute',
                left: leftPosition,
                top: `${topPosition}px`,
                transform: 'translateX(-50%)'
            };

            return (
                <div
                    key={player.number}
                    className={`${styles.player} ${styles[teamClass]}`}
                    onClick={() => handlePlayerClick(player.name, position)}
                    style={style}
                >
                    {player.number}
                    <div className={styles.playerName}>{player.name}</div>
                </div>
            );
        });
    };

    return (
        <div className={styles.fieldContainer}>
            <div className={styles.field}>
                {/* Field markings */}
                <div className={styles.centerLine}></div>
                <div className={styles.centerCircle}></div>
                <div className={styles.centerSpot}></div>

                {/* Team A's half (left side) */}
                <div className={`${styles.penaltyArea} ${styles.left}`}>
                    <div className={styles.goalAreaLeft}></div>
                    <div className={styles.goalLeft}></div>
                </div>

                {/* Team B's half (right side) */}
                <div className={`${styles.penaltyArea} ${styles.right}`}>
                    <div className={styles.goalAreaRight}></div>
                    <div className={styles.goalRight}></div>
                </div>

                {/* Team A Formation (left side) */}
                <div className={`${styles.teamFormation} ${styles.team1}`}>
                    {/* Goalkeeper */}
                    {teamA.players.goalkeeper.map(player => (
                        <div
                            key={player.number}
                            className={`${styles.player} ${styles.team1}`}
                            onClick={() => handlePlayerClick(player.name, 'goalkeeper')}
                            style={{
                                position: 'absolute',
                                left: '5%',
                                top: '50%',
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            {player.number}
                            <div className={styles.playerName}>{player.name}</div>
                        </div>
                    ))}

                    {/* Defenders */}
                    {renderFormationLine(teamA.players.defenders, 'team1', 'defenders', false)}

                    {/* Midfielders */}
                    {renderFormationLine(teamA.players.midfielders, 'team1', 'midfielders', false)}

                    {/* Forwards */}
                    {renderFormationLine(teamA.players.forwards, 'team1', 'forwards', false)}
                </div>

                {/* Team B Formation (right side) - mirrored */}
                <div className={`${styles.teamFormation} ${styles.team2}`}>
                    {/* Goalkeeper */}
                    {teamB.players.goalkeeper.map(player => (
                        <div
                            key={player.number}
                            className={`${styles.player} ${styles.team2}`}
                            onClick={() => handlePlayerClick(player.name, 'goalkeeper')}
                            style={{
                                position: 'absolute',
                                right: '5%',
                                top: '50%',
                                transform: 'translate(50%, -50%)'
                            }}
                        >
                            {player.number}
                            <div className={styles.playerName}>{player.name}</div>
                        </div>
                    ))}

                    {/* Defenders */}
                    {renderFormationLine(teamB.players.defenders, 'team2', 'defenders', true)}

                    {/* Midfielders */}
                    {renderFormationLine(teamB.players.midfielders, 'team2', 'midfielders', true)}

                    {/* Forwards */}
                    {renderFormationLine(teamB.players.forwards, 'team2', 'forwards', true)}
                </div>
            </div>
        </div>
    );
};

export default Field;