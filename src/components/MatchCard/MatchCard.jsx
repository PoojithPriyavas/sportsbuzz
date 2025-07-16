import React from 'react';
import styles from './MatchCard.module.css';
import Field from './Field';
import TeamLineup from './TeamLineup';

const MatchCard = () => {
    const teamA = {
        name: "Team A",
        coach: "Rafael Urazbahtin",
        color: "red",
        formation: "4-3-3",
        players: {
            goalkeeper: [{ number: 1, name: "Aleksandr Zarutskiy" }],
            defenders: [
                { number: 24, name: "Aleksandr Mrynskiy", subTime: "61'" },
                { number: 14, name: "Aleksandr Martynovich" },
                { number: 80, name: "Egor Sorokin" },
                { number: 3, name: "Luis Mata" }
            ],
            midfielders: [
                { number: 20, name: "Erkin Tapalov" },
                { number: 18, name: "Dan Glazer", subTime: "83'" },
                { number: 4, name: "Damir Kassabulat" }
            ],
            forwards: [
                { number: 7, name: "Jorge Gabriel Jorginho", subTime: "83'" },
                { number: 26, name: "Edmilson Filho", subTime: "71'" },
                { number: 9, name: "Dastan Satpaev", subTime: "61'" }
            ]
        },
        substitutes: [
            { number: 77, name: "Temirlan Anarbekov" },
            { number: 6, name: "Adilet Sadybekov", used: "83'" },
            { number: 10, name: "Giorgi Zaria", used: "61'" },
            { number: 33, name: "Jug Stanojev", used: "61'" },
            { number: 55, name: "Valeri Gromyko", used: "71'" },
            { number: 99, name: "Ricardinho", used: "83'" }
        ],
        substitutions: [
            { time: "61'", out: "Dastan Satpaev", in: "Giorgi Zaria" },
            { time: "61'", out: "Aleksandr Mrynskiy", in: "Jug Stanojev" },
            { time: "71'", out: "Edmilson Filho", in: "Valeri Gromyko" },
            { time: "83'", out: "Dan Glazer", in: "Adilet Sadybekov" },
            { time: "83'", out: "Jorginho", in: "Ricardinho" }
        ]
    };

    const teamB = {
        name: "Team B",
        coach: "Jorge Simao",
        color: "blue",
        formation: "4-3-3",
        players: {
            goalkeeper: [{ number: 36, name: "Gal Lubej Fink" }],
            defenders: [
                { number: 28, name: "Diga" },
                { number: 4, name: "Veljko Jelenkovic" },
                { number: 17, name: "Ahmet Muhamedbegovic" },
                { number: 11, name: "Alex Blanco", subTime: "78'" }
            ],
            midfielders: [
                { number: 34, name: "Agustin Doffo" },
                { number: 6, name: "Peter Agba" },
                { number: 23, name: "Diogo Pinto", subTime: "39'" }
            ],
            forwards: [
                { number: 9, name: "Dino Kojić", subTime: "56'" },
                { number: 24, name: "Alex Tamm", subTime: "78'" },
                { number: 18, name: "Marko Brest", subTime: "39'" }
            ]
        },
        substitutes: [
            { number: 52, name: "Matevz Dajcar" },
            { number: 3, name: "Jost Urbancic", used: "78'" },
            { number: 10, name: "Dimitar Mitrovski", used: "39'" },
            { number: 19, name: "Ivan Durdov", used: "39'" },
            { number: 21, name: "Manuel Pedreno", used: "78'" },
            { number: 99, name: "Antonio Marin", used: "56'" }
        ],
        substitutions: [
            { time: "39'", out: "Marko Brest", in: "Dimitar Mitrovski" },
            { time: "39'", out: "Diogo Pinto", in: "Ivan Durdov" },
            { time: "56'", out: "Dino Kojić", in: "Antonio Marin" },
            { time: "78'", out: "Alex Blanco", in: "Jost Urbancic" },
            { time: "78'", out: "Alex Tamm", in: "Manuel Pedreno" }
        ]
    };

    return (
        <div className={styles.matchCard}>
            <div className={styles.matchHeader}>
                <div className={styles.matchInfo}>
                    <div className={styles.stadiumInfo}>
                        <div className={styles.stadiumName}>🏟️ Central Stadium</div>
                        <div>Capacity: 45,000</div>
                    </div>
                    <div className={styles.matchDetails}>
                        <div className={styles.matchDate}>📅 July 16, 2025</div>
                        <div>⏰ 19:00 Local Time</div>
                    </div>
                    <div className={styles.countryInfo}>
                        <div>🌍 Kazakhstan</div>
                        <div>Championship League</div>
                    </div>
                </div>

                <div className={styles.teamsScore}>
                    <div className={styles.team}>
                        <div className={styles.teamBadge}>🔴</div>
                        <div className={styles.teamName}>{teamA.name}</div>
                        <div>Coach: {teamA.coach}</div>
                    </div>
                    <div className={styles.vs}>VS</div>
                    <div className={styles.team}>
                        <div className={styles.teamBadge}>🔵</div>
                        <div className={styles.teamName}>{teamB.name}</div>
                        <div>Coach: {teamB.coach}</div>
                    </div>
                </div>
            </div>

            <Field teamA={teamA} teamB={teamB} />

            <div className={styles.lineupsSection}>
                <h3>📋 Team Lineups</h3>
                <div className={styles.lineupsContainer}>
                    <TeamLineup team={teamA} />
                    <TeamLineup team={teamB} />
                </div>
            </div>

            <div className={styles.substitutions}>
                <h3>⚽ Match Substitutions</h3>
                <div className={styles.subsContainer}>
                    <div className={styles.teamSubs}>
                        <h4>🔴 {teamA.name} Substitutions</h4>
                        {teamA.substitutions.map((sub, index) => (
                            <div key={index} className={styles.subItem}>
                                <span className={styles.subTime}>{sub.time}</span>
                                <span>{sub.out}</span>
                                <span className={styles.subArrow}>↔</span>
                                <span>{sub.in}</span>
                            </div>
                        ))}
                    </div>
                    <div className={styles.teamSubs}>
                        <h4>🔵 {teamB.name} Substitutions</h4>
                        {teamB.substitutions.map((sub, index) => (
                            <div key={index} className={styles.subItem}>
                                <span className={styles.subTime}>{sub.time}</span>
                                <span>{sub.out}</span>
                                <span className={styles.subArrow}>↔</span>
                                <span>{sub.in}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.matchStats}>
                <h3>📊 Match Information</h3>
                <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                        <div className={styles.statLabel}>Formation</div>
                        <div className={styles.statValue}>{teamA.formation} vs {teamB.formation}</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statLabel}>Total Players</div>
                        <div className={styles.statValue}>22 Players</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statLabel}>Substitutions</div>
                        <div className={styles.statValue}>10 Changes</div>
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