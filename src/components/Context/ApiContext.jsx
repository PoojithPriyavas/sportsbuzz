'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import CustomAxios from '../utilities/CustomAxios';
import axios from 'axios';
import { fetchTournaments } from '@/pages/api/get-tournaments';
import { fetchEventsIds } from '@/pages/api/get-events';
import { fetchSportEventDetails } from '@/pages/api/get-teamnames';


const DataContext = createContext();


export const DataProvider = ({ children }) => {
    const [blogCategories, setBlogCategories] = useState([]);
    const [recentBlogs, setrecentBlogs] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [sections, setSections] = useState([]);
    const [bestSections, setBestSections] = useState([]);

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
            const response = await fetch(`/api/get-ods?sportEventId=${sportEventId}&token=${token}`);
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
            console.error('Error fetching blog categories:', error);
        }
    };


    const fetchBlogs = async () => {
        try {
            const res = await CustomAxios.get('/get-blogs');
            setBlogs(res.data.results || []);
        } catch (error) {
            console.error('Failed to fetch blogs:', error);
        }
    };

    // BETTING TABLE DATA - API IMPLEMENTATIONS

    const fetchBettingApps = async () => {
        try {
            const response = await CustomAxios.get('/best-betting-headings', {
                params: { country_code: 'IN', filter_by: 'current_month' },
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

    const fetchBestBettingAppsPrevious = async () => {
        console.log("previous sections is called")
        try {
            const response = await CustomAxios.get('/best-betting-headings', {
                params: {
                    country_code: 'IN',
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
            console.error('Error fetching best betting headings:', error);
        }
    };
    // CRICKET LIVE SCORE SECTION

    const rapidApiKey = '017dac301bmshe6ef4a628428634p17177bjsnc738cb420a49';

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
                            ` https://cricbuzz-cricket.p.rapidapi.com/img/v1/i1/c${id}/i.jpg`,
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
                'X-RapidAPI-Key': 'efe47ba8d5mshfaf50a473c8685ep180cbcjsn11186002a7ec',

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
        tomorrow.setDate(today.getDate() + 1); // Add 1 day

        const formattedDate = tomorrow.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD format


        const options = {
            method: 'GET',
            url: 'https://livescore6.p.rapidapi.com/matches/v2/list-by-date',
            params: {
                Category: 'soccer',
                Date: formattedDate,
                Timezone: '-5'
            },
            headers: {
                'X-RapidAPI-Key': 'efe47ba8d5mshfaf50a473c8685ep180cbcjsn11186002a7ec',

            }
        };

        try {
            const response = await axios.request(options);
            setUpcoming(response.data)
        } catch (error) {
            console.error('Error fetching football matches:', error);
        }
    };

    // NEWS SECTION
    const [news, setNews] = useState([]);

    const fetchNews = async () => {
        console.log("function caalled")
        const options = {
            method: 'GET',
            url: 'https://livescore6.p.rapidapi.com/news/v2/list',

            headers: {
                'X-RapidAPI-Key': 'efe47ba8d5mshfaf50a473c8685ep180cbcjsn11186002a7ec',
            }
        };

        try {
            const response = await axios.request(options);
            setNews(response.data?.homepageArticles[0])
        } catch (error) {
            console.error('Error fetching football matches:', error);
        }
    };


    //// NEWS DETAIL SECTION 

    const [selectedNews, setSelectedNews] = useState(null);

    const fetchNewsDetails = async (id) => {
        console.log("news called")
        try {
            const response = await axios.get(
                `https://livescore6.p.rapidapi.com/news/v2/detail`,
                {
                    params: { id },
                    headers: {
                        'X-RapidAPI-Key': 'efe47ba8d5mshfaf50a473c8685ep180cbcjsn11186002a7ec',
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
        fetchBlogs();
        fetchBettingApps();
        fetchBestBettingAppsPrevious();
        // fetchMatches();
        // fetchUpcomingMatches();
        liveFootBall();
        upcomingFootBall();
        fetchNews();
    }, []);

    return (
        <DataContext.Provider
            value={{
                blogCategories,
                recentBlogs,
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
                accessToken,
                fetchEventsIdData,
                eventIds,
                eventDetails,
                fetchMarketData,

            }}>
            {children}
        </DataContext.Provider>
    );
};

export const useGlobalData = () => useContext(DataContext);