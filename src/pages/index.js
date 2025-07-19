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
  // const sport = countryCode?.location?.sports?.toLowerCase() || 'cricket';
  useEffect(() => {
    // Fixed: Timer was setting loading to true instead of false
    const timer1 = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer1);
  }, []);

  // // Show loading screen while loading
  // if (loading) {
  //   return <LoadingScreen onFinish={() => setLoading(false)} />;
  // }

  console.log("enters this condition", countryCode?.location?.betting_apps.trim() === 'Active')

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
          {sport === 'cricket' ? (
            <>
              <LiveScores apiResponse={apiResponse} matchTypes={matchTypes} teamImages={teamImages} />
            </>
          ) : (
            <TestLive />
          )}
          <HeroCarousal />

          {/* Main Layout: 4 Columns */}
          <div className={styles.fourColumnRow}>
            {/* Left 3 columns combined */}
            <div className={styles.leftThreeColumns}>
              {countryCode?.location?.betting_apps === 'Active' && (
                <BonusTable sections={sections} />
              )}
              {/* 1-2 Split under BonusTable */}
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


                  {/* <PredictionSection /> */}
                  {/* <MultiBannerSlider /> */}


                </div>
                <div className={styles.centerSplit}>
                  <BlogSection blogs={blogs} />
                </div>
              </div>
            </div>

            {/* Column 4 - AutoSlider on top and others below */}
            <div className={styles.fourthColumn}>

              <BettingCard />
              <JoinTelegramButton />
              <AutoSlider />
              {/* {sport === 'cricket' ? (
                <>
                  <UpcomingMatches upcomingMatches={upcomingMatches} />
                </>
              ) : (
                <UpcomingFootballMatches />
              )} */}



              {/* <SportsOdsList /> */}

              {/* <AdsSlider /> */}
              {/* <CricketPrediction /> */}
              {/* <SmallAdBox /> */}
            </div>
          </div>


          {/* <GoogleAds /> */}
        </div>
        <Footer />
      </>
    </>
  );
}