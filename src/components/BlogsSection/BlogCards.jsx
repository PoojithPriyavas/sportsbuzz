'use client'
import styles from './BlogCard.module.css';
import Link from 'next/link';

export default function BlogCard({ title, author, date, isFeatured }) {
  // Dummy blogs data with slugs
  const blogs = [
    { id: 1, title: "Blog title 1", author: "Cod Hatch", date: "Jun 24 2025", slug: "blog-title-2" },
    { id: 2, title: "Blog title 2", author: "Cod Hatch", date: "Jun 23 2025", slug: "blog-title-3" },
    { id: 3, title: "Blog title 3", author: "Cod Hatch", date: "Jun 22 2025", slug: "blog-title-4" },
    { id: 4, title: "Blog title 4", author: "Cod Hatch", date: "Jun 21 2025", slug: "blog-title-5" },
  ];

  return (
    <div className={styles.wrapper}>

      {/* Featured Blog */}
      <Link href={'/blog-details/blog-title-1'} >
        <div className={styles.featuredBlog}>
          <div className={styles.featuredImage}>
            <img
              src="/images/blog1.jpg"
              alt="Featured Blog"
              className={styles.featuredImg}
            />
          </div>
          <div className={styles.featuredContent}>
            <h4>
              Here Goes News title maximum of two lines akjshd skhdf jsh sh hskjhd sdfds fsdfsdfsd kj
            </h4>
            <p>Cod Hatch <span>· Jun 24 2025</span></p>
            <Link href="/blog-details/featured-blog-slug">Read More</Link>
          </div>
        </div>
      </Link>


      {/* Blog Grid */}
      <div className={styles.blogGrid}>
        {blogs.map((blog) => (
          <Link href={`/blog-details/${blog.slug}`} key={blog.id} style={{ cursor: 'pointer' }} className={styles.blogCard}>
            <div className={styles.blogImage}></div>
            <div className={styles.blogContent}>
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
