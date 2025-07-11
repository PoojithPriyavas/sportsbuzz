'use client';

import { useParams } from 'next/navigation';
import { useGlobalData } from '../Context/ApiContext';
import styles from './BlogDetailContent.module.css';
import Head from 'next/head';

export default function BlogDetailContent() {
  const { blogs } = useGlobalData();
  console.log(blogs, "blogs")
  const params = useParams();
  const slug = params?.slug;

  const blog = blogs?.find((item) => item.slug === slug);

  if (!blog) {
    return <div className={styles.blogContent}>Blog not found.</div>;
  }

  return (
    <>
      <Head>
        <title>{blog.meta_title}</title>
        <meta name="description" content={blog.meta_desc} />
        <meta name="keywords" content={blog.tags?.join(', ')} />
        <meta property="og:title" content={blog.meta_title} />
        <meta property="og:description" content={blog.meta_desc} />
        <meta property="og:image" content={blog.image_big || blog.image} />
      </Head>

      <div className={styles.blogContent}>
        <h1 className={styles.title}>{blog.title}</h1>

        {blog.image && (
          <div className={styles.thumbnail}>
            <img
              src={blog.image_big}
              alt={blog.alt_big || 'Blog thumbnail'}
              className={styles.thumbnailImg}
            />
          </div>
        )}

        <div
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: blog.text_editor }}
        />

        {/* {blog.image_big && (
          <div className={styles.featureImage}>
            <img
              src={blog.image_big}
              alt={blog.alt_big || 'Featured image'}
              className={styles.featureImg}
            />
          </div>
        )} */}
      </div>
    </>
  );
}
