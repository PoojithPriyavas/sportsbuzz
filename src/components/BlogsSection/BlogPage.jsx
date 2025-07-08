import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './BlogPage.module.css';
import BlogCard from './BlogCards';
import BlogSearchFilter from './BlogSearchFilter';
import TopNewsSection from '../NewsSection/TopNews';
import MultiBannerSlider from '../Multibanner/MultiBannerSlider';
import CricketPrediction from '../Betting/CricketPrediction';
import PredictionSection from '../Prediction/Prediction';
import GoogleAds from '../googleAds/GoogleAds';
import Link from 'next/link';
import Image from 'next/image';
import { FaSearch } from 'react-icons/fa';
import AutoSlider from '../AutoSlider/AutoSlider';

export default function BlogsPage({ blogs = [] }) {
    // Fake blogs data
    const [filterValue, setFilterValue] = useState("all");

    const searchParams = useSearchParams();
    const subcategoryIdParam = searchParams.get('subcategory');
    const selectedSubcategoryId = subcategoryIdParam ? parseInt(subcategoryIdParam) : null;

    const featuredBlog = blogs[0];

    // Apply subcategory filter
    const filteredBlogs = selectedSubcategoryId
        ? blogs.filter((blog) =>
            blog.subcategory && blog.subcategory.includes(selectedSubcategoryId)
        )
        : blogs;

    const displayedFeatured = filteredBlogs[0];
    const otherBlogs = filteredBlogs.slice(1);

    return (
        <>
            <div className={styles.container}>
                <div className={styles.left}>
                    <div>
                        <div className={styles.filterBar}>
                            <h2 style={{ color: 'black' }}>Latest Blogs</h2>
                            <div className={styles.controls}>
                                <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)}>
                                    <option value='all'>All</option>
                                    <option value='latest'>Latest</option>
                                </select>

                                <div className={styles.searchWrapper}>
                                    <FaSearch className={styles.searchIcon} />
                                    <input type="text" placeholder="Search Blogs" className={styles.searchInput} />
                                </div>
                            </div>
                        </div>

                        <div className={styles.wrapper}>
                            {/* Featured Blog */}
                            {/* {displayedFeatured && (
                                <Link href={`/blog-details/${displayedFeatured?.slug}`} className={styles.featuredBlog}>
                                    <div className={styles.featuredImage}>
                                        <img
                                            src={displayedFeatured?.image}
                                            alt={displayedFeatured?.alt || displayedFeatured?.title}
                                            className={styles.featuredImg}
                                        />
                                    </div>
                                    <div className={styles.featuredContent}>
                                        <h4>{displayedFeatured?.title}</h4>
                                        <p>{displayedFeatured?.author} <span>· {displayedFeatured?.date}</span></p>
                                        <span className={styles.readMore}>Read More</span>
                                    </div>
                                </Link>
                            )} */}
                            {selectedSubcategoryId && (
                                <div className={styles.clearFilterWrapper}>
                                    <Link href="/blogs/pages/all-blogs" className={styles.clearFilter}>
                                        Clear Filter
                                    </Link>
                                </div>
                            )}
                            {/* Blog Grid */}
                            <div className={styles.blogGrid}>
                                {/* {otherBlogs.map((blog) => ( */}
                                {filteredBlogs.map((blog) => (
                                    <Link
                                        key={blog.id}
                                        href={`/blog-details/${blog?.slug}`}
                                        className={styles.blogCard}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className={styles.blogImage}>
                                            <img src={blog?.image} alt={blog?.alt || blog?.title} />
                                        </div>
                                        <div className={styles.blogContent}>
                                            <h5>{blog?.title}</h5>
                                            <p>{blog?.author} <span>{blog?.date}</span></p>
                                            <span className={styles.readMore}>Read More</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.right}>
                    <PredictionSection />
                    <CricketPrediction />
                    {/* <MultiBannerSlider /> */}
                    <AutoSlider />
                    <TopNewsSection />
                </div>
            </div>
            <GoogleAds />
        </>

    );
}
