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
import { useGlobalData } from "@/components/Context/ApiContext";
import UpcomingFootballMatches from "@/components/UpComing/UpComingFootball";
import RecentAppsDetails from "@/components/BestBettingRecentApps/RecetDetail";
import HeaderTwo from "@/components/Header/HeaderTwo";
import { fetchBestBettingAppsSSR } from "@/lib/fetchBestBettingAppsSSR";
import { useLanguageValidation } from "@/hooks/useLanguageValidation";
import axios from "axios";
import CountryLayout from "@/components/layouts/CountryLayout";
import SportsOdsMegaPari from "@/components/SportsOdds/SportsOdsmegaPari";
import AutoSliderEven from "@/components/AutoSlider/AutoSliderEven";

export async function getServerSideProps(context) {
    const { req, query, params, resolvedUrl } = context;

    let countryDataHome = null;
    let locationDataHome = null;
    const queryValue = query;

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
                    return null;
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
                    return null;
                })
        ]);

        countryDataHome = countryRes;
        locationDataHome = locationRes;

    } catch (error) {
        console.error('Error in Promise.all:', error);
    }

    // const countryCookie = req.cookies.countryData;
    // const countryData = countryCookie ? JSON.parse(countryCookie) : null;
    // const countryCodes = countryData?.country_code || 'LK';
    const hrefLanCookie = req.cookies.lanTagValues;
    const hrefLanData = hrefLanCookie ? JSON.parse(hrefLanCookie) : null;

    // FIXED: Pass parameters with correct names

    const hreflang = queryValue['countrycode-hreflng']; // "en-in"
    const countryCodes = hreflang ? hreflang.split('-')[1] : null; // "in"

    const slug = queryValue.slug;
    let bestSections = null;

    try {
        console.log('Fetching with params:', { countryCode: countryCodes, slug }); // Debug log
        bestSections = await fetchBestBettingAppsSSR({
            countryCode: countryCodes,
            slug
        });
        console.log('bestSections result:', bestSections);
    } catch (error) {
        console.error('Error fetching best sections:', error);
        bestSections = [];
    }

    return {
        props: {
            bestSections,
            queryValue,
            countryCodes,
            hrefLanData,
            resolvedUrl,
            isLocalhost: process.env.NODE_ENV === 'development',
            locationDataHome
        },
    };
}


export default function BestBettingApps({ bestSections, queryValue, countryCodes, hrefLanData, resolvedUrl, isLocalhost, locationDataHome }) {
    console.log(bestSections, "api response from the betting apps recent");
    console.log(queryValue, "query value");
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
        setShowOtherDivs,
        showOtherDivs,

        // bestSections,

    } = useGlobalData();

    const [animationStage, setAnimationStage] = useState('loading');
    // const [showOtherDivs, setShowOtherDivs] = useState(false);
    const [hasAnimatedIn, setHasAnimatedIn] = useState(false);


    useEffect(() => {
        // Check if animation has been played before (only in browser environment)
        if (typeof window !== 'undefined') {
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

    // const sectionIdNumber = parseInt(sectionId); // Convert to number
    // const matchedSection = bestSections.find(section => section.id === sectionIdNumber);

    // const metaTitle = matchedSection?.metatitle || 'Best Betting Apps';
    // const metaDescription = matchedSection?.meta_description?.replace(/<[^>]+>/g, '') || 'Discover the best betting apps available in India.';

    // console.log("meta title in country :", metaTitle);
    // console.log("meta desc in country :", metaDescription);
    // At the top of your component
    const stripHtml = (html) => {
        if (!html) return '';
        return html.replace(/<[^>]*>/g, '').trim();
    };

    return (
        <>
            <Head>
                <title>{bestSections[0]?.metatitle}</title>
                <meta name="description" content={stripHtml(bestSections[0]?.meta_description)} />
                <meta name="keywords" content={bestSections[0]?.keywords || ''} />

                {/* Open Graph Meta Tags */}
                <meta property="og:title" content={bestSections[0]?.metatitle} />
                <meta property="og:description" content={stripHtml(bestSections[0]?.meta_description)} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
                <meta property="og:image" content={`${typeof window !== 'undefined' ? window.location.origin : 'https://sportsbuz.com'}/favicon.ico`} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:site_name" content="Sportsbuz" />

                {/* Twitter Card Meta Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={bestSections[0]?.metatitle} />
                <meta name="twitter:description" content={stripHtml(bestSections[0]?.meta_description)} />
                <meta name="twitter:image" content={`${typeof window !== 'undefined' ? window.location.origin : 'https://sportsbuz.com'}/favicon.ico`} />

                {/* Additional SEO Meta Tags */}
                <meta name="robots" content="index, follow" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
                <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />

                {/* Hreflang Tags */}
                {hrefLanData?.map(({ hreflang, country_code }) => {
                    const href = `${baseUrl}/${country_code.toLowerCase()}/${hreflang}/blogs/pages/all-blogs`;
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
            </Head>

            {/* Removed inline HeaderThree; provided by CountryLayout */}

            <div className='container' style={{ paddingRight: '0rem', paddingLeft: '0rem' }}>

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
                        <RecentAppsDetails bestSections={bestSections[0]} />
                    </div>
                    <div className={styles.fourthColumn} >
                        <div className={styles.fourthColumnTwoColumns}>
                            <div className={styles.fourthColumnLeft}>
                                <BettingCard countryCode={countryCode} />
                                <JoinTelegramButton countryCode={countryCode} />
                            </div>
                            {activeOddBanners.length > 0 &&
                                <div className={styles.fourthColumnRight}>
                                    <AutoSlider activeOddBanners={activeOddBanners} bannerLoading={bannerLoading} />
                                </div>
                            }
                        </div>
                        {sport === 'cricket' ? (
                            <>
                                <UpcomingMatches upcomingMatches={upcomingMatches} countryCode={countryCode} />
                            </>
                        ) : (
                            <UpcomingFootballMatches countryCode={countryCode} />
                        )}

                        {activeEvenBanners.length > 0 && <AutoSliderEven activeEvenBanners={activeEvenBanners} bannerLoading={bannerLoading} />}
                        <SportsOdsMegaPari />
                    </div>
                </div>

                <BettingAppsRecentTable bestSections={bestSections} countryCode={countryCode} />
            </div>


        </>
    )
}

// Attach shared layout: HeaderThree → content → FooterTwo
BestBettingApps.getLayout = function getLayout(page) {
    return <CountryLayout>{page}</CountryLayout>;
}