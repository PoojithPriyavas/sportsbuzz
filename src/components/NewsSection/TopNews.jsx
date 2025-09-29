'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from './TopNews.module.css';
import { useGlobalData } from '../Context/ApiContext';
import { useMemo } from 'react';
import { useDynamicRouter } from '@/hooks/useDynamicRouter';

const NewsList = () => {
  const { news, fetchNewsDetails, language, translateText } = useGlobalData();
  const { pushDynamic, buildPath, pathPrefix } = useDynamicRouter();
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
    const translateAll = async () => {
      if (!stories.length) return;

      // Create a single array of all texts that need translation
      const textsToTranslate = [
        // Static header texts
        { text: 'Latest News', to: language },
        { text: 'Stay informed with the latest updates', to: language }
      ];
      
      // Add all story headlines, intros, and captions to the batch
      stories.forEach(item => {
        textsToTranslate.push({ text: item.hline, to: language });
        
        if (item.intro) {
          textsToTranslate.push({ text: item.intro, to: language });
        }
        
        if (item.coverImage?.caption) {
          textsToTranslate.push({ text: item.coverImage.caption, to: language });
        }
      });
      
      // Translate everything in one batch
      const allTranslations = await translateText(textsToTranslate, 'en', language);
      
      // Extract header translations
      setTranslatedHeader({
        title: allTranslations[0],
        subtitle: allTranslations[1]
      });
      
      // Process story translations
      const translatedStories = [];
      let translationIndex = 2; // Start after the header translations
      
      for (const item of stories) {
        const translatedItem = { ...item };
        
        // Add headline translation
        translatedItem.translatedTitle = allTranslations[translationIndex++];
        
        // Add intro translation if it exists
        if (item.intro) {
          translatedItem.translatedIntro = allTranslations[translationIndex++];
        } else {
          translatedItem.translatedIntro = '';
        }
        
        // Add caption translation if it exists
        if (item.coverImage?.caption) {
          translatedItem.translatedCaption = allTranslations[translationIndex++];
        } else {
          translatedItem.translatedCaption = '';
        }
        
        translatedStories.push(translatedItem);
      }
      
      setTranslatedNews(translatedStories);
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
    await fetchNewsDetails(item.id);
    const slug = item.hline.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await pushDynamic(`/news/${item.id}`);
  };

  return (
    <div className={styles.topnewsMain}>
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
    </div>
  );
};

export default NewsList;