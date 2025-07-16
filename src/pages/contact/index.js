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
import MatchScheduler from "@/components/FootballMatchScheduler/MatchScheduler";
import MatchDetails from '@/components/MatchCard/MatchCard';
import Footer from '@/components/Footer/Footer';

import Contact from '@/components/Contact/Contact';
import Hero from '@/components/Hero/Hero';





export default function FootballMatchDetails() {

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fixed: Timer was setting loading to true instead of false
    const timer1 = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer1);
  }, []);

  return (
    <>
      <Head>
        <title>Match Details</title>
        <meta name="description" content="Your site description here" />
      </Head>
      {/* <Header /> */}
      <LoadingScreen onFinish={() => setLoading(false)} />

      <Hero />
      <div className='container'>
        {/* <LiveScores /> */}
        {/* <TestLive /> */}

        <Contact />


      </div>
      <Footer />
    </>
  )
}