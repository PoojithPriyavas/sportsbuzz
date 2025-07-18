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
import FooterTwo from "@/components/Footer/Footer";


export default function MatchSchedulerScreen() {

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fixed: Timer was setting loading to true instead of false
        const timer1 = setTimeout(() => setLoading(false), 3000);
        return () => clearTimeout(timer1);
    }, []);

    return (
        <>
            <Head>
                <title>Match Schedules</title>
                <meta name="description" content="Your site description here" />
            </Head>
            {/* <Header /> */}
            <LoadingScreen onFinish={() => setLoading(false)} />

            <div className='container'>
                {/* <LiveScores /> */}
                <TestLive />
                <div className={styles.fourColumnRow}>
                    <div className={styles.leftThreeColumns}>
                        <MatchScheduler />
                    </div>
                    <div className={styles.fourthColumn} >
                        <BettingCard />
                        <AutoSlider />
                        <TopNewsSection />
                    </div>
                </div>
                <div className={styles.mainContent}>
                    <div className={styles.leftSection}>

                    </div>

                    <div className={styles.rightSection}>

                        {/* <UpcomingMatches /> */}
                        <div className={styles.bannerPlaceholder}>Multiple Banner Part</div>

                    </div>
                </div>
                <BettingAppsRecentTable />

            </div>
             <FooterTwo />
        </>
    )
}