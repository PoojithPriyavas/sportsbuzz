import Header from "@/components/Header/Header";
import BlogsPage from "@/components/BlogsSection/BlogPage";
import LiveScores from "@/components/LiveScoreSection/LiveScoreSection";
import Head from "next/head";
import { useGlobalData } from "@/components/Context/ApiContext";

export default function BlogPages() {
    const { blogs, } = useGlobalData()

    return (
        <>
            <Head>
                <title>Sports Buzz | Blogs</title>
                <meta name="description" content="Your site description here" />
            </Head>
            <Header />
            <div className='container'>
                {/* <LiveScores /> */}
                <BlogsPage blogs={blogs} />
            </div>
        </>
    )
}