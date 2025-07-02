import Header from "@/components/Header/Header";
import LiveScores from "@/components/LiveScoreSection/LiveScoreSection";
import Head from "next/head";
import BettingAppsTable from "@/components/BestBettingApps/BestBettingApps";
import UpcomingMatches from "@/components/UpComing/UpComingMatches";
import styles from '../../styles/Home.module.css';
import AutoSlider from "@/components/AutoSlider/AutoSlider";
import TopNewsSection from "@/components/NewsSection/TopNews";
import BlogSlider from "@/components/BlogsSection/BlogSlider";

export default function BestBettingApps() {

    return (
        <>
            <Head>
                <title>Best Betting Apps</title>
                <meta name="description" content="Your site description here" />
            </Head>
            <Header />
            <div className='container'>
                <LiveScores />
                <div className={styles.mainContent}>
                    <div className={styles.leftSection}>
                        <BettingAppsTable />
                    </div>

                    <div className={styles.rightSection}>
                        <AutoSlider />
                        <UpcomingMatches />
                        <div className={styles.bannerPlaceholder}>Multiple Banner Part</div>
                        <TopNewsSection />
                    </div>
                </div>
                <BlogSlider />
            </div>
        </>
    )
}