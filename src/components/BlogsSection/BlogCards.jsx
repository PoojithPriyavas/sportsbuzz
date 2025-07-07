import { useState } from 'react';
import styles from './BlogCard.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { FaSearch } from 'react-icons/fa';

export default function BlogCard({ blogs = [] }) {
  console.log(blogs, "blogs")
  // const blogsData = [
  //   { id: 1, title: "Blog title 1", author: "Cod Hatch", date: "Jun 24 2025", slug: "blog-title-2" },
  //   { id: 2, title: "Blog title 2", author: "Cod Hatch", date: "Jun 23 2025", slug: "blog-title-3" },
  //   { id: 3, title: "Blog title 3", author: "Cod Hatch", date: "Jun 22 2025", slug: "blog-title-4" },
  //   { id: 4, title: "Blog title 4", author: "Cod Hatch", date: "Jun 21 2025", slug: "blog-title-5" },
  // ];
  const [filterValue, setFilterValue] = useState("all");
  const featuredBlog = blogs[0];
  const otherBlogs = blogs.slice(1);

  console.log(featuredBlog, "fr")
  return (
    <>
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
        <Link href="/blog-details/blog-title-1" className={styles.featuredBlog}>
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
            <span className={styles.readMore}>Read More</span>
          </div>
        </Link>

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
                <span className={styles.readMore}>Read More</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>

  );
}
