import { useState, useEffect } from "react";
import Header from "@/components/Loader/Loader";
import BlogsPage from "@/components/BlogsSection/BlogPage";
import LiveScores from "@/components/LiveScoreSection/LiveScoreSection";
import Head from "next/head";
import { useGlobalData } from "@/components/Context/ApiContext";
import FooterTwo from "@/components/Footer/Footer";
import HeaderTwo from "@/components/Header/HeaderTwo";

import { fetchBlogsSSR } from "@/lib/ftechBlogsSSR";

import axios from 'axios';

export async function getServerSideProps({ req, query, resolvedUrl }) {
    let blogs = [];
    let countryDataHome = null;
    let locationDataHome = null;

    try {
        const [countryRes, locationRes] = await Promise.all([
            fetch('https://admin.sportsbuz.com/api/get-country-code/')
                .then(async (response) => {
                    if (!response.ok) {
                        throw new Error(`Country API failed: ${response.status} ${response.statusText}`);
                    }
                    const data = await response.json();
                    return { data, headers: response.headers, status: response.status, url: response.url };
                })
                .catch((error) => {
                    console.error('Error fetching country data:', error);
                    return null;
                }),
            
            fetch('https://admin.sportsbuz.com/api/locations/')
                .then(async (response) => {
                    if (!response.ok) {
                        throw new Error(`Location API failed: ${response.status} ${response.statusText}`);
                    }
                    const data = await response.json();
                    return { data, headers: response.headers, status: response.status, url: response.url };
                })
                .catch((error) => {
                    console.error('Error fetching location data:', error);
                    return null;
                })
        ]);

        countryDataHome = countryRes?.data || null;
        locationDataHome = locationRes?.data || null;

        const {
            category: categoryIdParam,
            subcategory: subcategoryIdParam,
            search: searchTerm = ''
        } = query;

        try {
            blogs = await fetchBlogsSSR({
                countryCode: countryDataHome?.country_code || 'IN',
                search: searchTerm,
                category: categoryIdParam ? parseInt(categoryIdParam, 10) : null,
                subcategory: subcategoryIdParam ? parseInt(subcategoryIdParam, 10) : null,
            });
        } catch (blogError) {
            console.error('Error fetching blogs:', blogError);
            blogs = []; // Keep empty array as fallback
        }

        // Debug logs (remove in production)
        // console.log('=== API RESPONSE DATA ===');
        // console.log('Country Data:', JSON.stringify(countryDataHome, null, 2));
        // console.log('Location Data:', JSON.stringify(locationDataHome, null, 2));
        // console.log('Country Response Headers:', countryRes ? Object.fromEntries(countryRes.headers) : 'N/A');
        // console.log('Location Response Headers:', locationRes ? Object.fromEntries(locationRes.headers) : 'N/A');

    } catch (error) {
        console.error("API Error Details:", {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
    }

    return {
        props: {
            blogs,
            countryDataHome,
            locationDataHome,
            resolvedUrl,
            isLocalhost: process.env.NODE_ENV === 'development'
        }
    };
}
export default function BlogPages({
    // blogs,
    countryDataHome,
    locationDataHome,
    // supportedLanguages,
    // supportedCountries,
    resolvedUrl,
    isLocalhost, }) {
    const baseUrl = isLocalhost ? 'http://localhost:3000' : 'https://www.sportsbuz.com';
    const countryCode = countryDataHome?.country_code || 'IN';
    const { blogs } = useGlobalData();
    // console.log(resolvedUrl, "rshdhasd")
    // console.log(blogs, "blogs hhh")
    // const { blogs, } = useGlobalData()   


    const [loading, setLoading] = useState(true);
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
                <title>Sports Buzz | Blogs</title>
                <meta name="description" content="Explore the latest sports blogs, match analysis, and breaking sports news curated for fans worldwide." />
                <meta name="keywords" content="sports blogs, football news, cricket updates, match analysis, sports buzz" />
                <meta name="author" content="Sports Buzz" />

                {locationDataHome?.map(({ hreflang, country_code }) => {
                    {/* console.log(hreflang,"href lan g") */ }
                    const href = `${baseUrl}/${hreflang}-${country_code.toLowerCase()}/blogs/pages/all-blogs`;
                    const fullHrefLang = `${hreflang}-${country_code}`;
                    {/* console.log('Generated link:', { href, fullHrefLang }); */ }

                    return (
                        <link
                            key={fullHrefLang}
                            rel="alternate"
                            href={href}
                            hreflang={fullHrefLang}
                        />
                    );
                })}

                {/* <link rel="alternate" href={`${baseUrl}/blogs`} hreflang="x-default" /> */}

                {/* Open Graph (Facebook, LinkedIn) */}
                <meta property="og:title" content="Sports Buzz | Blogs" />
                <meta property="og:description" content="Stay updated with the latest sports blogs and match breakdowns from around the world." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.sportsbuzz.com/blogs/pages/all-blogs" />
                <meta property="og:image" content="https://www.sportsbuzz.com/images/social-preview.jpg" /> {/* Update this path */}

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Sports Buzz | Blogs" />
                <meta name="twitter:description" content="Latest sports blogs, news and insights — only on Sports Buzz." />
                <meta name="twitter:image" content="https://www.sportsbuzz.com/images/social-preview.jpg" /> {/* Update this path */}
                <link rel="canonical" href={`${baseUrl}${resolvedUrl}`} />
            </Head>

            {/* <Header /> */}
            <HeaderTwo animationStage={animationStage} />
            <div className='container'>
                {/* <LiveScores /> */}
                <BlogsPage blogs={blogs} />
            </div>
            <FooterTwo />
        </>
    )
}