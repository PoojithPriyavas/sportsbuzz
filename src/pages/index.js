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
import TopNewsSection from "@/components/NewsSection/TopNews";
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

  console.log("enters this condition", countryCode?.location?.betting_apps?.trim() === 'Active');

  return (
    <>
      <Head>
        <title>Sportsbuz</title>
        <meta name="description" content="Your site description here" />
      </Head>
      <>
        <HeaderTwo animationStage={animationStage} />
        {showOtherDivs && (
          <div className={`${geistSans.variable} ${geistMono.variable} ${animationStage === 'header' ? styles.visible : styles.hidden} container`}>
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
                    {sport === 'cricket' ? (
                      <>
                        <UpcomingMatches upcomingMatches={upcomingMatches} />
                      </>
                    ) : (
                      <UpcomingFootballMatches />
                    )}
                    <SportsOdsList />
                    <TopNewsSection />
                  </div>
                  <div className={styles.centerSplit}>
                    <BlogSection blogs={blogs} />
                  </div>
                </div>
              </div>

              <div className={styles.fourthColumn}>
                <BettingCard />
                <JoinTelegramButton />
                <AutoSlider />
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