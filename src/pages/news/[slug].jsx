import React from "react";
import Header from "@/components/Header/Header";
import LiveScores from "@/components/LiveScoreSection/LiveScoreSection";
import Head from "next/head";
import NewsDetails from "@/components/NewsSection/NewsDetails";
export default function blogDetailsMain() {
    return (
        <>
           
            <Header />
            <div className="container">
                <NewsDetails />
            </div>
        </>
    )
}