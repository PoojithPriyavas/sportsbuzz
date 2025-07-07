'use client';
import { useEffect, useState } from 'react';
import styles from './BlogsSection.module.css';
import Link from 'next/link';
import axios from 'axios';
import CustomAxios from '../utilities/CustomAxios';

export default function BlogSection({ blogs = [] }) {
  if (blogs.length === 0) return null;

  const featuredBlog = blogs[0];
  const otherBlogs = blogs.slice(1);
  return (
    <div className={styles.wrapper}>
      <div className={styles.headingRow}>
        <h3>Latest Blogs</h3>
        <Link href="/blogs/pages/all-blogs" className={styles.viewAll}>
          View All
        </Link>
      </div>

      <div className={styles.featuredBlog}>
        <Link href={`/blog-details/${featuredBlog.slug}`}>
          <div className={styles.image}>
            <img
              src={featuredBlog.image}
              alt={featuredBlog.alt_big || featuredBlog.title}
              className={styles.featuredImg}
            />
          </div>
          <div className={styles.content}>
            <h4>{featuredBlog.title}</h4>
            <p>{featuredBlog.author} <span>· {featuredBlog.date}</span></p>
            <Link href={`/blog-details/${featuredBlog.slug}`}>Read More</Link>
          </div>
        </Link>
      </div>

      <div className={styles.blogGrid}>
        {otherBlogs.map((blog) => (
          <Link
            href={`/blog-details/${blog.slug}`}
            key={blog.id}
            className={styles.blogCard}
          >
            <div className={styles.image}>
              <img src={blog.image} alt={blog.alt || blog.title} />
            </div>
            <div className={styles.content}>
              <h5>{blog.title}</h5>
              <p>{blog.author} <span>{blog.date}</span></p>
              <span className={styles.readMore}>Read More</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
