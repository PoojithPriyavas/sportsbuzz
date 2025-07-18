import Header from "@/components/Loader/Loader";
import BlogsPage from "@/components/BlogsSection/BlogPage";
import LiveScores from "@/components/LiveScoreSection/LiveScoreSection";
import Head from "next/head";
import { useGlobalData } from "@/components/Context/ApiContext";
import FooterTwo from "@/components/Footer/Footer";

export default function NewsData() {
    const { blogs, } = useGlobalData()

    return (
        <>
            <Head>
                <title>Sports Buzz | News</title>
                <meta name="description" content="Your site description here" />
            </Head>
            <Header />
            <div className='container'>
                {/* <LiveScores /> */}
                <BlogsPage blogs={blogs} />
            </div>
            <FooterTwo />
        </>
    )
}