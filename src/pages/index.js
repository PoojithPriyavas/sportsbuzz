import Head from "next/head";
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
import BestBettingApps from "@/components/Betting/BestBettingApps";
import HeroCarousal from "@/components/HeroCarousal/Carousal";
import GoogleAds from "@/components/googleAds/GoogleAds";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <>
      <Head>
        <title>Sports Buzz</title>
        <meta name="description" content="Your site description here" />
      </Head>
      <Header />
      <div className={`${geistSans.variable} ${geistMono.variable} container`}>
        <LiveScores />
        <HeroCarousal />
        <div className={styles.mainContent}>
          <div className={styles.leftSection}>
            <BonusTable />
          </div>

          <div className={styles.rightSection}>
            <AutoSlider />
            <UpcomingMatches />
            <div className={styles.bannerPlaceholder}>Multiple Banner Part</div>
          </div>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.leftSection2}>
            <PredictionSection />
            <MultiBannerSlider />
            <TopNewsSection />
          </div>

          <div className={styles.centerSection}>
            <BlogSection />
          </div>

          <div className={styles.rightSection2}>
            <AdsSlider />
            <BestBettingApps />
            <SmallAdBox />
          </div>
        </div>
        <GoogleAds />
      </div>
    </>
  );
}
