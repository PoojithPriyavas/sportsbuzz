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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const {
    blogCategories,
    blogs,
    sections,
    apiResponse,
    matchTypes,
    teamImages,
    upcomingMatches,
    sport,
    countryCode
  } = useGlobalData();

  const [loading, setLoading] = useState(true);
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


  console.log("enters this condition", countryCode?.location?.betting_apps?.trim() === 'Active');

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
        <link rel="canonical" href="https://www.sportsbuz.com/" />

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
        <HeaderTwo animationStage={animationStage} />
        {showOtherDivs && (
          <div 
          // style={{marginTop:'9.5rem'}}
           className={`${geistSans.variable} ${geistMono.variable} ${animationStage === 'header' ? styles.visible : styles.hidden} ${styles.fadeUpEnter}   ${hasAnimatedIn ? styles.fadeUpEnterActive : ''} ${styles.offHeader} container`}>
            {sport === 'cricket' ? (
              <>
                <LiveScores apiResponse={apiResponse} matchTypes={matchTypes} teamImages={teamImages} />
              </>
            ) : (
              <TestLive />
            )}
            <HeroCarousal />

            <div className={styles.fourColumnRow}>
              <div className={styles.leftThreeColumns}>
                {countryCode?.location?.betting_apps === 'Active' && (
                  <BonusTable sections={sections} />
                )}
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
                    <NewsList />
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
              </div>
            </div>
          </div>
        )}
        {showOtherDivs && <Footer />}
      </>
    </>
  );
}