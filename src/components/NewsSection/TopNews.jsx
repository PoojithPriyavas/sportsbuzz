// components/NewsList.jsx

import React from 'react';
import { useRouter } from 'next/router';
import styles from './TopNews.module.css';
import { useGlobalData } from '../Context/ApiContext';

const NewsList = () => {
  const { news, fetchNewsDetails } = useGlobalData();
  const router = useRouter();
  const articles = news?.articles || [];

  const openNews = async (item) => {
    console.log(item,"item")
    await fetchNewsDetails(item.id);
    const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'); 
    router.push(`/news/${slug}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Latest News</h2>
        <p>Stay informed with the latest updates</p>
      </div>

      <div className={styles.newsList}>
        {articles.map((item) => (
          <div
            key={item.id}
            className={styles.newsItem}
            onClick={() => openNews(item)}
          >
            <div className={styles.thumbnail}>
              {item.mainMedia?.[0]?.thumbnail?.url && (
                <img
                  src={item.mainMedia[0].thumbnail.url}
                  alt={item.mainMedia[0].thumbnail.alt || 'News Thumbnail'}
                  className={styles.thumbnailImage}
                />
              )}
            </div>

            <div className={styles.newsInfo}>
              <h3 className={styles.newsTitle}>{item.title}</h3>
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
