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
    upcomingMatches
  } = useGlobalData();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fixed: Timer was setting loading to true instead of false
    const timer1 = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer1);
  }, []);

  // // Show loading screen while loading
  // if (loading) {
  //   return <LoadingScreen onFinish={() => setLoading(false)} />;
  // }

  return (
    <>
      <Head>
        <title>Sportsbuz</title>
        <meta name="description" content="Your site description here" />
      </Head>
      <>
        <LoadingScreen onFinish={() => setLoading(false)} />

        <div className={`${geistSans.variable} ${geistMono.variable} container`}>
          {/* Top Hero Section */}
          <TestLive />
          <HeroCarousal />

          {/* Main Layout: 4 Columns */}
          <div className={styles.fourColumnRow}>
            {/* Left 3 columns combined */}
            <div className={styles.leftThreeColumns}>
              <BonusTable sections={sections} />

              {/* 1-2 Split under BonusTable */}
              <div className={styles.twoSplitRow}>
                <div className={styles.leftSplit}>
                  <TopNewsSection />
                  {/* <PredictionSection /> */}
                  {/* <MultiBannerSlider /> */}
                  <AutoSlider />

                </div>
                <div className={styles.centerSplit}>
                  <BlogSection blogs={blogs} />
                </div>
              </div>
            </div>

            {/* Column 4 - AutoSlider on top and others below */}
            <div className={styles.fourthColumn}>
              <BettingCard />
              <UpcomingFootballMatches />
              <AutoSlider />

              <AdsSlider />
              <CricketPrediction />
              <SmallAdBox />
            </div>
          </div>

          <GoogleAds />
        </div>
      </>
    </>
  );
}