import Header from "@/components/Loader/Loader";
import BlogsPage from "@/components/BlogsSection/BlogPage";
import LiveScores from "@/components/LiveScoreSection/LiveScoreSection";
import Head from "next/head";
import { useState, useEffect } from 'react';
import { useGlobalData } from "@/components/Context/ApiContext";
import FooterTwo from "@/components/Footer/Footer";
import HeaderTwo from "@/components/Header/HeaderTwo";
import styles from '../styles/globalHeader.module.css';

export default function NewsData() {
    const { blogs, } = useGlobalData()
    // useEffect(() => {
    //     // Fixed: Timer was setting loading to true instead of false
    //     const timer1 = setTimeout(() => setLoading(false), 3000);
    //     return () => clearTimeout(timer1);
    // }, []);
    // const [animationStage, setAnimationStage] = useState('loading');
    // const [showOtherDivs, setShowOtherDivs] = useState(false);
    // const [hasAnimatedIn, setHasAnimatedIn] = useState(false);


    // useEffect(() => {
    //     // Check if animation has been played before
    //     const hasPlayedAnimation = localStorage.getItem('headerAnimationPlayed');

    //     if (!hasPlayedAnimation) {
    //         // First time - play the full animation sequence
    //         const timer1 = setTimeout(() => setAnimationStage('logoReveal'), 2000);
    //         const timer2 = setTimeout(() => setAnimationStage('transition'), 3500);
    //         const timer3 = setTimeout(() => setAnimationStage('header'), 5000);
    //         const timer4 = setTimeout(() => setShowOtherDivs(true), 6500); // Show content after transition completes

    //         return () => {
    //             clearTimeout(timer1);
    //             clearTimeout(timer2);
    //             clearTimeout(timer3);
    //             clearTimeout(timer4);
    //         };
    //     } else {
    //         // Animation already played - go directly to header and show content immediately
    //         setAnimationStage('header');
    //         setShowOtherDivs(true);
    //         setLoading(false);
    //     }
    // }, []);

    // // Original loading timer (keeping for compatibility)
    // useEffect(() => {
    //     const timer1 = setTimeout(() => setLoading(false), 3000);
    //     return () => clearTimeout(timer1);
    // }, []);

    // useEffect(() => {
    //     if (showOtherDivs) {
    //         const timeout = setTimeout(() => setHasAnimatedIn(true), 50); // slight delay triggers transition
    //         return () => clearTimeout(timeout);
    //     }
    // }, [showOtherDivs]);

    return (
        <>
            {/* <Head>
                <title>Sports Buzz | News</title>
                <meta name="description" content="Your site description here" />
            </Head>
            <HeaderTwo animationStage={animationStage} />
            <div className='container'>
               
            </div>
            <FooterTwo /> */}
            <div
                // ref={containerRef}
                className={`${styles.loadingContainerOut}`}>
                <div
                    // ref={loadingAnimationRef}
                    className={`${styles.loadingAnimationOut} `}
                >
                    <div className={styles.loadingIconOut}>
                        <div className={styles.mainIconOut}>
                            <img src="/sportsbuz.gif" alt="Loading" className={styles.iconInnerOut} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}