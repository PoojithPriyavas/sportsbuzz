import Header from "@/components/Header/Header";
import LiveScores from "@/components/LiveScoreSection/LiveScoreSection";
import Head from "next/head";
import BettingAppsTable from "@/components/BestBettingApps/BestBettingApps";
import BettingAppsRecentTable from "@/components/BestBettingRecentApps/BestBettingRecentApps";
import UpcomingMatches from "@/components/UpComing/UpComingMatches";
import styles from '../../../styles/Home.module.css';
import AutoSlider from "@/components/AutoSlider/AutoSlider";
import TopNewsSection from "@/components/NewsSection/TopNews";
import BlogSlider from "@/components/BlogsSection/BlogSlider";
import LoadingScreen from "@/components/Loader/Loader";
import { useEffect, useState } from "react";
import TestLive from "@/components/LiveScoreSection/TestLive";
import BettingCard from '@/components/OddsMultiply/BettingCard';
import MatchScheduler from "@/components/FootballMatchScheduler/MatchScheduler";
import CricketDashboard from '@/components/CricketDashboard/CricketDashboard';
import Footer from '@/components/Footer/Footer';
import { useRouter } from "next/router"; // Changed from next/navigation to next/router
import FooterTwo from "@/components/Footer/Footer";
import HeaderTwo from "@/components/Header/HeaderTwo";
import { useLanguageValidation } from "@/hooks/useLanguageValidation";
import { useGlobalData } from "@/components/Context/ApiContext";
import HeaderThree from "@/components/Header/HeaderThree";

export default function CricketMatchDetails() {
    const { getCricketDetails, cricketDetails, location } = useGlobalData();
    const [loading, setLoading] = useState(true);
    const [animationStage, setAnimationStage] = useState('loading');
    const [showOtherDivs, setShowOtherDivs] = useState(false);
    const [hasAnimatedIn, setHasAnimatedIn] = useState(false);

    // Use useRouter instead of useParams for Pages Router
    const router = useRouter();
    const { slug: matchId, 'countrycode-hreflng': countryLang } = router.query;

    const languageValidation = useLanguageValidation(location, countryLang);

    // Get cricket details when matchId is available and router is ready
    useEffect(() => {
        if (!router.isReady) return; // Wait for router to be ready
        
        if (!matchId) {
            console.error("Match ID is missing");
            return;
        }
        getCricketDetails(matchId);
    }, [router.isReady, matchId, getCricketDetails]); 

   
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

    // Loading timer
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

    // Show loading state while router is not ready or params are not available
    if (!router.isReady || !matchId || !countryLang) {
        return <LoadingScreen />; // Or your preferred loading component
    }

    return (
        <>
            <Head>
                <title>Match Details</title>
                <meta name="description" content="Your site description here" />
            </Head>
            <HeaderThree animationStage={animationStage} />

            <div className='container'>
                <div className={styles.fourColumnRow}>
                    <div className={styles.leftThreeColumns}>
                        <CricketDashboard cricketDetails={cricketDetails} />
                    </div>
                    <div className={styles.fourthColumn}>
                        <BettingCard />
                        <AutoSlider />
                        <TopNewsSection />
                    </div>
                </div>
                <div className={styles.mainContent}>
                    <div className={styles.leftSection}>
                        {/* Left section content */}
                    </div>
                    {/* <div className={styles.rightSection}>
                        <div className={styles.bannerPlaceholder}>Multiple Banner Part</div>
                    </div> */}
                </div>
            </div>
            <FooterTwo />
        </>
    );
}