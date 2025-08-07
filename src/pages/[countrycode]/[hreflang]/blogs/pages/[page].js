import { useState, useEffect } from "react";
import Header from "@/components/Loader/Loader";
import BlogsPage from "@/components/BlogsSection/BlogPage";
import LiveScores from "@/components/LiveScoreSection/LiveScoreSection";
import Head from "next/head";
import { useGlobalData } from "@/components/Context/ApiContext";
import FooterTwo from "@/components/Footer/Footer";
import HeaderTwo from "@/components/Header/HeaderTwo";

import { fetchBlogsSSR } from "@/lib/ftechBlogsSSR";

export async function getServerSideProps({ req, query, resolvedUrl }) {
    // console.log(resolvedUrl, "urlsdssd")

    const countryCookie = req.cookies.countryData;
    const countryData = countryCookie ? JSON.parse(countryCookie) : null;
    // console.log(countryData,"dgadjasdasdkajsd,akjsd")
    const hrefLanCookie = req.cookies.lanTagValues;
    const hrefLanData = hrefLanCookie ? JSON.parse(hrefLanCookie) : null;

    const {
        category: categoryIdParam,
        subcategory: subcategoryIdParam,
        search: searchTerm = ''
    } = query;

    const blogs = await fetchBlogsSSR({
        countryCode: countryData?.country_code || 'IN',
        search: searchTerm,
        category: categoryIdParam ? parseInt(categoryIdParam) : null,
        subcategory: subcategoryIdParam ? parseInt(subcategoryIdParam) : null,
    });
    // console.log(blogs, "ssr friendly")
    return {
        props: {
            blogs,
            countryData,
            hrefLanData,
            supportedLanguages: ['en', 'fr'],
            supportedCountries: ['IN', 'FR'],
            resolvedUrl,
            isLocalhost: process.env.NODE_ENV === 'development'
        },
    };


}


export default function BlogPages({
    blogs,
    countryData,
    hrefLanData,
    supportedLanguages,
    supportedCountries,
    resolvedUrl,
    isLocalhost, }) {
    const baseUrl = isLocalhost ? 'http://localhost:3000' : 'https://www.sportsbuzz.com';
    const countryCode = countryData?.country_code || 'IN';

    // console.log(hrefLanData, "href lang data");
    // console.log(blogs, "blogs hhh");
    // console.log(baseUrl, "base url");
    // console.log(resolvedUrl, "resolved url")
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

                {hrefLanData.map(({ hreflang, country_code }) => {
                    {/* console.log(hreflang,"href lan g") */}
                    const href = `${baseUrl}/${country_code.toLowerCase()}/${hreflang}/blogs/pages/all-blogs`;
                    const fullHrefLang = `${hreflang}-${country_code}`;
                    {/* console.log('Generated link:', { href, fullHrefLang }); */}

                    return (
                        <link
                            key={fullHrefLang}
                            rel="alternate"
                            href={href}
                            hreflang={fullHrefLang}
                        />
                    );
                })}

                <link rel="alternate" href={`${baseUrl}/blogs/pages/all-blogs`} hreflang="x-default" />

                {/* Open Graph (Facebook, LinkedIn) */}
                <meta property="og:title" content="Sports Buzz | Blogs" />
                <meta property="og:description" content="Stay updated with the latest sports blogs and match breakdowns from around the world." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.sportsbuzz.com/blogs/pages/all-blogs" />
                <meta property="og:image" content="https://www.sportsbuzz.com/images/social-preview.jpg" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Sports Buzz | Blogs" />
                <meta name="twitter:description" content="Latest sports blogs, news and insights — only on Sports Buzz." />
                <meta name="twitter:image" content="https://www.sportsbuzz.com/images/social-preview.jpg" />

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