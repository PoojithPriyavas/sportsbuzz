import Header from "@/components/Loader/Loader";
import BlogsPage from "@/components/BlogsSection/BlogPage";
import LiveScores from "@/components/LiveScoreSection/LiveScoreSection";
import Head from "next/head";
import { useState, useEffect } from 'react';
import { useGlobalData } from "@/components/Context/ApiContext";
import FooterTwo from "@/components/Footer/Footer";
import HeaderTwo from "@/components/Header/HeaderTwo";
import { useLanguageValidation } from "@/hooks/useLanguageValidation";
import axios from "axios";
import HeaderThree from "@/components/Header/HeaderThree";

export async function getServerSideProps(context) {
    // Log the request origin (helpful for debugging)
    console.log('Request originated from:', context.req.headers['x-forwarded-for'] || context.req.connection.remoteAddress);
    try {
        const { resolvedUrl, req } = context;
        const [countryRes, locationRes] = await Promise.all([
            axios.get('https://admin.sportsbuz.com/api/get-country-code/'),
            axios.get('https://admin.sportsbuz.com/api/locations/')
        ]);

        const countryDataHome = countryRes.data;
        const locationDataHome = locationRes.data;

        // Detailed logging
        console.log('=== API RESPONSE DATA ===');
        console.log('Country Data in the props:', JSON.stringify(countryRes.data, null, 2));
        console.log('Location Data in the props:', JSON.stringify(locationRes.data, null, 2));
        console.log('Response Headers - Country in the props:', countryRes.headers);
        console.log('Response Headers - Location: in the props', locationRes.headers);

        return {
            props: {
                countryDataHome,
                locationDataHome,
                resolvedUrl,
            }
        };
    } catch (error) {
        // console.error("Error fetching data from APIs:", error.message);
        console.error("API Error Details: in the props", {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers,
            stack: error.stack
        });
        return {
            props: {
                countryDataHome: null,
                locationDataHome: null,
                resolvedUrl,
                isLocalhost: process.env.NODE_ENV === 'development'
            }
        };
    }
}

export default function NewsData({ countryDataHome, locationDataHome, resolvedUrl, }) {
    const languageValidation = useLanguageValidation(locationDataHome, resolvedUrl);

    const { blogs, } = useGlobalData()
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
                <title>Sports Buzz | News</title>
                <meta name="description" content="Your site description here" />
            </Head>
            <HeaderThree animationStage={animationStage} />
            <div className='container'>
                {/* <LiveScores /> */}
                <BlogsPage blogs={blogs} />
            </div>
            <FooterTwo />
        </>
    )
}