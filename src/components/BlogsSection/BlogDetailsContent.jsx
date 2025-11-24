'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGlobalData } from '../Context/ApiContext';
import styles from './BlogDetailContent.module.css';
import Head from 'next/head';
import JoinTelegramButton from '../JoinTelegram/JoinTelegramButton';

export default function BlogDetailContent({ blog }) {
  // console.log(blog,"blog detail")
  // Removed translation functionality - using blog directly
  
  if (!blog) {
    return <div className={styles.blogContent}>Blog not found.</div>;
  }

  return (
    <>
      <div className={styles.blogContent}>
        <h1 className={styles.title}>{blog.title}</h1>

        {blog.image_big && (
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
        <div style={{padding:'10px 0px'}}><JoinTelegramButton /></div>
        <div
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: blog.text_editor_1 }}
        />
        <div style={{padding:'10px 0px'}}><JoinTelegramButton /></div>
        <div
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: blog.text_editor_2 }}
        />
      </div>
    </>
  );
}