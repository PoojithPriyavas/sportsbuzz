import React, { useEffect, useState } from "react";
import Header from "@/components/Header/Header";
import LiveScores from "@/components/LiveScoreSection/LiveScoreSection";
import Head from "next/head";
import NewsDetails from "@/components/NewsSection/NewsDetails";
import FooterTwo from "@/components/Footer/Footer";
import NewsSectionCards from "@/components/NewsSection/NewsSection";
import HeaderTwo from "@/components/Header/HeaderTwo";
import styles from '../../styles/Home.module.css';
import BettingCards from "@/components/OddsMultiply/BettingCard";
import JoinTelegramButton from "@/components/JoinTelegram/JoinTelegramButton";
import AutoSlider from "@/components/AutoSlider/AutoSlider";


export default function blogDetailsMain() {
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

            <HeaderTwo animationStage={animationStage} />
            {/* <div className="container">
                <NewsSectionCards />
            </div> */}

            <div className={` ${animationStage === 'header' ? styles.visible : styles.hidden} ${styles.fadeUpEnter}   ${hasAnimatedIn ? styles.fadeUpEnterActive : ''} ${styles.offHeader} container`}>

                <div className={styles.fourColumnRow}>
                    <div className={styles.leftThreeColumns}>
                        <NewsSectionCards />
                    </div>
                    <div className={styles.fourthColumn}>
                        <div className={styles.fourthColumnTwoColumns}>
                            <div className={styles.fourthColumnLeft}>
                                <BettingCards />
                                <JoinTelegramButton />
                            </div>
                            <div className={styles.fourthColumnRight}>
                                <AutoSlider />
                            </div>
                        </div>
                        {/* {sport === 'cricket' ? (
                        <>
                            <UpcomingMatches upcomingMatches={upcomingMatches} />
                        </>
                    ) : (
                        <UpcomingFootballMatches />
                    )} */}
                    </div>
                </div>
            </div>
            <FooterTwo />
        </>
    )
}