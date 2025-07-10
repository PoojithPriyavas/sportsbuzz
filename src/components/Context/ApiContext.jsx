'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import CustomAxios from '../utilities/CustomAxios';
import axios from 'axios';
const DataContext = createContext();


export const DataProvider = ({ children }) => {
    const [blogCategories, setBlogCategories] = useState([]);
    const [recentBlogs, setrecentBlogs] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [sections, setSections] = useState([]);
    const [bestSections, setBestSections] = useState([]);

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

    const fetchBettingApps = async () => {
        try {
            const response = await CustomAxios.get('/best-betting-headings', {
                params: { country_code: 'IN', filter_by: 'current_month' },
            });

            const data = response.data;
            if (Array.isArray(data)) {
                setSections(data);
            } else {
                console.warn('Expected an array, but received:', data);
            }
        } catch (error) {
            console.error('Error fetching best betting headings:', error);
        }
    };

    const fetchBestBettingAppsPrevious = async () => {
        try {
            const response = await CustomAxios.get('/best-betting-headings', {
                params: {
                    country_code: 'IN',
                    filter_by: 'previous_month'
                },
            });

            const data = response.data;

            if (Array.isArray(data)) {
                setBestSections(data);
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
                Date: "20250706",
                Timezone: '-5'
            },
            headers: {
                'X-RapidAPI-Key': '28acac3c58mshd83e0915f78a287p129875jsna833d4039a3e',

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
        const formattedDate = today.toISOString().split('T')[0].replace(/-/g, '');
        const options = {
            method: 'GET',
            url: 'https://livescore6.p.rapidapi.com/matches/v2/list-by-date',
            params: {
                Category: 'soccer',
                Date: "20250707",
                Timezone: '-5'
            },
            headers: {
                'X-RapidAPI-Key': '28acac3c58mshd83e0915f78a287p129875jsna833d4039a3e',

            }
        };

        try {
            const response = await axios.request(options);
            setUpcoming(response.data)
        } catch (error) {
            console.error('Error fetching football matches:', error);
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
                upcoming
            }}>
            {children}
        </DataContext.Provider>
    );
};

export const useGlobalData = () => useContext(DataContext);