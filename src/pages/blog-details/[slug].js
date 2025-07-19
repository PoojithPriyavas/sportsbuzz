import React from "react";
import BlogDetailsPage from "@/components/BlogsSection/BlogDetails";
import Header from "@/components/Loader/Loader";
import LiveScores from "@/components/LiveScoreSection/LiveScoreSection";
import Head from "next/head";
import FooterTwo from "@/components/Footer/Footer";


export default function blogDetailsMain() {
    return (
        <>
            <Head>
                <title>Sports Buzz  |  Blog details</title>
                <meta name="description" content="Your site description here" />
            </Head>
            <Header />
            <div className="container">
                <BlogDetailsPage />
            </div>
            <FooterTwo />
        </>
    )
}