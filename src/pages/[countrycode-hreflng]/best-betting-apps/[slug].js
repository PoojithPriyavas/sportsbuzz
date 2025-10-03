import Header from "@/components/Header/Header";
import LiveScores from "@/components/LiveScoreSection/LiveScoreSection";
import Head from "next/head";
import BettingAppsTable from "@/components/BestBettingApps/BestBettingApps";
import BettingAppsRecentTable from "@/components/BestBettingRecentApps/BestBettingRecentApps";
import UpcomingMatches from "@/components/UpComing/UpComingMatches";
import styles from '../../../styles/Home.module.css';
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
import HeaderTwo from "@/components/Header/HeaderTwo";
import { useRouter } from "next/router";
import { fetchBettingAppsSSR } from '@/lib/fetchBettingAppsSSR';
import { useLanguageValidation } from "@/hooks/useLanguageValidation";
import axios from "axios";
import HeaderThree from "@/components/Header/HeaderThree";

export async function getServerSideProps({ req, resolvedUrl }) {
    // Parse the cookie to get country code
    const countryCookie = req.cookies.countryData;
    const countryData = countryCookie ? JSON.parse(countryCookie) : null;
    const countryCode = countryData?.country_code || 'LK';
    const hrefLanCookie = req.cookies.lanTagValues;
    const hrefLanData = hrefLanCookie ? JSON.parse(hrefLanCookie) : null;

    let countryDataHome = null;
    let locationDataHome = null;

    try {
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

        countryDataHome = countryRes?.country_code || 'LK';
        locationDataHome = locationRes;

    } catch (error) {
        console.error('Error in Promise.all:', error);
        // Continue with null values if both APIs fail
    }

    // Fetch betting apps data based on country code
    let sections = null;
    try {
        sections = await fetchBettingAppsSSR(countryDataHome);
    } catch (error) {
        console.error('Error fetching betting apps:', error);
        sections = null; // or provide a default value
    }

    return {
        props: {
            sections,
            countryCode,
            hrefLanData,
            resolvedUrl,
            isLocalhost: process.env.NODE_ENV === 'development',
            countryDataHome,
            locationDataHome
        },
    };
}


export default function BestBettingApps({ sections, countryCode, hrefLanData, resolvedUrl, isLocalhost, countryDataHome, locationDataHome }) {
    console.log(locationDataHome, "href lan data in bset bettingapps")
    console.log(countryDataHome, "country code from ssr")
    const baseUrl = isLocalhost ? 'http://localhost:3000' : 'https://www.sportsbuz.com';
    console.log(sections, "sections in country page")
    // const countryCode = countryData?.country_code || 'IN';
    const languageValidation = useLanguageValidation(locationDataHome, resolvedUrl);
    const [loading, setLoading] = useState(true);
    const {
        blogCategories,
        blogs,
        // sections,
        apiResponse,
        matchTypes,
        teamImages,
        upcomingMatches,
        sport,
        // countryCode,
        bestSections,
        activeOddBanners,
        activeEvenBanners,
        bannerLoading,
        stages
    } = useGlobalData();
    // console.log(sections, "shgdfs")
    const router = useRouter();
    const { countryCode: routeCountryCode, hreflang: routeLang } = router.query;
    // console.log('router.query:', router.query);
    // console.log('hrefLanData:', hrefLanData);

    useEffect(() => {
        if (!routeCountryCode || !routeLang || !hrefLanData) return;

        const validLangs = hrefLanData
            .filter(loc => loc.country_code.toLowerCase() === routeCountryCode.toLowerCase())
            .map(loc => loc.hreflang.toLowerCase());

        const fallbackLang = validLangs[0]; // assume en

        if (validLangs.includes(routeLang.toLowerCase())) {
            setLanguage(routeLang); // valid
        } else if (fallbackLang) {
            setLanguage(fallbackLang); // fallback
            const updatedUrl = router.asPath.replace(`/${routeLang}/`, `/${fallbackLang}/`);
            if (updatedUrl !== router.asPath) {
                router.replace(updatedUrl); // navigate
            }
        }
    }, [routeCountryCode, routeLang, hrefLanData]);


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
                <title>{sections?.[0]?.metatitle || 'Best Betting Apps'}</title>
                <meta
                    name="description"
                    content={
                        sections?.[0]?.meta_description
                            ? sections[0].meta_description.replace(/<[^>]+>/g, '').slice(0, 160)
                            : 'Explore the best betting apps in India for July 2025.'
                    }
                />
                <link rel="alternate" href="https://sportsbuz.com/best-betting-apps/current/" hreflang="x-default" />

                {locationDataHome?.map(({ hreflang, country_code }) => {
                    const href = `${baseUrl}/${hreflang}-${country_code.toLowerCase()}/best-betting-apps/current`;
                    const fullHrefLang = `${hreflang}-${country_code}`;
                    return (
                        <link
                            key={fullHrefLang}
                            rel="alternate"
                            href={href}
                            hreflang={fullHrefLang}
                        />
                    );
                })}
                <meta property="og:title" content={sections?.[0]?.metatitle || 'Best Betting Apps'} />
                <meta property="og:description" content={sections?.[0]?.meta_description?.replace(/<[^>]+>/g, '').slice(0, 160) || ''} />
                <meta name="twitter:title" content={sections?.[0]?.metatitle || 'Best Betting Apps'} />
                <meta name="twitter:description" content={sections?.[0]?.meta_description?.replace(/<[^>]+>/g, '').slice(0, 160) || ''} />
                <link rel="canonical" href={`${baseUrl}${resolvedUrl}`} />
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
                        <BettingAppsTable sections={sections} />
                        <div
                            className={styles.description}
                            dangerouslySetInnerHTML={{ __html: sections?.[0]?.description }}
                        />
                    </div>
                    <div className={styles.fourthColumn} >
                        <div className={styles.fourthColumnTwoColumns}>
                            <div className={styles.fourthColumnLeft}>
                                <BettingCard  />
                                <JoinTelegramButton  />
                            </div>
                            <div className={styles.fourthColumnRight}>
                                {activeOddBanners.length > 0 && <AutoSlider activeOddBanners={activeOddBanners} bannerLoading={bannerLoading} />}
                            </div>
                        </div>
                        {sport === 'cricket' ? (
                            <>
                                <UpcomingMatches upcomingMatches={upcomingMatches} />
                            </>
                        ) : (
                            <UpcomingFootballMatches  />
                        )}
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
                <BettingAppsRecentTable bestSections={bestSections} countryCode={countryCode} />

            </div>
            <FooterTwo />
        </>
    )
}
