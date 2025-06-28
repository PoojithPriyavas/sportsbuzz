import styles from './BlogsSection.module.css';
import Link from 'next/link';

export default function BlogSection() {
  const blogs = [
    { id: 1, title: "Blog title 1", date: "Jun 24 2025", slug: "blog-title-1" },
    { id: 2, title: "Blog title 2", date: "Jun 23 2025", slug: "blog-title-2" },
    { id: 3, title: "Blog title 3", date: "Jun 22 2025", slug: "blog-title-3" },
    { id: 4, title: "Blog title 4", date: "Jun 21 2025", slug: "blog-title-4" },
  ];

  return (
    <div className={styles.wrapper}>
      {/* Heading Row */}
      <div className={styles.headingRow}>
        <h3>Latest Blogs</h3>
        <Link href="/blogs/pages/all-blogs" className={styles.viewAll}>
          View All
        </Link>
      </div>

      {/* Featured Blog */}
      <div className={styles.featuredBlog}>
        <div className={styles.image}>
          <img
            src="/images/blog1.jpg"
            alt="Featured Blog"
            className={styles.featuredImg}
          />
        </div>
        <div className={styles.content}>
          <h4>
            Here Goes News title maximum of two lines akjshd skhdf jsh sh hskjhd sdfds fsdfsdfsd kj
          </h4>
          <p>Cod Hatch <span>· Jun 24 2025</span></p>
          <Link href="/blog-details/featured-blog-slug">Read More</Link>
        </div>
      </div>

      {/* Blog Grid */}
      <div className={styles.blogGrid}>
        {blogs.map((blog) => (
          <Link
            href={`/blog-details/${blog.slug}`}
            key={blog.id}
            className={styles.blogCard}
          >
            <div className={styles.image}></div>
            <div className={styles.content}>
              <h5>{blog.title}</h5>
              <p>Cod Hatch <span>{blog.date}</span></p>
              <span className={styles.readMore}>Read More</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
