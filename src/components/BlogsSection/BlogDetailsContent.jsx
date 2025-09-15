'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGlobalData } from '../Context/ApiContext';
import styles from './BlogDetailContent.module.css';
import Head from 'next/head';
import JoinTelegramButton from '../JoinTelegram/JoinTelegramButton';

export default function BlogDetailContent({ blog }) {
  const { translateText, language } = useGlobalData();
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
      <div className={styles.blogContent}>
        <h1 className={styles.title}>{translatedBlog.title}</h1>

        {translatedBlog.image_big && (
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
        <div style={{padding:'10px 0px'}}><JoinTelegramButton /></div>
        <div
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: translatedBlog.text_editor_1 }}
        />
        <div style={{padding:'10px 0px'}}><JoinTelegramButton /></div>
        <div
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: translatedBlog.text_editor_2 }}
        />
      </div>
    </>
  );
}