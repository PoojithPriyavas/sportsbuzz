import Header from "@/components/Header/Header";
import LiveScores from "@/components/LiveScoreSection/LiveScoreSection";
import Head from "next/head";
import BettingAppsTable from "@/components/BestBettingApps/BestBettingApps";
import BettingAppsRecentTable from "@/components/BestBettingRecentApps/BestBettingRecentApps";
import UpcomingMatches from "@/components/UpComing/UpComingMatches";
import styles from '../../../styles/Home.module.css';
import AutoSlider from "@/components/AutoSlider/AutoSlider";
import TopNewsSection from "@/components/NewsSection/TopNews";
import BlogSlider from "@/components/BlogsSection/BlogSlider";
import LoadingScreen from "@/components/Loader/Loader";
import { useEffect, useState } from "react";
import TestLive from "@/components/LiveScoreSection/TestLive";
import BettingCard from '@/components/OddsMultiply/BettingCard';
import MatchScheduler from "@/components/FootballMatchScheduler/MatchScheduler";
import FooterTwo from "@/components/Footer/Footer";
import { useGlobalData } from "@/components/Context/ApiContext";
import HeaderTwo from "@/components/Header/HeaderTwo";
import JoinTelegramButton from "@/components/JoinTelegram/JoinTelegramButton";
import { useLanguageValidation } from "@/hooks/useLanguageValidation";
import axios from "axios";
import HeaderThree from "@/components/Header/HeaderThree";
import UpcomingFootballMatches from "@/components/UpComing/UpComingFootball";
import AutoSliderEven from "@/components/AutoSlider/AutoSliderEven";
import SportsOdsMegaPari from "@/components/SportsOdds/SportsOdsmegaPari";
export async function getServerSideProps(context) {
    // Log the request origin (helpful for debugging)
    // console.log('Request originated from:', context.req.headers['x-forwarded-for'] || context.req.connection.remoteAddress);

    try {
        const { resolvedUrl, req } = context;
        const [countryRes, locationRes] = await Promise.all([
            fetch('https://admin.sportsbuz.com/api/get-country-code/')
                .then(async (response) => {
                    if (!response.ok) {
                        throw new Error(`Country API failed: ${response.status} ${response.statusText}`);
                    }
                    const data = await response.json();
                    return { data, headers: response.headers, status: response.status, url: response.url };
                }),
            fetch('https://admin.sportsbuz.com/api/locations/')
                .then(async (response) => {
                    if (!response.ok) {
                        throw new Error(`Location API failed: ${response.status} ${response.statusText}`);
                    }
                    const data = await response.json();
                    return { data, headers: response.headers, status: response.status, url: response.url };
                })
        ]);

        const countryDataHome = countryRes.data;
        const locationDataHome = locationRes.data;

        // Detailed logging
        // console.log('=== API RESPONSE DATA ===');
        // console.log('Country Data in the props:', JSON.stringify(countryRes.data, null, 2));
        // console.log('Location Data in the props:', JSON.stringify(locationRes.data, null, 2));
        // console.log('Response Headers - Country in the props:', Object.fromEntries(countryRes.headers));
        // console.log('Response Headers - Location: in the props', Object.fromEntries(locationRes.headers));

        return {
            props: {
                countryDataHome,
                locationDataHome,
                resolvedUrl,
            }
        };
    } catch (error) {
        // console.error("Error fetching data from APIs:", error.message);
        console.error("API Error Details: in the props", {
            url: error.url || 'Unknown URL',
            status: error.status || 'Unknown Status',
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        return {
            props: {
                countryDataHome: null,
                locationDataHome: null,
                resolvedUrl,
                isLocalhost: process.env.NODE_ENV === 'development'
            }
        };
    }
}
export default function MatchSchedulerScreen({ countryDataHome, locationDataHome, resolvedUrl, }) {
    const languageValidation = useLanguageValidation(locationDataHome, resolvedUrl);

    const { sport, apiResponse, teamImages, matchTypes, upcomingMatches } = useGlobalData();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fixed: Timer was setting loading to true instead of false
        const timer1 = setTimeout(() => setLoading(false), 3000);
        return () => clearTimeout(timer1);
    }, []);
    const [animationStage, setAnimationStage] = useState('loading');
    const [showOtherDivs, setShowOtherDivs] = useState(false);
    const [hasAnimatedIn, setHasAnimatedIn] = useState(false);


    useEffect(() => {
        // Check if animation has been played before
        const hasPlayedAnimation = localStorage.getItem('headerAnimationPlayed');

        if (!hasPlayedAnimation) {
            // First time - play the full animation sequence
            const timer1 = setTimeout(() => setAnimationStage('logoReveal'), 2000);
            const timer2 = setTimeout(() => setAnimationStage('transition'), 3500);
            const timer3 = setTimeout(() => setAnimationStage('header'), 5000);
            const timer4 = setTimeout(() => setShowOtherDivs(true), 6500); // Show content after transition completes

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
                clearTimeout(timer3);
                clearTimeout(timer4);
            };
        } else {
            // Animation already played - go directly to header and show content immediately
            setAnimationStage('header');
            setShowOtherDivs(true);
            setLoading(false);
        }
    }, []);

    // Original loading timer (keeping for compatibility)
    useEffect(() => {
        const timer1 = setTimeout(() => setLoading(false), 3000);
        return () => clearTimeout(timer1);
    }, []);

    useEffect(() => {
        if (showOtherDivs) {
            const timeout = setTimeout(() => setHasAnimatedIn(true), 50); // slight delay triggers transition
            return () => clearTimeout(timeout);
        }
    }, [showOtherDivs]);
    return (
        <>
            <Head>
                <title>Match Schedules</title>
                <meta name="description" content="Your site description here" />
            </Head>
            {/* <Header /> */}
            {/* <LoadingScreen onFinish={() => setLoading(false)} /> */}
            <HeaderThree animationStage={animationStage} />
            <div className='container'>
                {sport === 'cricket' ? (
                    <>
                        <LiveScores apiResponse={apiResponse} matchTypes={matchTypes} teamImages={teamImages} />
                    </>
                ) : (
                    <TestLive />
                )}
                <div className={styles.fourColumnRow}>
                    <div className={styles.leftThreeColumns}>
                        <MatchScheduler />
                    </div>
                    <div className={styles.fourthColumn}>
                        <div className={styles.fourthColumnTwoColumns}>
                            <div className={styles.fourthColumnLeft}>
                                <BettingCard />
                                <JoinTelegramButton />
                            </div>
                            <div className={styles.fourthColumnRight}>
                                <AutoSlider />
                            </div>
                        </div>
                        {sport === 'cricket' ? (
                            <>
                                <UpcomingMatches upcomingMatches={upcomingMatches} />
                            </>
                        ) : (
                            <UpcomingFootballMatches />
                        )}
                        <AutoSliderEven />
                        <SportsOdsMegaPari />
                    </div>
                </div>
                <div className={styles.mainContent}>
                    <div className={styles.leftSection}>

                    </div>

                    <div className={styles.rightSection}>

                        {/* <UpcomingMatches /> */}
                        {/* <div className={styles.bannerPlaceholder}>Multiple Banner Part</div> */}

                    </div>
                </div>
                <BettingAppsRecentTable />

            </div>
            <FooterTwo />
        </>
    )
}