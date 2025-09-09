


import React, { useState, useEffect } from "react";
import BlogDetailsPage from "@/components/BlogsSection/BlogDetails";
import Header from "@/components/Loader/Loader";
import FooterTwo from "@/components/Footer/Footer";
import Head from "next/head";
import styles from '../../../styles/Home.module.css';
// import { getBlogData } from "@/lib/blogs"; // create this to fetch blogs
import { useGlobalData } from '@/components/Context/ApiContext';
import HeaderTwo from "@/components/Header/HeaderTwo";
import { useLanguageValidation } from "@/hooks/useLanguageValidation";
import axios from "axios";
import { useParams } from "next/navigation";
import HeaderThree from "@/components/Header/HeaderThree";

export async function getServerSideProps(context) {
    const { resolvedUrl } = context;
    const slug = context.params.slug;

    let countryDataHome = null;
    let locationDataHome = null;

    try {
        const [countryRes, locationRes] = await Promise.all([
            fetch('https://admin.sportsbuz.com/api/get-country-code/')
                .then(async (response) => {
                    if (!response.ok) {
                        throw new Error(`Country API failed: ${response.status} ${response.statusText}`);
                    }
                    return response.json();
                })
                .catch((error) => {
                    console.error('Error fetching country data:', error);
                    return null; // Return null on error
                }),
            
            fetch('https://admin.sportsbuz.com/api/locations/')
                .then(async (response) => {
                    if (!response.ok) {
                        throw new Error(`Location API failed: ${response.status} ${response.statusText}`);
                    }
                    return response.json();
                })
                .catch((error) => {
                    console.error('Error fetching location data:', error);
                    return null; // Return null on error
                })
        ]);

        countryDataHome = countryRes;
        locationDataHome = locationRes;

    } catch (error) {
        console.error('Error in Promise.all:', error);
        // Continue with null values if both APIs fail
    }

    try {
        const res = await fetch(`https://admin.sportsbuz.com/api/blog-detail/${slug}`);
        if (!res.ok) {
            return { notFound: true };
        }

        const blog = await res.json();

        return {
            props: {
                blog,
                countryDataHome,
                locationDataHome,
            },
        };
    } catch (error) {
        console.error('Failed to fetch blog:', error);
        return { notFound: true };
    }
}


export default function BlogDetailsMain({ blog, locationDataHome }) {
    console.log("blog in country :",blog)
    const { countryCode } = useGlobalData();
    const { "countrycode-hreflng": countryLang } = useParams();
    const languageValidation = useLanguageValidation(locationDataHome, countryLang);
    const [animationStage, setAnimationStage] = useState('loading');
    const [showOtherDivs, setShowOtherDivs] = useState(false);
    const [hasAnimatedIn, setHasAnimatedIn] = useState(false);
    const [loading, setLoading] = useState(true);

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
                <title>{blog.meta_title || "Sports Buzz | Blog Details"}</title>
                <meta name="description" content={blog.meta_desc} />
                <meta name="keywords" content={blog.tags?.join(", ")} />
                <meta property="og:title" content={blog.meta_title} />
                <meta property="og:description" content={blog.meta_desc} />
                <meta property="og:image" content={blog.image_big || blog.image} />
            </Head>
            {/* <Header /> */}
            <HeaderThree animationStage={animationStage} />
            <div className={` ${animationStage === 'header' ? styles.visible : styles.hidden} ${styles.fadeUpEnter}   ${hasAnimatedIn ? styles.fadeUpEnterActive : ''} ${styles.offHeader} container`}>
                <BlogDetailsPage blog={blog} countryCode={countryCode}/>
            </div>
            {showOtherDivs && <FooterTwo />}
        </>
    );
}
