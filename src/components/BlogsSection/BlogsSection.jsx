'use client';
import { useEffect, useState } from 'react';
import styles from './BlogsSection.module.css';
import Link from 'next/link';
import { useGlobalData } from '../Context/ApiContext';

export default function BlogSection({ blogs = [] }) {
  const { translateText, language } = useGlobalData();
  const [translatedBlogs, setTranslatedBlogs] = useState([]);

  useEffect(() => {
    const translateBlogs = async () => {
      if (blogs.length === 0) return;

      const updated = await Promise.all(
        blogs.map(async (blog) => ({
          ...blog,
          title: await translateText(blog.title),
          author: await translateText(blog.author),
        }))
      );

      setTranslatedBlogs(updated);
    };

    translateBlogs();
  }, [blogs, translateText, language]);

  if (translatedBlogs.length === 0) return null;

  const featuredBlog = translatedBlogs[0];
  const otherBlogs = translatedBlogs.slice(1);

  return (
    <div className={styles.wrapper}>
      <div className={styles.headingRow}>
        <h3>{translateText && typeof translateText === 'function' ? 'Highlights' : 'Highlights'}</h3>
        <Link href="/blogs/pages/all-blogs" className={styles.viewAll}>
          View All
        </Link>
      </div>

      {/* Featured Blog - using same card style but full width */}
      <div className={styles.featuredContainer}>
        <Link
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
        </Link>
      </div>

      {/* Regular blog grid - 2 columns */}
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
              <p>
                {blog.author} <span>· {blog.date}</span>
              </p>
              <span className={styles.readMore}>Read More</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}