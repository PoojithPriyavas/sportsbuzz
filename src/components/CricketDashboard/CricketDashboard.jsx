import React, { useState, useEffect } from 'react';
import styles from './CricketDashboard.module.css';
import { convertToVenueTime, formatMatchTime } from '../../utils/TimeZoneUtils';
import { useGlobalData } from '../Context/ApiContext';

const CricketDashboard = ({ cricketDetails }) => {
  const { language, translateText } = useGlobalData();
  const [translatedText, setTranslatedText] = useState({
    noDataFound: 'No data found',
    infoNotAvailable: 'Cricket match information is not available',
    seriesNameNotAvailable: 'Series Name Not Available',
    match: 'Match',
    format: 'Format',
    dateNotAvailable: 'Date not available',
    venueTimezone: 'Venue timezone',
    matchComplete: 'Match Complete',
    matchInProgress: 'Match in progress',
    matchYetToBegin: 'Match Yet to Begin',
    date: 'Date',
    toss: 'Toss',
    tossInfoNotAvailable: 'Toss information not available',
    wonChoseTo: 'won, chose to',
    venue: 'Venue',
    venueNotSpecified: 'Venue not specified',
    batting: 'Batting',
    bowling: 'Bowling',
    yetToPlay: 'Yet to Play',
    vs: 'VS',
    winner: 'Winner',
    won: 'Won',
    teamSquads: 'Team Squads',
    squadInfoNotAvailable: 'Squad information not available',
    venueInformation: 'Venue Information',
    stadium: 'Stadium',
    notSpecified: 'Not specified',
    location: 'Location',
    capacity: 'Capacity',
    established: 'Established',
    ends: 'Ends',
    matchOfficials: 'Match Officials',
    umpire1: 'Umpire 1',
    umpire2: 'Umpire 2',
    thirdUmpire: '3rd Umpire',
    matchReferee: 'Match Referee',
    additionalInformation: 'Additional Information',
    matchType: 'Match Type',
    dayNight: 'Day/Night',
    yes: 'Yes',
    no: 'No',
    seriesDuration: 'Series Duration'
  });

  useEffect(() => {
    const translateLabels = async () => {
      try {
        // Translate each text individually
        const translations = {
          noDataFound: await translateText('No data found', 'en', language),
          infoNotAvailable: await translateText('Cricket match information is not available', 'en', language),
          seriesNameNotAvailable: await translateText('Series Name Not Available', 'en', language),
          match: await translateText('Match', 'en', language),
          format: await translateText('Format', 'en', language),
          dateNotAvailable: await translateText('Date not available', 'en', language),
          venueTimezone: await translateText('Venue timezone', 'en', language),
          matchComplete: await translateText('Match Complete', 'en', language),
          matchInProgress: await translateText('Match in progress', 'en', language),
          matchYetToBegin: await translateText('Match Yet to Begin', 'en', language),
          date: await translateText('Date', 'en', language),
          toss: await translateText('Toss', 'en', language),
          tossInfoNotAvailable: await translateText('Toss information not available', 'en', language),
          wonChoseTo: await translateText('won, chose to', 'en', language),
          venue: await translateText('Venue', 'en', language),
          venueNotSpecified: await translateText('Venue not specified', 'en', language),
          batting: await translateText('Batting', 'en', language),
          bowling: await translateText('Bowling', 'en', language),
          yetToPlay: await translateText('Yet to Play', 'en', language),
          vs: await translateText('VS', 'en', language),
          winner: await translateText('Winner', 'en', language),
          notSpecified: await translateText('Not specified', 'en', language),
          location: await translateText('Location', 'en', language),
          capacity: await translateText('Capacity', 'en', language),
          established: await translateText('Established', 'en', language),
          ends: await translateText('Ends', 'en', language),
          matchOfficials: await translateText('Match Officials', 'en', language),
          umpire1: await translateText('Umpire 1', 'en', language),
          umpire2: await translateText('Umpire 2', 'en', language),
          thirdUmpire: await translateText('3rd Umpire', 'en', language),
          matchReferee: await translateText('Match Referee', 'en', language),
          additionalInformation: await translateText('Additional Information', 'en', language),
          matchType: await translateText('Match Type', 'en', language),
          dayNight: await translateText('Day/Night', 'en', language),
          yes: await translateText('Yes', 'en', language),
          no: await translateText('No', 'en', language),
          seriesDuration: await translateText('Series Duration', 'en', language)
        };

        // Update translations in state
        setTranslatedText(prev => ({
          ...prev,
          ...translations
        }));

        // Cache translations
        localStorage.setItem('cricketDashboardTranslations', JSON.stringify({
          language,
          translations
        }));

      } catch (error) {
        console.error('Error translating cricket dashboard labels:', error);
      }
    };

    // Check for cached translations first
    const cachedTranslations = localStorage.getItem('cricketDashboardTranslations');
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

  // Check if there's no data at all
  if (!cricketDetails) {
    return (
      <div className={styles.noDataContainer}>
        <div className={styles.noDataContent}>
          <div className={styles.noDataIcon}>🏏</div>
          <div className={styles.noDataText}>{translatedText.noDataFound}</div>
          <div className={styles.noDataSubtext}>{translatedText.infoNotAvailable}</div>
        </div>
      </div>
    );
  }

  // Extract data from the new structure
  const {
    matchid,
    seriesid,
    seriesname = translatedText.seriesNameNotAvailable,
    matchdesc = translatedText.match,
    matchformat = translatedText.format,
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
    : translatedText.dateNotAvailable;
    
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
    if (!tossStatus) return translatedText.tossInfoNotAvailable;
    
    // Handle format like "Warwickshire opt to bowl"
    const parts = tossStatus.split(' opt to ');
    if (parts.length === 2) {
      return `${parts[0]} ${translatedText.wonChoseTo} ${parts[1]}`;
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
          {timezoneInfo && <span className={styles.timezoneInfo} title={`${translatedText.venueTimezone}: ${venueinfo.timezone}`}>{timezoneInfo}</span>}
        </div>
        <div className={styles.statusContainer}>
          <span className={styles.statusIndicator}></span>
          <span className={styles.statusText}>
            {isMatchComplete ? translatedText.matchComplete : 
             isMatchInProgress ? status || state || translatedText.matchInProgress : translatedText.matchYetToBegin}
          </span>
        </div>
      </div>

      <div className={styles.matchInfo}>
        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>{translatedText.date}</div>
          <div className={styles.infoValue}>{matchDate}</div>
        </div>
        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>{translatedText.format}</div>
          <div className={styles.infoValue}>{matchformat || translatedText.notSpecified}</div>
        </div>
        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>{translatedText.toss}</div>
          <div className={styles.infoValue}>{tossInfo}</div>
        </div>
        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>{translatedText.venue}</div>
          <div className={styles.infoValue}>{venueinfo?.ground || translatedText.venueNotSpecified}</div>
        </div>
      </div>

      {team1?.teamname && team2?.teamname && (
        <div className={styles.teamsContainer}>
          <div className={`${styles.teamCard} ${battingTeam?.teamid === team1?.teamid ? styles.battingTeam : ''}`}>
            <div className={styles.teamShort}>{team1?.teamsname || "T1"}</div>
            <div className={styles.teamName}>{team1?.teamname || "Team 1"}</div>
            <div className={styles.teamStatus}>
              {battingTeam?.teamid === team1?.teamid ? translatedText.batting : 
               bowlingTeam?.teamid === team1?.teamid ? translatedText.bowling : translatedText.yetToPlay}
            </div>
          </div>

          <div className={styles.vsDivider}>{translatedText.vs}</div>

          <div className={`${styles.teamCard} ${battingTeam?.teamid === team2?.teamid ? styles.battingTeam : ''} ${winnerTeam && winnerTeam.teamid === team2?.teamid ? styles.winner : ''}`}>
            <div className={styles.teamShort}>{team2?.teamsname || "T2"}</div>
            <div className={styles.teamName}>{team2?.teamname || "Team 2"}</div>
            {winnerTeam && winnerTeam.teamid === team2?.teamid ? (
              <div className={styles.winnerText}>🏆 {translatedText.winner}</div>
            ) : (
              <div className={styles.teamStatus}>
                {battingTeam?.teamid === team2?.teamid ? translatedText.batting : 
                 bowlingTeam?.teamid === team2?.teamid ? translatedText.bowling : translatedText.yetToPlay}
              </div>
            )}
          </div>
        </div>
      )}

      {isMatchComplete && winnerTeam && (
        <div className={styles.resultCard}>
          <div className={styles.resultText}>{winnerTeam?.teamname || "Team"} {translatedText.won}</div>
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
          <div className={styles.squadHeader}>{translatedText.teamSquads}</div>
          <div className={styles.noSquadData}>
            {translatedText.squadInfoNotAvailable}
          </div>
        </div>
      </div>

      <div className={styles.venueInfo}>
        <div className={styles.venueHeader}>🏟️ {translatedText.venueInformation}</div>
        <div className={styles.venueDetails}>
          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>{translatedText.stadium}</div>
            <div className={styles.infoValue}>{venueinfo?.ground || translatedText.notSpecified}</div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>{translatedText.location}</div>
            <div className={styles.infoValue}>
              {venueinfo?.city || ""}{venueinfo?.city && venueinfo?.country ? ', ' : ''}{venueinfo?.country || ""}
            </div>
          </div>
          {venueinfo?.capacity && (
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>{translatedText.capacity}</div>
              <div className={styles.infoValue}>{venueinfo.capacity}</div>
            </div>
          )}
          {venueinfo?.established && (
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>{translatedText.established}</div>
              <div className={styles.infoValue}>{venueinfo.established}</div>
            </div>
          )}
          {venueinfo?.ends && (
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>{translatedText.ends}</div>
              <div className={styles.infoValue}>{venueinfo.ends}</div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.matchOfficials}>
        <div className={styles.officialsHeader}>👨‍⚖️ {translatedText.matchOfficials}</div>
        <div className={styles.officialsGrid}>
          {umpire1?.name && (
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>{translatedText.umpire1}</div>
              <div className={styles.infoValue}>{umpire1.name} ({umpire1.country})</div>
            </div>
          )}
          {umpire2?.name && (
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>{translatedText.umpire2}</div>
              <div className={styles.infoValue}>{umpire2.name} ({umpire2.country})</div>
            </div>
          )}
          {umpire3?.name && (
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>{translatedText.thirdUmpire}</div>
              <div className={styles.infoValue}>{umpire3.name} ({umpire3.country})</div>
            </div>
          )}
          {referee?.name && (
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>{translatedText.matchReferee}</div>
              <div className={styles.infoValue}>{referee.name} ({referee.country})</div>
            </div>
          )}
        </div>
      </div>

      {/* Additional match information from new structure */}
      <div className={styles.additionalInfo}>
        <div className={styles.additionalHeader}>📋 {translatedText.additionalInformation}</div>
        <div className={styles.venueDetails}>
          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>{translatedText.matchType}</div>
            <div className={styles.infoValue}>{matchtype || translatedText.notSpecified}</div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>{translatedText.dayNight}</div>
            <div className={styles.infoValue}>{daynight ? translatedText.yes : translatedText.no}</div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>{translatedText.seriesDuration}</div>
            <div className={styles.infoValue}>
              {cricketDetails.seriesstartdt && cricketDetails.seriesenddt 
                ? `${new Date(cricketDetails.seriesstartdt).toLocaleDateString()} - ${new Date(cricketDetails.seriesenddt).toLocaleDateString()}`
                : translatedText.notSpecified
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CricketDashboard;