'use client';
import { useEffect, useState } from 'react';
import styles from './BlogsSection.module.css';
import Link from 'next/link';
import { useGlobalData } from '../Context/ApiContext';
import DynamicLink from '../Common/DynamicLink';

export default function BlogSection({ blogs = [] }) {
  const { language } = useGlobalData();
  // Using blogs directly without translation
  
  if (blogs.length === 0) return null;

  const featuredBlog = blogs[0];
  const otherBlogs = blogs.slice(1);
  
  return (
    <div className={styles.wrapper}>
      <div className={styles.headingRow}>
        <h3>Highlights</h3>
        <DynamicLink href="/blogs/pages/all-blogs" className={styles.viewAll}>
          View All
        </DynamicLink>
      </div>

      {/* Featured Blog - using same card style but full width */}
      <div className={styles.featuredContainer}>
        <DynamicLink
          href={`/blog-details/${featuredBlog.slug}`}
          className={`${styles.blogCard} ${styles.featuredCard}`}
          key={featuredBlog.id}
        >
          <div className={styles.image}>
            <img
              src={featuredBlog.image}
              alt={featuredBlog.alt_big || featuredBlog.title}
            />
          </div>
          <div className={styles.content}>
            <h5>{featuredBlog.title}</h5>
            <p>
              {featuredBlog.author} <span>· {featuredBlog.date}</span>
            </p>
            <span className={styles.readMore}>Read More</span>
          </div>
        </DynamicLink>
      </div>

      {/* Regular blog grid - 2 columns */}
      <div className={styles.blogGrid}>
        {otherBlogs.map((blog) => (
          <DynamicLink
            href={`/blog-details/${blog.slug}`}
            key={blog.id}
            className={styles.blogCard}
          >
            <div className={styles.image}>
              <img src={blog.image} alt={blog.alt || blog.title} />
            </div>
            <div className={styles.content}>
              <h5>{blog.title}</h5>
              <p>
                {blog.author} <span>· {blog.date}</span>
              </p>
              <span className={styles.readMore}>Read More</span>
            </div>
          </DynamicLink>
        ))}
      </div>
    </div>
  );
}