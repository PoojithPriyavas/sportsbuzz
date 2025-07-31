'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGlobalData } from '../Context/ApiContext';
import styles from './BlogDetailContent.module.css';
import Head from 'next/head';



export default function BlogDetailContent({ blog }) {
  const { translateText, language } = useGlobalData();
  // const params = useParams();
  // const slug = params?.slug;

  // const blog = blogs?.find((item) => item.slug === slug);
  const [translatedBlog, setTranslatedBlog] = useState(null);

  useEffect(() => {
    const translateBlog = async () => {
      if (!blog || !translateText) return;

      const [title, metaTitle, metaDesc, textEditor] = await Promise.all([
        translateText(blog.title),
        translateText(blog.meta_title),
        translateText(blog.meta_desc),
        translateText(blog.text_editor, 'en', language, 'html'),
      ]);

      const translatedTags = await Promise.all(
        (blog.tags || []).map((tag) => translateText(tag))
      );

      setTranslatedBlog({
        ...blog,
        title,
        meta_title: metaTitle,
        meta_desc: metaDesc,
        tags: translatedTags,
        text_editor: textEditor,
      });
    };

    translateBlog();
  }, [blog, translateText, language]);

  if (!blog) {
    return <div className={styles.blogContent}>Blog not found.</div>;
  }

  if (!translatedBlog) {
    return <div className={styles.blogContent}>Translating blog...</div>;
  }

  return (
    <>
      {/* <Head>
        <title>{translatedBlog.meta_title}</title>
        <meta name="description" content={translatedBlog.meta_desc} />
        <meta name="keywords" content={translatedBlog.tags?.join(', ')} />
        <meta property="og:title" content={translatedBlog.meta_title} />
        <meta property="og:description" content={translatedBlog.meta_desc} />
        <meta property="og:image" content={translatedBlog.image_big || translatedBlog.image} />
      </Head> */}

      <div className={styles.blogContent}>
        <h1 className={styles.title}>{translatedBlog.title}</h1>

        {translatedBlog.image && (
          <div className={styles.thumbnail}>
            <img
              src={translatedBlog.image_big}
              alt={translatedBlog.alt_big || 'Blog thumbnail'}
              className={styles.thumbnailImg}
            />
          </div>
        )}


        <div
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: translatedBlog.text_editor }}
        />
        <div
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: translatedBlog.text_editor_1 }}
        />
        <div
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: translatedBlog.text_editor_2 }}
        />
      </div>
    </>
  );
}
