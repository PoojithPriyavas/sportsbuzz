import Header from "@/components/Header/Header";
import LiveScores from "@/components/LiveScoreSection/LiveScoreSection";
import Head from "next/head";
import BettingAppsTable from "@/components/BestBettingApps/BestBettingApps";
import BettingAppsRecentTable from "@/components/BestBettingRecentApps/BestBettingRecentApps";
import UpcomingMatches from "@/components/UpComing/UpComingMatches";
import styles from '../../styles/Home.module.css';
import AutoSlider from "@/components/AutoSlider/AutoSlider";
import TopNewsSection from "@/components/NewsSection/TopNews";
import BlogSlider from "@/components/BlogsSection/BlogSlider";
import LoadingScreen from "@/components/Loader/Loader";
import { useEffect, useState } from "react";
import TestLive from "@/components/LiveScoreSection/TestLive";
import BettingCard from '@/components/OddsMultiply/BettingCard';
import JoinTelegramButton from '@/components/JoinTelegram/JoinTelegramButton';
import FooterTwo from "@/components/Footer/Footer";
import { useGlobalData } from "@/components/Context/ApiContext";
import UpcomingFootballMatches from "@/components/UpComing/UpComingFootball";
import HeaderTwo from "@/components/Header/HeaderTwo";

import { fetchBettingAppsSSR } from '@/lib/fetchBettingAppsSSR';

export async function getServerSideProps(context) {
  try {
    const [countryRes, locationRes] = await Promise.all([
      axios.get('https://admin.sportsbuz.com/api/get-country-code/'),
      axios.get('https://admin.sportsbuz.com/api/locations')
    ]);

    const countryDataHome = countryRes.data;
    const locationDataHome = locationRes.data;
    const sections = fetchBettingAppsSSR(countryDataHome)

    return {
      props: {
        countryDataHome,
        locationDataHome,
        sections
      }
    };
  } catch (error) {
    console.error("Error fetching data from APIs:", error.message);
    return {
      props: {
        countryDataHome: null,
        locationDataHome: null,
        isLocalhost: process.env.NODE_ENV === 'development'
      }
    };
  }
}

export default function BestBettingApps({ sections, countryCode, fetchTime, error }) {
    // Debug logs
    console.log('🔍 Component - Props received:');
    console.log('  - sections:', sections);
    console.log('  - sections length:', sections?.length);
    console.log('  - countryCode:', countryCode);
    console.log('  - fetchTime:', fetchTime);
    console.log('  - error:', error);

    const [loading, setLoading] = useState(true);
    const {
        blogCategories,
        blogs,
        // Remove sections from here to avoid conflict
        apiResponse,
        matchTypes,
        teamImages,
        upcomingMatches,
        sport,
        countryCode: contextCountryCode,
        bestSections
    } = useGlobalData();

    // Debug context data
    console.log('🔍 Context - bestSections:', bestSections);
    console.log('🔍 Context - sport:', sport);

    useEffect(() => {
        console.log('🔍 useEffect - sections changed:', sections);
    }, [sections]);

    // Rest of your component logic...
    useEffect(() => {
        const timer1 = setTimeout(() => setLoading(false), 3000);
        return () => clearTimeout(timer1);
    }, []);

    const [animationStage, setAnimationStage] = useState('loading');
    const [showOtherDivs, setShowOtherDivs] = useState(false);
    const [hasAnimatedIn, setHasAnimatedIn] = useState(false);

    useEffect(() => {
        // Check if animation has been played before
        const hasPlayedAnimation = typeof window !== 'undefined' && localStorage.getItem('headerAnimationPlayed');

        if (!hasPlayedAnimation) {
            const timer1 = setTimeout(() => setAnimationStage('logoReveal'), 2000);
            const timer2 = setTimeout(() => setAnimationStage('transition'), 3500);
            const timer3 = setTimeout(() => setAnimationStage('header'), 5000);
            const timer4 = setTimeout(() => setShowOtherDivs(true), 6500);

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
                clearTimeout(timer3);
                clearTimeout(timer4);
            };
        } else {
            setAnimationStage('header');
            setShowOtherDivs(true);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (showOtherDivs) {
            const timeout = setTimeout(() => setHasAnimatedIn(true), 50);
            return () => clearTimeout(timeout);
        }
    }, [showOtherDivs]);

    // Add error display for debugging
    if (error) {
        return <div>Error loading betting apps: {error}</div>;
    }

    return (
        <>
            <Head>
                <title>{sections?.[0]?.metatitle || 'Best Betting Apps'}</title>
                <meta
                    name="description"
                    content={
                        sections?.[0]?.meta_description
                            ? sections[0].meta_description.replace(/<[^>]+>/g, '').slice(0, 160)
                            : 'Explore the best betting apps in India for July 2025.'
                    }
                />
                <meta property="og:title" content={sections?.[0]?.metatitle || 'Best Betting Apps'} />
                <meta property="og:description" content={sections?.[0]?.meta_description?.replace(/<[^>]+>/g, '').slice(0, 160) || ''} />
                <meta name="twitter:title" content={sections?.[0]?.metatitle || 'Best Betting Apps'} />
                <meta name="twitter:description" content={sections?.[0]?.meta_description?.replace(/<[^>]+>/g, '').slice(0, 160) || ''} />
            </Head>

            <HeaderTwo animationStage={animationStage} />

            <div className='container'>
                {sport === 'cricket' ? (
                    <LiveScores apiResponse={apiResponse} matchTypes={matchTypes} teamImages={teamImages} />
                ) : (
                    <TestLive />
                )}
                
                <div className={styles.fourColumnRow}>
                    <div className={styles.leftThreeColumns}>
                        {/* Debug display */}
                        {/* <div style={{ padding: '10px', background: '#f0f0f0', margin: '10px 0' }}>
                            <strong>Debug Info:</strong><br/>
                            Sections length: {sections?.length || 0}<br/>
                            First section exists: {sections?.[0] ? 'Yes' : 'No'}<br/>
                            Fetch time: {fetchTime}<br/>
                            Country: {countryCode}
                        </div> */}
                        
                        <BettingAppsTable sections={sections} />
                        <div
                            className={styles.description}
                            dangerouslySetInnerHTML={{ __html: sections?.[0]?.description }}
                        />
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
                            <UpcomingMatches upcomingMatches={upcomingMatches} />
                        ) : (
                            <UpcomingFootballMatches />
                        )}
                    </div>
                </div>
                
                <BettingAppsRecentTable bestSections={bestSections} />
            </div>
            <FooterTwo />
        </>
    );
}