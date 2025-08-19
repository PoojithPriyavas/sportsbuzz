// pages/best-betting-apps/[countryCode].js
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
import axios from "axios";
import { fetchBettingAppsSSR } from '@/lib/fetchBettingAppsSSR';

export async function getServerSideProps({ req, params }) {
    const { countryCode } = params; // This comes from [countryCode].js filename

    try {
        // Fetch location data
        const locationResponse = await axios.get('https://admin.sportsbuz.com/api/locations');
        const locationData = locationResponse.data;

        // Find current country data using the countryCode from URL
        const currentCountry = locationData.find(
            location => location.country_code.toLowerCase() === countryCode.toLowerCase()
        );

        if (!currentCountry) {
            return {
                notFound: true,
            };
        }

        // Fetch betting apps data for this specific country using the country_code
        const bettingTableData = await fetchBettingAppsSSR(currentCountry.country_code);

        console.log("Server-side props for country:", currentCountry.country_code, "Data:", bettingTableData);

        return {
            props: {
                bettingTableData,
                countryCode: currentCountry.country_code,
                locationData,
                currentCountry,
                isLocalhost: process.env.NODE_ENV === 'development'
            },
        };
    } catch (error) {
        console.error('Error in getServerSideProps:', error);
        return {
            props: {
                bettingTableData: [],
                countryCode: countryCode || 'IN',
                locationData: [],
                currentCountry: null,
                isLocalhost: process.env.NODE_ENV === 'development'
            },
        };
    }
}

export default function BestBettingApps({ countryCode, locationData, currentCountry, bettingTableData }) {
    console.log(locationData, "location data for", bettingTableData);

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
        bestSections
    } = useGlobalData();

    // Generate dynamic meta content based on country
    const generateMetaContent = () => {
        if (bettingTableData?.[0]) {
            return {
                title: bettingTableData[0].metatitle || `Best Betting Apps in ${currentCountry?.country || 'Your Country'}`,
                description: bettingTableData[0].meta_description
                    ? bettingTableData[0].meta_description.replace(/<[^>]+>/g, '').slice(0, 160)
                    : `Discover the top betting apps available in ${currentCountry?.country}. Compare odds, bonuses, and features for ${currentCountry?.sports?.toLowerCase() || 'sports'} betting.`
            };
        }

        return {
            title: `Best Betting Apps in ${currentCountry?.country || 'Your Country'}`,
            description: `Find the best betting apps for ${currentCountry?.sports?.toLowerCase() || 'sports'} in ${currentCountry?.country}. Compare top bookmakers and betting platforms.`
        };
    };

    const metaContent = generateMetaContent();

    useEffect(() => {
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
        const timer1 = setTimeout(() => setLoading(false), 3000);
        return () => clearTimeout(timer1);
    }, []);

    useEffect(() => {
        if (showOtherDivs) {
            const timeout = setTimeout(() => setHasAnimatedIn(true), 50);
            return () => clearTimeout(timeout);
        }
    }, [showOtherDivs]);

    return (
        <>
            <Head>
                <title>{metaContent.title}</title>
                <meta name="description" content={metaContent.description} />

                {/* Open Graph Meta Tags */}
                <meta property="og:title" content={metaContent.title} />
                <meta property="og:description" content={metaContent.description} />
                <meta property="og:type" content="website" />
                <meta property="og:locale" content={currentCountry?.hreflang || 'en'} />
                <meta property="og:url" content={`https://www.sportsbuz.com/${currentCountry?.hreflang || 'en'}-${countryCode.toLowerCase()}/`} />

                {/* Twitter Meta Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={metaContent.title} />
                <meta name="twitter:description" content={metaContent.description} />

                {/* Canonical URL */}
                {locationData?.map(({ hreflang, country_code }) => {
                    {/* console.log(hreflang, "href lan home") */ }
                    const href = `${baseUrl}/${hreflang}-${country_code.toLowerCase()}/`;
                    const fullHrefLang = `${hreflang}-${country_code}`;
                    {/* console.log('Generated link:', { href, fullHrefLang }); */ }

                    return (
                        <link
                            key={fullHrefLang}
                            rel="alternate"
                            href={href}
                            hreflang={fullHrefLang}
                        />
                    );
                })}

               
                <link
                    rel="alternate"
                    hrefLang="x-default"
                    href="https://www.sportsbuz.com/en-in/"
                />

                {/* Additional SEO Meta Tags */}
                <meta name="robots" content="index, follow" />
                <meta name="geo.region" content={countryCode} />
                <meta name="geo.placename" content={currentCountry?.country} />
                <meta name="language" content={currentCountry?.language} />

                {/* Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebPage",
                            "name": metaContent.title,
                            "description": metaContent.description,
                            "url": `https://www.sportsbuz.com/${currentCountry?.hreflang || 'en'}-${countryCode.toLowerCase()}/`,
                            "inLanguage": currentCountry?.hreflang,
                            "about": {
                                "@type": "Thing",
                                "name": `Betting Apps in ${currentCountry?.country}`,
                                "sameAs": `https://www.sportsbuz.com/${currentCountry?.hreflang || 'en'}-${countryCode.toLowerCase()}/`
                            },
                            "mainEntity": {
                                "@type": "ItemList",
                                "name": `Best Betting Apps in ${currentCountry?.country}`,
                                "description": `Top-rated betting applications available in ${currentCountry?.country}`
                            }
                        })
                    }}
                />
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
                        <BettingAppsTable sections={sections} />
                        <div
                            className={styles.description}
                            dangerouslySetInnerHTML={{ __html: bettingTableData?.[0]?.description }}
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