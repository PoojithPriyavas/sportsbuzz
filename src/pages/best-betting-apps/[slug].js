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
import AutoSliderEven from "@/components/AutoSlider/AutoSliderEven";


export async function getServerSideProps({ req }) {
    // Parse the cookie to get country code
    const countryCookie = req.cookies.countryData;
    const countryData = countryCookie ? JSON.parse(countryCookie) : null;
    const countryCode = countryData?.country_code || 'IN';

    // Fetch betting apps data based on country code
    const sectionsTab = await fetchBettingAppsSSR(countryCode);

    return {
        props: {
            sectionsTab,
            countryCode,
        },
    };
}


export default function BestBettingApps({ sectionsTab }) {

    const [loading, setLoading] = useState(true);
    const {
        blogCategories,
        blogs,
        sections,
        apiResponse,
        matchTypes,
        teamImages,
        upcomingMatches,
        sport,
        countryCode,
        bestSections
    } = useGlobalData();
    // console.log(sections, "shgdfs")

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
                <title>{sectionsTab?.[0]?.metatitle || 'Best Betting Apps'}</title>
                <meta
                    name="description"
                    content={
                        sectionsTab?.[0]?.meta_description
                            ? sectionsTab[0].meta_description.replace(/<[^>]+>/g, '').slice(0, 160)
                            : 'Discover top-rated betting apps with secure payments, live odds, and exclusive bonuses. Compare features, user reviews, and promotional offers to find your perfect mobile betting experience.'
                    }
                />
                <meta property="og:title" content={sectionsTab?.[0]?.metatitle || 'Best Betting Apps'} />
                <meta property="og:description" content={sectionsTab?.[0]?.meta_description?.replace(/<[^>]+>/g, '').slice(0, 160) || ''} />
                <meta name="twitter:title" content={sectionsTab?.[0]?.metatitle || 'Best Betting Apps'} />
                <meta name="twitter:description" content={sectionsTab?.[0]?.meta_description?.replace(/<[^>]+>/g, '').slice(0, 160) || ''} />
            </Head>

            {/* <Header /> */}
            {/* <LoadingScreen onFinish={() => setLoading(false)} /> */}
            <HeaderTwo animationStage={animationStage} />

            <div className='container'>
                {/* <LiveScores /> */}
                {sport === 'cricket' ? (
                    <>
                        <LiveScores apiResponse={apiResponse} matchTypes={matchTypes} teamImages={teamImages} />
                    </>
                ) : (
                    <TestLive />
                )}
                <div className={styles.fourColumnRow}>
                    <div className={styles.leftThreeColumns}>
                        <BettingAppsTable sections={sections} />
                        <div
                            className={styles.description}
                            dangerouslySetInnerHTML={{ __html: sections?.[0]?.description }}
                        />
                    </div>
                    <div className={styles.fourthColumn} >
                        <div className={styles.fourthColumnTwoColumns}>
                            <div className={styles.fourthColumnLeft}>
                                <BettingCard />
                                <JoinTelegramButton />
                            </div>
                            <div className={styles.fourthColumnRight}>
                                <AutoSlider countryCode={countryCode} />
                            </div>
                        </div>
                        {sport === 'cricket' ? (
                            <>
                                <UpcomingMatches upcomingMatches={upcomingMatches} />
                            </>
                        ) : (
                            <UpcomingFootballMatches />
                        )}
                        <AutoSliderEven countryCode={countryCode} />
                        {/* <TopNewsSection /> */}
                    </div>
                </div>
                {/* <div className={styles.mainContent}>
                    <div className={styles.leftSection}>

                    </div>

                    <div className={styles.rightSection}>

                        <UpcomingMatches />
                        <div className={styles.bannerPlaceholder}>Multiple Banner Part</div>

                    </div>
                </div> */}
                <BettingAppsRecentTable bestSections={bestSections} />

            </div>
            <FooterTwo />
        </>
    )
}
