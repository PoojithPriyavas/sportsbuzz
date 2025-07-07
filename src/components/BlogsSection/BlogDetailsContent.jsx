'use client';

import { useParams } from 'next/navigation'; // For dynamic route slug
import { useGlobalData } from '../Context/ApiContext';
import styles from './BlogDetailContent.module.css';
import Image from 'next/image';

export default function BlogDetailContent() {
  const { blogs } = useGlobalData();
  const params = useParams();
  const slug = params?.slug;

  // Find the blog by slug
  const blog = blogs?.find((item) => item.slug === slug);

  if (!blog) {
    return <div className={styles.blogContent}>Blog not found.</div>;
  }

  return (
    <div className={styles.blogContent}>
      <h1 className={styles.title}>{blog.title}</h1>

      {/* Thumbnail Image */}
      {blog.image && (
        <div className={styles.thumbnail}>
          <img
            src={blog.image_big}
            alt={blog.alt || 'Blog thumbnail'}
            className={styles.thumbnailImg}
          />
        </div>

      )}

      {/* Blog Content from Rich Text Editor */}
      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: blog.text_editor }}
      />

    
    </div>
  );
}
