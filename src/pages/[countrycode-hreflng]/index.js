'use client';
import Head from "next/head";
import { useEffect, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import Header from "@/components/Header/Header";
import LiveScores from "@/components/LiveScoreSection/LiveScoreSection";
import BonusTable from "@/components/BonusTable/BonusTable";
import UpcomingMatches from "@/components/UpComing/UpComingMatches";
import AutoSlider from "@/components/AutoSlider/AutoSlider";
import PredictionSection from "@/components/Prediction/Prediction";
import SmallAdBox from "@/components/SmallAds/SmallAdsBox";
// import TopNewsSection from "@/components/NewsSection/TopNews";
import NewsList from "@/components/NewsSection/TopNews";
import MultiBannerSlider from "@/components/Multibanner/MultiBannerSlider";
import BlogSection from "@/components/BlogsSection/BlogsSection";
import AdsSlider from "@/components/AdSlider/AdSlider";
import CricketPrediction from "@/components/Betting/CricketPrediction";
import HeroCarousal from "@/components/HeroCarousal/Carousal";
import GoogleAds from "@/components/googleAds/GoogleAds";
import { useGlobalData } from "@/components/Context/ApiContext";
import TestLive from "@/components/LiveScoreSection/TestLive";
import LoadingScreen from "@/components/Loader/Loader";
import BettingCard from '@/components/OddsMultiply/BettingCard';
import UpcomingFootballMatches from "@/components/UpComing/UpComingFootball";
import SportsOdsList from "@/components/SportsOdds/SportsOdsList";
import JoinTelegramButton from '@/components/JoinTelegram/JoinTelegramButton';
import Footer from '@/components/Footer/Footer';
import TestHeader from "@/components/Header/TestHeader";
import HeaderTwo from "@/components/Header/HeaderTwo";
import RegionSelector from "@/components/RegionSelector/RegionSelector";
import { useRouter } from "next/router";
import { useParams } from "next/navigation";
import { useLanguageValidation } from "@/hooks/useLanguageValidation";
import AutoSliderEven from "@/components/AutoSlider/AutoSliderEven";


const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

import axios from 'axios';
import HeaderThree from "@/components/Header/HeaderThree";
import SportsOdsMegaPari from "@/components/SportsOdds/SportsOdsmegaPari";

export async function getServerSideProps(context) {
    try {
        const [countryRes, locationRes] = await Promise.all([
            fetch('https://admin.sportsbuz.com/api/get-country-code/')
                .then(async (response) => {
                    if (!response.ok) {
                        throw new Error(`Country API failed: ${response.status} ${response.statusText}`);
                    }
                    return response.json();
                }),
            fetch('https://admin.sportsbuz.com/api/locations')
                .then(async (response) => {
                    if (!response.ok) {
                        throw new Error(`Location API failed: ${response.status} ${response.statusText}`);
                    }
                    return response.json();
                })
        ]);

        const countryDataHome = countryRes;
        const locationDataHome = locationRes;

        return {
            props: {
                countryDataHome,
                locationDataHome
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

export default function Home({ countryDataHome, locationDataHome, isLocalhost }) {

    const {
        blogCategories,
        blogs,
        sections,
        apiResponse,
        matchTypes,
        teamImages,
        upcomingMatches,
        sport,
        // countryCode,
        stages,
        news,
        fetchBettingApps

    } = useGlobalData();
    // console.log(sections, "sections")
    const baseUrl = isLocalhost ? 'http://localhost:3000' : 'https://www.sportsbuz.com';
    const router = useRouter();
    const { "countrycode-hreflng": countryLang } = useParams();
    // console.log(countryLang, "params value");

    const languageValidation = useLanguageValidation(locationDataHome, countryLang);
    // console.log(slug.countrycode-hreflng,"slug in index")

    // console.log(locationDataHome, "location home");
    // console.log(countryDataHome, "country data home")


    // if (countryCode && countryCode.country_code) {
    //   console.log("Valid country code:", countryCode.country_code);
    // }

    const [loading, setLoading] = useState(true);
    const [animationStage, setAnimationStage] = useState('loading');
    const [showOtherDivs, setShowOtherDivs] = useState(false);
    const [hasAnimatedIn, setHasAnimatedIn] = useState(false);
    useEffect(() => {
        fetchBettingApps()
    }, [])

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


    // console.log("enters this condition", countryCode?.location?.betting_apps?.trim() === 'Active');

    return (
        <>
            <Head>
                <title>Sportsbuz | Live Scores, Sports News & Betting Predictions</title>
                <meta
                    name="description"
                    content="Get the latest live scores, sports news, betting predictions, and match insights. Stay ahead in cricket, football and more with Sportsbuz."
                />
                <meta
                    name="keywords"
                    content="sports news, live scores, cricket scores, football matches, betting tips, match predictions, Sportsbuz"
                />
                <meta name="author" content="Sportsbuz" />

                {/* Canonical */}
                {locationDataHome?.map(({ hreflang, country_code }) => {
                    console.log(hreflang, "href lan sp-home");
                    const href = `${baseUrl}/${hreflang}-${country_code.toLowerCase()}/`;
                    const fullHrefLang = `${hreflang}-${country_code}`;
                    console.log('sp-Generated link:', { href, fullHrefLang });

                    return (
                        <link
                            key={fullHrefLang}
                            rel="alternate"
                            href={href}
                            hreflang={fullHrefLang}
                        />
                    );
                })}
                {/* Open Graph (for Facebook, LinkedIn, etc.) */}
                <meta property="og:title" content="Sportsbuz | Live Scores & Betting Tips" />
                <meta
                    property="og:description"
                    content="Catch live scores and expert predictions for cricket, football and more. Your ultimate sports companion."
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.sportsbuz.com/" />
                <meta property="og:image" content="https://www.sportsbuz.com/images/logo.png" />
                <meta property="og:site_name" content="Sportsbuz" />

                {/* Twitter Card (for Twitter/X) */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Sportsbuz | Live Scores & Predictions" />
                <meta
                    name="twitter:description"
                    content="Live sports scores, news, and betting predictions for cricket, football and more — only on Sportsbuz."
                />
                <meta name="twitter:image" content="https://www.sportsbuz.com/images/logo.png" />
                <meta name="twitter:site" content="@sportsbuz" />

                {/* Favicon */}
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <>

                {/* {showOtherDivs && <RegionSelector countryDataHome={countryDataHome} locationDataHome={locationDataHome} />} */}
                <HeaderThree animationStage={animationStage} />
                {showOtherDivs && (
                    <div
                        // style={{marginTop:'9.5rem'}}
                        className={`${geistSans.variable} ${geistMono.variable} ${animationStage === 'header' ? styles.visible : styles.hidden} ${styles.fadeUpEnter}   ${hasAnimatedIn ? styles.fadeUpEnterActive : ''} ${styles.offHeader} container`}>

                        {sport === 'cricket' && apiResponse && (
                            <LiveScores
                                apiResponse={apiResponse}
                                matchTypes={matchTypes}
                                teamImages={teamImages}
                            />
                        )}

                        {sport === 'football' && stages && (
                            <TestLive />
                        )}

                        <HeroCarousal countryCode={countryDataHome} />

                        <div className={styles.fourColumnRow}>
                            <div className={styles.leftThreeColumns}>
                                {/* {countryDataHome?.location?.betting_apps == 'Active' && ( */}
                                <BonusTable sections={sections} />
                                {/* )} */}
                                <div className={styles.twoSplitRow}>
                                    <div className={styles.leftSplit}>
                                        {/* {sport === 'cricket' ? (
                      <>
                        <UpcomingMatches upcomingMatches={upcomingMatches} />
                      </>
                    ) : (
                      <UpcomingFootballMatches />
                    )} */}
                                        <SportsOdsList />
                                        {news && (
                                            <div className={styles.hideOnMobile}>
                                                <NewsList />
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.centerSplit}>
                                        <BlogSection blogs={blogs} />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.fourthColumn}>
                                <div className={styles.fourthColumnTwoColumns}>
                                    <div className={styles.fourthColumnLeft}>
                                        <BettingCard />
                                        <JoinTelegramButton />
                                    </div>
                                    <div className={styles.fourthColumnRight}>
                                        <AutoSlider countryCode={countryDataHome} />
                                    </div>
                                </div>
                                {sport === 'cricket' ? (
                                    <>
                                        <UpcomingMatches upcomingMatches={upcomingMatches} />
                                    </>
                                ) : (
                                    <UpcomingFootballMatches />
                                )}
                                <AutoSliderEven countryCode={countryDataHome} />
                                <SportsOdsMegaPari />
                            </div>
                        </div>
                    </div>
                )}
                {showOtherDivs && <Footer />}
            </>
        </>
    );
}