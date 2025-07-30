'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from './TopNews.module.css';
import { useGlobalData } from '../Context/ApiContext';
import { useMemo } from 'react';

const NewsList = () => {
  const { news, fetchNewsDetails, language, translateText } = useGlobalData();
  console.log(news, "newssssss")

  const stories = useMemo(() => {
    return news?.storyList?.filter(item => item.story)?.map(item => item.story) || [];
  }, [news]);
  const router = useRouter();

  const [translatedNews, setTranslatedNews] = useState([]);
  const [translatedHeader, setTranslatedHeader] = useState({
    title: 'Latest News',
    subtitle: 'Stay informed with the latest updates',
  });

  // Translate headlines and article titles on language or data change
  useEffect(() => {
    console.log("this useffect is the issue")
    const translateAll = async () => {
      if (!stories.length) return;

      // Translate static header strings
      const [title, subtitle] = await Promise.all([
        translateText('Latest News', 'en', language),
        translateText('Stay informed with the latest updates', 'en', language),
      ]);
      setTranslatedHeader({ title, subtitle });

      // Translate story headlines and captions
      const translated = await Promise.all(
        stories.map(async (item) => {
          const translatedTitle = await translateText(item.hline, 'en', language);
          const translatedIntro = item.intro
            ? await translateText(item.intro, 'en', language)
            : '';
          const originalCaption = item.coverImage?.caption || '';
          const translatedCaption = originalCaption
            ? await translateText(originalCaption, 'en', language)
            : '';

          return {
            ...item,
            translatedTitle,
            translatedIntro,
            translatedCaption,
          };
        })
      );

      setTranslatedNews(translated);
    };

    translateAll();
  }, [stories, language]);

  // Helper function to convert timestamp to readable format
  const formatTime = (timestamp) => {
    const now = Date.now();
    const pubTime = parseInt(timestamp);
    const diffInMinutes = Math.floor((now - pubTime) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} mins ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const openNews = async (item) => {
    // await fetchNewsDetails(item.id);
    // const slug = item.hline.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    router.push(`/news/${item.id}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>{translatedHeader.title}</h2>
        <p>{translatedHeader.subtitle}</p>
      </div>

      <div className={styles.newsList}>
        {translatedNews.map((item) => (
          <div
            key={item.id}
            className={styles.newsItem}
            onClick={() => openNews(item)}
          >
            {/* <div className={styles.thumbnail}>
              {item.coverImage?.id && (
                <img
                  src={`https://your-image-base-url/${item.coverImage.id}`} // Update with your actual image base URL
                  alt={item.translatedCaption || 'News Thumbnail'}
                  className={styles.thumbnailImage}
                />
              )}
            </div> */}

            <div className={styles.newsInfo}>
              <h3 className={styles.newsTitle}>{item.translatedTitle}</h3>
              {item.translatedIntro && (
                <p className={styles.newsIntro}>{item.translatedIntro}</p>
              )}
              <div className={styles.newsMeta}>
                <span className={styles.newsDate}>
                  📅 {formatTime(item.pubTime)}
                </span>
                <span className={styles.newsSource}>
                  📰 {item.source}
                </span>
                <span className={styles.newsType}>
                  🏷️ {item.storyType}
                </span>
                {item.context && (
                  <span className={styles.newsContext}>
                    🏏 {item.context}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsList;