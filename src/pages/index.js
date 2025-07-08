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
    const timer1 = setTimeout(() => setLoading(true), 3000); // adjust time as per animation duration
    return () => clearTimeout(timer1);
  }, []);

  return (
    <>
      <Head>
        <title>Sportsbuz</title>
        <meta name="description" content="Your site description here" />
      </Head>

      <>
        <LoadingScreen onFinish={() => setLoading(false)} />
        <div className={`${geistSans.variable} ${geistMono.variable} container`}>
          <TestLive />
          <HeroCarousal />

          {/* Top Row - Bonus Table + Right Sidebar */}
          <div className={styles.topRow}>
            <div className={styles.bonusTableContainer}>
              <BonusTable sections={sections} />
            </div>
            <div className={styles.rightSidebar}>
              <AutoSlider />
            </div>
          </div>

          {/* Main Content Area */}
          <div className={styles.mainContent}>
            <div className={styles.leftSection}>
              <PredictionSection />
              <MultiBannerSlider />
              <TopNewsSection />
            </div>

            <div className={styles.centerSection}>
              <BlogSection blogs={blogs} />
            </div>

            <div className={styles.rightSection}>
              <BettingCard />
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
