import Header from "@/components/Header/Header";
import LiveScores from "@/components/LiveScoreSection/LiveScoreSection";
import Head from "next/head";
import BettingAppsTable from "@/components/BestBettingApps/BestBettingApps";
import BettingAppsRecentTable from "@/components/BestBettingRecentApps/BestBettingRecentApps";
import UpcomingMatches from "@/components/UpComing/UpComingMatches";
// import styles from '../../styles/Home.module.css';
import styles from '../../styles/globalHeader.module.css';
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

import { fetchBettingAppsSSR } from '@/lib/fetchBettingAppsSSR';
import AutoSliderEven from "@/components/AutoSlider/AutoSliderEven";


export async function getServerSideProps({ req, query, resolvedUrl }) {
    // Parse the cookie to get country code
    const countryCookie = req.cookies.countryData;

    const hreflangquery = query['countrycode-hreflng']; // "en-in"
    const countryCodes = hreflangquery ? hreflangquery.split('-')[1] : null; // "in"
    console.log(countryCodes, "country codes in the best betting apps main page");

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
    let sectionsRes = null;
    try {
        sectionsRes = await fetchBettingAppsSSR(countryCodes);
    } catch (error) {
        console.error('Error fetching betting apps:', error);
        sectionsRes = null; // or provide a default value
    }

    return {
        props: {
            sectionsRes,
            countryCode,
            hrefLanData,
            resolvedUrl,
            isLocalhost: process.env.NODE_ENV === 'development',
            countryDataHome,
            locationDataHome,
            countryCodes
        },
    };
}


export default function BestBettingApps({ sectionsRes, countryCode, hrefLanData, resolvedUrl, isLocalhost, countryDataHome, locationDataHome, countryCodes }) {
    const baseUrl = isLocalhost ? 'http://localhost:3000' : 'https://www.sportsbuz.com';

    // console.log(sectionsTab, "sections tab")

    // const [loading, setLoading] = useState(true);
    // const {
    //     blogCategories,
    //     blogs,
    //     sections,
    //     apiResponse,
    //     matchTypes,
    //     teamImages,
    //     upcomingMatches,
    //     sport,
    //     countryCode,
    //     bestSections,
    //     stages,
    //     activeOddBanners,
    //     activeEvenBanners,
    //     bannerLoading,
    // } = useGlobalData();
    // // console.log(sections, "shgdfs")

    // useEffect(() => {
    //     // Fixed: Timer was setting loading to true instead of false
    //     const timer1 = setTimeout(() => setLoading(false), 3000);
    //     return () => clearTimeout(timer1);
    // }, []);
    // const [animationStage, setAnimationStage] = useState('loading');
    // const [showOtherDivs, setShowOtherDivs] = useState(false);
    // const [hasAnimatedIn, setHasAnimatedIn] = useState(false);


    // useEffect(() => {
    //     // Check if animation has been played before
    //     const hasPlayedAnimation = localStorage.getItem('headerAnimationPlayed');

    //     if (!hasPlayedAnimation) {
    //         // First time - play the full animation sequence
    //         const timer1 = setTimeout(() => setAnimationStage('logoReveal'), 2000);
    //         const timer2 = setTimeout(() => setAnimationStage('transition'), 3500);
    //         const timer3 = setTimeout(() => setAnimationStage('header'), 5000);
    //         const timer4 = setTimeout(() => setShowOtherDivs(true), 6500); // Show content after transition completes

    //         return () => {
    //             clearTimeout(timer1);
    //             clearTimeout(timer2);
    //             clearTimeout(timer3);
    //             clearTimeout(timer4);
    //         };
    //     } else {
    //         // Animation already played - go directly to header and show content immediately
    //         setAnimationStage('header');
    //         setShowOtherDivs(true);
    //         setLoading(false);
    //     }
    // }, []);

    // // Original loading timer (keeping for compatibility)
    // useEffect(() => {
    //     const timer1 = setTimeout(() => setLoading(false), 3000);
    //     return () => clearTimeout(timer1);
    // }, []);

    // useEffect(() => {
    //     if (showOtherDivs) {
    //         const timeout = setTimeout(() => setHasAnimatedIn(true), 50); // slight delay triggers transition
    //         return () => clearTimeout(timeout);
    //     }
    // }, [showOtherDivs]);


    return (
        <>
            <Head>
                <title>{sectionsRes?.[0]?.metatitle || 'Best Betting Apps'}</title>
                <meta
                    name="description"
                    content={
                        sectionsRes?.[0]?.meta_description
                            ? sectionsRes[0].meta_description.replace(/<[^>]+>/g, '').slice(0, 160)
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
                <meta property="og:image" content={`${typeof window !== 'undefined' ? window.location.origin : 'https://sportsbuz.com'}/favicon.ico`} />
                <meta property="og:title" content={sectionsRes?.[0]?.metatitle || 'Best Betting Apps'} />
                <meta property="og:description" content={sectionsRes?.[0]?.meta_description?.replace(/<[^>]+>/g, '').slice(0, 160) || ''} />
                <meta name="twitter:title" content={sectionsRes?.[0]?.metatitle || 'Best Betting Apps'} />
                <meta name="twitter:description" content={sectionsRes?.[0]?.meta_description?.replace(/<[^>]+>/g, '').slice(0, 160) || ''} />
                <link rel="canonical" href={`${baseUrl}${resolvedUrl}`} />
            </Head>

            <div
                // ref={containerRef}
                className={`${styles.loadingContainerOut}`}>
                <div
                    // ref={loadingAnimationRef}
                    className={`${styles.loadingAnimationOut} `}
                >
                    <div className={styles.loadingIconOut}>
                        <div className={styles.mainIconOut}>
                            <img src="/sportsbuz.gif" alt="Loading" className={styles.iconInnerOut} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
