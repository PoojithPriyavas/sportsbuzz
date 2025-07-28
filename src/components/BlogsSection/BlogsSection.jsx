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
            <p>
              {featuredBlog.author} <span>· {featuredBlog.date}</span>
            </p>
            <Link href={`/blog-details/${featuredBlog.slug}`}>Read More</Link>
          </div>
        </Link>
      </div>

      <div className={styles.blogGrid}>
        {otherBlogs.slice(0,4).map((blog) => (
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
                {blog.author} <span>{blog.date}</span>
              </p>
              <span className={styles.readMore}>Read More</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
