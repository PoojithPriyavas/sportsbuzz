'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import CustomAxios from '../utilities/CustomAxios';
import axios from 'axios';
import { fetchTournaments } from '@/pages/api/get-tournaments';
import { fetchOneXTournaments } from '@/pages/api/get-onex-tournaments';
import { fetchEventsIds } from '@/pages/api/get-events';
import { fetchOneXEventsIds } from '@/pages/api/get-onex-events';
import { fetchSportEventDetails } from '@/pages/api/get-teamnames';
import { fetchOneXSportEventDetails } from '@/pages/api/get-onex-teamnames';
import { countryTimezones } from '../utilities/CountryTimezones';
import { useCallback } from 'react';
import { parseUrlPath } from '../utilities/ParseUrl';
import { usePathname } from 'next/navigation';


const DataContext = createContext();


export const DataProvider = ({ children }) => {
    const [blogCategories, setBlogCategories] = useState([]);
    const [recentBlogs, setrecentBlogs] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [sections, setSections] = useState([]);
    const [bestSections, setBestSections] = useState([]);
    // const [sport, setSport] = useState('cricket');

    const pathname = usePathname();
    //  TIME ZONE IMPLEMENTATION

    const [currentTimezone, setCurrentTimezone] = useState('+0.00');

    const getTimezoneByCountryCode = (code) => {
        const country = countryTimezones.find(item => item[0] === code);
        console.log(country, "countrydfdfgdfgd")
        return country ? country[1] : '+0.00';
    };

    // GET COUNTRY CODE API IMPLEMENTATION

    const [countryCode, setCountryCode] = useState({});

    const getCountryCode = async () => {
        try {
            const { countryCode: urlCountryCode } = parseUrlPath(pathname);

            if (!urlCountryCode) {
                const res = await CustomAxios.get('/get-country-code');
                setCountryCode(res.data || {});
                setCurrentTimezone(getTimezoneByCountryCode(res.data.country_code));
            }
        } catch (error) {
            console.error('Failed to fetch country code:', error);
        }
    };
    console.log(countryCode, "country code")

    // FETCH LOCATION

    const [location, setLocation] = useState([]);

    const fetchLocation = async () => {
        try {
            const res = await CustomAxios.get('/locations');
            setLocation(res.data || []);
        } catch (error) {
            console.error('Failed to fetch locations:', error);
        }
    };


    // TRANSLATION API IMPLEMENTATION

    const [language, setLanguage] = useState('en');

    const translateText = async (text, from = 'en', toLang = language) => {
        const langMap = {
            English: 'en',
            Malayalam: 'ml',
        };
        const to = langMap[toLang] || toLang;
        const fromCode = langMap[from] || from;

        if (fromCode === to) return text;

        try {
            const response = await axios.post('/api/translate', {
                text,
                from: fromCode,
                to,
            });
            return response.data;
        } catch (error) {
            console.error('Translation error:', error);
            return text;
        }
    };


    // LANGUAGE BASED ON THE URL

    useEffect(() => {
        const { countryCode: urlCountryCode, language: urlLanguage } = parseUrlPath(pathname);

        // Only proceed if we have values from URL
        if (urlCountryCode || urlLanguage) {
            // Set language from URL if available and valid
            if (urlLanguage) {
                const isValidLanguage = location.some(loc => loc.hreflang === urlLanguage);
                if (isValidLanguage) {
                    setLanguage(urlLanguage);
                    localStorage.setItem('language', urlLanguage);
                }
            }

            // Set country code from URL if available
            if (urlCountryCode) {
                const matchedLocation = location.find(loc => loc.country_code === urlCountryCode);
                if (matchedLocation) {
                    setCountryCode({
                        country_code: urlCountryCode,
                        location: matchedLocation
                    });
                }
            }
        }
    }, [pathname, location]);


    //SPORT CHANGE CONDITION

    const [sport, setSport] = useState(() => {
        // Get from localStorage if available
        if (typeof window !== 'undefined') {
            return localStorage.getItem('selectedSport') || 'cricket';
        }
        return 'cricket';
    });

    // Add this effect to update sport when country code changes
    useEffect(() => {
        if (countryCode?.location?.sports) {
            const apiSport = countryCode.location.sports.toLowerCase();
            if (apiSport !== sport) {
                setSport(apiSport);
                localStorage.setItem('selectedSport', apiSport);
            }
        }
    }, [countryCode]);

    // SETTINGS-API IMPLEMENTATION
    const [settings, setSettings] = useState([]);

    const fetchSettings = async () => {
        try {
            const response = await CustomAxios.get('/settings');
            setSettings(response.data);
        } catch (error) {
            console.error('Error fetching blog categories:', error);
        }
    };

    //-------------------22-BET SECTION-------------------//

    // TOURNAMENT API IMPLEMENTATION

    const [tournament, setTournament] = useState([]);

    const fetchTournamentsData = async (token) => {
        try {
            const data = await fetchTournaments(token);
            setTournament(data);
        } catch (err) {
            console.error('Failed to fetch tournaments:', err);
        }
    };

    // TOKEN ACCESSING PART

    const [accessToken, setAccessToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchToken = async () => {
        try {
            const res = await fetch('/api/get-token');
            const data = await res.json();
            if (res.ok) {
                setAccessToken(data.access_token);
                // console.log(data.access_token, "token")
                fetchTournamentsData(data.access_token);
            } else {
                console.error('Token error:', data.error);
            }
        } catch (err) {
            console.error('Request failed:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchToken();
        const interval = setInterval(() => {
            console.log('Refreshing token...');
            fetchToken();
        }, 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // TEAM NAME FETCHING

    const [eventDetails, setEventDetails] = useState([]);

    const fetchEventDetailsForAllIds = async (token, eventIds) => {
        try {
            const detailPromises = eventIds.map(eventId =>
                fetchSportEventDetails({ token, eventId })
            );

            const results = await Promise.all(detailPromises);

            const validDetails = results.filter(detail => detail !== null);

            setEventDetails(validDetails);
        } catch (error) {
            console.error('Error fetching all event details:', error);
            setEventDetails([]);
        }
    };

    // TEAM EVENT FETCHING

    const [eventIds, setEventIds] = useState([]);

    const fetchEventsIdData = async (token, id) => {
        try {
            const data = await fetchEventsIds({ token, id });

            if (data && data.items) {
                setEventIds(data.items);
                await fetchEventDetailsForAllIds(token, data.items);
            } else {
                setEventIds([]);
                console.warn("No event IDs returned");
            }
        } catch (err) {
            console.error('Failed to fetch event IDs:', err);
        }
    };

    // FETCH GAME MARKET

    async function fetchMarketData(token, sportEventId) {
        try {
            const response = await fetch(`/api/get-odds?sportEventId=${sportEventId}&token=${token}`);
            if (!response.ok) {
                throw new Error('Failed to fetch market data');
            }
            const data = await response.json();
            return data;
        } catch (err) {
            console.error('fetchMarketData error:', err);
            return null;
        }
    }

    //-------------------END--->22-BET SECTION-------------------//

    //-------------------ONE-X BET SECTION----------------------//

    // TOURNAMENT API IMPLEMENTATION
    const [oneXTournament, setOneXTournament] = useState([]);

    const fetchOneXTournamentsData = async (token) => {
        console.log("calls trnmnt")
        try {
            const data = await fetchOneXTournaments(token);
            setOneXTournament(data);
        } catch (err) {
            console.error('Failed to fetch tournaments:', err);
        }
    };

    // TOKEN ACCESSING PART

    const [oneXAccessToken, setOneXAccessToken] = useState(null);
    const [oneXLoading, setOneXLoading] = useState(true);

    const fetchOneXToken = async () => {
        try {
            const res = await fetch('/api/get-token-onex');
            const data = await res.json();
            if (res.ok) {
                setOneXAccessToken(data.access_token);
                // console.log(data.access_token, "token")
                fetchOneXTournamentsData(data.access_token);
            } else {
                console.error('Token error:', data.error);
            }
        } catch (err) {
            console.error('Request failed:', err);
        } finally {
            setOneXLoading(false);
        }
    };

    useEffect(() => {
        fetchOneXToken();
        const interval = setInterval(() => {
            console.log('Refreshing one-x token...');
            fetchOneXToken();
        }, 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // TEAM NAME FETCHING

    const [oneXEventDetails, setOneXEventDetails] = useState([]);

    const fetchOneXEventDetailsForAllIds = async (token, eventIds) => {
        try {
            const detailPromises = eventIds.map(eventId =>
                fetchOneXSportEventDetails({ token, eventId })
            );

            const results = await Promise.all(detailPromises);

            const validDetails = results.filter(detail => detail !== null);

            setOneXEventDetails(validDetails);
        } catch (error) {
            console.error('Error fetching all event details:', error);
            setOneXEventDetails([]);
        }
    };

    // TEAM EVENT FETCHING

    const [oneXEventIds, setOneXEventIds] = useState([]);

    const fetchOneXEventsIdData = async (token, id) => {
        console.log("calls id ")
        try {
            const data = await fetchOneXEventsIds({ token, id });

            if (data && data.items) {
                setOneXEventIds(data.items);
                await fetchOneXEventDetailsForAllIds(token, data.items);
            } else {
                setOneXEventIds([]);
                console.warn("No event IDs returned");
            }
        } catch (err) {
            console.error('Failed to fetch event IDs:', err);
        }
    };

    // FETCH GAME MARKET

    async function fetchOneXMarketData(token, sportEventId) {
        try {
            const response = await fetch(`/api/get-onex-odds?sportEventId=${sportEventId}&token=${token}`);
            if (!response.ok) {
                throw new Error('Failed to fetch market data');
            }
            const data = await response.json();
            return data;
        } catch (err) {
            console.error('fetchMarketData error:', err);
            return null;
        }
    }

    //-------------------END--->ONE-X BET SECTION----------------------//

    // FOOTBALL MATCH DETAILS API IMPLEMENTATION

    const [footBallMatchDetails, setFootballMatchDetails] = useState([]);

    const fetchFootballDetails = async (id) => {
        try {
            const response = await axios.get(`/api/get-football-match-details?Eid=${id}`);
            setFootballMatchDetails(response.data);
        } catch (error) {
            console.error('Error fetching football match details:', error);
        }
    };

    // FOOTBALL LINE UP DETAILS API IMPLEMENTATION

    const [lineUp, setLineUp] = useState([]);

    const fetchFootBallLineUp = async (id) => {
        try {
            const response = await axios.get(`/api/get-football-line-up?Eid=${id}`);
            setLineUp(response.data);
        } catch (error) {
            console.error('Error fetching football line up:', error);
        }
    };

    // FETCH MATCH SCHEDULE BY DATE

    const [matchSchedule, setMatchSchedule] = useState([]);

    async function fetchMatchSchedules(Date, Timezone) {
        console.log("calls fetch match", Date)
        try {
            const response = await fetch(`/api/get-match-schedule-by-date?Date=${Date}&Timezone=${Timezone}`);
            if (!response.ok) {
                throw new Error('Failed to fetch match schedule');
            }
            const data = await response.json();
            setMatchSchedule(data)
            return data;
        } catch (err) {
            console.error('fetchMatchSchedules error:', err);
            return null;
        }
    }



    // BLOG SECTION

    const fetchBlogCategories = async () => {
        try {
            const response = await CustomAxios.get('/blog-categories');
            setBlogCategories(response.data);
        } catch (error) {
            console.error('Error fetching blog categories:', error);
        }
    };

    const fetchRecentBlogs = async () => {
        try {
            const response = await CustomAxios.get('/recent-posts');
            setrecentBlogs(response.data);
        } catch (error) {
            console.error('Error fetching recent blogs:', error);
        }
    };

    const fetchBlogs = useCallback(async ({
        countryCodeParam = countryCode?.country_code,
        search = '',
        category = null,
        subcategory = null
    } = {}) => { // Add default empty object
        try {
            const params = {
                country_code: countryCodeParam,
            };

            if (search) {
                params.search = search;
            }

            if (category) {
                params.category_id = category;
            }

            if (subcategory) {
                params.subcategory_id = subcategory;
            }

            console.log('Fetching blogs with params:', params); // Debug log

            const response = await CustomAxios.get('/get-blogs', {
                params,
            });

            setBlogs(response.data.results || []);
        } catch (error) {
            console.error('Failed to fetch blogs:', error);
        }
    }, [countryCode?.country_code]);



    // BETTING TABLE DATA - API IMPLEMENTATIONS

    const fetchBettingApps = async (countryCodeParam = countryCode.country_code) => {
        if (!countryCodeParam) {
            console.warn('No country code available for fetching betting apps');
            return;
        }

        try {
            console.log('Fetching betting apps for country code:', countryCodeParam);
            const response = await CustomAxios.get('/best-betting-headings', {
                params: {
                    country_code: countryCodeParam,
                    filter_by: 'current_month'
                },
            });

            const data = response.data;
            if (Array.isArray(data.results)) {
                setSections(data.results);
            } else {
                console.warn('Expected an array, but received:', data);
            }
        } catch (error) {
            console.error('Error fetching best betting headings:', error);
        }
    };

    const fetchBestBettingAppsPrevious = async (countryCodeParam = countryCode.country_code) => {
        if (!countryCodeParam) {
            console.warn('No country code available for fetching previous betting apps');
            return;
        }

        try {
            const response = await CustomAxios.get('/best-betting-headings', {
                params: {
                    country_code: countryCodeParam,
                    filter_by: 'previous_month'
                },
            });

            const data = response.data;

            if (Array.isArray(data.results)) {
                setBestSections(data.results);
            } else {
                console.warn('Expected an array, but received:', data);
            }
        } catch (error) {
            console.error('Error fetching best betting headings (previous):', error);
        }
    };

    // CRICKET LIVE SCORE SECTION

    const rapidApiKey = 'c3c1b4d9edmshb8fad382c23df43p14e64fjsn1f9d11ef49e1';

    const [apiResponse, setApiResponse] = useState(null);
    const [matchTypes, setMatchTypes] = useState([]);
    const [teamImages, setTeamImages] = useState({});

    const fetchMatches = async () => {
        try {
            const res = await axios.get('https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live', {
                headers: { 'X-RapidAPI-Key': rapidApiKey },
            });

            setApiResponse(res.data);

            const filterTypes = res.data.filters?.matchType || [];
            setMatchTypes(filterTypes);

            const imageIds = new Set();
            res.data.typeMatches?.forEach(type =>
                type.seriesMatches?.forEach(series => {
                    const matches = series.seriesAdWrapper?.matches || [];
                    console.log(matches, "matches")
                    matches.forEach(match => {
                        const t1 = match.matchInfo?.team1?.imageId;
                        const t2 = match.matchInfo?.team2?.imageId;
                        if (t1) imageIds.add(t1);
                        if (t2) imageIds.add(t2);
                    });
                })
            );

            const newTeamImages = {};
            await Promise.all(
                Array.from(imageIds).map(async id => {
                    try {
                        const response = await axios.get(
                            `https://cricbuzz-cricket.p.rapidapi.com/img/v1/i1/c${id}/i.jpg`,
                            {
                                headers: { 'X-RapidAPI-Key': rapidApiKey },
                                responseType: 'blob',
                            }
                        );
                        const imageURL = URL.createObjectURL(response.data);
                        newTeamImages[id] = imageURL;
                    } catch (err) {
                        console.error('Failed to fetch image for ID:', id, err);
                    }
                })
            );
            setTeamImages(newTeamImages);
        } catch (error) {
            console.error('Failed to fetch live matches:', error);
        }
    };

    // CRICKET MATCH DETAILS SECTION

    const [cricketDetails, setCricketDetails] = useState([]);

    const getCricketDetails = async (id) => {
        try {
            const response = await axios.get(`/api/get-cricket-match-details?matchId=${id}`)
            setCricketDetails(response.data)
        } catch (error) {
            console.error('error fetching cricket match details :', error)
        }
    }

    // CRICKET UPCOMING MATCH SECTION 

    const [upcomingMatches, setUpcomingMatches] = useState([]);

    const fetchUpcomingMatches = async () => {
        try {
            const res = await axios.get('https://cricbuzz-cricket.p.rapidapi.com/matches/v1/upcoming', {
                headers: {
                    'X-RapidAPI-Key': rapidApiKey,
                },
            });

            const upcoming = [];

            res.data.typeMatches.forEach(typeBlock => {
                const matchType = typeBlock.matchType;

                typeBlock.seriesMatches.forEach(seriesWrapper => {
                    const series = seriesWrapper.seriesAdWrapper;
                    if (series?.matches && Array.isArray(series.matches)) {
                        series.matches.forEach(match => {
                            const info = match.matchInfo;

                            const date = new Date(Number(info.startDate));
                            const dateStr = date.toISOString().split('T')[0];
                            const timeStr = date.toISOString().split('T')[1].slice(0, 5);

                            upcoming.push({
                                matchId: info.matchId,
                                type: matchType,
                                team1: info.team1.teamName,
                                team2: info.team2.teamName,
                                seriesName: series.seriesName,
                                dateStr,
                                timeStr,
                            });
                        });
                    }
                });
            });

            setUpcomingMatches(upcoming);
        } catch (error) {
            console.error('Failed to fetch upcoming matches:', error);
        }
    };

    // FOOTBALL LIVE SCORE SECTION
    const [stages, setStages] = useState([]);
    const liveFootBall = async () => {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0].replace(/-/g, '');
        const options = {
            method: 'GET',
            url: 'https://livescore6.p.rapidapi.com/matches/v2/list-by-date',
            params: {
                Category: 'soccer',
                Date: formattedDate,
                Timezone: '-5'
            },
            headers: {
                'X-RapidAPI-Key': 'c3c1b4d9edmshb8fad382c23df43p14e64fjsn1f9d11ef49e1',
            }
        };

        try {
            const response = await axios.request(options);
            setStages(response.data)
        } catch (error) {
            console.error('Error fetching football matches:', error);
        }
    };

    // FOOTBALL UPCOMING MATCHES SECTION

    const [upcoming, setUpcoming] = useState([]);
    const upcomingFootBall = async () => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const formattedDate = tomorrow.toISOString().split('T')[0].replace(/-/g, '');

        const options = {
            method: 'GET',
            url: 'https://livescore6.p.rapidapi.com/matches/v2/list-by-date',
            params: {
                Category: 'soccer',
                Date: formattedDate,
                Timezone: '-5'
            },
            headers: {
                'X-RapidAPI-Key': 'c3c1b4d9edmshb8fad382c23df43p14e64fjsn1f9d11ef49e1',
            }
        };

        try {
            const response = await axios.request(options);
            setUpcoming(response.data)
        } catch (error) {
            console.error('Error fetching upcoming football matches:', error);
        }
    };

    // NEWS SECTION
    const [news, setNews] = useState([]);

    const fetchNews = async () => {
        const options = {
            method: 'GET',
            url: 'https://livescore6.p.rapidapi.com/news/v2/list',
            headers: {
                'X-RapidAPI-Key': 'c3c1b4d9edmshb8fad382c23df43p14e64fjsn1f9d11ef49e1',
            }
        };

        try {
            const response = await axios.request(options);
            setNews(response.data?.homepageArticles[0])
        } catch (error) {
            console.error('Error fetching news:', error);
        }
    };

    //// NEWS DETAIL SECTION 

    const [selectedNews, setSelectedNews] = useState(null);

    const fetchNewsDetails = async (id) => {
        try {
            const response = await axios.get(
                `https://livescore6.p.rapidapi.com/news/v2/detail`,
                {
                    params: { id },
                    headers: {
                        'X-RapidAPI-Key': 'c3c1b4d9edmshb8fad382c23df43p14e64fjsn1f9d11ef49e1',
                    },
                }
            );
            setSelectedNews(response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching news details:", error);
        }
    };

    useEffect(() => {
        fetchBlogCategories();
        fetchRecentBlogs();
        fetchMatches();
        fetchUpcomingMatches();
        liveFootBall();
        upcomingFootBall();
        fetchNews();
        fetchLocation();
        getCountryCode();
        fetchSettings();
    }, []);

    useEffect(() => {
        if (countryCode.country_code) {
            console.log('Country code available, fetching dependent data:', countryCode.country_code);
            fetchBlogs({ countryCodeParam: countryCode.country_code }); // Pass as object
            fetchBettingApps(countryCode.country_code);
            fetchBestBettingAppsPrevious(countryCode.country_code);
        }
    }, [countryCode.country_code, fetchBlogs]);

    return (
        <DataContext.Provider
            value={{
                blogCategories,
                recentBlogs,
                fetchBlogs,
                blogs,
                sections,
                bestSections,
                apiResponse,
                matchTypes,
                teamImages,
                upcomingMatches,
                stages,
                upcoming,
                news,
                selectedNews,
                fetchNewsDetails,
                language,
                setLanguage,
                translateText,
                tournament,
                oneXTournament,
                accessToken,
                oneXAccessToken,
                fetchEventsIdData,
                fetchOneXEventsIdData,
                eventIds,
                oneXEventIds,
                eventDetails,
                oneXEventDetails,
                fetchMarketData,
                fetchOneXMarketData,
                location,
                fetchFootballDetails,
                footBallMatchDetails,
                fetchFootBallLineUp,
                lineUp,
                countryCode,
                getCricketDetails,
                cricketDetails,
                sport,
                setSport,
                matchSchedule,
                setMatchSchedule,
                fetchMatchSchedules,
                currentTimezone,
                settings,
            }}>
            {children}
        </DataContext.Provider>
    );
};

export const useGlobalData = () => useContext(DataContext);