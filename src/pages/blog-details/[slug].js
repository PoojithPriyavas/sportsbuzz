


import React from "react";
import BlogDetailsPage from "@/components/BlogsSection/BlogDetails";
import Header from "@/components/Loader/Loader";
import FooterTwo from "@/components/Footer/Footer";
import Head from "next/head";
// import { getBlogData } from "@/lib/blogs"; // create this to fetch blogs
import { useGlobalData } from '@/components/Context/ApiContext';

export async function getServerSideProps(context) {
    const slug = context.params.slug;

    try {
        const res = await fetch(`https://admin.sportsbuz.com/api/blog-detail/${slug}`);
        if (!res.ok) {
            return { notFound: true };
        }

        const blog = await res.json();

        return {
            props: { blog },
        };
    } catch (error) {
        console.error('Failed to fetch blog:', error);
        return { notFound: true };
    }
}


export default function BlogDetailsMain({ blog }) {
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
            <Header />
            <div className="container">
                <BlogDetailsPage blog={blog} />
            </div>
            <FooterTwo />
        </>
    );
}
