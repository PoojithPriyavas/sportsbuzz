import Header from "@/components/Header/Header";
import LiveScores from "@/components/LiveScoreSection/LiveScoreSection";
import Head from "next/head";
import BettingAppsTable from "@/components/BestBettingApps/BestBettingApps";
import BettingAppsRecentTable from "@/components/BestBettingRecentApps/BestBettingRecentApps";
import UpcomingMatches from "@/components/UpComing/UpComingMatches";
import styles from '../../../../styles/Home.module.css';
import AutoSlider from "@/components/AutoSlider/AutoSlider";
import TopNewsSection from "@/components/NewsSection/TopNews";
// import BlogSlider from "@/components/BlogsSection/BlogSlider";
import LoadingScreen from "@/components/Loader/Loader";
import { useEffect, useState } from "react";
import TestLive from "@/components/LiveScoreSection/TestLive";
import BettingCard from '@/components/OddsMultiply/BettingCard';
import JoinTelegramButton from '@/components/JoinTelegram/JoinTelegramButton';
import FooterTwo from "@/components/Footer/Footer";
import { useGlobalData } from "@/components/Context/ApiContext";
import UpcomingFootballMatches from "@/components/UpComing/UpComingFootball";
import RecentAppsDetails from "@/components/BestBettingRecentApps/RecetDetail";
import HeaderTwo from "@/components/Header/HeaderTwo";
import { fetchBestBettingAppsSSR } from "@/lib/fetchBestBettingAppsSSR";
import { useLanguageValidation } from "@/hooks/useLanguageValidation";
import axios from "axios";
import HeaderThree from "@/components/Header/HeaderThree";


export async function getServerSideProps(context) {
    // console.log(context, "contexxt")
    const { req, query, params, resolvedUrl } = context;

    let countryDataHome = null;
    let locationDataHome = null;

    try {
        // Fetch country and location data with proper error handling
        const [countryRes, locationRes] = await Promise.all([
            fetch('https://admin.sportsbuz.com/api/get-country-code/')
                .then(async (response) => {
                    if (!response.ok) {
                        throw new Error(`Country API failed: ${response.status} ${response.statusText}`);
                    }
                    return response.json();
                })
                .catch((error) => {
                    console.error('Error fetching country data:', error);
                    return null; // Return null on error
                }),

            fetch('https://admin.sportsbuz.com/api/locations/')
                .then(async (response) => {
                    if (!response.ok) {
                        throw new Error(`Location API failed: ${response.status} ${response.statusText}`);
                    }
                    return response.json();
                })
                .catch((error) => {
                    console.error('Error fetching location data:', error);
                    return null; // Return null on error
                })
        ]);

        countryDataHome = countryRes;
        locationDataHome = locationRes;

    } catch (error) {
        console.error('Error in Promise.all:', error);
        // Continue with null values if both APIs fail
    }

    // Parse the cookie to get country code
    const countryCookie = req.cookies.countryData;
    const countryData = countryCookie ? JSON.parse(countryCookie) : null;
    const countryCodes = countryData?.country_code || 'LK';
    const hrefLanCookie = req.cookies.lanTagValues;
    const hrefLanData = hrefLanCookie ? JSON.parse(hrefLanCookie) : null;

    const sectionId = params.id;

    // Fetch betting apps data based on country code
    let bestSections = null;
    try {
        bestSections = await fetchBestBettingAppsSSR(countryCodes);
    } catch (error) {
        console.error('Error fetching best sections:', error);
        bestSections = null; // or provide a default value
    }

    return {
        props: {
            bestSections,
            sectionId,
            countryCodes,
            hrefLanData,
            resolvedUrl,
            isLocalhost: process.env.NODE_ENV === 'development',
            locationDataHome
        },
    };
}


export default function BestBettingApps({ bestSections, sectionId, countryCodes, hrefLanData, resolvedUrl, isLocalhost, locationDataHome }) {

    const baseUrl = isLocalhost ? 'http://localhost:3000' : 'https://www.sportsbuz.com';
    // const countryCode = countryData?.country_code || 'IN';
    const languageValidation = useLanguageValidation(locationDataHome, resolvedUrl);
    //   console.log(resolvedUrl,"resolvsed url")
    //   const splitUrl = resolvedUrl.replace(/^,?\//,'').split('-');
    //   console.log(splitUrl,"split  url")
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
        stages,
        activeOddBanners,
        activeEvenBanners,
        bannerLoading,

        // bestSections,

    } = useGlobalData();

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

    const sectionIdNumber = parseInt(sectionId); // Convert to number
    const matchedSection = bestSections.find(section => section.id === sectionIdNumber);

    const metaTitle = matchedSection?.metatitle || 'Best Betting Apps';
    const metaDescription = matchedSection?.meta_description?.replace(/<[^>]+>/g, '') || 'Discover the best betting apps available in India.';

    console.log("meta title in country :", metaTitle);
    console.log("meta desc in country :", metaDescription);
    return (
        <>
            <Head>
                <title>{metaTitle}</title>
                <meta name="description" content={metaDescription} />
                {/* {hrefLanData.map(({ hreflang, country_code }) => {
                  
                    const href = `${baseUrl}/${country_code.toLowerCase()}/${hreflang}/blogs/pages/all-blogs`;
                    const fullHrefLang = `${hreflang}-${country_code}`;
                    console.log('Generated link:', { href, fullHrefLang });

                    return (
                        <link
                            key={fullHrefLang}
                            rel="alternate"
                            href={href}
                            hreflang={fullHrefLang}
                        />
                    );
                })} */}
            </Head>
            {/* <Header /> */}
            {/* <LoadingScreen onFinish={() => setLoading(false)} /> */}
            <HeaderThree animationStage={animationStage} />

            <div className='container'>
                {/* <LiveScores /> */}
                {sport === 'cricket' ? (
                    <>
                        {apiResponse && <LiveScores apiResponse={apiResponse} matchTypes={matchTypes} teamImages={teamImages} />}
                    </>
                ) : (
                    <>
                        {stages && <TestLive />}
                    </>

                )}
                <div className={styles.fourColumnRow}>
                    <div className={styles.leftThreeColumns}>
                        <RecentAppsDetails bestSections={bestSections} sectionId={sectionId} countryCode={countryCode} />
                    </div>
                    <div className={styles.fourthColumn} >
                        <div className={styles.fourthColumnTwoColumns}>
                            <div className={styles.fourthColumnLeft}>
                                <BettingCard countryCode={countryCode} />
                                <JoinTelegramButton countryCode={countryCode} />
                            </div>
                            <div className={styles.fourthColumnRight}>
                               {activeOddBanners.length > 0 && <AutoSlider activeOddBanners={activeOddBanners} bannerLoading={bannerLoading} />}
                            </div>
                        </div>
                        {sport === 'cricket' ? (
                            <>
                                <UpcomingMatches upcomingMatches={upcomingMatches} countryCode={countryCode} />
                            </>
                        ) : (
                            <UpcomingFootballMatches countryCode={countryCode} />
                        )}
                        {/* <TopNewsSection /> */}
                    </div>
                </div>

                <BettingAppsRecentTable bestSections={bestSections} countryCode={countryCode} />

            </div>
            <FooterTwo countryCode={countryCode} />
        </>
    )
}