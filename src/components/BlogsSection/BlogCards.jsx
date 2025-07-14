'use client';

import { useState, useEffect } from 'react';
import styles from './BlogCard.module.css';
import Link from 'next/link';
import { FaSearch } from 'react-icons/fa';
import { useGlobalData } from '../Context/ApiContext';

export default function BlogCard({ blogs = [] }) {
  const { translateText, language } = useGlobalData();
  const [filterValue, setFilterValue] = useState('all');

  const [translated, setTranslated] = useState({
    latestBlogs: 'Latest Blogs',
    all: 'All',
    latest: 'Latest',
    searchPlaceholder: 'Search Blogs',
    readMore: 'Read More',
  });

  const featuredBlog = blogs[0];
  const otherBlogs = blogs.slice(1);

  useEffect(() => {
    const translateLabels = async () => {
      try {
        const [latestBlogs, all, latest, searchPlaceholder, readMore] = await Promise.all([
          translateText('Latest Blogs', 'en', language),
          translateText('All', 'en', language),
          translateText('Latest', 'en', language),
          translateText('Search Blogs', 'en', language),
          translateText('Read More', 'en', language),
        ]);

        setTranslated({
          latestBlogs,
          all,
          latest,
          searchPlaceholder,
          readMore,
        });
      } catch (err) {
        console.error('Failed to translate blog labels:', err);
      }
    };

    translateLabels();
  }, [language]);

  return (
    <>
      <div className={styles.filterBar}>
        <h2 style={{ color: 'black' }}>{translated.latestBlogs}</h2>
        <div className={styles.controls}>
          <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)}>
            <option value='all'>{translated.all}</option>
            <option value='latest'>{translated.latest}</option>
          </select>

          <div className={styles.searchWrapper}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder={translated.searchPlaceholder}
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>

      <div className={styles.wrapper}>
        {/* Featured Blog */}
        {featuredBlog && (
          <Link href={`/blog-details/${featuredBlog?.slug || 'blog-title-1'}`} className={styles.featuredBlog}>
            <div className={styles.featuredImage}>
              <img
                src={featuredBlog?.image_big}
                alt={featuredBlog?.alt_big || featuredBlog?.title}
                className={styles.featuredImg}
              />
            </div>
            <div className={styles.featuredContent}>
              <h4>{featuredBlog?.title}</h4>
              <p>{featuredBlog?.author} <span>· {featuredBlog?.date}</span></p>
              <span className={styles.readMore}>{translated.readMore}</span>
            </div>
          </Link>
        )}

        {/* Blog Grid */}
        <div className={styles.blogGrid}>
          {otherBlogs.map((blog) => (
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
                <span className={styles.readMore}>{translated.readMore}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
