import Header from "@/components/Header/Header";
import BlogsPage from "@/components/BlogsSection/BlogPage";
import LiveScores from "@/components/LiveScoreSection/LiveScoreSection";
import Head from "next/head";
export default function BlogPages() {

    return (
        <>
            <Head>
                <title>Sports Buzz | Blogs</title>
                <meta name="description" content="Your site description here" />
            </Head>
            <Header />
            <div className='container'>
                <LiveScores />
                <BlogsPage />
            </div>
        </>
    )
}