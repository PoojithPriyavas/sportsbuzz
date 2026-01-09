'use client';
import Head from "next/head";
import { useEffect, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
// import styles from "@/styles/Home.module.css";
import Header from "@/components/Header/Header";
import LiveScores from "@/components/LiveScoreSection/LiveScoreSection";
import BonusTable from "@/components/BonusTable/BonusTable";
import UpcomingMatches from "@/components/UpComing/UpComingMatches";
import AutoSlider from "@/components/AutoSlider/AutoSlider";
import PredictionSection from "@/components/Prediction/Prediction";
import SmallAdBox from "@/components/SmallAds/SmallAdsBox";
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
import HeaderThree from "@/components/Header/HeaderThree";
import RegionSelector from "@/components/RegionSelector/RegionSelector";
import AutoSliderEven from "@/components/AutoSlider/AutoSliderEven";
import SportsOdsMegaPari from "@/components/SportsOdds/SportsOdsmegaPari";
import styles from '../styles/globalHeader.module.css';
// Import hreflang helper utilities
// import {
//   hasHreflangTags,
//   hasLanguageCountryFormat,
//   logHreflangStatus
// } from "@/utils/hreflangHelper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import axios from 'axios';

// export async function getServerSideProps(context) {
//   try {
//     const locationRes = await fetch('https://admin.sportsbuz.com/api/locations');

//     if (!locationRes.ok) {
//       throw new Error(`Location API failed: ${locationRes.status} ${locationRes.statusText}`);
//     }

//     const locationDataHome = await locationRes.json();

//     return {
//       props: {
//         locationDataHome
//       }
//     };
//   } catch (error) {
//     console.error("Error fetching data from location API:", error.message);
//     return {
//       props: {
//         locationDataHome: null,
//         isLocalhost: process.env.NODE_ENV === 'development'
//       }
//     };
//   }
// }

export default function Home({
  // locationDataHome, isLocalhost
}) {
  // console.log(locationDataHome, "location data home")
  // const {
  //   blogCategories,
  //   blogs,
  //   sections,
  //   apiResponse,
  //   matchTypes,
  //   teamImages,
  //   upcomingMatches,
  //   sport,
  //   countryCode,
  //   stages,
  //   news,
  //   activeOddBanners,
  //   activeEvenBanners,
  //   bannerLoading
  // } = useGlobalData();
  // console.log(apiResponse,"api response")
  // console.log(blogs, "blogs in index")

  // const baseUrl = isLocalhost ? 'http://localhost:3000' : 'https://sportsbuz.com';

  // // console.log(sections, "best betting apps console");

  // const [loading, setLoading] = useState(true);
  // const [animationStage, setAnimationStage] = useState('loading');
  // const [showOtherDivs, setShowOtherDivs] = useState(false);
  // const [hasAnimatedIn, setHasAnimatedIn] = useState(false);
  // const [hreflangDetected, setHreflangDetected] = useState(false);

  // Check for hreflang tags and URL format on component mount
  // useEffect(() => {
  //   const checkHreflangStatus = () => {
  //     const hasHreflang = hasHreflangTags();
  //     const hasValidFormat = hasLanguageCountryFormat(window.location.pathname);

  //     setHreflangDetected(hasHreflang);

  //     // Log the scenario being used
  //     if (hasHreflang && hasValidFormat) {
  //       logHreflangStatus('2', {
  //         pathname: window.location.pathname,
  //         hasHreflang,
  //         hasValidFormat
  //       });
  //     } else {
  //       logHreflangStatus('1', {
  //         pathname: window.location.pathname,
  //         hasHreflang,
  //         hasValidFormat
  //       });
  //     }
  //   };

  //   // Check after a small delay to ensure DOM is ready
  //   const timer = setTimeout(checkHreflangStatus, 500);
  //   return () => clearTimeout(timer);
  // }, []);

  // useEffect(() => {
  //   // Check if animation has been played before
  //   const hasPlayedAnimation = localStorage.getItem('headerAnimationPlayed');

  //   if (!hasPlayedAnimation) {
  //     // First time - play the full animation sequence
  //     const timer1 = setTimeout(() => setAnimationStage('logoReveal'), 2000);
  //     const timer2 = setTimeout(() => setAnimationStage('transition'), 3500);
  //     const timer3 = setTimeout(() => setAnimationStage('header'), 5000);
  //     const timer4 = setTimeout(() => setShowOtherDivs(true), 6500);

  //     return () => {
  //       clearTimeout(timer1);
  //       clearTimeout(timer2);
  //       clearTimeout(timer3);
  //       clearTimeout(timer4);
  //     };
  //   } else {
  //     // Animation already played - go directly to header and show content immediately
  //     setAnimationStage('header');
  //     setShowOtherDivs(true);
  //     setLoading(false);
  //   }
  // }, []);

  // // Original loading timer (keeping for compatibility)
  // useEffect(() => {
  //   const timer1 = setTimeout(() => setLoading(false), 3000);
  //   return () => clearTimeout(timer1);
  // }, []);

  // useEffect(() => {
  //   if (showOtherDivs) {
  //     const timeout = setTimeout(() => setHasAnimatedIn(true), 50);
  //     return () => clearTimeout(timeout);
  //   }
  // }, [showOtherDivs]);

  // Generate hreflang links only if locationDataHome is available
  // const generateHreflangLinks = () => {
  //   if (!locationDataHome || !Array.isArray(locationDataHome)) {
  //     // console.warn('No location data available for hreflang generation');
  //     return [];
  //   }

  //   return locationDataHome.map(({ hreflang, country_code }) => {
  //     // console.log(hreflang, "href lang home")
  //     const href = `${baseUrl}/${hreflang}-${country_code.toLowerCase()}/`;
  //     const fullHrefLang = `${hreflang}-${country_code}`;
  //     // console.log('Generated hreflang link:', { href, fullHrefLang });

  //     return {
  //       key: fullHrefLang,
  //       hreflang: fullHrefLang,
  //       href: href
  //     };
  //   });
  // };

  // const hreflangLinks = generateHreflangLinks();

  return (
    <>
      {/* <Head>
        <title>Sportsbuz | Live Scores, Sports News & Betting Predictions</title>
        <meta
          name="description"
          content="Get the latest live scores, sports news, betting predictions, and match insights. Stay ahead in cricket, football and more with Sportsbuz."
        />
        <meta
          name="keywords"
          content="sportsbuz, sports news, live scores, betting tips, match predictions, best betting sites, best betting app, best betting app for football, best betting app for cricket, best betting website, best betting sites with instant withdrawal, Top 10 online betting sites, Top 10 betting apps, Best betting app for football, Best sports betting app to make money"
        />
        <meta name="author" content="Sportsbuz" />
        <link rel="alternate" href="https://sportsbuz.com/" hreflang="x-default" />
        {hreflangLinks.map(({ key, hreflang, href }) => (
          <link
            key={key}
            rel="alternate"
            href={href}
            hrefLang={hreflang}
          />
        ))}

        <link rel="canonical" href={`${baseUrl}${typeof window !== 'undefined' ? window.location.pathname : ''}`} />

        <meta property="og:title" content="Sportsbuz | Live Scores & Betting Tips" />
        <meta
          property="og:description"
          content="Catch live scores and expert predictions for cricket, football and more. Your ultimate sports companion."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sportsbuz.com/" />
        <meta property="og:image" content="https://sportsbuz.com/images/logo.png" />
        <meta property="og:site_name" content="Sportsbuz" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sportsbuz | Live Scores & Predictions" />
        <meta
          name="twitter:description"
          content="Live sports scores, news, and betting predictions for cricket, football and more — only on Sportsbuz."
        />
        <meta name="twitter:image" content="https://sportsbuz.com/images/logo.png" />
        <meta name="twitter:site" content="@sportsbuz" />

        <link rel="icon" href="/favicon.ico" />

        <meta name="hreflang-detected" content={hreflangDetected ? 'true' : 'false'} />

      </Head> */}

      <>
        {/* Debug info in development */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '10px',
            fontSize: '12px',
            zIndex: 9999
          }}>
            <div>Hreflang Tags: {hreflangDetected ? '✅' : '❌'}</div>
            <div>URL Format: {hasLanguageCountryFormat(typeof window !== 'undefined' ? window.location.pathname : '') ? '✅' : '❌'}</div>
            <div>Scenario: {hreflangDetected && hasLanguageCountryFormat(typeof window !== 'undefined' ? window.location.pathname : '') ? '2' : '1'}</div>
          </div>
        )} */}

        {/* <HeaderThree animationStage={animationStage} />
        {showOtherDivs && (
          <div
            className={`${geistSans.variable} ${geistMono.variable} ${animationStage === 'header' ? styles.visible : styles.hidden} ${styles.fadeUpEnter} ${hasAnimatedIn ? styles.fadeUpEnterActive : ''} ${styles.offHeader} container`}>

            {sport === 'cricket' ? (
              <>
                {apiResponse && <LiveScores apiResponse={apiResponse} matchTypes={matchTypes} teamImages={teamImages} />}
              </>
            ) : (
              <>
                {stages && <TestLive />}
              </>
            )}

            <HeroCarousal countryCode={countryCode} />

            <div className={styles.fourColumnRow}>
              <div className={styles.leftThreeColumns}>
                {countryCode?.location?.betting_apps == 'Active' && (
                  <BonusTable sections={sections} />
                )}
                <div className={styles.twoSplitRow}>
                  <div className={styles.leftSplit}>
                    <SportsOdsList />
                    {news && <NewsList />}
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
                  {activeOddBanners.length > 0 &&
                    <div className={styles.fourthColumnRight}>
                      <AutoSlider activeOddBanners={activeOddBanners} bannerLoading={bannerLoading} />
                    </div>
                  }
                </div>
                {sport === 'cricket' ? (
                  <>
                    <UpcomingMatches upcomingMatches={upcomingMatches} />
                  </>
                ) : (
                  <UpcomingFootballMatches />
                )}
                {activeEvenBanners.length > 0 && <AutoSliderEven activeEvenBanners={activeEvenBanners} bannerLoading={bannerLoading} />}
                <SportsOdsMegaPari />
              </div>
            </div>
          </div>
        )}
        {showOtherDivs && <Footer />} */}
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
    </>
  );
}

// Add this import at the top of the file
// import DebugPanel from '../components/Common/DebugPanel';

// In your component's return statement, add the DebugPanel
// Find the closing tag of your main container and add it right before that

// For example, if your component looks like:
// return (
//   <div className={styles.container}>
//     {/* Your existing content */}
//   </div>
// );

// Change it to:
// return (
//   <div className={styles.container}>
//     {/* Your existing content */}
//     <DebugPanel />
//   </div>
// );

// If you're in development mode, you can conditionally render it:
// {process.env.NODE_ENV === 'development' && <DebugPanel />}