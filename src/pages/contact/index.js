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
import HeaderTwo from "@/components/Header/HeaderTwo";
import Contact from '@/components/Contact/Contact';
import Hero from '@/components/Hero/Hero';
import TestHeader from "@/components/Header/TestHeader";





export default function FootballMatchDetails() {

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fixed: Timer was setting loading to true instead of false
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
  return (
    <>
      <Head>
        <title>Match Details</title>
        <meta name="description" content="Your site description here" />
      </Head>
      {/* <Header /> */}
      <HeaderTwo animationStage={animationStage} />
      {/* <TestHeader /> */}

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