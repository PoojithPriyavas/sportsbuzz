'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from './TopNews.module.css';
import { useGlobalData } from '../Context/ApiContext';

const NewsList = () => {
  const { news, fetchNewsDetails, language, translateText } = useGlobalData();
  const articles = news?.articles || [];
  const router = useRouter();

  const [translatedNews, setTranslatedNews] = useState([]);
  const [translatedHeader, setTranslatedHeader] = useState({
    title: 'Latest News',
    subtitle: 'Stay informed with the latest updates',
  });

  // Translate headlines and article titles on language or data change
  useEffect(() => {
    const translateAll = async () => {
      if (!articles.length) return;

      // Translate static header strings
      const [title, subtitle] = await Promise.all([
        translateText('Latest News', 'en', language),
        translateText('Stay informed with the latest updates', 'en', language),
      ]);
      setTranslatedHeader({ title, subtitle });

      // Translate article titles and optional alt text
      const translated = await Promise.all(
        articles.map(async (item) => {
          const translatedTitle = await translateText(item.title, 'en', language);
          const originalAlt = item.mainMedia?.[0]?.thumbnail?.alt || '';
          const translatedAlt = originalAlt
            ? await translateText(originalAlt, 'en', language)
            : '';

          return {
            ...item,
            translatedTitle,
            translatedAlt,
          };
        })
      );

      setTranslatedNews(translated);
    };

    translateAll();
  }, [articles, language]);

  const openNews = async (item) => {
    await fetchNewsDetails(item.id);
    const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    router.push(`/news/${slug}`);
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
            <div className={styles.thumbnail}>
              {item.mainMedia?.[0]?.thumbnail?.url && (
                <img
                  src={item.mainMedia[0].thumbnail.url}
                  alt={item.translatedAlt || 'News Thumbnail'}
                  className={styles.thumbnailImage}
                />
              )}
            </div>

            <div className={styles.newsInfo}>
              <h3 className={styles.newsTitle}>{item.translatedTitle}</h3>
              <div className={styles.newsMeta}>
                <span className={styles.newsDate}>
                  📅 {item.updatedAt?.time} mins ago
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsList;
