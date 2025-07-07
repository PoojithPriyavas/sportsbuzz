import React from "react";
import BlogDetailsPage from "@/components/BlogsSection/BlogDetails";
import Header from "@/components/Header/Header";
import LiveScores from "@/components/LiveScoreSection/LiveScoreSection";
import Head from "next/head";
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
        </>
    )
}